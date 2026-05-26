import React from 'react';
import { TransactionType } from '../../types/finance';
import { ShoppingBag, TrendingUp, ArrowRightLeft, PlusCircle, MinusCircle, RefreshCw, Sliders, X } from 'lucide-react';

interface FloatingActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: TransactionType) => void;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  const groups = [
    {
      title: 'Daily',
      types: [
        { id: 'expense' as TransactionType, label: 'Expense', icon: ShoppingBag, color: 'text-rose-600 bg-rose-50 border-rose-100' },
        { id: 'income' as TransactionType, label: 'Income', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { id: 'transfer' as TransactionType, label: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-600 bg-blue-50 border-blue-100' },
      ],
    },
    {
      title: 'Invest & Assets',
      types: [
        { id: 'asset_buy' as TransactionType, label: 'Asset Buy', icon: PlusCircle, color: 'text-violet-600 bg-violet-50 border-violet-100' },
        { id: 'asset_sell' as TransactionType, label: 'Asset Sell', icon: MinusCircle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        { id: 'asset_value_update' as TransactionType, label: 'Revalue', icon: RefreshCw, color: 'text-sky-600 bg-sky-50 border-sky-100' },
      ],
    },
    {
      title: 'Maintenance',
      types: [
        { id: 'adjustment' as TransactionType, label: 'Adjustment', icon: Sliders, color: 'text-slate-600 bg-slate-50 border-slate-100' },
      ],
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Menu Container */}
      <div className="relative z-50 mb-[148px] px-6 w-full max-w-[400px] mx-auto animate-slide-up select-none">
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-ambient-lg border border-white/50 p-4 space-y-4">
          {groups.map((group) => (
            <div key={group.title} className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{group.title}</span>
              <div className="flex gap-2 bg-slate-50/50 p-1.5 rounded-[20px] border border-slate-100/50">
                {group.types.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelect(t.id)}
                      className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-[16px] transition-all active:scale-95 hover:bg-white hover:shadow-sm"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${t.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 tracking-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
