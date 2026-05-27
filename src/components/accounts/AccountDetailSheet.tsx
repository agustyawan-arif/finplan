import React, { useState } from 'react';
import { X, Edit2, ShieldAlert, Trash2, Calendar, Landmark, HelpCircle, ArrowRightLeft, Plus } from 'lucide-react';
import { Account, InvestmentHolding } from '../../types/finance';
import { useApp } from '../../context/AppContext';
import { AccountTypeBadge } from './AccountTypeBadge';
import { AccountBalance } from './AccountBalance';
import { formatDate, formatCurrency, formatIDR, formatPercentage } from '../../lib/finance/formatters';
import { HoldingCard } from '../investments/HoldingCard';
import { HoldingDetailSheet } from '../investments/HoldingDetailSheet';
import { HoldingForm } from '../investments/HoldingForm';
import { deriveHoldingState } from '../../lib/finance/calculations';
import { ConfirmActionSheet } from '../ui/ConfirmActionSheet';

interface AccountDetailSheetProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
  onEditTrigger: () => void;
}

export const AccountDetailSheet: React.FC<AccountDetailSheetProps> = ({
  account,
  isOpen,
  onClose,
  onEditTrigger,
}) => {
  const {
    accounts,
    transactions,
    holdings,
    deactivateAccount,
    getAccountBalance,
    getCategoryName,
    getAccountName,
  } = useApp();

  const [selectedHolding, setSelectedHolding] = useState<InvestmentHolding | null>(null);
  const [isHoldingFormOpen, setIsHoldingFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBlockWarningOpen, setIsBlockWarningOpen] = useState(false);

  if (!isOpen) return null;

  const currentBalance = getAccountBalance(account.id);

  // Check if it has active child pockets
  const childAccounts = accounts.filter(a => a.parentAccountId === account.id && a.isActive);
  const hasChildren = childAccounts.length > 0;

  // Calculate child accounts total in parent's currency
  const childrenTotal = childAccounts.reduce((sum, child) => {
    const childBal = getAccountBalance(child.id);
    return sum + childBal;
  }, 0);

  const childrenInitialTotal = childAccounts.reduce((sum, child) => sum + child.initialBalance, 0);

  const showChildrenTotal = currentBalance === 0 && hasChildren;
  const displayBalance = showChildrenTotal ? childrenTotal : currentBalance;
  const displayInitial = showChildrenTotal ? childrenInitialTotal : account.initialBalance;

  // Filter active holdings belonging to this account
  const accountHoldings = holdings.filter(
    (h) => h.accountId === account.id && h.status === 'active'
  );

  // Calculate totals using derived holding states
  const totalCost = accountHoldings.reduce((sum, h) => {
    const derived = deriveHoldingState(h, transactions);
    return sum + derived.principalAmount;
  }, 0);

  const totalCurrentValue = accountHoldings.reduce((sum, h) => {
    const derived = deriveHoldingState(h, transactions);
    return sum + derived.currentValue;
  }, 0);
  const totalGainLoss = totalCurrentValue - totalCost;
  const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const isGainPositive = totalGainLoss >= 0;

  // Filter recent 5 transactions relating to this account
  const recentTransactions = transactions
    .filter((t) => t.accountId === account.id || t.destinationAccountId === account.id)
    .slice(0, 5);

  // Safety checks: check if this parent has active child pockets
  const activeChildren = accounts.filter((a) => a.parentAccountId === account.id && a.isActive);
  const hasActiveChildren = activeChildren.length > 0;

  const handleDeactivateClick = () => {
    if (hasActiveChildren) {
      setIsBlockWarningOpen(true);
    } else {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmDeactivate = async () => {
    await deactivateAccount(account.id);
    setIsConfirmOpen(false);
    onClose();
  };

  const isBrokerageOrDeposit = account.type === 'investment' || account.type === 'deposit';

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet wrapper */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[90%] overflow-hidden animate-slide-up pb-8 select-none">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#0b1c30] tracking-tight">{account.name} Details</h2>
            <AccountTypeBadge type={account.type} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable inspect region */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-5">
          
          {/* Main Visual Balance Highlight Card */}
          <div className="bg-gradient-to-br from-[#131b2e] to-[#0f172a] text-white p-5 rounded-[24px] shadow-ambient relative overflow-hidden flex flex-col gap-3">
            <div className="flex justify-between items-center z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {isBrokerageOrDeposit
                    ? 'Total Current Valuation'
                    : showChildrenTotal
                    ? 'Total Pockets Balance'
                    : 'Current Balance'}
                </span>
                <div className="text-white">
                  <AccountBalance
                    balance={isBrokerageOrDeposit ? totalCurrentValue || displayBalance : displayBalance}
                    currency={account.currency}
                    className="text-2xl font-extrabold text-white"
                  />
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {isBrokerageOrDeposit
                    ? 'Total Principal Invested'
                    : showChildrenTotal
                    ? 'Total Initial Capital'
                    : 'Baseline Capital'}
                </span>
                <p className="text-sm font-extrabold text-slate-300">
                  {formatCurrency(isBrokerageOrDeposit ? totalCost || displayInitial : displayInitial, account.currency)}
                </p>
              </div>
            </div>

            {isBrokerageOrDeposit && totalCost > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 z-10 flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-300">Net Portfolio Performance:</span>
                <div className="flex items-center gap-1.5">
                  <span className={isGainPositive ? 'text-emerald-400' : 'text-rose-400'}>
                    {isGainPositive ? '+' : ''}
                    {formatCurrency(totalGainLoss, account.currency)}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isGainPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {isGainPositive ? '+' : ''}
                    {formatPercentage(totalGainLossPercentage)}
                  </span>
                </div>
              </div>
            )}

            <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Child active warning block if deactivation is barred */}
          {hasActiveChildren && (
            <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">Deactivation Barred</span>
                <p className="text-[10px] text-rose-700 leading-snug">
                  This account has active child pockets: <strong className="font-bold">{activeChildren.map(c => c.name).join(', ')}</strong>. 
                  Please deactivate or re-parent them before deactivating Superbank.
                </p>
              </div>
            </div>
          )}

          {/* Parameters grid list */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Institution</span>
              <span className="font-bold text-slate-700">{account.institution || 'None'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Currency</span>
              <span className="font-bold text-slate-700 uppercase">{account.currency}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Purpose</span>
              <span className="font-bold text-slate-700 capitalize">{account.purpose.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Hierarchy</span>
              <span className="font-bold text-slate-700">
                {account.parentAccountId ? `Pocket of ${getAccountName(account.parentAccountId)}` : 'Standalone Master'}
              </span>
            </div>
          </div>

          {/* Nested Investment Holdings Section */}
          {isBrokerageOrDeposit && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pl-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Assets & Holdings ({accountHoldings.length})
                </h4>
                <button
                  onClick={() => setIsHoldingFormOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#0F172A] hover:text-slate-800 transition-colors"
                >
                  <Plus size={11} /> Add Holding
                </button>
              </div>

              {accountHoldings.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400">
                  No active holdings configured for this account.
                </div>
              ) : (
                <div className="space-y-2">
                  {accountHoldings.map((h) => (
                    <HoldingCard key={h.id} holding={h} onClick={setSelectedHolding} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Ledger History */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recent Transactions</h4>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-semibold text-slate-400">
                No transactions recorded for this account.
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentTransactions.map((t) => {
                  const isExpense = t.type === 'expense';
                  const isIncome = t.type === 'income';
                  const isAssetBuy = t.type === 'asset_buy';
                  const isTransfer = t.type === 'transfer';

                  let sign = '';
                  let valColor = 'text-[#0b1c30]';
                  if (isExpense) {
                    sign = '-';
                    valColor = 'text-rose-600 font-semibold';
                  } else if (isIncome) {
                    sign = '+';
                    valColor = 'text-emerald-600 font-semibold';
                  } else if (isAssetBuy) {
                    sign = '-';
                    valColor = 'text-[#006c49] font-semibold';
                  }

                  return (
                    <div
                      key={t.id}
                      className="bg-white p-3 rounded-xl border border-slate-100 shadow-ambient flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-[10px] capitalize">
                          {t.type.substring(0, 2)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 line-clamp-1">{t.title}</h5>
                          <span className="text-[9px] text-slate-400">
                            {isTransfer
                              ? `${getAccountName(t.accountId)} ➔ ${getAccountName(t.destinationAccountId!)}`
                              : getCategoryName(t.categoryId)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-bold ${valColor}`}>
                          {sign}
                          {formatCurrency(t.amount, t.currency)}
                        </span>
                        <p className="text-[8px] text-slate-400 mt-0.5">{formatDate(t.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onEditTrigger}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-ambient hover:scale-[0.99]"
            >
              <Edit2 size={13} /> Edit Account
            </button>

            {account.isActive && (
              <button
                onClick={handleDeactivateClick}
                className="flex-1 py-3 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-ambient hover:scale-[0.99]"
              >
                <Trash2 size={13} /> Deactivate
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Asset Detail Overlay Inspector */}
      {selectedHolding && (
        <HoldingDetailSheet
          holding={selectedHolding}
          isOpen={!!selectedHolding}
          onClose={() => setSelectedHolding(null)}
        />
      )}

      {/* Holding form overlay */}
      {isHoldingFormOpen && (
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
          <div className="flex-1" onClick={() => setIsHoldingFormOpen(false)} />
          <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[90%] overflow-hidden animate-slide-up pb-8">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
              <h2 className="text-base font-bold text-[#0b1c30] tracking-tight">Configure Holding Asset</h2>
              <button
                onClick={() => setIsHoldingFormOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
              <HoldingForm onSuccess={() => setIsHoldingFormOpen(false)} holdingToEdit={null} defaultAccountId={account.id} />
            </div>
          </div>
        </div>
      )}

      {/* Account Deactivation standard confirmation */}
      <ConfirmActionSheet
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Deactivate account?"
        message="This account will be hidden from active lists, but historical transactions will remain available."
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={handleConfirmDeactivate}
      />

      {/* Account Deactivation blocked warning */}
      <ConfirmActionSheet
        isOpen={isBlockWarningOpen}
        onClose={() => setIsBlockWarningOpen(false)}
        title="Deactivate account?"
        message="This account has active pockets/child accounts. Please deactivate or move them first."
        confirmLabel="Got it"
        variant="warning"
        isOnlyWarning={true}
        onConfirm={() => setIsBlockWarningOpen(false)}
      />
    </div>
  );
};
export default AccountDetailSheet;
