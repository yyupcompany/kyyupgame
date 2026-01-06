/**
 * No-Proxy Frontend Test
 * 不使用代理的前端测试工具 - 直接测试前端页面状态
 */

const http = require('http')

class NoProxyFrontendTest {
  constructor() {
    this.frontendHost = '0.0.0.0'
    this.frontendPort = 5173
    this.backendHost = '0.0.0.0'
    this.backendPort = 3000
    this.results = []
    
    // 测试路由
    this.testRoutes = [
      { path: '/', name: 'Home', expected: ['首页', 'home', '欢迎'] },
      { path: '/dashboard', name: 'Dashboard', expected: ['仪表板', 'dashboard', '数据概览'] },
      { path: '/login', name: 'Login', expected: ['登录', 'login', '用户名'] },
      { path: '/system/users', name: 'Users', expected: ['用户管理', 'users', '用户列表'] },
      { path: '/student', name: 'Student', expected: ['学生管理', 'student', '学生列表'] },
      { path: '/teacher', name: 'Teacher', expected: ['教师管理', 'teacher', '教师列表'] },
      { path: '/class', name: 'Class', expected: ['班级管理', 'class', '班级列表'] },
      { path: '/parent', name: 'Parent', expected: ['家长管理', 'parent', '家长列表'] },
      { path: '/activity', name: 'Activity', expected: ['活动管理', 'activity', '活动列表'] }
    ]
  }

