import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { AUTH_TOKEN, COLLECTION_ID } from '../../../../config';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    
    const organizerName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress || 'Unknown Organizer';

    console.log('Creating event for user:', {
      userId: user?.id,
      organizerName: organizerName,
      email: user?.emailAddresses?.[0]?.emailAddress
    });

    const body = await request.json();
    
    if (!body.fieldData) {
      return NextResponse.json(
        { error: 'fieldData is required' },
        { status: 400 }
      );
    }
    
    const webflowBody: any = {
      fieldData: {
        ...body.fieldData,
        'event-organiser-name': organizerName,
      },
      isArchived: true,
      isDraft: true
    };

    console.log('Sending to Webflow:', {
      eventName: webflowBody.fieldData.name,
      organizerName: webflowBody.fieldData['event-organiser-name']
    });

    const response = await fetch(`https://api.webflow.com/v2/collections/${COLLECTION_ID}/items`, {
      method: 'POST',
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
          error: `Webflow API error: ${response.status} ${response.statusText}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    const newItem = await response.json();
    console.log('Event created successfully:', newItem.id);
    
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create collection item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
