import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary dinosaur-themed colors
  primary: '#4CAF50', // A friendly green for our dinosaur theme
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  
  // Secondary accent colors
  secondary: '#673AB7', // Purple as secondary
  secondaryLight: '#9575CD',
  secondaryDark: '#512DA8',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#EEEEEE',
  darkGray: '#424242',
  
  // Status and feedback colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  
  // Category colors for pie charts and visuals
  food: '#FF9800', // Orange
  transport: '#2196F3', // Blue
  entertainment: '#9C27B0', // Purple
  shopping: '#F44336', // Red
  health: '#00BCD4', // Cyan
  housing: '#795548', // Brown
  education: '#FFEB3B', // Yellow
  utilities: '#607D8B', // Blue Gray
  other: '#9E9E9E', // Gray
  
  // Light theme specific colors
  light: {
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#000000',
    subText: '#757575',
    border: '#E0E0E0',
  },
  
  // Dark theme specific colors
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    subText: '#BBBBBB',
    border: '#333333',
  },
  
  // Transparent colors
  transparent: 'transparent',
  transparentBlack: 'rgba(0, 0, 0, 0.5)',
  transparentWhite: 'rgba(255, 255, 255, 0.5)',
};

export const FONT = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  margin: 20,
  
  // Font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 16,
  h5: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,
  
  // App dimensions
  width,
  height,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
};

// Create a light theme compatible with react-native-paper
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.light.background,
    surface: COLORS.white,
    error: COLORS.error,
  },
};

// Create a dark theme compatible with react-native-paper
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.dark.background,
    surface: COLORS.dark.card,
    error: COLORS.error,
  },
};

// Export a theme based on mode
export const getTheme = (mode: 'light' | 'dark' | 'system') => {
  if (mode === 'light') return lightTheme;
  if (mode === 'dark') return darkTheme;
  
  // For system mode, we'll determine this in the App component
  return lightTheme;
}; 