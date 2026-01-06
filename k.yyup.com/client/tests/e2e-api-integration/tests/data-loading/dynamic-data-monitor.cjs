/**
 * Dynamic Data Loading Monitor (No Browser Required)
 * 动态数据加载监控 (无需浏览器)
 */

const http = require('http')

class DynamicDataMonitor {
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

  async makeAuthenticatedRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
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

  async testDataLoadingPerformance(endpoint, testName) {
    const startTime = Date.now()
    
    try {
      const response = await this.makeAuthenticatedRequest(endpoint)
      const loadTime = Date.now() - startTime
      
      const result = {
        test: testName,
        endpoint,
        success: response.status === 200,
        loadTime,
        status: response.status,
        dataSize: response.raw ? response.raw.length : 0,
        hasData: !!(response.data?.data || response.data?.items || response.data?.rows),
        dataCount: this.getDataCount(response.data)
      }

      this.results.push(result)
      return result
    } catch (error) {
      const loadTime = Date.now() - startTime
      const result = {
        test: testName,
        endpoint,
        success: false,
        loadTime,
        error: error.message,
        dataSize: 0,
        hasData: false,
        dataCount: 0
      }

      this.results.push(result)
      return result
    }
  }

  getDataCount(responseData) {
    if (!responseData) return 0
    
    // Check for different response formats
    if (responseData.data?.items) return responseData.data.items.length
    if (responseData.data?.rows) return responseData.data.rows.length
    if (responseData.items) return responseData.items.length
    if (responseData.rows) return responseData.rows.length
    if (responseData.data && Array.isArray(responseData.data)) return responseData.data.length
    if (Array.isArray(responseData)) return responseData.length
    
    return responseData.data ? 1 : 0
  }

  async testPaginationDataLoading(endpoint, testName) {
    console.log(`\n🔄 Testing pagination for ${testName}...`)
    
    const pages = [
      { page: 1, pageSize: 10 },
      { page: 2, pageSize: 10 },
      { page: 1, pageSize: 20 }
    ]

    const paginationResults = []

    for (const params of pages) {
      const startTime = Date.now()
      const paginatedEndpoint = `${endpoint}?page=${params.page}&pageSize=${params.pageSize}`
      
      try {
        const response = await this.makeAuthenticatedRequest(paginatedEndpoint)
        const loadTime = Date.now() - startTime
        
        const result = {
          test: `${testName} - Page ${params.page}, Size ${params.pageSize}`,
          endpoint: paginatedEndpoint,
          success: response.status === 200,
          loadTime,
          status: response.status,
          dataCount: this.getDataCount(response.data),
          hasData: !!(response.data?.data || response.data?.items || response.data?.rows),
          totalCount: this.getTotalCount(response.data)
        }

        paginationResults.push(result)
        this.logResult(result)
      } catch (error) {
        const loadTime = Date.now() - startTime
        paginationResults.push({
          test: `${testName} - Page ${params.page}, Size ${params.pageSize}`,
          endpoint: paginatedEndpoint,
          success: false,
          loadTime,
          error: error.message
        })
      }
    }

    this.results.push(...paginationResults)
    return paginationResults
  }

  getTotalCount(responseData) {
    if (!responseData) return 0
    
    if (responseData.data?.total !== undefined) return responseData.data.total
    if (responseData.data?.count !== undefined) return responseData.data.count
    if (responseData.total !== undefined) return responseData.total
    if (responseData.count !== undefined) return responseData.count
    
    return 0
  }

  async testSearchFunctionality(endpoint, testName) {
    console.log(`\n🔍 Testing search functionality for ${testName}...`)
    
    const searchTerms = ['测试', 'admin', 'test', '2024']
    const searchResults = []

    for (const term of searchTerms) {
      const startTime = Date.now()
      const searchEndpoint = `${endpoint}?keyword=${encodeURIComponent(term)}`
      
      try {
        const response = await this.makeAuthenticatedRequest(searchEndpoint)
        const loadTime = Date.now() - startTime
        
        const result = {
          test: `${testName} - Search "${term}"`,
          endpoint: searchEndpoint,
          success: response.status === 200,
          loadTime,
          status: response.status,
          dataCount: this.getDataCount(response.data),
          searchTerm: term
        }

        searchResults.push(result)
        this.logResult(result)
      } catch (error) {
        searchResults.push({
          test: `${testName} - Search "${term}"`,
          endpoint: searchEndpoint,
          success: false,
          error: error.message,
          searchTerm: term
        })
      }
    }

    this.results.push(...searchResults)
    return searchResults
  }

  async testConcurrentDataLoading() {
    console.log('\n⚡ Testing concurrent data loading...')
    
    const endpoints = [
      '/api/dashboard/stats',
      '/api/students',
      '/api/teachers',
      '/api/classes',
      '/api/activities'
    ]

    const startTime = Date.now()
    
    try {
      const promises = endpoints.map(endpoint => 
        this.makeAuthenticatedRequest(endpoint)
      )

      const responses = await Promise.allSettled(promises)
      const totalTime = Date.now() - startTime
      
      const concurrentResults = responses.map((result, index) => {
        const endpoint = endpoints[index]
        
        if (result.status === 'fulfilled') {
          return {
            test: `Concurrent Load - ${endpoint}`,
            endpoint,
            success: result.value.status === 200,
            status: result.value.status,
            dataCount: this.getDataCount(result.value.data),
            hasData: !!(result.value.data?.data || result.value.data?.items)
          }
        } else {
          return {
            test: `Concurrent Load - ${endpoint}`,
            endpoint,
            success: false,
            error: result.reason?.message || 'Unknown error'
          }
        }
      })

      console.log(`✅ Concurrent loading completed in ${totalTime}ms`)
      console.log(`   Successful requests: ${concurrentResults.filter(r => r.success).length}/${endpoints.length}`)
      
      this.results.push(...concurrentResults)
      return { totalTime, results: concurrentResults }
    } catch (error) {
      console.log('❌ Concurrent loading failed:', error.message)
      return { totalTime: Date.now() - startTime, error: error.message }
    }
  }

