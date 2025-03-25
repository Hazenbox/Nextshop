/*
  # Initial Schema Setup

  1. Tables
    - profiles
      - id (uuid, primary key, references auth.users)
      - phone (text, unique, nullable)
      - phone_verified (boolean, default false)
      - business_name (text, nullable)
      - business_type (text, nullable)
      - created_at (timestamptz, default now())
      - updated_at (timestamptz, default now())

    - items
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - board_id (text)
      - product_id (text, nullable)
      - title (text)
      - description (text, nullable)
      - category (text, nullable)
      - label (text, nullable)
      - sale_status (sale_status enum)
      - purchase_price (numeric(10,2))
      - listed_price (numeric(10,2))
      - sold_at (numeric(10,2), nullable)
      - delivery_charges (numeric(10,2))
      - sale_type (sale_type enum)
      - paid_to (text, nullable)
      - customer_name (text, nullable)
      - customer_email (text, nullable)
      - customer_phone (text, nullable)
      - customer_address (text, nullable)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enums if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_status') THEN
    CREATE TYPE sale_status AS ENUM ('available', 'pending', 'sold');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_type') THEN
    CREATE TYPE sale_type AS ENUM ('online', 'offline');
  END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone text UNIQUE,
  phone_verified boolean DEFAULT false,
  business_name text,
  business_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
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

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  board_id text NOT NULL,
  url text NOT NULL,
  description text,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create item_images table
CREATE TABLE IF NOT EXISTS item_images (
  item_id uuid REFERENCES items ON DELETE CASCADE,
  image_id text REFERENCES images ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (item_id, image_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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