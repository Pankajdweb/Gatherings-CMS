import { NextResponse } from 'next/server';
import { AUTH_TOKEN, COLLECTION_ID } from '../../../config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const collectionResponse = await fetch(`https://api.webflow.com/v2/collections/${COLLECTION_ID}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'accept-version': '2.0.0'
      }
    });

    // Fetch all items - Webflow API v2 /items endpoint should return all accessible items
    // including drafts and archived items
    const itemsResponse = await fetch(`https://api.webflow.com/v2/collections/${COLLECTION_ID}/items`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'accept-version': '2.0.0'
      }
    });

    if (!collectionResponse.ok) {
      throw new Error(`Failed to fetch collection metadata: ${collectionResponse.status}`);
    }

    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch collection items: ${itemsResponse.status}`);
    }

    const collectionData = await collectionResponse.json();
    const itemsData = await itemsResponse.json();

    // Return all items (including archived and draft) so users and admins can see all events
    // The /items endpoint should return all items the API key has access to
    return NextResponse.json({
      collection: collectionData,
      items: itemsData.items || []
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch collection data from Webflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 