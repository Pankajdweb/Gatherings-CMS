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

    // Get display name from metadata (this goes in the "name" field - public)
    const displayName = (user.unsafeMetadata?.displayName as string) || '';
    
    // Get actual name from Clerk profile (this goes in "full-name" field - admin only)
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                     user.emailAddresses[0]?.emailAddress ||
                     'User';

    // For the public "name" field, use display name if available, otherwise fall back to full name
    const publicName = displayName || fullName;

    console.log('Syncing user:', {
      publicName,
      fullName,
      displayName,
      userId
    });

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
      const existingUser = existingData.items?.find(
        (item: any) => item.fieldData?.['clerk-user-id'] === userId
      );
      
      if (existingUser) {
        console.log('User exists, updating fields');
        
        // Update: name (public/display) and full-name (admin/actual)
        const updateData = {
          fieldData: {
            name: publicName,
            'full-name': fullName
          }
        };

        const updateResponse = await fetch(
          `https://api.webflow.com/v2/collections/${USER_COLLECTION_ID}/items/${existingUser.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`,
              'accept-version': '2.0.0',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Update failed:', errorText);
          throw new Error(`Failed to update user: ${errorText}`);
        }

        const updated = await updateResponse.json();
        console.log('User updated successfully');
        
        return NextResponse.json({ 
          success: true, 
          message: 'User updated',
          webflowUserId: existingUser.id,
          publicName,
          fullName
        });
      }
    }

    // Create new user
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    
    const primaryPhone = user.phoneNumbers.find(
      (phone) => phone.id === user.primaryPhoneNumberId
    );
    
    const userSlug = `user-${userId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const webflowData: any = {
      isDraft: false,
      fieldData: {
        name: publicName,  // Display name (public)
        'full-name': fullName,  // Actual name (admin)
        slug: userSlug,
        email: primaryEmail?.emailAddress || '',
        'clerk-user-id': userId,
        'profile-image': user.imageUrl || ''
      }
    };

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
    console.log('User created successfully:', result.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'User synced to Webflow',
      webflowUserId: result.id,
      publicName,
      fullName
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
