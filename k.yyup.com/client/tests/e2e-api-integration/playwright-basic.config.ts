import { defineConfig } from '@playwright/test'

/**
 * Basic E2E API Integration Testing Configuration
 * 基础E2E API集成测试配置 (无需下载浏览器)
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/simple-login.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  
  // Test timeout
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Reporter configuration
  reporter: [
    ['line'],
    ['json', { outputFile: 'reports/basic-test-results.json' }]
  ],
  
  // Global test configuration
  use: {
    // Base URL for the application
    baseURL: 'http://localhost:5173',
    
    // Browser context options
    headless: true,
    ignoreHTTPSErrors: true,
    
    // Tracing and debugging
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    
    // Action timeouts
    actionTimeout: 10000,
    navigationTimeout: 15000,
    
    // Viewport size
    viewport: { width: 1280, height: 720 }
  },

  // Use built-in browser or skip browser altogether for basic testing
  webServer: undefined,

  // No global setup for basic version
  outputDir: 'test-results-basic'
})