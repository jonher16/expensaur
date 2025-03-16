import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Text, FAB, Searchbar, Chip, Divider } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { Expense } from '../models';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import ExpenseCard from '../components/ExpenseCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExpensesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { expenses, categories, settings, isLoading } = useApp();
  const colors = useThemeColors();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Filtering expenses based on search and category
  useFocusEffect(
    useCallback(() => {
      const filtered = expenses.filter(expense => {
        const matchesSearch = !searchQuery || 
          expense.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || expense.categoryId === selectedCategory;
        return matchesSearch && matchesCategory && !expense.isDeleted;
      });
      
      // Sort expenses by date (most recent first)
      const sorted = [...filtered].sort((a, b) => b.date - a.date);
      
      setFilteredExpenses(sorted);
      
      // Calculate total amount
      const total = filtered.reduce((sum, expense) => {
        if (expense.currency === settings?.defaultCurrency) {
          return sum + expense.amount;
        } else if (expense.originalCurrency === settings?.defaultCurrency && expense.originalAmount) {
          return sum + expense.originalAmount;
        } else {
          // Should convert using exchange rates, for now just add as is
          return sum + expense.amount;
        }
      }, 0);
      
      setTotalAmount(total);
    }, [expenses, searchQuery, selectedCategory, settings?.defaultCurrency])
  );
  
  // Group expenses by date for the list
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const dateKey = date.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);
  
  // Convert grouped expenses to array for FlatList
  const groupedExpensesArray = Object.entries(groupedExpenses).map(([date, expenses]) => ({
    date,
    expenses,
  }));
  
  // Handle navigation to add expense
  const handleAddExpense = () => {
    navigation.navigate('AddExpense', {});
  };
  
  // Handle expense item press
  const handleExpensePress = (expenseId: string) => {
    navigation.navigate('EditExpense', { expenseId });
  };
  
  // Render expense item - FIX: Added key prop to ExpenseCard
  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseCard
      key={item.id}
      expense={item}
      category={categories.find(cat => cat.id === item.categoryId)}
      onPress={() => handleExpensePress(item.id)}
    />
  );
  
  // Render date group - FIX: Added key to expense items in the map function
  const renderDateGroup = ({ item }: { item: { date: string, expenses: Expense[] } }) => (
    <View style={styles.dateGroup}>
      <Text style={[styles.dateHeader, { color: colors.text }]}>
        {formatDate(new Date(item.date), 'long')}
      </Text>
      <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
      {item.expenses.map(expense => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          category={categories.find(cat => cat.id === expense.categoryId)}
          onPress={() => handleExpensePress(expense.id)}
        />
      ))}
    </View>
  );
  
  // Render category filter chips
  const renderCategoryChips = () => (
    <View style={styles.chipsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={!selectedCategory}
          onPress={() => setSelectedCategory(null)}
          style={[styles.chip, !selectedCategory && { backgroundColor: colors.primary }]}
          textStyle={{ color: !selectedCategory ? 'white' : colors.text }}
          mode="outlined"
        >
          All
        </Chip>
        {categories.map(category => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.chip, 
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={{ color: selectedCategory === category.id ? 'white' : colors.text }}
            mode="outlined"
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search expenses"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: colors.card }]}
        iconColor={colors.primary}
        inputStyle={{ color: colors.text }}
        placeholderTextColor={colors.subText}
      />
      
      {/* Category Filter */}
      {renderCategoryChips()}
      
      {/* Total Amount */}
      <View style={[styles.totalContainer, { backgroundColor: colors.card }]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(totalAmount, settings?.defaultCurrency || 'USD')}
        </Text>
      </View>
      
      {/* Expenses List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            {searchQuery || selectedCategory
              ? 'No expenses match your filters'
              : 'No expenses yet. Add your first expense!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedExpensesArray}
          renderItem={renderDateGroup}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {/* Add Button */}
      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        onPress={handleAddExpense}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    borderRadius: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExpensesScreen;