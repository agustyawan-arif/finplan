import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { formatMonth } from '../../lib/finance/formatters';

interface BudgetMonthSelectorProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export const BudgetMonthSelector: React.FC<BudgetMonthSelectorProps> = ({
  selectedMonth,
  onChange,
}) => {
  const monthsList = ['2026-05', '2026-04', '2026-03'];
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (month: string) => {
    onChange(month);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between select-none relative z-40">
      <h2 className="text-lg font-extrabold text-[#0b1c30] tracking-tight">Budget Plans</h2>
      
      <div className="relative">
        {/* Dropdown Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-100 shadow-ambient text-xs font-extrabold text-[#0b1c30] hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
        >
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span>{formatMonth(selectedMonth)}</span>
          <ChevronDown 
            size={14} 
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Click Outside Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Custom Dropdown Popover */}
        {isOpen && (
          <div className="absolute right-0 top-11 w-44 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-40 overflow-hidden animate-fade-in origin-top-right py-1.5">
            <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
              Select Month
            </div>
            {monthsList.map((m) => {
              const isSelected = m === selectedMonth;
              return (
                <button
                  key={m}
                  onClick={() => handleSelect(m)}
                  className={`w-full px-3 py-2 text-xs font-semibold text-left flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-slate-50 text-[#0b1c30] font-bold' 
                      : 'text-slate-600 hover:bg-slate-50/70 hover:text-[#0b1c30]'
                  }`}
                >
                  <span>{formatMonth(m)}</span>
                  {isSelected && <Check size={14} className="text-[#0b1c30] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetMonthSelector;
