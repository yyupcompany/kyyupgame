/**
 * Navigation Route Checker
 * 导航路由检查器 - 专门检查navigation.ts中配置的所有路由
 */

const fs = require('fs')
const path = require('path')

class NavigationRouteChecker {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.navigationFile = path.join(this.projectRoot, 'src/config/navigation.ts')
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
    this.results = []
  }

  async checkAllNavigationRoutes() {
    console.log('🔍 开始检查导航配置中的所有路由...')
    console.log('📋 验证每个导航路由的配置状态...\n')
    
    // 1. 提取导航配置中的路由
    console.log('📋 Step 1: 提取导航配置中的路由...')
    const navigationRoutes = await this.extractNavigationRoutes()
    
    // 2. 读取路由配置
    console.log('\n📋 Step 2: 读取路由配置文件...')
    const routeConfig = await this.readRouteConfig()
    
    // 3. 检查每个导航路由
    console.log('\n📋 Step 3: 检查每个导航路由的状态...')
    await this.checkEachNavigationRoute(navigationRoutes, routeConfig)
    
    // 4. 生成报告
    console.log('\n📋 Step 4: 生成检查报告...')
    this.generateReport()
  }

  async extractNavigationRoutes() {
    try {
      const content = fs.readFileSync(this.navigationFile, 'utf8')
      
      // 提取所有 route: 配置
      const routeMatches = content.match(/route:\s*['"](\/[^'"]*)['"]/g)
      
      const routes = []
      if (routeMatches) {
        routeMatches.forEach(match => {
          const pathMatch = match.match(/['"](\/[^'"]*)['"]/);
          if (pathMatch) {
            routes.push(pathMatch[1])
          }
        })
      }
      
      // 去重并排序
      const uniqueRoutes = [...new Set(routes)].sort()
      
      console.log(`   ✅ 从导航配置提取到 ${uniqueRoutes.length} 个唯一路由`)
      
      // 显示前20个路由
      console.log('\n🔗 导航配置中的路由 (前20个):')
      uniqueRoutes.slice(0, 20).forEach((route, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}: ${route}`)
      })
      
      if (uniqueRoutes.length > 20) {
        console.log(`   ... 还有 ${uniqueRoutes.length - 20} 个路由`)
      }
      
      return uniqueRoutes
      
    } catch (error) {
      console.log(`   ❌ 读取导航配置失败: ${error.message}`)
      return []
    }
  }

  async readRouteConfig() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      
      // 提取活跃的路由
      const activeRoutes = new Set()
      const pathMatches = content.match(/path\s*:\s*['"](\/[^'"]*)['"]/g)
      if (pathMatches) {
        pathMatches.forEach(match => {
          const pathMatch = match.match(/['"](\/[^'"]*)['"]/);
          if (pathMatch) {
            activeRoutes.add(pathMatch[1])
          }
        })
      }
      
      // 提取被注释的路由
      const commentedRoutes = new Set()
      const lines = content.split('\n')
      lines.forEach(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('//') && trimmed.includes('path:')) {
          const pathMatch = trimmed.match(/path\s*:\s*['"](\/[^'"]*)['"]/);
          if (pathMatch) {
            commentedRoutes.add(pathMatch[1])
          }
        }
      })
      
      console.log(`   ✅ 路由配置读取成功`)
      console.log(`   📊 活跃路由: ${activeRoutes.size} 个`)
      console.log(`   💤 被注释路由: ${commentedRoutes.size} 个`)
      
      return {
        activeRoutes: Array.from(activeRoutes),
        commentedRoutes: Array.from(commentedRoutes),
        fullContent: content
      }
      
    } catch (error) {
      console.log(`   ❌ 读取路由配置失败: ${error.message}`)
      return { activeRoutes: [], commentedRoutes: [], fullContent: '' }
    }
  }

  async checkEachNavigationRoute(navigationRoutes, routeConfig) {
    const { activeRoutes, commentedRoutes, fullContent } = routeConfig
    
    for (const navRoute of navigationRoutes) {
      const result = {
        route: navRoute,
        status: 'unknown',
        issues: [],
        componentInfo: null
      }
      
      // 检查是否在活跃路由中
      const isActive = activeRoutes.some(route => 
        route === navRoute || 
        this.routeMatches(route, navRoute)
      )
      
      // 检查是否被注释
      const isCommented = commentedRoutes.some(route => 
        route === navRoute || 
        this.routeMatches(route, navRoute)
      )
      
      // 检查组件信息
      const componentInfo = this.findComponentForRoute(navRoute, fullContent)
      
      // 确定状态
      if (isActive) {
        if (componentInfo && componentInfo.componentExists) {
          result.status = 'working'
        } else if (componentInfo && !componentInfo.componentExists) {
          result.status = 'missing-component'
          result.issues.push('组件文件不存在')
        } else {
          result.status = 'no-component-info'
          result.issues.push('未找到组件信息')
        }
      } else if (isCommented) {
        result.status = 'commented'
        result.issues.push('路由被注释')
        if (componentInfo && !componentInfo.componentExists) {
          result.issues.push('组件文件不存在')
        }
      } else {
        result.status = 'not-configured'
        result.issues.push('路由未配置')
      }
      
      result.componentInfo = componentInfo
      this.results.push(result)
      
      // 输出结果
      const statusEmoji = {
        'working': '✅',
        'missing-component': '⚠️',
        'no-component-info': '⚠️',
        'commented': '💤',
        'not-configured': '❌'
      }
      
      const emoji = statusEmoji[result.status] || '❓'
      const issues = result.issues.length > 0 ? ` (${result.issues.join(', ')})` : ''
      console.log(`   ${emoji} ${navRoute}${issues}`)
    }
  }

  routeMatches(configRoute, navRoute) {
    // 处理参数化路由
    const configPattern = configRoute.replace(/:\w+/g, '[^/]+')
    const regex = new RegExp(`^${configPattern}$`)
    return regex.test(navRoute)
  }

  findComponentForRoute(routePath, routeContent) {
    // 在路由配置中查找对应的组件
    const lines = routeContent.split('\n')
    let routeBlockStart = -1
    
    // 查找路由定义
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes(`path: '${routePath}'`) || line.includes(`path: "${routePath}"`)) {
        routeBlockStart = i
        break
      }
    }
    
    if (routeBlockStart !== -1) {
      // 查找该路由块中的 component 配置
      for (let i = routeBlockStart; i < Math.min(routeBlockStart + 20, lines.length); i++) {
        const line = lines[i]
        if (line.includes('component:')) {
          const componentMatch = line.match(/component:\s*(\w+)/)
          if (componentMatch) {
            const componentName = componentMatch[1]
            
            // 查找组件的导入路径
            const importMatch = routeContent.match(
              new RegExp(`const\\s+${componentName}\\s*=\\s*\\(\\)\\s*=>\\s*import\\s*\\(\\s*['"](.*?)['"]\\s*\\)`)
            )
            
            if (importMatch) {
              const componentPath = importMatch[1]
              const componentExists = this.checkComponentExists(componentPath)
              
              return {
                componentName: componentName,
                componentPath: componentPath,
                componentExists: componentExists
              }
            }
          }
          break
        }
        if (line.includes('}')) break // 路由块结束
      }
    }
    
    return null
  }

  checkComponentExists(componentPath) {
    if (!componentPath) return false
    
    // 转换相对路径为绝对路径
    const fullPath = componentPath.startsWith('@/') 
      ? path.join(this.projectRoot, 'src', componentPath.slice(2))
      : path.join(this.projectRoot, componentPath)
    
    return fs.existsSync(fullPath)
  }

  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('🔍 导航路由检查报告')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const working = this.results.filter(r => r.status === 'working').length
    const commented = this.results.filter(r => r.status === 'commented').length
    const notConfigured = this.results.filter(r => r.status === 'not-configured').length
    const missingComponent = this.results.filter(r => r.status === 'missing-component').length
    const noComponentInfo = this.results.filter(r => r.status === 'no-component-info').length
    
    console.log('\n📈 整体状况:')
    console.log(`   总导航路由: ${total}`)
    console.log(`   ✅ 正常工作: ${working} (${((working/total)*100).toFixed(1)}%)`)
    console.log(`   💤 被注释: ${commented} (${((commented/total)*100).toFixed(1)}%)`)
    console.log(`   ❌ 未配置: ${notConfigured} (${((notConfigured/total)*100).toFixed(1)}%)`)
    console.log(`   ⚠️ 缺少组件: ${missingComponent} (${((missingComponent/total)*100).toFixed(1)}%)`)
    console.log(`   ⚠️ 无组件信息: ${noComponentInfo} (${((noComponentInfo/total)*100).toFixed(1)}%)`)
    
    // 按状态分组显示问题
    const statusGroups = {
      'commented': '💤 被注释的路由',
      'not-configured': '❌ 未配置的路由',
      'missing-component': '⚠️ 缺少组件的路由',
      'no-component-info': '⚠️ 无组件信息的路由'
    }
    
    Object.entries(statusGroups).forEach(([status, title]) => {
      const items = this.results.filter(r => r.status === status)
      if (items.length > 0) {
        console.log(`\n${title} (${items.length} 个):`)
        items.forEach(item => {
          console.log(`   - ${item.route}`)
          if (item.componentInfo) {
            console.log(`     组件: ${item.componentInfo.componentPath} ${item.componentInfo.componentExists ? '✅' : '❌'}`)
          }
        })
      }
    })
    
    // 修复建议
    console.log('\n💡 修复建议:')
    
    if (commented > 0) {
      console.log(`   1. 🔧 取消注释 ${commented} 个被注释的路由`)
      console.log('      - 检查对应的组件文件是否存在')
      console.log('      - 如果组件存在，取消注释路由配置')
    }
    
    if (notConfigured > 0) {
      console.log(`   2. ➕ 添加 ${notConfigured} 个缺失的路由配置`)
      console.log('      - 在 optimized-routes.ts 中添加路由定义')
      console.log('      - 创建对应的页面组件')
    }
    
    const needComponents = this.results.filter(r => 
      r.status === 'missing-component' || 
      (r.status === 'commented' && r.componentInfo && !r.componentInfo.componentExists)
    )
    
    if (needComponents.length > 0) {
      console.log(`   3. 📄 创建 ${needComponents.length} 个缺失的组件文件`)
      console.log('      需要创建的组件:')
      needComponents.forEach(item => {
        if (item.componentInfo && item.componentInfo.componentPath) {
          console.log(`      - ${item.componentInfo.componentPath}`)
        }
      })
    }
    
    // 优先级建议
    console.log('\n🎯 修复优先级:')
    console.log('   高优先级: 取消注释现有组件的路由')
    console.log('   中优先级: 创建重要页面的缺失组件')
    console.log('   低优先级: 添加完全新的路由配置')
    
    console.log('\n🔧 具体修复步骤:')
    console.log('   1. 运行此工具识别所有问题')
    console.log('   2. 优先修复被注释但组件存在的路由')
    console.log('   3. 创建重要页面的缺失组件')
    console.log('   4. 重新运行此工具验证修复结果')
    
    console.log('\n' + '='.repeat(80))
  }
}

// 运行检查
if (require.main === module) {
  const checker = new NavigationRouteChecker()
  checker.checkAllNavigationRoutes().catch(console.error)
}

module.exports = { NavigationRouteChecker }