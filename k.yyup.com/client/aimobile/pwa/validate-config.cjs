/**
 * Service Worker 配置验证脚本（简化版）
 */

const fs = require('fs')
const path = require('path')

function validateServiceWorker() {
  const swPath = path.resolve(__dirname, 'sw.js')
  const swContent = fs.readFileSync(swPath, 'utf8')

  console.log('🔍 验证 Service Worker 配置...')

  const issues = []
  const successes = []

  // 检查 API_CONFIG 对象
  if (swContent.includes('const API_CONFIG = {')) {
    successes.push('✅ API_CONFIG 对象存在')
  } else {
    issues.push('❌ 缺少 API_CONFIG 对象')
  }

  // 检查是否使用配置中的 API_PREFIX
  if (swContent.includes('request.url.includes(API_CONFIG.API_PREFIX)')) {
    successes.push('✅ 使用配置中的 API_PREFIX')
  } else {
    issues.push('❌ 未使用配置中的 API_PREFIX')
  }

  // 检查硬编码的 API 路径
  const hardcodedPatterns = [
    "'/api/auth/user'",
    "'/api/dashboard/stats'",
    "'/api/students'",
    "'/api/classes'",
    "'/api/activities'"
  ]

  let foundHardcoded = false
  hardcodedPatterns.forEach(pattern => {
    if (swContent.includes(pattern) && !swContent.includes('API_CONFIG')) {
      foundHardcoded = true
    }
  })

  if (!foundHardcoded) {
    successes.push('✅ 未发现硬编码的 API 路径')
  } else {
    issues.push('❌ 发现硬编码的 API 路径')
  }

  // 检查是否使用了配置端点
  const configUsages = [
    'API_CONFIG.AUTH.USER',
    'API_CONFIG.DASHBOARD.STATS',
    'API_CONFIG.STUDENTS',
    'API_CONFIG.CLASSES',
    'API_CONFIG.ACTIVITIES'
  ]

  let usageCount = 0
  configUsages.forEach(usage => {
    if (swContent.includes(usage)) {
      usageCount++
    }
  })

  if (usageCount >= 3) {
    successes.push(`✅ 配置端点使用正确 (${usageCount}/${configUsages.length})`)
  } else {
    issues.push(`❌ 配置端点使用不足 (${usageCount}/${configUsages.length})`)
  }

  // 输出结果
  console.log('\n📊 验证结果:')
  successes.forEach(success => console.log(`  ${success}`))
  issues.forEach(issue => console.log(`  ${issue}`))

  const total = successes.length + issues.length
  const passRate = ((successes.length / total) * 100).toFixed(1)

  console.log(`\n📈 通过率: ${successes.length}/${total} (${passRate}%)`)

  return issues.length === 0
}

// 运行验证
const isValid = validateServiceWorker()
process.exit(isValid ? 0 : 1)