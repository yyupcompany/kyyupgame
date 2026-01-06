/**
 * Page Content Analyzer
 * 页面内容分析器 - 分析前端页面的实际内容
 */

const http = require('http')
const fs = require('fs')

class PageContentAnalyzer {
  constructor() {
    this.frontendHost = '0.0.0.0'
    this.frontendPort = 5173
  }

  async analyzePage(path) {
    try {
      const response = await this.makeDirectRequest(path)
      
      console.log(`\n📋 分析页面: ${path}`)
      console.log(`状态码: ${response.status}`)
      console.log(`内容长度: ${response.data.length} 字符`)
      console.log(`内容类型: ${response.headers['content-type']}`)
      
      // 分析 HTML 结构
      const analysis = this.analyzeHTML(response.data)
      
      console.log('\n🔍 HTML 结构分析:')
      console.log(`- 包含 Vue App: ${analysis.hasVueApp ? '✅' : '❌'}`)
      console.log(`- 包含 Router View: ${analysis.hasRouterView ? '✅' : '❌'}`)
      console.log(`- 页面标题: ${analysis.pageTitle || '无'}`)
      console.log(`- 包含的脚本: ${analysis.scripts.length} 个`)
      console.log(`- 包含的样式: ${analysis.styles.length} 个`)
      
      // 检查是否包含 Vue Router 相关代码
      if (analysis.hasRouterCode) {
        console.log('✅ 包含 Vue Router 相关代码')
      } else {
        console.log('❌ 未检测到 Vue Router 相关代码')
      }
      
      // 检查是否是 SPA 应用
      if (analysis.isSPA) {
        console.log('✅ 这是一个 SPA 应用')
      } else {
        console.log('❌ 这不是一个 SPA 应用')
      }
      
      // 保存页面内容到文件以供进一步分析
      const filename = `/home/devbox/project/client/tests/e2e-api-integration/page-content-${path.replace(/[\/\\:]/g, '_')}.html`
      fs.writeFileSync(filename, response.data)
      console.log(`📄 页面内容已保存到: ${filename}`)
      
      return analysis
      
    } catch (error) {
      console.error(`❌ 分析页面 ${path} 失败:`, error.message)
      return null
    }
  }

  analyzeHTML(htmlContent) {
    const analysis = {
      hasVueApp: false,
      hasRouterView: false,
      hasRouterCode: false,
      isSPA: false,
      pageTitle: '',
      scripts: [],
      styles: [],
      bodyContent: ''
    }
    
    if (!htmlContent) return analysis
    
    const lowerContent = htmlContent.toLowerCase()
    
    // 检查 Vue 应用
    analysis.hasVueApp = lowerContent.includes('id="app"') || lowerContent.includes('vue')
    
    // 检查 Router View
    analysis.hasRouterView = lowerContent.includes('router-view') || lowerContent.includes('routerview')
    
    // 检查 Router 相关代码
    analysis.hasRouterCode = lowerContent.includes('router') || lowerContent.includes('vue-router')
    
    // 检查是否是 SPA
    analysis.isSPA = analysis.hasVueApp && (analysis.hasRouterView || analysis.hasRouterCode)
    
    // 提取页面标题
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      analysis.pageTitle = titleMatch[1].trim()
    }
    
    // 提取脚本
    const scriptMatches = htmlContent.match(/<script[^>]*src="([^"]*)"[^>]*>/gi)
    if (scriptMatches) {
      analysis.scripts = scriptMatches.map(match => {
        const srcMatch = match.match(/src="([^"]*)"/)
        return srcMatch ? srcMatch[1] : ''
      }).filter(Boolean)
    }
    
    // 提取样式
    const styleMatches = htmlContent.match(/<link[^>]*href="([^"]*)"[^>]*rel="stylesheet"[^>]*>/gi)
    if (styleMatches) {
      analysis.styles = styleMatches.map(match => {
        const hrefMatch = match.match(/href="([^"]*)"/)
        return hrefMatch ? hrefMatch[1] : ''
      }).filter(Boolean)
    }
    
    // 提取 body 内容
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      analysis.bodyContent = bodyMatch[1].trim()
    }
    
    return analysis
  }

  async makeDirectRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.frontendHost,
        port: this.frontendPort,
        path: path,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Page-Content-Analyzer',
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

  async runAnalysis() {
    console.log('🔍 开始页面内容分析...')
    
    const pagesToAnalyze = [
      '/',
      '/dashboard',
      '/login',
      '/student'
    ]
    
    for (const path of pagesToAnalyze) {
      await this.analyzePage(path)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('\n📊 分析完成！')
    console.log('💡 建议：')
    console.log('1. 检查 Vue Router 是否正确配置')
    console.log('2. 确认各个页面组件是否正确导入')
    console.log('3. 检查路由守卫是否影响页面加载')
    console.log('4. 查看浏览器开发者工具的 Network 和 Console 选项卡')
  }
}

// 运行分析
if (require.main === module) {
  const analyzer = new PageContentAnalyzer()
  analyzer.runAnalysis().catch(console.error)
}

module.exports = { PageContentAnalyzer }