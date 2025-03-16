import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../theme';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type EditExpenseScreenRouteProp = RouteProp<RootStackParamList, 'EditExpense'>;

interface EditExpenseScreenProps {
  route: EditExpenseScreenRouteProp;
}

const EditExpenseScreen: React.FC<EditExpenseScreenProps> = ({ route }) => {
  const { expenseId } = route.params;
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Edit Expense Screen</Text>
      <Text style={styles.subText}>Expense ID: {expenseId}</Text>
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

export default EditExpenseScreen; 