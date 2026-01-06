import { vi } from 'vitest'
/**
 * 用户管理流程E2E测试
 * 测试用户管理的完整流程：登录、查看用户列表、创建用户、编辑用户、删除用户
 */

import { test, expect } from '@playwright/test'

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

describe('用户管理流程测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
  })

  test('应该能够完成完整的用户管理流程', async ({ page }) => {
    // 1. 登录系统
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    
    // 选择管理员角色
    await page.selectOption('[data-testid="role-select"]', 'admin')
    
    // 点击登录按钮
    await page.click('[data-testid="login-button"]')
    
    // 等待登录成功，应该跳转到仪表板
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 2. 导航到用户管理页面
    // 查找并点击用户管理菜单
    await page.click('text=人员中心')
    await page.waitForTimeout(1000)
    await page.click('text=用户管理')
    
    // 等待用户管理页面加载
    await page.waitForSelector('[data-testid="user-list-table"]', { timeout: 10000 })
    
    // 3. 验证用户列表页面
    await expect(page.locator('[data-testid="user-list-table"]')).toBeVisible()
    await expect(page.locator('text=用户列表')).toBeVisible()
    
    // 4. 创建新用户
    await page.click('[data-testid="add-user-button"]')
    
    // 等待创建用户对话框出现
    await page.waitForSelector('[data-testid="user-form-dialog"]', { timeout: 5000 })
    
    // 填写用户信息
    await page.fill('[data-testid="user-username-input"]', 'testuser001')
    await page.fill('[data-testid="user-email-input"]', 'testuser001@example.com')
    await page.fill('[data-testid="user-password-input"]', 'password123')
    await page.fill('[data-testid="user-realname-input"]', '测试用户001')
    
    // 选择用户角色
    await page.selectOption('[data-testid="user-role-select"]', 'teacher')
    
    // 提交创建用户
    await page.click('[data-testid="save-user-button"]')
    
    // 等待创建成功提示
    await page.waitForSelector('text=创建成功', { timeout: 5000 })
    
    // 5. 验证新用户出现在列表中
    await page.waitForTimeout(2000) // 等待列表刷新
    await expect(page.locator('text=testuser001')).toBeVisible()
    await expect(page.locator('text=测试用户001')).toBeVisible()
    
    // 6. 编辑用户
    // 找到新创建的用户行并点击编辑按钮
    const userRow = page.locator('tr:has-text("testuser001")')
    await userRow.locator('[data-testid="edit-user-button"]').click()
    
    // 等待编辑对话框出现
    await page.waitForSelector('[data-testid="user-form-dialog"]', { timeout: 5000 })
    
    // 修改用户信息
    await page.fill('[data-testid="user-realname-input"]', '测试用户001-已修改')
    await page.fill('[data-testid="user-email-input"]', 'testuser001-modified@example.com')
    
    // 保存修改
    await page.click('[data-testid="save-user-button"]')
    
    // 等待修改成功提示
    await page.waitForSelector('text=修改成功', { timeout: 5000 })
    
    // 7. 验证修改后的信息
    await page.waitForTimeout(2000) // 等待列表刷新
    await expect(page.locator('text=测试用户001-已修改')).toBeVisible()
    await expect(page.locator('text=testuser001-modified@example.com')).toBeVisible()
    
    // 8. 删除用户
    // 找到用户行并点击删除按钮
    const modifiedUserRow = page.locator('tr:has-text("testuser001")')
    await modifiedUserRow.locator('[data-testid="delete-user-button"]').click()
    
    // 确认删除
    await page.waitForSelector('[data-testid="confirm-delete-dialog"]', { timeout: 5000 })
    await page.click('[data-testid="confirm-delete-button"]')
    
    // 等待删除成功提示
    await page.waitForSelector('text=删除成功', { timeout: 5000 })
    
    // 9. 验证用户已从列表中移除
    await page.waitForTimeout(2000) // 等待列表刷新
    await expect(page.locator('text=testuser001')).not.toBeVisible()
  })

  test('应该能够搜索和筛选用户', async ({ page }) => {
    // 登录系统
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 导航到用户管理页面
    await page.click('text=人员中心')
    await page.waitForTimeout(1000)
    await page.click('text=用户管理')
    
    await page.waitForSelector('[data-testid="user-list-table"]', { timeout: 10000 })
    
    // 测试搜索功能
    await page.fill('[data-testid="user-search-input"]', 'admin')
    await page.click('[data-testid="search-button"]')
    
    // 等待搜索结果
    await page.waitForTimeout(2000)
    
    // 验证搜索结果
    await expect(page.locator('text=admin')).toBeVisible()
    
    // 清空搜索
    await page.fill('[data-testid="user-search-input"]', '')
    await page.click('[data-testid="search-button"]')
    
    // 测试角色筛选
    await page.selectOption('[data-testid="role-filter-select"]', 'admin')
    await page.waitForTimeout(2000)
    
    // 验证筛选结果
    const adminRows = page.locator('tr:has-text("admin")')
    await expect(adminRows.first()).toBeVisible()
  })

  test('应该能够批量操作用户', async ({ page }) => {
    // 登录系统
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 导航到用户管理页面
    await page.click('text=人员中心')
    await page.waitForTimeout(1000)
    await page.click('text=用户管理')
    
    await page.waitForSelector('[data-testid="user-list-table"]', { timeout: 10000 })
    
    // 选择多个用户
    await page.check('[data-testid="select-all-users"]')
    
    // 验证批量操作按钮可用
    await expect(page.locator('[data-testid="batch-operations"]')).toBeVisible()
    
    // 测试批量启用/禁用
    await page.click('[data-testid="batch-disable-button"]')
    
    // 确认批量操作
    await page.waitForSelector('[data-testid="confirm-batch-dialog"]', { timeout: 5000 })
    await page.click('[data-testid="confirm-batch-button"]')
    
    // 等待操作完成提示
    await page.waitForSelector('text=批量操作完成', { timeout: 5000 })
  })

  test('应该正确处理用户管理的错误情况', async ({ page }) => {
    // 登录系统
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 导航到用户管理页面
    await page.click('text=人员中心')
    await page.waitForTimeout(1000)
    await page.click('text=用户管理')
    
    await page.waitForSelector('[data-testid="user-list-table"]', { timeout: 10000 })
    
    // 测试创建用户时的验证错误
    await page.click('[data-testid="add-user-button"]')
    await page.waitForSelector('[data-testid="user-form-dialog"]', { timeout: 5000 })
    
    // 提交空表单
    await page.click('[data-testid="save-user-button"]')
    
    // 验证错误提示
    await expect(page.locator('text=用户名不能为空')).toBeVisible()
    await expect(page.locator('text=邮箱不能为空')).toBeVisible()
    
    // 测试重复用户名
    await page.fill('[data-testid="user-username-input"]', 'admin') // 使用已存在的用户名
    await page.fill('[data-testid="user-email-input"]', 'admin@example.com')
    await page.fill('[data-testid="user-password-input"]', 'password123')
    await page.click('[data-testid="save-user-button"]')
    
    // 验证重复用户名错误
    await expect(page.locator('text=用户名已存在')).toBeVisible()
  })
})
