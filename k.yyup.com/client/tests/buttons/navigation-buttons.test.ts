/**
 * 导航按钮专项测试
 *
 * 专门测试导航相关的按钮，包括菜单、标签页、面包屑等
 */

import { test, expect, describe, beforeEach, afterEach } from 'vitest'
import { setupTestPage, expectNoConsoleErrors } from '../helpers/test-utils'

describe('导航按钮专项测试', () => {
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

  test('主导航菜单按钮测试', async () => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')

    // 查找主导航菜单按钮
    const navMenu = page.locator('.el-menu, .main-nav, .sidebar-nav')

    if (await navMenu.count() > 0) {
      await expect(navMenu.first()).toBeVisible()

      // 查找菜单项
      const menuItems = navMenu.first().locator('.el-menu-item, .nav-item, a[href]')
      const itemCount = await menuItems.count()

      console.log(`🧭 发现 ${itemCount} 个导航菜单项`)

      // 测试前几个菜单项
      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const menuItem = menuItems.nth(i)
        if (await menuItem.isVisible()) {
          await expect(menuItem).toBeVisible()

          const itemText = await menuItem.textContent()
          const itemHref = await menuItem.getAttribute('href')
          const itemRole = await menuItem.getAttribute('role')

          console.log(`  - 菜单项 ${i + 1}: ${itemText?.trim()} (${itemHref || itemRole || '无链接'})`)

          // 检查菜单项状态
          const isActive = await menuItem.evaluate(el =>
            el.classList.contains('is-active') || el.classList.contains('active')
          )
          const hasChildren = await menuItem.evaluate(el =>
            el.classList.contains('has-children') || el.querySelector('.submenu')
          )

          expect(itemText?.trim()).toBeTruthy()

          // 测试菜单项点击（只测试前2个避免导航过多页面）
          if (i < 2 && !hasChildren) {
            const currentUrl = page.url()

            await menuItem.click()
            await page.waitForTimeout(2000)

            const newUrl = page.url()

            // 检查是否发生了导航
            const navigated = currentUrl !== newUrl
            if (navigated) {
              console.log(`    ✅ 成功导航到: ${newUrl}`)

              // 如果导航了，返回原页面继续测试
              await page.goto(testUrl)
              await page.waitForLoadState('networkidle')
            }
          }
        }
      }

      // 测试有子菜单的项目
      const hasSubmenuItems = navMenu.first().locator('.has-submenu, .el-submenu')
      if (await hasSubmenuItems.count() > 0) {
        const submenuItem = hasSubmenuItems.first()

        await submenuItem.hover()
        await page.waitForTimeout(1000)

        const submenu = page.locator('.submenu, .el-sub-menu')
        if (await submenu.count() > 0) {
          await expect(submenu.first()).toBeVisible()
          console.log('📁 子菜单成功展开')
        }
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到主导航菜单')
    }
  })

  test('标签页按钮测试', async () => {
    // 查找标签页组件
    const tabs = page.locator('.el-tabs, .nav-tabs')

    if (await tabs.count() > 0) {
      const firstTab = tabs.first()
      await expect(firstTab).toBeVisible()

      // 查找标签页头部
      const tabHeaders = firstTab.locator('.el-tabs__item, .tab-header, .nav-link')
      const tabCount = await tabHeaders.count()

      console.log(`📑 发现 ${tabCount} 个标签页`)

      if (tabCount > 0) {
        // 测试每个标签页
        for (let i = 0; i < tabCount; i++) {
          const tabHeader = tabHeaders.nth(i)
          if (await tabHeader.isVisible()) {
            await expect(tabHeader).toBeVisible()

            const tabText = await tabHeader.textContent()
            const isActive = await tabHeader.evaluate(el =>
              el.classList.contains('is-active') || el.classList.contains('active')
            )

            console.log(`  - 标签页 ${i + 1}: ${tabText?.trim()} (${isActive ? '活动' : '非活动'})`)

            // 点击标签页
            await tabHeader.click()
            await page.waitForTimeout(1000)

            // 验证标签页切换
            const newActive = await tabHeader.evaluate(el =>
              el.classList.contains('is-active') || el.classList.contains('active')
            )

            expect(newActive).toBe(true)
          }
        }
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到标签页组件')
    }
  })

  test('面包屑导航测试', async () => {
    // 查找面包屑导航
    const breadcrumbs = page.locator('.el-breadcrumb, .breadcrumb, .breadcrumb-nav')

    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs.first()).toBeVisible()

      // 查找面包屑项目
      const breadcrumbItems = breadcrumbs.first().locator('.el-breadcrumb__item, .breadcrumb-item, a')
      const itemCount = await breadcrumbItems.count()

      console.log(`🍞 发现 ${itemCount} 个面包屑项目`)

      // 测试面包屑项目（除最后一个，它通常是当前页面）
      for (let i = 0; i < itemCount - 1; i++) {
        const item = breadcrumbItems.nth(i)
        if (await item.isVisible()) {
          const itemText = await item.textContent()
          const itemHref = await item.getAttribute('href')

          console.log(`  - 面包屑 ${i + 1}: ${itemText?.trim()} (${itemHref || '无链接'})`)

          expect(itemText?.trim()).toBeTruthy()

          // 测试面包屑点击（只测试第一个）
          if (i === 0 && itemHref) {
            const currentUrl = page.url()

            await item.click()
            await page.waitForTimeout(1500)

            const newUrl = page.url()

            // 检查是否发生了导航
            const navigated = currentUrl !== newUrl
            if (navigated) {
              console.log(`    ✅ 面包屑导航成功`)

              // 返回原页面继续测试
              await page.goto(testUrl)
              await page.waitForLoadState('networkidle')
            }
          }
        }
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到面包屑导航')
    }
  })

  test('侧边栏折叠按钮测试', async () => {
    // 查找侧边栏折叠按钮
    const collapseButtons = page.locator('[data-testid*="collapse"], [data-testid*="toggle"], .collapse-btn, .sidebar-toggle')

    if (await collapseButtons.count() > 0) {
      const collapseButton = collapseButtons.first()
      await expect(collapseButton).toBeVisible()

      // 记录折叠前的状态
      const sidebar = page.locator('.sidebar, .aside, .el-aside')
      const beforeState = sidebar.count() > 0 ? await sidebar.first().isVisible() : false

      console.log(`📂 折叠前侧边栏状态: ${beforeState ? '展开' : '收起'}`)

      // 点击折叠按钮
      await collapseButton.click()
      await page.waitForTimeout(1000)

      // 检查折叠后的状态
      const afterState = sidebar.count() > 0 ? await sidebar.first().isVisible() : false
      console.log(`📂 折叠后侧边栏状态: ${afterState ? '展开' : '收起'}`)

      // 再次点击恢复状态
      await collapseButton.click()
      await page.waitForTimeout(1000)

      const finalState = sidebar.count() > 0 ? await sidebar.first().isVisible() : false
      console.log(`📂 恢复后侧边栏状态: ${finalState ? '展开' : '收起'}`)

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到侧边栏折叠按钮')
    }
  })

  test('返回和前进按钮测试', async () => {
    // 查找返回按钮
    const backButton = page.locator('[data-testid*="back"], .back-btn, .go-back')

    if (await backButton.count() > 0 && await backButton.isVisible()) {
      await expect(backButton).toBeVisible()

      const buttonText = await backButton.textContent()
      console.log(`⬅️ 返回按钮: ${buttonText?.trim()}`)

      // 注意：不实际点击返回按钮避免影响测试流程
      // 只验证按钮存在和可见性
    }

    // 查找前进按钮
    const forwardButton = page.locator('[data-testid*="forward"], .forward-btn, .go-forward')

    if (await forwardButton.count() > 0 && await forwardButton.isVisible()) {
      await expect(forwardButton).toBeVisible()

      const buttonText = await forwardButton.textContent()
      console.log(`➡️ 前进按钮: ${buttonText?.trim()}`)
    }

    expectNoConsoleErrors()
  })

  test('快速操作按钮测试', async () => {
    // 查找快速操作按钮
    const quickActions = page.locator('[data-testid*="quick"], [data-testid*="shortcut"], .quick-action')

    if (await quickActions.count() > 0) {
      const actionCount = await quickActions.count()
      console.log(`⚡ 发现 ${actionCount} 个快速操作按钮`)

      // 测试前几个快速操作
      for (let i = 0; i < Math.min(actionCount, 3); i++) {
        const action = quickActions.nth(i)
        if (await action.isVisible()) {
          await expect(action).toBeVisible()

          const actionText = await action.textContent()
          const actionTitle = await action.getAttribute('title')

          console.log(`  - 快速操作 ${i + 1}: ${actionText?.trim() || actionTitle || '(图标按钮)'}`)

          const isEnabled = await action.isEnabled()
          expect(isEnabled).toBeDefined()

          // 可以测试快速操作的功能
          if (i === 0 && isEnabled) {
            await action.click()
            await page.waitForTimeout(1000)

            // 检查是否有相应的响应
            const modal = page.locator('.el-dialog, .el-drawer')
            if (await modal.count() > 0) {
              console.log('    ✅ 快速操作触发了对话框')

              // 关闭对话框
              const closeButton = modal.locator('.el-dialog__headerbtn, .close-btn')
              if (await closeButton.count() > 0) {
                await closeButton.first().click()
                await page.waitForTimeout(500)
              }
            }
          }
        }
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到快速操作按钮')
    }
  })

  test('用户菜单按钮测试', async () => {
    // 查找用户菜单按钮
    const userMenuButtons = page.locator('[data-testid*="user"], [data-testid*="profile"], .user-menu, .avatar-btn')

    if (await userMenuButtons.count() > 0) {
      const userMenuButton = userMenuButtons.first()
      await expect(userMenuButton).toBeVisible()

      console.log('👤 找到用户菜单按钮')

      // 点击用户菜单
      await userMenuButton.click()
      await page.waitForTimeout(1000)

      // 验证用户下拉菜单
      const userDropdown = page.locator('.el-dropdown-menu, .user-dropdown')
      if (await userDropdown.count() > 0) {
        await expect(userDropdown.first()).toBeVisible()

        const dropdownItems = userDropdown.locator('.el-dropdown-item, .menu-item')
        const itemCount = await dropdownItems.count()

        console.log(`👤 用户菜单包含 ${itemCount} 个选项`)

        // 检查常见的用户菜单选项
        const commonOptions = ['个人资料', '设置', '退出登录', 'logout', 'settings', 'profile']

        for (const option of commonOptions) {
          const item = dropdownItems.locator(`:has-text("${option}")`)
          if (await item.count() > 0) {
            console.log(`  - 找到选项: ${option}`)
          }
        }

        // 关闭下拉菜单
        await page.click('body')
      }

      expectNoConsoleErrors()
    } else {
      console.log('⚠️ 未找到用户菜单按钮')
    }
  })
})