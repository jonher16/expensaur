import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Chip, 
  Divider, 
  Surface,
  useTheme,
  IconButton
} from 'react-native-paper';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { formatCurrency, calculateTotal } from '../utils/currencyUtils';
import { getStartOfMonth, getEndOfMonth, getStartOfWeek, getEndOfWeek, formatDate } from '../utils/dateUtils';
import { Svg, G, Path, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Category data type
interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  id: string;
}

// Simple Pie Chart Component (no animations to reduce complexity)
const SimplePieChart = ({ data, size = 200 }: { data: CategoryData[], size: number }) => {
  // Return empty circle if no data
  if (!data || data.length === 0) {
    return (
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle 
          cx={size/2} 
          cy={size/2} 
          r={size/2 - 10} 
          stroke="#e0e0e0" 
          strokeWidth="1" 
          fill="#f0f0f0" 
        />
        <SvgText
          fill="#999999"
          fontSize="14"
          fontWeight="normal"
          x={size/2}
          y={size/2}
          textAnchor="middle"
        >
          No Data
        </SvgText>
      </Svg>
    );
  }

  const radius = size / 2 - 10;
  const center = size / 2;
  
  // Calculate the sum for percentages
  const sum = data.reduce((acc, item) => acc + (item ? item.value : 0), 0);
  
  // Create pie slices
  let startAngle = 0;
  const slices = [];
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item) continue;
    
    // Calculate angles for this slice
    const percent = sum > 0 ? item.value / sum : 0;
    const angle = percent * 360;
    const endAngle = startAngle + angle;
    
    // Calculate path
    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
    
    // Create SVG path
    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    // Calculate label position
    const labelAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.7;
    const labelX = center + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
    const labelY = center + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
    
    // Update start angle for next slice
    startAngle = endAngle;
    
    slices.push({
      path,
      color: item.color,
      label: Math.round(percent * 100) + '%',
      labelX,
      labelY,
      showLabel: percent > 0.05, // Only show label if slice is large enough
    });
  }
  
  return (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {slices.map((slice, index) => (
          <React.Fragment key={index}>
            <Path d={slice.path} fill={slice.color} />
            {slice.showLabel && (
              <SvgText
                fill="white"
                fontSize="12"
                fontWeight="bold"
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
              >
                {slice.label}
              </SvgText>
            )}
          </React.Fragment>
        ))}
      </G>
    </Svg>
  );
};

// Simple Category Bar (no animations)
const CategoryBar = ({ category, colors, settings }: { 
  category: CategoryData; 
  colors: any; 
  settings: any;
}) => {
  if (!category) return null;
  
  return (
    <Surface style={[styles.categoryBreakdownItem, { backgroundColor: colors.card, marginBottom: 8 }]}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryNameContainer}>
          <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
          <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
        </View>
        <Text style={[styles.categoryPercentage, { color: colors.primary }]}>
          {category.percentage.toFixed(1)}%
        </Text>
      </View>
      <View style={styles.categoryAmountContainer}>
        <View style={[styles.categoryBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.categoryBarFill, 
              { 
                width: `${category.percentage}%`, 
                backgroundColor: category.color 
              }
            ]} 
          />
        </View>
        <Text style={[styles.categoryAmount, { color: colors.text }]}>
          {formatCurrency(category.value, settings?.defaultCurrency || 'USD')}
        </Text>
      </View>
    </Surface>
  );
};

