/**
 * 自动化按钮扫描工具
 *
 * 用于扫描页面中的所有按钮元素并生成测试报告
 */

import { Page } from 'playwright'

interface ButtonElement {
  selector: string
  index: number
  isVisible: boolean
  isEnabled: boolean
  textContent: string
  testId: string | null
  className: string
  buttonType: string | null
  hasTestId: boolean
  hasClickHandler: boolean
  category: string
  role: string
  ariaLabel: string | null
  title: string | null
  href: string | null
  formAction: string | null
  parentContext: string
  siblings: number
  children: number
}

interface ScanReport {
  total: number
  visible: number
  enabled: number
  withTestId: number
  withClickHandler: number
  withAriaLabel: number
  categories: Record<string, number>
  buttons: ButtonElement[]
  issues: string[]
  recommendations: string[]
}

export class ButtonScanner {
  private page: Page
  private buttonPatterns: string[]
  private categories: Record<string, string[]>

  constructor(page: Page) {
    this.page = page
    this.buttonPatterns = [
      // Element Plus 按钮组件
      '.el-button',
      '.el-button-group .el-button',

      // 原生按钮元素
      'button[type="button"]',
      'button[type="submit"]',
      'button[type="reset"]',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',

      // 带有特定属性的按钮
      '[role="button"]',
      '[data-testid*="btn"]',
      '[data-testid*="button"]',
      '[onclick]',
      '@click',

      // 通用按钮类
      '.btn',
      '.btn-primary',
      '.btn-secondary',
      '.btn-success',
      '.btn-warning',
      '.btn-danger',
      '.btn-info',

      // 链接按钮
      'a[href][role="button"]',
      '.link-button',
      '.action-link',

      // 特定功能按钮
      '[data-testid*="add"]',
      '[data-testid*="edit"]',
      '[data-testid*="delete"]',
      '[data-testid*="save"]',
      '[data-testid*="submit"]',
      '[data-testid*="cancel"]',
      '[data-testid*="search"]',
      '[data-testid*="filter"]',
      '[data-testid*="export"]',
      '[data-testid*="import"]',
      '[data-testid*="refresh"]',
      '[data-testid*="login"]',
      '[data-testid*="logout"]'
    ]

    this.categories = {
      '数据操作': ['add', 'create', 'new', 'edit', 'update', 'modify', 'delete', 'remove', 'save', 'submit', 'confirm'],
      '查询过滤': ['search', 'filter', 'advanced-search', 'clear-filter', 'reset-filter'],
      '数据处理': ['export', 'import', 'download', 'upload', 'sync', 'refresh', 'reload', 'backup', 'restore'],
      '业务流程': ['approve', 'reject', 'submit-approval', 'publish', 'unpublish', 'activate', 'deactivate'],
      '导航操作': ['nav', 'menu', 'tab', 'link', 'back', 'next', 'previous', 'home', 'dashboard'],
      '认证安全': ['login', 'logout', 'register', 'signup', 'forgot-password', 'change-password', 'verify'],
      '表单控制': ['form-submit', 'form-reset', 'form-cancel', 'form-save', 'step-next', 'step-previous'],
      '快捷操作': ['quick', 'shortcut', 'favorite', 'bookmark', 'share', 'copy', 'print', 'preview']
    }
  }

