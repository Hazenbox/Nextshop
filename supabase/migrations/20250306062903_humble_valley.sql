/*
  # Create images table for mood board

  1. New Tables
    - `images`
      - `id` (text, primary key)
      - `url` (text)
      - `description` (text, nullable)
      - `width` (integer, nullable)
      - `height` (integer, nullable)
      - `storage_path` (text)
      - `board_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `images` table
    - Add policies for public access (since we're using board IDs and edit keys for security)
*/

CREATE TABLE IF NOT EXISTS images (
  id text PRIMARY KEY,
  url text NOT NULL,
  description text,
  width integer,
  height integer,
  storage_path text NOT NULL,
  board_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Allow public access since we're using board IDs and edit keys for security
CREATE POLICY "Allow public read access"
  ON images
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert"
  ON images
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update"
  ON images
  FOR UPDATE
  TO public
  USING (true);

-- Allow public delete access
CREATE POLICY "Allow public delete"
  ON images
  FOR DELETE
  TO public
  USING (true);