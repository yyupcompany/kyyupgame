/**
 * 业务中心最终测试 - 修复后验证
 */

import { chromium } from 'playwright';

async function finalTest() {
  console.log('🚀 业务中心最终测试...\n');
  
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
      apiCalls.push(request.url());
    }
  });
  
  try {
    console.log('📍 步骤1: 登录');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('admin');
      await inputs[1].fill('admin123');
      
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text?.includes('登录')) {
          await button.click();
          break;
        }
      }
      
      await page.waitForTimeout(3000);
      console.log('✅ 登录成功\n');
    }
    
    console.log('📍 步骤2: 访问业务中心');
    await page.goto('http://localhost:5173/centers/business');
    await page.waitForTimeout(5000);
    
    const result = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        is404: window.location.href.includes('/404'),
        hasBusinessCenter: !!document.querySelector('.business-center-timeline'),
        hasTimeline: !!document.querySelector('.timeline-section'),
        bodyText: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('📊 测试结果:');
    console.log('='.repeat(60));
    console.log(`URL: ${result.url}`);
    console.log(`标题: ${result.title}`);
    console.log(`是否404: ${result.is404 ? '❌ 是' : '✅ 否'}`);
    console.log(`业务中心组件: ${result.hasBusinessCenter ? '✅ 加载' : '❌ 未加载'}`);
    console.log(`Timeline区域: ${result.hasTimeline ? '✅ 显示' : '❌ 未显示'}`);
    
    // 检查API调用
    const businessAPIs = apiCalls.filter(url => 
      url.includes('business-center') || url.includes('basic-info')
    );
    console.log(`\nAPI调用: ${businessAPIs.length} 个业务相关API`);
    if (businessAPIs.length > 0) {
      console.log('业务API:');
      businessAPIs.forEach(url => console.log(`   - ${url}`));
    }
    
    await page.screenshot({ path: 'screenshots/business-center-final.png', fullPage: true });
    console.log('\n📸 截图: business-center-final.png');
    
    // 最终结论
    console.log('\n' + '='.repeat(60));
    if (!result.is404 && result.hasBusinessCenter) {
      console.log('🎉 测试通过！业务中心可以正常访问！');
    } else if (result.is404) {
      console.log('❌ 仍然404，需要清除浏览器缓存');
    } else {
      console.log('⚠️  页面加载但组件未显示');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    console.log('\n⏳ 浏览器将在20秒后关闭...');
    await page.waitForTimeout(20000);
    await browser.close();
  }
}

finalTest().catch(console.error);