  /**
   * 扫描页面中的所有按钮元素
   */
  async scanAllButtons(): Promise<ScanReport> {
    console.log('🔍 开始扫描页面按钮元素...')

    const allButtons: ButtonElement[] = []
    const processedSelectors = new Set<string>()

    // 扫描所有按钮模式
    for (const pattern of this.buttonPatterns) {
      try {
        const elements = await this.page.locator(pattern).all()

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]
          const buttonInfo = await this.analyzeButton(element, pattern, i)

          // 避免重复元素
          const uniqueKey = `${buttonInfo.testId || buttonInfo.textContent}-${buttonInfo.parentContext}`
          if (!processedSelectors.has(uniqueKey)) {
            processedSelectors.add(uniqueKey)
            allButtons.push(buttonInfo)
          }
        }
      } catch (error) {
        // 忽略无效选择器
      }
    }

    // 生成报告
    const report = this.generateReport(allButtons)
    console.log(`✅ 扫描完成，发现 ${report.total} 个按钮元素`)

    return report
  }

  /**
   * 分析单个按钮元素
   */
  private async analyzeButton(element: any, selector: string, index: number): Promise<ButtonElement> {
    const isVisible = await element.isVisible().catch(() => false)
    const isEnabled = await element.isEnabled().catch(() => true)
    const textContent = await element.textContent().catch(() => '') || ''
    const testId = await element.getAttribute('data-testid').catch(() => null)
    const className = await element.getAttribute('class').catch(() => '')
    const buttonType = await element.getAttribute('type').catch(() => null)
    const role = await element.getAttribute('role').catch(() => '') || 'button'
    const ariaLabel = await element.getAttribute('aria-label').catch(() => null)
    const title = await element.getAttribute('title').catch(() => null)
    const href = await element.getAttribute('href').catch(() => null)
    const formAction = await element.getAttribute('formaction').catch(() => null)

    // 检查是否有点击处理器
    const hasClickHandler = await element.evaluate((el: any) => {
      return !!(el.onclick ||
                el.getAttribute('@click') ||
                el.getAttribute('v-on:click') ||
                el.getAttribute('data-testid')?.includes('btn') ||
                el.classList.contains('el-button') ||
                el.tagName.toLowerCase() === 'button')
    }).catch(() => false)

    // 获取父级上下文
    const parentContext = await element.evaluate((el: any) => {
      const parent = el.parentElement
      return parent ? `${parent.tagName.toLowerCase()}.${parent.className.split(' ').join('.')}` : 'no-parent'
    }).catch(() => 'unknown')

    // 获取兄弟和子元素数量
    const siblings = await element.evaluate((el: any) => {
      const parent = el.parentElement
      return parent ? parent.children.length : 0
    }).catch(() => 0)

    const children = await element.evaluate((el: any) => el.children.length).catch(() => 0)

    // 确定按钮类别
    const category = this.categorizeButton(testId, textContent, className)

    return {
      selector,
      index,
      isVisible,
      isEnabled,
      textContent: textContent.trim(),
      testId,
      className,
      buttonType,
      hasTestId: !!testId,
      hasClickHandler,
      category,
      role,
      ariaLabel,
      title,
      href,
      formAction,
      parentContext,
      siblings,
      children
    }
  }

  /**
   * 对按钮进行分类
   */
  private categorizeButton(testId: string | null, textContent: string, className: string): string {
    const content = (testId + textContent + className).toLowerCase()

    for (const [category, keywords] of Object.entries(this.categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category
      }
    }

    // 特殊分类逻辑
    if (content.includes('cancel') || content.includes('close') || content.includes('back')) {
      return '取消关闭'
    }
    if (content.includes('el-button--primary')) {
      return '主要按钮'
    }
    if (content.includes('el-button--success')) {
      return '成功按钮'
    }
    if (content.includes('el-button--warning')) {
      return '警告按钮'
    }
    if (content.includes('el-button--danger')) {
      return '危险按钮'
    }

    return '其他按钮'
  }

  /**
   * 生成扫描报告
   */
  private generateReport(buttons: ButtonElement[]): ScanReport {
    const total = buttons.length
    const visible = buttons.filter(b => b.isVisible).length
    const enabled = buttons.filter(b => b.isEnabled).length
    const withTestId = buttons.filter(b => b.hasTestId).length
    const withClickHandler = buttons.filter(b => b.hasClickHandler).length
    const withAriaLabel = buttons.filter(b => b.ariaLabel || b.title).length

    // 按类别统计
    const categories: Record<string, number> = {}
    buttons.forEach(button => {
      categories[button.category] = (categories[button.category] || 0) + 1
    })

    // 生成问题列表
    const issues = this.identifyIssues(buttons)

    // 生成建议
    const recommendations = this.generateRecommendations(buttons, issues)

    return {
      total,
      visible,
      enabled,
      withTestId,
      withClickHandler,
      withAriaLabel,
      categories,
      buttons,
      issues,
      recommendations
    }
  }

  /**
   * 识别按钮元素的问题
   */
  private identifyIssues(buttons: ButtonElement[]): string[] {
    const issues: string[] = []

    // 检查测试ID覆盖率
    const testIdCoverage = (buttons.filter(b => b.hasTestId).length / buttons.length) * 100
    if (testIdCoverage < 80) {
      issues.push(`测试ID覆盖率过低: ${testIdCoverage.toFixed(1)}% (建议 ≥80%)`)
    }

    // 检查可访问性
    const accessibilityCoverage = (buttons.filter(b => b.ariaLabel || b.title || b.textContent.trim()).length / buttons.length) * 100
    if (accessibilityCoverage < 90) {
      issues.push(`可访问性标签覆盖率过低: ${accessibilityCoverage.toFixed(1)}% (建议 ≥90%)`)
    }

    // 检查可见按钮的比例
    const visibilityRate = (buttons.filter(b => b.isVisible).length / buttons.length) * 100
    if (visibilityRate < 60) {
      issues.push(`可见按钮比例过低: ${visibilityRate.toFixed(1)}% (建议 ≥60%)`)
    }

    // 检查没有文本或标签的按钮
    const buttonsWithoutLabel = buttons.filter(b => !b.textContent.trim() && !b.ariaLabel && !b.title && !b.testId)
    if (buttonsWithoutLabel.length > 0) {
      issues.push(`发现 ${buttonsWithoutLabel.length} 个没有可访问标签的按钮`)
    }

    // 检查可能重复的按钮
    const buttonGroups = buttons.reduce((groups, button) => {
      const key = `${button.textContent.trim()}-${button.parentContext}`
      groups[key] = (groups[key] || 0) + 1
      return groups
    }, {} as Record<string, number>)

    const duplicates = Object.entries(buttonGroups).filter(([_, count]) => count > 1)
    if (duplicates.length > 0) {
      issues.push(`发现 ${duplicates.length} 组可能重复的按钮`)
    }

    return issues
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(buttons: ButtonElement[], issues: string[]): string[] {
    const recommendations: string[] = []

    if (issues.some(issue => issue.includes('测试ID覆盖率'))) {
      recommendations.push('为按钮添加 data-testid 属性，提高测试可维护性')
    }

    if (issues.some(issue => issue.includes('可访问性标签'))) {
      recommendations.push('为图标按钮添加 aria-label 或 title 属性，提高可访问性')
    }

    if (issues.some(issue => issue.includes('可见按钮比例'))) {
      recommendations.push('检查隐藏按钮的必要性，考虑移除不需要的按钮')
    }

    // 检查按钮命名规范
    const inconsistentNaming = buttons.filter(b =>
      b.hasTestId && !b.testId!.match(/^[a-z][a-z0-9-]*-btn$/)
    )
    if (inconsistentNaming.length > 0) {
      recommendations.push('统一按钮 data-testid 命名规范，建议使用 "[功能]-btn" 格式')
    }

    // 检查按钮类型使用
    const inputButtons = buttons.filter(b => b.buttonType === 'submit' || b.buttonType === 'reset')
    if (inputButtons.length > buttons.length * 0.3) {
      recommendations.push('考虑使用 <button> 元素替代 <input type="button">，提供更好的灵活性')
    }

    // 检查Element Plus按钮一致性
    const elButtons = buttons.filter(b => b.className.includes('el-button'))
    const inconsistentTypes = elButtons.filter(b =>
      !b.className.includes('el-button--primary') &&
      !b.className.includes('el-button--success') &&
      !b.className.includes('el-button--warning') &&
      !b.className.includes('el-button--danger') &&
      !b.className.includes('el-button--info')
    )
    if (inconsistentTypes.length > elButtons.length * 0.2) {
      recommendations.push('为Element Plus按钮明确指定类型，提高UI一致性')
    }

    return recommendations
  }

  /**
   * 打印扫描报告
   */
  printReport(report: ScanReport): void {
    console.log('\n📊 ===== 按钮扫描报告 =====')

    console.log(`\n📈 基本统计:`)
    console.log(`  总按钮数: ${report.total}`)
    console.log(`  可见按钮: ${report.visible} (${(report.visible/report.total*100).toFixed(1)}%)`)
    console.log(`  启用按钮: ${report.enabled} (${(report.enabled/report.total*100).toFixed(1)}%)`)
    console.log(`  有测试ID: ${report.withTestId} (${(report.withTestId/report.total*100).toFixed(1)}%)`)
    console.log(`  有点击处理器: ${report.withClickHandler} (${(report.withClickHandler/report.total*100).toFixed(1)}%)`)
    console.log(`  有可访问标签: ${report.withAriaLabel} (${(report.withAriaLabel/report.total*100).toFixed(1)}%)`)

    console.log(`\n🏷️ 按钮分类:`)
    Object.entries(report.categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })

    if (report.issues.length > 0) {
      console.log(`\n⚠️ 发现的问题:`)
      report.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`)
      })
    }

    if (report.recommendations.length > 0) {
      console.log(`\n💡 改进建议:`)
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`)
      })
    }

    console.log(`\n📋 详细按钮列表:`)
    report.buttons.slice(0, 10).forEach((button, index) => {
      console.log(`  ${index + 1}. [${button.category}] ${button.textContent || '(无文本)'} - ${button.testId || '(无testId)'} - ${button.isVisible ? '可见' : '隐藏'}`)
    })

    if (report.buttons.length > 10) {
      console.log(`  ... 还有 ${report.buttons.length - 10} 个按钮`)
    }

    console.log('\n========================\n')
  }

  /**
   * 生成测试用例建议
   */
  generateTestCaseSuggestions(report: ScanReport): string[] {
    const suggestions: string[] = []

    // 为每个类别生成测试建议
    Object.entries(report.categories).forEach(([category, count]) => {
      if (count > 0) {
        suggestions.push(`创建 ${category} 类别的专项测试，覆盖 ${count} 个按钮`)
      }
    })

    // 为不同状态生成测试建议
    const disabledButtons = report.buttons.filter(b => !b.isEnabled)
    if (disabledButtons.length > 0) {
      suggestions.push(`测试 ${disabledButtons.length} 个禁用按钮的状态和行为`)
    }

    const hiddenButtons = report.buttons.filter(b => !b.isVisible)
    if (hiddenButtons.length > 0) {
      suggestions.push(`验证 ${hiddenButtons.length} 个隐藏按钮的显示逻辑`)
    }

    // 为重要按钮生成测试建议
    const importantButtons = report.buttons.filter(b =>
      b.className.includes('el-button--primary') ||
      b.textContent.includes('提交') ||
      b.textContent.includes('保存') ||
      b.textContent.includes('删除')
    )
    if (importantButtons.length > 0) {
      suggestions.push(`为 ${importantButtons.length} 个重要按钮创建详细的功能测试`)
    }

    return suggestions
  }
}

export default ButtonScanner