import { defineConfig, devices } from '@playwright/test';

/**
 * AI助手系统 - 移动端Playwright测试配置
 * 专为移动端测试配置，支持无头模式和移动端设备模拟
 */
export default defineConfig({
  testDir: './client/src/tests/mobile',
  /* 并行运行测试 */
  fullyParallel: true,
  /* 禁用CI环境中的并行 */
  forbidOnly: !!process.env.CI,
  /* CI环境中失败重试2次 */
  retries: process.env.CI ? 2 : 0,
  /* 选择并行worker数量 */
  workers: process.env.CI ? 1 : undefined,
  /* 测试报告配置 */
  reporter: [
    ['html', { outputFolder: 'test-results/mobile-report' }],
    ['json', { outputFile: 'test-results/mobile-results.json' }],
    ['junit', { outputFile: 'test-results/mobile-junit.xml' }],
    ['list']
  ],
  /* 全局测试设置 */
  use: {
    /* 基础URL指向本地前端开发服务器 */
    baseURL: process.env.MOBILE_TEST_BASE_URL || 'http://localhost:5173',

    /* 录制失败时的截图 */
    screenshot: 'only-on-failure',

    /* 录制失败时的视频 */
    video: 'retain-on-failure',

    /* 录制所有操作追踪 */
    trace: 'on-first-retry',

    /* 设置默认超时 */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* 测试项目配置 */
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        headless: true,
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
        headless: true,
      },
    },
  ],

  /* 如需在测试前自动启动本地开发服务器 */
  // webServer: [
  //   { command: 'npm run start:frontend', port: 5173, reuseExistingServer: !process.env.CI, timeout: 120000 },
  //   { command: 'npm run start:backend',  port: 3000, reuseExistingServer: !process.env.CI, timeout: 120000 },
  // ],
});
