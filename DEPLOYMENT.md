# Netlify Deployment Guide

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Make sure config.ts is NOT in your repository
git rm --cached config.ts

# Add all changes
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Netlify will auto-detect the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18

### 3. Configure Environment Variables (CRITICAL!)

⚠️ **Before deploying**, you MUST add environment variables:

1. In Netlify dashboard, go to: **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add these:

   ```
   Key: AUTH_TOKEN
   Value: [Your Webflow API Token]
   
   Key: COLLECTION_ID
   Value: 686b88dfd246d066e6c034f8
   
   Key: CATEGORY_COLLECTION_ID
   Value: 686b89fba5b90558f5ce471f
   
   Key: COMMUNITY_COLLECTION_ID
   Value: 68e70edb8c0ca22e35eccd27
   ```

3. Make sure to select **"Same value for all deploy contexts"** or configure per environment

### 4. Update Code to Use Environment Variables

The code needs to read from environment variables in production. Update `config.ts`:

**For Development (local)**: Keep current config.ts
**For Production (Netlify)**: Use environment variables

Create a new approach:

**Option A**: Create `config.ts` that reads from env vars:
```typescript
export const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your_local_token';
export const COLLECTION_ID = process.env.COLLECTION_ID || 'your_local_id';
export const CATEGORY_COLLECTION_ID = process.env.CATEGORY_COLLECTION_ID || 'your_local_category_id';
export const COMMUNITY_COLLECTION_ID = process.env.COMMUNITY_COLLECTION_ID || 'your_local_community_id';
```

**Option B**: Keep config.ts local and use Next.js env variables with prefix `NEXT_PUBLIC_`:
```typescript
export const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || '';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ID || '';
// etc...
```

### 5. Deploy

Click **"Deploy site"** in Netlify dashboard.

Netlify will:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Build your project (`npm run build`)
4. Deploy to a `.netlify.app` subdomain

### 6. Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow Netlify's instructions to configure DNS

## Troubleshooting

### Build Fails

**Error: "Cannot find module 'config'"**
- Solution: Make sure environment variables are set in Netlify
- Check that config.ts reads from process.env

**Error: "Build exceeded memory limit"**
- Solution: In Netlify, go to Site settings → Build & deploy → Environment
- Add: `NODE_OPTIONS=--max_old_space_size=4096`

### API Calls Fail

**Error: "Unauthorized" or "401"**
- Check that AUTH_TOKEN environment variable is set correctly
- Verify your Webflow API token is valid
- Make sure the token has proper permissions

**Error: "Collection not found"**
- Verify COLLECTION_ID, CATEGORY_COLLECTION_ID, COMMUNITY_COLLECTION_ID are correct
- Check that collections exist in your Webflow site

### Runtime Errors

Check the Netlify Function logs:
1. Go to Netlify dashboard
2. Click **"Functions"** tab
3. View logs for API routes

## Post-Deployment Checklist

✅ Site builds successfully
✅ All environment variables are set
✅ Can view the events list page
✅ Can add new events
✅ Can edit existing events
✅ Categories dropdown loads
✅ Communities dropdown loads
✅ Images display correctly

## Monitoring

- **Build notifications**: Set up email/Slack notifications in Netlify
- **Error tracking**: Consider adding Sentry or similar
- **Analytics**: Add Netlify Analytics or Google Analytics

## Continuous Deployment

Once connected, Netlify will:
- Automatically deploy on every push to `main` branch
- Create preview deployments for pull requests
- Show build status in GitHub

## Need Help?

- Netlify Support Docs: https://docs.netlify.com/
- Netlify Community: https://answers.netlify.com/
- Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/next-js/

