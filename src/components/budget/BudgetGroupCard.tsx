import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatIDR } from '../../lib/finance/formatters';
import { BudgetProgressBar } from './BudgetProgressBar';

interface BudgetGroupCardProps {
  name: string;
  planned: number;
  used: number;
  remaining: number;
  percentage: number;
  onClick: () => void;
}

export const BudgetGroupCard: React.FC<BudgetGroupCardProps> = ({
  name,
  planned,
  used,
  remaining,
  percentage,
  onClick,
}) => {
  const isOver = used > planned;
  const isWarning = used > planned * 0.75 && used <= planned;

  // Status visual label selectors
  const getStatusBadge = () => {
    if (planned === 0) return null;
    if (isOver) {
      return (
        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
          Over Budget
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
          Warning Limit
        </span>
      );
    }
    return (
      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
        Safe
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-ambient overflow-hidden transition-all duration-300 cursor-pointer hover:bg-slate-50/50 flex flex-col p-4 space-y-3 select-none"
    >
      {/* Top Header Row */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-800 text-sm">{name}</span>
            {getStatusBadge()}
          </div>
          <p className="text-[9px] font-medium text-slate-400">
            {name === 'Saving' ? 'Saving Allocations' : 'Operational Outflows'}
          </p>
        </div>
        <div className="flex items-center gap-0.5 text-slate-400">
          <span className="text-[10px] font-bold text-[#0b1c30]">{formatIDR(used)}</span>
          <span className="text-[10px] text-slate-400 font-medium">/ {formatIDR(planned)}</span>
          <ChevronRight size={14} className="ml-1" />
        </div>
      </div>

      {/* Progress visual tracker */}
      <div className="space-y-1">
        <BudgetProgressBar percentage={percentage} />
        <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400">
          <span>{percentage.toFixed(0)}% Used</span>
          <span className={remaining >= 0 ? 'text-[#006c49]' : 'text-rose-500'}>
            {remaining >= 0 ? 'Remaining: ' : 'Overspent: '}
            {formatIDR(Math.abs(remaining))}
          </span>
        </div>
      </div>
    </div>
  );
};
export default BudgetGroupCard;
