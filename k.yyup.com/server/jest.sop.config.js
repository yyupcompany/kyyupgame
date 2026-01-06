module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/services/teacher-sop.service.ts',
    'src/services/ai-sop-suggestion.service.ts',
    'src/controllers/teacher-sop.controller.ts',
    'src/models/sop-*.model.ts',
    'src/models/customer-sop-progress.model.ts',
    'src/models/conversation-*.model.ts',
    'src/models/ai-suggestion-history.model.ts'
  ],
  coverageDirectory: 'coverage/sop',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  verbose: true,
  testTimeout: 10000
};

