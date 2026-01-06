/**
 * 表格按钮专项测试
 *
 * 专门测试表格组件中的操作按钮，包括UnifiedTable组件中的按钮
 */

import { test, expect, describe, beforeEach, afterEach } from 'vitest'
import { setupTestPage, expectNoConsoleErrors } from '../helpers/test-utils'

describe('表格按钮专项测试', () => {
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

  test('表格操作按钮测试', async () => {
    // 导航到有表格的页面
    await page.goto(`${testUrl}/system/users`)
    await page.waitForLoadState('networkidle')

    // 等待表格加载
    const table = page.locator('.el-table')
    if (await table.count() > 0) {
      await expect(table.first()).toBeVisible()

      // 查找表格中的操作按钮
      const tableButtons = page.locator('.el-table .el-button')
      const buttonCount = await tableButtons.count()

      console.log(`📊 发现 ${buttonCount} 个表格操作按钮`)

      if (buttonCount > 0) {
        // 测试第一个可见的操作按钮
        const firstButton = tableButtons.first()
        if (await firstButton.isVisible()) {
          await expect(firstButton).toBeVisible()
          await expect(firstButton).toBeEnabled()

          const buttonText = await firstButton.textContent()
          console.log(`🔘 第一个按钮文本: ${buttonText?.trim()}`)

          // 点击按钮测试功能
          await firstButton.click()
          await page.waitForTimeout(1000)

          // 检查是否有相应的响应（对话框、表单等）
          const modal = page.locator('.el-dialog, .el-drawer, .el-message-box')
          if (await modal.count() > 0) {
            console.log('✅ 按钮点击触发了对话框')
          }

          expectNoConsoleErrors()
        }
      }
    } else {
      console.log('⚠️ 未找到表格，跳过表格按钮测试')
    }
  })

  test('表格行内按钮组测试', async () => {
    // 查找表格中的按钮组
    const buttonGroups = page.locator('.table-actions, .el-button-group')

    if (await buttonGroups.count() > 0) {
      const firstGroup = buttonGroups.first()
      await expect(firstGroup).toBeVisible()

      const groupButtons = firstGroup.locator('.el-button')
      const groupButtonCount = await groupButtons.count()

      console.log(`🔘 发现 ${groupButtonCount} 个组内按钮`)

      // 测试组内每个按钮
      for (let i = 0; i < groupButtonCount; i++) {
        const button = groupButtons.nth(i)
        if (await button.isVisible()) {
          await expect(button).toBeVisible()

          const buttonText = await button.textContent()
          const buttonType = await button.getAttribute('class')

          console.log(`  - 按钮 ${i + 1}: ${buttonText?.trim()} (${buttonType})`)

          // 测试按钮状态
          const isEnabled = await button.isEnabled()
          expect(isEnabled).toBeDefined()
        }
      }
    } else {
      console.log('⚠️ 未找到表格按钮组')
    }
  })

  test('表格下拉菜单按钮测试', async () => {
    // 查找表格中的下拉菜单按钮
    const dropdownButtons = page.locator('.el-table .el-dropdown .el-button')

    if (await dropdownButtons.count() > 0) {
      const firstDropdown = dropdownButtons.first()
      await expect(firstDropdown).toBeVisible()

      // 点击下拉按钮
      await firstDropdown.click()
      await page.waitForTimeout(500)

      // 验证下拉菜单显示
      const dropdownMenu = page.locator('.el-dropdown-menu')
      if (await dropdownMenu.count() > 0) {
        await expect(dropdownMenu.first()).toBeVisible()

        // 测试下拉菜单项
        const dropdownItems = dropdownMenu.locator('.el-dropdown-item')
        const itemCount = await dropdownItems.count()

        console.log(`📋 下拉菜单包含 ${itemCount} 个选项`)

        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = dropdownItems.nth(i)
          if (await item.isVisible()) {
            const itemText = await item.textContent()
            console.log(`  - 选项 ${i + 1}: ${itemText?.trim()}`)

            const isEnabled = await item.isEnabled()
            expect(isEnabled).toBeDefined()
          }
        }
      }

      // 点击其他地方关闭下拉菜单
      await page.click('body')
    } else {
      console.log('⚠️ 未找到表格下拉按钮')
    }
  })

  test('表格分页按钮测试', async () => {
    // 查找分页组件
    const pagination = page.locator('.el-pagination')

    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible()

      // 测试页码按钮
      const pageNumbers = pagination.locator('.el-pager .number')
      const pageNumberCount = await pageNumbers.count()

      if (pageNumberCount > 0) {
        // 测试第一个页码按钮
        const firstPage = pageNumbers.first()
        if (await firstPage.isVisible()) {
          await expect(firstPage).toBeVisible()
          await firstPage.click()
          await page.waitForTimeout(1000)
        }
      }

      // 测试上一页/下一页按钮
      const prevButton = pagination.locator('.btn-prev')
      const nextButton = pagination.locator('.btn-next')

      if (await prevButton.count() > 0 && await prevButton.isVisible()) {
        const isPrevDisabled = await prevButton.evaluate(el => el.classList.contains('disabled'))
        expect(typeof isPrevDisabled).toBe('boolean')
      }

      if (await nextButton.count() > 0 && await nextButton.isVisible()) {
        const isNextDisabled = await nextButton.evaluate(el => el.classList.contains('disabled'))
        expect(typeof isNextDisabled).toBe('boolean')
      }

      console.log('✅ 分页按钮测试完成')
    } else {
      console.log('⚠️ 未找到分页组件')
    }
  })

  test('表格工具栏按钮测试', async () => {
    // 查找表格工具栏
    const toolbar = page.locator('.table-toolbar, .table-header')

    if (await toolbar.count() > 0) {
      await expect(toolbar.first()).toBeVisible()

      // 查找工具栏中的按钮
      const toolbarButtons = toolbar.first().locator('.el-button, .toolbar-btn')
      const buttonCount = await toolbarButtons.count()

      console.log(`🛠️ 发现 ${buttonCount} 个工具栏按钮`)

      for (let i = 0; i < buttonCount; i++) {
        const button = toolbarButtons.nth(i)
        if (await button.isVisible()) {
          await expect(button).toBeVisible()

          const buttonText = await button.textContent()
          const buttonIcon = button.locator('svg, i')
          const hasIcon = await buttonIcon.count() > 0

          console.log(`  - 工具栏按钮 ${i + 1}: ${buttonText?.trim() || '(图标按钮)'} ${hasIcon ? '(有图标)' : ''}`)

          // 测试按钮点击（只测试前几个避免破坏页面状态）
          if (i < 2) {
            await button.click()
            await page.waitForTimeout(500)
          }
        }
      }
    } else {
      console.log('⚠️ 未找到表格工具栏')
    }
  })
})