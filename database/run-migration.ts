import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    const schemaPath = path.join(__dirname, 'migration-add-hotel-owner-images.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing migration...');
    await pool.query(schema);
    console.log('Migration executed successfully.');
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
