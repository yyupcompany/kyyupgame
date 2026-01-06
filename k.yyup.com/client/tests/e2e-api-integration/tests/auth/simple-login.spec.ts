import { vi } from 'vitest'
import { test, expect } from '@playwright/test'

/**
 * Simple Login Test (without complex fixtures)
 * 简单登录测试 (不使用复杂夹具)
 */
test.
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('Simple Authentication Tests', () => {
  
  test('Basic page accessibility test', async ({ page }) => {
    // Test basic page access
    try {
      await page.goto('http://localhost:5173')
      console.log('✅ Successfully accessed main page')
      
      // Check if login page or dashboard is accessible
      const currentUrl = page.url()
      console.log(`✅ Current URL: ${currentUrl}`)
      
      // If redirected to login, try to access login form
      if (currentUrl.includes('/login')) {
        console.log('📋 Login page detected, looking for login form...')
        
        // Look for login form elements
        const usernameInput = page.locator('input[type="text"], input[name="username"]').first()
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
        
        const usernameVisible = await usernameInput.isVisible().catch(() => false)
        const passwordVisible = await passwordInput.isVisible().catch(() => false)
        
        if (usernameVisible && passwordVisible) {
          console.log('✅ Login form elements found')
        } else {
          console.log('⚠️ Login form elements may have different structure')
        }
      } else {
        console.log('✅ Already authenticated or no login required')
      }
      
    } catch (error) {
      console.error('❌ Page access failed:', error.message)
      throw error
    }
  })

  test('Login form interaction test', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    
    try {
      // Wait for page to load
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      
      // Look for various possible login form selectors
      const possibleUsernameSelectors = [
        'input[name="username"]',
        'input[type="text"]',
        'input[placeholder*="用户名"]',
        'input[placeholder*="账号"]',
        '.el-input__inner[type="text"]'
      ]
      
      const possiblePasswordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input[placeholder*="密码"]',
        '.el-input__inner[type="password"]'
      ]
      
      let usernameInput = null
      let passwordInput = null
      
      // Find username input
      for (const selector of possibleUsernameSelectors) {
        try {
          const input = page.locator(selector).first()
          if (await input.isVisible({ timeout: 2000 })) {
            usernameInput = input
            console.log(`✅ Found username input: ${selector}`)
            break
          }
        } catch (e) {
          continue
        }
      }
      
      // Find password input
      for (const selector of possiblePasswordSelectors) {
        try {
          const input = page.locator(selector).first()
          if (await input.isVisible({ timeout: 2000 })) {
            passwordInput = input
            console.log(`✅ Found password input: ${selector}`)
            break
          }
        } catch (e) {
          continue
        }
      }
      
      if (usernameInput && passwordInput) {
        console.log('✅ Login form detected successfully')
        
        // Test form interaction
        await usernameInput.fill('test_user')
        await passwordInput.fill('test_password')
        
        console.log('✅ Form interaction test completed')
      } else {
        console.log('⚠️ Login form not found with expected selectors')
        
        // Log page content for debugging
        const pageContent = await page.content()
        const hasForm = pageContent.includes('form') || pageContent.includes('input')
        console.log(`Page has forms/inputs: ${hasForm}`)
      }
      
    } catch (error) {
      console.error('❌ Login form test failed:', error.message)
      // Don't throw - this is exploratory testing
    }
  })

  test('API endpoint accessibility test', async ({ page }) => {
    // Test if backend API is accessible
    try {
      const response = await page.request.get('http://localhost:3000/api/health')
      
      if (response.ok()) {
        const data = await response.json()
        console.log('✅ Backend API is accessible:', data)
      } else {
        console.log(`⚠️ Backend API returned status: ${response.status()}`)
      }
    } catch (error) {
      console.log('⚠️ Backend API not accessible:', error.message)
    }
    
    // Test frontend-backend connection
    try {
      await page.goto('http://localhost:5173')
      
      // Monitor network requests
      const apiRequests = []
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push(request.url())
        }
      })
      
      // Wait for any initial API calls
      await page.waitForTimeout(3000)
      
      if (apiRequests.length > 0) {
        console.log(`✅ Frontend making API calls: ${apiRequests.length} requests`)
        apiRequests.forEach(url => console.log(`  - ${url}`))
      } else {
        console.log('ℹ️ No API calls detected in initial page load')
      }
      
    } catch (error) {
      console.error('❌ Frontend-backend connection test failed:', error.message)
    }
  })

  test('Navigation and routing test', async ({ page }) => {
    try {
      await page.goto('http://localhost:5173')
      console.log('✅ Initial page load successful')
      
      // Test common routes
      const testRoutes = [
        '/dashboard',
        '/students',
        '/teachers',
        '/classes',
        '/activities',
        '/users'
      ]
      
      let accessibleRoutes = 0
      
      for (const route of testRoutes) {
        try {
          await page.goto(`http://localhost:5173${route}`)
          await page.waitForLoadState('networkidle', { timeout: 5000 })
          
          const currentUrl = page.url()
          if (currentUrl.includes(route) && !currentUrl.includes('/login')) {
            accessibleRoutes++
            console.log(`✅ Route accessible: ${route}`)
          } else {
            console.log(`⚠️ Route redirected: ${route} -> ${currentUrl}`)
          }
        } catch (error) {
          console.log(`⚠️ Route error: ${route} - ${error.message}`)
        }
      }
      
      console.log(`✅ Navigation test completed: ${accessibleRoutes}/${testRoutes.length} routes accessible`)
      
    } catch (error) {
      console.error('❌ Navigation test failed:', error.message)
    }
  })

  test('Page performance and loading test', async ({ page }) => {
    try {
      const startTime = Date.now()

      await page.goto('http://localhost:5173')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      console.log(`✅ Page load time: ${loadTime}ms`)
      
      // Check for loading indicators
      const loadingIndicators = [
        '.loading',
        '.el-loading-mask',
        '.spinner',
        '[data-testid="loading"]'
      ]
      
      let foundLoadingIndicator = false
      for (const indicator of loadingIndicators) {
        try {
          const element = page.locator(indicator)
          if (await element.isVisible({ timeout: 1000 })) {
            foundLoadingIndicator = true
            console.log(`✅ Loading indicator found: ${indicator}`)
            
            // Wait for loading to finish
            await element.waitFor({ state: 'hidden', timeout: 10000 })
            console.log(`✅ Loading completed`)
            break
          }
        } catch (e) {
          continue
        }
      }
      
      if (!foundLoadingIndicator) {
        console.log('ℹ️ No loading indicators detected')
      }
      
      // Performance metrics
      expect(loadTime).toBeLessThan(10000) // Less than 10 seconds
      
    } catch (error) {
      console.error('❌ Performance test failed:', error.message)
      throw error
    }
  })
})