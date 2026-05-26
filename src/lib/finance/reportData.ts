/**
 * reportData.ts
 * Chart data adapters for Milestone 8 Reports & Charts.
 * These functions compose existing calculation utilities into chart-friendly arrays.
 * NO financial math is duplicated here.
 */

import {
  Account,
  Category,
  Budget,
  Transaction,
  InvestmentHolding,
  ExchangeRate,
} from '../../types/finance';
import {
  calculateCashflow,
  calculateBudgetUsage,
  calculateSavingAllocation,
  calculateAssetAllocation,
  calculateAccountBalance,
  convertCurrencyToBase,
  deriveHoldingState,
} from './calculations';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Budget vs Actual
// ─────────────────────────────────────────────────────────────────────────────

export interface BudgetVsActualItem {
  name: string;
  planned: number;
  actual: number;
  isOverBudget: boolean;
}

export const getBudgetVsActualData = (
  categories: Category[],
  budgets: Budget[],
  accounts: Account[],
  transactions: Transaction[],
  month: string,
  exchangeRates: ExchangeRate[]
): BudgetVsActualItem[] => {
  const monthBudgets = budgets.filter((b) => b.month === month);

  return ['Needs', 'Wants', 'Saving', 'Charity'].map((groupName) => {
    const parentCat = categories.find((c) => c.name === groupName && !c.parentCategoryId);
    const budget = monthBudgets.find((b) => b.categoryId === parentCat?.id);
    const planned = budget?.plannedAmount ?? 0;

    let actual = 0;
    if (groupName === 'Saving') {
      actual = calculateSavingAllocation(accounts, transactions, month, exchangeRates);
    } else if (parentCat) {
      actual = calculateBudgetUsage(categories, transactions, month, parentCat.id, exchangeRates);
    }

    return {
      name: groupName,
      planned,
      actual,
      isOverBudget: actual > planned && planned > 0,
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Spending by Category
// ─────────────────────────────────────────────────────────────────────────────

export interface SpendingByCategoryItem {
  name: string;
  value: number;
  categoryId: string;
}

export const getSpendingByCategoryData = (
  categories: Category[],
  transactions: Transaction[],
  month: string,
  exchangeRates: ExchangeRate[]
): SpendingByCategoryItem[] => {
  const expenseTxs = transactions.filter(
    (t) =>
      t.type === 'expense' &&
      t.date.startsWith(month) &&
      !t.isExcludedFromBudget
  );

  // Aggregate by leaf category
  const byCategory: Record<string, number> = {};
  expenseTxs.forEach((t) => {
    if (!t.categoryId) return;
    const converted = convertCurrencyToBase(t.amount, t.currency, exchangeRates);
    byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + converted;
  });

  return Object.entries(byCategory)
    .map(([catId, value]) => ({
      categoryId: catId,
      name: categories.find((c) => c.id === catId)?.name ?? catId,
      value,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Cashflow Report
// ─────────────────────────────────────────────────────────────────────────────

export interface CashflowReportData {
  income: number;
  expense: number;
  net: number;
  bars: { name: string; value: number; fill: string }[];
}

export const getCashflowReportData = (
  transactions: Transaction[],
  month: string,
  exchangeRates: ExchangeRate[]
): CashflowReportData => {
  const { income, expense, cashflow } = calculateCashflow(transactions, month, exchangeRates);
  return {
    income,
    expense,
    net: cashflow,
    bars: [
      { name: 'Income', value: income, fill: '#10b981' },
      { name: 'Expenses', value: expense, fill: '#f43f5e' },
      { name: 'Net', value: cashflow, fill: cashflow >= 0 ? '#6366f1' : '#f59e0b' },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Net Worth Breakdown
// ─────────────────────────────────────────────────────────────────────────────

export interface NetWorthBreakdownItem {
  name: string;
  value: number;
  type: 'liquid' | 'holding';
}

export const getNetWorthBreakdownData = (
  accounts: Account[],
  holdings: InvestmentHolding[],
  transactions: Transaction[],
  exchangeRates: ExchangeRate[]
): NetWorthBreakdownItem[] => {
  const items: NetWorthBreakdownItem[] = [];

  // Liquid accounts (skip parent containers that have children, and skip investment/deposit accounts whose value is captured in holdings)
  accounts.forEach((acc) => {
    if (!acc.isActive) return;

    // Skip parent containers (they aggregate children)
    const hasChildren = accounts.some((a) => a.parentAccountId === acc.id && a.isActive);
    if (hasChildren) return;

    // Skip accounts fully represented by a holding
    const hasFullHolding = holdings.some(
      (h) =>
        h.accountId === acc.id &&
        h.status === 'active' &&
        (h.assetType === 'foreign_currency' || h.assetType === 'deposit')
    );
    if (hasFullHolding) return;

    // Skip investment account shell (balance 0, holdings represent it)
    if (acc.type === 'investment') return;

    const bal = calculateAccountBalance(acc, transactions);
    if (bal <= 0) return;
    const converted = convertCurrencyToBase(bal, acc.currency, exchangeRates);
    if (converted <= 0) return;

    items.push({ name: acc.name, value: converted, type: 'liquid' });
  });

  // Holdings
  holdings.forEach((h) => {
    if (h.status !== 'active') return;
    const derived = deriveHoldingState(h, transactions);
    if (derived.currentValue <= 0) return;
    const converted = convertCurrencyToBase(derived.currentValue, h.currency, exchangeRates);
    if (converted <= 0) return;
    items.push({ name: h.name, value: converted, type: 'holding' });
  });

  return items.sort((a, b) => b.value - a.value);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Asset Allocation  (delegates fully to calculateAssetAllocation)
// ─────────────────────────────────────────────────────────────────────────────

export const getAssetAllocationData = (
  accounts: Account[],
  holdings: InvestmentHolding[],
  transactions: Transaction[],
  exchangeRates: ExchangeRate[]
) => calculateAssetAllocation(accounts, holdings, transactions, exchangeRates);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Investment Gain/Loss
// ─────────────────────────────────────────────────────────────────────────────

export interface InvestmentGainLossItem {
  id: string;
  name: string;
  currency: string;
  principal: number;
  currentValue: number;
  gainLoss: number;
  gainLossConverted: number;
  percentage: number;
  isPositive: boolean;
  isDeposit: boolean;
  isFX: boolean;
}

export const getInvestmentGainLossData = (
  holdings: InvestmentHolding[],
  transactions: Transaction[],
  exchangeRates: ExchangeRate[]
): InvestmentGainLossItem[] => {
  return holdings
    .filter((h) => h.status === 'active')
    .map((h) => {
      const derived = deriveHoldingState(h, transactions);
      const isFX = h.assetType === 'foreign_currency';

      let principalIDR: number;
      let currentValueIDR: number;

      if (isFX) {
        // principalAmount is already IDR cost basis if provided
        principalIDR = derived.principalAmount;
        if (!principalIDR && derived.quantity !== null && h.averageCost) {
          principalIDR = derived.quantity * h.averageCost;
        }

        // currentValue is native foreign currency amount, convert to IDR
        const price = derived.currentPrice || h.currentPrice || 0;
        if (derived.quantity !== null && price > 0) {
          currentValueIDR = derived.quantity * price;
        } else {
          currentValueIDR = convertCurrencyToBase(derived.currentValue, h.currency, exchangeRates);
        }
      } else {
        // Normal assets
        principalIDR = convertCurrencyToBase(derived.principalAmount, h.currency, exchangeRates);
        currentValueIDR = convertCurrencyToBase(derived.currentValue, h.currency, exchangeRates);
      }

      const gainLossConverted = currentValueIDR - principalIDR;
      const percentage = principalIDR > 0 ? (gainLossConverted / principalIDR) * 100 : 0;
      const isPositive = gainLossConverted >= 0;

      // In the holding's native currency, if needed for gainLoss, otherwise use IDR/converted
      const gainLossNative = isFX ? gainLossConverted : (derived.currentValue - derived.principalAmount);

      return {
        id: h.id,
        name: h.name,
        currency: h.currency,
        principal: principalIDR,
        currentValue: currentValueIDR,
        gainLoss: gainLossNative,
        gainLossConverted,
        percentage,
        isPositive,
        isDeposit: h.assetType === 'deposit',
        isFX,
      };
    })
    .sort((a, b) => Math.abs(b.gainLossConverted) - Math.abs(a.gainLossConverted));
};
