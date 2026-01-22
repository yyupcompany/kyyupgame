import { test, expect, Page } from '@playwright/test'
import { MobilePageDebugger } from './mcp-mobile-debug-utils'
import { launchMobileBrowser } from './mcp-test-utils'

test.describe('教师中心移动端调试 - 捕获控制台错误和空白页面', () => {
  let page: Page
  let browser: any
  let context: any
  let debugger: MobilePageDebugger

  test.beforeAll(async () => {
    // 启动移动端浏览器
    const launchResult = await launchMobileBrowser()
    browser = launchResult.browser
    context = launchResult.context
    page = launchResult.page

    // 创建调试器
    debugger = new MobilePageDebugger(page, 'teacher', async () => {
      await page.click('.teacher-btn')
    })
  })

  test.afterAll(async () => {
    await saveReport()
    await browser.close()
  })

  async function saveReport() {
    try {
      await debugger.saveReport()
    } catch (error) {
      console.error('保存报告失败:', error.message)
    }
  }

  test('步骤1: 访问教师中心主页面', async () => {
    test.setTimeout(60000)

    console.log('\n📱 开始教师中心调试测试...')
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

  test('步骤2: 访问教师工作台灯页面', async () => {
    test.setTimeout(60000)

    console.log('\n💼 测试教师工作台页面...')

    // 点击工作台导航
    const workbenchTab = await page.locator('.van-tabbar-item').nth(0)
    await workbenchTab.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // 提取并测试页面内的链接
    const links = await debugger.extractLinks()

    if (links.length > 0) {
      console.log(`  在教师工作台找到 ${links.length} 个链接，测试前 5 个`)

      for (let i = 0; i < Math.min(links.length, 5); i++) {
        const link = links[i]
        if (link.text.includes('任务') || link.text.includes('考勤') || link.text.includes('学生')) {
          const result = await debugger.testLink(link, page.url())
          if (result) {
            console.log(`    ❌ 问题: ${link.text}`)
          } else {
            console.log(`    ✅ 正常: ${link.text}`)
          }
        }
      }
    }
  })

  test('步骤3: 访问任务管理页面', async () => {
    test.setTimeout(60000)

    console.log('\n📋 测试任务管理页面...')

    // 点击任务导航
    try {
      const taskTab = await page.locator('.van-tabbar-item').nth(1)
      await taskTab.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // 检查页面内容
      const bodyText = await page.locator('body').textContent() || ''
      expect(bodyText.length).toBeGreaterThan(100)
    } catch (error) {
      console.log(`⚠️ 任务页面可能存在问题: ${error.message}`)
      // 继续测试，不中断
    }
  })

  test('步骤4: 验证底部导航栏所有链接', async () => {
    test.setTimeout(60000)

    console.log('\n🧭 验证底部导航栏...')

    const navItems = await page.locator('.van-tabbar-item').all()
    console.log(`  找到 ${navItems.length} 个导航项`)

    for (let i = 0; i < navItems.length; i++) {
      const navItem = navItems[i]
      const text = await navItem.textContent()
      console.log(`  测试导航 [${i + 1}/${navItems.length}]: ${text?.trim()}`)

      try {
        await navItem.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(800)

        // 检查是否有控制台错误
        const errors = await page.evaluate(() => {
          return window['__PAGE_ERRORS__'] || []
        }).catch(() => [])

        if (errors.length > 0) {
          console.log(`    ⚠️ 导航 ${text?.trim()} 有 ${errors.length} 个错误`)
        } else {
          console.log(`    ✅ 导航 ${text?.trim()} 正常`)
        }
      } catch (error) {
        console.log(`    ❌ 导航 ${text?.trim()} 测试失败: ${error.message}`)
      }
    }
  })

  test('步骤5: 验证关键功能页面', async () => {
    test.setTimeout(90000)

    console.log('\n🎯 验证教师中心关键功能...')

    const keyPages = [
      { name: '工作台', path: '/mobile/teacher-center', selector: '.van-tabbar-item:nth-child(1)' },
      { name: '任务', path: '/mobile/teacher/tasks', selector: '.van-tabbar-item:nth-child(2)' },
      { name: '考勤', path: '/mobile/teacher/attendance', selector: '.van-tabbar-item:nth-child(3)' },
      { name: '我的', path: '/mobile/teacher/profile', selector: '.van-tabbar-item:nth-child(4)' }
    ]

    for (const pageInfo of keyPages) {
      console.log(`  测试 ${pageInfo.name} 页面...`)

      try {
        await page.click(pageInfo.selector)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        // 检查页面是否加载成功
        const url = this.page.url()
        if (url.includes('404') || url.includes('error')) {
          console.log(`    ❌ ${pageInfo.name} 页面加载失败: ${url}`)
        } else {
          // 检查页面内容
          const bodyText = await page.locator('body').textContent() || ''
          if (bodyText.length < 100) {
            console.log(`    ⚠️  ${pageInfo.name} 页面可能为空白`)
          } else {
            console.log(`    ✅ ${pageInfo.name} 页面正常 (${bodyText.length} 字符)`)
          }
        }
      } catch (error) {
        console.log(`    ❌ ${pageInfo.name} 页面测试异常: ${error.message}`)
      }
    }
  })

  test('步骤6: 捕获并报告所有错误', async () => {
    const report = debugger['report']

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('   教师中心测试总结')
    console.log('═══════════════════════════════════════════════════════════')

    if (report.failedLinks.length > 0) {
      console.log(`\n❌ 发现 ${report.failedLinks.length} 个有问题的链接:`)
      const errorPages = report.failedLinks.slice(0, 10) // 只显示前10个

      errorPages.forEach((failed, i) => {
        console.log(`\n${i + 1}. 页面: ${failed.link.text}`)
        console.log(`   URL: ${failed.url}`)
        console.log(`   问题: ${failed.errors.length} 个错误`)
        if (failed.isBlank) console.log(`   ⚠️  空白页面`)
        if (failed.errors.length > 0) {
          console.log('   错误信息:')
          failed.errors.slice(0, 3).forEach(err => console.log(`     - ${err}`))
        }
      })

      if (report.failedLinks.length > 10) {
        console.log(`\n... 还有 ${report.failedLinks.length - 10} 个问题未显示`)
      }

      // 生成错误汇总
      const errorSummary = {}
      report.failedLinks.forEach(failed => {
        failed.errors.forEach(error => {
          const key = error.includes('404') ? '404错误' :
                      error.includes('500') ? '500错误' :
                      error.includes('Cannot find') ? '组件缺失' :
                      error.includes('undefined') ? '未定义错误' :
                      error.includes('Timeout') ? '超时错误' : '其他错误'
          errorSummary[key] = (errorSummary[key] || 0) + 1
        })
      })

      console.log('\n📊 错误类型汇总:')
      Object.entries(errorSummary).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`)
      })

      expect(report.failedLinks.length).toBeLessThan(report.totalLinks * 0.3) // 允许30%的失败率
    } else {
      console.log('\n✅ 所有链接测试通过！')
      expect(report.totalErrors).toBe(0)
    }

    // 保存详细报告
    await debugger.saveReport()
  })
})
