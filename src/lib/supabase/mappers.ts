import {
  Account,
  Category,
  Budget,
  Transaction,
  InvestmentHolding,
  AssetValuation,
  ExchangeRate,
} from '../../types/finance';

// ==========================
// ACCOUNTS
// ==========================
export function mapAccountRowToAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    institution: row.institution,
    currency: row.currency,
    purpose: row.purpose,
    parentAccountId: row.parent_account_id,
    initialBalance: Number(row.initial_balance),
    isActive: row.is_active,
    isFavorite: !!row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAccountToInsert(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>, userId: string) {
  return {
    user_id: userId,
    name: account.name,
    type: account.type,
    institution: account.institution || null,
    currency: account.currency,
    purpose: account.purpose,
    parent_account_id: account.parentAccountId || null,
    initial_balance: account.initialBalance,
    is_favorite: account.isFavorite !== undefined ? account.isFavorite : false,
  };
}

// ==========================
// CATEGORIES
// ==========================
export function mapCategoryRowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    parentCategoryId: row.parent_category_id,
    kind: row.kind,
    budgetBehavior: row.budget_behavior,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCategoryToInsert(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
  return {
    user_id: userId,
    name: category.name,
    parent_category_id: category.parentCategoryId || null,
    kind: category.kind,
    budget_behavior: category.budgetBehavior,
    is_active: category.isActive !== undefined ? category.isActive : true,
    sort_order: category.sortOrder || 0,
  };
}

// ==========================
// BUDGETS
// ==========================
export function mapBudgetRowToBudget(row: any): Budget {
  return {
    id: row.id,
    month: typeof row.month === 'string' && row.month.length >= 7 ? row.month.substring(0, 7) : row.month,
    categoryId: row.category_id,
    plannedAmount: Number(row.planned_amount),
    currency: row.currency,
    rolloverEnabled: row.rollover_enabled,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBudgetToInsert(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
  return {
    user_id: userId,
    month: typeof budget.month === 'string' && budget.month.length === 7 ? `${budget.month}-01` : budget.month,
    category_id: budget.categoryId,
    planned_amount: budget.plannedAmount,
    currency: budget.currency,
    rollover_enabled: budget.rolloverEnabled,
    note: budget.note || null,
  };
}

// ==========================
// TRANSACTIONS
// ==========================
export function mapTransactionRowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    amount: Number(row.amount),
    currency: row.currency,
    accountId: row.account_id,
    destinationAccountId: row.destination_account_id,
    categoryId: row.category_id,
    holdingId: row.holding_id,
    relatedTransactionId: row.related_transaction_id,
    title: row.title,
    note: row.note,
    exchangeRateToBase: row.exchange_rate_to_base ? Number(row.exchange_rate_to_base) : null,
    isExcludedFromBudget: row.is_excluded_from_budget,
    isExcludedFromCashflow: row.is_excluded_from_cashflow,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTransactionToInsert(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
  return {
    user_id: userId,
    type: transaction.type,
    date: transaction.date,
    amount: transaction.amount,
    currency: transaction.currency,
    account_id: transaction.accountId || null,
    destination_account_id: transaction.destinationAccountId || null,
    category_id: transaction.categoryId || null,
    holding_id: transaction.holdingId || null,
    related_transaction_id: transaction.relatedTransactionId || null,
    title: transaction.title,
    note: transaction.note || null,
    exchange_rate_to_base: transaction.exchangeRateToBase !== undefined ? transaction.exchangeRateToBase : null,
    is_excluded_from_budget: transaction.isExcludedFromBudget,
    is_excluded_from_cashflow: transaction.isExcludedFromCashflow,
  };
}

// ==========================
// INVESTMENT HOLDINGS
// ==========================
export function mapHoldingRowToHolding(row: any): InvestmentHolding {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    assetType: row.asset_type,
    symbol: row.symbol,
    currency: row.currency,
    quantity: row.quantity ? Number(row.quantity) : null,
    averageCost: row.average_cost ? Number(row.average_cost) : null,
    principalAmount: row.principal_amount ? Number(row.principal_amount) : null,
    currentPrice: row.current_price ? Number(row.current_price) : null,
    currentValue: Number(row.current_value),
    openedAt: row.opened_at,
    maturityDate: row.maturity_date,
    interestRate: row.interest_rate ? Number(row.interest_rate) : null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHoldingToInsert(holding: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
  return {
    user_id: userId,
    account_id: holding.accountId,
    name: holding.name,
    asset_type: holding.assetType,
    symbol: holding.symbol || null,
    currency: holding.currency,
    quantity: holding.quantity !== undefined ? holding.quantity : null,
    average_cost: holding.averageCost !== undefined ? holding.averageCost : null,
    principal_amount: holding.principalAmount !== undefined ? holding.principalAmount : null,
    current_price: holding.currentPrice !== undefined ? holding.currentPrice : null,
    current_value: holding.currentValue,
    opened_at: holding.openedAt || null,
    maturity_date: holding.maturityDate || null,
    interest_rate: holding.interestRate !== undefined ? holding.interestRate : null,
    status: holding.status,
  };
}

// ==========================
// ASSET VALUATIONS
// ==========================
export function mapValuationRowToValuation(row: any): AssetValuation {
  return {
    id: row.id,
    holdingId: row.holding_id,
    valuationDate: row.valuation_date,
    price: row.price ? Number(row.price) : null,
    value: Number(row.value),
    exchangeRateToBase: row.exchange_rate_to_base ? Number(row.exchange_rate_to_base) : null,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function mapValuationToInsert(valuation: Omit<AssetValuation, 'id' | 'createdAt'>, userId: string) {
  return {
    user_id: userId,
    holding_id: valuation.holdingId,
    valuation_date: valuation.valuationDate,
    price: valuation.price !== undefined ? valuation.price : null,
    value: valuation.value,
    exchange_rate_to_base: valuation.exchangeRateToBase !== undefined ? valuation.exchangeRateToBase : null,
    note: valuation.note || null,
  };
}

// ==========================
// EXCHANGE RATES
// ==========================
export function mapExchangeRateRowToExchangeRate(row: any): ExchangeRate {
  return {
    id: row.id,
    fromCurrency: row.from_currency,
    toCurrency: row.to_currency,
    rate: Number(row.rate),
    rateDate: row.rate_date,
    source: row.source,
    createdAt: row.created_at,
  };
}

export function mapExchangeRateToInsert(rate: Omit<ExchangeRate, 'id' | 'createdAt'>, userId: string) {
  return {
    user_id: userId,
    from_currency: rate.fromCurrency,
    to_currency: rate.toCurrency,
    rate: rate.rate,
    rate_date: rate.rateDate,
    source: rate.source,
  };
}
