'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMonth } from '../lib/finance/formatters';
import {
  getBudgetVsActualData,
  getSpendingByCategoryData,
  getCashflowReportData,
  getNetWorthBreakdownData,
  getAssetAllocationData,
  getInvestmentGainLossData,
} from '../lib/finance/reportData';
import { calculateSavingAllocation, calculateBudgetUsage } from '../lib/finance/calculations';

import { ReportsSummaryCards } from './reports/ReportsSummaryCards';
import { ReportCard } from './reports/ReportCard';
import { BudgetVsActualChart } from './reports/BudgetVsActualChart';
import { SpendingByCategoryChart } from './reports/SpendingByCategoryChart';
import { CashflowChart } from './reports/CashflowChart';
import { NetWorthBreakdownChart } from './reports/NetWorthBreakdownChart';
import { AssetAllocationChart } from './reports/AssetAllocationChart';
import { InvestmentGainLossChart } from './reports/InvestmentGainLossChart';

// Generate last 6 months relative to current date
const generateMonths = (): string[] => {
  const months: string[] = [];
  const base = new Date('2026-05-01');
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

const MONTHS = generateMonths();

export const ReportsTab: React.FC = () => {
  const {
    accounts,
    categories,
    budgets,
    transactions,
    holdings,
    exchangeRates,
    getNetWorth,
    getMonthlyIncome,
    getMonthlyExpense,
    getMonthlyCashflow,
    globalMonth,
  } = useApp();

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const month = globalMonth;

  // ── All report data via adapters ──────────────────────────────────────────

  const budgetVsActual = useMemo(
    () => getBudgetVsActualData(categories, budgets, accounts, transactions, month, exchangeRates),
    [categories, budgets, accounts, transactions, month, exchangeRates]
  );

  const spendingByCategory = useMemo(
    () => getSpendingByCategoryData(categories, transactions, month, exchangeRates),
    [categories, transactions, month, exchangeRates]
  );
  const totalExpense = useMemo(
    () => spendingByCategory.reduce((s, d) => s + d.value, 0),
    [spendingByCategory]
  );

  const cashflowData = useMemo(
    () => getCashflowReportData(transactions, month, exchangeRates),
    [transactions, month, exchangeRates]
  );

  const netWorthBreakdown = useMemo(
    () => getNetWorthBreakdownData(accounts, holdings, transactions, exchangeRates),
    [accounts, holdings, transactions, exchangeRates]
  );
  const netWorthTotal = useMemo(
    () => netWorthBreakdown.reduce((s, d) => s + d.value, 0),
    [netWorthBreakdown]
  );

  const assetAllocation = useMemo(
    () => getAssetAllocationData(accounts, holdings, transactions, exchangeRates),
    [accounts, holdings, transactions, exchangeRates]
  );
  const assetTotal = useMemo(
    () => assetAllocation.reduce((s, d) => s + d.value, 0),
    [assetAllocation]
  );

  const gainLossData = useMemo(
    () => getInvestmentGainLossData(holdings, transactions, exchangeRates),
    [holdings, transactions, exchangeRates]
  );

  // ── Summary card values ───────────────────────────────────────────────────
  const netWorth = getNetWorth();
  const income = getMonthlyIncome(month);
  const expense = getMonthlyExpense(month);
  const netCashflow = getMonthlyCashflow(month);
  const budgetUsed = budgetVsActual.reduce((s, d) => s + d.actual, 0);
  const savingAllocation = calculateSavingAllocation(accounts, transactions, month, exchangeRates);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
        Loading reports…
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 pt-4 space-y-5">

      {/* Summary Cards */}
      <ReportsSummaryCards
        netWorth={netWorth}
        income={income}
        expense={expense}
        netCashflow={netCashflow}
        budgetUsed={budgetUsed}
        savingAllocation={savingAllocation}
      />

      {/* 1. Budget vs Actual */}
      <ReportCard
        title="Budget vs Actual"
        subtitle={`${formatMonth(month)} allocation vs spending`}
      >
        <BudgetVsActualChart data={budgetVsActual} />
      </ReportCard>

      {/* 2. Spending by Category */}
      <ReportCard
        title="Spending by Category"
        subtitle="Expense breakdown by category"
      >
        <SpendingByCategoryChart data={spendingByCategory} total={totalExpense} />
      </ReportCard>

      {/* 3. Monthly Cashflow */}
      <ReportCard
        title="Monthly Cashflow"
        subtitle="Income · Expenses · Net (IDR)"
      >
        <CashflowChart data={cashflowData} />
      </ReportCard>

      {/* 4. Net Worth Breakdown */}
      <ReportCard
        title="Net Worth Breakdown"
        subtitle="All accounts and holdings · IDR equivalent"
      >
        <NetWorthBreakdownChart data={netWorthBreakdown} total={netWorthTotal} />
      </ReportCard>

      {/* 5. Asset Allocation */}
      <ReportCard
        title="Asset Allocation"
        subtitle="Wealth by asset class · IDR equivalent"
      >
        <AssetAllocationChart data={assetAllocation} total={assetTotal} />
      </ReportCard>

      {/* 6. Investment Gain/Loss */}
      <ReportCard
        title="Investment Performance"
        subtitle="Unrealized P&L per holding"
      >
        <InvestmentGainLossChart data={gainLossData} />
      </ReportCard>

    </div>
  );
};
