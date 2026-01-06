#!/usr/bin/env node

/**
 * PC端测试用例清理脚本
 * 清理旧的PC端测试用例，保留移动端测试用例
 */

const fs = require('fs')
const path = require('path')

// 配置
const CLIENT_TESTS_DIR = path.join(__dirname, '../client/tests')
const E2E_PC_COMPLETE_DIR = path.join(__dirname, '../client/tests/e2e-pc-complete')

// 需要保留的目录（移动端相关）
const KEEP_DIRECTORIES = [
  'mobile',                    // 移动端测试
  'src/tests/mobile',          // 移动端源码测试
  'docs/mobile-testing',       // 移动端文档
  'e2e-pc-complete',          // 新的PC端测试（我们自己创建的）
]

// 需要保留的文件模式
const KEEP_FILES = [
  'mobile',                    // 文件名包含mobile
  'test-mobile',              // 文件名包含test-mobile
  'mobile-',                  // 文件名以mobile-开头
]

// 需要删除的目录
const DELETE_DIRECTORIES = [
  'e2e',                      // 旧的E2E测试
  'frontend/e2e',            // 前端E2E测试
  'unit',                     // 旧的单元测试
  'integration',              // 旧的集成测试
  'APItest',                  // API测试
]

console.log('🧹 开始清理PC端测试用例...\n')

// 统计信息
let deletedFiles = 0
let deletedDirs = 0
let keptFiles = 0

/**
 * 检查是否应该保留文件/目录
 */
function shouldKeep(itemPath, itemName) {
  const relativePath = path.relative(CLIENT_TESTS_DIR, itemPath)

  // 检查是否在保留目录中
  for (const keepDir of KEEP_DIRECTORIES) {
    if (relativePath.includes(keepDir)) {
      return true
    }
  }

  // 检查文件名模式
  for (const keepPattern of KEEP_FILES) {
    if (itemName.includes(keepPattern)) {
      return true
    }
  }

  return false
}

/**
 * 递归删除目录
 */
function deleteDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return
  }

  const items = fs.readdirSync(dirPath)

  for (const item of items) {
    const itemPath = path.join(dirPath, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      deleteDirectory(itemPath)
    } else {
      fs.unlinkSync(itemPath)
      deletedFiles++
      console.log(`  📄 删除文件: ${path.relative(CLIENT_TESTS_DIR, itemPath)}`)
    }
  }

  fs.rmdirSync(dirPath)
  deletedDirs++
  console.log(`  📁 删除目录: ${path.relative(CLIENT_TESTS_DIR, dirPath)}`)
}

/**
 * 清理测试目录
 */
function cleanupTestsDirectory() {
  console.log('📂 扫描测试目录...')

  if (!fs.existsSync(CLIENT_TESTS_DIR)) {
    console.log('❌ 测试目录不存在:', CLIENT_TESTS_DIR)
    return
  }

  // 首先处理需要删除的特定目录
  for (const deleteDir of DELETE_DIRECTORIES) {
    const deletePath = path.join(CLIENT_TESTS_DIR, deleteDir)
    if (fs.existsSync(deletePath) && !shouldKeep(deletePath, deleteDir)) {
      console.log(`\n🗑️  删除指定目录: ${deleteDir}`)
      deleteDirectory(deletePath)
    }
  }

  // 然后扫描根目录下的其他文件和目录
  const items = fs.readdirSync(CLIENT_TESTS_DIR)

  for (const item of items) {
    const itemPath = path.join(CLIENT_TESTS_DIR, item)
    const stat = fs.statSync(itemPath)

    if (shouldKeep(itemPath, item)) {
      keptFiles++
      console.log(`✅ 保留: ${item}`)
      continue
    }

    if (stat.isDirectory()) {
      console.log(`\n🗑️  删除目录: ${item}`)
      deleteDirectory(itemPath)
    } else {
      // 检查是否是测试文件
      if (item.includes('.test.') ||
          item.includes('.spec.') ||
          item.includes('test-') ||
          item.includes('e2e') ||
          item.includes('api')) {
        fs.unlinkSync(itemPath)
        deletedFiles++
        console.log(`  📄 删除文件: ${item}`)
      } else {
        keptFiles++
        console.log(`✅ 保留文件: ${item}`)
      }
    }
  }
}

