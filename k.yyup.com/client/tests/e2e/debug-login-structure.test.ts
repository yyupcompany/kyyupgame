import { test, expect } from '@playwright/test';

test('检查登录页面结构', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
  
  // 等待一段时间让Vue应用渲染完成
  await page.waitForTimeout(5000);
  
  // 截图以便查看页面内容
  await page.screenshot({ path: 'login-page.png' });
  
  // 获取页面标题
  const title = await page.title();
  console.log('页面标题:', title);
  
  // 获取页面URL
  const url = page.url();
  console.log('页面URL:', url);
  
  // 获取页面内容
  const content = await page.content();
  console.log('页面内容长度:', content.length);
  
  // 检查是否存在特定元素
  const loginForm = page.locator('form.login-form');
  const isVisible = await loginForm.isVisible();
  console.log('登录表单是否可见:', isVisible);
  
  if (isVisible) {
    // 检查用户名和密码输入框
    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#password');
    const usernameVisible = await usernameInput.isVisible();
    const passwordVisible = await passwordInput.isVisible();
    console.log('用户名输入框是否可见:', usernameVisible);
    console.log('密码输入框是否可见:', passwordVisible);
    
    // 检查快捷登录按钮
    const adminBtn = page.locator('.admin-btn');
    const teacherBtn = page.locator('.teacher-btn');
    const parentBtn = page.locator('.parent-btn');
    const adminVisible = await adminBtn.isVisible();
    const teacherVisible = await teacherBtn.isVisible();
    const parentVisible = await parentBtn.isVisible();
    console.log('管理员按钮是否可见:', adminVisible);
    console.log('教师按钮是否可见:', teacherVisible);
    console.log('家长按钮是否可见:', parentVisible);
  } else {
    console.log('登录表单不可见，页面内容可能未正确加载');
  }
});