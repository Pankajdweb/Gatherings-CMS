import { NextResponse } from 'next/server';
import { AUTH_TOKEN, COLLECTION_ID } from '../../../config';

export async function GET() {
  try {
    console.log('🔄 Collection API called');
    console.log('Using AUTH_TOKEN:', AUTH_TOKEN ? 'Present' : 'Missing');
    console.log('Using COLLECTION_ID:', COLLECTION_ID);
    
    // Fetch collection metadata
    console.log('📊 Fetching collection metadata...');
    const collectionResponse = await fetch(`https://api.webflow.com/v2/collections/${COLLECTION_ID}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'accept-version': '2.0.0'
      }
    });

    // Fetch collection items
    console.log('📅 Fetching collection items...');
    const itemsResponse = await fetch(`https://api.webflow.com/v2/collections/${COLLECTION_ID}/items`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'accept-version': '2.0.0'
      }
    });

    console.log('Collection response status:', collectionResponse.status);
    console.log('Items response status:', itemsResponse.status);

    if (!collectionResponse.ok) {
      const errorText = await collectionResponse.text();
      console.error('Collection metadata error:', collectionResponse.status, errorText);
      throw new Error(`Failed to fetch collection metadata: ${collectionResponse.status} ${collectionResponse.statusText}`);
    }

    if (!itemsResponse.ok) {
      const errorText = await itemsResponse.text();
      console.error('Collection items error:', itemsResponse.status, errorText);
      throw new Error(`Failed to fetch collection items: ${itemsResponse.status} ${itemsResponse.statusText}`);
    }

    const collectionData = await collectionResponse.json();
    const itemsData = await itemsResponse.json();

    console.log('✅ Collection data fetched successfully');
    console.log('Items count:', itemsData.items?.length || 0);

    return NextResponse.json({
      collection: collectionData,
      items: itemsData.items || []
    });
  } catch (error) {
    console.error('❌ Error fetching from Webflow:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch collection data from Webflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 