import { test, expect, Page } from '@playwright/test';
import { vi } from 'vitest'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  const adminQuick = page.getByRole('button', { name: /系统管理员/ });
  if (await adminQuick.isVisible().catch(() => false)) {
    await adminQuick.click();
  } else {
    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('admin123');
    await page.getByRole('button', { name: /立即登录|登录/ }).click();
  }
  await expect(page).not.toHaveURL(/\/login$/);
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

describe('用户列表 与 后端数据对齐校验', () => {
  test('列表前N行与 /api/users 数据对齐', async ({ page }) => {
    await loginAsAdmin(page);

    // 进入用户列表页面
    await page.goto(`${BASE_URL}/users`);

    // 捕获接口数据
    let items: any[] = [];
    const resp = await page.waitForResponse(r => r.url().includes('/api/users') && r.request().method() === 'GET', { timeout: 15000 }).catch(() => null);
    if (resp) {
      try {
        const json = await resp.json();
        const extract = (d: any) => d?.data?.items || d?.data?.list || d?.items || d?.list || d?.rows || [];
        items = extract(json) || [];
      } catch {}
    }

    // 兜底主动请求
    if (items.length === 0) {
      const fetchResp = await page.request.get(`${BASE_URL}/api/users`).catch(() => null);
      if (fetchResp && fetchResp.ok()) {
        const json = await fetchResp.json();
        const extract = (d: any) => d?.data?.items || d?.data?.list || d?.items || d?.list || d?.rows || [];
        items = extract(json) || [];
      }
    }

    // 取前端表格行
    const rows = page.locator('tbody tr');
    await rows.first().waitFor({ timeout: 15000 });
    const count = await rows.count();
    const sample = Math.min(5, count, items.length);

    for (let i = 0; i < sample; i++) {
      const rowText = (await rows.nth(i).textContent())?.trim() || '';
      const it = items[i] || {};
      const name = it.name || it.realName || it.username || '';
      const email = it.email || '';
      // 至少包含姓名或用户名
      expect(rowText.includes(String(name)) || (email && rowText.includes(String(email)))).toBeTruthy();
    }
  });
});

