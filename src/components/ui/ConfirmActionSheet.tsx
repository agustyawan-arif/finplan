'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, LogOut, ShieldAlert, Trash2 } from 'lucide-react';

/**
 * POCKIT ACTION SAFETY LEVELS:
 *
 * Safe actions (No confirmation required):
 * - Open sheet / menu drawer
 * - Change tab
 * - Search / filter / sort
 * - Month picker navigation
 *
 * Normal write actions (No confirmation required):
 * - Add expense
 * - Add income
 * - Add transfer
 * - Establish/edit budget limit
 * - Add pocket / bank account
 *
 * Dangerous / Destructive / High-Impact actions (MUST require confirmation):
 * - Logout (prevent sudden session loss)
 * - Deactivate Account (blocks if there are active children)
 * - Remove Budget Goal (prevent losing monthly limit goals)
 * - Delete Transaction (stronger warning if type is asset_buy/sell/update)
 * - Asset Sell (high-impact investment transaction)
 * - Close/Delete Holding (destroys asset ledger)
 * - Delete Valuation (destroys historical valuation logs)
 * - Delete Exchange Rate (destroys conversion rate histories)
 */

interface ConfirmActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'default' | 'warning' | 'destructive';
  isOnlyWarning?: boolean; // If true, only displays an "OK" or Close button (useful for blocks)
  onConfirm: () => Promise<void> | void;
}

export const ConfirmActionSheet: React.FC<ConfirmActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'default',
  isOnlyWarning = false,
  onConfirm,
}) => {
  // Prevent background scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Variant styling helpers
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="text-rose-600" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-amber-600" size={18} />;
      default:
        return <LogOut className="text-[#0b1c30]" size={18} />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-rose-50 border border-rose-100';
      case 'warning':
        return 'bg-amber-50 border border-amber-100';
      default:
        return 'bg-slate-50 border border-slate-200';
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white';
      default:
        return 'bg-[#0f172a] hover:bg-[#1e293b] active:bg-[#0f172a] text-white';
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-[100] flex flex-col justify-end transition-all duration-300">
      {/* Click outside backdrop to close (only allowed if it's not a strict blocking warning sheet) */}
      <div 
        className="flex-1 cursor-pointer" 
        onClick={() => {
          if (!isOnlyWarning) onClose();
        }} 
      />

      {/* Sheet Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[80%] overflow-hidden animate-slide-up pb-[calc(16px+env(safe-area-inset-bottom,0px))] border-t border-slate-100 select-none z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconBg()}`}>
              {getIcon()}
            </div>
            <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-6 space-y-6">
          <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-2xl">
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {!isOnlyWarning ? (
              <>
                <button
                  onClick={async () => {
                    await onConfirm();
                  }}
                  className={`w-full py-3.5 ${getConfirmButtonStyles()} rounded-xl text-xs font-bold transition-all active:scale-[0.99] shadow-sm cursor-pointer`}
                >
                  {confirmLabel}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all active:scale-[0.99] border border-slate-100 cursor-pointer"
                >
                  {cancelLabel}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Got it
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
