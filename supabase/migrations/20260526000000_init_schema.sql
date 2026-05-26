-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. accounts
CREATE TABLE accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    parent_account_id uuid references accounts(id),
    name text not null,
    type text not null check (type in ('depository', 'credit', 'loan', 'investment', 'other')),
    purpose text check (purpose in ('primary', 'savings', 'emergency', 'investing', 'other')),
    balance numeric(15, 2) not null default 0,
    currency text not null default 'USD',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can select their own rows" ON accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users can insert their own rows" ON accounts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update their own rows" ON accounts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can delete their own rows" ON accounts FOR DELETE USING (user_id = auth.uid());

-- 2. categories
CREATE TABLE categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    parent_category_id uuid references categories(id),
    name text not null,
    kind text not null check (kind in ('income', 'expense', 'transfer')),
    color text,
    icon text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can select their own rows" ON categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users can insert their own rows" ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update their own rows" ON categories FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can delete their own rows" ON categories FOR DELETE USING (user_id = auth.uid());

-- 3. budgets
CREATE TABLE budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    category_id uuid not null references categories(id) on delete cascade,
    amount numeric(15, 2) not null,
    month date not null,
    behavior text not null check (behavior in ('rollover', 'strict', 'flexible')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, month, category_id)
);
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can select their own rows" ON budgets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users can insert their own rows" ON budgets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update their own rows" ON budgets FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can delete their own rows" ON budgets FOR DELETE USING (user_id = auth.uid());

-- 4. investment_holdings
CREATE TABLE investment_holdings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    account_id uuid not null references accounts(id) on delete cascade,
    symbol text not null,
    quantity numeric(15, 6) not null default 0,
    average_cost numeric(15, 2),
    status text not null check (status in ('active', 'closed')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
CREATE TRIGGER update_investment_holdings_updated_at BEFORE UPDATE ON investment_holdings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE investment_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can select their own rows" ON investment_holdings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users can insert their own rows" ON investment_holdings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update their own rows" ON investment_holdings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can delete their own rows" ON investment_holdings FOR DELETE USING (user_id = auth.uid());

-- 5. transactions
CREATE TABLE transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    account_id uuid not null references accounts(id) on delete cascade,
    destination_account_id uuid references accounts(id),
    category_id uuid references categories(id) on delete set null,
    holding_id uuid references investment_holdings(id) on delete set null,
    related_transaction_id uuid references transactions(id),
    amount numeric(15, 2) not null,
    type text not null check (type in ('income', 'expense', 'transfer', 'investment', 'adjustment')),
    description text,
    date date not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can select their own rows" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users can insert their own rows" ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update their own rows" ON transactions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can delete their own rows" ON transactions FOR DELETE USING (user_id = auth.uid());

-- 6. asset_valuations
CREATE TABLE asset_valuations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    holding_id uuid not null references investment_holdings(id) on delete cascade,
    date date not null,
    asset_type text not null check (asset_type in ('stock', 'crypto', 'real_estate', 'other')),
    price numeric(15, 4) not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
CREATE TRIGGER update_asset_valuations_updated_at BEFORE UPDATE ON asset_valuations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE asset_valuations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can select their own rows" ON asset_valuations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users can insert their own rows" ON asset_valuations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update their own rows" ON asset_valuations FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can delete their own rows" ON asset_valuations FOR DELETE USING (user_id = auth.uid());

-- 7. exchange_rates
CREATE TABLE exchange_rates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    from_currency text not null,
    to_currency text not null,
    rate numeric(15, 6) not null,
    rate_date date not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, from_currency, to_currency, rate_date)
);
CREATE TRIGGER update_exchange_rates_updated_at BEFORE UPDATE ON exchange_rates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can select their own rows" ON exchange_rates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users can insert their own rows" ON exchange_rates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update their own rows" ON exchange_rates FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can delete their own rows" ON exchange_rates FOR DELETE USING (user_id = auth.uid());

-- Indexes for performance and RLS
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_parent_id ON accounts(parent_account_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month ON budgets(month);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_holding_id ON transactions(holding_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_investment_holdings_user_id ON investment_holdings(user_id);
CREATE INDEX idx_investment_holdings_account_id ON investment_holdings(account_id);
CREATE INDEX idx_asset_valuations_user_id ON asset_valuations(user_id);
CREATE INDEX idx_asset_valuations_holding_id ON asset_valuations(holding_id);
CREATE INDEX idx_exchange_rates_user_id ON exchange_rates(user_id);
CREATE INDEX idx_exchange_rates_rate_date ON exchange_rates(rate_date);
