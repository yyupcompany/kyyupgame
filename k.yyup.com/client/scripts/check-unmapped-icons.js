/**
 * 图标映射检测脚本
 * 自动扫描项目中所有使用UnifiedIcon的组件，找出未映射的图标
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 图标映射数据（从 icon-mapping.ts 提取的已知图标名称）
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
  // CentersSidebar 新增图标
  'briefcase', 'phone', 'book-open'
])

// 图标别名映射（从 ICON_ALIASES 提取）
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
  'star': 'star',
  'dashboard': 'dashboard',
  'user': 'user',
  'student': 'students',
  'teacher': 'teachers',
  'class': 'classes',
  'parent': 'parent-group',
  'users': 'user-group',
  'avatar': 'user-filled',
  'user-circle': 'user',
  'userplus': 'user-plus',
  'user-plus': 'user-plus',
  'usercheck': 'user-check',
  'monitor': 'monitor',
  'home': 'home',
  'menu': 'menu',
  'grid': 'grid',
  'calendar': 'calendar',
  'school': 'school',
  'graduation-cap': 'school',
  'message': 'messages',
  'message-square': 'chat-square',
  'chat-line-round': 'chat-dot-round',
  'chat-line-square': 'chat-square',
  'chatdotround': 'chat-dot-round',
  'magicstick': 'magic-stick',
  'magic-stick': 'magic-stick',
  'data-analysis': 'data-analysis',
  'megaphone': 'marketing',
  'marketing': 'marketing',
  'money': 'money',
  'credit-card': 'finance',
  'dollar-sign': 'finance',
  'list': 'list',
  'folder-opened': 'folder',
  'document': 'document',
  'document-add': 'document-new',
  'document-checked': 'document',
  'file-text': 'document',
  'files': 'document',
  'picture': 'picture',
  'promotion': 'design',
  'target': 'target',
  'bell': 'bell',
  'clock': 'clock',
  'location': 'location',
  'refresh': 'refresh',
  'video-camera': 'video-camera',
  'reading': 'reading',
  'setting': 'setting',
  'settings': 'settings',
  'setting-new': 'setting-new',
  'system': 'system',
  'statistics': 'statistics',
  'analytics': 'analytics',
  'trendcharts': 'trend-charts',
  'trend-charts': 'trend-charts',
  'chart-line': 'trend-charts',
  'bar-chart': 'analytics',
  'pie-chart': 'analytics',
  'lock': 'lock',
  'unlock': 'unlock',
  'notification': 'notifications',
  'notifications': 'notifications',
  'ai': 'ai-center',
  'brain': 'ai-brain',
  'chat': 'messages',
  'document-new': 'document-new',
  'plus': 'plus',
  'download': 'download',
  'upload': 'upload',
  'star': 'star',
  'heart': 'heart',
  'share': 'share',
  'warning': 'warning',
  'info': 'info',
  'service': 'service',
  'customers': 'customers',
  'enrollment': 'enrollment',
  'activity': 'activity',
  'activities': 'activities',
  'finance': 'finance',
  'personnel': 'personnel',
  'task': 'task',
  'script': 'script',
  'media': 'media',
  'ai-center': 'ai-center',
  'application': 'document',
  'peoples': 'user-group',
  'tree-table': 'grid',
  // CentersSidebar 专用图标映射
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
  // ParentCenter & TeacherCenter 专用图标映射
  'home': 'home',
  'filetext': 'document',
  'trendingup': 'growth',
  'bell': 'bell',
  'star': 'star'
}

// 扫描目录配置
const SCAN_DIRS = [
  'src/components',
  'src/pages',
  'src/layouts'
]

// 文件扩展名
const FILE_EXTENSIONS = ['.vue', '.ts', '.js']

// 统计信息
const stats = {
  totalFiles: 0,
  scannedFiles: 0,
  totalIcons: 0,
  mappedIcons: 0,
  unmappedIcons: 0,
  unmappedList: [],
  mappedList: []
}

/**
 * 将图标名称转换为小写并转换为kebab-case
 */
function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
}

/**
 * 检查图标是否有映射
 */
