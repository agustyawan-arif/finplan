export const mockExpectedResults = {
  cashflow: {
    income: 10000000,
    expenses: {
      cat_food: 50000,
      cat_rent: 2000000,
      cat_wants_food: 30000,
      cat_travel: 350000,
      cat_donation: 100000,
      total: 2530000,
    },
    netCashflow: 7470000,
  },
  budgets: {
    Needs: {
      planned: 3000000,
      used: 2050000, // Food 50k + Rent 2M
      remaining: 950000,
      percentage: 68.33333333333333,
    },
    Wants: {
      planned: 1000000,
      used: 380000, // Coffee 30k + Trail Run 350k
      remaining: 620000,
      percentage: 38.0,
    },
    Charity: {
      planned: 300000,
      used: 100000, // Donation 100k
      remaining: 200000,
      percentage: 33.33333333333333,
    },
    Saving: {
      planned: 3000000,
      used: 3500000, // Transfer to EF 500k + Buy Bibit 1M + Buy Deposit 2M
      remaining: -500000,
      percentage: 116.66666666666667,
    },
  },
  accounts: {
    acc_cash_wallet: 500000,
    acc_bca_main: 10820000, // Initial 5M + Salary 10M - Rent 2M - Coffee 30k - Trail Run 350k - Donation 100k - Topup Gopay 200k - Transfer EF 500k - Buy Bibit 1M
    acc_gopay: 340000, // Initial 200k - Food 50k + Topup 200k - Adjustment 10k
    acc_superbank_main: 1000000, // Initial 3M - Buy Deposit 2M
    acc_emergency_fund: 10500000, // Initial 10M + Transfer 500k
    acc_travel_fund: 2000000,
    acc_sgd_bank: {
      native: 1000,
      converted: 12100000, // 1000 SGD * 12100 exchange rate
    },
  },
  holdings: {
    hold_bibit: {
      principal: 6000000, // 5M initial + 1M buy
      currentValue: 6200000, // updated directly by asset_value_update
      unrealizedGain: 200000,
    },
    hold_bbca: {
      principal: 900000,
      currentValue: 950000,
      unrealizedGain: 50000,
    },
    hold_deposito_superbank: {
      principal: 12000000, // 10M initial + 2M buy
      currentValue: 12000000,
      unrealizedGain: 0,
    },
    hold_sgd_balance: {
      native: 1000,
      converted: 12100000, // 1000 SGD * 12100
      costBasis: 11800000, // 1000 * 11800
      unrealizedGain: 300000,
    },
  },
  netWorth: 56410000, // Liquid subtotal 25,160,000 + Holdings 31,250,000
};
export default mockExpectedResults;
