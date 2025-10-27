# Gatherings CMS - Project Structure

## 📁 Project Overview

This is a clean, production-ready Next.js application for managing Webflow CMS events with Clerk authentication.

---

## 🗂️ Root Files

### Essential Configuration
- **`package.json`** - Project dependencies and scripts
- **`next.config.ts`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration
- **`middleware.ts`** - Clerk authentication middleware (protects routes)
- **`netlify.toml`** - Netlify deployment configuration

### Configuration Files
- **`config.ts`** - Environment variables and API keys (has fallback values)
- **`config.example.ts`** - Example configuration template
- **`.env.local`** - Local environment variables (created, in .gitignore)

### Documentation
- **`README.md`** - Main project documentation
- **`NETLIFY_DEPLOYMENT.md`** - Complete deployment guide for Netlify
- **`IMGBB_SETUP.md`** - Guide for setting up image hosting

### Auto-Generated
- **`next-env.d.ts`** - Next.js TypeScript definitions (auto-generated)
- **`package-lock.json`** - Dependency lock file
- **`node_modules/`** - Dependencies (not committed to git)

---

## 📂 `/app` Directory Structure

### Pages
- **`page.tsx`** - Home page (dashboard showing user's events)
- **`layout.tsx`** - Root layout with ClerkProvider
- **`globals.css`** - Global styles
- **`page.module.css`** - Page-specific styles

### Authentication Pages
- **`sign-in/[[...sign-in]]/page.tsx`** - Local sign-in page
- **`sign-up/[[...sign-up]]/page.tsx`** - Local sign-up page

### Feature Pages
- **`addevents/page.tsx`** - Create new events page

### Components (`/app/components/`)
- **`Navbar.tsx`** - Navigation bar with user menu
- **`Navbar.module.css`** - Navbar styles
- **`EditItemModal.tsx`** - Modal for editing events
- **`ImageUpload.tsx`** - Image upload component (using ImgBB)
- **`ImageUpload.module.css`** - Image upload styles
- **`MultiSelectBadge.tsx`** - Multi-select component for categories/communities

### API Routes (`/app/api/`)

#### Collection Management
- **`collection/route.ts`** - GET all events
- **`collection/items/route.ts`** - POST create event
- **`collection/items/[itemId]/route.ts`** - PATCH update event

#### Reference Data
- **`categories/route.ts`** - GET all categories
- **`communities/route.ts`** - GET all communities
- **`locations/route.ts`** - GET all locations
- **`users/route.ts`** - GET all users

#### User Management
- **`current-user-webflow/route.ts`** - GET current user's Webflow data
- **`sync-user/route.ts`** - POST sync Clerk user to Webflow

#### Image Upload
- **`upload-image/route.ts`** - POST upload images to ImgBB

#### Webhooks
- **`webhooks/clerk/route.ts`** - POST Clerk webhook handler (auto-creates users)

---

## 🔑 Environment Variables

Located in `.env.local` (not committed to git):

### Webflow API
- `NEXT_PUBLIC_AUTH_TOKEN` - Webflow API token
- `NEXT_PUBLIC_COLLECTION_ID` - Events collection ID
- `NEXT_PUBLIC_CATEGORY_COLLECTION_ID` - Categories collection ID
- `NEXT_PUBLIC_COMMUNITY_COLLECTION_ID` - Communities collection ID
- `NEXT_PUBLIC_LOCATION_COLLECTION_ID` - Locations collection ID
- `NEXT_PUBLIC_USER_COLLECTION_ID` - Users collection ID
- `NEXT_PUBLIC_SITE_ID` - Webflow site ID

### Image Hosting
- `IMGBB_API_KEY` - ImgBB API key for image uploads

### Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key (server-side only)
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in page URL
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up page URL
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Redirect after sign-in
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Redirect after sign-up

---

## 🚀 NPM Scripts

```bash
npm run dev      # Start development server (with Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🔒 Authentication Flow

1. User visits any page → Middleware checks authentication
2. If not authenticated → Redirect to `/sign-in`
3. User signs in/up → Clerk handles authentication
4. Webhook triggers → User synced to Webflow
5. User redirected to `/` → Dashboard loads their events

---

## 📊 Data Flow

1. **Events are filtered by user** - Only shows events where `organiser-name` matches user's Webflow ID
2. **User sync** - Happens automatically on first visit and via webhook
3. **Image uploads** - Go to ImgBB, URL stored in Webflow
4. **All CMS operations** - Go through Webflow API v2

---

## 🎨 Styling

- Modern dark theme with orange accents
- Responsive design
- CSS Modules for component-scoped styles
- Custom animations and transitions

---

## 🐛 Bugs Fixed

1. ✅ Phone field typo (`phoe` → `phone`)
2. ✅ Enhanced error handling and logging
3. ✅ Better loading states
4. ✅ Local authentication instead of hosted pages
5. ✅ Improved data fetching with proper error messages

---

## 📝 Notes

- **Config fallbacks**: The `config.ts` file has fallback values, so the app works even without `.env.local`
- **Clerk is required**: Authentication won't work without Clerk environment variables
- **ImgBB for images**: Using ImgBB instead of Webflow Assets API for reliable image hosting
- **Event filtering**: Events are filtered on the frontend by `organiser-name` field
- **100 events found**: Your Webflow collection currently has 100 events

---

## 🔧 Key Features

- ✅ Clerk authentication (email, Google, GitHub)
- ✅ User-specific event management
- ✅ Create, edit, view events
- ✅ Image upload with preview
- ✅ Multi-select categories and communities
- ✅ Location selection
- ✅ Draft and archive support
- ✅ Responsive design
- ✅ Auto-sync users to Webflow

---

## 📚 For More Information

- **Setup**: See `README.md`
- **Deployment**: See `NETLIFY_DEPLOYMENT.md`
- **Images**: See `IMGBB_SETUP.md`

