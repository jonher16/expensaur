import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  IconButton, 
  Surface, 
  Menu, 
  Divider,
  Card
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { formatDate } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

// Simple date picker component that uses only React Native components
const SimpleDatePicker = ({ 
  visible, 
  onClose, 
  onSelect, 
  initialDate, 
  colors 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSelect: (date: Date) => void; 
  initialDate: Date;
  colors: any;
}) => {
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  
  // Get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
  };
  
  // Get number of days in a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Years to display (current year ± 10 years)
  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);
  
  // Months to display
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: getMonthName(i) }));
  
  // Days to display based on selected year and month
  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) }, 
    (_, i) => i + 1
  );
  
  // Handle save
  const handleSave = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onSelect(date);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={[styles.datePickerModal, { backgroundColor: colors.card }]}>
          <Card.Title title="Select Date" />
          <Card.Content>
            {/* Year Selector */}
            <Text style={[styles.pickerLabel, { color: colors.text }]}>Year</Text>
            <View style={styles.pickerContainer}>
              <FlatList
                data={years}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      selectedYear === item && { 
                        backgroundColor: colors.primary,
                        borderColor: colors.primary 
                      }
                    ]}
                    onPress={() => setSelectedYear(item)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      { color: selectedYear === item ? 'white' : colors.text }
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            
            {/* Month Selector */}
            <Text style={[styles.pickerLabel, { color: colors.text }]}>Month</Text>
            <View style={styles.pickerContainer}>
              <FlatList
                data={months}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      selectedMonth === item.value && { 
                        backgroundColor: colors.primary,
                        borderColor: colors.primary 
                      }
                    ]}
                    onPress={() => {
                      setSelectedMonth(item.value);
                      // Make sure selected day is valid in new month
                      const maxDays = getDaysInMonth(selectedYear, item.value);
                      if (selectedDay > maxDays) {
                        setSelectedDay(maxDays);
                      }
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      { color: selectedMonth === item.value ? 'white' : colors.text }
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            
            {/* Day Selector */}
            <Text style={[styles.pickerLabel, { color: colors.text }]}>Day</Text>
            <View style={styles.pickerContainer}>
              <FlatList
                data={days}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      selectedDay === item && { 
                        backgroundColor: colors.primary,
                        borderColor: colors.primary 
                      }
                    ]}
                    onPress={() => setSelectedDay(item)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      { color: selectedDay === item ? 'white' : colors.text }
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            
            {/* Action Buttons */}
            <View style={styles.datePickerActions}>
              <Button mode="text" onPress={onClose}>Cancel</Button>
              <Button mode="contained" onPress={handleSave}>Save</Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

const AddExpenseScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddExpenseScreenRouteProp>();
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
  
  // Check for route params
  useEffect(() => {
    // Check for category selection from navigation params
    if (route.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
    
    // Check for date parameter (from DailyExpensesScreen)
    if (route.params?.date) {
      setDate(new Date(route.params.date));
    }
  }, [route.params]);
  
  // Handle submit
  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      // Show validation error
      Alert.alert('Validation Error', 'Please enter an amount and select a category');
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
      
      // Navigate to Expenses screen directly instead of using goBack()
      navigation.navigate('MainTabs', { screen: 'Expenses' });
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to save expense');
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
                onPress={() => navigation.navigate('Categories', { selectionMode: true })}
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
            
            {/* Date Picker Modal */}
            <SimpleDatePicker 
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onSelect={setDate}
              initialDate={date}
              colors={colors}
            />
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
  // Date picker modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  datePickerModal: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerItemText: {
    fontSize: 16,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default AddExpenseScreen;