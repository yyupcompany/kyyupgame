/**
 * 快速页面连接性检查器
 * 轻量化版本，专注于快速完成所有107个页面的连接性分析
 */

const fs = require('fs')
const path = require('path')

class QuickConnectivityChecker {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.navigationFile = path.join(this.projectRoot, 'src/config/navigation.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
  }

  async runQuickCheck() {
    console.log('🚀 快速页面连接性检查 (107个页面)')
    console.log('='.repeat(60))
    
    // 扫描所有页面文件
    const allFiles = this.scanAllPageFiles()
    console.log(`📊 扫描到 ${allFiles.length} 个页面文件`)
    
    // 分析路由配置
    const routeContent = fs.readFileSync(this.routesFile, 'utf8')
    const routeConfigs = this.extractRouteConfigs(routeContent)
    console.log(`📊 发现 ${routeConfigs.length} 个路由配置`)
    
    // 分析导航配置
    const navigationContent = fs.readFileSync(this.navigationFile, 'utf8')
    const navigationItems = this.extractNavigationItems(navigationContent)
    console.log(`📊 发现 ${navigationItems.length} 个导航项`)
    
    // 执行3轮检查
    const results = {
      round1: this.checkRouteToFile(routeConfigs, allFiles),
      round2: this.checkFileToRoute(allFiles, routeConfigs, navigationItems),
      round3: this.checkPageAccessibility(allFiles, routeConfigs)
    }
    
    this.displayResults(results, allFiles.length)
    
    return results
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
              keywords: this.extractKeywords(item, prefix)
            })
          }
        }
      } catch (error) {
        // 忽略错误，继续扫描
      }
    }
    
    scanDir(this.pagesDir)
    return files
  }

  shouldSkipFile(filename) {
    const skipPatterns = [
      /backup/i, /\.backup\./i, /-backup\./i,
      /incomplete/i, /\.bak\./i, /\.old\./i, /\.tmp\./i
    ]
    return skipPatterns.some(pattern => pattern.test(filename))
  }

  extractKeywords(filename, directory) {
    const keywords = []
    
    const nameWords = filename.toLowerCase()
      .replace('.vue', '')
      .split(/[-_\s]+/)
      .filter(word => word.length > 2)
    
    const dirWords = directory.toLowerCase()
      .split('/')
      .filter(word => word.length > 2)
    
    keywords.push(...nameWords, ...dirWords)
    return [...new Set(keywords)]
  }

  extractRouteConfigs(content) {
    const configs = []
    const routeBlocks = content.match(/\{[^}]*path:[^}]*component:[^}]*\}/gs) || []
    
    for (const block of routeBlocks) {
      const pathMatch = block.match(/path:\s*['"`]([^'"`]+)['"`]/)
      const nameMatch = block.match(/name:\s*['"`]([^'"`]+)['"`]/)
      const componentMatch = block.match(/component:\s*([^,}\n]+)/)
      
      if (pathMatch && componentMatch) {
        let componentPath = componentMatch[1].trim()
        
        if (componentPath.includes('import(')) {
          const importMatch = componentPath.match(/import\(['"`]([^'"`]+)['"`]\)/)
          if (importMatch) {
            componentPath = importMatch[1]
          }
        }
        
        configs.push({
          path: pathMatch[1],
          name: nameMatch ? nameMatch[1] : '',
          componentPath: componentPath,
          fullPath: this.resolveComponentPath(componentPath)
        })
      }
    }
    
    return configs
  }

  extractNavigationItems(content) {
    const items = []
    const routeMatches = content.match(/route:\s*['"`]([^'"`]+)['"`]/g) || []
    
    routeMatches.forEach(match => {
      const routeMatch = match.match(/route:\s*['"`]([^'"`]+)['"`]/)
      if (routeMatch) {
        items.push({
          route: routeMatch[1]
        })
      }
    })
    
    return items
  }

  resolveComponentPath(componentPath) {
    if (componentPath.startsWith('@/')) {
      return path.join(this.projectRoot, 'src', componentPath.substring(2))
    }
    return componentPath
  }

  checkRouteToFile(routeConfigs, allFiles) {
    const results = {
      connected: 0,
      mappable: 0,
      missing: 0,
      details: []
    }
    
    for (const config of routeConfigs) {
      const fileExists = fs.existsSync(config.fullPath)
      
      if (fileExists) {
        results.connected++
        results.details.push({
          route: config.path,
          status: 'connected',
          file: config.fullPath
        })
      } else {
        // 查找相似文件
        const similarFile = this.findSimilarFile(config, allFiles)
        if (similarFile) {
          results.mappable++
          results.details.push({
            route: config.path,
            status: 'mappable',
            expected: path.basename(config.fullPath),
            suggested: similarFile.relativePath
          })
        } else {
          results.missing++
          results.details.push({
            route: config.path,
            status: 'missing',
            expected: path.basename(config.fullPath)
          })
        }
      }
    }
    
    return results
  }

  checkFileToRoute(allFiles, routeConfigs, navigationItems) {
    const results = {
      'fully-connected': 0,
      'has-route': 0,
      'has-navigation': 0,
      'isolated': 0,
      'details': []
    }
    
    for (const file of allFiles) {
      let hasRoute = false
      let hasNavigation = false
      
      // 检查是否有路由
      for (const config of routeConfigs) {
        if (config.componentPath.includes(file.relativePath) || 
            this.keywordMatch(file.keywords, config.path)) {
          hasRoute = true
          break
        }
      }
      
      // 检查是否有导航
      for (const navItem of navigationItems) {
        if (this.keywordMatch(file.keywords, navItem.route)) {
          hasNavigation = true
          break
        }
      }
      
      // 确定状态
      let status = 'isolated'
      if (hasRoute && hasNavigation) {
        status = 'fully-connected'
        results['fully-connected']++
      } else if (hasRoute) {
        status = 'has-route'
        results['has-route']++
      } else if (hasNavigation) {
        status = 'has-navigation'
        results['has-navigation']++
      } else {
        results.isolated++
      }
      
      results.details.push({
        file: file.relativePath,
        status: status,
        hasRoute: hasRoute,
        hasNavigation: hasNavigation
      })
    }
    
    return results
  }

  checkPageAccessibility(allFiles, routeConfigs) {
    const results = {
      'routed': 0,
      'unrouted': 0,
      'auth-required': 0,
      'permission-required': 0,
      'details': []
    }
    
    for (const file of allFiles) {
      let hasRoute = false
      let authRequired = false
      let permissionRequired = false
      
      // 检查路由和权限要求
      for (const config of routeConfigs) {
        if (config.componentPath.includes(file.relativePath)) {
          hasRoute = true
          
          // 检查是否需要认证和权限（简化检查）
          const routeContent = fs.readFileSync(this.routesFile, 'utf8')
          const routeBlock = this.findRouteBlock(routeContent, config.path)
          if (routeBlock) {
            if (routeBlock.includes('requiresAuth: true')) {
              authRequired = true
            }
            if (routeBlock.includes('permission:')) {
              permissionRequired = true
            }
          }
          break
        }
      }
      
      let status = 'unrouted'
      if (hasRoute) {
        status = 'routed'
        results.routed++
        
        if (authRequired) {
          results['auth-required']++
        }
        if (permissionRequired) {
          results['permission-required']++
        }
      } else {
        results.unrouted++
      }
      
      results.details.push({
        file: file.relativePath,
        status: status,
        authRequired: authRequired,
        permissionRequired: permissionRequired
      })
    }
    
    return results
  }

  findRouteBlock(content, path) {
    const lines = content.split('\n')
    let inRouteBlock = false
    let routeBlock = ''
    let braceCount = 0
    
    for (const line of lines) {
      if (line.includes(`path: '${path}'`) || line.includes(`path: "${path}"`)) {
        inRouteBlock = true
        routeBlock = line
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
      } else if (inRouteBlock) {
        routeBlock += '\n' + line
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
        
        if (braceCount <= 0) {
          break
        }
      }
    }
    
    return routeBlock
  }

  findSimilarFile(config, allFiles) {
    const targetKeywords = this.extractRouteKeywords(config)
    let bestMatch = null
    let bestScore = 0
    
    for (const file of allFiles) {
      const score = this.calculateSimilarity(targetKeywords, file.keywords)
      if (score > bestScore && score > 0.3) {
        bestScore = score
        bestMatch = file
      }
    }
    
    return bestMatch
  }

  extractRouteKeywords(config) {
    const keywords = []
    
    const pathWords = config.path.toLowerCase().split(/[-_/\s]+/).filter(word => word.length > 2)
    const nameWords = config.name ? config.name.replace(/([A-Z])/g, ' $1').toLowerCase().split(/\s+/).filter(word => word.length > 2) : []
    const compWords = config.componentPath.toLowerCase().split(/[-_/\s]+/).filter(word => word.length > 2 && word !== 'pages' && word !== 'vue')
    
    keywords.push(...pathWords, ...nameWords, ...compWords)
    return [...new Set(keywords)]
  }

  calculateSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0
    
    let matches = 0
    for (const k1 of keywords1) {
      for (const k2 of keywords2) {
        if (k1.includes(k2) || k2.includes(k1)) {
          matches++
          break
        }
      }
    }
    
    return matches / Math.max(keywords1.length, keywords2.length)
  }

  keywordMatch(keywords, path) {
    const pathWords = path.toLowerCase().split(/[-_/\s]+/).filter(word => word.length > 2)
    
    for (const keyword of keywords) {
      for (const pathWord of pathWords) {
        if (keyword.includes(pathWord) || pathWord.includes(keyword)) {
          return true
        }
      }
    }
    
    return false
  }

  displayResults(results, totalFiles) {
    console.log(`\n📊 完整检查结果 (总共 ${totalFiles} 个页面)`)
    console.log('='.repeat(60))
    
    // 第1轮：路由->文件映射
    const r1 = results.round1
    console.log(`\n🔍 第1轮 - 路由->文件映射:`)
    console.log(`   ✅ 已连接: ${r1.connected}`)
    console.log(`   🔍 可映射: ${r1.mappable}`)
    console.log(`   ❌ 缺失: ${r1.missing}`)
    
    // 第2轮：文件->路由配置
    const r2 = results.round2
    console.log(`\n🔍 第2轮 - 文件->路由配置:`)
    console.log(`   ✅ 完全连接: ${r2['fully-connected']}`)
    console.log(`   🚏 仅有路由: ${r2['has-route']}`)
    console.log(`   📂 仅有导航: ${r2['has-navigation']}`)
    console.log(`   💤 完全孤立: ${r2.isolated}`)
    
    // 第3轮：页面可访问性
    const r3 = results.round3
    console.log(`\n🔍 第3轮 - 页面可访问性:`)
    console.log(`   ✅ 有路由: ${r3.routed}`)
    console.log(`   ❌ 无路由: ${r3.unrouted}`)
    console.log(`   🔐 需要认证: ${r3['auth-required']}`)
    console.log(`   🔑 需要权限: ${r3['permission-required']}`)
    
    // 计算整体健康度
    const routeHealth = ((r1.connected + r1.mappable) / (r1.connected + r1.mappable + r1.missing) * 100).toFixed(1)
    const fileHealth = ((r2['fully-connected'] + r2['has-route']) / totalFiles * 100).toFixed(1)
    const accessHealth = (r3.routed / totalFiles * 100).toFixed(1)
    const overallHealth = ((parseFloat(routeHealth) + parseFloat(fileHealth) + parseFloat(accessHealth)) / 3).toFixed(1)
    
    console.log(`\n📈 系统健康度:`)
    console.log(`   🎯 路由完整性: ${routeHealth}%`)
    console.log(`   🎯 文件连接性: ${fileHealth}%`)
    console.log(`   🎯 页面可访问性: ${accessHealth}%`)
    console.log(`   🏥 整体健康度: ${overallHealth}%`)
    
    // 显示问题文件
    if (r2.isolated > 0) {
      console.log(`\n💤 孤立文件 (无路由无导航):`)
      const isolated = r2.details.filter(d => d.status === 'isolated').slice(0, 5)
      isolated.forEach(item => {
        console.log(`   📄 ${item.file}`)
      })
      if (r2.isolated > 5) {
        console.log(`   ... 还有 ${r2.isolated - 5} 个孤立文件`)
      }
    }
    
    // 修复建议
    console.log(`\n💡 修复建议:`)
    if (r1.mappable > 0) {
      console.log(`   🔧 修复 ${r1.mappable} 个可映射的路由组件`)
    }
    if (r1.missing > 0) {
      console.log(`   📄 创建 ${r1.missing} 个缺失的组件文件`)
    }
    if (r2['has-route'] > 0) {
      console.log(`   📂 为 ${r2['has-route']} 个文件添加导航菜单`)
    }
    if (r2.isolated > 0) {
      console.log(`   🔗 为 ${r2.isolated} 个孤立文件创建路由和导航`)
    }
    
    console.log(`\n✅ 快速页面连接性检查完成!`)
  }
}

// 运行检查
if (require.main === module) {
  const checker = new QuickConnectivityChecker()
  checker.runQuickCheck()
    .then(() => {
      console.log('\n🎯 所有检查已完成!')
    })
    .catch(console.error)
}

module.exports = { QuickConnectivityChecker }