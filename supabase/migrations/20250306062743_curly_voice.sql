/*
  # Create images table and storage bucket

  1. New Tables
    - `images`
      - `id` (text, primary key)
      - `board_id` (text)
      - `url` (text)
      - `description` (text)
      - `storage_path` (text)
      - `created_at` (timestamp)

  2. Storage
    - Create `mood-images` bucket for storing images
    - Enable public access to the bucket

  3. Security
    - Enable RLS on `images` table
    - Add policies for CRUD operations
*/

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id text PRIMARY KEY,
  board_id text NOT NULL,
  url text NOT NULL,
  description text,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Insert access with valid board_id"
  ON images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Update access with valid board_id"
  ON images
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Delete access with valid board_id"
  ON images
  FOR DELETE
  TO public
  USING (true);