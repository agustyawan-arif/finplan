'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { IPhoneShell } from '../components/IPhoneShell';
import { HomeTab } from '../components/HomeTab';
import { TransactionsTab } from '../components/TransactionsTab';
import { BudgetTab } from '../components/BudgetTab';
import { AccountsTab } from '../components/AccountsTab';
import { ReportsTab } from '../components/ReportsTab';
import { AddTransactionSheet } from '../components/transactions/AddTransactionSheet';
import { Home, Receipt, PiggyBank, Landmark, BarChart3, User, Calendar } from 'lucide-react';
import { TransactionType } from '../types';
import { APP_CONFIG } from '../lib/appConfig';
import { formatMonth } from '../lib/finance/formatters';
import { GlobalMonthPickerSheet } from '../components/GlobalMonthPickerSheet';

const generateMonths = (): string[] => {
  const months: string[] = [];
  const base = new Date('2026-05-01');
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

const MONTHS = generateMonths();

function MainAppContent() {
  const { activeTab, setActiveTab, globalMonth, setGlobalMonth } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [drawerDefaultType, setDrawerDefaultType] = useState<TransactionType>('expense');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenDrawer = (type: TransactionType) => {
    setDrawerDefaultType(type);
    setIsDrawerOpen(true);
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col h-full items-center justify-center bg-background text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loading {APP_CONFIG.appName}...</p>
        </div>
      </div>
    );
  }


  // Render proper tab based on state
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onOpenDrawer={handleOpenDrawer} />;
      case 'transactions':
        return <TransactionsTab onOpenDrawer={handleOpenDrawer} />;
      case 'budget':
        return <BudgetTab />;
      case 'accounts':
        return <AccountsTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        return <HomeTab onOpenDrawer={handleOpenDrawer} />;
    }
  };

  // Nav configuration
  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'transactions', label: 'Txns', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: PiggyBank },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ] as const;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Bar (Minimal, Mobile-First) */}
      <header className="px-5 pt-3 pb-2 flex items-center justify-between bg-white z-10 select-none border-b border-slate-50 relative">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
          <User size={16} className="text-slate-500 mt-1" />
        </div>
        
        <div 
          className={`flex-1 text-center h-8 flex items-center justify-center ${activeTab !== 'accounts' ? 'cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity' : ''}`}
          onClick={() => activeTab !== 'accounts' && setIsMonthPickerOpen(true)}
        >
           <span className="text-base font-extrabold text-[#0b1c30]">
             {activeTab === 'accounts' ? 'Accounts' : formatMonth(globalMonth)}
           </span>
        </div>
        
        <button 
          className="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          onClick={() => setIsMonthPickerOpen(true)}
        >
          <Calendar size={18} />
        </button>
      </header>

      {/* Main Tab Screen Area */}
      {renderTabContent()}

      {/* iOS styled Bottom Tab Bar Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 pb-1 z-30 shadow-ambient-lg select-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] font-bold transition-all relative"
            >
              <div
                className={`p-1.5 rounded-full mb-0.5 transition-all ${
                  isActive
                    ? 'text-primary scale-110'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              </div>
              <span className={isActive ? 'text-[#0b1c30]' : 'text-slate-400'}>
                {tab.label}
              </span>
              
              {/* Subtle active visual indicator dot */}
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-[#0b1c30] rounded-full animate-fade-in" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Dynamic Add Transaction Sheet */}
      <AddTransactionSheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        defaultType={drawerDefaultType}
      />

      {/* Global Month Picker Sheet */}
      <GlobalMonthPickerSheet
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedMonth={globalMonth}
        onSelect={(newMonth) => setGlobalMonth(newMonth)}
      />
    </div>
  );
}

export default function HomeView() {
  return (
    <AppProvider>
      <IPhoneShell>
        <MainAppContent />
      </IPhoneShell>
    </AppProvider>
  );
}
