import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../theme';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { formatDate } from '../utils/dateUtils';

type DailyExpensesScreenRouteProp = RouteProp<RootStackParamList, 'DailyExpenses'>;

interface DailyExpensesScreenProps {
  route: DailyExpensesScreenRouteProp;
}

const DailyExpensesScreen: React.FC<DailyExpensesScreenProps> = ({ route }) => {
  const { date } = route.params;
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Daily Expenses Screen</Text>
      <Text style={styles.subText}>Date: {formatDate(date, 'long')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default DailyExpensesScreen; 