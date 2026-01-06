/**
 * Comprehensive Frontend Page Test
 * 综合前端页面测试
 */

const http = require('http')
const https = require('https')

class FrontendPageTest {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.results = []
    this.loginToken = null
    this.testPages = []
  }

  async initialize() {
    console.log('🚀 Starting Comprehensive Frontend Page Test...\n')
    
    // 基于分析结果的页面列表
    this.testPages = [
      // 首页和登录
      { path: '/', name: 'Homepage', priority: 'high' },
      { path: '/login', name: 'Login Page', priority: 'high' },
      
      // 仪表板
      { path: '/dashboard', name: 'Main Dashboard', priority: 'high' },
      { path: '/dashboard/DataStatistics', name: 'Data Statistics', priority: 'medium' },
      { path: '/dashboard/CampusOverview', name: 'Campus Overview', priority: 'medium' },
      { path: '/dashboard/Schedule', name: 'Schedule Management', priority: 'medium' },
      
      // 核心业务管理
      { path: '/student', name: 'Student Management', priority: 'high' },
      { path: '/teacher', name: 'Teacher Management', priority: 'high' },
      { path: '/class', name: 'Class Management', priority: 'high' },
      { path: '/parent', name: 'Parent Management', priority: 'high' },
      
      // 活动和报名
      { path: '/activity', name: 'Activity Management', priority: 'high' },
      { path: '/enrollment-plan', name: 'Enrollment Plan', priority: 'high' },
      { path: '/enrollment', name: 'Enrollment Management', priority: 'medium' },
      
      // 系统管理
      { path: '/system/users', name: 'User Management', priority: 'high' },
      { path: '/system/roles', name: 'Role Management', priority: 'high' },
      { path: '/system/permissions', name: 'Permission Management', priority: 'medium' },
      { path: '/system/settings', name: 'System Settings', priority: 'medium' },
      
      // AI功能
      { path: '/ai', name: 'AI Assistant', priority: 'medium' },
      { path: '/ai/MemoryManagementPage', name: 'AI Memory Management', priority: 'low' },
      { path: '/ai/ModelManagementPage', name: 'AI Model Management', priority: 'low' },
      
      // 园长功能
      { path: '/principal/Dashboard', name: 'Principal Dashboard', priority: 'medium' },
      { path: '/principal/Performance', name: 'Principal Performance', priority: 'medium' },
      { path: '/principal/Activities', name: 'Principal Activities', priority: 'medium' },
      
      // 其他功能
      { path: '/statistics', name: 'Statistics', priority: 'medium' },
      { path: '/advertisement', name: 'Advertisement', priority: 'low' },
      { path: '/chat', name: 'Chat', priority: 'low' },
      { path: '/customer', name: 'Customer Management', priority: 'medium' }
    ]
  }

  async runAllTests() {
    await this.initialize()
    
    console.log(`📊 Testing ${this.testPages.length} pages...\n`)
    
    // 按优先级分组测试
    const highPriorityPages = this.testPages.filter(p => p.priority === 'high')
    const mediumPriorityPages = this.testPages.filter(p => p.priority === 'medium')
    const lowPriorityPages = this.testPages.filter(p => p.priority === 'low')
    
    // 高优先级页面测试
    console.log('🔥 High Priority Pages:')
    for (const page of highPriorityPages) {
      await this.testPage(page)
    }
    
    console.log('\n📋 Medium Priority Pages:')
    for (const page of mediumPriorityPages) {
      await this.testPage(page)
    }
    
    console.log('\n📝 Low Priority Pages:')
    for (const page of lowPriorityPages) {
      await this.testPage(page)
    }
    
    // 生成报告
    this.generateReport()
  }

  async testPage(page) {
    try {
      const startTime = Date.now()
      const url = `${this.frontendURL}${page.path}`
      
      const response = await this.makeRequest(url)
      const loadTime = Date.now() - startTime
      
      const result = {
        page: page.name,
        path: page.path,
        url,
        priority: page.priority,
        success: response.status === 200,
        status: response.status,
        loadTime,
        contentLength: response.data ? response.data.length : 0,
        contentType: response.headers['content-type'] || 'unknown',
        analysis: this.analyzePageContent(response.data, page.path)
      }
      
      this.results.push(result)
      this.logResult(result)
      
      // 短暂延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      const result = {
        page: page.name,
        path: page.path,
        url: `${this.frontendURL}${page.path}`,
        priority: page.priority,
        success: false,
        error: error.message,
        status: 0,
        loadTime: 0
      }
      
      this.results.push(result)
      this.logResult(result)
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
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

  analyzePageContent(content, path) {
    if (!content) return { type: 'empty', features: [] }
    
    const analysis = {
      type: 'unknown',
      features: [],
      hasVue: false,
      hasElementPlus: false,
      hasAPI: false,
      hasRouter: false,
      errors: []
    }
    
    // 检查是否为HTML页面
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      analysis.type = 'html'
      
      // 检查Vue应用
      if (content.includes('vue') || content.includes('Vue') || content.includes('app')) {
        analysis.hasVue = true
        analysis.features.push('Vue')
      }
      
      // 检查Element Plus
      if (content.includes('element-plus') || content.includes('el-')) {
        analysis.hasElementPlus = true
        analysis.features.push('Element Plus')
      }
      
      // 检查API集成
      if (content.includes('api/') || content.includes('/api/')) {
        analysis.hasAPI = true
        analysis.features.push('API')
      }
      
      // 检查路由
      if (content.includes('router') || content.includes('Router')) {
        analysis.hasRouter = true
        analysis.features.push('Router')
      }
      
      // 检查错误
      if (content.includes('error') || content.includes('Error') || content.includes('404')) {
        analysis.errors.push('Page contains error indicators')
      }
      
      // 特殊页面类型检测
      if (path === '/login' && content.includes('login')) {
        analysis.type = 'login'
      } else if (path.includes('/dashboard') && content.includes('dashboard')) {
        analysis.type = 'dashboard'
      } else if (content.includes('management') || content.includes('table')) {
        analysis.type = 'management'
      }
    } else {
      analysis.type = 'non-html'
    }
    
    return analysis
  }

  logResult(result) {
    const icon = result.success ? '✅' : '❌'
    const priority = result.priority.toUpperCase().padEnd(6)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const time = result.loadTime ? `${result.loadTime}ms` : '0ms'
    const size = result.contentLength ? `${Math.round(result.contentLength/1024)}KB` : '0KB'
    
    console.log(`${icon} ${priority} ${result.page.padEnd(25)} ${status} ${time.padEnd(8)} ${size.padEnd(6)}`)
    
    if (result.analysis && result.analysis.features.length > 0) {
      console.log(`   📦 Features: ${result.analysis.features.join(', ')}`)
    }
    
    if (result.analysis && result.analysis.errors.length > 0) {
      console.log(`   ⚠️ Issues: ${result.analysis.errors.join(', ')}`)
    }
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 COMPREHENSIVE FRONTEND PAGE TEST REPORT')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = total - successful
    const successRate = total > 0 ? (successful / total) * 100 : 0
    
    console.log('\n📈 Overall Results:')
    console.log(`   Total Pages Tested: ${total}`)
    console.log(`   Successful: ${successful}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`)
    
    // 按优先级分析
    console.log('\n🔍 Priority Analysis:')
    const priorities = ['high', 'medium', 'low']
    priorities.forEach(priority => {
      const priorityResults = this.results.filter(r => r.priority === priority)
      const prioritySuccess = priorityResults.filter(r => r.success).length
      const priorityRate = priorityResults.length > 0 ? (prioritySuccess / priorityResults.length) * 100 : 0
      
      console.log(`   ${priority.toUpperCase().padEnd(6)}: ${prioritySuccess}/${priorityResults.length} (${priorityRate.toFixed(1)}%)`)
    })
    
    // 性能分析
    const successfulResults = this.results.filter(r => r.success && r.loadTime > 0)
    if (successfulResults.length > 0) {
      const avgLoadTime = successfulResults.reduce((sum, r) => sum + r.loadTime, 0) / successfulResults.length
      const maxLoadTime = Math.max(...successfulResults.map(r => r.loadTime))
      const minLoadTime = Math.min(...successfulResults.map(r => r.loadTime))
      
      console.log('\n⏱️ Performance Analysis:')
      console.log(`   Average Load Time: ${avgLoadTime.toFixed(0)}ms`)
      console.log(`   Fastest Page: ${minLoadTime}ms`)
      console.log(`   Slowest Page: ${maxLoadTime}ms`)
      
      const slowPages = successfulResults.filter(r => r.loadTime > 3000)
      if (slowPages.length > 0) {
        console.log(`   ⚠️ Slow Pages (>3s): ${slowPages.length}`)
        slowPages.forEach(page => {
          console.log(`     - ${page.page}: ${page.loadTime}ms`)
        })
      }
    }
    
    // 技术栈分析
    const techAnalysis = this.analyzeTechStack()
    console.log('\n🛠️ Technology Stack Analysis:')
    console.log(`   Vue Integration: ${techAnalysis.vue}/${total} pages (${((techAnalysis.vue/total)*100).toFixed(1)}%)`)
    console.log(`   Element Plus: ${techAnalysis.elementPlus}/${total} pages (${((techAnalysis.elementPlus/total)*100).toFixed(1)}%)`)
    console.log(`   API Integration: ${techAnalysis.api}/${total} pages (${((techAnalysis.api/total)*100).toFixed(1)}%)`)
    console.log(`   Router Integration: ${techAnalysis.router}/${total} pages (${((techAnalysis.router/total)*100).toFixed(1)}%)`)
    
    // 失败页面分析
    const failedResults = this.results.filter(r => !r.success)
    if (failedResults.length > 0) {
      console.log('\n❌ Failed Pages Analysis:')
      const errorTypes = this.analyzeErrorTypes(failedResults)
      
      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} pages`)
      })
      
      console.log('\n   Failed Pages List:')
      failedResults.forEach(result => {
        const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (${result.status})` : ''
        console.log(`   - ${result.page}${errorInfo}`)
      })
    }
    
    // 修复建议
    console.log('\n💡 Recommendations:')
    this.generateRecommendations()
    
    // 最终评估
    const finalAssessment = this.getFinalAssessment(successRate)
    console.log('\n🏆 Final Assessment:')
    console.log(`   Frontend Status: ${finalAssessment.status}`)
    console.log(`   ${finalAssessment.message}`)
    
    console.log('\n' + '='.repeat(80))
  }

  analyzeTechStack() {
    const analysis = {
      vue: 0,
      elementPlus: 0,
      api: 0,
      router: 0
    }
    
    this.results.forEach(result => {
      if (result.analysis) {
        if (result.analysis.hasVue) analysis.vue++
        if (result.analysis.hasElementPlus) analysis.elementPlus++
        if (result.analysis.hasAPI) analysis.api++
        if (result.analysis.hasRouter) analysis.router++
      }
    })
    
    return analysis
  }

  analyzeErrorTypes(failedResults) {
    const errorTypes = {}
    
    failedResults.forEach(result => {
      if (result.status === 404) {
        errorTypes['404 Not Found'] = (errorTypes['404 Not Found'] || 0) + 1
      } else if (result.status === 500) {
        errorTypes['500 Server Error'] = (errorTypes['500 Server Error'] || 0) + 1
      } else if (result.status === 403) {
        errorTypes['403 Forbidden'] = (errorTypes['403 Forbidden'] || 0) + 1
      } else if (result.error) {
        errorTypes['Network Error'] = (errorTypes['Network Error'] || 0) + 1
      } else {
        errorTypes['Unknown Error'] = (errorTypes['Unknown Error'] || 0) + 1
      }
    })
    
    return errorTypes
  }

  generateRecommendations() {
    const successRate = (this.results.filter(r => r.success).length / this.results.length) * 100
    
    if (successRate < 50) {
      console.log('   🚨 Critical: Major frontend deployment issues detected')
      console.log('   • Check frontend build and deployment process')
      console.log('   • Verify domain configuration and routing setup')
      console.log('   • Check server configuration and proxy settings')
    } else if (successRate < 80) {
      console.log('   ⚠️ Warning: Some pages are not accessible')
      console.log('   • Review route configuration in router/optimized-routes.ts')
      console.log('   • Check for missing page components')
      console.log('   • Verify Vue router setup and path mappings')
    } else {
      console.log('   ✅ Good: Most pages are accessible')
      console.log('   • Continue with API integration testing')
      console.log('   • Consider implementing comprehensive E2E testing')
    }
    
    // 技术栈建议
    const techAnalysis = this.analyzeTechStack()
    const total = this.results.length
    
    if (techAnalysis.vue / total < 0.8) {
      console.log('   • Ensure all pages are properly integrated with Vue 3')
    }
    
    if (techAnalysis.elementPlus / total < 0.6) {
      console.log('   • Consider standardizing UI components with Element Plus')
    }
    
    if (techAnalysis.api / total < 0.7) {
      console.log('   • Implement API integration for data-driven pages')
    }
  }

  getFinalAssessment(successRate) {
    if (successRate >= 90) {
      return {
        status: 'EXCELLENT',
        message: '🎉 Frontend deployment is highly successful! Ready for production testing.'
      }
    } else if (successRate >= 80) {
      return {
        status: 'GOOD',
        message: '👍 Frontend deployment is mostly successful. Minor fixes needed.'
      }
    } else if (successRate >= 60) {
      return {
        status: 'FAIR',
        message: '⚠️ Frontend deployment has some issues. Moderate fixes required.'
      }
    } else if (successRate >= 40) {
      return {
        status: 'POOR',
        message: '🔧 Frontend deployment needs significant fixes.'
      }
    } else {
      return {
        status: 'CRITICAL',
        message: '🚨 Frontend deployment is failing. Immediate attention required.'
      }
    }
  }
}

// 运行测试
if (require.main === module) {
  const test = new FrontendPageTest()
  test.runAllTests().catch(console.error)
}

module.exports = { FrontendPageTest }