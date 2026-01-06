/**
 * 完整页面连接性检查器
 * 对所有107个页面执行3轮完整检查：
 * 1. 路由->文件映射检查
 * 2. 文件->路由配置检查  
 * 3. 页面可访问性测试
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class CompletePageConnectivityChecker {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.navigationFile = path.join(this.projectRoot, 'src/config/navigation.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
    this.baseUrl = 'http://k.yyup.cc'
    
    this.results = {
      round1: null,
      round2: null, 
      round3: null,
      summary: null
    }
  }

  async runCompleteCheck() {
    console.log('🔍 开始完整页面连接性检查 (3轮检查)')
    console.log('='.repeat(80))
    console.log(`📍 检查时间: ${new Date().toLocaleString()}`)
    console.log(`📊 目标: 检查所有107个页面文件`)
    console.log('='.repeat(80))

    // 第1轮：路由->文件映射检查
    console.log('\n🔄 第1轮检查: 路由->文件映射检查')
    console.log('-'.repeat(60))
    this.results.round1 = await this.round1RouteToFileCheck()

    // 第2轮：文件->路由配置检查
    console.log('\n🔄 第2轮检查: 文件->路由配置检查')
    console.log('-'.repeat(60))
    this.results.round2 = await this.round2FileToRouteCheck()

    // 第3轮：页面可访问性测试
    console.log('\n🔄 第3轮检查: 页面可访问性测试')
    console.log('-'.repeat(60))
    this.results.round3 = await this.round3AccessibilityCheck()

    // 生成综合报告
    console.log('\n📊 生成综合检查报告')
    console.log('-'.repeat(60))
    this.results.summary = this.generateComprehensiveReport()

    return this.results
  }

  async round1RouteToFileCheck() {
    console.log('🔍 第1轮: 分析路由配置中的所有组件引用...')
    
    const routeContent = fs.readFileSync(this.routesFile, 'utf8')
    const allExistingFiles = this.scanAllPageFiles()
    
    // 提取所有路由配置
    const routeConfigs = this.extractAllRouteConfigs(routeContent)
    console.log(`   📊 发现 ${routeConfigs.length} 个路由配置`)
    
    const results = []
    
    for (const config of routeConfigs) {
      const result = {
        routePath: config.path,
        routeName: config.name,
        componentPath: config.componentPath,
        expectedFile: this.resolveComponentPath(config.componentPath),
        actualFile: null,
        status: 'missing',
        fileExists: false,
        suggestedFix: null
      }
      
      // 检查文件是否存在
      if (fs.existsSync(result.expectedFile)) {
        result.fileExists = true
        result.actualFile = result.expectedFile
        result.status = 'connected'
      } else {
        // 查找相似文件
        const similarFile = this.findSimilarFile(config, allExistingFiles)
        if (similarFile) {
          result.actualFile = similarFile.fullPath
          result.status = 'mappable'
          result.suggestedFix = `使用 ${similarFile.relativePath} 替代 ${path.basename(result.expectedFile)}`
        } else {
          result.status = 'missing'
          result.suggestedFix = `需要创建 ${path.basename(result.expectedFile)} 文件`
        }
      }
      
      results.push(result)
    }
    
    this.displayRouteToFileResults(results)
    return results
  }

  async round2FileToRouteCheck() {
    console.log('🔍 第2轮: 扫描所有页面文件的路由连接状态...')
    
    const allFiles = this.scanAllPageFiles()
    const routeContent = fs.readFileSync(this.routesFile, 'utf8')
    const navigationContent = fs.readFileSync(this.navigationFile, 'utf8')
    
    console.log(`   📊 发现 ${allFiles.length} 个页面文件`)
    
    const results = []
    
    for (const file of allFiles) {
      const result = {
        file: file,
        hasRoute: false,
        routeDetails: [],
        hasNavigation: false,
        navigationDetails: [],
        hasAccess: false,
        accessibilityIssues: [],
        status: 'isolated'
      }
      
      // 检查路由连接
      result.routeDetails = this.findFileRouteConnections(file, routeContent)
      result.hasRoute = result.routeDetails.length > 0
      
      // 检查导航连接
      result.navigationDetails = this.findFileNavigationConnections(file, navigationContent)
      result.hasNavigation = result.navigationDetails.length > 0
      
      // 检查访问权限
      result.accessibilityIssues = this.checkFileAccessibility(file, routeContent)
      result.hasAccess = result.accessibilityIssues.length === 0
      
      // 确定状态
      if (result.hasRoute && result.hasNavigation && result.hasAccess) {
        result.status = 'fully-connected'
      } else if (result.hasRoute && result.hasNavigation) {
        result.status = 'permission-issues'
      } else if (result.hasRoute) {
        result.status = 'missing-navigation'
      } else if (result.hasNavigation) {
        result.status = 'missing-route'
      } else {
        result.status = 'isolated'
      }
      
      results.push(result)
    }
    
    this.displayFileToRouteResults(results)
    return results
  }

  async round3AccessibilityCheck() {
    console.log('🔍 第3轮: 执行页面可访问性实际测试...')
    
    const allFiles = this.scanAllPageFiles()
    const routeConfigs = this.extractAllRouteConfigs(fs.readFileSync(this.routesFile, 'utf8'))
    
    console.log(`   📊 将测试 ${allFiles.length} 个页面的实际访问性`)
    
    const results = []
    
    // 首先检查前端服务是否运行
    const frontendRunning = this.checkFrontendService()
    if (!frontendRunning) {
      console.log('   ⚠️  前端服务未运行，启动服务进行测试...')
      this.startFrontendService()
    }
    
    // 为每个文件生成可能的访问URL
    for (const file of allFiles) {
      const result = {
        file: file,
        testUrls: [],
        accessibleUrls: [],
        inaccessibleUrls: [],
        status: 'untested',
        errors: []
      }
      
      // 生成测试URL
      result.testUrls = this.generateTestUrls(file, routeConfigs)
      
      // 测试每个URL
      for (const url of result.testUrls) {
        try {
          const accessible = await this.testUrlAccessibility(url)
          if (accessible) {
            result.accessibleUrls.push(url)
          } else {
            result.inaccessibleUrls.push(url)
          }
        } catch (error) {
          result.errors.push(`${url}: ${error.message}`)
          result.inaccessibleUrls.push(url)
        }
      }
      
      // 确定状态
      if (result.accessibleUrls.length > 0) {
        result.status = 'accessible'
      } else if (result.testUrls.length > 0) {
        result.status = 'inaccessible'
      } else {
        result.status = 'no-route'
      }
      
      results.push(result)
    }
    
    this.displayAccessibilityResults(results)
    return results
  }

  extractAllRouteConfigs(content) {
    const configs = []
    
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
        
        configs.push({
          path: pathMatch[1],
          name: nameMatch ? nameMatch[1] : '',
          componentPath: componentPath
        })
      }
    }
    
    return configs
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
            files.push({
              name: item.replace('.vue', ''),
              relativePath: prefix + item,
              fullPath: fullPath,
              directory: prefix,
              keywords: this.extractKeywords(item, prefix),
              size: stat.size,
              lastModified: stat.mtime
            })
          }
        }
      } catch (error) {
        console.warn(`   ⚠️  无法访问目录 ${dir}: ${error.message}`)
      }
    }
    
    scanDir(this.pagesDir)
    return files
  }

  shouldSkipFile(filename) {
    const skipPatterns = [
      /backup/i, /\.backup\./i, /-backup\./i,
      /template/i, /example/i, /test/i,
      /incomplete/i, /\.bak\./i, /demo/i,
      /\.old\./i, /\.tmp\./i
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

  resolveComponentPath(componentPath) {
    if (componentPath.startsWith('@/')) {
      return path.join(this.projectRoot, 'src', componentPath.substring(2))
    }
    return componentPath
  }

  findSimilarFile(routeConfig, allFiles) {
    const targetKeywords = this.extractRouteKeywords(routeConfig)
    let bestMatch = null
    let bestScore = 0
    
    for (const file of allFiles) {
      const score = this.calculateSimilarityScore(targetKeywords, file.keywords)
      if (score > bestScore && score > 0.3) {
        bestScore = score
        bestMatch = file
      }
    }
    
    return bestMatch
  }

  extractRouteKeywords(routeConfig) {
    const keywords = []
    
    // 从路由路径提取
    const pathWords = routeConfig.path.toLowerCase()
      .split(/[-_/\s]+/)
      .filter(word => word.length > 2)
    keywords.push(...pathWords)
    
    // 从路由名称提取
    if (routeConfig.name) {
      const nameWords = routeConfig.name
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
      keywords.push(...nameWords)
    }
    
    // 从组件路径提取
    const compWords = routeConfig.componentPath.toLowerCase()
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

  findFileRouteConnections(file, routeContent) {
    const connections = []
    
    // 直接路径匹配
    if (routeContent.includes(file.relativePath)) {
      connections.push({
        type: 'direct',
        match: file.relativePath,
        description: `直接引用文件路径`
      })
    }
    
    // 关键词匹配
    for (const keyword of file.keywords) {
      if (keyword.length > 3) {
        const regex = new RegExp(`path:\\s*['"\`][^'"\`]*${keyword}[^'"\`]*['"\`]`, 'gi')
        const pathMatches = routeContent.match(regex)
        if (pathMatches) {
          pathMatches.forEach(match => {
            connections.push({
              type: 'keyword',
              match: match.trim(),
              description: `关键词匹配: ${keyword}`
            })
          })
        }
      }
    }
    
    return connections
  }

  findFileNavigationConnections(file, navigationContent) {
    const connections = []
    
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
                connections.push({
                  type: 'navigation',
                  match: lines[j].trim(),
                  description: `导航匹配: ${keyword}`
                })
                break
              }
            }
          }
        }
      }
    }
    
    return connections
  }

  checkFileAccessibility(file, routeContent) {
    const issues = []
    
    // 检查权限要求
    const permissionMatches = routeContent.match(/permission:\s*['"`]([^'"`]+)['"`]/g) || []
    if (permissionMatches.length > 0) {
      issues.push({
        type: 'permission',
        description: '页面需要特定权限才能访问',
        details: permissionMatches
      })
    }
    
    // 检查认证要求
    const authMatches = routeContent.match(/requiresAuth:\s*true/g) || []
    if (authMatches.length > 0) {
      issues.push({
        type: 'auth',
        description: '页面需要登录才能访问',
        details: authMatches
      })
    }
    
    return issues
  }

  checkFrontendService() {
    try {
      execSync('curl -f http://localhost:5173 > /dev/null 2>&1', { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  }

  startFrontendService() {
    console.log('   🚀 启动前端服务...')
    try {
      execSync('cd /home/devbox/project/client && npm run dev > /dev/null 2>&1 &', { timeout: 10000 })
      // 等待服务启动
      let attempts = 0
      while (attempts < 30) {
        if (this.checkFrontendService()) {
          console.log('   ✅ 前端服务已启动')
          return true
        }
        execSync('sleep 1')
        attempts++
      }
      console.log('   ❌ 前端服务启动超时')
      return false
    } catch (error) {
      console.log('   ❌ 前端服务启动失败:', error.message)
      return false
    }
  }

  generateTestUrls(file, routeConfigs) {
    const urls = []
    
    // 基于文件路径生成URL
    const basePath = file.relativePath.replace('.vue', '').replace('/index', '')
    urls.push(`${this.baseUrl}/${basePath}`)
    
    // 基于路由配置生成URL
    for (const config of routeConfigs) {
      if (config.componentPath.includes(file.relativePath)) {
        urls.push(`${this.baseUrl}/${config.path}`)
      }
    }
    
    // 基于关键词生成URL
    for (const keyword of file.keywords) {
      if (keyword.length > 3) {
        urls.push(`${this.baseUrl}/${keyword}`)
        urls.push(`${this.baseUrl}/dashboard/${keyword}`)
      }
    }
    
    return [...new Set(urls)]
  }

  async testUrlAccessibility(url) {
    try {
      const response = await execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, { timeout: 10000 })
      const statusCode = response.toString().trim()
      return statusCode === '200' || statusCode === '302'
    } catch (error) {
      return false
    }
  }

  displayRouteToFileResults(results) {
    const statusCounts = { connected: 0, mappable: 0, missing: 0 }
    
    results.forEach(result => statusCounts[result.status]++)
    
    console.log(`\n📊 第1轮检查结果:`)
    console.log(`   ✅ 已连接: ${statusCounts.connected}`)
    console.log(`   🔍 可映射: ${statusCounts.mappable}`)
    console.log(`   ❌ 缺失: ${statusCounts.missing}`)
    
    if (statusCounts.missing > 0) {
      console.log(`\n❌ 缺失文件的路由:`)
      results.filter(r => r.status === 'missing').slice(0, 5).forEach(result => {
        console.log(`   📂 ${result.routePath}`)
        console.log(`     ❌ 缺失: ${path.basename(result.expectedFile)}`)
        console.log(`     💡 建议: ${result.suggestedFix}`)
      })
      if (statusCounts.missing > 5) {
        console.log(`   ... 还有 ${statusCounts.missing - 5} 个缺失文件`)
      }
    }
  }

  displayFileToRouteResults(results) {
    const statusCounts = { 
      'fully-connected': 0, 
      'permission-issues': 0,
      'missing-navigation': 0, 
      'missing-route': 0, 
      'isolated': 0 
    }
    
    results.forEach(result => statusCounts[result.status]++)
    
    console.log(`\n📊 第2轮检查结果:`)
    console.log(`   ✅ 完全连接: ${statusCounts['fully-connected']}`)
    console.log(`   🔐 权限问题: ${statusCounts['permission-issues']}`)
    console.log(`   📂 缺少导航: ${statusCounts['missing-navigation']}`)
    console.log(`   🚏 缺少路由: ${statusCounts['missing-route']}`)
    console.log(`   💤 完全孤立: ${statusCounts.isolated}`)
    
    if (statusCounts.isolated > 0) {
      console.log(`\n💤 孤立文件 (前5个):`)
      results.filter(r => r.status === 'isolated').slice(0, 5).forEach(result => {
        console.log(`   📄 ${result.file.relativePath}`)
        console.log(`     📁 目录: ${result.file.directory}`)
        console.log(`     🏷️ 关键词: ${result.file.keywords.join(', ')}`)
      })
    }
  }

  displayAccessibilityResults(results) {
    const statusCounts = { accessible: 0, inaccessible: 0, 'no-route': 0, untested: 0 }
    
    results.forEach(result => statusCounts[result.status]++)
    
    console.log(`\n📊 第3轮检查结果:`)
    console.log(`   ✅ 可访问: ${statusCounts.accessible}`)
    console.log(`   ❌ 不可访问: ${statusCounts.inaccessible}`)
    console.log(`   🚫 无路由: ${statusCounts['no-route']}`)
    console.log(`   ❓ 未测试: ${statusCounts.untested}`)
    
    if (statusCounts.accessible > 0) {
      console.log(`\n✅ 可访问的页面 (前5个):`)
      results.filter(r => r.status === 'accessible').slice(0, 5).forEach(result => {
        console.log(`   📄 ${result.file.relativePath}`)
        console.log(`     🔗 访问URL: ${result.accessibleUrls[0]}`)
      })
    }
  }

  generateComprehensiveReport() {
    const summary = {
      totalFiles: this.results.round2.length,
      round1Stats: this.calculateRoundStats(this.results.round1),
      round2Stats: this.calculateRoundStats(this.results.round2),
      round3Stats: this.calculateRoundStats(this.results.round3),
      overallHealth: 0,
      criticalIssues: [],
      recommendations: []
    }
    
    // 计算整体健康度
    const r1Health = (summary.round1Stats.connected / summary.totalFiles) * 100
    const r2Health = (summary.round2Stats['fully-connected'] / summary.totalFiles) * 100
    const r3Health = (summary.round3Stats.accessible / summary.totalFiles) * 100
    
    summary.overallHealth = ((r1Health + r2Health + r3Health) / 3).toFixed(1)
    
    // 识别关键问题
    if (summary.round1Stats.missing > 10) {
      summary.criticalIssues.push(`${summary.round1Stats.missing} 个路由缺少对应文件`)
    }
    if (summary.round2Stats.isolated > 5) {
      summary.criticalIssues.push(`${summary.round2Stats.isolated} 个文件完全孤立`)
    }
    if (summary.round3Stats.inaccessible > 15) {
      summary.criticalIssues.push(`${summary.round3Stats.inaccessible} 个页面无法访问`)
    }
    
    // 生成修复建议
    if (summary.round1Stats.mappable > 0) {
      summary.recommendations.push(`修复 ${summary.round1Stats.mappable} 个可映射的路由文件`)
    }
    if (summary.round2Stats['missing-navigation'] > 0) {
      summary.recommendations.push(`为 ${summary.round2Stats['missing-navigation']} 个文件添加导航菜单`)
    }
    if (summary.round3Stats['no-route'] > 0) {
      summary.recommendations.push(`为 ${summary.round3Stats['no-route']} 个文件创建路由配置`)
    }
    
    this.displayComprehensiveReport(summary)
    return summary
  }

  calculateRoundStats(results) {
    const stats = {}
    
    results.forEach(result => {
      const status = result.status
      stats[status] = (stats[status] || 0) + 1
    })
    
    return stats
  }

  displayComprehensiveReport(summary) {
    console.log(`\n📋 综合检查报告`)
    console.log('='.repeat(60))
    console.log(`📊 总页面数: ${summary.totalFiles}`)
    console.log(`🏥 整体健康度: ${summary.overallHealth}%`)
    
    console.log(`\n🔍 各轮检查统计:`)
    console.log(`   第1轮 (路由->文件): 连接${summary.round1Stats.connected || 0} | 映射${summary.round1Stats.mappable || 0} | 缺失${summary.round1Stats.missing || 0}`)
    console.log(`   第2轮 (文件->路由): 完整${summary.round2Stats['fully-connected'] || 0} | 部分${summary.round2Stats['missing-navigation'] || 0} | 孤立${summary.round2Stats.isolated || 0}`)
    console.log(`   第3轮 (页面访问): 可访问${summary.round3Stats.accessible || 0} | 不可访问${summary.round3Stats.inaccessible || 0} | 无路由${summary.round3Stats['no-route'] || 0}`)
    
    if (summary.criticalIssues.length > 0) {
      console.log(`\n🚨 关键问题:`)
      summary.criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue}`)
      })
    }
    
    if (summary.recommendations.length > 0) {
      console.log(`\n💡 修复建议:`)
      summary.recommendations.forEach(rec => {
        console.log(`   🔧 ${rec}`)
      })
    }
    
    console.log(`\n✅ 完整页面连接性检查完成!`)
  }
}

// 运行检查
if (require.main === module) {
  const checker = new CompletePageConnectivityChecker()
  checker.runCompleteCheck()
    .then(() => {
      console.log('\n🎯 所有检查已完成!')
    })
    .catch(console.error)
}

module.exports = { CompletePageConnectivityChecker }