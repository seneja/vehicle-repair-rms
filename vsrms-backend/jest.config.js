'use strict';

/**
 * Jest configuration for VSRMS Backend
 * Focuses on Node.js environment and commonJS module support.
 */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/config/**',
  ],
  modulePathIgnorePatterns: ['<rootDir>/../vsrms-mobile/'],
  moduleNameMapper: {
    '^jose$': '<rootDir>/src/utils/__tests__/empty-mock.js',
    '^jwks-rsa$': '<rootDir>/src/utils/__tests__/empty-mock.js',
  },
};
