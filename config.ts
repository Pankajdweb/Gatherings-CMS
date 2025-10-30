// Configuration for Webflow API and other services
// In production (Netlify), these MUST be set via environment variables
// In development, fallback values are provided for convenience

export const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || '89d5a0a7ce86998b8a71039c802bbed0b05796d9986d5e60aede37b2cd22d3c2';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ID || '686b88dfd246d066e6c034f8';
export const CATEGORY_COLLECTION_ID = process.env.NEXT_PUBLIC_CATEGORY_COLLECTION_ID || '686b89fba5b90558f5ce471f'; 
export const COMMUNITY_COLLECTION_ID = process.env.NEXT_PUBLIC_COMMUNITY_COLLECTION_ID || '68e70edb8c0ca22e35eccd27';
export const LOCATION_COLLECTION_ID = process.env.NEXT_PUBLIC_LOCATION_COLLECTION_ID || '686b87fd7142a7a251518c48';
export const USER_COLLECTION_ID = process.env.NEXT_PUBLIC_USER_COLLECTION_ID || '68f2e929c205a65075268bc4';
export const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || '6865ac77d1a4f0d42c02ccbf';

// Image hosting configuration - ImgBB
// Get your free API key at https://api.imgbb.com/
// IMPORTANT: Set this as an environment variable in production!
export const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'df2bb71915b7c58cbcbdc8e00a41d668';

// Admin users who can see all events
export const ADMIN_USER_IDS = [
  'user_34gbOHbiTfKAgm98PfIysju75cy',
  'user_34DgwDGugSKwUmS7Bgg3hEQMZeJ'
]; 
