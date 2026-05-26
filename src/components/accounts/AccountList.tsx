import React, { useState, useMemo } from 'react';
import { Plus, Eye, EyeOff, FolderPlus, Layers, Globe, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Account } from '../../types/finance';
import { AccountGroup } from './AccountGroup';
import { AccountDetailSheet } from './AccountDetailSheet';
import { AccountForm } from './AccountForm';
import { ExchangeRateForm } from '../investments/ExchangeRateForm';
import { formatIDR } from '../../lib/finance/formatters';

export const AccountList: React.FC = () => {
  const { accounts, getNetWorth } = useApp();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFXOpen, setIsFXOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Group accounts reactively based on active/inactive states and types
  const categorized = useMemo(() => {
    const listToFilter = showInactive ? accounts : accounts.filter((a) => a.isActive);

    const cash: Account[] = [];
    const bankAndPockets: Account[] = []; // Bank main accounts + pockets with parentAccountId
    const eWallet: Account[] = [];
    const standalonePocket: Account[] = []; // Pocket accounts with no parentAccountId
    const foreign: Account[] = [];
    const investment: Account[] = [];
    const deposit: Account[] = [];
    const inactive: Account[] = [];

    listToFilter.forEach((acc) => {
      if (!acc.isActive) {
        inactive.push(acc);
        return;
      }

      if (acc.currency !== 'IDR') {
        foreign.push(acc);
      } else if (acc.type === 'cash') {
        cash.push(acc);
      } else if (acc.type === 'bank') {
        bankAndPockets.push(acc);
      } else if (acc.type === 'pocket') {
        if (acc.parentAccountId) {
          bankAndPockets.push(acc);
        } else {
          standalonePocket.push(acc);
        }
      } else if (acc.type === 'e_wallet') {
        eWallet.push(acc);
      } else if (acc.type === 'investment') {
        investment.push(acc);
      } else if (acc.type === 'deposit') {
        deposit.push(acc);
      }
    });

    return {
      cash,
      bankAndPockets,
      eWallet,
      standalonePocket,
      foreign,
      investment,
      deposit,
      inactive,
    };
  }, [accounts, showInactive]);

  const handleEditClick = (acc: Account) => {
    setSelectedAccount(null);
    setAccountToEdit(acc);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setAccountToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Net Worth Card & Filters Row */}
      <div className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 space-y-3 z-10 shadow-sm select-none">
        
        {/* Visual net worth display */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Net Asset Value</span>
            <h2 className="text-xl font-extrabold text-[#0b1c30] mt-0.5">{formatIDR(getNetWorth())}</h2>
          </div>
          <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400">
            <Layers size={16} />
          </div>
        </div>

        {/* Filter controls and add action trigger */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleAddClick}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F172A] hover:bg-[#1e293b] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-sm"
          >
            <FolderPlus size={16} /> Add Account
          </button>
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 w-[42px] h-[42px] rounded-xl transition-all active:scale-[0.98] shadow-sm shrink-0"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Main Accounts scroll area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-4 space-y-5">
        
        {categorized.cash.length > 0 && (
          <AccountGroup title="Cash Vaults" accounts={categorized.cash} onAccountClick={setSelectedAccount} />
        )}

        {categorized.bankAndPockets.length > 0 && (
          <AccountGroup
            title="Banks & Nested Pockets"
            accounts={categorized.bankAndPockets}
            onAccountClick={setSelectedAccount}
            nestedDisplay={true}
          />
        )}

        {categorized.standalonePocket.length > 0 && (
          <AccountGroup
            title="Standalone Pockets"
            accounts={categorized.standalonePocket}
            onAccountClick={setSelectedAccount}
          />
        )}

        {categorized.eWallet.length > 0 && (
          <AccountGroup title="E-Wallets" accounts={categorized.eWallet} onAccountClick={setSelectedAccount} />
        )}

        {categorized.foreign.length > 0 && (
          <AccountGroup title="Foreign Currency bank" accounts={categorized.foreign} onAccountClick={setSelectedAccount} />
        )}

        {categorized.investment.length > 0 && (
          <AccountGroup title="Investments & Brokerage" accounts={categorized.investment} onAccountClick={setSelectedAccount} />
        )}

        {categorized.deposit.length > 0 && (
          <AccountGroup title="Fixed Deposits" accounts={categorized.deposit} onAccountClick={setSelectedAccount} />
        )}

        {showInactive && categorized.inactive.length > 0 && (
          <AccountGroup title="Deactivated / Closed" accounts={categorized.inactive} onAccountClick={setSelectedAccount} />
        )}

        {accounts.filter(a => showInactive ? true : a.isActive).length === 0 && (
          <div className="text-center py-20 text-slate-400 text-xs font-semibold">
            No accounts defined. Click "Add Account" to get started.
          </div>
        )}
      </div>

      {/* Account detail Sheet Inspector */}
      {selectedAccount && (
        <AccountDetailSheet
          account={selectedAccount}
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onEditTrigger={() => handleEditClick(selectedAccount)}
        />
      )}

      {/* Add / Edit Account bottom sheet form */}
      {isFormOpen && (
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
          <div className="flex-1" onClick={() => setIsFormOpen(false)} />
          <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[90%] overflow-hidden animate-slide-up pb-8">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
              <h2 className="text-base font-bold text-[#0b1c30] tracking-tight">
                {accountToEdit ? `Edit ${accountToEdit.name}` : 'Create New Account'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
              <AccountForm onSuccess={() => setIsFormOpen(false)} accountToEdit={accountToEdit} />
            </div>
          </div>
        </div>
      )}

      {/* Adjust FX Rates bottom sheet form */}
      {isFXOpen && (
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
          <div className="flex-1" onClick={() => setIsFXOpen(false)} />
          <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[90%] overflow-hidden animate-slide-up pb-8">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
              <h2 className="text-base font-bold text-[#0b1c30] tracking-tight">Adjust Manual FX Rates</h2>
              <button
                onClick={() => setIsFXOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
              <ExchangeRateForm onSuccess={() => setIsFXOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* More Actions bottom sheet form */}
      {isMoreMenuOpen && (
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
          <div className="flex-1" onClick={() => setIsMoreMenuOpen(false)} />
          <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[90%] overflow-hidden animate-slide-up pb-8">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white shrink-0">
              <h2 className="text-base font-bold text-[#0b1c30] tracking-tight">More Actions</h2>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3 overflow-y-auto no-scrollbar">
              <button
                onClick={() => {
                  setShowInactive(!showInactive);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {showInactive ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-slate-800">{showInactive ? 'Hide Inactive Accounts' : 'Show Inactive Accounts'}</span>
                    <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">{showInactive ? 'Hide closed or deactivated accounts' : 'View closed or deactivated accounts'}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsFXOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Globe size={18} />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-slate-800">Adjust FX Rates</span>
                    <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Update manual foreign exchange rates</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AccountList;
