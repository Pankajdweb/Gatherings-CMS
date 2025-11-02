import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AUTH_TOKEN, COLLECTION_ID, ADMIN_USER_IDS } from '../../../../../config';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    // Check if user is admin
    const { userId } = await auth();
    const isAdmin = userId && ADMIN_USER_IDS.includes(userId);
    
    // Determine isDraft status:
    // - Regular users: Always keep as draft (isDraft: true)
    // - Admin with 'live' mode: Publish (isDraft: false)
    // - Admin with 'staging' mode: Keep as draft (isDraft: true)
    const updateMode = body.updateMode || 'staging'; // Default to staging for safety
    const shouldPublish = isAdmin && updateMode === 'live';
    
    // Prepare the request body for Webflow API
    const webflowBody: any = {
      fieldData: body.fieldData,
      isArchived: typeof body.isArchived === 'boolean' ? body.isArchived : false,
      isDraft: !shouldPublish // true = draft, false = published
    };

    // Use staging or live endpoint based on updateMode
    const endpoint = updateMode === 'staging' 
      ? `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items/${resolvedParams.itemId}`
      : `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items/${resolvedParams.itemId}/live`;

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'accept-version': '2.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webflowBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      
      return NextResponse.json(
        { 
          error: 'Failed to update item',
          details: errorData,
          status: response.status
        },
        { status: response.status }
      );
    }

    const updatedItem = await response.json();
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update collection item' },
      { status: 500 }
    );
  }
} 