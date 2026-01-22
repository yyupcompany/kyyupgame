import { test, expect } from '@playwright/test'
import { parentRoutes } from './routes'
import { attachSignalCollectors, assertNotBlank, createCollector, loginAsRole, writeIssues } from './fixtures'

test.describe('role-sim: parent 菜单遍历（Parent Center）', () => {
  test.setTimeout(120000)

  test('parent -> parent-center 全菜单逐页打开（浏览器模拟）', async ({ page }) => {
    const collector = createCollector('parent')
    attachSignalCollectors(page, collector)

    await loginAsRole(page, 'parent')
    await expect(page.locator('#app')).toBeVisible()

    for (const item of parentRoutes) {
      const sidebarLink = page
        .locator('#parent-center-sidebar a.nav-item')
        .filter({ hasText: item.title })
        .first()

      const canClick = await sidebarLink.isVisible().catch(() => false)
      if (canClick) {
        await sidebarLink.click()
      } else {
        await page.goto(item.route, { waitUntil: 'domcontentloaded' })
      }

      await page
        .waitForURL((u) => u.pathname.startsWith(item.route), { timeout: 10000 })
        .catch(() => {})
      await page.waitForTimeout(600)

      await assertNotBlank(page, { role: 'parent', route: item.route, title: item.title }, collector)
    }

    const outFile = writeIssues('parent', collector.issues)
    expect(outFile).toContain('parent-issues.json')
  })
})


