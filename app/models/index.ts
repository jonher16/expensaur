// User model
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
}

// Category model
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
  lastSyncedAt?: number;
}

// Default categories that come with the app
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Food & Dining', color: '#FF9800', icon: 'food', isDefault: true },
  { name: 'Transportation', color: '#2196F3', icon: 'car', isDefault: true },
  { name: 'Entertainment', color: '#9C27B0', icon: 'movie', isDefault: true },
  { name: 'Shopping', color: '#F44336', icon: 'cart', isDefault: true },
  { name: 'Healthcare', color: '#00BCD4', icon: 'hospital', isDefault: true },
  { name: 'Housing', color: '#795548', icon: 'home', isDefault: true },
  { name: 'Education', color: '#FFEB3B', icon: 'school', isDefault: true },
  { name: 'Utilities', color: '#607D8B', icon: 'flashlight', isDefault: true },
  { name: 'Other', color: '#9E9E9E', icon: 'help-circle', isDefault: true },
];

// Currency model
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Some common currencies
export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

// Currency exchange rates model
export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: number;
}

// Expense model
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  originalAmount?: number; // In case of currency conversion
  originalCurrency?: string; // Original currency code
  currency: string; // Target currency code
  exchangeRate?: number; // Exchange rate used for conversion
  description: string;
  categoryId: string;
  date: number; // Timestamp
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
  lastSyncedAt?: number;
}

// User settings model
export interface UserSettings {
  userId: string;
  defaultCurrency: string;
  firstDayOfMonth: number; // 0-6 (Sunday-Saturday)
  firstDayOfWeek: number; // 0-6 (Sunday-Saturday)
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  autoSync: boolean;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

// Sync status model for tracking sync state
export interface SyncStatus {
  lastSyncedAt: number;
  isPending: boolean;
  hasConflicts: boolean;
  pendingSyncItems: number;
}

// Export format for Excel/CSV
export interface ExportData {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  exportedAt: number;
  version: string;
} 