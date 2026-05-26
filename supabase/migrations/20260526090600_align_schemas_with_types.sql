-- 1. accounts
ALTER TABLE accounts RENAME COLUMN balance TO initial_balance;
ALTER TABLE accounts ADD COLUMN is_active boolean not null default true;
ALTER TABLE accounts ADD COLUMN institution text;

-- 2. categories (budget_behavior and sort_order already added in previous migration)
ALTER TABLE categories ADD COLUMN is_active boolean not null default true;

-- 3. budgets
ALTER TABLE budgets RENAME COLUMN amount TO planned_amount;
ALTER TABLE budgets ADD COLUMN currency text not null default 'USD';
ALTER TABLE budgets ADD COLUMN rollover_enabled boolean not null default false;
ALTER TABLE budgets ADD COLUMN note text;
ALTER TABLE budgets DROP COLUMN behavior;

-- 4. investment_holdings
ALTER TABLE investment_holdings ADD COLUMN name text not null default 'Investment';
ALTER TABLE investment_holdings ADD COLUMN asset_type text not null default 'other';
ALTER TABLE investment_holdings ALTER COLUMN symbol DROP NOT NULL;
ALTER TABLE investment_holdings ADD COLUMN currency text not null default 'USD';
ALTER TABLE investment_holdings ADD COLUMN principal_amount numeric(15,2);
ALTER TABLE investment_holdings ADD COLUMN current_price numeric(15,4);
ALTER TABLE investment_holdings ADD COLUMN current_value numeric(15,2) not null default 0;
ALTER TABLE investment_holdings ADD COLUMN opened_at date;
ALTER TABLE investment_holdings ADD COLUMN maturity_date date;
ALTER TABLE investment_holdings ADD COLUMN interest_rate numeric(5,2);

-- 5. transactions
ALTER TABLE transactions RENAME COLUMN description TO title;
ALTER TABLE transactions ADD COLUMN note text;
ALTER TABLE transactions ADD COLUMN currency text not null default 'USD';
ALTER TABLE transactions ADD COLUMN exchange_rate_to_base numeric(15,6);
ALTER TABLE transactions ADD COLUMN is_excluded_from_budget boolean not null default false;
ALTER TABLE transactions ADD COLUMN is_excluded_from_cashflow boolean not null default false;

-- 6. asset_valuations
ALTER TABLE asset_valuations RENAME COLUMN date TO valuation_date;
ALTER TABLE asset_valuations DROP COLUMN asset_type;
ALTER TABLE asset_valuations ALTER COLUMN price DROP NOT NULL;
ALTER TABLE asset_valuations ADD COLUMN value numeric(15,2) not null default 0;
ALTER TABLE asset_valuations ADD COLUMN exchange_rate_to_base numeric(15,6);
ALTER TABLE asset_valuations ADD COLUMN note text;

-- 7. exchange_rates
ALTER TABLE exchange_rates ADD COLUMN source text not null default 'manual';
