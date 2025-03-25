/*
  # Create images table

  1. New Tables
    - `images`
      - `id` (text, primary key)
      - `board_id` (text)
      - `url` (text)
      - `description` (text, nullable)
      - `storage_path` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `images` table
    - Add policies for authenticated users to manage their own images
*/

CREATE TABLE IF NOT EXISTS images (
  id text PRIMARY KEY,
  board_id text NOT NULL,
  url text NOT NULL,
  description text,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own images
CREATE POLICY "Users can read own images"
  ON images
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = board_id);

-- Allow authenticated users to insert their own images
CREATE POLICY "Users can insert own images"
  ON images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = board_id);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own images"
  ON images
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = board_id)
  WITH CHECK (auth.uid()::text = board_id);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
  ON images
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = board_id);