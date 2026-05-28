import { supabase } from './client';
import * as Mappers from './mappers';
import {
  Account,
  Category,
  Budget,
  Transaction,
  InvestmentHolding,
  AssetValuation,
  ExchangeRate,
} from '../../types/finance';

export async function fetchAllFinanceData(userId: string) {
  const [
    accountsRes,
    categoriesRes,
    budgetsRes,
    transactionsRes,
    holdingsRes,
    valuationsRes,
    exchangeRatesRes,
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', userId),
    supabase.from('categories').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
    supabase.from('budgets').select('*').eq('user_id', userId),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('investment_holdings').select('*').eq('user_id', userId),
    supabase.from('asset_valuations').select('*').eq('user_id', userId).order('valuation_date', { ascending: false }),
    supabase.from('exchange_rates').select('*').eq('user_id', userId).order('rate_date', { ascending: false }),
  ]);

  if (accountsRes.error) throw accountsRes.error;
  if (categoriesRes.error) throw categoriesRes.error;
  if (budgetsRes.error) throw budgetsRes.error;
  if (transactionsRes.error) throw transactionsRes.error;
  if (holdingsRes.error) throw holdingsRes.error;
  if (valuationsRes.error) throw valuationsRes.error;
  if (exchangeRatesRes.error) throw exchangeRatesRes.error;

  return {
    accounts: (accountsRes.data || []).map(Mappers.mapAccountRowToAccount),
    categories: (categoriesRes.data || []).map(Mappers.mapCategoryRowToCategory),
    budgets: (budgetsRes.data || []).map(Mappers.mapBudgetRowToBudget),
    transactions: (transactionsRes.data || []).map(Mappers.mapTransactionRowToTransaction),
    holdings: (holdingsRes.data || []).map(Mappers.mapHoldingRowToHolding),
    valuations: (valuationsRes.data || []).map(Mappers.mapValuationRowToValuation),
    exchangeRates: (exchangeRatesRes.data || []).map(Mappers.mapExchangeRateRowToExchangeRate),
  };
}

