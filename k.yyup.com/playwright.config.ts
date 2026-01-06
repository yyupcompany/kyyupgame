import { defineConfig, devices } from '@playwright/test';

/**
 * AI助手系统 - Playwright测试配置
 * 专为localhost:5173环境的无头单元测试配置
 */
export default defineConfig({
  testDir: './tests/ai-assistant',
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
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* 全局测试设置 */
  use: {
    /* 基础URL指向本地前端开发服务器（直接使用 localhost:5173 更稳妥） */
    baseURL: 'http://localhost:5173',

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

  /* 测试项目配置（为稳定性与安装成本，先仅启用 chromium） */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],

  /* 如需在测试前自动启动本地开发服务器，可在确认后开启以下配置 */
  // webServer: [
  //   { command: 'npm run start:frontend', port: 5173, reuseExistingServer: !process.env.CI, timeout: 120000 },
  //   { command: 'npm run start:backend',  port: 3000, reuseExistingServer: !process.env.CI, timeout: 120000 },
  // ],
});