import * as XLSX from 'xlsx';
import * as FileSystem from 'react-native-fs';
import Share from 'react-native-share';
import { Platform } from 'react-native';
import { ExportData, Expense, Category, UserSettings } from '../models';
import { formatDate } from './dateUtils';

/**
 * Export expenses and categories to Excel
 */
export const exportToExcel = async (
  expenses: Expense[],
  categories: Category[],
  settings: UserSettings
): Promise<void> => {
  try {
    // Prepare expense data for export
    const expenseData = expenses.map(expense => {
      const category = categories.find(c => c.id === expense.categoryId);
      return {
        'Date': formatDate(expense.date, 'numeric'),
        'Amount': expense.amount,
        'Original Amount': expense.originalAmount || expense.amount,
        'Currency': expense.currency,
        'Original Currency': expense.originalCurrency || expense.currency,
        'Exchange Rate': expense.exchangeRate || 1,
        'Description': expense.description,
        'Category': category?.name || 'Unknown',
      };
    });

    // Prepare category data for export
    const categoryData = categories.map(category => ({
      'ID': category.id,
      'Name': category.name,
      'Color': category.color,
      'Icon': category.icon,
      'Default': category.isDefault ? 'Yes' : 'No',
    }));

    // Create a workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Add sheets to the workbook
    const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, expenseSheet, 'Expenses');
    
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Categories');
    
    // Add metadata sheet
    const metadataSheet = XLSX.utils.json_to_sheet([
      { Key: 'App', Value: 'Expensaur' },
      { Key: 'Export Date', Value: formatDate(Date.now(), 'long') },
      { Key: 'Default Currency', Value: settings.defaultCurrency },
      { Key: 'First Day of Month', Value: settings.firstDayOfMonth },
      { Key: 'Version', Value: '1.0.0' },
    ]);
    XLSX.utils.book_append_sheet(wb, metadataSheet, 'Metadata');

    // Generate Excel file
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    
    // Create filename with current date
    const fileName = `Expensaur_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // Save file to device
    const filePath = `${FileSystem.DocumentDirectoryPath}/${fileName}`;
    await FileSystem.writeFile(filePath, wbout, 'base64');

    // Share the file
    if (Platform.OS === 'ios') {
      const shareOptions = {
        title: 'Export Expenses',
        message: 'Here is your Expensaur expense data',
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      await Share.open(shareOptions);
    } else {
      // For Android
      const shareOptions = {
        title: 'Export Expenses',
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      await Share.open(shareOptions);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Export failed:', error);
    return Promise.reject(error);
  }
};

/**
 * Import expenses and categories from Excel
 */
export const importFromExcel = async (filePath: string): Promise<ExportData> => {
  try {
    // Read file
    const content = await FileSystem.readFile(filePath, 'base64');
    
    // Parse workbook
    const wb = XLSX.read(content, { type: 'base64' });
    
    // Extract data from sheets
    const expenseSheet = wb.Sheets['Expenses'];
    if (!expenseSheet) {
      throw new Error('Invalid file format: Expenses sheet not found');
    }
    
    const categorySheet = wb.Sheets['Categories'];
    if (!categorySheet) {
      throw new Error('Invalid file format: Categories sheet not found');
    }
    
    const metadataSheet = wb.Sheets['Metadata'];
    if (!metadataSheet) {
      throw new Error('Invalid file format: Metadata sheet not found');
    }
    
    // Convert sheets to JSON
    const expenseData = XLSX.utils.sheet_to_json(expenseSheet);
    const categoryData = XLSX.utils.sheet_to_json(categorySheet);
    const metadataData = XLSX.utils.sheet_to_json(metadataSheet);
    
    // Process and convert the imported data to app format
    const processedCategories: Category[] = categoryData.map((cat: any) => ({
      id: cat['ID'] || generateId(),
      name: cat['Name'] || 'Unknown',
      color: cat['Color'] || '#9E9E9E',
      icon: cat['Icon'] || 'help-circle',
      isDefault: cat['Default'] === 'Yes',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    // Create a map for category lookup by name
    const categoryMap = new Map<string, string>();
    processedCategories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });
    
    // Process expenses
    const processedExpenses: Expense[] = expenseData.map((exp: any) => {
      // Find or create category
      const categoryName = exp['Category'] || 'Unknown';
      let categoryId = categoryMap.get(categoryName);
      
      if (!categoryId) {
        // If category not found, use 'Other' category or first available
        categoryId = categoryMap.get('Other') || processedCategories[0]?.id || '';
      }
      
      // Parse date
      const dateString = exp['Date'] || '';
      let date = 0;
      try {
        // Try to parse date in various formats
        if (dateString.includes('/') || dateString.includes('-')) {
          date = new Date(dateString).getTime();
        } else {
          // Try Excel serial number
          const excelDate = parseInt(dateString);
          if (!isNaN(excelDate)) {
            // Excel dates start at January 1, 1900
            date = new Date(1900, 0, excelDate - 1).getTime();
          }
        }
      } catch {
        date = Date.now();
      }
      
      // If date parsing failed, use current date
      if (isNaN(date) || date === 0) {
        date = Date.now();
      }
      
      return {
        id: generateId(),
        userId: '', // Will be set later
        amount: parseFloat(exp['Amount']) || 0,
        originalAmount: parseFloat(exp['Original Amount']) || undefined,
        currency: exp['Currency'] || 'USD',
        originalCurrency: exp['Original Currency'] || undefined,
        exchangeRate: parseFloat(exp['Exchange Rate']) || 1,
        description: exp['Description'] || '',
        categoryId,
        date,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    });
    
    // Extract metadata
    const metadataMap = new Map<string, string>();
    metadataData.forEach((item: any) => {
      metadataMap.set(item['Key'], item['Value']);
    });
    
    // Create default settings if not available
    const importedSettings: Partial<UserSettings> = {
      defaultCurrency: metadataMap.get('Default Currency') || 'USD',
      firstDayOfMonth: parseInt(metadataMap.get('First Day of Month') || '1'),
      firstDayOfWeek: 0, // Default to Sunday
      theme: 'light' as const,
      notificationsEnabled: true,
      autoSync: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    return {
      expenses: processedExpenses,
      categories: processedCategories,
      settings: importedSettings as UserSettings,
      exportedAt: Date.now(),
      version: metadataMap.get('Version') || '1.0.0',
    };
  } catch (error) {
    console.error('Import failed:', error);
    return Promise.reject(error);
  }
};

/**
 * Generate a unique ID
 */
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}; 