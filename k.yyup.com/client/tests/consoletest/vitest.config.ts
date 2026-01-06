import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

/**
 * 控制台错误检测测试专用配置
 * 
 * 特点：
 * 1. 专门针对控制台错误检测优化
 * 2. 增加测试超时时间
 * 3. 配置详细的报告输出
 * 4. 支持并发测试
 */

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '~': resolve(__dirname, '../../'),
    }
  },

  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 测试文件匹配模式
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

    // 超时配置 - 控制台测试需要更长时间
    testTimeout: 30000,        // 单个测试30秒超时
    hookTimeout: 10000,        // 钩子函数10秒超时
    teardownTimeout: 5000,     // 清理5秒超时

    // 并发配置
    threads: true,             // 启用多线程
    maxThreads: 4,             // 最大4个线程
    minThreads: 2,             // 最小2个线程
    
    // 重试配置
    retry: 1,                  // 失败重试1次
    
    // 报告配置
    reporter: [
      'verbose',               // 详细输出
      'json',                  // JSON报告
      'html'                   // HTML报告
    ],
    
    // 输出目录
    outputFile: {
      json: './test-results/console-test-results.json',
      html: './test-results/console-test-report.html'
    },

    // 覆盖率配置
    coverage: {
      enabled: false,          // 控制台测试不需要覆盖率
    },

    // 设置文件
    setupFiles: [
      './tests/setup.ts',
      './tests/setup/console-monitoring.ts'
    ],

    // 全局配置
    globalSetup: './tests/consoletest/global-setup.ts',
    
    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITE_APP_ENV: 'test',
      CONSOLE_TEST_MODE: 'true'
    },

    // 监听模式配置
    watch: false,              // 控制台测试不需要监听模式
    
    // 静默模式配置
    silent: false,             // 显示详细输出
    
    // 日志级别
    logHeapUsage: true,        // 显示内存使用情况
    
    // 测试序列化配置
    sequence: {
      shuffle: false,          // 不随机化测试顺序
      concurrent: true         // 允许并发测试
    },

    // 模拟配置
    clearMocks: true,          // 每次测试后清理mock
    restoreMocks: true,        // 恢复原始实现
    mockReset: true,           // 重置mock状态

    // 快照配置
    updateSnapshot: 'new',     // 只更新新的快照
    
    // 错误处理
    dangerouslyIgnoreUnhandledErrors: false,  // 不忽略未处理错误
    
    // 性能配置
    isolate: true,             // 隔离测试环境
    pool: 'threads',           // 使用线程池
    
    // 自定义匹配器
    expect: {
      // 自定义断言超时
      timeout: 5000
    }
  },

  // 构建配置
  build: {
    target: 'node14',
    sourcemap: true
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
  },

  // 服务器配置
  server: {
    fs: {
      allow: ['..']
    }
  }
});
