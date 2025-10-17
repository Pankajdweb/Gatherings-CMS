# Netlify Deployment Guide

This guide will help you deploy your Gatherings CMS application to Netlify.

## Prerequisites

- GitHub repository with your code pushed
- Netlify account ([sign up here](https://app.netlify.com/signup))
- Webflow API credentials

## Quick Start

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** (or your Git provider)
4. Select your repository: `Pankajdweb/Gatherings-CMS`
5. Netlify will auto-detect the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - The `netlify.toml` file will handle the rest

### 3. Configure Environment Variables ⚠️ CRITICAL!

**Before deploying**, you MUST add these environment variables:

1. In Netlify dashboard → **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add each of these:

   ```
   NEXT_PUBLIC_AUTH_TOKEN
   Value: [Your Webflow API Token]
   
   NEXT_PUBLIC_COLLECTION_ID
   Value: 686b88dfd246d066e6c034f8
   
   NEXT_PUBLIC_CATEGORY_COLLECTION_ID
   Value: 686b89fba5b90558f5ce471f
   
   NEXT_PUBLIC_COMMUNITY_COLLECTION_ID
   Value: 68e70edb8c0ca22e35eccd27
   ```

3. Select **"All scopes"** for each variable

### 4. Deploy

Click **"Deploy site"** button.

Netlify will:
1. Install dependencies
2. Build your Next.js app
3. Deploy to `your-site-name.netlify.app`

## Post-Deployment

### Test Your Deployment

Visit your Netlify URL and verify:

✅ Main page loads and displays events  
✅ Can navigate to "Add New Event" page  
✅ Categories and Communities dropdowns load  
✅ Can create new events  
✅ Can edit existing events  

### Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

## Troubleshooting

### Build Errors

**"No cache found"**
- This is just a warning on first build - it's normal! Subsequent builds will be cached.

**"Missing dependencies"**
- Check that `package.json` includes all dependencies
- Try deleting and redeploying

**"Build exceeded time limit"**
- Check Netlify build logs for specific errors
- May need to upgrade Netlify plan

### Environment Variable Issues

**"Unauthorized" API errors**
- Verify `NEXT_PUBLIC_AUTH_TOKEN` is set correctly
- Make sure Webflow API token is valid and has proper permissions

**"Collection not found"**
- Double-check all collection IDs are correct
- Verify collections exist in your Webflow site

### Runtime Errors

**Check Function Logs:**
1. Netlify dashboard → **Functions** tab
2. View logs for API routes (`/api/*`)

## Continuous Deployment

After initial setup:
- Every push to `main` branch auto-deploys
- Pull requests create preview deployments
- Build status shows in GitHub

## Build Configuration

Your `netlify.toml` includes:
```toml
[build]
  command = "npm run build"
  publish = ".next"
  
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

This ensures optimal Next.js deployment with:
- Server-side rendering
- API routes
- Automatic image optimization

## Performance Optimization

The project is configured with:
- Next.js image optimization for Webflow CDN
- Automatic caching for faster rebuilds
- Security headers

## Need Help?

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify Support](https://answers.netlify.com/)

## Security Notes

- Never commit your `config.ts` with real API keys
- Always use environment variables in production
- The `config.ts` file includes fallback values for development
- Production should use Netlify environment variables
