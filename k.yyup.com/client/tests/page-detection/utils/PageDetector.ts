import { Page, Locator, expect } from '@playwright/test'

export interface PageTestResult {
  pagePath: string
  pageName: string
  status: 'success' | 'warning' | 'error'
  issues: string[]
  screenshots: string[]
  performance: {
    loadTime: number
    firstContentfulPaint?: number
    largestContentfulPaint?: number
  }
  elements: {
    buttons: number
    forms: number
    inputs: number
    links: number
  }
  errors: string[]
  timestamp: string
}

export class PageDetector {
  private page: Page
  private results: PageTestResult[] = []
  private reportsDir: string

  constructor(page: Page) {
    this.page = page
    this.reportsDir = './tests/page-detection/reports'
    this.ensureReportsDir()
  }

  private async ensureReportsDir() {
    const fs = await import('fs')
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true })
    }
  }

  /**
   * 登录系统
   */
  async login(username: string = 'admin', password: string = '123456') {
    console.log(`🔐 登录用户: ${username}`)
    
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
    
    // 查找登录表单
    const usernameInput = this.page.locator('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]')
    const passwordInput = this.page.locator('input[placeholder*="密码"], input[name="password"]')
    const loginButton = this.page.locator('button:has-text("登录"), button[type="submit"]')
    
    await usernameInput.fill(username)
    await passwordInput.fill(password)
    await loginButton.click()
    
    // 等待登录成功
    await this.page.waitForURL('**/dashboard', { timeout: 10000 })
    console.log('✅ 登录成功')
  }

  /**
   * 检测单个页面
   */
  async detectPage(pagePath: string, pageName: string): Promise<PageTestResult> {
    console.log(`🔍 检测页面: ${pageName} (${pagePath})`)
    
    const startTime = Date.now()
    const result: PageTestResult = {
      pagePath,
      pageName,
      status: 'success',
      issues: [],
      screenshots: [],
      performance: { loadTime: 0 },
      elements: { buttons: 0, forms: 0, inputs: 0, links: 0 },
      errors: [],
      timestamp: new Date().toISOString()
    }

    try {
      // 导航到页面
      await this.page.goto(pagePath, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      result.performance.loadTime = Date.now() - startTime

      // 截图
      const screenshotPath = `${this.reportsDir}/screenshot-${pageName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`
      await this.page.screenshot({ path: screenshotPath, fullPage: true })
      result.screenshots.push(screenshotPath)

      // 检查基本页面加载
      await this.checkPageLoad(result)
      
      // 检查UI元素
      await this.checkUIElements(result)
      
      // 检查交互功能
      await this.checkInteractivity(result)
      
      // 检查性能指标
      await this.checkPerformance(result)
      
      // 检查控制台错误
      await this.checkConsoleErrors(result)

      console.log(`✅ 页面检测完成: ${pageName} - ${result.status}`)

    } catch (error) {
      result.status = 'error'
      result.errors.push(`页面检测失败: ${error.message}`)
      console.log(`❌ 页面检测失败: ${pageName} - ${error.message}`)
    }

    this.results.push(result)
    return result
  }

  /**
   * 检查页面基本加载
   */
  private async checkPageLoad(result: PageTestResult) {
    // 检查页面标题
    const title = await this.page.title()
    if (!title || title.includes('404') || title.includes('Error')) {
      result.issues.push(`页面标题异常: ${title}`)
      result.status = 'warning'
    }

    // 检查是否有加载指示器持续显示
    const loadingElements = this.page.locator('.loading, .spinner, [loading]')
    const loadingCount = await loadingElements.count()
    if (loadingCount > 0) {
      result.issues.push(`页面存在未消失的加载指示器: ${loadingCount}个`)
      result.status = 'warning'
    }

    // 检查空状态页面
    const emptyStates = this.page.locator('.empty, .no-data, .empty-state')
    const emptyCount = await emptyStates.count()
    if (emptyCount > 0) {
      result.issues.push(`页面存在空状态组件: ${emptyCount}个`)
    }
  }

  /**
   * 检查UI元素
   */
  private async checkUIElements(result: PageTestResult) {
    // 统计各类元素
    result.elements.buttons = await this.page.locator('button').count()
    result.elements.forms = await this.page.locator('form').count()  
    result.elements.inputs = await this.page.locator('input').count()
    result.elements.links = await this.page.locator('a').count()

    // 检查无效按钮
    const disabledButtons = await this.page.locator('button:disabled').count()
    if (disabledButtons > result.elements.buttons / 2) {
      result.issues.push(`大量按钮被禁用: ${disabledButtons}/${result.elements.buttons}`)
    }

    // 检查表单验证
    if (result.elements.forms > 0) {
      const invalidInputs = await this.page.locator('input:invalid').count()
      if (invalidInputs > 0) {
        result.issues.push(`表单存在无效输入: ${invalidInputs}个`)
      }
    }
  }

  /**
   * 检查交互功能
   */
  private async checkInteractivity(result: PageTestResult) {
    try {
      // 测试第一个可点击按钮
      const firstButton = this.page.locator('button:not(:disabled)').first()
      if (await firstButton.count() > 0) {
        await firstButton.hover()
        // 不实际点击以免影响页面状态
      }

      // 检查下拉菜单
      const dropdowns = this.page.locator('.el-dropdown, .dropdown, select')
      const dropdownCount = await dropdowns.count()
      if (dropdownCount > 0) {
        result.issues.push(`页面包含${dropdownCount}个下拉菜单`)
      }

      // 检查模态框触发器
      const modalTriggers = this.page.locator('[data-modal], .modal-trigger, button:has-text("添加"), button:has-text("新建")')
      const modalCount = await modalTriggers.count()
      if (modalCount > 0) {
        result.issues.push(`页面包含${modalCount}个可能的模态框触发器`)
      }

    } catch (error) {
      result.issues.push(`交互功能检测失败: ${error.message}`)
    }
  }

  /**
   * 检查性能指标
   */
  private async checkPerformance(result: PageTestResult) {
    try {
      // 获取性能指标
      const perfMetrics = await this.page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart
        }
      })

      if (result.performance.loadTime > 5000) {
        result.issues.push(`页面加载时间过长: ${result.performance.loadTime}ms`)
        result.status = 'warning'
      }

    } catch (error) {
      result.issues.push(`性能指标获取失败: ${error.message}`)
    }
  }

  /**
   * 检查控制台错误
   */
  private async checkConsoleErrors(result: PageTestResult) {
    // 监听控制台消息（在页面导航前设置）
    const consoleErrors: string[] = []
    
    this.page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    if (consoleErrors.length > 0) {
      result.errors = consoleErrors
      result.status = 'warning'
      result.issues.push(`控制台错误: ${consoleErrors.length}个`)
    }
  }

  /**
   * 批量检测页面列表
   */
  async detectPages(pages: Array<{path: string, name: string}>): Promise<PageTestResult[]> {
    console.log(`🔍 开始批量检测 ${pages.length} 个页面...`)
    
    const batchResults: PageTestResult[] = []
    
    for (let i = 0; i < pages.length; i++) {
      const { path, name } = pages[i]
      console.log(`[${i + 1}/${pages.length}] 检测页面: ${name}`)
      
      const result = await this.detectPage(path, name)
      batchResults.push(result)
      
      // 短暂延迟避免过快请求
      await this.page.waitForTimeout(1000)
    }
    
    return batchResults
  }

  /**
   * 生成测试报告
   */
  async generateReport(): Promise<string> {
    const fs = await import('fs')
    const path = await import('path')
    const reportPath = path.join(this.reportsDir, `page-detection-report-${Date.now()}.json`)
    
    const report = {
      summary: {
        total: this.results.length,
        success: this.results.filter(r => r.status === 'success').length,
        warning: this.results.filter(r => r.status === 'warning').length,
        error: this.results.filter(r => r.status === 'error').length,
        timestamp: new Date().toISOString()
      },
      results: this.results
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📊 测试报告已生成: ${reportPath}`)
    
    return reportPath
  }

  /**
   * 生成Markdown报告
   */
  async generateMarkdownReport(): Promise<string> {
    const fs = await import('fs')
    const path = await import('path')
    const reportPath = path.join(this.reportsDir, `page-detection-report-${Date.now()}.md`)
    
    let markdown = `# Playwright页面检测报告\n\n`
    markdown += `**生成时间**: ${new Date().toISOString()}\n\n`
    
    // 摘要
    const total = this.results.length
    const success = this.results.filter(r => r.status === 'success').length
    const warning = this.results.filter(r => r.status === 'warning').length
    const error = this.results.filter(r => r.status === 'error').length
    
    markdown += `## 📊 检测摘要\n\n`
    markdown += `| 状态 | 数量 | 占比 |\n`
    markdown += `|------|------|------|\n`
    markdown += `| ✅ 成功 | ${success} | ${(success/total*100).toFixed(1)}% |\n`
    markdown += `| ⚠️ 警告 | ${warning} | ${(warning/total*100).toFixed(1)}% |\n`
    markdown += `| ❌ 错误 | ${error} | ${(error/total*100).toFixed(1)}% |\n`
    markdown += `| 📊 总计 | ${total} | 100% |\n\n`
    
    // 详细结果
    markdown += `## 📋 详细检测结果\n\n`
    
    this.results.forEach((result, index) => {
      const statusIcon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
      markdown += `### ${index + 1}. ${statusIcon} ${result.pageName}\n\n`
      markdown += `**路径**: ${result.pagePath}\n`
      markdown += `**状态**: ${result.status}\n`
      markdown += `**加载时间**: ${result.performance.loadTime}ms\n`
      markdown += `**检测时间**: ${result.timestamp}\n\n`
      
      if (result.elements) {
        markdown += `**页面元素统计**:\n`
        markdown += `- 按钮: ${result.elements.buttons}个\n`
        markdown += `- 表单: ${result.elements.forms}个\n`
        markdown += `- 输入框: ${result.elements.inputs}个\n`
        markdown += `- 链接: ${result.elements.links}个\n\n`
      }
      
      if (result.issues.length > 0) {
        markdown += `**发现的问题**:\n`
        result.issues.forEach(issue => {
          markdown += `- ${issue}\n`
        })
        markdown += `\n`
      }
      
      if (result.errors.length > 0) {
        markdown += `**错误信息**:\n`
        result.errors.forEach(error => {
          markdown += `- ${error}\n`
        })
        markdown += `\n`
      }
      
      markdown += `---\n\n`
    })
    
    fs.writeFileSync(reportPath, markdown)
    console.log(`📝 Markdown报告已生成: ${reportPath}`)
    
    return reportPath
  }
}