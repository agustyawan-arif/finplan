import { ExchangeRate } from '../types/finance';

export const mockExchangeRates: ExchangeRate[] = [
  {
    id: 'rate_sgd_idr_may',
    fromCurrency: 'SGD',
    toCurrency: 'IDR',
    rate: 12100,
    rateDate: '2026-05-01',
    source: 'manual',
    createdAt: '2026-05-01T00:00:00Z',
  },
];
