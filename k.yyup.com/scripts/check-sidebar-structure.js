/**
 * 检查侧边栏结构
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function checkSidebar() {
  console.log('🔍 检查侧边栏结构\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 登录
    console.log('🔐 登录...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder="请输入用户名"]', 'principal');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch(() => null),
      page.click('button[type="submit"]')
    ]);
    
    await page.waitForTimeout(3000);
    console.log('✅ 登录成功\n');
    
    // 检查侧边栏
    console.log('🔍 检查侧边栏元素...\n');
    
    // 截图
    await page.screenshot({ path: '/tmp/sidebar-structure.png', fullPage: true });
    console.log('📸 截图已保存: /tmp/sidebar-structure.png\n');
    
    // 获取侧边栏HTML
    const sidebarHTML = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar, .el-menu, .layout-sidebar, aside');
      return sidebar ? sidebar.outerHTML : '未找到侧边栏';
    });
    
    console.log('📋 侧边栏HTML结构:');
    console.log(sidebarHTML.substring(0, 2000));
    console.log('\n...(截断)\n');
    
    // 获取所有菜单项
    const menuItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.el-menu-item, .menu-item, [class*="menu"]'));
      return items.map(item => ({
        text: item.textContent?.trim(),
        class: item.className,
        tag: item.tagName
      })).filter(item => item.text && item.text.length > 0);
    });
    
    console.log('📋 找到的菜单项:');
    console.table(menuItems);
    
    // 尝试不同的选择器
    console.log('\n🔍 尝试不同的选择器...\n');
    
    const selectors = [
      '.el-menu-item',
      '.menu-item',
      '[class*="menu-item"]',
      '.sidebar .el-menu-item',
      'aside .el-menu-item',
      '.el-menu .el-menu-item',
      'li[class*="menu"]',
      '.navigation-item',
      '[role="menuitem"]'
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      console.log(`   ${selector}: ${count}个`);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await browser.close();
  }
}

checkSidebar();

