import { Page, expect } from '@playwright/test'

export interface DebugMetrics {
  url: string
  title: string
  loadTime: number
  bodyLength: number
  isBlank: boolean
  consoleErrors: string[]
  pageErrors: string[]
  statusCode?: number
  responseTime: number
}

export interface LinkInfo {
  text: string
  href?: string
  selector: string
  className: string
  tagName: string
}

export interface DebugReport {
  role: string
  totalLinks: number
  linksTested: number
  successfulLinks: LinkInfo[]
  failedLinks: FailedLink[]
  totalErrors: number
  totalBlankPages: number
  duration: number
  summary: {
    status: string
    passRate: number
    errorTypes: Record<string, number>
  }
}

export interface FailedLink {
  link: LinkInfo
  url: string
  errors: string[]
  consoleErrors: string[]
  pageErrors: string[]
  isBlank: boolean
  metrics: DebugMetrics
}

/**
 * 通用的移动端页面调试工具类
 */
export class MobilePageDebugger {
  private page: Page
  private role: string
  private loginMethod: () => Promise<void>
  private report: DebugReport

  constructor(page: Page, role: 'teacher' | 'parent' | 'admin', loginMethod: () => Promise<void>) {
    this.page = page
    this.role = role
    this.loginMethod = loginMethod
    this.report = {
      role,
      totalLinks: 0,
      linksTested: 0,
      successfulLinks: [],
      failedLinks: [],
      totalErrors: 0,
      totalBlankPages: 0,
      duration: 0,
      summary: {
        status: 'pending',
        passRate: 0,
        errorTypes: {}
      }
    }
  }

  /**
   * 初始化测试：访问页面并登录
   */
  async initialize(url: string, expectedUrl?: RegExp): Promise<void> {
    console.log(`\n🔍 初始化 ${this.role} 角色测试...`)

    // 访问页面
    console.log(`  访问: ${url}`)
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(1000)

    // 执行登录
    console.log(`  以 ${this.role} 身份登录...`)
    await this.loginMethod()
    await this.page.waitForTimeout(2000)

    // 验证登录成功
    if (expectedUrl) {
      await expect(this.page).toHaveURL(expectedUrl)
      console.log(`  ✅ 成功进入预期页面: ${this.page.url()}`)
    }

    // 等待页面加载完成
    await this.page.waitForSelector('.van-tabbar, .van-cell, .van-grid', { timeout: 10000 })
    console.log(`  ✅ 页面加载完成`)
  }

  /**
   * 提取页面中所有可点击的链接
   */
  async extractLinks(): Promise<LinkInfo[]> {
    console.log(`\n🔗 提取页面链接...`)

    const links = await this.page.evaluate(() => {
      const extracted: Array<{ text: string; href?: string; selector: string; className: string; tagName: string }> = []

      // 查找 van-cell 类型的链接
      const cells = document.querySelectorAll('.van-cell')
      cells.forEach((cell, index) => {
        const linkElement = cell.querySelector('a') || cell
        extracted.push({
          text: cell.textContent?.trim() || '',
          href: linkElement.getAttribute('href') || undefined,
          selector: `.van-cell:nth-child(${index + 1})`,
          className: cell.className,
          tagName: cell.tagName
        })
      })

      // 查找 van-grid-item 类型的链接
      const gridItems = document.querySelectorAll('.van-grid-item')
      gridItems.forEach((item, index) => {
        const linkElement = item.querySelector('a') || item
        extracted.push({
          text: item.textContent?.trim() || '',
          href: linkElement.getAttribute('href') || undefined,
          selector: `.van-grid-item:nth-child(${index + 1})`,
          className: item.className,
          tagName: item.tagName
        })
      })

      // 查找底部导航链接
      const navItems = document.querySelectorAll('.van-tabbar-item')
      navItems.forEach((item, index) => {
        extracted.push({
          text: item.textContent?.trim() || '',
          href: undefined, // 底部导航通常是点击事件
          selector: `.van-tabbar-item:nth-child(${index + 1})`,
          className: item.className,
          tagName: item.tagName
        })
      })

      // 查找带 href 的 a 标签
      const anchors = document.querySelectorAll('a[href*="/mobile"]')
      anchors.forEach((link, index) => {
        extracted.push({
          text: link.textContent?.trim() || '',
          href: link.getAttribute('href') || undefined,
          selector: `a[href*="/mobile"]:nth-of-type(${index + 1})`,
          className: link.className,
          tagName: link.tagName
        })
      })

      return extracted
    })

    // 去重
    const uniqueLinks = links.filter((link, index, self) =>
      index === self.findIndex((l) =>
        l.selector === link.selector && l.text === link.text
      )
    )

    console.log(`  找到 ${uniqueLinks.length} 个可点击元素`)
    uniqueLinks.forEach((link, i) => {
      console.log(`    ${i + 1}. ${link.text.substring(0, 30)}${link.text.length > 30 ? '...' : ''}`)
    })

    this.report.totalLinks = uniqueLinks.length
    return uniqueLinks
  }

