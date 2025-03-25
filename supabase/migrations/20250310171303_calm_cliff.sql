/*
  # Transaction System Schema

  1. New Tables
    - `transactions`: Stores transaction records
      - `id` (uuid, primary key)
      - `type` (text, check: income/expense)
      - `amount` (numeric)
      - `notes` (text)
      - `date` (date)
      - `payment_mode` (text)
      - `reference` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transaction_items`: Links transactions to inventory items
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, foreign key)
      - `item_id` (uuid, foreign key)
      - `quantity` (integer)
      - `created_at` (timestamptz)
    
    - `transaction_attachments`: Stores transaction attachments
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, foreign key)
      - `url` (text)
      - `filename` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

DO $$ BEGIN
  -- Create transactions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    amount numeric(10,2) NOT NULL CHECK (amount >= 0),
    notes text,
    date date NOT NULL,
    payment_mode text NOT NULL,
    reference text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Create transaction_items table if it doesn't exist
  CREATE TABLE IF NOT EXISTS transaction_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    created_at timestamptz DEFAULT now()
  );

  -- Create transaction_attachments table if it doesn't exist
  CREATE TABLE IF NOT EXISTS transaction_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    url text NOT NULL,
    filename text NOT NULL,
    created_at timestamptz DEFAULT now()
  );

  -- Enable RLS
  ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
  DROP POLICY IF EXISTS "Users can manage their own transaction items" ON transaction_items;
  DROP POLICY IF EXISTS "Users can manage their own transaction attachments" ON transaction_attachments;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
  CREATE INDEX IF NOT EXISTS transaction_items_transaction_id_idx ON transaction_items(transaction_id);
  CREATE INDEX IF NOT EXISTS transaction_items_item_id_idx ON transaction_items(item_id);
  CREATE INDEX IF NOT EXISTS transaction_attachments_transaction_id_idx ON transaction_attachments(transaction_id);

END $$;

-- Create policies for transactions
CREATE POLICY "Users can manage their own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for transaction_items
CREATE POLICY "Users can manage their own transaction items"
  ON transaction_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for transaction_attachments
CREATE POLICY "Users can manage their own transaction attachments"
  ON transaction_attachments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);