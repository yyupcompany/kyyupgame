/**
 * 全局测试清理
 * 在所有测试结束后执行的清理工作
 */

import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始PC端完整测试全局清理...')

  // 生成测试报告摘要
  await generateTestSummary()

  // 清理临时文件
  await cleanupTempFiles()

  // 数据清理
  await cleanupTestData()

  console.log('✅ 全局清理完成')
}

/**
 * 生成测试报告摘要
 */
async function generateTestSummary() {
  console.log('📊 生成测试报告摘要...')

  const reportsDir = path.join(__dirname, './reports')
  const summaryFile = path.join(reportsDir, 'test-summary.json')

  try {
    // 检查是否存在测试结果文件
    const resultsFile = path.join(reportsDir, 'results.json')
    let summary: any = {
      timestamp: new Date().toISOString(),
      testSuite: 'PC端四角色完整测试',
      environment: process.env.NODE_ENV || 'test',
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      coverage: {
        pages: 0,
        apis: 0,
        roles: 4,
        features: 0
      }
    }

    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'))

      // 从Playwright结果中提取统计信息
      if (results.suites) {
        results.suites.forEach((suite: any) => {
          if (suite.specs) {
            suite.specs.forEach((spec: any) => {
              summary.summary.total++
              if (spec.ok) {
                summary.summary.passed++
              } else {
                summary.summary.failed++
              }
            })
          }
        })
      }
    }

    // 写入摘要文件
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2))
    console.log(`✅ 测试报告摘要已生成: ${summaryFile}`)

    // 输出到控制台
    console.log('\n📋 测试执行摘要:')
    console.log(`总测试数: ${summary.summary.total}`)
    console.log(`通过: ${summary.summary.passed}`)
    console.log(`失败: ${summary.summary.failed}`)
    console.log(`跳过: ${summary.summary.skipped}`)
    console.log(`成功率: ${summary.summary.total > 0 ? ((summary.summary.passed / summary.summary.total) * 100).toFixed(2) : 0}%`)

  } catch (error) {
    console.warn('⚠️  生成测试报告摘要失败:', error.message)
  }
}

/**
 * 清理临时文件
 */
async function cleanupTempFiles() {
  console.log('🗑️  清理临时文件...')

  const tempDirs = [
    path.join(__dirname, './reports/test-results'),
    path.join(__dirname, './reports/temp'),
  ]

  tempDirs.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
          const filePath = path.join(dir, file)
          const stats = fs.statSync(filePath)

          // 删除超过1小时的临时文件
          if (Date.now() - stats.mtime.getTime() > 60 * 60 * 1000) {
            if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true })
            } else {
              fs.unlinkSync(filePath)
            }
          }
        })
        console.log(`✅ 清理临时目录: ${dir}`)
      }
    } catch (error) {
      console.warn(`⚠️  清理临时目录失败 ${dir}:`, error.message)
    }
  })
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  console.log('🧹 清理测试数据...')

  try {
    // 这里可以添加清理测试数据库的逻辑
    // 例如删除测试期间创建的用户、班级等数据

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

    // 调用清理API（如果存在）
    try {
      const response = await fetch(`${baseUrl}/api/test/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Cleanup': 'true'
        }
      })

      if (response.ok) {
        console.log('✅ 测试数据清理完成')
      } else {
        console.warn('⚠️  测试数据清理API响应异常')
      }
    } catch (error) {
      console.warn('⚠️  无法调用测试数据清理API')
    }

  } catch (error) {
    console.warn('⚠️  清理测试数据失败:', error.message)
  }
}

/**
 * 压缩测试报告
 */
async function compressReports() {
  console.log('📦 压缩测试报告...')

  // 这里可以添加压缩测试报告的逻辑
  // 将报告文件压缩成zip包，便于存档和传输

  try {
    const reportsDir = path.join(__dirname, './reports')

    // 检查是否有需要压缩的报告
    const reportFiles = fs.readdirSync(reportsDir).filter(file =>
      file.endsWith('.html') || file.endsWith('.json')
    )

    if (reportFiles.length > 0) {
      console.log(`发现 ${reportFiles.length} 个报告文件`)
      // 这里可以使用archiver等库来压缩文件
      console.log('✅ 报告压缩完成（功能待实现）')
    }

  } catch (error) {
    console.warn('⚠️  压缩报告失败:', error.message)
  }
}

export default globalTeardown