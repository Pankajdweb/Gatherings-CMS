import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { AUTH_TOKEN, USER_COLLECTION_ID } from '../../../../config';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the Clerk webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new NextResponse('Error: Verification failed', { status: 400 });
  }

  const eventType = evt.type;

  // Handle user.created event (when user signs up)
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data;
    console.log('🔔 Webhook received: user.created for user:', id);

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);
    const primaryPhone = phone_numbers && phone_numbers.length > 0 ? phone_numbers.find((phone: any) => phone.id === evt.data.primary_phone_number_id) : null;
    
    try {
      // Sync user to Webflow collection
      const userName = `${first_name || ''} ${last_name || ''}`.trim() || primaryEmail?.email_address || 'User';
      const userSlug = `user-${id}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      console.log('Creating user in Webflow:', { userName, userSlug, email: primaryEmail?.email_address });
      
      const webflowData: any = {
        isDraft: false, // Publish immediately instead of saving as draft
        fieldData: {
          name: userName,
          slug: userSlug,
          email: primaryEmail?.email_address || '',
          'clerk-user-id': id,
          'profile-image': image_url || '',
        }
      };

      if (primaryPhone?.phone_number) {
        webflowData.fieldData['phone'] = primaryPhone.phone_number;
      }

      const response = await fetch(`https://api.webflow.com/v2/collections/${USER_COLLECTION_ID}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'accept-version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webflowData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Webflow API error:', errorText);
        throw new Error(`Webflow API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ User successfully created in Webflow:', result.id);
      
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

    } catch (error) {
      // Don't fail the webhook - just log the error
      console.error('❌ Error creating user in Webflow:', error);
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  console.log('✅ Webhook processed successfully:', eventType);

  return new NextResponse(JSON.stringify({ success: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

