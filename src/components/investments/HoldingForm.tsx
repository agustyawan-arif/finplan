import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormInput, FormSelect, SubmitButton } from '../transactions/TransactionFormFields';
import { AssetType, CurrencyCode, HoldingStatus } from '../../types/finance';

interface HoldingFormProps {
  onSuccess: () => void;
  holdingToEdit?: any;
}

export const HoldingForm: React.FC<HoldingFormProps> = ({ onSuccess, holdingToEdit }) => {
  const { accounts, addHolding, updateHolding } = useApp();

  const [accountId, setAccountId] = useState(holdingToEdit ? holdingToEdit.accountId : '');
  const [name, setName] = useState(holdingToEdit ? holdingToEdit.name : '');
  const [assetType, setAssetType] = useState<AssetType>(holdingToEdit ? holdingToEdit.assetType : 'stock');
  const [symbol, setSymbol] = useState(holdingToEdit ? holdingToEdit.symbol || '' : '');
  const [currency, setCurrency] = useState<CurrencyCode>(holdingToEdit ? holdingToEdit.currency : 'IDR');
  const [quantity, setQuantity] = useState(holdingToEdit && holdingToEdit.quantity ? holdingToEdit.quantity.toString() : '');
  const [averageCost, setAverageCost] = useState(holdingToEdit && holdingToEdit.averageCost ? holdingToEdit.averageCost.toString() : '');
  const [principalAmount, setPrincipalAmount] = useState(holdingToEdit && holdingToEdit.principalAmount ? holdingToEdit.principalAmount.toString() : '');
  const [currentPrice, setCurrentPrice] = useState(holdingToEdit && holdingToEdit.currentPrice ? holdingToEdit.currentPrice.toString() : '');
  const [currentValue, setCurrentValue] = useState(holdingToEdit ? holdingToEdit.currentValue.toString() : '');
  const [openedAt, setOpenedAt] = useState(holdingToEdit ? holdingToEdit.openedAt || '' : '');
  const [maturityDate, setMaturityDate] = useState(holdingToEdit ? holdingToEdit.maturityDate || '' : '');
  const [interestRate, setInterestRate] = useState(holdingToEdit && holdingToEdit.interestRate ? (holdingToEdit.interestRate * 100).toString() : '');
  const [status, setStatus] = useState<HoldingStatus>(holdingToEdit ? holdingToEdit.status : 'active');
  const [errorMessage, setErrorMessage] = useState('');

  // Setup account default
  useEffect(() => {
    const activeAccs = accounts.filter((a) => a.isActive && (a.type === 'investment' || a.type === 'bank' || a.type === 'deposit'));
    if (activeAccs.length > 0 && !accountId) {
      setAccountId(activeAccs[0].id);
      setCurrency(activeAccs[0].currency);
    }
  }, [accounts, accountId]);

  // Sync currency with account selection
  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selAccId = e.target.value;
    setAccountId(selAccId);
    const acc = accounts.find((a) => a.id === selAccId);
    if (acc) setCurrency(acc.currency);
  };

  // Sync total currentValue from quantity and currentPrice when stocks/mutual_funds are adjusted
  useEffect(() => {
    if (assetType === 'stock' || assetType === 'mutual_fund') {
      const q = parseFloat(quantity);
      const p = parseFloat(currentPrice);
      if (!isNaN(q) && !isNaN(p) && q > 0 && p >= 0) {
        setCurrentValue((q * p).toString());
      }
    }
  }, [quantity, currentPrice, assetType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!accountId) {
      setErrorMessage('Please select a brokerage or bank account.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Asset name is required.');
      return;
    }

    const parsedVal = parseFloat(currentValue);
    if (isNaN(parsedVal) || parsedVal < 0) {
      setErrorMessage('Please enter a valid current value.');
      return;
    }

    const holdingPayload = {
      accountId,
      name: name.trim(),
      assetType,
      symbol: symbol.trim() || null,
      currency,
      quantity: quantity ? parseFloat(quantity) : null,
      averageCost: averageCost ? parseFloat(averageCost) : null,
      principalAmount: principalAmount ? parseFloat(principalAmount) : (parsedVal || null),
      currentPrice: currentPrice ? parseFloat(currentPrice) : null,
      currentValue: parsedVal,
      openedAt: openedAt || null,
      maturityDate: maturityDate || null,
      interestRate: interestRate ? parseFloat(interestRate) / 100 : null,
      status,
    };

    if (holdingToEdit) {
      updateHolding(holdingToEdit.id, holdingPayload);
    } else {
      addHolding(holdingPayload);
    }

    onSuccess();
  };

  const activeAccounts = accounts.filter((a) => a.isActive);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
          ⚠️ {errorMessage}
        </p>
      )}

      <div className="space-y-3.5 text-xs">
        <FormInput
          label="Asset Name"
          type="text"
          placeholder="e.g. Bank Central Asia (BBCA), SGD Cash Holding"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <FormSelect label="Asset Category" value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)} required>
            <option value="stock">Stock Equity</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="deposit">Fixed Deposit</option>
            <option value="foreign_currency">Foreign Currency</option>
            <option value="other">Other Asset</option>
          </FormSelect>

          <FormSelect label="Broker / Cash Account" value={accountId} onChange={handleAccountChange} required>
            {activeAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormInput
            label="Symbol / Code (Optional)"
            type="text"
            placeholder="e.g. BBCA.JK, SGD"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <FormSelect label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} required>
            <option value="IDR">IDR (Rp)</option>
            <option value="SGD">SGD ($)</option>
            <option value="USD">USD ($)</option>
          </FormSelect>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3.5">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Valuation Metrics</span>
          
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Quantity Held (Optional)"
              type="number"
              step="any"
              placeholder="e.g. 1500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <FormInput
              label="Avg Purchase Cost (Optional)"
              type="number"
              step="any"
              placeholder="e.g. 9200"
              value={averageCost}
              onChange={(e) => setAverageCost(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Current Unit Price (Optional)"
              type="number"
              step="any"
              placeholder="e.g. 9800"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
            />
            <FormInput
              label="Total Current Value"
              type="number"
              step="any"
              placeholder="e.g. 14700000"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              required
            />
          </div>
        </div>

        {assetType === 'deposit' && (
          <div className="bg-amber-50/40 border border-amber-100/50 rounded-2xl p-4.5 space-y-3.5">
            <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest block">Deposit Specifications</span>

            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="Placement Principal"
                type="number"
                step="any"
                placeholder="e.g. 50000000"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
              />
              <FormInput
                label="Interest Rate (% p.a.)"
                type="number"
                step="any"
                placeholder="e.g. 6.25"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="Opened Placement Date"
                type="date"
                value={openedAt}
                onChange={(e) => setOpenedAt(e.target.value)}
              />
              <FormInput
                label="Maturity Date"
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <FormSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value as HoldingStatus)} required>
            <option value="active">Active Holding</option>
            <option value="sold">Fully Sold</option>
            <option value="matured">Matured (Deposit)</option>
            <option value="closed">Closed / Redeemed</option>
          </FormSelect>
        </div>
      </div>

      <SubmitButton>{holdingToEdit ? 'Save Asset Modifications' : 'Configure New Asset Holding'}</SubmitButton>
    </form>
  );
};
export default HoldingForm;
