import React from 'react';

interface BudgetProgressBarProps {
  percentage: number;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ percentage }) => {
  const barPercentage = Math.min(percentage, 100);

  // Dynamic status color transitions: Safe (<=75%), Warning (75%-100%), Over (>100%)
  const getColorClass = () => {
    if (percentage > 100) return 'bg-rose-500'; // Limit Exceeded
    if (percentage > 75) return 'bg-amber-500'; // Limit Approaching
    return 'bg-emerald-500'; // Safe / Influx
  };

  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden select-none">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClass()}`}
        style={{ width: `${barPercentage}%` }}
      />
    </div>
  );
};
export default BudgetProgressBar;
