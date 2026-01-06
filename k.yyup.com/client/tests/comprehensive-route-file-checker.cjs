/**
 * 综合路由文件检查器
 * 检查1: 从路由检查真实文件，如果缺失则从CLIENT目录找同含义文件
 * 检查2: 反向检查，从已存在的文件检查侧边栏和路由配置
 */

const fs = require('fs')
const path = require('path')

class ComprehensiveRouteFileChecker {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.navigationFile = path.join(this.projectRoot, 'src/config/navigation.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
  }

  async runComprehensiveCheck() {
    console.log('🔍 综合路由文件检查开始')
    console.log('=' .repeat(80))
    console.log(`📍 检查时间: ${new Date().toLocaleString()}`)
    console.log('=' .repeat(80))

    // 检查1: 从路由检查真实文件
    console.log('\n📋 检查1: 从路由配置检查真实文件存在性')
    console.log('-'.repeat(60))
    const routeFileCheck = await this.checkRouteToFileMapping()

    // 检查2: 反向检查
    console.log('\n📋 检查2: 从现有文件反向检查侧边栏和路由配置')
    console.log('-'.repeat(60))
    const fileRouteCheck = await this.checkFileToRouteMapping()

    // 生成修复建议
    console.log('\n📋 生成修复建议')
    console.log('-'.repeat(60))
    const fixes = this.generateComprehensiveFixes(routeFileCheck, fileRouteCheck)

    return { routeFileCheck, fileRouteCheck, fixes }
  }

  async checkRouteToFileMapping() {
    console.log('🔍 解析路由配置中的组件引用...')
    
    const routeContent = fs.readFileSync(this.routesFile, 'utf8')
    const allExistingFiles = this.scanAllExistingFiles()
    
    // 提取所有组件导入
    const componentImports = this.extractComponentImports(routeContent)
    console.log(`   📊 发现 ${componentImports.length} 个组件引用`)
    
    const results = []
    
    for (const componentRef of componentImports) {
      const result = {
        routePath: componentRef.routePath,
        routeName: componentRef.routeName,
        componentPath: componentRef.componentPath,
        expectedFile: this.resolveComponentPath(componentRef.componentPath),
        exists: false,
        suggestedFile: null,
        status: 'missing'
      }
      
      // 检查文件是否存在
      if (fs.existsSync(result.expectedFile)) {
        result.exists = true
        result.status = 'ok'
      } else {
        // 查找可能的同含义文件
        result.suggestedFile = this.findSimilarFile(componentRef, allExistingFiles)
        if (result.suggestedFile) {
          result.status = 'found-similar'
        } else {
          result.status = 'missing'
        }
      }
      
      results.push(result)
    }
    
    // 显示结果
    this.displayRouteFileResults(results)
    
    return results
  }

