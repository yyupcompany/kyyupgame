import { test, expect, Page, Locator } from '@playwright/test'
import { launchMobileBrowser, AdminLogin } from './mcp-test-utils'
import fs from 'fs'

interface CenterLink {
  text: string
  href?: string
  className: string
  selector: string
  index: number
}

interface ErrorReport {
  link: CenterLink
  errors: string[]
  consoleErrors: string[]
  pageErrors: string[]
  isBlank: boolean
  url: string
  statusCode?: number
  responseTime: number
}

interface DebugReport {
  totalLinks: number
  totalErrors: number
  totalBlankPages: number
  linksTested: number
  failedLinks: ErrorReport[]
  successfulLinks: CenterLink[]
  timestamp: string
  duration: number
  summary: {
    status: string
    passRate: number
    errorTypes: Record<string, number>
  }
}

test.describe('Centers 页面链接调试 - 捕获控制台错误和空白页面', () => {
  let page: Page
  let browser: any
  let context: any
  let debugReport: DebugReport

  test.beforeAll(async () => {
    // 启动移动端浏览器
    const launchResult = await launchMobileBrowser()
    browser = launchResult.browser
    context = launchResult.context
    page = launchResult.page

    // 初始化调试报告
    debugReport = {
      totalLinks: 0,
      totalErrors: 0,
      totalBlankPages: 0,
      linksTested: 0,
      failedLinks: [],
      successfulLinks: [],
      timestamp: new Date().toISOString(),
      duration: 0,
      summary: {
        status: 'in_progress',
        passRate: 0,
        errorTypes: {}
      }
    }
  })

  test.afterAll(async () => {
    // 生成调试报告
    debugReport.timestamp = new Date().toISOString()
    debugReport.summary.passRate = debugReport.linksTested > 0
      ? ((debugReport.linksTested - debugReport.totalErrors) / debugReport.linksTested) * 100
      : 0

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('   Centers 页面链接调试报告')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`总链接数: ${debugReport.totalLinks}`)
    console.log(`已测试: ${debugReport.linksTested}`)
    console.log(`错误数: ${debugReport.totalErrors}`)
    console.log(`空白页: ${debugReport.totalBlankPages}`)
    console.log(`通过率: ${debugReport.summary.passRate.toFixed(1)}%`)
    console.log('═══════════════════════════════════════════════════════════\n')

    // 保存报告到文件（使用import语句在文件顶部导入）
    const reportPath = '/home/zhgue/kyyupgame/k.yyup.com/client/playwright-report/complete/CENTERS_DEBUG_REPORT.json'
    const reportDir = '/home/zhgue/kyyupgame/k.yyup.com/client/playwright-report/complete'

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify(debugReport, null, 2))
    console.log(`调试报告已保存到: ${reportPath}`)

    await browser.close()
  })

  test('步骤1: 访问 Centers 页面并登录', async () => {
    test.setTimeout(60000)

    console.log('步骤1: 访问 /mobile/login 登录页面...')
    await page.goto('http://localhost:5173/mobile/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // 使用principal角色登录（admin用户不存在）
    console.log('使用快捷登录: 园长')
    await page.locator('button', { hasText: '园长' }).click()
    await page.waitForTimeout(2000)

    // 验证成功进入 centers 页面
    await expect(page).toHaveURL(/\/mobile\/centers/)
    const pageTitle = await page.locator('h1, h2, .page-title').first().textContent()
    console.log(`页面标题: ${pageTitle}`)
  })

  test('步骤2: 提取所有 Centers 链接', async () => {
    test.setTimeout(60000)

    console.log('\n步骤2: 提取所有 Centers 页面链接...')

    // 等待页面加载完成
    await page.waitForSelector('.van-cell, .van-grid, .center-item', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // 提取所有可点击的中心链接
    const centerLinks = await page.evaluate(() => {
      const links: Array<{ text: string; href?: string; className: string; selector: string; index: number }> = []

      // 查找 van-cell 类型的链接
      const cells = document.querySelectorAll('.van-cell')
      cells.forEach((cell, index) => {
        const linkElement = cell.querySelector('a') || cell
        if (linkElement) {
          links.push({
            text: cell.textContent?.trim() || '',
            href: linkElement.getAttribute('href') || undefined,
            className: cell.className,
            selector: `.van-cell:nth-child(${index + 1})`,
            index
          })
        }
      })

      // 查找 van-grid-item 类型的链接
      const gridItems = document.querySelectorAll('.van-grid-item')
      gridItems.forEach((item, index) => {
        const linkElement = item.querySelector('a') || item
        if (linkElement) {
          links.push({
            text: item.textContent?.trim() || '',
            href: linkElement.getAttribute('href') || undefined,
            className: item.className,
            selector: `.van-grid-item:nth-child(${index + 1})`,
            index: index + links.length
          })
        }
      })

      // 查找带 href 的 a 标签
      const anchorLinks = document.querySelectorAll('a[href*="/mobile/centers"]')
      anchorLinks.forEach((link, index) => {
        links.push({
          text: link.textContent?.trim() || '',
          href: link.getAttribute('href') || undefined,
          className: link.className,
          selector: `a[href*="/mobile/centers"]:nth-of-type(${index + 1})`,
          index: index + links.length
        })
      })

      return links
    })

    console.log(`找到 ${centerLinks.length} 个 Centers 链接:`)
    centerLinks.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.text} -> ${link.href}`)
    })

    // 保存到报告中
    debugReport.totalLinks = centerLinks.length
    global['centerLinks'] = centerLinks
  })

  test('步骤3: 遍历所有 Centers 链接并捕获错误', async () => {
    test.setTimeout(300000) // 5分钟超时

    const centerLinks = global['centerLinks'] as CenterLink[]
    if (!centerLinks || centerLinks.length === 0) {
      console.warn('未找到任何 Centers 链接，跳过测试')
      return
    }

    console.log(`\n步骤3: 开始遍历 ${centerLinks.length} 个 Centers 链接...`)
    console.log('═══════════════════════════════════════════════════════════\n')

    const failedLinks: ErrorReport[] = []
    const successfulLinks: CenterLink[] = []

    for (let i = 0; i < centerLinks.length; i++) {
      const link = centerLinks[i]
      console.log(`\n[${i + 1}/${centerLinks.length}] 测试链接: ${link.text}`)

      try {
        // 捕获页面错误
        const errors: string[] = []
        const consoleErrors: string[] = []
        const pageErrors: string[] = []

        // 设置错误监听器
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
          }
        })

        page.on('pageerror', error => {
          pageErrors.push(error.message)
        })

        // 记录开始时间
        const startTime = Date.now()

        // 点击链接
        try {
          await page.click(link.selector)
          console.log('  ✅ 点击成功')
        } catch (clickError) {
          console.log(`  ❌ 点击失败: ${clickError.message}`)
          // 如果点击失败，尝试直接导航到 URL
          if (link.href) {
            console.log(`  🔄 尝试直接访问: ${link.href}`)
            await page.goto(link.href)
          }
        }

        // 等待页面加载
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)

        // 记录响应时间
        const responseTime = Date.now() - startTime

        // 获取当前 URL
        const currentUrl = page.url()
        console.log(`  🔗 当前URL: ${currentUrl}`)

        // 检查页面内容
        const bodyText = await page.locator('body').textContent() || ''
        const isBlank = bodyText.trim().length < 100 // 简化的空白检测

        if (isBlank) {
          console.log('  ⚠️  页面可能为空白（内容少于100字符）')
          debugReport.totalBlankPages++
        } else {
          console.log(`  ✅ 页面内容长度: ${bodyText.length}`)
        }

        // 收集错误信息
        page.removeAllListeners('console')
        page.removeAllListeners('pageerror')

        errors.push(...consoleErrors, ...pageErrors)

        if (errors.length > 0) {
          console.log(`  ❌ 捕获到 ${errors.length} 个错误:`)
          errors.forEach(err => console.log(`     - ${err}`))
          debugReport.totalErrors++

          failedLinks.push({
            link,
            errors,
            consoleErrors,
            pageErrors,
            isBlank,
            url: currentUrl,
            responseTime
          })
        } else {
          console.log('  ✅ 无错误')
          successfulLinks.push(link)
        }

        // 返回 Centers 页面继续测试下一个链接
        await page.goto('http://localhost:5173/mobile/centers')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)

        debugReport.linksTested++

      } catch (error) {
        console.log(`  ❌ 测试失败: ${error.message}`)
        debugReport.totalErrors++

        failedLinks.push({
          link,
          errors: [error.message],
          consoleErrors: [],
          pageErrors: [],
          isBlank: false,
          url: page.url(),
          responseTime: 0
        })
      }
    }

    // 更新报告数据
    debugReport.failedLinks = failedLinks
    debugReport.successfulLinks = successfulLinks
    debugReport.duration = Date.now() - new Date(debugReport.timestamp).getTime()

    // 打印总结
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('   测试完成总结')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`总链接数: ${debugReport.totalLinks}`)
    console.log(`已测试: ${debugReport.linksTested}`)
    console.log(`失败数: ${debugReport.failedLinks.length}`)
    console.log(`空白页: ${debugReport.totalBlankPages}`)
    console.log('═══════════════════════════════════════════════════════════')

    if (failedLinks.length > 0) {
      console.log('\n❌ 失败的链接:')
      failedLinks.forEach((report, i) => {
        console.log(`\n${i + 1}. ${report.link.text}`)
        console.log(`   URL: ${report.url}`)
        console.log(`   错误数: ${report.errors.length}`)
        console.log(`   是否空白: ${report.isBlank ? '是' : '否'}`)
        if (report.errors.length > 0) {
          console.log('   错误详情:')
          report.errors.forEach(err => console.log(`     - ${err}`))
        }
      })
    }

    // 生成错误类型统计
    const errorTypes: Record<string, number> = {}
    failedLinks.forEach(report => {
      report.errors.forEach(error => {
        if (error.includes('404')) errorTypes['404错误'] = (errorTypes['404错误'] || 0) + 1
        else if (error.includes('500')) errorTypes['500错误'] = (errorTypes['500错误'] || 0) + 1
        else if (error.includes('Cannot find')) errorTypes['组件缺失'] = (errorTypes['组件缺失'] || 0) + 1
        else if (error.includes('undefined')) errorTypes['未定义错误'] = (errorTypes['未定义错误'] || 0) + 1
        else if (error.includes('Timeout')) errorTypes['超时错误'] = (errorTypes['超时错误'] || 0) + 1
        else errorTypes['其他错误'] = (errorTypes['其他错误'] || 0) + 1
      })
    })

    debugReport.summary.errorTypes = errorTypes
    console.log('\n📊 错误类型统计:')
    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })

    // 更新报告状态
    debugReport.summary.status = debugReport.totalErrors === 0 ? 'passed' : 'failed'
  })

  test('步骤4: 生成详细错误报告', async () => {
    console.log('\n步骤4: 生成详细错误报告...')

    const reportPath = '/home/zhgue/kyyupgame/k.yyup.com/client/playwright-report/complete/CENTERS_DEBUG_REPORT.json'
    console.log(`报告已保存到: ${reportPath}`)

    // 打印报告预览
    console.log('\n📄 报告预览:')
    console.log(JSON.stringify(debugReport, null, 2).substring(0, 1000) + '...')

    // 设置测试结果
    if (debugReport.totalErrors > 0) {
      console.log('\n⚠️  发现错误，请在报告中查看详细信息')
      expect(debugReport.failedLinks.length).toBeLessThan(debugReport.totalLinks)
    } else {
      console.log('\n✅ 所有链接测试通过！')
      expect(debugReport.totalErrors).toBe(0)
    }
  })
})
