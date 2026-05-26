'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Trash2, SlidersHorizontal, Filter, AlertCircle, X, ChevronDown, Check } from 'lucide-react';
import { TransactionType } from '../types';
import { formatDate, formatMonth, formatCurrency } from '../lib/finance/formatters';
import { FloatingActionMenu } from './transactions/FloatingActionMenu';
import { ConfirmActionSheet } from './ui/ConfirmActionSheet';

interface TransactionsTabProps {
  onOpenDrawer: (type: TransactionType) => void;
}

interface CustomFilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const CustomFilterSelect: React.FC<CustomFilterSelectProps> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{label}</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 outline-none text-left flex items-center justify-between hover:border-slate-300 transition-colors shadow-ambient min-h-[34px]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'All'}</span>
        <ChevronDown 
          size={12} 
          className={`text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Popover Backdrop click outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Custom Menu Options */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[38px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-40 max-h-48 overflow-y-auto no-scrollbar py-1 animate-fade-in origin-top">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 text-[10px] font-semibold text-left flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'bg-slate-50 text-[#0b1c30] font-bold' 
                    : 'text-slate-600 hover:bg-slate-50/70 hover:text-[#0b1c30]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={12} className="text-[#0b1c30] stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ onOpenDrawer }) => {
  const { transactions, accounts, categories, getCategoryName, getAccountName, deleteTransaction, globalMonth } = useApp();

  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<any | null>(null);



  // Filtered & Searched Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Month Match
      if (globalMonth !== 'all' && !t.date.startsWith(globalMonth)) return false;
      // Account Match
      if (selectedAccount !== 'all' && t.accountId !== selectedAccount && t.destinationAccountId !== selectedAccount) return false;
      // Category Match
      if (selectedCategory !== 'all') {
        const cat = categories.find(c => c.id === t.categoryId);
        const matchesCat = t.categoryId === selectedCategory || (cat && cat.parentCategoryId === selectedCategory);
        if (!matchesCat) return false;
      }
      // Type Match
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      // Search term Match (title/note)
      if (search) {
        const query = search.toLowerCase();
        const titleMatch = t.title.toLowerCase().includes(query);
        const noteMatch = t.note?.toLowerCase().includes(query) || false;
        if (!titleMatch && !noteMatch) return false;
      }

      return true;
    });
  }, [transactions, globalMonth, selectedAccount, selectedCategory, selectedType, search, categories]);

  // Group by Date helper
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof filteredTransactions } = {};
    filteredTransactions.forEach((t) => {
      const date = t.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        items: groups[date],
      }));
  }, [filteredTransactions]);

  const handleClearFilters = () => {
    setSelectedAccount('all');
    setSelectedCategory('all');
    setSelectedType('all');
    setSearch('');
  };

  // Memoized Selector Options
  const accountOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Accounts' },
      ...accounts.map(a => ({ value: a.id, label: a.name }))
    ];
  }, [accounts]);

  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories' },
      ...categories.filter(c => !c.parentCategoryId).map(c => ({ value: c.id, label: c.name }))
    ];
  }, [categories]);

  const typeOptions = useMemo(() => {
    const types = ['expense', 'income', 'transfer', 'asset_buy', 'asset_sell', 'adjustment'];
    return [
      { value: 'all', label: 'All Types' },
      ...types.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ') }))
    ];
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      
      {/* Top Filter and Search Bar */}
      <div className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 space-y-3 z-10 shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:border-primary/20"
          />
        </div>

        {/* Filters Quick Row */}
        <div className="flex items-center justify-end gap-2">

          {/* Sliders filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showFilters || selectedAccount !== 'all' || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'bg-secondary/10 border-secondary/20 text-secondary'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-100 animate-slide-down">
            <div className="grid grid-cols-3 gap-2">
              {/* Account Selector */}
              <CustomFilterSelect
                label="Account"
                value={selectedAccount}
                options={accountOptions}
                onChange={setSelectedAccount}
              />

              {/* Category Selector */}
              <CustomFilterSelect
                label="Category"
                value={selectedCategory}
                options={categoryOptions}
                onChange={setSelectedCategory}
              />

              {/* Type Selector */}
              <CustomFilterSelect
                label="Type"
                value={selectedType}
                options={typeOptions}
                onChange={setSelectedType}
              />
            </div>

            {/* Clear filters button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-[9px] font-extrabold text-rose-600 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Transactions List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-3">
        {groupedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
            <AlertCircle size={32} className="text-slate-300" />
            <p className="text-xs font-semibold">No transactions match filters.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedTransactions.map((group) => (
              <div key={group.date} className="space-y-2">
                {/* Date separator */}
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  {formatDate(group.date)}
                </h4>

                <div className="space-y-1.5">
                  {group.items.map((t) => {
                    const isExpense = t.type === 'expense';
                    const isIncome = t.type === 'income';
                    const isTransfer = t.type === 'transfer';
                    const isAssetBuy = t.type === 'asset_buy';

                    let sign = '';
                    let valColor = 'text-[#0b1c30]';
                    if (isExpense) {
                      sign = '-';
                      valColor = 'text-rose-600 font-bold';
                    } else if (isIncome) {
                      sign = '+';
                      valColor = 'text-emerald-600 font-bold';
                    } else if (isAssetBuy) {
                      sign = '-';
                      valColor = 'text-[#006c49] font-bold';
                    }

                    return (
                      <div
                        key={t.id}
                        className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-ambient flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs capitalize">
                            {t.type.substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{t.title}</h4>
                            <span className="text-[10px] text-slate-400">
                              {isTransfer
                                ? `${getAccountName(t.accountId)} ➔ ${getAccountName(t.destinationAccountId!)}`
                                : getCategoryName(t.categoryId)}{' '}
                              • {getAccountName(t.accountId)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className={`text-xs ${valColor}`}>
                              {sign}
                              {formatCurrency(t.amount, t.currency)}
                            </span>
                            {t.exchangeRateToBase !== 1 && t.exchangeRateToBase !== null && t.exchangeRateToBase !== undefined && (
                              <p className="text-[8px] text-slate-400 block mt-0.5">
                                Rate: {t.exchangeRateToBase}
                              </p>
                            )}
                          </div>

                          {/* Delete Interactive */}
                          <button
                            onClick={() => setTxToDelete(t)}
                            className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Menu Overlay */}
      <FloatingActionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelect={(type) => {
          setIsMenuOpen(false);
          onOpenDrawer(type);
        }}
      />

      {/* Floating Add Transaction Trigger Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`absolute bottom-[calc(88px+env(safe-area-inset-bottom,0px))] right-6 w-12 h-12 rounded-full shadow-ambient-lg flex items-center justify-center transition-all duration-300 active:scale-90 z-50 ${
          isMenuOpen ? 'bg-[#0f172a] text-white rotate-180' : 'bg-primary text-white'
        }`}
      >
        {isMenuOpen ? (
          <X size={24} className="stroke-[2.5]" />
        ) : (
          <Plus size={24} className="stroke-[2.5]" />
        )}
      </button>

      {/* Delete Transaction confirmation sheet */}
      <ConfirmActionSheet
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        title="Delete transaction?"
        message={
          txToDelete && ['asset_buy', 'asset_sell', 'asset_value_update'].includes(txToDelete.type)
            ? "This transaction affects investment values and net worth. Deleting it may change your reports."
            : "This will remove the transaction and update your balances, budgets, and reports."
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (txToDelete) {
            await deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
      />
    </div>
  );
};
