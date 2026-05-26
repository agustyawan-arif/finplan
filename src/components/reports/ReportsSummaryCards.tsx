'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpDown, PiggyBank, DollarSign } from 'lucide-react';
import { formatIDR, formatCompactCurrency } from '../../lib/finance/formatters';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  isNegativeGood?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, accent, isNegativeGood }) => {
  const isNegative = value < 0;
  const textColor = isNegative
    ? isNegativeGood ? 'text-emerald-600' : 'text-rose-600'
    : 'text-[#0b1c30]';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-ambient p-3.5 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
        <span className={`text-sm font-black leading-tight block truncate ${textColor}`}>
          {formatCompactCurrency(Math.abs(value), 'IDR')}
          {isNegative && <span className="text-[10px] ml-0.5 font-semibold opacity-70">(neg)</span>}
        </span>
      </div>
    </div>
  );
};

interface ReportsSummaryCardsProps {
  netWorth: number;
  income: number;
  expense: number;
  netCashflow: number;
  budgetUsed: number;
  savingAllocation: number;
}

export const ReportsSummaryCards: React.FC<ReportsSummaryCardsProps> = ({
  netWorth,
  income,
  expense,
  netCashflow,
  budgetUsed,
  savingAllocation,
}) => {
  const cards = [
    {
      label: 'Net Worth',
      value: netWorth,
      icon: <Wallet size={15} className="text-indigo-600" />,
      accent: 'bg-indigo-50',
    },
    {
      label: 'Income',
      value: income,
      icon: <TrendingUp size={15} className="text-emerald-600" />,
      accent: 'bg-emerald-50',
    },
    {
      label: 'Expenses',
      value: expense,
      icon: <TrendingDown size={15} className="text-rose-600" />,
      accent: 'bg-rose-50',
    },
    {
      label: 'Net Cashflow',
      value: netCashflow,
      icon: <ArrowUpDown size={15} className="text-violet-600" />,
      accent: 'bg-violet-50',
    },
    {
      label: 'Budget Used',
      value: budgetUsed,
      icon: <DollarSign size={15} className="text-amber-600" />,
      accent: 'bg-amber-50',
    },
    {
      label: 'Saving',
      value: savingAllocation,
      icon: <PiggyBank size={15} className="text-sky-600" />,
      accent: 'bg-sky-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {cards.map((c) => (
        <SummaryCard key={c.label} {...c} />
      ))}
    </div>
  );
};
