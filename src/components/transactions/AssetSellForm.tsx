'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyInput, FormInput, FormTextarea, SubmitButton, FormPickerTrigger, FormDatePickerTrigger } from './TransactionFormFields';
import { CurrencyCode } from '../../types/finance';
import { AccountSelectorBottomSheet, HoldingSelectorBottomSheet } from './SelectorBottomSheet';
import { DatePickerBottomSheet } from './DatePickerBottomSheet';

interface AssetSellFormProps {
  onSuccess: () => void;
  defaultHoldingId?: string;
  defaultDestinationAccountId?: string;
}

export const AssetSellForm: React.FC<AssetSellFormProps> = ({
  onSuccess,
  defaultHoldingId = '',
  defaultDestinationAccountId = '',
}) => {
  const { accounts, holdings, addAssetSellTransaction } = useApp();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [holdingId, setHoldingId] = useState(defaultHoldingId);
  const [destinationAccountId, setDestinationAccountId] = useState(defaultDestinationAccountId);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [realizedGain, setRealizedGain] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Picker sheets visibility
  const [isHoldingPickerOpen, setIsHoldingPickerOpen] = useState(false);
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Filter destination accounts based on type
  const allowedDestTypes: ('cash' | 'bank' | 'e_wallet' | 'pocket')[] = ['cash', 'bank', 'e_wallet', 'pocket'];
  const eligibleAccounts = accounts.filter((a) => a.isActive && allowedDestTypes.includes(a.type as any));
  const activeHoldings = holdings.filter((h) => h.status === 'active');

  // Setup defaults
  useEffect(() => {
    if (activeHoldings.length > 0 && !holdingId) {
      setHoldingId(activeHoldings[0].id);
      setCurrency(activeHoldings[0].currency);
    }
    if (eligibleAccounts.length > 0 && !destinationAccountId) {
      setDestinationAccountId(eligibleAccounts[0].id);
    }
  }, [eligibleAccounts, activeHoldings, holdingId, destinationAccountId]);

  // Sync currency with selected holding
  const handleHoldingSelect = (h: any) => {
    setHoldingId(h.id);
    setCurrency(h.currency);
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

    if (!holdingId) {
      setErrorMessage('Please select a sold asset holding.');
      return;
    }

    if (!destinationAccountId) {
      setErrorMessage('Please select a destination account for the proceeds.');
      return;
    }

    const selectedHolding = holdings.find((h) => h.id === holdingId);
    if (!selectedHolding || selectedHolding.status !== 'active') {
      setErrorMessage('Selected holding does not exist or is inactive.');
      return;
    }

    const parsedQuantity = quantity ? parseFloat(quantity) : undefined;
    const parsedPrice = price ? parseFloat(price) : undefined;

    // Check quantity balance
    if (parsedQuantity && selectedHolding.quantity && parsedQuantity > selectedHolding.quantity) {
      setErrorMessage(`Cannot sell more units than owned. You currently own ${selectedHolding.quantity} units of ${selectedHolding.name}.`);
      return;
    }

    addAssetSellTransaction({
      amount: parsedAmount,
      holdingId,
      destinationAccountId,
      date,
      quantity: parsedQuantity,
      price: parsedPrice,
      realizedGain: realizedGain ? parseFloat(realizedGain) : undefined,
      title: title.trim() || undefined,
      note: note.trim() || undefined,
    });

    onSuccess();
  };

  const selectedHolding = holdings.find((h) => h.id === holdingId);
  const selectedAccount = accounts.find((a) => a.id === destinationAccountId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CurrencyInput amount={amount} onChange={setAmount} currency={currency} label="Sale Proceeds / Value" />

        {errorMessage && (
          <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
            ⚠️ {errorMessage}
          </p>
        )}

        <div className="space-y-3">
          <FormInput
            label="Title / Payee (Optional)"
            type="text"
            placeholder="e.g. Sell mutual fund, Withdraw deposit principal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <FormDatePickerTrigger
            label="Sale Date"
            value={date}
            onClick={() => setIsDatePickerOpen(true)}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormPickerTrigger
              label="Asset"
              valueText={selectedHolding ? selectedHolding.name : 'Select...'}
              subtitleText={selectedHolding ? `${selectedHolding.assetType.toUpperCase()}` : undefined}
              onClick={() => setIsHoldingPickerOpen(true)}
            />

            <FormPickerTrigger
              label="To"
              valueText={selectedAccount ? selectedAccount.name : 'Select...'}
              subtitleText={selectedAccount ? `${selectedAccount.institution}` : undefined}
              onClick={() => setIsAccountPickerOpen(true)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <FormInput
              label="Qty (Opt)"
              type="number"
              step="any"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <FormInput
              label="Price (Opt)"
              type="number"
              step="any"
              placeholder="e.g. 9800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <FormInput
              label="Gain (Opt)"
              type="number"
              step="any"
              placeholder="Realized"
              value={realizedGain}
              onChange={(e) => setRealizedGain(e.target.value)}
            />
          </div>

          <FormTextarea
            label="Note / Memo (Optional)"
            placeholder="e.g. Capital gains note, transfer charges..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <SubmitButton>Save Asset Sale</SubmitButton>
      </form>

      {/* Holding Selector */}
      <HoldingSelectorBottomSheet
        isOpen={isHoldingPickerOpen}
        onClose={() => setIsHoldingPickerOpen(false)}
        title="Choose Asset Holding to Sell"
        selectedId={holdingId}
        onSelect={handleHoldingSelect}
      />

      {/* Account Selector */}
      <AccountSelectorBottomSheet
        isOpen={isAccountPickerOpen}
        onClose={() => setIsAccountPickerOpen(false)}
        title="Choose Proceeds Destination Account"
        selectedId={destinationAccountId}
        onSelect={(acc) => setDestinationAccountId(acc.id)}
        allowedTypes={allowedDestTypes}
      />

      <DatePickerBottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={date}
        onSelect={(d) => setDate(d)}
        title="Sale Date"
      />
    </>
  );
};
