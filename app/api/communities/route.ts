import { NextResponse } from 'next/server';
import { AUTH_TOKEN, COMMUNITY_COLLECTION_ID } from '../../../config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(`https://api.webflow.com/v2/collections/${COMMUNITY_COLLECTION_ID}/items`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'accept-version': '2.0.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch communities from Webflow API');
    }

    const data = await response.json();
    // Filter out archived and draft items
    const activeItems = (data.items || []).filter((item: any) => !item.isArchived && !item.isDraft);
    return NextResponse.json({ items: activeItems });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}