import React from 'react';
import { X, Edit2, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { formatIDR } from '../../lib/finance/formatters';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetCategoryBreakdown } from './BudgetCategoryBreakdown';

interface ChildCategoryInfo {
  id: string;
  name: string;
  planned: number;
  used: number;
  remaining: number;
  percentage: number;
}

interface BudgetGroupInfo {
  name: string;
  planned: number;
  used: number;
  remaining: number;
  percentage: number;
  categories: ChildCategoryInfo[];
}

interface BudgetDetailSheetProps {
  group: BudgetGroupInfo;
  isOpen: boolean;
  onClose: () => void;
  onEditTrigger: () => void;
}

export const BudgetDetailSheet: React.FC<BudgetDetailSheetProps> = ({
  group,
  isOpen,
  onClose,
  onEditTrigger,
}) => {
  if (!isOpen) return null;

  const isSaving = group.name === 'Saving';

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet wrapper */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[85%] overflow-hidden animate-slide-up pb-8 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-base font-extrabold text-[#0b1c30] tracking-tight">{group.name} Budget</h2>
            <span className="text-[8px] font-extrabold uppercase bg-slate-50 text-slate-400 border border-slate-200 px-1 rounded-sm">
              {isSaving ? 'Allocation' : 'Expense'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable details area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-5">
          
          {/* Summary Mini visual panel */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-[#0b1c30] text-sm">Summary</span>
              <div className="space-x-1 font-extrabold">
                <span className="text-slate-900">{formatIDR(group.used)}</span>
                <span className="text-slate-400">/ {formatIDR(group.planned)}</span>
              </div>
            </div>
            <BudgetProgressBar percentage={group.percentage} />
            <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400">
              <span>{group.percentage.toFixed(0)}% Utilized</span>
              <span className={group.remaining >= 0 ? 'text-[#006c49]' : 'text-rose-500'}>
                {group.remaining >= 0 ? 'Remaining: ' : 'Overspent: '}
                {formatIDR(Math.abs(group.remaining))}
              </span>
            </div>
          </div>

          {/* Child Category drills breakdown */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Category Breakdown</h4>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-ambient">
              <BudgetCategoryBreakdown categories={group.categories} isSavingGroup={isSaving} />
            </div>
          </div>

          {/* Methodological Dynamic Warnings */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-400 leading-normal font-medium">
              {isSaving
                ? 'Saving budgets track dynamic asset acquisitions (asset_buy) and positive transfers from primary accounts into saving-purpose vaults (e.g. BCA to Emergency Envelopes).'
                : `Expense budgets track all manual ${group.name.toLowerCase()} outflows charged on daily spendable wallets (cash, e-wallets, bank pockets).`}
            </p>
          </div>

          {/* Edit Budget CTA Action button */}
          <button
            onClick={onEditTrigger}
            className="w-full py-3 bg-[#0F172A] hover:bg-[#1e293b] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-ambient hover:scale-[0.99]"
          >
            <Edit2 size={13} /> Adjust {group.name} Allocation Limit
          </button>

        </div>
      </div>
    </div>
  );
};
export default BudgetDetailSheet;
