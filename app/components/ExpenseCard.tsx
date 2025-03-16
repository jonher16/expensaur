import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../theme';
import { Expense, Category } from '../models';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getRelativeTimeString } from '../utils/dateUtils';

interface ExpenseCardProps {
  expense: Expense;
  category: Category | undefined;
  onPress: (expense: Expense) => void;
  showDate?: boolean;
  showCategory?: boolean;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  category,
  onPress,
  showDate = true,
  showCategory = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(expense)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: category?.color || COLORS.gray }
          ]}
        >
          <Ionicons 
            name={(category?.icon as keyof typeof Ionicons.glyphMap) || 'help-circle'} 
            size={24} 
            color={COLORS.white} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
          {showCategory && category && (
            <Text style={styles.category}>
              {category.name}
            </Text>
          )}
          {showDate && (
            <Text style={styles.date}>
              {getRelativeTimeString(expense.date)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContainer}>
        <Text style={styles.amount}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
        {expense.originalAmount && expense.originalCurrency !== expense.currency && (
          <Text style={styles.originalAmount}>
            {formatCurrency(expense.originalAmount, expense.originalCurrency)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.8,
    paddingVertical: SIZES.padding * 0.7,
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.base * 1.5,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: SIZES.h4,
    color: COLORS.black,
    fontWeight: '500',
    marginBottom: 3,
  },
  category: {
    fontSize: SIZES.body5,
    color: COLORS.gray,
    marginBottom: 3,
  },
  date: {
    fontSize: SIZES.body5,
    color: COLORS.gray,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: SIZES.h4,
    color: COLORS.black,
    fontWeight: '600',
  },
  originalAmount: {
    fontSize: SIZES.body5,
    color: COLORS.gray,
    marginTop: 2,
  },
});

export default ExpenseCard; 