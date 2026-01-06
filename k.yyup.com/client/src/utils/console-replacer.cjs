/**
 * Console日志替换工具脚本
 * 用于批量替换Vue和TypeScript文件中的console调用为新的CallingLogger系统
 * 基于CALLING_LOGGER_ARCHITECTURE.md规范的日志迁移工具
 */

const fs = require('fs')
const path = require('path')

// 获取所有需要处理的文件
function getFilesWithConsole(dir, extensions = ['.vue', '.ts', '.js']) {
  const files = []

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // 跳过node_modules和其他不需要的目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          traverse(fullPath)
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        // 检查文件是否包含console调用
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          if (content.includes('console.')) {
            files.push(fullPath)
          }
        } catch (error) {
          console.log(`无法读取文件: ${fullPath}`, error.message)
        }
      }
    }
  }

  traverse(dir)
  return files
}

// 替换文件中的console调用
function replaceConsoleInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false

    // 检查是否已经导入了CallingLogger
    const hasLoggerImport = content.includes('CallingLogger')

    // 替换console调用为CallingLogger方法
    const replacements = [
      {
        from: /console\.log\(/g,
        to: 'CallingLogger.logInfo(context, ',
        desc: 'console.log -> CallingLogger.logInfo'
      },
      {
        from: /console\.error\(/g,
        to: 'CallingLogger.logError(context, ',
        desc: 'console.error -> CallingLogger.logError'
      },
      {
        from: /console\.warn\(/g,
        to: 'CallingLogger.logWarn(context, ',
        desc: 'console.warn -> CallingLogger.logWarn'
      },
      {
        from: /console\.debug\(/g,
        to: 'CallingLogger.logDebug(context, ',
        desc: 'console.debug -> CallingLogger.logDebug'
      },
      {
        from: /frontendLogger\./g,
        to: 'CallingLogger.',
        desc: 'frontendLogger -> CallingLogger'
      }
    ]

    // 应用替换
    for (const replacement of replacements) {
      const beforeReplace = content
      content = content.replace(replacement.from, replacement.to)
      if (beforeReplace !== content) {
        modified = true
        console.log(`  ✓ ${replacement.desc}`)
      }
    }

    // 如果文件被修改了但没有导入CallingLogger，添加导入
    if (modified && !hasLoggerImport) {
      // 尝试在import区域添加CallingLogger导入
      const importRegex = /import[^;]+;?\s*\n/g
      const lastImportMatch = [...content.matchAll(importRegex)].pop()

      if (lastImportMatch) {
        const insertPos = lastImportMatch.index + lastImportMatch[0].length
        const importStatement = '\nimport { CallingLogger } from \'@/utils/CallingLogger\'\n'
        content = content.slice(0, insertPos) + importStatement + content.slice(insertPos)
        console.log(`  ✓ 添加CallingLogger导入`)
      }
    }

    // 如果文件被修改，保存文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8')
      return true
    }

    return false

  } catch (error) {
    console.error(`处理文件失败 ${filePath}:`, error.message)
    return false
  }
}

// 主函数
function main() {
  const srcDir = path.join(__dirname, '../')

  console.log('🔍 扫描前端目录中包含console的文件...')
  const files = getFilesWithConsole(srcDir)

  console.log(`\n📊 找到 ${files.length} 个包含console的文件:`)
  files.forEach(file => console.log(`  - ${path.relative(srcDir, file)}`))

  console.log(`\n🔄 开始替换console调用为新的CallingLogger系统...`)
  let processedCount = 0
  let replacedCount = 0

  for (const file of files) {
    processedCount++
    console.log(`\n[${processedCount}/${files.length}] 处理: ${path.relative(srcDir, file)}`)

    if (replaceConsoleInFile(file)) {
      replacedCount++
      console.log(`  ✅ 已完成替换`)
    } else {
      console.log(`  ⏭️ 跳过（无需替换）`)
    }
  }

  console.log(`\n📈 处理完成:`)
  console.log(`  - 扫描文件: ${processedCount}`)
  console.log(`  - 成功替换: ${replacedCount}`)
  console.log(`  - 跳过文件: ${processedCount - replacedCount}`)

  if (replacedCount > 0) {
    console.log(`\n✨ 所有console调用已成功替换为CallingLogger系统!`)
    console.log(`\n📝 注意: 需要手动添加上下文对象参数，例如：`)
    console.log(`   CallingLogger.logInfo({ module: 'COMPONENT', component: 'MyComponent' }, '消息内容')`)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { getFilesWithConsole, replaceConsoleInFile }