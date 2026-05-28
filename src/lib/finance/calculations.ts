import { Account, Category, Budget, Transaction, InvestmentHolding, ExchangeRate } from '../../types/finance';

/**
 * Helper: Converts any currency amount to standard base currency (IDR)
 */
export const convertCurrencyToBase = (
  amount: number,
  currency: string,
  exchangeRates: ExchangeRate[]
): number => {
  if (currency === 'IDR') return amount;
  const found = exchangeRates.find((e) => e.fromCurrency === currency);
  
  // Defensive fallbacks to prevent NaN
  const rate = found ? found.rate : (currency === 'USD' ? 16000 : (currency === 'SGD' ? 12000 : 1));
  return amount * rate;
};

/**
 * 1. Calculate specific Account Balance dynamically
 * balance = initialBalance + net transactions
 */
export const calculateAccountBalance = (
  account: Account,
  transactions: Transaction[]
): number => {
  let balance = account.initialBalance;

  transactions.forEach((t) => {
    // Direct influence on account cash outflow/inflow
    if (t.accountId === account.id) {
      if (t.type === 'expense') {
        balance -= t.amount;
      } else if (t.type === 'transfer') {
        balance -= t.amount;
      } else if (t.type === 'asset_buy') {
        balance -= t.amount;
      } else if (t.type === 'income') {
        balance += t.amount;
      } else if (t.type === 'asset_sell') {
        // Only increase brokerage cash if proceeds were NOT directly deposited into separate bank
        if (!t.destinationAccountId) {
          balance += t.amount;
        }
      } else if (t.type === 'adjustment') {
        balance += t.amount;
      }
    }

    // Indirect influence as target/recipient of funds
    if (t.destinationAccountId === account.id) {
      if (t.type === 'transfer') {
        balance += t.amount;
      } else if (t.type === 'asset_sell') {
        balance += t.amount;
      }
    }
  });

  return balance;
};

/**
 * 2. Calculate current balances for all active accounts
 */
export const calculateAllAccountBalances = (
  accounts: Account[],
  transactions: Transaction[]
): Record<string, number> => {
  const balances: Record<string, number> = {};
  accounts.forEach((acc) => {
    balances[acc.id] = calculateAccountBalance(acc, transactions);
  });
  return balances;
};

/**
 * 3. Calculate dynamic net worth in base currency
 * Net Worth = Sum of cash/bank/e-wallet cash balances + holdings values
 * Skipping cash balances of accounts whose values are already fully counted as holdings (DBS SGD or Deposit)
 */
export const calculateNetWorth = (
  accounts: Account[],
  holdings: InvestmentHolding[],
  transactions: Transaction[],
  exchangeRates: ExchangeRate[]
): number => {
  let cashAndBankTotal = 0;

  accounts.forEach((acc) => {
    if (acc.isActive) {
      const hasFullAssetHolding = holdings.some(
        (h) =>
          h.accountId === acc.id &&
          h.status === 'active' &&
          (h.assetType === 'foreign_currency' || h.assetType === 'deposit')
      );

      if (!hasFullAssetHolding) {
        const bal = calculateAccountBalance(acc, transactions);
        cashAndBankTotal += convertCurrencyToBase(bal, acc.currency, exchangeRates);
      }
    }
  });

  let assetValue = 0;
  holdings.forEach((h) => {
    if (h.status === 'active') {
      // Always derive from transaction ledger to avoid stale initial state
      const derived = deriveHoldingState(h, transactions);
      assetValue += convertCurrencyToBase(derived.currentValue, h.currency, exchangeRates);
    }
  });

  return cashAndBankTotal + assetValue;
};

/**
 * 4. Available Cash (Cash + Bank + E-wallet accounts in IDR)
 */
export const getAvailableCash = (
  accounts: Account[],
  transactions: Transaction[],
  exchangeRates: ExchangeRate[]
): number => {
  let cash = 0;
  accounts.forEach((acc) => {
    if (acc.type === 'cash' || acc.type === 'bank' || acc.type === 'e_wallet') {
      cash += convertCurrencyToBase(calculateAccountBalance(acc, transactions), acc.currency, exchangeRates);
    }
  });
  return cash;
};

