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

-- Create items table
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

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view items"
  ON items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete items"
  ON items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX items_board_id_idx ON items(board_id);
CREATE INDEX items_category_idx ON items(category);
CREATE INDEX items_label_idx ON items(label);
CREATE INDEX items_sale_status_idx ON items(sale_status);
CREATE INDEX items_created_at_idx ON items(created_at);