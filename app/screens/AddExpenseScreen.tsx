import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, IconButton, Surface, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { formatDate } from '../utils/dateUtils';
// import DateTimePicker from '@react-native-community/datetimepicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddExpenseScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { categories, settings, addExpense } = useApp();
  const colors = useThemeColors();

  // Form state
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>(settings?.defaultCurrency || 'USD');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  
  // Get category info
  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);
  
  // Handle submit
  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      // Show validation error
      return;
    }
    
    try {
      await addExpense({
        userId: settings?.userId || 'demo-user',
        amount: parseFloat(amount),
        description,
        categoryId: selectedCategory,
        date: date.getTime(),
        currency,
      });
      
      // Reset form and navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  
  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView>
          {/* Amount Input */}
          <Surface style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>
                {currency}
              </Text>
              <TextInput
                style={[styles.amountInput, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.subText}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </Surface>

          {/* Description Input */}
          <Surface style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              label="Description"
              style={[styles.input, { backgroundColor: colors.card }]}
              placeholder="What was this expense for?"
              placeholderTextColor={colors.subText}
              value={description}
              onChangeText={setDescription}
            />
          </Surface>
          
          {/* Category Selector */}
          <Surface style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.labelText, { color: colors.text }]}>Category</Text>
            <View style={styles.categoryContainer}>
              {selectedCategory ? (
                <View style={styles.selectedCategory}>
                  <View 
                    style={[
                      styles.categoryIcon, 
                      { backgroundColor: selectedCategoryInfo?.color || colors.secondary }
                    ]}
                  >
                    <Text style={styles.categoryIconText}>
                      {selectedCategoryInfo?.name.charAt(0) || '?'}
                    </Text>
                  </View>
                  <Text style={[styles.categoryText, { color: colors.text }]}>
                    {selectedCategoryInfo?.name || 'Select Category'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.placeholderText, { color: colors.subText }]}>
                  Select a category
                </Text>
              )}
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Categories' as never)}
              >
                Choose
              </Button>
            </View>
          </Surface>
          
          {/* Date Picker */}
          <Surface style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.labelText, { color: colors.text }]}>Date</Text>
            <TouchableOpacity 
              style={styles.dateContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <IconButton
                icon="calendar"
                size={20}
                iconColor={colors.primary}
                style={styles.dateIcon}
              />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(date, 'long')}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <View>
                <Text>Date Picker Would Appear Here</Text>
                <Text>Need to install @react-native-community/datetimepicker package</Text>
              </View>
            )}
          </Surface>
          
          {/* Currency Selector */}
          <Surface style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.labelText, { color: colors.text }]}>Currency</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.currencySelector}
                  onPress={() => setMenuVisible(true)}
                >
                  <Text style={[styles.currencyText, { color: colors.text }]}>
                    {currency}
                  </Text>
                  <IconButton
                    icon="chevron-down"
                    size={20}
                    iconColor={colors.text}
                  />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                title="USD"
                onPress={() => {
                  setCurrency('USD');
                  setMenuVisible(false);
                }}
              />
              <Menu.Item
                title="EUR"
                onPress={() => {
                  setCurrency('EUR');
                  setMenuVisible(false);
                }}
              />
              <Menu.Item
                title="GBP"
                onPress={() => {
                  setCurrency('GBP');
                  setMenuVisible(false);
                }}
              />
              <Divider />
              <Menu.Item
                title="More currencies..."
                onPress={() => {
                  setMenuVisible(false);
                  // Navigate to currency selector screen
                }}
              />
            </Menu>
          </Surface>
          
          {/* Submit Button */}
          <Button
            mode="contained"
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            Save Expense
          </Button>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  input: {
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    margin: 0,
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
  },
  submitButton: {
    marginVertical: 24,
    paddingVertical: 8,
  },
});

export default AddExpenseScreen; 