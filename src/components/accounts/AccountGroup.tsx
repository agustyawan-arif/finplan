import React from 'react';
import { Account } from '../../types/finance';
import { useApp } from '../../context/AppContext';
import { AccountCard } from './AccountCard';
import { formatIDR } from '../../lib/finance/formatters';

interface AccountGroupProps {
  title: string;
  accounts: Account[];
  onAccountClick: (acc: Account) => void;
  // If true, nesting parent accounts with children pockets
  nestedDisplay?: boolean;
}

export const AccountGroup: React.FC<AccountGroupProps> = ({
  title,
  accounts,
  onAccountClick,
  nestedDisplay = false,
}) => {
  const { getAccountBalance, convertCurrencyToBase } = useApp();

  if (accounts.length === 0) return null;

  // Calculate sum of active accounts in this group converted to Base Currency (IDR)
  const groupTotal = accounts.reduce((sum, acc) => {
    if (!acc.isActive) return sum;
    const balance = getAccountBalance(acc.id);
    const converted = convertCurrencyToBase(balance, acc.currency);
    return sum + converted;
  }, 0);

  return (
    <div className="space-y-2 select-none">
      {/* Sleek Header row with subtotals */}
      <div className="flex items-baseline justify-between pl-1">
        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          {title} <span className="text-[8px] bg-slate-100 text-slate-400 px-1 rounded-sm">{accounts.filter(a => a.isActive).length}</span>
        </h4>
        {groupTotal > 0 && (
          <span className="text-[10px] font-bold text-slate-400">
            Total: {formatIDR(groupTotal)}
          </span>
        )}
      </div>

      {/* Accounts List cards */}
      <div className="space-y-1.5">
        {nestedDisplay ? (
          // In nestedDisplay (used for Bank), we separate main parent accounts from pockets
          // Main parent account card, and immediately below it, we render its pockets cleanly
          accounts.filter(acc => acc.type === 'bank').map((parent) => {
            const children = accounts.filter(c => c.type === 'pocket' && c.parentAccountId === parent.id);
            return (
              <div key={parent.id} className="space-y-1.5">
                <AccountCard account={parent} onClick={() => onAccountClick(parent)} />
                {children.map((child) => (
                  <AccountCard key={child.id} account={child} onClick={() => onAccountClick(child)} isPocket={true} />
                ))}
              </div>
            );
          })
        ) : (
          // Standard linear display for other types
          accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} onClick={() => onAccountClick(acc)} />
          ))
        )}
      </div>
    </div>
  );
};
export default AccountGroup;
