import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Category, UserSettings, DEFAULT_CATEGORIES, CURRENCIES } from '../models';

// Storage keys
const STORAGE_KEYS = {
  EXPENSES: 'expensaur_expenses',
  CATEGORIES: 'expensaur_categories',
  USER_SETTINGS: 'expensaur_settings',
  USER: 'expensaur_user',
  EXCHANGE_RATES: 'expensaur_exchange_rates',
  LAST_SYNC: 'expensaur_last_sync',
};

// Save expenses to AsyncStorage
export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
    throw error;
  }
};

// Get expenses from AsyncStorage
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const expensesJson = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    return expensesJson ? JSON.parse(expensesJson) : [];
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

// Save categories to AsyncStorage
export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
};

// Get categories from AsyncStorage
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesJson = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    
    if (!categoriesJson) {
      // If no categories exist, create default categories
      const now = Date.now();
      const defaultCategories = DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `default-${index}`,
        createdAt: now,
        updatedAt: now,
      }));
      
      await saveCategories(defaultCategories);
      return defaultCategories;
    }
    
    return JSON.parse(categoriesJson);
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

// Save user settings to AsyncStorage
export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

// Get user settings from AsyncStorage
export const getUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    
    if (!settingsJson) {
      // Create default settings if none exist
      const defaultSettings: UserSettings = {
        userId,
        defaultCurrency: 'USD',
        firstDayOfMonth: 1, // 1st of month
        firstDayOfWeek: 0, // Sunday
        theme: 'light',
        notificationsEnabled: true,
        autoSync: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await saveUserSettings(defaultSettings);
      return defaultSettings;
    }
    
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Error getting user settings:', error);
    // Return default settings in case of error
    return {
      userId,
      defaultCurrency: 'USD',
      firstDayOfMonth: 1,
      firstDayOfWeek: 0,
      theme: 'light',
      notificationsEnabled: true,
      autoSync: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
};

// Save current user to AsyncStorage
export const saveCurrentUser = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, userId);
  } catch (error) {
    console.error('Error saving current user:', error);
    throw error;
  }
};

// Get current user from AsyncStorage
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Save exchange rates to AsyncStorage
export const saveExchangeRates = async (rates: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(rates));
  } catch (error) {
    console.error('Error saving exchange rates:', error);
    throw error;
  }
};

// Get exchange rates from AsyncStorage
export const getExchangeRates = async (): Promise<any> => {
  try {
    const ratesJson = await AsyncStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
    return ratesJson ? JSON.parse(ratesJson) : {};
  } catch (error) {
    console.error('Error getting exchange rates:', error);
    return {};
  }
};

// Save last sync timestamp to AsyncStorage
export const saveLastSync = async (timestamp: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
  } catch (error) {
    console.error('Error saving last sync timestamp:', error);
    throw error;
  }
};

// Get last sync timestamp from AsyncStorage
export const getLastSync = async (): Promise<number> => {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp) : 0;
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return 0;
  }
};

// Add a new expense
export const addExpense = async (expense: Expense): Promise<void> => {
  const expenses = await getExpenses();
  expenses.push(expense);
  await saveExpenses(expenses);
};

// Update an existing expense
export const updateExpense = async (updatedExpense: Expense): Promise<void> => {
  const expenses = await getExpenses();
  const index = expenses.findIndex(exp => exp.id === updatedExpense.id);
  
  if (index !== -1) {
    expenses[index] = updatedExpense;
    await saveExpenses(expenses);
  }
};

// Delete an expense
export const deleteExpense = async (expenseId: string): Promise<void> => {
  const expenses = await getExpenses();
  const filteredExpenses = expenses.filter(exp => exp.id !== expenseId);
  await saveExpenses(filteredExpenses);
};

// Add a new category
export const addCategory = async (category: Category): Promise<void> => {
  const categories = await getCategories();
  categories.push(category);
  await saveCategories(categories);
};

// Update an existing category
export const updateCategory = async (updatedCategory: Category): Promise<void> => {
  const categories = await getCategories();
  const index = categories.findIndex(cat => cat.id === updatedCategory.id);
  
  if (index !== -1) {
    categories[index] = updatedCategory;
    await saveCategories(categories);
  }
};

// Delete a category
export const deleteCategory = async (categoryId: string): Promise<void> => {
  const categories = await getCategories();
  const filteredCategories = categories.filter(cat => cat.id !== categoryId);
  await saveCategories(filteredCategories);
}; 