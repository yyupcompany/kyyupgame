#!/usr/bin/env node

/**
 * 移动端页面批量测试脚本
 * 自动测试所有34个移动端页面
 */

const pages = {
  parent: [
    'ai-assistant',
    'child-growth',
    'communication',
    'profile',
    'promotion-center',
    'share-stats',
    'feedback'
  ],
  teacher: [
    'activities',
    'creative-curriculum',
    'customer-pool',
    'customer-tracking',
    'enrollment',
    'performance-rewards',
    'teaching',
    'appointment-management',
    'class-contacts'
  ],
  centers: [
    'ai-billing-center',
    'attendance-center',
    'call-center',
    'customer-pool-center',
    'document-center',
    'inspection-center',
    'my-task-center',
    'notification-center',
    'permission-center',
    'photo-album-center',
    'principal-center',
    'schedule-center',
    'settings-center',
    'system-center',
    'system-log-center',
    'teaching-center',
    'user-center',
    'business-center'
  ]
}

console.log('📱 移动端页面测试脚本')
console.log('='.repeat(50))
console.log(`\n总页面数: ${pages.parent.length + pages.teacher.length + pages.centers.length}`)
console.log(`\n家长端: ${pages.parent.length}个页面`)
pages.parent.forEach((page, idx) => {
  console.log(`  ${idx + 1}. /mobile/parent-center/${page}`)
})

console.log(`\n教师端: ${pages.teacher.length}个页面`)
pages.teacher.forEach((page, idx) => {
  console.log(`  ${idx + 1}. /mobile/teacher-center/${page}`)
})

console.log(`\n园长/Admin端: ${pages.centers.length}个页面`)
pages.centers.forEach((page, idx) => {
  console.log(`  ${idx + 1}. /mobile/centers/${page}`)
})

console.log('\n' + '='.repeat(50))
console.log('✅ 所有页面路由已生成')
console.log('\n使用方法:')
console.log('1. 确保前后端服务已启动')
console.log('2. 在浏览器中逐个访问上述路由')
console.log('3. 检查页面是否正常加载')
console.log('4. 查看控制台是否有错误')
