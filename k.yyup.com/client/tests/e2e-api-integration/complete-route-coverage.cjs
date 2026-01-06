/**
 * 完整路由覆盖分析工具
 * 分析所有页面组件并生成完整的路由配置
 */

const fs = require('fs')
const path = require('path')

class CompleteRouteCoverageAnalyzer {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
  }

  async analyzeCompleteCoverage() {
    console.log('🎯 完整路由覆盖分析')
    console.log('=' .repeat(60))
    
    // 1. 扫描所有页面组件
    console.log('📋 Step 1: 扫描所有页面组件...')
    const allComponents = this.scanAllPageComponents()
    console.log(`   📊 发现 ${allComponents.length} 个页面组件`)
    
    // 2. 分析当前路由配置
    console.log('\n📋 Step 2: 分析当前路由配置...')
    const currentRoutes = this.analyzeCurrentRoutes()
    console.log(`   📊 当前已配置 ${currentRoutes.length} 个路由`)
    
    // 3. 找出未配置路由的组件
    console.log('\n📋 Step 3: 找出未配置路由的组件...')
    const missingRoutes = this.findMissingRoutes(allComponents, currentRoutes)
    console.log(`   📊 需要添加 ${missingRoutes.length} 个路由`)
    
    // 4. 分类未配置的组件
    console.log('\n📋 Step 4: 分类未配置的组件...')
    const categorizedMissing = this.categorizeComponents(missingRoutes)
    this.displayCategorization(categorizedMissing)
    
    // 5. 生成完整路由配置
    console.log('\n📋 Step 5: 生成完整路由配置...')
    const routeConfig = this.generateCompleteRouteConfig(categorizedMissing)
    
    return {
      allComponents,
      currentRoutes,
      missingRoutes,
      categorizedMissing,
      routeConfig
    }
  }

  scanAllPageComponents() {
    const components = []
    
    const scanDir = (dir, prefix = '') => {
      try {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory()) {
            scanDir(fullPath, prefix + item + '/')
          } else if (item.endsWith('.vue') && !this.shouldSkipComponent(item, fullPath)) {
            const componentInfo = this.analyzeComponent(fullPath, prefix + item)
            if (componentInfo) {
              components.push(componentInfo)
            }
          }
        }
      } catch (error) {
        console.warn(`   ⚠️ 无法访问目录 ${dir}: ${error.message}`)
      }
    }
    
    scanDir(this.pagesDir)
    return components.sort((a, b) => a.path.localeCompare(b.path))
  }

  shouldSkipComponent(filename, fullPath) {
    // 跳过备份、模板、示例文件
    const skipPatterns = [
      /backup/i,
      /\.backup\./i,
      /-backup\./i,
      /template/i,
      /example/i,
      /demo/i,
      /test/i
    ]
    
    const relativePath = path.relative(this.pagesDir, fullPath)
    return skipPatterns.some(pattern => pattern.test(filename) || pattern.test(relativePath))
  }

  analyzeComponent(fullPath, relativePath) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8')
      const componentName = path.basename(relativePath, '.vue')
      const dirPath = path.dirname(relativePath).replace(/\/$/, '')
      
      // 分析组件类型和用途
      const componentType = this.determineComponentType(fullPath, content)
      const routePath = this.generateRoutePath(relativePath)
      const routeName = this.generateRouteName(relativePath)
      
      return {
        name: componentName,
        path: routePath,
        routeName: routeName,
        component: `@/pages/${relativePath}`,
        fullPath: fullPath,
        relativePath: relativePath,
        type: componentType,
        title: this.extractTitle(content, componentName),
        hasContent: this.hasRealContent(content),
        category: this.determineCategory(relativePath),
        priority: this.determinePriority(relativePath, componentType)
      }
    } catch (error) {
      console.warn(`   ⚠️ 无法分析组件 ${relativePath}: ${error.message}`)
      return null
    }
  }

  determineComponentType(fullPath, content) {
    // 根据文件路径和内容判断组件类型
    if (content.includes('el-table') || content.includes('Table')) return 'list'
    if (content.includes('el-form') || content.includes('Form')) return 'form'
    if (content.includes('el-dialog') || content.includes('Dialog')) return 'dialog'
    if (content.includes('detail') || fullPath.includes('detail')) return 'detail'
    if (content.includes('chart') || content.includes('echarts')) return 'chart'
    if (fullPath.includes('dashboard')) return 'dashboard'
    if (fullPath.includes('ai')) return 'ai'
    if (fullPath.includes('analytics')) return 'analytics'
    return 'page'
  }

  generateRoutePath(relativePath) {
    // 将文件路径转换为路由路径
    let routePath = relativePath
      .replace(/\.vue$/, '')
      .replace(/\/index$/, '')
      .replace(/\[(\w+)\]/g, ':$1')  // [id] -> :id
      .replace(/_(\w+)/g, ':$1')     // _id -> :id
    
    // 处理特殊情况
    if (routePath === '404' || routePath === '403') {
      return `/${routePath}`
    }
    
    return routePath
  }

  generateRouteName(relativePath) {
    // 生成路由名称
    return relativePath
      .replace(/\.vue$/, '')
      .replace(/\//g, '')
      .replace(/[[\]]/g, '')
      .replace(/_/g, '')
      .replace(/-/g, '')
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  extractTitle(content, componentName) {
    // 从组件内容中提取标题
    const titlePatterns = [
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<title[^>]*>([^<]+)<\/title>/i,
      /title:\s*['"`]([^'"`]+)['"`]/i,
      /页面标题['":\s]*([^'"\n]+)/i
    ]
    
    for (const pattern of titlePatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    // 根据组件名生成标题
    return this.generateTitleFromName(componentName)
  }

  generateTitleFromName(componentName) {
    const titleMap = {
      // AI相关
      'prediction-engine': '预测分析引擎',
      'nlp-analytics': 'NLP分析',
      '3d-analytics': '3D数据分析',
      'maintenance-optimizer': '维护优化器',
      
      // 业务相关
      'intelligent-analysis': '智能分析',
      'intelligent-management': '智能管理',
      'intelligent-engine': '智能引擎',
      'intelligent-dashboard': '智能仪表板',
      'smart-hub': '智能中心',
      'smart-management': '智能管理',
      
      // 分析相关
      'funnel-analytics': '漏斗分析',
      'lifecycle': '生命周期',
      'decision-support': '决策支持',
      'performance': '绩效分析',
      
      // 常用功能
      'automated-follow-up': '自动跟进',
      'personalized-strategy': '个性化策略',
      'ai-forecasting': 'AI预测',
      'ReportBuilder': '报表构建器'
    }
    
    return titleMap[componentName] || componentName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  hasRealContent(content) {
    // 判断组件是否有实际内容
    const hasTemplate = content.includes('<template>')
    const hasScript = content.includes('<script>')
    const hasStyle = content.includes('<style>')
    const contentLength = content.length
    
    // 简单的内容检查
    return hasTemplate && hasScript && contentLength > 1000
  }

  determineCategory(relativePath) {
    const categoryMap = {
      'dashboard': 'dashboard',
      'ai': 'ai',
      'analytics': 'analytics', 
      'activity': 'activity',
      'student': 'student',
      'teacher': 'teacher',
      'parent': 'parent',
      'class': 'class',
      'enrollment': 'enrollment',
      'enrollment-plan': 'enrollment-plan',
      'system': 'system',
      'principal': 'principal',
      'marketing': 'marketing',
      'customer': 'customer',
      'application': 'application',
      'advertisement': 'advertisement',
      'statistics': 'statistics',
      'chat': 'chat',
      'demo': 'demo'
    }
    
    for (const [key, category] of Object.entries(categoryMap)) {
      if (relativePath.startsWith(key + '/')) {
        return category
      }
    }
    
    return 'other'
  }

  determinePriority(relativePath, componentType) {
    // 高优先级：核心业务页面
    if (relativePath.includes('dashboard') || relativePath.includes('index.vue')) return 'high'
    if (['student', 'teacher', 'class', 'parent'].some(module => relativePath.startsWith(module + '/'))) return 'high'
    
    // 中优先级：功能页面
    if (['activity', 'enrollment', 'system'].some(module => relativePath.startsWith(module + '/'))) return 'medium'
    
    // 低优先级：高级功能和分析页面
    if (relativePath.includes('ai') || relativePath.includes('analytics')) return 'low'
    if (relativePath.includes('demo') || componentType === 'dialog') return 'low'
    
    return 'medium'
  }

  analyzeCurrentRoutes() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      const routes = []
      
      // 简单的路由提取（匹配 path: 'xxx' 模式）
      const pathMatches = content.match(/path:\s*['"`]([^'"`]+)['"`]/g) || []
      
      pathMatches.forEach(match => {
        const pathMatch = match.match(/path:\s*['"`]([^'"`]+)['"`]/)
        if (pathMatch) {
          routes.push(pathMatch[1])
        }
      })
      
      return routes
    } catch (error) {
      console.warn(`   ⚠️ 无法读取路由文件: ${error.message}`)
      return []
    }
  }

  findMissingRoutes(allComponents, currentRoutes) {
    const missing = []
    
    for (const component of allComponents) {
      const hasRoute = currentRoutes.some(route => {
        // 检查是否有匹配的路由
        return route === component.path || 
               route.endsWith(component.path) ||
               component.path.endsWith(route) ||
               this.isRouteMatch(route, component.path)
      })
      
      if (!hasRoute) {
        missing.push(component)
      }
    }
    
    return missing
  }

  isRouteMatch(route, componentPath) {
    // 更复杂的路由匹配逻辑
    const routeNormalized = route.replace(/^\/+|\/+$/g, '').replace(/[:\[\]]/g, '')
    const pathNormalized = componentPath.replace(/^\/+|\/+$/g, '').replace(/[:\[\]]/g, '')
    
    return routeNormalized === pathNormalized ||
           routeNormalized.includes(pathNormalized) ||
           pathNormalized.includes(routeNormalized)
  }

  categorizeComponents(components) {
    const categorized = {}
    
    for (const component of components) {
      const category = component.category
      if (!categorized[category]) {
        categorized[category] = []
      }
      categorized[category].push(component)
    }
    
    // 按优先级排序每个分类
    for (const category in categorized) {
      categorized[category].sort((a, b) => {
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    }
    
    return categorized
  }

  displayCategorization(categorized) {
    console.log('\n📂 组件分类统计:')
    
    const categoryNames = {
      'dashboard': '📊 仪表板',
      'ai': '🤖 AI功能', 
      'analytics': '📈 数据分析',
      'activity': '🎯 活动管理',
      'student': '👨‍🎓 学生管理',
      'teacher': '👩‍🏫 教师管理',
      'parent': '👨‍👩‍👧‍👦 家长管理',
      'class': '🏫 班级管理',
      'enrollment': '📝 招生管理',
      'enrollment-plan': '📋 招生计划',
      'system': '⚙️ 系统管理',
      'principal': '👑 园长功能',
      'marketing': '📢 营销管理',
      'customer': '👤 客户管理',
      'application': '📄 申请管理',
      'advertisement': '📺 广告管理',
      'statistics': '📊 统计分析',
      'chat': '💬 聊天功能',
      'demo': '🧪 演示页面',
      'other': '📁 其他'
    }
    
    let totalMissing = 0
    for (const [category, components] of Object.entries(categorized)) {
      const name = categoryNames[category] || `📁 ${category}`
      console.log(`   ${name}: ${components.length} 个组件`)
      totalMissing += components.length
      
      // 显示高优先级组件
      const highPriority = components.filter(c => c.priority === 'high')
      if (highPriority.length > 0) {
        console.log(`     🔴 高优先级: ${highPriority.map(c => c.name).join(', ')}`)
      }
    }
    
    console.log(`   📊 总计: ${totalMissing} 个未配置路由的组件`)
  }

  generateCompleteRouteConfig(categorizedMissing) {
    let routeConfig = ''
    
    // 按分类生成路由配置
    for (const [category, components] of Object.entries(categorizedMissing)) {
      if (components.length === 0) continue
      
      routeConfig += `\n      // ${this.getCategoryComment(category)} - ${components.length}个页面\n`
      
      for (const component of components) {
        const route = this.generateSingleRoute(component)
        routeConfig += route + '\n'
      }
    }
    
    return routeConfig
  }

  getCategoryComment(category) {
    const comments = {
      'ai': 'AI智能功能模块',
      'analytics': '数据分析模块', 
      'dashboard': '仪表板子页面',
      'demo': '演示和测试页面',
      'marketing': '营销管理模块',
      'customer': '客户管理模块',
      'other': '其他功能页面'
    }
    
    return comments[category] || `${category}模块`
  }

  generateSingleRoute(component) {
    const hideInMenu = component.priority === 'low' || 
                      component.type === 'dialog' || 
                      component.category === 'demo' ||
                      component.path.includes('detail') ||
                      component.path.includes('[') ||
                      component.path.includes(':')
    
    const permission = this.generatePermission(component.category)
    
    return `      {
        path: '${component.path}',
        name: '${component.routeName}',
        component: () => import('${component.component}'),
        meta: {
          title: '${component.title}',${hideInMenu ? '\n          hideInMenu: true,' : ''}
          requiresAuth: true,${permission ? `\n          permission: '${permission}',` : ''}
          priority: '${component.priority}'
        }
      },`
  }

  generatePermission(category) {
    const permissions = {
      'student': 'STUDENT_VIEW',
      'teacher': 'TEACHER_VIEW', 
      'parent': 'PARENT_VIEW',
      'class': 'CLASS_VIEW',
      'activity': 'ACTIVITY_VIEW',
      'enrollment': 'ENROLLMENT_VIEW',
      'enrollment-plan': 'ENROLLMENT_PLAN_VIEW',
      'system': 'SYSTEM_MANAGE',
      'principal': 'PRINCIPAL_VIEW',
      'ai': 'AI_ASSISTANT_USE',
      'analytics': 'STATISTICS_VIEW'
    }
    
    return permissions[category] || null
  }
}

// 运行分析
if (require.main === module) {
  const analyzer = new CompleteRouteCoverageAnalyzer()
  analyzer.analyzeCompleteCoverage()
    .then(result => {
      console.log(`\n🎯 分析完成！`)
      console.log(`📊 总组件数: ${result.allComponents.length}`)
      console.log(`✅ 已配置路由: ${result.currentRoutes.length}`)
      console.log(`❌ 未配置路由: ${result.missingRoutes.length}`)
      console.log(`📈 当前覆盖率: ${((result.currentRoutes.length / result.allComponents.length) * 100).toFixed(1)}%`)
      
      if (result.routeConfig) {
        console.log(`\n📋 生成的路由配置已准备就绪，包含 ${result.missingRoutes.length} 个新路由`)
      }
    })
    .catch(console.error)
}

module.exports = { CompleteRouteCoverageAnalyzer }