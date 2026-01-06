#!/usr/bin/env node

/**
 * 简化的控制台错误检测增强器
 * 使用Node.js内置模块，无需额外依赖
 */

const fs = require('fs')
const path = require('path')

// 配置选项
const config = {
  // 需要检查的目录
  testDirectories: [
    'client/tests',
    'server/tests',
    'tests'
  ],

  // 测试文件扩展名
  testExtensions: ['.test.ts', '.spec.ts'],

  // 排除的目录
  excludeDirs: [
    'node_modules',
    'dist',
    'build',
    '.git',
    'coverage',
    'scripts',
    'templates',
    'generated-tests'
  ]
}

/**
 * 递归查找所有测试文件
 */
function findAllTestFiles(dir) {
  const files = []

  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir)

      for (const item of items) {
        const itemPath = path.join(currentDir, item)
        const stat = fs.statSync(itemPath)

        if (stat.isDirectory()) {
          // 跳过排除的目录
          if (!config.excludeDirs.includes(item)) {
            traverse(itemPath)
          }
        } else if (stat.isFile()) {
          // 检查是否为测试文件
          for (const ext of config.testExtensions) {
            if (item.endsWith(ext)) {
              files.push(path.relative(process.cwd(), itemPath))
              break
            }
          }
        }
      }
    } catch (error) {
      // 忽略无法读取的目录
    }
  }

  // 从指定的根目录开始
  for (const testDir of config.testDirectories) {
    const fullPath = path.join(process.cwd(), testDir)
    if (fs.existsSync(fullPath)) {
      traverse(fullPath)
    }
  }

  return [...new Set(files)] // 去重
}

/**
 * 检查文件是否已经有错误检测
 */
function hasErrorDetection(content) {
  const patterns = [
    'comprehensive-error-detector',
    'strict-test-validation',
    'captureConsoleErrors',
    'consoleMonitor',
    'expectNoConsoleErrors',
    'startErrorCollection',
    'stopErrorCollection',
    'errorDetector',
    'console.error',
    'console.warn'
  ]

  // 检查是否有导入语句
  if (content.includes('comprehensive-error-detector') ||
      content.includes('strict-test-validation')) {
    return true
  }

  // 检查是否已有相关的错误检测代码
  const hasConsoleErrorDetection = content.includes('console.error') &&
                                  (content.includes('vi.spyOn') ||
                                   content.includes('jest.spyOn'))

  return hasConsoleErrorDetection
}

/**
 * 添加基础错误检测到测试文件
 */
function addBasicErrorDetection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // 跳过已经有错误检测的文件
    if (hasErrorDetection(content)) {
      return { enhanced: false, reason: 'already_has_detection' }
    }

    // 检查是否有describe块
    const describeMatch = content.match(/describe\s*\(/)
    if (!describeMatch) {
      return { enhanced: false, reason: 'no_describe_found' }
    }

    // 基础错误检测代码
    const basicDetectionCode = `
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})
`

    // 检查是否需要导入vitest
    let modifiedContent = content
    if (!content.includes('vitest') && !content.includes('@vitest/')) {
      // 添加vitest导入
      const importMatch = content.match(/^(import[^;]+;)/m)
      if (importMatch) {
        modifiedContent = content.replace(
          importMatch[0],
          importMatch[0] + '\nimport { vi } from \'vitest\''
        )
      } else {
        modifiedContent = "import { vi } from 'vitest'\n" + content
      }
    }

    // 找到第一个describe块的位置
    const describeIndex = modifiedContent.indexOf('describe')

    // 检查是否已经有beforeEach/afterEach
    const hasBeforeEach = modifiedContent.includes('beforeEach')
    const hasAfterEach = modifiedContent.includes('afterEach')

    if (hasBeforeEach && hasAfterEach) {
      // 在现有的beforeEach和afterEach中添加错误检测
      return { enhanced: false, reason: 'existing_hooks_need_manual_merge' }
    }

    // 在第一个describe之前插入错误检测代码
    const enhancedContent =
      modifiedContent.slice(0, describeIndex) +
      basicDetectionCode +
      '\n' +
      modifiedContent.slice(describeIndex)

    // 写回文件
    fs.writeFileSync(filePath, enhancedContent, 'utf8')

    return { enhanced: true, method: 'basic' }

  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message)
    return { enhanced: false, reason: 'error', error: error.message }
  }
}

/**
 * 创建错误检测模板文件
 */
