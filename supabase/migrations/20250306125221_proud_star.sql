/*
  # Create inventory system tables

  1. New Tables
    - `inventory_items`
      - Core inventory item data
      - Tracks products, expenses, and income
    - `custom_fields`
      - Configurable fields for items
      - Supports different data types
    - `field_values`
      - Stores values for custom fields
      - Links to items and field definitions

  2. Enums
    - `field_type`: Defines allowed custom field types

  3. Security
    - Enable RLS on all tables
    - Public access policies for CRUD operations

  4. Indexes
    - Optimized queries for board_id, item relationships
*/

-- Create enum for field types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'field_type') THEN
    CREATE TYPE field_type AS ENUM ('text', 'number', 'date', 'boolean');
  END IF;
END $$;

-- Create inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id text NOT NULL,
  image_id text NOT NULL,
  name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 0,
  unit_price decimal(10,2) NOT NULL DEFAULT 0.00,
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create custom fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id text NOT NULL,
  name text NOT NULL,
  field_type field_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create field values table
CREATE TABLE IF NOT EXISTS field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  field_id uuid REFERENCES custom_fields(id) ON DELETE CASCADE,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_values ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public access for inventory items" ON inventory_items;
  DROP POLICY IF EXISTS "Public access for custom fields" ON custom_fields;
  DROP POLICY IF EXISTS "Public access for field values" ON field_values;
END $$;

-- Create policies
CREATE POLICY "Public access for inventory items"
  ON inventory_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access for custom fields"
  ON custom_fields
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access for field values"
  ON field_values
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS inventory_items_board_id_idx ON inventory_items(board_id);
CREATE INDEX IF NOT EXISTS custom_fields_board_id_idx ON custom_fields(board_id);
CREATE INDEX IF NOT EXISTS field_values_item_id_idx ON field_values(item_id);
CREATE INDEX IF NOT EXISTS field_values_field_id_idx ON field_values(field_id);