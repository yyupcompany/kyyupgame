import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 基础配置
 * 统一的E2E测试配置
 */
export const baseConfig = defineConfig({
  // 测试目录
  testDir: './tests/e2e',
  
  // 测试文件匹配
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  
  // 并行配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  // 重试配置
  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 2 : undefined,
  
  // 超时配置
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    ['line'],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // 全局配置
  use: {
    // 基础URL
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // 浏览器配置 - 强制使用无头模式
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
  
  // 项目配置
  projects: [
    // 桌面浏览器
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'security.tls.insecure_fallback_hosts': 'localhost'
          }
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        ignoreHTTPSErrors: true
      },
    },
    
    // 移动端浏览器
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true
      },
    }
  ],
  
  // 输出目录
  outputDir: 'test-results/playwright-output',
  
  // 全局设置和清理
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts'
});

export default baseConfig;
