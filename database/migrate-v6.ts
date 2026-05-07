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
    console.log('Starting Migration V6...');
    await client.query('BEGIN');

    // 1. Add total_amount to bookings
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2) DEFAULT 0.00;
    `);

    await client.query('COMMIT');
    console.log('Migration V6 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Migration V6 failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
