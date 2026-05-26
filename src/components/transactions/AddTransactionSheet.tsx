import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TransactionType } from '../../types/finance';
import { ExpenseForm } from './ExpenseForm';
import { IncomeForm } from './IncomeForm';
import { TransferForm } from './TransferForm';
import { AdjustmentForm } from './AdjustmentForm';
import { AssetBuyForm } from './AssetBuyForm';
import { AssetSellForm } from './AssetSellForm';
import { AssetValueUpdateForm } from './AssetValueUpdateForm';

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const AddTransactionSheet: React.FC<AddTransactionSheetProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);

  // Sync state when sheet becomes open
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  // Dynamically render the selected type form
  const renderActiveForm = () => {
    switch (type) {
      case 'expense':
        return <ExpenseForm onSuccess={onClose} />;
      case 'income':
        return <IncomeForm onSuccess={onClose} />;
      case 'transfer':
        return <TransferForm onSuccess={onClose} />;
      case 'adjustment':
        return <AdjustmentForm onSuccess={onClose} />;
      case 'asset_buy':
        return <AssetBuyForm onSuccess={onClose} />;
      case 'asset_sell':
        return <AssetSellForm onSuccess={onClose} />;
      case 'asset_value_update':
        return <AssetValueUpdateForm onSuccess={onClose} />;
      default:
        return <ExpenseForm onSuccess={onClose} />;
    }
  };

  const getFormTitle = () => {
    switch (type) {
      case 'expense':
        return 'Record Expense';
      case 'income':
        return 'Record Income';
      case 'transfer':
        return 'Record Transfer';
      case 'adjustment':
        return 'Balance Adjustment';
      case 'asset_buy':
        return 'Record Asset Buy';
      case 'asset_sell':
        return 'Record Asset Sell';
      case 'asset_value_update':
        return 'Revalue Holding';
      default:
        return 'New Transaction';
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
      {/* Tap outside backdrop area to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide up mobile bottom drawer sheet */}
      <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[92%] overflow-hidden animate-slide-up pb-8">
        {/* Sticky top sticky headers */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
          <h2 className="text-base font-bold text-[#0b1c30] tracking-tight">{getFormTitle()}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-4">
          {/* Form fields injector */}
          <div className="pt-2">{renderActiveForm()}</div>
        </div>
      </div>
    </div>
  );
};
export default AddTransactionSheet;
