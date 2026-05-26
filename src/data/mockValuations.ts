import { AssetValuation } from '../types/finance';

export const mockValuations: AssetValuation[] = [
  {
    id: 'val_bibit_may',
    holdingId: 'hold_bibit',
    valuationDate: '2026-05-15',
    price: null,
    value: 6200000,
    exchangeRateToBase: 1,
    note: 'Update Bibit Value',
    createdAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'val_bbca_may',
    holdingId: 'hold_bbca',
    valuationDate: '2026-05-01',
    price: 9500,
    value: 950000,
    exchangeRateToBase: 1,
    note: 'Initial month pricing',
    createdAt: '2026-05-01T00:00:00Z',
  },
];
