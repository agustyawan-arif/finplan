import { CurrencyCode } from '../../types/finance';

/**
 * Consistently format IDR to prevent hydration mismatches
 * Rp100.000 style formatting (no space, locale-safe dots separators)
 */
export const formatIDR = (amount: number): string => {
  const rounded = Math.round(amount);
  return `Rp${rounded.toLocaleString('id-ID')}`;
};

/**
 * Format currency value consistently across client and server
 */
export const formatCurrency = (amount: number, currency: CurrencyCode | string): string => {
  if (currency === 'IDR') {
    return formatIDR(amount);
  }

  // Format foreign currencies consistently using standard english formats
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Eliminate any non-breaking spaces or whitespace formatting disparities
  return formatted.replace(/[\u00A0\u2007\u202F\u200B\s]/g, '');
};

/**
 * Compact currency formatting (e.g. 1.2M, 500K) readable on iPhone
 */
export const formatCompactCurrency = (amount: number, currency: CurrencyCode | string): string => {
  const isIDR = currency === 'IDR';
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });

  const formatted = formatter.format(amount);
  
  if (isIDR) {
    return `Rp${formatted.replace(/[\u00A0\u2007\u202F\u200B\s]/g, '')}`;
  }
  
  const prefix = currency === 'SGD' ? 'S$' : (currency === 'USD' ? '$' : currency);
  return `${prefix}${formatted.replace(/[\u00A0\u2007\u202F\u200B\s]/g, '')}`;
};

/**
 * Consistently format percentages (e.g., 42.5%)
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Consistently format YYYY-MM-DD into readable date (e.g., "Mon, 25 May 2026")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Consistently format YYYY-MM into readable month (e.g., "May 2026")
 */
export const formatMonth = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (isNaN(date.getTime())) return monthString;

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};
