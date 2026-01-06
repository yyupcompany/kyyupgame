#!/usr/bin/env node

/**
 * 控制台错误检测覆盖率验证器
 * 最终验证所有测试文件的错误检测覆盖率
 */

const fs = require('fs')
const path = require('path')

/**
 * 验证单个文件的错误检测覆盖
 */
function verifyFileErrorDetection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const fileName = path.basename(filePath)

    // 检测策略
    const detectionMethods = []

    // 1. 检查导入的错误检测工具
    if (content.includes('comprehensive-error-detector')) {
      detectionMethods.push('comprehensive-detector')
    }
    if (content.includes('strict-test-validation')) {
      detectionMethods.push('strict-validation')
    }
    if (content.includes('basic-error-detector')) {
      detectionMethods.push('basic-detector')
    }

    // 2. 检查错误检测模式
    if (content.includes('consoleSpy') ||
        content.includes('vi.spyOn(console') ||
        content.includes('jest.spyOn(console')) {
      detectionMethods.push('console-spy')
    }
    if (content.includes('captureConsoleErrors') ||
        content.includes('consoleMonitor') ||
        content.includes('expectNoConsoleErrors')) {
      detectionMethods.push('legacy-detection')
    }
    if (content.includes('startErrorCollection') ||
        content.includes('stopErrorCollection')) {
      detectionMethods.push('error-collection')
    }

    // 3. 检查错误验证
    const hasErrorValidation = content.includes('expect.*error') ||
                               content.includes('toHaveBeenCalled()') ||
                               content.includes('toHaveBeenCalledTimes') ||
                               content.includes('expectNoConsoleErrors')

    // 4. 检查钩子集成
    const hasBeforeEach = content.includes('beforeEach')
    const hasAfterEach = content.includes('afterEach')
    const hasHooks = hasBeforeEach && hasAfterEach

    // 判断是否有有效的错误检测
    const hasErrorDetection = detectionMethods.length > 0 &&
                            hasHooks &&
                            hasErrorValidation

    return {
      fileName,
      filePath,
      hasErrorDetection,
      detectionMethods,
      hasHooks,
      hasErrorValidation,
      coverageType: detectionMethods.join(', ') || 'none'
    }
  } catch (error) {
    return {
      fileName: path.basename(filePath),
      filePath,
      hasErrorDetection: false,
      error: error.message
    }
  }
}

/**
 * 查找所有测试文件
 */
function findAllTestFiles() {
  const testFiles = []

  function walkDir(dir, excludedDirs = ['node_modules', 'dist', 'build', '.git']) {
    try {
      const items = fs.readdirSync(dir)

      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          if (!excludedDirs.includes(item)) {
            walkDir(fullPath, excludedDirs)
          }
        } else if (stat.isFile()) {
          if (item.endsWith('.test.ts') || item.endsWith('.spec.ts')) {
            testFiles.push(fullPath)
          }
        }
      }
    } catch (error) {
      // 忽略无法读取的目录
    }
  }

  walkDir(process.cwd())
  return testFiles.map(file => path.relative(process.cwd(), file))
}

/**
 * 生成详细报告
 */
function generateDetailedReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      covered: results.filter(r => r.hasErrorDetection).length,
      uncovered: results.filter(r => !r.hasErrorDetection).length,
      coverage: ((results.filter(r => r.hasErrorDetection).length / results.length) * 100).toFixed(2)
    },
    coverageByMethod: {},
    uncoveredFiles: [],
    coverageDetails: results
  }

  // 统计覆盖方法
  results.forEach(result => {
    if (result.hasErrorDetection) {
      const methods = result.detectionMethods
      methods.forEach(method => {
        report.coverageByMethod[method] = (report.coverageByMethod[method] || 0) + 1
      })
    } else {
      report.uncoveredFiles.push({
        file: result.filePath,
        reason: result.error || 'no_error_detection'
      })
    }
  })

  return report
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始验证控制台错误检测覆盖率...\n')

  // 查找所有测试文件
  console.log('📁 搜索测试文件...')
  const testFiles = findAllTestFiles()
  console.log(`找到 ${testFiles.length} 个测试文件\n`)

  // 验证每个文件
  console.log('🧪 验证错误检测覆盖...')
  const results = []
  let verified = 0

  for (const filePath of testFiles) {
    verified++

    if (verified % 100 === 0) {
      console.log(`进度: ${verified}/${testFiles.length} (${(verified/testFiles.length*100).toFixed(1)}%)`)
    }

    const result = verifyFileErrorDetection(filePath)
    results.push(result)
  }

  // 生成详细报告
  const report = generateDetailedReport(results)

  // 显示结果
  console.log(`\n📊 控制台错误检测覆盖率验证报告`)
  console.log(`=` .repeat(50))
  console.log(`📈 总体统计:`)
  console.log(`   总测试文件: ${report.summary.total}`)
  console.log(`   有错误检测: ${report.summary.covered}`)
  console.log(`   无错误检测: ${report.summary.uncovered}`)
  console.log(`   覆盖率: ${report.summary.coverage}%`)

  console.log(`\n🛠️ 错误检测方法统计:`)
  Object.entries(report.coverageByMethod).forEach(([method, count]) => {
    const percentage = ((count / report.summary.covered) * 100).toFixed(1)
    console.log(`   ${method}: ${count} (${percentage}%)`)
  })

  if (report.uncoveredFiles.length > 0) {
    console.log(`\n❌ 未覆盖的文件 (${report.uncoveredFiles.length}):`)
    report.uncoveredFiles.slice(0, 10).forEach(file => {
      console.log(`   - ${file.file} (${file.reason})`)
    })

    if (report.uncoveredFiles.length > 10) {
      console.log(`   ... 还有 ${report.uncoveredFiles.length - 10} 个文件`)
    }
  }

  // 保存报告
  const reportPath = path.join(process.cwd(), 'error-detection-coverage-verification.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log(`\n📊 详细报告已保存到: ${reportPath}`)

  // 结果判断
  const coverage = parseFloat(report.summary.coverage)
  if (coverage >= 100) {
    console.log(`\n🏆 完美！已达到100%控制台错误检测覆盖率！`)
  } else if (coverage >= 95) {
    console.log(`\n🎉 优秀！控制台错误检测覆盖率达到${coverage}%，非常接近100%！`)
  } else if (coverage >= 90) {
    console.log(`\n✅ 良好！控制台错误检测覆盖率达到${coverage}%，继续保持！`)
  } else if (coverage >= 85) {
    console.log(`\n⚠️ 合格，控制台错误检测覆盖率为${coverage}%，建议继续优化`)
  } else {
    console.log(`\n❌ 覆盖率不足，仅${coverage}%，需要继续加强`)
  }

  return report
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  verifyFileErrorDetection,
  findAllTestFiles,
  generateDetailedReport
}