// Configuration for Webflow API
// In production (Netlify), these will be read from environment variables
// In development, use your local values

export const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || '0eb5c0fb1d6d00d04791c9ba9a42b6cfc75bcd5f9a90ff51448be36154e5bc33';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ID || '686b88dfd246d066e6c034f8';
export const CATEGORY_COLLECTION_ID = process.env.NEXT_PUBLIC_CATEGORY_COLLECTION_ID || '686b89fba5b90558f5ce471f'; 
export const COMMUNITY_COLLECTION_ID = process.env.NEXT_PUBLIC_COMMUNITY_COLLECTION_ID || '68e70edb8c0ca22e35eccd27';
export const LOCATION_COLLECTION_ID = process.env.NEXT_PUBLIC_LOCATION_COLLECTION_ID || '686b87fd7142a7a251518c48'; 
