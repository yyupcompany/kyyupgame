/**
 * 移动端E2E测试Playwright配置
 * 严格遵循无头浏览器模式要求
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录配置
  testDir: './workflows',
  
  // 测试文件匹配模式
  testMatch: '**/*.e2e.test.ts',
  
  // 全局测试配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list']
  ],
  
  // 全局设置
  use: {
    // 强制使用无头浏览器模式
    headless: true,
    
    // 视频录制配置（仅在CI环境）
    video: process.env.CI ? 'retain-on-failure' : 'off',
    
    // 截图配置
    screenshot: 'only-on-failure',
    
    // 超时配置
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // 移动端 viewport
    viewport: { width: 375, height: 667 },
    
    // 用户代理
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    
    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,
    
    // 语言设置
    locale: 'zh-CN',
    
    // 时区设置
    timezoneId: 'Asia/Shanghai',
    
    // 网络条件
    offline: false,
    
    // 颜色方案
    colorScheme: 'light',
    
    // 权限
    permissions: ['geolocation', 'notifications'],
    
    // 基础URL
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
  },

  // 项目配置
  projects: [
    // 移动端Chrome测试
    {
      name: 'mobile-chrome',
      use: {
        ...devices['iPhone 12'],
        // 强制无头模式
        headless: true,
        // 禁用开发工具
        devtools: false,
      },
    },

    // 移动端Safari测试
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        // 强制无头模式
        headless: true,
        // 禁用开发工具
        devtools: false,
      },
      testMatch: '**/*critical.e2e.test.ts', // 仅关键测试用例
    },

    // 移动端Firefox测试
    {
      name: 'mobile-firefox',
      use: {
        ...devices['iPhone 12'],
        // 强制无头模式
        headless: true,
        // 禁用开发工具
        devtools: false,
      },
      testMatch: '**/*smoke.e2e.test.ts', // 仅冒烟测试
    },

    // 平板设备测试
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
        // 强制无头模式
        headless: true,
        // 禁用开发工具
        devtools: false,
        viewport: { width: 1024, height: 1366 },
      },
      testMatch: '**/*tablet.e2e.test.ts', // 仅平板特定测试
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run start:frontend',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // 全局设置文件
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),

  // 输出目录
  outputDir: 'test-results',

  // 测试超时
  timeout: 60000,
  
  // 预期超时
  expect: {
    timeout: 10000,
  },

  // 元数据配置
  metadata: {
    'Test Environment': process.env.NODE_ENV || 'test',
    'Browser Headless': 'true',
    'Device Type': 'mobile',
  },
});