import { useColorScheme } from 'react-native';

// Define Modern Clarity color palettes - Apple-like styling
export const lightColors = {
  background: '#F2F2F7', // Apple System Gray 6
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8A8A8E', // Apple System Gray
  accent: '#007AFF', // Apple Blue
  accentGreen: '#34C759', // Apple Green
  border: '#D1D1D6', // Apple System Gray 4
  placeholder: '#C7C7CD', // Apple System Gray 2
  destructive: '#FF3B30', // Apple Red
  inputBackground: '#EFEFF4',
  highlightBackground: '#FEFFD6', // Lighter yellow
  highlightText: '#000000',
  flagged: '#FF3B30', // Apple Red
  flaggedIcon: '#FF3B30', // Apple Red
  notesBackground: '#EFEFF4', // Specific for notes area
};

export const darkColors = {
  background: '#1C1C1E', // Apple System Gray 6 Dark
  card: '#2C2C2E', // Apple System Gray 5 Dark
  text: '#FFFFFF',
  textSecondary: '#8E8E93', // Apple System Gray Dark
  accent: '#0A84FF', // Apple Blue Dark
  accentGreen: '#30D158', // Apple Green Dark
  border: '#38383A', // Apple System Gray 4 Dark
  placeholder: '#8E8E93',
  destructive: '#FF453A', // Apple Red Dark
  inputBackground: '#3A3A3C',
  highlightBackground: '#B0A000', // Darker yellow for highlight
  highlightText: '#FFFFFF',
  flagged: '#FF453A', // Apple Red Dark
  flaggedIcon: '#FF453A',
  notesBackground: '#2C2C2E', // Specific for notes area in dark mode
};

export type ColorScheme = typeof lightColors;

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  return {
    isDarkMode,
    colors,
    colorScheme: systemColorScheme,
  };
}; 