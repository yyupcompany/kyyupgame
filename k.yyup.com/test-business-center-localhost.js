/**
 * 业务中心动态调试脚本 - 使用localhost
 */

import { chromium } from 'playwright';

async function debugBusinessCenter() {
  console.log('🚀 开始业务中心动态调试（localhost）...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听API请求
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const headers = request.headers();
      apiCalls.push({
        url: request.url(),
        method: request.method(),
        hasAuth: !!headers['authorization'],
        authHeader: headers['authorization'] || 'None'
      });
      console.log(`📡 ${request.method()} ${request.url()}`);
      console.log(`   Auth: ${headers['authorization'] ? '✅ ' + headers['authorization'].substring(0, 30) + '...' : '❌ 无'}`);
    }
  });
  
  // 监听响应
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      const icon = status < 400 ? '✅' : '❌';
      console.log(`${icon} ${status} ${response.url()}`);
    }
  });
  
  try {
    // 步骤1: 访问登录页面
    console.log('\n📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/localhost-01-login.png', fullPage: true });
    
    // 步骤2: 执行登录
    console.log('\n📍 步骤2: 执行登录');
    
    // 等待页面加载
    await page.waitForSelector('input', { timeout: 5000 }).catch(() => {
      console.log('⚠️  页面加载超时');
    });
    
    // 查找输入框
    const inputs = await page.$$('input');
    console.log(`找到 ${inputs.length} 个输入框`);
    
    if (inputs.length >= 2) {
      await inputs[0].fill('admin');
      await inputs[1].fill('admin123');
      console.log('✅ 填写用户名和密码');
      
      await page.waitForTimeout(500);
      
      // 查找登录按钮
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
    
    await page.screenshot({ path: 'screenshots/localhost-02-after-login.png', fullPage: true });
    
    // 步骤3: 检查token
    console.log('\n📍 步骤3: 检查localStorage');
    const storage = await page.evaluate(() => {
      const allData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allData[key] = localStorage.getItem(key);
        }
      }
      return allData;
    });
    
    console.log('📦 localStorage内容:');
    Object.keys(storage).forEach(key => {
      const value = storage[key];
      if (key === 'token') {
        console.log(`   ${key}: ${value ? value.substring(0, 50) + '...' : '❌ 空'}`);
      } else if (key === 'userInfo') {
        console.log(`   ${key}: ${value ? '✅ 存在' : '❌ 空'}`);
      } else {
        console.log(`   ${key}: ${value?.substring(0, 30)}...`);
      }
    });
    
    const hasToken = !!storage.token;
    console.log(`\n${hasToken ? '✅' : '❌'} Token ${hasToken ? '存在' : '不存在'}`);
    
    // 步骤4: 检查菜单
    console.log('\n📍 步骤4: 检查菜单');
    await page.waitForTimeout(2000);
    
    const menuItems = await page.evaluate(() => {
      const items = [];
      // 查找所有可能的菜单元素
      const selectors = ['a', '.menu-item', '.el-menu-item', '[role="menuitem"]'];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim();
          const href = el.getAttribute('href');
          if (text && text.length > 0 && text.length < 50) {
            items.push({ text, href });
          }
        });
      });
      return items;
    });
    
    console.log(`📋 找到 ${menuItems.length} 个菜单项`);
    const businessMenus = menuItems.filter(m => 
      m.text?.includes('业务') || m.href?.includes('business')
    );
    
    if (businessMenus.length > 0) {
      console.log('✅ 业务中心菜单:');
      businessMenus.forEach(m => console.log(`   - ${m.text}: ${m.href}`));
    } else {
      console.log('⚠️  未找到业务中心菜单');
      console.log('   所有菜单（前15个）:');
      menuItems.slice(0, 15).forEach(m => console.log(`   - ${m.text}: ${m.href}`));
    }
    
    await page.screenshot({ path: 'screenshots/localhost-03-menu.png', fullPage: true });
    
    // 步骤5: 访问业务中心
    console.log('\n📍 步骤5: 访问业务中心');
    await page.goto('http://localhost:5173/centers/business');
    await page.waitForTimeout(3000);
    
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasBusinessCenter: !!document.querySelector('.business-center-timeline'),
        hasError: document.body.innerText.includes('404') || 
                  document.body.innerText.includes('错误'),
        bodyPreview: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('📄 页面信息:');
    console.log('   URL:', pageInfo.url);
    console.log('   标题:', pageInfo.title);
    console.log('   有业务中心组件:', pageInfo.hasBusinessCenter ? '✅' : '❌');
    console.log('   有错误:', pageInfo.hasError ? '❌' : '✅');
    console.log('   内容预览:', pageInfo.bodyPreview);
    
    await page.screenshot({ path: 'screenshots/localhost-04-business-center.png', fullPage: true });
    
    // 步骤6: 等待API调用
    console.log('\n📍 步骤6: 等待API调用');
    await page.waitForTimeout(5000);
    
    // 分析API调用
    console.log('\n📊 API调用分析:');
    console.log(`   总调用数: ${apiCalls.length}`);
    
    const businessAPIs = apiCalls.filter(c => c.url.includes('business-center'));
    console.log(`   业务中心API: ${businessAPIs.length}`);
    
    if (businessAPIs.length > 0) {
      businessAPIs.forEach((call, i) => {
        console.log(`\n   调用 ${i + 1}:`);
        console.log(`   - URL: ${call.url}`);
        console.log(`   - 方法: ${call.method}`);
        console.log(`   - 带Token: ${call.hasAuth ? '✅' : '❌'}`);
        if (call.hasAuth) {
          console.log(`   - Token: ${call.authHeader.substring(0, 40)}...`);
        }
      });
    }
    
    // 步骤7: 手动测试API
    console.log('\n📍 步骤7: 手动测试API');
    const apiTest = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/business-center/timeline', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        return {
          status: res.status,
          ok: res.ok,
          hasToken: !!token,
          data: data
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('🧪 API测试结果:');
    console.log('   状态:', apiTest.status);
    console.log('   成功:', apiTest.ok ? '✅' : '❌');
    console.log('   有Token:', apiTest.hasToken ? '✅' : '❌');
    console.log('   响应:', JSON.stringify(apiTest.data || apiTest.error, null, 2).substring(0, 200));
    
    await page.screenshot({ path: 'screenshots/localhost-05-final.png', fullPage: true });
    
    // 总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 调试总结');
    console.log('='.repeat(60));
    console.log(`Token存在: ${hasToken ? '✅ 是' : '❌ 否'}`);
    console.log(`业务菜单: ${businessMenus.length > 0 ? '✅ 找到' : '❌ 未找到'}`);
    console.log(`页面加载: ${pageInfo.hasBusinessCenter ? '✅ 成功' : '❌ 失败'}`);
    console.log(`API调用: ${businessAPIs.length} 个`);
    console.log(`API带Token: ${businessAPIs.some(c => c.hasAuth) ? '✅ 是' : '❌ 否'}`);
    console.log(`API响应: ${apiTest.ok ? '✅ 成功' : '❌ 失败'}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    await page.screenshot({ path: 'screenshots/localhost-error.png', fullPage: true });
  } finally {
    console.log('\n⏳ 浏览器将在30秒后关闭...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

debugBusinessCenter().catch(console.error);

