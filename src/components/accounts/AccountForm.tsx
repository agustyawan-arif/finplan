import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Account, AccountType, AccountPurpose, CurrencyCode } from '../../types/finance';
import { FormInput, FormSelect, FormTextarea, SubmitButton } from '../transactions/TransactionFormFields';

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

        <FormSelect label="Account Type" value={type} onChange={(e) => setType(e.target.value as AccountType)} required>
          <option value="bank">Bank Account</option>
          <option value="cash">Cash vault / pocket</option>
          <option value="e_wallet">E-wallet</option>
          <option value="pocket">Saving pocket / envelope</option>
          <option value="deposit">Deposit certificate</option>
          <option value="investment">Investment wallet</option>
        </FormSelect>

        <FormSelect label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} required>
          <option value="IDR">IDR (Rupiah)</option>
          <option value="SGD">SGD (Singapore Dollar)</option>
          <option value="USD">USD (US Dollar)</option>
        </FormSelect>

        <FormSelect label="Financial Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value as AccountPurpose)} required>
          <option value="daily_spending">Daily spendings / payouts</option>
          <option value="saving">Future general savings</option>
          <option value="emergency_fund">Emergency reserves</option>
          <option value="travel_fund">Travel & vacation</option>
          <option value="bill_payment">Monthly bill allocations</option>
          <option value="investment">Investments & capital growth</option>
          <option value="deposit">Fixed deposit certificate</option>
          <option value="other">Other purposes</option>
        </FormSelect>

        {type === 'pocket' && (
          <FormSelect
            label="Parent Bank Account (Recommended)"
            value={parentAccountId}
            onChange={(e) => setParentAccountId(e.target.value)}
          >
            <option value="">No Parent Bank Account</option>
            {activeParentCandidates.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.institution})
              </option>
            ))}
          </FormSelect>
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
    </form>
  );
};
export default AccountForm;
