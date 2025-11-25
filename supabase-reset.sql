-- ============================================
-- RESET SCRIPT - Run this to clean everything
-- ============================================

-- Drop existing policies for storage
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Drop existing policies for tables
DROP POLICY IF EXISTS "Users can view their own images" ON images;
DROP POLICY IF EXISTS "Users can insert their own images" ON images;
DROP POLICY IF EXISTS "Users can delete their own images" ON images;

DROP POLICY IF EXISTS "Users can view their own 3D models" ON models_3d;
DROP POLICY IF EXISTS "Users can insert their own 3D models" ON models_3d;
DROP POLICY IF EXISTS "Users can update their own 3D models" ON models_3d;
DROP POLICY IF EXISTS "Users can delete their own 3D models" ON models_3d;

-- Drop tables (this will delete all data!)
DROP TABLE IF EXISTS models_3d CASCADE;
DROP TABLE IF EXISTS images CASCADE;

-- Delete storage bucket (optional - uncomment if you want to delete stored images too)
-- DELETE FROM storage.buckets WHERE id = 'generated-images';

-- ============================================
-- Now run supabase-setup.sql
-- ============================================

