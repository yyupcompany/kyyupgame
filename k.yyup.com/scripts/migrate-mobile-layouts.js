#!/usr/bin/env node
/**
 * 移动端布局迁移脚本
 * 将 MobileMainLayout 替换为 MobileSubPageLayout
 */

const fs = require('fs')
const path = require('path')

// 配置
const config = {
  centers: {
    searchDir: 'client/src/pages/mobile/centers',
    backPath: '/mobile/centers'
  },
  parentCenter: {
    searchDir: 'client/src/pages/mobile/parent-center',
    backPath: '/mobile/parent-center'
  },
  teacherCenter: {
    searchDir: 'client/src/pages/mobile/teacher-center',
    backPath: '/mobile/teacher-center'
  },
  other: {
    files: [
      'client/src/pages/mobile/global-search/index.vue',
      'client/src/pages/mobile/quick-actions/index.vue',
      'client/src/pages/mobile/dashboard/index.vue',
      'client/src/pages/mobile/marketing/config.vue'
    ],
    backPath: '/mobile/centers'
  }
}

// 获取所有 .vue 文件
function getVueFiles(dir, files = []) {
  const fullPath = path.resolve(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) return files
  
  const items = fs.readdirSync(fullPath)
  for (const item of items) {
    const itemPath = path.join(fullPath, item)
    const stat = fs.statSync(itemPath)
    if (stat.isDirectory()) {
      getVueFiles(path.join(dir, item), files)
    } else if (item.endsWith('.vue')) {
      files.push(path.join(dir, item))
    }
  }
  return files
}

// 更新单个文件
function updateFile(filePath, backPath) {
  const fullPath = path.resolve(process.cwd(), filePath)
  if (!fs.existsSync(fullPath)) {
    console.log(`  [跳过] 文件不存在: ${filePath}`)
    return false
  }

  let content = fs.readFileSync(fullPath, 'utf-8')
  
  // 检查是否使用 MobileMainLayout
  if (!content.includes('MobileMainLayout')) {
    console.log(`  [跳过] 未使用 MobileMainLayout: ${filePath}`)
    return false
  }

  // 获取页面标题
  const titleMatch = content.match(/title="([^"]+)"/)
  const title = titleMatch ? titleMatch[1] : '详情'

  // 1. 替换 import 语句
  content = content.replace(
    /import\s+MobileMainLayout\s+from\s+['"]@\/components\/mobile\/layouts\/MobileMainLayout\.vue['"]/g,
    `import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'`
  )

  // 2. 替换开始标签 - 处理多种情况
  // 情况1: <MobileMainLayout title="xxx" :show-back="true" :show-footer="true" ...>
  content = content.replace(
    /<MobileMainLayout[\s\S]*?(?=>)/g,
    (match) => {
      // 提取 title
      const titleMatch = match.match(/title="([^"]+)"/)
      const extractedTitle = titleMatch ? titleMatch[1] : title
      return `<MobileSubPageLayout title="${extractedTitle}" back-path="${backPath}"`
    }
  )

  // 3. 替换结束标签
  content = content.replace(/<\/MobileMainLayout>/g, '</MobileSubPageLayout>')

  // 4. 移除 header-extra 和 headerRight 等不再需要的 slot（可选保留）
  // 保留这些 slot 以防子页面布局支持

  // 5. 确保有主题检测逻辑（检查是否已存在）
  if (!content.includes('detectTheme') && !content.includes('isDark')) {
    // 在 script setup 中添加主题检测
    const scriptMatch = content.match(/<script\s+setup[^>]*>/g)
    if (scriptMatch) {
      // 找到 onMounted 并添加主题检测，或者在 script 开头添加
      if (content.includes('onMounted')) {
        // 如果已有 onMounted，在其后添加主题检测调用
        content = content.replace(
          /onMounted\s*\(\s*(?:async\s*)?\(\s*\)\s*=>\s*\{/,
          `onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()`
        )
      }
    }
  }

  // 写回文件
  fs.writeFileSync(fullPath, content, 'utf-8')
  console.log(`  [更新] ${filePath}`)
  return true
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const phase = args[0] || 'all'

  console.log('==========================================')
  console.log('移动端布局迁移脚本')
  console.log('==========================================\n')

  let updated = 0
  let skipped = 0

  if (phase === 'centers' || phase === 'all') {
    console.log('阶段1: 更新 centers 目录页面')
    console.log('------------------------------------------')
    const files = getVueFiles(config.centers.searchDir)
    for (const file of files) {
      if (updateFile(file, config.centers.backPath)) {
        updated++
      } else {
        skipped++
      }
    }
    console.log('')
  }

  if (phase === 'parent' || phase === 'all') {
    console.log('阶段2: 更新 parent-center 目录页面')
    console.log('------------------------------------------')
    const files = getVueFiles(config.parentCenter.searchDir)
    for (const file of files) {
      if (updateFile(file, config.parentCenter.backPath)) {
        updated++
      } else {
        skipped++
      }
    }
    console.log('')
  }

  if (phase === 'teacher' || phase === 'all') {
    console.log('阶段3: 更新 teacher-center 目录页面')
    console.log('------------------------------------------')
    const files = getVueFiles(config.teacherCenter.searchDir)
    for (const file of files) {
      if (updateFile(file, config.teacherCenter.backPath)) {
        updated++
      } else {
        skipped++
      }
    }
    console.log('')
  }

  if (phase === 'other' || phase === 'all') {
    console.log('阶段4: 更新其他页面')
    console.log('------------------------------------------')
    for (const file of config.other.files) {
      if (updateFile(file, config.other.backPath)) {
        updated++
      } else {
        skipped++
      }
    }
    console.log('')
  }

  console.log('==========================================')
  console.log(`完成! 更新: ${updated} 个文件, 跳过: ${skipped} 个文件`)
  console.log('==========================================')
}

main()



