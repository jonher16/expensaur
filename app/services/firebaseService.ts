import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Expense, 
  Category, 
  UserSettings, 
  SyncStatus
} from '../models';
import { 
  mergeData, 
  resolveExpenseConflict, 
  resolveCategoryConflict, 
  resolveSettingsConflict 
} from '../utils/syncUtils';

// Firestore collection names
const COLLECTIONS = {
  EXPENSES: 'expenses',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
};

// Sync expenses with Firestore
export const syncExpenses = async (
  userId: string,
  localExpenses: Expense[]
): Promise<Expense[]> => {
  try {
    // Get remote expenses
    const expensesRef = collection(db, COLLECTIONS.EXPENSES);
    const expensesQuery = query(
      expensesRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(expensesQuery);
    const remoteExpenses: Expense[] = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data() as Expense;
      remoteExpenses.push(data);
    });
    
    // Merge local and remote expenses
    const mergedExpenses = mergeData(
      localExpenses,
      remoteExpenses,
      resolveExpenseConflict
    );
    
    // Push merged expenses to Firestore in batches
    const batch = writeBatch(db);
    const pendingExpenses = mergedExpenses.filter(exp => !exp.lastSyncedAt || exp.updatedAt > exp.lastSyncedAt);
    
    for (const expense of pendingExpenses) {
      // Set lastSyncedAt to current time
      const expenseWithSync = {
        ...expense,
        lastSyncedAt: Date.now(),
      };
      
      if (expense.isDeleted) {
        // If expense is marked as deleted, remove it from Firestore
        batch.delete(doc(db, COLLECTIONS.EXPENSES, expense.id));
      } else {
        // Otherwise update or add
        batch.set(doc(db, COLLECTIONS.EXPENSES, expense.id), expenseWithSync);
      }
    }
    
    // Commit batch write
    if (pendingExpenses.length > 0) {
      await batch.commit();
    }
    
    // Return merged expenses with updated lastSyncedAt timestamps
    return mergedExpenses;
  } catch (error) {
    console.error('Error syncing expenses:', error);
    throw error;
  }
};

// Sync categories with Firestore
export const syncCategories = async (
  userId: string,
  localCategories: Category[]
): Promise<Category[]> => {
  try {
    // Get remote categories
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const categoriesQuery = query(
      categoriesRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(categoriesQuery);
    const remoteCategories: Category[] = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data() as Category;
      remoteCategories.push(data);
    });
    
    // Merge local and remote categories
    const mergedCategories = mergeData(
      localCategories,
      remoteCategories,
      resolveCategoryConflict
    );
    
    // Push merged categories to Firestore in batches
    const batch = writeBatch(db);
    const pendingCategories = mergedCategories.filter(cat => !cat.lastSyncedAt || cat.updatedAt > cat.lastSyncedAt);
    
    for (const category of pendingCategories) {
      // Set lastSyncedAt to current time
      const categoryWithSync = {
        ...category,
        lastSyncedAt: Date.now(),
      };
      
      batch.set(doc(db, COLLECTIONS.CATEGORIES, category.id), categoryWithSync);
    }
    
    // Commit batch write
    if (pendingCategories.length > 0) {
      await batch.commit();
    }
    
    // Return merged categories with updated lastSyncedAt timestamps
    return mergedCategories;
  } catch (error) {
    console.error('Error syncing categories:', error);
    throw error;
  }
};

// Sync user settings with Firestore
export const syncSettings = async (
  userId: string,
  localSettings: UserSettings
): Promise<UserSettings> => {
  try {
    // Get remote settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
    const settingsSnapshot = await getDoc(settingsRef);
    
    let remoteSettings: UserSettings | null = null;
    if (settingsSnapshot.exists()) {
      remoteSettings = settingsSnapshot.data() as UserSettings;
    }
    
    // If no remote settings exist, push local settings
    if (!remoteSettings) {
      const settingsWithSync = {
        ...localSettings,
        lastSyncedAt: Date.now(),
      };
      
      await setDoc(settingsRef, settingsWithSync);
      return settingsWithSync;
    }
    
    // If both local and remote settings exist, resolve conflicts
    let mergedSettings: UserSettings;
    
    if (localSettings.lastSyncedAt && remoteSettings.updatedAt > localSettings.lastSyncedAt && localSettings.updatedAt > localSettings.lastSyncedAt) {
      // Conflict detected, resolve it
      mergedSettings = resolveSettingsConflict(localSettings, remoteSettings);
    } else if (localSettings.lastSyncedAt && remoteSettings.updatedAt > localSettings.lastSyncedAt) {
      // Remote has newer data
      mergedSettings = {
        ...remoteSettings,
        lastSyncedAt: Date.now(),
      };
    } else if (!localSettings.lastSyncedAt || localSettings.updatedAt > localSettings.lastSyncedAt) {
      // Local has newer data
      mergedSettings = {
        ...localSettings,
        lastSyncedAt: Date.now(),
      };
    } else {
      // No changes
      mergedSettings = localSettings;
    }
    
    // Push merged settings to Firestore
    if (!mergedSettings.lastSyncedAt || mergedSettings.updatedAt > mergedSettings.lastSyncedAt) {
      const settingsWithSync = {
        ...mergedSettings,
        lastSyncedAt: Date.now(),
      };
      
      await setDoc(settingsRef, settingsWithSync);
      return settingsWithSync;
    }
    
    return mergedSettings;
  } catch (error) {
    console.error('Error syncing settings:', error);
    throw error;
  }
};

// Perform a full sync of all data
export const syncAllData = async (
  userId: string,
  localExpenses: Expense[],
  localCategories: Category[],
  localSettings: UserSettings
): Promise<{
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  syncStatus: SyncStatus;
}> => {
  try {
    // Sync all data
    const [
      syncedExpenses,
      syncedCategories,
      syncedSettings,
    ] = await Promise.all([
      syncExpenses(userId, localExpenses),
      syncCategories(userId, localCategories),
      syncSettings(userId, localSettings),
    ]);
    
    // Compute sync status
    const hasPendingExpenses = syncedExpenses.some(exp => !exp.lastSyncedAt || exp.updatedAt > exp.lastSyncedAt);
    const hasPendingCategories = syncedCategories.some(cat => !cat.lastSyncedAt || cat.updatedAt > cat.lastSyncedAt);
    const hasPendingSettings = !syncedSettings.lastSyncedAt || syncedSettings.updatedAt > syncedSettings.lastSyncedAt;
    
    const pendingSyncItems = 
      syncedExpenses.filter(exp => !exp.lastSyncedAt || exp.updatedAt > exp.lastSyncedAt).length +
      syncedCategories.filter(cat => !cat.lastSyncedAt || cat.updatedAt > cat.lastSyncedAt).length +
      (hasPendingSettings ? 1 : 0);
    
    const syncStatus: SyncStatus = {
      lastSyncedAt: Date.now(),
      isPending: hasPendingExpenses || hasPendingCategories || hasPendingSettings,
      hasConflicts: false, // Already resolved during sync
      pendingSyncItems,
    };
    
    return {
      expenses: syncedExpenses,
      categories: syncedCategories,
      settings: syncedSettings,
      syncStatus,
    };
  } catch (error) {
    console.error('Error performing full sync:', error);
    throw error;
  }
}; 