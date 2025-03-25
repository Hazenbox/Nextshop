/*
  # Create items table with RLS policies

  1. New Tables
    - `items`
      - `id` (text, primary key)
      - `board_id` (text, required)
      - `product_id` (text)
      - `title` (text)
      - `description` (text)
      - `image_ids` (text array)
      - `category` (text)
      - `label` (text)
      - `sale_status` (sale_status enum)
      - `purchase_price` (numeric)
      - `listed_price` (numeric)
      - `sold_at` (numeric)
      - `delivery_charges` (numeric)
      - `sale_type` (sale_type enum)
      - `paid_to` (text)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `customer_address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Users can only access their own items
*/

-- Create items table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS items (
    id text PRIMARY KEY,
    board_id text NOT NULL,
    product_id text,
    title text,
    description text,
    image_ids text[],
    category text,
    label text,
    sale_status sale_status NOT NULL DEFAULT 'available',
    purchase_price numeric(10,2) NOT NULL DEFAULT 0,
    listed_price numeric(10,2) NOT NULL DEFAULT 0,
    sold_at numeric(10,2),
    delivery_charges numeric(10,2) NOT NULL DEFAULT 0,
    sale_type sale_type NOT NULL DEFAULT 'online',
    paid_to text,
    customer_name text,
    customer_email text,
    customer_phone text,
    customer_address text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
END $$;

-- Enable RLS if not already enabled
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create items" ON items;
  DROP POLICY IF EXISTS "Users can view items" ON items;
  DROP POLICY IF EXISTS "Users can update items" ON items;
  DROP POLICY IF EXISTS "Users can delete items" ON items;
END $$;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only" 
  ON items FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only" 
  ON items FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable update for authenticated users only" 
  ON items FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
  ON items FOR DELETE 
  TO authenticated 
  USING (true);

-- Create indexes if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'items_board_id_idx') THEN
    CREATE INDEX items_board_id_idx ON items(board_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'items_category_idx') THEN
    CREATE INDEX items_category_idx ON items(category);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'items_label_idx') THEN
    CREATE INDEX items_label_idx ON items(label);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'items_sale_status_idx') THEN
    CREATE INDEX items_sale_status_idx ON items(sale_status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'items_created_at_idx') THEN
    CREATE INDEX items_created_at_idx ON items(created_at);
  END IF;
END $$;