// Enhanced Insights Screen
const InsightsScreen = () => {
  const { expenses, categories, settings } = useApp();
  const colors = useThemeColors();
  const theme = useTheme();

  // Safe initial states
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year'>('month');
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [averagePerDay, setAveragePerDay] = useState<number>(0);
  
  // Calculate insights when expenses, categories, or timeframe changes
  useEffect(() => {
    if (!expenses || !categories) {
      // If data isn't available yet, don't process
      return;
    }
    
    try {
      // Filter expenses by time frame
      const now = new Date();
      let filteredExpenses = [];
      let periodStart: Date;
      let periodEnd: Date;
      
      if (timeFrame === 'month') {
        periodStart = getStartOfMonth(now, settings || undefined);
        periodEnd = getEndOfMonth(now, settings || undefined);
      } else if (timeFrame === 'week') {
        periodStart = getStartOfWeek(now, settings || undefined);
        periodEnd = getEndOfWeek(now, settings || undefined);
      } else { // year
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = now;
      }
      
      filteredExpenses = expenses.filter(e => 
        e && !e.isDeleted && 
        e.date >= periodStart.getTime() && 
        e.date <= periodEnd.getTime()
      );
      
      // Calculate total spent
      const total = calculateTotal(filteredExpenses.map(e => e.amount));
      setTotalSpent(total);
      
      // Calculate average per day
      const dayDiff = Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
      setAveragePerDay(total / dayDiff);
      
      // Group by category
      const categoryTotals = new Map<string, number>();
      
      filteredExpenses.forEach(expense => {
        if (!expense) return; // Skip undefined expenses
        const categoryId = expense.categoryId;
        const currentTotal = categoryTotals.get(categoryId) || 0;
        categoryTotals.set(categoryId, currentTotal + expense.amount);
      });
      
      // Convert to array for charts
      const categoryDataArray: CategoryData[] = [];
      
      // Safely create category data array
      categoryTotals.forEach((total, categoryId) => {
        const category = categories.find(c => c && c.id === categoryId);
        if (category) {
          categoryDataArray.push({
            id: categoryId,
            name: category.name || 'Unknown',
            value: total,
            percentage: 0, // Will be calculated below
            color: category.color || colors.secondary,
          });
        }
      });
      
      // Sort by highest amount
      categoryDataArray.sort((a, b) => b.value - a.value);
      
      // Update percentages based on total
      if (total > 0) {
        categoryDataArray.forEach(item => {
          if (item) item.percentage = (item.value / total) * 100;
        });
      }
      
      setCategoryData(categoryDataArray);
    } catch (err) {
      console.error('Error processing insights data:', err);
      // Set safe defaults
      setCategoryData([]);
      setTotalSpent(0);
      setAveragePerDay(0);
    }
  }, [expenses, categories, timeFrame, settings]);

  // Get period description
  const getPeriodDescription = () => {
    try {
      const now = new Date();
      
      if (timeFrame === 'week') {
        const start = getStartOfWeek(now, settings);
        const end = getEndOfWeek(now, settings);
        return `${formatDate(start, 'short')} - ${formatDate(end, 'short')}`;
      } else if (timeFrame === 'month') {
        return formatDate(now, 'long').split(' ')[0];
      } else {
        return now.getFullYear().toString();
      }
    } catch (err) {
      return timeFrame;
    }
  };

  // Check if we have valid category data
  const hasCategoryData = categoryData && Array.isArray(categoryData) && categoryData.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
        
        {/* Summary Card */}
        <Card style={[styles.card, styles.summaryCard, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={[styles.summaryPeriod, { color: colors.subText }]}>
                  Summary for
                </Text>
                <Text style={[styles.summaryPeriodName, { color: colors.text }]}>
                  {getPeriodDescription()}
                </Text>
              </View>
              <IconButton
                icon="information-outline"
                size={20}
                color={colors.primary}
                onPress={() => {
                  // Show period info
                }}
              />
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.subText }]}>Total Spent</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatCurrency(totalSpent, settings?.defaultCurrency || 'USD')}
                </Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.subText }]}>Daily Average</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatCurrency(averagePerDay, settings?.defaultCurrency || 'USD')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Category Analysis */}
        <Card style={[styles.card, { backgroundColor: colors.card, marginBottom: 20 }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={{ color: colors.text }}>Spending by Category</Title>
              {hasCategoryData && (
                <Text style={[styles.categoriesCount, { color: colors.subText }]}>
                  {categoryData.length} categories
                </Text>
              )}
            </View>
            
            <Divider style={{ marginVertical: 16 }} />
            
            {hasCategoryData ? (
              <View>
                {/* Pie Chart */}
                <View style={styles.pieChartContainer}>
                  <SimplePieChart data={categoryData} size={width * 0.7} />
                </View>
                
                {/* Category Breakdown */}
                <View style={styles.categoryBreakdownContainer}>
                  {categoryData.map((category, index) => (
                    category ? (
                      <CategoryBar 
                        key={category.id || index} 
                        category={category} 
                        colors={colors} 
                        settings={settings}
                      />
                    ) : null
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={{ color: colors.subText, textAlign: 'center' }}>
                  No expenses recorded for this period.
                </Text>
                <TouchableOpacity
                  style={[styles.addExpenseButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    // Navigate to add expense screen
                  }}
                >
                  <Text style={styles.addExpenseButtonText}>Add an Expense</Text>
                </TouchableOpacity>
              </View>
            )}
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
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryPeriod: {
    fontSize: 14,
  },
  summaryPeriodName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesCount: {
    fontSize: 12,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryBreakdownContainer: {
    marginTop: 8,
  },
  categoryBreakdownItem: {
    padding: 12,
    borderRadius: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: 8,
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
    textAlign: 'right',
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addExpenseButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addExpenseButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default InsightsScreen;