/**
 * 检查是否有根级别的测试文件
 */
function cleanupRootLevelTests() {
  console.log('\n📂 检查根级别测试文件...')

  const rootDir = path.join(__dirname, '..')
  const items = fs.readdirSync(rootDir)

  for (const item of items) {
    const itemPath = path.join(rootDir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isFile()) {
      // 检查是否是测试文件
      if ((item.includes('.test.') ||
           item.includes('.spec.') ||
           item.includes('test-') ||
           item.includes('e2e')) &&
          !shouldKeep(itemPath, item)) {
        fs.unlinkSync(itemPath)
        deletedFiles++
        console.log(`  📄 删除根级文件: ${item}`)
      }
    }
  }
}

/**
 * 创建新的测试结构目录
 */
function ensureNewTestStructure() {
  console.log('\n📁 确保新测试结构存在...')

  const directories = [
    'e2e-pc-complete',
    'e2e-pc-complete/config',
    'e2e-pc-complete/utils',
    'e2e-pc-complete/fixtures',
    'e2e-pc-complete/tests',
    'e2e-pc-complete/tests/auth',
    'e2e-pc-complete/tests/admin',
    'e2e-pc-complete/tests/teacher',
    'e2e-pc-complete/tests/principal',
    'e2e-pc-complete/tests/parent',
    'e2e-pc-complete/tests/common',
    'e2e-pc-complete/tests/integration',
    'e2e-pc-complete/reports',
    'e2e-pc-complete/reports/screenshots',
    'e2e-pc-complete/reports/videos',
    'e2e-pc-complete/reports/coverage'
  ]

  for (const dir of directories) {
    const dirPath = path.join(CLIENT_TESTS_DIR, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`  📁 创建目录: ${dir}`)
    }
  }
}

/**
 * 生成清理报告
 */
function generateCleanupReport() {
  console.log('\n📊 清理完成报告:')
  console.log('='.repeat(50))
  console.log(`🗑️  已删除文件: ${deletedFiles}`)
  console.log(`🗑️  已删除目录: ${deletedDirs}`)
  console.log(`✅ 保留文件: ${keptFiles}`)
  console.log('='.repeat(50))

  if (deletedFiles > 0 || deletedDirs > 0) {
    console.log('\n✨ PC端测试用例清理完成!')
    console.log('🚀 新的测试架构已准备就绪')
  } else {
    console.log('\n💡 没有找到需要清理的测试文件')
  }

  console.log('\n📝 下一步:')
  console.log('1. 运行 npm run test:e2e-pc-complete 执行新的测试套件')
  console.log('2. 查看新的测试架构文档: client/tests/e2e-pc-complete/README.md')
  console.log('3. 移动端测试用例已完整保留')
}

/**
 * 主函数
 */
function main() {
  console.log('🎯 PC端测试用例清理工具')
  console.log('⚠️  此脚本将删除所有PC端相关测试，保留移动端测试')
  console.log('')

  // 询问确认
  const args = process.argv.slice(2)
  if (!args.includes('--force') && !args.includes('-f')) {
    console.log('⚠️  警告: 此操作将删除大量测试文件!')
    console.log('💡 如需继续执行，请使用: node scripts/cleanup-pc-tests.js --force')
    process.exit(0)
  }

  try {
    // 确保新测试结构存在
    ensureNewTestStructure()

    // 清理测试目录
    cleanupTestsDirectory()

    // 清理根级别测试文件
    cleanupRootLevelTests()

    // 生成报告
    generateCleanupReport()

  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  cleanupTestsDirectory,
  deleteDirectory,
  shouldKeep
}