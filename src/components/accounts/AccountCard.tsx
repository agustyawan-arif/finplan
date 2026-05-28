import React from 'react';
import { Account } from '../../types/finance';
import { useApp } from '../../context/AppContext';
import { AccountTypeBadge } from './AccountTypeBadge';
import { AccountBalance } from './AccountBalance';
import { deriveHoldingState } from '../../lib/finance/calculations';
import { Star } from 'lucide-react';

interface AccountCardProps {
  account: Account;
  onClick: () => void;
  isPocket?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onClick, isPocket = false }) => {
  const { getAccountBalance, accounts, holdings, transactions } = useApp();
  const currentBalance = getAccountBalance(account.id);

  // Check if it has active child pockets
  const childAccounts = accounts.filter(a => a.parentAccountId === account.id && a.isActive);
  const hasChildren = childAccounts.length > 0;

  // Calculate child accounts total in parent's currency
  const childrenTotal = childAccounts.reduce((sum, child) => {
    const childBal = getAccountBalance(child.id);
    return sum + childBal;
  }, 0);

  // Calculate total derived currentValue of active holdings under this account
  const isBrokerageOrDeposit = account.type === 'investment' || account.type === 'deposit';
  const accountHoldings = holdings.filter(h => h.accountId === account.id && h.status === 'active');
  const holdingsTotal = accountHoldings.reduce((sum, h) => {
    const derived = deriveHoldingState(h, transactions);
    return sum + derived.currentValue;
  }, 0);

  const showChildrenTotal = currentBalance === 0 && hasChildren;
  const showHoldingsTotal = isBrokerageOrDeposit && accountHoldings.length > 0;
  
  const displayBalance = showChildrenTotal 
    ? childrenTotal 
    : showHoldingsTotal 
    ? holdingsTotal 
    : currentBalance;

  return (
    <div
      onClick={onClick}
      className={`bg-white p-3.5 rounded-2xl border border-slate-100 shadow-ambient flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors select-none ${
        isPocket ? 'ml-4 border-l-2 border-l-slate-200' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isPocket && <span className="text-slate-300 font-bold select-none text-xs">└─</span>}
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-800 line-clamp-1">{account.name}</span>
            <AccountTypeBadge type={account.type} />
            {account.isFavorite && (
              <Star size={10} className="fill-amber-500 stroke-amber-500 shrink-0" />
            )}
            {!account.isActive && (
              <span className="text-[8px] font-extrabold bg-slate-100 text-slate-400 border border-slate-200 px-1 rounded-sm">
                Inactive
              </span>
            )}
          </div>
          {account.institution && (
            <span className="text-[9px] text-slate-400 block font-medium">
              {account.institution} • {account.purpose.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-0.5 shrink-0">
        <AccountBalance balance={displayBalance} currency={account.currency} />
        {showChildrenTotal ? (
          <span className="text-[8px] font-extrabold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            Total pockets
          </span>
        ) : showHoldingsTotal ? (
          <span className="text-[8px] font-extrabold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            Valuation
          </span>
        ) : null}
      </div>
    </div>
  );
};
export default AccountCard;
