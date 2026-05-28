-- Add subscription_fund to accounts purpose check constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_purpose_check;
ALTER TABLE accounts ADD CONSTRAINT accounts_purpose_check CHECK (
  purpose IN ('daily_spending', 'saving', 'emergency_fund', 'travel_fund', 'investment', 'deposit', 'bill_payment', 'subscription_fund', 'other')
);
