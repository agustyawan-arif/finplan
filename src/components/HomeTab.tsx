'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, MinusCircle, ArrowRightLeft, TrendingUp, TrendingDown, ArrowRight, Wallet } from 'lucide-react';
import { formatIDR, formatDate, formatCurrency } from '../lib/finance/formatters';

interface HomeTabProps {
  onOpenDrawer: (type: 'expense' | 'income' | 'transfer') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onOpenDrawer }) => {
  const {
    getNetWorth,
    getAvailableCash,
    getMonthlyIncome,
    getMonthlyExpense,
    getMonthlyCashflow,
    getBudgetProgress,
    transactions,
    getCategoryName,
    getAccountName,
    setActiveTab,
    globalMonth,
  } = useApp();

  const currentMonth = globalMonth;
  const netWorth = getNetWorth();
  const availableCash = getAvailableCash();
  const income = getMonthlyIncome(currentMonth);
  const expense = getMonthlyExpense(currentMonth);
  const cashflow = getMonthlyCashflow(currentMonth);
  const budget = getBudgetProgress(currentMonth);

  // Recent 4 transactions
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-4 space-y-5">
      
      {/* Premium Dashboard Header (Dark Navy ledger style card) */}
      <div className="bg-gradient-to-br from-[#131b2e] to-[#0f172a] text-white p-6 rounded-[28px] shadow-ambient-md relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Net Worth</span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">{formatIDR(netWorth)}</h1>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Wallet size={10} /> Available Cash
              </span>
              <p className="text-base font-bold text-[#6cf8bb] mt-0.5">{formatIDR(availableCash)}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Monthly Cashflow</span>
              <p className={`text-base font-bold mt-0.5 ${cashflow >= 0 ? 'text-[#6cf8bb]' : 'text-rose-400'}`}>
                {cashflow >= 0 ? '+' : ''}{formatIDR(cashflow)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cashflow quick statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-ambient flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Income</span>
            <span className="text-xs font-bold text-slate-800">{formatIDR(income)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-ambient flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingDown size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Expense</span>
            <span className="text-xs font-bold text-slate-800">{formatIDR(expense)}</span>
          </div>
        </div>
      </div>

      {/* Quick Interactive Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d]">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onOpenDrawer('expense')}
            className="flex flex-col items-center justify-center bg-white border border-slate-100 p-3 rounded-2xl shadow-ambient hover:scale-95 transition-all text-rose-600 font-bold"
          >
            <MinusCircle size={24} className="mb-1" />
            <span className="text-[10px] text-[#0b1c30]">Expense</span>
          </button>
          <button
            onClick={() => onOpenDrawer('income')}
            className="flex flex-col items-center justify-center bg-white border border-slate-100 p-3 rounded-2xl shadow-ambient hover:scale-95 transition-all text-emerald-600 font-bold"
          >
            <PlusCircle size={24} className="mb-1" />
            <span className="text-[10px] text-[#0b1c30]">Income</span>
          </button>
          <button
            onClick={() => onOpenDrawer('transfer')}
            className="flex flex-col items-center justify-center bg-white border border-slate-100 p-3 rounded-2xl shadow-ambient hover:scale-95 transition-all text-[#006c49] font-bold"
          >
            <ArrowRightLeft size={24} className="mb-1" />
            <span className="text-[10px] text-[#0b1c30]">Transfer</span>
          </button>
        </div>
      </div>

      {/* Budget Group Progress */}
      <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-ambient space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#0b1c30]">Remaining Budget</h3>
            <span className="text-[10px] text-slate-400">{currentMonth} Monthly Limit</span>
          </div>
          <span className="text-sm font-extrabold text-primary">{formatIDR(budget.totalRemaining)}</span>
        </div>

        {/* Dynamic group indicators */}
        <div className="space-y-3.5">
          {budget.groups.map((group) => {
            const isSaving = group.name === 'Saving';
            const colorClass = isSaving ? 'bg-secondary' : 'bg-primary';
            const barPercentage = Math.min(group.percentage, 100);

            return (
              <div key={group.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{group.name}</span>
                  <div className="space-x-1">
                    <span className="font-bold text-[#0b1c30]">{formatIDR(group.used)}</span>
                    <span className="text-slate-400">/ {formatIDR(group.planned)}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${barPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#45464d]">Recent Transactions</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-[#006c49] flex items-center gap-0.5 hover:underline"
          >
            See All <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((t) => {
            const isExpense = t.type === 'expense';
            const isIncome = t.type === 'income';
            const isTransfer = t.type === 'transfer';
            const isAssetBuy = t.type === 'asset_buy';

            let sign = '';
            let valColor = 'text-[#0b1c30]';
            if (isExpense) {
              sign = '-';
              valColor = 'text-rose-600 font-semibold';
            } else if (isIncome) {
              sign = '+';
              valColor = 'text-emerald-600 font-semibold';
            } else if (isAssetBuy) {
              sign = '-';
              valColor = 'text-[#006c49] font-semibold';
            }

            return (
              <div
                key={t.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-ambient flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs capitalize shrink-0">
                    {t.type.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{t.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {isTransfer ? `BCA ➔ Gopay` : getCategoryName(t.categoryId)} • {getAccountName(t.accountId)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${valColor}`}>
                    {sign}
                    {formatCurrency(t.amount, t.currency)}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">{formatDate(t.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
