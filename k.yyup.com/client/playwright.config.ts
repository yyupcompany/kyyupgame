import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试目录
  testDir: './tests',

  // 测试文件匹配
  testMatch: ['e2e/**/*.spec.ts', 'e2e/**/*.test.ts', 'mobile/**/*.spec.ts', 'mobile/**/*.test.ts'],
  
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
  
  // Web服务器配置（可选）
  webServer: [
    {
      // ✅ 使用更稳定的前端启动命令，避免 kill-ports 造成额外噪音
      command: 'npm run dev:fast:simple',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      // ✅ 关键修复：不用 dev（带 inspect）也不用 dev:fast（会触发 TS 类型编译失败）
      // 直接用 ts-node transpile-only 启动，既稳定又不会占用调试端口
      command: 'cd ../server && PORT=3000 NODE_ENV=development node -r ts-node/register/transpile-only src/app.ts',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ]
})