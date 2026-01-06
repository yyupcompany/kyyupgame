/**
 * 404 Page Analysis Tool
 * 404页面分析工具
 */

const fs = require('fs')
const path = require('path')

class PageAnalyzer {
  constructor() {
    this.frontendPagesPath = '/home/devbox/project/client/src/pages'
    this.routesPath = '/home/devbox/project/client/src/router/optimized-routes.ts'
    this.testedPages = [
      '/',
      '/login',
      '/dashboard',
      '/students',
      '/teachers',
      '/classes',
      '/users',
      '/activities',
      '/parents',
      '/enrollment-plan'
    ]
    this.foundPages = []
    this.routeDefinitions = []
    this.pageStatus = {}
  }

  async analyzePages() {
    console.log('🔍 Analyzing existing pages and routes...\n')
    
    // 1. 扫描实际存在的页面文件
    this.scanPageFiles(this.frontendPagesPath)
    
    // 2. 分析路由定义
    this.analyzeRoutes()
    
    // 3. 分析404页面
    this.analyze404Pages()
    
    // 4. 生成报告
    this.generateReport()
  }

  scanPageFiles(dir, prefix = '') {
    try {
      const files = fs.readdirSync(dir)
      
      for (const file of files) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          // 递归扫描子目录
          this.scanPageFiles(fullPath, prefix ? `${prefix}/${file}` : file)
        } else if (file.endsWith('.vue') || file === 'index.vue') {
          // 发现页面文件
          const pagePath = this.getPagePath(prefix, file)
          this.foundPages.push({
            path: pagePath,
            file: fullPath,
            exists: true,
            type: this.getPageType(fullPath)
          })
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${dir}:`, error.message)
    }
  }

  getPagePath(prefix, file) {
    if (file === 'index.vue') {
      return prefix ? `/${prefix}` : '/'
    }
    
    const name = file.replace('.vue', '')
    return prefix ? `/${prefix}/${name}` : `/${name}`
  }

  getPageType(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查是否包含API调用
    const hasApiCall = content.includes('api/') || content.includes('ENDPOINTS')
    
    // 检查是否包含数据表格
    const hasDataTable = content.includes('el-table') || content.includes('table')
    
    // 检查是否包含表单
    const hasForm = content.includes('el-form') || content.includes('form')
    
    // 检查是否为空组件
    const isEmpty = content.includes('EmptyState') || content.includes('暂无数据')
    
    return {
      hasApiCall,
      hasDataTable,
      hasForm,
      isEmpty,
      size: content.length
    }
  }

  analyzeRoutes() {
    try {
      const routeContent = fs.readFileSync(this.routesPath, 'utf-8')
      
      // 简单的路由提取 (可以改进为更精确的解析)
      const routeMatches = routeContent.match(/path:\s*['"`]([^'"`]+)['"`]/g)
      
      if (routeMatches) {
        for (const match of routeMatches) {
          const path = match.match(/path:\s*['"`]([^'"`]+)['"`]/)[1]
          this.routeDefinitions.push(path)
        }
      }
    } catch (error) {
      console.error('❌ Error analyzing routes:', error.message)
    }
  }

  analyze404Pages() {
    for (const testedPage of this.testedPages) {
      const foundPage = this.foundPages.find(p => p.path === testedPage)
      const hasRoute = this.routeDefinitions.includes(testedPage)
      
      this.pageStatus[testedPage] = {
        exists: !!foundPage,
        hasRoute,
        status: this.getPageStatus(foundPage, hasRoute),
        details: foundPage || null
      }
    }
  }

  getPageStatus(foundPage, hasRoute) {
    if (!foundPage && !hasRoute) return 'NOT_FOUND'
    if (!foundPage && hasRoute) return 'ROUTE_ONLY'
    if (foundPage && !hasRoute) return 'FILE_ONLY'
    if (foundPage && hasRoute) return 'COMPLETE'
    return 'UNKNOWN'
  }

  generateReport() {
    console.log('📊 PAGE ANALYSIS REPORT')
    console.log('=' .repeat(80))
    
    // 1. 测试页面状态
    console.log('\n🔍 Tested Pages Status:')
    const statusCounts = { COMPLETE: 0, NOT_FOUND: 0, ROUTE_ONLY: 0, FILE_ONLY: 0 }
    
    for (const [page, status] of Object.entries(this.pageStatus)) {
      const icon = this.getStatusIcon(status.status)
      const details = this.getStatusDetails(status)
      
      console.log(`${icon} ${page.padEnd(20)} ${status.status.padEnd(12)} ${details}`)
      statusCounts[status.status]++
    }
    
    console.log(`\n📈 Status Summary:`)
    console.log(`   ✅ COMPLETE: ${statusCounts.COMPLETE} (${((statusCounts.COMPLETE/this.testedPages.length)*100).toFixed(1)}%)`)
    console.log(`   ❌ NOT_FOUND: ${statusCounts.NOT_FOUND} (${((statusCounts.NOT_FOUND/this.testedPages.length)*100).toFixed(1)}%)`)
    console.log(`   🔗 ROUTE_ONLY: ${statusCounts.ROUTE_ONLY} (${((statusCounts.ROUTE_ONLY/this.testedPages.length)*100).toFixed(1)}%)`)
    console.log(`   📄 FILE_ONLY: ${statusCounts.FILE_ONLY} (${((statusCounts.FILE_ONLY/this.testedPages.length)*100).toFixed(1)}%)`)
    
    // 2. 发现的所有页面
    console.log('\n📂 All Discovered Pages:')
    const categorizedPages = this.categorizePages()
    
    for (const [category, pages] of Object.entries(categorizedPages)) {
      console.log(`\n🏷️ ${category.toUpperCase()} (${pages.length} pages):`)
      pages.forEach(page => {
        const apiStatus = page.type.hasApiCall ? '📡' : '📄'
        const dataStatus = page.type.hasDataTable ? '📊' : ''
        const formStatus = page.type.hasForm ? '📝' : ''
        const emptyStatus = page.type.isEmpty ? '🗑️' : ''
        
        console.log(`   ${apiStatus}${dataStatus}${formStatus}${emptyStatus} ${page.path}`)
      })
    }
    
    // 3. 404修复建议
    console.log('\n🔧 404 Fix Recommendations:')
    this.generateFixRecommendations()
    
    // 4. 页面质量分析
    console.log('\n📊 Page Quality Analysis:')
    this.analyzePageQuality()
  }

  getStatusIcon(status) {
    const icons = {
      'COMPLETE': '✅',
      'NOT_FOUND': '❌',
      'ROUTE_ONLY': '🔗',
      'FILE_ONLY': '📄',
      'UNKNOWN': '❓'
    }
    return icons[status] || '❓'
  }

  getStatusDetails(status) {
    if (status.status === 'COMPLETE') {
      const type = status.details.type
      const features = []
      if (type.hasApiCall) features.push('API')
      if (type.hasDataTable) features.push('Table')
      if (type.hasForm) features.push('Form')
      return features.length > 0 ? `[${features.join(', ')}]` : '[Static]'
    }
    
    if (status.status === 'NOT_FOUND') {
      return '[Missing both file and route]'
    }
    
    if (status.status === 'ROUTE_ONLY') {
      return '[Route exists but no component file]'
    }
    
    if (status.status === 'FILE_ONLY') {
      return '[Component file exists but no route]'
    }
    
    return ''
  }

  categorizePages() {
    const categories = {
      dashboard: [],
      management: [],
      system: [],
      auxiliary: [],
      other: []
    }
    
    for (const page of this.foundPages) {
      if (page.path.includes('/dashboard')) {
        categories.dashboard.push(page)
      } else if (page.path.includes('/student') || page.path.includes('/teacher') || 
                 page.path.includes('/class') || page.path.includes('/parent')) {
        categories.management.push(page)
      } else if (page.path.includes('/system') || page.path.includes('/user') || 
                 page.path.includes('/role') || page.path.includes('/permission')) {
        categories.system.push(page)
      } else if (page.path.includes('/ai') || page.path.includes('/activity') || 
                 page.path.includes('/enrollment')) {
        categories.auxiliary.push(page)
      } else {
        categories.other.push(page)
      }
    }
    
    return categories
  }

  generateFixRecommendations() {
    const notFoundPages = Object.entries(this.pageStatus)
      .filter(([_, status]) => status.status === 'NOT_FOUND')
      .map(([page, _]) => page)
    
    if (notFoundPages.length === 0) {
      console.log('   🎉 All tested pages are properly configured!')
      return
    }
    
    console.log('   Priority fixes needed:')
    notFoundPages.forEach(page => {
      const recommendation = this.getFixRecommendation(page)
      console.log(`   ${page}: ${recommendation}`)
    })
  }

  getFixRecommendation(page) {
    const similarPages = this.findSimilarPages(page)
    
    if (similarPages.length > 0) {
      return `Create similar to ${similarPages[0].path}`
    }
    
    // 基于页面路径推荐
    const recommendations = {
      '/': 'Create main dashboard page',
      '/dashboard': 'Create dashboard/index.vue',
      '/students': 'Create student/index.vue with data table',
      '/teachers': 'Create teacher/index.vue with data table',
      '/classes': 'Create class/index.vue with data table',
      '/users': 'Create system/users/index.vue',
      '/activities': 'Create activity/index.vue',
      '/parents': 'Create parent/index.vue',
      '/enrollment-plan': 'Create enrollment-plan/index.vue'
    }
    
    return recommendations[page] || 'Create new page component'
  }

  findSimilarPages(targetPage) {
    const keywords = targetPage.split('/').filter(k => k.length > 0)
    
    return this.foundPages.filter(page => {
      return keywords.some(keyword => 
        page.path.toLowerCase().includes(keyword.toLowerCase())
      )
    })
  }

  analyzePageQuality() {
    const pagesWithApi = this.foundPages.filter(p => p.type.hasApiCall)
    const pagesWithoutApi = this.foundPages.filter(p => !p.type.hasApiCall)
    const emptyPages = this.foundPages.filter(p => p.type.isEmpty)
    
    console.log(`   📡 Pages with API integration: ${pagesWithApi.length}/${this.foundPages.length} (${((pagesWithApi.length/this.foundPages.length)*100).toFixed(1)}%)`)
    console.log(`   📄 Static pages: ${pagesWithoutApi.length}/${this.foundPages.length} (${((pagesWithoutApi.length/this.foundPages.length)*100).toFixed(1)}%)`)
    console.log(`   🗑️ Empty/placeholder pages: ${emptyPages.length}/${this.foundPages.length} (${((emptyPages.length/this.foundPages.length)*100).toFixed(1)}%)`)
    
    if (emptyPages.length > 0) {
      console.log('\n   Empty pages that need implementation:')
      emptyPages.forEach(page => {
        console.log(`     - ${page.path}`)
      })
    }
  }
}

// 运行分析
if (require.main === module) {
  const analyzer = new PageAnalyzer()
  analyzer.analyzePages().catch(console.error)
}

module.exports = { PageAnalyzer }