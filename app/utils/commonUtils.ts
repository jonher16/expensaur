/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Get the appropriate colors based on the current theme
 */
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../theme';

export const useThemeColors = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  
  return {
    background: isDark ? COLORS.dark.background : COLORS.light.background,
    card: isDark ? COLORS.dark.card : COLORS.light.card,
    text: isDark ? COLORS.dark.text : COLORS.light.text,
    subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
    border: isDark ? COLORS.dark.border : COLORS.light.border,
    
    // Common colors independent of theme
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    primaryDark: COLORS.primaryDark,
    secondary: COLORS.secondary,
    secondaryLight: COLORS.secondaryLight,
    secondaryDark: COLORS.secondaryDark,
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.info,
    
    // Category colors
    food: COLORS.food,
    transport: COLORS.transport,
    entertainment: COLORS.entertainment,
    shopping: COLORS.shopping,
    health: COLORS.health,
    housing: COLORS.housing,
    education: COLORS.education,
    utilities: COLORS.utilities,
    other: COLORS.other,
  };
}; 