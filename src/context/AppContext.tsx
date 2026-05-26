'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  Account,
  Category,
  Budget,
  Transaction,
  InvestmentHolding,
  ExchangeRate,
  TransactionType,
  AssetValuation,
} from '../types/finance';
import {
  mockAccounts,
  mockCategories,
  mockBudgets,
  mockTransactions,
  mockHoldings,
  mockExchangeRates,
  mockValuations,
} from '../data';
import {
  calculateAccountBalance,
  calculateNetWorth,
  getAvailableCash,
  calculateCashflow,
  calculateSavingAllocation,
  calculateBudgetUsage,
  convertCurrencyToBase,
} from '../lib/finance/calculations';
import { runMockDataValidation } from '../lib/finance/mockDataValidation';

interface AppContextType {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  holdings: InvestmentHolding[];
  exchangeRates: ExchangeRate[];
  valuations: AssetValuation[];
  activeTab: 'home' | 'transactions' | 'budget' | 'accounts' | 'reports';
  setActiveTab: (tab: 'home' | 'transactions' | 'budget' | 'accounts' | 'reports') => void;
  globalMonth: string;
  setGlobalMonth: (month: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteTransaction: (id: string) => void;
  convertCurrencyToBase: (amount: number, currency: string) => number;
  getAccountBalance: (accountId: string) => number;
  getNetWorth: () => number;
  getAvailableCash: () => number;
  getMonthlyIncome: (month: string) => number;
  getMonthlyExpense: (month: string) => number;
  getMonthlyCashflow: (month: string) => number;
  getBudgetProgress: (month: string) => {
    totalPlanned: number;
    totalUsed: number;
    totalRemaining: number;
    groups: {
      name: string;
      planned: number;
      used: number;
      remaining: number;
      percentage: number;
      categories: {
        id: string;
        name: string;
        planned: number;
        used: number;
        remaining: number;
        percentage: number;
      }[];
    }[];
  };
  getCategoryName: (categoryId?: string | null) => string;
  getAccountName: (accountId?: string | null) => string;
  updateAssetValuation: (holdingId: string, newValue: number, note?: string) => void;
  addAccount: (input: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => void;
  updateAccount: (accountId: string, input: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deactivateAccount: (accountId: string) => void;
  addBudget: (input: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (budgetId: string, input: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteBudget: (budgetId: string) => void;
  addHolding: (input: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHolding: (holdingId: string, input: Partial<Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  updateHoldingValue: (
    holdingId: string,
    valueInput: {
      currentValue: number;
      currentPrice?: number;
      exchangeRateToBase?: number;
      valuationDate: string;
      note?: string;
    }
  ) => void;
  addAssetValuation: (input: Omit<AssetValuation, 'id' | 'createdAt'>) => void;
  addExchangeRate: (input: Omit<ExchangeRate, 'id' | 'createdAt'>) => void;
  updateExchangeRate: (rateId: string, input: Partial<Omit<ExchangeRate, 'id' | 'createdAt'>>) => void;
  addAssetBuyTransaction: (input: {
    amount: number;
    fromAccountId: string;
    holdingId: string;
    date: string;
    quantity?: number;
    price?: number;
    title?: string;
    note?: string;
  }) => void;
  addAssetSellTransaction: (input: {
    amount: number;
    holdingId: string;
    destinationAccountId: string;
    date: string;
    quantity?: number;
    price?: number;
    realizedGain?: number;
    title?: string;
    note?: string;
  }) => void;
  addAssetValueUpdateTransaction: (input: {
    holdingId: string;
    currentValue: number;
    valuationDate: string;
    currentPrice?: number;
    exchangeRateToBase?: number;
    note?: string;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'transactions' | 'budget' | 'accounts' | 'reports'>('home');
  const [globalMonth, setGlobalMonth] = useState('2026-05');
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [categories] = useState<Category[]>(mockCategories);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [holdings, setHoldings] = useState<InvestmentHolding[]>(mockHoldings);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(mockExchangeRates);
  const [valuations, setValuations] = useState<AssetValuation[]>(mockValuations);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      try {
        runMockDataValidation();
      } catch (err) {
        console.error('Validation failed:', err);
      }
    }
  }, []);

  // Helper: Currency conversion to Base Currency (IDR)
  const convertCurrencyToBaseWrapper = (amount: number, currency: string): number => {
    return convertCurrencyToBase(amount, currency, exchangeRates);
  };

  // Helper: Get Account Name
  const getAccountName = (accountId?: string | null): string => {
    if (!accountId) return 'None';
    return accounts.find((a) => a.id === accountId)?.name || 'Unknown Account';
  };

  // Helper: Get Category Name
  const getCategoryName = (categoryId?: string | null): string => {
    if (!categoryId) return 'Uncategorized';
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized';
  };

  // 1. Calculate specific Account Balance dynamically
  const getAccountBalanceWrapper = (accountId: string): number => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return 0;
    return calculateAccountBalance(acc, transactions);
  };

  // 2. Net Worth Calculation
  const getNetWorthWrapper = (): number => {
    return calculateNetWorth(accounts, holdings, transactions, exchangeRates);
  };

  // 3. Available Cash (Cash + Bank + E-wallet accounts in IDR)
  const getAvailableCashWrapper = (): number => {
    return getAvailableCash(accounts, transactions, exchangeRates);
  };

  // 4. Monthly Income
  const getMonthlyIncome = (month: string): number => {
    return calculateCashflow(transactions, month, exchangeRates).income;
  };

  // 5. Monthly Expense
  const getMonthlyExpense = (month: string): number => {
    return calculateCashflow(transactions, month, exchangeRates).expense;
  };

  // 6. Monthly Cashflow
  const getMonthlyCashflow = (month: string): number => {
    return calculateCashflow(transactions, month, exchangeRates).cashflow;
  };

  // 7. Core Budget Calculations
  const getBudgetProgress = (month: string) => {
    const monthBudgets = budgets.filter((b) => b.month === month);

    let totalPlanned = 0;
    let totalUsed = 0;

    const groups = ['Needs', 'Wants', 'Saving', 'Charity'].map((groupName) => {
      const parentCat = categories.find((c) => c.name === groupName && !c.parentCategoryId);
      const budget = monthBudgets.find((b) => b.categoryId === parentCat?.id);
      const planned = budget ? budget.plannedAmount : 0;
      totalPlanned += planned;

      // Children categories
      const children = categories.filter((c) => c.parentCategoryId === parentCat?.id);

      let used = 0;

      // For saving (allocation-based budget behavior)
      if (groupName === 'Saving') {
        used = calculateSavingAllocation(accounts, transactions, month, exchangeRates);
      } else if (parentCat) {
        // For Needs, Wants, Charity (expense-based budget behavior)
        used = calculateBudgetUsage(categories, transactions, month, parentCat.id, exchangeRates);
      }

      totalUsed += used;

      // Calculate progress per child category inside the group
      const childCategoriesInfo = children.map((c) => {
        let childUsed = 0;
        if (groupName === 'Saving') {
          // Child saving allocations (transfers or asset buys)
          transactions.forEach((t) => {
            if (t.date.startsWith(month)) {
              let isMatch = false;

              // Match by explicit category ID
              if (t.categoryId === c.id) {
                isMatch = true;
              }
              // Else if it's a transfer to a pocket/account, match by target account purpose
              else if (t.type === 'transfer' && t.destinationAccountId) {
                const destAcc = accounts.find((a) => a.id === t.destinationAccountId);
                if (destAcc) {
                  if (destAcc.purpose === 'emergency_fund' && c.id === 'cat_emg_fund') isMatch = true;
                  else if (destAcc.purpose === 'travel_fund' && c.id === 'cat_travel_fund') isMatch = true;
                  else if (destAcc.purpose === 'investment' && c.id === 'cat_investment') isMatch = true;
                  else if (destAcc.purpose === 'deposit' && c.id === 'cat_deposit') isMatch = true;
                }
              }

              if (isMatch) {
                if (t.type === 'asset_buy') {
                  childUsed += convertCurrencyToBaseWrapper(t.amount, t.currency);
                } else if (t.type === 'transfer' && t.destinationAccountId) {
                  childUsed += convertCurrencyToBaseWrapper(t.amount, t.currency);
                }
              }
            }
          });
        } else {
          childUsed = calculateBudgetUsage(categories, transactions, month, c.id, exchangeRates);
        }

        const childPlanned = 0;
        const childRemaining = childPlanned - childUsed;

        return {
          id: c.id,
          name: c.name,
          planned: childPlanned,
          used: childUsed,
          remaining: childRemaining,
          percentage: childPlanned > 0 ? Math.min((childUsed / childPlanned) * 100, 100) : 0,
        };
      });

      const remaining = planned - used;
      const percentage = planned > 0 ? (used / planned) * 100 : 0;

      return {
        name: groupName,
        planned,
        used,
        remaining,
        percentage,
        categories: childCategoriesInfo,
      };
    });

    return {
      totalPlanned,
      totalUsed,
      totalRemaining: totalPlanned - totalUsed,
      groups,
    };
  };

  // Add a new mock transaction with interactive side effects on holdings
  const addTransaction = (tData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `t_user_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newTx: Transaction = {
      ...tData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTransactions((prev) => [newTx, ...prev]);
    // NOTE: Do NOT mutate holding state here.
    // deriveHoldingState() in calculations.ts replays all transactions
    // from the initial holding snapshot to produce accurate current values.
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Manual asset valuation update (legacy — use addAssetValueUpdateTransaction instead)
  const updateAssetValuation = (holdingId: string, newValue: number, note?: string) => {
    // Only record the transaction; deriveHoldingState will compute the new value
    const targetHolding = holdings.find((h) => h.id === holdingId);
    if (targetHolding) {
      addTransaction({
        type: 'asset_value_update',
        date: new Date().toISOString().split('T')[0],
        amount: newValue, // absolute new value
        currency: targetHolding.currency,
        accountId: targetHolding.accountId,
        holdingId: holdingId,
        title: `Valuation Update: ${targetHolding.name}`,
        note: note || 'Manual price adjustment',
        exchangeRateToBase: convertCurrencyToBaseWrapper(1, targetHolding.currency),
        isExcludedFromBudget: true,
        isExcludedFromCashflow: true,
      });
    }
  };

  // Add Account
  const addAccount = (input: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    const id = `acc_user_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newAcc: Account = {
      ...input,
      id,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  // Update Account
  const updateAccount = (
    accountId: string,
    input: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const timestamp = new Date().toISOString();
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, ...input, updatedAt: timestamp } : acc))
    );
  };

  // Deactivate Account
  const deactivateAccount = (accountId: string) => {
    const timestamp = new Date().toISOString();
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, isActive: false, updatedAt: timestamp } : acc))
    );
  };

  // Add Budget
  const addBudget = (input: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `b_user_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newBudget: Budget = {
      ...input,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  // Update Budget
  const updateBudget = (
    budgetId: string,
    input: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const timestamp = new Date().toISOString();
    setBudgets((prev) =>
      prev.map((b) => (b.id === budgetId ? { ...b, ...input, updatedAt: timestamp } : b))
    );
  };

  // Delete Budget
  const deleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  };

  // Add Investment Holding
  const addHolding = (input: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `h_user_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newHolding: InvestmentHolding = {
      ...input,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setHoldings((prev) => [...prev, newHolding]);
  };

  // Update Investment Holding
  const updateHolding = (
    holdingId: string,
    input: Partial<Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const timestamp = new Date().toISOString();
    setHoldings((prev) =>
      prev.map((h) => (h.id === holdingId ? { ...h, ...input, updatedAt: timestamp } : h))
    );
  };

  // Add Asset Valuation Record
  const addAssetValuation = (input: Omit<AssetValuation, 'id' | 'createdAt'>) => {
    const id = `val_user_${Date.now()}`;
    const newValuation: AssetValuation = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    };
    setValuations((prev) => [newValuation, ...prev]);
  };

  // Add Manual Exchange Rate
  const addExchangeRate = (input: Omit<ExchangeRate, 'id' | 'createdAt'>) => {
    const id = `er_user_${Date.now()}`;
    const newRate: ExchangeRate = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    };
    setExchangeRates((prev) => {
      const filtered = prev.filter(
        (e) => !(e.fromCurrency === input.fromCurrency && e.toCurrency === input.toCurrency)
      );
      return [...filtered, newRate];
    });
  };

  // Update Manual Exchange Rate
  const updateExchangeRate = (
    rateId: string,
    input: Partial<Omit<ExchangeRate, 'id' | 'createdAt'>>
  ) => {
    setExchangeRates((prev) =>
      prev.map((er) => (er.id === rateId ? { ...er, ...input } : er))
    );
  };

  // Add Asset Buy Transaction wrapper with side-effects on holding balances
  const addAssetBuyTransaction = (input: {
    amount: number;
    fromAccountId: string;
    holdingId: string;
    date: string;
    quantity?: number;
    price?: number;
    title?: string;
    note?: string;
  }) => {
    const targetHolding = holdings.find((h) => h.id === input.holdingId);
    const sourceAccount = accounts.find((a) => a.id === input.fromAccountId);
    if (!targetHolding || !sourceAccount) return;

    const txId = `t_user_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Auto-match to investment category
    const investCatId = categories.find(
      (c) => c.id === 'cat_investment' || c.parentCategoryId === 'cat_saving'
    )?.id || null;

    const newTx: Transaction = {
      id: txId,
      type: 'asset_buy',
      date: input.date,
      amount: input.amount,
      currency: sourceAccount.currency,
      accountId: input.fromAccountId,
      holdingId: input.holdingId,
      categoryId: investCatId,
      title: input.title?.trim() || `Buy ${targetHolding.name}`,
      note: input.note?.trim() || undefined,
      exchangeRateToBase: convertCurrencyToBaseWrapper(1, sourceAccount.currency),
      isExcludedFromBudget: true,
      isExcludedFromCashflow: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTransactions((prev) => [newTx, ...prev]);
    // NOTE: holding values are NOT mutated here.
    // deriveHoldingState replays from initial snapshot + all transactions.
  };

  // Add Asset Sell Transaction wrapper with side-effects on holding balances
  const addAssetSellTransaction = (input: {
    amount: number;
    holdingId: string;
    destinationAccountId: string;
    date: string;
    quantity?: number;
    price?: number;
    realizedGain?: number;
    title?: string;
    note?: string;
  }) => {
    const targetHolding = holdings.find((h) => h.id === input.holdingId);
    const destAccount = accounts.find((a) => a.id === input.destinationAccountId);
    if (!targetHolding || !destAccount) return;

    const txId = `t_user_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTx: Transaction = {
      id: txId,
      type: 'asset_sell',
      date: input.date,
      amount: input.amount,
      currency: destAccount.currency,
      accountId: targetHolding.accountId,
      destinationAccountId: input.destinationAccountId,
      holdingId: input.holdingId,
      title: input.title?.trim() || `Sell ${targetHolding.name}`,
      note: input.note?.trim() || undefined,
      exchangeRateToBase: convertCurrencyToBaseWrapper(1, destAccount.currency),
      isExcludedFromBudget: true,
      isExcludedFromCashflow: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Only update status metadata — values are derived by deriveHoldingState
    const derivedAfterSell = (() => {
      const avgCost = targetHolding.averageCost || 0;
      const sellQty = input.quantity || (input.price && input.price > 0 ? input.amount / input.price : 0);
      const remainingQty = Math.max(0, (targetHolding.quantity || 0) - sellQty);
      return remainingQty;
    })();
    if (derivedAfterSell === 0) {
      updateHolding(input.holdingId, { status: 'sold' });
    }
  };

  // Add Asset Value Update Transaction wrapper
  const addAssetValueUpdateTransaction = (input: {
    holdingId: string;
    currentValue: number;
    valuationDate: string;
    currentPrice?: number;
    exchangeRateToBase?: number;
    note?: string;
  }) => {
    const targetHolding = holdings.find((h) => h.id === input.holdingId);
    if (!targetHolding) return;

    // 1. Create asset valuation record
    addAssetValuation({
      holdingId: input.holdingId,
      valuationDate: input.valuationDate,
      price: input.currentPrice || null,
      value: input.currentValue,
      exchangeRateToBase: input.exchangeRateToBase || null,
      note: input.note,
    });

    // 2. Create asset_value_update transaction
    const txId = `t_user_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newTx: Transaction = {
      id: txId,
      type: 'asset_value_update',
      date: input.valuationDate,
      amount: input.currentValue,
      currency: targetHolding.currency,
      accountId: targetHolding.accountId,
      holdingId: input.holdingId,
      title: `Valuation Update: ${targetHolding.name}`,
      note: input.note || 'Manual price adjustment',
      exchangeRateToBase: input.exchangeRateToBase || convertCurrencyToBaseWrapper(1, targetHolding.currency),
      isExcludedFromBudget: true,
      isExcludedFromCashflow: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setTransactions((prev) => [newTx, ...prev]);
    // NOTE: Do NOT call updateHolding for values here.
    // deriveHoldingState replays the asset_value_update transaction and sets
    // currentValue = tx.amount (absolute), so net worth stays correct.
  };

  // Helper valuation mutator bridging context
  const updateHoldingValue = (
    holdingId: string,
    valueInput: {
      currentValue: number;
      currentPrice?: number;
      exchangeRateToBase?: number;
      valuationDate: string;
      note?: string;
    }
  ) => {
    addAssetValueUpdateTransaction({
      holdingId,
      currentValue: valueInput.currentValue,
      valuationDate: valueInput.valuationDate,
      currentPrice: valueInput.currentPrice,
      exchangeRateToBase: valueInput.exchangeRateToBase,
      note: valueInput.note,
    });
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        categories,
        budgets,
        transactions,
        holdings,
        exchangeRates,
        valuations,
        activeTab,
        setActiveTab,
        globalMonth,
        setGlobalMonth,
        addTransaction,
        deleteTransaction,
        convertCurrencyToBase: convertCurrencyToBaseWrapper,
        getAccountBalance: getAccountBalanceWrapper,
        getNetWorth: getNetWorthWrapper,
        getAvailableCash: getAvailableCashWrapper,
        getMonthlyIncome,
        getMonthlyExpense,
        getMonthlyCashflow,
        getBudgetProgress,
        getCategoryName,
        getAccountName,
        updateAssetValuation,
        addAccount,
        updateAccount,
        deactivateAccount,
        addBudget,
        updateBudget,
        deleteBudget,
        addHolding,
        updateHolding,
        updateHoldingValue,
        addAssetValuation,
        addExchangeRate,
        updateExchangeRate,
        addAssetBuyTransaction,
        addAssetSellTransaction,
        addAssetValueUpdateTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
