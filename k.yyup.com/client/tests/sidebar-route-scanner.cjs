/**
 * 侧边栏路由扫描器
 * 扫描导航配置中的所有链接，检查对应的路由和组件是否存在
 */

const fs = require('fs')
const path = require('path')

class SidebarRouteScanner {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.navigationFile = path.join(this.projectRoot, 'src/config/navigation.ts')
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
  }

  async scanSidebarRoutes() {
    console.log('🔍 侧边栏路由扫描开始')
    console.log('=' .repeat(60))
    
    // 1. 解析导航配置
    console.log('📋 Step 1: 解析导航配置...')
    const navigationRoutes = this.parseNavigationConfig()
    console.log(`   📊 发现 ${navigationRoutes.length} 个导航链接`)
    
    // 2. 解析路由配置
    console.log('\n📋 Step 2: 解析路由配置...')
    const routeConfigs = this.parseRouteConfig()
    console.log(`   📊 发现 ${routeConfigs.length} 个路由配置`)
    
    // 3. 扫描现有页面组件
    console.log('\n📋 Step 3: 扫描现有页面组件...')
    const existingComponents = this.scanExistingComponents()
    console.log(`   📊 发现 ${existingComponents.length} 个页面组件`)
    
    // 4. 检查路由匹配情况
    console.log('\n📋 Step 4: 检查路由匹配情况...')
    const matchResults = this.checkRouteMatches(navigationRoutes, routeConfigs, existingComponents)
    
    // 5. 生成修复建议
    console.log('\n📋 Step 5: 生成修复建议...')
    const fixSuggestions = this.generateFixSuggestions(matchResults)
    
    // 6. 显示结果
    this.displayResults(matchResults, fixSuggestions)
    
    return { matchResults, fixSuggestions }
  }

  parseNavigationConfig() {
    try {
      const content = fs.readFileSync(this.navigationFile, 'utf8')
      const routes = []
      
      // 提取所有包含route字段的配置
      const routeMatches = content.match(/route:\s*['"`]([^'"`]+)['"`]/g) || []
      const titleMatches = content.match(/title:\s*['"`]([^'"`]+)['"`]/g) || []
      const idMatches = content.match(/id:\s*['"`]([^'"`]+)['"`]/g) || []
      
      for (let i = 0; i < routeMatches.length; i++) {
        const routeMatch = routeMatches[i].match(/route:\s*['"`]([^'"`]+)['"`]/)
        const title = titleMatches[i] ? titleMatches[i].match(/title:\s*['"`]([^'"`]+)['"`]/)[1] : ''
        const id = idMatches[i] ? idMatches[i].match(/id:\s*['"`]([^'"`]+)['"`]/)[1] : ''
        
        if (routeMatch) {
          routes.push({
            id: id,
            title: title,
            route: routeMatch[1],
            cleanPath: this.cleanRoutePath(routeMatch[1])
          })
        }
      }
      
      return routes
    } catch (error) {
      console.warn(`   ⚠️ 无法读取导航配置: ${error.message}`)
      return []
    }
  }

  parseRouteConfig() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      const routes = []
      
      // 提取所有路由路径
      const pathMatches = content.match(/path:\s*['"`]([^'"`]+)['"`]/g) || []
      const nameMatches = content.match(/name:\s*['"`]([^'"`]+)['"`]/g) || []
      const componentMatches = content.match(/component:\s*([^,}]+)/g) || []
      
      for (let i = 0; i < pathMatches.length; i++) {
        const pathMatch = pathMatches[i].match(/path:\s*['"`]([^'"`]+)['"`]/)
        const nameMatch = nameMatches[i] ? nameMatches[i].match(/name:\s*['"`]([^'"`]+)['"`]/) : null
        const componentMatch = componentMatches[i] ? componentMatches[i].match(/component:\s*([^,}]+)/) : null
        
        if (pathMatch) {
          const fullPath = pathMatch[1].startsWith('/') ? pathMatch[1] : '/' + pathMatch[1]
          routes.push({
            path: pathMatch[1],
            fullPath: fullPath,
            name: nameMatch ? nameMatch[1] : '',
            component: componentMatch ? componentMatch[1].trim() : '',
            isCommented: false
          })
        }
      }
      
      // 检查被注释的路由
      const commentedMatches = content.match(/\/\/\s*path:\s*['"`]([^'"`]+)['"`]/g) || []
      for (const match of commentedMatches) {
        const pathMatch = match.match(/\/\/\s*path:\s*['"`]([^'"`]+)['"`]/)
        if (pathMatch) {
          const fullPath = pathMatch[1].startsWith('/') ? pathMatch[1] : '/' + pathMatch[1]
          routes.push({
            path: pathMatch[1],
            fullPath: fullPath,
            name: '',
            component: '',
            isCommented: true
          })
        }
      }
      
      return routes
    } catch (error) {
      console.warn(`   ⚠️ 无法读取路由配置: ${error.message}`)
      return []
    }
  }

  scanExistingComponents() {
    const components = []
    
    const scanDir = (dir, prefix = '') => {
      try {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory()) {
            scanDir(fullPath, prefix + item + '/')
          } else if (item.endsWith('.vue') && !this.shouldSkipComponent(item)) {
            components.push({
              name: item.replace('.vue', ''),
              relativePath: prefix + item,
              fullPath: fullPath,
              possibleRoutePaths: this.generatePossibleRoutePaths(prefix + item)
            })
          }
        }
      } catch (error) {
        // 忽略访问错误
      }
    }
    
    scanDir(this.pagesDir)
    return components
  }

  shouldSkipComponent(filename) {
    const skipPatterns = [
      /backup/i, /\.backup\./i, /-backup\./i,
      /template/i, /example/i, /test/i,
      /incomplete/i, /\.bak\./i
    ]
    return skipPatterns.some(pattern => pattern.test(filename))
  }

  generatePossibleRoutePaths(relativePath) {
    const paths = []
    let basePath = relativePath.replace(/\.vue$/, '')
    
    // 1. 直接路径
    paths.push('/' + basePath)
    
    // 2. 去掉index的路径
    if (basePath.endsWith('/index')) {
      paths.push('/' + basePath.replace(/\/index$/, ''))
    }
    
    // 3. Dashboard子路径
    paths.push('/dashboard/' + basePath)
    if (basePath.startsWith('dashboard/')) {
      paths.push('/' + basePath)
    }
    
    return [...new Set(paths)]
  }

  cleanRoutePath(route) {
    return route.replace(/^\/+|\/+$/g, '').toLowerCase()
  }

  checkRouteMatches(navigationRoutes, routeConfigs, existingComponents) {
    const results = []
    
    for (const navRoute of navigationRoutes) {
      const result = {
        navigation: navRoute,
        hasRoute: false,
        matchedRoute: null,
        hasComponent: false,
        suggestedComponent: null,
        status: 'missing'
      }
      
      // 检查是否有匹配的路由配置
      const matchedRoute = routeConfigs.find(route => {
        const routePath = route.fullPath.replace(/^\/+|\/+$/g, '').toLowerCase()
        const navPath = navRoute.cleanPath
        return routePath === navPath || 
               routePath.endsWith(navPath) ||
               navPath.endsWith(routePath)
      })
      
      if (matchedRoute) {
        result.hasRoute = true
        result.matchedRoute = matchedRoute
        if (!matchedRoute.isCommented) {
          result.status = 'ok'
        } else {
          result.status = 'commented'
        }
      }
      
      // 查找可能的组件
      const suggestedComponent = this.findSuggestedComponent(navRoute, existingComponents)
      if (suggestedComponent) {
        result.hasComponent = true
        result.suggestedComponent = suggestedComponent
        if (!result.hasRoute) {
          result.status = 'needs-route'
        }
      }
      
      results.push(result)
    }
    
    return results
  }

  findSuggestedComponent(navRoute, existingComponents) {
    const navTitle = navRoute.title.toLowerCase()
    const navPath = navRoute.cleanPath.toLowerCase()
    const navId = navRoute.id.toLowerCase()
    
    // 查找匹配的组件
    for (const component of existingComponents) {
      const componentName = component.name.toLowerCase()
      const componentPath = component.relativePath.toLowerCase()
      
      // 检查多种匹配方式
      if (this.isComponentMatch(navTitle, navPath, navId, componentName, componentPath)) {
        return component
      }
    }
    
    return null
  }

  isComponentMatch(navTitle, navPath, navId, componentName, componentPath) {
    // 1. 直接名称匹配
    if (componentName.includes(navId) || navId.includes(componentName)) {
      return true
    }
    
    // 2. 路径匹配
    if (componentPath.includes(navPath) || navPath.includes(componentPath)) {
      return true
    }
    
    // 3. 语义匹配
    const semanticMatches = {
      'notification-center': ['importantnotices', 'notices', 'notification'],
      'schedule': ['schedule', 'calendar'],
      'analytics': ['analytics', 'analysis', 'statistics'],
      'enrollment-trends': ['enrollmenttrends', 'trends'],
      'financial-analysis': ['financialanalysis', 'financial'],
      'student-performance': ['studentperformance', 'performance'],
      'teacher-effectiveness': ['teachereffectiveness', 'effectiveness'],
      'kpi-dashboard': ['kpidashboard', 'kpi'],
      'performance-overview': ['performanceoverview', 'performance']
    }
    
    for (const [key, matches] of Object.entries(semanticMatches)) {
      if (navId.includes(key) || navPath.includes(key)) {
        return matches.some(match => componentName.includes(match) || componentPath.includes(match))
      }
    }
    
    return false
  }

  generateFixSuggestions(matchResults) {
    const suggestions = []
    
    for (const result of matchResults) {
      if (result.status === 'missing' && result.hasComponent) {
        suggestions.push({
          type: 'add-route',
          navRoute: result.navigation,
          component: result.suggestedComponent,
          description: `为 ${result.navigation.title} 添加路由配置`
        })
      } else if (result.status === 'commented' && result.hasComponent) {
        suggestions.push({
          type: 'uncomment-route',
          navRoute: result.navigation,
          component: result.suggestedComponent,
          description: `启用 ${result.navigation.title} 的注释路由`
        })
      } else if (result.status === 'missing' && !result.hasComponent) {
        suggestions.push({
          type: 'missing-component',
          navRoute: result.navigation,
          description: `${result.navigation.title} 缺少对应的页面组件`
        })
      }
    }
    
    return suggestions
  }

  displayResults(matchResults, fixSuggestions) {
    console.log('\n📊 扫描结果统计:')
    
    const statusCounts = {
      ok: 0,
      missing: 0,
      commented: 0,
      'needs-route': 0
    }
    
    for (const result of matchResults) {
      statusCounts[result.status]++
    }
    
    console.log(`   ✅ 正常: ${statusCounts.ok}`)
    console.log(`   ❌ 缺失: ${statusCounts.missing}`)
    console.log(`   💤 被注释: ${statusCounts.commented}`)
    console.log(`   🔧 需要路由: ${statusCounts['needs-route']}`)
    
    console.log('\n❌ 有问题的路由:')
    for (const result of matchResults) {
      if (result.status !== 'ok') {
        const status = {
          'missing': '❌ 缺失',
          'commented': '💤 被注释',
          'needs-route': '🔧 需要路由'
        }[result.status] || '❓ 未知'
        
        console.log(`   ${status} ${result.navigation.title} (${result.navigation.route})`)
        if (result.suggestedComponent) {
          console.log(`       💡 建议组件: ${result.suggestedComponent.relativePath}`)
        }
      }
    }
    
    console.log('\n💡 修复建议:')
    for (const suggestion of fixSuggestions) {
      console.log(`   🔧 ${suggestion.description}`)
      if (suggestion.component) {
        console.log(`       📁 组件: ${suggestion.component.relativePath}`)
        console.log(`       🔗 路由: ${suggestion.navRoute.route}`)
      }
    }
  }
}

// 运行扫描
if (require.main === module) {
  const scanner = new SidebarRouteScanner()
  scanner.scanSidebarRoutes()
    .then(() => {
      console.log('\n✅ 侧边栏路由扫描完成!')
    })
    .catch(console.error)
}

module.exports = { SidebarRouteScanner }