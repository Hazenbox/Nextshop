/*
  # Storage Setup Migration

  1. Storage Configuration
    - Creates inventory-images bucket
    - Configures public access and file limits
    - Sets up RLS policies for secure access

  2. Security
    - Enables RLS on storage.objects
    - Adds policies for authenticated users
    - Allows public read access
*/

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'inventory-images',
    'inventory-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
DO $$
BEGIN
  -- Upload policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload images'
  ) THEN
    CREATE POLICY "Users can upload images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'inventory-images' AND
        auth.uid()::text = (string_to_array(name, '/'))[1]
      );
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update own images'
  ) THEN
    CREATE POLICY "Users can update own images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'inventory-images' AND
        auth.uid()::text = (string_to_array(name, '/'))[1]
      )
      WITH CHECK (
        bucket_id = 'inventory-images' AND
        auth.uid()::text = (string_to_array(name, '/'))[1]
      );
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete own images'
  ) THEN
    CREATE POLICY "Users can delete own images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'inventory-images' AND
        auth.uid()::text = (string_to_array(name, '/'))[1]
      );
  END IF;

  -- Public read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'inventory-images');
  END IF;
END $$;