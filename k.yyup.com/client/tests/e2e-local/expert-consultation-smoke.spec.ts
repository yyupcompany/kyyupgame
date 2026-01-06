import { vi } from 'vitest'
import { test, expect } from '@playwright/test'

const URL = 'http://localhost:5173/ai-center/expert-consultation'

async function waitForAssistantMessage(page) {
  // 等待出现任意助手消息块
  await page.waitForSelector('.message.assistant .message-content', { timeout: 30000 })
}

async function assertNoObjectObjectLeak(page) {
  // 验证消息中不出现 [object Object]
  const leakCount = await page.locator('.message.assistant .message-text:has-text("[object Object]")').count()
  expect(leakCount, '应当无 [object Object] 文本泄露').toBe(0)
}

async function clickQuickTest(page, label: string) {
  const btn = page.getByRole('button', { name: label })
  await btn.click()
}

test.
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('AI专家咨询 - 快速测试端到端回归（本地）', () => {
  test('1) 流程图测试应渲染 Mermaid 且无 [object Object]', async ({ page }) => {
    await page.goto(URL)
    await clickQuickTest(page, '🧩 流程图测试')
    await waitForAssistantMessage(page)

    // Mermaid SVG 存在
    await expect(page.locator('svg[id^="mermaid"]').first()).toBeVisible({ timeout: 15000 })

    await assertNoObjectObjectLeak(page)
  })

  for (const label of ['🍂 秋季招生活动', '💰 家长转化问题', '🏆 竞品分析策略', '🔥 综合方案规划']) {
    test(`2) ${label} - 专家回复应可读且无 [object Object]`, async ({ page }) => {
      await page.goto(URL)
      await clickQuickTest(page, label)
      await waitForAssistantMessage(page)
      await assertNoObjectObjectLeak(page)
    })
  }
})

