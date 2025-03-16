import { CURRENCIES, Currency, ExchangeRate } from '../models';

/**
 * Format a number as currency
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string => {
  const currency = getCurrencyByCode(currencyCode);
  
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
  
  return formatter.format(amount);
};

/**
 * Format a number as currency without the currency symbol
 */
export const formatAmountWithoutSymbol = (
  amount: number,
  currencyCode: string = 'USD'
): string => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

/**
 * Get currency symbol by currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.symbol || currencyCode;
};

/**
 * Get currency object by currency code
 */
export const getCurrencyByCode = (currencyCode: string): Currency | undefined => {
  return CURRENCIES.find(c => c.code === currencyCode);
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRate[]
): number => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Find the exchange rate
  const exchangeRate = exchangeRates.find(
    rate => rate.baseCurrency === fromCurrency && rate.targetCurrency === toCurrency
  );
  
  if (exchangeRate) {
    return amount * exchangeRate.rate;
  }
  
  // Check for reverse rate
  const reverseRate = exchangeRates.find(
    rate => rate.baseCurrency === toCurrency && rate.targetCurrency === fromCurrency
  );
  
  if (reverseRate) {
    return amount / reverseRate.rate;
  }
  
  // If no direct conversion found, try to convert through USD
  const fromToUSD = exchangeRates.find(
    rate => rate.baseCurrency === fromCurrency && rate.targetCurrency === 'USD'
  );
  
  const usdToTarget = exchangeRates.find(
    rate => rate.baseCurrency === 'USD' && rate.targetCurrency === toCurrency
  );
  
  if (fromToUSD && usdToTarget) {
    const amountInUSD = amount * fromToUSD.rate;
    return amountInUSD * usdToTarget.rate;
  }
  
  // If no conversion path found, return original amount
  console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
  return amount;
};

/**
 * Parse currency amount from string
 */
export const parseCurrencyAmount = (value: string): number => {
  // Remove all non-numeric characters except decimal point
  const sanitized = value.replace(/[^0-9.]/g, '');
  const amount = parseFloat(sanitized);
  return isNaN(amount) ? 0 : amount;
};

/**
 * Calculate total from array of amounts
 */
export const calculateTotal = (amounts: number[]): number => {
  return amounts.reduce((sum, amount) => sum + amount, 0);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, fractionDigits: number = 1): string => {
  return `${value.toFixed(fractionDigits)}%`;
}; 