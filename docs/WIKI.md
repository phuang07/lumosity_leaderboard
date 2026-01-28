# Lumosity Leaderboard - Documentation Wiki

A comprehensive guide for the Lumosity Leaderboard application.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Database Setup](#database-setup)
   - [Docker (Local)](#option-a-docker-postgresql-recommended-for-local)
   - [Local PostgreSQL](#option-b-local-postgresql)
   - [Supabase (Cloud)](#option-c-supabase-cloud)
   - [Neon (Cloud)](#option-d-neon-cloud)
4. [Environment Configuration](#environment-configuration)
5. [Deployment](#deployment)
   - [Netlify Setup](#netlify-deployment)
   - [Environment Variables on Netlify](#setting-environment-variables-on-netlify)
6. [Testing](#testing)
   - [Running Cypress Tests](#running-cypress-tests)
   - [CI/CD Pipeline](#cicd-pipeline)
7. [Troubleshooting](#troubleshooting)
   - [Database Connection Issues](#database-connection-issues)
   - [Environment Variable Issues](#environment-variable-issues)
   - [Netlify Build Issues](#netlify-build-issues)
   - [Cache Clearing](#cache-clearing)
8. [Project Structure](#project-structure)
9. [Available Scripts](#available-scripts)

---

## Overview

Lumosity Leaderboard is a web application for comparing Lumosity game scores with friends, featuring rankings, friend comparisons, and gamification elements.

### Features

- 🎮 Score submission for 50+ Lumosity games across 5 categories
- 👥 Friend system with requests and comparisons
- 📊 Global and friend leaderboards
- 🏆 Achievement system
- 📈 Progress tracking and streaks
- 🔐 User authentication (register, login, logout)
- 📱 Responsive design for mobile and desktop

### Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with TypeScript |
| PostgreSQL | Database |
| Prisma | ORM |
| Tailwind CSS | Styling |
| Zod | Validation |
| Cypress | E2E Testing |
| GitHub Actions | CI/CD |

---

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- PostgreSQL database (see [Database Setup](#database-setup))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lumosity_leaderboard

# Install dependencies
npm install
```

### Quick Start

```bash
# 1. Start PostgreSQL (Docker method)
docker-compose up -d

# 2. Create .env.local file
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"' > .env.local

# 3. Initialize database
npm run db:generate
npx prisma db push
npm run db:seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Setup

### Option A: Docker PostgreSQL (Recommended for Local)

The easiest way to run PostgreSQL locally.

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps | grep lumosity_postgres
```

**Connection Details:**
| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `lumosity_leaderboard` |
| Username | `postgres` |
| Password | `postgres` |

**Connection String:**
```
postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard
```

**Docker Commands:**
```bash
docker-compose up -d       # Start container
docker-compose down        # Stop container
docker-compose logs postgres # View logs
docker-compose down -v     # Remove everything (⚠️ deletes data)
```

---

### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Connection string format
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/lumosity_leaderboard"
```

Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

---

### Option C: Supabase (Cloud)

Free cloud PostgreSQL database.

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)

**Connection String Format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

> ⚠️ **Important:** Free tier projects pause after 7 days of inactivity. See [Supabase Paused Fix](#supabase-project-paused) if you can't connect.

---

### Option D: Neon (Cloud)

Another free cloud PostgreSQL option.

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard

**Connection String Format:**
```
postgresql://USER:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require
```

---

### Initialize Database

After setting up your database connection:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npx prisma db push

# Seed database with games
npm run db:seed
```

---

## Environment Configuration

### Environment Files

Create `.env.local` in the project root (this file is gitignored):

```env
# Required
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"

# Optional
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your-secret-key
```

### Environment File Priority

Next.js loads files in this order (later overrides earlier):

1. `.env` - Default values
2. `.env.local` - **Local overrides (use this)** ✅
3. `.env.development` - Development-specific
4. `.env.development.local` - Local development overrides

### Using the Config Object

Access configuration through the centralized config:

```typescript
import { config } from '@/lib/config'

// Environment detection
config.env.isDevelopment  // true in development
config.env.isProduction   // true in production

// Database
config.database.url       // Database connection string

// Security settings
config.security.cookieSecure    // true in production
```

---

## Deployment

### Netlify Deployment

#### Quick Start (5 minutes)

1. **Push code to GitHub**

2. **Go to Netlify**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Select your GitHub repository

3. **Build settings** (auto-detected):
   - Build command: `npm run build`
   - Node version: `20`

4. **Add environment variables** (see next section)

5. **Deploy**

#### Setting Environment Variables on Netlify

**Method 1: Netlify UI (Recommended)**

1. Go to your site dashboard
2. Click **"Site settings"** → **"Environment variables"**
3. Click **"Add a variable"**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Your cloud database connection string
5. Click **"Save"**
6. Go to **Deploys** → **"Trigger deploy"** → **"Clear cache and deploy site"**

**Method 2: Netlify CLI**

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Link site
netlify link

# Set environment variable
netlify env:set DATABASE_URL "your-database-url"

# Deploy
netlify deploy --prod
```

---

## Testing

### Running Cypress Tests

**Prerequisites:** Start the development server first.

```bash
# Start dev server on port 3001
npm run dev -- -p 3001
```

Then in another terminal:

```bash
# Interactive mode (opens Cypress UI)
npm run cypress

# Headless mode
npm run test:e2e

# Headed mode (see the browser)
npm run test:e2e:headed

# Run specific test file
npx cypress run --spec "cypress/e2e/scores/delete-score.cy.ts"
```

### CI/CD Pipeline

The project uses GitHub Actions to run tests automatically on push to `master`/`main`.

**What happens on each push:**
1. Sets up PostgreSQL database
2. Installs dependencies
3. Builds the Next.js app
4. Runs all Cypress tests
5. Generates HTML test reports
6. Uploads artifacts (videos, screenshots, reports)

**Accessing Test Reports:**
1. Go to repository → **Actions** tab
2. Click on the workflow run
3. Scroll to **Artifacts** section
4. Download:
   - `cypress-html-report` - Interactive HTML report
   - `cypress-videos` - Test execution recordings
   - `cypress-screenshots` - Failed test screenshots

---

## Troubleshooting

### Database Connection Issues

#### Error: Can't reach database server

**Check 1: Is database running?**
```bash
# For Docker
docker ps | grep lumosity_postgres

# Start if not running
docker-compose up -d
```

**Check 2: Connection string format**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Check 3: SSL required (cloud databases)**

Add `?sslmode=require` to your connection string:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

#### Supabase Project Paused

Free tier Supabase projects pause after 7 days of inactivity.

**Fix:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on your paused project
3. Click **"Restore"**
4. Wait 1-2 minutes for it to start

---

### Environment Variable Issues

#### Wrong database URL being used

**Symptoms:** App connects to wrong database despite correct `.env.local`

**Fix:**
```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear all caches
npm run clean:prisma
npm run clean

# 3. Reinstall
npm install

# 4. Restart
npm run dev
```

#### Environment variables not updating on Netlify

1. Verify variables in **Site Settings** → **Environment Variables**
2. Go to **Deploys** → **Trigger deploy** → **"Clear cache and deploy site"**

---

### Netlify Build Issues

#### Error: Publish directory same as base directory

**Fix:**
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Find **"Publish directory"** field
3. **Delete the value** (leave it empty)
4. Click **Save**
5. Redeploy with cache cleared

The Next.js plugin handles the publish directory automatically.

#### Build fails with Prisma errors

1. Ensure `DATABASE_URL` is set in Netlify environment variables
2. Clear cache and redeploy
3. Check build logs for specific errors

---

### Cache Clearing

#### Local Development

```bash
# Clear Next.js cache
npm run clean

# Clear Prisma cache
npm run clean:prisma

# Nuclear option - clear everything
npm run clean:all
```

#### Netlify

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

Or via CLI:
```bash
netlify deploy --prod --clear-cache
```

#### When to Clear Cache

- ✅ After changing `DATABASE_URL`
- ✅ After updating dependencies
- ✅ When builds fail unexpectedly
- ✅ When environment variables aren't updating

---

## Project Structure

```
lumosity_leaderboard/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions (auth, scores, friends)
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── leaderboard/      # Leaderboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── score-entry/      # Score entry page
├── components/           # React components
├── cypress/              # Cypress e2e tests
│   ├── e2e/             # Test spec files
│   ├── fixtures/        # Test data
│   └── support/         # Custom commands
├── data/                 # Game data
│   └── games.json       # Lumosity games catalog
├── docs/                 # Documentation
├── lib/                  # Utility functions
├── prisma/               # Prisma schema
└── public/              # Static assets
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with games |
| `npm run cypress` | Open Cypress Test Runner |
| `npm run test:e2e` | Run tests headlessly |
| `npm run test:e2e:headed` | Run tests with browser visible |
| `npm run clean` | Clear Next.js cache |
| `npm run clean:prisma` | Clear Prisma cache |
| `npm run clean:all` | Clear everything and reinstall |

---

## Database Schema

| Table | Description |
|-------|-------------|
| **Users** | User accounts with authentication |
| **Games** | 50+ Lumosity games catalog |
| **Scores** | User scores (highest per game) |
| **Friendships** | Friend relationships and requests |
| **Achievements** | User achievement progress |
| **UserStats** | Cached statistics for performance |

---

## Usage

1. **Register** - Create a new account at `/register`
2. **Login** - Sign in at `/login`
3. **Dashboard** - View your stats, progress, and achievements
4. **Submit Scores** - Add your Lumosity scores at `/score-entry`
5. **Leaderboard** - Compare with others at `/leaderboard`
6. **Compare Friends** - Head-to-head comparison at `/friends/compare`

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Cypress Documentation](https://docs.cypress.io)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Neon Documentation](https://neon.tech/docs)

---

## License

MIT