  async runAllDataLoadingTests() {
    console.log('🚀 Starting Dynamic Data Loading Monitor...\n')

    // Step 1: Authenticate
    const authSuccess = await this.authenticate()
    if (!authSuccess) {
      console.log('❌ Cannot proceed without authentication')
      return
    }

    // Step 2: Test individual endpoint performance
    console.log('\n📊 Testing individual endpoint performance...')
    const endpoints = [
      { endpoint: '/api/dashboard/stats', name: 'Dashboard Statistics' },
      { endpoint: '/api/students', name: 'Student List' },
      { endpoint: '/api/teachers', name: 'Teacher List' },
      { endpoint: '/api/classes', name: 'Class List' },
      { endpoint: '/api/activities', name: 'Activity List' },
      { endpoint: '/api/users', name: 'User List' }
    ]

    for (const { endpoint, name } of endpoints) {
      const result = await this.testDataLoadingPerformance(endpoint, name)
      this.logResult(result)
    }

    // Step 3: Test pagination
    await this.testPaginationDataLoading('/api/students', 'Student Pagination')
    await this.testPaginationDataLoading('/api/teachers', 'Teacher Pagination')

    // Step 4: Test search functionality
    await this.testSearchFunctionality('/api/students', 'Student Search')
    await this.testSearchFunctionality('/api/teachers', 'Teacher Search')

    // Step 5: Test concurrent loading
    await this.testConcurrentDataLoading()

    // Step 6: Generate summary
    this.generateSummary()
  }

  logResult(result) {
    const icon = result.success ? '✅' : '❌'
    const timeInfo = result.loadTime ? ` (${result.loadTime}ms)` : ''
    const dataInfo = result.dataCount ? ` [${result.dataCount} items]` : ''
    
    console.log(`${icon} ${result.test}${timeInfo}${dataInfo}`)
    
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
  }

  generateSummary() {
    console.log('\n📊 Dynamic Data Loading Summary:')
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = total - successful
    const successRate = ((successful / total) * 100).toFixed(1)
    
    console.log(`   Total Tests: ${total}`)
    console.log(`   Successful: ${successful}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Success Rate: ${successRate}%`)
    
    // Performance analysis
    const performanceTests = this.results.filter(r => r.loadTime && r.success)
    if (performanceTests.length > 0) {
      const avgLoadTime = performanceTests.reduce((sum, r) => sum + r.loadTime, 0) / performanceTests.length
      const maxLoadTime = Math.max(...performanceTests.map(r => r.loadTime))
      const minLoadTime = Math.min(...performanceTests.map(r => r.loadTime))
      
      console.log('\n⏱️ Performance Metrics:')
      console.log(`   Average Load Time: ${avgLoadTime.toFixed(0)}ms`)
      console.log(`   Max Load Time: ${maxLoadTime}ms`)
      console.log(`   Min Load Time: ${minLoadTime}ms`)
      
      const slowTests = performanceTests.filter(r => r.loadTime > 2000)
      if (slowTests.length > 0) {
        console.log(`   ⚠️ Slow endpoints (>2s): ${slowTests.length}`)
        slowTests.forEach(test => {
          console.log(`     - ${test.endpoint}: ${test.loadTime}ms`)
        })
      }
    }
    
    // Data loading analysis
    const dataTests = this.results.filter(r => r.hasData !== undefined)
    const testsWithData = dataTests.filter(r => r.hasData)
    
    if (dataTests.length > 0) {
      console.log('\n📈 Data Loading Analysis:')
      console.log(`   Endpoints with data: ${testsWithData.length}/${dataTests.length}`)
      
      const totalItems = this.results
        .filter(r => r.dataCount > 0)
        .reduce((sum, r) => sum + r.dataCount, 0)
      
      if (totalItems > 0) {
        console.log(`   Total items loaded: ${totalItems}`)
      }
    }

    // Final assessment
    const overallStatus = successRate >= 80 ? 'EXCELLENT' : 
                         successRate >= 60 ? 'GOOD' : 
                         successRate >= 40 ? 'FAIR' : 'POOR'
    
    console.log(`\n🎯 Overall Data Loading Status: ${overallStatus}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => !r.success)
        .slice(0, 5) // Show first 5 failures
        .forEach(r => console.log(`   - ${r.test}: ${r.error || 'Unknown error'}`))
      
      if (failed > 5) {
        console.log(`   ... and ${failed - 5} more`)
      }
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const monitor = new DynamicDataMonitor()
  monitor.runAllDataLoadingTests().catch(console.error)
}

module.exports = { DynamicDataMonitor }