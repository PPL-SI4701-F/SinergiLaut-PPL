const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.test.local using dotenv
const envPath = path.resolve(__dirname, '../.env.test.local');
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from:', envPath);
  require('dotenv').config({ path: envPath });
} else {
  console.warn('.env.test.local not found, using default env files.');
}

// Spawn next dev
const nextProcess = spawn('npx', ['next', 'dev', '--turbo'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

nextProcess.on('exit', (code) => {
  process.exit(code);
});
