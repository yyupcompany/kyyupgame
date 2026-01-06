/**
 * 404 Fix Verification Test
 * 404修复验证测试
 */

const http = require('http')
const https = require('https')

class NotFoundFixVerification {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.testResults = []
    
    // 测试用例：应该显示404页面的路由
    this.notFoundRoutes = [
      { path: '/non-existent', description: '完全不存在的路由' },
      { path: '/fake-page', description: '虚假页面路由' },
      { path: '/admin/secret', description: '管理员密钥页面' },
      { path: '/system/fake', description: '系统模块虚假页面' },
      { path: '/student/fake', description: '学生模块虚假页面' },
      { path: '/definitely-not-exists', description: '绝对不存在的页面' },
      { path: '/test/404/path', description: '测试404路径' }
    ]
    
    // 测试用例：应该正常显示的路由
    this.validRoutes = [
      { path: '/', description: '首页' },
      { path: '/login', description: '登录页' },
      { path: '/dashboard', description: '仪表板' },
      { path: '/system/users', description: '用户管理' },
      { path: '/student', description: '学生管理' },
      { path: '/404', description: '404页面（直接访问）' },
      { path: '/403', description: '403页面（直接访问）' }
    ]
  }

  async runFixVerification() {
    console.log('🔧 Starting 404 Fix Verification...')
    console.log('🎯 Testing Vue Router 404 handling after fix...\\n')
    
    // 测试应该返回404的路由
    console.log('🔍 Testing routes that should return 404:')
    for (const route of this.notFoundRoutes) {
      await this.testNotFoundRoute(route)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    console.log('\\n✅ Testing routes that should work normally:')
    for (const route of this.validRoutes) {
      await this.testValidRoute(route)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    this.generateFixVerificationReport()
  }

  async testNotFoundRoute(route) {
    try {
      const url = `${this.frontendURL}${route.path}`
      const response = await this.makeRequest(url)
      const analysis = this.analyze404Response(response)
      
      const result = {
        path: route.path,
        description: route.description,
        expectedType: '404_page',
        actualType: analysis.pageType,
        success: analysis.is404Page,
        status: response.status,
        details: analysis.details
      }
      
      this.testResults.push(result)
      this.log404TestResult(result)
      
    } catch (error) {
      const result = {
        path: route.path,
        description: route.description,
        expectedType: '404_page',
        actualType: 'network_error',
        success: false,
        status: 0,
        error: error.message
      }
      
      this.testResults.push(result)
      this.log404TestResult(result)
    }
  }

  async testValidRoute(route) {
    try {
      const url = `${this.frontendURL}${route.path}`
      const response = await this.makeRequest(url)
      const analysis = this.analyze404Response(response)
      
      const result = {
        path: route.path,
        description: route.description,
        expectedType: 'valid_page',
        actualType: analysis.pageType,
        success: !analysis.is404Page && response.status === 200,
        status: response.status,
        details: analysis.details
      }
      
      this.testResults.push(result)
      this.logValidTestResult(result)
      
    } catch (error) {
      const result = {
        path: route.path,
        description: route.description,
        expectedType: 'valid_page',
        actualType: 'network_error',
        success: false,
        status: 0,
        error: error.message
      }
      
      this.testResults.push(result)
      this.logValidTestResult(result)
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
          'User-Agent': 'Mozilla/5.0 (404 Fix Verification)',
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

  analyze404Response(response) {
    const analysis = {
      pageType: 'unknown',
      is404Page: false,
      details: []
    }
    
    if (!response.data) {
      analysis.pageType = 'empty_response'
      analysis.details.push('Empty response')
      return analysis
    }
    
    const content = response.data
    const lowerContent = content.toLowerCase()
    
    // 检查HTTP状态码
    if (response.status === 404) {
      analysis.pageType = '404_http'
      analysis.is404Page = true
      analysis.details.push('HTTP 404 status')
      return analysis
    }
    
    // 检查404页面内容
    const notFoundPatterns = [
      { pattern: '页面不存在', name: '中文404标题' },
      { pattern: '您访问的页面不存在', name: '中文404描述' },
      { pattern: 'page not found', name: '英文404标题' },
      { pattern: '404', name: '404数字' },
      { pattern: 'not found', name: '英文not found' },
      { pattern: '找不到页面', name: '中文找不到页面' },
      { pattern: '抱歉，你访问的页面不存在', name: '中文道歉信息' }
    ]
    
    const foundPatterns = notFoundPatterns.filter(p => 
      lowerContent.includes(p.pattern.toLowerCase())
    )
    
    if (foundPatterns.length > 0) {
      analysis.pageType = '404_content'
      analysis.is404Page = true
      analysis.details.push(`发现404内容: ${foundPatterns.map(p => p.name).join(', ')}`)
      return analysis
    }
    
    // 检查Vue组件类名
    if (lowerContent.includes('error-page') || lowerContent.includes('error-container')) {
      analysis.pageType = '404_component'
      analysis.is404Page = true
      analysis.details.push('检测到错误页面组件')
      return analysis
    }
    
    // 检查Vue应用但没有404内容
    if (lowerContent.includes('vue') || lowerContent.includes('id="app"')) {
      analysis.pageType = 'vue_app'
      analysis.details.push('检测到Vue应用')
      
      // 检查是否有实际内容
      const contentPatterns = ['table', 'form', 'button', 'menu', 'nav', 'el-']
      const hasContent = contentPatterns.some(pattern => lowerContent.includes(pattern))
      
      if (hasContent) {
        analysis.pageType = 'vue_content'
        analysis.details.push('Vue应用包含实际内容')
      } else {
        analysis.pageType = 'vue_empty'
        analysis.details.push('Vue应用但内容为空')
      }
    }
    
    // 检查是否是登录页面
    if (lowerContent.includes('login') || lowerContent.includes('登录')) {
      analysis.pageType = 'login_page'
      analysis.details.push('检测到登录页面')
    }
    
    return analysis
  }

  log404TestResult(result) {
    const icon = result.success ? '✅' : '❌'
    const path = result.path.padEnd(25)
    const description = result.description.padEnd(20)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const actualType = result.actualType.padEnd(15)
    
    console.log(`   ${icon} ${path} ${description} ${status} ${actualType}`)
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`        📝 ${detail}`)
      })
    }
    
    if (result.error) {
      console.log(`        ❌ Error: ${result.error}`)
    }
  }

  logValidTestResult(result) {
    const icon = result.success ? '✅' : '❌'
    const path = result.path.padEnd(25)
    const description = result.description.padEnd(20)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const actualType = result.actualType.padEnd(15)
    
    console.log(`   ${icon} ${path} ${description} ${status} ${actualType}`)
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`        📝 ${detail}`)
      })
    }
    
    if (result.error) {
      console.log(`        ❌ Error: ${result.error}`)
    }
  }

  generateFixVerificationReport() {
    console.log('\\n' + '='.repeat(80))
    console.log('🔧 404 FIX VERIFICATION REPORT')
    console.log('='.repeat(80))
    
    const totalTests = this.testResults.length
    const successfulTests = this.testResults.filter(r => r.success).length
    const failedTests = this.testResults.filter(r => !r.success).length
    
    // 分类统计
    const notFoundTests = this.testResults.filter(r => r.expectedType === '404_page')
    const validTests = this.testResults.filter(r => r.expectedType === 'valid_page')
    
    const notFoundSuccess = notFoundTests.filter(r => r.success).length
    const validSuccess = validTests.filter(r => r.success).length
    
    console.log('\\n📈 Overall Results:')
    console.log(`   Total Tests: ${totalTests}`)
    console.log(`   ✅ Successful: ${successfulTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`)
    console.log(`   ❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`)
    
    console.log('\\n🔍 Test Category Results:')
    console.log(`   404 Route Tests: ${notFoundSuccess}/${notFoundTests.length} (${((notFoundSuccess/notFoundTests.length)*100).toFixed(1)}%)`)
    console.log(`   Valid Route Tests: ${validSuccess}/${validTests.length} (${((validSuccess/validTests.length)*100).toFixed(1)}%)`)
    
    // 失败测试详情
    const failedResults = this.testResults.filter(r => !r.success)
    if (failedResults.length > 0) {
      console.log('\\n❌ Failed Tests:')
      failedResults.forEach(result => {
        console.log(`   - ${result.path}: Expected ${result.expectedType}, got ${result.actualType}`)
      })
    }
    
    // 成功的404测试
    const successful404 = this.testResults.filter(r => r.expectedType === '404_page' && r.success)
    if (successful404.length > 0) {
      console.log('\\n✅ Successfully Fixed 404 Routes:')
      successful404.forEach(result => {
        console.log(`   - ${result.path}: ${result.description}`)
      })
    }
    
    // 修复状态评估
    const fixStatus = this.evaluateFixStatus(notFoundSuccess, notFoundTests.length)
    console.log('\\n🏆 Fix Status Assessment:')
    console.log(`   404 Fix Status: ${fixStatus.status}`)
    console.log(`   ${fixStatus.message}`)
    
    // 下一步建议
    console.log('\\n💡 Next Steps:')
    if (notFoundSuccess === notFoundTests.length) {
      console.log('   🎉 Perfect! All 404 routes are working correctly.')
      console.log('   ✅ The Vue Router 404 handling has been successfully fixed.')
      console.log('   🔄 Users will now see proper 404 pages for non-existent routes.')
    } else {
      console.log('   🔧 Some 404 routes still need attention:')
      console.log('   1. Check if the frontend server is running')
      console.log('   2. Verify the route configuration is loaded correctly')
      console.log('   3. Clear browser cache and test again')
      console.log('   4. Check for any conflicting route definitions')
    }
    
    console.log('\\n' + '='.repeat(80))
  }

  evaluateFixStatus(success, total) {
    const successRate = (success / total) * 100
    
    if (successRate >= 100) {
      return {
        status: 'PERFECT',
        message: '🎉 Perfect! All 404 routes are working correctly.'
      }
    } else if (successRate >= 80) {
      return {
        status: 'GOOD',
        message: '👍 Good! Most 404 routes are working, minor issues remain.'
      }
    } else if (successRate >= 50) {
      return {
        status: 'PARTIAL',
        message: '⚠️ Partial fix. Some 404 routes work, others need attention.'
      }
    } else {
      return {
        status: 'FAILED',
        message: '🚨 Fix failed. 404 routes are still not working properly.'
      }
    }
  }
}

// 运行404修复验证
if (require.main === module) {
  const verifier = new NotFoundFixVerification()
  verifier.runFixVerification().catch(console.error)
}

module.exports = { NotFoundFixVerification }