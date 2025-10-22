import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { AUTH_TOKEN, USER_COLLECTION_ID } from '../../../config';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user in Webflow by their Clerk user ID
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${USER_COLLECTION_ID}/items`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'accept-version': '2.0.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users from Webflow');
    }

    const data = await response.json();
    
    // Find the user with matching clerk-user-id
    const currentUser = data.items?.find(
      (user: any) => user.fieldData?.['clerk-user-id'] === userId
    );

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found in Webflow. Please refresh the page to sync.',
        clerkUserId: userId 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      webflowUserId: currentUser.id,
      name: currentUser.fieldData?.name || 'Unknown User',
      email: currentUser.fieldData?.email || '',
      clerkUserId: userId
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch current user' },
      { status: 500 }
    );
  }
}

