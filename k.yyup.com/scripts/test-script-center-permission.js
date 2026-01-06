/**
 * 测试话术中心权限问题
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('🚀 测试话术中心权限问题\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 监听控制台
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('SCRIPT_CENTER_VIEW') || text.includes('话术中心') || text.includes('权限')) {
      console.log(`[浏览器]: ${text}`);
    }
  });
  
  try {
    // 1. 登录
    console.log('🔐 步骤1: 登录...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder="请输入用户名"]', 'principal');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch(() => null),
      page.click('button[type="submit"]')
    ]);
    
    await page.waitForTimeout(2000);
    console.log('✅ 登录成功\n');
    
    // 2. 检查权限store
    console.log('🔍 步骤2: 检查权限store...');
    
    const permissionsData = await page.evaluate(() => {
      const permissionsStore = window.__PINIA__?.state?.value?.permissions;
      return {
        hasStore: !!permissionsStore,
        permissionsCount: permissionsStore?.permissions?.length || 0,
        permissions: permissionsStore?.permissions || [],
        isAdmin: permissionsStore?.isAdmin || false
      };
    });
    
    console.log(`   权限store存在: ${permissionsData.hasStore}`);
    console.log(`   权限总数: ${permissionsData.permissionsCount}`);
    console.log(`   是否管理员: ${permissionsData.isAdmin}`);
    
    // 检查SCRIPT相关权限
    const scriptPerms = permissionsData.permissions.filter(p => 
      p.code?.includes('SCRIPT') || p.permission?.includes('SCRIPT')
    );
    
    console.log(`\n   SCRIPT相关权限数量: ${scriptPerms.length}`);
    if (scriptPerms.length > 0) {
      console.log('   SCRIPT相关权限:');
      scriptPerms.forEach(p => {
        console.log(`     - ${p.code || p.permission}: ${p.name || p.title || ''}`);
      });
    } else {
      console.log('   ⚠️  未找到SCRIPT相关权限！');
    }
    
    // 3. 测试hasPermissionCode函数
    console.log('\n🔍 步骤3: 测试hasPermissionCode函数...');
    
    const hasPermissionResult = await page.evaluate(() => {
      const permissionsStore = window.__PINIA__?.state?.value?.permissions;
      if (!permissionsStore || !permissionsStore.hasPermissionCode) {
        return { error: 'hasPermissionCode函数不存在' };
      }
      
      return {
        hasScriptCenterView: permissionsStore.hasPermissionCode('SCRIPT_CENTER_VIEW'),
        hasScriptCenter: permissionsStore.hasPermissionCode('SCRIPT_CENTER'),
        hasTeachingCenterMain: permissionsStore.hasPermissionCode('TEACHING_CENTER_MAIN'),
        hasTeachingCenterView: permissionsStore.hasPermissionCode('TEACHING_CENTER_VIEW')
      };
    });
    
    console.log('   权限检查结果:');
    console.log(`     SCRIPT_CENTER_VIEW: ${hasPermissionResult.hasScriptCenterView}`);
    console.log(`     SCRIPT_CENTER: ${hasPermissionResult.hasScriptCenter}`);
    console.log(`     TEACHING_CENTER_MAIN: ${hasPermissionResult.hasTeachingCenterMain}`);
    console.log(`     TEACHING_CENTER_VIEW: ${hasPermissionResult.hasTeachingCenterView}`);
    
    // 4. 尝试访问话术中心
    console.log('\n🌐 步骤4: 尝试访问话术中心...');
    
    await page.goto(`${BASE_URL}/centers/script`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`   当前URL: ${currentUrl}`);
    
    if (currentUrl.includes('/403')) {
      console.log('❌ 跳转到403页面');
      
      // 查找相关的控制台日志
      const relevantLogs = consoleLogs.filter(log => 
        log.includes('SCRIPT') || log.includes('话术') || log.includes('403') || log.includes('权限不足')
      );
      
      if (relevantLogs.length > 0) {
        console.log('\n   相关控制台日志:');
        relevantLogs.forEach(log => console.log(`     ${log}`));
      }
    } else {
      console.log('✅ 页面加载成功');
    }
    
    // 截图
    const screenshotPath = `/tmp/话术中心权限测试.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 截图已保存: ${screenshotPath}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

test();

