-- Fix check constraints on accounts, transactions, and investment_holdings to match TypeScript types

-- 1. Update accounts constraints
-- Drop existing constraints if they exist
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_purpose_check;

-- Add updated check constraints that align with AccountType and AccountPurpose
ALTER TABLE accounts ADD CONSTRAINT accounts_type_check CHECK (
  type IN ('cash', 'bank', 'e_wallet', 'pocket', 'deposit', 'investment')
);

ALTER TABLE accounts ADD CONSTRAINT accounts_purpose_check CHECK (
  purpose IN ('daily_spending', 'saving', 'emergency_fund', 'travel_fund', 'investment', 'deposit', 'bill_payment', 'other')
);

-- 2. Update transactions constraints
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Add updated check constraint that aligns with TransactionType
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (
  type IN ('income', 'expense', 'transfer', 'adjustment', 'asset_buy', 'asset_sell', 'asset_value_update')
);

-- 3. Update investment_holdings constraints
ALTER TABLE investment_holdings DROP CONSTRAINT IF EXISTS investment_holdings_status_check;

-- Add updated check constraint that aligns with HoldingStatus
ALTER TABLE investment_holdings ADD CONSTRAINT investment_holdings_status_check CHECK (
  status IN ('active', 'sold', 'matured', 'closed')
);
