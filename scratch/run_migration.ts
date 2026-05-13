import pool from '../src/config/db';
import fs from 'fs';
import path from 'path';

async function migrate() {
  try {
    const sqlPath = path.join(__dirname, '../database/migrations/update_hotel_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running migration...');
    await pool.query(sql);
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
