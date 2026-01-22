import { test, expect } from '@playwright/test'
import { adminCentersRoutes } from './routes'
import { attachSignalCollectors, assertNotBlank, createCollector, loginAsRole, writeIssues } from './fixtures'

test.describe('role-sim: principal 菜单遍历（Centers）', () => {
  test.setTimeout(120000)

  test('principal -> centers 全菜单逐页打开（浏览器模拟）', async ({ page }) => {
    const collector = createCollector('principal')
    attachSignalCollectors(page, collector)

    await loginAsRole(page, 'principal')
    await expect(page.locator('#app')).toBeVisible()

    for (const item of adminCentersRoutes) {
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

      await page
        .waitForURL((u) => u.pathname.startsWith(item.route), { timeout: 10000 })
        .catch(() => {})
      await page.waitForTimeout(600)

      await assertNotBlank(page, { role: 'principal', route: item.route, title: item.title }, collector)
    }

    const outFile = writeIssues('principal', collector.issues)
    expect(outFile).toContain('principal-issues.json')
  })
})


