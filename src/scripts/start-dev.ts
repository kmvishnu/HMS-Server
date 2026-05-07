import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const port = process.env.PORT || 3000;

console.log(`🔍 Checking port ${port}...`);

try {
  // Dynamically kill the port before starting
  execSync(`npx kill-port ${port}`, { stdio: 'inherit' });
} catch (e) {
  // Ignore errors if port is already free
}

// Start the actual server
import('../server');
