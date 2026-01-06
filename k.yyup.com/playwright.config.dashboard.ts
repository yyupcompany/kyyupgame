import { defineConfig, devices } from '@playwright/test';

/**
 * Dashboard Performance Test Configuration
 * Specialized configuration for dashboard performance testing
 */
export default defineConfig({
  testDir: './tests',
  /* 并行运行测试 */
  fullyParallel: false, // Disable for accurate performance measurements
  /* 禁用CI环境中的并行 */
  forbidOnly: !!process.env.CI,
  /* CI环境中失败重试1次 */
  retries: process.env.CI ? 1 : 0,
  /* 使用单个worker以确保性能测试准确性 */
  workers: 1,
  /* 测试报告配置 */
  reporter: [
    ['line'],
    ['html', { outputFolder: 'tests/playwright-report-dashboard' }],
    ['json', { outputFile: 'tests/test-results/dashboard-results.json' }]
  ],
  /* 全局测试设置 */
  use: {
    /* 基础URL */
    baseURL: 'http://localhost:5173',
    
    /* 录制失败时的截图 */
    screenshot: 'always',
    
    /* 录制失败时的视频 */
    video: 'on',
    
    /* 录制所有操作追踪 */
    trace: 'on',
    
    /* 设置超时 */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* 测试项目配置 - 专注于Chrome以获得最佳性能测试结果 */
  projects: [
    {
      name: 'chromium-performance',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    }
  ],

  /* 设置测试超时 */
  timeout: 60000,
  expect: {
    timeout: 10000
  }
});