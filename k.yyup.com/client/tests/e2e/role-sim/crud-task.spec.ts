import { test, expect } from '@playwright/test'
import { attachSignalCollectors, createCollector, loginAsRole, writeIssues } from './fixtures'

function makeTitle(prefix: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  return `${prefix}-${ts}`
}

test.describe('role-sim: CRUD 烟测（任务中心）', () => {
  // 本用例本地默认 retries=1；失败重试会触发 webServer 二次启动，容易造成端口冲突
  test.describe.configure({ retries: 0 })
  test.setTimeout(180000)

  test('admin: 新建任务 -> 列表可见 -> 删除任务（可回滚）', async ({ page }) => {
    const collector = createCollector('admin')
    attachSignalCollectors(page, collector)

    await loginAsRole(page, 'admin')

    const title = makeTitle('e2e-task')

    // 页面里有 alert/confirm，用统一处理避免卡住
    page.on('dialog', (d) => d.accept().catch(() => {}))

    try {
      // 1) Create
      await page.goto('/centers/task/form', { waitUntil: 'domcontentloaded' })
      await expect(page.getByText('新建任务')).toBeVisible()

      await page.locator('input.form-input[placeholder="请输入任务标题"]').fill(title)
      await page.locator('select.form-select').nth(0).selectOption('medium') // priority
      await page.locator('select.form-select').nth(1).selectOption('pending') // status
      await page.locator('input.form-input[placeholder^="请输入标签"]').fill('e2e,任务中心')

      // 点击“保存任务”，并等待 POST /api/tasks 返回（用于定位接口失败/权限问题）
      const saveBtn = page.getByRole('button', { name: '保存任务' }).first()
      await expect(saveBtn).toBeEnabled()

      const [createRes] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/api/tasks') && res.request().method() === 'POST', { timeout: 30000 }),
        saveBtn.click()
      ])

      if (createRes.status() >= 300) {
        const bodyText = await createRes.text().catch(() => '')
        // 把后端错误响应带出来，便于前端对齐字段/枚举
        collector.push({
          type: 'BadResponse',
          url: page.url(),
          message: `POST ${createRes.url()} -> ${createRes.status()} ${bodyText.slice(0, 800)}`
        })
      }

      expect(createRes.status(), 'POST /api/tasks 应返回2xx').toBeLessThan(300)

      // 2) Read (back to list)
      await page.waitForURL((u) => u.pathname === '/centers/task', { timeout: 30000, waitUntil: 'domcontentloaded' })
      await expect(page.getByText('任务列表')).toBeVisible({ timeout: 30000 })

      const row = page.locator('.el-table__row').filter({ hasText: title }).first()
      await expect(row).toBeVisible({ timeout: 30000 })

      // 3) Delete (rollback)
      const [delRes] = await Promise.all([
        page.waitForResponse((res) => /\/api\/tasks\/\d+/.test(res.url()) && res.request().method() === 'DELETE', { timeout: 30000 }).catch(() => null),
        row.locator('button:has-text("删除")').click()
      ])
      if (delRes) expect(delRes.status(), 'DELETE /api/tasks/:id 应返回2xx').toBeLessThan(300)

      await expect(page.locator('.el-table__row', { hasText: title })).toHaveCount(0, { timeout: 30000 })
    } finally {
      // 无论成功失败，都落盘当前采集到的 console/network 信号
      writeIssues('admin', collector.issues)
    }
  })
})


