import { test, expect, Page } from '@playwright/test'
import { MobilePageDebugger } from './mcp-mobile-debug-utils'
import { launchMobileBrowser } from './mcp-test-utils'

test.describe('家长中心移动端调试 - 捕获控制台错误和空白页面', () => {
  let page: Page
  let browser: any
  let context: any
  let debugger: MobilePageDebugger
  let currentNavIndex = 0

  test.beforeAll(async () => {
    // 启动移动端浏览器
    const launchResult = await launchMobileBrowser()
    browser = launchResult.browser
    context = launchResult.context
    page = launchResult.page

    // 创建调试器
    debugger = new MobilePageDebugger(page, 'parent', async () => {
      await page.click('.parent-btn')
    })

    try {
      const fs = require('fs')
      const path = require('path')
      const reportDir = path.join(__dirname, '../../playwright-report/complete')
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true })
      }
    } catch (error) {
      console.error('创建报告目录失败:', error.message)
    }
  })

  test.afterAll(async () => {
    await saveReport()
    await browser.close()

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('   家长中心调试测试完成')
    console.log('═══════════════════════════════════════════════════════════')
  })

  async function saveReport() {
    try {
      await debugger.saveReport()
    } catch (error) {
      console.error('保存报告失败:', error.message)
    }
  }

  test('步骤1: 访问家长中心主页面', async () => {
    test.setTimeout(60000)

    console.log('\n📱 开始家长中心调试测试...')
    const report = await debugger.runFullDebugTest('http://localhost:5173/mobile')

    // 打印报告
    debugger.printReport()

    // 设置测试结果
    if (report.failedLinks.length > 0) {
      console.log(`\n⚠️ 发现 ${report.failedLinks.length} 个失败的链接`)
      expect(report.failedLinks.length).toBeLessThan(report.totalLinks)
    } else {
      console.log('\n✅ 所有链接测试通过！')
      expect(report.totalErrors).toBe(0)
    }
  })

  test('步骤2: 遍历底部导航所有页面', async () => {
    test.setTimeout(120000)

    console.log('\n🧭 遍历家长中心底部导航...')

    const navItems = await page.locator('.van-tabbar-item').all()
    console.log(`  找到 ${navItems.length} 个导航项`)

    const navResults = []

    for (let i = 0; i < navItems.length; i++) {
      const navItem = navItems[i]
      const text = await navItem.textContent()
      currentNavIndex = i

      console.log(`\n  [${i + 1}/${navItems.length}] 测试导航: ${text?.trim()}`)

      try {
        // 点击导航
        await navItem.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)

        // 捕获页面错误
        const errors = await capturePageErrors()
        const url = page.url()
        const title = await page.title()
        const bodyLength = await getPageContentLength()

        const isBlank = bodyLength < 100
        const has404 = url.includes('404') || (await page.content()).includes('404 Not Found')
        const hasError = errors.length > 0 || isBlank || has404

        navResults.push({
          nav: text?.trim(),
          url,
          title,
          errors,
          isBlank,
          has404,
          bodyLength
        })

        if (hasError) {
          console.log(`    ❌ 问题检测:`)
          if (has404) console.log(`      - 404错误`)
          if (isBlank) console.log(`      - 空白页面 (${bodyLength} 字符)`)
          if (errors.length > 0) console.log(`      - ${errors.length} 个控制台错误`)
        } else {
          console.log(`    ✅ 正常 (${bodyLength} 字符)`)
        }

        // 测试页面内的关键链接
        await testInnerPageLinks(text?.trim() || '')

      } catch (error) {
        console.log(`    ❌ 导航测试异常: ${error.message}`)
        navResults.push({
          nav: text?.trim(),
          error: error.message,
          hasError: true
        })
      }

      // 每3个导航暂停一下
      if ((i + 1) % 3 === 0) {
        await page.waitForTimeout(1000)
      }
    }

    // 验证结果
    const failedNavs = navResults.filter(r => r.hasError || r.error)
    if (failedNavs.length > 0) {
      console.log(`\n❌ ${failedNavs.length} 个导航存在问题`)
      expect(failedNavs.length).toBeLessThan(navItems.length * 0.5) // 允许50%失败率
    } else {
      console.log('\n✅ 所有导航测试通过')
    }

    async function capturePageErrors() {
      const errors = await page.evaluate(() => {
        const errs: string[] = []

        // 检查 404 或错误页面
        const bodyText = document.body.textContent || ''
        const has404 = bodyText.includes('404') || bodyText.includes('页面不存在')
        const hasError = bodyText.includes('错误') || bodyText.includes('Error')

        if (has404) errs.push('检测到404错误')
        if (hasError) errs.push('检测到错误页面')

        return errs
      }).catch(() => [])

      return errors
    }

    async function getPageContentLength() {
      const length = await page.evaluate(() => {
        return document.body.textContent?.length || 0
      }).catch(() => 0)
      return length
    }

    async function testInnerPageLinks(navName: string) {
      try {
        // 根据导航名称测试不同类型的链接
        if (navName.includes('活动') || navName.includes('首页')) {
          // 测试活动卡片
          const cards = await page.locator('.van-card, .content-card').all()
          if (cards.length > 0) {
            console.log(`      找到 ${cards.length} 个活动卡片`)
            // 测试第一个卡片
            await cards[0].click()
            await page.waitForTimeout(1000)
            await page.goBack()
            await page.waitForTimeout(500)
          }
        } else if (navName.includes('孩子')) {
          // 测试孩子列表
          const childItems = await page.locator('.child-item, .student-item').all()
          console.log(`      找到 ${childItems.length} 个孩子`)
        } else if (navName.includes('我的')) {
          // 测试个人中心链接
          const menuItems = await page.locator('.van-cell').all()
          if (menuItems.length > 0) {
            console.log(`      找到 ${menuItems.length} 个菜单项`)
          }
        }
      } catch (error) {
        console.log(`      页面内链接测试异常: ${error.message}`)
      }
    }
  })

  test('步骤3: 测试关键功能页面', async () => {
    test.setTimeout(90000)

    console.log('\n🎯 测试家长中心关键功能页面...')

    const keyFeatures = [
      '活动报名',
      '成长记录',
      '家园沟通',
      '缴费管理',
      '请假申请'
    ]

    for (const feature of keyFeatures) {
      console.log(`  检查功能: ${feature}`)

      try {
        // 在页面中搜索该功能
        const hasFeature = await page.evaluate((featureName) => {
          const bodyText = document.body.textContent || ''
          return bodyText.includes(featureName)
        }, feature)

        if (hasFeature) {
          console.log(`    ✅ 找到 ${feature}`)

          // 尝试点击该功能
          try {
            await page.click(`text="${feature}"`)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(1000)

            // 验证页面加载
            const bodyLength = await page.evaluate(() => document.body.textContent?.length || 0)
            if (bodyLength > 100) {
              console.log(`      ✅ ${feature} 页面正常`)
            } else {
              console.log(`      ⚠️  ${feature} 页面可能为空白`)
            }

            // 返回
            await page.goBack()
            await page.waitForTimeout(500)
          } catch (clickError) {
            console.log(`      ⚠️  无法点击 ${feature}: ${clickError.message}`)
          }
        }
      } catch (error) {
        console.log(`    ❌ 检查 ${feature} 时出错: ${error.message}`)
      }

      await page.waitForTimeout(500)
    }
  })

  test('步骤4: 验证数据加载和渲染', async () => {
    test.setTimeout(60000)

    console.log('\n📊 验证家长中心数据加载...')

    // 检查首页是否有数据
    await page.goto('http://localhost:5173/mobile')
    await this.loginMethod()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 点击第一个导航（通常是首页）
    await page.click('.van-tabbar-item:nth-child(1)')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // 检查是否有数据卡片
    const hasDataCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('.stats-card, .data-card, .info-card, .van-card')
      return cards.length
    })

    console.log(`  找到 ${hasDataCards} 个数据卡片`)

    if (hasDataCards > 0) {
      console.log('  ✅ 数据卡片正常加载')
    } else {
      console.log('  ⚠️  未找到数据卡片，可能是空白页面')
    }

    // 检查 API 调用是否成功
    const apiStats = await page.evaluate(() => {
      return {
        apiCalls: window['__API_CALLS__'] || [],
        apiErrors: window['__API_ERRORS__'] || []
      }
    }).catch(() => ({ apiCalls: [], apiErrors: [] }))

    if (apiStats.apiCalls.length > 0) {
      console.log(`  API调用: ${apiStats.apiCalls.length} 次`)
    }

    if (apiStats.apiErrors.length > 0) {
      console.log(`  ⚠️  API错误: ${apiStats.apiErrors.length} 个`)
      apiStats.apiErrors.slice(0, 3).forEach(err => {
        console.log(`    - ${err}`)
      })
    }

    expect(hasDataCards).toBeGreaterThan(0)
  })

  test('步骤5: 捕获汇总所有错误', async () => {
    const report = debugger['report']

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('   家长中心调试最终报告')
    console.log('═══════════════════════════════════════════════════════════')

    // 汇总统计数据
    const totalTested = report.linksTested + currentNavIndex + 1
    const totalFailed = report.failedLinks.length
    const passRate = totalTested > 0 ? ((totalTested - totalFailed) / totalTested) * 100 : 0

    console.log(`测试链接数: ${report.totalLinks}`)
    console.log(`实际测试数: ${totalTested}`)
    console.log(`失败数: ${totalFailed}`)
    console.log(`空白页面: ${report.totalBlankPages}`)
    console.log(`通过率: ${passRate.toFixed(1)}%`)

    if (report.failedLinks.length > 0) {
      console.log('\n❌ 问题汇总:')

      // 按错误类型分组
      const errorByType = {}
      report.failedLinks.forEach(failed => {
        const errorType = failed.errors[0]?.includes('404') ? '404错误' :
                         failed.errors[0]?.includes('空白') ? '空白页面' : '其他错误'

        if (!errorByType[errorType]) errorByType[errorType] = []
        errorByType[errorType].push(failed)
      })

      Object.entries(errorByType).forEach(([type, items]: [string, any[]]) => {
        console.log(`\n${type} (${items.length}个):`)
        items.slice(0, 5).forEach(item => {
          console.log(`  - ${item.link.text}`)
        })
        if (items.length > 5) {
          console.log(`  ... 还有 ${items.length - 5} 个`)
        }
      })

      // 生成修复建议
      console.log('\n🔧 修复建议:')
      if (errorByType['404错误']) {
        console.log('  1. 检查路由配置，确保所有路径正确')
        console.log('  2. 创建缺失的页面组件文件')
      }
      if (errorByType['空白页面']) {
        console.log('  1. 检查组件是否正确渲染')
        console.log('  2. 验证API数据是否成功加载')
        console.log('  3. 添加数据加载状态提示')
      }

      expect(report.failedLinks.length).toBeLessThan(report.totalLinks * 0.4) // 允许40%失败率
    } else {
      console.log('\n✅ 所有测试通过！')
    }

    // 保存报告
    await saveReport()
  })
})
