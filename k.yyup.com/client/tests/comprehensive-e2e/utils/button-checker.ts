/**
 * 按钮检测器
 * 检测页面上所有按钮的可点击性问题
 */

import type { Page, Locator } from 'playwright'

export interface ButtonIssue {
  type: 'disabled' | 'noSize' | 'noEvent' | 'hidden' | 'blocked' | 'noText'
  selector: string
  text?: string
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}

export interface ButtonCheckResult {
  totalButtons: number
  issues: ButtonIssue[]
  summary: {
    disabled: number
    noSize: number
    noEvent: number
    hidden: number
    blocked: number
    noText: number
  }
}

/**
 * 按钮检测器类
 */
export class ButtonChecker {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * 检测页面上所有按钮
   */
  async checkAllButtons(): Promise<ButtonCheckResult> {
    const issues: ButtonIssue[] = []

    console.log('  → 开始检测按钮...')

    // 获取所有按钮元素
    const buttonSelectors = [
      'button:not([disabled])',
      '.el-button:not(.is-disabled)',
      '[role="button"]:not([aria-disabled="true"])',
      '.btn:not(.disabled)',
      'a[href]:not([href=""])'
    ]

    const allButtons: Locator[] = []
    for (const selector of buttonSelectors) {
      try {
        const buttons = await this.page.locator(selector).all()
        allButtons.push(...buttons)
      } catch {
        continue
      }
    }

    // 去重（使用元素引用）
    const uniqueButtons = await this.deduplicateButtons(allButtons)

    console.log(`  → 找到 ${uniqueButtons.length} 个按钮`)

    // 检查每个按钮
    for (let i = 0; i < uniqueButtons.length; i++) {
      const button = uniqueButtons[i]
      try {
        const buttonIssues = await this.checkButton(button, i)
        issues.push(...buttonIssues)
      } catch (error) {
        console.error(`    ✗ 检测按钮 ${i} 时出错:`, error)
      }
    }

    // 生成汇总
    const summary = {
      disabled: issues.filter(i => i.type === 'disabled').length,
      noSize: issues.filter(i => i.type === 'noSize').length,
      noEvent: issues.filter(i => i.type === 'noEvent').length,
      hidden: issues.filter(i => i.type === 'hidden').length,
      blocked: issues.filter(i => i.type === 'blocked').length,
      noText: issues.filter(i => i.type === 'noText').length
    }

    const totalIssues = Object.values(summary).reduce((a, b) => a + b, 0)
    console.log(`  → 检测完成: 发现 ${totalIssues} 个问题`)

    return {
      totalButtons: uniqueButtons.length,
      issues,
      summary
    }
  }

  /**
   * 检查单个按钮
   */
  async checkButton(button: Locator, index: number): Promise<ButtonIssue[]> {
    const issues: ButtonIssue[] = []

    try {
      // 获取按钮基本信息
      const isVisible = await button.isVisible().catch(() => false)
      const isEnabled = await button.isEnabled().catch(() => false)

      // 获取文本内容
      const text = await button.textContent().catch(() => '')
      const boundingBox = await button.boundingBox().catch(() => null)

      // 获取选择器
      const selector = `button:nth-of-type(${index + 1})`

      // 1. 检查是否不可见
      if (!isVisible) {
        issues.push({
          type: 'hidden',
          selector,
          text: text || undefined,
          position: boundingBox ? { x: boundingBox.x, y: boundingBox.y } : undefined
        })
      }

      // 2. 检查是否禁用
      if (!isEnabled) {
        issues.push({
          type: 'disabled',
          selector,
          text: text || undefined
        })
      }

      // 3. 检查尺寸
      if (boundingBox && (boundingBox.width === 0 || boundingBox.height === 0)) {
        issues.push({
          type: 'noSize',
          selector,
          text: text || undefined,
          size: { width: boundingBox.width, height: boundingBox.height }
        })
      }

      // 4. 检查是否有文本内容
      if (!text || text.trim().length === 0) {
        // 检查是否有图标
        const hasIcon = await button.locator('svg, i, .icon, [class*="icon"]').count().catch(() => 0) > 0
        if (!hasIcon) {
          issues.push({
            type: 'noText',
            selector,
            text: ''
          })
        }
      }

      // 5. 检查是否被其他元素遮挡
      if (isVisible && boundingBox) {
        const isBlocked = await this.isButtonBlocked(button, boundingBox)
        if (isBlocked) {
          issues.push({
            type: 'blocked',
            selector,
            text: text || undefined,
            position: { x: boundingBox.x, y: boundingBox.y }
          })
        }
      }

      // 6. 检查是否有事件监听器
      const hasEvent = await this.buttonHasEvent(button)
      if (!hasEvent && isVisible && isEnabled) {
        issues.push({
          type: 'noEvent',
          selector,
          text: text || undefined
        })
      }
    } catch (error) {
      console.error(`    检查按钮时出错:`, error)
    }

    return issues
  }

