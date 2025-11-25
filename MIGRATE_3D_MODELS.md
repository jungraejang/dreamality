# Migrate Existing 3D Models to Supabase Storage

## Problem

Your existing 3D models have Meshy URLs in the database:
```
https://assets.meshy.ai/.../model.glb?Expires=...&Signature=...
```

These URLs:
- ❌ Expire after ~30 days
- ❌ Have CORS issues in browser
- ❌ Depend on Meshy's CDN

## Solution

We need to migrate them to your Supabase storage for permanent URLs.

## Option 1: Generate New Models (Recommended)

The easiest way is to generate new 3D models. They will automatically be saved to your Supabase storage.

**Steps:**
1. Go to your gallery
2. Click "Generate 3D" on any image
3. Wait for completion
4. The new model will be stored in YOUR Supabase storage

**New models will have URLs like:**
```
https://your-project.supabase.co/storage/v1/object/public/generated-images/user-id/task-id.glb
```

## Option 2: Manual Migration (For Existing Models)

If you want to keep existing models, you'll need to manually trigger the storage process.

### Check Current Status

1. Go to `/models-3d`
2. Look at your models
3. Check the terminal logs when you click "Check Status"
4. You should see:
   ```
   🔽 Downloading GLB from Meshy: ...
   📥 GLB download response status: 200
   📦 GLB file size: ... bytes
   ⬆️  Uploading to Supabase: ...
   ✅ GLB saved to Supabase: ...
   🎉 Now using YOUR storage URL instead of Meshy!
   ```

### If Upload Fails

Common issues:

**Issue 1: Meshy URL Expired**
- Solution: The model is too old, generate a new one

**Issue 2: Storage Bucket Not Set Up**
- Solution: Make sure `generated-images` bucket exists
- Check: Supabase Dashboard → Storage → generated-images

**Issue 3: Storage Quota Full**
- Solution: Delete old files or upgrade plan
- Check: Supabase Dashboard → Storage → Usage

## Option 3: Delete Old Models

If you don't need the old models:

```sql
-- Delete models with Meshy URLs
DELETE FROM models_3d
WHERE glb_url LIKE 'https://assets.meshy.ai%';
```

Then generate fresh models that will automatically use your storage.

## Verify Migration

### Check Database

```sql
-- See which models are using Supabase storage
SELECT 
  id,
  CASE 
    WHEN glb_url LIKE '%supabase%' THEN 'Supabase ✅'
    WHEN glb_url LIKE '%meshy%' THEN 'Meshy ⚠️'
    ELSE 'Unknown'
  END as storage_location,
  glb_url
FROM models_3d
WHERE status = 'SUCCEEDED';
```

### Check Storage

1. Go to Supabase Dashboard
2. Navigate to Storage → `generated-images`
3. Look for `.glb` files in your user folder
4. They should be there!

## What Happens Next

**For NEW models (after this update):**
1. ✅ Meshy generates the model
2. ✅ App downloads it automatically
3. ✅ App uploads to YOUR Supabase storage
4. ✅ Database stores YOUR permanent URL
5. ✅ Preview works perfectly!

**For OLD models (before this update):**
- ⚠️ Still using Meshy URLs
- ⚠️ May expire or have CORS issues
- 💡 Best to regenerate them

## Testing

1. **Generate a new image**
2. **Click "Generate 3D Model"**
3. **Wait for completion**
4. **Check the terminal logs** - you should see:
   ```
   ✅ GLB saved to Supabase: https://your-project.supabase.co/...
   ```
5. **Check your database** - `glb_url` should be a Supabase URL
6. **Click "Preview"** - should work without CORS errors!

## Troubleshooting

### Still seeing Meshy URLs?

**Check terminal logs when status updates:**
- If you see "✅ GLB saved to Supabase" → Good!
- If you see "❌ Failed to upload" → Check error message
- If you see nothing → The model was created before the update

**Solution:** Generate a new 3D model to test the new storage system.

### Preview still not working?

1. **Check the URL in database:**
   ```sql
   SELECT glb_url FROM models_3d ORDER BY created_at DESC LIMIT 1;
   ```

2. **If it's a Meshy URL:**
   - The storage didn't work
   - Check terminal logs for errors
   - Try generating a new model

3. **If it's a Supabase URL:**
   - The storage worked!
   - Preview should work
   - If not, check browser console for errors

## Summary

- ✅ **New models**: Automatically stored in your Supabase
- ⚠️ **Old models**: Still on Meshy, may have issues
- 💡 **Best practice**: Generate new models for important items

---

**Next Steps:**
1. Generate a new 3D model to test
2. Check terminal logs for storage confirmation
3. Verify preview works with new model
4. Delete or regenerate old models as needed

