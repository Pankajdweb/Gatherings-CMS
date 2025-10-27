# Events CMS - Webflow Integration

A modern Next.js application for managing Webflow Events collection with a beautiful dark theme UI.

## Features

- ✅ **User Authentication**: Secure sign-up/sign-in with Clerk (supports email, Google, GitHub)
- ✅ **Auto User Sync**: Users automatically synced to Webflow CMS via webhooks
- ✅ **Event Management**: Create and edit events with rich text support
- ✅ **Multi-Select References**: Manage event communities, categories, and locations
- ✅ **Dark Theme**: Modern, professional dark UI inspired by contemporary event platforms
- ✅ **Real-time Sync**: Direct integration with Webflow CMS API
- ✅ **Rich Text Editor**: Full-featured editor for event descriptions
- ✅ **Image Upload**: Drag-and-drop image uploads with live preview (Webflow Assets integration)
- ✅ **Route Protection**: All routes secured behind authentication

## Tech Stack

- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Authentication**: Clerk
- **Image Hosting**: Webflow Assets API
- **Styling**: CSS Modules with custom dark theme
- **API**: Webflow CMS API v2
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Webflow account with API access
- Webflow site with Events collection set up
- Clerk account (free tier available - sign up at [clerk.com](https://clerk.com))

### Installation

> **⚠️ Important**: After installation, you MUST set up Clerk authentication. See [AUTHENTICATION.md](./AUTHENTICATION.md) for quick setup or [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed instructions.

1. Clone the repository:
```bash
git clone <your-repo-url>
cd gathering-cms-projects
```

2. Install dependencies:
```bash
npm install
```

3. Configure Webflow credentials:
```bash
# Copy the example config
cp config.example.ts config.ts

# Edit config.ts with your actual Webflow credentials
```

4. Update `config.ts` with your Webflow API credentials:
```typescript
export const AUTH_TOKEN = 'your_webflow_api_token';
export const COLLECTION_ID = 'your_events_collection_id';
export const CATEGORY_COLLECTION_ID = 'your_category_collection_id';
export const COMMUNITY_COLLECTION_ID = 'your_community_collection_id';
```

### Setting Up Authentication

**This step is REQUIRED** - your app won't work without Clerk credentials!

1. **Create a free Clerk account** at [clerk.com](https://clerk.com)
2. **Create a new application** in the Clerk dashboard
3. **Copy your API keys** (Publishable Key and Secret Key)
4. **Add them to your `.env.local` file**:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

📖 **Detailed Setup Guide**: See [AUTHENTICATION.md](./AUTHENTICATION.md) or [CLERK_SETUP.md](./CLERK_SETUP.md)

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application. You'll be redirected to sign-in first!

## Deployment to Netlify

### Quick Deploy

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your Git provider and repository
   - Netlify will auto-detect Next.js settings

3. **Environment Variables** (⚠️ IMPORTANT):
   - In Netlify dashboard, go to: Site settings → Environment variables
   - Add the following variables:
     - **Webflow:**
       - `NEXT_PUBLIC_AUTH_TOKEN`: Your Webflow API token
       - `NEXT_PUBLIC_COLLECTION_ID`: Your Events collection ID (686b88dfd246d066e6c034f8)
       - `NEXT_PUBLIC_CATEGORY_COLLECTION_ID`: Your Category collection ID (686b89fba5b90558f5ce471f)
       - `NEXT_PUBLIC_COMMUNITY_COLLECTION_ID`: Your Community collection ID (68e70edb8c0ca22e35eccd27)
       - `NEXT_PUBLIC_LOCATION_COLLECTION_ID`: Your Location collection ID (686b87fd7142a7a251518c48)
     - **Clerk Authentication:**
       - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
       - `CLERK_SECRET_KEY`: Your Clerk secret key
       - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
       - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
       - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: `/`
       - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: `/`
   
   ⚠️ **Without these environment variables, the deployment will fail or not work properly**

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy automatically

### Manual Deploy

```bash
# Build the project
npm run build

# The build output will be in .next/
# Netlify will automatically deploy this
```

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── categories/         # Category collection API
│   │   ├── collection/         # Main collection API
│   │   ├── communities/        # Community collection API
│   │   └── collection/items/   # Item CRUD operations
│   ├── components/             # React components
│   │   ├── EditItemModal.tsx   # Edit event modal
│   │   ├── MultiSelectBadge.tsx # Multi-select with badges
│   │   └── RichTextEditor.tsx  # Rich text editor
│   ├── scraper/                # Add new event form
│   ├── page.tsx                # Main events list page
│   └── globals.css             # Global styles
├── config.ts                   # Webflow API configuration
├── netlify.toml                # Netlify configuration
└── README.md                   # This file
```

## Webflow Collection Structure

Your Webflow Events collection should have these fields:

- `name` (PlainText, Required) - Event Name
- `slug` (PlainText, Required) - URL Slug
- `description` (PlainText) - Event Description
- `club-name` (PlainText) - Club Name
- `event-organiser-name` (PlainText) - Organiser Name
- `date-and-time` (DateTime) - Event Date/Time
- `address` (PlainText) - Event Address
- `thumbnail` (Image) - Event Thumbnail
- `ticket-link` (Link) - Ticket Purchase Link
- `featured-image` (Switch) - Featured Flag
- `order` (Number) - Sort Order
- `location` (Reference) - Location Reference
- `event-community` (MultiReference) - Event Communities
- `places-2` (MultiReference) - Categories

## Security Notes

⚠️ **NEVER commit `config.ts` with real credentials!**

- The `config.ts` file is ignored by git
- Use Netlify environment variables for production
- Keep your Webflow API token secure
- Regularly rotate your API tokens

## Support

For issues or questions:
1. Check Webflow API documentation: https://developers.webflow.com/
2. Review Next.js documentation: https://nextjs.org/docs
3. Check Netlify documentation: https://docs.netlify.com/

## License

Private project - All rights reserved