  /**
   * 测试单个链接，捕获错误和性能指标
   */
  async testLink(link: LinkInfo, baseUrl: string): Promise<FailedLink | null> {
    console.log(`\n  🔍 测试: ${link.text.substring(0, 40)}${link.text.length > 40 ? '...' : ''}`)

    const startTime = Date.now()
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    // 设置错误监听器
    const consoleHandler = (msg: any) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${msg.type()}] ${msg.text()}`)
      }
    }

    const errorHandler = (error: Error) => {
      pageErrors.push(error.message)
    }

    this.page.on('console', consoleHandler)
    this.page.on('pageerror', errorHandler)

    try {
      // 点击链接
      await this.page.click(link.selector, { timeout: 5000 })
      console.log(`    ✅ 点击成功`)

      // 等待页面加载
      await this.page.waitForLoadState('networkidle')
      await this.page.waitForTimeout(1000)

      // 获取页面指标
      const metrics = await this.collectMetrics(startTime)

      // 收集错误
      this.page.removeListener('console', consoleHandler)
      this.page.removeListener('pageerror', errorHandler)

      const allErrors = [...consoleErrors, ...pageErrors]

      if (allErrors.length > 0 || metrics.isBlank) {
        console.log(`    ❌ 发现问题: ${allErrors.length} 个错误, ${metrics.isBlank ? '空白页面' : '有内容'}`)

        this.report.totalErrors += allErrors.length
        if (metrics.isBlank) this.report.totalBlankPages++

        return {
          link,
          url: metrics.url,
          errors: allErrors,
          consoleErrors,
          pageErrors,
          isBlank: metrics.isBlank,
          metrics
        }
      } else {
        console.log(`    ✅ 正常访问`)
        this.report.successfulLinks.push(link)
        return null
      }
    } catch (error) {
      console.log(`    ❌ 测试失败: ${error.message}`)
      this.page.removeListener('console', consoleHandler)
      this.page.removeListener('pageerror', errorHandler)

      this.report.totalErrors++

      return {
        link,
        url: this.page.url(),
        errors: [error.message],
        consoleErrors,
        pageErrors,
        isBlank: false,
        metrics: {
          url: this.page.url(),
          title: '',
          loadTime: Date.now() - startTime,
          bodyLength: 0,
          isBlank: true,
          consoleErrors: [],
          pageErrors: [],
          responseTime: 0
        }
      }
    } finally {
      // 返回原页面
      await this.page.goto(baseUrl)
      await this.page.waitForLoadState('networkidle')
      await this.page.waitForTimeout(500)
      this.report.linksTested++
    }
  }

  /**
   * 收集页面性能指标
   */
  private async collectMetrics(startTime: number): Promise<DebugMetrics> {
    return await this.page.evaluate((loadStart) => {
      const loadTime = performance.now() - loadStart
      const bodyText = document.body.textContent || ''

      return {
        url: window.location.href,
        title: document.title,
        loadTime,
        bodyLength: bodyText.length,
        isBlank: bodyText.trim().length < 100,
        consoleErrors: [],
        pageErrors: [],
        responseTime: loadTime
      }
    }, startTime)
  }

  /**
   * 运行完整的页面调试测试
   */
  async runFullDebugTest(url: string): Promise<DebugReport> {
    const testStart = Date.now()

    try {
      // 初始化
      await this.initialize(url, new RegExp(`/mobile/${this.role}`))

      // 提取链接
      const links = await this.extractLinks()

      if (links.length === 0) {
        console.warn(`  ⚠️  未找到任何可点击链接`)
        this.report.summary.status = 'warning'
        return this.report
      }

      // 测试每个链接
      for (let i = 0; i < Math.min(links.length, 20); i++) {
        const link = links[i]
        const result = await this.testLink(link, url)

        if (result) {
          this.report.failedLinks.push(result)
        }

        // 每5个链接暂停一下，避免请求过快
        if ((i + 1) % 5 === 0) {
          await this.page.waitForTimeout(1000)
        }
      }

      // 生成报告
      this.report.duration = Date.now() - testStart
      this.report.summary.passRate = this.report.linksTested > 0
        ? ((this.report.linksTested - this.report.failedLinks.length) / this.report.linksTested) * 100
        : 0
      this.report.summary.status = this.report.failedLinks.length === 0 ? 'passed' : 'failed'

      // 统计错误类型
      const errorTypes: Record<string, number> = {}
      for (const failed of this.report.failedLinks) {
        for (const error of failed.errors) {
          if (error.includes('404')) errorTypes['404错误'] = (errorTypes['404错误'] || 0) + 1
          else if (error.includes('500')) errorTypes['500错误'] = (errorTypes['500错误'] || 0) + 1
          else if (error.includes('Cannot find')) errorTypes['组件缺失'] = (errorTypes['组件缺失'] || 0) + 1
          else if (error.includes('undefined')) errorTypes['未定义错误'] = (errorTypes['未定义错误'] || 0) + 1
          else if (error.includes('Timeout')) errorTypes['超时错误'] = (errorTypes['超时错误'] || 0) + 1
          else errorTypes['其他错误'] = (errorTypes['其他错误'] || 0) + 1
        }
      }
      this.report.summary.errorTypes = errorTypes

      return this.report
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`)
      this.report.summary.status = 'error'
      return this.report
    }
  }

  /**
   * 打印调试报告
   */
  printReport(): void {
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log(`   ${this.role.toUpperCase()} 中心调试报告`)
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`总链接数: ${this.report.totalLinks}`)
    console.log(`已测试: ${this.report.linksTested}`)
    console.log(`失败数: ${this.report.failedLinks.length}`)
    console.log(`空白页: ${this.report.totalBlankPages}`)
    console.log(`通过率: ${this.report.summary.passRate.toFixed(1)}%`)
    console.log(`状态: ${this.report.summary.status}`)
    console.log('═══════════════════════════════════════════════════════════')

    if (this.report.failedLinks.length > 0) {
      console.log('\n❌ 失败的链接:')
      this.report.failedLinks.forEach((failed, i) => {
        console.log(`\n${i + 1}. ${failed.link.text}`)
        console.log(`   URL: ${failed.url}`)
        console.log(`   错误数: ${failed.errors.length}`)
        console.log(`   空白页: ${failed.isBlank ? '是' : '否'}`)
        console.log('   错误详情:')
        failed.errors.forEach(err => console.log(`     - ${err}`))
      })
    }

    if (Object.keys(this.report.summary.errorTypes).length > 0) {
      console.log('\n📊 错误类型统计:')
      Object.entries(this.report.summary.errorTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`)
      })
    }
  }

  /**
   * 保存报告到文件
   */
  async saveReport(): Promise<void> {
    const fs = require('fs')
    const path = require('path')

    const reportPath = path.join(
      __dirname,
      `../../playwright-report/complete/${this.role.toUpperCase()}_DEBUG_REPORT.json`
    )
    const reportDir = path.dirname(reportPath)

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2))
    console.log(`\n📄 报告已保存到: ${reportPath}`)
  }
}
