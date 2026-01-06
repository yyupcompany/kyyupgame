/**
 * 侧边栏专用图标检测脚本
 * 专注于检测侧边栏组件中的静态图标映射问题
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 从 icon-mapping.ts 提取的已知图标名称
const KNOWN_ICON_NAMES = new Set([
  'lightning', 'principal', 'dashboard', 'enrollment', 'activity', 'marketing', 'ai-center', 'system',
  'personnel', 'students', 'teachers', 'classes', 'grades', 'notifications', 'schedule', 'reports',
  'finance', 'settings', 'monitor', 'statistics', 'messages', 'media', 'task', 'script', 'search',
  'health', 'growth', 'security', 'profile', 'performance', 'customers', 'ai-brain', 'design',
  'activities', 'analytics', 'ai-robot', 'chevron-down', 'chevron-up', 'chevron-right', 'chevron-left',
  'check', 'close', 'warning', 'info', 'service', 'target', 'setting', 'user', 'user-filled',
  'calendar', 'school', 'promotion', 'cpu', 'list', 'money', 'user-plus', 'arrow-right', 'user-group',
  'user-check', 'plus', 'document', 'picture', 'trend-charts', 'arrow-left', 'edit', 'chat-dot-round',
  'magic-stick', 'data-analysis', 'default', 'clock', 'refresh', 'video-camera', 'reading',
  'document-new', 'location', 'bell', 'setting-new', 'chat-square', 'dashboard-new', 'home', 'menu',
  'grid', 'folder', 'tag', 'bookmark', 'download', 'upload', 'star', 'heart', 'share', 'lock', 'unlock',
  // 新增图标
  'briefcase', 'phone', 'book-open'
])

// 图标别名映射
const ICON_ALIASES = {
  'layoutdashboard': 'dashboard',
  'graduationcap': 'school',
  'checksquare': 'task',
  'messagesquare': 'chat-square',
  'files': 'document',
  'dollarsign': 'finance',
  'phone': 'phone',
  'video': 'video-camera',
  'bookopen': 'book-open',
  'checkcircle2': 'check',
  'clock': 'clock',
  'building2': 'home',
  'briefcase': 'briefcase',
  'megaphone': 'marketing',
  'users': 'user-group',
  'barchart3': 'analytics',
  'settings': 'settings',
  'brain': 'ai-brain',
  'usercheck': 'user-check',
  'calendar': 'calendar',
  'home': 'home',
  'filetext': 'document',
  'trendingup': 'growth',
  'bell': 'bell',
  'star': 'star'
}

// 统计信息
const stats = {
  totalFiles: 0,
  scannedFiles: 0,
  totalIcons: 0,
  mappedIcons: 0,
  unmappedIcons: 0,
  sidebarFiles: [],
  unmappedList: [],
  mappedList: []
}

/**
 * 检查图标是否有映射
 */
function checkIconMapping(iconName) {
  const cleaned = iconName.replace(/['"]/g, '').trim().toLowerCase()

  if (!cleaned) {
    return { mapped: false, reason: 'Empty icon name', original: iconName }
  }

  // 检查已知图标名称
  if (KNOWN_ICON_NAMES.has(cleaned)) {
    return { mapped: true, target: cleaned, original: iconName }
  }

  // 检查别名映射
  if (ICON_ALIASES[cleaned] && KNOWN_ICON_NAMES.has(ICON_ALIASES[cleaned])) {
    return { mapped: true, target: ICON_ALIASES[cleaned], original: iconName }
  }

  return { mapped: false, reason: 'No mapping found', original: iconName }
}

/**
 * 从侧边栏文件提取图标
 */
function extractIconsFromSidebar(content) {
  const icons = []

  // 匹配 icon: 'iconName' 格式
  const pattern = /icon:\s*['"]([^'"]+)['"]/g
  let match
  while ((match = pattern.exec(content)) !== null) {
    icons.push(match[1])
  }

  return [...new Set(icons)]
}

/**
 * 检查是否为侧边栏文件
 */
function isSidebarFile(filePath) {
  return filePath.includes('sidebar') || filePath.includes('Sidebar')
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  stats.totalFiles++

  try {
    const content = fs.readFileSync(filePath, 'utf8')

    if (!content.includes('UnifiedIcon')) {
      return
    }

    const isSidebar = isSidebarFile(filePath)
    if (isSidebar) {
      stats.sidebarFiles.push(path.relative(process.cwd(), filePath))
    }

    stats.scannedFiles++

    const icons = extractIconsFromSidebar(content)

    for (const iconName of icons) {
      stats.totalIcons++

      const result = checkIconMapping(iconName)

      if (result.mapped) {
        stats.mappedIcons++
        if (!stats.mappedList.includes(result.target)) {
          stats.mappedList.push(result.target)
        }
      } else {
        stats.unmappedIcons++
        stats.unmappedList.push({
          icon: result.original,
          file: path.relative(process.cwd(), filePath),
          isSidebar,
          reason: result.reason
        })
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
  }
}

/**
 * 扫描目录
 */
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue
      }
      scanDirectory(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      processFile(fullPath)
    }
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n' + '='.repeat(80))
  console.log('🔍 侧边栏图标映射检测报告')
  console.log('='.repeat(80))

  console.log('\n📊 统计信息:')
  console.log(`  总文件数: ${stats.totalFiles}`)
  console.log(`  扫描文件数: ${stats.scannedFiles}`)
  console.log(`  侧边栏文件数: ${stats.sidebarFiles.length}`)
  console.log(`  总图标数: ${stats.totalIcons}`)
  console.log(`  已映射图标: ${stats.mappedIcons}`)
  console.log(`  未映射图标: ${stats.unmappedIcons}`)

  if (stats.unmappedList.length > 0) {
    console.log('\n❌ 未映射的图标:')
    console.log('-'.repeat(80))

    const sidebarUnmapped = stats.unmappedList.filter(item => item.isSidebar)
    const otherUnmapped = stats.unmappedList.filter(item => !item.isSidebar)

    if (sidebarUnmapped.length > 0) {
      console.log('\n  🚨 侧边栏文件中的未映射图标:')
      for (const item of sidebarUnmapped) {
        console.log(`    - ${item.icon} (${item.file})`)
      }
    }

    if (otherUnmapped.length > 0) {
      console.log(`\n  📄 其他文件中的未映射图标 (${otherUnmapped.length}个)`)
    }

    console.log('\n💡 建议:')
    console.log('  1. 在 icon-mapping.ts 中添加映射')
    console.log('  2. 在 UnifiedIcon.vue 中添加图标定义')
    console.log('  3. 检查图标名称拼写')
  } else {
    console.log('\n✅ 所有侧边栏图标都已正确映射!')
  }

  console.log('\n✅ 已映射的图标:')
  console.log('-'.repeat(80))
  stats.mappedList.sort().forEach(icon => {
    console.log(`  ✓ ${icon}`)
  })

  console.log('\n' + '='.repeat(80) + '\n')
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始扫描侧边栏图标映射...\n')

  const scanDirs = ['src/components', 'src/pages', 'src/layouts']

  for (const dir of scanDirs) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      console.log(`📂 扫描目录: ${dir}`)
      scanDirectory(fullPath)
    }
  }

  generateReport()
}

// 运行脚本
main()
