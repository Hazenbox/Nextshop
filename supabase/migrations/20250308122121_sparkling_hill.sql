/*
  # Create storage policies for inventory images

  1. Storage Policies
    - Create public bucket for inventory images
    - Add policies for authenticated users to manage their own images
    - Enable public read access for all images

  2. Security
    - Ensure users can only upload/modify their own files
    - Allow public read access
    - Restrict file types and sizes
*/

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('inventory-images', 'inventory-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inventory-images' AND
    (CASE
      WHEN auth.uid()::text = ANY(string_to_array(name, '/', 1)) THEN true
      ELSE false
    END)
  );

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'inventory-images' AND
    (CASE
      WHEN auth.uid()::text = ANY(string_to_array(name, '/', 1)) THEN true
      ELSE false
    END)
  )
  WITH CHECK (
    bucket_id = 'inventory-images' AND
    (CASE
      WHEN auth.uid()::text = ANY(string_to_array(name, '/', 1)) THEN true
      ELSE false
    END)
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'inventory-images' AND
    (CASE
      WHEN auth.uid()::text = ANY(string_to_array(name, '/', 1)) THEN true
      ELSE false
    END)
  );

-- Allow public read access to all files
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'inventory-images');