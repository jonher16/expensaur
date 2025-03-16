import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Chip, Divider } from 'react-native-paper';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { formatCurrency, calculateTotal } from '../utils/currencyUtils';
import { getStartOfMonth, getEndOfMonth, formatDate } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

// Define the ThemeColors type to match what useThemeColors returns
interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  food: string;
  transport: string;
  entertainment: string;
  shopping: string;
  health: string;
  housing: string;
  education: string;
  utilities: string;
  other: string;
}

// A simple bar chart component
interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  maxValue: number;
  colors: ThemeColors;
  settings: any;
}

const BarChart: React.FC<BarChartProps> = ({ data, maxValue, colors, settings }) => {
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.barLabel, { color: colors.text }]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
          <View style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${(item.value / maxValue) * 100}%`, 
                  backgroundColor: item.color || colors.primary 
                }
              ]}
            />
            <Text style={[styles.barValue, { color: colors.subText }]}>
              {formatCurrency(item.value, settings?.defaultCurrency || 'USD')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const InsightsScreen = () => {
  const { expenses, categories, settings } = useApp();
  const colors = useThemeColors();

  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year'>('month');
  const [categoryData, setCategoryData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [maxSpent, setMaxSpent] = useState<number>(0);
  const [averagePerDay, setAveragePerDay] = useState<number>(0);

  // Calculate insights when expenses, categories, or timeframe changes
  useEffect(() => {
    // Filter expenses by time frame
    const now = new Date();
    let filteredExpenses = [];
    
    if (timeFrame === 'month') {
      const monthStart = getStartOfMonth(now, settings || undefined);
      const monthEnd = getEndOfMonth(now, settings || undefined);
      
      filteredExpenses = expenses.filter(e => 
        !e.isDeleted && 
        e.date >= monthStart.getTime() && 
        e.date <= monthEnd.getTime()
      );
    } else if (timeFrame === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      
      filteredExpenses = expenses.filter(e => 
        !e.isDeleted && 
        e.date >= weekStart.getTime() && 
        e.date <= now.getTime()
      );
    } else { // year
      const yearStart = new Date(now.getFullYear(), 0, 1);
      
      filteredExpenses = expenses.filter(e => 
        !e.isDeleted && 
        e.date >= yearStart.getTime() && 
        e.date <= now.getTime()
      );
    }
    
    // Calculate total spent
    const total = calculateTotal(filteredExpenses.map(e => e.amount));
    setTotalSpent(total);
    
    // Calculate average per day
    let days = 30;
    if (timeFrame === 'week') days = 7;
    else if (timeFrame === 'year') days = 365;
    
    setAveragePerDay(total / days);
    
    // Group by category
    const categoryTotals = new Map<string, number>();
    
    filteredExpenses.forEach(expense => {
      const categoryId = expense.categoryId;
      const currentTotal = categoryTotals.get(categoryId) || 0;
      categoryTotals.set(categoryId, currentTotal + expense.amount);
    });
    
    // Convert to array for chart
    const categoryDataArray = Array.from(categoryTotals.entries())
      .map(([categoryId, total]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          label: category?.name || 'Unknown',
          value: total,
          color: category?.color || colors.secondary,
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by highest amount
    
    setCategoryData(categoryDataArray);
    
    // Set max for chart scaling
    if (categoryDataArray.length > 0) {
      setMaxSpent(Math.max(...categoryDataArray.map(item => item.value)));
    }
    
  }, [expenses, categories, timeFrame, settings]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Time frame selector */}
        <View style={styles.timeFrameContainer}>
          <Chip
            selected={timeFrame === 'week'}
            onPress={() => setTimeFrame('week')}
            style={[styles.chip, timeFrame === 'week' && { backgroundColor: colors.primary }]}
            textStyle={{ color: timeFrame === 'week' ? 'white' : colors.text }}
          >
            Week
          </Chip>
          <Chip
            selected={timeFrame === 'month'}
            onPress={() => setTimeFrame('month')}
            style={[styles.chip, timeFrame === 'month' && { backgroundColor: colors.primary }]}
            textStyle={{ color: timeFrame === 'month' ? 'white' : colors.text }}
          >
            Month
          </Chip>
          <Chip
            selected={timeFrame === 'year'}
            onPress={() => setTimeFrame('year')}
            style={[styles.chip, timeFrame === 'year' && { backgroundColor: colors.primary }]}
            textStyle={{ color: timeFrame === 'year' ? 'white' : colors.text }}
          >
            Year
          </Chip>
        </View>
        
        {/* Summary card */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Title style={{ color: colors.text }}>
              {timeFrame === 'week' 
                ? 'This Week' 
                : timeFrame === 'month' 
                  ? formatDate(new Date(), 'long').split(' ').slice(0, 2).join(' ') 
                  : new Date().getFullYear().toString()}
            </Title>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Paragraph style={{ color: colors.subText }}>Total Spent</Paragraph>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatCurrency(totalSpent, settings?.defaultCurrency || 'USD')}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Paragraph style={{ color: colors.subText }}>Daily Average</Paragraph>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatCurrency(averagePerDay, settings?.defaultCurrency || 'USD')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Category breakdown */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Title style={{ color: colors.text }}>Category Breakdown</Title>
            <Divider style={{ marginVertical: 10 }} />
            
            {categoryData.length > 0 ? (
              <BarChart 
                data={categoryData} 
                maxValue={maxSpent} 
                colors={colors} 
                settings={settings}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={{ color: colors.subText }}>
                  No expenses in this time period
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Monthly trend (placeholder) */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Title style={{ color: colors.text }}>Monthly Trend</Title>
            <Divider style={{ marginVertical: 10 }} />
            
            <View style={styles.placeholderChart}>
              <Text style={{ color: colors.subText }}>
                Monthly trend chart would go here
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Daily distribution (placeholder) */}
        <Card style={[styles.card, { backgroundColor: colors.card, marginBottom: 20 }]}>
          <Card.Content>
            <Title style={{ color: colors.text }}>Daily Distribution</Title>
            <Divider style={{ marginVertical: 10 }} />
            
            <View style={styles.placeholderChart}>
              <Text style={{ color: colors.subText }}>
                Daily distribution chart would go here
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  chip: {
    marginHorizontal: 5,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  chartContainer: {
    marginTop: 10,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    width: width * 0.25,
    paddingRight: 10,
  },
  barLabel: {
    fontSize: 14,
    textAlign: 'right',
  },
  barWrapper: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  bar: {
    height: 24,
    borderRadius: 4,
  },
  barValue: {
    position: 'absolute',
    left: 8,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderChart: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
});

export default InsightsScreen; 