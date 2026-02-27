# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Lumosity Leaderboard is a Next.js 15 web app for comparing Lumosity brain-training game scores. It uses PostgreSQL (via Docker), Prisma ORM v7, and Tailwind CSS. See `README.md` and `docs/WIKI.md` for full documentation.

### Prerequisites

- **Node.js 20** (matches CI; use `nvm use 20`)
- **Docker** for PostgreSQL (`docker compose up -d` using `docker-compose.yml`)
- `.env.local` must exist with at minimum:
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"
  AUTH_SECRET="dev-auth-secret-for-local-development-only"
  ```

### Starting services

1. Start Docker daemon if not running: `sudo dockerd &>/tmp/dockerd.log &`
2. Start PostgreSQL: `sudo docker compose up -d`
3. Initialize DB (first time or after schema changes): `npx prisma db push && npm run db:seed`
4. Dev server: `npm run dev` (port 3000)

### Key commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| E2E tests (Cypress) | `npm run test:e2e` (requires build + `npm start -- -p 3001`) |
| Seed database | `npm run db:seed` |
| Push schema | `npx prisma db push` |

### Gotchas

- The project had no ESLint config originally. `.eslintrc.json` was added with `next/core-web-vitals` and `react/no-unescaped-entities` downgraded to a warning due to pre-existing issues in `app/dashboard/page.tsx` and `app/login/page.tsx`.
- `eslint` and `eslint-config-next@15` are devDependencies added for `npm run lint` to work. Without them, `next lint` prompts interactively.
- `AUTH_SECRET` env var is required for `npm run build` to succeed (used by next-auth).
- Cypress E2E tests run against port 3001 (production build): `npm run build && npm start -- -p 3001`, then `npm run test:e2e` in another terminal.
- The `postinstall` script in `package.json` runs `prisma generate` automatically on `npm install`.
- Docker in this Cloud VM requires `fuse-overlayfs` storage driver and `iptables-legacy` (already configured in snapshot).
