/**
 * Currency Utilities
 * 
 * Global currency formatting utilities to ensure consistency across the application.
 * Default currency is Saudi Riyals (SAR).
 */

export const DEFAULT_CURRENCY = 'SAR';
export const DEFAULT_CURRENCY_SYMBOL = 'SAR';

/**
 * Formats a number as currency using the default currency (SAR)
 */
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${DEFAULT_CURRENCY_SYMBOL} 0`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Formats a number as currency with a specific currency
 */
export const formatCurrencyWithCode = (amount: number | string, currency: string = DEFAULT_CURRENCY): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${currency} 0`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Formats a number as simple currency display (e.g., "SAR 1,000")
 */
export const formatSimpleCurrency = (amount: number | string, currency: string = DEFAULT_CURRENCY_SYMBOL): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${currency} 0`;
  }

  return `${currency} ${numAmount.toLocaleString()}`;
};

/**
 * Gets the currency symbol for a given currency code
 */
export const getCurrencySymbol = (currency: string = DEFAULT_CURRENCY): string => {
  const currencyMap: Record<string, string> = {
    'SAR': 'SAR',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED',
    'KWD': 'KWD',
    'QAR': 'QAR',
    'BHD': 'BHD',
    'OMR': 'OMR',
  };

  return currencyMap[currency] || currency;
};

/**
 * Validates if a currency code is supported
 */
export const isValidCurrency = (currency: string): boolean => {
  const supportedCurrencies = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'];
  return supportedCurrencies.includes(currency.toUpperCase());
};



