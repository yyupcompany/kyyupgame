/**
 * Jest 基础配置
 * 统一的测试配置，供前后端共享
 */

const path = require('path');

module.exports = {
  // 基础配置
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js'
  ],
  
  // TypeScript 转换
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // 模块名映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/tests/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1'
  },
  
  // 覆盖率配置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'clover'
  ],
  
  // 覆盖率收集范围
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/types/**/*',
    '!src/migrations/**/*',
    '!src/seeders/**/*',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  
  // 覆盖率阈值 - 调整为更现实的目标
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // 测试设置
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 60000, // 增加到60秒
  verbose: true,

  // 忽略模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.backup/'
  ],

  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // 全局设置和清理
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',

  // 错误处理
  errorOnDeprecated: false, // 暂时禁用以减少噪音

  // 缓存配置
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // 并行执行 - 优化worker配置
  maxWorkers: 2, // 减少worker数量避免资源竞争
  workerIdleMemoryLimit: '512MB', // 限制worker内存

  // 强制退出和资源检测
  forceExit: true, // 强制退出避免挂起
  detectOpenHandles: true, // 检测未关闭的句柄
  detectLeaks: false, // 暂时禁用内存泄漏检测以提高性能

  // 清理模拟
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // 静默模式 - 减少输出
  silent: false,

  // 失败快速退出
  bail: 0, // 不要在第一个失败时退出

  // 最大并发测试数
  maxConcurrency: 5
};
