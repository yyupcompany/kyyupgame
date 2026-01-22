#!/usr/bin/env node
/**
 * 修复 onMounted 中的 async/await 问题
 */

const fs = require('fs')
const path = require('path')

const files = [
  'client/src/pages/mobile/quick-actions/index.vue',
  'client/src/pages/mobile/teacher-center/enrollment/index.vue',
  'client/src/pages/mobile/parent-center/communication/index.vue',
  'client/src/pages/mobile/parent-center/child-growth/index.vue',
  'client/src/pages/mobile/centers/task-form/index.vue',
  'client/src/pages/mobile/centers/task-center/index.vue',
  'client/src/pages/mobile/centers/system-log-center/index.vue',
  'client/src/pages/mobile/centers/student-management/index.vue',
  'client/src/pages/mobile/centers/settings-center/index.vue',
  'client/src/pages/mobile/centers/principal-center/index.vue',
  'client/src/pages/mobile/centers/schedule-center/index.vue',
  'client/src/pages/mobile/centers/photo-album-center/index.vue',
  'client/src/pages/mobile/centers/personnel-center/index.vue',
  'client/src/pages/mobile/centers/permission-center/index.vue',
  'client/src/pages/mobile/centers/my-task-center/index.vue',
  'client/src/pages/mobile/centers/enrollment-center/index.vue',
  'client/src/pages/mobile/centers/document-statistics/index.vue',
  'client/src/pages/mobile/centers/document-center/index.vue',
  'client/src/pages/mobile/centers/customer-pool-center/index.vue'
]

let fixed = 0
let skipped = 0

for (const file of files) {
  const fullPath = path.resolve(process.cwd(), file)
  if (!fs.existsSync(fullPath)) {
    console.log(`[跳过] 文件不存在: ${file}`)
    skipped++
    continue
  }

  let content = fs.readFileSync(fullPath, 'utf-8')
  
  // 修复模式1: onMounted(() => { ... detectTheme() ... await ...
  // 替换为: onMounted(async () => { ... await ...
  const pattern = /onMounted\s*\(\s*\(\s*\)\s*=>\s*\{\s*\n\s*\/\/ 主题检测\s*\n\s*const detectTheme = \(\) => \{\s*\n\s*const htmlTheme = document\.documentElement\.getAttribute\('data-theme'\)\s*\n\s*\/\/ isDark\.value = htmlTheme === 'dark'\s*\n\s*\}\s*\n\s*detectTheme\(\)/g
  
  if (pattern.test(content)) {
    content = content.replace(pattern, 'onMounted(async () => {')
    fs.writeFileSync(fullPath, content, 'utf-8')
    console.log(`[修复] ${file}`)
    fixed++
  } else {
    // 尝试更简单的模式
    const simplePattern = /onMounted\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?detectTheme\(\)/g
    if (simplePattern.test(content)) {
      // 移除 detectTheme 相关代码并添加 async
      content = content.replace(
        /onMounted\s*\(\s*\(\s*\)\s*=>\s*\{\s*\n\s*\/\/ 主题检测[\s\S]*?detectTheme\(\)\s*\n/g,
        'onMounted(async () => {\n'
      )
      fs.writeFileSync(fullPath, content, 'utf-8')
      console.log(`[修复] ${file}`)
      fixed++
    } else {
      console.log(`[跳过] 无法匹配模式: ${file}`)
      skipped++
    }
  }
}

console.log(`\n完成! 修复: ${fixed} 个文件, 跳过: ${skipped} 个文件`)



