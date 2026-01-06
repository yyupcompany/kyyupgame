/**
 * SPA Fallback Detection Tool
 * SPA回退检测工具 - 检测所有路由是否都返回index.html
 */

const http = require('http')
const https = require('https')

class SPAFallbackDetector {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.results = []
    
    // 测试路由 - 包括存在和不存在的路由
    this.testRoutes = [
      // 应该有独立响应的路由
      { path: '/dashboard', type: 'page', expected: 'unique_response' },
      { path: '/login', type: 'page', expected: 'unique_response' },
      { path: '/system/users', type: 'page', expected: 'unique_response' },
      { path: '/student', type: 'page', expected: 'unique_response' },
      { path: '/teacher', type: 'page', expected: 'unique_response' },
      
      // 应该返回404的路由
      { path: '/non-existent', type: 'missing', expected: 'fallback_or_404' },
      { path: '/fake-page', type: 'missing', expected: 'fallback_or_404' },
      { path: '/admin/secret', type: 'missing', expected: 'fallback_or_404' },
      
      // 深层路由
      { path: '/analytics/ReportBuilder', type: 'page', expected: 'unique_response' },
      { path: '/chat', type: 'page', expected: 'unique_response' },
      { path: '/marketing', type: 'page', expected: 'unique_response' },
      { path: '/ai/conversation/nlp-analytics', type: 'page', expected: 'unique_response' },
      
      // 静态资源（应该返回404）
      { path: '/static/js/nonexistent.js', type: 'static', expected: '404' },
      { path: '/assets/nonexistent.css', type: 'static', expected: '404' },
      
      // 根路径
      { path: '/', type: 'root', expected: 'unique_response' }
    ]
  }

  async runSPAFallbackDetection() {
    console.log('🔍 Starting SPA Fallback Detection...')
    console.log('🎯 Analyzing if all routes return index.html (fallback behavior)...\\n')
    
    // 首先获取根路径的响应作为基准
    console.log('📋 Step 1: Getting baseline response from root path...')
    const baselineResponse = await this.getBaselineResponse()
    
    console.log('\\n📋 Step 2: Testing all routes for fallback behavior...')
    
    for (const route of this.testRoutes) {
      await this.testRoute(route, baselineResponse)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.generateSPAFallbackReport()
  }

  async getBaselineResponse() {
    try {
      const response = await this.makeDetailedRequest('/')
      const analysis = this.analyzeResponse(response, '/')
      
      console.log('📊 Baseline Response Analysis:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Content-Type: ${response.headers['content-type'] || 'unknown'}`)
      console.log(`   Content-Length: ${response.data.length} bytes`)
      console.log(`   Response Hash: ${this.hashContent(response.data)}`)
      console.log(`   Contains Vue App: ${analysis.hasVueApp ? '✅' : '❌'}`)
      console.log(`   Contains Router: ${analysis.hasRouter ? '✅' : '❌'}`)
      
      return {
        status: response.status,
        contentHash: this.hashContent(response.data),
        contentLength: response.data.length,
        contentType: response.headers['content-type'],
        analysis: analysis
      }
      
    } catch (error) {
      console.log('❌ Failed to get baseline response:', error.message)
      return null
    }
  }

  async testRoute(route, baseline) {
    try {
      const response = await this.makeDetailedRequest(route.path)
      const analysis = this.analyzeResponse(response, route.path)
      
      // 检查是否是fallback响应
      const isFallback = this.isFallbackResponse(response, baseline)
      
      const result = {
        path: route.path,
        type: route.type,
        expected: route.expected,
        status: response.status,
        contentType: response.headers['content-type'],
        contentLength: response.data.length,
        contentHash: this.hashContent(response.data),
        isFallback: isFallback,
        analysis: analysis,
        success: this.evaluateSuccess(route, response, isFallback)
      }
      
      this.results.push(result)
      this.logRouteResult(result)
      
    } catch (error) {
      const result = {
        path: route.path,
        type: route.type,
        expected: route.expected,
        status: 0,
        error: error.message,
        isFallback: false,
        success: false
      }
      
      this.results.push(result)
      this.logRouteResult(result)
    }
  }

  async makeDetailedRequest(path) {
    const url = `${this.frontendURL}${path}`
    
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (SPA Fallback Detector)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        }
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
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

  analyzeResponse(response, path) {
    const analysis = {
      hasVueApp: false,
      hasRouter: false,
      hasSpecificContent: false,
      isIndexHtml: false,
      pageType: 'unknown'
    }
    
    if (!response.data) return analysis
    
    const content = response.data.toLowerCase()
    
    // 检查是否是index.html
    if (content.includes('<title>') && content.includes('vue') && content.includes('id="app"')) {
      analysis.isIndexHtml = true
      analysis.pageType = 'index_html'
    }
    
    // 检查Vue应用
    if (content.includes('vue') || content.includes('id="app"')) {
      analysis.hasVueApp = true
    }
    
    // 检查Vue Router
    if (content.includes('vue-router') || content.includes('router')) {
      analysis.hasRouter = true
    }
    
    // 检查特定内容
    const specificPatterns = [
      'dashboard', 'login', 'system', 'student', 'teacher',
      'analytics', 'chat', 'marketing', 'ai', 'class'
    ]
    
    const hasSpecific = specificPatterns.some(pattern => 
      content.includes(pattern) && path.includes(pattern)
    )
    
    if (hasSpecific) {
      analysis.hasSpecificContent = true
      analysis.pageType = 'specific_content'
    }
    
    return analysis
  }

  isFallbackResponse(response, baseline) {
    if (!baseline) return false
    
    // 检查内容哈希是否相同
    const sameHash = this.hashContent(response.data) === baseline.contentHash
    
    // 检查内容长度是否相似（允许小幅差异）
    const lengthDiff = Math.abs(response.data.length - baseline.contentLength)
    const similarLength = lengthDiff < 1000 // 允许1KB差异
    
    // 检查内容类型
    const sameContentType = response.headers['content-type'] === baseline.contentType
    
    return sameHash || (similarLength && sameContentType)
  }

  hashContent(content) {
    // 简单的哈希函数
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(16)
  }

  evaluateSuccess(route, response, isFallback) {
    switch (route.expected) {
      case 'unique_response':
        return response.status === 200 && !isFallback
      case 'fallback_or_404':
        return response.status === 404 || isFallback
      case '404':
        return response.status === 404
      default:
        return response.status === 200
    }
  }

  logRouteResult(result) {
    const icon = result.success ? '✅' : '❌'
    const path = result.path.padEnd(35)
    const type = result.type.padEnd(8)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const fallback = result.isFallback ? '🔄FALLBACK' : '📄UNIQUE'
    
    console.log(`   ${icon} ${path} ${type} ${status} ${fallback}`)
    
    if (result.analysis && result.analysis.pageType) {
      console.log(`        📝 Response Type: ${result.analysis.pageType}`)
    }
    
    if (result.error) {
      console.log(`        ❌ Error: ${result.error}`)
    }
  }

  generateSPAFallbackReport() {
    console.log('\\n' + '='.repeat(80))
    console.log('🔍 SPA FALLBACK DETECTION REPORT')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const fallbackRoutes = this.results.filter(r => r.isFallback).length
    const uniqueRoutes = this.results.filter(r => !r.isFallback && r.status === 200).length
    
    console.log('\\n📈 Overall Results:')
    console.log(`   Total Routes Tested: ${total}`)
    console.log(`   ✅ Expected Behavior: ${successful} (${((successful/total)*100).toFixed(1)}%)`)
    console.log(`   🔄 Fallback Responses: ${fallbackRoutes} (${((fallbackRoutes/total)*100).toFixed(1)}%)`)
    console.log(`   📄 Unique Responses: ${uniqueRoutes} (${((uniqueRoutes/total)*100).toFixed(1)}%)`)
    
    // 按路由类型分析
    console.log('\\n📊 Route Type Analysis:')
    const routeTypes = ['page', 'missing', 'static', 'root']
    routeTypes.forEach(type => {
      const typeResults = this.results.filter(r => r.type === type)
      const typeFallbacks = typeResults.filter(r => r.isFallback).length
      const typeUnique = typeResults.filter(r => !r.isFallback && r.status === 200).length
      
      console.log(`   ${type.toUpperCase().padEnd(8)}: ${typeUnique} unique, ${typeFallbacks} fallback`)
    })
    
    // 问题分析
    console.log('\\n🔍 Problem Analysis:')
    
    const pageRoutesFallback = this.results.filter(r => r.type === 'page' && r.isFallback)
    if (pageRoutesFallback.length > 0) {
      console.log(`   🚨 MAJOR ISSUE: ${pageRoutesFallback.length} page routes return fallback response`)
      console.log('     This means all routes are serving index.html instead of unique content')
      console.log('     This is exactly the problem you reported!')
      
      console.log('\\n     Problematic Routes:')
      pageRoutesFallback.forEach(result => {
        console.log(`       - ${result.path}`)
      })
    }
    
    const missingRoutesNotFallback = this.results.filter(r => r.type === 'missing' && !r.isFallback && r.status === 200)
    if (missingRoutesNotFallback.length > 0) {
      console.log(`   ⚠️ ISSUE: ${missingRoutesNotFallback.length} missing routes return unique content`)
      console.log('     Non-existent routes should return 404 or fallback to index.html')
    }
    
    // 根本原因分析
    console.log('\\n🔧 Root Cause Analysis:')
    if (fallbackRoutes > total * 0.8) {
      console.log('   🎯 ROOT CAUSE: Web server fallback configuration')
      console.log('     - All routes are configured to serve index.html')
      console.log('     - This is common in SPA deployments but indicates routing issues')
      console.log('     - Vue Router should handle different routes on client-side')
      console.log('     - The issue is that Vue Router is not properly differentiating routes')
    }
    
    // 解决方案建议
    console.log('\\n💡 Solution Recommendations:')
    console.log('   1. 🔧 Check Vite/Webpack dev server configuration')
    console.log('   2. 📝 Review Vue Router route definitions')
    console.log('   3. 🎯 Ensure each route loads different components')
    console.log('   4. 🔄 Verify client-side routing is working correctly')
    console.log('   5. 📊 Add unique identifiers to each page component')
    
    // 测试建议
    console.log('\\n🧪 Testing Recommendations:')
    console.log('   - Check browser network tab to see actual responses')
    console.log('   - Look for different component content in each route')
    console.log('   - Verify Vue Router is loading correct components')
    console.log('   - Test with browser dev tools to see route changes')
    
    // 最终评估
    const assessment = this.getFinalAssessment(fallbackRoutes, uniqueRoutes, total)
    console.log('\\n🏆 Final Assessment:')
    console.log(`   SPA Routing Status: ${assessment.status}`)
    console.log(`   ${assessment.message}`)
    
    console.log('\\n' + '='.repeat(80))
  }

  getFinalAssessment(fallbackRoutes, uniqueRoutes, total) {
    const fallbackRate = (fallbackRoutes / total) * 100
    const uniqueRate = (uniqueRoutes / total) * 100
    
    if (fallbackRate > 80) {
      return {
        status: 'CRITICAL',
        message: '🚨 Critical! Almost all routes return the same content. This confirms the issue you reported!'
      }
    } else if (fallbackRate > 50) {
      return {
        status: 'POOR',
        message: '⚠️ Poor! Many routes return fallback content. Major routing issues detected.'
      }
    } else if (fallbackRate > 20) {
      return {
        status: 'FAIR',
        message: '🔧 Fair. Some routes have fallback issues. Needs investigation.'
      }
    } else {
      return {
        status: 'GOOD',
        message: '✅ Good! Most routes return unique content. Minor issues detected.'
      }
    }
  }
}

// 运行SPA Fallback检测
if (require.main === module) {
  const detector = new SPAFallbackDetector()
  detector.runSPAFallbackDetection().catch(console.error)
}

module.exports = { SPAFallbackDetector }