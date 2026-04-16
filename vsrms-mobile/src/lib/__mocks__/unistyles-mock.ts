/**
 * Minimal mock for react-native-unistyles for Jest testing.
 * Provides a dummy theme and StyleSheet.create implementation.
 */

const mockTheme = {
  colors: {
    brand: '#F56E0F',
    brandSoft: '#FFF4ED',
    background: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    error: '#DC2626',
    errorBackground: '#FEE2E2',
    successText: '#15803D',
    successBackground: '#DCFCE7',
    errorText: '#DC2626',
  },
  typography: {
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20 },
    weights: { regular: '400', medium: '500', bold: '700' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};

export const StyleSheet = {
  create: (styleFn: (theme: any) => any) => {
    if (typeof styleFn === 'function') {
      return styleFn(mockTheme);
    }
    return styleFn;
  },
};

export const UnistylesRuntime = {
  themeName: 'light',
  setTheme: () => {},
};

export const useStyles = () => ({
  theme: mockTheme,
  styles: {},
});
