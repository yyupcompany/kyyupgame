/**
 * 图标修复预览脚本 - 安全版本
 * 只预览，不修改文件
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 需要批量替换的映射表
const ICON_REPLACEMENTS = {
  'LayoutDashboard': 'dashboard',
  'GraduationCap': 'school',
  'CheckSquare': 'task',
  'MessageSquare': 'chat-square',
  'Files': 'document',
  'DollarSign': 'finance',
  'Phone': 'phone',
  'Video': 'video-camera',
  'BookOpen': 'book-open',
  'CheckCircle2': 'check',
  'Clock': 'clock',
  'Building2': 'home',
  'Briefcase': 'briefcase',
  'Megaphone': 'marketing',
  'Users': 'user-group',
  'BarChart3': 'analytics',
  'Settings': 'settings',
  'Brain': 'ai-brain',
  'UserCheck': 'user-check',
  'Calendar': 'calendar',
  'Home': 'home',
  'FileText': 'document',
  'TrendingUp': 'growth',
  'Bell': 'bell',
  'Star': 'star',
  'Gamepad2': 'star',
  'Management': 'settings',
  'Tools': 'setting',
  'Connection': 'link',
  'View': 'eye',
  'CopyDocument': 'copy',
  'Trophy': 'star',
  'Shield': 'security',
  'Flag': 'flag',
  'Crown': 'star',
  'Sunny': 'sun',
  'Moon': 'moon'
}

// 扫描目录
const SCAN_DIRS = ['src/components', 'src/pages', 'src/layouts']

// 文件扩展名
const FILE_EXTENSIONS = ['.vue', '.ts']

// 统计
const stats = {
  totalFiles: 0,
  filesWithChanges: 0,
  totalReplacements: 0,
  changes: []
}

/**
 * 检查文件是否包含需要替换的图标
 */
function checkFileForIcons(filePath, content) {
  const changes = []

  for (const [oldName, newName] of Object.entries(ICON_REPLACEMENTS)) {
    // 检查 icon: 'Name' 格式
    const pattern1 = new RegExp(`icon:\\s*['"]${oldName}['"]`, 'g')
    if (pattern1.test(content)) {
      const matches = content.match(pattern1) || []
      changes.push({
        type: 'property',
        old: `icon: '${oldName}'`,
        new: `icon: '${newName}'`,
        count: matches.length
      })
    }

    // 检查 :name="'Name'" 格式
    const pattern2 = new RegExp(`:name=["']${oldName}["']`, 'g')
    if (pattern2.test(content)) {
      const matches = content.match(pattern2) || []
      changes.push({
        type: 'binding',
        old: `:name="'${oldName}'"`,
        new: `:name="'${newName}'"`,
        count: matches.length
      })
    }

    // 检查 name="Name" 格式
    const pattern3 = new RegExp(`name=["']${oldName}["']`, 'g')
    if (pattern3.test(content)) {
      const matches = content.match(pattern3) || []
      changes.push({
        type: 'attribute',
        old: `name="${oldName}"`,
        new: `name="${newName}"`,
        count: matches.length
      })
    }
  }

  return changes
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
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (FILE_EXTENSIONS.includes(ext)) {
        stats.totalFiles++
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          const changes = checkFileForIcons(fullPath, content)
          if (changes.length > 0) {
            stats.filesWithChanges++
            const replacementCount = changes.reduce((sum, change) => sum + change.count, 0)
            stats.totalReplacements += replacementCount
            stats.changes.push({
              file: path.relative(process.cwd(), fullPath),
              replacements: replacementCount,
              details: changes
            })
          }
        } catch (error) {
          console.error(`❌ Error processing ${fullPath}:`, error.message)
        }
      }
    }
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n' + '='.repeat(80))
  console.log('🔍 图标修复预览报告')
  console.log('='.repeat(80))

  console.log('\n📊 预览统计:')
  console.log(`  总文件数: ${stats.totalFiles}`)
  console.log(`  需修改文件数: ${stats.filesWithChanges}`)
  console.log(`  总替换次数: ${stats.totalReplacements}`)

  if (stats.changes.length > 0) {
    console.log('\n📝 修改详情预览:')
    console.log('-'.repeat(80))

    stats.changes.forEach((change, index) => {
      console.log(`\n${index + 1}. ${change.file}`)
      console.log(`   ⚠️  替换次数: ${change.replacements}`)
      change.details.forEach(detail => {
        console.log(`   ${detail.old} → ${detail.new} (${detail.count}次)`)
      })
    })

    console.log('\n' + '='.repeat(80))
    console.log('⚠️  这是预览模式，未修改任何文件！')
    console.log('✅ 如需实际修改，请运行: node scripts/batch-fix-icons.js')
    console.log('='.repeat(80) + '\n')
  } else {
    console.log('\n✅ 没有需要修改的文件')
    console.log('='.repeat(80) + '\n')
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始预览图标修复...\n')

  for (const dir of SCAN_DIRS) {
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
