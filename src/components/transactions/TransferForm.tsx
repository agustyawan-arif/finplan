'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyInput, FormInput, FormTextarea, SubmitButton, FormPickerTrigger, FormDatePickerTrigger } from './TransactionFormFields';
import { CurrencyCode } from '../../types/finance';
import { AccountSelectorBottomSheet } from './SelectorBottomSheet';
import { DatePickerBottomSheet } from './DatePickerBottomSheet';

interface TransferFormProps {
  onSuccess: () => void;
  defaultFromAccountId?: string;
  defaultToAccountId?: string;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  onSuccess,
  defaultFromAccountId = '',
  defaultToAccountId = '',
}) => {
  const { accounts, addTransaction, convertCurrencyToBase } = useApp();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromAccountId, setFromAccountId] = useState(defaultFromAccountId);
  const [toAccountId, setToAccountId] = useState(defaultToAccountId);
  const [exchangeRate, setExchangeRate] = useState('1');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Picker sheets visibility
  const [isFromAccountPickerOpen, setIsFromAccountPickerOpen] = useState(false);
  const [isToAccountPickerOpen, setIsToAccountPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Active accounts
  const activeAccounts = accounts.filter((a) => a.isActive);

  // Default accounts establishing
  useEffect(() => {
    if (activeAccounts.length > 0) {
      if (!fromAccountId) {
        setFromAccountId(activeAccounts[0].id);
        setCurrency(activeAccounts[0].currency);
      }
      if (!toAccountId && activeAccounts.length > 1) {
        setToAccountId(activeAccounts[1].id);
      }
    }
  }, [activeAccounts, fromAccountId, toAccountId]);

  // Sync currency of source account
  const handleFromAccountSelect = (acc: any) => {
    setFromAccountId(acc.id);
    setCurrency(acc.currency);
  };

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const showExchangeRate = fromAccount && toAccount && fromAccount.currency !== toAccount.currency;

  // Auto-set default exchange rate fallback helper when currencies differ
  useEffect(() => {
    if (showExchangeRate && fromAccount && toAccount) {
      if (fromAccount.currency === 'SGD' && toAccount.currency === 'IDR') {
        setExchangeRate('12000');
      } else if (fromAccount.currency === 'IDR' && toAccount.currency === 'SGD') {
        setExchangeRate('0.000083'); // 1/12000
      } else if (fromAccount.currency === 'USD' && toAccount.currency === 'IDR') {
        setExchangeRate('16000');
      } else if (fromAccount.currency === 'IDR' && toAccount.currency === 'USD') {
        setExchangeRate('0.0000625'); // 1/16000
      } else {
        setExchangeRate('1');
      }
    } else {
      setExchangeRate('1');
    }
  }, [fromAccountId, toAccountId, showExchangeRate, fromAccount, toAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }

    if (!fromAccountId) {
      setErrorMessage('Please select a source account.');
      return;
    }

    if (!toAccountId) {
      setErrorMessage('Please select a destination account.');
      return;
    }

    if (fromAccountId === toAccountId) {
      setErrorMessage('Source and destination accounts cannot be the same.');
      return;
    }

    const parsedRate = parseFloat(exchangeRate);
    if (showExchangeRate && (isNaN(parsedRate) || parsedRate <= 0)) {
      setErrorMessage('Please enter a valid exchange rate greater than 0.');
      return;
    }

    const rateToBase = convertCurrencyToBase(1, currency);

    addTransaction({
      type: 'transfer',
      date,
      amount: parsedAmount,
      currency,
      accountId: fromAccountId,
      destinationAccountId: toAccountId,
      title: title.trim() || `Transfer to ${toAccount?.name || 'Account'}`,
      note: note.trim() || undefined,
      exchangeRateToBase: rateToBase,
      isExcludedFromBudget: true, // Transfers are omitted from budget tracking
      isExcludedFromCashflow: true, // Transfers are omitted from cashflow reports
    });

    onSuccess();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CurrencyInput amount={amount} onChange={setAmount} currency={currency} label="Transfer Amount" />

        {errorMessage && (
          <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
            ⚠️ {errorMessage}
          </p>
        )}

        <div className="space-y-3">
          <FormInput
            label="Transfer Title"
            type="text"
            placeholder="e.g. Save Money, Monthly Savings (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <FormDatePickerTrigger
            label="Transfer Date"
            value={date}
            onClick={() => setIsDatePickerOpen(true)}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormPickerTrigger
              label="From"
              valueText={fromAccount ? fromAccount.name : 'Select...'}
              subtitleText={fromAccount ? `${fromAccount.institution} • ${fromAccount.type.toUpperCase()}` : undefined}
              onClick={() => setIsFromAccountPickerOpen(true)}
            />

            <FormPickerTrigger
              label="To"
              valueText={toAccount ? toAccount.name : 'Select...'}
              subtitleText={toAccount ? `${toAccount.institution} • ${toAccount.type.toUpperCase()}` : undefined}
              onClick={() => setIsToAccountPickerOpen(true)}
            />
          </div>

          {showExchangeRate && (
            <FormInput
              label={`Exchange Rate (${fromAccount?.currency} to ${toAccount?.currency})`}
              type="number"
              step="any"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              required
            />
          )}

          <FormTextarea
            label="Note / Memo (Optional)"
            placeholder="Add memo details..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <SubmitButton>Save Transfer</SubmitButton>
      </form>

      {/* Picker sheets */}
      <AccountSelectorBottomSheet
        isOpen={isFromAccountPickerOpen}
        onClose={() => setIsFromAccountPickerOpen(false)}
        title="Choose From Account"
        selectedId={fromAccountId}
        onSelect={handleFromAccountSelect}
      />

      <AccountSelectorBottomSheet
        isOpen={isToAccountPickerOpen}
        onClose={() => setIsToAccountPickerOpen(false)}
        title="Choose Destination Account"
        selectedId={toAccountId}
        onSelect={(acc) => setToAccountId(acc.id)}
      />

      <DatePickerBottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={date}
        onSelect={(d) => setDate(d)}
        title="Transfer Date"
      />
    </>
  );
};
