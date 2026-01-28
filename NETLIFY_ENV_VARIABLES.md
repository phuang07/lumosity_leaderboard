# Adding Environment Variables to Netlify

This guide shows you how to add your `DATABASE_URL` (and other environment variables) to Netlify.

## Method 1: Netlify UI (Recommended - Easiest)

### Step 1: Get Your Connection String

Your Neon connection string is in your `.env` file:
```
DATABASE_URL="postgresql://neondb_owner:[YOUR-PASSWORD]@ep-old-truth-ahqlkc4j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Important**: Copy the entire string including the quotes and all parameters.

### Step 2: Go to Netlify Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign in to your account
3. If you haven't deployed your site yet:
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your GitHub repository
   - Follow the deployment setup
4. If your site is already deployed:
   - Click on your site name

### Step 3: Navigate to Environment Variables

1. In your site dashboard, click **"Site settings"** (gear icon in the top navigation)
2. In the left sidebar, click **"Environment variables"**
3. You'll see a list of existing environment variables (if any)

### Step 4: Add DATABASE_URL

1. Click the **"Add a variable"** button (or **"Add variable"**)
2. In the **"Key"** field, enter: `DATABASE_URL`
3. In the **"Value"** field, paste your connection string:
   ```
   postgresql://neondb_owner:[YOUR-PASSWORD]@ep-old-truth-ahqlkc4j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   **Note**: Don't include the quotes in the value field - just paste the connection string directly.

4. (Optional) Select scopes:
   - **All scopes** - Available in all environments (production, deploy previews, branch deploys)
   - **Production** - Only in production
   - **Deploy previews** - Only in preview deployments
   - **Branch deploys** - Only in branch deployments
   
   For `DATABASE_URL`, select **"All scopes"** so it works everywhere.

5. Click **"Save"** or **"Add variable"**

### Step 5: Redeploy Your Site

After adding the environment variable, you need to trigger a new deployment:

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
   - This ensures the new environment variable is used
   - Clearing cache ensures a fresh build

3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 6: Verify It Works

1. Once deployed, visit your site
2. Try registering a new user or logging in
3. If the database connection works, you're all set! ✅

---

## Method 2: Netlify CLI

If you prefer using the command line:

### Step 1: Install Netlify CLI (if not already installed)

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate.

### Step 3: Link Your Site (if not already linked)

```bash
netlify link
```

Follow the prompts to link your local project to your Netlify site.

### Step 4: Set Environment Variable

```bash
netlify env:set DATABASE_URL "postgresql://neondb_owner:[YOUR-PASSWORD]@ep-old-truth-ahqlkc4j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Note**: Make sure to wrap the connection string in quotes if it contains special characters.

### Step 5: Verify It Was Added

```bash
netlify env:list
```

You should see `DATABASE_URL` in the list.

### Step 6: Trigger a New Deployment

```bash
netlify deploy --prod
```

Or trigger from the UI as described in Method 1, Step 5.

---

## Method 3: netlify.toml (Not Recommended for Secrets)

⚠️ **Warning**: Don't put sensitive data like `DATABASE_URL` directly in `netlify.toml` if you're committing it to git. This file is typically committed to your repository.

However, you can reference environment variables in `netlify.toml`:

```toml
[build.environment]
  DATABASE_URL = "@DATABASE_URL"  # References the env var set in Netlify UI
```

But this is usually unnecessary - Netlify automatically makes all environment variables available during build.

---

## Best Practices

### ✅ DO:
- Use Netlify UI or CLI to set sensitive environment variables
- Use **"All scopes"** for database URLs so they work in all environments
- Clear cache and redeploy after adding new environment variables
- Test your deployment after adding variables

### ❌ DON'T:
- Commit `.env` files to git (they should be in `.gitignore`)
- Put sensitive connection strings in `netlify.toml` if committing to git
- Share your connection strings publicly
- Use different database URLs for different environments unless necessary

---

## Troubleshooting

### Environment Variable Not Working?

1. **Check the variable name**: Make sure it's exactly `DATABASE_URL` (case-sensitive)
2. **Verify the value**: Check that the connection string is correct and complete
3. **Clear cache and redeploy**: Old builds might have cached the old (missing) variable
4. **Check build logs**: In Netlify dashboard → Deploys → Click on a deploy → View build logs
   - Look for errors related to database connection
   - Verify the environment variable is being loaded

### Connection String Issues

If you're getting database connection errors:

1. **Verify the connection string format**: Should include `?sslmode=require` for Neon
2. **Test locally first**: Make sure it works with `npx prisma db push` locally
3. **Check Neon dashboard**: Ensure your Neon database is active and accessible
4. **Check IP restrictions**: Some databases restrict connections by IP - Neon should allow all IPs by default

### Build Fails After Adding Variable

1. **Check for syntax errors**: Make sure the connection string doesn't have extra quotes or line breaks
2. **Verify Prisma can generate**: The build should run `prisma generate` (via postinstall script)
3. **Check build logs**: Look for specific error messages in the deploy logs

---

## Quick Reference

**Your Neon Connection String:**
```
postgresql://neondb_owner:[YOUR-PASSWORD]@ep-old-truth-ahqlkc4j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Steps:**
1. Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add variable: Key = `DATABASE_URL`, Value = (connection string above)
3. Save
4. Deploys → Trigger deploy → Clear cache and deploy site
5. Wait for deployment
6. Test your app!

---

## Additional Resources

- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Netlify CLI Docs](https://cli.netlify.com/)
- [Neon Connection Guide](https://neon.tech/docs/connect/connect-from-any-app)
