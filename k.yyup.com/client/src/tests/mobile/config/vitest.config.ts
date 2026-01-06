/**
 * 移动端测试Vitest配置文件
 * 专门针对移动端功能测试的配置
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局设置
    globals: true,

    // 测试文件匹配模式
    include: [
      'mobile/**/*.test.ts',
      'mobile/**/*.test.js'
    ],

    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      '.git'
    ],

    // 测试超时时间（移动端测试需要更多时间）
    testTimeout: 30000,
    hookTimeout: 30000,

    // 并发配置
    threads: false, // 移动端测试使用单线程避免竞争

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/test-utils/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // 移动端特定阈值
        './mobile/authentication/**': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './mobile/parent-center/**': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },

    // 报告器配置
    reporter: [
      'verbose',
      'json',
      'html'
    ],

    // 输出目录
    outputFile: {
      json: './test-results/mobile-test-results.json',
      html: './test-results/mobile-test-report.html'
    },

    // 设置文件
    setupFiles: [
      './setup/mobile-test-setup.ts'
    ],

    // 监视模式配置
    watch: false,

    // 测试序列
    sequence: {
      concurrent: false, // 串行执行避免移动端测试干扰
      shuffle: false
    },

    // 全局配置
    globals: {
      'describe': true,
      'it': true,
      'test': true,
      'expect': true,
      'beforeEach': true,
      'afterEach': true,
      'beforeAll': true,
      'afterAll': true,
      'vi': true
    }
  },

  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../../src'),
      '@tests': resolve(__dirname, '../'),
      '@utils': resolve(__dirname, '../utils'),
      '@mobile': resolve(__dirname, '../')
    }
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'vitest',
      '@testing-library/vue',
      '@testing-library/jest-dom'
    ]
  }
});