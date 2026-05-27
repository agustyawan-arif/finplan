'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, Landmark, Coins, Briefcase, PiggyBank, ArrowUpRight } from 'lucide-react';
import { Account, Category, InvestmentHolding } from '../../types/finance';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/finance/formatters';
import { deriveHoldingState } from '../../lib/finance/calculations';

interface BaseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Account Selector Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

interface AccountSelectorProps extends BaseSelectorProps {
  selectedId: string;
  onSelect: (account: Account) => void;
  allowedTypes?: ('cash' | 'bank' | 'e_wallet' | 'pocket' | 'investment' | 'deposit')[];
}

export const AccountSelectorBottomSheet: React.FC<AccountSelectorProps> = ({
  isOpen,
  onClose,
  title,
  selectedId,
  onSelect,
  allowedTypes,
}) => {
  const { accounts, getAccountBalance } = useApp();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (!acc.isActive) return false;
    if (allowedTypes && !allowedTypes.includes(acc.type as any)) return false;
    if (search.trim() === '') return true;
    return (
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      (acc.institution || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  // Group accounts by type
  const grouped = {
    cash: filteredAccounts.filter((a) => a.type === 'cash'),
    bank: filteredAccounts.filter((a) => a.type === 'bank'),
    pocket: filteredAccounts.filter((a) => a.type === 'pocket'),
    e_wallet: filteredAccounts.filter((a) => a.type === 'e_wallet'),
    investment: filteredAccounts.filter((a) => a.type === 'investment'),
    deposit: filteredAccounts.filter((a) => a.type === 'deposit'),
  };

  const groupLabels: Record<string, string> = {
    cash: 'Cash Wallet',
    bank: 'Bank Accounts',
    pocket: 'Savings Pockets',
    e_wallet: 'E-Wallets',
    investment: 'Investment Accounts',
    deposit: 'Fixed Deposits',
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Coins size={14} className="text-emerald-500" />;
      case 'bank':
        return <Landmark size={14} className="text-blue-500" />;
      case 'pocket':
        return <PiggyBank size={14} className="text-rose-500" />;
      case 'e_wallet':
        return <Coins size={14} className="text-violet-500" />;
      case 'investment':
        return <Briefcase size={14} className="text-amber-500" />;
      case 'deposit':
        return <Landmark size={14} className="text-indigo-500" />;
      default:
        return <Coins size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[85%] overflow-hidden animate-slide-up pb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
            <Search size={14} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-700 outline-none w-full font-semibold placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-0.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500">
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Scroll List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 no-scrollbar">
          {Object.entries(grouped).map(([type, accList]) => {
            if (accList.length === 0) return null;
            return (
              <div key={type} className="space-y-1.5">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {groupLabels[type] || type}
                </h4>
                <div className="space-y-1">
                  {accList.map((acc) => {
                    const isSelected = acc.id === selectedId;
                    const balance = getAccountBalance(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          onSelect(acc);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] select-none
                          ${
                            isSelected
                              ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-sm'
                              : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0
                            ${isSelected ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-100'}`}>
                            {getAccountIcon(acc.type)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold block truncate leading-tight">
                              {acc.name}
                            </span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider block mt-0.5
                              ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                              {acc.institution} • {acc.currency}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-black shrink-0 ml-3
                          ${isSelected ? 'text-white' : 'text-[#0b1c30]'}`}>
                          {formatCurrency(balance, acc.currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredAccounts.length === 0 && (
            <div className="text-center py-10 text-[10px] font-bold text-slate-400">
              No matching accounts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Category Selector Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

interface CategorySelectorProps extends BaseSelectorProps {
  selectedId: string;
  onSelect: (category: Category) => void;
  kind?: 'expense' | 'income' | 'allocation';
  isBudgetSelector?: boolean;
}

export const CategorySelectorBottomSheet: React.FC<CategorySelectorProps> = ({
  isOpen,
  onClose,
  title,
  selectedId,
  onSelect,
  kind,
  isBudgetSelector,
}) => {
  const { categories } = useApp();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Filter categories
  const filteredCategories = categories.filter((c) => {
    if (kind && c.kind !== kind) return false;
    
    // For budget goals, we hide income categories and only show budgetable parents
    if (isBudgetSelector && c.kind === 'income') return false;

    if (search.trim() === '') return true;
    return c.name.toLowerCase().includes(search.toLowerCase());
  });

  // Root level categories
  const rootCategories = filteredCategories.filter((c) => !c.parentCategoryId);

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[85%] overflow-hidden animate-slide-up pb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
            <Search size={14} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-700 outline-none w-full font-semibold placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-0.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500">
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Scroll List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 no-scrollbar">
          {rootCategories.map((parent) => {
            // Find children belonging to this parent and sort alphabetically
            const children = filteredCategories
              .filter((c) => c.parentCategoryId === parent.id)
              .sort((a, b) => a.name.localeCompare(b.name));

            // If we are searching and parent matches but has no children or child list matches
            if (children.length === 0 && search.trim() !== '' && !parent.name.toLowerCase().includes(search.toLowerCase())) {
              return null;
            }

            return (
              <div key={parent.id} className="space-y-1.5">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {parent.name}
                </h4>
                <div className="space-y-1">
                  {/* If parent is selectable itself (e.g. Saving or Charity) */}
                  {children.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(parent);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] select-none
                        ${
                          parent.id === selectedId
                            ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-sm'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                        }`}
                    >
                      <span className="text-xs font-extrabold block truncate leading-tight">
                        {parent.name}
                      </span>
                    </button>
                  ) : (
                    children.map((child) => {
                      const isSelected = child.id === selectedId;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => {
                            onSelect(child);
                            onClose();
                          }}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] select-none
                            ${
                              isSelected
                                ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-sm'
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                            }`}
                        >
                          <span className="text-xs font-extrabold block truncate leading-tight">
                            {child.name}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-10 text-[10px] font-bold text-slate-400">
              No matching categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Holding Selector Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

interface HoldingSelectorProps extends BaseSelectorProps {
  selectedId: string;
  onSelect: (holding: InvestmentHolding) => void;
}

export const HoldingSelectorBottomSheet: React.FC<HoldingSelectorProps> = ({
  isOpen,
  onClose,
  title,
  selectedId,
  onSelect,
}) => {
  const { holdings, transactions, getAccountName } = useApp();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Filter holdings
  const filteredHoldings = holdings.filter((h) => {
    if (h.status !== 'active') return false;
    if (search.trim() === '') return true;
    return (
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.symbol || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  // Group by Asset Type
  const grouped = {
    stock: filteredHoldings.filter((h) => h.assetType === 'stock'),
    mutual_fund: filteredHoldings.filter((h) => h.assetType === 'mutual_fund'),
    deposit: filteredHoldings.filter((h) => h.assetType === 'deposit'),
    foreign_currency: filteredHoldings.filter((h) => h.assetType === 'foreign_currency'),
    other: filteredHoldings.filter((h) => h.assetType === 'other'),
  };

  const groupLabels: Record<string, string> = {
    stock: 'Stocks / Equities',
    mutual_fund: 'Mutual Funds',
    deposit: 'Fixed Deposits',
    foreign_currency: 'Foreign Currencies',
    other: 'Other Assets',
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'foreign_currency':
        return <Coins size={14} className="text-emerald-500" />;
      case 'deposit':
        return <Landmark size={14} className="text-amber-500" />;
      default:
        return <ArrowUpRight size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[85%] overflow-hidden animate-slide-up pb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
            <Search size={14} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search holding..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-700 outline-none w-full font-semibold placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-0.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500">
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Scroll List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 no-scrollbar">
          {Object.entries(grouped).map(([type, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={type} className="space-y-1.5">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {groupLabels[type] || type}
                </h4>
                <div className="space-y-1">
                  {list.map((h) => {
                    const isSelected = h.id === selectedId;
                    const derived = deriveHoldingState(h, transactions);
                    const isFX = h.assetType === 'foreign_currency';

                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          onSelect(h);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] select-none
                          ${
                            isSelected
                              ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-sm'
                              : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0
                            ${isSelected ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-100'}`}>
                            {getAssetIcon(h.assetType)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold block truncate leading-tight">
                              {h.name}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider block mt-0.5 text-slate-400">
                              {getAccountName(h.accountId)} • {h.currency} {h.quantity ? `(${h.quantity.toLocaleString()} units)` : ''}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-black shrink-0 ml-3
                          ${isSelected ? 'text-white' : 'text-[#0b1c30]'}`}>
                          {isFX ? `${h.quantity?.toLocaleString() ?? 0} ${h.currency}` : formatCurrency(derived.currentValue, h.currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

            {filteredHoldings.length === 0 && (
            <div className="text-center py-10 text-[10px] font-bold text-slate-400">
              No matching holdings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Generic Selector Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectorOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface GenericSelectorProps extends BaseSelectorProps {
  options: SelectorOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const GenericSelectorBottomSheet: React.FC<GenericSelectorProps> = ({
  isOpen,
  onClose,
  title,
  options,
  selectedId,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredOptions = options.filter((o) => {
    if (search.trim() === '') return true;
    return (
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.subtitle || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[85%] overflow-hidden animate-slide-up pb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        {options.length > 8 && (
          <div className="px-6 pt-4 pb-2 shrink-0">
            <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
              <Search size={14} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-700 outline-none w-full font-semibold placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-0.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500">
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scroll List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 no-scrollbar">
          {filteredOptions.map((opt) => {
            const isSelected = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelect(opt.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] select-none
                  ${
                    isSelected
                      ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-sm'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                  }`}
              >
                <div className="min-w-0">
                  <span className="text-xs font-extrabold block truncate leading-tight">
                    {opt.label}
                  </span>
                  {opt.subtitle && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      {opt.subtitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {filteredOptions.length === 0 && (
            <div className="text-center py-10 text-[10px] font-bold text-slate-400">
              No matching options found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