  /**
   * 检查按钮是否被遮挡
   */
  private async isButtonBlocked(button: Locator, box: { x: number; y: number; width: number; height: number }): Promise<boolean> {
    try {
      // 检查按钮中心点是否可点击
      const centerX = box.x + box.width / 2
      const centerY = box.y + box.height / 2

      // 获取中心点位置的元素
      const elementAtPoint = await this.page.evaluate(
        ({ x, y }) => {
          const element = document.elementFromPoint(x, y)
          return element?.tagName?.toLowerCase()
        },
        { x: centerX, y: centerY }
      )

      // 如果中心点位置的元素不是按钮，可能被遮挡
      const buttonTag = await button.evaluate(el => el.tagName.toLowerCase())
      return elementAtPoint !== buttonTag && elementAtPoint !== 'a' && elementAtPoint !== 'span'
    } catch {
      return false
    }
  }

  /**
   * 检查按钮是否有事件监听器
   */
  private async buttonHasEvent(button: Locator): Promise<boolean> {
    try {
      const hasClickHandler = await button.evaluate(el => {
        // 检查onclick属性
        if ('onclick' in el && (el as any).onclick) {
          return true
        }

        // 检查Vue的事件监听
        const hasVueEvent = '__vueParentComponent' in el || '__VUE__' in el
        if (hasVueEvent) {
          return true
        }

        // 检查是否有常见的点击类名
        const className = el.className || ''
        if (
          className.includes('click') ||
          className.includes('btn') ||
          el.getAttribute('role') === 'button' ||
          el.tagName === 'BUTTON' ||
          el.tagName === 'A'
        ) {
          return true
        }

        return false
      })

      return hasClickHandler
    } catch {
      return true // 假设有事件，避免误报
    }
  }

  /**
   * 去重按钮列表
   */
  private async deduplicateButtons(buttons: Locator[]): Promise<Locator[]> {
    // 简单去重：使用选择器
    const seen = new Set<string>()
    const unique: Locator[] = []

    for (const button of buttons) {
      try {
        // 尝试获取唯一标识
        const id = await button.evaluate(el => {
          return (
            el.id ||
            el.getAttribute('data-id') ||
            el.getAttribute('data-testid') ||
            `${el.tagName}-${el.textContent?.slice(0, 20)}`
          )
        })

        if (!seen.has(id)) {
          seen.add(id)
          unique.push(button)
        }
      } catch {
        // 如果无法获取ID，仍然添加
        unique.push(button)
      }
    }

    return unique
  }

  /**
   * 获取特定类型的按钮问题
   */
  async getIssuesByType(type: ButtonIssue['type']): Promise<ButtonIssue[]> {
    const result = await this.checkAllButtons()
    return result.issues.filter(issue => issue.type === type)
  }

  /**
   * 打印按钮问题报告
   */
  printReport(result: ButtonCheckResult): void {
    console.log('\n  📊 按钮检测报告:')
    console.log(`  总按钮数: ${result.totalButtons}`)
    console.log(`  发现问题: ${result.issues.length}`)
    console.log('  ──────────────────────────────────')

    if (result.issues.length > 0) {
      console.log('  问题详情:')
      for (const issue of result.issues) {
        const emoji = {
          disabled: '🔒',
          noSize: '📏',
          noEvent: '⚡',
          hidden: '👁️',
          blocked: '🚫',
          noText: '📝'
        }[issue.type]

        console.log(`    ${emoji} ${issue.type}: "${issue.text || issue.selector}"`)
      }
    } else {
      console.log('  ✓ 未发现按钮问题')
    }
    console.log()
  }
}

/**
 * 创建按钮检测器实例
 */
export function createButtonChecker(page: Page): ButtonChecker {
  return new ButtonChecker(page)
}
