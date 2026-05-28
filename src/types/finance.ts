export type CurrencyCode = 'IDR' | 'SGD' | 'USD';

export type AccountType = 'cash' | 'bank' | 'e_wallet' | 'pocket' | 'deposit' | 'investment';

export type AccountPurpose =
  | 'daily_spending'
  | 'saving'
  | 'emergency_fund'
  | 'travel_fund'
  | 'investment'
  | 'deposit'
  | 'bill_payment'
  | 'subscription_fund'
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution?: string;
  currency: CurrencyCode;
  purpose: AccountPurpose;
  parentAccountId?: string | null;
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoryKind = 'income' | 'expense' | 'allocation';
export type BudgetBehavior = 'expense' | 'allocation' | 'none';

export interface Category {
  id: string;
  name: string;
  parentCategoryId?: string | null;
  kind: CategoryKind;
  budgetBehavior: BudgetBehavior;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: string; // format YYYY-MM
  categoryId: string;
  plannedAmount: number;
  currency: CurrencyCode;
  rolloverEnabled: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'adjustment'
  | 'asset_buy'
  | 'asset_sell'
  | 'asset_value_update';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  amount: number;
  currency: CurrencyCode;
  accountId?: string | null;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  holdingId?: string | null;
  relatedTransactionId?: string | null;
  title: string;
  note?: string;
  exchangeRateToBase?: number | null;
  isExcludedFromBudget: boolean;
  isExcludedFromCashflow: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = 'stock' | 'mutual_fund' | 'deposit' | 'foreign_currency' | 'other';
export type HoldingStatus = 'active' | 'sold' | 'matured' | 'closed';

export interface InvestmentHolding {
  id: string;
  accountId: string;
  name: string;
  assetType: AssetType;
  symbol?: string | null;
  currency: CurrencyCode;
  quantity?: number | null;
  averageCost?: number | null;
  principalAmount?: number | null;
  currentPrice?: number | null;
  currentValue: number;
  openedAt?: string | null;
  maturityDate?: string | null;
  interestRate?: number | null;
  status: HoldingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssetValuation {
  id: string;
  holdingId: string;
  valuationDate: string;
  price?: number | null;
  value: number;
  exchangeRateToBase?: number | null;
  note?: string;
  createdAt: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  rateDate: string;
  source: 'manual' | 'api';
  createdAt: string;
}
