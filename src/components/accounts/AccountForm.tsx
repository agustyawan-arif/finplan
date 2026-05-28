import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Account, AccountType, AccountPurpose, CurrencyCode } from '../../types/finance';
import { FormInput, FormTextarea, SubmitButton, FormPickerTrigger } from '../transactions/TransactionFormFields';
import { GenericSelectorBottomSheet, AccountSelectorBottomSheet } from '../transactions/SelectorBottomSheet';

interface AccountFormProps {
  onSuccess: () => void;
  accountToEdit?: Account | null;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onSuccess, accountToEdit = null }) => {
  const { accounts, addAccount, updateAccount } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [institution, setInstitution] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [purpose, setPurpose] = useState<AccountPurpose>('daily_spending');
  const [parentAccountId, setParentAccountId] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);
  const [isPurposeSheetOpen, setIsPurposeSheetOpen] = useState(false);
  const [isParentSheetOpen, setIsParentSheetOpen] = useState(false);

  const typeOptions = [
    { id: 'bank', label: 'Bank Account' },
    { id: 'cash', label: 'Cash vault / pocket' },
    { id: 'e_wallet', label: 'E-wallet' },
    { id: 'pocket', label: 'Saving pocket / envelope' },
    { id: 'deposit', label: 'Deposit certificate' },
    { id: 'investment', label: 'Investment wallet' },
  ];

  const currencyOptions = [
    { id: 'IDR', label: 'IDR (Rupiah)' },
    { id: 'SGD', label: 'SGD (Singapore Dollar)' },
    { id: 'USD', label: 'USD (US Dollar)' },
  ];

  const purposeOptions = [
    { id: 'daily_spending', label: 'Daily spendings / payouts' },
    { id: 'saving', label: 'Future general savings' },
    { id: 'emergency_fund', label: 'Emergency reserves' },
    { id: 'travel_fund', label: 'Travel & vacation' },
    { id: 'bill_payment', label: 'Monthly bill allocations' },
    { id: 'investment', label: 'Investments & capital growth' },
    { id: 'deposit', label: 'Fixed deposit certificate' },
    { id: 'subscription_fund', label: 'Subscription Fund' },
    { id: 'other', label: 'Other purposes' },
  ];

  // Sync edits if editing existing account
  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setInstitution(accountToEdit.institution || '');
      setCurrency(accountToEdit.currency);
      setPurpose(accountToEdit.purpose);
      setParentAccountId(accountToEdit.parentAccountId || '');
      setInitialBalance(accountToEdit.initialBalance.toString());
    } else {
      setName('');
      setType('bank');
      setInstitution('');
      setCurrency('IDR');
      setPurpose('daily_spending');
      setParentAccountId('');
      setInitialBalance('0');
    }
  }, [accountToEdit]);

  // Dynamic warnings for mobile pockets
  useEffect(() => {
    if (type === 'pocket' && !parentAccountId) {
      setWarningMessage('💡 Pockets/kantong usually belong to a parent bank account (e.g. BCA Pockets).');
    } else {
      setWarningMessage('');
    }
  }, [type, parentAccountId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Account name is required.');
      return;
    }

    const parsedBalance = parseFloat(initialBalance);
    if (isNaN(parsedBalance)) {
      setErrorMessage('Please enter a valid starting balance.');
      return;
    }

    if (accountToEdit && parentAccountId === accountToEdit.id) {
      setErrorMessage('An account cannot be its own parent.');
      return;
    }

    const finalParentId = type === 'pocket' && parentAccountId ? parentAccountId : undefined;

    const accountData = {
      name: name.trim(),
      type,
      institution: institution.trim() || undefined,
      currency,
      purpose,
      parentAccountId: finalParentId,
      initialBalance: parsedBalance,
    };

    if (accountToEdit) {
      updateAccount(accountToEdit.id, accountData);
    } else {
      addAccount(accountData);
    }

    onSuccess();
  };

  const activeParentCandidates = accounts.filter(
    (a) => a.isActive && a.type === 'bank' && (!accountToEdit || a.id !== accountToEdit.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
          ⚠️ {errorMessage}
        </p>
      )}

      {warningMessage && (
        <p className="text-amber-600 text-[9px] font-semibold bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg leading-snug">
          {warningMessage}
        </p>
      )}

      <div className="space-y-3">
        <FormInput
          label="Account / Wallet Name"
          type="text"
          placeholder="e.g. BCA Personal, Gopay Pay, Cash Wallet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <FormInput
          label="Institution / Bank (Optional)"
          type="text"
          placeholder="e.g. BCA, Mandiri, Gojek"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormPickerTrigger
            label="Account Type"
            valueText={typeOptions.find(o => o.id === type)?.label || 'Select...'}
            onClick={() => setIsTypeSheetOpen(true)}
          />
          <FormPickerTrigger
            label="Currency"
            valueText={currencyOptions.find(o => o.id === currency)?.label || 'Select...'}
            onClick={() => setIsCurrencySheetOpen(true)}
          />
        </div>

        <FormPickerTrigger
          label="Financial Purpose"
          valueText={purposeOptions.find(o => o.id === purpose)?.label || 'Select...'}
          onClick={() => setIsPurposeSheetOpen(true)}
        />

        {type === 'pocket' && (
          <FormPickerTrigger
            label="Parent Bank Account"
            valueText={parentAccountId ? (accounts.find(a => a.id === parentAccountId)?.name || 'Select...') : 'No Parent Bank Account'}
            subtitleText="(Recommended)"
            onClick={() => setIsParentSheetOpen(true)}
          />
        )}

        <FormInput
          label="Starting Balance (Initial)"
          type="number"
          step="any"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          required
        />
      </div>

      <SubmitButton>{accountToEdit ? 'Save Changes' : 'Create Account'}</SubmitButton>

      <GenericSelectorBottomSheet
        isOpen={isTypeSheetOpen}
        onClose={() => setIsTypeSheetOpen(false)}
        title="Select Account Type"
        options={typeOptions}
        selectedId={type}
        onSelect={(id) => setType(id as AccountType)}
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
        isOpen={isPurposeSheetOpen}
        onClose={() => setIsPurposeSheetOpen(false)}
        title="Select Financial Purpose"
        options={purposeOptions}
        selectedId={purpose}
        onSelect={(id) => setPurpose(id as AccountPurpose)}
      />

      <AccountSelectorBottomSheet
        isOpen={isParentSheetOpen}
        onClose={() => setIsParentSheetOpen(false)}
        title="Select Parent Bank Account"
        selectedId={parentAccountId}
        onSelect={(acc) => setParentAccountId(acc.id)}
        allowedTypes={['bank']}
      />
    </form>
  );
};
export default AccountForm;
