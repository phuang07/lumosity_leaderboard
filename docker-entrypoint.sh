#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
node scripts/wait-for-db.js

# Run database migrations and seed
echo "Pushing database schema..."
npx prisma db push

echo "Seeding database..."
npm run db:seed

echo "Starting application..."
exec "$@"
