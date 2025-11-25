# Storage Architecture Explained

## How Files Are Stored in Dreamality

### Images (2D)

**When you generate an image:**

1. OpenAI DALL-E generates image → Returns temporary URL
2. App downloads the image from OpenAI
3. App uploads to Supabase Storage: `generated-images/{user_id}/{timestamp}.png`
4. Permanent URL saved to database: `images` table

**Result:** ✅ You own the image files forever

**Storage Location:**
```
Supabase Storage Bucket: generated-images
├── {user_id_1}/
│   ├── 1234567890.png  (your images)
│   ├── 1234567891.png
│   └── 1234567892.glb  (your 3D models)
└── {user_id_2}/
    └── ...
```

### 3D Models

**When you generate a 3D model:**

1. Meshy API generates 3D model → Returns signed URL (expires in ~30 days)
2. When status check finds model is complete:
   - App downloads GLB file from Meshy's CDN
   - App uploads to Supabase Storage: `generated-images/{user_id}/{task_id}.glb`
   - Permanent URL saved to database: `models_3d` table
3. Original Meshy URLs are replaced with your Supabase URLs

**Result:** ✅ You own the 3D model files forever

## URL Comparison

### Before (Meshy URLs - Temporary)
```
https://assets.meshy.ai/.../model.glb?Expires=1764363215&Signature=...
                                      ↑ Expires in ~30 days
```

### After (Supabase URLs - Permanent)
```
https://your-project.supabase.co/storage/v1/object/public/generated-images/user-id/task-id.glb
                                                                            ↑ Never expires
```

## Storage Costs

### Supabase Free Tier
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month

### Typical File Sizes
- **2D Image (PNG)**: ~1-2 MB each
- **3D Model (GLB)**: ~5-10 MB each

### Example Capacity
With 1 GB storage:
- ~500-1000 images, OR
- ~100-200 3D models, OR
- Mix of both

## Benefits of Storing in Supabase

### 1. Permanent URLs
- ✅ Never expire
- ✅ No signature required
- ✅ Direct access anytime

### 2. Full Ownership
- ✅ You control the files
- ✅ Independent of third-party CDNs
- ✅ Can migrate anytime

### 3. Backup & Recovery
- ✅ Files backed up by Supabase
- ✅ Can download all files
- ✅ Disaster recovery possible

### 4. Privacy & Security
- ✅ Row Level Security (RLS)
- ✅ Only you can access your files
- ✅ Secure by default

## How It Works Technically

### Image Generation Flow
```
User → Generate Image
  ↓
OpenAI DALL-E (temporary URL)
  ↓
Download to server
  ↓
Upload to Supabase Storage
  ↓
Save permanent URL to database
  ↓
User sees image (from your storage)
```

### 3D Model Generation Flow
```
User → Generate 3D
  ↓
Meshy API starts task
  ↓
Wait 2-3 minutes (polling)
  ↓
Meshy returns signed URLs
  ↓
Download GLB from Meshy
  ↓
Upload to Supabase Storage
  ↓
Save permanent URL to database
  ↓
User downloads (from your storage)
```

## Storage Bucket Structure

```
generated-images/
├── user-abc-123/
│   ├── 1732567890123.png          (Image from Nov 25)
│   ├── 1732567891456.png          (Image from Nov 25)
│   ├── 019abcc8-task-id.glb       (3D model)
│   └── 019abcc9-task-id.glb       (3D model)
└── user-def-456/
    └── ...
```

## Checking Your Storage

### Via Supabase Dashboard

1. Go to **Storage** → `generated-images`
2. Browse folders by user ID
3. See all your files

### Via SQL

```sql
-- Check total storage used
SELECT 
  pg_size_pretty(sum(metadata->>'size')::bigint) as total_size,
  count(*) as file_count
FROM storage.objects
WHERE bucket_id = 'generated-images';

-- Check storage per user
SELECT 
  (metadata->>'owner')::uuid as user_id,
  count(*) as files,
  pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size
FROM storage.objects
WHERE bucket_id = 'generated-images'
GROUP BY user_id;
```

## Monitoring Storage

### Check Your Usage

```sql
-- Images only
SELECT count(*) as image_count
FROM images;

-- 3D models only
SELECT count(*) as model_count
FROM models_3d
WHERE status = 'SUCCEEDED';

-- Estimate storage used
SELECT 
  (SELECT count(*) FROM images) * 1.5 as images_mb,
  (SELECT count(*) FROM models_3d WHERE status = 'SUCCEEDED') * 7.5 as models_mb,
  (SELECT count(*) FROM images) * 1.5 + 
  (SELECT count(*) FROM models_3d WHERE status = 'SUCCEEDED') * 7.5 as total_mb;
```

## Cleanup Options

If you need to free up space:

### Delete Old Images
```sql
-- Delete images older than 30 days
DELETE FROM images
WHERE created_at < NOW() - INTERVAL '30 days';
```

### Delete Failed 3D Models
```sql
-- Delete failed model records
DELETE FROM models_3d
WHERE status = 'FAILED';
```

### Manual Cleanup via Dashboard
1. Go to Storage → `generated-images`
2. Select files to delete
3. Click Delete

## Upgrading Storage

If you need more space:

### Supabase Pro Plan
- **Storage**: 100 GB
- **Bandwidth**: 200 GB/month
- **Cost**: ~$25/month

### Calculate Your Needs
```
Images per month: 100
3D models per month: 20

Monthly storage:
= (100 images × 1.5 MB) + (20 models × 7.5 MB)
= 150 MB + 150 MB
= 300 MB/month

Annual storage:
= 300 MB × 12 months
= 3.6 GB/year
```

## Best Practices

### 1. Regular Monitoring
- Check storage usage monthly
- Delete failed/test generations
- Archive old projects

### 2. Optimize Files
- Images are already optimized (PNG)
- GLB files are compressed by Meshy
- No additional optimization needed

### 3. Backup Strategy
- Supabase handles backups automatically
- Download important files locally
- Consider periodic exports

## FAQ

### Q: What happens if I delete from database?
**A:** Files remain in storage. Delete from both database AND storage if needed.

### Q: Can I download all my files?
**A:** Yes! Use Supabase CLI or dashboard to bulk download.

### Q: Do URLs ever expire?
**A:** No! Supabase URLs are permanent (unlike Meshy's signed URLs).

### Q: What if I run out of storage?
**A:** Upgrade to Pro plan or delete old files you don't need.

### Q: Are files backed up?
**A:** Yes, Supabase automatically backs up your data.

---

**Summary:** All your images and 3D models are permanently stored in your Supabase Storage with URLs that never expire! 🎨💾

