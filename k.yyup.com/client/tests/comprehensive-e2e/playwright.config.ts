import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright配置文件
 * 用于四角色完整测试
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // 禁用并行测试，避免登录冲突
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 使用单个worker，避免并发问题
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true, // 默认无头模式
    viewport: { width: 1920, height: 1080 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    // 忽略HTTPS错误（开发环境可能使用自签名证书）
    ignoreHTTPSErrors: true,
    // 超时配置
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // 测试超时
  timeout: 60000, // 60秒
  expect: {
    timeout: 10000,
  },
})
