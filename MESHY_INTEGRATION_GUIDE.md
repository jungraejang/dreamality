# Meshy API Integration Guide

Complete guide for the Meshy AI integration in Dreamality.

## Overview

Dreamality now includes full integration with Meshy AI to convert your generated images into 3D models. The integration uses **preview mode** for fast, cost-effective 3D generation (2-3 minutes per model).

## Features

✅ **One-Click 3D Generation** - Convert any image to 3D with a single button  
✅ **Real-time Status Tracking** - Auto-polling to check generation progress  
✅ **Interactive 3D Viewer** - View models in browser with Three.js  
✅ **Multiple Export Formats** - Download as GLB, FBX, or USDZ  
✅ **Automatic Storage** - Models saved to Supabase database  
✅ **Separate Gallery** - Dedicated page for managing 3D models  

## Setup

### 1. Get Meshy API Key

1. Visit [meshy.ai](https://www.meshy.ai)
2. Sign up for an account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `msy_`)

### 2. Add to Environment Variables

Add to your `.env.local`:

```env
MESHY_API_KEY=msy_your_api_key_here
```

### 3. Run Database Migration

The `supabase-setup.sql` file already includes the `models_3d` table. If you haven't run it yet:

1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `supabase-setup.sql`

This creates:
- `models_3d` table for storing model metadata
- RLS policies for user data isolation

## How It Works

### Workflow

```
User clicks "Generate 3D" on an image
    ↓
POST /api/generate-3d
    ↓
Meshy API starts image-to-3D task
    ↓
Task ID saved to database (status: PENDING)
    ↓
User redirected to /models-3d
    ↓
Auto-polling checks status every 10 seconds
    ↓
When complete (2-3 min), status updates to SUCCEEDED
    ↓
Model URLs (GLB, FBX, USDZ) saved to database
    ↓
User can view in 3D viewer or download
```

### API Endpoints

#### 1. `/api/generate-3d` (POST)

Starts 3D generation from an image.

**Request:**
```json
{
  "imageId": "uuid",
  "imageUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "meshy_task_id",
  "modelId": "uuid",
  "message": "3D generation started. This will take 2-3 minutes."
}
```

#### 2. `/api/check-3d-status` (POST)

Checks the status of a 3D generation task.

**Request:**
```json
{
  "modelId": "uuid"
}
```

**Response:**
```json
{
  "status": "SUCCEEDED",
  "model_url": "https://...",
  "thumbnail_url": "https://...",
  "glb_url": "https://...",
  "fbx_url": "https://...",
  "usdz_url": "https://...",
  "progress": 100
}
```

**Status Values:**
- `PENDING` - Task queued
- `IN_PROGRESS` - Currently generating
- `SUCCEEDED` - Complete with model URLs
- `FAILED` - Generation failed

## Database Schema

### `models_3d` Table

