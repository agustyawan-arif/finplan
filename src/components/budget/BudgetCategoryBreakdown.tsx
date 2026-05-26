import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { formatIDR } from '../../lib/finance/formatters';

interface ChildCategoryInfo {
  id: string;
  name: string;
  planned: number;
  used: number;
  remaining: number;
  percentage: number;
}

interface BudgetCategoryBreakdownProps {
  categories: ChildCategoryInfo[];
  isSavingGroup?: boolean;
}

export const BudgetCategoryBreakdown: React.FC<BudgetCategoryBreakdownProps> = ({
  categories,
  isSavingGroup = false,
}) => {
  if (categories.length === 0) {
    return <p className="text-[10px] text-slate-400 italic text-center py-2">No categories defined.</p>;
  }

  return (
    <div className="space-y-2.5 select-none animate-fade-in">
      {categories.map((c) => (
        <div key={c.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="font-semibold text-slate-700">{c.name}</span>
          </div>
          <div className="flex items-center gap-1.5 font-extrabold text-[#0b1c30]">
            <span>{formatIDR(c.used)}</span>
            {isSavingGroup && c.used > 0 && (
              <span className="text-[9px] text-[#006c49] bg-emerald-50 px-1 rounded-sm flex items-center font-bold">
                Saved <ArrowUpRight size={8} className="ml-0.5" />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default BudgetCategoryBreakdown;
