#!/usr/bin/env node

/**
 * 智能控制台错误检测合并器
 * 处理已有beforeEach/afterEach钩子的测试文件，智能集成错误检测
 */

const fs = require('fs')
const path = require('path')

/**
 * 智能合并错误检测到现有钩子中
 */
function smartMergeErrorDetection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // 检查是否已经有错误检测
    const hasDetection = content.includes('comprehensive-error-detector') ||
                        content.includes('strict-test-validation') ||
                        content.includes('captureConsoleErrors') ||
                        content.includes('consoleSpy')

    if (hasDetection) {
      return { enhanced: false, reason: 'already_has_detection' }
    }

    // 查找beforeEach块
    const beforeEachMatches = content.match(/beforeEach\s*\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g) ||
                               content.match(/beforeEach\s*\(\s*function\s*\(\)\s*{[\s\S]*?}\s*\)/g) ||
                               content.match(/beforeEach\s*\(\s*\)\s*{[\s\S]*?}/g)

    // 查找afterEach块
    const afterEachMatches = content.match(/afterEach\s*\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g) ||
                             content.match(/afterEach\s*\(\s*function\s*\(\)\s*{[\s\S]*?}\s*\)/g) ||
                             content.match(/afterEach\s*\(\s*\)\s*{[\s\S]*?}/g)

    if (beforeEachMatches.length === 0 || afterEachMatches.length === 0) {
      return { enhanced: false, reason: 'no_suitable_hooks' }
    }

    // 准备错误检测代码
    const beforeEachInjection = `
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})`

    const afterEachInjection = `
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()`

    // 增强beforeEach
    let enhancedContent = content
    beforeEachMatches.forEach(match => {
      const enhanced = match.replace(/\)\s*{/, ') => {') + beforeEachInjection
      enhancedContent = enhancedContent.replace(match, enhanced)
    })

    // 增强afterEach
    afterEachMatches.forEach(match => {
      const enhanced = match.replace(/\)\s*{/, ') => {') + afterEachInjection
      enhancedContent = enhancedContent.replace(match, enhanced)
    })

    // 确保导入了vi
    if (!enhancedContent.includes('import { vi }')) {
      enhancedContent = enhancedContent.replace(
        /^(import[^;]+;)/m,
        '$1\nimport { vi } from \'vitest\''
      )
    }

    // 添加变量声明
    const describeIndex = enhancedContent.indexOf('describe(')
    if (describeIndex > -1) {
      enhancedContent = enhancedContent.slice(0, describeIndex) +
                       '// 控制台错误检测变量\nlet consoleSpy: any\n\n' +
                       enhancedContent.slice(describeIndex)
    }

    // 写回文件
    fs.writeFileSync(filePath, enhancedContent, 'utf8')

    return {
      enhanced: true,
      method: 'smart_merge',
      hooksEnhanced: {
        beforeEach: beforeEachMatches.length,
        afterEach: afterEachMatches.length
      }
    }

  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message)
    return { enhanced: false, reason: 'error', error: error.message }
  }
}

/**
 * 处理跳过的文件
 */
function processSkippedFiles(reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  const skippedFiles = report.results.filter(r =>
    !r.enhanced &&
    r.reason === 'existing_hooks_need_manual_merge'
  )

  console.log(`\n🔧 开始智能处理 ${skippedFiles.length} 个需要合并的文件...`)

  const results = []
  let processed = 0

  for (const fileRecord of skippedFiles) {
    processed++

    if (processed % 20 === 0) {
      console.log(`进度: ${processed}/${skippedFiles.length} (${(processed/skippedFiles.length*100).toFixed(1)}%)`)
    }

    const result = smartMergeErrorDetection(fileRecord.file)
    result.file = fileRecord.file
    results.push(result)

    if (result.enhanced) {
      console.log(`✅ 智能合并完成: ${fileRecord.file}`)
    } else {
      console.log(`⏭️  跳过: ${fileRecord.file} (${result.reason})`)
    }
  }

  return results
}

/**
 * 生成最终报告
 */
function generateFinalReport(originalReport, mergeResults) {
  const originalEnhanced = originalReport.summary.enhanced
  const mergeEnhanced = mergeResults.filter(r => r.enhanced).length

  const finalReport = {
    timestamp: new Date().toISOString(),
    original: originalReport,
    merge: {
      processed: mergeResults.length,
      enhanced: mergeEnhanced,
      skipped: mergeResults.filter(r => !r.enhanced).length
    },
    final: {
      total: originalReport.summary.total,
      enhanced: originalEnhanced + mergeEnhanced,
      skipped: originalReport.summary.skipped - mergeEnhanced,
      coverage: ((originalEnhanced + mergeEnhanced) / originalReport.summary.total * 100).toFixed(2)
    }
  }

  return finalReport
}

/**
 * 主函数
 */
async function main() {
  console.log('🧠 开始智能控制台错误检测合并...\n')

  const reportPath = path.join(process.cwd(), 'simple-error-detection-report.json')

  if (!fs.existsSync(reportPath)) {
    console.error('❌ 找不到原始增强报告，请先运行基础增强脚本')
    return
  }

  const originalReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

  // 处理需要合并的文件
  const mergeResults = processSkippedFiles(reportPath)

  // 生成最终报告
  const finalReport = generateFinalReport(originalReport, mergeResults)

  // 保存最终报告
  const finalReportPath = path.join(process.cwd(), 'final-error-detection-report.json')
  fs.writeFileSync(finalReportPath, JSON.stringify(finalReport, null, 2))

  // 显示结果
  console.log(`\n📊 智能合并统计:`)
  console.log(`   处理文件数: ${finalReport.merge.processed}`)
  console.log(`   成功合并: ${finalReport.merge.enhanced}`)
  console.log(`   仍然跳过: ${finalReport.merge.skipped}`)

  console.log(`\n🎯 最终覆盖率报告:`)
  console.log(`   总测试文件: ${finalReport.final.total}`)
  console.log(`   已增强: ${finalReport.final.enhanced}`)
  console.log(`   覆盖率: ${finalReport.final.coverage}%`)

  if (finalReport.final.coverage === '100.00') {
    console.log(`\n🏆 恭喜！已达到100%控制台错误检测覆盖率！`)
  } else {
    console.log(`\n💡 还有 ${finalReport.final.skipped} 个文件需要手动处理`)
  }

  console.log(`\n📊 最终报告已保存到: ${finalReportPath}`)
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  smartMergeErrorDetection,
  processSkippedFiles,
  generateFinalReport
}