/*
  # Update Transactions Schema

  1. Drop existing tables
    - Drop transaction_attachments
    - Drop transaction_items
    - Drop transactions

  2. Create new tables
    - transactions
    - transaction_items
    - transaction_attachments

  3. Add indexes and policies
    - Enable RLS
    - Add policies for authenticated users
    - Create necessary indexes
*/

-- First drop existing tables in correct order
DROP TABLE IF EXISTS transaction_attachments;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  notes text,
  date date NOT NULL,
  payment_mode text NOT NULL,
  reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Create transaction_attachments table
CREATE TABLE transaction_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  url text NOT NULL,
  filename text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
CREATE INDEX IF NOT EXISTS transaction_items_transaction_id_idx ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS transaction_items_item_id_idx ON transaction_items(item_id);
CREATE INDEX IF NOT EXISTS transaction_attachments_transaction_id_idx ON transaction_attachments(transaction_id);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for transaction_items
CREATE POLICY "Users can view own transaction items"
  ON transaction_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_items.transaction_id
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create transaction items"
  ON transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_items.transaction_id
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own transaction items"
  ON transaction_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_items.transaction_id
    AND transactions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_items.transaction_id
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own transaction items"
  ON transaction_items FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_items.transaction_id
    AND transactions.user_id = auth.uid()
  ));

-- Create policies for transaction_attachments
CREATE POLICY "Users can view own transaction attachments"
  ON transaction_attachments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_attachments.transaction_id
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create transaction attachments"
  ON transaction_attachments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_attachments.transaction_id
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own transaction attachments"
  ON transaction_attachments FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_attachments.transaction_id
    AND transactions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_attachments.transaction_id
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own transaction attachments"
  ON transaction_attachments FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_attachments.transaction_id
    AND transactions.user_id = auth.uid()
  ));