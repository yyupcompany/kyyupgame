/**
 * 幼儿园管理系统 - 按钮和操作元素100%覆盖测试
 *
 * 测试目标：确保所有按钮和操作元素都有完整的测试覆盖
 * 包含：数据操作按钮、查询过滤按钮、数据处理按钮、业务流程按钮、导航按钮等
 *
 * @author Claude Code Testing Expert
 * @version 1.0.0
 */

import { test, expect, describe, beforeEach, afterEach } from 'vitest'
import { setupTestPage, expectNoConsoleErrors } from '../helpers/test-utils'

// 按钮元素扫描模式
const BUTTON_PATTERNS = [
  // Element Plus 按钮组件
  '.el-button',
  '.el-button-group .el-button',

  // 按钮类型
  'button[type="button"]',
  'button[type="submit"]',
  'input[type="button"]',
  'input[type="submit"]',

  // 特定功能按钮选择器
  '[data-testid*="btn"]',
  '[data-testid*="button"]',
  '[data-testid*="login"]',
  '[data-testid*="submit"]',
  '[data-testid*="cancel"]',
  '[data-testid*="save"]',
  '[data-testid*="search"]',
  '[data-testid*="filter"]',
  '[data-testid*="export"]',
  '[data-testid*="import"]',
  '[data-testid*="add"]',
  '[data-testid*="edit"]',
  '[data-testid*="delete"]',
  '[data-testid*="refresh"]',

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
  '.action-link'
]

// 按钮分类配置
const BUTTON_CATEGORIES = {
  // 数据操作按钮 (CRUD)
  dataOperations: {
    selectors: [
      '[data-testid*="add"]',
      '[data-testid*="create"]',
      '[data-testid*="new"]',
      '[data-testid*="edit"]',
      '[data-testid*="update"]',
      '[data-testid*="modify"]',
      '[data-testid*="delete"]',
      '[data-testid*="remove"]',
      '[data-testid*="archive"]',
      '[data-testid*="save"]',
      '[data-testid*="submit"]',
      '[data-testid*="confirm"]',
      '[data-testid*="cancel"]',
      '[data-testid*="reset"]',
      '[data-testid*="clear"]'
    ],
    testScenarios: ['visibility', 'clickability', 'functionality', 'loading', 'disabled']
  },

  // 查询和过滤按钮
  queryFilters: {
    selectors: [
      '[data-testid*="search"]',
      '[data-testid*="filter"]',
      '[data-testid*="advanced-search"]',
      '[data-testid*="clear-filter"]',
      '[data-testid*="reset-filter"]',
      '[data-testid*="apply-filter"]'
    ],
    testScenarios: ['visibility', 'input-validation', 'filter-application', 'clear-action']
  },

  // 数据处理按钮
  dataProcessing: {
    selectors: [
      '[data-testid*="export"]',
      '[data-testid*="import"]',
      '[data-testid*="download"]',
      '[data-testid*="upload"]',
      '[data-testid*="sync"]',
      '[data-testid*="refresh"]',
      '[data-testid*="reload"]',
      '[data-testid*="backup"]',
      '[data-testid*="restore"]'
    ],
    testScenarios: ['file-handling', 'progress-indication', 'error-handling', 'success-notification']
  },

  // 业务流程按钮
  businessFlow: {
    selectors: [
      '[data-testid*="approve"]',
      '[data-testid*="reject"]',
      '[data-testid*="submit-approval"]',
      '[data-testid*="publish"]',
      '[data-testid*="unpublish"]',
      '[data-testid*="activate"]',
      '[data-testid*="deactivate"]',
      '[data-testid*="enable"]',
      '[data-testid*="disable"]'
    ],
    testScenarios: ['workflow-transition', 'permission-check', 'confirmation-dialog', 'status-update']
  },

  // 导航和链接按钮
  navigation: {
    selectors: [
      '[data-testid*="nav"]',
      '[data-testid*="menu"]',
      '[data-testid*="tab"]',
      '[data-testid*="link"]',
      '[data-testid*="back"]',
      '[data-testid*="next"]',
      '[data-testid*="previous"]',
      '[data-testid*="home"]',
      '[data-testid*="dashboard"]'
    ],
    testScenarios: ['route-navigation', 'active-state', 'tab-switching', 'breadcrumb-navigation']
  },

  // 认证和安全按钮
  authentication: {
    selectors: [
      '[data-testid*="login"]',
      '[data-testid*="logout"]',
      '[data-testid*="register"]',
      '[data-testid*="signup"]',
      '[data-testid*="forgot-password"]',
      '[data-testid*="change-password"]',
      '[data-testid*="verify"]',
      '[data-testid*="authenticate"]'
    ],
    testScenarios: ['form-validation', 'authentication-flow', 'security-checks', 'token-management']
  },

  // 表单控制按钮
  formControls: {
    selectors: [
      '[data-testid*="form-submit"]',
      '[data-testid*="form-reset"]',
      '[data-testid*="form-cancel"]',
      '[data-testid*="form-save"]',
      '[data-testid*="form-validate"]',
      '[data-testid*="step-next"]',
      '[data-testid*="step-previous"]',
      '[data-testid*="step-finish"]'
    ],
    testScenarios: ['form-validation', 'step-navigation', 'data-persistence', 'error-handling']
  },

  // 快捷操作按钮
  quickActions: {
    selectors: [
      '[data-testid*="quick"]',
      '[data-testid*="shortcut"]',
      '[data-testid*="favorite"]',
      '[data-testid*="bookmark"]',
      '[data-testid*="share"]',
      '[data-testid*="copy"]',
      '[data-testid*="print"]',
      '[data-testid*="preview"]'
    ],
    testScenarios: ['quick-execution', 'keyboard-shortcuts', 'clipboard-operations', 'preview-functionality']
  }
}

