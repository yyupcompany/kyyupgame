import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

/**
 * 控制台错误检测测试专用配置
 */
export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, '../'),
    }
  },

  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 测试文件匹配模式 - 专门匹配控制台测试
    include: [
      'tests/consoletest/**/*.test.ts'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'build',
      '**/*.d.ts'
    ],

    // 超时配置
    testTimeout: 30000,
    hookTimeout: 10000,
    
    // 并发配置
    threads: true,
    maxThreads: 2,
    minThreads: 1,
    
    // 报告配置
    reporter: ['verbose'],
    
    // 设置文件
    setupFiles: [
      './tests/setup.ts'
    ],

    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITE_APP_ENV: 'test',
      CONSOLE_TEST_MODE: 'true'
    },

    // 监听模式配置
    watch: false,
    
    // 静默模式配置
    silent: false,
    
    // 模拟配置
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,

    // 错误处理
    dangerouslyIgnoreUnhandledErrors: false,
    
    // 性能配置
    isolate: true,
    pool: 'threads'
  },

  // 优化配置
  optimizeDeps: {
    include: [
      'vue',
      '@vue/test-utils',
      'element-plus',
      'vue-router',
      'pinia'
    ]
  }
});
