import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting Migration V3...');
    await client.query('BEGIN');

    // 1. Add owner_id column if it doesn't exist
    await client.query(`
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 2. Check if there are any hotels without an owner
    const hotelsWithoutOwner = await client.query('SELECT COUNT(*) FROM hotels WHERE owner_id IS NULL');
    
    if (parseInt(hotelsWithoutOwner.rows[0].count, 10) > 0) {
      console.log(`Found ${hotelsWithoutOwner.rows[0].count} hotels without an owner. Assigning fallback owner...`);
      
      // Try to find an existing owner first
      let ownerResult = await client.query("SELECT id FROM users WHERE role = 'HOTEL_OWNER' LIMIT 1");
      
      let fallbackOwnerId;

      if (ownerResult.rows.length > 0) {
        fallbackOwnerId = ownerResult.rows[0].id;
        console.log(`Using existing owner ID: ${fallbackOwnerId}`);
      } else {
        // Create a fallback owner
        console.log('No existing owner found. Creating fallback owner...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);
        
        ownerResult = await client.query(`
          INSERT INTO users (name, email, password_hash, role)
          VALUES ('Fallback Owner', 'fallback_owner@example.com', $1, 'HOTEL_OWNER')
          RETURNING id
        `, [hash]);
        fallbackOwnerId = ownerResult.rows[0].id;
        console.log(`Created fallback owner ID: ${fallbackOwnerId} (email: fallback_owner@example.com, password: password123)`);
      }

      // Assign fallback owner to orphaned hotels
      await client.query('UPDATE hotels SET owner_id = $1 WHERE owner_id IS NULL', [fallbackOwnerId]);
    }

    // 3. Enforce NOT NULL constraint
    await client.query(`
      ALTER TABLE hotels ALTER COLUMN owner_id SET NOT NULL;
    `);

    await client.query('COMMIT');
    console.log('Migration V3 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Migration V3 failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
