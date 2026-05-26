import {
  mockAccounts,
  mockCategories,
  mockBudgets,
  mockTransactions,
  mockHoldings,
  mockExchangeRates,
} from '../../data/index';
import { mockExpectedResults } from '../../data/mockExpectedResults';
import {
  calculateAccountBalance,
  calculateNetWorth,
  calculateCashflow,
  calculateBudgetUsage,
  calculateSavingAllocation,
  convertCurrencyToBase,
} from './calculations';

export const runMockDataValidation = () => {
  console.log('🧪 Running Developer Mock Data Validation for May 2026...');
  let hasFailed = false;

  const logAssertion = (name: string, actual: number, expected: number) => {
    const diff = Math.abs(actual - expected);
    if (diff < 1e-2) {
      console.log(`✅ [PASS] ${name}: actual ${actual.toLocaleString()} matches expected.`);
    } else {
      console.error(`❌ [FAIL] ${name}: actual ${actual.toLocaleString()} !== expected ${expected.toLocaleString()}. Delta: ${diff.toLocaleString()}`);
      hasFailed = true;
    }
  };

  // 1. Simulate reactive transactional side-effects on holdings copy
  const holdingsCopy = mockHoldings.map((h) => ({ ...h }));

  mockTransactions.forEach((tx) => {
    if (tx.type === 'asset_buy' && tx.holdingId) {
      const h = holdingsCopy.find((hold) => hold.id === tx.holdingId);
      if (h) {
        h.principalAmount = (h.principalAmount || 0) + tx.amount;
        if (h.quantity !== null && h.currentPrice) {
          const qtyBought = tx.amount / h.currentPrice;
          h.quantity = (h.quantity || 0) + qtyBought;
          h.currentValue = h.quantity * h.currentPrice;
        } else {
          h.currentValue = h.currentValue + tx.amount;
        }
      }
    } else if (tx.type === 'asset_sell' && tx.holdingId) {
      const h = holdingsCopy.find((hold) => hold.id === tx.holdingId);
      if (h) {
        const avg = h.averageCost || 0;
        const sellQty = h.quantity ? tx.amount / (h.currentPrice || 1) : 0;
        h.quantity = Math.max(0, (h.quantity || 0) - sellQty);
        h.principalAmount = Math.max(0, (h.principalAmount || 0) - sellQty * avg);
        h.currentValue = h.quantity > 0 ? h.quantity * (h.currentPrice || 1) : 0;
      }
    } else if (tx.type === 'asset_value_update' && tx.holdingId) {
      const h = holdingsCopy.find((hold) => hold.id === tx.holdingId);
      if (h) {
        h.currentValue = tx.amount;
        if (h.quantity) {
          h.currentPrice = tx.amount / h.quantity;
        }
      }
    }
  });

  // 2. Validate Cashflow
  const cashflow = calculateCashflow(mockTransactions, '2026-05', mockExchangeRates);
  logAssertion('Cashflow Income', cashflow.income, mockExpectedResults.cashflow.income);
  logAssertion('Cashflow Expense', cashflow.expense, mockExpectedResults.cashflow.expenses.total);
  logAssertion('Net Cashflow', cashflow.cashflow, mockExpectedResults.cashflow.netCashflow);

  // 3. Validate Budgets
  const needsUsed = calculateBudgetUsage(mockCategories, mockTransactions, '2026-05', 'cat_needs', mockExchangeRates);
  logAssertion('Needs Budget Usage', needsUsed, mockExpectedResults.budgets.Needs.used);

  const wantsUsed = calculateBudgetUsage(mockCategories, mockTransactions, '2026-05', 'cat_wants', mockExchangeRates);
  logAssertion('Wants Budget Usage', wantsUsed, mockExpectedResults.budgets.Wants.used);

  const charityUsed = calculateBudgetUsage(mockCategories, mockTransactions, '2026-05', 'cat_charity', mockExchangeRates);
  logAssertion('Charity Budget Usage', charityUsed, mockExpectedResults.budgets.Charity.used);

  const savingUsed = calculateSavingAllocation(mockAccounts, mockTransactions, '2026-05', mockExchangeRates);
  logAssertion('Saving Allocation', savingUsed, mockExpectedResults.budgets.Saving.used);

  // 4. Validate Account Balances
  mockAccounts.forEach((acc) => {
    const bal = calculateAccountBalance(acc, mockTransactions);
    if (acc.id === 'acc_sgd_bank') {
      logAssertion(`Account Balance SGD [Native] (${acc.name})`, bal, mockExpectedResults.accounts.acc_sgd_bank.native);
      const converted = convertCurrencyToBase(bal, acc.currency, mockExchangeRates);
      logAssertion(`Account Balance SGD [Converted] (${acc.name})`, converted, mockExpectedResults.accounts.acc_sgd_bank.converted);
    } else {
      const expectedBal = (mockExpectedResults.accounts as any)[acc.id];
      if (expectedBal !== undefined) {
        logAssertion(`Account Balance (${acc.name})`, bal, expectedBal);
      }
    }
  });

  // 5. Validate Holdings Values and Cost Bases
  holdingsCopy.forEach((h) => {
    const expected = (mockExpectedResults.holdings as any)[h.id];
    if (expected) {
      if (h.id === 'hold_sgd_balance') {
        logAssertion(`Holding Converted Value (${h.name})`, convertCurrencyToBase(h.currentValue, h.currency, mockExchangeRates), expected.converted);
        logAssertion(`Holding Cost Basis (${h.name})`, h.principalAmount || 0, expected.costBasis);
      } else {
        logAssertion(`Holding Value (${h.name})`, h.currentValue, expected.currentValue);
        logAssertion(`Holding Principal (${h.name})`, h.principalAmount || 0, expected.principal);
      }
    }
  });

  // 6. Validate Net Worth
  // Pass original mockHoldings (initial snapshot), NOT holdingsCopy.
  // calculateNetWorth now calls deriveHoldingState internally, so passing
  // a pre-replayed holdingsCopy would cause double-counting of transactions.
  const calculatedNetWorth = calculateNetWorth(
    mockAccounts,
    mockHoldings,
    mockTransactions,
    mockExchangeRates
  );
  logAssertion('Net Worth', calculatedNetWorth, mockExpectedResults.netWorth);

  if (!hasFailed) {
    console.log('🎉 ALL MOCK DATA CALCULATIONS PASSED SUCCESSFULLY!');
  } else {
    console.error('⚠️ SOME CALCULATIONS HAVE MISMATCHES! Please audit calculations.ts.');
  }

  return !hasFailed;
};

// Auto-trigger on imports in development environments
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).runMockDataValidation = runMockDataValidation;
  setTimeout(() => {
    try {
      runMockDataValidation();
    } catch (e) {
      console.error('Error auto-triggering mock validation:', e);
    }
  }, 1000);
}
