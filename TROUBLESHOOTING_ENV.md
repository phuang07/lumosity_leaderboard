# Troubleshooting Environment Variables

## Issue: Wrong Database URL Being Used Locally

### Symptoms
- App connects to production/Supabase database instead of local database
- Error: `Can't reach database server at db.ryzdpyeicdzjvmwmvnhw.supabase.co`
- `.env.local` has correct local database URL, but app uses different URL

### Root Cause
The Prisma client was generated/cached with an old database connection string. Prisma caches the client instance globally, and if it was initialized with a different `DATABASE_URL`, it will continue using that connection even after updating `.env.local`.

### Solution

**Step 1: Stop your dev server** (if running)
```bash
# Press Ctrl+C in the terminal running `npm run dev`
```

**Step 2: Clear Prisma cache**
```bash
npm run clean:prisma
```

**Step 3: Clear Next.js cache**
```bash
npm run clean
```

**Step 4: Reinstall dependencies (regenerates Prisma client)**
```bash
npm install
```

**Step 5: Restart dev server**
```bash
npm run dev
```

### Quick Fix (All-in-One)
```bash
# Stop dev server first, then:
npm run clean:prisma && npm run clean && npm install && npm run dev
```

### Verification

When you start the dev server, you should see:
```
[Prisma] Using database URL: postgresql://postgres:****@localhost:5432/lumosity_leaderboard
```

This confirms it's using your local database from `.env.local`.

### Why This Happens

1. **Prisma Client Caching**: Prisma generates a client based on the `DATABASE_URL` at generation time
2. **Global Instance**: In development, Prisma uses a global singleton that persists across hot reloads
3. **Environment Variable Loading**: Next.js loads env vars at startup, but Prisma client was already initialized

### Prevention

1. **Always restart dev server** after changing `DATABASE_URL` in `.env.local`
2. **Clear Prisma cache** when switching between databases
3. **Use different databases** for dev/prod (never use production DB locally)

### Debugging

To see what database URL is actually being used:

1. Check the console output when starting the dev server
2. Look for `[Prisma] Using database URL:` log message
3. The URL will be masked (password hidden) for security

### Common Scenarios

#### Scenario 1: Changed .env.local but still using old URL
**Fix**: Restart dev server + clear Prisma cache
```bash
npm run clean:prisma && npm install && npm run dev
```

#### Scenario 2: Multiple .env files conflicting
**Check**: Next.js loads env files in this order (later overrides earlier):
1. `.env`
2. `.env.local`
3. `.env.development`
4. `.env.development.local`

**Fix**: Make sure `.env.local` has the correct `DATABASE_URL` and restart server

#### Scenario 3: System environment variables overriding
**Check**: 
```bash
printenv | grep DATABASE_URL
```

**Fix**: Unset system variable or ensure `.env.local` takes precedence

### Environment File Priority

Next.js loads environment variables in this order (later files override earlier):

1. `.env` - Default values
2. `.env.local` - **Local overrides (use this for local dev)** ✅
3. `.env.development` - Development-specific
4. `.env.development.local` - Local development overrides

**Best Practice**: Use `.env.local` for local development and keep it gitignored.

### Still Not Working?

1. **Verify .env.local exists and has correct format**:
   ```bash
   cat .env.local
   ```
   Should show:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"
   ```

2. **Check for syntax errors**:
   - No spaces around `=` sign
   - Quotes are optional but recommended
   - No trailing spaces

3. **Verify database is running**:
   ```bash
   # For Docker
   docker-compose ps
   
   # For local PostgreSQL
   psql -U postgres -h localhost -d lumosity_leaderboard
   ```

4. **Check Prisma can connect**:
   ```bash
   npx prisma db push
   ```

5. **Nuclear option** (complete reset):
   ```bash
   npm run clean:all
   npm run dev
   ```
