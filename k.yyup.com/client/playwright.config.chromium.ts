import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',
  
  // 测试文件匹配
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  
  // 并行配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  // 重试配置
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  // 超时配置
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['line']
  ],
  
  // 全局配置
  use: {
    // 基础URL
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    
    // 浏览器配置 - 全部使用无头模式
    headless: true,
    
    // 调试配置
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 超时配置
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // 视口配置
    viewport: { width: 1280, height: 720 },
    
    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,
    
    // 额外HTTP头
    extraHTTPHeaders: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    }
  },
  
  // 项目配置 - 只使用Chromium
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    }
  ],
  
  // 输出目录
  outputDir: 'test-results/playwright-output',
  
  // Web服务器配置（可选）
  webServer: [
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ]
})
