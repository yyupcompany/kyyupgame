/**
 * 本地路由测试 - 检查路由配置是否正确加载
 */

console.log('🔍 检查路由配置...')

// 模拟检查路由配置
const fs = require('fs')
const path = require('path')

const routesFile = '/home/devbox/project/client/src/router/optimized-routes.ts'
const content = fs.readFileSync(routesFile, 'utf8')

console.log('📋 搜索 notification-center 路由...')

// 检查是否有notification-center路由
const hasNotificationCenter = content.includes("path: 'dashboard/notification-center'")
console.log(`✅ notification-center 路由存在: ${hasNotificationCenter}`)

// 检查是否被注释
const isCommented = content.includes("// path: 'dashboard/notification-center'")
console.log(`💤 路由是否被注释: ${isCommented}`)

// 提取相关路由配置
const lines = content.split('\n')
const relevantLines = lines.filter((line, index) => {
  const lineContent = line.toLowerCase()
  return lineContent.includes('notification-center') || 
         lineContent.includes('importantnotices') ||
         (index > 0 && lines[index - 1].toLowerCase().includes('notification-center')) ||
         (index < lines.length - 1 && lines[index + 1].toLowerCase().includes('notification-center'))
})

console.log('\n📄 相关路由配置:')
relevantLines.forEach(line => {
  console.log(`   ${line.trim()}`)
})

// 检查ImportantNotices组件是否存在
const componentPath = '/home/devbox/project/client/src/pages/dashboard/ImportantNotices.vue'
const componentExists = fs.existsSync(componentPath)
console.log(`\n✅ ImportantNotices.vue 组件存在: ${componentExists}`)

console.log('\n🎯 结论:')
if (hasNotificationCenter && !isCommented && componentExists) {
  console.log('   ✅ 路由配置正确，组件存在')
  console.log('   💡 如果仍然显示404，可能是以下原因:')
  console.log('      1. 前端服务需要重启以加载新路由')
  console.log('      2. 浏览器缓存问题')
  console.log('      3. 路由配置语法错误')
} else {
  console.log('   ❌ 配置有问题:')
  console.log(`      - 路由存在: ${hasNotificationCenter}`)
  console.log(`      - 未被注释: ${!isCommented}`)
  console.log(`      - 组件存在: ${componentExists}`)
}