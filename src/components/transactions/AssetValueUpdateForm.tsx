'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyInput, FormInput, FormTextarea, SubmitButton, FormPickerTrigger, FormDatePickerTrigger } from './TransactionFormFields';
import { CurrencyCode } from '../../types/finance';
import { HoldingSelectorBottomSheet } from './SelectorBottomSheet';
import { DatePickerBottomSheet } from './DatePickerBottomSheet';

interface AssetValueUpdateFormProps {
  onSuccess: () => void;
  defaultHoldingId?: string;
}

export const AssetValueUpdateForm: React.FC<AssetValueUpdateFormProps> = ({
  onSuccess,
  defaultHoldingId = '',
}) => {
  const { holdings, addAssetValueUpdateTransaction, convertCurrencyToBase } = useApp();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [holdingId, setHoldingId] = useState(defaultHoldingId);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentPrice, setCurrentPrice] = useState('');
  const [exchangeRateToBase, setExchangeRateToBase] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Picker visibility
  const [isHoldingPickerOpen, setIsHoldingPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Active holdings
  const activeHoldings = holdings.filter((h) => h.status === 'active');

  // Default holding establishing
  useEffect(() => {
    if (activeHoldings.length > 0 && !holdingId) {
      const firstH = activeHoldings[0];
      setHoldingId(firstH.id);
      setCurrency(firstH.currency);
      setAmount(firstH.currentValue.toString());
      if (firstH.currentPrice) {
        setCurrentPrice(firstH.currentPrice.toString());
      }
      const defaultRate = convertCurrencyToBase(1, firstH.currency);
      setExchangeRateToBase(defaultRate.toString());
    }
  }, [activeHoldings, holdingId, convertCurrencyToBase]);

  // Sync currency, current value, and price when holding changes
  const handleHoldingSelect = (h: any) => {
    setHoldingId(h.id);
    setCurrency(h.currency);
    setAmount(h.currentValue.toString());
    setCurrentPrice(h.currentPrice ? h.currentPrice.toString() : '');
    const defaultRate = convertCurrencyToBase(1, h.currency);
    setExchangeRateToBase(defaultRate.toString());
  };

  // Pre-fill amount when quantity and currentPrice are available
  useEffect(() => {
    const selectedHolding = holdings.find((h) => h.id === holdingId);
    if (selectedHolding && selectedHolding.quantity) {
      const p = parseFloat(currentPrice);
      if (!isNaN(p) && p >= 0) {
        setAmount((selectedHolding.quantity * p).toString());
      }
    }
  }, [currentPrice, holdingId, holdings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setErrorMessage('Please enter a valid current asset value (must be 0 or greater).');
      return;
    }

    if (!holdingId) {
      setErrorMessage('Please select an asset to revalue.');
      return;
    }

    const selectedHolding = holdings.find((h) => h.id === holdingId);
    if (!selectedHolding) {
      setErrorMessage('Selected holding does not exist.');
      return;
    }

    if (selectedHolding.status !== 'active') {
      setErrorMessage('Updating value of inactive/closed holding is not allowed.');
      return;
    }

    const parsedPrice = currentPrice ? parseFloat(currentPrice) : undefined;
    const parsedRate = exchangeRateToBase ? parseFloat(exchangeRateToBase) : undefined;

    addAssetValueUpdateTransaction({
      holdingId,
      currentValue: parsedAmount,
      valuationDate: date,
      currentPrice: parsedPrice,
      exchangeRateToBase: parsedRate,
      note: note.trim() || undefined,
    });

    onSuccess();
  };

  const selectedHolding = holdings.find((h) => h.id === holdingId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CurrencyInput amount={amount} onChange={setAmount} currency={currency} label="New Total Valuation" />

        {errorMessage && (
          <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
            ⚠️ {errorMessage}
          </p>
        )}

        <div className="space-y-3">
          <FormPickerTrigger
            label="Investment Asset to Revalue"
            valueText={selectedHolding ? selectedHolding.name : 'Select holding asset to revalue...'}
            subtitleText={selectedHolding ? `${selectedHolding.assetType.toUpperCase()} • CURRENT: ${selectedHolding.currency} ${selectedHolding.currentValue.toLocaleString()}` : undefined}
            onClick={() => setIsHoldingPickerOpen(true)}
          />

          <FormDatePickerTrigger
            label="Valuation Date"
            value={date}
            onClick={() => setIsDatePickerOpen(true)}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Current Price (Optional)"
              type="number"
              step="any"
              placeholder="e.g. 9800"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
            />
            <FormInput
              label="FX Rate to IDR (Optional)"
              type="number"
              step="any"
              placeholder="e.g. 12000"
              value={exchangeRateToBase}
              onChange={(e) => setExchangeRateToBase(e.target.value)}
            />
          </div>

          <FormTextarea
            label="Valuation Note / Memo (Optional)"
            placeholder="e.g. Monthly interest credit, market close stock price adjustment..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <SubmitButton>Save Revalue</SubmitButton>
      </form>

      {/* Holding Selector */}
      <HoldingSelectorBottomSheet
        isOpen={isHoldingPickerOpen}
        onClose={() => setIsHoldingPickerOpen(false)}
        title="Choose Asset to Revalue"
        selectedId={holdingId}
        onSelect={handleHoldingSelect}
      />

      <DatePickerBottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={date}
        onSelect={(d) => setDate(d)}
        title="Valuation Date"
      />
    </>
  );
};
