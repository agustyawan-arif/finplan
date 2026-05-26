'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyInput, FormInput, FormTextarea, SubmitButton, FormPickerTrigger, FormDatePickerTrigger } from './TransactionFormFields';
import { CurrencyCode } from '../../types/finance';
import { AccountSelectorBottomSheet } from './SelectorBottomSheet';
import { DatePickerBottomSheet } from './DatePickerBottomSheet';

interface AdjustmentFormProps {
  onSuccess: () => void;
  defaultAccountId?: string;
}

export const AdjustmentForm: React.FC<AdjustmentFormProps> = ({
  onSuccess,
  defaultAccountId = '',
}) => {
  const { accounts, addTransaction, convertCurrencyToBase } = useApp();

  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Picker visibility
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Active accounts
  const activeAccounts = accounts.filter((a) => a.isActive);

  // Set default account
  useEffect(() => {
    if (activeAccounts.length > 0 && !accountId) {
      setAccountId(activeAccounts[0].id);
      setCurrency(activeAccounts[0].currency);
    }
  }, [activeAccounts, accountId]);

  // Sync currency with selected account
  const handleAccountSelect = (acc: any) => {
    setAccountId(acc.id);
    setCurrency(acc.currency);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }

    if (!accountId) {
      setErrorMessage('Please select an account to adjust.');
      return;
    }

    const finalAmount = direction === 'increase' ? parsedAmount : -parsedAmount;

    addTransaction({
      type: 'adjustment',
      date,
      amount: finalAmount,
      currency,
      accountId,
      title: title.trim() || `Balance Adjustment (${direction === 'increase' ? '+' : '-'})`,
      note: note.trim() || undefined,
      exchangeRateToBase: convertCurrencyToBase(1, currency),
      isExcludedFromBudget: true,
      isExcludedFromCashflow: true,
    });

    onSuccess();
  };

  const selectedAccount = accounts.find((a) => a.id === accountId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visual toggle between Increase (+) and Decrease (-) adjustments */}
        <div className="flex gap-2 select-none">
          <button
            type="button"
            onClick={() => setDirection('increase')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg border transition-all ${
              direction === 'increase'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Increase (+) Inflow
          </button>
          <button
            type="button"
            onClick={() => setDirection('decrease')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg border transition-all ${
              direction === 'decrease'
                ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Decrease (-) Outflow
          </button>
        </div>

        <CurrencyInput amount={amount} onChange={setAmount} currency={currency} label="Adjustment Amount" />

        {errorMessage && (
          <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
            ⚠️ {errorMessage}
          </p>
        )}

        <div className="space-y-3">
          <FormInput
            label="Adjustment Reason / Title"
            type="text"
            placeholder="e.g. Audit correction, Fee deduction"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <FormDatePickerTrigger
              label="Date"
              value={date}
              onClick={() => setIsDatePickerOpen(true)}
            />

            <FormPickerTrigger
              label="Account"
              valueText={selectedAccount ? selectedAccount.name : 'Select...'}
              subtitleText={selectedAccount ? `${selectedAccount.institution}` : undefined}
              onClick={() => setIsAccountPickerOpen(true)}
            />
          </div>

          <FormTextarea
            label="Note / Memo (Optional)"
            placeholder="Why are you adjusting this balance?..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <SubmitButton>Save Adjustment</SubmitButton>
      </form>

      {/* Account Picker */}
      <AccountSelectorBottomSheet
        isOpen={isAccountPickerOpen}
        onClose={() => setIsAccountPickerOpen(false)}
        title="Choose Account to Adjust"
        selectedId={accountId}
        onSelect={handleAccountSelect}
      />

      <DatePickerBottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={date}
        onSelect={(d) => setDate(d)}
        title="Adjustment Date"
      />
    </>
  );
};