function createErrorDetectionTemplate() {
  const templateDir = path.join(process.cwd(), 'client/src/tests/utils')
  const templateFile = path.join(templateDir, 'basic-error-detector.ts')

  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true })
  }

  if (!fs.existsSync(templateFile)) {
    const templateContent = `/**
 * 基础错误检测工具
 * 为测试文件提供简单的控制台错误检测
 */

import { vi } from 'vitest'

/**
 * 创建控制台错误监听器
 */
export function createConsoleErrorMonitor() {
  let consoleSpy: any

  const start = () => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  }

  const stop = () => {
    if (consoleSpy) {
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    }
  }

  return { start, stop }
}

/**
 * 控制台错误检测助手
 */
export class ConsoleErrorDetector {
  private spies: Map<string, any> = new Map()

  /**
   * 开始监听控制台方法
   */
  start() {
    const methods = ['error', 'warn', 'log']

    methods.forEach(method => {
      if (console[method as keyof Console]) {
        const spy = vi.spyOn(console, method as keyof Console).mockImplementation(() => {})
        this.spies.set(method, spy)
      }
    })
  }

  /**
   * 停止监听并验证
   */
  stop() {
    this.spies.forEach((spy, method) => {
      if (method === 'error') {
        expect(spy).not.toHaveBeenCalled()
      }
      spy.mockRestore()
    })
    this.spies.clear()
  }

  /**
   * 验证没有控制台错误
   */
  expectNoErrors() {
    const errorSpy = this.spies.get('error')
    if (errorSpy) {
      expect(errorSpy).not.toHaveBeenCalled()
    }
  }

  /**
   * 验证特定方法的调用次数
   */
  expectCallCount(method: string, expectedCount: number) {
    const spy = this.spies.get(method)
    if (spy) {
      expect(spy).toHaveBeenCalledTimes(expectedCount)
    }
  }
}

/**
 * 便捷函数：创建简单的错误检测测试
 */
export function withErrorDetection(testFn: () => void) {
  const detector = new ConsoleErrorDetector()

  beforeAll(() => {
    detector.start()
  })

  afterAll(() => {
    detector.stop()
  })

  return testFn()
}

export default {
  createConsoleErrorMonitor,
  ConsoleErrorDetector,
  withErrorDetection
}
`

    fs.writeFileSync(templateFile, templateContent, 'utf8')
    console.log('✅ 基础错误检测模板已创建:', templateFile)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始简化版控制台错误检测增强...\n')

  // 创建错误检测模板
  createErrorDetectionTemplate()

  // 查找所有测试文件
  console.log('📁 搜索测试文件...')
  const testFiles = findAllTestFiles()
  console.log(`找到 ${testFiles.length} 个测试文件\n`)

  if (testFiles.length === 0) {
    console.log('❌ 未找到测试文件，请检查项目结构')
    return
  }

  // 处理每个文件
  const results = []
  let processedCount = 0

  for (const filePath of testFiles) {
    processedCount++

    // 显示进度
    if (processedCount % 50 === 0) {
      console.log(`进度: ${processedCount}/${testFiles.length} (${(processedCount/testFiles.length*100).toFixed(1)}%)`)
    }

    const result = addBasicErrorDetection(filePath)
    result.file = filePath
    results.push(result)

    if (result.enhanced) {
      console.log(`✅ 增强完成: ${filePath}`)
    }
  }

  // 生成报告
  const enhanced = results.filter(r => r.enhanced).length
  const skipped = results.filter(r => !r.enhanced).length
  const coverage = (enhanced / results.length * 100).toFixed(2)

  console.log(`\n📊 增强统计:`)
  console.log(`   总测试文件: ${results.length}`)
  console.log(`   已增强: ${enhanced}`)
  console.log(`   跳过: ${skipped}`)
  console.log(`   覆盖率: ${coverage}%`)

  if (coverage === '100.00') {
    console.log(`\n🏆 恭喜！已达到100%控制台错误检测覆盖率！`)
  } else {
    console.log(`\n💡 还有 ${skipped} 个文件需要手动处理`)

    // 显示跳过原因统计
    const skipReasons = {}
    results.forEach(result => {
      if (!result.enhanced) {
        const reason = result.reason || 'unknown'
        skipReasons[reason] = (skipReasons[reason] || 0) + 1
      }
    })

    console.log(`\n📋 跳过原因:`)
    Object.entries(skipReasons).forEach(([reason, count]) => {
      console.log(`   ${reason}: ${count}`)
    })
  }

  // 保存详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      enhanced,
      skipped,
      coverage
    },
    results: results
  }

  const reportPath = path.join(process.cwd(), 'simple-error-detection-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📊 详细报告已保存到: ${reportPath}`)
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  findAllTestFiles,
  addBasicErrorDetection,
  createErrorDetectionTemplate
}