#!/usr/bin/env node

/**
 * 统一布局升级脚本
 * 将所有使用 center-container 的页面迁移到 UnifiedCenterLayout 组件
 * 实现完全响应式布局和内容填满
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 配置
const config = {
  // 需要处理的目录
  teacherCenterDir: 'src/pages/teacher-center',
  centersDir: 'src/pages/centers',
  // 统一布局组件
  unifiedLayout: 'src/components/layout/UnifiedCenterLayout.vue',
  // 备份目录
  backupDir: 'src/pages/backup',
  // 统计文件
  statsFile: 'layout-upgrade-stats.json',
  // 日志文件
  logFile: 'layout-upgrade.log'
}

// ANSI 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m'
  gray: '\x1b[90m'
 37: '\x1b[37m'
  brightBlack: '\x1b[97m'
  brightWhite: '\x1b[97m'
  white: '\x1b[47m'
  bgDefault: '\x1b[100m'
  bgBlue: '\x1b[104m',
  bgGray: '\x1b[239m',
  bgDark: '\x1b[40m'
}

// 日志函数
function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${colors[level]} ${message}`)

  if (config.logFile) {
    fs.appendFileSync(config.logFile, `${timestamp} [${level}] ${message}\n`)
  }
}

// 打印消息
function print(message, level = 'info') {
  log(message, level)
  console.log(`${colors[level]}${message}`)
}

// 打印分割线
function printSeparator() {
  console.log(`${colors.cyan}========================================${colors.reset}`)
}

// 错误处理
function handleError(error, context) {
  log(`错误: ${error.message}`, 'error')
  if (context) {
    console.error(`在 ${context} 中发生错误:`, error)
  }
  process.exit(1)
}

// 获取文件列表
function getFiles(dir) {
  try {
    return glob.sync(`${dir}/**/*.vue`, { cwd: path.dirname(__dirname) })
  } catch (error) {
    handleError(error, '获取文件列表失败')
  }
  return []
}

// 检查文件是否使用了UnifiedCenterLayout
function checkFile(fileContent, filePath) {
  const hasUnifiedCenterLayout = fileContent.includes('import UnifiedCenterLayout from')
  const hasCenterContainerClass = fileContent.includes('class="center-container')
  const usesUnifiedCenterLayout = hasUnifiedCenterLayout && hasCenterContainerClass

  return {
    filePath,
    hasUnifiedCenterLayout,
    hasCenterContainerClass,
    usesUnifiedCenterLayout,
    needsUpgrade: hasCenterContainerClass && !usesUnifiedCenterLayout
  }
}

// 升级单个文件
function upgradeFile(filePath, upgradeStrategy) {
  try {
    log(`正在升级: ${filePath}`)

    let fileContent = fs.readFileSync(filePath, 'utf8')
    const originalContent = fileContent

    // 应用升级策略
    const upgradedContent = upgradeStrategy(fileContent)

    if (upgradedContent !== originalContent) {
      fs.writeFileSync(filePath, upgradedContent, 'utf8')
      log(`✅ 成功升级: ${filePath}`)
      return true
    } else {
      log(`无需升级: ${filePath}`)
      return false
    }
  } catch (error) {
    handleError(error, `升级文件失败: ${filePath}`)
    return false
  }
  }
}

// 定义升级策略
const upgradeStrategies = {
  // 策略1: 简单替换 - 将 center-container 替换为 UnifiedCenterLayout
  center: (content) => {
    return content
      .replace(/class="center-container/g, 'class="center-container') +
             'class="center-container').replace(/<div class="center-[^"]*">/, `<div class="center-container $1">`) +
             content.replace(/<\/div>/g, '</div>')
    }
  },

  // 策略2: 完整重构 - 完全重写页面模板
  complete: (content) => {
    return `
<UnifiedCenterLayout
    title="${getTitle(content)}"
    description="${getDescription(content)}"
    icon="${getIcon(content)}"
  >
      <template #header-actions>
        ${getHeaderActions(content)}
      </template>

      ${getStats(content)}

      <div class="main-content">
        ${getMainContent(content)}
      </div>
    </UnifiedCenterLayout>
