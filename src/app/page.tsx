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
import { Home, Receipt, PiggyBank, Landmark, BarChart3, User, Calendar, LogOut, Sparkles, Info, HelpCircle } from 'lucide-react';
import { TransactionType } from '../types';
import { APP_CONFIG } from '../lib/appConfig';
import { formatMonth } from '../lib/finance/formatters';
import { GlobalMonthPickerSheet } from '../components/GlobalMonthPickerSheet';
import { supabase } from '../lib/supabase/client';
import { AuthScreen } from '../components/auth/AuthScreen';
import { 
  InfoSheet, 
  ProfileSettingsContent, 
  WhatsNewContent, 
  HelpSupportContent, 
  AboutPockitContent 
} from '../components/profile/ProfileInfoSheets';
import { Session } from '@supabase/supabase-js';

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

function MainAppContent({ session }: { session: Session | null }) {
  const { activeTab, setActiveTab, globalMonth, setGlobalMonth, isLoadingData } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeInfoSheet, setActiveInfoSheet] = useState<'profile' | 'whats_new' | 'help' | 'about' | null>(null);
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

  // 1. App loading layer -> if loading data from Supabase, show spinner
  if (isLoadingData) {
    return (
      <div className="flex-1 flex flex-col h-full items-center justify-center bg-background text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loading Finance Data...</p>
        </div>
      </div>
    );
  }

  // User Profile Data
  const userEmail = session?.user?.email || 'user@example.com';
  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1 && parts[1].length > 0) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };
  const initials = getUserInitials(userEmail);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Bar (Minimal, Mobile-First) */}
      <header className="px-5 pt-3 pb-2 flex items-center justify-between bg-white z-20 select-none border-b border-slate-50 relative">
        <div className="relative z-30">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-1 transition-all"
            title="Profile Menu"
          >
            <span className="text-xs font-bold text-[#0b1c30]">{initials}</span>
          </button>

          {isProfileMenuOpen && (
            <>
              {/* Invisible overlay to catch outside clicks */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              {/* Profile Menu Card */}
              <div className="absolute top-10 left-0 w-64 bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-left">
                <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                    <span className="text-[15px] font-bold text-[#0b1c30]">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0b1c30] truncate">{userEmail.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-1">{userEmail}</p>
                  </div>
                </div>
                <div className="p-2 flex flex-col">
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveInfoSheet('profile');
                    }}
                    className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <User size={16} className="mr-3 shrink-0 text-slate-400" />
                    <span className="flex-1">Profile Settings</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveInfoSheet('whats_new');
                    }}
                    className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Sparkles size={16} className="mr-3 shrink-0 text-slate-400" />
                    <span className="flex-1">What's New</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveInfoSheet('help');
                    }}
                    className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <HelpCircle size={16} className="mr-3 shrink-0 text-slate-400" />
                    <span className="flex-1">Help & Support</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveInfoSheet('about');
                    }}
                    className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Info size={16} className="mr-3 shrink-0 text-slate-400" />
                    <span className="flex-1">About Pockit</span>
                  </button>
                  
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  
                  <button 
                    onClick={() => supabase.auth.signOut()}
                    className="flex items-center px-3 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={16} className="mr-3 shrink-0" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
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
      {/* Finance data still uses local state until Milestone 9C */}
      {renderTabContent()}

      {/* iOS styled Bottom Tab Bar Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-bottom,0px))] bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)] z-30 shadow-ambient-lg select-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] font-bold transition-all relative -translate-y-1.5"
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
              <span className={`relative inline-block ${isActive ? 'text-[#0b1c30]' : 'text-slate-400'}`}>
                {tab.label}
                {/* Subtle active visual indicator dot */}
                {isActive && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-1 h-1 bg-[#0b1c30] rounded-full animate-fade-in" />
                )}
              </span>
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

      {/* Dynamic Profile Info bottom drawers */}
      <InfoSheet
        isOpen={activeInfoSheet === 'profile'}
        onClose={() => setActiveInfoSheet(null)}
        title="Profile Settings"
        icon={User}
      >
        <ProfileSettingsContent email={userEmail} initials={initials} />
      </InfoSheet>

      <InfoSheet
        isOpen={activeInfoSheet === 'whats_new'}
        onClose={() => setActiveInfoSheet(null)}
        title="What's New"
        icon={Sparkles}
      >
        <WhatsNewContent />
      </InfoSheet>

      <InfoSheet
        isOpen={activeInfoSheet === 'help'}
        onClose={() => setActiveInfoSheet(null)}
        title="Help & Support"
        icon={HelpCircle}
      >
        <HelpSupportContent />
      </InfoSheet>

      <InfoSheet
        isOpen={activeInfoSheet === 'about'}
        onClose={() => setActiveInfoSheet(null)}
        title="About Pockit"
        icon={Info}
      >
        <AboutPockitContent />
      </InfoSheet>
    </div>
  );
}

export default function HomeView() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  React.useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        // Create a 2.5 second timeout to prevent hanging indefinitely in non-secure HTTP IP contexts
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 2500)
        );

        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);

        if (active) {
          setSession(session);
        }
      } catch (err) {
        console.error('Supabase auth session initialization failed:', err);
      } finally {
        if (active) {
          setIsLoadingAuth(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setSession(session);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoadingAuth) {
    return (
      <IPhoneShell>
        <div className="flex-1 flex flex-col h-full items-center justify-center bg-[#f8f9ff] text-slate-400">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#0f172a] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#45464d]">Verifying session...</p>
          </div>
        </div>
      </IPhoneShell>
    );
  }

  return (
    <AppProvider userId={session?.user?.id}>
      <IPhoneShell>
        {!session ? <AuthScreen /> : <MainAppContent session={session} />}
      </IPhoneShell>
    </AppProvider>
  );
}
