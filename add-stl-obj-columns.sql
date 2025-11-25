-- Add OBJ and STL URL columns to models_3d table
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS obj_url TEXT,
ADD COLUMN IF NOT EXISTS stl_url TEXT;