/**
 * 5. Monthly Cashflow calculations (Income vs Expenses)
 */
export const calculateCashflow = (
  transactions: Transaction[],
  month: string,
  exchangeRates: ExchangeRate[]
) => {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.date.startsWith(month)) {
      const amountInBase = convertCurrencyToBase(t.amount, t.currency, exchangeRates);
      
      if (t.type === 'income' && !t.isExcludedFromCashflow) {
        income += amountInBase;
      } else if (t.type === 'expense' && !t.isExcludedFromCashflow) {
        expense += amountInBase;
      }
    }
  });

  return {
    income,
    expense,
    cashflow: income - expense,
  };
};

/**
 * 6. Category Tree Helpers
 */
export const getCategoryTreeHelpers = (categories: Category[]) => {
  const getChildrenIds = (parentCatId: string): string[] => {
    return categories.filter((c) => c.parentCategoryId === parentCatId).map((c) => c.id);
  };

  const isCategoryOrChild = (catId: string | null | undefined, targetCatId: string): boolean => {
    if (!catId) return false;
    if (catId === targetCatId) return true;
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.parentCategoryId === targetCatId : false;
  };

  return {
    getChildrenIds,
    isCategoryOrChild,
  };
};

/**
 * 7. Saving Allocation calculations
 * Count transfers into saving goals or asset buys
 */
export const calculateSavingAllocation = (
  accounts: Account[],
  transactions: Transaction[],
  month: string,
  exchangeRates: ExchangeRate[]
): number => {
  let used = 0;

  transactions.forEach((t) => {
    if (t.date.startsWith(month)) {
      const amountInBase = convertCurrencyToBase(t.amount, t.currency, exchangeRates);
      
      if (t.type === 'asset_buy') {
        used += amountInBase;
      } else if (t.type === 'transfer' && t.destinationAccountId) {
        const destAcc = accounts.find((a) => a.id === t.destinationAccountId);
        if (
          destAcc &&
          ['saving', 'emergency_fund', 'travel_fund', 'investment', 'deposit', 'subscription_fund'].includes(
            destAcc.purpose
          )
        ) {
          used += amountInBase;
        }
      }
    }
  });

  return used;
};

/**
 * 8. Category Budget usages rollup
 */
export const calculateBudgetUsage = (
  categories: Category[],
  transactions: Transaction[],
  month: string,
  categoryId: string,
  exchangeRates: ExchangeRate[]
): number => {
  let used = 0;
  const { isCategoryOrChild } = getCategoryTreeHelpers(categories);

  transactions.forEach((t) => {
    if (
      t.type === 'expense' &&
      t.date.startsWith(month) &&
      !t.isExcludedFromBudget &&
      isCategoryOrChild(t.categoryId, categoryId)
    ) {
      used += convertCurrencyToBase(t.amount, t.currency, exchangeRates);
    }
  });

  return used;
};

/**
 * 9. Asset Allocation calculations
 */
export const calculateAssetAllocation = (
  accounts: Account[],
  holdings: InvestmentHolding[],
  transactions: Transaction[],
  exchangeRates: ExchangeRate[]
) => {
  let cash = 0;
  let bank = 0;
  let eWallet = 0;
  let pocket = 0;
  let investment = 0;
  let deposit = 0;

  accounts.forEach((acc) => {
    if (!acc.isActive) return;
    
    const hasFullAssetHolding = holdings.some(
      (h) =>
        h.accountId === acc.id &&
        h.status === 'active' &&
        (h.assetType === 'foreign_currency' || h.assetType === 'deposit')
    );

    if (!hasFullAssetHolding) {
      const bal = calculateAccountBalance(acc, transactions);
      const converted = convertCurrencyToBase(bal, acc.currency, exchangeRates);
      
      if (acc.type === 'cash') cash += converted;
      else if (acc.type === 'bank') bank += converted;
      else if (acc.type === 'e_wallet') eWallet += converted;
      else if (acc.type === 'pocket') pocket += converted;
    }
  });

  holdings.forEach((h) => {
    if (h.status === 'active') {
      const derived = deriveHoldingState(h, transactions);
      const converted = convertCurrencyToBase(derived.currentValue, h.currency, exchangeRates);
      if (h.assetType === 'stock' || h.assetType === 'mutual_fund' || h.assetType === 'other') {
        investment += converted;
      } else if (h.assetType === 'deposit') {
        deposit += converted;
      } else if (h.assetType === 'foreign_currency') {
        bank += converted;
      }
    }
  });

  return [
    { name: 'Cash', value: cash },
    { name: 'Bank accounts', value: bank },
    { name: 'Pockets', value: pocket },
    { name: 'E-wallets', value: eWallet },
    { name: 'Investments', value: investment },
    { name: 'Deposits', value: deposit },
  ].filter((a) => a.value > 0);
};

