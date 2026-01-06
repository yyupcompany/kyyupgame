module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/unit/**/*.test.ts',
    '**/integration/**/*.test.ts',
    '**/e2e/**/*.test.ts',
    '**/comprehensive/**/*.test.ts',
    '**/parameters/**/*.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    '../src/**/*.ts',
    '!../src/**/*.d.ts',
    '!../src/migrations/**',
    '!../src/seeders/**'
  ],
  coverageDirectory: './reports/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/helpers/setup.ts'],
  testTimeout: 600000, // 10 minutes
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@test/(.*)$': '<rootDir>/$1'
  },
  globalSetup: '<rootDir>/helpers/globalSetup.ts',
  globalTeardown: '<rootDir>/helpers/globalTeardown.ts'
};