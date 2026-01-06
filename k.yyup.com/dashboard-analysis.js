import { chromium } from 'playwright';

async function analyzeDashboard() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('正在访问首页...');
    await page.goto('http://localhost:5173');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 先尝试访问登录页面
    console.log('正在访问登录页面...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 检查登录表单元素
    const usernameInput = await page.locator('input[type="text"], input[placeholder*="用户名"], input[placeholder*="邮箱"], input[placeholder*="账号"]').first();
    const passwordInput = await page.locator('input[type="password"], input[placeholder*="密码"]').first();
    const loginButton = await page.locator('button[type="submit"], .el-button--primary, button:has-text("登录")').first();
    
    if (await usernameInput.count() > 0 && await passwordInput.count() > 0) {
      console.log('找到登录表单，正在尝试登录...');
      
      // 清空并填写登录信息
      await usernameInput.clear();
      await usernameInput.fill('admin');
      await passwordInput.clear();
      await passwordInput.fill('admin123');
      
      // 点击登录按钮
      await loginButton.click();
      
      // 等待登录完成，检查是否跳转成功
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 检查是否登录成功（URL改变或页面内容改变）
      const currentUrl = page.url();
      console.log('登录后当前URL:', currentUrl);
      
      if (currentUrl.includes('/login')) {
        console.log('可能登录失败，尝试其他凭据...');
        // 尝试其他常用的测试凭据
        const testCredentials = [
          { username: 'admin', password: '123456' },
          { username: 'test', password: 'test123' },
          { username: 'admin', password: 'password' }
        ];
        
        for (const cred of testCredentials) {
          await usernameInput.clear();
          await usernameInput.fill(cred.username);
          await passwordInput.clear();
          await passwordInput.fill(cred.password);
          await loginButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          if (!page.url().includes('/login')) {
            console.log(`登录成功，使用凭据: ${cred.username}/${cred.password}`);
            break;
          }
        }
      } else {
        console.log('登录成功！');
      }
    } else {
      console.log('未找到登录表单，可能已经登录或页面结构不同');
    }
    
    console.log('正在导航到仪表板页面...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 拍摄页面截图
    await page.screenshot({ 
      path: 'F:/kyyup730/lazy-ai-substitute-project/dashboard-screenshot.png',
      fullPage: true 
    });
    
    console.log('正在分析页面元素...');
    
    // 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 获取主要统计卡片
    const statCards = await page.locator('.stat-card, .el-card, [class*="stat"], [class*="card"]').all();
    console.log('统计卡片数量:', statCards.length);
    
    for (let i = 0; i < statCards.length; i++) {
      const card = statCards[i];
      const cardText = await card.textContent();
      console.log(`卡片 ${i + 1}:`, cardText?.trim().substring(0, 100));
    }
    
    // 获取图表元素
    const charts = await page.locator('canvas, .chart, [class*="chart"], .echarts').all();
    console.log('图表数量:', charts.length);
    
    // 获取导航菜单
    const menuItems = await page.locator('.el-menu-item, .sidebar-item, nav a, [class*="menu"]').all();
    console.log('菜单项数量:', menuItems.length);
    
    // 获取页面主要内容区域
    const contentAreas = await page.locator('.main-content, .content, .dashboard, [class*="content"]').all();
    console.log('内容区域数量:', contentAreas.length);
    
    // 获取所有文本内容进行分析
    const pageContent = await page.textContent('body');
    console.log('页面总字符数:', pageContent?.length || 0);
    
    // 查找关键业务词汇
    const keywords = ['学生', '教师', '班级', '招生', '活动', '统计', '数据', '管理', '幼儿园'];
    keywords.forEach(keyword => {
      const count = (pageContent?.match(new RegExp(keyword, 'g')) || []).length;
      if (count > 0) {
        console.log(`关键词 "${keyword}" 出现次数:`, count);
      }
    });
    
    // 获取具体的数据展示元素
    const dataElements = await page.locator('[class*="number"], [class*="count"], [class*="total"], .value').all();
    console.log('数据展示元素数量:', dataElements.length);
    
    for (let i = 0; i < Math.min(dataElements.length, 10); i++) {
      const element = dataElements[i];
      const text = await element.textContent();
      console.log(`数据元素 ${i + 1}:`, text?.trim());
    }
    
  } catch (error) {
    console.error('分析过程中出错:', error);
  }
  
  await browser.close();
}

analyzeDashboard();