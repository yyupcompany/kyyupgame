/**
 * 使用浏览器测试业务中心缓存问题
 * 测试第一次和第二次访问的差异
 */

import { chromium } from 'playwright';

async function testBusinessCenterBrowserCache() {
  console.log('🔍 业务中心缓存问题调试（浏览器测试）\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听所有请求和响应
  const requests = [];
  const responses = [];
  const errors = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        time: new Date().toISOString()
      });
      console.log(`📡 请求: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      const url = response.url();
      
      responses.push({
        url,
        status,
        time: new Date().toISOString()
      });
      
      if (status >= 400) {
        console.log(`❌ ${status} ${url}`);
        try {
          const data = await response.json();
          console.log(`   错误: ${JSON.stringify(data, null, 2)}`);
        } catch (e) {
          // ignore
        }
      } else {
        console.log(`✅ ${status} ${url}`);
      }
    }
  });
  
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      const text = msg.text();
      errors.push(text);
      console.log(`[浏览器错误]: ${text}`);
    }
  });
  
  try {
    // 第一次访问流程
    console.log('\n' + '='.repeat(60));
    console.log('📍 第一次访问流程');
    console.log('='.repeat(60) + '\n');
    
    // 步骤1: 登录
    console.log('步骤1: 登录');
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
          console.log('✅ 点击登录按钮');
          break;
        }
      }
      
      await page.waitForTimeout(3000);
      console.log('✅ 登录完成\n');
    }
    
    // 步骤2: 第一次访问业务中心
    console.log('步骤2: 第一次访问业务中心');
    await page.goto('http://localhost:5173/centers/business');
    await page.waitForTimeout(5000);
    
    const firstVisit = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        is404: window.location.href.includes('/404'),
        hasBusinessCenter: !!document.querySelector('.business-center-timeline'),
        hasTimeline: !!document.querySelector('.timeline-section'),
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length
      };
    });
    
    console.log('第一次访问结果:');
    console.log(`   URL: ${firstVisit.url}`);
    console.log(`   是否404: ${firstVisit.is404 ? '❌ 是' : '✅ 否'}`);
    console.log(`   业务中心组件: ${firstVisit.hasBusinessCenter ? '✅ 加载' : '❌ 未加载'}`);
    console.log(`   Timeline区域: ${firstVisit.hasTimeline ? '✅ 显示' : '❌ 未显示'}`);
    console.log(`   localStorage项数: ${firstVisit.localStorage}`);
    console.log(`   sessionStorage项数: ${firstVisit.sessionStorage}\n`);
    
    await page.screenshot({ path: 'screenshots/business-center-cache-first.png', fullPage: true });
    console.log('📸 截图: business-center-cache-first.png\n');
    
    // 第二次访问流程
    console.log('='.repeat(60));
    console.log('📍 第二次访问流程（模拟刷新/缓存）');
    console.log('='.repeat(60) + '\n');
    
    // 清空请求记录
    requests.length = 0;
    responses.length = 0;
    errors.length = 0;
    
    // 步骤3: 第二次访问业务中心（刷新页面）
    console.log('步骤3: 刷新页面（第二次访问）');
    await page.reload();
    await page.waitForTimeout(5000);
    
    const secondVisit = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        is404: window.location.href.includes('/404'),
        hasBusinessCenter: !!document.querySelector('.business-center-timeline'),
        hasTimeline: !!document.querySelector('.timeline-section'),
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length
      };
    });
    
    console.log('第二次访问结果:');
    console.log(`   URL: ${secondVisit.url}`);
    console.log(`   是否404: ${secondVisit.is404 ? '❌ 是' : '✅ 否'}`);
    console.log(`   业务中心组件: ${secondVisit.hasBusinessCenter ? '✅ 加载' : '❌ 未加载'}`);
    console.log(`   Timeline区域: ${secondVisit.hasTimeline ? '✅ 显示' : '❌ 未显示'}`);
    console.log(`   localStorage项数: ${secondVisit.localStorage}`);
    console.log(`   sessionStorage项数: ${secondVisit.sessionStorage}\n`);
    
    await page.screenshot({ path: 'screenshots/business-center-cache-second.png', fullPage: true });
    console.log('📸 截图: business-center-cache-second.png\n');
    
    // 对比分析
    console.log('='.repeat(60));
    console.log('📊 对比分析');
    console.log('='.repeat(60));
    
    console.log('\n第一次 vs 第二次:');
    console.log(`   404状态: ${firstVisit.is404} → ${secondVisit.is404} ${firstVisit.is404 !== secondVisit.is404 ? '⚠️  变化' : '✅ 一致'}`);
    console.log(`   组件加载: ${firstVisit.hasBusinessCenter} → ${secondVisit.hasBusinessCenter} ${firstVisit.hasBusinessCenter !== secondVisit.hasBusinessCenter ? '⚠️  变化' : '✅ 一致'}`);
    console.log(`   Timeline: ${firstVisit.hasTimeline} → ${secondVisit.hasTimeline} ${firstVisit.hasTimeline !== secondVisit.hasTimeline ? '⚠️  变化' : '✅ 一致'}`);
    
    // 检查localStorage
    console.log('\n检查localStorage:');
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          data[key] = value ? value.substring(0, 100) : null;
        }
      }
      return data;
    });
    
    Object.entries(localStorageData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}...`);
    });
    
    // 检查控制台错误
    if (errors.length > 0) {
      console.log('\n⚠️  控制台错误:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ 无控制台错误');
    }
    
    // 结论
    console.log('\n' + '='.repeat(60));
    console.log('🎯 测试结论');
    console.log('='.repeat(60));
    
    if (firstVisit.is404 && secondVisit.is404) {
      console.log('❌ 两次访问都是404，权限或路由配置有问题');
    } else if (!firstVisit.is404 && secondVisit.is404) {
      console.log('⚠️  第一次正常，第二次404 - 缓存问题！');
    } else if (firstVisit.is404 && !secondVisit.is404) {
      console.log('⚠️  第一次404，第二次正常 - 初始化问题');
    } else {
      console.log('✅ 两次访问都正常');
    }
    
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    await page.screenshot({ path: 'screenshots/business-center-cache-error.png', fullPage: true });
  } finally {
    console.log('\n⏳ 浏览器将在30秒后关闭...');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('👋 测试完成');
  }
}

testBusinessCenterBrowserCache().catch(console.error);

