import { Budget } from '../types/finance';

export const mockBudgets: Budget[] = [
  {
    id: 'budget_needs_may',
    month: '2026-05',
    categoryId: 'cat_needs',
    plannedAmount: 3000000,
    currency: 'IDR',
    rolloverEnabled: false,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'budget_wants_may',
    month: '2026-05',
    categoryId: 'cat_wants',
    plannedAmount: 1000000,
    currency: 'IDR',
    rolloverEnabled: false,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'budget_saving_may',
    month: '2026-05',
    categoryId: 'cat_saving',
    plannedAmount: 3000000,
    currency: 'IDR',
    rolloverEnabled: false,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'budget_charity_may',
    month: '2026-05',
    categoryId: 'cat_charity',
    plannedAmount: 300000,
    currency: 'IDR',
    rolloverEnabled: false,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
];
