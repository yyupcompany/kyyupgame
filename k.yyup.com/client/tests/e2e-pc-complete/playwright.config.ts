/**
 * PC端完整测试Playwright配置
 * 专门用于PC端四角色100%覆盖率测试
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试目录 - 使用新的PC端测试目录
  testDir: './tests',

  // 测试文件匹配模式
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts'
  ],

  // 忽略模式
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],

  // 并行配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // 重试配置
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,

  // 全局超时配置
  timeout: 60000,
  expect: {
    timeout: 10000
  },

  // 报告配置
  reporter: [
    ['html', {
      outputFolder: './reports/html',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['json', {
      outputFile: './reports/results.json'
    }],
    ['junit', {
      outputFile: './reports/junit.xml',
      stripANSIControlSequences: true
    }],
    ['line'],
    process.env.CI ? ['github'] : ['list']
  ],

  // 全局配置
  use: {
    // 基础URL
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // 强制使用无头模式 - 符合项目要求
    headless: true,

    // 调试配置
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 超时配置
    actionTimeout: 15000,
    navigationTimeout: 30000,

    // 视口配置 - PC端标准分辨率
    viewport: { width: 1920, height: 1080 },

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 用户代理
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    // 额外HTTP头
    extraHTTPHeaders: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache'
    },

    // 网络条件
    offline: false,

    // 地理位置
    geolocation: { latitude: 39.9042, longitude: 116.4074 }, // 北京
    permissions: ['geolocation']
  },

  // 项目配置 - 多浏览器测试
  projects: [
    // 桌面Chrome - 主要测试浏览器
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        },
        testOptions: {
          screenshot: {
            mode: 'only-on-failure',
            fullPage: true
          }
        }
      },
    },

    // 桌面Firefox
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          firefoxUserPrefs: {
            'security.tls.insecure_fallback_hosts': 'localhost',
            'network.proxy.type': 0
          }
        }
      },
    },

    // 桌面Safari (WebKit)
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true
      },
    },

    // 不同分辨率测试
    {
      name: 'chromium-small-screen',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        launchOptions: {
          args: ['--disable-web-security']
        }
      }
    },

    {
      name: 'chromium-large-screen',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
        launchOptions: {
          args: ['--disable-web-security']
        }
      }
    }
  ],

  // 输出目录
  outputDir: './reports/test-results',

  // 全局设置 - 暂时禁用
  // globalSetup: require.resolve('./global-setup.ts'),
  // globalTeardown: require.resolve('./global-teardown.ts'),

  // 环境变量
  env: {
    NODE_ENV: 'test',
    TEST_MODE: 'e2e-pc-complete',
    COVERAGE: process.env.COVERAGE || 'true'
  },

  // Web服务器配置 - 暂时禁用，手动启动
  // webServer: [
  //   {
  //     command: 'npm run dev',
  //     port: 5173,
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //     stdout: 'pipe',
  //     stderr: 'pipe'
  //   },
  //   {
  //     command: 'cd ../server && npm run dev',
  //     port: 3000,
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //     stdout: 'pipe',
  //     stderr: 'pipe'
  //   }
  // ],

  // 依赖关系
  dependencies: [],

  // 元数据
  metadata: {
    'Test Environment': 'PC端完整测试',
    'Test Coverage': '100%',
    'Browser Mode': 'Headless',
    'Test Scope': '四角色全覆盖'
  }
})