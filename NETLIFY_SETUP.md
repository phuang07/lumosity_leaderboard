# Netlify Deployment Guide

This guide will help you deploy your Lumosity Leaderboard Next.js app to Netlify.

## Prerequisites

1. **GitHub account** with your code pushed to a repository
2. **Netlify account** (free at [netlify.com](https://netlify.com))
3. **PostgreSQL database** (cloud-hosted - see options below)

## Step 1: Set Up Cloud Database

Netlify doesn't provide databases, so you'll need a cloud PostgreSQL database. Here are free options:

### Option A: Supabase (Recommended - Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`)
5. Save this for Step 3

### Option B: Neon (Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string from the dashboard
4. Save this for Step 3

### Option C: Railway (Free Tier with Credit Card)
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Save this for Step 3

## Step 2: Initialize Your Database

Once you have your cloud database connection string, initialize it locally:

```bash
# Set your DATABASE_URL temporarily
export DATABASE_URL="your-cloud-database-url-here"

# Or add it to .env file
echo 'DATABASE_URL="your-cloud-database-url-here"' >> .env

# Generate Prisma Client
npm run db:generate

# Push schema to database
npx prisma db push

# Seed the database with games
npm run db:seed
```

## Step 3: Deploy to Netlify

### Method 1: Netlify UI (Easiest)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Go to Netlify**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign in with GitHub

3. **Import your site**
   - Click **"Add new site"** → **"Import an existing project"**
   - Select **"Deploy with GitHub"**
   - Authorize Netlify to access your GitHub
   - Select your repository

4. **Configure build settings**
   Netlify should auto-detect Next.js, but verify:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (Netlify handles this automatically for Next.js)
   - **Node version**: `18` or `20` (set in Netlify UI or `netlify.toml`)

5. **Set environment variables**
   - Click **"Site settings"** → **"Environment variables"**
   - Click **"Add variable"**
   - Add:
     - **Key**: `DATABASE_URL`
     - **Value**: Your cloud database connection string
   - Click **"Save"**

6. **Deploy**
   - Click **"Deploy site"**
   - Netlify will build and deploy your app
   - Wait for the build to complete (usually 2-5 minutes)

7. **Run database migrations after first deploy**
   - After the first deployment, you may need to run migrations
   - Go to **"Deploys"** tab → Click on the latest deploy → **"Trigger deploy"** → **"Clear cache and deploy site"**
   - Or use Netlify Functions to run migrations (see Advanced section)

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize your site**
   ```bash
   netlify init
   ```
   - Follow the prompts to link your site
   - Choose "Create & configure a new site"

4. **Set environment variables**
   ```bash
   netlify env:set DATABASE_URL "your-database-url-here"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Step 4: Configure Custom Domain (Optional)

1. Go to **"Site settings"** → **"Domain management"**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow Netlify's DNS configuration instructions

## Step 5: Verify Deployment

1. Visit your site URL (e.g., `your-app-name.netlify.app`)
2. Test registration and login
3. Verify database operations work

## Important Notes

### Build Time Considerations

- **Prisma Client Generation**: The `netlify.toml` file includes a `postinstall` script that runs `prisma generate` automatically during build
- **Database Migrations**: Run `npx prisma db push` or migrations before deploying, or set up a migration function (see Advanced)

### Environment Variables

Make sure these are set in Netlify:
- `DATABASE_URL` - Your PostgreSQL connection string

### Build Settings

The `netlify.toml` file is already configured with:
- Next.js plugin for optimal Next.js support
- Node.js 18
- Build command that includes Prisma generation

## Troubleshooting

### Build Fails with Prisma Errors

1. Make sure `DATABASE_URL` is set in Netlify environment variables
2. Check that your database allows connections from Netlify's IPs
3. Verify Prisma Client is generated: check build logs for `prisma generate`

### Database Connection Errors

1. Ensure your cloud database allows external connections
2. Check that the connection string is correct
3. Some databases require IP whitelisting - check your database provider's settings

### Server Actions Not Working

- Netlify supports Next.js server actions via their Next.js runtime
- Make sure you're using the latest Netlify Next.js plugin (configured in `netlify.toml`)

### Build Timeout

- If builds timeout, consider:
  - Using Prisma Accelerate for faster database connections
  - Optimizing your build process
  - Upgrading to a paid Netlify plan for longer build times

## Advanced: Database Migrations

To run migrations automatically after deployment, you can create a Netlify Function:

1. Create `netlify/functions/migrate.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const handler = async () => {
  try {
    // Run migrations or seed
    // This is a simple example - adjust for your needs
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Migration completed' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  } finally {
    await prisma.$disconnect()
  }
}
```

2. Call this function after deployment using Netlify's webhook or manually.

## Next Steps

- Set up **continuous deployment** (automatic deploys on git push)
- Configure **branch deploys** for preview environments
- Set up **form handling** if needed
- Add **analytics** via Netlify Analytics
- Configure **redirects and rewrites** in `netlify.toml` if needed

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify Community](https://answers.netlify.com)
