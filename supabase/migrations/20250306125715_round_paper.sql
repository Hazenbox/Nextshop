/*
  # Inventory Management System Schema

  1. New Tables
    - `items`: Stores inventory items with their details
      - `id` (uuid, primary key)
      - `board_id` (text, for board association)
      - Various item details (category, price, etc.)
    - `images`: Stores image metadata
      - `id` (text, primary key)
      - `board_id` (text, for board association)
      - Image details (url, description, etc.)
    - `item_images`: Junction table for items-images relationship
      - Links items and images with text IDs

  2. Security
    - RLS enabled on all tables
    - Public access policies for demonstration
*/

-- Create enums safely
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_status') THEN
    CREATE TYPE sale_status AS ENUM ('available', 'pending', 'sold');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_type') THEN
    CREATE TYPE sale_type AS ENUM ('online', 'offline');
  END IF;
END $$;

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id text NOT NULL,
  category text,
  label text,
  sale_status sale_status NOT NULL DEFAULT 'available',
  purchase_price numeric(10,2) DEFAULT 0,
  listed_price numeric(10,2) DEFAULT 0,
  sold_at numeric(10,2),
  delivery_charges numeric(10,2) DEFAULT 0,
  sale_type sale_type NOT NULL DEFAULT 'online',
  paid_to text,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create images table with text ID to match existing system
CREATE TABLE IF NOT EXISTS images (
  id text PRIMARY KEY,
  board_id text NOT NULL,
  url text NOT NULL,
  description text,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create item_images junction table with text ID for images
CREATE TABLE IF NOT EXISTS item_images (
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  image_id text REFERENCES images(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (item_id, image_id)
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

-- Create policies for items
CREATE POLICY "Public access for items"
  ON items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for images
CREATE POLICY "Public access for images"
  ON images
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for item_images
CREATE POLICY "Public access for item_images"
  ON item_images
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS items_board_id_idx ON items(board_id);
CREATE INDEX IF NOT EXISTS images_board_id_idx ON images(board_id);
CREATE INDEX IF NOT EXISTS item_images_item_id_idx ON item_images(item_id);
CREATE INDEX IF NOT EXISTS item_images_image_id_idx ON item_images(image_id);