'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyInput, FormInput, FormTextarea, SubmitButton, FormPickerTrigger, FormDatePickerTrigger } from './TransactionFormFields';
import { CurrencyCode } from '../../types/finance';
import { AccountSelectorBottomSheet, CategorySelectorBottomSheet } from './SelectorBottomSheet';
import { DatePickerBottomSheet } from './DatePickerBottomSheet';

interface IncomeFormProps {
  onSuccess: () => void;
  defaultAccountId?: string;
  defaultCategoryId?: string;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  onSuccess,
  defaultAccountId = '',
  defaultCategoryId = '',
}) => {
  const { accounts, categories, addTransaction, convertCurrencyToBase } = useApp();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Picker sheets visibility
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Filter selectable deposit accounts based on type
  const allowedDestTypes: ('cash' | 'bank' | 'e_wallet' | 'pocket')[] = ['cash', 'bank', 'e_wallet', 'pocket'];
  const eligibleAccounts = accounts.filter((a) => a.isActive && allowedDestTypes.includes(a.type as any));

  // Establish default account and category
  useEffect(() => {
    if (eligibleAccounts.length > 0 && !accountId) {
      setAccountId(eligibleAccounts[0].id);
      setCurrency(eligibleAccounts[0].currency);
    }
    const incCats = categories.filter((c) => c.kind === 'income');
    if (incCats.length > 0 && !categoryId) {
      setCategoryId(incCats[0].id);
    }
  }, [eligibleAccounts, categories, accountId, categoryId]);

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
      setErrorMessage('Please select a deposit account.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select an income category.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory || selectedCategory.kind !== 'income') {
      setErrorMessage('Invalid category selected.');
      return;
    }

    addTransaction({
      type: 'income',
      date,
      amount: parsedAmount,
      currency,
      accountId,
      categoryId,
      title: title.trim() || selectedCategory.name,
      note: note.trim() || undefined,
      exchangeRateToBase: convertCurrencyToBase(1, currency),
      isExcludedFromBudget: true, // Income does not count against spending budget limits
      isExcludedFromCashflow: false,
    });

    onSuccess();
  };

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CurrencyInput amount={amount} onChange={setAmount} currency={currency} label="Income Amount" />

        {errorMessage && (
          <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
            ⚠️ {errorMessage}
          </p>
        )}

        <div className="space-y-3">
          <FormInput
            label="Title / Payee"
            type="text"
            placeholder="e.g. Salary, Dividends, Freelance"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <FormDatePickerTrigger
            label="Transaction Date"
            value={date}
            onClick={() => setIsDatePickerOpen(true)}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormPickerTrigger
              label="Account"
              valueText={selectedAccount ? selectedAccount.name : 'Select...'}
              subtitleText={selectedAccount ? `${selectedAccount.institution}` : undefined}
              onClick={() => setIsAccountPickerOpen(true)}
            />

            <FormPickerTrigger
              label="Category"
              valueText={selectedCategory ? selectedCategory.name : 'Select...'}
              subtitleText={selectedCategory ? 'INCOME' : undefined}
              onClick={() => setIsCategoryPickerOpen(true)}
            />
          </div>

          <FormTextarea
            label="Note / Memo (Optional)"
            placeholder="Add details..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <SubmitButton>Save Income</SubmitButton>
      </form>

      {/* Selector sheets */}
      <AccountSelectorBottomSheet
        isOpen={isAccountPickerOpen}
        onClose={() => setIsAccountPickerOpen(false)}
        title="Choose Deposit Account"
        selectedId={accountId}
        onSelect={handleAccountSelect}
        allowedTypes={allowedDestTypes}
      />

      <CategorySelectorBottomSheet
        isOpen={isCategoryPickerOpen}
        onClose={() => setIsCategoryPickerOpen(false)}
        title="Choose Income Category"
        selectedId={categoryId}
        onSelect={(cat) => setCategoryId(cat.id)}
        kind="income"
      />

      <DatePickerBottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={date}
        onSelect={(d) => setDate(d)}
        title="Transaction Date"
      />
    </>
  );
};
