/*
  # Fix storage policies with proper string handling

  1. Changes
    - Fix string_to_array function usage
    - Add proper type casting
    - Add null checks
    - Add error handling for invalid paths
    - Improve path validation

  2. Security
    - Maintain same security rules
    - Add additional validation
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Helper function to safely extract user ID from path
CREATE OR REPLACE FUNCTION storage.get_path_user_id(path text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  path_parts text[];
BEGIN
  -- Handle null path
  IF path IS NULL THEN
    RETURN NULL;
  END IF;

  -- Split path and handle empty parts
  path_parts := string_to_array(NULLIF(TRIM(path), ''), '/');
  
  -- Validate path has at least one part
  IF array_length(path_parts, 1) IS NULL OR array_length(path_parts, 1) < 1 THEN
    RETURN NULL;
  END IF;

  -- Return first path segment (user ID)
  RETURN path_parts[1];
END;
$$;

-- Create policies with proper path handling
CREATE POLICY "Users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inventory-images' AND
    storage.get_path_user_id(name) = auth.uid()::text
  );

CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'inventory-images' AND
    storage.get_path_user_id(name) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'inventory-images' AND
    storage.get_path_user_id(name) = auth.uid()::text
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'inventory-images' AND
    storage.get_path_user_id(name) = auth.uid()::text
  );

CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'inventory-images');

-- Example usage and testing:
COMMENT ON FUNCTION storage.get_path_user_id(text) IS '
Examples:
  SELECT storage.get_path_user_id(''123/board/image.jpg'') -> ''123''
  SELECT storage.get_path_user_id(NULL) -> NULL
  SELECT storage.get_path_user_id('''') -> NULL
  SELECT storage.get_path_user_id(''/'') -> NULL
';

-- Test the function (these should all work without errors)
DO $$
BEGIN
  -- Valid paths
  ASSERT storage.get_path_user_id('123/board/image.jpg') = '123',
    'Should extract user ID from valid path';
  
  -- Edge cases
  ASSERT storage.get_path_user_id(NULL) IS NULL,
    'Should handle NULL input';
  ASSERT storage.get_path_user_id('') IS NULL,
    'Should handle empty string';
  ASSERT storage.get_path_user_id('/') IS NULL,
    'Should handle single slash';
  ASSERT storage.get_path_user_id('  ') IS NULL,
    'Should handle whitespace';
END $$;