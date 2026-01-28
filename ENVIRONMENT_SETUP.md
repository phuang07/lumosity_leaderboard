# Environment Configuration Guide

This guide explains how to separate development and production environment configurations in this Next.js application.

## Overview

The application uses a centralized configuration system located in `lib/config.ts` that manages all environment variables and provides type-safe access to configuration values.

## Quick Start

### 1. Create Local Environment File

Create a `.env.local` file in the project root (this file is already gitignored):

```bash
# Copy the template below and fill in your values
cp .env.example .env.local  # If .env.example exists
# Or create .env.local manually
```

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Node Environment
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard

# Application URL (optional for local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Application Name (optional)
NEXT_PUBLIC_APP_NAME=Lumosity Leaderboard

# API Configuration (optional)
API_TIMEOUT=30000

# Logging (optional)
LOG_LEVEL=debug
```

## Environment Files Priority

Next.js loads environment variables in the following order (later files override earlier ones):

1. `.env` - Default values (committed to git)
2. `.env.local` - Local overrides (gitignored, for all environments)
3. `.env.development` - Development-specific (gitignored)
4. `.env.development.local` - Local development overrides (gitignored)
5. `.env.production` - Production-specific (gitignored)
6. `.env.production.local` - Local production overrides (gitignored)

**Recommended approach:**
- Use `.env.local` for local development
- Use Netlify UI/CLI for production environment variables

## Configuration Structure

All configuration is accessed through the `config` object from `lib/config.ts`:

```typescript
import { config } from '@/lib/config'

// Environment detection
config.env.isDevelopment  // true in development
config.env.isProduction   // true in production
config.env.nodeEnv        // 'development' | 'production' | 'test'

// Database
config.database.url       // Database connection string

// Application
config.app.url            // Application URL
config.app.name           // Application name

// Security
config.security.cookieSecure    // true in production, false in dev
config.security.cookieSameSite  // 'lax'
config.security.cookieMaxAge    // Cookie expiration time

// API
config.api.timeout        // API timeout in milliseconds

// Logging
config.logging.level      // 'debug' | 'info' | 'warn' | 'error'
config.logging.enableConsole  // true in development
```

## Development Environment

### Local Development Setup

1. **Create `.env.local`** with your local database URL:
   ```env
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Features in development:**
   - Cookies are NOT secure (can be sent over HTTP)
   - Console logging is enabled
   - Debug-level logging by default
   - Hot reloading enabled

## Production Environment

### Netlify Deployment

1. **Set environment variables in Netlify UI:**
   - Go to: Site Settings → Environment Variables
   - Add the following variables:
     - `NODE_ENV=production`
     - `DATABASE_URL=<your-production-database-url>`
     - `NEXT_PUBLIC_APP_URL=<your-production-url>`
     - (Optional) `LOG_LEVEL=info`

2. **Or use Netlify CLI:**
   ```bash
   netlify env:set NODE_ENV production
   netlify env:set DATABASE_URL "your-production-database-url"
   netlify env:set NEXT_PUBLIC_APP_URL "https://your-site.netlify.app"
   ```

3. **Features in production:**
   - Cookies are secure (HTTPS only)
   - Console logging disabled
   - Info-level logging by default
   - Configuration validation runs on startup

## Environment Variables Reference

### Required Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Required | ✅ Required |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Optional Variables

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` (dev) | Used for absolute URLs |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Lumosity Leaderboard` | Display name |
| `API_TIMEOUT` | API request timeout (ms) | `30000` | 30 seconds |
| `LOG_LEVEL` | Logging level | `debug` (dev), `info` (prod) | `debug`, `info`, `warn`, `error` |

### Variable Naming Convention

- **Public variables** (accessible in browser): Must be prefixed with `NEXT_PUBLIC_`
- **Server-only variables**: No prefix (e.g., `DATABASE_URL`, `API_TIMEOUT`)

## Using Configuration in Code

### ✅ Recommended: Use the config object

```typescript
import { config } from '@/lib/config'

// Check environment
if (config.env.isDevelopment) {
  console.log('Development mode')
}

// Use database URL
const dbUrl = config.database.url

// Use security settings
cookieStore.set('userId', userId, {
  secure: config.security.cookieSecure,
  sameSite: config.security.cookieSameSite,
  maxAge: config.security.cookieMaxAge,
})
```

### ❌ Avoid: Direct process.env access

```typescript
// Don't do this
const dbUrl = process.env.DATABASE_URL || 'fallback'
const isProd = process.env.NODE_ENV === 'production'
```

**Why?** The config object provides:
- Type safety
- Centralized defaults
- Consistent environment detection
- Validation
- Better maintainability

## Configuration Validation

The config system validates required variables in production:

```typescript
import { validateConfig } from '@/lib/config'

// This is called automatically in production
// You can also call it manually if needed
validateConfig()
```

If required variables are missing, the application will throw an error on startup.

## Testing Environment

For testing (e.g., Cypress), you can set:

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard_test
```

The config will automatically detect test mode and adjust settings accordingly.

## Troubleshooting

### Environment variables not loading?

1. **Check file name**: Make sure it's `.env.local` (not `.env.local.txt`)
2. **Restart dev server**: Environment variables are loaded at startup
3. **Check priority**: Later files override earlier ones
4. **Verify syntax**: No spaces around `=` sign: `KEY=value` not `KEY = value`

### Production variables not working?

1. **Check Netlify UI**: Verify variables are set correctly
2. **Clear cache**: Trigger a new deployment with cache cleared
3. **Check build logs**: Look for environment variable errors
4. **Verify variable names**: Case-sensitive, must match exactly

### Database connection issues?

1. **Check DATABASE_URL format**: Must be valid PostgreSQL connection string
2. **Verify SSL mode**: Production databases may require `?sslmode=require`
3. **Test locally first**: Ensure connection string works with `npx prisma db push`

## Best Practices

1. ✅ **Never commit `.env.local`** - It's already in `.gitignore`
2. ✅ **Use `.env.example`** - Document required variables (without values)
3. ✅ **Use config object** - Don't access `process.env` directly
4. ✅ **Set production vars in Netlify UI** - Not in code or `netlify.toml`
5. ✅ **Use different databases** - Separate dev and prod databases
6. ✅ **Validate on startup** - Catch missing variables early

## Migration from Old Code

If you have existing code using `process.env` directly:

**Before:**
```typescript
const dbUrl = process.env.DATABASE_URL || 'fallback'
const isProd = process.env.NODE_ENV === 'production'
```

**After:**
```typescript
import { config } from '@/lib/config'
const dbUrl = config.database.url
const isProd = config.env.isProduction
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)
