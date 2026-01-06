/**
 * Route Guard Tester
 * 路由守卫测试器 - 模拟路由守卫的行为，检查认证问题
 */

const http = require('http')

class RouteGuardTester {
  constructor() {
    this.backendHost = '0.0.0.0'
    this.backendPort = 3000
    this.frontendHost = '0.0.0.0'
    this.frontendPort = 5173
  }

  async testRouteGuard() {
    console.log('🔍 开始测试路由守卫行为...')
    
    try {
      // 1. 模拟开发环境认证初始化
      console.log('📋 Step 1: 模拟开发环境认证初始化...')
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjEiLCJuYW1lIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5LCJkZXZNb2RlIjp0cnVlfQ.mockSignatureForDevAndTestingPurposesOnly'
      
      console.log('✅ 模拟 Token 创建成功')
      console.log(`   Token: ${mockToken.substring(0, 50)}...`)
      
      // 2. 测试 API 认证验证
      console.log('\n📋 Step 2: 测试 API 认证验证...')
      const authResult = await this.testAuthVerification(mockToken)
      
      // 3. 测试路由访问
      console.log('\n📋 Step 3: 测试路由访问...')
      const routeResult = await this.testRouteAccess()
      
      // 4. 生成诊断报告
      console.log('\n📋 Step 4: 生成诊断报告...')
      this.generateDiagnosticReport({
        token: mockToken,
        auth: authResult,
        route: routeResult
      })
      
      return true
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error.message)
      return false
    }
  }

  async testAuthVerification(token) {
    try {
      console.log('🔍 测试 /api/auth/verify 端点...')
      
      const response = await this.makeRequest(
        this.backendHost,
        this.backendPort,
        '/api/auth/verify',
        {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      )
      
      let data = null
      try {
        data = JSON.parse(response.data)
      } catch (e) {
        console.log('⚠️ 响应不是 JSON 格式')
      }
      
      const result = {
        status: response.status,
        success: response.status === 200,
        data: data,
        error: response.status !== 200 ? response.data : null
      }
      
      console.log(`   状态码: ${result.status}`)
      console.log(`   成功: ${result.success ? '✅' : '❌'}`)
      
      if (result.success && data) {
        console.log(`   用户信息: ${data.success ? '✅' : '❌'}`)
        if (data.data) {
          console.log(`   用户ID: ${data.data.id || 'N/A'}`)
          console.log(`   用户名: ${data.data.username || 'N/A'}`)
          console.log(`   角色: ${data.data.role || 'N/A'}`)
        }
      } else {
        console.log(`   错误: ${result.error}`)
      }
      
      return result
      
    } catch (error) {
      console.log(`❌ 认证验证失败: ${error.message}`)
      return {
        status: 0,
        success: false,
        data: null,
        error: error.message
      }
    }
  }

  async testRouteAccess() {
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/login', name: 'Login' }
    ]
    
    const results = []
    
    for (const route of routes) {
      try {
        console.log(`🔍 测试路由访问: ${route.path}`)
        
        const response = await this.makeRequest(
          this.frontendHost,
          this.frontendPort,
          route.path
        )
        
        const result = {
          path: route.path,
          name: route.name,
          status: response.status,
          success: response.status === 200,
          contentLength: response.data.length,
          hasVueApp: response.data.includes('id="app"'),
          hasMainScript: response.data.includes('/src/main.ts'),
          title: (response.data.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || 'No title'
        }
        
        console.log(`   状态码: ${result.status}`)
        console.log(`   成功: ${result.success ? '✅' : '❌'}`)
        console.log(`   Vue App: ${result.hasVueApp ? '✅' : '❌'}`)
        console.log(`   标题: ${result.title}`)
        
        results.push(result)
        
      } catch (error) {
        console.log(`❌ 路由访问失败: ${error.message}`)
        results.push({
          path: route.path,
          name: route.name,
          status: 0,
          success: false,
          error: error.message
        })
      }
    }
    
    return results
  }

  async makeRequest(host, port, path, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: host,
        port: port,
        path: path,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Route-Guard-Tester',
          'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Connection': 'keep-alive',
          ...headers
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

  generateDiagnosticReport(results) {
    console.log('\n' + '='.repeat(80))
    console.log('🔍 路由守卫诊断报告')
    console.log('='.repeat(80))
    
    const { token, auth, route } = results
    
    // 认证状态
    console.log('\n📊 认证状态:')
    console.log(`   Token 生成: ✅ 成功`)
    console.log(`   API 认证验证: ${auth.success ? '✅ 成功' : '❌ 失败'}`)
    
    if (!auth.success) {
      console.log(`   认证失败原因: ${auth.error}`)
    }
    
    // 路由访问状态
    console.log('\n📊 路由访问状态:')
    const successfulRoutes = route.filter(r => r.success)
    const failedRoutes = route.filter(r => !r.success)
    
    console.log(`   成功路由: ${successfulRoutes.length}/${route.length}`)
    console.log(`   失败路由: ${failedRoutes.length}/${route.length}`)
    
    if (successfulRoutes.length > 0) {
      console.log('\n✅ 成功访问的路由:')
      successfulRoutes.forEach(r => {
        console.log(`   - ${r.name} (${r.path}): ${r.title}`)
      })
    }
    
    if (failedRoutes.length > 0) {
      console.log('\n❌ 失败的路由:')
      failedRoutes.forEach(r => {
        console.log(`   - ${r.name} (${r.path}): ${r.error || `HTTP ${r.status}`}`)
      })
    }
    
    // 问题诊断
    console.log('\n🔧 问题诊断:')
    
    if (!auth.success) {
      console.log('   🚨 关键问题: API 认证验证失败')
      console.log('     - 这会导致路由守卫阻止所有页面访问')
      console.log('     - 检查后端 /api/auth/verify 端点是否正常')
      console.log('     - 检查 token 格式是否正确')
    }
    
    if (successfulRoutes.length === route.length) {
      console.log('   ✅ 所有路由都可以访问')
      console.log('   ✅ 前端服务器工作正常')
    }
    
    if (successfulRoutes.length > 0 && successfulRoutes.every(r => r.hasVueApp)) {
      console.log('   ✅ Vue 应用结构正常')
    }
    
    if (successfulRoutes.length > 0 && successfulRoutes.every(r => r.title === successfulRoutes[0].title)) {
      console.log('   ⚠️ 所有路由返回相同标题，可能是 SPA 路由问题')
    }
    
    // 解决方案建议
    console.log('\n💡 解决方案建议:')
    
    if (!auth.success) {
      console.log('   1. 🔍 检查后端 /api/auth/verify 端点是否正常运行')
      console.log('   2. 🔧 检查 token 验证逻辑是否正确')
      console.log('   3. 📝 考虑在开发环境中跳过 API 认证验证')
    }
    
    console.log('   4. 🎯 检查 Vue Router 配置是否正确')
    console.log('   5. 📊 检查路由守卫逻辑是否有阻塞问题')
    console.log('   6. 🔧 检查 main.ts 中的 Vue 应用挂载是否成功')
    
    console.log('\n' + '='.repeat(80))
  }
}

// 运行测试
if (require.main === module) {
  const tester = new RouteGuardTester()
  tester.testRouteGuard().catch(console.error)
}

module.exports = { RouteGuardTester }