'use client';

import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

interface DatePickerBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // ISO format YYYY-MM-DD
  onSelect: (date: string) => void;
  title?: string;
}

export const DatePickerBottomSheet: React.FC<DatePickerBottomSheetProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelect,
  title = "Select Date",
}) => {
  const [manualDate, setManualDate] = useState(selectedDate);

  if (!isOpen) return null;

  // Helper to format date offset
  const getOffsetDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const todayStr = getOffsetDate(0);
  const yesterdayStr = getOffsetDate(-1);
  const twoDaysAgoStr = getOffsetDate(-2);

  const quickOptions = [
    { label: 'Today', value: todayStr },
    { label: 'Yesterday', value: yesterdayStr },
    { label: '2 Days Ago', value: twoDaysAgoStr },
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDate) {
      onSelect(manualDate);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[85%] overflow-hidden animate-slide-up pb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
            <X size={15} />
          </button>
        </div>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2 space-y-5 no-scrollbar">
          
          {/* Quick Options */}
          <div className="space-y-1.5">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Quick Select
            </h4>
            <div className="space-y-1">
              {quickOptions.map((opt) => {
                const isSelected = opt.value === selectedDate;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelect(opt.value);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] select-none
                      ${
                        isSelected
                          ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-sm'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0
                        ${isSelected ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                        <Calendar size={14} />
                      </div>
                      <span className="text-xs font-extrabold block truncate leading-tight">
                        {opt.label}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold shrink-0 ml-3 uppercase tracking-wider
                      ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {new Date(opt.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div className="space-y-1.5">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Manual Date
            </h4>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#0b1c30] text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                Set
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
