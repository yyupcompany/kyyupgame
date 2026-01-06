#!/usr/bin/env node

/**
 * 暗黑主题卡片边框修复脚本
 * Dark Theme Card Border Fix Script
 *
 * 用于批量修复硬编码的白色边框问题
 */

const fs = require('fs')
const path = require('path')

// 要修复的文件模式
const patterns = [
  {
    pattern: /border:\s*(\d+px\s+)?solid\s+white/gi,
    replacement: 'border: $1solid var(--border-color)',
    description: '硬编码白色边框 -> CSS变量'
  },
  {
    pattern: /border:\s*(\d+px\s+)?solid\s+#fff/gi,
    replacement: 'border: $1solid var(--border-color)',
    description: '硬编码#fff边框 -> CSS变量'
  },
  {
    pattern: /border:\s*(\d+px\s+)?solid\s+#ffffff/gi,
    replacement: 'border: $1solid var(--border-color)',
    description: '硬编码#ffffff边框 -> CSS变量'
  },
  {
    pattern: /border:\s*(\d+px\s+)?solid\s+rgb\(255,\s*255,\s*255\)/gi,
    replacement: 'border: $1solid var(--border-color)',
    description: '硬编码rgb白色边框 -> CSS变量'
  },
  {
    pattern: /border-color:\s*white/gi,
    replacement: 'border-color: var(--border-color)',
    description: '硬白色边框颜色 -> CSS变量'
  },
  {
    pattern: /border-color:\s*#fff/gi,
    replacement: 'border-color: var(--border-color)',
    description: '#fff边框颜色 -> CSS变量'
  },
  {
    pattern: /border-color:\s*#ffffff/gi,
    replacement: 'border-color: var(--border-color)',
    description: '#ffffff边框颜色 -> CSS变量'
  }
]

// 需要检查的文件扩展名
const fileExtensions = ['.vue', '.scss', '.css', '.ts', '.js']

// 需要排除的目录
const excludeDirs = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.nuxt',
  '.output',
  'backups'
]

// 递归查找文件
function findFiles(dir, extensions, excludeDirs) {
  const files = []

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          traverse(fullPath)
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  traverse(dir)
  return files
}

// 修复单个文件
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    const changes = []

    for (const { pattern, replacement, description } of patterns) {
      const originalContent = content
      content = content.replace(pattern, replacement)

      if (content !== originalContent) {
        modified = true
        changes.push(description)
      }
    }

    if (modified) {
      // 创建备份
      const backupPath = filePath + '.backup'
      fs.copyFileSync(filePath, backupPath)

      // 写入修复后的内容
      fs.writeFileSync(filePath, content, 'utf8')

      return {
        fixed: true,
        changes,
        backupPath
      }
    }

    return { fixed: false }
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message)
    return { fixed: false, error: error.message }
  }
}

// 主函数
function main() {
  console.log('🔧 开始修复暗黑主题边框问题...\n')

  const rootDir = process.cwd()
  const files = findFiles(rootDir, fileExtensions, excludeDirs)

  console.log(`📁 找到 ${files.length} 个文件需要检查\n`)

  let fixedCount = 0
  let totalChanges = 0
  const errors = []

  for (const filePath of files) {
    const result = fixFile(filePath)

    if (result.fixed) {
      fixedCount++
      totalChanges += result.changes.length
      console.log(`✅ 已修复: ${path.relative(rootDir, filePath)}`)
      console.log(`   修改内容: ${result.changes.join(', ')}`)
      console.log(`   备份文件: ${path.relative(rootDir, result.backupPath)}`)
      console.log('')
    } else if (result.error) {
      errors.push({ file: filePath, error: result.error })
    }
  }

  // 输出统计信息
  console.log('📊 修复统计:')
  console.log(`   - 修复文件数: ${fixedCount}`)
  console.log(`   - 总修改数: ${totalChanges}`)
  console.log(`   - 错误数: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\n❌ 处理错误:')
    errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`)
    })
  }

  if (fixedCount > 0) {
    console.log('\n🎉 修复完成！')
    console.log('💡 建议:')
    console.log('   1. 检查修复后的文件是否正常工作')
    console.log('   2. 运行测试确保没有破坏功能')
    console.log('   3. 在浏览器中验证暗黑主题效果')
    console.log('   4. 确认无误后可以删除 .backup 文件')
  } else {
    console.log('\n✨ 没有发现需要修复的问题！')
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { fixFile, findFiles, patterns }