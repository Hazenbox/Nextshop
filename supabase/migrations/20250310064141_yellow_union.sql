/*
  # Initial Database Setup

  1. Types
    - sale_status: Enum for item sale status
    - sale_type: Enum for sale type

  2. Tables
    - profiles: User profiles with business details
    - items: Inventory items
    - images: Image metadata and storage paths
    - item_images: Many-to-many relationship between items and images

  3. Security
    - RLS policies for all tables
    - Storage bucket policies
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE sale_status AS ENUM ('available', 'pending', 'sold');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_type AS ENUM ('online', 'offline');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone text UNIQUE,
  phone_verified boolean DEFAULT false,
  business_name text,
  business_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id text NOT NULL,
  product_id text,
  title text,
  description text,
  category text,
  label text,
  sale_status sale_status DEFAULT 'available',
  purchase_price numeric(10,2) DEFAULT 0,
  listed_price numeric(10,2) DEFAULT 0,
  sold_at numeric(10,2),
  delivery_charges numeric(10,2) DEFAULT 0,
  sale_type sale_type DEFAULT 'online',
  paid_to text,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create images table
CREATE TABLE IF NOT EXISTS public.images (
  id text PRIMARY KEY,
  board_id text NOT NULL,
  url text NOT NULL,
  description text,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create item_images junction table
CREATE TABLE IF NOT EXISTS public.item_images (
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  image_id text REFERENCES public.images(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (item_id, image_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS items_board_id_idx ON public.items(board_id);
CREATE INDEX IF NOT EXISTS items_category_idx ON public.items(category);
CREATE INDEX IF NOT EXISTS items_sale_status_idx ON public.items(sale_status);
CREATE INDEX IF NOT EXISTS images_board_id_idx ON public.images(board_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own items" ON public.items;
DROP POLICY IF EXISTS "Users can create items" ON public.items;
DROP POLICY IF EXISTS "Users can update own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete own items" ON public.items;
DROP POLICY IF EXISTS "Users can view own images" ON public.images;
DROP POLICY IF EXISTS "Users can create images" ON public.images;
DROP POLICY IF EXISTS "Users can update own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete own images" ON public.images;
DROP POLICY IF EXISTS "Users can view own item_images" ON public.item_images;
DROP POLICY IF EXISTS "Users can create item_images" ON public.item_images;
DROP POLICY IF EXISTS "Users can delete own item_images" ON public.item_images;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Items policies
CREATE POLICY "Users can view own items"
  ON public.items
  FOR SELECT
  TO authenticated
  USING (board_id = auth.uid()::text);

CREATE POLICY "Users can create items"
  ON public.items
  FOR INSERT
  TO authenticated
  WITH CHECK (board_id = auth.uid()::text);

CREATE POLICY "Users can update own items"
  ON public.items
  FOR UPDATE
  TO authenticated
  USING (board_id = auth.uid()::text)
  WITH CHECK (board_id = auth.uid()::text);

CREATE POLICY "Users can delete own items"
  ON public.items
  FOR DELETE
  TO authenticated
  USING (board_id = auth.uid()::text);

-- Images policies
CREATE POLICY "Users can view own images"
  ON public.images
  FOR SELECT
  TO authenticated
  USING (board_id = auth.uid()::text);

CREATE POLICY "Users can create images"
  ON public.images
  FOR INSERT
  TO authenticated
  WITH CHECK (board_id = auth.uid()::text);

CREATE POLICY "Users can update own images"
  ON public.images
  FOR UPDATE
  TO authenticated
  USING (board_id = auth.uid()::text)
  WITH CHECK (board_id = auth.uid()::text);

CREATE POLICY "Users can delete own images"
  ON public.images
  FOR DELETE
  TO authenticated
  USING (board_id = auth.uid()::text);

-- Item_images policies
CREATE POLICY "Users can view own item_images"
  ON public.item_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE id = item_id AND board_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create item_images"
  ON public.item_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE id = item_id AND board_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own item_images"
  ON public.item_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE id = item_id AND board_id = auth.uid()::text
    )
  );

-- Create storage bucket
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('inventory-images', 'inventory-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Storage bucket policies
CREATE POLICY "Users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inventory-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

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

CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'inventory-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'inventory-images');

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.items;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();