import React from 'react';
import { Landmark, ArrowUpRight, Coins, Percent } from 'lucide-react';
import { InvestmentHolding } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../lib/finance/formatters';
import { HoldingGainLoss } from './HoldingGainLoss';
import { useApp } from '../../context/AppContext';
import { deriveHoldingState } from '../../lib/finance/calculations';

interface HoldingCardProps {
  holding: InvestmentHolding;
  onClick: (holding: InvestmentHolding) => void;
}

export const HoldingCard: React.FC<HoldingCardProps> = ({ holding, onClick }) => {
  const { transactions } = useApp();
  const { name, symbol, assetType, currency, quantity } = holding;

  // Derive accurate display values from transaction ledger
  const derived = deriveHoldingState(holding, transactions);
  const currentValue = derived.currentValue;
  const costBasis = derived.principalAmount;
  const hasCostBasis = costBasis > 0;

  const getAssetBadge = () => {
    switch (assetType) {
      case 'stock':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'mutual_fund':
        return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'deposit':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'foreign_currency':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div
      onClick={() => onClick(holding)}
      className="bg-white p-4.5 rounded-[20px] border border-slate-100 hover:border-slate-200 active:bg-slate-50 hover:scale-[0.99] active:scale-95 transition-all shadow-sm select-none cursor-pointer flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${getAssetBadge()}`}>
          {assetType === 'foreign_currency' ? (
            <Coins size={15} />
          ) : assetType === 'deposit' ? (
            <Landmark size={15} />
          ) : (
            <ArrowUpRight size={15} />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-extrabold text-slate-800 text-xs leading-snug line-clamp-1">{name}</h4>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{symbol || assetType.replace('_', ' ')}</span>
            {quantity && quantity > 0 && (
              <>
                <span>•</span>
                <span>
                  {quantity.toLocaleString()} {symbol || 'units'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs font-black text-slate-800 leading-none">
          {formatCurrency(currentValue, currency)}
        </span>
        {hasCostBasis ? (
          <div className="w-24">
            {assetType === 'foreign_currency' ? (
              <HoldingGainLoss
                principal={costBasis}
                current={currentValue * (derived.currentPrice || holding.currentPrice || 12100)}
                currency="IDR"
              />
            ) : (
              <HoldingGainLoss principal={costBasis} current={currentValue} currency={currency} />
            )}
          </div>
        ) : (
          <span className="text-[9px] font-semibold text-slate-400">No Cost Basis</span>
        )}
      </div>
    </div>
  );
};
export default HoldingCard;
