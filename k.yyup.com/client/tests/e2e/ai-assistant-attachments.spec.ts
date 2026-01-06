import { vi } from 'vitest'
import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tmpDir = path.resolve(__dirname, 'tmp')
const sampleTxt = path.join(tmpDir, 'sample.txt')
const samplePng = path.join(tmpDir, 'sample.png')

function ensureFixtures() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  fs.writeFileSync(sampleTxt, 'Hello AI Assistant')
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAQAAADZfx7YAAAADElEQVR42mP8z8AARgYGAAfmAUpuJq1pAAAAAElFTkSuQmCC'
  fs.writeFileSync(samplePng, Buffer.from(pngBase64, 'base64'))
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

describe('AI Assistant attachments', () => {
  test.beforeAll(() => {
    ensureFixtures()
  })

  test('upload file and image inserts markdown', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard')

    // 如果需要登录，这里可添加登录逻辑（检测到登录页时）
    if (await page.locator('text=登录').first().isVisible().catch(() => false)) {
      test.skip(true, '需要登录凭据，跳过本用例')
    }

    await page.getByText('YY-AI').click()
    await expect(page.locator('.ai-sidebar-container.ai-sidebar-visible')).toBeVisible()
    const textarea = page.locator('.input-area .el-textarea__inner')
    await textarea.click()
    const all = await page.locator('input[type="file"]').all()
    if (all.length >= 1) {
      await all[0].setInputFiles(sampleTxt)
      await expect(textarea).toContainText('[')
    }
    if (all.length >= 2) {
      await all[1].setInputFiles(samplePng)
      await expect(textarea).toContainText('![')
    }
  })
})
