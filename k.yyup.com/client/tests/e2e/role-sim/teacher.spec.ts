import { test, expect } from '@playwright/test'
import { teacherRoutes } from './routes'
import { attachSignalCollectors, assertNotBlank, createCollector, loginAsRole, writeIssues } from './fixtures'

test.describe('role-sim: teacher 菜单遍历（Teacher Center）', () => {
  test.setTimeout(120000)

  test('teacher -> teacher-center 全菜单逐页打开（浏览器模拟）', async ({ page }) => {
    const collector = createCollector('teacher')
    attachSignalCollectors(page, collector)

    await loginAsRole(page, 'teacher')
    await expect(page.locator('#app')).toBeVisible()

    for (const item of teacherRoutes) {
      const sidebarLink = page
        .locator('#teacher-center-sidebar a.nav-item')
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

      await assertNotBlank(page, { role: 'teacher', route: item.route, title: item.title }, collector)
    }

    const outFile = writeIssues('teacher', collector.issues)
    expect(outFile).toContain('teacher-issues.json')
  })
})


