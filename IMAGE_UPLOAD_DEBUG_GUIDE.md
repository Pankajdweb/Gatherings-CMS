# Image Upload Debugging Guide

## What to Check

When you upload an image and save an event, please open your **Browser Console** (F12 → Console tab) and look for these log messages:

### 1. During Image Upload
```
=== Image Upload Started ===
File: [filename]
Type: [image type]
Size: [size] bytes
Creating FormData...
Sending request to /api/upload-image...
```

### 2. Server-Side Asset Creation
```
=== Webflow Asset Upload Started ===
Step 1: Creating asset metadata...
=== Asset metadata created ===
Full asset data: {...}
Asset ID: [id]
Asset URL: [url]
Step 2: Uploading file to presigned URL...
✅ File uploaded successfully to S3!
Returning to client: { fileId: "...", url: "..." }
```

### 3. Client Receives Response
```
Response status: 200
Response ok: true
✅ Upload successful!
Image data received from API: { "fileId": "...", "url": "..." }
FileID: [id]
URL: [url]
Calling onImageUploaded with: {...}
Setting preview URL to: [url]
Preview URL state updated
```

### 4. Parent Component Updates
```
📝 Field "thumbnail" updated with: { fileId: "...", url: "..." }
🔄 ImageUpload useEffect triggered
currentImageUrl changed to: { fileId: "...", url: "..." }
Extracted URL: [url]
Preview URL updated to: [url]
```

### 5. When Saving to CMS
```
=== Saving Item to CMS ===
Thumbnail data being sent: { fileId: "...", url: "..." }
Full fieldData: {...}

=== Updating Item ===
Item ID: [id]
Update Mode: staging
Thumbnail data: { fileId: "...", url: "..." }
Endpoint: [api endpoint]
✅ Item updated successfully
```

## Common Issues to Look For

### Issue 1: Upload API Returns Error
- Look for `❌ Upload failed` in console
- Check the error message for details
- Common causes: file too large (>4MB), wrong file type, network error

### Issue 2: fileId is null or undefined
- If you see `FileID: undefined` or `FileID: null`
- This means Webflow didn't return an asset ID
- Check the "Full asset data" log to see what Webflow actually returned

### Issue 3: Preview Not Showing
- Check if `Setting preview URL to:` shows a valid URL
- Check if `🔄 ImageUpload useEffect triggered` appears
- If useEffect doesn't trigger, the parent component isn't updating

### Issue 4: CMS Update Fails
- Look for error messages after `=== Updating Item ===`
- Check if `Thumbnail data being sent` shows the correct format: `{ fileId: "...", url: "..." }`
- If thumbnail is a string instead of object, that's the problem

## Next Steps

1. **Upload a new image** on the edit or add event page
2. **Copy ALL console logs** from the browser console
3. **Try to save** the event
4. **Copy any error messages**
5. **Share the logs** so we can see exactly what's happening

## Expected Format

The thumbnail should be an **object** like this:
```json
{
  "fileId": "673b41f18a4c5ac5b8b8c54f",
  "url": "https://uploads-ssl.webflow.com/..."
}
```

NOT a string like this:
```
"https://uploads-ssl.webflow.com/..."
```

