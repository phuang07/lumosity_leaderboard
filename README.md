# Lumosity Leaderboard

[![CI - Cypress Tests](https://github.com/YOUR_USERNAME/lumosity_leaderboard/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/lumosity_leaderboard/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/96e0e14e-a42c-40c8-9f9d-40379a26680e/deploy-status)](https://app.netlify.com/projects/lumosity/deploys)

A web application for comparing Lumosity game scores with friends, featuring rankings, friend comparisons, and gamification elements.

## Features

- 🎮 Score submission for 50+ Lumosity games across 5 categories
- 👥 Friend system with requests and comparisons
- 📊 Global and friend leaderboards
- 🏆 Achievement system
- 📈 Progress tracking and streaks
- 🔐 User authentication (register, login, logout)
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Authentication**: Cookie-based session authentication
- **Testing**: Cypress for end-to-end testing
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (using Docker)
docker-compose up -d

# 3. Create .env.local
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"' > .env.local

# 4. Initialize database
npm run db:generate
npx prisma db push
npm run db:seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

📖 **See [docs/WIKI.md](./docs/WIKI.md) for complete documentation including:**

- Database setup options (Docker, Local, Supabase, Neon)
- Environment configuration
- Netlify deployment guide
- Testing guide
- Troubleshooting

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test:e2e` | Run Cypress tests |
| `npm run cypress` | Open Cypress Test Runner |
| `npm run db:seed` | Seed database with games |
| `npm run clean:all` | Clear all caches |

## Project Structure

```
lumosity_leaderboard/
├── app/              # Next.js app directory
├── components/       # React components
├── cypress/          # E2E tests
├── data/             # Game data (games.json)
├── docs/             # Documentation
├── lib/              # Utilities
├── prisma/           # Database schema
└── public/           # Static assets
```

## License

MIT
