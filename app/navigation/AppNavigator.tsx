import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

// Import screens (to be created)
import HomeScreen from '../screens/HomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import EditCategoryScreen from '../screens/EditCategoryScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import DailyExpensesScreen from '../screens/DailyExpensesScreen';
import ExchangeRatesScreen from '../screens/ExchangeRatesScreen';
import CategoriesScreen from '../screens/CategoriesScreen';

// Define navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Expenses: undefined;
  Insights: undefined;
  Settings: undefined;
  AddExpense: { categoryId?: string };
  EditExpense: { expenseId: string };
  EditCategory: { categoryId?: string };
  CategoryDetails: { categoryId: string };
  DailyExpenses: { date: number };
  ExchangeRates: undefined;
  Categories: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Insights: undefined;
  Settings: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main bottom tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpensesScreen} 
        options={{ title: 'Expenses' }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{ title: 'Insights' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddExpense" 
          component={AddExpenseScreen} 
          options={{ title: 'Add Expense' }}
        />
        <Stack.Screen 
          name="EditExpense" 
          component={EditExpenseScreen} 
          options={{ title: 'Edit Expense' }}
        />
        <Stack.Screen 
          name="CategoryDetails" 
          component={CategoryDetailsScreen} 
          options={({ route }) => ({ title: 'Category Details' })}
        />
        <Stack.Screen 
          name="EditCategory" 
          component={EditCategoryScreen} 
          options={({ route }) => ({ 
            title: route.params?.categoryId ? 'Edit Category' : 'Add Category' 
          })}
        />
        <Stack.Screen 
          name="DailyExpenses" 
          component={DailyExpensesScreen} 
          options={{ title: 'Daily Expenses' }}
        />
        <Stack.Screen 
          name="ExchangeRates" 
          component={ExchangeRatesScreen} 
          options={{ title: 'Exchange Rates' }}
        />
        <Stack.Screen 
          name="Categories" 
          component={CategoriesScreen} 
          options={{ title: 'Categories' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 