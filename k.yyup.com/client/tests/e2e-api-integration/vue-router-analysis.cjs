/**
 * Vue Router Analysis Tool
 * Vue路由分析工具 - 检查SPA路由配置和404处理
 */

const http = require('http')
const https = require('https')

class VueRouterAnalysis {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.results = []
    this.routerConfig = null
    
    this.testRoutes = [
      // 存在的路由
      { path: '/', type: 'exists', expected: 'valid_route' },
      { path: '/login', type: 'exists', expected: 'valid_route' },
      { path: '/dashboard', type: 'exists', expected: 'valid_route' },
      { path: '/system/users', type: 'exists', expected: 'valid_route' },
      { path: '/student', type: 'exists', expected: 'valid_route' },
      { path: '/teacher', type: 'exists', expected: 'valid_route' },
      
      // 不存在的路由
      { path: '/non-existent', type: 'missing', expected: '404_route' },
      { path: '/fake-page', type: 'missing', expected: '404_route' },
      { path: '/admin/secret', type: 'missing', expected: '404_route' },
      { path: '/system/fake', type: 'missing', expected: '404_route' },
      { path: '/student/fake', type: 'missing', expected: '404_route' },
      
      // 动态路由测试
      { path: '/student/detail/999', type: 'dynamic', expected: 'dynamic_route' },
      { path: '/teacher/detail/999', type: 'dynamic', expected: 'dynamic_route' },
      { path: '/class/detail/999', type: 'dynamic', expected: 'dynamic_route' },
      
      // 特殊路由
      { path: '/404', type: 'special', expected: '404_page' },
      { path: '/403', type: 'special', expected: '403_page' }
    ]
  }

  async runVueRouterAnalysis() {
    console.log('🔍 Starting Vue Router Analysis...')
    console.log('📋 Analyzing SPA routing configuration and 404 handling...\\n')
    
    // 1. 首先获取主页面，分析Vue Router配置
    console.log('🏠 Step 1: Analyzing main application structure...')
    await this.analyzeMainApplication()
    
    // 2. 测试各种路由
    console.log('\\n🧪 Step 2: Testing route handling...')
    await this.testRouteHandling()
    
    // 3. 检查404处理机制
    console.log('\\n🔄 Step 3: Analyzing 404 handling mechanism...')
    await this.analyze404Handling()
    
    // 4. 生成分析报告
    this.generateVueRouterReport()
  }

  async analyzeMainApplication() {
    try {
      const response = await this.makeRequest('/')
      const analysis = this.analyzeVueApplication(response.data)
      
      console.log('📊 Main Application Analysis:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Content Length: ${response.data.length} bytes`)
      console.log(`   Has Vue App: ${analysis.hasVueApp ? '✅' : '❌'}`)
      console.log(`   Has Router: ${analysis.hasRouter ? '✅' : '❌'}`)
      console.log(`   Has Auth: ${analysis.hasAuth ? '✅' : '❌'}`)
      console.log(`   Router Mode: ${analysis.routerMode}`)
      console.log(`   Base URL: ${analysis.baseURL}`)
      
      this.routerConfig = analysis
      
    } catch (error) {
      console.log('❌ Failed to analyze main application:', error.message)
    }
  }

  async testRouteHandling() {
    for (const route of this.testRoutes) {
      await this.testRoute(route)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  async testRoute(route) {
    try {
      const url = `${this.frontendURL}${route.path}`
      const response = await this.makeRequest(url)
      const analysis = this.analyzeRouteResponse(response, route)
      
      const result = {
        path: route.path,
        type: route.type,
        expected: route.expected,
        actual: analysis.routeType,
        status: response.status,
        success: this.isExpectedRouteResult(analysis, route.expected),
        analysis: analysis
      }
      
      this.results.push(result)
      this.logRouteResult(result)
      
    } catch (error) {
      const result = {
        path: route.path,
        type: route.type,
        expected: route.expected,
        actual: 'error',
        status: 0,
        success: false,
        error: error.message,
        analysis: { routeType: 'error' }
      }
      
      this.results.push(result)
      this.logRouteResult(result)
    }
  }

  async analyze404Handling() {
    const test404Routes = [
      '/definitely-not-exists',
      '/system/definitely-not-exists',
      '/student/definitely-not-exists/123',
      '/admin/super-secret-page',
      '/api/fake-endpoint'
    ]
    
    console.log('🔍 Testing 404 handling with guaranteed non-existent routes...')
    
    for (const path of test404Routes) {
      const url = `${this.frontendURL}${path}`
      try {
        const response = await this.makeRequest(url)
        const analysis = this.analyzeRouteResponse(response, { path, type: '404_test' })
        
        console.log(`   ${path}: ${response.status} -> ${analysis.routeType}`)
        
        if (analysis.routeType !== '404_route' && analysis.routeType !== '404_content') {
          console.log(`     ⚠️ Expected 404, got ${analysis.routeType}`)
        }
        
      } catch (error) {
        console.log(`   ${path}: Error -> ${error.message}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Vue Router Analysis Tool)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Connection': 'keep-alive'
        }
      }, (res) => {
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
      
      req.end()
    })
  }

  analyzeVueApplication(content) {
    const analysis = {
      hasVueApp: false,
      hasRouter: false,
      hasAuth: false,
      routerMode: 'unknown',
      baseURL: 'unknown',
      routerConfig: null
    }
    
    if (!content) return analysis
    
    const lowerContent = content.toLowerCase()
    
    // 检查Vue应用
    if (lowerContent.includes('vue') || lowerContent.includes('id="app"')) {
      analysis.hasVueApp = true
    }
    
    // 检查Vue Router
    if (lowerContent.includes('vue-router') || lowerContent.includes('router')) {
      analysis.hasRouter = true
    }
    
    // 检查认证
    if (lowerContent.includes('auth') || lowerContent.includes('login') || lowerContent.includes('token')) {
      analysis.hasAuth = true
    }
    
    // 尝试分析路由模式
    if (lowerContent.includes('history') || lowerContent.includes('createwebhistory')) {
      analysis.routerMode = 'history'
    } else if (lowerContent.includes('hash') || lowerContent.includes('createwebhashhistory')) {
      analysis.routerMode = 'hash'
    }
    
    // 检查基础URL
    const baseMatch = content.match(/base\\s*:\\s*['"]([^'"]+)['"]/)
    if (baseMatch) {
      analysis.baseURL = baseMatch[1]
    }
    
    return analysis
  }

  analyzeRouteResponse(response, route) {
    const analysis = {
      routeType: 'unknown',
      is404: false,
      isVueApp: false,
      hasContent: false,
      hasAuth: false,
      routerData: null
    }
    
    if (!response.data) {
      analysis.routeType = 'empty'
      return analysis
    }
    
    const content = response.data
    const lowerContent = content.toLowerCase()
    
    // 检查HTTP状态
    if (response.status === 404) {
      analysis.routeType = '404_http'
      analysis.is404 = true
      return analysis
    }
    
    // 检查Vue应用
    if (lowerContent.includes('vue') || lowerContent.includes('id="app"')) {
      analysis.isVueApp = true
    }
    
    // 检查404内容
    const notFoundPatterns = [
      '404',
      'page not found',
      '页面不存在',
      '页面未找到',
      '您访问的页面不存在',
      '抱歉，你访问的页面不存在',
      'not found',
      '找不到页面'
    ]
    
    const has404Content = notFoundPatterns.some(pattern => 
      lowerContent.includes(pattern.toLowerCase())
    )
    
    if (has404Content) {
      analysis.routeType = '404_content'
      analysis.is404 = true
      return analysis
    }
    
    // 检查登录相关
    if (lowerContent.includes('login') || lowerContent.includes('登录')) {
      analysis.routeType = 'login'
      analysis.hasAuth = true
    }
    
    // 检查是否有实际内容
    const contentPatterns = [
      'el-table',
      'el-form',
      'el-button',
      'el-menu',
      'table',
      'form',
      'button',
      'nav',
      'header',
      'main',
      'sidebar'
    ]
    
    const hasRealContent = contentPatterns.some(pattern => 
      lowerContent.includes(pattern)
    )
    
    if (hasRealContent) {
      analysis.hasContent = true
      analysis.routeType = 'content_page'
    }
    
    // 如果是Vue应用但没有特定内容，可能是SPA fallback
    if (analysis.isVueApp && !analysis.hasContent && !analysis.is404 && !analysis.hasAuth) {
      analysis.routeType = 'spa_fallback'
    }
    
    return analysis
  }

  isExpectedRouteResult(analysis, expected) {
    switch (expected) {
      case 'valid_route':
        return analysis.routeType === 'content_page' || analysis.routeType === 'login'
      case '404_route':
        return analysis.routeType === '404_content' || analysis.routeType === '404_http'
      case 'dynamic_route':
        return analysis.routeType === 'content_page' || analysis.routeType === '404_content'
      case '404_page':
        return analysis.routeType === '404_content'
      case '403_page':
        return analysis.routeType === '403_content'
      default:
        return false
    }
  }

  logRouteResult(result) {
    const icon = result.success ? '✅' : '❌'
    const path = result.path.padEnd(25)
    const type = result.type.padEnd(10)
    const expected = result.expected.padEnd(15)
    const actual = result.actual.padEnd(15)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    
    console.log(`   ${icon} ${path} ${type} ${status} Expected: ${expected} Actual: ${actual}`)
  }

  generateVueRouterReport() {
    console.log('\\n' + '='.repeat(80))
    console.log('🔍 VUE ROUTER ANALYSIS REPORT')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    
    console.log('\\n📈 Overall Results:')
    console.log(`   Total Routes Tested: ${total}`)
    console.log(`   Expected Behavior: ${successful} (${((successful/total)*100).toFixed(1)}%)`)
    console.log(`   Unexpected Behavior: ${failed} (${((failed/total)*100).toFixed(1)}%)`)
    
    // 按路由类型分析
    console.log('\\n📊 Route Type Analysis:')
    const routeTypes = ['exists', 'missing', 'dynamic', 'special']
    routeTypes.forEach(type => {
      const typeResults = this.results.filter(r => r.type === type)
      const typeSuccess = typeResults.filter(r => r.success).length
      console.log(`   ${type.toUpperCase().padEnd(8)}: ${typeSuccess}/${typeResults.length} expected behavior`)
    })
    
    // 实际路由类型分析
    console.log('\\n🔍 Actual Route Response Analysis:')
    const actualTypes = {}
    this.results.forEach(r => {
      if (!actualTypes[r.actual]) actualTypes[r.actual] = 0
      actualTypes[r.actual]++
    })
    
    Object.entries(actualTypes).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(15)}: ${count} routes`)
    })
    
    // 404处理问题分析
    const missing404s = this.results.filter(r => r.type === 'missing' && !r.success)
    if (missing404s.length > 0) {
      console.log('\\n🔄 404 Handling Issues:')
      console.log(`   ${missing404s.length} routes that should return 404 but don't`)
      missing404s.forEach(r => {
        console.log(`   - ${r.path}: returns ${r.actual} instead of 404`)
      })
    }
    
    // SPA Fallback分析
    const spaFallbacks = this.results.filter(r => r.analysis.routeType === 'spa_fallback')
    if (spaFallbacks.length > 0) {
      console.log('\\n🎯 SPA Fallback Behavior:')
      console.log(`   ${spaFallbacks.length} routes are falling back to main Vue app`)
      console.log('   This suggests the web server is configured to serve index.html for all routes')
      spaFallbacks.forEach(r => {
        console.log(`   - ${r.path}: SPA fallback`)
      })
    }
    
    // 路由配置分析
    if (this.routerConfig) {
      console.log('\\n⚙️ Router Configuration:')
      console.log(`   Vue App: ${this.routerConfig.hasVueApp ? '✅' : '❌'}`)
      console.log(`   Router: ${this.routerConfig.hasRouter ? '✅' : '❌'}`)
      console.log(`   Auth: ${this.routerConfig.hasAuth ? '✅' : '❌'}`)
      console.log(`   Mode: ${this.routerConfig.routerMode}`)
      console.log(`   Base URL: ${this.routerConfig.baseURL}`)
    }
    
    // 问题诊断
    console.log('\\n🔧 Problem Diagnosis:')
    if (missing404s.length > 0) {
      console.log('   ❌ Issue: Missing 404 handling')
      console.log('     - Vue Router is not properly configured for 404 routes')
      console.log('     - All routes fall back to main Vue application')
      console.log('     - This causes the "页面不存在" issue you reported')
    }
    
    if (spaFallbacks.length > 0) {
      console.log('   ⚠️ Issue: SPA fallback behavior')
      console.log('     - Web server serves index.html for all routes')
      console.log('     - Vue Router should handle 404s on client-side')
      console.log('     - Need to configure catch-all route: { path: "/:pathMatch(.*)*", component: NotFound }')
    }
    
    // 解决方案建议
    console.log('\\n💡 Solutions:')
    console.log('   1. Configure Vue Router catch-all route for 404 handling')
    console.log('   2. Check if 404.vue component is properly imported')
    console.log('   3. Verify route configuration in optimized-routes.ts')
    console.log('   4. Test client-side routing vs server-side routing')
    console.log('   5. Consider authentication redirects for protected routes')
    
    // 最终评估
    const finalAssessment = this.getFinalAssessment(successful, missing404s.length, total)
    console.log('\\n🏆 Final Assessment:')
    console.log(`   Router Configuration Status: ${finalAssessment.status}`)
    console.log(`   ${finalAssessment.message}`)
    
    console.log('\\n' + '='.repeat(80))
  }

  getFinalAssessment(successful, missing404s, total) {
    const successRate = (successful / total) * 100
    
    if (missing404s === 0 && successRate >= 90) {
      return {
        status: 'EXCELLENT',
        message: '🎉 Perfect! Vue Router is configured correctly.'
      }
    } else if (missing404s <= 2 && successRate >= 80) {
      return {
        status: 'GOOD',
        message: '👍 Good! Minor routing issues detected.'
      }
    } else if (missing404s <= 5 && successRate >= 60) {
      return {
        status: 'FAIR',
        message: '⚠️ Fair. Some routing configuration issues.'
      }
    } else {
      return {
        status: 'POOR',
        message: '🚨 Poor! Major routing configuration problems detected.'
      }
    }
  }
}

// 运行Vue Router分析
if (require.main === module) {
  const analyzer = new VueRouterAnalysis()
  analyzer.runVueRouterAnalysis().catch(console.error)
}

module.exports = { VueRouterAnalysis }