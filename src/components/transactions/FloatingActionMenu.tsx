import React from 'react';
import { TransactionType } from '../../types/finance';
import { ShoppingBag, TrendingUp, ArrowRightLeft, PlusCircle, MinusCircle, RefreshCw, Sliders, ChevronRight } from 'lucide-react';

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
        { id: 'expense' as TransactionType, label: 'Expense', icon: ShoppingBag, iconColor: 'text-rose-600', bgColor: 'bg-rose-500/10' },
        { id: 'income' as TransactionType, label: 'Income', icon: TrendingUp, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
        { id: 'transfer' as TransactionType, label: 'Transfer', icon: ArrowRightLeft, iconColor: 'text-blue-600', bgColor: 'bg-blue-500/10' },
      ],
    },
    {
      title: 'Invest & Assets',
      types: [
        { id: 'asset_buy' as TransactionType, label: 'Asset Buy', icon: PlusCircle, iconColor: 'text-violet-600', bgColor: 'bg-violet-500/10' },
        { id: 'asset_sell' as TransactionType, label: 'Asset Sell', icon: MinusCircle, iconColor: 'text-amber-600', bgColor: 'bg-amber-500/10' },
        { id: 'asset_value_update' as TransactionType, label: 'Revalue', icon: RefreshCw, iconColor: 'text-sky-600', bgColor: 'bg-sky-500/10' },
      ],
    },
    {
      title: 'Maintenance',
      types: [
        { id: 'adjustment' as TransactionType, label: 'Adjustment', icon: Sliders, iconColor: 'text-slate-600', bgColor: 'bg-slate-500/10' },
      ],
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop with highly premium subtle overlay */}
      <div 
        className="absolute inset-0 bg-[#0b1c30]/10 backdrop-blur-[1.5px] transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Menu Container: Floating Sheet positioned nicely above the navigation bar */}
      <div className="relative z-50 mb-[calc(148px+env(safe-area-inset-bottom,0px))] px-5 w-full max-w-[393px] mx-auto animate-slide-up select-none">
        <div className="bg-white rounded-[28px] shadow-ambient-lg border border-slate-100 p-5 space-y-5">
          {groups.map((group) => {
            const isMaintenance = group.title === 'Maintenance';
            
            return (
              <div key={group.title} className="space-y-2.5">
                <span className="text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-widest pl-1 block">
                  {group.title}
                </span>
                
                {isMaintenance ? (
                  /* Single row list style layout for Maintenance to look elegant instead of an empty box */
                  <div className="space-y-1.5">
                    {group.types.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onSelect(t.id)}
                          className="w-full flex items-center justify-between p-3 rounded-[16px] bg-white border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/50 shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all duration-200 active:scale-[0.98] group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${t.bgColor} ${t.iconColor}`}>
                              <Icon size={18} />
                            </div>
                            <div className="text-left">
                              <span className="text-[12px] font-bold text-[#0b1c30] block leading-tight">{t.label}</span>
                              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Record manual balances and revaluations</span>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-600">
                            <ChevronRight size={14} className="stroke-[2.5]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Clean, non-grid-heavy grid layout for multiple items */
                  <div className="grid grid-cols-3 gap-2.5">
                    {group.types.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onSelect(t.id)}
                          className="flex flex-col items-center justify-center p-3 rounded-[16px] bg-white border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/50 shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all duration-200 active:scale-95 group"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-105 ${t.bgColor} ${t.iconColor}`}>
                            <Icon size={18} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 tracking-tight">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

