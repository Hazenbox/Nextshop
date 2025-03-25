/*
  # Storage Setup

  1. Buckets
    - inventory-images
      - Public access
      - 5MB file size limit
      - Image file types only

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create storage bucket
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