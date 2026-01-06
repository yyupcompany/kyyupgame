/**
 * Vue App Checker
 * Vue 应用检查器 - 模拟浏览器环境检查Vue应用是否正确加载
 */

const http = require('http')
const https = require('https')
const { JSDOM } = require('jsdom')

class VueAppChecker {
  constructor() {
    this.frontendHost = '0.0.0.0'
    this.frontendPort = 5173
    this.backendHost = '0.0.0.0'
    this.backendPort = 3000
  }

  async checkVueApp() {
    console.log('🔍 开始检查 Vue 应用状态...')
    
    try {
      // 1. 获取HTML内容
      console.log('📋 Step 1: 获取 HTML 内容...')
      const htmlResponse = await this.makeRequest(this.frontendHost, this.frontendPort, '/')
      
      if (htmlResponse.status !== 200) {
        console.log(`❌ HTML 获取失败: ${htmlResponse.status}`)
        return false
      }
      
      console.log(`✅ HTML 获取成功: ${htmlResponse.data.length} 字符`)
      
      // 2. 检查HTML结构
      console.log('\n📋 Step 2: 分析 HTML 结构...')
      const htmlAnalysis = this.analyzeHTML(htmlResponse.data)
      this.logHTMLAnalysis(htmlAnalysis)
      
      // 3. 检查关键资源
      console.log('\n📋 Step 3: 检查关键资源...')
      const resourceCheck = await this.checkResources()
      this.logResourceCheck(resourceCheck)
      
      // 4. 模拟浏览器环境
      console.log('\n📋 Step 4: 模拟浏览器环境...')
      const browserCheck = await this.simulateBrowser(htmlResponse.data)
      this.logBrowserCheck(browserCheck)
      
      // 5. 生成诊断报告
      console.log('\n📋 Step 5: 生成诊断报告...')
      this.generateDiagnosticReport({
        html: htmlAnalysis,
        resources: resourceCheck,
        browser: browserCheck
      })
      
      return true
      
    } catch (error) {
      console.error('❌ 检查过程中发生错误:', error.message)
      return false
    }
  }

  analyzeHTML(html) {
    return {
      hasVueApp: html.includes('id="app"'),
      hasViteClient: html.includes('/@vite/client'),
      hasMainScript: html.includes('/src/main.ts'),
      hasTitle: html.includes('<title>'),
      hasMetaViewport: html.includes('name="viewport"'),
      contentLength: html.length,
      title: (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || 'No title'
    }
  }

  async checkResources() {
    const resources = [
      { name: 'Vite Client', path: '/@vite/client' },
      { name: 'Main Script', path: '/src/main.ts' },
      { name: 'App Component', path: '/src/App.vue' },
      { name: 'Router', path: '/src/router/index.ts' },
      { name: 'Backend Health', host: this.backendHost, port: this.backendPort, path: '/api/health' }
    ]
    
    const results = {}
    
    for (const resource of resources) {
      try {
        const host = resource.host || this.frontendHost
        const port = resource.port || this.frontendPort
        const response = await this.makeRequest(host, port, resource.path)
        
        results[resource.name] = {
          status: response.status,
          success: response.status === 200,
          contentLength: response.data.length,
          error: null
        }
        
      } catch (error) {
        results[resource.name] = {
          status: 0,
          success: false,
          contentLength: 0,
          error: error.message
        }
      }
    }
    
    return results
  }

  async simulateBrowser(html) {
    try {
      // 创建JSDOM环境
      const dom = new JSDOM(html, {
        url: `http://${this.frontendHost}:${this.frontendPort}/`,
        resources: 'usable',
        runScripts: 'dangerously'
      })
      
      const window = dom.window
      const document = window.document
      
      // 等待DOM加载完成
      await new Promise(resolve => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve)
        } else {
          resolve()
        }
      })
      
      // 检查关键DOM元素
      const appElement = document.getElementById('app')
      const scripts = document.querySelectorAll('script')
      
