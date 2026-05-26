import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormInput, FormTextarea, SubmitButton } from '../transactions/TransactionFormFields';
import { CurrencyCode } from '../../types/finance';
import { CategorySelectorBottomSheet } from '../transactions/SelectorBottomSheet';
import { ChevronDown } from 'lucide-react';

interface BudgetFormProps {
  onSuccess: () => void;
  selectedMonth: string;
  defaultCategoryId?: string;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSuccess,
  selectedMonth,
  defaultCategoryId = '',
}) => {
  const { categories, budgets, addBudget, updateBudget, getCategoryName } = useApp();

  const [month, setMonth] = useState(selectedMonth);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [plannedAmount, setPlannedAmount] = useState('');
  const [currency] = useState<CurrencyCode>('IDR');
  const [rolloverEnabled, setRolloverEnabled] = useState(false);
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Sync state when selectedMonth or category changes
  useEffect(() => {
    setMonth(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    if (defaultCategoryId) {
      setCategoryId(defaultCategoryId);
    } else {
      const parentCategories = categories.filter((c) => !c.parentCategoryId && c.id !== 'cat_income_root');
      if (parentCategories.length > 0) {
        setCategoryId(parentCategories[0].id);
      }
    }
  }, [categories, defaultCategoryId]);

  // Query existing budget details to prefill fields or reveal edits
  useEffect(() => {
    if (month && categoryId) {
      const existing = budgets.find((b) => b.month === month && b.categoryId === categoryId);
      if (existing) {
        setPlannedAmount(existing.plannedAmount.toString());
        setRolloverEnabled(existing.rolloverEnabled);
        setNote(existing.note || '');
        setInfoMessage('💡 An allocation limit is already established. Submitting will update the current budget.');
      } else {
        setPlannedAmount('');
        setRolloverEnabled(false);
        setNote('');
        setInfoMessage('');
      }
    }
  }, [month, categoryId, budgets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!month.match(/^\d{4}-\d{2}$/)) {
      setErrorMessage('Please enter a valid month in YYYY-MM format.');
      return;
    }

    const parsedAmount = parseFloat(plannedAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setErrorMessage('Please enter a planned limit greater than or equal to 0.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a target category.');
      return;
    }

    // Unification Check: Prevent duplication, edit existing record under the hood
    const existing = budgets.find((b) => b.month === month && b.categoryId === categoryId);

    const budgetData = {
      month,
      categoryId,
      plannedAmount: parsedAmount,
      currency,
      rolloverEnabled,
      note: note.trim() || undefined,
    };

    if (existing) {
      updateBudget(existing.id, budgetData);
    } else {
      addBudget(budgetData);
    }

    onSuccess();
  };

  const parentCategories = categories.filter(
    (c) => !c.parentCategoryId && c.id !== 'cat_income_root'
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <p className="text-rose-500 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg animate-pulse">
          ⚠️ {errorMessage}
        </p>
      )}

      {infoMessage && (
        <p className="text-[#006c49] text-[9px] font-bold bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg leading-snug">
          {infoMessage}
        </p>
      )}

      <div className="space-y-3">
        <FormInput
          label="Budget Month (YYYY-MM)"
          type="text"
          placeholder="e.g. 2026-05"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />

        <div>
          <span className="text-xs font-bold text-slate-800 block mb-1.5 ml-1">Target Budget Category</span>
          <button
            type="button"
            onClick={() => setIsCategorySheetOpen(true)}
            className="w-full text-left p-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-1 transition-all flex items-center justify-between group hover:bg-slate-100"
          >
            <span className={categoryId ? 'text-sm font-bold text-[#0b1c30]' : 'text-sm font-semibold text-slate-400'}>
              {categoryId ? getCategoryName(categoryId) : 'Select a category'}
            </span>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:border-slate-200">
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </button>
        </div>

        <CategorySelectorBottomSheet
          isOpen={isCategorySheetOpen}
          onClose={() => setIsCategorySheetOpen(false)}
          title="Select Budget Category"
          selectedId={categoryId}
          onSelect={(c) => setCategoryId(c.id)}
          isBudgetSelector={true}
        />

        <FormInput
          label={`Target Planned Limit (${currency})`}
          type="number"
          placeholder="0"
          value={plannedAmount}
          onChange={(e) => setPlannedAmount(e.target.value)}
          required
        />

        {/* Rollover checkbox */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl select-none">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Enable Budget Rollover</span>
            <span className="text-[8px] text-slate-400 font-medium leading-none block mt-0.5">
              Accumulate unused margins to the next month's allocation
            </span>
          </div>
          <input
            type="checkbox"
            checked={rolloverEnabled}
            onChange={(e) => setRolloverEnabled(e.target.checked)}
            className="w-4 h-4 text-primary focus:ring-0 rounded-sm cursor-pointer"
          />
        </div>

        <FormTextarea
          label="Budget Goals / Note (Optional)"
          placeholder="e.g. Keep food delivery under control this month..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <SubmitButton>{infoMessage ? 'Update Budget Plan' : 'Establish Budget'}</SubmitButton>
    </form>
  );
};
export default BudgetForm;
