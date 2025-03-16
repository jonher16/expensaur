import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Title, Divider, FAB, IconButton } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { 
  formatDate, getStartOfDay, getEndOfDay, isSameDay, 
  getStartOfMonth, getEndOfMonth, getDaysInMonth 
} from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import ExpenseCard from '../components/ExpenseCard';
import { Expense } from '../models';
import { Ionicons } from '@expo/vector-icons';

type DailyExpensesScreenRouteProp = RouteProp<RootStackParamList, 'DailyExpenses'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Interface for grouped expenses by day
interface DayExpenses {
  date: Date;
  expenses: Expense[];
  total: number;
}

const DailyExpensesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DailyExpensesScreenRouteProp>();
  const { expenses, categories, settings } = useApp();
  const colors = useThemeColors();

  // Get current month from route params or use current date
  const [currentMonth, setCurrentMonth] = useState<Date>(
    route.params?.date ? new Date(route.params.date) : new Date()
  );
  
  // State for expenses grouped by day
  const [monthlyExpenses, setMonthlyExpenses] = useState<DayExpenses[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);

  // Calculate expenses for the month when data changes
  useEffect(() => {
    // Get month boundaries
    const monthStart = getStartOfMonth(currentMonth, settings);
    const monthEnd = getEndOfMonth(currentMonth, settings);
    
    // Filter expenses for the month
    const monthExpenses = expenses.filter(e => 
      !e.isDeleted && 
      e.date >= monthStart.getTime() && 
      e.date <= monthEnd.getTime()
    );
    
    // Get all days in the month
    const daysInMonth = getDaysInMonth(currentMonth, settings);
    
    // Initialize expenses for each day
    const dailyExpenses: DayExpenses[] = [];
    let totalMonthAmount = 0;
    
    // Group expenses by day
    daysInMonth.forEach(day => {
      const dayStart = getStartOfDay(day).getTime();
      const dayEnd = getEndOfDay(day).getTime();
      
      const dayExpenses = monthExpenses.filter(e => 
        e.date >= dayStart && e.date <= dayEnd
      ).sort((a, b) => b.date - a.date);
      
      // Calculate total for the day
      const dayTotal = dayExpenses.reduce((sum, expense) => {
        if (expense.currency === settings?.defaultCurrency) {
          return sum + expense.amount;
        } else if (expense.originalCurrency === settings?.defaultCurrency && expense.originalAmount) {
          return sum + expense.originalAmount;
        } else {
          return sum + expense.amount;
        }
      }, 0);
      
      // Only add days with expenses
      if (dayExpenses.length > 0) {
        dailyExpenses.push({
          date: day,
          expenses: dayExpenses,
          total: dayTotal
        });
        
        totalMonthAmount += dayTotal;
      }
    });
    
    // Sort days in reverse chronological order (newest first)
    dailyExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setMonthlyExpenses(dailyExpenses);
    setMonthlyTotal(totalMonthAmount);
  }, [expenses, currentMonth, settings]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // Handle navigation to add expense
  const handleAddExpense = (date?: Date) => {
    navigation.navigate('AddExpense', { date: date ? date.getTime() : new Date().getTime() });
  };

  // Handle expense item press
  const handleExpensePress = (expenseId: string) => {
    navigation.navigate('EditExpense', { expenseId });
  };

  // Render a day group with expenses
  const renderDayGroup = ({ item }: { item: DayExpenses }) => {
    return (
      <Card style={[styles.dayCard, { backgroundColor: colors.card }]}>
        <Card.Content>
          <View style={styles.dayHeader}>
            <View>
              <Text style={[styles.dayText, { color: colors.text }]}>
                {formatDate(item.date, 'long')}
              </Text>
              {isSameDay(item.date, new Date()) && (
                <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
              )}
            </View>
            <View style={styles.dayTotalContainer}>
              <Text style={[styles.dayTotalLabel, { color: colors.subText }]}>Total</Text>
              <Text style={[styles.dayTotalAmount, { color: colors.text }]}>
                {formatCurrency(item.total, settings?.defaultCurrency || 'USD')}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* List of expenses for this day */}
          {item.expenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              category={categories.find(cat => cat.id === expense.categoryId)}
              onPress={() => handleExpensePress(expense.id)}
              showDate={false}
            />
          ))}
          
          {/* Add expense for this specific day button */}
          <TouchableOpacity
            style={[styles.addForDayButton, { borderColor: colors.primary }]}
            onPress={() => handleAddExpense(item.date)}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={[styles.addForDayText, { color: colors.primary }]}>
              Add expense for this day
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Month Navigator */}
      <Card style={[styles.monthNavigator, { backgroundColor: colors.card }]}>
        <View style={styles.monthNavContainer}>
          <IconButton 
            icon="chevron-left" 
            size={24} 
            onPress={goToPreviousMonth}
            iconColor={colors.primary}
          />
          <Text style={[styles.monthText, { color: colors.text }]}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <IconButton 
            icon="chevron-right" 
            size={24} 
            onPress={goToNextMonth}
            iconColor={colors.primary}
          />
        </View>
      </Card>

      {/* Monthly Summary */}
      <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subText }]}>Monthly Total</Text>
            <Text style={[styles.summaryAmount, { color: colors.text }]}>
              {formatCurrency(monthlyTotal, settings?.defaultCurrency || 'USD')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subText }]}>Days with Expenses</Text>
            <Text style={[styles.summaryCount, { color: colors.text }]}>
              {monthlyExpenses.length} days
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Daily Expenses List */}
      {monthlyExpenses.length > 0 ? (
        <FlatList
          data={monthlyExpenses}
          renderItem={renderDayGroup}
          keyExtractor={item => item.date.toISOString()}
          contentContainerStyle={styles.daysList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            No expenses recorded for this month
          </Text>
          <TouchableOpacity
            style={[styles.addFirstButton, { backgroundColor: colors.primary }]}
            onPress={() => handleAddExpense()}
          >
            <Text style={styles.addFirstButtonText}>Add First Expense</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Button */}
      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        onPress={() => handleAddExpense()}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  monthNavigator: {
    marginBottom: 16,
    borderRadius: 8,
  },
  monthNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: '500',
  },
  daysList: {
    paddingBottom: 80,
  },
  dayCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  todayText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  dayTotalContainer: {
    alignItems: 'flex-end',
  },
  dayTotalLabel: {
    fontSize: 12,
  },
  dayTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: 12,
  },
  addForDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12,
  },
  addForDayText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
  },
});

export default DailyExpensesScreen;