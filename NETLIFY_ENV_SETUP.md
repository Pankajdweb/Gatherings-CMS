# 🔑 Netlify Environment Variables Setup Guide

## 📋 **Complete List of Environment Variables**

Copy and paste these into your Netlify dashboard:

---

## ✅ **Step-by-Step Instructions**

### 1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Select your site: **Gatherings-CMS**

### 2. **Navigate to Environment Variables**
   - Click **Site Settings** (in the top menu)
   - Scroll down and click **Environment Variables** (left sidebar under "Build & Deploy")
   - Or go directly to: `https://app.netlify.com/sites/YOUR-SITE-NAME/settings/env`

### 3. **Add Each Variable**
   - Click **"Add a variable"** or **"Add environment variable"**
   - Choose **"Add a single variable"**
   - Enter the **Key** and **Value** from below
   - Click **"Create variable"**
   - Repeat for all variables

---

## 📝 **Required Environment Variables**

### **Clerk Authentication** (REQUIRED - App won't work without these!)

```
Key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_test_cmVsYXhpbmctd2FscnVzLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ
```

```
Key: CLERK_SECRET_KEY
Value: sk_test_FLhR1cYmsAbmMb0JrULgFOtCqLHTuupDYZPcQRKndM
```

```
Key: NEXT_PUBLIC_CLERK_SIGN_IN_URL
Value: /sign-in
```

```
Key: NEXT_PUBLIC_CLERK_SIGN_UP_URL
Value: /sign-up
```

```
Key: NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
Value: /
```

```
Key: NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
Value: /
```

### **Webflow API** (Optional - has fallbacks in config.ts)

```
Key: NEXT_PUBLIC_AUTH_TOKEN
Value: 89d5a0a7ce86998b8a71039c802bbed0b05796d9986d5e60aede37b2cd22d3c2
```

```
Key: NEXT_PUBLIC_COLLECTION_ID
Value: 686b88dfd246d066e6c034f8
```

```
Key: NEXT_PUBLIC_CATEGORY_COLLECTION_ID
Value: 686b89fba5b90558f5ce471f
```

```
Key: NEXT_PUBLIC_COMMUNITY_COLLECTION_ID
Value: 68e70edb8c0ca22e35eccd27
```

```
Key: NEXT_PUBLIC_LOCATION_COLLECTION_ID
Value: 686b87fd7142a7a251518c48
```

```
Key: NEXT_PUBLIC_USER_COLLECTION_ID
Value: 68f2e929c205a65075268bc4
```

```
Key: NEXT_PUBLIC_SITE_ID
Value: 6865ac77d1a4f0d42c02ccbf
```

### **ImgBB Image Hosting** (Optional - has fallback in config.ts)

```
Key: IMGBB_API_KEY
Value: df2bb71915b7c58cbcbdc8e00a41d668
```

### **Clerk Webhook** (Optional - for production webhooks)

```
Key: CLERK_WEBHOOK_SECRET
Value: [Get this from Clerk Dashboard after setting up webhook]
```

---

## 🚀 **Quick Copy-Paste Format for Netlify**

If your Netlify UI has a bulk import option, use this format:

```env
# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cmVsYXhpbmctd2FscnVzLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_FLhR1cYmsAbmMb0JrULgFOtCqLHTuupDYZPcQRKndM
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Webflow API (Optional - has fallbacks)
NEXT_PUBLIC_AUTH_TOKEN=89d5a0a7ce86998b8a71039c802bbed0b05796d9986d5e60aede37b2cd22d3c2
NEXT_PUBLIC_COLLECTION_ID=686b88dfd246d066e6c034f8
NEXT_PUBLIC_CATEGORY_COLLECTION_ID=686b89fba5b90558f5ce471f
NEXT_PUBLIC_COMMUNITY_COLLECTION_ID=68e70edb8c0ca22e35eccd27
NEXT_PUBLIC_LOCATION_COLLECTION_ID=686b87fd7142a7a251518c48
NEXT_PUBLIC_USER_COLLECTION_ID=68f2e929c205a65075268bc4
NEXT_PUBLIC_SITE_ID=6865ac77d1a4f0d42c02ccbf

# ImgBB Image Hosting (Optional - has fallback)
IMGBB_API_KEY=df2bb71915b7c58cbcbdc8e00a41d668
```

---

## ⚠️ **Important Notes**

### **Must Add These First (Critical):**
1. ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - **REQUIRED** for authentication
2. ✅ `CLERK_SECRET_KEY` - **REQUIRED** for authentication
3. ✅ All other `NEXT_PUBLIC_CLERK_*` variables

### **Optional (Has Fallbacks):**
- Webflow API variables (fallbacks in `config.ts`)
- ImgBB API key (fallback in `config.ts`)
- Clerk webhook secret (only needed for production webhooks)

---

## 🔄 **After Adding Variables**

### **Option 1: Automatic Deploy**
- Netlify will automatically redeploy if you have auto-deploy enabled
- Wait for the build to complete

### **Option 2: Manual Deploy**
1. Go to **Deploys** tab
2. Click **"Trigger deploy"**
3. Select **"Deploy site"**

---

## ✅ **Verify It's Working**

1. Wait for deploy to complete
2. Visit your Netlify site URL
3. You should be redirected to `/sign-in`
4. Try signing in - it should work!

---

## 🐛 **Troubleshooting**

### **Still seeing "Missing publishableKey" error?**

1. **Check the variable name** - Must be exactly: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - ❌ Wrong: `CLERK_PUBLISHABLE_KEY`
   - ❌ Wrong: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEYS` (extra S)
   - ✅ Correct: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

2. **Check for spaces** - No spaces before or after the value
   - ❌ Wrong: `pk_test_... ` (space at end)
   - ✅ Correct: `pk_test_...` (no spaces)

3. **Redeploy after adding variables**
   - Variables only take effect after a new deploy
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

4. **Check the deploy log**
   - Look for: `- Environments: .env` or similar
   - This confirms environment variables were loaded

---

## 📸 **Screenshot Guide**

### Where to find Environment Variables in Netlify:

```
Netlify Dashboard
  └── Your Site (Gatherings-CMS)
      └── Site Settings (top menu)
          └── Build & Deploy (left sidebar)
              └── Environment Variables
                  └── Click "Add a variable"
```

---

## 🎯 **Priority Order**

Add in this order:

1. **CRITICAL** (Add these first):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - All other `NEXT_PUBLIC_CLERK_*` variables

2. **IMPORTANT** (Add these next):
   - `NEXT_PUBLIC_AUTH_TOKEN`
   - All collection IDs

3. **OPTIONAL** (Add if needed):
   - `IMGBB_API_KEY`
   - `CLERK_WEBHOOK_SECRET`

---

## 📞 **Need Help?**

If you're still having issues:

1. Check Netlify deploy logs for errors
2. Verify all variable names match exactly (case-sensitive!)
3. Make sure you triggered a new deploy after adding variables
4. Check Clerk dashboard to confirm the keys are correct

---

## ✨ **Success Checklist**

- [ ] All Clerk environment variables added
- [ ] Variable names match exactly (case-sensitive)
- [ ] No extra spaces in values
- [ ] New deploy triggered
- [ ] Deploy completed successfully
- [ ] Site loads without errors
- [ ] Sign-in page works
- [ ] Can authenticate successfully

Once all boxes are checked, your app should be working on Netlify! 🎉

