import { Expense, Category, UserSettings, SyncStatus } from '../models';

/**
 * Determine if there's a sync conflict between local and remote data
 */
export const hasConflict = (
  localItem: { updatedAt: number; lastSyncedAt?: number },
  remoteItem: { updatedAt: number }
): boolean => {
  // If local item was never synced, no conflict
  if (!localItem.lastSyncedAt) {
    return false;
  }
  
  // If remote item was updated after the last sync time, there's a potential conflict
  return remoteItem.updatedAt > localItem.lastSyncedAt && localItem.updatedAt > localItem.lastSyncedAt;
};

/**
 * Resolve sync conflicts for an expense
 */
export const resolveExpenseConflict = (
  localExpense: Expense,
  remoteExpense: Expense
): Expense => {
  // Default strategy: latest update wins
  if (localExpense.updatedAt > remoteExpense.updatedAt) {
    return {
      ...localExpense,
      lastSyncedAt: Date.now(),
    };
  } else {
    return {
      ...remoteExpense,
      lastSyncedAt: Date.now(),
    };
  }
};

/**
 * Resolve sync conflicts for a category
 */
export const resolveCategoryConflict = (
  localCategory: Category,
  remoteCategory: Category
): Category => {
  // Default strategy: latest update wins
  if (localCategory.updatedAt > remoteCategory.updatedAt) {
    return {
      ...localCategory,
      lastSyncedAt: Date.now(),
    };
  } else {
    return {
      ...remoteCategory,
      lastSyncedAt: Date.now(),
    };
  }
};

/**
 * Resolve sync conflicts for user settings
 */
export const resolveSettingsConflict = (
  localSettings: UserSettings,
  remoteSettings: UserSettings
): UserSettings => {
  // Default strategy: latest update wins
  if (localSettings.updatedAt > remoteSettings.updatedAt) {
    return {
      ...localSettings,
      lastSyncedAt: Date.now(),
    };
  } else {
    return {
      ...remoteSettings,
      lastSyncedAt: Date.now(),
    };
  }
};

/**
 * Get items that need to be synchronized
 */
export const getPendingSyncItems = <T extends { updatedAt: number; lastSyncedAt?: number; isDeleted?: boolean }>(
  items: T[],
): T[] => {
  return items.filter(item => {
    // Never synced or updated since last sync
    const needsSync = !item.lastSyncedAt || item.updatedAt > item.lastSyncedAt;
    return needsSync;
  });
};

/**
 * Merge local and remote data, resolving conflicts
 */
export const mergeData = <T extends { id: string; updatedAt: number; lastSyncedAt?: number; isDeleted?: boolean }>(
  localItems: T[],
  remoteItems: T[],
  resolveConflict: (localItem: T, remoteItem: T) => T
): T[] => {
  const mergedItems: T[] = [];
  const localItemsMap = new Map<string, T>();
  const remoteItemsMap = new Map<string, T>();
  
  // Create maps for faster lookup
  localItems.forEach(item => localItemsMap.set(item.id, item));
  remoteItems.forEach(item => remoteItemsMap.set(item.id, item));
  
  // Process all local items
  localItems.forEach(localItem => {
    const remoteItem = remoteItemsMap.get(localItem.id);
    
    if (!remoteItem) {
      // Item exists only locally
      mergedItems.push(localItem);
    } else {
      // Item exists both locally and remotely
      if (hasConflict(localItem, remoteItem)) {
        // Resolve conflict
        mergedItems.push(resolveConflict(localItem, remoteItem));
      } else if (localItem.lastSyncedAt && remoteItem.updatedAt > localItem.lastSyncedAt) {
        // Remote has newer data
        mergedItems.push({
          ...remoteItem,
          lastSyncedAt: Date.now(),
        });
      } else if (!localItem.lastSyncedAt || localItem.updatedAt > localItem.lastSyncedAt) {
        // Local has newer data
        mergedItems.push({
          ...localItem,
          lastSyncedAt: Date.now(),
        });
      } else {
        // No changes
        mergedItems.push(localItem);
      }
      
      // Mark as processed
      remoteItemsMap.delete(localItem.id);
    }
  });
  
  // Add remaining remote items
  remoteItemsMap.forEach(remoteItem => {
    mergedItems.push({
      ...remoteItem,
      lastSyncedAt: Date.now(),
    });
  });
  
  return mergedItems;
};

/**
 * Update sync status
 */
export const updateSyncStatus = (
  currentStatus: SyncStatus,
  expenses: Expense[],
  categories: Category[],
  settings?: UserSettings
): SyncStatus => {
  const pendingExpenses = getPendingSyncItems(expenses);
  const pendingCategories = getPendingSyncItems(categories);
  const pendingSettings = settings && (!settings.lastSyncedAt || settings.updatedAt > settings.lastSyncedAt) ? 1 : 0;
  
  const pendingSyncItems = pendingExpenses.length + pendingCategories.length + pendingSettings;
  
  return {
    lastSyncedAt: pendingSyncItems > 0 ? currentStatus.lastSyncedAt : Date.now(),
    isPending: pendingSyncItems > 0,
    hasConflicts: currentStatus.hasConflicts,
    pendingSyncItems,
  };
}; 