import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR, formatCurrency } from '../../lib/finance/formatters';

interface AccountBalanceProps {
  balance: number;
  currency: string;
  className?: string;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({
  balance,
  currency,
  className = "text-xs font-bold text-[#0b1c30]"
}) => {
  const { convertCurrencyToBase, exchangeRates } = useApp();

  if (currency === 'IDR') {
    return <span className={className}>{formatIDR(balance)}</span>;
  }

  const converted = convertCurrencyToBase(balance, currency);
  
  // Check if a manual rate exists in system mock array (to show fallback info if not)
  const manualRateExists = exchangeRates.some(e => e.fromCurrency === currency);

  return (
    <div className="flex flex-col text-right select-none">
      <span className={className}>{formatCurrency(balance, currency)}</span>
      <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
        ≈ {formatIDR(converted)} {!manualRateExists && <span className="text-amber-500 font-bold" title="Using defensive rate fallback">⚠️</span>}
      </span>
    </div>
  );
};
export default AccountBalance;
