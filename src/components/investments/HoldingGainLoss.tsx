import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CurrencyCode } from '../../types/finance';
import { formatCurrency } from '../../lib/finance/formatters';

interface HoldingGainLossProps {
  principal: number;
  current: number;
  currency: CurrencyCode;
  showDetails?: boolean;
}

export const HoldingGainLoss: React.FC<HoldingGainLossProps> = ({
  principal,
  current,
  currency,
  showDetails = false,
}) => {
  const gainLoss = current - principal;
  const percentage = principal > 0 ? (gainLoss / principal) * 100 : 0;
  const isPositive = gainLoss >= 0;

  const colorClass = isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
  const icon = isPositive ? <TrendingUp size={12} className="shrink-0" /> : <TrendingDown size={12} className="shrink-0" />;

  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center gap-1.5 justify-between">
        {showDetails && (
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Total Return (Gain/Loss)
          </div>
        )}
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${colorClass}`}>
          {icon}
          <span>
            {isPositive ? '+' : ''}
            {percentage.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
        {showDetails && (
          <span className="text-xs font-semibold text-slate-500">Net Gains</span>
        )}
        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isPositive ? '+' : ''}
          {formatCurrency(gainLoss, currency)}
        </span>
      </div>
    </div>
  );
};
export default HoldingGainLoss;
