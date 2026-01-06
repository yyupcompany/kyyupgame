/**
 * API Data Loading Test
 * API数据加载测试 - 验证页面背后的数据接口是否正常工作
 */

const http = require('http')
const https = require('https')

class APIDataLoadingTest {
  constructor() {
    this.backendURL = 'http://localhost:3000'
    this.authToken = null
    this.testResults = []
    this.apiEndpoints = [
      // 仪表板相关API
      { name: '仪表板统计', endpoint: '/api/dashboard/stats', method: 'GET', priority: 'high' },
      { name: '待办事项', endpoint: '/api/dashboard/todos', method: 'GET', priority: 'high' },
      { name: '日程安排', endpoint: '/api/dashboard/schedules', method: 'GET', priority: 'high' },
      
      // 用户管理API
      { name: '用户列表', endpoint: '/api/users', method: 'GET', priority: 'high' },
      { name: '角色列表', endpoint: '/api/roles', method: 'GET', priority: 'high' },
      { name: '权限列表', endpoint: '/api/permissions', method: 'GET', priority: 'high' },
      
      // 学生管理API
      { name: '学生列表', endpoint: '/api/students', method: 'GET', priority: 'high' },
      { name: '学生统计', endpoint: '/api/students/statistics', method: 'GET', priority: 'medium' },
      
      // 教师管理API
      { name: '教师列表', endpoint: '/api/teachers', method: 'GET', priority: 'high' },
      { name: '教师统计', endpoint: '/api/teachers/statistics', method: 'GET', priority: 'medium' },
      
      // 班级管理API
      { name: '班级列表', endpoint: '/api/classes', method: 'GET', priority: 'high' },
      { name: '班级统计', endpoint: '/api/classes/statistics', method: 'GET', priority: 'medium' },
      
      // 家长管理API
      { name: '家长列表', endpoint: '/api/parents', method: 'GET', priority: 'high' },
      { name: '家长统计', endpoint: '/api/parents/statistics', method: 'GET', priority: 'medium' },
      
      // 活动管理API
      { name: '活动列表', endpoint: '/api/activities', method: 'GET', priority: 'high' },
      { name: '活动统计', endpoint: '/api/activities/statistics', method: 'GET', priority: 'medium' },
      
      // 招生管理API
      { name: '招生计划', endpoint: '/api/enrollment-plans', method: 'GET', priority: 'high' },
      { name: '招生申请', endpoint: '/api/enrollment-applications', method: 'GET', priority: 'high' },
      
      // 系统管理API
      { name: '系统日志', endpoint: '/api/system/logs', method: 'GET', priority: 'low' },
      { name: '系统配置', endpoint: '/api/system/configs', method: 'GET', priority: 'low' },
      
      // AI功能API
      { name: 'AI对话历史', endpoint: '/api/ai/conversations', method: 'GET', priority: 'medium' },
      { name: 'AI模型配置', endpoint: '/api/ai/models', method: 'GET', priority: 'medium' }
    ]
  }

  async runAllTests() {
    console.log('🚀 Starting API Data Loading Test...')
    console.log(`🔍 Testing ${this.apiEndpoints.length} API endpoints for data loading...\\n`)
    
    // 1. 获取认证令牌
    console.log('🔑 Authenticating with backend API...')
    const authSuccess = await this.authenticate()
    
    if (!authSuccess) {
      console.log('❌ Authentication failed. Cannot proceed with API testing.')
      return
    }
    
    console.log('✅ Authentication successful. Starting API tests...\\n')
    
    // 2. 按优先级分组测试
    const highPriorityAPIs = this.apiEndpoints.filter(api => api.priority === 'high')
    const mediumPriorityAPIs = this.apiEndpoints.filter(api => api.priority === 'medium')
    const lowPriorityAPIs = this.apiEndpoints.filter(api => api.priority === 'low')
    
    console.log('🔥 High Priority APIs:')
    await this.testAPIs(highPriorityAPIs)
    
    console.log('\\n📋 Medium Priority APIs:')
    await this.testAPIs(mediumPriorityAPIs)
    
    console.log('\\n📝 Low Priority APIs:')
    await this.testAPIs(lowPriorityAPIs)
    
    // 3. 生成测试报告
    this.generateTestReport()
  }

  async authenticate() {
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123'
      }
      
