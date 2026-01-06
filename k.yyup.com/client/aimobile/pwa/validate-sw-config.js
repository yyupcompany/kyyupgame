/**
 * Service Worker 配置验证脚本
 *
 * 验证 Service Worker 中的 API 端点配置是否正确
 */

const fs = require('fs')
const path = require('path')

// 验证 Service Worker 配置
function validateServiceWorkerConfig() {
  const swPath = path.resolve(__dirname, 'sw.js')
  const swContent = fs.readFileSync(swPath, 'utf8')

  console.log('🔍 验证 Service Worker 配置...')
  console.log(`📁 文件路径: ${swPath}`)

  const issues = []
  const successes = []

  // 检查是否有 API_CONFIG 对象
  if (swContent.includes('const API_CONFIG = {')) {
    successes.push('✅ API_CONFIG 对象存在')
  } else {
    issues.push('❌ 缺少 API_CONFIG 对象')
  }

  // 检查是否有硬编码的 API 路径
  const hardcodedApiPatterns = [
    "'/api/",
    '"/api/',
    "'/api/auth/user'",
    '"/api/auth/user"',
    "'/api/dashboard/stats'",
    '"/api/dashboard/stats"',
    "'/api/students'",
    '"/api/students"',
    "'/api/classes'",
    '"/api/classes'",
    "'/api/activities'",
    '"/api/activities"'
  ]

  let foundHardcoded = []
  hardcodedApiPatterns.forEach(pattern => {
    const regex = new RegExp(pattern.replace(/'/g, "\\'"), 'g')
    const matches = swContent.match(regex)
    if (matches && matches.length > 0) {
      // 排除在注释和字符串中的合理使用
      const lines = swContent.split('\n')
      lines.forEach((line, index) => {
        if (line.includes(pattern) && !line.trim().startsWith('//') && !line.includes('API_CONFIG')) {
          foundHardcoded.push({
            line: index + 1,
            content: line.trim(),
            pattern: pattern
          })
        }
      })
    }
  })

  if (foundHardcoded.length === 0) {
    successes.push('✅ 未发现硬编码的 API 路径')
  } else {
    issues.push(`❌ 发现 ${foundHardcoded.length} 个硬编码的 API 路径:`)
    foundHardcoded.forEach(item => {
      issues.push(`   行 ${item.line}: ${item.content}`)
    })
  }

  // 检查是否使用了配置中的端点
  const configUsages = [
    'API_CONFIG.API_PREFIX',
    'API_CONFIG.AUTH.USER',
    'API_CONFIG.DASHBOARD.STATS',
    'API_CONFIG.STUDENTS',
    'API_CONFIG.CLASSES',
    'API_CONFIG.ACTIVITIES',
    'isCacheableApiEndpoint'
  ]

  let foundConfigUsages = 0
  configUsages.forEach(usage => {
    if (swContent.includes(usage)) {
      foundConfigUsages++
    }
  })

  if (foundConfigUsages >= 4) { // 至少使用了一半的配置
    successes.push(`✅ 正确使用了配置中的端点 (${foundConfigUsages}/${configUsages.length})`)
  } else {
    issues.push(`❌ 配置端点使用不足 (${foundConfigUsages}/${configUsages.length})`)
  }

  // 检查API_ENDPOINTS数组是否使用了配置
  if (swContent.includes('API_ENDPOINTS = [') &&
      swContent.includes('API_CONFIG.AUTH.USER') &&
      swContent.includes('API_CONFIG.DASHBOARD.STATS')) {
    successes.push('✅ API_ENDPOINTS 数组正确使用了配置')
  } else {
    issues.push('❌ API_ENDPOINTS 数组未正确使用配置')
  }

  // 检查缓存清理函数是否使用了正确的缓存前缀
  if (swContent.includes('kindergarten-') &&
      !swContent.includes('cacheName.startsWith(\'kindergarten-\')')) {
    successes.push('✅ 缓存命名规范正确')
  } else if (!swContent.includes('kindergarten-')) {
    issues.push('❌ 缓存命名不规范')
  }

  // 输出结果
  console.log('\n📊 验证结果:')
  console.log('='.repeat(50))

  if (successes.length > 0) {
    console.log('\n✅ 通过的检查:')
    successes.forEach(success => console.log(`  ${success}`))
  }

  if (issues.length > 0) {
    console.log('\n❌ 发现的问题:')
    issues.forEach(issue => console.log(`  ${issue}`))
  }

  // 总结
  const totalChecks = successes.length + issues.length
  const passRate = totalChecks > 0 ? (successes.length / totalChecks * 100).toFixed(1) : 0

  console.log('\n📈 总结:')
  console.log(`  通过: ${successes.length}/${totalChecks} (${passRate}%)`)
  console.log(`  失败: ${issues.length}/${totalChecks}`)

  if (issues.length === 0) {
    console.log('\n🎉 恭喜！Service Worker 配置验证全部通过！')
    return true
  } else {
    console.log('\n⚠️  请修复上述问题后重新验证。')
    return false
  }
}

// 检查端点配置文件是否存在
function checkConfigFiles() {
  const configPath = path.resolve(__dirname, 'sw-endpoints.config.ts')
  const templatePath = path.resolve(__dirname, 'sw.template.js')

  console.log('\n📁 检查配置文件:')

  const files = [
    { path: configPath, name: '端点配置文件' },
    { path: templatePath, name: 'Service Worker 模板' }
  ]

  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`  ✅ ${file.name}: ${file.path}`)
    } else {
      console.log(`  ❌ ${file.name}: ${file.path} (不存在)`)
    }
  })
}

// 命令行参数处理
const command = process.argv[2]

switch (command) {
  case 'validate':
    validateServiceWorkerConfig()
    break
  case 'check-files':
    checkConfigFiles()
    break
  case 'full':
    checkConfigFiles()
    console.log()
    validateServiceWorkerConfig()
    break
  case 'help':
  default:
    console.log(`
Service Worker 配置验证工具

用法:
  node validate-sw-config.js <command>

命令:
  validate    - 验证 Service Worker 配置
  check-files - 检查配置文件是否存在
  full        - 执行完整验证（文件检查 + 配置验证）
  help        - 显示此帮助信息

示例:
  node validate-sw-config.js validate
  node validate-sw-config.js full
`)
    break
}