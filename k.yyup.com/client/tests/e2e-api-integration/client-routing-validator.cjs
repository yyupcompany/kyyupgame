/**
 * Client-Side Routing Validator
 * 客户端路由验证器 - 检查Vue Router是否正确处理不同路由
 */

const http = require('http')
const https = require('https')

class ClientRoutingValidator {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.results = []
    
    // 测试路由和预期的唯一内容标识
    this.testRoutes = [
      { 
        path: '/', 
        name: 'Home',
        expectedContent: ['首页', 'home', '欢迎', 'welcome'],
        expectedTitle: '首页'
      },
      { 
        path: '/dashboard', 
        name: 'Dashboard',
        expectedContent: ['仪表板', 'dashboard', '数据概览', '园所数据', '统计'],
        expectedTitle: '仪表板'
      },
      { 
        path: '/login', 
        name: 'Login',
        expectedContent: ['登录', 'login', '用户名', 'username', '密码', 'password'],
        expectedTitle: '登录'
      },
      { 
        path: '/system/users', 
        name: 'Users',
        expectedContent: ['用户管理', 'users', '用户列表', 'user'],
        expectedTitle: '用户管理'
      },
      { 
        path: '/student', 
        name: 'Student',
        expectedContent: ['学生管理', 'student', '学生列表', '学生信息'],
        expectedTitle: '学生管理'
      },
      { 
        path: '/teacher', 
        name: 'Teacher',
        expectedContent: ['教师管理', 'teacher', '教师列表', '教师信息'],
        expectedTitle: '教师管理'
      },
      { 
        path: '/class', 
        name: 'Class',
        expectedContent: ['班级管理', 'class', '班级列表', '班级信息'],
        expectedTitle: '班级管理'
      },
      { 
        path: '/parent', 
        name: 'Parent',
        expectedContent: ['家长管理', 'parent', '家长列表', '家长信息'],
        expectedTitle: '家长管理'
      },
      { 
        path: '/activity', 
        name: 'Activity',
        expectedContent: ['活动管理', 'activity', '活动列表', '活动信息'],
        expectedTitle: '活动管理'
      },
      { 
        path: '/non-existent', 
        name: 'NonExistent',
        expectedContent: ['404', '页面不存在', 'not found', '找不到页面'],
        expectedTitle: '404'
      }
    ]
  }

  async runClientRoutingValidation() {
    console.log('🔍 Starting Client-Side Routing Validation...')
    console.log('🎯 Testing if Vue Router loads different content for different routes...\\n')
    
    // 获取基准响应（用于对比）
    console.log('📋 Step 1: Getting baseline response...')
    const baselineResponse = await this.getBaselineResponse()
    
    console.log('\\n📋 Step 2: Testing individual routes...')
    
    for (const route of this.testRoutes) {
      await this.testRoute(route, baselineResponse)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    console.log('\\n📋 Step 3: Analyzing content uniqueness...')
    this.analyzeContentUniqueness()
    
    this.generateRoutingValidationReport()
  }

  async getBaselineResponse() {
    try {
      const response = await this.makeRequest('/')
      const analysis = this.analyzeRouteContent(response.data, '/')
      
      console.log('📊 Baseline Analysis:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Content Length: ${response.data.length} bytes`)
      console.log(`   Content Hash: ${this.hashContent(response.data)}`)
      console.log(`   Has Vue App: ${analysis.hasVueApp ? '✅' : '❌'}`)
      console.log(`   Has Router View: ${analysis.hasRouterView ? '✅' : '❌'}`)
      console.log(`   Has Unique Content: ${analysis.hasUniqueContent ? '✅' : '❌'}`)
      
      return {
        status: response.status,
        data: response.data,
        contentHash: this.hashContent(response.data),
        contentLength: response.data.length,
        analysis: analysis
      }
      
    } catch (error) {
      console.log('❌ Failed to get baseline response:', error.message)
      return null
    }
  }

  async testRoute(route, baseline) {
    try {
      const response = await this.makeRequest(route.path)
      const analysis = this.analyzeRouteContent(response.data, route.path, route.expectedContent)
      
      // 检查内容是否与基线不同
      const contentHash = this.hashContent(response.data)
      const isDifferentFromBaseline = baseline ? contentHash !== baseline.contentHash : true
      
      const result = {
        route: route,
        status: response.status,
        contentLength: response.data.length,
        contentHash: contentHash,
        isDifferentFromBaseline: isDifferentFromBaseline,
        analysis: analysis,
        success: this.evaluateRouteSuccess(route, response, analysis, isDifferentFromBaseline)
      }
      
      this.results.push(result)
      this.logRouteValidationResult(result)
      
    } catch (error) {
      const result = {
        route: route,
        status: 0,
        error: error.message,
        success: false,
        analysis: { hasError: true }
      }
      
      this.results.push(result)
      this.logRouteValidationResult(result)
    }
  }

  async makeRequest(path) {
    const url = `${this.frontendURL}${path}`
    
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Client Routing Validator)',
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

  analyzeRouteContent(content, path, expectedContent = []) {
    const analysis = {
      hasVueApp: false,
      hasRouterView: false,
      hasUniqueContent: false,
      matchedExpectedContent: [],
      pageTitle: '',
      componentClasses: [],
      pageIdentifiers: []
    }
    
    if (!content) return analysis
    
    const lowerContent = content.toLowerCase()
    
    // 检查Vue应用结构
    if (lowerContent.includes('vue') || lowerContent.includes('id="app"')) {
      analysis.hasVueApp = true
    }
    
    if (lowerContent.includes('router-view') || lowerContent.includes('routerview')) {
      analysis.hasRouterView = true
    }
    
    // 提取页面标题
    const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i)
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
    
    // 检查CSS类名（可能包含页面标识）
    const classMatches = content.match(/class="([^"]*)"/g)
    if (classMatches) {
      analysis.componentClasses = classMatches
        .map(match => match.replace(/class="([^"]*)"/, '$1'))
        .filter(cls => cls.includes('page') || cls.includes('container') || cls.includes('dashboard') || cls.includes('login'))
    }
    
    // 检查页面特定的标识符
    const pageIdentifiers = [
      'dashboard-container',
      'login-container',
      'user-management',
      'student-management',
      'teacher-management',
      'class-management',
      'parent-management',
      'activity-management',
      'error-page',
      'not-found'
    ]
    
    analysis.pageIdentifiers = pageIdentifiers.filter(identifier => 
      lowerContent.includes(identifier.toLowerCase())
    )
    
    if (analysis.pageIdentifiers.length > 0) {
      analysis.hasUniqueContent = true
    }
    
    return analysis
  }

  evaluateRouteSuccess(route, response, analysis, isDifferentFromBaseline) {
    // 对于404路由，期望找到404相关内容
    if (route.path === '/non-existent') {
      return analysis.hasUniqueContent && analysis.matchedExpectedContent.length > 0
    }
    
    // 对于正常路由，期望有唯一内容且与基线不同
    return response.status === 200 && 
           analysis.hasUniqueContent && 
           (isDifferentFromBaseline || analysis.matchedExpectedContent.length > 0)
  }

  hashContent(content) {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }

  logRouteValidationResult(result) {
    const icon = result.success ? '✅' : '❌'
    const routeName = result.route.name.padEnd(12)
    const routePath = result.route.path.padEnd(25)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    
    let details = []
    if (result.analysis) {
      if (result.analysis.hasUniqueContent) {
        details.push('📊唯一内容')
      }
      if (result.analysis.matchedExpectedContent.length > 0) {
        details.push(`🎯匹配内容: ${result.analysis.matchedExpectedContent.join(', ')}`)
      }
      if (result.analysis.pageTitle) {
        details.push(`📝标题: ${result.analysis.pageTitle}`)
      }
      if (result.analysis.pageIdentifiers.length > 0) {
        details.push(`🔍标识符: ${result.analysis.pageIdentifiers.join(', ')}`)
      }
    }
    
    console.log(`   ${icon} ${routeName} ${routePath} ${status}`)
    
    if (details.length > 0) {
      details.forEach(detail => {
        console.log(`        ${detail}`)
      })
    }
    
    if (result.error) {
      console.log(`        ❌ Error: ${result.error}`)
    }
  }

  analyzeContentUniqueness() {
    console.log('🔍 Content Uniqueness Analysis:')
    
    const contentHashes = {}
    const duplicateContent = []
    
    this.results.forEach(result => {
      if (result.contentHash) {
        if (!contentHashes[result.contentHash]) {
          contentHashes[result.contentHash] = []
        }
        contentHashes[result.contentHash].push(result.route.path)
      }
    })
    
    Object.entries(contentHashes).forEach(([hash, paths]) => {
      if (paths.length > 1) {
        duplicateContent.push({ hash, paths })
      }
    })
    
    if (duplicateContent.length > 0) {
      console.log('   ⚠️ Found duplicate content:')
      duplicateContent.forEach(dup => {
        console.log(`     Hash ${dup.hash}: ${dup.paths.join(', ')}`)
      })
    } else {
      console.log('   ✅ All routes have unique content')
    }
  }

  generateRoutingValidationReport() {
    console.log('\\n' + '='.repeat(80))
    console.log('🔍 CLIENT-SIDE ROUTING VALIDATION REPORT')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const withUniqueContent = this.results.filter(r => r.analysis && r.analysis.hasUniqueContent).length
    const withExpectedContent = this.results.filter(r => r.analysis && r.analysis.matchedExpectedContent.length > 0).length
    
    console.log('\\n📈 Overall Results:')
    console.log(`   Total Routes Tested: ${total}`)
    console.log(`   ✅ Successful: ${successful} (${((successful/total)*100).toFixed(1)}%)`)
    console.log(`   ❌ Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`)
    console.log(`   📊 With Unique Content: ${withUniqueContent} (${((withUniqueContent/total)*100).toFixed(1)}%)`)
    console.log(`   🎯 With Expected Content: ${withExpectedContent} (${((withExpectedContent/total)*100).toFixed(1)}%)`)
    
    // 成功的路由
    const successfulRoutes = this.results.filter(r => r.success)
    if (successfulRoutes.length > 0) {
      console.log('\\n✅ Successfully Validated Routes:')
      successfulRoutes.forEach(result => {
        console.log(`   - ${result.route.name} (${result.route.path})`)
      })
    }
    
    // 失败的路由
    const failedRoutes = this.results.filter(r => !r.success)
    if (failedRoutes.length > 0) {
      console.log('\\n❌ Failed Routes:')
      failedRoutes.forEach(result => {
        const reason = result.analysis && result.analysis.hasUniqueContent ? 
          'No expected content' : 'No unique content'
        console.log(`   - ${result.route.name} (${result.route.path}): ${reason}`)
      })
    }
    
    // 内容重复分析
    const contentHashes = {}
    this.results.forEach(result => {
      if (result.contentHash) {
        if (!contentHashes[result.contentHash]) {
          contentHashes[result.contentHash] = []
        }
        contentHashes[result.contentHash].push(result.route.path)
      }
    })
    
    const duplicates = Object.values(contentHashes).filter(paths => paths.length > 1)
    if (duplicates.length > 0) {
      console.log('\\n🔄 Content Duplication Issues:')
      duplicates.forEach(paths => {
        console.log(`   - Same content: ${paths.join(', ')}`)
      })
    }
    
    // 问题诊断
    console.log('\\n🔧 Problem Diagnosis:')
    if (withUniqueContent < total * 0.5) {
      console.log('   🚨 MAJOR ISSUE: Most routes lack unique content')
      console.log('     - Vue Router may not be loading different components')
      console.log('     - All routes might be serving the same Vue app instance')
      console.log('     - This confirms the issue you reported!')
    }
    
    if (duplicates.length > 0) {
      console.log('   ⚠️ CONTENT DUPLICATION: Multiple routes return identical content')
      console.log('     - This suggests server-side fallback to index.html')
      console.log('     - Client-side routing is not working properly')
    }
    
    // 解决方案建议
    console.log('\\n💡 Solution Recommendations:')
    console.log('   1. 🔍 Check if Vue Router components are properly defined')
    console.log('   2. 📝 Verify each route component has unique content identifiers')
    console.log('   3. 🔧 Test Vue Router in browser dev tools')
    console.log('   4. 🎯 Add unique CSS classes or data attributes to each page')
    console.log('   5. 📊 Check if route components are being dynamically imported correctly')
    
    // 最终评估
    const assessment = this.getFinalAssessment(successful, withUniqueContent, total)
    console.log('\\n🏆 Final Assessment:')
    console.log(`   Client-Side Routing Status: ${assessment.status}`)
    console.log(`   ${assessment.message}`)
    
    console.log('\\n' + '='.repeat(80))
  }

  getFinalAssessment(successful, withUniqueContent, total) {
    const successRate = (successful / total) * 100
    const uniqueRate = (withUniqueContent / total) * 100
    
    if (successRate >= 80 && uniqueRate >= 80) {
      return {
        status: 'EXCELLENT',
        message: '🎉 Excellent! Vue Router is working correctly with unique content.'
      }
    } else if (successRate >= 60 && uniqueRate >= 60) {
      return {
        status: 'GOOD',
        message: '👍 Good! Most routes work correctly, minor issues detected.'
      }
    } else if (successRate >= 40 && uniqueRate >= 40) {
      return {
        status: 'FAIR',
        message: '⚠️ Fair. Some routes work but many have issues.'
      }
    } else {
      return {
        status: 'POOR',
        message: '🚨 Poor! Major client-side routing issues confirmed.'
      }
    }
  }
}

// 运行客户端路由验证
if (require.main === module) {
  const validator = new ClientRoutingValidator()
  validator.runClientRoutingValidation().catch(console.error)
}

module.exports = { ClientRoutingValidator }