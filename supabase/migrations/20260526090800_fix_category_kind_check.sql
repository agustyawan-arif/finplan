-- Fix the kind check constraint in categories to match the CategoryKind type
ALTER TABLE categories DROP CONSTRAINT categories_kind_check;
ALTER TABLE categories ADD CONSTRAINT categories_kind_check CHECK (kind IN ('income', 'expense', 'allocation', 'transfer'));