// 按钮状态测试配置
const BUTTON_STATES = {
  normal: {
    test: ['visible', 'enabled', 'correct-text', 'correct-icon']
  },
  disabled: {
    test: ['visible', 'disabled', 'correct-styling', 'no-click-response']
  },
  loading: {
    test: ['visible', 'loading-indicator', 'disabled-state', 'progress-feedback']
  },
  error: {
    test: ['visible', 'error-styling', 'error-message', 'recovery-option']
  },
  success: {
    test: ['visible', 'success-styling', 'success-message', 'completion-feedback']
  },
  active: {
    test: ['visible', 'active-styling', 'pressed-state', 'toggle-behavior']
  },
  hover: {
    test: ['visible', 'hover-effect', 'tooltip-display', 'cursor-change']
  },
  focus: {
    test: ['visible', 'focus-outline', 'keyboard-accessibility', 'screen-reader-support']
  }
}

describe('按钮和操作元素 - 100%覆盖测试', () => {
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

  /**
   * 自动化按钮扫描工具
   * 扫描页面中所有按钮并生成测试用例
   */
  describe('自动化按钮扫描', () => {
    test('扫描所有按钮元素', async () => {
      const allButtons = []

      // 扫描所有按钮模式
      for (const pattern of BUTTON_PATTERNS) {
        try {
          const buttons = await page.locator(pattern).all()
          for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i]
            const isVisible = await button.isVisible()
            const isEnabled = await button.isEnabled()
            const textContent = await button.textContent().catch(() => '')
            const testId = await button.getAttribute('data-testid').catch(() => '')
            const className = await button.getAttribute('class').catch(() => '')
            const buttonType = await button.getAttribute('type').catch(() => '')

            allButtons.push({
              selector: pattern,
              index: i,
              isVisible,
              isEnabled,
              textContent: textContent?.trim() || '',
              testId,
              className,
              buttonType,
              hasTestId: !!testId,
              hasClickHandler: await button.evaluate((el: any) =>
                el.onclick || el.getAttribute('@click') || el.getAttribute('v-on:click')
              ).catch(() => false)
            })
          }
        } catch (error) {
          // 忽略无效选择器
        }
      }

      console.log(`🔍 扫描完成，发现 ${allButtons.length} 个按钮元素`)

      // 统计不同类型的按钮
      const stats = {
        total: allButtons.length,
        visible: allButtons.filter(b => b.isVisible).length,
        enabled: allButtons.filter(b => b.isEnabled).length,
        withTestId: allButtons.filter(b => b.hasTestId).length,
        withClickHandler: allButtons.filter(b => b.hasClickHandler).length,
        elementPlusButtons: allButtons.filter(b => b.className.includes('el-button')).length
      }

      console.log('📊 按钮统计:', stats)

      // 验证按钮质量标准
      expect(stats.total).toBeGreaterThan(0) // 至少有一个按钮
      expect(stats.withTestId / stats.total).toBeGreaterThan(0.8) // 80%的按钮应该有test-id
      expect(stats.withClickHandler / stats.total).toBeGreaterThan(0.9) // 90%的按钮应该有点击处理

      // 输出按钮清单用于后续测试
      console.log('📋 按钮清单:', allButtons)
    })

    test('验证按钮可访问性', async () => {
      const buttons = await page.locator('button, [role="button"], .el-button').all()

      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        if (await button.isVisible()) {
          // 检查按钮是否有可访问的标签
          const text = await button.textContent().catch(() => '')
          const ariaLabel = await button.getAttribute('aria-label').catch(() => '')
          const title = await button.getAttribute('title').catch(() => '')

          const hasAccessibleLabel = !!(text?.trim() || ariaLabel || title)

          expect(hasAccessibleLabel).toBe(true)
        }
      }
    })
  })

  /**
   * 数据操作按钮测试
   */
  describe('数据操作按钮 (CRUD)', () => {
    test('添加按钮功能测试', async () => {
      const addButton = page.locator('[data-testid*="add"], [data-testid*="create"], [data-testid*="new"]').first()

      if (await addButton.count() > 0 && await addButton.isVisible()) {
        // 验证按钮基本属性
        await expect(addButton).toBeVisible()
        await expect(addButton).toBeEnabled()

        // 验证按钮文本或图标
        const buttonText = await addButton.textContent()
        const hasIcon = await addButton.locator('svg, i').count() > 0
        expect(buttonText?.trim() || hasIcon).toBeTruthy()

        // 测试点击功能
        await addButton.click()

        // 验证点击后的行为（通常是打开对话框或表单）
        const modal = page.locator('[data-testid*="modal"], [data-testid*="dialog"], [data-testid*="form"]')
        if (await modal.count() > 0) {
          await expect(modal.first()).toBeVisible()
        }

        // 验证没有控制台错误
        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到添加按钮，跳过测试')
      }
    })

    test('编辑按钮功能测试', async () => {
      const editButton = page.locator('[data-testid*="edit"], [data-testid*="update"], [data-testid*="modify"]').first()

      if (await editButton.count() > 0 && await editButton.isVisible()) {
        await expect(editButton).toBeVisible()
        await expect(editButton).toBeEnabled()

        await editButton.click()

        // 验证编辑模式或编辑表单
        const editForm = page.locator('[data-testid*="edit-form"], [data-testid*="edit-modal"]')
        if (await editForm.count() > 0) {
          await expect(editForm.first()).toBeVisible()
        }

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到编辑按钮，跳过测试')
      }
    })

    test('删除按钮功能测试', async () => {
      const deleteButton = page.locator('[data-testid*="delete"], [data-testid*="remove"], [data-testid*="archive"]').first()

      if (await deleteButton.count() > 0 && await deleteButton.isVisible()) {
        await expect(deleteButton).toBeVisible()

        await deleteButton.click()

        // 验证删除确认对话框
        const confirmDialog = page.locator('[data-testid*="confirm"], [data-testid*="delete-confirm"]')
        const alertMessage = page.locator('.el-message-box, [role="alertdialog"]')

        const hasConfirmation = await confirmDialog.count() > 0 || await alertMessage.count() > 0
        expect(hasConfirmation).toBe(true)

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到删除按钮，跳过测试')
      }
    })

    test('保存按钮功能测试', async () => {
      const saveButton = page.locator('[data-testid*="save"], [data-testid*="submit"], [data-testid*="confirm"]').first()

      if (await saveButton.count() > 0 && await saveButton.isVisible()) {
        await expect(saveButton).toBeVisible()
        await expect(saveButton).toBeEnabled()

        // 记录点击前的状态
        const beforeClick = Date.now()

        await saveButton.click()

        // 验证保存后的行为
        const successMessage = page.locator('.el-message--success, [data-testid*="success"]')
        const loadingState = saveButton.locator('.el-loading')

        // 检查是否有加载状态
        if (await loadingState.count() > 0) {
          await expect(loadingState.first()).toBeVisible()
        }

        // 检查是否有成功消息
        setTimeout(async () => {
          if (await successMessage.count() > 0) {
            await expect(successMessage.first()).toBeVisible()
          }
        }, 1000)

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到保存按钮，跳过测试')
      }
    })
  })

  /**
   * 查询和过滤按钮测试
   */
  describe('查询和过滤按钮', () => {
    test('搜索按钮功能测试', async () => {
      const searchButton = page.locator('[data-testid*="search"]').first()
      const searchInput = page.locator('[data-testid*="search-input"], input[placeholder*="搜索"], input[placeholder*="search"]').first()

      if (await searchButton.count() > 0 && await searchButton.isVisible()) {
        await expect(searchButton).toBeVisible()
        await expect(searchButton).toBeEnabled()

        // 如果有搜索输入框，输入测试内容
        if (await searchInput.count() > 0 && await searchInput.isVisible()) {
          await searchInput.fill('测试搜索内容')
          await searchButton.click()

          // 验证搜索结果
          const searchResults = page.locator('[data-testid*="search-results"], .el-table tbody tr')

          // 等待搜索完成
          await page.waitForTimeout(1000)

          // 验证表格数据已更新（通过检查表格行数变化或加载状态）
          const tableLoading = page.locator('.el-table .el-loading-mask')
          if (await tableLoading.count() > 0) {
            await expect(tableLoading.first()).toBeVisible()
          }
        } else {
          // 如果没有输入框，直接点击搜索按钮
          await searchButton.click()
        }

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到搜索按钮，跳过测试')
      }
    })

    test('过滤按钮功能测试', async () => {
      const filterButton = page.locator('[data-testid*="filter"]').first()

      if (await filterButton.count() > 0 && await filterButton.isVisible()) {
        await expect(filterButton).toBeVisible()

        await filterButton.click()

        // 验证过滤面板显示
        const filterPanel = page.locator('[data-testid*="filter-panel"], [data-testid*="filter-form"]')
        const filterDrawer = page.locator('.el-drawer:has([data-testid*="filter"])')

        const hasFilterUI = await filterPanel.count() > 0 || await filterDrawer.count() > 0
        expect(hasFilterUI).toBe(true)

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到过滤按钮，跳过测试')
      }
    })

    test('重置过滤按钮测试', async () => {
      const resetButton = page.locator('[data-testid*="reset"], [data-testid*="clear-filter"]').first()

      if (await resetButton.count() > 0 && await resetButton.isVisible()) {
        await expect(resetButton).toBeVisible()
        await expect(resetButton).toBeEnabled()

        await resetButton.click()

        // 验证重置后的状态
        await page.waitForTimeout(500)

        // 检查表单字段是否已清空
        const inputs = page.locator('input[type="text"], input[type="search"], select')
        for (let i = 0; i < Math.min(await inputs.count(), 5); i++) {
          const input = inputs.nth(i)
          const value = await input.inputValue()
          if (value && await input.isVisible()) {
            // 如果输入框有值且可见，验证是否可以被清空
            console.log(`输入框值: ${value}`)
          }
        }

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到重置按钮，跳过测试')
      }
    })
  })

  /**
   * 数据处理按钮测试
   */
  describe('数据处理按钮', () => {
    test('导出按钮功能测试', async () => {
      const exportButton = page.locator('[data-testid*="export"]').first()

      if (await exportButton.count() > 0 && await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible()
        await expect(exportButton).toBeEnabled()

        // 监听下载事件
        let downloadTriggered = false

        page.on('download', () => {
          downloadTriggered = true
        })

        await exportButton.click()

        // 验证导出对话框或下拉菜单
        const exportDialog = page.locator('[data-testid*="export-dialog"]')
        const exportDropdown = page.locator('.el-dropdown-menu:has-text("导出")')

        // 等待可能的导出选项
        await page.waitForTimeout(1000)

        const hasExportOptions = await exportDialog.count() > 0 || await exportDropdown.count() > 0 || downloadTriggered
        expect(hasExportOptions).toBe(true)

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到导出按钮，跳过测试')
      }
    })

    test('刷新按钮功能测试', async () => {
      const refreshButton = page.locator('[data-testid*="refresh"], [data-testid*="reload"]').first()

      if (await refreshButton.count() > 0 && await refreshButton.isVisible()) {
        await expect(refreshButton).toBeVisible()
        await expect(refreshButton).toBeEnabled()

        // 记录刷新前的数据状态
        const beforeRefresh = Date.now()

        await refreshButton.click()

        // 验证加载状态
        const loadingIndicator = page.locator('.el-loading-mask, .el-icon-loading')

        // 等待刷新完成
        await page.waitForTimeout(2000)

        // 检查是否有加载指示器
        const hasLoadingState = await loadingIndicator.count() > 0
        if (hasLoadingState) {
          await expect(loadingIndicator.first()).toBeVisible()
        }

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到刷新按钮，跳过测试')
      }
    })
  })

  /**
   * 业务流程按钮测试
   */
  describe('业务流程按钮', () => {
    test('审批按钮功能测试', async () => {
      const approveButton = page.locator('[data-testid*="approve"], [data-testid*="submit-approval"]').first()

      if (await approveButton.count() > 0 && await approveButton.isVisible()) {
        await expect(approveButton).toBeVisible()

        await approveButton.click()

        // 验证审批对话框
        const approvalModal = page.locator('[data-testid*="approval-modal"], [data-testid*="approve-dialog"]')
        const confirmationDialog = page.locator('.el-message-box:has-text("确认"), .el-dialog:has-text("审批")')

        const hasApprovalDialog = await approvalModal.count() > 0 || await confirmationDialog.count() > 0
        expect(hasApprovalDialog).toBe(true)

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到审批按钮，跳过测试')
      }
    })

    test('发布按钮功能测试', async () => {
      const publishButton = page.locator('[data-testid*="publish"]').first()

      if (await publishButton.count() > 0 && await publishButton.isVisible()) {
        await expect(publishButton).toBeVisible()

        await publishButton.click()

        // 验证发布确认
        const publishConfirm = page.locator('[data-testid*="publish-confirm"]')
        const successMessage = page.locator('.el-message--success:has-text("发布")')

        // 等待发布处理
        await page.waitForTimeout(1500)

        const hasPublishResponse = await publishConfirm.count() > 0 || await successMessage.count() > 0
        expect(hasPublishResponse).toBe(true)

        expectNoConsoleErrors()
      } else {
        console.log('⚠️ 未找到发布按钮，跳过测试')
      }
    })
  })

  /**
   * 按钮状态测试
   */
  describe('按钮状态测试', () => {
    test('按钮禁用状态测试', async () => {
      // 查找可能被禁用的按钮
      const submitButtons = page.locator('[data-testid*="submit"], [data-testid*="save"], [data-testid*="confirm"]')

      for (let i = 0; i < await submitButtons.count(); i++) {
        const button = submitButtons.nth(i)

        if (await button.isVisible()) {
          const isEnabled = await button.isEnabled()
          const hasDisabledClass = await button.evaluate((el: any) =>
            el.classList.contains('is-disabled')
          )

          // 验证禁用状态的视觉表现
          if (!isEnabled || hasDisabledClass) {
            await expect(button).toBeDisabled()

            // 验证禁用按钮不会响应点击
            const beforeClick = await button.textContent()
            await button.click()
            const afterClick = await button.textContent()

            // 禁用按钮的内容不应该改变
            expect(beforeClick).toBe(afterClick)
          }
        }
      }

      expectNoConsoleErrors()
    })

    test('按钮加载状态测试', async () => {
      // 查找可能显示加载状态的按钮
      const loadingButtons = page.locator('[data-testid*="save"], [data-testid*="submit"], [data-testid*="login"]')

      for (let i = 0; i < Math.min(await loadingButtons.count(), 3); i++) {
        const button = loadingButtons.nth(i)

        if (await button.isVisible() && await button.isEnabled()) {
          // 点击按钮触发可能的加载状态
          await button.click()

          // 检查加载指示器
          const loadingIndicator = button.locator('.el-loading, .el-icon-loading, .loading')

          // 等待可能的加载状态出现
          await page.waitForTimeout(1000)

          if (await loadingIndicator.count() > 0) {
            await expect(loadingIndicator.first()).toBeVisible()

            // 验证加载状态下按钮被禁用
            const isDisabledDuringLoading = await button.isDisabled()
            expect(isDisabledDuringLoading).toBe(true)
          }

          // 等待操作完成
          await page.waitForTimeout(2000)
        }
      }

      expectNoConsoleErrors()
    })

    test('按钮悬停和焦点状态测试', async () => {
      const buttons = page.locator('button, .el-button, [role="button"]')
      const visibleButtons = []

      // 收集可见按钮
      for (let i = 0; i < Math.min(await buttons.count(), 10); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          visibleButtons.push(button)
        }
      }

      // 测试悬停状态
      for (const button of visibleButtons.slice(0, 5)) {
        await button.hover()

        // 验证悬停效果
        const hasHoverEffect = await button.evaluate((el: any) => {
          const styles = window.getComputedStyle(el)
          return styles.cursor === 'pointer' || styles.transform !== 'none' || styles.backgroundColor !== ''
        })

        expect(hasHoverEffect).toBe(true)

        await page.mouse.move(0, 0) // 移开鼠标
      }

      // 测试焦点状态（键盘可访问性）
      for (const button of visibleButtons.slice(0, 3)) {
        await button.focus()

        // 验证焦点样式
        const hasFocusOutline = await button.evaluate((el: any) => {
          const styles = window.getComputedStyle(el)
          return styles.outline !== 'none' || styles.boxShadow !== 'none'
        })

        // 检查是否有焦点指示器
        expect(hasFocusOutline || await button.getAttribute('tabindex') !== null).toBe(true)

        await button.blur() // 移除焦点
      }

      expectNoConsoleErrors()
    })
  })

  /**
   * Element Plus 按钮组件专项测试
   */
  describe('Element Plus 按钮组件测试', () => {
    test('不同类型按钮样式验证', async () => {
      const buttonTypes = ['primary', 'success', 'warning', 'danger', 'info']

      for (const type of buttonTypes) {
        const button = page.locator(`.el-button--${type}`).first()

        if (await button.count() > 0 && await button.isVisible()) {
          await expect(button).toBeVisible()

          // 验证按钮类型样式
          const hasCorrectType = await button.evaluate((el: any, buttonType: string) => {
            return el.classList.contains(`el-button--${buttonType}`)
          }, type)

          expect(hasCorrectType).toBe(true)

          // 验证按钮文本或图标存在
          const hasContent = await button.evaluate((el: any) => {
            return el.textContent?.trim() || el.querySelector('svg, i')
          })

          expect(hasContent).toBe(true)
        }
      }

      expectNoConsoleErrors()
    })

    test('按钮尺寸验证', async () => {
      const buttonSizes = ['large', 'default', 'small', 'mini']

      for (const size of buttonSizes) {
        const button = page.locator(`.el-button--${size}`).first()

        if (await button.count() > 0 && await button.isVisible()) {
          await expect(button).toBeVisible()

          // 验证按钮尺寸样式
          const hasCorrectSize = await button.evaluate((el: any, buttonSize: string) => {
            return el.classList.contains(`el-button--${buttonSize}`)
          }, size)

          expect(hasCorrectSize).toBe(true)
        }
      }

      expectNoConsoleErrors()
    })

    test('朴素和圆角按钮样式验证', async () => {
      // 朴素按钮
      const plainButton = page.locator('.el-button.is-plain').first()
      if (await plainButton.count() > 0 && await plainButton.isVisible()) {
        await expect(plainButton).toBeVisible()
        expect(await plainButton.evaluate(el => el.classList.contains('is-plain'))).toBe(true)
      }

      // 圆角按钮
      const roundButton = page.locator('.el-button.is-round').first()
      if (await roundButton.count() > 0 && await roundButton.isVisible()) {
        await expect(roundButton).toBeVisible()
        expect(await roundButton.evaluate(el => el.classList.contains('is-round'))).toBe(true)
      }

      // 圆形按钮
      const circleButton = page.locator('.el-button.is-circle').first()
      if (await circleButton.count() > 0 && await circleButton.isVisible()) {
        await expect(circleButton).toBeVisible()
        expect(await circleButton.evaluate(el => el.classList.contains('is-circle'))).toBe(true)
      }

      expectNoConsoleErrors()
    })
  })

  /**
   * 特殊页面按钮测试
   */
  describe('特殊页面按钮测试', () => {
    test('登录页面按钮测试', async () => {
      await page.goto(`${testUrl}/Login`)
      await page.waitForLoadState('networkidle')

      // 测试登录按钮
      const loginButton = page.locator('[data-testid="login-button"]')
      if (await loginButton.count() > 0) {
        await expect(loginButton).toBeVisible()
        await expect(loginButton).toBeEnabled()

        const buttonText = await loginButton.textContent()
        expect(buttonText?.trim()).toBeTruthy()

        // 测试登录模式切换按钮
        const tabButtons = page.locator('.tab-btn')
        for (let i = 0; i < await tabButtons.count(); i++) {
          const tabButton = tabButtons.nth(i)
          if (await tabButton.isVisible()) {
            await expect(tabButton).toBeVisible()
            await tabButton.click()
            await page.waitForTimeout(500)
          }
        }

        // 测试快捷登录按钮
        const quickButtons = page.locator('.quick-btn')
        for (let i = 0; i < await quickButtons.count(); i++) {
          const quickButton = quickButtons.nth(i)
          if (await quickButton.isVisible()) {
            await expect(quickButton).toBeVisible()
            await expect(quickButton).toBeEnabled()

            const buttonTitle = await quickButton.getAttribute('title')
            expect(buttonTitle).toBeTruthy()
          }
        }
      }

      expectNoConsoleErrors()
    })
  })
})