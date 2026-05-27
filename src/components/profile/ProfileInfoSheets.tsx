'use client';

import React from 'react';
import { X, Shield, Check } from 'lucide-react';
import { APP_CONFIG } from '../../lib/appConfig';

interface InfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

// Reusable bottom drawer component conforming to DESIGN.md specs
export const InfoSheet: React.FC<InfoSheetProps> = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Backdrop */}
      <div className="flex-1 cursor-pointer" onClick={onClose} />

      {/* Sheet Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[85%] overflow-hidden animate-slide-up pb-8 select-none border-t border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-700">
              <Icon size={16} />
            </div>
            <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-5 pb-2">
          {children}
        </div>
      </div>
    </div>
  );
};

// 1. Profile Settings Sheet Content
export const ProfileSettingsContent: React.FC<{ email: string; initials: string }> = ({ email, initials }) => {
  const displayName = email.split('@')[0]
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Avatar Card */}
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[22px] font-bold text-[#0b1c30]">
          {initials}
        </div>
        <div>
          <h4 className="text-base font-extrabold text-[#0b1c30]">{displayName}</h4>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{email}</span>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase tracking-wider">
          Private Beta User
        </span>
      </div>

      {/* Account Info Details */}
      <div className="space-y-4">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Account Info</h5>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Client Tier</span>
            <span className="text-xs text-[#0b1c30] font-bold">Standard Account</span>
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Active Mode</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Supabase Live
            </span>
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Account Status</span>
            <span className="text-xs text-slate-700 font-bold">Active</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Pockit Profile editing is disabled during the Private Beta phase.<br />For custom requests, contact your workspace administrator.
      </p>
    </div>
  );
};

// 2. What's New Sheet Content
export const WhatsNewContent: React.FC = () => {
  const newFeatures = [
    { title: 'Email Auth Shield', desc: 'Secure database isolation powered by Supabase auth verification.' },
    { title: 'Persistent Finance Sync', desc: 'Financial data is automatically stored and retrieved in real-time.' },
    { title: 'Clean Pocket Management', desc: 'Create cash, depository, credit cards, pockets, or saving wallets.' },
    { title: 'Smart Cashflow Records', desc: 'Log incomes, standard expenses, and internal transfers easily.' },
    { title: 'Rhythmic Budget Control', desc: 'Establish monthly planned caps across core spending categories.' },
    { title: 'Investment & Revaluation', desc: 'Track principal stock or deposits cost and manually revalue assets.' },
    { title: 'Interactive Analytics Charts', desc: 'View comparative reports and monthly cashflow summaries.' },
    { title: 'iOS viewport spacing', desc: 'Bottom safe-area spacing lifts tabs and overlays for comfortable iPhone tap regions.' },
  ];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="pl-1">
        <h4 className="text-sm font-extrabold text-[#0b1c30]">{APP_CONFIG.appName} {APP_CONFIG.versionLabel}</h4>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Release Changelog</p>
      </div>

      {/* Feature List */}
      <div className="space-y-2.5">
        {newFeatures.map((f, i) => (
          <div key={i} className="flex gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <div className="w-5 h-5 rounded-full bg-[#6cf8bb]/15 flex items-center justify-center text-[#00714d] shrink-0 mt-0.5">
              <Check size={11} className="stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0b1c30] block leading-tight">{f.title}</span>
              <span className="text-[10px] text-slate-400 font-medium leading-normal block">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Help & Support Content
export const HelpSupportContent: React.FC = () => {
  const glossaries = [
    {
      term: 'Expense',
      desc: 'Standard cash outflow. Directly reduces your logical category budget limits (Needs, Wants, Charity) and subtracts from cashflow calculations.',
    },
    {
      term: 'Transfer',
      desc: 'Internal fund movement between two active accounts (e.g. Bank to Cash). Since no actual money leaves your overall ecosystem, it is not an expense and is omitted from budget limits and cashflows.',
    },
    {
      term: 'Asset Buy',
      desc: 'Purchasing investments, stocks, deposits, or lock-in holdings. It represents shifting standard liquid cash into investment assets, counting as a saving allocation rather than a standard expense.',
    },
    {
      term: 'Revalue (Valuation Update)',
      desc: 'Manually adjusting the valuation of stocks or assets to match current market prices. This updates your calculated Net Worth, but is excluded from budget and cashflow metrics.',
    },
    {
      term: 'Saving Allocation',
      desc: 'Financial transfers directed to wallets with dedicated saving-purpose metadata, or transactions flagged explicitly as Asset Buys.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="pl-1">
        <h4 className="text-sm font-extrabold text-[#0b1c30]">Concept Glossary</h4>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">How Pockit processes transactions</p>
      </div>

      <div className="space-y-3.5">
        {glossaries.map((g, i) => (
          <div key={i} className="space-y-1 pl-3 border-l-2 border-slate-200">
            <span className="text-xs font-black text-[#0b1c30] block leading-tight">{g.term}</span>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{g.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. About Pockit Content
export const AboutPockitContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Brand card */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 overflow-hidden flex items-center justify-center shrink-0 animate-fade-in">
          <img 
            src="/transparent-icon.png"
            alt="Pockit Logo"
            className="w-12 h-12 object-contain scale-[2.2]"
          />
        </div>
        <div>
          <h4 className="text-base font-extrabold text-[#0b1c30]">{APP_CONFIG.appName}</h4>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
            {APP_CONFIG.versionLabel}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-700 italic max-w-[200px] leading-snug">
          "{APP_CONFIG.tagline}"
        </p>
      </div>

      {/* Description */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
          {APP_CONFIG.description} Designed for extreme visual clarity, rhythmic data density, and effortless budget balancing.
        </p>
      </div>

      {/* Security & RLS highlight */}
      <div className="space-y-3.5">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">🔒 Privacy & Security</h5>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex gap-3 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <Shield size={16} />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#0b1c30] block leading-tight">Database Safeguards</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              We exclusively use <strong className="font-bold text-slate-700">Supabase Auth</strong> with strict PostgreSQL <strong className="font-bold text-slate-700">Row-Level Security (RLS)</strong> constraints. Only the logged-in owner can perform actions or read their own financial rows.
            </p>
          </div>
        </div>
      </div>

      <div className="text-[9px] text-slate-400 text-center leading-normal">
        Pockit &middot; Made with absolute structural care.<br />© 2026 Pockit Personal Finance.
      </div>
    </div>
  );
};
