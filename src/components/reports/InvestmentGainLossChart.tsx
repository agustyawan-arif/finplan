'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCompactCurrency, formatIDR, formatPercentage } from '../../lib/finance/formatters';
import { InvestmentGainLossItem } from '../../lib/finance/reportData';
import { ReportEmptyState } from './ReportEmptyState';
import { useApp } from '../../context/AppContext';

interface InvestmentGainLossChartProps {
  data: InvestmentGainLossItem[];
}

const GainBadge: React.FC<{ value: number; pct: number; isPositive: boolean }> = ({
  value,
  pct,
  isPositive,
}) => {
  if (value === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400">
        <Minus size={10} /> 0%
      </span>
    );
  }
  return (
    <span
      className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-lg
        ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}
    >
      {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {isPositive ? '+' : ''}{formatPercentage(pct)}
    </span>
  );
};

export const InvestmentGainLossChart: React.FC<InvestmentGainLossChartProps> = ({ data }) => {
  const { showAmounts } = useApp();
  if (data.length === 0) return <ReportEmptyState message="No investment or deposit holdings found." />;

  const totalGain = data.reduce((sum, d) => sum + d.gainLossConverted, 0);
  const isOverallPositive = totalGain >= 0;

  return (
    <div className="space-y-3">
      {/* Overall gain/loss header */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs
          ${isOverallPositive ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}
      >
        <span className={`font-bold ${isOverallPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
          Total Unrealized P&L
        </span>
        <span className={`font-black ${isOverallPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
          {showAmounts ? `${isOverallPositive ? '+' : ''}${formatIDR(totalGain)}` : '••••••'}
        </span>
      </div>

      {/* Per-holding rows */}
      <div className="space-y-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-800 truncate">{item.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {item.isDeposit && (
                    <span className="text-[7px] font-extrabold text-amber-600 bg-amber-50 px-1 rounded uppercase">
                      Deposit
                    </span>
                  )}
                  {item.isFX && (
                    <span className="text-[7px] font-extrabold text-sky-600 bg-sky-50 px-1 rounded uppercase">
                      FX
                    </span>
                  )}
                </div>
              </div>
              <GainBadge value={item.gainLoss} pct={item.percentage} isPositive={item.isPositive} />
            </div>

            <div className="grid grid-cols-3 gap-1 text-[9px]">
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[8px]">Cost</p>
                <p className="font-bold text-slate-700">{showAmounts ? formatCompactCurrency(item.principal, 'IDR') : '••••••'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[8px]">Value</p>
                <p className="font-bold text-slate-700">{showAmounts ? formatCompactCurrency(item.currentValue, 'IDR') : '••••••'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[8px]">Gain/Loss</p>
                <p
                  className={`font-black ${
                    item.gainLoss === 0
                      ? 'text-slate-500'
                      : item.isPositive
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {item.gainLoss === 0 ? '—' : (item.isPositive ? '+' : '')}
                  {showAmounts ? formatCompactCurrency(Math.abs(item.gainLossConverted), 'IDR') : '••••••'}
                </p>
              </div>
            </div>

            {/* Visual bar */}
            {item.principal > 0 && (
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{
                    width: `${Math.min((item.currentValue / Math.max(item.principal, item.currentValue)) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
