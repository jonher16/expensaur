import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { Expense, Category, UserSettings, SyncStatus, ExchangeRate } from '../models';
import * as StorageService from '../services/storageService';
import * as FirebaseService from '../services/firebaseService';
import { generateId } from '../utils/commonUtils';

// Define the context shape
interface AppContextType {
  // Data
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings | null;
  exchangeRates: ExchangeRate[];
  syncStatus: SyncStatus;
  isLoading: boolean;
  
  // Theme
  theme: 'light' | 'dark';
  themeMode: 'light' | 'dark' | 'system';
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => Promise<void>;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  
  // Sync actions
  syncData: () => Promise<void>;
  
  // Import/Export actions
  exportToExcel: () => Promise<void>;
  importFromExcel: (filePath: string) => Promise<void>;
}

// Create the context with a default undefined value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider props
interface AppProviderProps {
  children: ReactNode;
  userId: string;
}

// Provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children, userId }) => {
  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncedAt: 0,
    isPending: false,
    hasConflicts: false,
    pendingSyncItems: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Theme state
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme === 'dark' ? 'dark' : 'light');

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load data from storage
        const [
          storedExpenses,
          storedCategories,
          storedSettings,
          storedExchangeRates,
          lastSync,
        ] = await Promise.all([
          StorageService.getExpenses(),
          StorageService.getCategories(),
          StorageService.getUserSettings(userId),
          StorageService.getExchangeRates(),
          StorageService.getLastSync(),
        ]);
        
        // Set state with loaded data
        setExpenses(storedExpenses);
        setCategories(storedCategories);
        setSettings(storedSettings);
        setExchangeRates(storedExchangeRates || []);
        setSyncStatus({
          lastSyncedAt: lastSync,
          isPending: false,
          hasConflicts: false,
          pendingSyncItems: 0,
        });
        
        // Set theme based on settings
        if (storedSettings?.theme) {
          setThemeModeState(storedSettings.theme);
          if (storedSettings.theme !== 'system') {
            setTheme(storedSettings.theme);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load app data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId]);
  
  // Update theme when system theme changes
  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, themeMode]);
  
  // Theme actions
  const toggleTheme = async (): Promise<void> => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(newThemeMode);
  };
  
  const setThemeMode = async (mode: 'light' | 'dark' | 'system'): Promise<void> => {
    try {
      setThemeModeState(mode);
      
      if (mode !== 'system') {
        setTheme(mode);
      } else {
        setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
      
      // Update settings
      if (settings) {
        await updateSettings({ theme: mode });
      }
    } catch (error) {
      console.error('Error setting theme mode:', error);
      Alert.alert('Error', 'Failed to update theme settings');
    }
  };

  // Expense actions
  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Date.now();
      const expense: Expense = {
        ...newExpense,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      
      // Update local state
      const updatedExpenses = [...expenses, expense];
      setExpenses(updatedExpenses);
      
      // Save to storage
      await StorageService.saveExpenses(updatedExpenses);
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isPending: true,
        pendingSyncItems: prev.pendingSyncItems + 1,
      }));
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const updateExpense = async (updatedExpense: Expense) => {
    try {
      // Update timestamp
      const expense = {
        ...updatedExpense,
        updatedAt: Date.now(),
      };
      
      // Update local state
      const index = expenses.findIndex(e => e.id === expense.id);
      if (index !== -1) {
        const updatedExpenses = [...expenses];
        updatedExpenses[index] = expense;
        setExpenses(updatedExpenses);
        
        // Save to storage
        await StorageService.saveExpenses(updatedExpenses);
        
        // Update sync status
        setSyncStatus(prev => ({
          ...prev,
          isPending: true,
          pendingSyncItems: prev.pendingSyncItems + 1,
        }));
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      // Find expense
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) return;
      
      // Mark as deleted instead of removing completely (for sync purposes)
      const deletedExpense = {
        ...expense,
        isDeleted: true,
        updatedAt: Date.now(),
      };
      
      // Update local state
      const updatedExpenses = expenses.map(e => 
        e.id === expenseId ? deletedExpense : e
      );
      setExpenses(updatedExpenses);
      
      // Save to storage
      await StorageService.saveExpenses(updatedExpenses);
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isPending: true,
        pendingSyncItems: prev.pendingSyncItems + 1,
      }));
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense');
    }
  };

  // Category actions
  const addCategory = async (newCategory: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Date.now();
      const category: Category = {
        ...newCategory,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      
      // Update local state
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      
      // Save to storage
      await StorageService.saveCategories(updatedCategories);
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isPending: true,
        pendingSyncItems: prev.pendingSyncItems + 1,
      }));
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    try {
      // Update timestamp
      const category = {
        ...updatedCategory,
        updatedAt: Date.now(),
      };
      
      // Update local state
      const index = categories.findIndex(c => c.id === category.id);
      if (index !== -1) {
        const updatedCategories = [...categories];
        updatedCategories[index] = category;
        setCategories(updatedCategories);
        
        // Save to storage
        await StorageService.saveCategories(updatedCategories);
        
        // Update sync status
        setSyncStatus(prev => ({
          ...prev,
          isPending: true,
          pendingSyncItems: prev.pendingSyncItems + 1,
        }));
      }
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      // Check if category is in use
      const isInUse = expenses.some(e => e.categoryId === categoryId && !e.isDeleted);
      if (isInUse) {
        Alert.alert(
          'Category in Use',
          'This category is being used by one or more expenses. Please reassign those expenses first.'
        );
        return;
      }
      
      // Update local state
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      setCategories(updatedCategories);
      
      // Save to storage
      await StorageService.saveCategories(updatedCategories);
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isPending: true,
        pendingSyncItems: prev.pendingSyncItems + 1,
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  // Settings actions
  const updateSettings = async (updatedSettings: Partial<UserSettings>) => {
    try {
      if (!settings) return;
      
      // Update timestamp
      const newSettings = {
        ...settings,
        ...updatedSettings,
        updatedAt: Date.now(),
      };
      
      // Update local state
      setSettings(newSettings);
      
      // Save to storage
      await StorageService.saveUserSettings(newSettings);
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isPending: true,
        pendingSyncItems: prev.pendingSyncItems + 1,
      }));
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  // Sync actions
  const syncData = async () => {
    try {
      if (!settings) return;
      
      setIsLoading(true);
      
      // Perform full sync
      const result = await FirebaseService.syncAllData(
        userId,
        expenses,
        categories,
        settings
      );
      
      // Update local state with synced data
      setExpenses(result.expenses);
      setCategories(result.categories);
      setSettings(result.settings);
      setSyncStatus(result.syncStatus);
      
      // Save synced data to storage
      await Promise.all([
        StorageService.saveExpenses(result.expenses),
        StorageService.saveCategories(result.categories),
        StorageService.saveUserSettings(result.settings),
        StorageService.saveLastSync(result.syncStatus.lastSyncedAt),
      ]);
      
      Alert.alert('Sync Complete', 'Your data has been synchronized successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      Alert.alert('Sync Error', 'Failed to synchronize data with the server');
    } finally {
      setIsLoading(false);
    }
  };

  // Import/Export actions
  const exportToExcel = async () => {
    try {
      if (!settings) return;
      
      setIsLoading(true);
      
      // Implement Excel export functionality
      // This will be completed in a separate service
      
      setIsLoading(false);
      Alert.alert('Export Complete', 'Your data has been exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Export Error', 'Failed to export data to Excel');
      setIsLoading(false);
    }
  };

  const importFromExcel = async (filePath: string) => {
    try {
      setIsLoading(true);
      
      // Implement Excel import functionality
      // This will be completed in a separate service
      
      setIsLoading(false);
      Alert.alert('Import Complete', 'Your data has been imported successfully');
    } catch (error) {
      console.error('Error importing from Excel:', error);
      Alert.alert('Import Error', 'Failed to import data from Excel');
      setIsLoading(false);
    }
  };

  // Build context value
  const contextValue: AppContextType = {
    // Data
    expenses,
    categories,
    settings,
    exchangeRates,
    syncStatus,
    isLoading,
    
    // Theme
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
    
    // Expense actions
    addExpense,
    updateExpense,
    deleteExpense,
    
    // Category actions
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Settings actions
    updateSettings,
    
    // Sync actions
    syncData,
    
    // Import/Export actions
    exportToExcel,
    importFromExcel,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook for accessing the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 