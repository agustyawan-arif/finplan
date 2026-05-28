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
import { supabase } from '../lib/supabase/client';
import { useToast } from '../hooks/useToast';

interface AppContextType {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  holdings: InvestmentHolding[];
  exchangeRates: ExchangeRate[];
  valuations: AssetValuation[];
  isLoadingData: boolean;
  refreshData: (silent?: boolean) => Promise<void>;
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
  addTransferWithFee: (
    transferData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    feeAmount?: number,
    feeCategoryId?: string
  ) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({ children, userId }) => {
  const { showSuccess, showError } = useToast();
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

  const loadData = React.useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setIsLoadingData(true);
    try {
      let data = await API.fetchAllFinanceData(userId);
      
      if (data.categories.length === 0) {
        // New user -> seed categories
        await API.seedDefaultCategories(userId);
        data = await API.fetchAllFinanceData(userId); // reload
      } else {
        // Existing user -> check if 'Subscription Fund' category is missing under parent 'Saving'
        const parentSaving = data.categories.find(c => c.name === 'Saving' && !c.parentCategoryId);
        const hasSubscriptionFund = data.categories.some(
          c => c.name === 'Subscription Fund' && c.parentCategoryId === parentSaving?.id
        );
        if (parentSaving && !hasSubscriptionFund) {
          try {
            await supabase.from('categories').insert({
              user_id: userId,
              name: 'Subscription Fund',
              kind: 'allocation',
              budget_behavior: 'allocation',
              parent_category_id: parentSaving.id,
              sort_order: 35
            });
            // Reload data to get the new category loaded
            data = await API.fetchAllFinanceData(userId);
          } catch (insertErr) {
            console.error('Failed to auto-sync missing Subscription Fund category:', insertErr);
          }
        }
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
      showError('Failed to load finance data. Please check your connection.');
    } finally {
      setIsLoadingData(false);
    }
  }, [userId]);

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
    loadData();
  }, [userId, loadData]);

  const refreshData = React.useCallback(async (silent = false) => {
    await loadData(silent);
  }, [loadData]);

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
                  else if (destAcc.purpose === 'subscription_fund' && c.name === 'Subscription Fund') isMatch = true;
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

  const addTransaction = async (tData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    try {
      const newTx = await API.insertTransaction(tData, userId);
      setTransactions((prev) => [newTx, ...prev]);

      let successMsg = 'Transaction recorded';
      if (tData.type === 'expense') successMsg = 'Expense added';
      else if (tData.type === 'income') successMsg = 'Income added';
      else if (tData.type === 'transfer') successMsg = 'Transfer added';
      else if (tData.type === 'adjustment') successMsg = 'Adjustment added';
      else if (tData.type === 'asset_buy') successMsg = 'Asset buy recorded';
      else if (tData.type === 'asset_sell') successMsg = 'Asset sell recorded';
      else if (tData.type === 'asset_value_update') successMsg = 'Asset value updated';

      showSuccess(successMsg);
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t save transaction. Please try again.');
    }
  };

  const addTransferWithFee = async (
    transferData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    feeAmount?: number,
    feeCategoryId?: string
  ) => {
    if (!userId) return;
    let createdTransferTx: Transaction | null = null;
    try {
      // 1. Create transfer transaction
      createdTransferTx = await API.insertTransaction(transferData, userId);
      
      // Update state for transfer
      setTransactions((prev) => [createdTransferTx!, ...prev]);

      // 2. If feeAmount is specified and > 0, create the fee expense transaction
      if (feeAmount && feeAmount > 0) {
        if (!feeCategoryId) {
          throw new Error('Fee category is required when fee amount is greater than 0.');
        }

        const feeData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
          type: 'expense',
          accountId: transferData.accountId,
          amount: feeAmount,
          currency: transferData.currency,
          categoryId: feeCategoryId,
          title: 'Transfer fee',
          note: `Linked to transfer to ${getAccountName(transferData.destinationAccountId)}`,
          relatedTransactionId: createdTransferTx.id,
          date: transferData.date,
          exchangeRateToBase: transferData.exchangeRateToBase,
          isExcludedFromBudget: false,
          isExcludedFromCashflow: false,
        };

        try {
          const newFeeTx = await API.insertTransaction(feeData, userId);
          setTransactions((prev) => [newFeeTx, ...prev]);
          showSuccess('Transfer and fee added');
        } catch (feeErr) {
          console.error('Failed to create transfer fee, attempting rollback of transfer:', feeErr);
          // Rollback the transfer transaction
          try {
            await API.deleteTransactionRecord(createdTransferTx.id);
            setTransactions((prev) => prev.filter((t) => t.id !== createdTransferTx!.id));
          } catch (rollbackErr) {
            console.error('Rollback of transfer failed:', rollbackErr);
          }
          throw new Error('Failed to record transfer fee. The transfer has been cancelled to keep data consistent.');
        }
      } else {
        showSuccess('Transfer added');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Couldn’t save transfer. Please try again.');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    try {
      // Find if there is any related transaction (e.g. child fee pointing to this transfer)
      const childTx = transactions.find((t) => t.relatedTransactionId === id);
      
      if (childTx) {
        // Delete child transaction first because of foreign key constraint
        await API.deleteTransactionRecord(childTx.id);
      }

      await API.deleteTransactionRecord(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id && t.relatedTransactionId !== id));
      showSuccess('Transaction deleted');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t delete transaction. Please try again.');
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
      showSuccess('Account created');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t create account. Please check your connection.');
    }
  };

  const updateAccount = async (accountId: string, input: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!userId) return;
    try {
      const updatedAcc = await API.updateAccountRecord(accountId, input);
      setAccounts((prev) => prev.map((acc) => (acc.id === accountId ? updatedAcc : acc)));
      showSuccess('Account updated');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t update account. Please try again.');
    }
  };

  const deactivateAccount = async (accountId: string) => {
    if (!userId) return;
    try {
      const updatedAcc = await API.updateAccountRecord(accountId, { isActive: false });
      setAccounts((prev) => prev.map((acc) => (acc.id === accountId ? updatedAcc : acc)));
      showSuccess('Account deactivated');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t deactivate account. Please try again.');
    }
  };

  // Budgets CRUD
  const addBudget = async (input: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    try {
      const newBudget = await API.insertBudget(input, userId);
      setBudgets((prev) => [...prev, newBudget]);
      showSuccess('Budget goal created');
    } catch (err: any) {
      console.error(err);
      if (err.code === '23505') {
        showError('Budget already exists for this category and month.');
      } else {
        showError('Couldn’t create budget. Please try again.');
      }
    }
  };

  const updateBudget = async (budgetId: string, input: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!userId) return;
    try {
      const updatedBudget = await API.updateBudgetRecord(budgetId, input);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
      showSuccess('Budget goal updated');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t update budget. Please try again.');
    }
  };

  const deleteBudget = async (budgetId: string) => {
    if (!userId) return;
    try {
      await API.deleteBudgetRecord(budgetId);
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
      showSuccess('Budget goal removed');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t remove budget. Please try again.');
    }
  };

  // Holdings CRUD
  const addHolding = async (input: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    try {
      const newHolding = await API.insertHolding(input, userId);
      setHoldings((prev) => [...prev, newHolding]);
      showSuccess('Holding created');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t create holding. Please try again.');
    }
  };

  const updateHolding = async (holdingId: string, input: Partial<Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!userId) return;
    try {
      const updatedHolding = await API.updateHoldingRecord(holdingId, input);
      setHoldings((prev) => prev.map((h) => (h.id === holdingId ? updatedHolding : h)));
      
      if (input.status === 'sold') {
        showSuccess('Holding closed');
      } else {
        showSuccess('Holding updated');
      }
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t update holding. Please try again.');
    }
  };

  // Valuations & Exchange Rates CRUD
  const addAssetValuation = async (input: Omit<AssetValuation, 'id' | 'createdAt'>) => {
    if (!userId) return;
    try {
      const newValuation = await API.insertAssetValuation(input, userId);
      setValuations((prev) => [newValuation, ...prev]);
      showSuccess('Asset value updated');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t update asset value. Please try again.');
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
      showSuccess('Exchange rate updated');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t save exchange rate. Please try again.');
    }
  };

  const updateExchangeRate = async (rateId: string, input: Partial<Omit<ExchangeRate, 'id' | 'createdAt'>>) => {
    if (!userId) return;
    try {
      const updatedRate = await API.updateExchangeRateRecord(rateId, input);
      setExchangeRates((prev) => prev.map((er) => (er.id === rateId ? updatedRate : er)));
      showSuccess('Exchange rate updated');
    } catch (err: any) {
      console.error(err);
      showError('Couldn’t update exchange rate. Please try again.');
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
      showError('Couldn’t update asset value. Please try again.');
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
        refreshData,
        activeTab,
        setActiveTab,
        globalMonth,
        setGlobalMonth,
        addTransaction,
        addTransferWithFee,
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
