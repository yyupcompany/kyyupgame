/**
 * 详细路由分析工具
 * 分析所有组件和路由的精确匹配情况
 */

const fs = require('fs')
const path = require('path')

class DetailedRouteAnalyzer {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
  }

  async analyzeDetailedRoutes() {
    console.log('🔍 详细路由分析')
    console.log('=' .repeat(60))
    
    // 1. 扫描所有文件（包括备份）
    console.log('📋 Step 1: 扫描所有Vue文件...')
    const allFiles = this.scanAllVueFiles()
    console.log(`   📊 总文件数: ${allFiles.total}`)
    console.log(`   ✅ 有效组件: ${allFiles.valid.length}`)
    console.log(`   🗂️ 跳过文件: ${allFiles.skipped.length}`)
    
    // 2. 分析路由配置详情
    console.log('\n📋 Step 2: 分析路由配置详情...')
    const routeAnalysis = this.analyzeRouteConfiguration()
    console.log(`   📊 路由定义: ${routeAnalysis.totalRoutes}`)
    console.log(`   📊 组件导入: ${routeAnalysis.componentImports}`)
    console.log(`   📊 路径配置: ${routeAnalysis.pathConfigs}`)
    
    // 3. 精确匹配分析
    console.log('\n📋 Step 3: 精确匹配分析...')
    const matchAnalysis = this.performExactMatching(allFiles.valid, routeAnalysis)
    
    // 4. 显示详细结果
    this.displayDetailedResults(matchAnalysis)
    
    // 5. 生成100%覆盖的路由配置
    if (matchAnalysis.unmatched.length > 0) {
      console.log('\n📋 Step 4: 生成100%覆盖路由配置...')
      const completeConfig = this.generateCompleteRouteConfig(matchAnalysis.unmatched)
      return completeConfig
    }
    
    return null
  }

  scanAllVueFiles() {
    const result = {
      total: 0,
      valid: [],
      skipped: []
    }
    
    const scanDir = (dir, prefix = '') => {
      try {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory()) {
            scanDir(fullPath, prefix + item + '/')
          } else if (item.endsWith('.vue')) {
            result.total++
            const relativePath = prefix + item
            
            if (this.shouldSkipFile(item, fullPath, relativePath)) {
              result.skipped.push({
                name: item,
                path: relativePath,
                fullPath: fullPath,
                reason: this.getSkipReason(item, relativePath)
              })
            } else {
              const componentInfo = this.analyzeComponentDetailed(fullPath, relativePath)
              if (componentInfo) {
                result.valid.push(componentInfo)
              }
            }
          }
        }
      } catch (error) {
        console.warn(`   ⚠️ 无法访问目录 ${dir}: ${error.message}`)
      }
    }
    
    scanDir(this.pagesDir)
    return result
  }

  shouldSkipFile(filename, fullPath, relativePath) {
    // 更严格的跳过条件
    const skipPatterns = [
      /backup/i,
      /\.backup\./i,
      /-backup\./i,
      /\.bak\./i,
      /-bak\./i,
      /template/i,
      /\.template\./i,
      /example/i,
      /\.example\./i
    ]
    
    return skipPatterns.some(pattern => 
      pattern.test(filename) || pattern.test(relativePath)
    )
  }

  getSkipReason(filename, relativePath) {
    if (/backup/i.test(filename) || /backup/i.test(relativePath)) return '备份文件'
    if (/template/i.test(filename) || /template/i.test(relativePath)) return '模板文件'
    if (/example/i.test(filename) || /example/i.test(relativePath)) return '示例文件'
    return '其他原因'
  }

  analyzeComponentDetailed(fullPath, relativePath) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8')
      const componentName = path.basename(relativePath, '.vue')
      
      // 生成可能的路由路径
      const possiblePaths = this.generatePossibleRoutePaths(relativePath)
      
      return {
        name: componentName,
        relativePath: relativePath,
        fullPath: fullPath,
        component: `@/pages/${relativePath}`,
        possiblePaths: possiblePaths,
        title: this.extractTitle(content, componentName),
        category: this.determineCategory(relativePath),
        hasContent: this.hasRealContent(content),
        isDialog: this.isDialogComponent(content, relativePath),
        priority: this.determinePriority(relativePath)
      }
    } catch (error) {
      console.warn(`   ⚠️ 无法分析组件 ${relativePath}: ${error.message}`)
      return null
    }
  }

  generatePossibleRoutePaths(relativePath) {
    const paths = []
    let basePath = relativePath.replace(/\.vue$/, '')
    
    // 1. 直接路径
    paths.push(basePath)
    
    // 2. 去掉index的路径
    if (basePath.endsWith('/index')) {
      paths.push(basePath.replace(/\/index$/, ''))
    }
    
    // 3. 参数路径转换
    const paramPath = basePath
      .replace(/\[(\w+)\]/g, ':$1')  // [id] -> :id
      .replace(/_(\w+)/g, ':$1')     // _id -> :id
    
    if (paramPath !== basePath) {
      paths.push(paramPath)
    }
    
    // 4. 带前缀的路径
    paths.push('/' + basePath)
    
    return [...new Set(paths)] // 去重
  }

  analyzeRouteConfiguration() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      
      // 提取所有路由定义
      const pathMatches = content.match(/path:\s*['"`]([^'"`]+)['"`]/g) || []
      const componentMatches = content.match(/import\(['"`]@\/pages\/([^'"`]+)['"`]\)/g) || []
      const nameMatches = content.match(/name:\s*['"`]([^'"`]+)['"`]/g) || []
      
      const paths = pathMatches.map(match => {
        const pathMatch = match.match(/path:\s*['"`]([^'"`]+)['"`]/)
        return pathMatch ? pathMatch[1] : null
      }).filter(Boolean)
      
      const components = componentMatches.map(match => {
        const compMatch = match.match(/import\(['"`]@\/pages\/([^'"`]+)['"`]\)/)
        return compMatch ? compMatch[1] : null
      }).filter(Boolean)
      
      const names = nameMatches.map(match => {
        const nameMatch = match.match(/name:\s*['"`]([^'"`]+)['"`]/)
        return nameMatch ? nameMatch[1] : null
      }).filter(Boolean)
      
      return {
        totalRoutes: Math.max(paths.length, components.length, names.length),
        pathConfigs: paths,
        componentImports: components,
        routeNames: names,
        content: content
      }
    } catch (error) {
      console.warn(`   ⚠️ 无法读取路由文件: ${error.message}`)
      return {
        totalRoutes: 0,
        pathConfigs: [],
        componentImports: [],
        routeNames: [],
        content: ''
      }
    }
  }

  performExactMatching(validComponents, routeAnalysis) {
    const matched = []
    const unmatched = []
    
    for (const component of validComponents) {
      let isMatched = false
      let matchType = ''
      let matchedRoute = ''
      
      // 检查组件导入匹配
      for (const importedComponent of routeAnalysis.componentImports) {
        if (importedComponent === component.relativePath) {
          isMatched = true
          matchType = 'component-import'
          matchedRoute = importedComponent
          break
        }
      }
      
      // 如果没有组件匹配，检查路径匹配
      if (!isMatched) {
        for (const routePath of routeAnalysis.pathConfigs) {
          for (const possiblePath of component.possiblePaths) {
            if (this.isPathMatch(routePath, possiblePath)) {
              isMatched = true
              matchType = 'path-match'
              matchedRoute = routePath
              break
            }
          }
          if (isMatched) break
        }
      }
      
      if (isMatched) {
        matched.push({
          ...component,
          matchType,
          matchedRoute
        })
      } else {
        unmatched.push(component)
      }
    }
    
    return {
      matched,
      unmatched,
      totalComponents: validComponents.length,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      coveragePercent: (matched.length / validComponents.length * 100).toFixed(1)
    }
  }

  isPathMatch(routePath, componentPath) {
    // 规范化路径进行比较
    const normalizeRoute = (path) => path.replace(/^\/+|\/+$/g, '').toLowerCase()
    const normalizedRoute = normalizeRoute(routePath)
    const normalizedComponent = normalizeRoute(componentPath)
    
    return normalizedRoute === normalizedComponent ||
           normalizedRoute.endsWith(normalizedComponent) ||
           normalizedComponent.endsWith(normalizedRoute)
  }

  displayDetailedResults(matchAnalysis) {
    console.log(`\n📊 匹配结果统计:`)
    console.log(`   ✅ 已匹配组件: ${matchAnalysis.matchedCount}`)
    console.log(`   ❌ 未匹配组件: ${matchAnalysis.unmatchedCount}`)
    console.log(`   📈 覆盖率: ${matchAnalysis.coveragePercent}%`)
    
    if (matchAnalysis.unmatched.length > 0) {
      console.log(`\n❌ 未配置路由的组件 (${matchAnalysis.unmatchedCount}个):`)
      
      // 按分类显示
      const categorized = {}
      for (const component of matchAnalysis.unmatched) {
        const category = component.category
        if (!categorized[category]) categorized[category] = []
        categorized[category].push(component)
      }
      
      for (const [category, components] of Object.entries(categorized)) {
        console.log(`\n   📂 ${this.getCategoryName(category)} (${components.length}个):`)
        for (const component of components) {
          const status = component.hasContent ? '✅' : '🚧'
          console.log(`     ${status} ${component.name} (${component.relativePath})`)
        }
      }
    }
  }

  getCategoryName(category) {
    const names = {
      'ai': '🤖 AI功能',
      'analytics': '📈 数据分析', 
      'dashboard': '📊 仪表板',
      'demo': '🧪 演示页面',
      'marketing': '📢 营销管理',
      'customer': '👤 客户管理',
      'system': '⚙️ 系统管理',
      'principal': '👑 园长功能',
      'activity': '🎯 活动管理',
      'enrollment': '📝 招生管理',
      'parent': '👨‍👩‍👧‍👦 家长管理',
      'teacher': '👩‍🏫 教师管理',
      'other': '📁 其他'
    }
    return names[category] || `📁 ${category}`
  }

  generateCompleteRouteConfig(unmatchedComponents) {
    console.log(`\n🔧 生成100%覆盖路由配置...`)
    
    let routeConfig = '\n      // 🎯 100%覆盖 - 新增路由配置\n'
    
    // 按分类组织路由
    const categorized = {}
    for (const component of unmatchedComponents) {
      const category = component.category
      if (!categorized[category]) categorized[category] = []
      categorized[category].push(component)
    }
    
    for (const [category, components] of Object.entries(categorized)) {
      routeConfig += `\n      // ${this.getCategoryName(category).replace(/[🤖📈📊🧪📢👤⚙️👑🎯📝👨‍👩‍👧‍👦👩‍🏫📁]/g, '')} - ${components.length}个页面\n`
      
      for (const component of components) {
        routeConfig += this.generateSingleRouteConfig(component)
      }
    }
    
    console.log(`   📊 生成了 ${unmatchedComponents.length} 个新路由配置`)
    return routeConfig
  }

  generateSingleRouteConfig(component) {
    const routePath = component.possiblePaths[0] // 使用第一个可能的路径
    const routeName = this.generateRouteName(component.relativePath)
    const permission = this.generatePermission(component.category)
    const hideInMenu = component.isDialog || 
                      routePath.includes(':') || 
                      routePath.includes('[') ||
                      component.category === 'demo' ||
                      !component.hasContent
    
    return `      {
        path: '${routePath}',
        name: '${routeName}',
        component: () => import('${component.component}'),
        meta: {
          title: '${component.title}',${hideInMenu ? '\n          hideInMenu: true,' : ''}
          requiresAuth: true,${permission ? `\n          permission: '${permission}',` : ''}
          priority: '${component.priority}'
        }
      },\n`
  }

  // 其他辅助方法（复用之前的代码）
  extractTitle(content, componentName) {
    const titlePatterns = [
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /title:\s*['"`]([^'"`]+)['"`]/i,
      /页面标题['":\s]*([^'"\n]+)/i
    ]
    
    for (const pattern of titlePatterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }
    
    return this.generateTitleFromName(componentName)
  }

  generateTitleFromName(componentName) {
    const titleMap = {
      'prediction-engine': '预测分析引擎',
      'nlp-analytics': 'NLP分析',
      '3d-analytics': '3D数据分析',
      'intelligent-analysis': '智能分析',
      'intelligent-management': '智能管理',
      'funnel-analytics': '漏斗分析',
      'ReportBuilder': '报表构建器',
      'GlobalStyleTest': '全局样式测试',
      'TemplateDemo': '模板演示',
      'ImageUploaderDemo': '图片上传演示'
    }
    
    return titleMap[componentName] || componentName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  determineCategory(relativePath) {
    if (relativePath.startsWith('ai/')) return 'ai'
    if (relativePath.startsWith('analytics/')) return 'analytics'
    if (relativePath.startsWith('dashboard/')) return 'dashboard'
    if (relativePath.startsWith('demo/')) return 'demo'
    if (relativePath.startsWith('marketing/')) return 'marketing'
    if (relativePath.startsWith('customer/')) return 'customer'
    if (relativePath.startsWith('system/')) return 'system'
    if (relativePath.startsWith('principal/')) return 'principal'
    if (relativePath.startsWith('activity/')) return 'activity'
    if (relativePath.startsWith('enrollment')) return 'enrollment'
    if (relativePath.startsWith('parent/')) return 'parent'
    if (relativePath.startsWith('teacher/')) return 'teacher'
    return 'other'
  }

  hasRealContent(content) {
    return content.includes('<template>') && 
           content.includes('<script>') && 
           content.length > 800
  }

  isDialogComponent(content, relativePath) {
    return content.includes('el-dialog') || 
           relativePath.includes('Dialog') || 
           relativePath.includes('components/')
  }

  determinePriority(relativePath) {
    if (relativePath.includes('index.vue') || relativePath.includes('dashboard')) return 'high'
    if (relativePath.includes('demo') || relativePath.includes('Dialog')) return 'low'
    return 'medium'
  }

  generateRouteName(relativePath) {
    return relativePath
      .replace(/\.vue$/, '')
      .replace(/\//g, '')
      .replace(/[[\]_-]/g, '')
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  generatePermission(category) {
    const permissions = {
      'student': 'STUDENT_VIEW',
      'teacher': 'TEACHER_VIEW',
      'parent': 'PARENT_VIEW',
      'ai': 'AI_ASSISTANT_USE',
      'analytics': 'STATISTICS_VIEW',
      'system': 'SYSTEM_MANAGE',
      'principal': 'PRINCIPAL_VIEW'
    }
    return permissions[category] || null
  }
}

// 运行分析
if (require.main === module) {
  const analyzer = new DetailedRouteAnalyzer()
  analyzer.analyzeDetailedRoutes()
    .then(result => {
      if (result) {
        console.log('\n📋 100%覆盖路由配置已生成！')
        console.log('下一步：应用配置到路由文件')
      } else {
        console.log('\n🎉 恭喜！已达到100%路由覆盖率！')
      }
    })
    .catch(console.error)
}

module.exports = { DetailedRouteAnalyzer }