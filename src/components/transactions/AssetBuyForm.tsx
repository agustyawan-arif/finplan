'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyInput, FormInput, FormTextarea, SubmitButton, FormPickerTrigger, FormDatePickerTrigger } from './TransactionFormFields';
import { CurrencyCode } from '../../types/finance';
import { AccountSelectorBottomSheet, HoldingSelectorBottomSheet } from './SelectorBottomSheet';
import { DatePickerBottomSheet } from './DatePickerBottomSheet';

interface AssetBuyFormProps {
  onSuccess: () => void;
  defaultAccountId?: string;
  defaultHoldingId?: string;
}

export const AssetBuyForm: React.FC<AssetBuyFormProps> = ({
  onSuccess,
  defaultAccountId = '',
  defaultHoldingId = '',
}) => {
  const { accounts, holdings, addAssetBuyTransaction } = useApp();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [holdingId, setHoldingId] = useState(defaultHoldingId);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Picker sheets visibility
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
  const [isHoldingPickerOpen, setIsHoldingPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Filter selectable source accounts based on type
  const allowedSourceTypes: ('cash' | 'bank' | 'e_wallet' | 'pocket')[] = ['cash', 'bank', 'e_wallet', 'pocket'];
  const eligibleAccounts = accounts.filter((a) => a.isActive && allowedSourceTypes.includes(a.type as any));
  const activeHoldings = holdings.filter((h) => h.status === 'active');

  // Setup defaults
  useEffect(() => {
    if (eligibleAccounts.length > 0 && !accountId) {
      setAccountId(eligibleAccounts[0].id);
      setCurrency(eligibleAccounts[0].currency);
    }
    if (activeHoldings.length > 0 && !holdingId) {
      setHoldingId(activeHoldings[0].id);
    }
  }, [eligibleAccounts, activeHoldings, accountId, holdingId]);

  // Sync currency with selected cash account
  const handleAccountSelect = (acc: any) => {
    setAccountId(acc.id);
    setCurrency(acc.currency);
  };

  // Pre-fill amount when quantity and price are filled
  useEffect(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
      setAmount((q * p).toString());
    }
  }, [quantity, price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }

    if (!accountId) {
      setErrorMessage('Please select a payment source account.');
      return;
    }

    if (!holdingId) {
      setErrorMessage('Please select a target asset holding.');
      return;
    }

    const selectedAccount = accounts.find((a) => a.id === accountId);
    if (!selectedAccount || !selectedAccount.isActive) {
      setErrorMessage('Selected account must be active.');
      return;
    }

    const selectedHolding = holdings.find((h) => h.id === holdingId);
    if (!selectedHolding || selectedHolding.status !== 'active') {
      setErrorMessage('Selected holding must be active.');
      return;
    }

    const parsedQuantity = quantity ? parseFloat(quantity) : undefined;
    const parsedPrice = price ? parseFloat(price) : undefined;

    addAssetBuyTransaction({
      amount: parsedAmount,
      fromAccountId: accountId,
      holdingId,
      date,
      quantity: parsedQuantity,
      price: parsedPrice,
      title: title.trim() || undefined,
      note: note.trim() || undefined,
    });

    onSuccess();
  };

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const selectedHolding = holdings.find((h) => h.id === holdingId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CurrencyInput amount={amount} onChange={setAmount} currency={currency} label="Purchase Price / Amount" />

        {errorMessage && (
          <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
            ⚠️ {errorMessage}
          </p>
        )}

        <div className="space-y-3">
          <FormInput
            label="Title / Payee (Optional)"
            type="text"
            placeholder="e.g. Top up Bibit, Buy BBCA"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <FormDatePickerTrigger
            label="Purchase Date"
            value={date}
            onClick={() => setIsDatePickerOpen(true)}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormPickerTrigger
              label="From"
              valueText={selectedAccount ? selectedAccount.name : 'Select...'}
              subtitleText={selectedAccount ? `${selectedAccount.institution}` : undefined}
              onClick={() => setIsAccountPickerOpen(true)}
            />

            <FormPickerTrigger
              label="Asset"
              valueText={selectedHolding ? selectedHolding.name : 'Select...'}
              subtitleText={selectedHolding ? `${selectedHolding.assetType.toUpperCase()}` : undefined}
              onClick={() => setIsHoldingPickerOpen(true)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Quantity (Optional)"
              type="number"
              step="any"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <FormInput
              label="Price per Unit (Optional)"
              type="number"
              step="any"
              placeholder="e.g. 9800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <FormTextarea
            label="Note / Memo (Optional)"
            placeholder="e.g. Mutual fund buy note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <SubmitButton>Save Asset Purchase</SubmitButton>
      </form>

      {/* Account Selector */}
      <AccountSelectorBottomSheet
        isOpen={isAccountPickerOpen}
        onClose={() => setIsAccountPickerOpen(false)}
        title="Choose Source Cash Account"
        selectedId={accountId}
        onSelect={handleAccountSelect}
        allowedTypes={allowedSourceTypes}
      />

      {/* Holding Selector */}
      <HoldingSelectorBottomSheet
        isOpen={isHoldingPickerOpen}
        onClose={() => setIsHoldingPickerOpen(false)}
        title="Choose Target Asset Holding"
        selectedId={holdingId}
        onSelect={(h) => setHoldingId(h.id)}
      />

      <DatePickerBottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={date}
        onSelect={(d) => setDate(d)}
        title="Purchase Date"
      />
    </>
  );
};
