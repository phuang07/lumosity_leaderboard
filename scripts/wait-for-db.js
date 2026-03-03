#!/usr/bin/env node
/**
 * Wait for PostgreSQL to be ready by attempting connection.
 * Parses DATABASE_URL for host and port.
 */
const net = require('net');

const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/lumosity_test';
const match = url.match(/@([^:]+):(\d+)\//);
const host = match ? match[1] : 'postgres';
const port = parseInt(match ? match[2] : '5432', 10);

function tryConnect() {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => {
      socket.destroy();
      resolve();
    });
    socket.on('error', reject);
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    socket.connect(port, host);
  });
}

async function main() {
  for (let i = 1; i <= 30; i++) {
    try {
      await tryConnect();
      console.log('Database is ready.');
      process.exit(0);
    } catch (err) {
      console.log(`Waiting for database... attempt ${i}/30`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error('Database did not become ready in time.');
  process.exit(1);
}

main();
