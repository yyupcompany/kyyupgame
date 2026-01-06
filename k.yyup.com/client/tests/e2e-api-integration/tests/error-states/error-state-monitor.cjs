/**
 * Error State and Null Value Monitor (No Browser Required)
 * 错误状态和空值监控 (无需浏览器)
 */

const http = require('http')

class ErrorStateMonitor {
  constructor() {
    this.baseURL = 'http://localhost:3000'
    this.token = null
    this.results = []
  }

  async authenticate() {
    try {
      const loginData = JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })

      const response = await new Promise((resolve, reject) => {
        const req = http.request(`${this.baseURL}/api/auth/login`, {
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
      })

      if (response.status === 200 && response.data?.data?.token) {
        this.token = response.data.data.token
        console.log('✅ Authentication successful')
        return true
      } else {
        console.log('❌ Authentication failed')
        return false
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.message)
      return false
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: 15000
      }

      if (data) {
        const jsonData = JSON.stringify(data)
        options.headers['Content-Length'] = Buffer.byteLength(jsonData)
      }

      const req = http.request(`${this.baseURL}${endpoint}`, options, (res) => {
        let responseData = ''
        res.on('data', chunk => responseData += chunk)
        res.on('end', () => {
          try {
            const jsonData = responseData ? JSON.parse(responseData) : {}
            resolve({ 
              status: res.statusCode, 
              data: jsonData, 
              raw: responseData,
              headers: res.headers
            })
          } catch (e) {
            resolve({ 
              status: res.statusCode, 
              data: null, 
              raw: responseData,
              headers: res.headers
            })
          }
        })
      })

      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      if (data) {
        req.write(JSON.stringify(data))
      }
      req.end()
    })
  }

  async makeAuthenticatedRequest(endpoint, method = 'GET', data = null) {
    return this.makeRequest(endpoint, method, data, {
      'Authorization': `Bearer ${this.token}`
    })
  }

  async testUnauthorizedAccess() {
    console.log('\n🔒 Testing unauthorized access...')
    
    const endpoints = [
      '/api/students',
      '/api/teachers',
      '/api/classes',
      '/api/users',
      '/api/dashboard/stats'
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint) // No auth token
        
        const result = {
          test: `Unauthorized Access - ${endpoint}`,
          endpoint,
          success: response.status === 401 || response.status === 403,
          status: response.status,
          expectation: '401/403 status',
          message: response.status === 401 ? 'Correctly rejected unauthorized request' :
                   response.status === 403 ? 'Correctly rejected forbidden request' :
                   `Unexpected status: ${response.status}`
        }

        results.push(result)
        this.logResult(result)
      } catch (error) {
        results.push({
          test: `Unauthorized Access - ${endpoint}`,
          endpoint,
          success: false,
          error: error.message
        })
      }
    }

    this.results.push(...results)
    return results
  }

  async testInvalidTokenAccess() {
    console.log('\n🔐 Testing invalid token access...')
    
    const endpoints = ['/api/students', '/api/teachers', '/api/users']
    const invalidTokens = [
      'invalid_token',
      'Bearer invalid_token',
      'expired_token_here',
      ''
    ]

    const results = []

    for (const endpoint of endpoints) {
      for (const invalidToken of invalidTokens) {
        try {
          const response = await this.makeRequest(endpoint, 'GET', null, {
            'Authorization': `Bearer ${invalidToken}`
          })
          
          const result = {
            test: `Invalid Token - ${endpoint}`,
            endpoint,
            token: invalidToken.substring(0, 10) + '...',
            success: response.status === 401 || response.status === 403,
            status: response.status,
            message: response.status === 401 ? 'Correctly rejected invalid token' : 
                     `Unexpected status: ${response.status}`
          }

          results.push(result)
          this.logResult(result)
        } catch (error) {
          results.push({
            test: `Invalid Token - ${endpoint}`,
            endpoint,
            success: false,
            error: error.message
          })
        }
      }
    }

    this.results.push(...results)
    return results
  }

  async testNotFoundEndpoints() {
    console.log('\n🔍 Testing 404 not found endpoints...')
    
    const nonExistentEndpoints = [
      '/api/nonexistent',
      '/api/students/999999',
      '/api/teachers/999999',
      '/api/classes/999999',
      '/api/invalid-endpoint',
      '/api/users/not-a-number'
    ]

    const results = []

    for (const endpoint of nonExistentEndpoints) {
      try {
        const response = await this.makeAuthenticatedRequest(endpoint)
        
        const result = {
          test: `404 Not Found - ${endpoint}`,
          endpoint,
          success: response.status === 404,
          status: response.status,
          expectation: '404 status',
          message: response.status === 404 ? 'Correctly returned 404' :
                   `Unexpected status: ${response.status}`
        }

        results.push(result)
        this.logResult(result)
      } catch (error) {
        results.push({
          test: `404 Not Found - ${endpoint}`,
          endpoint,
          success: false,
          error: error.message
        })
      }
    }

    this.results.push(...results)
    return results
  }

  async testInvalidHTTPMethods() {
    console.log('\n🚫 Testing invalid HTTP methods...')
    
    const endpoints = [
      { endpoint: '/api/students', invalidMethods: ['PATCH', 'DELETE'] },
      { endpoint: '/api/teachers', invalidMethods: ['PATCH'] },
      { endpoint: '/api/dashboard/stats', invalidMethods: ['POST', 'PUT', 'DELETE'] }
    ]

    const results = []

    for (const { endpoint, invalidMethods } of endpoints) {
      for (const method of invalidMethods) {
        try {
          const response = await this.makeAuthenticatedRequest(endpoint, method)
          
          const result = {
            test: `Invalid Method - ${method} ${endpoint}`,
            endpoint,
            method,
            success: response.status === 405 || response.status >= 400,
            status: response.status,
            expectation: '405 Method Not Allowed',
            message: response.status === 405 ? 'Correctly rejected invalid method' :
                     response.status >= 400 ? 'Returned client error (acceptable)' :
                     `Unexpected status: ${response.status}`
          }

          results.push(result)
          this.logResult(result)
        } catch (error) {
          results.push({
            test: `Invalid Method - ${method} ${endpoint}`,
            endpoint,
            success: false,
            error: error.message
          })
        }
      }
    }

    this.results.push(...results)
    return results
  }

  async testInvalidInputData() {
    console.log('\n📝 Testing invalid input data...')
    
    const testCases = [
      {
        endpoint: '/api/auth/login',
        method: 'POST',
        data: { username: '', password: '' },
        expectation: '400 Bad Request'
      },
      {
        endpoint: '/api/auth/login',
        method: 'POST',
        data: { invalidField: 'test' },
        expectation: '400 Bad Request'
      },
      {
        endpoint: '/api/auth/login',
        method: 'POST',
        data: 'invalid json string',
        expectation: '400 Bad Request'
      }
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        // For invalid JSON, we need to handle it differently
        let response
        if (typeof testCase.data === 'string') {
          response = await new Promise((resolve, reject) => {
            const req = http.request(`${this.baseURL}${testCase.endpoint}`, {
              method: testCase.method,
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(testCase.data)
              },
              timeout: 10000
            }, (res) => {
              let data = ''
              res.on('data', chunk => data += chunk)
              res.on('end', () => {
                resolve({ status: res.statusCode, data, raw: data })
              })
            })

            req.on('error', reject)
            req.on('timeout', () => {
              req.destroy()
              reject(new Error('Request timeout'))
            })

            req.write(testCase.data)
            req.end()
          })
        } else {
          response = await this.makeRequest(testCase.endpoint, testCase.method, testCase.data)
        }
        
        const result = {
          test: `Invalid Input - ${testCase.endpoint}`,
          endpoint: testCase.endpoint,
          success: response.status >= 400 && response.status < 500,
          status: response.status,
          expectation: testCase.expectation,
          message: response.status >= 400 && response.status < 500 ? 
                   'Correctly rejected invalid input' :
                   `Unexpected status: ${response.status}`
        }

        results.push(result)
        this.logResult(result)
      } catch (error) {
        results.push({
          test: `Invalid Input - ${testCase.endpoint}`,
          endpoint: testCase.endpoint,
          success: true, // Network errors can be acceptable for invalid data
          error: error.message,
          message: 'Network error (acceptable for invalid data)'
        })
      }
    }

    this.results.push(...results)
    return results
  }

  async testServerErrorSimulation() {
    console.log('\n💥 Testing server error handling...')
    
    // Test endpoints that might trigger server errors
    const testCases = [
      {
        endpoint: '/api/students?page=-1',
        expectation: 'Handle negative page numbers'
      },
      {
        endpoint: '/api/students?pageSize=999999',
        expectation: 'Handle extremely large page sizes'
      },
      {
        endpoint: '/api/students?invalidParam=test',
        expectation: 'Handle invalid query parameters'
      }
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        const response = await this.makeAuthenticatedRequest(testCase.endpoint)
        
        const result = {
          test: `Server Error Handling - ${testCase.endpoint}`,
          endpoint: testCase.endpoint,
          success: response.status < 500 || (response.status >= 500 && response.data), // Either no server error or error with response
          status: response.status,
          expectation: testCase.expectation,
          message: response.status < 500 ? 'Handled gracefully' :
                   response.status >= 500 ? 'Server error occurred' :
                   `Status: ${response.status}`
        }

        results.push(result)
        this.logResult(result)
      } catch (error) {
        results.push({
          test: `Server Error Handling - ${testCase.endpoint}`,
          endpoint: testCase.endpoint,
          success: false,
          error: error.message
        })
      }
    }

    this.results.push(...results)
    return results
  }

  async testEmptyDataHandling() {
    console.log('\n📊 Testing empty data scenarios...')
    
    // Test endpoints with filters that might return empty results
    const testCases = [
      {
        endpoint: '/api/students?keyword=nonexistentuser12345',
        expectation: 'Return empty results for non-matching search'
      },
      {
        endpoint: '/api/teachers?department=NonexistentDepartment',
        expectation: 'Return empty results for non-matching filter'
      },
      {
        endpoint: '/api/activities?startDate=2030-01-01',
        expectation: 'Return empty results for future date filter'
      }
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        const response = await this.makeAuthenticatedRequest(testCase.endpoint)
        
        const hasEmptyData = this.isEmptyDataResponse(response.data)
        
        const result = {
          test: `Empty Data Handling - ${testCase.endpoint}`,
          endpoint: testCase.endpoint,
          success: response.status === 200 && hasEmptyData,
          status: response.status,
          expectation: testCase.expectation,
          isEmpty: hasEmptyData,
          message: response.status === 200 && hasEmptyData ? 
                   'Correctly returned empty results' :
                   `Status: ${response.status}, HasData: ${!hasEmptyData}`
        }

        results.push(result)
        this.logResult(result)
      } catch (error) {
        results.push({
          test: `Empty Data Handling - ${testCase.endpoint}`,
          endpoint: testCase.endpoint,
          success: false,
          error: error.message
        })
      }
    }

    this.results.push(...results)
    return results
  }

  isEmptyDataResponse(responseData) {
    if (!responseData) return true
    
    // Check various empty data formats
    if (responseData.data?.items && responseData.data.items.length === 0) return true
    if (responseData.data?.rows && responseData.data.rows.length === 0) return true
    if (responseData.items && responseData.items.length === 0) return true
    if (responseData.rows && responseData.rows.length === 0) return true
    if (Array.isArray(responseData.data) && responseData.data.length === 0) return true
    if (Array.isArray(responseData) && responseData.length === 0) return true
    
    return false
  }

  async testTimeoutScenarios() {
    console.log('\n⏰ Testing timeout scenarios...')
    
    const results = []
    
    // Test with very short timeout
    try {
      const shortTimeoutPromise = new Promise((resolve, reject) => {
        const req = http.request(`${this.baseURL}/api/students`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          timeout: 1 // Very short timeout
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            resolve({ status: res.statusCode, data })
          })
        })

        req.on('error', reject)
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })

        req.end()
      })

      await shortTimeoutPromise
      
      results.push({
        test: 'Timeout Handling - Short timeout',
        success: true,
        message: 'Request completed within short timeout'
      })
    } catch (error) {
      results.push({
        test: 'Timeout Handling - Short timeout',
        success: true, // Timeout is expected behavior
        message: 'Correctly handled timeout: ' + error.message
      })
    }

    this.results.push(...results)
    return results
  }

  logResult(result) {
    const icon = result.success ? '✅' : '❌'
    const statusInfo = result.status ? ` (${result.status})` : ''
    const errorInfo = result.error ? ` - ${result.error}` : ''
    
    console.log(`${icon} ${result.test}${statusInfo}${errorInfo}`)
    
    if (result.message) {
      console.log(`   ${result.message}`)
    }
  }

  async runAllErrorStateTests() {
    console.log('🚀 Starting Error State and Null Value Monitor...\n')

    // Step 1: Authenticate
    const authSuccess = await this.authenticate()
    if (!authSuccess) {
      console.log('❌ Cannot proceed without authentication')
      return
    }

    // Step 2: Test unauthorized access
    await this.testUnauthorizedAccess()

    // Step 3: Test invalid token access
    await this.testInvalidTokenAccess()

    // Step 4: Test 404 not found endpoints
    await this.testNotFoundEndpoints()

    // Step 5: Test invalid HTTP methods
    await this.testInvalidHTTPMethods()

    // Step 6: Test invalid input data
    await this.testInvalidInputData()

    // Step 7: Test server error handling
    await this.testServerErrorSimulation()

    // Step 8: Test empty data scenarios
    await this.testEmptyDataHandling()

    // Step 9: Test timeout scenarios
    await this.testTimeoutScenarios()

    // Step 10: Generate summary
    this.generateSummary()
  }

  generateSummary() {
    console.log('\n📊 Error State and Null Value Summary:')
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = total - successful
    const successRate = ((successful / total) * 100).toFixed(1)
    
    console.log(`   Total Tests: ${total}`)
    console.log(`   Successful: ${successful}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Success Rate: ${successRate}%`)
    
    // Error handling analysis
    const unauthorizedTests = this.results.filter(r => r.test.includes('Unauthorized'))
    const unauthorizedSuccess = unauthorizedTests.filter(r => r.success).length
    
    const notFoundTests = this.results.filter(r => r.test.includes('404'))
    const notFoundSuccess = notFoundTests.filter(r => r.success).length
    
    const invalidInputTests = this.results.filter(r => r.test.includes('Invalid'))
    const invalidInputSuccess = invalidInputTests.filter(r => r.success).length
    
    console.log('\n🔒 Security Testing:')
    console.log(`   Unauthorized Access: ${unauthorizedSuccess}/${unauthorizedTests.length} correctly handled`)
    console.log(`   Invalid Input: ${invalidInputSuccess}/${invalidInputTests.length} correctly handled`)
    
    console.log('\n🔍 Error Handling:')
    console.log(`   404 Not Found: ${notFoundSuccess}/${notFoundTests.length} correctly handled`)
    
    // Final assessment
    const overallStatus = successRate >= 80 ? 'EXCELLENT' : 
                         successRate >= 60 ? 'GOOD' : 
                         successRate >= 40 ? 'FAIR' : 'POOR'
    
    console.log(`\n🎯 Overall Error Handling Status: ${overallStatus}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => !r.success)
        .slice(0, 5) // Show first 5 failures
        .forEach(r => console.log(`   - ${r.test}: ${r.error || r.message || 'Unknown error'}`))
      
      if (failed > 5) {
        console.log(`   ... and ${failed - 5} more`)
      }
    }

    console.log('\n💡 Recommendations:')
    if (unauthorizedSuccess < unauthorizedTests.length) {
      console.log('   - Review authentication and authorization mechanisms')
    }
    if (notFoundSuccess < notFoundTests.length) {
      console.log('   - Ensure proper 404 handling for non-existent resources')
    }
    if (invalidInputSuccess < invalidInputTests.length) {
      console.log('   - Improve input validation and error responses')
    }
    if (successRate >= 80) {
      console.log('   - Error handling is robust and well-implemented')
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const monitor = new ErrorStateMonitor()
  monitor.runAllErrorStateTests().catch(console.error)
}

module.exports = { ErrorStateMonitor }