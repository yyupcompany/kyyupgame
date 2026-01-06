const baseConfig = require('../test-config/jest.config.base.cjs');

module.exports = {
  ...baseConfig,

  // 服务器特定配置
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],

  // 服务器特定的覆盖率收集
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/models/index.ts',
    '!src/scripts/**/*.ts',
    '!src/config/**/*.ts',
    '!src/types/**/*.ts',
    '!src/migrations/**/*.ts',
    '!src/seeders/**/*.ts',
    '!**/node_modules/**'
  ],

  // 服务器特定的设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // 服务器特定的全局设置
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts'
};