import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { AUTH_TOKEN, USER_COLLECTION_ID } from '../../../config';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already exists in Webflow
    const checkResponse = await fetch(
      `https://api.webflow.com/v2/collections/${USER_COLLECTION_ID}/items`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'accept-version': '2.0.0'
        }
      }
    );

    if (checkResponse.ok) {
      const existingData = await checkResponse.json();
      // Check if user with this clerk-user-id already exists
      const existingUser = existingData.items?.find(
        (item: any) => item.fieldData?.['clerk-user-id'] === userId
      );
      
      if (existingUser) {
        console.log('User already synced to Webflow:', existingUser.id);
        return NextResponse.json({ 
          success: true, 
          message: 'User already synced',
          alreadyExists: true,
          webflowUserId: existingUser.id
        });
      }
    }

    // Create user in Webflow
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    
    const primaryPhone = user.phoneNumbers.find(
      (phone) => phone.id === user.primaryPhoneNumberId
    );

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                    primaryEmail?.emailAddress || 'User';
    const userSlug = `user-${userId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const webflowData: any = {
      isDraft: false, // Publish immediately instead of saving as draft
      fieldData: {
        name: userName,
        slug: userSlug,
        email: primaryEmail?.emailAddress || '',
        'clerk-user-id': userId,
        'profile-image': user.imageUrl || '',
      }
    };

    // Add phone if available
    if (primaryPhone?.phoneNumber) {
      webflowData.fieldData['phone'] = primaryPhone.phoneNumber;
    }

    const response = await fetch(
      `https://api.webflow.com/v2/collections/${USER_COLLECTION_ID}/items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'accept-version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webflowData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webflow API error:', errorText);
      throw new Error(`Webflow API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('User successfully synced to Webflow:', result.id);
    
    // Publish the user immediately to make it live
    try {
      const publishResponse = await fetch(
        `https://api.webflow.com/v2/collections/${USER_COLLECTION_ID}/items/publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'accept-version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemIds: [result.id]
          }),
        }
      );
      
      if (publishResponse.ok) {
        console.log('✅ User published to live site:', result.id);
      } else {
        const publishError = await publishResponse.text();
        console.warn('⚠️ Could not publish user (may already be live):', publishError);
      }
    } catch (publishError) {
      console.warn('⚠️ Publish step failed (user created but may need manual publish):', publishError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User synced to Webflow',
      data: result,
      webflowUserId: result.id
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

