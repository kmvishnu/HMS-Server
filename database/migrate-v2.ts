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
    console.log('Starting Migration V2...');
    await client.query('BEGIN');

    // Update Hotels
    await client.query(`
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT FALSE;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
    `);

    // Create Room Type Images
    await client.query(`
      CREATE TABLE IF NOT EXISTS room_type_images (
        id SERIAL PRIMARY KEY,
        room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Update Bookings
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';
    `);

    // Create Booking Guests
    await client.query(`
      CREATE TABLE IF NOT EXISTS booking_guests (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL
      );
    `);

    await client.query('COMMIT');
    console.log('Migration V2 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Migration V2 failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
