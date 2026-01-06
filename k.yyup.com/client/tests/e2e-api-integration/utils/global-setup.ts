import { chromium, FullConfig } from '@playwright/test'
import { AuthFixture } from '../fixtures/auth.fixture'

/**
 * Global Setup for E2E API Integration Tests
 * E2E API集成测试全局设置
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E API Integration Test Global Setup...')
  
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  
  try {
    // Create authentication state files for different user roles
    await setupAuthenticationStates(browser, baseURL || 'http://localhost:5173')
    
    // Verify API endpoints are accessible
    await verifyAPIEndpoints(baseURL || 'http://localhost:5173')
    
    console.log('✅ Global Setup completed successfully')
  } catch (error) {
    console.error('❌ Global Setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

/**
 * Setup authentication states for different user roles
 * 为不同用户角色设置认证状态
 */
async function setupAuthenticationStates(browser: any, baseURL: string) {
  console.log('🔐 Setting up authentication states...')
  
  const authFixture = new AuthFixture()
  const userRoles = ['admin', 'principal', 'teacher', 'parent']
  
  for (const role of userRoles) {
    try {
      const context = await browser.newContext()
      const page = await context.newPage()
      
      // Login with role credentials
      await authFixture.loginWithRole(page, role, baseURL)
      
      // Save authentication state
      await context.storageState({ 
        path: `tests/e2e-api-integration/auth-states/${role}-auth.json` 
      })
      
      await context.close()
      console.log(`✅ Authentication state saved for role: ${role}`)
    } catch (error) {
      console.error(`❌ Failed to setup auth for role ${role}:`, error)
      // Continue with other roles even if one fails
    }
  }
}

/**
 * Verify that critical API endpoints are accessible
 * 验证关键API端点是否可访问
 */
async function verifyAPIEndpoints(baseURL: string) {
  console.log('🔍 Verifying API endpoints...')
  
  const apiBaseURL = baseURL.replace('localhost:5173', 'localhost:3000')
  const criticalEndpoints = [
    '/api/health',
    '/api/auth/check',
    '/api/dashboard/stats',
    '/api/users',
    '/api/students'
  ]
  
  for (const endpoint of criticalEndpoints) {
    try {
      const response = await fetch(`${apiBaseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok || response.status === 401) {
        console.log(`✅ API endpoint accessible: ${endpoint}`)
      } else {
        console.warn(`⚠️ API endpoint issue: ${endpoint} (Status: ${response.status})`)
      }
    } catch (error) {
      console.warn(`⚠️ API endpoint error: ${endpoint}`, error.message)
    }
  }
}

export default globalSetup