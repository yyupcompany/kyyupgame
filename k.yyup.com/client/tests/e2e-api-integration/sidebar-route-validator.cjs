/**
 * Sidebar Route Validator
 * 侧边栏路由验证器 - 检查所有侧边栏链接的路由配置
 */

const fs = require('fs')
const path = require('path')

class SidebarRouteValidator {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.sidebarFiles = [
      path.join(this.projectRoot, 'src/components/SidebarNew.vue'),
      path.join(this.projectRoot, 'src/components/Sidebar.vue'),
      path.join(this.projectRoot, 'src/layouts/MainLayout.vue')
    ]
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
    this.routeIssues = []
    this.missingComponents = []
    this.sidebarLinks = []
  }

  async validateAllRoutes() {
    console.log('🔍 开始侧边栏路由全面验证...')
    console.log('📋 检查所有侧边栏链接的路由配置问题...\n')
    
    // 1. 提取侧边栏链接
    console.log('📋 Step 1: 提取侧边栏链接...')
    await this.extractSidebarLinks()
    
    // 2. 读取路由配置
    console.log('\n📋 Step 2: 读取路由配置...')
    const routeConfig = await this.readRouteConfig()
    
    // 3. 验证每个链接
    console.log('\n📋 Step 3: 验证每个侧边栏链接...')
    await this.validateEachLink(routeConfig)
    
    // 4. 检查组件文件
    console.log('\n📋 Step 4: 检查组件文件...')
    await this.checkComponentFiles()
    
    // 5. 生成报告
    console.log('\n📋 Step 5: 生成验证报告...')
    this.generateValidationReport()
  }

  async extractSidebarLinks() {
    const allLinks = new Set()
    
    for (const sidebarFile of this.sidebarFiles) {
      try {
        if (fs.existsSync(sidebarFile)) {
          const content = fs.readFileSync(sidebarFile, 'utf8')
          
          // 提取 to 属性的路由
          const toMatches = content.match(/to\s*[:=]\s*['"](\/[^'"]*)['"]/g)
          if (toMatches) {
            toMatches.forEach(match => {
              const pathMatch = match.match(/['"](\/[^'"]*)['"]/);
              if (pathMatch) {
                allLinks.add(pathMatch[1])
              }
            })
          }
          
          // 提取 path 属性的路由
          const pathMatches = content.match(/path\s*[:=]\s*['"](\/[^'"]*)['"]/g)
          if (pathMatches) {
            pathMatches.forEach(match => {
              const pathMatch = match.match(/['"](\/[^'"]*)['"]/);
              if (pathMatch) {
                allLinks.add(pathMatch[1])
              }
            })
          }
          
          // 提取 $router.push 的路由
          const pushMatches = content.match(/\$router\.push\s*\(\s*['"](\/[^'"]*)['"]\s*\)/g)
          if (pushMatches) {
            pushMatches.forEach(match => {
              const pathMatch = match.match(/['"](\/[^'"]*)['"]/);
              if (pathMatch) {
                allLinks.add(pathMatch[1])
              }
            })
          }
          
          console.log(`   从 ${path.basename(sidebarFile)} 提取到 ${toMatches?.length || 0} 个链接`)
        }
      } catch (error) {
        console.log(`   ⚠️ 读取 ${sidebarFile} 失败: ${error.message}`)
      }
    }
    
    this.sidebarLinks = Array.from(allLinks).sort()
    console.log(`   ✅ 总共提取到 ${this.sidebarLinks.length} 个唯一链接`)
    
    // 显示所有提取的链接
    console.log('\n🔗 提取到的侧边栏链接:')
    this.sidebarLinks.forEach((link, index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}: ${link}`)
    })
  }

  async readRouteConfig() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      
      // 提取所有路由路径
      const routes = new Set()
      
      // 匹配路由配置中的 path 属性
      const pathMatches = content.match(/path\s*:\s*['"](\/[^'"]*)['"]/g)
      if (pathMatches) {
        pathMatches.forEach(match => {
          const pathMatch = match.match(/['"](\/[^'"]*)['"]/);
          if (pathMatch) {
            routes.add(pathMatch[1])
          }
        })
      }
      
      // 检查被注释掉的路由
      const commentedLines = content.split('\n').filter(line => 
        line.trim().startsWith('//') && line.includes('path:')
      )
      
      console.log(`   ✅ 路由配置文件读取成功`)
      console.log(`   📊 配置的路由数量: ${routes.size}`)
      console.log(`   ⚠️ 被注释的路由行数: ${commentedLines.length}`)
      
      return {
        activeRoutes: Array.from(routes),
        commentedLines: commentedLines,
        fullContent: content
      }
      
    } catch (error) {
      console.log(`   ❌ 读取路由配置失败: ${error.message}`)
      return { activeRoutes: [], commentedLines: [], fullContent: '' }
    }
  }

  async validateEachLink(routeConfig) {
    const { activeRoutes, commentedLines, fullContent } = routeConfig
    
    for (const link of this.sidebarLinks) {
      const validation = {
        link: link,
        exists: false,
        isCommented: false,
        hasComponent: false,
        componentPath: null,
        issues: []
      }
      
      // 检查路由是否在活跃配置中
      validation.exists = activeRoutes.some(route => {
        return route === link || 
               route.replace(/\/:\w+/g, '/*') === link ||
               link.startsWith(route + '/') ||
               route.startsWith(link + '/')
      })
      
      // 检查路由是否被注释
      validation.isCommented = commentedLines.some(line => 
        line.includes(link) || line.includes(link.replace(/^\//, ''))
      )
      
      // 查找对应的组件
      const componentMatch = this.findComponentForRoute(link, fullContent)
      if (componentMatch) {
        validation.hasComponent = true
        validation.componentPath = componentMatch.componentPath
        validation.componentExists = this.checkComponentFileExists(componentMatch.componentPath)
      }
      
      // 识别问题
      if (!validation.exists) {
        if (validation.isCommented) {
          validation.issues.push('路由被注释掉了')
        } else {
          validation.issues.push('路由配置不存在')
        }
      }
      
      if (validation.hasComponent && !validation.componentExists) {
        validation.issues.push('组件文件不存在')
      }
      
      // 记录问题
      if (validation.issues.length > 0) {
        this.routeIssues.push(validation)
      }
      
      // 输出验证结果
      const status = validation.issues.length === 0 ? '✅' : '❌'
      const issues = validation.issues.length > 0 ? ` (${validation.issues.join(', ')})` : ''
      console.log(`   ${status} ${link}${issues}`)
    }
  }

  findComponentForRoute(routePath, routeContent) {
    // 在路由配置中查找对应的组件
    const lines = routeContent.split('\n')
    let routeBlockStart = -1
    
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
            // 查找组件的导入路径
            const componentName = componentMatch[1]
            const importMatch = routeContent.match(
              new RegExp(`const\\s+${componentName}\\s*=\\s*\\(\\)\\s*=>\\s*import\\s*\\(\\s*['"](.*?)['"]\\s*\\)`)
            )
            if (importMatch) {
              return {
                componentName: componentName,
                componentPath: importMatch[1]
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

  checkComponentFileExists(componentPath) {
    if (!componentPath) return false
    
    // 转换相对路径为绝对路径
    const fullPath = componentPath.startsWith('@/') 
      ? path.join(this.projectRoot, 'src', componentPath.slice(2))
      : path.join(this.projectRoot, componentPath)
    
    return fs.existsSync(fullPath)
  }

  async checkComponentFiles() {
    // 扫描所有页面组件
    const pageComponents = this.scanPageComponents()
    
    console.log(`   📊 扫描到页面组件: ${pageComponents.length} 个`)
    
    // 检查哪些组件没有对应的路由
    const orphanComponents = pageComponents.filter(comp => {
      return !this.sidebarLinks.some(link => 
        link.includes(comp.name.toLowerCase()) || 
        comp.path.includes(link.replace(/^\//, ''))
      )
    })
    
    if (orphanComponents.length > 0) {
      console.log(`   ⚠️ 发现 ${orphanComponents.length} 个可能没有路由的组件:`)
      orphanComponents.slice(0, 10).forEach(comp => {
        console.log(`     - ${comp.name} (${comp.path})`)
      })
    }
  }

  scanPageComponents() {
    const components = []
    
    const scanDir = (dir, prefix = '') => {
      try {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory()) {
            scanDir(fullPath, prefix + item + '/')
          } else if (item.endsWith('.vue') && !item.includes('.backup') && !item.includes('.incomplete')) {
            components.push({
              name: item.replace('.vue', ''),
              path: prefix + item,
              fullPath: fullPath
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

  generateValidationReport() {
    console.log('\n' + '='.repeat(80))
    console.log('🔍 侧边栏路由验证报告')
    console.log('='.repeat(80))
    
    const totalLinks = this.sidebarLinks.length
    const problemLinks = this.routeIssues.length
    const workingLinks = totalLinks - problemLinks
    
    console.log('\n📈 整体状况:')
    console.log(`   总侧边栏链接: ${totalLinks}`)
    console.log(`   ✅ 正常工作: ${workingLinks} (${((workingLinks/totalLinks)*100).toFixed(1)}%)`)
    console.log(`   ❌ 存在问题: ${problemLinks} (${((problemLinks/totalLinks)*100).toFixed(1)}%)`)
    
    if (problemLinks > 0) {
      console.log('\n❌ 存在问题的路由:')
      
      // 按问题类型分组
      const byIssueType = {}
      this.routeIssues.forEach(issue => {
        issue.issues.forEach(issueType => {
          if (!byIssueType[issueType]) {
            byIssueType[issueType] = []
          }
          byIssueType[issueType].push(issue)
        })
      })
      
      Object.entries(byIssueType).forEach(([issueType, issues]) => {
        console.log(`\n   📋 ${issueType} (${issues.length} 个):`)
        issues.forEach(issue => {
          console.log(`     - ${issue.link}`)
          if (issue.componentPath) {
            console.log(`       组件: ${issue.componentPath}`)
          }
        })
      })
    }
    
    console.log('\n💡 修复建议:')
    
    const commentedRoutes = this.routeIssues.filter(issue => 
      issue.issues.includes('路由被注释掉了')
    )
    if (commentedRoutes.length > 0) {
      console.log(`   1. 🔧 取消注释 ${commentedRoutes.length} 个被注释的路由`)
      console.log('      - 检查对应的组件文件是否存在')
      console.log('      - 如果组件不存在，需要创建组件文件')
    }
    
    const missingRoutes = this.routeIssues.filter(issue => 
      issue.issues.includes('路由配置不存在')
    )
    if (missingRoutes.length > 0) {
      console.log(`   2. ➕ 添加 ${missingRoutes.length} 个缺失的路由配置`)
      console.log('      - 在 optimized-routes.ts 中添加路由定义')
      console.log('      - 创建对应的页面组件')
    }
    
    const missingComponents = this.routeIssues.filter(issue => 
      issue.issues.includes('组件文件不存在')
    )
    if (missingComponents.length > 0) {
      console.log(`   3. 📄 创建 ${missingComponents.length} 个缺失的组件文件`)
      missingComponents.forEach(issue => {
        if (issue.componentPath) {
          console.log(`      - 创建: ${issue.componentPath}`)
        }
      })
    }
    
    console.log('\n🔧 下一步行动:')
    console.log('   1. 根据上述建议修复路由问题')
    console.log('   2. 创建缺失的组件文件')
    console.log('   3. 取消注释可用的路由')
    console.log('   4. 重新运行此验证工具确认修复')
    
    console.log('\n' + '='.repeat(80))
  }
}

// 运行验证
if (require.main === module) {
  const validator = new SidebarRouteValidator()
  validator.validateAllRoutes().catch(console.error)
}

module.exports = { SidebarRouteValidator }