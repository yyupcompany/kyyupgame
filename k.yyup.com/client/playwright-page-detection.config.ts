import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/page-detection',
  testMatch: ['**/*.test.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3, // 重试3次确保稳定性
  workers: process.env.CI ? 2 : 4, // 并行工作进程
  reporter: [
    ['html', { outputFolder: 'playwright-page-detection-report' }],
    ['json', { outputFile: 'page-detection-results.json' }],
    ['junit', { outputFile: 'page-detection-results.xml' }]
  ],
  
  // 全局超时配置
  timeout: 60000, // 60秒测试超时
  expect: { timeout: 10000 }, // 10秒断言超时
  
  use: {
    // 基础配置
    baseURL: 'http://localhost:5173',
    
    // 浏览器设置
    headless: true, // 无头模式，适合服务器环境
    viewport: { width: 1920, height: 1080 },
    
    // 录制和截图
    screenshot: 'on', // 每次测试都截图
    video: 'on', // 每次测试都录屏
    trace: 'on', // 保留完整trace
    
    // 网络和性能
    actionTimeout: 30000, // 动作超时30秒
    navigationTimeout: 30000, // 导航超时30秒
    
    // 认证状态
    storageState: undefined, // 每次重新登录
    
    // 其他设置
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
  },

  projects: [
    // 桌面Chrome - 主要测试浏览器
    {
      name: 'desktop-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // 桌面Firefox
    {
      name: 'desktop-firefox', 
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // 移动端Chrome
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    // 移动端Safari  
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // 平板设备
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad Pro'] },
    }
  ],

  // 全局设置和清理
  globalSetup: './tests/page-detection/global-setup.ts',
  globalTeardown: './tests/page-detection/global-teardown.ts',
})