  extractComponentImports(content) {
    const imports = []
    
    // 匹配路由配置块
    const routeBlocks = content.match(/\{[^}]*path:[^}]*component:[^}]*\}/gs) || []
    
    for (const block of routeBlocks) {
      const pathMatch = block.match(/path:\s*['"`]([^'"`]+)['"`]/)
      const nameMatch = block.match(/name:\s*['"`]([^'"`]+)['"`]/)
      const componentMatch = block.match(/component:\s*([^,}\n]+)/)
      
      if (pathMatch && componentMatch) {
        let componentPath = componentMatch[1].trim()
        
        // 处理动态导入
        if (componentPath.includes('import(')) {
          const importMatch = componentPath.match(/import\(['"`]([^'"`]+)['"`]\)/)
          if (importMatch) {
            componentPath = importMatch[1]
          }
        }
        
        imports.push({
          routePath: pathMatch[1],
          routeName: nameMatch ? nameMatch[1] : '',
          componentPath: componentPath
        })
      }
    }
    
    return imports
  }

  resolveComponentPath(componentPath) {
    if (componentPath.startsWith('@/')) {
      return path.join(this.projectRoot, 'src', componentPath.substring(2))
    }
    return componentPath
  }

  scanAllExistingFiles() {
    const files = []
    
    const scanDir = (dir, prefix = '') => {
      try {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory()) {
            scanDir(fullPath, prefix + item + '/')
          } else if (item.endsWith('.vue') && !this.shouldSkipFile(item)) {
            files.push({
              name: item.replace('.vue', ''),
              relativePath: prefix + item,
              fullPath: fullPath,
              keywords: this.extractKeywords(item, prefix)
            })
          }
        }
      } catch (error) {
        // 忽略访问错误
      }
    }
    
    scanDir(this.pagesDir)
    return files
  }

  shouldSkipFile(filename) {
    const skipPatterns = [
      /backup/i, /\.backup\./i, /-backup\./i,
      /template/i, /example/i, /test/i,
      /incomplete/i, /\.bak\./i, /demo/i
    ]
    return skipPatterns.some(pattern => pattern.test(filename))
  }

  extractKeywords(filename, directory) {
    const keywords = []
    
    // 从文件名提取关键词
    const nameWords = filename.toLowerCase()
      .replace('.vue', '')
      .split(/[-_\s]+/)
      .filter(word => word.length > 2)
    
    keywords.push(...nameWords)
    
    // 从目录路径提取关键词
    const dirWords = directory.toLowerCase()
      .split('/')
      .filter(word => word.length > 2)
    
    keywords.push(...dirWords)
    
    return [...new Set(keywords)]
  }

  findSimilarFile(componentRef, allFiles) {
    const targetKeywords = this.extractRouteKeywords(componentRef)
    let bestMatch = null
    let bestScore = 0
    
    for (const file of allFiles) {
      const score = this.calculateSimilarityScore(targetKeywords, file.keywords)
      if (score > bestScore && score > 0.3) { // 至少30%相似度
        bestScore = score
        bestMatch = file
      }
    }
    
    return bestMatch
  }

  extractRouteKeywords(componentRef) {
    const keywords = []
    
    // 从路由路径提取
    const pathWords = componentRef.routePath.toLowerCase()
      .split(/[-_/\s]+/)
      .filter(word => word.length > 2)
    keywords.push(...pathWords)
    
    // 从路由名称提取
    if (componentRef.routeName) {
      const nameWords = componentRef.routeName
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
      keywords.push(...nameWords)
    }
    
    // 从组件路径提取
    const compWords = componentRef.componentPath.toLowerCase()
      .split(/[-_/\s]+/)
      .filter(word => word.length > 2 && word !== 'pages' && word !== 'vue')
    keywords.push(...compWords)
    
    return [...new Set(keywords)]
  }

  calculateSimilarityScore(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0
    
    let matches = 0
    for (const keyword1 of keywords1) {
      for (const keyword2 of keywords2) {
        if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
          matches++
          break
        }
      }
    }
    
    return matches / Math.max(keywords1.length, keywords2.length)
  }

  displayRouteFileResults(results) {
    const statusCounts = { ok: 0, 'found-similar': 0, missing: 0 }
    
    results.forEach(result => statusCounts[result.status]++)
    
    console.log(`\n📊 路由->文件检查统计:`)
    console.log(`   ✅ 文件存在: ${statusCounts.ok}`)
    console.log(`   🔍 找到相似文件: ${statusCounts['found-similar']}`)
    console.log(`   ❌ 文件缺失: ${statusCounts.missing}`)
    
    if (statusCounts['found-similar'] > 0) {
      console.log(`\n🔍 找到相似文件的路由:`)
      results.filter(r => r.status === 'found-similar').forEach(result => {
        console.log(`   📂 ${result.routePath} -> ${result.routeName}`)
        console.log(`     ❌ 期望文件: ${path.basename(result.expectedFile)}`)
        console.log(`     💡 建议文件: ${result.suggestedFile.relativePath}`)
        console.log(`     📍 位置: ${result.suggestedFile.fullPath}`)
        console.log()
      })
    }
    
    if (statusCounts.missing > 0) {
      console.log(`\n❌ 完全缺失文件的路由:`)
      results.filter(r => r.status === 'missing').forEach(result => {
        console.log(`   📂 ${result.routePath} -> ${result.routeName}`)
        console.log(`     ❌ 缺失文件: ${path.basename(result.expectedFile)}`)
      })
    }
  }

  async checkFileToRouteMapping() {
    console.log('🔍 扫描现有文件并检查对应的路由和侧边栏配置...')
    
    const allFiles = this.scanAllExistingFiles()
    const routeContent = fs.readFileSync(this.routesFile, 'utf8')
    const navigationContent = fs.readFileSync(this.navigationFile, 'utf8')
    
    console.log(`   📊 发现 ${allFiles.length} 个页面文件`)
    
    const results = []
    
    for (const file of allFiles) {
      const result = {
        file: file,
        hasRoute: false,
        matchedRoutes: [],
        hasNavigation: false,
        matchedNavigation: [],
        status: 'unused'
      }
      
      // 检查路由配置
      result.matchedRoutes = this.findMatchingRoutes(file, routeContent)
      result.hasRoute = result.matchedRoutes.length > 0
      
      // 检查导航配置
      result.matchedNavigation = this.findMatchingNavigation(file, navigationContent)
      result.hasNavigation = result.matchedNavigation.length > 0
      
      // 确定状态
      if (result.hasRoute && result.hasNavigation) {
        result.status = 'complete'
      } else if (result.hasRoute && !result.hasNavigation) {
        result.status = 'missing-navigation'
      } else if (!result.hasRoute && result.hasNavigation) {
        result.status = 'missing-route'
      } else {
        result.status = 'unused'
      }
      
      results.push(result)
    }
    
    // 显示结果
    this.displayFileRouteResults(results)
    
    return results
  }

  findMatchingRoutes(file, routeContent) {
    const matches = []
    
    // 直接路径匹配
    if (routeContent.includes(file.relativePath)) {
      matches.push(`直接引用: ${file.relativePath}`)
    }
    
    // 关键词匹配
    for (const keyword of file.keywords) {
      if (keyword.length > 3) {
        const regex = new RegExp(`path:\\s*['"\`][^'"\`]*${keyword}[^'"\`]*['"\`]`, 'gi')
        const pathMatches = routeContent.match(regex)
        if (pathMatches) {
          pathMatches.forEach(match => {
            matches.push(`路径匹配 "${keyword}": ${match.trim()}`)
          })
        }
      }
    }
    
    return [...new Set(matches)]
  }

  findMatchingNavigation(file, navigationContent) {
    const matches = []
    
    // 关键词匹配
    for (const keyword of file.keywords) {
      if (keyword.length > 3) {
        const lines = navigationContent.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase()
          if (line.includes(keyword)) {
            // 查找相关的route配置
            for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 5); j++) {
              if (lines[j].includes('route:')) {
                matches.push(`导航匹配 "${keyword}": ${lines[j].trim()}`)
                break
              }
            }
          }
        }
      }
    }
    
    return [...new Set(matches)]
  }

  displayFileRouteResults(results) {
    const statusCounts = { 
      complete: 0, 
      'missing-navigation': 0, 
      'missing-route': 0, 
      unused: 0 
    }
    
    results.forEach(result => statusCounts[result.status]++)
    
    console.log(`\n📊 文件->路由检查统计:`)
    console.log(`   ✅ 完整配置: ${statusCounts.complete}`)
    console.log(`   📂 缺少导航: ${statusCounts['missing-navigation']}`)
    console.log(`   🚏 缺少路由: ${statusCounts['missing-route']}`)
    console.log(`   💤 未使用: ${statusCounts.unused}`)
    
    if (statusCounts['missing-navigation'] > 0) {
      console.log(`\n📂 有路由但缺少导航的文件:`)
      results.filter(r => r.status === 'missing-navigation').forEach(result => {
        console.log(`   📄 ${result.file.relativePath}`)
        result.matchedRoutes.forEach(route => {
          console.log(`     ✅ ${route}`)
        })
        console.log(`     ❌ 导航配置: 未找到`)
        console.log()
      })
    }
    
    if (statusCounts['missing-route'] > 0) {
      console.log(`\n🚏 有导航但缺少路由的文件:`)
      results.filter(r => r.status === 'missing-route').forEach(result => {
        console.log(`   📄 ${result.file.relativePath}`)
        console.log(`     ❌ 路由配置: 未找到`)
        result.matchedNavigation.forEach(nav => {
          console.log(`     ✅ ${nav}`)
        })
        console.log()
      })
    }
    
    if (statusCounts.unused > 0) {
      console.log(`\n💤 完全未使用的文件 (前${Math.min(10, statusCounts.unused)}个):`)
      results.filter(r => r.status === 'unused').slice(0, 10).forEach(result => {
        console.log(`   📄 ${result.file.relativePath}`)
        console.log(`     📁 目录: ${path.dirname(result.file.relativePath)}`)
        console.log(`     🏷️ 关键词: ${result.file.keywords.join(', ')}`)
        console.log()
      })
    }
  }

  generateComprehensiveFixes(routeFileCheck, fileRouteCheck) {
    const fixes = []
    
    // 修复路由->文件的问题
    routeFileCheck.filter(r => r.status === 'found-similar').forEach(result => {
      fixes.push({
        type: 'route-component-fix',
        description: `修复路由 ${result.routePath} 的组件引用`,
        currentComponent: result.componentPath,
        suggestedComponent: `@/pages/${result.suggestedFile.relativePath}`,
        action: `将路由组件从 ${path.basename(result.expectedFile)} 改为 ${result.suggestedFile.relativePath}`
      })
    })
    
    // 修复文件->路由的问题
    fileRouteCheck.filter(r => r.status === 'missing-route').forEach(result => {
      fixes.push({
        type: 'add-missing-route',
        description: `为文件 ${result.file.relativePath} 添加路由配置`,
        file: result.file,
        suggestedRoute: this.generateRouteConfig(result.file),
        action: `添加路由配置以使用 ${result.file.relativePath}`
      })
    })
    
    fileRouteCheck.filter(r => r.status === 'missing-navigation').forEach(result => {
      fixes.push({
        type: 'add-missing-navigation',
        description: `为文件 ${result.file.relativePath} 添加导航配置`,
        file: result.file,
        suggestedNavigation: this.generateNavigationConfig(result.file),
        action: `添加导航菜单以访问 ${result.file.relativePath}`
      })
    })
    
    console.log(`\n💡 修复建议总数: ${fixes.length}`)
    
    if (fixes.length > 0) {
      console.log(`\n🔧 详细修复建议:`)
      fixes.forEach((fix, index) => {
        console.log(`\n${index + 1}. ${fix.description}`)
        console.log(`   🎯 操作: ${fix.action}`)
        
        if (fix.type === 'route-component-fix') {
          console.log(`   📝 修改路由配置:`)
          console.log(`      当前: component: ${fix.currentComponent}`)
          console.log(`      建议: component: () => import('${fix.suggestedComponent}')`)
        }
        
        if (fix.suggestedRoute) {
          console.log(`   📝 建议路由配置:`)
          console.log(fix.suggestedRoute)
        }
        
        if (fix.suggestedNavigation) {
          console.log(`   📝 建议导航配置:`)
          console.log(fix.suggestedNavigation)
        }
      })
    } else {
      console.log(`   ✅ 未发现需要修复的问题`)
    }
    
    return fixes
  }

  generateRouteConfig(file) {
    const routePath = file.relativePath.replace('.vue', '').replace('/index', '')
    const routeName = file.name.charAt(0).toUpperCase() + file.name.slice(1)
    
    return `      {
        path: '${routePath}',
        name: '${routeName}',
        component: () => import('@/pages/${file.relativePath}'),
        meta: {
          title: '${this.generateTitle(file.name)}',
          requiresAuth: true,
          priority: 'medium'
        }
      }`
  }

  generateNavigationConfig(file) {
    return `    {
      id: '${file.name.toLowerCase()}',
      title: '${this.generateTitle(file.name)}',
      route: '/${file.relativePath.replace('.vue', '').replace('/index', '')}',
      icon: 'Document',
      meta: {
        requiresAuth: true
      }
    }`
  }

  generateTitle(name) {
    const titleMap = {
      'importantnotices': '重要通知',
      'campusoverview': '校园概览',
      'datastatistics': '数据统计',
      'schedule': '日程安排',
      'messagetemplate': '消息模板',
      'backup': '系统备份',
      'security': '安全设置',
      'enhancedexample': '增强示例'
    }
    
    return titleMap[name.toLowerCase()] || name.replace(/([A-Z])/g, ' $1').trim()
  }
}

// 运行检查
if (require.main === module) {
  const checker = new ComprehensiveRouteFileChecker()
  checker.runComprehensiveCheck()
    .then(() => {
      console.log('\n✅ 综合路由文件检查完成!')
    })
    .catch(console.error)
}

module.exports = { ComprehensiveRouteFileChecker }