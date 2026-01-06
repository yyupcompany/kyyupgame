/**
 * Service Worker 修复验证脚本
 */

const fs = require('fs')
const path = require('path')

function verifyFix() {
  const swPath = path.resolve(__dirname, 'sw.js')
  const swContent = fs.readFileSync(swPath, 'utf8')

  console.log('🔍 验证 Service Worker 硬编码修复情况...\n')

  // 检查修复要点
  const fixes = [
    {
      name: 'API_CONFIG 对象存在',
      check: () => swContent.includes('const API_CONFIG = {')
    },
    {
      name: '使用配置中的 API_PREFIX',
      check: () => swContent.includes('request.url.includes(API_CONFIG.API_PREFIX)')
    },
    {
      name: 'API_ENDPOINTS 使用配置',
      check: () => {
        return swContent.includes('API_CONFIG.AUTH.USER') &&
               swContent.includes('API_CONFIG.DASHBOARD.STATS') &&
               swContent.includes('API_CONFIG.STUDENTS') &&
               swContent.includes('API_CONFIG.CLASSES') &&
               swContent.includes('API_CONFIG.ACTIVITIES')
      }
    },
    {
      name: '添加了 isCacheableApiEndpoint 函数',
      check: () => swContent.includes('function isCacheableApiEndpoint(url)')
    },
    {
      name: 'API请求处理使用配置检查',
      check: () => swContent.includes('if (isCacheableApiEndpoint(request.url))')
    },
    {
      name: '移除了硬编码的 API 路径',
      check: () => {
        const problematic = [
          "request.url.includes('/api/')",
          "'/api/auth/user'",
          "'/api/dashboard/stats'",
          "'/api/students'",
          "'/api/classes'",
          "'/api/activities'"
        ]
        return !problematic.some(pattern =>
          swContent.includes(pattern) && !swContent.includes('//') && !swContent.includes('API_CONFIG')
        )
      }
    }
  ]

  let passed = 0
  let failed = 0

  fixes.forEach(fix => {
    const result = fix.check()
    if (result) {
      console.log(`✅ ${fix.name}`)
      passed++
    } else {
      console.log(`❌ ${fix.name}`)
      failed++
    }
  })

  // 统计修复前后的对比
  console.log('\n📊 修复统计:')
  console.log(`✅ 通过: ${passed}`)
  console.log(`❌ 失败: ${failed}`)
  console.log(`📈 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)

  // 显示配置详情
  console.log('\n🔧 配置详情:')
  if (swContent.includes('const API_CONFIG = {')) {
    const configStart = swContent.indexOf('const API_CONFIG = {')
    const configEnd = swContent.indexOf('}', configStart) + 1
    const configContent = swContent.substring(configStart, configEnd)
    console.log(configContent)
  }

  // 显示 API_ENDPOINTS 配置
  console.log('\n📝 API_ENDPOINTS 配置:')
  if (swContent.includes('const API_ENDPOINTS = [')) {
    const endpointsStart = swContent.indexOf('const API_ENDPOINTS = [')
    const endpointsEnd = swContent.indexOf(']', endpointsStart) + 1
    const endpointsContent = swContent.substring(endpointsStart, endpointsEnd)
    console.log(endpointsContent)
  }

  return failed === 0
}

// 运行验证
const success = verifyFix()
console.log(`\n${success ? '🎉 修复验证成功！' : '⚠️ 还有问题需要解决。'}`)
process.exit(success ? 0 : 1)