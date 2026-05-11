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
    console.log('Starting Admin Module DB Prep...');
    await client.query('BEGIN');

    // 1. Soft Delete Support
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`);
    await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`);

    // 2. Production-Grade Indices
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE deleted_at IS NULL;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hotels_owner ON hotels(owner_id) WHERE deleted_at IS NULL;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_hotel_dates ON bookings(room_type_id, check_in, check_out) WHERE deleted_at IS NULL;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`);

    await client.query('COMMIT');
    console.log('Admin Module DB Prep completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Admin Module DB Prep failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
