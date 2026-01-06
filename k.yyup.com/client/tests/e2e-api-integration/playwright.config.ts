import { defineConfig, devices } from '@playwright/test'

/**
 * E2E API Integration Testing Configuration
 * 无头浏览器API集成测试配置
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 3,
  
  // Test timeout and expect timeout
  timeout: 60000, // 60 seconds for each test
  expect: {
    timeout: 10000 // 10 seconds for expect assertions
  },
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/test-results.xml' }]
  ],
  
  // Global test configuration
  use: {
    // Base URL for the application
    baseURL: 'http://localhost:5173',
    
    // Browser context options
    headless: true,
    ignoreHTTPSErrors: true,
    
    // Tracing and debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Action timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    }
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome-specific options
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox-specific options
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
        // Safari-specific options
        ignoreHTTPSErrors: true
      },
    },
    
    // Mobile browsers for responsive testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile Chrome options
        hasTouch: true
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        // Mobile Safari options
        hasTouch: true
      },
    },
  ],

  // Web servers configuration (commented out for manual server control)
  // webServer: [
  //   {
  //     command: 'cd /home/devbox/project/client && npm run dev',
  //     port: 5173,
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //     env: {
  //       NODE_ENV: 'test'
  //     }
  //   },
  //   {
  //     command: 'cd /home/devbox/project/server && npm run dev',
  //     port: 3000,
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //     env: {
  //       NODE_ENV: 'test'
  //     }
  //   }
  // ],

  // Global setup and teardown
  globalSetup: './utils/global-setup.ts',
  globalTeardown: './utils/global-teardown.ts',
  
  // Output directories
  outputDir: 'test-results',
  
  // Test metadata
  metadata: {
    framework: 'Playwright',
    purpose: 'Frontend-Backend API Integration Testing',
    target: 'Kindergarten Management System',
    environment: 'Development'
  }
})