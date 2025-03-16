import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { useApp } from '../contexts/AppContext';
import ExpenseCard from '../components/ExpenseCard';
import { 
  getStartOfMonth, 
  getEndOfMonth, 
  getStartOfWeek, 
  getEndOfWeek, 
  formatDate
} from '../utils/dateUtils';
import { formatCurrency, calculateTotal } from '../utils/currencyUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { 
    expenses, 
    categories, 
    settings, 
    isLoading, 
    syncStatus 
  } = useApp();
  
  const [monthlySummary, setMonthlySummary] = useState({
    total: 0,
    weeklyTotal: 0,
  });
  
  // Calculate monthly and weekly summary when expenses or settings change
  useEffect(() => {
    if (!settings) return;
    
    const now = new Date();
    const monthStart = getStartOfMonth(now, settings);
    const monthEnd = getEndOfMonth(now, settings);
    const weekStart = getStartOfWeek(now, settings);
    const weekEnd = getEndOfWeek(now, settings);
    
    // Filter expenses for current month
    const monthlyExpenses = expenses.filter(e => 
      !e.isDeleted && 
      e.date >= monthStart.getTime() && 
      e.date <= monthEnd.getTime()
    );
    
    // Filter expenses for current week
    const weeklyExpenses = expenses.filter(e => 
      !e.isDeleted && 
      e.date >= weekStart.getTime() && 
      e.date <= weekEnd.getTime()
    );
    
    // Convert all expenses to default currency if needed
    const defaultCurrency = settings.defaultCurrency;
    
    const monthlyAmounts = monthlyExpenses.map(e => e.amount);
    const weeklyAmounts = weeklyExpenses.map(e => e.amount);
    
    setMonthlySummary({
      total: calculateTotal(monthlyAmounts),
      weeklyTotal: calculateTotal(weeklyAmounts),
    });
  }, [expenses, settings]);
  
  // Get recent expenses
  const recentExpenses = expenses
    .filter(e => !e.isDeleted)
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);
  
  // Navigate to add expense screen
  const handleAddExpense = () => {
    navigation.navigate('AddExpense', {});
  };
  
  // Navigate to expense details/edit screen
  const handleExpensePress = (expense: any) => {
    navigation.navigate('EditExpense', { expenseId: expense.id });
  };
  
  // Navigate to expenses screen
  const handleSeeAllExpenses = () => {
    navigation.navigate('Expenses');
  };
  
  // Navigate to insights screen
  const handleSeeInsights = () => {
    navigation.navigate('Insights');
  };
  
  // Navigate to daily expenses screen for today
  const handleSeeDailyExpenses = () => {
    navigation.navigate('DailyExpenses', { date: Date.now() });
  };
  
  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your finances...</Text>
      </View>
    );
  }
  
  // If no settings yet, show empty state
  if (!settings) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Welcome to Expensaur!</Text>
        <Text style={styles.emptySubtext}>Start tracking your expenses now.</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddExpense}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Your First Expense</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with app name and sync status */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Expensaur</Text>
            <Text style={styles.subTitle}>Track your spending habits</Text>
          </View>
          {syncStatus.isPending && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncText}>{syncStatus.pendingSyncItems} pending</Text>
            </View>
          )}
        </View>
        
        {/* Monthly summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              {formatDate(new Date(), 'long')}
            </Text>
            <TouchableOpacity onPress={handleSeeInsights}>
              <Text style={styles.seeAllText}>See Insights</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Monthly Total</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(monthlySummary.total, settings?.defaultCurrency || 'USD')}
              </Text>
            </View>
            
            <View style={styles.weekContainer}>
              <Text style={styles.weekLabel}>This Week</Text>
              <Text style={styles.weekAmount}>
                {formatCurrency(monthlySummary.weeklyTotal, settings?.defaultCurrency || 'USD')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.dailyButton}
              onPress={handleSeeDailyExpenses}
            >
              <Text style={styles.dailyButtonText}>View Daily</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent expenses */}
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Expenses</Text>
            <TouchableOpacity onPress={handleSeeAllExpenses}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentExpenses.length > 0 ? (
            <View style={styles.expensesList}>
              {recentExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  category={categories.find(c => c.id === expense.categoryId)}
                  onPress={handleExpensePress}
                />
              ))}
            </View>
          ) : (
            <View style={styles.noExpensesContainer}>
              <Text style={styles.noExpensesText}>
                No expenses yet. Start tracking by adding your first expense.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating action button for adding expense */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddExpense}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 30,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  syncBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  syncText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  summaryContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  totalContainer: {
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  weekContainer: {
    marginBottom: 20,
  },
  weekLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  weekAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
  },
  dailyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
  },
  dailyButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  recentContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  expensesList: {
    marginTop: 10,
  },
  noExpensesContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginTop: 10,
    ...SHADOWS.light,
  },
  noExpensesText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default HomeScreen; 