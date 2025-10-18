# Image Upload - Complete Test Plan

## What I Fixed

### 1. Added Asset Fetch After Upload
- After uploading to S3, we now fetch the asset details again
- This ensures we have the final, processed URL from Webflow

### 2. Added URL Validation
- Client-side validation ensures both `fileId` and `url` are present
- If either is missing, you'll see a clear error message

### 3. Enhanced Logging Everywhere
- You'll see exactly what data is at each step
- This will help us pinpoint where the `url` is being lost

## Testing Steps

### Test 1: Upload a NEW Image (Fresh Upload)

1. **Open the browser console** (F12 → Console tab)
2. **Go to your app** (http://localhost:3001)
3. **Edit an existing event OR create a new one**
4. **Click to upload an image**
5. **Watch the console** - you should see:

```
=== Image Upload Started ===
File: [filename]
Creating FormData...
Sending request to /api/upload-image...

=== Webflow Asset Upload Started ===
=== Asset metadata created ===
Full asset data: {...}
Asset ID: [id]
Asset URL: [should have a value here]
Step 2: Uploading file to presigned URL...
✅ File uploaded successfully to S3!
Step 3: Fetching asset details to get final URL...
Final asset data after fetch: {...}
Final asset URL: [should have a value here]
Returning to client: {
  "fileId": "...",
  "url": "...",  ← THIS MUST BE PRESENT!
  "alt": "..."
}

✅ Upload successful!
Image data received from API: {...}
FileID: [id]
URL: [url]  ← THIS MUST BE PRESENT!
Alt: [alt]
```

**❗ IMPORTANT**: If you see `Asset URL: undefined` or `Asset URL: null`, that's the problem!

6. **Check if the image preview shows up**
7. **Try to save the event**
8. **Watch for any errors**

### Test 2: Edit an Item with EXISTING Image

1. **Open the console**
2. **Click edit on an existing event that already has an image**
3. **Watch for these logs**:

```
=== EditItemModal Opened ===
Item ID: [id]
Initial thumbnail data: [this should be an object or string]
Thumbnail type: [object or string]
Thumbnail structure: {...}
```

**❗ IMPORTANT**: Check what structure the existing thumbnail has:
- If it's a string: `"https://..."`
- If it's an object: `{ "fileId": "...", "url": "..." }`
- **If it's an object WITHOUT url field, that's the problem!**

4. **Don't upload a new image**
5. **Just try to save**
6. **Check if it saves successfully**

### Test 3: Upload and Replace

1. **Edit an item that has an existing image**
2. **Upload a NEW image to replace it**
3. **Check the console logs**
4. **Try to save**

## What to Look For

### ✅ Good Signs:
- Upload logs show `Asset URL: https://...` (not undefined)
- Client receives data with all three fields: `fileId`, `url`, `alt`
- Preview shows immediately after upload
- Save succeeds

### ❌ Bad Signs:
- `Asset URL: undefined` or `Asset URL: null`
- `Missing url in response!` error
- Thumbnail structure missing the `url` field
- Save fails with validation error

## Share These With Me

If it still fails, please share:

1. **Complete console logs from upload** (from "Image Upload Started" to "Upload Finished")
2. **The "Initial thumbnail data" when opening edit modal**
3. **The "Thumbnail data being sent" when saving**
4. **Any error messages from Webflow API**

Copy these from your console and paste them!

## Quick Check

Run this in your browser console after opening the edit modal:
```javascript
// This will show you what's in formData
console.log('Current thumbnail:', formData.thumbnail);
```

The thumbnail should be either:
- A string: `"https://uploads-ssl.webflow.com/..."`
- An object: `{ fileId: "...", url: "https://...", alt: "..." }`

**NOT**: `{ fileId: "...", alt: "..." }` ← Missing url!

