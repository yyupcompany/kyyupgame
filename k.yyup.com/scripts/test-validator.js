#!/usr/bin/env node

/**
 * 测试验证工具
 * 验证新创建的测试文件可以正常运行并检测语法错误
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class TestValidator {
  constructor() {
    this.generatedTestsDir = path.join(__dirname, '../generated-tests')
    this.clientTestsDir = path.join(__dirname, '../client/tests')
    this.validTests = []
    this.invalidTests = []
    this.errorDetails = new Map()
  }

  /**
   * 验证测试文件语法
   */
  validateTestSyntax(testFile) {
    try {
      const content = fs.readFileSync(testFile, 'utf8')

      // 基础语法检查
      const syntaxChecks = [
        { pattern: /import.*from 'vitest'/, name: 'Vitest导入' },
        { pattern: /describe\(/, name: 'describe函数' },
        { pattern: /it\(/, name: 'it函数' },
        { pattern: /expect\(/, name: 'expect断言' },
        { pattern: /mount\(/, name: 'mount函数' },
        { pattern: /wrapper\.exists\(\)/, name: 'exists方法' },
        { pattern: /afterEach\(/, name: 'afterEach钩子', optional: true }
      ]

      const missingSyntax = []
      syntaxChecks.forEach(check => {
        if (!check.optional && !check.pattern.test(content)) {
          missingSyntax.push(check.name)
        }
      })

      // 检查导入路径是否存在
      const importPathPattern = /import.*from '@\/([^']+)'/g
      let match
      const invalidImports = []

      while ((match = importPathPattern.exec(content)) !== null) {
        const importPath = match[1]
        const fullPath = path.join(__dirname, '../client/src', importPath)

        // 处理.vue文件路径
        if (importPath.endsWith('.vue')) {
          const vuePath = fullPath
          if (!fs.existsSync(vuePath)) {
            invalidImports.push(importPath)
          }
        } else {
          // 处理TypeScript文件路径
          const tsPath = fullPath + '.ts'
          const jsPath = fullPath + '.js'
          const indexPath = path.join(fullPath, 'index.ts')

          if (!fs.existsSync(tsPath) && !fs.existsSync(jsPath) && !fs.existsSync(indexPath)) {
            invalidImports.push(importPath)
          }
        }
      }

      return {
        isValid: missingSyntax.length === 0 && invalidImports.length === 0,
        missingSyntax,
        invalidImports
      }
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      }
    }
  }

  /**
   * 扫描生成的测试文件
   */
  scanGeneratedTests() {
    console.log('🔍 扫描生成的测试文件...')

    if (!fs.existsSync(this.generatedTestsDir)) {
      console.log('❌ 未找到生成的测试目录')
      return []
    }

    const testFiles = []
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir)
      items.forEach(item => {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)

        if (stat.isDirectory()) {
          scanDir(itemPath)
        } else if (item.endsWith('.test.ts')) {
          testFiles.push(itemPath)
        }
      })
    }

    scanDir(this.generatedTestsDir)
    console.log(`✅ 找到 ${testFiles.length} 个测试文件`)
    return testFiles
  }

  /**
   * 验证所有测试文件
   */
  async validateTests() {
    console.log('✅ 开始验证测试文件...')

    const testFiles = this.scanGeneratedTests()

    for (const testFile of testFiles) {
      const relativePath = path.relative(process.cwd(), testFile)
      console.log(`🔍 验证: ${relativePath}`)

      const validation = this.validateTestSyntax(testFile)

      if (validation.isValid) {
        this.validTests.push(testFile)
        console.log(`✅ ${path.basename(testFile)} - 语法正确`)
      } else {
        this.invalidTests.push(testFile)
        this.errorDetails.set(testFile, validation)
        console.log(`❌ ${path.basename(testFile)} - 发现错误`)

        if (validation.missingSyntax?.length > 0) {
          console.log(`   缺少语法: ${validation.missingSyntax.join(', ')}`)
        }

        if (validation.invalidImports?.length > 0) {
          console.log(`   无效导入: ${validation.invalidImports.join(', ')}`)
        }

        if (validation.error) {
          console.log(`   错误: ${validation.error}`)
        }
      }
    }

    console.log(`\n📊 验证结果:`)
    console.log(`有效测试: ${this.validTests.length}`)
    console.log(`无效测试: ${this.invalidTests.length}`)

    return {
      total: testFiles.length,
      valid: this.validTests.length,
      invalid: this.invalidTests.length,
      validTests: this.validTests,
      invalidTests: this.invalidTests,
      errorDetails: this.errorDetails
    }
  }

  /**
   * 修复常见的测试文件问题
   */
  async fixTestFiles() {
    console.log('🔧 开始修复测试文件...')

    let fixedCount = 0

    for (const testFile of this.invalidTests) {
      const errorDetail = this.errorDetails.get(testFile)
      if (!errorDetail) continue

      let content = fs.readFileSync(testFile, 'utf8')
      let hasChanges = false

      // 修复缺少的导入
      if (errorDetail.missingSyntax?.includes('Vitest导入')) {
        if (!content.includes('import { describe, it, expect')) {
          content = content.replace(
            /^/,
            "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'\n"
          )
          hasChanges = true
        }
      }

      // 修复缺少的afterEach钩子
      if (errorDetail.missingSyntax?.includes('afterEach钩子')) {
        if (content.includes('expectNoConsoleErrors') && !content.includes('afterEach')) {
          // 在第一个describe之前插入afterEach
          const describeIndex = content.indexOf('describe(')
          if (describeIndex > 0) {
            content = content.slice(0, describeIndex) +
                     "afterEach(() => {\n  expectNoConsoleErrors()\n})\n\n" +
                     content.slice(describeIndex)
            hasChanges = true
          }
        }
      }

      // 修复无效导入路径
      if (errorDetail.invalidImports?.length > 0) {
        errorDetail.invalidImports.forEach(invalidPath => {
          // 尝试修复常见的导入路径问题
          if (invalidPath.endsWith('.vue')) {
            const componentName = path.basename(invalidPath, '.vue')
            const possiblePaths = [
              `components/${componentName}/${componentName}.vue`,
              `components/${componentName}.vue`,
              `pages/${componentName}.vue`,
              `views/${componentName}.vue`
            ]

            for (const possiblePath of possiblePaths) {
              const fullPath = path.join(__dirname, '../client/src', possiblePath)
              if (fs.existsSync(fullPath)) {
                content = content.replace(
                  new RegExp(`from '@/${invalidPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'),
                  `from '@/${possiblePath.replace('.vue', '')}'`
                )
                hasChanges = true
                break
              }
            }
          }
        })
      }

      // 修复其他常见问题
      if (content.includes("wrapper.find('.test-component')")) {
        // 替换通用选择器
        content = content.replace(
          /wrapper\.find\('\.test-component'\)/g,
          'wrapper.find(\'[data-test-component]\')'
        )
        hasChanges = true
      }

      // 确保导入strict-test-validation
      if (content.includes('expectNoConsoleErrors') && !content.includes('strict-test-validation')) {
        content = content.replace(
          /import.*from 'vitest'/,
          "$&\nimport { expectNoConsoleErrors } from '@/tests/utils/strict-test-validation'"
        )
        hasChanges = true
      }

      if (hasChanges) {
        fs.writeFileSync(testFile, content, 'utf8')
        console.log(`🔧 修复: ${path.basename(testFile)}`)
        fixedCount++
      }
    }

    console.log(`\n🎉 修复完成: ${fixedCount} 个文件`)
    return fixedCount
  }

  /**
   * 运行小规模测试验证
   */
  async runTestValidation() {
    console.log('🧪 运行测试验证...')

    try {
      // 选择几个测试文件进行实际运行测试
      const sampleTests = this.validTests.slice(0, 3)

      for (const testFile of sampleTests) {
        const relativePath = path.relative(process.cwd(), testFile)
        console.log(`\n🔍 运行测试: ${path.basename(relativePath)}`)

        try {
          // 使用Vitest运行单个测试文件
          const result = execSync(
            `cd client && npx vitest run "${relativePath.replace(/^generated-tests\//, '../generated-tests/')}" --reporter=verbose`,
            {
              encoding: 'utf8',
              timeout: 30000,
              stdio: 'pipe'
            }
          )

          console.log(`✅ 测试通过: ${path.basename(relativePath)}`)
        } catch (error) {
          console.log(`❌ 测试失败: ${path.basename(relativePath)}`)
          console.log(`   错误: ${error.message.split('\n')[0]}`)
        }
      }
    } catch (error) {
      console.log(`❌ 测试验证失败: ${error.message}`)
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    const report = {
      summary: {
        total: this.validTests.length + this.invalidTests.length,
        valid: this.validTests.length,
        invalid: this.invalidTests.length,
        validationRate: this.validTests.length > 0 ?
          ((this.validTests.length / (this.validTests.length + this.invalidTests.length)) * 100).toFixed(2) + '%' :
          '0%'
      },
      invalidTestDetails: Array.from(this.errorDetails.entries()).map(([file, details]) => ({
        file: path.relative(process.cwd(), file),
        missingSyntax: details.missingSyntax || [],
        invalidImports: details.invalidImports || [],
        error: details.error || null
      }))
    }

    // 保存报告
    const reportPath = path.join(__dirname, '../test-validation-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n💾 验证报告已保存到: ${reportPath}`)

    return report
  }

  /**
   * 运行完整验证流程
   */
  async run() {
    console.log('🚀 开始测试验证流程...\n')

    // 初始验证
    await this.validateTests()

    // 修复问题
    if (this.invalidTests.length > 0) {
      await this.fixTestFiles()

      // 重新验证
      console.log('\n🔄 重新验证修复后的测试文件...')
      this.validTests = []
      this.invalidTests = []
      this.errorDetails.clear()
      await this.validateTests()
    }

    // 运行样本测试
    if (this.validTests.length > 0) {
      await this.runTestValidation()
    }

    // 生成报告
    const report = this.generateReport()

    console.log('\n📋 验证完成总结:')
    console.log(`总测试文件: ${report.summary.total}`)
    console.log(`有效文件: ${report.summary.valid}`)
    console.log(`无效文件: ${report.summary.invalid}`)
    console.log(`验证通过率: ${report.summary.validationRate}`)

    return report
  }
}

// CLI入口
if (require.main === module) {
  const validator = new TestValidator()

  validator.run().then(report => {
    if (report.summary.invalid === 0) {
      console.log('\n🎉 所有测试文件验证通过!')
      process.exit(0)
    } else {
      console.log('\n⚠️ 部分测试文件存在问题，请查看详细报告')
      process.exit(1)
    }
  }).catch(error => {
    console.error('❌ 验证过程失败:', error)
    process.exit(1)
  })
}

module.exports = TestValidator