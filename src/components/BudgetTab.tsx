'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, PiggyBank, FolderPlus } from 'lucide-react';
import { BudgetMonthSelector } from './budget/BudgetMonthSelector';
import { BudgetSummaryCard } from './budget/BudgetSummaryCard';
import { BudgetGroupCard } from './budget/BudgetGroupCard';
import { BudgetDetailSheet } from './budget/BudgetDetailSheet';
import { BudgetForm } from './budget/BudgetForm';

export const BudgetTab: React.FC = () => {
  const { getBudgetProgress, categories, globalMonth } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaultCategoryId, setFormDefaultCategoryId] = useState('');

  const currentMonth = globalMonth;
  const budget = getBudgetProgress(currentMonth);

  const handleGroupCardClick = (group: any) => {
    setSelectedGroup(group);
  };

  const handleEditTrigger = (categoryName: string) => {
    // Find parent category matching the name (e.g. Needs -> cat_needs)
    const cat = categories.find((c) => c.name === categoryName && !c.parentCategoryId);
    if (cat) {
      setFormDefaultCategoryId(cat.id);
      setSelectedGroup(null);
      setIsFormOpen(true);
    }
  };

  const handleAddBudgetClick = () => {
    setFormDefaultCategoryId('');
    setIsFormOpen(true);
  };

  const hasBudgetSet = budget.totalPlanned > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Main Budget layout scrolling container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-4 space-y-5">
        {!hasBudgetSet ? (
          // Empty State display if planned budget is 0
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 select-none animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
              <PiggyBank size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-slate-800">No Budget Plan Active</h3>
              <p className="text-[10px] text-slate-400 max-w-[200px] leading-normal font-medium">
                Establish spending allowances or savings goals for the selected month.
              </p>
            </div>
            <button
              onClick={handleAddBudgetClick}
              className="flex items-center gap-1 bg-[#0F172A] hover:bg-[#1e293b] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <FolderPlus size={13} /> Create Budget Goal
            </button>
          </div>
        ) : (
          // Standard Group display
          <div className="space-y-5 animate-fade-in">
            <BudgetSummaryCard
              totalPlanned={budget.totalPlanned}
              totalUsed={budget.totalUsed}
              totalRemaining={budget.totalRemaining}
            />

            {/* Parent Category budgets list */}
            <div className="space-y-3 select-none">
              <div className="flex items-baseline justify-between pl-1">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                  Category Limits
                </h3>
                <button
                  onClick={handleAddBudgetClick}
                  className="text-[10px] font-extrabold text-[#006c49] hover:underline"
                >
                  Adjust Categories
                </button>
              </div>

              <div className="space-y-2.5">
                {budget.groups.map((group) => (
                  <BudgetGroupCard
                    key={group.name}
                    name={group.name}
                    planned={group.planned}
                    used={group.used}
                    remaining={group.remaining}
                    percentage={group.percentage}
                    onClick={() => handleGroupCardClick(group)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add budget icon button */}
      {hasBudgetSet && (
        <button
          onClick={handleAddBudgetClick}
          className="absolute bottom-[calc(88px+env(safe-area-inset-bottom,0px))] right-6 w-12 h-12 rounded-full bg-primary text-white shadow-ambient-lg flex items-center justify-center hover:scale-95 transition-all active:scale-90 z-20 cursor-pointer"
        >
          <Plus size={24} className="stroke-[2.5]" />
        </button>
      )}

      {/* Detail Drill-down sheet inspector */}
      {selectedGroup && (
        <BudgetDetailSheet
          group={selectedGroup}
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onEditTrigger={() => handleEditTrigger(selectedGroup.name)}
        />
      )}

      {/* Add / Edit Budget bottom sheet form modal */}
      {isFormOpen && (
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex flex-col justify-end transition-all duration-300">
          <div className="flex-1" onClick={() => setIsFormOpen(false)} />
          <div className="bg-white rounded-t-[32px] shadow-ambient-lg flex flex-col max-h-[90%] overflow-hidden animate-slide-up pb-8">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
              <h2 className="text-base font-bold text-[#0b1c30] tracking-tight">
                {formDefaultCategoryId ? 'Adjust Category Limit' : 'Create Budget Goal'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
              <BudgetForm
                onSuccess={() => setIsFormOpen(false)}
                selectedMonth={globalMonth}
                defaultCategoryId={formDefaultCategoryId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BudgetTab;
