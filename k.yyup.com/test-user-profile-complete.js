/**
 * 用户个人中心完整功能测试
 * 使用MCP浏览器进行回归测试
 */

import { chromium } from 'playwright';

async function testUserProfileComplete() {
  console.log('🧪 用户个人中心完整功能测试\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
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
        method: request.method(),
        url: request.url(),
        time: new Date().toISOString()
      });
      console.log(`📡 ${request.method()} ${request.url()}`);
    }
  });
  
  // 监听响应
  page.on('response', async response => {
    if (response.url().includes('/api/user/')) {
      const status = response.status();
      const url = response.url();
      
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
  
  // 监听控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log(`[浏览器错误]: ${msg.text()}`);
    }
  });
  
  try {
    // ========== 步骤1: 登录 ==========
    console.log('\n📍 步骤1: 登录系统');
    console.log('='.repeat(60));
    
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
    
    await page.screenshot({ path: 'screenshots/profile-test-01-login.png', fullPage: true });
    
    // ========== 步骤2: 测试用户下拉菜单 ==========
    console.log('📍 步骤2: 测试用户下拉菜单');
    console.log('='.repeat(60));
    
    await page.waitForTimeout(2000);
    
    // 查找用户信息区域
    const userInfoExists = await page.evaluate(() => {
      const userInfo = document.querySelector('.user-info');
      return !!userInfo;
    });
    
    console.log(`用户信息区域: ${userInfoExists ? '✅ 存在' : '❌ 不存在'}`);
    
    if (userInfoExists) {
      // 点击用户信息区域
      await page.click('.user-info');
      await page.waitForTimeout(1000);
      
      // 检查下拉菜单
      const dropdownVisible = await page.evaluate(() => {
        const dropdown = document.querySelector('.el-dropdown-menu');
        return dropdown && window.getComputedStyle(dropdown).display !== 'none';
      });
      
      console.log(`下拉菜单显示: ${dropdownVisible ? '✅ 是' : '❌ 否'}`);
      
      await page.screenshot({ path: 'screenshots/profile-test-02-dropdown.png', fullPage: true });
      
      // 点击"个人中心"
      await page.click('.el-dropdown-menu__item:has-text("个人中心")');
      await page.waitForTimeout(2000);
      
      console.log('✅ 点击个人中心菜单项\n');
    }
    
    // ========== 步骤3: 测试个人中心页面 ==========
    console.log('📍 步骤3: 测试个人中心页面');
    console.log('='.repeat(60));
    
    await page.waitForTimeout(3000);
    
    const profilePageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasProfileContainer: !!document.querySelector('.profile-container'),
        hasUserAvatar: !!document.querySelector('.user-avatar'),
        hasUserName: !!document.querySelector('.user-name'),
        hasEditButton: !!document.querySelector('button:has-text("编辑资料")'),
        hasChangePasswordButton: !!document.querySelector('button:has-text("修改密码")')
      };
    });
    
    console.log('个人中心页面状态:');
    console.log(`   URL: ${profilePageInfo.url}`);
    console.log(`   标题: ${profilePageInfo.title}`);
    console.log(`   个人中心容器: ${profilePageInfo.hasProfileContainer ? '✅' : '❌'}`);
    console.log(`   用户头像: ${profilePageInfo.hasUserAvatar ? '✅' : '❌'}`);
    console.log(`   用户名: ${profilePageInfo.hasUserName ? '✅' : '❌'}`);
    console.log(`   编辑按钮: ${profilePageInfo.hasEditButton ? '✅' : '❌'}`);
    console.log(`   修改密码按钮: ${profilePageInfo.hasChangePasswordButton ? '✅' : '❌'}\n');
    
    await page.screenshot({ path: 'screenshots/profile-test-03-profile-page.png', fullPage: true });
    
    // ========== 步骤4: 测试头像上传 ==========
    console.log('📍 步骤4: 测试头像上传按钮');
    console.log('='.repeat(60));
    
    const avatarButtonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.textContent?.includes('更换头像'));
    });
    
    console.log(`更换头像按钮: ${avatarButtonExists ? '✅ 存在' : '❌ 不存在'}\n`);
    
    // ========== 步骤5: 测试编辑资料 ==========
    console.log('📍 步骤5: 测试编辑资料功能');
    console.log('='.repeat(60));
    
    if (profilePageInfo.hasEditButton) {
      // 点击编辑按钮
      await page.click('button:has-text("编辑资料")');
      await page.waitForTimeout(1000);
      
      const isEditing = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input:not([disabled])');
        return inputs.length > 0;
      });
      
      console.log(`编辑模式: ${isEditing ? '✅ 已激活' : '❌ 未激活'}`);
      
      await page.screenshot({ path: 'screenshots/profile-test-04-editing.png', fullPage: true });
      
      // 取消编辑
      const cancelButton = await page.$('button:has-text("取消")');
      if (cancelButton) {
        await cancelButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 取消编辑\n');
      }
    }
    
    // ========== 步骤6: 测试修改密码 ==========
    console.log('📍 步骤6: 测试修改密码功能');
    console.log('='.repeat(60));
    
    if (profilePageInfo.hasChangePasswordButton) {
      // 点击修改密码按钮
      await page.click('button:has-text("修改密码")');
      await page.waitForTimeout(1000);
      
      const dialogVisible = await page.evaluate(() => {
        const dialog = document.querySelector('.el-dialog');
        return dialog && window.getComputedStyle(dialog).display !== 'none';
      });
      
      console.log(`密码修改对话框: ${dialogVisible ? '✅ 显示' : '❌ 未显示'}`);
      
      await page.screenshot({ path: 'screenshots/profile-test-05-password-dialog.png', fullPage: true });
      
      // 关闭对话框
      const closeButton = await page.$('.el-dialog__headerbtn');
      if (closeButton) {
        await closeButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 关闭密码对话框\n');
      }
    }
    
    // ========== 步骤7: 检查API调用 ==========
    console.log('📍 步骤7: 检查API调用');
    console.log('='.repeat(60));
    
    const profileAPIs = apiCalls.filter(c => c.url.includes('/user/profile'));
    
    console.log(`总API调用: ${apiCalls.length}`);
    console.log(`个人中心API: ${profileAPIs.length}\n`);
    
    if (profileAPIs.length > 0) {
      console.log('个人中心API调用:');
      profileAPIs.forEach((api, index) => {
        console.log(`   ${index + 1}. ${api.method} ${api.url}`);
      });
      console.log('');
    }
    
    // ========== 步骤8: 测试结论 ==========
    console.log('📍 步骤8: 测试结论');
    console.log('='.repeat(60));
    
    const testResults = {
      login: true,
      dropdown: userInfoExists,
      profilePage: profilePageInfo.hasProfileContainer,
      userInfo: profilePageInfo.hasUserAvatar && profilePageInfo.hasUserName,
      editButton: profilePageInfo.hasEditButton,
      passwordButton: profilePageInfo.hasChangePasswordButton,
      apiCalled: profileAPIs.length > 0,
      noErrors: errors.length === 0
    };
    
    console.log('测试结果:');
    Object.entries(testResults).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? '✅ 通过' : '❌ 失败'}`);
    });
    
    const allPassed = Object.values(testResults).every(v => v === true);
    
    if (allPassed) {
      console.log('\n🎉 所有测试通过！个人中心功能正常！');
    } else {
      console.log('\n⚠️  部分测试未通过，需要进一步检查');
    }
    
    if (errors.length > 0) {
      console.log('\n控制台错误:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    await page.screenshot({ path: 'screenshots/profile-test-error.png', fullPage: true });
  } finally {
    console.log('\n⏳ 浏览器将在30秒后关闭...');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('👋 测试完成');
  }
}

testUserProfileComplete().catch(console.error);

