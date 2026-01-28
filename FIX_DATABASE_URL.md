# Fix: Database URL Not Updating

## Problem
Prisma client is using cached Supabase URL instead of local database from `.env.local`.

## Solution

**IMPORTANT: You must completely restart your dev server (not just hot reload)**

### Step 1: Stop the Dev Server
```bash
# Press Ctrl+C in the terminal running `npm run dev`
# Make sure it's completely stopped
```

### Step 2: Clear All Caches
```bash
npm run clean:prisma
npm run clean
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Verify
When the server starts, you should see:
```
[Config] DATABASE_URL from process.env: postgresql://postgres:****@localhost:5432/lumosity_leaderboard
[Prisma] Using database URL from config: postgresql://postgres:****@localhost:5432/lumosity_leaderboard
[Prisma] Is localhost? true
```

If you still see the Supabase URL, try the nuclear option below.

## Nuclear Option (Complete Reset)

If the above doesn't work:

```bash
# 1. Stop dev server completely
# 2. Clear everything
npm run clean:all

# 3. Restart
npm run dev
```

## Why This Happens

1. **Prisma Client Singleton**: Prisma uses a global singleton that persists across hot reloads
2. **Module Initialization**: The Prisma client is created when the module first loads
3. **Environment Variable Timing**: If env vars aren't loaded when the module imports, it uses the wrong URL
4. **Hot Reload Limitation**: Next.js hot reload doesn't restart the Prisma client singleton

## Prevention

- **Always restart dev server** after changing `DATABASE_URL` in `.env.local`
- **Don't rely on hot reload** for database connection changes
- **Use different databases** for dev/prod to avoid confusion

## Debugging

If you want to see what's happening, check the console output when starting the dev server. The new code logs:
- What DATABASE_URL is being read from `process.env`
- What connection string Prisma is using
- Whether it's detecting localhost correctly