```sql
CREATE TABLE models_3d (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_id UUID REFERENCES images(id),
  meshy_task_id TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  model_url TEXT,
  thumbnail_url TEXT,
  glb_url TEXT,
  fbx_url TEXT,
  usdz_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

## User Interface

### Gallery Page (`/gallery`)

- Each image card now has a "Generate 3D" button
- Clicking starts 3D generation
- User is redirected to `/models-3d`

### 3D Models Page (`/models-3d`)

- Shows all user's 3D models
- Real-time status updates
- Interactive 3D viewer (Three.js)
- Download buttons for each format
- Auto-refresh for pending models

### Model Status Card

Shows:
- Source image thumbnail
- Generation status badge
- Progress indicator
- 3D viewer (when complete)
- Download buttons (GLB, FBX, USDZ)
- Error messages (if failed)

## 3D Viewer

Built with:
- **Three.js** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers

Features:
- Auto-rotation
- Orbit controls (pan, zoom, rotate)
- Studio lighting
- Centered model display

## Cost & Performance

### Meshy API Costs (Approximate)

- **Preview Mode**: ~$0.08-0.10 per model
- **Processing Time**: 2-3 minutes
- **Quality**: Good for previews, prototypes, games

### Optimization Tips

1. **Preview Mode Only**: Currently using preview for speed/cost
2. **Auto-Polling**: Checks status every 10 seconds
3. **Caching**: Completed models cached in database
4. **Lazy Loading**: 3D viewer only loads when "View 3D" clicked

## Usage Examples

### Basic Flow

1. **Generate Image**
   ```
   User: "a vintage wooden chair"
   → Image generated with white background
   ```

2. **Convert to 3D**
   ```
   Click "Generate 3D" in gallery
   → Meshy API starts processing
   → Status: PENDING → IN_PROGRESS → SUCCEEDED
   ```

3. **View & Download**
   ```
   View in interactive 3D viewer
   Download as GLB for web/games
   Download as FBX for Unity/Unreal
   Download as USDZ for AR on iOS
   ```

## Troubleshooting

### Issue: "Failed to start 3D generation"

**Solutions:**
- Verify `MESHY_API_KEY` is set correctly
- Check Meshy API key is valid
- Ensure you have credits in Meshy account
- Check API rate limits

### Issue: Generation stuck at PENDING

**Solutions:**
- Wait 2-3 minutes for processing
- Click "Check Status" manually
- Refresh the page
- Check Meshy API status

### Issue: 3D viewer not loading

**Solutions:**
- Ensure model status is SUCCEEDED
- Check `glb_url` is valid
- **Known Issue**: Meshy's signed URLs may have CORS restrictions
- **Workaround**: Use the "Download GLB" button instead
- The model files work perfectly when downloaded
- Try downloading and viewing locally in Blender, Unity, or online viewers

**Why this happens:**
- Meshy's CDN URLs contain special characters (`~`) in signatures
- These can cause CORS issues in some browsers
- The download functionality always works
- This is a limitation of loading external signed URLs in Three.js

### Issue: "Model not found"

**Solutions:**
- Ensure you own the image
- Check image exists in database
- Verify RLS policies are set up

## Advanced Configuration

### Change to Refine Mode

For higher quality (slower, more expensive):

```typescript
// In app/api/generate-3d/route.ts
body: JSON.stringify({
  image_url: imageUrl,
  enable_pbr: true,
  mode: 'refine', // Change from 'preview' to 'refine'
})
```

**Refine Mode:**
- Cost: ~$0.40-0.50 per model
- Time: 10-20 minutes
- Quality: Production-ready

### Adjust Polling Interval

```typescript
// In components/3d/model-status-card.tsx
const interval = setInterval(() => {
  checkStatus()
}, 10000) // Change from 10000 (10s) to desired interval
```

### Add More Export Formats

Meshy supports additional formats. Update the API response handling to include:
- OBJ
- STL
- PLY

## Monitoring & Analytics

### Track Usage

Monitor in Supabase:

```sql
-- Total 3D models generated
SELECT COUNT(*) FROM models_3d;

-- Success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM models_3d
GROUP BY status;

-- Average processing time
SELECT 
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) / 60 as avg_minutes
FROM models_3d
WHERE status = 'SUCCEEDED';
```

### Cost Tracking

```sql
-- Estimate monthly cost (assuming $0.10 per model)
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as models,
  COUNT(*) * 0.10 as estimated_cost
FROM models_3d
GROUP BY month
ORDER BY month DESC;
```

## Security

### API Key Protection

✅ **Server-side only** - Meshy API key never exposed to client  
✅ **Environment variables** - Stored securely  
✅ **RLS policies** - Users can only access their own models  
✅ **Authentication required** - All endpoints check user session  

### Rate Limiting

Consider adding rate limiting:

```typescript
// Example: Limit to 10 3D generations per hour per user
const { count } = await supabase
  .from('models_3d')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 3600000).toISOString())

if (count >= 10) {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Try again later.' },
    { status: 429 }
  )
}
```

## Future Enhancements

Potential features to add:

1. **Batch Processing**
   - Generate 3D models for multiple images
   - Queue system for processing

2. **Quality Selection**
   - Let users choose preview vs refine
   - Show cost/time estimates

3. **Model Editing**
   - Adjust scale, rotation
   - Apply textures
   - Modify materials

4. **AR Preview**
   - View models in AR on mobile
   - Use USDZ for iOS AR Quick Look

5. **Export Options**
   - Combine multiple models
   - Create collections
   - Share publicly

## Resources

- [Meshy API Documentation](https://docs.meshy.ai)
- [Three.js Documentation](https://threejs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [GLB Format Spec](https://www.khronos.org/gltf/)

## Support

For issues:
- **Meshy API**: support@meshy.ai
- **3D Viewer**: Check Three.js/React Three Fiber docs
- **Database**: Review Supabase logs

---

Happy 3D modeling! 🎨 → 🎲 → 🎮