      const response = await this.makeAPIRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })
      
      if (response.status === 200) {
        const data = JSON.parse(response.data)
        if (data.success && data.data && data.data.token) {
          this.authToken = data.data.token
          console.log('🔑 JWT Token obtained successfully')
          return true
        }
      }
      
      console.log('❌ Authentication failed:', response.status, response.data)
      return false
    } catch (error) {
      console.log('❌ Authentication error:', error.message)
      return false
    }
  }

  async testAPIs(apis) {
    for (const api of apis) {
      await this.testAPI(api)
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  async testAPI(api) {
    try {
      const startTime = Date.now()
      const response = await this.makeAPIRequest(api.endpoint, {
        method: api.method,
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      const loadTime = Date.now() - startTime
      const analysis = this.analyzeAPIResponse(response, api)
      
      const result = {
        name: api.name,
        endpoint: api.endpoint,
        method: api.method,
        priority: api.priority,
        success: response.status === 200,
        status: response.status,
        loadTime,
        dataSize: response.data ? response.data.length : 0,
        analysis: analysis
      }
      
      this.testResults.push(result)
      this.logAPIResult(result)
      
    } catch (error) {
      const result = {
        name: api.name,
        endpoint: api.endpoint,
        method: api.method,
        priority: api.priority,
        success: false,
        error: error.message,
        status: 0,
        loadTime: 0,
        dataSize: 0,
        analysis: { hasData: false, hasError: true, errorType: 'network' }
      }
      
      this.testResults.push(result)
      this.logAPIResult(result)
    }
  }

  async makeAPIRequest(endpoint, options = {}) {
    const url = `${this.backendURL}${endpoint}`
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const requestOptions = {
        method: options.method || 'GET',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (API Data Loading Test)',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          ...options.headers
        }
      }
      
      const req = httpModule.request(url, requestOptions, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({ 
            status: res.statusCode, 
            data, 
            headers: res.headers 
          })
        })
      })
      
      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })
      
      if (options.body) {
        req.write(options.body)
      }
      
      req.end()
    })
  }

  analyzeAPIResponse(response, api) {
    const analysis = {
      hasData: false,
      hasError: false,
      dataCount: 0,
      responseFormat: 'unknown',
      errorType: null
    }
    
    try {
      if (response.status !== 200) {
        analysis.hasError = true
        analysis.errorType = `http_${response.status}`
        return analysis
      }
      
      const data = JSON.parse(response.data)
      analysis.responseFormat = 'json'
      
      // 检查响应格式
      if (data.success !== undefined) {
        analysis.responseFormat = 'standard_api'
        analysis.hasData = data.success && data.data !== null
        
        if (Array.isArray(data.data)) {
          analysis.dataCount = data.data.length
        } else if (data.data && typeof data.data === 'object') {
          if (data.data.items && Array.isArray(data.data.items)) {
            analysis.dataCount = data.data.items.length
          } else {
            analysis.dataCount = Object.keys(data.data).length
          }
        }
        
        if (!data.success) {
          analysis.hasError = true
          analysis.errorType = 'api_error'
        }
      } else {
        // 直接返回数据的格式
        analysis.hasData = true
        if (Array.isArray(data)) {
          analysis.dataCount = data.length
        } else if (typeof data === 'object') {
          analysis.dataCount = Object.keys(data).length
        }
      }
      
    } catch (error) {
      analysis.hasError = true
      analysis.errorType = 'json_parse'
      analysis.responseFormat = 'invalid_json'
    }
    
    return analysis
  }

  logAPIResult(result) {
    const icon = result.success ? '✅' : '❌'
    const name = result.name.padEnd(12)
    const endpoint = result.endpoint.padEnd(30)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const time = result.loadTime ? `${result.loadTime}ms` : '0ms'
    
    let statusInfo = ''
    if (result.success && result.analysis.hasData) {
      statusInfo = `📊${result.analysis.dataCount}条数据`
    } else if (result.success && !result.analysis.hasData) {
      statusInfo = '📄空数据'
    } else if (result.analysis.hasError) {
      statusInfo = `❌${result.analysis.errorType}`
    }
    
    console.log(`${icon} ${name} ${endpoint} ${status} ${time.padEnd(8)} ${statusInfo}`)
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    }
  }

  generateTestReport() {
    console.log('\\n' + '='.repeat(80))
    console.log('📊 API DATA LOADING TEST REPORT')
    console.log('='.repeat(80))
    
    const total = this.testResults.length
    const successful = this.testResults.filter(r => r.success).length
    const failed = total - successful
    const withData = this.testResults.filter(r => r.success && r.analysis.hasData).length
    const emptyData = this.testResults.filter(r => r.success && !r.analysis.hasData).length
    
    console.log('\\n📈 Overall Results:')
    console.log(`   Total API Endpoints: ${total}`)
    console.log(`   ✅ Successful: ${successful} (${((successful/total)*100).toFixed(1)}%)`)
    console.log(`   ❌ Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`)
    console.log(`   📊 With Data: ${withData} (${((withData/total)*100).toFixed(1)}%)`)
    console.log(`   📄 Empty Data: ${emptyData} (${((emptyData/total)*100).toFixed(1)}%)`)
    
    // 按优先级分析
    console.log('\\n🔍 Priority Analysis:')
    const priorities = ['high', 'medium', 'low']
    priorities.forEach(priority => {
      const priorityResults = this.testResults.filter(r => r.priority === priority)
      const prioritySuccess = priorityResults.filter(r => r.success).length
      const priorityWithData = priorityResults.filter(r => r.success && r.analysis.hasData).length
      
      console.log(`   ${priority.toUpperCase().padEnd(6)}: ${prioritySuccess}/${priorityResults.length} success, ${priorityWithData} with data`)
    })
    
    // 性能分析
    console.log('\\n⚡ Performance Analysis:')
    const successfulResults = this.testResults.filter(r => r.success)
    if (successfulResults.length > 0) {
      const avgLoadTime = successfulResults.reduce((sum, r) => sum + r.loadTime, 0) / successfulResults.length
      const maxLoadTime = Math.max(...successfulResults.map(r => r.loadTime))
      const minLoadTime = Math.min(...successfulResults.map(r => r.loadTime))
      
      console.log(`   Average Load Time: ${avgLoadTime.toFixed(0)}ms`)
      console.log(`   Max Load Time: ${maxLoadTime}ms`)
      console.log(`   Min Load Time: ${minLoadTime}ms`)
      console.log(`   Performance Status: ${avgLoadTime < 2000 ? '✅ Good' : '⚠️ Needs Improvement'}`)
    }
    
    // 错误分析
    const failedResults = this.testResults.filter(r => !r.success)
    if (failedResults.length > 0) {
      console.log('\\n❌ Failed API Endpoints:')
      failedResults.forEach(result => {
        const errorType = result.analysis ? result.analysis.errorType : (result.error || 'unknown')
        console.log(`   - ${result.name}: ${result.endpoint} (${errorType})`)
      })
    }
    
    // 数据丰富度分析
    console.log('\\n📊 Data Richness Analysis:')
    const dataResults = this.testResults.filter(r => r.success && r.analysis.hasData)
    if (dataResults.length > 0) {
      const totalDataCount = dataResults.reduce((sum, r) => sum + r.analysis.dataCount, 0)
      const avgDataCount = totalDataCount / dataResults.length
      
      console.log(`   Total Data Items: ${totalDataCount}`)
      console.log(`   Average per Endpoint: ${avgDataCount.toFixed(1)}`)
      console.log(`   Data Richness: ${dataResults.length}/${total} endpoints have data`)
    }
    
    // 最终评估
    const finalAssessment = this.getFinalAssessment(successful, withData, total)
    console.log('\\n🏆 Final Assessment:')
    console.log(`   API System Status: ${finalAssessment.status}`)
    console.log(`   ${finalAssessment.message}`)
    
    console.log('\\n' + '='.repeat(80))
  }

  getFinalAssessment(successful, withData, total) {
    const successRate = (successful / total) * 100
    const dataRate = (withData / total) * 100
    
    if (successRate >= 90 && dataRate >= 70) {
      return {
        status: 'EXCELLENT',
        message: '🎉 Excellent! APIs are working well with rich data.'
      }
    } else if (successRate >= 80 && dataRate >= 50) {
      return {
        status: 'GOOD',
        message: '👍 Good! Most APIs are working with adequate data.'
      }
    } else if (successRate >= 60 && dataRate >= 30) {
      return {
        status: 'FAIR',
        message: '⚠️ Fair. Some APIs need improvement.'
      }
    } else {
      return {
        status: 'POOR',
        message: '🚨 Poor. Major API issues need immediate attention.'
      }
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new APIDataLoadingTest()
  tester.runAllTests().catch(console.error)
}

module.exports = { APIDataLoadingTest }