/**
 * 业务中心动态调试脚本
 * 检查菜单显示和API令牌传递问题
 */

import { chromium } from 'playwright';

async function debugBusinessCenter() {
  console.log('🚀 开始业务中心动态调试...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听所有网络请求
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
      console.log(`📡 API请求: ${request.method()} ${request.url()}`);
      console.log(`   Authorization: ${headers['authorization'] || '❌ 无'}`);
    }
  });
  
  // 监听响应
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log(`📥 API响应: ${response.status()} ${response.url()}`);
      if (response.status() >= 400) {
        try {
          const body = await response.text();
          console.log(`   错误内容: ${body.substring(0, 200)}`);
        } catch (e) {
          // ignore
        }
      }
    }
  });
  
  // 监听控制台
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[浏览器 ${type}]: ${msg.text()}`);
    }
  });
  
  try {
    // ========== 步骤1: 访问登录页面 ==========
    console.log('\n📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    
    // 截图登录页面
    await page.screenshot({ path: 'screenshots/debug-01-login.png', fullPage: true });
    console.log('📸 截图: debug-01-login.png');
    
    // ========== 步骤2: 执行登录 ==========
    console.log('\n📍 步骤2: 执行登录');
    
    // 查找用户名输入框
    const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"]');
    if (usernameInput) {
      await usernameInput.fill('admin');
      console.log('✅ 输入用户名: admin');
    } else {
      console.log('⚠️  未找到用户名输入框');
    }
    
    // 查找密码输入框
    const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill('admin123');
      console.log('✅ 输入密码: admin123');
    } else {
      console.log('⚠️  未找到密码输入框');
    }
    
    await page.waitForTimeout(1000);
    
    // 点击登录按钮
    const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ 点击登录按钮');
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️  未找到登录按钮');
    }
    
    // 截图登录后
    await page.screenshot({ path: 'screenshots/debug-02-after-login.png', fullPage: true });
    console.log('📸 截图: debug-02-after-login.png');
    
    // ========== 步骤3: 检查localStorage中的token ==========
    console.log('\n📍 步骤3: 检查localStorage中的token');
    
    const storageData = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        userInfo: localStorage.getItem('userInfo'),
        allKeys: Object.keys(localStorage)
      };
    });
    
    console.log('📦 localStorage数据:');
    console.log('   Token:', storageData.token ? `${storageData.token.substring(0, 50)}...` : '❌ 无');
    console.log('   UserInfo:', storageData.userInfo ? '✅ 存在' : '❌ 无');
    console.log('   所有键:', storageData.allKeys.join(', '));
    
    if (!storageData.token) {
      console.log('\n⚠️  警告: 登录后没有token，可能登录失败');
    }
    
    // ========== 步骤4: 检查侧边栏菜单 ==========
    console.log('\n📍 步骤4: 检查侧边栏菜单');
    
    await page.waitForTimeout(2000);
    
    // 查找所有菜单项
    const menuItems = await page.$$eval('a, .menu-item, .el-menu-item', items => 
      items.map(item => ({
        text: item.textContent?.trim(),
        href: item.getAttribute('href'),
        class: item.className
      })).filter(item => item.text && item.text.length > 0)
    );
    
    console.log(`📋 找到 ${menuItems.length} 个菜单项`);
    
    // 查找业务中心相关菜单
    const businessMenus = menuItems.filter(item => 
      item.text?.includes('业务') || 
      item.text?.includes('中心') ||
      item.href?.includes('business') ||
      item.href?.includes('center')
    );
    
    if (businessMenus.length > 0) {
      console.log('\n✅ 找到业务相关菜单:');
      businessMenus.forEach(menu => {
        console.log(`   - ${menu.text}: ${menu.href || '无链接'}`);
      });
    } else {
      console.log('\n⚠️  未找到业务中心菜单项');
      console.log('   前10个菜单项:');
      menuItems.slice(0, 10).forEach(menu => {
        console.log(`   - ${menu.text}: ${menu.href || '无链接'}`);
      });
    }
    
    // 截图菜单
    await page.screenshot({ path: 'screenshots/debug-03-menu.png', fullPage: true });
    console.log('📸 截图: debug-03-menu.png');
    
    // ========== 步骤5: 直接访问业务中心 ==========
    console.log('\n📍 步骤5: 直接访问业务中心');
    
    await page.goto('http://localhost:5173/centers/business');
    await page.waitForTimeout(3000);
    
    // 检查页面内容
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500),
        hasError: document.body.innerText.includes('404') || 
                  document.body.innerText.includes('Not Found') ||
                  document.body.innerText.includes('页面不存在'),
        hasLoading: document.body.innerText.includes('加载') ||
                    document.querySelector('.el-loading-mask') !== null,
        hasContent: document.querySelector('.business-center-timeline') !== null
      };
    });
    
    console.log('📄 页面信息:');
    console.log('   标题:', pageContent.title);
    console.log('   是否404:', pageContent.hasError ? '❌ 是' : '✅ 否');
    console.log('   是否加载中:', pageContent.hasLoading ? '⏳ 是' : '✅ 否');
    console.log('   是否有内容:', pageContent.hasContent ? '✅ 是' : '❌ 否');
    console.log('   页面文本预览:', pageContent.bodyText.substring(0, 200));
    
    // 截图业务中心
    await page.screenshot({ path: 'screenshots/debug-04-business-center.png', fullPage: true });
    console.log('📸 截图: debug-04-business-center.png');
    
    // ========== 步骤6: 等待并检查API调用 ==========
    console.log('\n📍 步骤6: 等待API调用完成');
    await page.waitForTimeout(5000);
    
    // 再次检查localStorage
    const storageAfter = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        tokenLength: localStorage.getItem('token')?.length || 0
      };
    });
    
    console.log('\n📦 访问业务中心时的localStorage:');
    console.log('   Token存在:', storageAfter.token ? '✅ 是' : '❌ 否');
    console.log('   Token长度:', storageAfter.tokenLength);
    
    // ========== 步骤7: 分析API调用 ==========
    console.log('\n📍 步骤7: 分析API调用');
    
    const businessAPICalls = apiCalls.filter(call => 
      call.url.includes('business-center')
    );
    
    if (businessAPICalls.length > 0) {
      console.log(`\n✅ 找到 ${businessAPICalls.length} 个业务中心API调用:`);
      businessAPICalls.forEach((call, index) => {
        console.log(`\n   调用 ${index + 1}:`);
        console.log(`   - URL: ${call.url}`);
        console.log(`   - 方法: ${call.method}`);
        console.log(`   - 有Authorization: ${call.hasAuth ? '✅ 是' : '❌ 否'}`);
        console.log(`   - Authorization值: ${call.authHeader}`);
      });
    } else {
      console.log('\n⚠️  未检测到业务中心API调用');
    }
    
    console.log(`\n📊 总共捕获 ${apiCalls.length} 个API调用`);
    
    // ========== 步骤8: 手动触发API调用测试 ==========
    console.log('\n📍 步骤8: 手动测试API调用');
    
    const apiTestResult = await page.evaluate(async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 测试1: 使用fetch直接调用
        const response1 = await fetch('/api/business-center/timeline', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data1 = await response1.json();
        
        return {
          success: true,
          status: response1.status,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
          responseData: data1
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('\n🧪 手动API测试结果:');
    console.log('   成功:', apiTestResult.success ? '✅' : '❌');
    console.log('   状态码:', apiTestResult.status);
    console.log('   有Token:', apiTestResult.hasToken ? '✅' : '❌');
    console.log('   Token预览:', apiTestResult.tokenPreview);
    console.log('   响应数据:', JSON.stringify(apiTestResult.responseData, null, 2).substring(0, 300));
    
    // 最终截图
    await page.screenshot({ path: 'screenshots/debug-05-final.png', fullPage: true });
    console.log('\n📸 最终截图: debug-05-final.png');
    
    // ========== 总结 ==========
    console.log('\n' + '='.repeat(60));
    console.log('📊 调试总结');
    console.log('='.repeat(60));
    console.log(`✅ Token存在: ${storageAfter.token ? '是' : '否'}`);
    console.log(`✅ 业务中心菜单: ${businessMenus.length > 0 ? '找到' : '未找到'}`);
    console.log(`✅ 页面加载: ${pageContent.hasContent ? '成功' : '失败'}`);
    console.log(`✅ API调用: ${businessAPICalls.length} 个`);
    console.log(`✅ API带Token: ${businessAPICalls.some(c => c.hasAuth) ? '是' : '否'}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 调试过程出错:', error);
    await page.screenshot({ path: 'screenshots/debug-error.png', fullPage: true });
  } finally {
    console.log('\n⏳ 浏览器将在60秒后关闭，请查看页面状态...');
    await page.waitForTimeout(60000);
    await browser.close();
    console.log('👋 浏览器已关闭');
  }
}

// 运行调试
debugBusinessCenter().catch(console.error);

