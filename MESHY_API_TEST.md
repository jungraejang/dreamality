# Meshy API Testing Guide

## Error: "NoMatchingRoute"

This error means the Meshy API endpoint or method is incorrect. Let's troubleshoot:

## Step 1: Verify Your API Key

1. Check your `.env.local` file has:
   ```env
   MESHY_API_KEY=msy_your_actual_key_here
   ```

2. Make sure the key starts with `msy_`

3. **Restart your dev server** after adding the key:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## Step 2: Test Meshy API Directly

Test your API key with curl:

```bash
curl -X POST https://api.meshy.ai/v2/image-to-3d \
  -H "Authorization: Bearer YOUR_MESHY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/test.png",
    "enable_pbr": true
  }'
```

Replace `YOUR_MESHY_API_KEY` with your actual key.

**Expected Response:**
- ✅ Success: Returns task ID
- ❌ 401: Invalid API key
- ❌ 404: Wrong endpoint

## Step 3: Check Meshy API Version

The Meshy API might have changed. Check their latest docs:

1. Go to [https://docs.meshy.ai](https://docs.meshy.ai)
2. Look for "Image to 3D" endpoint
3. Verify the endpoint URL and parameters

## Common Issues

### Issue 1: Wrong API Endpoint

If Meshy changed their API, the endpoint might be different. Try:

- `https://api.meshy.ai/v2/image-to-3d` (current)
- `https://api.meshy.ai/v1/image-to-3d` (older)
- `https://api.meshy.ai/image-to-3d` (no version)

### Issue 2: Missing Required Parameters

Meshy might require additional parameters. Common ones:

```json
{
  "image_url": "https://...",
  "enable_pbr": true,
  "ai_model": "meshy-4",  // Might be required
  "topology": "quad",      // Might be required
  "target_polycount": 30000 // Might be required
}
```

### Issue 3: API Key Format

Make sure your API key:
- Starts with `msy_`
- Has no extra spaces
- Is the full key (not truncated)

## Step 4: Check Server Logs

Look at your terminal where `npm run dev` is running. You should see:

```
Calling Meshy API with image URL: https://...
Meshy API response status: 200 (or error code)
```

If you see:
- `MESHY_API_KEY is not configured` → Add key to `.env.local`
- `401` → Invalid API key
- `404` → Wrong endpoint
- `NoMatchingRoute` → API endpoint or method incorrect

## Step 5: Alternative Endpoints to Try

If the current endpoint doesn't work, try these variations:

### Option A: Different version
```typescript
fetch('https://api.meshy.ai/v1/image-to-3d', { ... })
```

### Option B: Different structure
```typescript
fetch('https://api.meshy.ai/openapi/v2/image-to-3d', { ... })
```

### Option C: Check Meshy Dashboard

1. Log into [meshy.ai](https://www.meshy.ai)
2. Go to API documentation
3. Copy the exact endpoint they show
4. Update the code with the correct endpoint

## Quick Fix

If you find the correct endpoint from Meshy's docs, update this file:

`app/api/generate-3d/route.ts` line 38:

```typescript
const meshyResponse = await fetch('CORRECT_ENDPOINT_HERE', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
  },
  body: JSON.stringify({
    // Add required parameters here
  }),
})
```

## Need Help?

1. Check Meshy's official docs: https://docs.meshy.ai
2. Look at their API examples
3. Contact Meshy support if endpoint has changed
4. Share the exact error message from server logs

---

**Next Steps:**
1. Verify your API key is correct
2. Check Meshy's current API documentation
3. Update the endpoint if it has changed
4. Test with curl first before trying in the app

