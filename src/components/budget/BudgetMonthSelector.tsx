import React from 'react';
import { Calendar } from 'lucide-react';
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

  return (
    <div className="flex items-center justify-between select-none">
      <h2 className="text-lg font-extrabold text-[#0b1c30] tracking-tight">Budget Plans</h2>
      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-ambient text-xs font-semibold">
        <Calendar size={14} className="text-slate-400" />
        <select
          value={selectedMonth}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none outline-none font-bold text-slate-800 cursor-pointer"
        >
          {monthsList.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
export default BudgetMonthSelector;
