import React from 'react';

// Form Label
export const FormLabel: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 pl-0.5"
  >
    {children}
  </label>
);

// Large prominent Currency Input for Mobile Viewports
interface CurrencyInputProps {
  amount: string;
  onChange: (value: string) => void;
  currency: string;
  label?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  amount,
  onChange,
  currency,
  label = "Transaction Amount"
}) => {
  return (
    <div className="relative bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex flex-col items-center justify-center shadow-inner-ambient mb-6">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </span>
      <div className="flex items-baseline justify-center gap-2 w-full">
        <span className="text-2xl font-extrabold text-slate-400 select-none">{currency}</span>
        <input
          type="number"
          pattern="[0-9]*"
          inputMode="numeric"
          required
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="text-[40px] font-extrabold text-[#0b1c30] text-center bg-transparent border-none outline-none w-full max-w-[240px] placeholder-slate-300 leading-tight"
          autoFocus
        />
      </div>
    </div>
  );
};

// Standard Styled Text/Date/Number Inputs
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, id, ...props }) => (
  <div className="space-y-1">
    <FormLabel htmlFor={id}>{label}</FormLabel>
    <input
      id={id}
      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] placeholder-slate-400"
      {...props}
    />
  </div>
);

// Standard Styled Textarea for Notes
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ label, id, ...props }) => (
  <div className="space-y-1">
    <FormLabel htmlFor={id}>{label}</FormLabel>
    <textarea
      id={id}
      rows={2}
      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] placeholder-slate-400 resize-none"
      {...props}
    />
  </div>
);

// Standard Styled Select Dropdown
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, id, children, ...props }) => (
  <div className="space-y-1">
    <FormLabel htmlFor={id}>{label}</FormLabel>
    <select
      id={id}
      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] capitalize cursor-pointer"
      {...props}
    >
      {children}
    </select>
  </div>
);

// Premium Form Submit Button (Deep Navy card styling)
interface SubmitButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ children, disabled = false }) => (
  <div className="sticky bottom-0 bg-white pt-2 pb-4 mt-8 z-10">
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-4 bg-[#0F172A] hover:bg-[#1e293b] active:bg-[#0f172a] text-white rounded-[16px] font-bold text-xs shadow-ambient-lg hover:scale-[0.99] active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none select-none"
    >
      {children}
    </button>
  </div>
);

import { ChevronDown, Calendar } from 'lucide-react';

interface FormPickerTriggerProps {
  label: string;
  valueText: string;
  subtitleText?: string;
  onClick: () => void;
}

export const FormPickerTrigger: React.FC<FormPickerTriggerProps> = ({
  label,
  valueText,
  subtitleText,
  onClick,
}) => (
  <div className="space-y-1 text-left">
    <FormLabel>{label}</FormLabel>
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all hover:bg-slate-50 active:scale-[0.99] cursor-pointer"
    >
      <div className="min-w-0 text-left">
        <span className="font-extrabold block text-slate-800 leading-tight truncate">{valueText}</span>
        {subtitleText && (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">{subtitleText}</span>
        )}
      </div>
      <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
    </button>
  </div>
);

interface FormDatePickerTriggerProps {
  label: string;
  value: string; // ISO date string e.g., '2026-05-25'
  onClick: () => void;
}

export const FormDatePickerTrigger: React.FC<FormDatePickerTriggerProps> = ({
  label,
  value,
  onClick,
}) => {
  // Format ISO date to '25 May 2026'
  const formattedDate = new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-1 text-left">
      <FormLabel>{label}</FormLabel>
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all hover:bg-slate-50 active:scale-[0.99] cursor-pointer min-h-[46px]"
      >
        <div className="min-w-0 text-left">
          <span className="font-extrabold block text-slate-800 leading-tight truncate">{formattedDate}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">DATE</span>
        </div>
        <Calendar size={16} className="text-slate-400 shrink-0 ml-2" />
      </button>
    </div>
  );
};
