import { Pool } from 'pg';
import dotenv from 'dotenv';

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
    console.log('Starting Migration V5...');
    await client.query('BEGIN');

    // 1. Add index on hotels(location) for optimized search
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels(location);
    `);

    // 2. Add composite index on room_inventory(room_type_id, date) for availability checks
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_room_date ON room_inventory(room_type_id, date);
    `);

    await client.query('COMMIT');
    console.log('Migration V5 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Migration V5 failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
