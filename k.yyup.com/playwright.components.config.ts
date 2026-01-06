import { defineConfig, devices } from '@playwright/test';

/**
 * 组件测试 - Playwright配置
 * 专门用于测试通用组件库
 */
export default defineConfig({
  testDir: './tests/centers',
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
    ['html', { outputFolder: 'test-results/components-html' }],
    ['json', { outputFile: 'test-results/components-results.json' }],
    ['junit', { outputFile: 'test-results/components-junit.xml' }]
  ],
  /* 全局测试设置 */
  use: {
    /* 基础URL指向本地开发服务器 */
    baseURL: 'http://localhost:5173',
    
    /* 录制失败时的截图 */
    screenshot: 'only-on-failure',
    
    /* 录制失败时的视频 */
    video: 'retain-on-failure',
    
    /* 录制失败时的trace */
    trace: 'retain-on-failure',
    
    /* 浏览器上下文选项 */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    /* 等待策略 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 配置项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* 移动端测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 开发服务器配置 */
  webServer: {
    command: 'cd client && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
