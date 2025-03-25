/*
  # Create images table and policies

  1. New Tables
    - `images`
      - `id` (text, primary key)
      - `url` (text, not null)
      - `description` (text, nullable)
      - `width` (integer, nullable)
      - `height` (integer, nullable)
      - `storage_path` (text, not null)
      - `board_id` (text, not null)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `images` table
    - Add policies for:
      - Public read access
      - Public insert access
      - Public update access
      - Public delete access
*/

-- Create images table
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access" ON images;
  DROP POLICY IF EXISTS "Public insert access" ON images;
  DROP POLICY IF EXISTS "Public update access" ON images;
  DROP POLICY IF EXISTS "Public delete access" ON images;
END $$;

-- Create new policies
CREATE POLICY "Public read access"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access"
  ON images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON images
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public delete access"
  ON images
  FOR DELETE
  TO public
  USING (true);