`
  }
  },

  // 策略3: 保留式升级 - 最小化更改，保留原结构
  conservative: (content) => {
    return content
      .replace(/import UnifiedCenterLayout/g, '// $1') +
             content.replace(/export default {[\s\S]*} UnifiedCenterLayout[\s\S]*}/g, '')
  }
  }
}

// 自动选择升级策略
function selectUpgradeStrategy(fileContent) {
  const { hasScript, hasStyle } = /<script>/g.test(fileContent)

  // 如果没有使用UnifiedCenterLayout，使用策略1（简单替换）
  if (!hasUnifiedCenterLayout) {
    return upgradeStrategies.center
  }

  // 如果有script和style，检查是否复杂
  const complexity = fileContent.split('\n').length +
                     fileContent.match(/style[^>]*\{[^}]*\}/g || []).length

  // 根据复杂度选择策略
  if (complexity > 20) {
    log('使用保守升级策略')
    return upgradeStrategies.conservative
  } else if (hasStyle) {
    log('使用完整重构策略')
    return upgradeStrategies.complete
  } else {
    log('使用简单替换策略')
    return upgradeStrategies.center
    }
  }
}

// 辅助函数
function getTitle(content) {
  const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/)
  return titleMatch ? titleMatch[1] : '页面标题'
}

function getDescription(content) {
  const descMatch = content.match(/<p[^>]*>(.*?)<\/p>/)
  return descMatch ? descMatch[1] : '页面描述'
}

function getIcon(content) {
  // 这里可以根据页面内容返回合适的图标
  return 'User'
}

function getHeaderActions(content) {
  // 保持原有的头部操作按钮
  const headerActionsMatch = content.match(/<template #header-actions>[\s\S]*?<\/template>/)
  return headerActionsMatch ? headerActionsMatch[0] : ''
}

function getStats(content) {
  // 提取统计卡片部分
  const statsMatch = content.match(/<template #stats>[\s\S]*?<\/template>/)
  return statsMatch ? statsMatch[0] : ''
}

function getMainContent(content) {
  // 提取主要内容部分
  const mainContentMatch = content.match(/<div class="main-content">[\s\S]*?<\/div>/)
  return mainContentMatch ? mainContent[0] : ''
  }
}

// 主函数
async function main() {
  print('🚀 开始统一布局升级...')

  print('📂 扫描目录中...')

  const teacherCenterFiles = getFiles(config.teacherCenterDir)
  const centersFiles = getFiles(config.centersDir)
  const allFiles = [...teacherCenterFiles, ...centersFiles]

  print(`📊 发现页面总数: ${allFiles.length} 个`)

  print('📋 teacher-center: ${teacherCenterFiles.length} 个页面')
  print('📊 centers: ${centersFiles.length} 个页面`)

  print('📊 总计: ${allFiles.length} 个页面')

  printSeparator()

  // 初始化统计
  const stats = {
    total: 0,
    upgraded: 0,
    skipped: 0,
    errors: 0
  }

  print('🔄 开始分析 teacher-center 页面...')

  // 分析teacher-center页面
  for (const file of teacherCenterFiles) {
    const filePath = path.join(config.teacherCenterDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const analysis = checkFile(fileContent, filePath)

    stats.total++

    if (analysis.needsUpgrade) {
      print(`🔧 需要升级: ${filePath}`)
      stats.queued++
    } else {
      print(`✅ 已使用UnifiedCenterLayout: ${filePath}`)
      stats.upgraded++
    }
  }
  }

  print('🔄 开始分析 centers 页面...')
  for (const file of centersFiles) {
    const filePath = path.join(config.centersDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const analysis = checkFile(fileContent, filePath)

    stats.total++

    if (analysis.needsUpgrade) {
      print(`🔧 需要升级: ${filePath}`)
      stats.queued++
    } else {
      print(`✅ 已使用UnifiedCenterLayout: ${filePath}`)
      stats.upgraded++
    }
  }
  }

  print('📊 扫描分析完成')
  print('📊 总页面数:', stats.total)
  print('📊 已升级:', stats.upgraded)
  print('📊 待升级:', stats.queued)
  print('📊 跳过:', stats.skipped)
  print('📊 错误:', stats.errors)
  printSeparator()

  // 保存统计
  try {
    fs.writeFileSync(config.statsFile, JSON.stringify(stats, null, 2), 'utf-8')
    log('📈 统计数据已保存到:', config.statsFile)
  } catch (error) {
    handleError(error, '保存统计数据失败')
    }

  print('🎉 升级任务已准备就绪！')
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    handleError(error, '升级过程中发生错误')
  })
}

// 导出
module.exports = {
  main,
  getFiles,
  checkFile,
  upgradeStrategies,
  config
  stats
  colors
  log,
  print,
  printSeparator,
  handleError
  }
}