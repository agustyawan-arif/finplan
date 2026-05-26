import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormInput, FormSelect, SubmitButton } from '../transactions/TransactionFormFields';
import { CurrencyCode } from '../../types/finance';

interface ExchangeRateFormProps {
  onSuccess: () => void;
}

export const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({ onSuccess }) => {
  const { exchangeRates, addExchangeRate } = useApp();

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('SGD');
  const [rate, setRate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-populate rate if already configured in exchangeRates
  useEffect(() => {
    const existing = exchangeRates.find((e) => e.fromCurrency === fromCurrency && e.toCurrency === 'IDR');
    if (existing) {
      setRate(existing.rate.toString());
    } else {
      setRate(fromCurrency === 'SGD' ? '12000' : '16000');
    }
  }, [fromCurrency, exchangeRates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedRate = parseFloat(rate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      setErrorMessage('Please enter a valid exchange rate multiplier greater than 0.');
      return;
    }

    addExchangeRate({
      fromCurrency,
      toCurrency: 'IDR',
      rate: parsedRate,
      rateDate: new Date().toISOString().split('T')[0],
      source: 'manual',
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
          ⚠️ {errorMessage}
        </p>
      )}

      <div className="space-y-3.5 text-xs select-none">
        <FormSelect
          label="Source Currency"
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
          required
        >
          <option value="SGD">Singapore Dollar (SGD)</option>
          <option value="USD">United States Dollar (USD)</option>
        </FormSelect>

        <FormInput
          label={`Exchange Rate (1 ${fromCurrency} = Rp)`}
          type="number"
          step="any"
          placeholder="e.g. 12100"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          required
        />
        
        <p className="text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-100 rounded-lg p-2.5 leading-snug">
          💡 Updating this manual conversion factor immediately recalculates dynamic Rupiah (IDR) values across all your foreign accounts and net worth estimations.
        </p>
      </div>

      <SubmitButton>Apply Exchange Factor</SubmitButton>
    </form>
  );
};
export default ExchangeRateForm;
