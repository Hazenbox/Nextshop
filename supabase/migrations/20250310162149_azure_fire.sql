/*
  # Transaction Schema Setup

  1. New Tables
    - `transactions`
      - Stores transaction records
      - Tracks income and expenses
      - Links to items through transaction_items
    - `transaction_items`
      - Junction table linking transactions to inventory items
      - Tracks quantity for each item in a transaction
    - `transaction_attachments`
      - Stores files/documents related to transactions
      - Links to transactions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their own data

  3. Indexes
    - Add performance indexes for common queries
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
  DROP POLICY IF EXISTS "Users can manage their own transaction items" ON transaction_items;
  DROP POLICY IF EXISTS "Users can manage their own transaction attachments" ON transaction_attachments;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(transaction_id, item_id)
);

-- Create transaction_attachments table
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

-- Create policies for transactions
CREATE POLICY "Users can manage their own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create policies for transaction_items
CREATE POLICY "Users can manage their own transaction items"
  ON transaction_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
      AND t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

-- Create policies for transaction_attachments
CREATE POLICY "Users can manage their own transaction attachments"
  ON transaction_attachments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_attachments.transaction_id
      AND t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_attachments.transaction_id
      AND t.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS transactions_owner_id_idx ON transactions(owner_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
CREATE INDEX IF NOT EXISTS transaction_items_transaction_id_idx ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS transaction_items_item_id_idx ON transaction_items(item_id);
CREATE INDEX IF NOT EXISTS transaction_attachments_transaction_id_idx ON transaction_attachments(transaction_id);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();