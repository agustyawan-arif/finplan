import React, { useState } from 'react';
import { X, Plus, Minus, RefreshCw, Edit2, Calendar, FileText, ArrowRightLeft } from 'lucide-react';
import { InvestmentHolding, Transaction } from '../../types/finance';
import { useApp } from '../../context/AppContext';
import { formatDate, formatCurrency, formatPercentage } from '../../lib/finance/formatters';
import { deriveHoldingState } from '../../lib/finance/calculations';
import { DepositInfoCard } from './DepositInfoCard';
import { HoldingGainLoss } from './HoldingGainLoss';
import { AssetBuyForm } from '../transactions/AssetBuyForm';
import { AssetSellForm } from '../transactions/AssetSellForm';
import { AssetValueUpdateForm } from '../transactions/AssetValueUpdateForm';
import { HoldingForm } from './HoldingForm';

interface HoldingDetailSheetProps {
  holding: InvestmentHolding;
  isOpen: boolean;
  onClose: () => void;
}

export const HoldingDetailSheet: React.FC<HoldingDetailSheetProps> = ({
  holding,
  isOpen,
  onClose,
}) => {
  const { transactions, getAccountName, deleteTransaction } = useApp();

  const [activeOverlay, setActiveOverlay] = useState<'buy' | 'sell' | 'value_update' | 'edit' | null>(null);

  if (!isOpen) return null;

  // Derive accurate current state by replaying all transactions on the holding
  const derived = deriveHoldingState(holding, transactions);
  const isFX = holding.assetType === 'foreign_currency';
  const costBasis = derived.principalAmount;
  const displayCurrentValue = derived.currentValue;
  const displayCurrentValueConverted = isFX
    ? displayCurrentValue * (derived.currentPrice || holding.currentPrice || 12100)
    : displayCurrentValue;
  const gainLoss = isFX ? (displayCurrentValueConverted - costBasis) : (displayCurrentValue - costBasis);
  const isPositive = gainLoss >= 0;

  // Filter recent transactions relating to this holding
  const relatedTransactions = transactions
    .filter((t) => t.holdingId === holding.id)
    .slice(0, 5);

  const renderActiveOverlay = () => {
    switch (activeOverlay) {
      case 'buy':
        return (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0b1c30]">Acquire Asset: {holding.name}</h3>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 rounded-full bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AssetBuyForm onSuccess={() => { setActiveOverlay(null); onClose(); }} defaultHoldingId={holding.id} defaultAccountId={holding.accountId} />
            </div>
          </div>
        );
      case 'sell':
        return (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0b1c30]">Realize/Sell Asset: {holding.name}</h3>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 rounded-full bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AssetSellForm onSuccess={() => { setActiveOverlay(null); onClose(); }} defaultHoldingId={holding.id} />
            </div>
          </div>
        );
      case 'value_update':
        return (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0b1c30]">Valuation Update: {holding.name}</h3>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 rounded-full bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AssetValueUpdateForm onSuccess={() => { setActiveOverlay(null); onClose(); }} defaultHoldingId={holding.id} />
            </div>
          </div>
        );
      case 'edit':
        return (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0b1c30]">Edit Asset: {holding.name}</h3>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 rounded-full bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <HoldingForm onSuccess={() => { setActiveOverlay(null); onClose(); }} holdingToEdit={holding} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      <div className="flex-1" onClick={onClose} />

      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[90%] overflow-hidden animate-slide-up pb-8 relative">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-[#0b1c30] tracking-tight">{holding.name}</h2>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mt-0.5">
              {holding.assetType.replace('_', ' ')} • {getAccountName(holding.accountId)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveOverlay('edit')}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-5">
          {/* Main Valuation Summary Card */}
          <div className="bg-gradient-to-br from-[#131b2e] to-[#0f172a] text-white p-5 rounded-[24px] shadow-ambient flex flex-col gap-4 relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Current Asset Valuation</span>
                <span className="text-2xl font-black text-white">{formatCurrency(displayCurrentValue, holding.currency)}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Principal Invested</span>
                <span className="text-sm font-extrabold text-slate-300">{formatCurrency(costBasis, isFX ? 'IDR' : holding.currency)}</span>
              </div>
            </div>

            {costBasis > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 z-10 flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">Unrealized Portfolio Returns:</span>
                <div className="text-right flex items-center gap-2">
                  <span className={`font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}
                    {formatCurrency(gainLoss, isFX ? 'IDR' : holding.currency)}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {isPositive ? '+' : ''}
                    {formatPercentage(costBasis > 0 ? (gainLoss / costBasis) * 100 : 0)}
                  </span>
                </div>
              </div>
            )}
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Conditional Deposit Placement Information */}
          {holding.assetType === 'deposit' && (
            <DepositInfoCard holding={holding} />
          )}

          {/* Pricing Parameters Checklist */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Symbol / Ticker</span>
              <span className="font-bold text-slate-700">{holding.symbol || 'None'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Quantity Held</span>
              <span className="font-bold text-slate-700">{holding.quantity?.toLocaleString() || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Average Cost</span>
              <span className="font-bold text-slate-700">{holding.averageCost ? formatCurrency(holding.averageCost, isFX ? 'IDR' : holding.currency) : 'N/A'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Valued At Price</span>
              <span className="font-bold text-slate-700">{holding.currentPrice ? formatCurrency(holding.currentPrice, isFX ? 'IDR' : holding.currency) : 'N/A'}</span>
            </div>
          </div>

          {/* Transaction Ledger filtered */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recent Activity Logs</h4>
            {relatedTransactions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 select-none">
                No ledger activity for this asset.
              </div>
            ) : (
              <div className="space-y-1.5">
                {relatedTransactions.map((t) => {
                  const isBuy = t.type === 'asset_buy';
                  const isSell = t.type === 'asset_sell';
                  const isValuation = t.type === 'asset_value_update';

                  let badgeColor = 'text-slate-600 bg-slate-50';
                  let symbol = '';
                  if (isBuy) {
                    badgeColor = 'text-emerald-700 bg-emerald-50';
                    symbol = '+';
                  } else if (isSell) {
                    badgeColor = 'text-rose-700 bg-rose-50';
                    symbol = '-';
                  }

                  return (
                    <div
                      key={t.id}
                      className="bg-white p-3 rounded-xl border border-slate-100 shadow-ambient flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${badgeColor}`}>
                            {t.type.replace('asset_', '')}
                          </span>
                          <h5 className="font-bold text-slate-800 line-clamp-1">{t.title}</h5>
                        </div>
                        {t.note && <p className="text-[9px] text-slate-400 mt-0.5">{t.note}</p>}
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-black ${isBuy ? 'text-emerald-600' : isSell ? 'text-rose-600' : 'text-slate-800'}`}>
                          {symbol}
                          {formatCurrency(t.amount, t.currency)}
                        </span>
                        <span className="block text-[8px] text-slate-400 mt-0.5">{formatDate(t.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Core Action Trigger Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 shrink-0">
            <button
              onClick={() => setActiveOverlay('buy')}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Plus size={13} /> Buy More
            </button>
            <button
              onClick={() => setActiveOverlay('sell')}
              className="py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Minus size={13} /> Sell Asset
            </button>
            <button
              onClick={() => setActiveOverlay('value_update')}
              className="py-3 bg-[#0F172A] hover:bg-[#1e293b] active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm col-span-1"
            >
              <RefreshCw size={13} /> Revalue
            </button>
          </div>
        </div>

        {/* Dynamic Render Overlay forms */}
        {renderActiveOverlay()}
      </div>
    </div>
  );
};
export default HoldingDetailSheet;
