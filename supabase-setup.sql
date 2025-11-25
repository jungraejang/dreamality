-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 3D models table
CREATE TABLE IF NOT EXISTS models_3d (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  meshy_task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, SUCCEEDED, FAILED
  model_url TEXT,
  thumbnail_url TEXT,
  glb_url TEXT,
  fbx_url TEXT,
  usdz_url TEXT,
  obj_url TEXT,
  stl_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;

-- Create policies for images
CREATE POLICY "Users can view their own images"
  ON images
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
  ON images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for 3D models
CREATE POLICY "Users can view their own 3D models"
  ON models_3d
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 3D models"
  ON models_3d
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 3D models"
  ON models_3d
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own 3D models"
  ON models_3d
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
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

