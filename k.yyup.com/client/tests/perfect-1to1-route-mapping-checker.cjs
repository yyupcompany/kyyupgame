/**
 * 完美1:1路由文件映射检查器
 * 目标：确保每个路由都有对应的页面文件，每个页面文件都有对应的路由
 * 实现真正的1:1完美映射关系
 */

const fs = require('fs')
const path = require('path')

class Perfect1To1RouteMappingChecker {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
    
    this.results = {
      routes: [],
      files: [],
      mappingIssues: [],
      fixActions: []
    }
  }

  async runPerfectMappingCheck() {
    console.log('🎯 开始1:1路由文件映射检查')
    console.log('='.repeat(70))
    console.log(`📍 检查时间: ${new Date().toLocaleString()}`)
    console.log(`🎯 目标: 实现路由与页面文件的完美1:1映射`)
    console.log('='.repeat(70))

    // 步骤1：扫描所有路由配置
    console.log('\n📋 步骤1: 扫描所有路由配置')
    const routes = this.extractAllRoutes()
    console.log(`   📊 发现 ${routes.length} 个路由配置`)
    
    // 步骤2：扫描所有页面文件
    console.log('\n📋 步骤2: 扫描所有页面文件')
    const files = this.scanAllPageFiles()
    console.log(`   📊 发现 ${files.length} 个页面文件`)
    
    // 步骤3：执行1:1映射分析
    console.log('\n📋 步骤3: 执行1:1映射分析')
    const mappingAnalysis = this.analyzePerfectMapping(routes, files)
    
    // 步骤4：生成修复方案
    console.log('\n📋 步骤4: 生成修复方案')
    const fixPlan = this.generateFixPlan(mappingAnalysis)
    
    // 步骤5：显示结果和建议
    console.log('\n📋 步骤5: 显示结果和建议')
    this.displayResults(mappingAnalysis, fixPlan)
    
    return {
      routes,
      files,
      mappingAnalysis,
      fixPlan
    }
  }

  extractAllRoutes() {
    const routes = []
    const content = fs.readFileSync(this.routesFile, 'utf8')
    
    // 提取所有路由配置（包括嵌套路由）
    const routeBlocks = this.findAllRouteBlocks(content)
    
    for (const block of routeBlocks) {
      const route = this.parseRouteBlock(block)
      if (route && route.componentPath) {
        routes.push(route)
      }
    }
    
    return routes.sort((a, b) => a.path.localeCompare(b.path))
  }

  findAllRouteBlocks(content) {
    const blocks = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // 检查是否是路由配置开始
      if (line.includes('path:') && line.includes("'") || line.includes('"')) {
        const block = this.extractRouteBlock(lines, i)
        if (block) {
          blocks.push(block)
        }
      }
    }
    
    return blocks
  }

  extractRouteBlock(lines, startIndex) {
    let block = ''
    let braceCount = 0
    let started = false
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes('path:') && !started) {
        started = true
      }
      
      if (started) {
        block += line + '\n'
        
        // 计算大括号平衡
        const openBraces = (line.match(/\{/g) || []).length
        const closeBraces = (line.match(/\}/g) || []).length
        
        if (openBraces > 0 && braceCount === 0) {
          braceCount = openBraces - closeBraces
        } else if (braceCount > 0) {
          braceCount += openBraces - closeBraces
        }
        
        // 如果大括号平衡且包含完整路由信息，结束提取
        if (braceCount === 0 && started && line.includes('}')) {
          break
        }
      }
    }
    
    return block
  }

  parseRouteBlock(block) {
    const pathMatch = block.match(/path:\s*['"`]([^'"`]+)['"`]/)
    const nameMatch = block.match(/name:\s*['"`]([^'"`]+)['"`]/)
    const componentMatch = block.match(/component:\s*([^,}\n]+)/)
    
    if (!pathMatch || !componentMatch) {
      return null
    }
    
    let componentPath = componentMatch[1].trim()
    
    // 处理动态导入
    if (componentPath.includes('import(')) {
      const importMatch = componentPath.match(/import\(['"`]([^'"`]+)['"`]\)/)
      if (importMatch) {
        componentPath = importMatch[1]
      }
    }
    
    // 处理组件变量引用
    if (!componentPath.includes('@/') && !componentPath.includes('./')) {
      // 这是一个变量引用，需要在文件顶部找到对应的import语句
      const importPattern = new RegExp(`const\\s+${componentPath}\\s*=\\s*\\(\\)\\s*=>\\s*import\\(['"\`]([^'"\`]+)['"\`]\\)`)
      const importMatch = fs.readFileSync(this.routesFile, 'utf8').match(importPattern)
      if (importMatch) {
        componentPath = importMatch[1]
      }
    }
    
    const resolvedPath = this.resolveComponentPath(componentPath)
    
    return {
      path: pathMatch[1],
      name: nameMatch ? nameMatch[1] : '',
      componentPath: componentPath,
      resolvedPath: resolvedPath,
      exists: fs.existsSync(resolvedPath),
      isRedirect: block.includes('redirect:'),
      isChildRoute: pathMatch[1].includes(':') || pathMatch[1].includes('*')
    }
  }

  resolveComponentPath(componentPath) {
    if (componentPath.startsWith('@/')) {
      return path.join(this.projectRoot, 'src', componentPath.substring(2))
    } else if (componentPath.startsWith('./')) {
      return path.join(this.projectRoot, 'src/router', componentPath)
    }
    return componentPath
  }

  scanAllPageFiles() {
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
            const relativePath = prefix + item
            files.push({
              name: item.replace('.vue', ''),
              relativePath: relativePath,
              fullPath: fullPath,
              directory: prefix,
              expectedRoutes: this.generateExpectedRoutes(relativePath),
              actualRoutes: [],
              hasRoute: false
            })
          }
        }
      } catch (error) {
        console.warn(`   ⚠️  无法访问目录 ${dir}: ${error.message}`)
      }
    }
    
    scanDir(this.pagesDir)
    return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  }

  shouldSkipFile(filename) {
    const skipPatterns = [
      /backup/i, /\.backup\./i, /-backup\./i,
      /incomplete/i, /\.bak\./i, /\.old\./i, 
      /\.tmp\./i, /template/i, /example/i, /demo/i
    ]
    return skipPatterns.some(pattern => pattern.test(filename))
  }

  generateExpectedRoutes(relativePath) {
    const routes = []
    let basePath = relativePath.replace('.vue', '')
    
    // 移除index后缀
    if (basePath.endsWith('/index')) {
      basePath = basePath.replace('/index', '')
    }
    
    // 生成可能的路由路径
    routes.push('/' + basePath)
    routes.push(basePath)
    
    // 如果在dashboard目录下，也添加dashboard前缀的路由
    if (basePath.startsWith('dashboard/')) {
      routes.push('/' + basePath.substring('dashboard/'.length))
    }
    
    return routes
  }

  analyzePerfectMapping(routes, files) {
    const analysis = {
      perfectMatches: [],
      routesWithoutFiles: [],
      filesWithoutRoutes: [],
      ambiguousMatches: [],
      stats: {
        totalRoutes: routes.length,
        totalFiles: files.length,
        mappedRoutes: 0,
        mappedFiles: 0,
        unmappedRoutes: 0,
        unmappedFiles: 0
      }
    }
    
    // 分析每个路由
    for (const route of routes) {
      if (route.exists) {
        analysis.perfectMatches.push({
          type: 'route',
          route: route,
          file: route.resolvedPath,
          status: 'perfect'
        })
        analysis.stats.mappedRoutes++
      } else {
        // 查找最匹配的文件
        const matchingFile = this.findBestMatchingFile(route, files)
        if (matchingFile) {
          analysis.ambiguousMatches.push({
            type: 'route-needs-fix',
            route: route,
            suggestedFile: matchingFile,
            status: 'fixable'
          })
        } else {
          analysis.routesWithoutFiles.push({
            type: 'route-missing-file',
            route: route,
            status: 'missing'
          })
        }
        analysis.stats.unmappedRoutes++
      }
    }
    
    // 分析每个文件
    for (const file of files) {
      const matchingRoute = this.findMatchingRoute(file, routes)
      if (matchingRoute) {
        file.hasRoute = true
        file.actualRoutes.push(matchingRoute)
        analysis.stats.mappedFiles++
      } else {
        analysis.filesWithoutRoutes.push({
          type: 'file-missing-route',
          file: file,
          status: 'needs-route'
        })
        analysis.stats.unmappedFiles++
      }
    }
    
    return analysis
  }

  findBestMatchingFile(route, files) {
    let bestMatch = null
    let bestScore = 0
    
    for (const file of files) {
      const score = this.calculateMatchScore(route, file)
      if (score > bestScore) {
        bestScore = score
        bestMatch = file
      }
    }
    
    return bestScore > 0.5 ? bestMatch : null
  }

  calculateMatchScore(route, file) {
    let score = 0
    
    // 路径匹配
    const routePath = route.path.toLowerCase().replace(/[-_]/g, '')
    const filePath = file.relativePath.toLowerCase().replace(/[-_]/g, '').replace('.vue', '')
    
    if (routePath.includes(filePath) || filePath.includes(routePath)) {
      score += 0.8
    }
    
    // 名称匹配
    if (route.name && file.name) {
      const routeName = route.name.toLowerCase()
      const fileName = file.name.toLowerCase()
      
      if (routeName === fileName) {
        score += 0.9
      } else if (routeName.includes(fileName) || fileName.includes(routeName)) {
        score += 0.6
      }
    }
    
    // 组件路径匹配
    if (route.componentPath.includes(file.relativePath)) {
      score += 1.0
    }
    
    return score
  }

  findMatchingRoute(file, routes) {
    for (const route of routes) {
      if (route.componentPath.includes(file.relativePath)) {
        return route
      }
    }
    
    // 模糊匹配
    for (const route of routes) {
      if (this.calculateMatchScore(route, file) > 0.7) {
        return route
      }
    }
    
    return null
  }

  generateFixPlan(analysis) {
    const fixPlan = {
      routeComponentFixes: [],
      missingFilesToCreate: [],
      missingRoutesToCreate: [],
      totalActions: 0
    }
    
    // 修复路由组件引用
    for (const match of analysis.ambiguousMatches) {
      if (match.type === 'route-needs-fix') {
        fixPlan.routeComponentFixes.push({
          action: 'fix-route-component',
          route: match.route,
          currentComponent: match.route.componentPath,
          newComponent: '@/pages/' + match.suggestedFile.relativePath,
          description: `修复路由 ${match.route.path} 的组件引用`
        })
      }
    }
    
    // 创建缺失的文件
    for (const missing of analysis.routesWithoutFiles) {
      fixPlan.missingFilesToCreate.push({
        action: 'create-file',
        route: missing.route,
        targetFile: missing.route.resolvedPath,
        description: `为路由 ${missing.route.path} 创建组件文件`
      })
    }
    
    // 创建缺失的路由
    for (const missing of analysis.filesWithoutRoutes) {
      fixPlan.missingRoutesToCreate.push({
        action: 'create-route',
        file: missing.file,
        suggestedRoute: this.generateRouteConfig(missing.file),
        description: `为文件 ${missing.file.relativePath} 创建路由配置`
      })
    }
    
    fixPlan.totalActions = fixPlan.routeComponentFixes.length + 
                          fixPlan.missingFilesToCreate.length + 
                          fixPlan.missingRoutesToCreate.length
    
    return fixPlan
  }

  generateRouteConfig(file) {
    const routePath = file.relativePath.replace('.vue', '').replace('/index', '')
    const routeName = file.name.charAt(0).toUpperCase() + file.name.slice(1)
    
    return {
      path: routePath,
      name: routeName,
      component: `() => import('@/pages/${file.relativePath}')`,
      meta: {
        title: this.generateTitle(file.name),
        requiresAuth: true,
        priority: 'medium'
      }
    }
  }

  generateTitle(name) {
    const titleMap = {
      'dashboard': '仪表板',
      'student': '学生管理',
      'teacher': '教师管理',
      'class': '班级管理',
      'parent': '家长管理',
      'activity': '活动管理',
      'enrollment': '招生管理',
      'system': '系统管理',
      'ai': 'AI功能',
      'importantnotices': '重要通知',
      'campusoverview': '校园概览',
      'datastatistics': '数据统计'
    }
    
    const lowerName = name.toLowerCase()
    return titleMap[lowerName] || name.replace(/([A-Z])/g, ' $1').trim()
  }

  displayResults(analysis, fixPlan) {
    console.log(`\n📊 1:1映射分析结果`)
    console.log('='.repeat(50))
    
    console.log(`\n🎯 映射统计:`)
    console.log(`   📄 总路由数: ${analysis.stats.totalRoutes}`)
    console.log(`   📂 总文件数: ${analysis.stats.totalFiles}`)
    console.log(`   ✅ 已映射路由: ${analysis.stats.mappedRoutes}`)
    console.log(`   ✅ 已映射文件: ${analysis.stats.mappedFiles}`)
    console.log(`   ❌ 未映射路由: ${analysis.stats.unmappedRoutes}`)
    console.log(`   ❌ 未映射文件: ${analysis.stats.unmappedFiles}`)
    
    const routeMappingRate = (analysis.stats.mappedRoutes / analysis.stats.totalRoutes * 100).toFixed(1)
    const fileMappingRate = (analysis.stats.mappedFiles / analysis.stats.totalFiles * 100).toFixed(1)
    const overallMappingRate = ((analysis.stats.mappedRoutes + analysis.stats.mappedFiles) / 
                               (analysis.stats.totalRoutes + analysis.stats.totalFiles) * 100).toFixed(1)
    
    console.log(`\n📈 映射完成度:`)
    console.log(`   🎯 路由映射率: ${routeMappingRate}%`)
    console.log(`   🎯 文件映射率: ${fileMappingRate}%`)
    console.log(`   🎯 整体映射率: ${overallMappingRate}%`)
    
    // 显示完美匹配
    if (analysis.perfectMatches.length > 0) {
      console.log(`\n✅ 完美匹配 (${analysis.perfectMatches.length}个):`)
      analysis.perfectMatches.slice(0, 5).forEach(match => {
        console.log(`   📄 ${match.route.path} → ${path.basename(match.file)}`)
      })
      if (analysis.perfectMatches.length > 5) {
        console.log(`   ... 还有 ${analysis.perfectMatches.length - 5} 个完美匹配`)
      }
    }
    
    // 显示需要修复的路由
    if (analysis.ambiguousMatches.length > 0) {
      console.log(`\n🔧 需要修复的路由 (${analysis.ambiguousMatches.length}个):`)
      analysis.ambiguousMatches.slice(0, 5).forEach(match => {
        console.log(`   📂 ${match.route.path}`)
        console.log(`     ❌ 当前: ${path.basename(match.route.resolvedPath)}`)
        console.log(`     ✅ 建议: ${match.suggestedFile.relativePath}`)
      })
      if (analysis.ambiguousMatches.length > 5) {
        console.log(`   ... 还有 ${analysis.ambiguousMatches.length - 5} 个需要修复`)
      }
    }
    
    // 显示缺失的文件
    if (analysis.routesWithoutFiles.length > 0) {
      console.log(`\n❌ 缺失文件的路由 (${analysis.routesWithoutFiles.length}个):`)
      analysis.routesWithoutFiles.slice(0, 5).forEach(missing => {
        console.log(`   📂 ${missing.route.path} → 需要创建 ${path.basename(missing.route.resolvedPath)}`)
      })
      if (analysis.routesWithoutFiles.length > 5) {
        console.log(`   ... 还有 ${analysis.routesWithoutFiles.length - 5} 个缺失文件`)
      }
    }
    
    // 显示缺失的路由
    if (analysis.filesWithoutRoutes.length > 0) {
      console.log(`\n🚏 缺失路由的文件 (${analysis.filesWithoutRoutes.length}个):`)
      analysis.filesWithoutRoutes.slice(0, 5).forEach(missing => {
        console.log(`   📄 ${missing.file.relativePath} → 需要创建路由`)
      })
      if (analysis.filesWithoutRoutes.length > 5) {
        console.log(`   ... 还有 ${analysis.filesWithoutRoutes.length - 5} 个缺失路由`)
      }
    }
    
    // 显示修复计划
    console.log(`\n🔧 修复计划:`)
    console.log(`   📝 路由组件修复: ${fixPlan.routeComponentFixes.length}`)
    console.log(`   📄 创建缺失文件: ${fixPlan.missingFilesToCreate.length}`)
    console.log(`   🚏 创建缺失路由: ${fixPlan.missingRoutesToCreate.length}`)
    console.log(`   📊 总修复操作: ${fixPlan.totalActions}`)
    
    if (fixPlan.totalActions === 0) {
      console.log(`\n🎉 恭喜！已实现完美的1:1路由文件映射！`)
    } else {
      console.log(`\n📋 需要执行 ${fixPlan.totalActions} 个修复操作才能实现完美1:1映射`)
    }
    
    console.log(`\n✅ 1:1路由文件映射检查完成!`)
  }
}

// 运行检查
if (require.main === module) {
  const checker = new Perfect1To1RouteMappingChecker()
  checker.runPerfectMappingCheck()
    .then(() => {
      console.log('\n🎯 1:1映射检查完成!')
    })
    .catch(console.error)
}

module.exports = { Perfect1To1RouteMappingChecker }