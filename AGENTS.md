# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Lumosity Leaderboard is a Next.js 15 + TypeScript web app with PostgreSQL (Prisma 7 ORM), Tailwind CSS, and Cypress E2E tests. See `README.md` and `docs/WIKI.md` for full documentation.

### Running services

1. **PostgreSQL**: `sudo docker compose up -d` (requires Docker; uses `docker-compose.yml` to run postgres:15-alpine on port 5432)
2. **Create `.env.local`** if missing: `echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"' > .env.local`
3. **Initialize DB** (first time only): `npx prisma db push && npm run db:seed`
4. **Dev server**: `npm run dev` (port 3000)

### Non-obvious caveats

- **Node 20 required**: The project targets Node 20 (see `netlify.toml`). Use `nvm use 20` before running commands.
- **Prisma 7 adapter pattern**: The project uses `@prisma/adapter-pg` with a `Pool` connection instead of the standard Prisma URL-in-schema approach. The `datasource` block in `prisma/schema.prisma` has no `url` field; `DATABASE_URL` is read at runtime via `lib/config.ts`.
- **ESLint setup**: The repo needs `.eslintrc.json` with `eslint@8` and `eslint-config-next@15` for `npm run lint` to work. ESLint 9 / flat config is incompatible with this Next.js 15 setup.
- **`postinstall` runs `prisma generate`**: No need to run `npm run db:generate` separately after `npm install`.
- **Cypress expects port 3001**: E2E tests (`npm run test:e2e`) connect to `http://localhost:3001`, not 3000. Start the app on port 3001 for testing: `npm run dev -- -p 3001` or `npm start -- -p 3001`.
- **Docker in Cloud VM**: Docker needs `fuse-overlayfs` storage driver and `iptables-legacy` for the nested container environment. The Docker daemon must be started manually: `sudo dockerd &>/tmp/dockerd.log &`.
- **Pre-existing lint warnings**: The codebase has `react/no-unescaped-entities` and `react-hooks/exhaustive-deps` warnings; these are set to warn level in `.eslintrc.json` so builds succeed.

### Standard commands reference

See `package.json` scripts and `README.md` for the full list. Key commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run test:e2e`, `npm run db:seed`.
