import React from 'react';
import { AccountType } from '../../types/finance';

interface AccountTypeBadgeProps {
  type: AccountType;
}

export const AccountTypeBadge: React.FC<AccountTypeBadgeProps> = ({ type }) => {
  const getBadgeStyles = () => {
    switch (type) {
      case 'cash':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'bank':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'e_wallet':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'pocket':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'deposit':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'investment':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <span
      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border capitalize ${getBadgeStyles()}`}
    >
      {type.replace('_', ' ')}
    </span>
  );
};
export default AccountTypeBadge;
