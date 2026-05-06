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
    console.log('Starting Migration V4...');
    await client.query('BEGIN');

    // 1. Add visibility and features to hotels
    await client.query(`
      ALTER TABLE hotels 
      ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
    `);

    // 2. Create room_type_images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS room_type_images (
        id SERIAL PRIMARY KEY,
        room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Migration V4 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Migration V4 failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