  async runTest() {
    console.log('🔍 Starting No-Proxy Frontend Test...')
    console.log('🎯 Testing frontend pages without proxy interference...\n')
    
    // 1. 测试后端健康状态
    console.log('📋 Step 1: Testing backend health...')
    const backendHealth = await this.testBackendHealth()
    
    // 2. 测试前端页面
    console.log('\n📋 Step 2: Testing frontend pages...')
    for (const route of this.testRoutes) {
      await this.testFrontendRoute(route)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // 3. 生成报告
    this.generateReport(backendHealth)
  }

  async testBackendHealth() {
    try {
      const response = await this.makeDirectRequest(this.backendHost, this.backendPort, '/api/health')
      console.log(`   Backend Health: ${response.status === 200 ? '✅ Healthy' : '❌ Unhealthy'} (${response.status})`)
      return response.status === 200
    } catch (error) {
      console.log(`   Backend Health: ❌ Error - ${error.message}`)
      return false
    }
  }

  async testFrontendRoute(route) {
    try {
      const response = await this.makeDirectRequest(this.frontendHost, this.frontendPort, route.path)
      
      const analysis = this.analyzeResponse(response, route.expected)
      const result = {
        route: route,
        status: response.status,
        contentLength: response.data.length,
        analysis: analysis,
        success: response.status === 200 && analysis.hasVueApp
      }
      
      this.results.push(result)
      this.logResult(result)
      
    } catch (error) {
      const result = {
        route: route,
        status: 0,
        error: error.message,
        success: false
      }
      
      this.results.push(result)
      this.logResult(result)
    }
  }

  async makeDirectRequest(host, port, path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: host,
        port: port,
        path: path,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'No-Proxy-Frontend-Test',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Connection': 'keep-alive'
        }
      }
      
      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          })
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

  analyzeResponse(response, expectedContent) {
    const analysis = {
      hasVueApp: false,
      hasRouterView: false,
      hasUniqueContent: false,
      matchedExpectedContent: [],
      pageTitle: '',
      contentType: response.headers['content-type'] || 'unknown'
    }
    
    if (!response.data) return analysis
    
    const lowerContent = response.data.toLowerCase()
    
    // 检查是否是HTML页面
    if (analysis.contentType.includes('text/html')) {
      // 检查Vue应用结构
      if (lowerContent.includes('vue') || lowerContent.includes('id="app"')) {
        analysis.hasVueApp = true
      }
      
      if (lowerContent.includes('router-view') || lowerContent.includes('routerview')) {
        analysis.hasRouterView = true
      }
      
      // 提取页面标题
      const titleMatch = response.data.match(/<title[^>]*>([^<]*)<\/title>/i)
      if (titleMatch) {
        analysis.pageTitle = titleMatch[1].trim()
      }
      
      // 检查预期内容
      if (expectedContent && expectedContent.length > 0) {
        analysis.matchedExpectedContent = expectedContent.filter(expected => 
          lowerContent.includes(expected.toLowerCase())
        )
        
        if (analysis.matchedExpectedContent.length > 0) {
          analysis.hasUniqueContent = true
        }
      }
    }
    
    return analysis
  }

  logResult(result) {
    const icon = result.success ? '✅' : '❌'
    const routeName = result.route.name.padEnd(12)
    const routePath = result.route.path.padEnd(20)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    
    let details = []
    if (result.analysis) {
      const analysis = result.analysis
      if (analysis.hasVueApp) details.push('Vue App')
      if (analysis.hasRouterView) details.push('Router View')
      if (analysis.hasUniqueContent) details.push('Unique Content')
      if (analysis.pageTitle) details.push(`Title: ${analysis.pageTitle}`)
      if (analysis.matchedExpectedContent.length > 0) {
        details.push(`Matched: ${analysis.matchedExpectedContent.join(', ')}`)
      }
    }
    
    console.log(`   ${icon} ${routeName} ${routePath} ${status}`)
    
    if (details.length > 0) {
      console.log(`        ${details.join(' | ')}`)
    }
    
    if (result.error) {
      console.log(`        Error: ${result.error}`)
    }
  }

  generateReport(backendHealth) {
    console.log('\n' + '='.repeat(80))
    console.log('🔍 NO-PROXY FRONTEND TEST REPORT')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const withVueApp = this.results.filter(r => r.analysis && r.analysis.hasVueApp).length
    const withUniqueContent = this.results.filter(r => r.analysis && r.analysis.hasUniqueContent).length
    
    console.log('\n📈 Test Results:')
    console.log(`   Backend Health: ${backendHealth ? '✅ Healthy' : '❌ Unhealthy'}`)
    console.log(`   Total Routes Tested: ${total}`)
    console.log(`   ✅ Successful: ${successful} (${((successful/total)*100).toFixed(1)}%)`)
    console.log(`   ❌ Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`)
    console.log(`   🔧 With Vue App: ${withVueApp} (${((withVueApp/total)*100).toFixed(1)}%)`)
    console.log(`   📊 With Unique Content: ${withUniqueContent} (${((withUniqueContent/total)*100).toFixed(1)}%)`)
    
    // 成功的路由
    const successfulRoutes = this.results.filter(r => r.success)
    if (successfulRoutes.length > 0) {
      console.log('\n✅ Successfully Loaded Routes:')
      successfulRoutes.forEach(result => {
        const details = []
        if (result.analysis.hasVueApp) details.push('Vue App')
        if (result.analysis.hasUniqueContent) details.push('Unique Content')
        console.log(`   - ${result.route.name} (${result.route.path}) - ${details.join(', ')}`)
      })
    }
    
    // 失败的路由
    const failedRoutes = this.results.filter(r => !r.success)
    if (failedRoutes.length > 0) {
      console.log('\n❌ Failed Routes:')
      failedRoutes.forEach(result => {
        const reason = result.error || 
          (result.status !== 200 ? `HTTP ${result.status}` : 'No Vue App')
        console.log(`   - ${result.route.name} (${result.route.path}): ${reason}`)
      })
    }
    
    // 诊断建议
    console.log('\n🔧 Diagnosis:')
    if (backendHealth) {
      console.log('   ✅ Backend API is healthy and accessible')
    } else {
      console.log('   ❌ Backend API is not accessible - check server logs')
    }
    
    if (withVueApp === 0) {
      console.log('   🚨 No Vue apps detected - frontend server may not be serving Vue content')
    } else if (withVueApp === total) {
      console.log('   ✅ All routes serve Vue applications')
    } else {
      console.log(`   ⚠️ Only ${withVueApp}/${total} routes serve Vue applications`)
    }
    
    if (withUniqueContent === 0) {
      console.log('   🚨 No unique content detected - all routes may be serving the same content')
    } else if (withUniqueContent < total * 0.5) {
      console.log('   ⚠️ Less than 50% of routes have unique content')
    } else {
      console.log('   ✅ Most routes have unique content')
    }
    
    console.log('\n' + '='.repeat(80))
  }
}

// 运行测试
if (require.main === module) {
  const test = new NoProxyFrontendTest()
  test.runTest().catch(console.error)
}

module.exports = { NoProxyFrontendTest }