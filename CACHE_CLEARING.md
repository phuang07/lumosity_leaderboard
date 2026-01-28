# Cache Clearing Guide

This guide covers how to clear various types of caches in your Next.js application, both locally and on Netlify.

## Quick Reference

### Local Development
```bash
# Clear all local caches
npm run clean

# Clear Next.js cache only
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json && npm install
```

### Netlify Deployment
- **UI**: Deploys → Trigger deploy → **"Clear cache and deploy site"**
- **CLI**: `netlify deploy --prod --clear-cache`

---

## Local Development Cache

### 1. Next.js Build Cache

Next.js caches build artifacts in the `.next` directory.

**Clear Next.js cache:**
```bash
rm -rf .next
```

**Or use the npm script:**
```bash
npm run clean:next
```

### 2. Node Modules Cache

If you're experiencing dependency issues:

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

**Or use the npm script:**
```bash
npm run clean:install
```

### 3. Prisma Cache

Prisma generates client code that can be cached:

```bash
# Clear Prisma generated files
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Regenerate Prisma client
npm run db:generate
```

### 4. TypeScript Cache

TypeScript caches compilation results:

```bash
# Remove TypeScript build info
rm -f *.tsbuildinfo
find . -name "*.tsbuildinfo" -delete
```

### 5. Complete Clean (All Caches)

Clear everything and start fresh:

```bash
# Remove all caches and build artifacts
rm -rf .next
rm -rf node_modules
rm -rf .turbo  # If using Turborepo
rm -f package-lock.json
rm -f *.tsbuildinfo

# Reinstall
npm install
```

**Or use the npm script:**
```bash
npm run clean:all
```

---

## Netlify Deployment Cache

### Method 1: Netlify UI (Recommended)

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **"Deploys"** tab
4. Click **"Trigger deploy"** dropdown
5. Select **"Clear cache and deploy site"**
6. Wait for deployment to complete

This clears:
- Build cache
- Dependencies cache
- Previous build artifacts

### Method 2: Netlify CLI

**Clear cache and deploy:**
```bash
netlify deploy --prod --clear-cache
```

**Or trigger a new deployment:**
```bash
netlify deploy --prod
```

**Clear cache without deploying:**
```bash
# Note: Netlify CLI doesn't have a direct cache clear command
# You need to trigger a new deployment with --clear-cache flag
netlify deploy --prod --clear-cache
```

### When to Clear Netlify Cache

Clear cache when:
- ✅ Environment variables aren't updating
- ✅ Dependencies aren't installing correctly
- ✅ Build is using stale code
- ✅ After updating `package.json` dependencies
- ✅ After changing build configuration
- ✅ After fixing environment variable issues

---

## Browser Cache

### Development

**Hard refresh:**
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- **Safari**: `Cmd+Option+R`

**Clear cache:**
- Open DevTools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

### Production

Users can clear their browser cache, but you can also:

1. **Add cache headers** in `next.config.js` (if needed)
2. **Use versioned assets** (Next.js does this automatically)
3. **Force reload** by updating your app version

---

## npm Cache

If you're having issues with npm itself:

```bash
# Clear npm cache
npm cache clean --force

# Verify cache location
npm config get cache

# Clear specific package cache
npm cache clean <package-name>
```

---

## Common Scenarios

### Scenario 1: Environment Variables Not Updating

**Local:**
```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Restart dev server
npm run dev
```

**Netlify:**
1. Verify variables in Netlify UI (Site Settings → Environment Variables)
2. Deploys → Trigger deploy → **"Clear cache and deploy site"**

### Scenario 2: Code Changes Not Reflecting

**Local:**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

**Netlify:**
- Trigger a new deployment with cache cleared

### Scenario 3: Dependency Issues

**Local:**
```bash
# Complete clean and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

**Netlify:**
- Clear cache and redeploy (Netlify will reinstall dependencies)

### Scenario 4: Prisma Schema Changes Not Applying

**Local:**
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma node_modules/@prisma/client

# Regenerate Prisma client
npm run db:generate

# Push schema changes
npm run db:push
```

**Netlify:**
- The `postinstall` script runs `prisma generate` automatically
- Clear cache and redeploy if issues persist

### Scenario 5: TypeScript Errors Persisting

```bash
# Clear TypeScript cache
rm -f *.tsbuildinfo
find . -name "*.tsbuildinfo" -delete

# Restart TypeScript server in your IDE
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## Automated Cache Clearing Scripts

Add these to your `package.json` scripts:

```json
{
  "scripts": {
    "clean": "rm -rf .next",
    "clean:next": "rm -rf .next",
    "clean:prisma": "rm -rf node_modules/.prisma node_modules/@prisma/client",
    "clean:ts": "find . -name '*.tsbuildinfo' -delete",
    "clean:all": "rm -rf .next node_modules package-lock.json *.tsbuildinfo && npm install",
    "clean:install": "rm -rf node_modules package-lock.json && npm install"
  }
}
```

Then use:
```bash
npm run clean          # Clear Next.js cache
npm run clean:all      # Clear everything and reinstall
npm run clean:install  # Clean reinstall dependencies
```

---

## Troubleshooting

### Cache Still Not Clearing?

1. **Check file permissions**: Make sure you have write access
2. **Close running processes**: Stop dev server, IDE, etc.
3. **Use sudo** (if needed): `sudo rm -rf .next` (be careful!)
4. **Check for locked files**: Some processes might be holding files open

### Netlify Cache Issues?

1. **Check build logs**: Look for cache-related messages
2. **Try multiple deploys**: Sometimes cache persists across one deploy
3. **Contact support**: If cache issues persist, Netlify support can help

### Still Having Issues?

1. **Verify .gitignore**: Make sure cache directories are ignored
2. **Check disk space**: Low disk space can cause cache issues
3. **Restart your machine**: Sometimes OS-level caches need clearing

---

## Best Practices

### ✅ DO:
- Clear cache when environment variables change
- Clear cache after major dependency updates
- Clear cache if builds are failing unexpectedly
- Use `--clear-cache` flag for Netlify deployments when troubleshooting

### ❌ DON'T:
- Clear cache unnecessarily (slows down builds)
- Commit cache directories to git (they're in `.gitignore`)
- Manually edit files in `.next` directory
- Clear npm cache unless you have dependency issues

---

## Quick Commands Cheat Sheet

```bash
# Local Development
npm run clean              # Clear Next.js cache
npm run clean:all          # Nuclear option - clear everything
rm -rf .next               # Manual Next.js cache clear

# Netlify
netlify deploy --prod --clear-cache  # Deploy with cache cleared

# Prisma
npm run clean:prisma && npm run db:generate  # Clear and regenerate

# Complete Reset (use with caution!)
rm -rf .next node_modules package-lock.json && npm install
```

---

## Additional Resources

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Netlify Build Cache](https://docs.netlify.com/configure-builds/caching/)
- [npm Cache Documentation](https://docs.npmjs.com/cli/v8/commands/npm-cache)
