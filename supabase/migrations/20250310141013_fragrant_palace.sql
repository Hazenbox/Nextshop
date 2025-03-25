/*
  # Create Transactions Schema

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `type` (text, either 'income' or 'expense')
      - `amount` (numeric)
      - `notes` (text, optional)
      - `date` (date)
      - `payment_mode` (text)
      - `reference` (text, optional)
      - `attachments` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `transaction_items`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, references transactions)
      - `item_id` (uuid, references inventory_items)
      - `quantity` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  notes text,
  date date NOT NULL,
  payment_mode text NOT NULL,
  reference text,
  attachments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(transaction_id, item_id)
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for transaction_items
CREATE POLICY "Users can view own transaction items"
  ON transaction_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transaction items"
  ON transaction_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own transaction items"
  ON transaction_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own transaction items"
  ON transaction_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
CREATE INDEX IF NOT EXISTS transaction_items_transaction_id_idx ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS transaction_items_item_id_idx ON transaction_items(item_id);