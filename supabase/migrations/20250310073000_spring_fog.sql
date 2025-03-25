/*
  # Storage Configuration

  1. Storage Setup
    - Create inventory-images bucket if it doesn't exist
    - Configure bucket settings:
      - 5MB file size limit
      - Allowed MIME types: jpeg, png, gif, webp
    - Enable public access

  2. Security
    - Add RLS policies for authenticated users to:
      - View their own images
      - Upload images to their own folder
      - Delete their own images
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'inventory-images',
  'inventory-images',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Set bucket configuration
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'inventory-images';

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can insert own images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create storage policies
CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'inventory-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can insert own images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'inventory-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'inventory-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'inventory-images' AND (storage.foldername(name))[1] = auth.uid()::text);