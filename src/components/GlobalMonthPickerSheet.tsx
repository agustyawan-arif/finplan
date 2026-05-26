'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonth } from '../lib/finance/formatters';

interface GlobalMonthPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // YYYY-MM
  onSelect: (month: string) => void;
}

export const GlobalMonthPickerSheet: React.FC<GlobalMonthPickerSheetProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  onSelect,
}) => {
  const [tempMonth, setTempMonth] = useState(selectedMonth);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) setTempMonth(selectedMonth);
  }, [isOpen, selectedMonth]);

  if (!isOpen) return null;

  // Helpers to manipulate month
  const adjustMonth = (offset: number) => {
    const [yearStr, monthStr] = tempMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1; // 0-indexed

    month += offset;
    if (month > 11) {
      month -= 12;
      year += 1;
    } else if (month < 0) {
      month += 12;
      year -= 1;
    }

    setTempMonth(`${year}-${String(month + 1).padStart(2, '0')}`);
  };

  const setThisMonth = () => {
    // Current actual month, but since mock data is based around May 2026, 
    // we use May 2026 as "This Month" or we can use the real Date.
    // The prompt says "Default: 2026-05 for the current standardized mock data."
    setTempMonth('2026-05');
  };

  const handleConfirm = () => {
    onSelect(tempMonth);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col overflow-hidden animate-slide-up pb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">Select Period</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-2 space-y-6">
          
          {/* Main Month Selector */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-2">
            <button
              onClick={() => adjustMonth(-1)}
              className="p-3 rounded-xl bg-white shadow-sm hover:bg-slate-100 transition-colors border border-slate-100 text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center flex-1">
              <span className="text-lg font-extrabold text-[#0b1c30] block">
                {formatMonth(tempMonth)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                {tempMonth.split('-')[0]}
              </span>
            </div>

            <button
              onClick={() => adjustMonth(1)}
              className="p-3 rounded-xl bg-white shadow-sm hover:bg-slate-100 transition-colors border border-slate-100 text-slate-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={setThisMonth}
              className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={14} /> Current Month
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3.5 px-4 rounded-xl bg-[#0b1c30] text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Confirm
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
