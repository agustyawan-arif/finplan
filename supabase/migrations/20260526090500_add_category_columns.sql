-- Add missing columns to categories table
ALTER TABLE categories
ADD COLUMN budget_behavior text not null default 'expense' check (budget_behavior in ('expense', 'allocation', 'none')),
ADD COLUMN sort_order integer not null default 0;