/**
 * 10. Investment Gain/Loss calculation
 */
export const calculateInvestmentGainLoss = (
  holding: InvestmentHolding,
  exchangeRates: ExchangeRate[]
) => {
  const isFX = holding.assetType === 'foreign_currency';
  let principalIDR = holding.principalAmount || 0;
  let currentValueIDR = holding.currentValue;

  if (isFX) {
    if (!principalIDR && holding.quantity !== null && holding.quantity !== undefined && holding.averageCost) {
      principalIDR = holding.quantity * holding.averageCost;
    }
    const price = holding.currentPrice || 0;
    if (holding.quantity !== null && holding.quantity !== undefined && price > 0) {
      currentValueIDR = holding.quantity * price;
    } else {
      currentValueIDR = convertCurrencyToBase(holding.currentValue, holding.currency, exchangeRates);
    }
  } else {
    principalIDR = convertCurrencyToBase(holding.principalAmount || 0, holding.currency, exchangeRates);
    currentValueIDR = convertCurrencyToBase(holding.currentValue, holding.currency, exchangeRates);
  }

  const gainLoss = currentValueIDR - principalIDR;
  const percentage = principalIDR > 0 ? (gainLoss / principalIDR) * 100 : 0;

  return {
    principal: principalIDR,
    current: currentValueIDR,
    gainLoss,
    percentage,
  };
};
/**
 * 11. Derive current holding state by replaying related transactions on top of static initial values.
 * Ensures UI always shows accurate principal/value even when holding state is not replayed on startup.
 */
export const deriveHoldingState = (
  holding: InvestmentHolding,
  transactions: Transaction[]
): { principalAmount: number; currentValue: number; quantity: number | null; currentPrice: number | null } => {
  let principal = holding.principalAmount || 0;
  let currentValue = holding.currentValue;
  let quantity: number | null = holding.quantity ?? null;
  let currentPrice: number | null = holding.currentPrice ?? null;

  const holdingTxs = transactions
    .filter((t) => t.holdingId === holding.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  holdingTxs.forEach((tx) => {
    if (tx.type === 'asset_buy') {
      principal += tx.amount;
      if (quantity !== null && currentPrice && currentPrice > 0) {
        const qtyBought = tx.amount / currentPrice;
        quantity = (quantity || 0) + qtyBought;
        currentValue = quantity * currentPrice;
      } else {
        currentValue += tx.amount;
      }
    } else if (tx.type === 'asset_sell') {
      const avgCost = holding.averageCost || 0;
      const sellQty = quantity !== null && currentPrice && currentPrice > 0 ? tx.amount / currentPrice : 0;
      quantity = Math.max(0, (quantity || 0) - sellQty);
      principal = Math.max(0, principal - sellQty * avgCost);
      currentValue =
        quantity > 0 && currentPrice ? quantity * currentPrice : Math.max(0, currentValue - tx.amount);
    } else if (tx.type === 'asset_value_update') {
      // tx.amount is the new absolute currentValue
      currentValue = tx.amount;
      if (quantity && quantity > 0) {
        currentPrice = tx.amount / quantity;
      }
    }
  });

  return { principalAmount: principal, currentValue, quantity, currentPrice };
};
