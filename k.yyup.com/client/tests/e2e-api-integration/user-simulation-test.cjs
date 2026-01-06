/**
 * User Simulation Test
 * 用户模拟测试 - 模拟真实用户点击操作，检测404问题
 */

const http = require('http')
const https = require('https')

class UserSimulationTest {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.results = []
    this.sessionData = {
      cookies: {},
      headers: {}
    }
    
    // 模拟用户行为流程
    this.userFlows = [
      {
        name: '未登录用户访问流程',
        steps: [
          { action: 'visit', url: '/', expected: 'redirect_to_login' },
          { action: 'visit', url: '/login', expected: 'login_page' },
          { action: 'visit', url: '/dashboard', expected: 'redirect_to_login' },
          { action: 'visit', url: '/system/users', expected: 'redirect_to_login' }
        ]
      },
      {
        name: '直接访问管理页面',
        steps: [
          { action: 'visit', url: '/system/users', expected: 'page_or_redirect' },
          { action: 'visit', url: '/student', expected: 'page_or_redirect' },
          { action: 'visit', url: '/teacher', expected: 'page_or_redirect' },
          { action: 'visit', url: '/class', expected: 'page_or_redirect' },
          { action: 'visit', url: '/parent', expected: 'page_or_redirect' }
        ]
      },
      {
        name: '深层页面访问',
        steps: [
          { action: 'visit', url: '/student/detail/1', expected: 'page_or_404' },
          { action: 'visit', url: '/teacher/detail/1', expected: 'page_or_404' },
          { action: 'visit', url: '/class/detail/1', expected: 'page_or_404' },
          { action: 'visit', url: '/parent/detail/1', expected: 'page_or_404' },
          { action: 'visit', url: '/activity/detail/1', expected: 'page_or_404' }
        ]
      },
      {
        name: '错误路径测试',
        steps: [
          { action: 'visit', url: '/non-existent', expected: '404' },
          { action: 'visit', url: '/system/non-existent', expected: '404' },
          { action: 'visit', url: '/student/non-existent', expected: '404' },
          { action: 'visit', url: '/admin/secret', expected: '404' }
        ]
      }
    ]
  }

  async runUserSimulationTest() {
    console.log('👤 Starting User Simulation Test...')
    console.log('🎯 Simulating real user behavior patterns...\\n')
    
    for (const flow of this.userFlows) {
      console.log(`📋 Testing: ${flow.name}`)
      await this.runUserFlow(flow)
      console.log('')
    }
    
    this.generateUserSimulationReport()
  }

  async runUserFlow(flow) {
    const flowResults = []
    
    for (const step of flow.steps) {
      const result = await this.executeUserStep(step)
      flowResults.push(result)
      
      // 等待一段时间，模拟真实用户行为
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    this.results.push({
      flowName: flow.name,
      steps: flowResults,
      success: flowResults.every(r => r.success),
      issues: flowResults.filter(r => !r.success)
    })
  }

  async executeUserStep(step) {
    try {
      const url = `${this.frontendURL}${step.url}`
      
      console.log(`   🔍 ${step.action}: ${step.url}`)
      
      const response = await this.makeUserRequest(url)
      const analysis = this.analyzeUserResponse(response, step)
      
      const result = {
        action: step.action,
        url: step.url,
        expected: step.expected,
        actual: analysis.pageType,
        success: this.isExpectedResult(analysis, step.expected),
        status: response.status,
        contentLength: response.data ? response.data.length : 0,
        analysis: analysis,
        response: response
      }
      
      this.logUserStepResult(result)
      return result
      
    } catch (error) {
      const result = {
        action: step.action,
        url: step.url,
        expected: step.expected,
        actual: 'error',
        success: false,
        status: 0,
        error: error.message,
        analysis: { pageType: 'error', error: error.message }
      }
      
      this.logUserStepResult(result)
      return result
    }
  }

  async makeUserRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      // 模拟真实浏览器的请求头
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        ...this.sessionData.headers
      }
      
      // 添加session cookies
      if (Object.keys(this.sessionData.cookies).length > 0) {
        headers['Cookie'] = Object.entries(this.sessionData.cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ')
      }
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 10000,
        headers
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          // 保存cookies
          if (res.headers['set-cookie']) {
            res.headers['set-cookie'].forEach(cookie => {
              const [nameValue] = cookie.split(';')
              const [name, value] = nameValue.split('=')
              this.sessionData.cookies[name] = value
            })
          }
          
          resolve({ 
            status: res.statusCode, 
            data, 
            headers: res.headers,
            url: url
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

  analyzeUserResponse(response, step) {
    const analysis = {
      pageType: 'unknown',
      is404: false,
      isRedirect: false,
      isError: false,
      hasLogin: false,
      hasContent: false,
      hasVueApp: false,
      redirectLocation: null,
      details: []
    }
    
    if (!response.data) {
      analysis.pageType = 'empty'
      analysis.isError = true
      return analysis
    }
    
    const content = response.data.toLowerCase()
    
    // 检查HTTP状态码
    if (response.status >= 300 && response.status < 400) {
      analysis.isRedirect = true
      analysis.redirectLocation = response.headers.location
      analysis.pageType = 'redirect'
      analysis.details.push(`重定向到: ${response.headers.location}`)
    } else if (response.status === 404) {
      analysis.is404 = true
      analysis.pageType = '404_http'
      analysis.details.push('HTTP 404 Not Found')
    } else if (response.status !== 200) {
      analysis.isError = true
      analysis.pageType = 'error'
      analysis.details.push(`HTTP ${response.status}`)
    }
    
    // 检查页面内容
    const pageChecks = [
      {
        patterns: ['404', 'page not found', '页面不存在', '页面未找到', '找不到页面'],
        type: '404_content',
        flag: 'is404'
      },
      {
        patterns: ['login', '登录', 'sign in', 'username', 'password'],
        type: 'login',
        flag: 'hasLogin'
      },
      {
        patterns: ['vue', 'vue.js', 'id="app"', 'vue-router'],
        type: 'vue_app',
        flag: 'hasVueApp'
      },
      {
        patterns: ['el-', 'element-plus', 'menu', 'table', 'form', 'button', 'nav'],
        type: 'content',
        flag: 'hasContent'
      }
    ]
    
    pageChecks.forEach(check => {
      const found = check.patterns.some(pattern => content.includes(pattern))
      if (found) {
        analysis[check.flag] = true
        if (analysis.pageType === 'unknown') {
          analysis.pageType = check.type
        }
        analysis.details.push(`检测到: ${check.type}`)
      }
    })
    
    // 特殊情况检查
    if (content.includes('您访问的页面不存在') || content.includes('抱歉，你访问的页面不存在')) {
      analysis.is404 = true
      analysis.pageType = '404_content'
      analysis.details.push('发现404页面内容')
    }
    
    if (content.includes('router-view') && content.includes('404')) {
      analysis.is404 = true
      analysis.pageType = '404_router'
      analysis.details.push('Vue Router 404重定向')
    }
    
    return analysis
  }

  isExpectedResult(analysis, expected) {
    switch (expected) {
      case 'redirect_to_login':
        return analysis.isRedirect && analysis.redirectLocation && analysis.redirectLocation.includes('login')
      case 'login_page':
        return analysis.hasLogin
      case 'page_or_redirect':
        return analysis.hasContent || analysis.hasVueApp || analysis.isRedirect
      case 'page_or_404':
        return analysis.hasContent || analysis.hasVueApp || analysis.is404
      case '404':
        return analysis.is404
      default:
        return !analysis.isError
    }
  }

  logUserStepResult(result) {
    const icon = result.success ? '✅' : '❌'
    const url = result.url.padEnd(25)
    const expected = result.expected.padEnd(15)
    const actual = result.actual.padEnd(15)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    
    console.log(`     ${icon} ${url} ${status} Expected: ${expected} Actual: ${actual}`)
    
    if (result.analysis && result.analysis.details.length > 0) {
      result.analysis.details.forEach(detail => {
        console.log(`        📝 ${detail}`)
      })
    }
    
    if (result.error) {
      console.log(`        ❌ Error: ${result.error}`)
    }
  }

  generateUserSimulationReport() {
    console.log('\\n' + '='.repeat(80))
    console.log('👤 USER SIMULATION TEST REPORT')
    console.log('='.repeat(80))
    
    const totalFlows = this.results.length
    const successfulFlows = this.results.filter(r => r.success).length
    const totalSteps = this.results.reduce((sum, r) => sum + r.steps.length, 0)
    const successfulSteps = this.results.reduce((sum, r) => sum + r.steps.filter(s => s.success).length, 0)
    
    console.log('\\n📈 Overall Results:')
    console.log(`   Total User Flows: ${totalFlows}`)
    console.log(`   Successful Flows: ${successfulFlows} (${((successfulFlows/totalFlows)*100).toFixed(1)}%)`)
    console.log(`   Total Steps: ${totalSteps}`)
    console.log(`   Successful Steps: ${successfulSteps} (${((successfulSteps/totalSteps)*100).toFixed(1)}%)`)
    
    // 按流程分析
    console.log('\\n📊 Flow Analysis:')
    this.results.forEach(flow => {
      const successRate = (flow.steps.filter(s => s.success).length / flow.steps.length) * 100
      const status = flow.success ? '✅' : '❌'
      console.log(`   ${status} ${flow.flowName}: ${successRate.toFixed(1)}% success`)
      
      if (flow.issues.length > 0) {
        flow.issues.forEach(issue => {
          console.log(`     ❌ ${issue.url}: ${issue.actual} (expected: ${issue.expected})`)
        })
      }
    })
    
    // 404问题分析
    const all404Issues = this.results.flatMap(r => r.steps.filter(s => s.analysis && s.analysis.is404))
    if (all404Issues.length > 0) {
      console.log('\\n🔄 404 Issues Found:')
      all404Issues.forEach(issue => {
        console.log(`   - ${issue.url}: ${issue.analysis.pageType}`)
        if (issue.analysis.details.length > 0) {
          issue.analysis.details.forEach(detail => {
            console.log(`     📝 ${detail}`)
          })
        }
      })
    }
    
    // 重定向分析
    const redirectIssues = this.results.flatMap(r => r.steps.filter(s => s.analysis && s.analysis.isRedirect))
    if (redirectIssues.length > 0) {
      console.log('\\n🔄 Redirect Behavior:')
      redirectIssues.forEach(issue => {
        console.log(`   - ${issue.url} → ${issue.analysis.redirectLocation}`)
      })
    }
    
    // 错误分析
    const errorIssues = this.results.flatMap(r => r.steps.filter(s => s.analysis && s.analysis.isError))
    if (errorIssues.length > 0) {
      console.log('\\n❌ Error Issues:')
      errorIssues.forEach(issue => {
        console.log(`   - ${issue.url}: ${issue.analysis.pageType}`)
        if (issue.error) {
          console.log(`     Error: ${issue.error}`)
        }
      })
    }
    
    // 建议和解决方案
    console.log('\\n💡 Recommendations:')
    if (all404Issues.length > 0) {
      console.log('   🔄 404 Issues Detected:')
      console.log('     - Check Vue Router configuration')
      console.log('     - Verify route component imports')
      console.log('     - Test with authentication token')
      console.log('     - Check for case sensitivity in routes')
    }
    
    if (redirectIssues.length > 0) {
      console.log('   🔄 Redirect Behavior:')
      console.log('     - Review authentication middleware')
      console.log('     - Check route guards configuration')
      console.log('     - Verify protected route handling')
    }
    
    if (errorIssues.length > 0) {
      console.log('   ❌ Error Issues:')
      console.log('     - Check server connectivity')
      console.log('     - Review error handling middleware')
      console.log('     - Test from different network environments')
    }
    
    // 最终评估
    const finalAssessment = this.getFinalAssessment(successfulFlows, all404Issues.length, totalFlows)
    console.log('\\n🏆 Final Assessment:')
    console.log(`   User Experience Status: ${finalAssessment.status}`)
    console.log(`   ${finalAssessment.message}`)
    
    console.log('\\n' + '='.repeat(80))
  }

  getFinalAssessment(successfulFlows, issues404, totalFlows) {
    const successRate = (successfulFlows / totalFlows) * 100
    
    if (issues404 === 0 && successRate >= 90) {
      return {
        status: 'EXCELLENT',
        message: '🎉 Excellent! All user flows work perfectly.'
      }
    } else if (issues404 <= 2 && successRate >= 80) {
      return {
        status: 'GOOD',
        message: '👍 Good! Minor issues detected, mostly working well.'
      }
    } else if (issues404 <= 5 && successRate >= 60) {
      return {
        status: 'FAIR',
        message: '⚠️ Fair. Some user flows have issues, needs investigation.'
      }
    } else {
      return {
        status: 'POOR',
        message: '🚨 Poor! Major user experience issues detected.'
      }
    }
  }
}

// 运行用户模拟测试
if (require.main === module) {
  const tester = new UserSimulationTest()
  tester.runUserSimulationTest().catch(console.error)
}

module.exports = { UserSimulationTest }