import { test, expect } from '@playwright/test'
import { adminCentersRoutes } from './routes'
import { attachSignalCollectors, assertNotBlank, createCollector, loginAsRole, writeIssues } from './fixtures'

test.describe('role-sim: admin 菜单遍历（Centers）', () => {
  test.setTimeout(120000)

  test('admin -> centers 全菜单逐页打开（浏览器模拟）', async ({ page }) => {
    const collector = createCollector('admin')
    attachSignalCollectors(page, collector)

    await loginAsRole(page, 'admin')

    // 确保 sidebar 出现（admin默认应进入 centers/dashboard 风格布局）
    await expect(page.locator('#app')).toBeVisible()

    for (const item of adminCentersRoutes) {
      // 采用“真实用户点击侧边栏”优先；如果找不到（例如折叠/权限隐藏），退化为直接 goto
      const sidebarLink = page
        .locator('#centers-sidebar a.nav-item')
        .filter({ hasText: item.title })
        .first()

      const canClick = await sidebarLink.isVisible().catch(() => false)
      if (canClick) {
        await sidebarLink.click()
      } else {
        await page.goto(item.route, { waitUntil: 'domcontentloaded' })
      }

      // 等待路由稳定（避免把“还没跳转完”误判成空白）
      await page
        .waitForURL((u) => u.pathname.startsWith(item.route), { timeout: 10000 })
        .catch(() => {})
      await page.waitForTimeout(600)
      await assertNotBlank(page, { role: 'admin', route: item.route, title: item.title }, collector)
    }

    const outFile = writeIssues('admin', collector.issues)
    expect(outFile).toContain('admin-issues.json')
  })
})


