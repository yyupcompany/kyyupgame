/**
 * External Access Test for k.yyup.cc
 * 外网访问测试 - 专门测试k.yyup.cc域名的404页面问题
 */

const http = require('http')
const https = require('https')

class ExternalAccessTest {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.results = []
    this.testLinks = [
      // 核心页面测试
      { name: '首页', path: '/', priority: 'high' },
      { name: '登录页', path: '/login', priority: 'high' },
      { name: '仪表板', path: '/dashboard', priority: 'high' },
      
      // 管理页面测试
      { name: '用户管理', path: '/system/users', priority: 'high' },
      { name: '学生管理', path: '/student', priority: 'high' },
      { name: '教师管理', path: '/teacher', priority: 'high' },
      { name: '班级管理', path: '/class', priority: 'high' },
      { name: '家长管理', path: '/parent', priority: 'high' },
      { name: '活动管理', path: '/activity', priority: 'high' },
      
      // 招生模块测试
      { name: '招生计划', path: '/enrollment-plan', priority: 'high' },
      { name: '招生活动', path: '/enrollment', priority: 'high' },
      { name: '入学申请', path: '/application', priority: 'high' },
      
      // 功能页面测试
      { name: 'AI助手', path: '/ai', priority: 'medium' },
      { name: '统计分析', path: '/statistics', priority: 'medium' },
      { name: '客户管理', path: '/customer', priority: 'medium' },
      { name: '聊天功能', path: '/chat', priority: 'medium' },
      
      // 园长功能测试
      { name: '园长仪表板', path: '/principal/dashboard', priority: 'medium' },
      { name: '绩效管理', path: '/principal/performance', priority: 'medium' },
      { name: '营销分析', path: '/principal/marketing-analysis', priority: 'medium' },
      
      // 系统管理测试
      { name: '角色管理', path: '/system/roles', priority: 'medium' },
      { name: '权限管理', path: '/system/permissions', priority: 'medium' },
      { name: '系统设置', path: '/system/settings', priority: 'low' },
      
      // 错误页面测试
      { name: '404页面', path: '/404', priority: 'low' },
      { name: '403页面', path: '/403', priority: 'low' },
      { name: '不存在页面', path: '/non-existent-page', priority: 'low' }
    ]
  }

  async runExternalAccessTest() {
    console.log('🌐 Starting External Access Test for k.yyup.cc...')
    console.log(`🔍 Testing ${this.testLinks.length} pages from external network...\\n`)
    
    console.log('📋 Testing Core Pages:')
    const highPriorityLinks = this.testLinks.filter(link => link.priority === 'high')
    await this.testLinks_batch(highPriorityLinks)
    
    console.log('\\n📋 Testing Feature Pages:')
    const mediumPriorityLinks = this.testLinks.filter(link => link.priority === 'medium')
    await this.testLinks_batch(mediumPriorityLinks)
    
    console.log('\\n📋 Testing System Pages:')
    const lowPriorityLinks = this.testLinks.filter(link => link.priority === 'low')
    await this.testLinks_batch(lowPriorityLinks)
    
    this.generateExternalAccessReport()
  }

  async testLinks_batch(links) {
    for (const link of links) {
      await this.testExternalLink(link)
      await new Promise(resolve => setTimeout(resolve, 200)) // 避免请求过快
    }
  }

  async testExternalLink(link) {
    try {
      const startTime = Date.now()
      const url = `${this.frontendURL}${link.path}`
      
      console.log(`🔍 Testing: ${link.name} (${url})`)
      
      const response = await this.makeExternalRequest(url)
      const loadTime = Date.now() - startTime
      
      // 详细分析响应内容
      const analysis = this.analyzeExternalResponse(response, link)
      
      const result = {
        name: link.name,
        path: link.path,
        url,
        priority: link.priority,
        success: response.status === 200,
        status: response.status,
        loadTime,
        contentLength: response.data ? response.data.length : 0,
        analysis: analysis
      }
      
      this.results.push(result)
      this.logExternalResult(result)
      
    } catch (error) {
      const result = {
        name: link.name,
        path: link.path,
        url: `${this.frontendURL}${link.path}`,
        priority: link.priority,
        success: false,
        error: error.message,
        status: 0,
        loadTime: 0,
        contentLength: 0,
        analysis: { 
          is404: false, 
          isError: true, 
          errorType: 'network_error',
          pageType: 'error'
        }
      }
      
      this.results.push(result)
      this.logExternalResult(result)
    }
  }

  async makeExternalRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
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

  analyzeExternalResponse(response, link) {
    const analysis = {
      is404: false,
      isError: false,
      errorType: null,
      pageType: 'unknown',
      hasVueApp: false,
      hasRouter: false,
      hasContent: false,
      redirectsTo404: false,
      statusMessage: ''
    }
    
    if (!response.data) {
      analysis.isError = true
      analysis.errorType = 'empty_response'
      analysis.pageType = 'error'
      return analysis
    }
    
    const content = response.data.toLowerCase()
    
    // 检查HTTP状态码
    if (response.status === 404) {
      analysis.is404 = true
      analysis.pageType = '404_http'
      analysis.statusMessage = 'HTTP 404 Not Found'
    } else if (response.status !== 200) {
      analysis.isError = true
      analysis.errorType = `http_${response.status}`
      analysis.pageType = 'error'
      analysis.statusMessage = `HTTP ${response.status}`
    }
    
    // 检查页面内容中的404指示器
    const notFoundIndicators = [
      '404',
      'page not found',
      '页面不存在',
      '页面未找到',
      '您访问的页面不存在',
      'not found',
      'cannot find',
      '找不到页面'
    ]
    
    const has404Content = notFoundIndicators.some(indicator => 
      content.includes(indicator.toLowerCase())
    )
    
    if (has404Content) {
      analysis.is404 = true
      analysis.redirectsTo404 = true
      analysis.pageType = '404_content'
      analysis.statusMessage = '页面重定向到404'
    }
    
    // 检查Vue应用
    if (content.includes('vue') || content.includes('vue.js') || content.includes('id="app"')) {
      analysis.hasVueApp = true
      analysis.pageType = 'vue_app'
    }
    
    // 检查路由器
    if (content.includes('router') || content.includes('vue-router')) {
      analysis.hasRouter = true
    }
    
    // 检查是否有实际内容
    const contentIndicators = [
      'el-',
      'element-plus',
      'nav',
      'menu',
      'header',
      'main',
      'sidebar',
      'content',
      'table',
      'form',
      'button'
    ]
    
    const hasRealContent = contentIndicators.some(indicator => 
      content.includes(indicator)
    )
    
    if (hasRealContent) {
      analysis.hasContent = true
      if (analysis.pageType === 'unknown') {
        analysis.pageType = 'content_page'
      }
    }
    
    // 检查是否是空白页面
    if (content.length < 1000 && !analysis.is404 && !analysis.isError) {
      analysis.pageType = 'empty_page'
    }
    
    // 最终状态消息
    if (!analysis.statusMessage) {
      if (analysis.is404) {
        analysis.statusMessage = '404页面'
      } else if (analysis.hasContent) {
        analysis.statusMessage = '正常页面'
      } else if (analysis.hasVueApp) {
        analysis.statusMessage = 'Vue应用'
      } else {
        analysis.statusMessage = '空白页面'
      }
    }
    
    return analysis
  }

  logExternalResult(result) {
    const icon = result.success ? '✅' : '❌'
    const name = result.name.padEnd(12)
    const path = result.path.padEnd(25)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const time = result.loadTime ? `${result.loadTime}ms` : '0ms'
    
    let statusInfo = ''
    if (result.analysis) {
      if (result.analysis.is404) {
        statusInfo = '🔄 404页面'
      } else if (result.analysis.isError) {
        statusInfo = `❌ ${result.analysis.errorType}`
      } else if (result.analysis.hasContent) {
        statusInfo = '📊 有内容'
      } else if (result.analysis.hasVueApp) {
        statusInfo = '🎯 Vue应用'
      } else {
        statusInfo = '📄 空白页面'
      }
    }
    
    console.log(`${icon} ${name} ${path} ${status} ${time.padEnd(8)} ${statusInfo}`)
    
    if (result.analysis && result.analysis.statusMessage) {
      console.log(`   📝 ${result.analysis.statusMessage}`)
    }
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    }
  }

  generateExternalAccessReport() {
    console.log('\\n' + '='.repeat(80))
    console.log('🌐 EXTERNAL ACCESS TEST REPORT for k.yyup.cc')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const is404Pages = this.results.filter(r => r.analysis && r.analysis.is404).length
    const hasContentPages = this.results.filter(r => r.analysis && r.analysis.hasContent).length
    const vueAppPages = this.results.filter(r => r.analysis && r.analysis.hasVueApp).length
    const errorPages = this.results.filter(r => r.analysis && r.analysis.isError).length
    
    console.log('\\n📈 Overall Results:')
    console.log(`   Total Pages Tested: ${total}`)
    console.log(`   ✅ HTTP 200 Responses: ${successful} (${((successful/total)*100).toFixed(1)}%)`)
    console.log(`   ❌ HTTP Errors: ${failed} (${((failed/total)*100).toFixed(1)}%)`)
    console.log(`   🔄 404 Pages: ${is404Pages} (${((is404Pages/total)*100).toFixed(1)}%)`)
    console.log(`   📊 Pages with Content: ${hasContentPages} (${((hasContentPages/total)*100).toFixed(1)}%)`)
    console.log(`   🎯 Vue App Pages: ${vueAppPages} (${((vueAppPages/total)*100).toFixed(1)}%)`)
    console.log(`   ❌ Error Pages: ${errorPages} (${((errorPages/total)*100).toFixed(1)}%)`)
    
    // 按优先级分析
    console.log('\\n🔍 Priority Analysis:')
    const priorities = ['high', 'medium', 'low']
    priorities.forEach(priority => {
      const priorityResults = this.results.filter(r => r.priority === priority)
      const prioritySuccess = priorityResults.filter(r => r.success).length
      const priority404 = priorityResults.filter(r => r.analysis && r.analysis.is404).length
      
      console.log(`   ${priority.toUpperCase().padEnd(6)}: ${prioritySuccess}/${priorityResults.length} success, ${priority404} are 404`)
    })
    
    // 详细的404页面分析
    const problem404Pages = this.results.filter(r => r.analysis && r.analysis.is404)
    if (problem404Pages.length > 0) {
      console.log('\\n🔄 404 Pages Found:')
      problem404Pages.forEach(result => {
        console.log(`   - ${result.name}: ${result.path} (${result.analysis.statusMessage})`)
      })
    }
    
    // 网络错误分析
    const networkErrorPages = this.results.filter(r => r.analysis && r.analysis.isError)
    if (networkErrorPages.length > 0) {
      console.log('\\n❌ Network/Error Pages:')
      networkErrorPages.forEach(result => {
        console.log(`   - ${result.name}: ${result.path} (${result.analysis.errorType || result.error})`)
      })
    }
    
    // 性能分析
    const successResults = this.results.filter(r => r.success)
    if (successResults.length > 0) {
      console.log('\\n⚡ Performance Analysis:')
      const avgLoadTime = successResults.reduce((sum, r) => sum + r.loadTime, 0) / successResults.length
      const maxLoadTime = Math.max(...successResults.map(r => r.loadTime))
      const minLoadTime = Math.min(...successResults.map(r => r.loadTime))
      
      console.log(`   Average Load Time: ${avgLoadTime.toFixed(0)}ms`)
      console.log(`   Max Load Time: ${maxLoadTime}ms`)
      console.log(`   Min Load Time: ${minLoadTime}ms`)
      console.log(`   Performance Status: ${avgLoadTime < 3000 ? '✅ Good' : '⚠️ Needs Improvement'}`)
    }
    
    // 最终评估
    const finalAssessment = this.getFinalAssessment(successful, is404Pages, total)
    console.log('\\n🏆 Final Assessment:')
    console.log(`   External Access Status: ${finalAssessment.status}`)
    console.log(`   ${finalAssessment.message}`)
    
    // 解决方案建议
    if (is404Pages > 0) {
      console.log('\\n💡 Solutions for 404 Issues:')
      console.log('   1. Check if the domain k.yyup.cc is properly configured')
      console.log('   2. Verify the frontend application is running and accessible')
      console.log('   3. Check Vue Router configuration for proper route handling')
      console.log('   4. Ensure the web server is serving the Vue application correctly')
      console.log('   5. Test from localhost:5173 to compare results')
    }
    
    console.log('\\n' + '='.repeat(80))
  }

  getFinalAssessment(successful, is404Pages, total) {
    const successRate = (successful / total) * 100
    const problemRate = (is404Pages / total) * 100
    
    if (problemRate === 0 && successRate >= 90) {
      return {
        status: 'EXCELLENT',
        message: '🎉 Perfect! All pages are accessible from external network.'
      }
    } else if (problemRate < 10 && successRate >= 80) {
      return {
        status: 'GOOD',
        message: '👍 Good! Most pages work, minor 404 issues detected.'
      }
    } else if (problemRate < 30 && successRate >= 70) {
      return {
        status: 'FAIR',
        message: '⚠️ Fair. Some pages have 404 issues, needs investigation.'
      }
    } else {
      return {
        status: 'POOR',
        message: '🚨 Poor! Major 404 issues detected. External access problems.'
      }
    }
  }
}

// 运行外网访问测试
if (require.main === module) {
  const tester = new ExternalAccessTest()
  tester.runExternalAccessTest().catch(console.error)
}

module.exports = { ExternalAccessTest }