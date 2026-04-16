module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-unistyles)',
  ],
  moduleNameMapper: {
    // Mock unistyles which doesn't work well in node test environment without browser context
    '^react-native-unistyles$': '<rootDir>/src/lib/__mocks__/unistyles-mock.ts',
    '^@/lib/unistyles-compat$': '<rootDir>/src/lib/__mocks__/unistyles-mock.ts',
    '.*/theme/tokens$': '<rootDir>/src/theme/__mocks__/tokens.ts',
    '^@/theme/tokens$': '<rootDir>/src/theme/__mocks__/tokens.ts',
    '^@/theme/typography$': '<rootDir>/src/theme/__mocks__/tokens.ts',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types/**',
    '!src/theme/**',
  ],
};
