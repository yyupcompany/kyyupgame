import { test, expect } from '@playwright/test'
import { PageDetector } from '../utils/PageDetector'
import { getPagesByCategory } from '../fixtures/pages'

test.describe('仪表板模块页面检测', () => {
  let detector: PageDetector

  test.beforeEach(async ({ page }) => {
    detector = new PageDetector(page)
    // 每个测试前都重新登录确保状态清洁
    await detector.login('admin', '123456')
  })

  test('仪表板主页 - 完整功能检测', async ({ page }) => {
    console.log('🎯 开始检测仪表板主页...')
    
    const result = await detector.detectPage('/dashboard', '仪表板主页')
    
    // 基础断言
    expect(result.status).not.toBe('error')
    expect(result.pagePath).toBe('/dashboard')
    expect(result.pageName).toBe('仪表板主页')
    
    // 性能断言
    expect(result.performance.loadTime).toBeLessThan(10000) // 10秒内加载完成
    
    // UI元素断言
    expect(result.elements.buttons).toBeGreaterThan(0) // 应该有按钮
    
    // 页面特定检查
    await test.step('检查仪表板核心元素', async () => {
      // 检查统计卡片
      const statsCards = page.locator('.el-card, .card, .stat-card')
      const cardsCount = await statsCards.count()
      expect(cardsCount).toBeGreaterThan(0)
      console.log(`📊 发现统计卡片: ${cardsCount}个`)
      
      // 检查图表容器
      const chartContainers = page.locator('.chart-container, .echarts, canvas')
      const chartsCount = await chartContainers.count()
      console.log(`📈 发现图表容器: ${chartsCount}个`)
      
      // 检查快捷操作区
      const quickActions = page.locator('.quick-action, .action-button')
      const actionsCount = await quickActions.count()
      console.log(`⚡ 发现快捷操作: ${actionsCount}个`)
    })
    
    await test.step('检查数据加载状态', async () => {
      // 等待数据加载完成
      await page.waitForTimeout(3000)
      
      // 检查是否还有加载状态
      const loadingElements = page.locator('.loading, .el-loading, .spinner')
      const loadingCount = await loadingElements.count()
      
      if (loadingCount > 0) {
        console.log(`⚠️  仍有加载元素: ${loadingCount}个`)
        result.issues.push(`仍有${loadingCount}个加载元素未消失`)
      } else {
        console.log('✅ 所有数据加载完成')
      }
    })
    
    await test.step('检查响应式布局', async () => {
      // 测试不同视窗大小
      const viewports = [
        { width: 1920, height: 1080, name: '桌面' },
        { width: 1024, height: 768, name: '平板' },
        { width: 375, height: 667, name: '手机' }
      ]
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(1000)
        
        // 截图记录不同分辨率下的显示效果
        const screenshotPath = `dashboard-${viewport.name}-${Date.now()}.png`
        await page.screenshot({ 
          path: `tests/page-detection/reports/${screenshotPath}`,
          fullPage: true 
        })
        
        console.log(`📱 ${viewport.name}布局截图已保存: ${screenshotPath}`)
      }
      
      // 恢复默认视窗
      await page.setViewportSize({ width: 1920, height: 1080 })
    })
    
    // 最终状态检查
    if (result.issues.length === 0) {
      console.log('✅ 仪表板主页检测通过')
    } else {
      console.log(`⚠️  仪表板主页发现 ${result.issues.length} 个问题:`)
      result.issues.forEach(issue => console.log(`  - ${issue}`))
    }
  })

  test('仪表板概览页面检测', async ({ page }) => {
    console.log('🎯 开始检测仪表板概览页面...')
    
    const result = await detector.detectPage('/dashboard/overview', '仪表板概览')
    
    // 基础检查
    expect(result.status).not.toBe('error')
    
    await test.step('检查概览数据展示', async () => {
      // 检查数据卡片
      const dataCards = page.locator('.overview-card, .data-card, .metric-card')
      const cardsCount = await dataCards.count()
      console.log(`📋 概览数据卡片: ${cardsCount}个`)
      
      // 检查趋势图表
      const trendCharts = page.locator('.trend-chart, .line-chart')
      const trendsCount = await trendCharts.count()
      console.log(`📊 趋势图表: ${trendsCount}个`)
    })
  })

  test('仪表板统计页面检测', async ({ page }) => {
    console.log('🎯 开始检测仪表板统计页面...')
    
    const result = await detector.detectPage('/dashboard/statistics', '仪表板统计')
    
    // 基础检查
    expect(result.status).not.toBe('error')
    
    await test.step('检查统计功能', async () => {
      // 检查时间范围选择器
      const dateRangePicker = page.locator('.el-date-picker, .date-range-picker')
      const datePickerExists = await dateRangePicker.count() > 0
      console.log(`📅 时间选择器存在: ${datePickerExists}`)
      
      // 检查统计图表
      const statisticCharts = page.locator('.statistic-chart, .bar-chart, .pie-chart')
      const chartsCount = await statisticCharts.count()
      console.log(`📈 统计图表: ${chartsCount}个`)
      
      // 检查数据表格
      const dataTables = page.locator('.el-table, table')
      const tablesCount = await dataTables.count()
      console.log(`📋 数据表格: ${tablesCount}个`)
    })
  })

  test('批量检测仪表板相关页面', async ({ page }) => {
    console.log('🔍 批量检测仪表板模块所有页面...')
    
    const dashboardPages = getPagesByCategory('dashboard')
    console.log(`📋 待检测页面数量: ${dashboardPages.length}个`)
    
    const results = await detector.detectPages(
      dashboardPages.map(p => ({ path: p.path, name: p.name }))
    )
    
    // 统计检测结果
    const successCount = results.filter(r => r.status === 'success').length
    const warningCount = results.filter(r => r.status === 'warning').length
    const errorCount = results.filter(r => r.status === 'error').length
    
    console.log('📊 批量检测结果汇总:')
    console.log(`  ✅ 成功: ${successCount}个`)
    console.log(`  ⚠️  警告: ${warningCount}个`) 
    console.log(`  ❌ 错误: ${errorCount}个`)
    
    // 生成报告
    const reportPath = await detector.generateReport()
    const markdownPath = await detector.generateMarkdownReport()
    
    console.log(`📄 JSON报告: ${reportPath}`)
    console.log(`📝 Markdown报告: ${markdownPath}`)
    
    // 至少一半的页面应该正常
    expect(successCount + warningCount).toBeGreaterThan(results.length / 2)
  })

  test.afterEach(async ({ page }) => {
    // 测试后清理，截图最终状态
    const finalScreenshot = `dashboard-final-${Date.now()}.png`
    await page.screenshot({ 
      path: `tests/page-detection/reports/${finalScreenshot}`,
      fullPage: true 
    })
    console.log(`📸 最终状态截图: ${finalScreenshot}`)
  })
})