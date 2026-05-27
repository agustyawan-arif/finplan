-- Make quantity column nullable in investment_holdings to align with TypeScript types
ALTER TABLE investment_holdings ALTER COLUMN quantity DROP NOT NULL;
