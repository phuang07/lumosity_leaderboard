#!/usr/bin/env node
/**
 * Wait for the app to be ready by polling HTTP endpoint.
 * Used by Cypress container in Docker Compose CI.
 */
const http = require('http');

const url = process.env.APP_URL || 'http://app:3001';
const maxAttempts = parseInt(process.env.MAX_ATTEMPTS || '60', 10);
const intervalMs = 2000;

function check() {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      req.destroy();
      resolve();
    });
    req.on('error', reject);
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await check();
      console.log('App is ready.');
      process.exit(0);
    } catch (err) {
      console.log(`Waiting for app... attempt ${i}/${maxAttempts}`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  console.error('App did not become ready in time.');
  process.exit(1);
}

main();
