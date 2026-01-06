#!/usr/bin/env node

/**
 * 按钮测试专用运行脚本
 *
 * 用于运行所有按钮相关的测试并生成覆盖率报告
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const TEST_DIR = path.join(process.cwd(), 'tests/buttons')
const COVERAGE_DIR = path.join(process.cwd(), 'coverage')

console.log('🚀 开始运行按钮测试套件...\n')

// 确保覆盖率目录存在
if (!fs.existsSync(COVERAGE_DIR)) {
  fs.mkdirSync(COVERAGE_DIR, { recursive: true })
}

// 定义测试文件列表
const testFiles = [
  'button-elements-complete.test.ts',
  'table-buttons.test.ts',
  'form-buttons.test.ts',
  'navigation-buttons.test.ts',
  'button-scanner-usage.test.ts'
]

console.log('📋 测试文件清单:')
testFiles.forEach((file, index) => {
  console.log(`  ${index + 1}. ${file}`)
})

console.log('\n🧪 开始执行测试...\n')

try {
  // 构建测试模式
  const testPattern = testFiles.map(file => `${TEST_DIR}/${file}`).join(' ')

  // 运行测试命令
  const testCommand = `npm run test:unit -- ${testPattern} --reporter=verbose --no-coverage`

  console.log(`🔧 执行命令: ${testCommand}\n`)

  // 执行测试
  execSync(testCommand, {
    stdio: 'inherit',
    cwd: process.cwd()
  })

  console.log('\n✅ 所有按钮测试执行完成！')

  // 检查是否生成了覆盖率报告
  const coverageFiles = fs.readdirSync(COVERAGE_DIR)
  if (coverageFiles.length > 0) {
    console.log('\n📊 覆盖率报告已生成到以下文件:')
    coverageFiles.forEach(file => {
      console.log(`  - ${path.join(COVERAGE_DIR, file)}`)
    })

    // 尝试打开覆盖率报告
    const lcovFile = path.join(COVERAGE_DIR, 'lcov.info')
    if (fs.existsSync(lcovFile)) {
      console.log('\n💡 要查看详细覆盖率报告，请运行:')
      console.log('  npx nyc report --reporter=html')
      console.log('  然后打开 coverage/lcov-report/index.html')
    }
  } else {
    console.log('\n⚠️ 未找到覆盖率报告文件')
  }

} catch (error) {
  console.error('\n❌ 测试执行失败:', error.message)
  process.exit(1)
}

console.log('\n🎉 按钮测试套件运行完毕！')