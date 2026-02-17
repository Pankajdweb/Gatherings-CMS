import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { AUTH_TOKEN, USER_COLLECTION_ID } from '../../../../config';

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

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

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data;
    console.log('🔔 Webhook received: user.created for user:', id);

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);
    const primaryPhone = phone_numbers && phone_numbers.length > 0 ? phone_numbers.find((phone: any) => phone.id === evt.data.primary_phone_number_id) : null;
    
    try {
      // Get full name from Clerk profile
      const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 
                      primaryEmail?.email_address || 
                      'User';
      
      // For new users, use full name as the public name until they set a display name
      const publicName = fullName;
      
      const userSlug = `user-${id}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      console.log('Creating user in Webflow:', { publicName, fullName, email: primaryEmail?.email_address });
      
      const webflowData: any = {
        isDraft: false,
        fieldData: {
          name: publicName,  // Will be updated to display name later
          'full-name': fullName,  // Actual name from Clerk
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

    } catch (error) {
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
