import { NextResponse } from 'next/server';
import { AUTH_TOKEN, COLLECTION_ID } from '../../../../../config';

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
    
    console.log('=== Updating Item ===');
    console.log('Item ID:', resolvedParams.itemId);
    console.log('Update Mode:', body.updateMode || 'live (default)');
    console.log('Thumbnail data:', body.fieldData?.thumbnail);
    
    // Prepare the request body for Webflow API
    const webflowBody: any = {
      fieldData: body.fieldData,
      isArchived: typeof body.isArchived === 'boolean' ? body.isArchived : false,
      isDraft: false
    };

    // Use staging or live endpoint based on updateMode
    const updateMode = body.updateMode || 'live';
    const endpoint = updateMode === 'staging' 
      ? `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items/${resolvedParams.itemId}`
      : `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items/${resolvedParams.itemId}/live`;
    
    console.log('Endpoint:', endpoint);

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
      console.error('❌ Webflow API error:', response.status);
      console.error('Error details:', errorData);
      
      // Try to parse the error to get more details
      try {
        const errorJson = JSON.parse(errorData);
        console.error('Parsed error:', JSON.stringify(errorJson, null, 2));
        if (errorJson.message) console.error('Error message:', errorJson.message);
        if (errorJson.details) console.error('Error details:', errorJson.details);
      } catch (e) {
        console.error('Could not parse error as JSON');
      }
      
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
    console.log('✅ Item updated successfully');
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update collection item' },
      { status: 500 }
    );
  }
} 