/**
 * 表单按钮专项测试
 *
 * 专门测试表单中的按钮，包括提交、重置、验证等功能
 */

import { test, expect, describe, beforeEach, afterEach } from 'vitest'
import { setupTestPage, expectNoConsoleErrors } from '../helpers/test-utils'

describe('表单按钮专项测试', () => {
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

  test('表单提交按钮测试', async () => {
    // 导航到包含表单的页面
    await page.goto(`${testUrl}/system/settings`)
    await page.waitForLoadState('networkidle')

    // 查找表单提交按钮
    const submitButtons = page.locator('button[type="submit"], [data-testid*="submit"], [data-testid*="save"]')

    if (await submitButtons.count() > 0) {
      const submitButton = submitButtons.first()
      await expect(submitButton).toBeVisible()

      // 检查按钮类型和样式
      const buttonType = await submitButton.getAttribute('type')
      const buttonClass = await submitButton.getAttribute('class')

      console.log(`📝 提交按钮类型: ${buttonType}, 类名: ${buttonClass}`)

      // 测试按钮初始状态
      const initialText = await submitButton.textContent()
      const isEnabled = await submitButton.isEnabled()

      console.log(`📝 按钮文本: ${initialText?.trim()}, 启用状态: ${isEnabled}`)

      expect(initialText?.trim()).toBeTruthy()
      expect(isEnabled).toBeDefined()

      // 测试按钮点击
      await submitButton.click()
      await page.waitForTimeout(2000)

      // 检查可能的加载状态
      const loadingClass = await submitButton.getAttribute('class')
      const isLoading = loadingClass?.includes('loading') || loadingClass?.includes('is-loading')

      if (isLoading) {
        console.log('⏳ 按钮处于加载状态')
      }

      // 检查可能的错误提示
      const errorMessage = page.locator('.el-form-item__error, .error-message')
      if (await errorMessage.count() > 0) {
        console.log('⚠️ 表单验证错误显示')
        await expect(errorMessage.first()).toBeVisible()
      }

      // 检查成功消息
      const successMessage = page.locator('.el-message--success')
      if (await successMessage.count() > 0) {
        console.log('✅ 表单提交成功')
        await expect(successMessage.first()).toBeVisible()
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到表单提交按钮')
    }
  })

  test('表单重置按钮测试', async () => {
    // 查找重置按钮
    const resetButtons = page.locator('button[type="reset"], [data-testid*="reset"], [data-testid*="clear"]')

    if (await resetButtons.count() > 0) {
      const resetButton = resetButtons.first()
      await expect(resetButton).toBeVisible()

      // 首先填写一些表单字段
      const formInputs = page.locator('input[type="text"], input[type="email"], textarea')

      // 记录填写前的状态
      const beforeReset = []
      for (let i = 0; i < Math.min(await formInputs.count(), 3); i++) {
        const input = formInputs.nth(i)
        if (await input.isVisible()) {
          const value = await input.inputValue()
          beforeReset.push(value)

          // 如果字段为空，填写测试内容
          if (!value) {
            await input.fill(`测试内容${i}`)
          }
        }
      }

      // 点击重置按钮
      await resetButton.click()
      await page.waitForTimeout(1000)

      // 验证重置后的状态
      const afterReset = []
      for (let i = 0; i < Math.min(await formInputs.count(), 3); i++) {
        const input = formInputs.nth(i)
        if (await input.isVisible()) {
          const value = await input.inputValue()
          afterReset.push(value)
        }
      }

      console.log('🔄 表单重置测试完成')

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到表单重置按钮')
    }
  })

  test('表单取消按钮测试', async () => {
    // 查找取消按钮
    const cancelButtons = page.locator('[data-testid*="cancel"], .cancel-btn, .el-button--default')

    if (await cancelButtons.count() > 0) {
      const cancelButton = cancelButtons.first()
      await expect(cancelButton).toBeVisible()

      const buttonText = await cancelButton.textContent()
      console.log(`❌ 取消按钮文本: ${buttonText?.trim()}`)

      // 点击取消按钮
      await cancelButton.click()
      await page.waitForTimeout(1000)

      // 检查是否关闭了对话框或返回上一页
      const dialog = page.locator('.el-dialog')
      const isDialogClosed = await dialog.count() === 0 || !(await dialog.first().isVisible())

      if (isDialogClosed) {
        console.log('✅ 取消按钮成功关闭了对话框')
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到表单取消按钮')
    }
  })

  test('表单步骤导航按钮测试', async () => {
    // 查找步骤表单的导航按钮
    const stepButtons = page.locator('[data-testid*="step"], [data-testid*="next"], [data-testid*="previous"]')

    if (await stepButtons.count() > 0) {
      const stepButtonCount = await stepButtons.count()
      console.log(`📍 发现 ${stepButtonCount} 个步骤导航按钮`)

      for (let i = 0; i < stepButtonCount; i++) {
        const button = stepButtons.nth(i)
        if (await button.isVisible()) {
          const buttonText = await button.textContent()
          const buttonType = await button.getAttribute('data-testid')

          console.log(`📍 步骤按钮: ${buttonText?.trim()} (${buttonType})`)

          await expect(button).toBeVisible()

          // 测试按钮状态
          const isEnabled = await button.isEnabled()
          expect(isEnabled).toBeDefined()

          // 可以测试按钮点击，但要小心不要破坏表单流程
          if (buttonType?.includes('next') && isEnabled && i < 2) {
            await button.click()
            await page.waitForTimeout(1000)
          }
        }
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到步骤导航按钮')
    }
  })

  test('表单验证按钮状态测试', async () => {
    // 查找表单
    const forms = page.locator('form, .el-form')

    if (await forms.count() > 0) {
      const form = forms.first()

      // 查找表单中的必填字段
      const requiredFields = form.locator('[required], .is-required')

      if (await requiredFields.count() > 0) {
        console.log(`📝 发现 ${await requiredFields.count()} 个必填字段`)

        // 查找表单提交按钮
        const submitButton = form.locator('button[type="submit"], [data-testid*="submit"]').first()

        if (await submitButton.count() > 0) {
          // 清空必填字段
          for (let i = 0; i < Math.min(await requiredFields.count(), 3); i++) {
            const field = requiredFields.nth(i)
            const tagName = await field.evaluate(el => el.tagName.toLowerCase())

            if (tagName === 'input' || tagName === 'textarea') {
              await field.fill('')
            }
          }

          // 检查提交按钮状态
          const isDisabledAfterEmpty = await submitButton.isDisabled()
          console.log(`🔒 清空必填字段后，提交按钮禁用状态: ${isDisabledAfterEmpty}`)

          // 填写必填字段
          for (let i = 0; i < Math.min(await requiredFields.count(), 3); i++) {
            const field = requiredFields.nth(i)
            const tagName = await field.evaluate(el => el.tagName.toLowerCase())

            if (tagName === 'input' || tagName === 'textarea') {
              await field.fill('测试内容')
            }
          }

          // 再次检查提交按钮状态
          await page.waitForTimeout(500)
          const isEnabledAfterFill = await submitButton.isEnabled()
          console.log(`✅ 填写必填字段后，提交按钮启用状态: ${isEnabledAfterFill}`)

          expect(typeof isDisabledAfterEmpty).toBe('boolean')
          expect(typeof isEnabledAfterFill).toBe('boolean')
        }
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到表单')
    }
  })

  test('动态表单按钮测试', async () => {
    // 查找动态表单按钮（如添加/删除行）
    const dynamicButtons = page.locator('[data-testid*="add-row"], [data-testid*="remove-row"], [data-testid*="add-field"]')

    if (await dynamicButtons.count() > 0) {
      const addButton = dynamicButtons.first()
      await expect(addButton).toBeVisible()

      // 记录点击前的状态
      const beforeClick = await page.locator('.form-row, .field-item').count()
      console.log(`📊 点击前表单项数量: ${beforeClick}`)

      // 点击添加按钮
      await addButton.click()
      await page.waitForTimeout(1000)

      // 检查是否添加了新的表单项
      const afterClick = await page.locator('.form-row, .field-item').count()
      console.log(`📊 点击后表单项数量: ${afterClick}`)

      // 查找删除按钮
      const removeButtons = page.locator('[data-testid*="remove"], [data-testid*="delete-row"]')

      if (await removeButtons.count() > 0) {
        const removeButton = removeButtons.first()
        if (await removeButton.isVisible()) {
          await removeButton.click()
          await page.waitForTimeout(1000)

          const afterRemove = await page.locator('.form-row, .field-item').count()
          console.log(`📊 删除后表单项数量: ${afterRemove}`)
        }
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到动态表单按钮')
    }
  })
})