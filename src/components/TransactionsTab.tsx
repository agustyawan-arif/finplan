'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Trash2, SlidersHorizontal, Filter, AlertCircle } from 'lucide-react';
import { TransactionType } from '../types';
import { formatDate, formatMonth, formatCurrency } from '../lib/finance/formatters';
import { FloatingActionMenu } from './transactions/FloatingActionMenu';
import { X } from 'lucide-react';

interface TransactionsTabProps {
  onOpenDrawer: (type: TransactionType) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ onOpenDrawer }) => {
  const { transactions, accounts, categories, getCategoryName, getAccountName, deleteTransaction, globalMonth } = useApp();

  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);



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
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Account</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-[10px] outline-none"
                >
                  <option value="all">All</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-[10px] outline-none"
                >
                  <option value="all">All</option>
                  {categories.filter(c => !c.parentCategoryId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Type Selector */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-[10px] outline-none capitalize"
                >
                  <option value="all">All</option>
                  {['expense', 'income', 'transfer', 'asset_buy', 'asset_sell', 'adjustment'].map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
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
                            onClick={() => deleteTransaction(t.id)}
                            className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
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
        className={`absolute bottom-[88px] right-6 w-12 h-12 rounded-full shadow-ambient-lg flex items-center justify-center transition-all duration-300 active:scale-90 z-50 ${
          isMenuOpen ? 'bg-[#0f172a] text-white rotate-180' : 'bg-primary text-white'
        }`}
      >
        {isMenuOpen ? (
          <X size={24} className="stroke-[2.5]" />
        ) : (
          <Plus size={24} className="stroke-[2.5]" />
        )}
      </button>

    </div>
  );
};
