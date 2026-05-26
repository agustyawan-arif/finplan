import React from 'react';
import { formatIDR } from '../../lib/finance/formatters';

interface BudgetSummaryCardProps {
  totalPlanned: number;
  totalUsed: number;
  totalRemaining: number;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  totalPlanned,
  totalUsed,
  totalRemaining,
}) => {
  const percentage = totalPlanned > 0 ? (totalUsed / totalPlanned) * 100 : 0;
  const barPercentage = Math.min(percentage, 100);

  return (
    <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-ambient space-y-4 select-none">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Planned Budget</span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{formatIDR(totalPlanned)}</h1>
      </div>

      {/* Global Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F172A] rounded-full transition-all duration-500"
            style={{ width: `${barPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
          <span>Used: {formatIDR(totalUsed)} ({percentage.toFixed(0)}%)</span>
          <span className={totalRemaining >= 0 ? 'text-[#006c49]' : 'text-rose-500'}>
            {totalRemaining >= 0 ? 'Remaining: ' : 'Overspent: '}
            {formatIDR(Math.abs(totalRemaining))}
          </span>
        </div>
      </div>
    </div>
  );
};
export default BudgetSummaryCard;
