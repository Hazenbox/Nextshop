/*
  # Transactions Schema Setup

  1. New Tables
    - `transactions`
      - Stores transaction records (income/expense)
      - Tracks amount, date, payment mode, etc.
      - Links to auth.users for ownership
    - `transaction_items`
      - Links transactions to inventory items
      - Tracks quantity for each item
    - `transaction_attachments`
      - Stores files/documents related to transactions
      - Links to transactions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their own data

  3. Changes
    - Drop existing transaction-related tables
    - Create new tables with proper relationships
    - Add necessary indexes for performance
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transaction_attachments CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  notes text,
  date date NOT NULL,
  payment_mode text NOT NULL,
  reference text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create transaction_items table
CREATE TABLE transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(transaction_id, item_id)
);

-- Create transaction_attachments table
CREATE TABLE transaction_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions ON DELETE CASCADE,
  url text NOT NULL,
  filename text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create policies for transaction_items
CREATE POLICY "Users can view own transaction items"
  ON transaction_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transaction items"
  ON transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transaction items"
  ON transaction_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

-- Create policies for transaction_attachments
CREATE POLICY "Users can view own transaction attachments"
  ON transaction_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_attachments.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transaction attachments"
  ON transaction_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_attachments.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transaction attachments"
  ON transaction_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_attachments.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX transactions_owner_id_idx ON transactions(owner_id);
CREATE INDEX transactions_date_idx ON transactions(date);
CREATE INDEX transactions_type_idx ON transactions(type);
CREATE INDEX transaction_items_transaction_id_idx ON transaction_items(transaction_id);
CREATE INDEX transaction_items_item_id_idx ON transaction_items(item_id);
CREATE INDEX transaction_attachments_transaction_id_idx ON transaction_attachments(transaction_id);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();