function checkIconMapping(iconName) {
  const originalName = iconName

  // 清理图标名称（移除特殊字符）
  const cleaned = iconName.replace(/['"]/g, '').trim()

  // 检查是否为空
  if (!cleaned) {
    return { mapped: false, reason: 'Empty icon name', original: originalName }
  }

  // 转换为小写
  const lower = cleaned.toLowerCase()

  // 检查已知图标名称
  if (KNOWN_ICON_NAMES.has(lower)) {
    return { mapped: true, target: lower, original: originalName }
  }

  // 转换为kebab-case
  const kebab = toKebabCase(cleaned)

  // 检查kebab-case版本
  if (KNOWN_ICON_NAMES.has(kebab)) {
    return { mapped: true, target: kebab, original: originalName }
  }

  // 检查别名映射
  if (ICON_ALIASES[lower] && KNOWN_ICON_NAMES.has(ICON_ALIASES[lower])) {
    return { mapped: true, target: ICON_ALIASES[lower], original: originalName }
  }

  if (ICON_ALIASES[kebab] && KNOWN_ICON_NAMES.has(ICON_ALIASES[kebab])) {
    return { mapped: true, target: ICON_ALIASES[kebab], original: originalName }
  }

  return { mapped: false, reason: 'No mapping found', original: originalName }
}

/**
 * 从文件内容中提取图标名称
 */
function extractIconsFromContent(content) {
  const icons = []

  // 匹配模式 1: :name="iconName" 或 :name='iconName'
  const pattern1 = /:name=["']([^"']+)["']/g
  let match
  while ((match = pattern1.exec(content)) !== null) {
    icons.push(match[1])
  }

  // 匹配模式 2: icon: 'iconName' 或 icon: "iconName"
  const pattern2 = /icon:\s*["']([^"']+)["']/g
  while ((match = pattern2.exec(content)) !== null) {
    icons.push(match[1])
  }

  return [...new Set(icons)] // 去重
}

/**
 * 扫描目录中的所有文件
 */
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      // 跳过 node_modules 和 .git 等目录
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue
      }
      scanDirectory(fullPath)
    } else if (entry.isFile()) {
      // 检查文件扩展名
      const ext = path.extname(entry.name)
      if (FILE_EXTENSIONS.includes(ext)) {
        processFile(fullPath)
      }
    }
  }
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  stats.totalFiles++

  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // 检查是否包含 UnifiedIcon
    if (!content.includes('UnifiedIcon')) {
      return
    }

    stats.scannedFiles++

    const icons = extractIconsFromContent(content)

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
          reason: result.reason
        })
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n' + '='.repeat(80))
  console.log('🔍 图标映射检测报告')
  console.log('='.repeat(80))

  console.log('\n📊 统计信息:')
  console.log(`  总文件数: ${stats.totalFiles}`)
  console.log(`  扫描文件数: ${stats.scannedFiles}`)
  console.log(`  总图标数: ${stats.totalIcons}`)
  console.log(`  已映射图标: ${stats.mappedIcons}`)
  console.log(`  未映射图标: ${stats.unmappedIcons}`)

  if (stats.unmappedList.length > 0) {
    console.log('\n❌ 未映射的图标列表:')
    console.log('-'.repeat(80))

    // 按文件分组
    const byFile = {}
    for (const item of stats.unmappedList) {
      if (!byFile[item.file]) {
        byFile[item.file] = []
      }
      byFile[item.file].push(item.icon)
    }

    for (const [file, icons] of Object.entries(byFile)) {
      console.log(`\n  📁 ${file}`)
      icons.forEach(icon => {
        console.log(`    - ${icon}`)
      })
    }

    console.log('\n💡 建议:')
    console.log('  1. 检查图标名称是否正确')
    console.log('  2. 在 icon-mapping.ts 中添加映射')
    console.log('  3. 在 UnifiedIcon.vue 中添加图标定义')
  } else {
    console.log('\n✅ 所有图标都已正确映射!')
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
  console.log('🚀 开始扫描图标映射...\n')

  for (const dir of SCAN_DIRS) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      console.log(`📂 扫描目录: ${dir}`)
      scanDirectory(fullPath)
    } else {
      console.log(`⚠️  目录不存在: ${dir}`)
    }
  }

  generateReport()
}

// 运行脚本
main()
