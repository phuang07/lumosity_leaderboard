# Netlify Quick Start Guide

## 🚀 Quick Deployment Steps

### 1. Set Up Database (5 minutes)
- Sign up for [Supabase](https://supabase.com) (free)
- Create a new project
- Copy your `DATABASE_URL` from Settings → Database

### 2. Initialize Database Locally
```bash
# Add to .env
DATABASE_URL="your-supabase-connection-string"

# Initialize database
npm run db:generate
npx prisma db push
npm run db:seed
```

### 3. Deploy to Netlify (5 minutes)
1. Push code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repository
5. **Build settings** (auto-detected):
   - Build command: `npm run build`
   - Publish directory: (auto-handled by Netlify plugin)
6. **Add environment variable**:
   - Go to Site settings → Environment variables
   - Add `DATABASE_URL` with your Supabase connection string
7. Click **"Deploy site"**

### 4. Done! 🎉
Your app will be live at `your-app-name.netlify.app`

## 📝 Files Created
- ✅ `netlify.toml` - Netlify configuration
- ✅ `package.json` - Updated with `postinstall` script for Prisma

## ⚙️ What Happens During Build
1. Netlify installs dependencies (`npm install`)
2. `postinstall` script runs `prisma generate` automatically
3. Next.js builds your app (`npm run build`)
4. Netlify deploys with Next.js plugin for optimal performance

## 🔧 Required Environment Variables
- `DATABASE_URL` - Your PostgreSQL connection string

## 📚 Full Documentation
See `NETLIFY_SETUP.md` for detailed instructions and troubleshooting.
