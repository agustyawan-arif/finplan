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
  calculateAccountBalance,
  calculateNetWorth,
  getAvailableCash,
  calculateCashflow,
  calculateSavingAllocation,
  calculateBudgetUsage,
  convertCurrencyToBase,
} from '../lib/finance/calculations';
import * as API from '../lib/supabase/api';

interface AppContextType {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  holdings: InvestmentHolding[];
  exchangeRates: ExchangeRate[];
  valuations: AssetValuation[];
  isLoadingData: boolean;
  activeTab: 'home' | 'transactions' | 'budget' | 'accounts' | 'reports';
  setActiveTab: (tab: 'home' | 'transactions' | 'budget' | 'accounts' | 'reports') => void;
  globalMonth: string;
  setGlobalMonth: (month: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
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
  updateAssetValuation: (holdingId: string, newValue: number, note?: string) => Promise<void>;
  addAccount: (input: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => Promise<void>;
  updateAccount: (accountId: string, input: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deactivateAccount: (accountId: string) => Promise<void>;
  addBudget: (input: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (budgetId: string, input: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  addHolding: (input: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHolding: (holdingId: string, input: Partial<Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  updateHoldingValue: (
    holdingId: string,
    valueInput: {
      currentValue: number;
      currentPrice?: number;
      exchangeRateToBase?: number;
      valuationDate: string;
      note?: string;
    }
  ) => Promise<void>;
  addAssetValuation: (input: Omit<AssetValuation, 'id' | 'createdAt'>) => Promise<void>;
  addExchangeRate: (input: Omit<ExchangeRate, 'id' | 'createdAt'>) => Promise<void>;
  updateExchangeRate: (rateId: string, input: Partial<Omit<ExchangeRate, 'id' | 'createdAt'>>) => Promise<void>;
  addAssetBuyTransaction: (input: {
    amount: number;
    fromAccountId: string;
    holdingId: string;
    date: string;
    quantity?: number;
    price?: number;
    title?: string;
    note?: string;
  }) => Promise<void>;
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
  }) => Promise<void>;
  addAssetValueUpdateTransaction: (input: {
    holdingId: string;
    currentValue: number;
    valuationDate: string;
    currentPrice?: number;
    exchangeRateToBase?: number;
    note?: string;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({ children, userId }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'transactions' | 'budget' | 'accounts' | 'reports'>('home');
  const [globalMonth, setGlobalMonth] = useState('2026-05');
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [valuations, setValuations] = useState<AssetValuation[]>([]);

  React.useEffect(() => {
    if (!userId) {
      setAccounts([]);
      setCategories([]);
      setBudgets([]);
      setTransactions([]);
      setHoldings([]);
      setExchangeRates([]);
      setValuations([]);
      setIsLoadingData(false);
      return;
    }

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        let data = await API.fetchAllFinanceData(userId);
        
        if (data.categories.length === 0) {
          // New user -> seed categories
          await API.seedDefaultCategories(userId);
          data = await API.fetchAllFinanceData(userId); // reload
        }

        let rawCategories = data.categories;
        const canonicalCat = new Map<string, string>(); 
        const uniqueCategories: Category[] = [];

        // 1. Process parents
        for (const c of rawCategories) {
          if (!c.parentCategoryId) {
            const key = `${c.name}-${c.kind}`;
            if (!canonicalCat.has(key)) {
              canonicalCat.set(key, c.id);
              uniqueCategories.push(c);
            }
          }
        }

        // 2. Process children
        for (const c of rawCategories) {
          if (c.parentCategoryId) {
            const parent = rawCategories.find((p) => p.id === c.parentCategoryId);
            if (parent) {
              const pKey = `${parent.name}-${parent.kind}`;
              const canonicalId = canonicalCat.get(pKey);
              if (canonicalId) {
                const childCopy = { ...c, parentCategoryId: canonicalId };
                const cKey = `${childCopy.name}-${childCopy.kind}-${canonicalId}`;
                if (!canonicalCat.has(cKey)) {
                  canonicalCat.set(cKey, childCopy.id);
                  uniqueCategories.push(childCopy);
                }
              }
            }
          }
        }

        setAccounts(data.accounts);
        setCategories(uniqueCategories);
        setBudgets(data.budgets);
        setTransactions(data.transactions);
        setHoldings(data.holdings);
        setValuations(data.valuations);
        setExchangeRates(data.exchangeRates);
      } catch (err: any) {
        console.error('Failed to load finance data', err);
        alert('Failed to load finance data from server: ' + err.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [userId]);

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
      const parentBudget = parentCat ? monthBudgets.find((b) => b.categoryId === parentCat.id) : null;

      // Children categories
      const children = parentCat ? categories.filter((c) => c.parentCategoryId === parentCat.id) : [];

      // Calculate sum of child planned budgets
      const childrenPlannedSum = children.reduce((sum, child) => {
        const childBudget = monthBudgets.find((b) => b.categoryId === child.id);
        return sum + (childBudget ? childBudget.plannedAmount : 0);
      }, 0);

      const planned = (parentBudget ? parentBudget.plannedAmount : 0) + childrenPlannedSum;
      totalPlanned += planned;

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
                  if (destAcc.purpose === 'emergency_fund' && c.name === 'Emergency Fund') isMatch = true;
                  else if (destAcc.purpose === 'travel_fund' && c.name === 'Travel Fund') isMatch = true;
                  else if (destAcc.purpose === 'investment' && c.name === 'Investment') isMatch = true;
                  else if (destAcc.purpose === 'deposit' && c.name === 'Deposit') isMatch = true;
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

        const childBudget = monthBudgets.find((b) => b.categoryId === c.id);
        const childPlanned = childBudget ? childBudget.plannedAmount : 0;
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

  // Transactions CRUD
  const addTransaction = async (tData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    try {
      const newTx = await API.insertTransaction(tData, userId);
      setTransactions((prev) => [newTx, ...prev]);
    } catch (err: any) {
      console.error(err);
      alert('Failed to add transaction: ' + err.message);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    try {
      await API.deleteTransactionRecord(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete transaction: ' + err.message);
    }
  };

  const updateAssetValuation = async (holdingId: string, newValue: number, note?: string) => {
    if (!userId) return;
    const targetHolding = holdings.find((h) => h.id === holdingId);
    if (targetHolding) {
      await addTransaction({
        type: 'asset_value_update',
        date: new Date().toISOString().split('T')[0],
        amount: newValue,
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

  // Accounts CRUD
  const addAccount = async (input: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    if (!userId) return;
    try {
      const newAcc = await API.insertAccount(input, userId);
      setAccounts((prev) => [...prev, newAcc]);
    } catch (err: any) {
      console.error(err);
      alert('Failed to add account: ' + err.message);
    }
  };

  const updateAccount = async (accountId: string, input: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!userId) return;
    try {
      const updatedAcc = await API.updateAccountRecord(accountId, input);
      setAccounts((prev) => prev.map((acc) => (acc.id === accountId ? updatedAcc : acc)));
    } catch (err: any) {
      console.error(err);
      alert('Failed to update account: ' + err.message);
    }
  };

  const deactivateAccount = async (accountId: string) => {
    if (!userId) return;
    try {
      const updatedAcc = await API.updateAccountRecord(accountId, { isActive: false });
      setAccounts((prev) => prev.map((acc) => (acc.id === accountId ? updatedAcc : acc)));
    } catch (err: any) {
      console.error(err);
      alert('Failed to deactivate account: ' + err.message);
    }
  };

  // Budgets CRUD
  const addBudget = async (input: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    try {
      const newBudget = await API.insertBudget(input, userId);
      setBudgets((prev) => [...prev, newBudget]);
    } catch (err: any) {
      console.error(err);
      if (err.code === '23505') { // Postgres unique violation code usually
        alert('A budget for this category and month already exists.');
      } else {
        alert('Failed to add budget: ' + err.message);
      }
    }
  };

  const updateBudget = async (budgetId: string, input: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!userId) return;
    try {
      const updatedBudget = await API.updateBudgetRecord(budgetId, input);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
    } catch (err: any) {
      console.error(err);
      alert('Failed to update budget: ' + err.message);
    }
  };

  const deleteBudget = async (budgetId: string) => {
    if (!userId) return;
    try {
      await API.deleteBudgetRecord(budgetId);
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete budget: ' + err.message);
    }
  };

  // Holdings CRUD
  const addHolding = async (input: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    try {
      const newHolding = await API.insertHolding(input, userId);
      setHoldings((prev) => [...prev, newHolding]);
    } catch (err: any) {
      console.error(err);
      alert('Failed to add holding: ' + err.message);
    }
  };

  const updateHolding = async (holdingId: string, input: Partial<Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!userId) return;
    try {
      const updatedHolding = await API.updateHoldingRecord(holdingId, input);
      setHoldings((prev) => prev.map((h) => (h.id === holdingId ? updatedHolding : h)));
    } catch (err: any) {
      console.error(err);
      alert('Failed to update holding: ' + err.message);
    }
  };

  // Valuations & Exchange Rates CRUD
  const addAssetValuation = async (input: Omit<AssetValuation, 'id' | 'createdAt'>) => {
    if (!userId) return;
    try {
      const newValuation = await API.insertAssetValuation(input, userId);
      setValuations((prev) => [newValuation, ...prev]);
    } catch (err: any) {
      console.error(err);
      alert('Failed to add valuation: ' + err.message);
    }
  };

  const addExchangeRate = async (input: Omit<ExchangeRate, 'id' | 'createdAt'>) => {
    if (!userId) return;
    try {
      const newRate = await API.insertExchangeRate(input, userId);
      setExchangeRates((prev) => {
        const filtered = prev.filter(
          (e) => !(e.fromCurrency === input.fromCurrency && e.toCurrency === input.toCurrency)
        );
        return [...filtered, newRate];
      });
    } catch (err: any) {
      console.error(err);
      alert('Failed to add exchange rate: ' + err.message);
    }
  };

  const updateExchangeRate = async (rateId: string, input: Partial<Omit<ExchangeRate, 'id' | 'createdAt'>>) => {
    if (!userId) return;
    try {
      const updatedRate = await API.updateExchangeRateRecord(rateId, input);
      setExchangeRates((prev) => prev.map((er) => (er.id === rateId ? updatedRate : er)));
    } catch (err: any) {
      console.error(err);
      alert('Failed to update exchange rate: ' + err.message);
    }
  };

  // Complex Asset Operations
  const addAssetBuyTransaction = async (input: {
    amount: number;
    fromAccountId: string;
    holdingId: string;
    date: string;
    quantity?: number;
    price?: number;
    title?: string;
    note?: string;
  }) => {
    if (!userId) return;
    const targetHolding = holdings.find((h) => h.id === input.holdingId);
    const sourceAccount = accounts.find((a) => a.id === input.fromAccountId);
    if (!targetHolding || !sourceAccount) return;

    const investCatId = categories.find(
      (c) => c.name === 'Investment' && c.kind === 'allocation'
    )?.id || null;

    await addTransaction({
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
    });
  };

  const addAssetSellTransaction = async (input: {
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
    if (!userId) return;
    const targetHolding = holdings.find((h) => h.id === input.holdingId);
    const destAccount = accounts.find((a) => a.id === input.destinationAccountId);
    if (!targetHolding || !destAccount) return;

    await addTransaction({
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
    });

    const derivedAfterSell = (() => {
      const avgCost = targetHolding.averageCost || 0;
      const sellQty = input.quantity || (input.price && input.price > 0 ? input.amount / input.price : 0);
      const remainingQty = Math.max(0, (targetHolding.quantity || 0) - sellQty);
      return remainingQty;
    })();
    
    if (derivedAfterSell === 0) {
      await updateHolding(input.holdingId, { status: 'sold' });
    }
  };

  const addAssetValueUpdateTransaction = async (input: {
    holdingId: string;
    currentValue: number;
    valuationDate: string;
    currentPrice?: number;
    exchangeRateToBase?: number;
    note?: string;
  }) => {
    if (!userId) return;
    const targetHolding = holdings.find((h) => h.id === input.holdingId);
    if (!targetHolding) return;

    try {
      const newValuation = await API.insertAssetValuation({
        holdingId: input.holdingId,
        valuationDate: input.valuationDate,
        price: input.currentPrice || null,
        value: input.currentValue,
        exchangeRateToBase: input.exchangeRateToBase || null,
        note: input.note,
      }, userId);
      setValuations((prev) => [newValuation, ...prev]);

      await addTransaction({
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
      });
    } catch (err: any) {
      console.error(err);
      alert('Failed to update asset value: ' + err.message);
    }
  };

  const updateHoldingValue = async (
    holdingId: string,
    valueInput: {
      currentValue: number;
      currentPrice?: number;
      exchangeRateToBase?: number;
      valuationDate: string;
      note?: string;
    }
  ) => {
    await addAssetValueUpdateTransaction({
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
        isLoadingData,
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
