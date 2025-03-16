import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Text, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import ExpenseCard from '../components/ExpenseCard';
import { Expense } from '../models';

type CategoryDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CategoryDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CategoryDetailsScreen = () => {
  const route = useRoute<CategoryDetailsScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { categoryId } = route.params;
  const { categories, expenses, settings, deleteCategory } = useApp();
  const colors = useThemeColors();
  
  const [categoryExpenses, setCategoryExpenses] = useState<Expense[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Find category
  const category = categories.find(c => c.id === categoryId);
  
  // Update expenses when data changes
  useEffect(() => {
    if (!category) return;
    
    const filteredExpenses = expenses.filter(
      e => e.categoryId === categoryId && !e.isDeleted
    ).sort((a, b) => b.date - a.date);
    
    setCategoryExpenses(filteredExpenses);
    
    // Calculate total
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalAmount(total);
  }, [categoryId, expenses, category]);
  
  // Navigate to edit category
  const handleEditCategory = () => {
    navigation.navigate('EditCategory', { categoryId });
  };
  
  // Handle delete category
  const handleDeleteCategory = async () => {
    try {
      if (category?.isDefault) {
        // Show error message for default categories
        alert('Cannot delete default categories');
        return;
      }
      
      // Check if category has expenses
      if (categoryExpenses.length > 0) {
        alert('Cannot delete category with expenses. Please reassign or delete the expenses first.');
        return;
      }
      
      await deleteCategory(categoryId);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  // Handle expense press
  const handleExpensePress = (expenseId: string) => {
    navigation.navigate('EditExpense', { expenseId });
  };
  
  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Category not found</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Category Header */}
        <View 
          style={[
            styles.header, 
            { backgroundColor: category.color }
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(totalAmount, settings?.defaultCurrency || 'USD')}
            </Text>
            <Text style={styles.expenseCount}>
              {categoryExpenses.length} {categoryExpenses.length === 1 ? 'expense' : 'expenses'}
            </Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button 
            mode="contained" 
            onPress={handleEditCategory}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            Edit Category
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleDeleteCategory}
            style={styles.actionButton}
            color={colors.error}
            disabled={category.isDefault || categoryExpenses.length > 0}
          >
            Delete Category
          </Button>
        </View>
        
        {/* Expenses List */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Title style={{ color: colors.text }}>Expenses</Title>
            <Divider style={{ marginVertical: 10 }} />
            
            {categoryExpenses.length > 0 ? (
              categoryExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  category={category}
                  onPress={() => handleExpensePress(expense.id)}
                  showCategory={false}
                />
              ))
            ) : (
              <Text style={{ color: colors.subText, textAlign: 'center', padding: 20 }}>
                No expenses in this category
              </Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Category Info */}
        <Card style={[styles.card, { backgroundColor: colors.card, marginBottom: 20 }]}>
          <Card.Content>
            <Title style={{ color: colors.text }}>Details</Title>
            <Divider style={{ marginVertical: 10 }} />
            
            <View style={styles.detailRow}>
              <Text style={{ color: colors.subText }}>Default Category</Text>
              <Text style={{ color: colors.text }}>{category.isDefault ? 'Yes' : 'No'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: colors.subText }}>Created</Text>
              <Text style={{ color: colors.text }}>{formatDate(category.createdAt)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: colors.subText }}>Last Updated</Text>
              <Text style={{ color: colors.text }}>{formatDate(category.updatedAt)}</Text>
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
  header: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  expenseCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default CategoryDetailsScreen; 