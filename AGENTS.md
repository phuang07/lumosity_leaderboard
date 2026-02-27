# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Lumosity Leaderboard is a single Next.js 15 (App Router) application with PostgreSQL (Prisma ORM). See `README.md` and `docs/WIKI.md` for full documentation.

### Services

| Service | How to start | Port |
|---------|-------------|------|
| PostgreSQL | `docker compose up -d` | 5432 |
| Next.js dev server | `npm run dev` | 3000 |

### Key caveats

- **Docker required**: PostgreSQL runs via Docker. Docker must be started first (`sudo dockerd` if the daemon isn't running, then `docker compose up -d`). In cloud agent VMs, Docker requires `fuse-overlayfs` storage driver and `iptables-legacy` — see the Docker-in-Docker setup in the environment snapshot.
- **Node.js 20**: The project targets Node 20 (matching Netlify deployment). Use `nvm use 20` if multiple versions are installed.
- **Database init (one-time)**: After starting PostgreSQL, create `.env.local` with `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"`, then run `npx prisma db push && npm run db:seed` to create tables and seed 50 games.
- **ESLint**: The repo uses ESLint 8 + `eslint-config-next@15` with `.eslintrc.json`. Run `npm run lint`. There are pre-existing warnings (`react/no-unescaped-entities` and a missing hook dependency) that do not block the build.
- **Cypress tests**: Configured to run against port 3001. Start the app on that port with `npm run dev -- -p 3001`, then in another terminal run `npm run test:e2e` (headless).
- **Available scripts**: See `README.md > Available Scripts` or `package.json` for the full list (`npm run dev`, `npm run build`, `npm run lint`, `npm run test:e2e`, `npm run db:seed`, etc.).
