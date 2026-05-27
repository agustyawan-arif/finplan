import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormInput, FormTextarea, SubmitButton, FormPickerTrigger } from '../transactions/TransactionFormFields';
import { GenericSelectorBottomSheet, AccountSelectorBottomSheet } from '../transactions/SelectorBottomSheet';
import { AssetType, CurrencyCode, HoldingStatus } from '../../types/finance';

interface HoldingFormProps {
  onSuccess: () => void;
  holdingToEdit?: any;
  defaultAccountId?: string;
}

export const HoldingForm: React.FC<HoldingFormProps> = ({ onSuccess, holdingToEdit, defaultAccountId }) => {
  const { accounts, addHolding, updateHolding } = useApp();

  const [accountId, setAccountId] = useState(holdingToEdit ? holdingToEdit.accountId : (defaultAccountId || ''));
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

  const [isAssetTypeSheetOpen, setIsAssetTypeSheetOpen] = useState(false);
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);
  const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);

  const assetTypeOptions = [
    { id: 'stock', label: 'Stock Equity' },
    { id: 'mutual_fund', label: 'Mutual Fund' },
    { id: 'deposit', label: 'Fixed Deposit' },
    { id: 'foreign_currency', label: 'Foreign Currency' },
    { id: 'other', label: 'Other Asset' },
  ];

  const currencyOptions = [
    { id: 'IDR', label: 'IDR (Rp)' },
    { id: 'SGD', label: 'SGD ($)' },
    { id: 'USD', label: 'USD ($)' },
  ];

  const statusOptions = [
    { id: 'active', label: 'Active Holding' },
    { id: 'sold', label: 'Fully Sold' },
    { id: 'matured', label: 'Matured (Deposit)' },
    { id: 'closed', label: 'Closed / Redeemed' },
  ];

  // Setup account default
  useEffect(() => {
    const activeAccs = accounts.filter((a) => a.isActive && (a.type === 'investment' || a.type === 'bank' || a.type === 'deposit'));
    if (activeAccs.length > 0 && !accountId) {
      setAccountId(activeAccs[0].id);
      setCurrency(activeAccs[0].currency);
    }
  }, [accounts, accountId]);

  // Sync currency with account selection
  const handleAccountChange = (acc: any) => {
    setAccountId(acc.id);
    setCurrency(acc.currency);
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
          <FormPickerTrigger
            label="Asset Category"
            valueText={assetTypeOptions.find(o => o.id === assetType)?.label || 'Select...'}
            onClick={() => setIsAssetTypeSheetOpen(true)}
          />

          <FormPickerTrigger
            label="Broker / Cash Account"
            valueText={accountId ? (accounts.find(a => a.id === accountId)?.name || 'Select...') : 'Select...'}
            subtitleText={accountId ? accounts.find(a => a.id === accountId)?.currency : ''}
            onClick={() => setIsAccountSheetOpen(true)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormInput
            label="Symbol / Code (Optional)"
            type="text"
            placeholder="e.g. BBCA.JK, SGD"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <FormPickerTrigger
            label="Currency"
            valueText={currencyOptions.find(o => o.id === currency)?.label || 'Select...'}
            onClick={() => setIsCurrencySheetOpen(true)}
          />
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
          <FormPickerTrigger
            label="Status"
            valueText={statusOptions.find(o => o.id === status)?.label || 'Select...'}
            onClick={() => setIsStatusSheetOpen(true)}
          />
        </div>
      </div>

      <SubmitButton>{holdingToEdit ? 'Save Asset Modifications' : 'Configure New Asset Holding'}</SubmitButton>

      <GenericSelectorBottomSheet
        isOpen={isAssetTypeSheetOpen}
        onClose={() => setIsAssetTypeSheetOpen(false)}
        title="Select Asset Category"
        options={assetTypeOptions}
        selectedId={assetType}
        onSelect={(id) => setAssetType(id as AssetType)}
      />

      <GenericSelectorBottomSheet
        isOpen={isCurrencySheetOpen}
        onClose={() => setIsCurrencySheetOpen(false)}
        title="Select Currency"
        options={currencyOptions}
        selectedId={currency}
        onSelect={(id) => setCurrency(id as CurrencyCode)}
      />

      <GenericSelectorBottomSheet
        isOpen={isStatusSheetOpen}
        onClose={() => setIsStatusSheetOpen(false)}
        title="Select Holding Status"
        options={statusOptions}
        selectedId={status}
        onSelect={(id) => setStatus(id as HoldingStatus)}
      />

      <AccountSelectorBottomSheet
        isOpen={isAccountSheetOpen}
        onClose={() => setIsAccountSheetOpen(false)}
        title="Select Broker / Cash Account"
        selectedId={accountId}
        onSelect={handleAccountChange}
        allowedTypes={['bank', 'investment', 'deposit', 'cash', 'pocket', 'e_wallet']}
      />
    </form>
  );
};
export default HoldingForm;
