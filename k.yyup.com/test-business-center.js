/**
 * 业务中心404问题检测脚本
 */

import { chromium } from 'playwright';

async function testBusinessCenter() {
  console.log('🚀 开始检测业务中心404问题...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    console.log(`[浏览器控制台 ${msg.type()}]:`, msg.text());
  });
  
  // 监听页面错误
  page.on('pageerror', error => {
    console.error('❌ [页面错误]:', error.message);
  });
  
  // 监听网络请求
  page.on('response', response => {
    if (response.status() === 404) {
      console.log(`❌ 404错误: ${response.url()}`);
    }
  });
  
  try {
    // 步骤1: 设置登录状态
    console.log('📍 步骤1: 设置登录状态');
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-admin-token');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 1,
        username: 'admin',
        role: 'PRINCIPAL',
        name: '管理员'
      }));
    });
    console.log('✅ 登录状态设置完成\n');
    
    // 步骤2: 尝试访问业务中心的各种可能路径
    const businessCenterPaths = [
      '/centers/business',
      '/business-center',
      '/principal/business-center',
      '/centers/business-center',
      '/business',
      '/principal/business'
    ];
    
    console.log('📍 步骤2: 尝试访问业务中心的各种路径\n');
    
    for (const path of businessCenterPaths) {
      console.log(`🔍 尝试访问: http://localhost:5173${path}`);
      
      await page.goto(`http://localhost:5173${path}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      await page.waitForTimeout(2000);
      
      // 检查页面标题和内容
      const title = await page.title();
      const bodyText = await page.textContent('body');
      const is404 = bodyText.includes('404') || bodyText.includes('Not Found') || bodyText.includes('页面不存在');
      
      console.log(`   标题: ${title}`);
      console.log(`   是否404: ${is404 ? '❌ 是' : '✅ 否'}`);
      
      if (!is404) {
        console.log(`   ✅ 找到有效路径: ${path}\n`);
        
        // 截图
        await page.screenshot({ 
          path: `screenshots/business-center-${path.replace(/\//g, '-')}.png`, 
          fullPage: true 
        });
        console.log(`   📸 截图保存\n`);
        
        // 检查页面内容
        console.log('   📋 页面内容检查:');
        const h1 = await page.$('h1');
        if (h1) {
          const h1Text = await h1.textContent();
          console.log(`   - 主标题: ${h1Text}`);
        }
        
        const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()).filter(Boolean));
        console.log(`   - 按钮数量: ${buttons.length}`);
        if (buttons.length > 0) {
          console.log(`   - 按钮列表: ${buttons.slice(0, 5).join(', ')}${buttons.length > 5 ? '...' : ''}`);
        }
        
        break;
      } else {
        console.log(`   ❌ 404错误\n`);
        
        // 截图404页面
        await page.screenshot({ 
          path: `screenshots/404-${path.replace(/\//g, '-')}.png`, 
          fullPage: true 
        });
      }
    }
    
    // 步骤3: 检查路由配置
    console.log('\n📍 步骤3: 检查前端路由配置');
    
    // 访问首页，查看侧边栏菜单
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    
    // 查找所有导航链接
    const navLinks = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href')
      })).filter(link => link.text && link.href)
    );
    
    console.log('\n📋 页面中的所有导航链接:');
    const businessRelated = navLinks.filter(link => 
      link.text?.includes('业务') || 
      link.text?.includes('中心') ||
      link.href?.includes('business') ||
      link.href?.includes('center')
    );
    
    if (businessRelated.length > 0) {
      console.log('✅ 找到业务相关链接:');
      businessRelated.forEach(link => {
        console.log(`   - ${link.text}: ${link.href}`);
      });
    } else {
      console.log('⚠️  未找到业务相关链接');
      console.log('\n所有链接（前20个）:');
      navLinks.slice(0, 20).forEach(link => {
        console.log(`   - ${link.text}: ${link.href}`);
      });
    }
    
    // 截图首页
    await page.screenshot({ path: 'screenshots/homepage-with-nav.png', fullPage: true });
    console.log('\n📸 首页截图保存: homepage-with-nav.png');
    
    console.log('\n✅ 检测完成！');
    
  } catch (error) {
    console.error('❌ 检测过程中出错:', error);
    await page.screenshot({ path: 'screenshots/business-center-error.png', fullPage: true });
  } finally {
    console.log('\n⏳ 浏览器将在30秒后关闭...');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('👋 浏览器已关闭');
  }
}

// 运行检测
testBusinessCenter().catch(console.error);

