/**
 * 测试SOP详情页 - 权限修复后
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function testSOPDetailPage() {
  console.log('🎭 测试SOP详情页（权限修复后）...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ [控制台错误] ${msg.text()}`);
    }
  });
  
  try {
    // 1. 访问首页
    console.log('📍 1. 访问首页并登录...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. 快捷登录
    const teacherBtn = page.locator('button.teacher-btn, .quick-btn.teacher-btn, button:has-text("教师")').first();
    const hasQuickLogin = await teacherBtn.isVisible().catch(() => false);
    
    if (hasQuickLogin) {
      console.log('   找到教师快捷登录，点击登录...');
      await teacherBtn.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
      console.log('   ✅ 登录完成\n');
    } else {
      console.log('   ⚠️  未找到快捷登录，可能已登录\n');
    }
    
    // 3. 直接访问SOP详情页
    console.log('📍 2. 访问SOP详情页...');
    await page.goto(BASE_URL + '/teacher-center/customer-tracking/1');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    const title = await page.title();
    
    console.log(`   当前URL: ${currentUrl}`);
    console.log(`   页面标题: ${title}`);
    
    // 4. 检查是否还是404
    const is404 = title.includes('页面不存在') || title.includes('404');
    
    if (is404) {
      console.log('   ❌ 仍然是404页面');
      console.log('   可能需要：');
      console.log('   1. 清除浏览器缓存');
      console.log('   2. 重新登录');
      console.log('   3. 检查动态路由是否正确加载\n');
    } else {
      console.log('   ✅ 页面正常加载！\n');
    }
    
    // 5. 检查页面元素
    console.log('📍 3. 检查页面元素...');
    
    const elements = {
      '页面头部': await page.locator('.page-header, .customer-sop-detail').first().isVisible().catch(() => false),
      '客户信息卡片': await page.locator('.customer-info-card, text=客户信息').first().isVisible().catch(() => false),
      'SOP进度卡片': await page.locator('.sop-progress-card, text=SOP进度').first().isVisible().catch(() => false),
      '成功概率卡片': await page.locator('.success-probability-card, text=成功概率').first().isVisible().catch(() => false),
      'SOP阶段流程': await page.locator('.sop-stage-flow, .stage-navigation').first().isVisible().catch(() => false),
      '对话记录': await page.locator('.conversation-timeline, text=对话记录').first().isVisible().catch(() => false),
      'AI建议面板': await page.locator('.ai-suggestion-panel, text=AI建议').first().isVisible().catch(() => false)
    };
    
    console.log('\n页面元素检查:');
    let visibleCount = 0;
    for (const [name, visible] of Object.entries(elements)) {
      console.log(`   ${visible ? '✅' : '❌'} ${name}`);
      if (visible) visibleCount++;
    }
    
    console.log(`\n   可见元素: ${visibleCount}/${Object.keys(elements).length}`);
    
    // 6. 截图
    await page.screenshot({ path: 'sop-detail-after-fix.png', fullPage: true });
    console.log('\n   📸 已保存截图: sop-detail-after-fix.png');
    
    // 7. 检查是否有权限错误
    const hasPermissionError = await page.locator('text=没有权限, text=权限不足, text=403').first().isVisible().catch(() => false);
    
    if (hasPermissionError) {
      console.log('\n   ❌ 仍然有权限错误');
    } else {
      console.log('\n   ✅ 没有权限错误');
    }
    
    // 8. 总结
    console.log('\n📊 测试总结:');
    if (!is404 && visibleCount > 0) {
      console.log('   ✅ SOP详情页修复成功！');
      console.log('   ✅ 页面正常加载');
      console.log(`   ✅ ${visibleCount}个元素可见`);
    } else if (!is404 && visibleCount === 0) {
      console.log('   ⚠️  页面加载但元素未显示');
      console.log('   可能原因: 组件渲染问题或数据加载失败');
    } else {
      console.log('   ❌ 页面仍然404');
      console.log('   需要进一步排查');
    }
    
    console.log('\n💡 浏览器将保持打开，按任意键关闭...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

// 运行测试
testSOPDetailPage().catch(console.error);

