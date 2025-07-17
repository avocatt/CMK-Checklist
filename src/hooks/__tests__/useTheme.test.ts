import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { useTheme, lightColors, darkColors } from '../useTheme';

// Mock useColorScheme from React Native
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('light mode', () => {
    beforeEach(() => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
    });

    it('should return light theme when system is in light mode', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.colorScheme).toBe('light');
      expect(result.current.colors).toEqual(lightColors);
    });

    it('should have correct light mode colors', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.colors.background).toBe('#F2F2F7');
      expect(result.current.colors.card).toBe('#FFFFFF');
      expect(result.current.colors.text).toBe('#000000');
      expect(result.current.colors.accent).toBe('#007AFF');
      expect(result.current.colors.checked).toBe('#34C759');
      expect(result.current.colors.destructive).toBe('#FF3B30');
    });
  });

  describe('dark mode', () => {
    beforeEach(() => {
      (useColorScheme as jest.Mock).mockReturnValue('dark');
    });

    it('should return dark theme when system is in dark mode', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.colorScheme).toBe('dark');
      expect(result.current.colors).toEqual(darkColors);
    });

    it('should have correct dark mode colors', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.colors.background).toBe('#1C1C1E');
      expect(result.current.colors.card).toBe('#2C2C2E');
      expect(result.current.colors.text).toBe('#FFFFFF');
      expect(result.current.colors.accent).toBe('#0A84FF');
      expect(result.current.colors.checked).toBe('#30D158');
      expect(result.current.colors.destructive).toBe('#FF453A');
    });
  });

  describe('system preference changes', () => {
    it('should update theme when system preference changes', () => {
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const { result, rerender } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.colors).toEqual(lightColors);

      // Simulate system preference change
      (useColorScheme as jest.Mock).mockReturnValue('dark');
      rerender({});

      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.colors).toEqual(darkColors);
    });
  });

  describe('null color scheme', () => {
    it('should default to light theme when color scheme is null', () => {
      (useColorScheme as jest.Mock).mockReturnValue(null);
      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.colorScheme).toBe(null);
      expect(result.current.colors).toEqual(lightColors);
    });
  });

  describe('color consistency', () => {
    it('should have all required color properties in both themes', () => {
      const colorKeys = Object.keys(lightColors);
      const darkColorKeys = Object.keys(darkColors);

      expect(colorKeys).toEqual(darkColorKeys);
      expect(colorKeys).toContain('background');
      expect(colorKeys).toContain('card');
      expect(colorKeys).toContain('text');
      expect(colorKeys).toContain('textSecondary');
      expect(colorKeys).toContain('accent');
      expect(colorKeys).toContain('accentGreen');
      expect(colorKeys).toContain('border');
      expect(colorKeys).toContain('placeholder');
      expect(colorKeys).toContain('destructive');
      expect(colorKeys).toContain('inputBackground');
      expect(colorKeys).toContain('highlightBackground');
      expect(colorKeys).toContain('highlightText');
      expect(colorKeys).toContain('checked');
      expect(colorKeys).toContain('checkedIcon');
      expect(colorKeys).toContain('notesBackground');
      expect(colorKeys).toContain('warning');
      expect(colorKeys).toContain('secondaryText');
    });
  });
});