      // 模拟等待Vue应用加载
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        hasAppElement: !!appElement,
        appElementContent: appElement ? appElement.innerHTML : '',
        appElementEmpty: appElement ? appElement.innerHTML.trim() === '' : true,
        scriptsCount: scripts.length,
        hasVueGlobal: typeof window.Vue !== 'undefined',
        hasVueApp: typeof window.__VUE_APP__ !== 'undefined',
        windowVars: Object.keys(window).filter(key => key.startsWith('__VUE')),
        errors: []
      }
      
    } catch (error) {
      return {
        hasAppElement: false,
        appElementContent: '',
        appElementEmpty: true,
        scriptsCount: 0,
        hasVueGlobal: false,
        hasVueApp: false,
        windowVars: [],
        errors: [error.message]
      }
    }
  }

  async makeRequest(host, port, path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: host,
        port: port,
        path: path,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Vue-App-Checker',
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

  logHTMLAnalysis(analysis) {
    console.log('🔍 HTML 结构分析结果:')
    console.log(`   Vue App 容器: ${analysis.hasVueApp ? '✅' : '❌'}`)
    console.log(`   Vite 客户端: ${analysis.hasViteClient ? '✅' : '❌'}`)
    console.log(`   主脚本: ${analysis.hasMainScript ? '✅' : '❌'}`)
    console.log(`   页面标题: ${analysis.title}`)
    console.log(`   内容长度: ${analysis.contentLength} 字符`)
  }

  logResourceCheck(resources) {
    console.log('🔍 资源检查结果:')
    Object.entries(resources).forEach(([name, result]) => {
      const status = result.success ? '✅' : '❌'
      const info = result.success ? 
        `${result.status} (${result.contentLength} 字符)` : 
        `${result.status || 'ERROR'} - ${result.error || 'Unknown error'}`
      console.log(`   ${name}: ${status} ${info}`)
    })
  }

  logBrowserCheck(browserCheck) {
    console.log('🔍 浏览器模拟结果:')
    console.log(`   App 元素存在: ${browserCheck.hasAppElement ? '✅' : '❌'}`)
    console.log(`   App 元素为空: ${browserCheck.appElementEmpty ? '⚠️' : '✅'}`)
    console.log(`   脚本数量: ${browserCheck.scriptsCount}`)
    console.log(`   Vue 全局对象: ${browserCheck.hasVueGlobal ? '✅' : '❌'}`)
    console.log(`   Vue 应用实例: ${browserCheck.hasVueApp ? '✅' : '❌'}`)
    console.log(`   Window Vue 变量: ${browserCheck.windowVars.join(', ') || '无'}`)
    
    if (browserCheck.errors.length > 0) {
      console.log(`   错误: ${browserCheck.errors.join(', ')}`)
    }
  }

  generateDiagnosticReport(checks) {
    console.log('\n' + '='.repeat(80))
    console.log('🔍 VUE 应用诊断报告')
    console.log('='.repeat(80))
    
    // 基础状态
    console.log('\n📊 基础状态:')
    console.log(`   HTML 结构: ${checks.html.hasVueApp && checks.html.hasViteClient && checks.html.hasMainScript ? '✅ 正常' : '❌ 异常'}`)
    console.log(`   资源加载: ${Object.values(checks.resources).every(r => r.success) ? '✅ 正常' : '❌ 异常'}`)
    console.log(`   浏览器渲染: ${checks.browser.hasAppElement && !checks.browser.appElementEmpty ? '✅ 正常' : '❌ 异常'}`)
    
    // 问题诊断
    console.log('\n🔧 问题诊断:')
    
    if (!checks.html.hasVueApp) {
      console.log('   🚨 关键问题: HTML 中缺少 Vue App 容器 (#app)')
    }
    
    if (!checks.html.hasViteClient || !checks.html.hasMainScript) {
      console.log('   🚨 关键问题: 缺少关键的 JavaScript 资源')
    }
    
    const failedResources = Object.entries(checks.resources).filter(([name, result]) => !result.success)
    if (failedResources.length > 0) {
      console.log('   🚨 资源加载失败:')
      failedResources.forEach(([name, result]) => {
        console.log(`     - ${name}: ${result.error || `HTTP ${result.status}`}`)
      })
    }
    
    if (checks.browser.hasAppElement && checks.browser.appElementEmpty) {
      console.log('   🚨 关键问题: Vue 应用没有正确渲染 (App 元素为空)')
      console.log('     - 可能原因: JavaScript 执行失败')
      console.log('     - 可能原因: Vue Router 配置错误')
      console.log('     - 可能原因: 组件加载失败')
    }
    
    if (!checks.browser.hasVueApp) {
      console.log('   🚨 关键问题: Vue 应用实例未创建')
      console.log('     - 检查 main.ts 中的 createApp 调用')
      console.log('     - 检查是否有 JavaScript 错误')
    }
    
    // 解决方案建议
    console.log('\n💡 解决方案建议:')
    console.log('   1. 🔍 检查浏览器控制台的 JavaScript 错误')
    console.log('   2. 🔧 确认 Vue Router 配置正确')
    console.log('   3. 📝 检查 App.vue 中的 router-view 组件')
    console.log('   4. 🎯 确认所有路由组件都能正确导入')
    console.log('   5. 📊 检查 Vite 配置是否正确')
    
    console.log('\n' + '='.repeat(80))
  }
}

// 运行检查
if (require.main === module) {
  const checker = new VueAppChecker()
  checker.checkVueApp().catch(console.error)
}

module.exports = { VueAppChecker }