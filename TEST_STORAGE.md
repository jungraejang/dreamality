# Test Storage Upload

## Step 1: Verify Storage Policies

Run this in Supabase SQL Editor to check your policies:

```sql
-- Check storage policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
```

You should see policies like:
- `Users can upload their own files`
- `Users can view their own files`
- `Public can view all files`
- `Users can update their own files`
- `Users can delete their own files`

## Step 2: Check Current Model URLs

```sql
-- See what URLs are in your database
SELECT 
  id,
  status,
  CASE 
    WHEN glb_url LIKE '%supabase%' THEN '✅ Supabase'
    WHEN glb_url LIKE '%meshy%' THEN '⚠️ Meshy'
    ELSE '❓ Unknown'
  END as url_type,
  LEFT(glb_url, 50) as url_preview,
  created_at
FROM models_3d
ORDER BY created_at DESC;
```

## Step 3: Test the Upload Process

1. **Go to `/models-3d`**
2. **Click "Check Status"** on any SUCCEEDED model
3. **Watch your terminal** - you should see:

```
📋 Current model status: SUCCEEDED
🔗 Current GLB URL: https://assets.meshy.ai/...

🔽 Downloading GLB from Meshy: ...
📥 GLB download response status: 200
📦 GLB file size: XXXXX bytes
⬆️  Uploading to Supabase: user-id/task-id.glb
✅ GLB saved to Supabase: https://your-project.supabase.co/...
🎉 Now using YOUR storage URL instead of Meshy!

💾 Updating database with: { glb_url: 'https://your-project.supabase.co/...' }
✅ Database updated successfully
🔗 New GLB URL in database: https://your-project.supabase.co/...
```

## Step 4: Verify Storage

1. Go to **Supabase Dashboard** → **Storage** → `generated-images`
2. Navigate to your user folder
3. You should see `.glb` files there!

## Common Issues

### Issue 1: Still seeing RLS error

```
❌ Failed to upload GLB to Supabase: Error [StorageApiError]: 
new row violates row-level security policy
```

**Solution:**
- Make sure you ran `fix-storage-policies.sql`
- Check policies exist with the query in Step 1
- Restart your dev server

### Issue 2: Download fails

```
❌ Failed to download GLB from Meshy, status: 403
```

**Solution:**
- The Meshy URL has expired
- Generate a new 3D model
- Old models can't be migrated if URLs expired

### Issue 3: Database not updating

```
❌ Database update error: ...
```

**Solution:**
- Check RLS policies on `models_3d` table
- Verify user owns the model
- Check Supabase logs

### Issue 4: No logs appearing

**Solution:**
- Make sure dev server is running
- Check the terminal where `npm run dev` is running
- Try clicking "Check Status" again

## Expected Result

After successful upload:

1. **Database URL changes from:**
   ```
   https://assets.meshy.ai/.../model.glb?Expires=...
   ```

2. **To:**
   ```
   https://your-project.supabase.co/storage/v1/object/public/generated-images/user-id/task-id.glb
   ```

3. **Preview works!** No more CORS errors ✅

## Quick Fix Script

If nothing is working, run this complete reset:

```sql
-- 1. Drop old policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- 2. Create new policies
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view all files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-images');

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Verify policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Test with New Model

The easiest way to test:

1. **Generate a new image**
2. **Click "Generate 3D Model"**
3. **Wait for completion**
4. **The new model will automatically use YOUR storage**
5. **Preview will work!**

This bypasses any issues with old models and tests the full flow.

---

**Next:** After running the fixes, click "Check Status" and watch the terminal logs!

