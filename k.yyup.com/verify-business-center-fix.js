/**
 * 验证业务中心权限修复
 */

import { chromium } from 'playwright';

async function verifyFix() {
  console.log('🚀 开始验证业务中心权限修复...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听API调用
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiCalls.push({
        url: request.url(),
        method: request.method()
      });
    }
  });
  
  try {
    // 步骤1: 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    
    // 步骤2: 登录
    console.log('📍 步骤2: 登录系统');
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('admin');
      await inputs[1].fill('admin123');
      
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text?.includes('登录')) {
          await button.click();
          console.log('✅ 点击登录按钮');
          break;
        }
      }
      
      await page.waitForTimeout(3000);
    }
    
    // 步骤3: 清除缓存（通过重新加载）
    console.log('📍 步骤3: 清除缓存');
    await page.evaluate(() => {
      // 清除权限缓存
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('permission') || key.includes('route')) {
          localStorage.removeItem(key);
        }
      });
    });
    
    // 步骤4: 访问业务中心
    console.log('📍 步骤4: 访问业务中心');
    await page.goto('http://localhost:5173/centers/business');
    await page.waitForTimeout(5000);
    
    // 检查页面状态
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasBusinessCenter: !!document.querySelector('.business-center-timeline'),
        is404: window.location.href.includes('/404'),
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log('\n📊 验证结果:');
    console.log('='.repeat(60));
    console.log(`URL: ${pageInfo.url}`);
    console.log(`标题: ${pageInfo.title}`);
    console.log(`是否404: ${pageInfo.is404 ? '❌ 是' : '✅ 否'}`);
    console.log(`有业务中心组件: ${pageInfo.hasBusinessCenter ? '✅ 是' : '❌ 否'}`);
    
    // 检查API调用
    const businessAPIs = apiCalls.filter(c => c.url.includes('business-center'));
    console.log(`\nAPI调用: ${businessAPIs.length} 个业务中心API`);
    
    if (businessAPIs.length > 0) {
      console.log('业务中心API调用:');
      businessAPIs.forEach(api => {
        console.log(`   - ${api.method} ${api.url}`);
      });
    }
    
    // 截图
    await page.screenshot({ path: 'screenshots/verify-business-center.png', fullPage: true });
    console.log('\n📸 截图保存: verify-business-center.png');
    
    // 最终结论
    if (!pageInfo.is404 && pageInfo.hasBusinessCenter) {
      console.log('\n🎉 修复成功！业务中心可以正常访问了！');
    } else if (pageInfo.is404) {
      console.log('\n⚠️  仍然显示404，可能需要:');
      console.log('   1. 重启后端服务');
      console.log('   2. 清除浏览器所有缓存');
      console.log('   3. 检查路由守卫逻辑');
    } else {
      console.log('\n⚠️  页面加载但组件未显示，检查组件代码');
    }
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  } finally {
    console.log('\n⏳ 浏览器将在20秒后关闭...');
    await page.waitForTimeout(20000);
    await browser.close();
  }
}

verifyFix().catch(console.error);

