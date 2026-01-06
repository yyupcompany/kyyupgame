/**
 * 按钮扫描工具使用示例
 *
 * 演示如何使用ButtonScanner工具进行自动化按钮扫描
 */

import { test, expect, describe, beforeEach, afterEach } from 'vitest'
import { setupTestPage, expectNoConsoleErrors } from '../helpers/test-utils'
import ButtonScanner from './button-scanner'

describe('按钮扫描工具使用示例', () => {
  let page: any
  let testUrl: string

  beforeEach(async () => {
    const setup = await setupTestPage()
    page = setup.page
    testUrl = setup.testUrl
  })

  afterEach(async () => {
    if (page) {
      await page.close()
    }
    expectNoConsoleErrors()
  })

  test('完整按钮扫描流程', async () => {
    // 导航到测试页面
    await page.goto(testUrl)
    await page.waitForLoadState('networkidle')

    // 创建扫描器实例
    const scanner = new ButtonScanner(page)

    // 执行完整扫描
    const report = await scanner.scanAllButtons()

    // 打印详细报告
    scanner.printReport(report)

    // 验证扫描结果
    expect(report.total).toBeGreaterThan(0)
    expect(report.visible).toBeGreaterThanOrEqual(0)
    expect(report.enabled).toBeGreaterThanOrEqual(0)

    // 验证覆盖率指标
    const testIdCoverage = (report.withTestId / report.total) * 100
    const accessibilityCoverage = (report.withAriaLabel / report.total) * 100

    console.log(`📊 测试ID覆盖率: ${testIdCoverage.toFixed(1)}%`)
    console.log(`📊 可访问性覆盖率: ${accessibilityCoverage.toFixed(1)}%`)

    // 质量检查
    expect(testIdCoverage).toBeGreaterThan(50) // 至少50%的按钮有测试ID
    expect(accessibilityCoverage).toBeGreaterThan(80) // 至少80%的按钮有可访问标签

    // 生成测试用例建议
    const suggestions = scanner.generateTestCaseSuggestions(report)
    if (suggestions.length > 0) {
      console.log('\n💡 自动生成的测试建议:')
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`)
      })
    }
  })

  test('不同页面按钮扫描对比', async () => {
    const pagesToScan = [
      { path: '/Login', name: '登录页' },
      { path: '/system/users', name: '用户管理页' },
      { path: '/system/settings', name: '系统设置页' }
    ]

    const reports: Array<{ name: string; report: any }> = []

    // 扫描多个页面
    for (const pageInfo of pagesToScan) {
      try {
        await page.goto(`${testUrl}${pageInfo.path}`)
        await page.waitForLoadState('networkidle')

        const scanner = new ButtonScanner(page)
        const report = await scanner.scanAllButtons()

        reports.push({ name: pageInfo.name, report })

        console.log(`\n📄 ${pageInfo.name} 按钮扫描结果:`)
        console.log(`  总数: ${report.total}, 可见: ${report.visible}, 有测试ID: ${report.withTestId}`)
      } catch (error) {
        console.log(`⚠️ 无法扫描 ${pageInfo.name}: ${error}`)
      }
    }

    // 分析跨页面对比
    if (reports.length > 1) {
      console.log('\n📊 跨页面按钮对比分析:')
      reports.forEach(({ name, report }) => {
        const avgButtonsPerPage = report.total
        const testIdRate = ((report.withTestId / report.total) * 100).toFixed(1)
        console.log(`  ${name}: ${avgButtonsPerPage} 个按钮, ${testIdRate}% 测试ID覆盖率`)
      })

      // 验证页面间的质量一致性
      const coverageRates = reports.map(r => (r.report.withTestId / r.report.total) * 100)
      const avgCoverage = coverageRates.reduce((a, b) => a + b, 0) / coverageRates.length
      const maxCoverage = Math.max(...coverageRates)
      const minCoverage = Math.min(...coverageRates)

      console.log(`\n📈 测试ID覆盖率统计:`)
      console.log(`  平均: ${avgCoverage.toFixed(1)}%`)
      console.log(`  最高: ${maxCoverage.toFixed(1)}%`)
      console.log(`  最低: ${minCoverage.toFixed(1)}%`)

      // 质量检查：覆盖率差异不应太大
      expect(maxCoverage - minCoverage).toBeLessThan(30)
    }
  })

  test('按钮问题检测和修复建议', async () => {
    await page.goto(testUrl)
    await page.waitForLoadState('networkidle')

    const scanner = new ButtonScanner(page)
    const report = await scanner.scanAllButtons()

    // 重点关注问题按钮
    const problemButtons = report.buttons.filter(button => {
      return !button.hasTestId || !button.textContent.trim() || !button.isVisible
    })

    console.log(`\n🔍 需要关注的按钮 (${problemButtons.length} 个):`)

    problemButtons.forEach((button, index) => {
      const issues = []
      if (!button.hasTestId) issues.push('缺少test-id')
      if (!button.textContent.trim() && !button.ariaLabel) issues.push('缺少可访问标签')
      if (!button.isVisible) issues.push('隐藏状态')

      console.log(`  ${index + 1}. [${button.category}] ${button.testId || '(无ID)'} - ${issues.join(', ')}`)
    })

    // 生成具体的修复建议
    if (problemButtons.length > 0) {
      console.log('\n🔧 具体修复建议:')

      report.buttons.forEach((button, index) => {
        const suggestions = []

        if (!button.hasTestId) {
          const suggestedId = `${button.category.toLowerCase().replace(/\s+/g, '-')}-${index}-btn`
          suggestions.push(`添加 data-testid="${suggestedId}"`)
        }

        if (!button.textContent.trim() && !button.ariaLabel && !button.title) {
          const suggestedLabel = button.category === '数据操作' ? '操作按钮' : '功能按钮'
          suggestions.push(`添加 aria-label="${suggestedLabel}" 或 title="${suggestedLabel}"`)
        }

        if (!button.isVisible) {
          suggestions.push('检查按钮隐藏的必要性，考虑移除或条件显示')
        }

        if (suggestions.length > 0) {
          console.log(`  按钮 ${index + 1}: ${suggestions.join(', ')}`)
        }
      })
    }

    // 验证问题数量在合理范围内
    const problemRate = (problemButtons.length / report.total) * 100
    expect(problemRate).toBeLessThan(50) // 问题按钮不应超过50%
  })

  test('按钮分类统计和趋势分析', async () => {
    await page.goto(testUrl)
    await page.waitForLoadState('networkidle')

    const scanner = new ButtonScanner(page)
    const report = await scanner.scanAllButtons()

    // 深度分析各类按钮
    console.log('\n📊 按钮分类详细分析:')

    Object.entries(report.categories).forEach(([category, count]) => {
      const percentage = ((count / report.total) * 100).toFixed(1)
      console.log(`  ${category}: ${count} 个 (${percentage}%)`)

      // 分析该类按钮的特征
      const categoryButtons = report.buttons.filter(b => b.category === category)
      const withTestId = categoryButtons.filter(b => b.hasTestId).length
      const visible = categoryButtons.filter(b => b.isVisible).length

      console.log(`    - 测试ID覆盖率: ${((withTestId / count) * 100).toFixed(1)}%`)
      console.log(`    - 可见率: ${((visible / count) * 100).toFixed(1)}%`)

      // 识别该类按钮的常见问题
      const issues = categoryButtons.filter(b => !b.hasTestId || !b.textContent.trim())
      if (issues.length > 0) {
        console.log(`    - ⚠️ 需要改进: ${issues.length} 个按钮`)
      }
    })

    // 分析按钮分布合理性
    const expectedDistribution = {
      '数据操作': 0.3,    // 30%
      '导航操作': 0.25,   // 25%
      '查询过滤': 0.15,   // 15%
      '表单控制': 0.15,   // 15%
      '其他': 0.15        // 15%
    }

    console.log('\n🎯 按钮分布合理性分析:')
    let distributionScore = 0
    const checkedCategories = Object.keys(expectedDistribution)

    checkedCategories.forEach(category => {
      const actualCount = report.categories[category] || 0
      const actualRate = actualCount / report.total
      const expectedRate = expectedDistribution[category as keyof typeof expectedDistribution]
      const deviation = Math.abs(actualRate - expectedRate)

      console.log(`  ${category}: 实际 ${(actualRate * 100).toFixed(1)}%, 期望 ${(expectedRate * 100).toFixed(1)}%, 偏差 ${(deviation * 100).toFixed(1)}%`)

      if (deviation < 0.1) { // 10%以内认为合理
        distributionScore++
      }
    })

    const合理性评分 = (distributionScore / checkedCategories.length) * 100
    console.log(`\n📈 按钮分布合理性评分: ${合理性评分.toFixed(1)}%`)

    // 基于分析结果生成优化建议
    if (合理性评分 < 70) {
      console.log('\n💡 按钮分布优化建议:')
      console.log('  - 考虑重新平衡不同类型按钮的数量')
      console.log('  - 减少冗余的操作按钮')
      console.log('  - 增强重要功能的可访问性')
    }

    expect(合理性评分).toBeGreaterThan(0) // 至少有一些分布是合理的
  })
})