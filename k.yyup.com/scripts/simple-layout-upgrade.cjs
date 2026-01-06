#!/usr/bin/env node

/**
 * 简化版统一布局升级脚本
 * 将所有使用 center-container 的页面迁移到 UnifiedCenterLayout 组件
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 配置
const config = {
  // 需要处理的目录
  teacherCenterDir: 'client/src/pages/teacher-center',
  centersDir: 'client/src/pages/centers',
  // 统一布局组件
  unifiedLayout: 'client/src/components/layout/UnifiedCenterLayout.vue'
}

// ANSI 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
}

// 日志函数
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${colors[color]}${message}${colors.reset}`)
}

// 获取文件列表
function getFiles(dir) {
  try {
    return glob.sync(`${dir}/**/*.vue`, { cwd: '.' })
  } catch (error) {
    log(`获取文件列表失败: ${error.message}`, 'red')
    return []
  }
}

// 检查文件是否需要升级
function needsUpgrade(fileContent) {
  // 检查是否已经使用了UnifiedCenterLayout
  const hasUnifiedLayout = fileContent.includes('import UnifiedCenterLayout from') ||
                           fileContent.includes('<UnifiedCenterLayout')

  // 检查是否使用了center-container但还没有使用UnifiedCenterLayout
  const hasCenterContainer = fileContent.includes('class="center-container"') ||
                             fileContent.includes("class='center-container'") ||
                             fileContent.includes('center-container')

  return hasCenterContainer && !hasUnifiedLayout
}

// 升级单个文件 - 简单策略
function upgradeFile(filePath) {
  try {
    log(`正在升级: ${filePath}`, 'blue')

    let fileContent = fs.readFileSync(filePath, 'utf8')
    const originalContent = fileContent

    // 简单的升级策略：替换模板部分
    if (fileContent.includes('<template>') && fileContent.includes('</template>')) {
      // 提取原始模板内容
      const templateMatch = fileContent.match(/<template>([\s\S]*?)<\/template>/)
      if (templateMatch) {
        const originalTemplate = templateMatch[1].trim()

        // 创建新的模板结构
        const newTemplate = `<UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    ${originalTemplate}
  </UnifiedCenterLayout>`

        // 替换模板内容
        fileContent = fileContent.replace(
          /<template>([\s\S]*?)<\/template>/,
          `<template>\n  ${newTemplate}\n</template>`
        )

        // 添加import语句（如果还没有）
        if (!fileContent.includes('import UnifiedCenterLayout from')) {
          const importStatement = "import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'"

          // 在<script>后添加import
          fileContent = fileContent.replace(
            /<script[^>]*>([\s\S]*?)(?:import\s+[\s\S]*?from\s+[\s\S]*?\n)?/,
            (match, p1) => {
              if (match.includes('import UnifiedCenterLayout')) {
                return match
              }
              return match.replace(/<script[^>]*>/, `$&\n${importStatement}\n`)
            }
          )
        }

        // 写入文件
        if (fileContent !== originalContent) {
          fs.writeFileSync(filePath, fileContent, 'utf8')
          log(`✅ 成功升级: ${filePath}`, 'green')
          return true
        }
      }
    }

    log(`无需升级: ${filePath}`, 'yellow')
    return false

  } catch (error) {
    log(`升级文件失败 ${filePath}: ${error.message}`, 'red')
    return false
  }
}

// 主函数
async function main() {
  log('🚀 开始统一布局升级...', 'cyan')

  // 获取所有文件
  const teacherCenterFiles = getFiles(config.teacherCenterDir)
  const centersFiles = getFiles(config.centersDir)
  const allFiles = [...teacherCenterFiles, ...centersFiles]

  log(`📊 发现页面总数: ${allFiles.length} 个`, 'blue')
  log(`📋 teacher-center: ${teacherCenterFiles.length} 个页面`, 'blue')
  log(`📊 centers: ${centersFiles.length} 个页面`, 'blue')

  // 统计
  let total = 0
  let upgraded = 0
  let skipped = 0

  // 处理每个文件
  for (const file of allFiles) {
    total++
    try {
      const fileContent = fs.readFileSync(file, 'utf8')

      if (needsUpgrade(fileContent)) {
        if (upgradeFile(file)) {
          upgraded++
        }
      } else {
        skipped++
        log(`✅ 已使用UnifiedCenterLayout或无需升级: ${file}`, 'green')
      }
    } catch (error) {
      log(`处理文件失败 ${file}: ${error.message}`, 'red')
    }
  }

  // 输出结果
  log('\n📊 升级完成统计:', 'cyan')
  log(`📊 总页面数: ${total}`, 'blue')
  log(`✅ 已升级: ${upgraded}`, 'green')
  log(`⏭️  跳过: ${skipped}`, 'yellow')

  log('🎉 升级任务完成！', 'green')
}

// 运行脚本
if (require.main === module) {
  main().catch((error) => {
    log(`升级过程中发生错误: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = {
  main,
  getFiles,
  needsUpgrade,
  upgradeFile,
  config
}