export async function seedDefaultCategories(userId: string): Promise<Category[]> {
  // Defensive check: prevent double seeding if categories already exist
  const { data: existing } = await supabase.from('categories').select('id').eq('user_id', userId).limit(1);
  if (existing && existing.length > 0) {
    return [];
  }

  const parentDefaults = [
    { name: 'Needs', kind: 'expense', budget_behavior: 'expense', parent_category_id: null, sort_order: 10 },
    { name: 'Wants', kind: 'expense', budget_behavior: 'expense', parent_category_id: null, sort_order: 20 },
    { name: 'Saving', kind: 'allocation', budget_behavior: 'allocation', parent_category_id: null, sort_order: 30 },
    { name: 'Charity', kind: 'expense', budget_behavior: 'expense', parent_category_id: null, sort_order: 40 },
    { name: 'Income', kind: 'income', budget_behavior: 'none', parent_category_id: null, sort_order: 50 },
  ].map(p => ({ ...p, user_id: userId }));

  const { data: parentData, error: parentError } = await supabase.from('categories').insert(parentDefaults).select();
  if (parentError) throw parentError;

  const getParentId = (name: string) => parentData?.find(p => p.name === name)?.id || null;

  const childrenDefaults = [
    // Needs Children
    { name: 'Rent', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Needs'), sort_order: 11 },
    { name: 'Transport', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Needs'), sort_order: 12 },
    { name: 'Health', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Needs'), sort_order: 13 },
    { name: 'Utilities', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Needs'), sort_order: 14 },
    { name: 'Food', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Needs'), sort_order: 15 },
    { name: 'Pets', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Needs'), sort_order: 16 },
    { name: 'Fees', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Needs'), sort_order: 17 },

    // Wants Children
    { name: 'Food', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Wants'), sort_order: 21 },
    { name: 'Entertainment', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Wants'), sort_order: 22 },
    { name: 'Shopping', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Wants'), sort_order: 23 },
    { name: 'Travel', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Wants'), sort_order: 24 },

    // Saving Children
    { name: 'Emergency Fund', kind: 'allocation', budget_behavior: 'allocation', parent_category_id: getParentId('Saving'), sort_order: 31 },
    { name: 'Investment', kind: 'allocation', budget_behavior: 'allocation', parent_category_id: getParentId('Saving'), sort_order: 32 },
    { name: 'Deposit', kind: 'allocation', budget_behavior: 'allocation', parent_category_id: getParentId('Saving'), sort_order: 33 },
    { name: 'Travel Fund', kind: 'allocation', budget_behavior: 'allocation', parent_category_id: getParentId('Saving'), sort_order: 34 },
    { name: 'Subscription Fund', kind: 'allocation', budget_behavior: 'allocation', parent_category_id: getParentId('Saving'), sort_order: 35 },

    // Charity Children
    { name: 'Donation', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Charity'), sort_order: 41 },
    { name: 'Family', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Charity'), sort_order: 42 },
    { name: 'Gift', kind: 'expense', budget_behavior: 'expense', parent_category_id: getParentId('Charity'), sort_order: 43 },

    // Income Children
    { name: 'Salary', kind: 'income', budget_behavior: 'none', parent_category_id: getParentId('Income'), sort_order: 51 },
    { name: 'Freelance', kind: 'income', budget_behavior: 'none', parent_category_id: getParentId('Income'), sort_order: 52 },
    { name: 'Investment Income', kind: 'income', budget_behavior: 'none', parent_category_id: getParentId('Income'), sort_order: 53 },
  ].map(c => ({ ...c, user_id: userId }));

  const { data: childrenData, error: childrenError } = await supabase.from('categories').insert(childrenDefaults).select();
  if (childrenError) throw childrenError;

  return [...(parentData || []), ...(childrenData || [])].map(Mappers.mapCategoryRowToCategory);
}

// ---------------------------
// Accounts CRUD
// ---------------------------
export async function insertAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>, userId: string): Promise<Account> {
  const payload = Mappers.mapAccountToInsert(account, userId);
  const { data, error } = await supabase.from('accounts').insert(payload).select().single();
  if (error) throw error;
  return Mappers.mapAccountRowToAccount(data);
}

export async function updateAccountRecord(accountId: string, input: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Account> {
  const payload: any = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.type !== undefined) payload.type = input.type;
  if (input.institution !== undefined) payload.institution = input.institution;
  if (input.currency !== undefined) payload.currency = input.currency;
  if (input.purpose !== undefined) payload.purpose = input.purpose;
  if (input.parentAccountId !== undefined) payload.parent_account_id = input.parentAccountId;
  if (input.initialBalance !== undefined) payload.initial_balance = input.initialBalance;
  if (input.isActive !== undefined) payload.is_active = input.isActive;
  if (input.isFavorite !== undefined) payload.is_favorite = input.isFavorite;

  const { data, error } = await supabase.from('accounts').update(payload).eq('id', accountId).select().single();
  if (error) throw error;
  return Mappers.mapAccountRowToAccount(data);
}

// ---------------------------
// Transactions CRUD
// ---------------------------
export async function insertTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Transaction> {
  const payload = Mappers.mapTransactionToInsert(tx, userId);
  const { data, error } = await supabase.from('transactions').insert(payload).select().single();
  if (error) throw error;
  return Mappers.mapTransactionRowToTransaction(data);
}

export async function deleteTransactionRecord(txId: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', txId);
  if (error) throw error;
}

// ---------------------------
// Budgets CRUD
// ---------------------------
export async function insertBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Budget> {
  const payload = Mappers.mapBudgetToInsert(budget, userId);
  const { data, error } = await supabase.from('budgets').insert(payload).select().single();
  if (error) throw error;
  return Mappers.mapBudgetRowToBudget(data);
}

export async function updateBudgetRecord(budgetId: string, input: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Budget> {
  const payload: any = {};
  if (input.plannedAmount !== undefined) payload.planned_amount = input.plannedAmount;
  if (input.note !== undefined) payload.note = input.note;
  if (input.rolloverEnabled !== undefined) payload.rollover_enabled = input.rolloverEnabled;
  if (input.categoryId !== undefined) payload.category_id = input.categoryId;

  const { data, error } = await supabase.from('budgets').update(payload).eq('id', budgetId).select().single();
  if (error) throw error;
  return Mappers.mapBudgetRowToBudget(data);
}

export async function deleteBudgetRecord(budgetId: string): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
  if (error) throw error;
}

// ---------------------------
// Holdings CRUD
// ---------------------------
export async function insertHolding(holding: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<InvestmentHolding> {
  const payload = Mappers.mapHoldingToInsert(holding, userId);
  const { data, error } = await supabase.from('investment_holdings').insert(payload).select().single();
  if (error) throw error;
  return Mappers.mapHoldingRowToHolding(data);
}

export async function updateHoldingRecord(holdingId: string, input: Partial<Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InvestmentHolding> {
  const payload: any = {};
  if (input.quantity !== undefined) payload.quantity = input.quantity;
  if (input.averageCost !== undefined) payload.average_cost = input.averageCost;
  if (input.status !== undefined) payload.status = input.status;
  // ... other fields if supported in UI

  const { data, error } = await supabase.from('investment_holdings').update(payload).eq('id', holdingId).select().single();
  if (error) throw error;
  return Mappers.mapHoldingRowToHolding(data);
}

// ---------------------------
// Valuations CRUD
// ---------------------------
export async function insertAssetValuation(valuation: Omit<AssetValuation, 'id' | 'createdAt'>, userId: string): Promise<AssetValuation> {
  const payload = Mappers.mapValuationToInsert(valuation, userId);
  const { data, error } = await supabase.from('asset_valuations').insert(payload).select().single();
  if (error) throw error;
  return Mappers.mapValuationRowToValuation(data);
}

// ---------------------------
// Exchange Rates CRUD
// ---------------------------
export async function insertExchangeRate(rate: Omit<ExchangeRate, 'id' | 'createdAt'>, userId: string): Promise<ExchangeRate> {
  const payload = Mappers.mapExchangeRateToInsert(rate, userId);
  const { data, error } = await supabase.from('exchange_rates').insert(payload).select().single();
  if (error) throw error;
  return Mappers.mapExchangeRateRowToExchangeRate(data);
}

export async function updateExchangeRateRecord(rateId: string, input: Partial<Omit<ExchangeRate, 'id' | 'createdAt'>>): Promise<ExchangeRate> {
  const payload: any = {};
  if (input.rate !== undefined) payload.rate = input.rate;
  if (input.rateDate !== undefined) payload.rate_date = input.rateDate;

  const { data, error } = await supabase.from('exchange_rates').update(payload).eq('id', rateId).select().single();
  if (error) throw error;
  return Mappers.mapExchangeRateRowToExchangeRate(data);
}
