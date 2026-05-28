export const BASE_CURRENCY = 'IDR';

export const ACCOUNT_TYPES = [
  'cash',
  'bank',
  'e_wallet',
  'pocket',
  'deposit',
  'investment',
] as const;

export const ACCOUNT_PURPOSES = [
  'daily_spending',
  'saving',
  'emergency_fund',
  'travel_fund',
  'investment',
  'deposit',
  'bill_payment',
  'subscription_fund',
  'other',
] as const;

export const TRANSACTION_TYPES = [
  'income',
  'expense',
  'transfer',
  'adjustment',
  'asset_buy',
  'asset_sell',
  'asset_value_update',
] as const;

export const ASSET_TYPES = [
  'stock',
  'mutual_fund',
  'deposit',
  'foreign_currency',
  'other',
] as const;

export const HOLDING_STATUSES = [
  'active',
  'sold',
  'matured',
  'closed',
] as const;

export const BUDGET_PARENT_GROUPS = [
  'Needs',
  'Wants',
  'Saving',
  'Charity',
] as const;

export const SAVING_PURPOSES = [
  'saving',
  'emergency_fund',
  'travel_fund',
  'investment',
  'deposit',
  'subscription_fund',
] as const;
