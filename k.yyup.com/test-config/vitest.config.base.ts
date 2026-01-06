import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

/**
 * Vitest 基础配置
 * 统一的前端单元测试配置
 */
export const baseConfig = defineConfig({
  plugins: [vue()],

  // 环境变量配置
  envDir: '.',
  envPrefix: 'VITE_',

  test: {
    // 全局配置
    globals: true,
    environment: 'happy-dom',

    // 测试环境变量
    env: {
      NODE_ENV: 'test',
      VITE_NODE_ENV: 'test',
      VITE_API_BASE_URL: 'http://localhost:3000/api',
      VITE_API_PROXY_TARGET: 'http://localhost:3000',
      VITE_DEV_HOST: 'localhost',
      VITE_HMR_HOST: 'localhost'
    },
    
    // 测试文件匹配
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'src/**/*.test.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'tests/e2e/**'
    ],
    
    // 设置文件
    setupFiles: ['tests/setup.ts'],
    
    // 超时配置
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'text-summary',
        'json',
        'json-summary',
        'html',
        'lcov',
        'clover'
      ],
      reportsDirectory: 'coverage',
      
      // 覆盖率收集范围
      include: [
        'src/**/*.{vue,ts,js}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,js}',
        '!src/**/*.spec.{ts,js}'
      ],
      exclude: [
        'src/main.ts',
        'src/types/**',
        'src/mock/**',
        'src/**/*.stories.{ts,js}',
        'src/**/*.config.{ts,js}',
        'node_modules/**',
        'dist/**',
        'build/**'
      ],
      
      // 100%覆盖率目标
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      },
      
      // 覆盖率检查
      checkCoverage: true,
      skipFull: false
    },
    
    // 并发配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // 报告配置
    reporter: [
      'verbose',
      'json',
      'html'
    ],
    outputFile: {
      json: 'test-results/vitest-results.json',
      html: 'test-results/vitest-report.html'
    },
    
    // 监视模式配置
    watch: false,
    
    // 环境变量（合并配置）
    
    // 全局设置和清理
    globalSetup: ['tests/global-setup.ts'],
    globalTeardown: ['tests/global-teardown.ts']
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@test': resolve(__dirname, '../tests'),
      '@shared': resolve(__dirname, '../shared')
    }
  },
  
  // 定义全局变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
});

export default baseConfig;
