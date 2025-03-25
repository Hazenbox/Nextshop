/*
  # Initial Schema Setup

  1. New Types
    - `sale_status`: ENUM ('available', 'pending', 'sold')
    - `sale_type`: ENUM ('online', 'offline')

  2. New Tables
    - `profiles`: User profiles with business details
    - `items`: Inventory items
    - `images`: Stored images
    - `item_images`: Many-to-many relationship between items and images

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enums if they don't exist
DO $$ BEGIN
  CREATE TYPE sale_status AS ENUM ('available', 'pending', 'sold');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_type AS ENUM ('online', 'offline');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone text UNIQUE,
  phone_verified boolean DEFAULT false,
  business_name text,
  business_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create items table if it doesn't exist
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  board_id text NOT NULL,
  product_id text,
  title text NOT NULL,
  description text,
  category text,
  label text,
  sale_status sale_status DEFAULT 'available' NOT NULL,
  purchase_price numeric(10,2) DEFAULT 0 NOT NULL,
  listed_price numeric(10,2) DEFAULT 0 NOT NULL,
  sold_at numeric(10,2),
  delivery_charges numeric(10,2) DEFAULT 0 NOT NULL,
  sale_type sale_type DEFAULT 'online' NOT NULL,
  paid_to text,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create images table if it doesn't exist
CREATE TABLE IF NOT EXISTS images (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  board_id text NOT NULL,
  url text NOT NULL,
  description text,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create item_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS item_images (
  item_id uuid REFERENCES items ON DELETE CASCADE,
  image_id text REFERENCES images ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (item_id, image_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items (user_id);
CREATE INDEX IF NOT EXISTS items_board_id_idx ON items (board_id);
CREATE INDEX IF NOT EXISTS items_category_idx ON items (category);
CREATE INDEX IF NOT EXISTS items_sale_status_idx ON items (sale_status);
CREATE INDEX IF NOT EXISTS images_user_id_idx ON images (user_id);
CREATE INDEX IF NOT EXISTS images_board_id_idx ON images (board_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for items
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for images
CREATE POLICY "Users can view own images"
  ON images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for item_images
CREATE POLICY "Users can view own item_images"
  ON item_images FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM items WHERE items.id = item_images.item_id AND items.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own item_images"
  ON item_images FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM items WHERE items.id = item_images.item_id AND items.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own item_images"
  ON item_images FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM items WHERE items.id = item_images.item_id AND items.user_id = auth.uid()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();