-- ============================================
-- FIX STORAGE POLICIES FOR 3D MODELS
-- ============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create new storage policies that work for both images and 3D models
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view all files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'generated-images');

CREATE POLICY "Users can update their own files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

