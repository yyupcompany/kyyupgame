/**
 * API Connectivity Tests (No Browser Required)
 * API连通性测试 (无需浏览器)
 */

import * as http from 'http'
import * as https from 'https'
import { authApi } from '@/api/auth';


interface TestResult {
  test: string
  success: boolean
  message: string
  data?: any
}

class APIConnectivityTester {
  private baseURL = 'http://localhost:3000'
  private frontendURL = 'http://localhost:5173'
  private results: TestResult[] = []

  async makeRequest(url: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 10000,
        ...options
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {}
            resolve({ status: res.statusCode, data: jsonData, raw: data })
          } catch (e) {
            resolve({ status: res.statusCode, data: null, raw: data })
          }
        })
      })
      
      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })
      
      req.end()
    })
  }

  async testBackendHealth(): Promise<TestResult> {
    try {
      const response = await this.makeRequest(`${this.baseURL}/api/health`)
      
      if (response.status === 200) {
        return {
          test: 'Backend Health Check',
          success: true,
          message: `Backend is healthy - Status: ${response.status}`,
          data: response.data
        }
      } else {
        return {
          test: 'Backend Health Check',
          success: false,
          message: `Backend returned status: ${response.status}`,
          data: response.data
        }
      }
    } catch (error) {
      return {
        test: 'Backend Health Check',
        success: false,
        message: `Backend health check failed: ${error.message}`
      }
    }
  }

  async testAPIEndpoints(): Promise<TestResult[]> {
    const endpoints = [
      '/api/list',
      '/api/dashboard/stats',
      '/api/users',
      '/api/students',
      '/api/teachers',
      '/api/classes',
      '/api/activities'
    ]

    const results: TestResult[] = []

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(`${this.baseURL}${endpoint}`)
        
        results.push({
          test: `API Endpoint: ${endpoint}`,
          success: response.status < 500, // Accept 200, 401, 403 as valid responses
          message: `Status: ${response.status}`,
          data: { status: response.status, hasData: !!response.data }
        })
      } catch (error) {
        results.push({
          test: `API Endpoint: ${endpoint}`,
          success: false,
          message: `Error: ${error.message}`
        })
      }
    }

    return results
  }

  async testAuthentication(): Promise<TestResult> {
    try {
      // Test login endpoint
      const loginData = JSON.stringify({
        username: '13800138000',
        password: '13800138000123'
      })

      const response = await new Promise((resolve, reject) => {
        const req = http.request(`${this.baseURL}/api/auth/unified-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
          },
          timeout: 10000
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            try {
              const jsonData = data ? JSON.parse(data) : {}
              resolve({ status: res.statusCode, data: jsonData })
            } catch (e) {
              resolve({ status: res.statusCode, data: null, raw: data })
            }
          })
        })

        req.on('error', reject)
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Login request timeout'))
        })

        req.write(loginData)
        req.end()
      }) as any

      if (response.status === 200 && response.data?.token) {
        return {
          test: 'Authentication',
          success: true,
          message: 'Login successful, token received',
          data: { hasToken: true, tokenLength: response.data.token?.length }
        }
      } else {
        return {
          test: 'Authentication',
          success: false,
          message: `Login failed - Status: ${response.status}`,
          data: response.data
        }
      }
    } catch (error) {
      return {
        test: 'Authentication',
        success: false,
        message: `Authentication test failed: ${error.message}`
      }
    }
  }

  async testFrontendAccessibility(): Promise<TestResult> {
    try {
      const response = await this.makeRequest(this.frontendURL)
      
      if (response.status === 200) {
        const hasVueApp = response.raw?.includes('app') || response.raw?.includes('vue')
        return {
          test: 'Frontend Accessibility',
          success: true,
          message: `Frontend accessible - Status: ${response.status}`,
          data: { 
            status: response.status, 
            hasVueApp,
            contentLength: response.raw?.length 
          }
        }
      } else {
        return {
          test: 'Frontend Accessibility',
          success: false,
          message: `Frontend returned status: ${response.status}`
        }
      }
    } catch (error) {
      return {
        test: 'Frontend Accessibility',
        success: false,
        message: `Frontend accessibility test failed: ${error.message}`
      }
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting API Connectivity Tests...\n')

    // Test 1: Backend Health
    const healthResult = await this.testBackendHealth()
    this.results.push(healthResult)
    this.logResult(healthResult)

    // Test 2: Authentication
    const authResult = await this.testAuthentication()
    this.results.push(authResult)
    this.logResult(authResult)

    // Test 3: API Endpoints
    console.log('\n📡 Testing API Endpoints...')
    const endpointResults = await this.testAPIEndpoints()
    this.results.push(...endpointResults)
    endpointResults.forEach(result => this.logResult(result))

    // Test 4: Frontend Accessibility
    const frontendResult = await this.testFrontendAccessibility()
    this.results.push(frontendResult)
    this.logResult(frontendResult)

    // Summary
    this.printSummary()
  }

  private logResult(result: TestResult): void {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${result.test}: ${result.message}`)
    if (result.data) {
      console.log(`   Data: ${JSON.stringify(result.data)}`)
    }
  }

  private printSummary(): void {
    const total = this.results.length
    const passed = this.results.filter(r => r.success).length
    const failed = total - passed
    const passRate = ((passed / total) * 100).toFixed(1)

    console.log('\n📊 Test Summary:')
    console.log(`   Total Tests: ${total}`)
    console.log(`   Passed: ${passed}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Pass Rate: ${passRate}%`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`))
    }

    console.log('\n🎯 API Integration Status:', passRate >= '70' ? 'GOOD' : 'NEEDS_IMPROVEMENT')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APIConnectivityTester()
  tester.runAllTests().catch(console.error)
}

export { APIConnectivityTester, TestResult }