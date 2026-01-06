/**
 * 业务中心完整功能测试
 * 重点测试基础信息与baseinfo的关联
 */

import { chromium } from 'playwright';

async function testBusinessCenter() {
  console.log('🚀 开始业务中心完整功能测试...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听所有API调用
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const url = request.url();
      const method = request.method();
      apiCalls.push({ method, url, time: new Date().toISOString() });
      console.log(`📡 ${method} ${url}`);
    }
  });
  
  // 监听响应
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      const url = response.url();
      
      if (status >= 400) {
        console.log(`❌ ${status} ${url}`);
      } else {
        console.log(`✅ ${status} ${url}`);
      }
      
      // 特别关注基础信息API
      if (url.includes('basic-info') || url.includes('kindergarten')) {
        try {
          const data = await response.json();
          console.log(`📦 基础信息响应:`, JSON.stringify(data, null, 2).substring(0, 500));
        } catch (e) {
          // ignore
        }
      }
    }
  });
  
  // 监听控制台
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
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
    
    // ========== 步骤2: 访问业务中心 ==========
    console.log('📍 步骤2: 访问业务中心');
    console.log('='.repeat(60));
    
    await page.goto('http://localhost:5173/centers/business');
    await page.waitForTimeout(5000);
    
    // 检查页面状态
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasBusinessCenter: !!document.querySelector('.business-center-timeline'),
        hasTimeline: !!document.querySelector('.timeline-section'),
        hasDetail: !!document.querySelector('.detail-section'),
        timelineItems: document.querySelectorAll('.timeline-item').length
      };
    });
    
    console.log('页面状态:');
    console.log(`   URL: ${pageInfo.url}`);
    console.log(`   标题: ${pageInfo.title}`);
    console.log(`   业务中心组件: ${pageInfo.hasBusinessCenter ? '✅' : '❌'}`);
    console.log(`   Timeline区域: ${pageInfo.hasTimeline ? '✅' : '❌'}`);
    console.log(`   详情区域: ${pageInfo.hasDetail ? '✅' : '❌'}`);
    console.log(`   Timeline项目数: ${pageInfo.timelineItems}\n`);
    
    await page.screenshot({ path: 'screenshots/business-center-01-overview.png', fullPage: true });
    console.log('📸 截图: business-center-01-overview.png\n');
    
    // ========== 步骤3: 点击"基础中心"项目 ==========
    console.log('📍 步骤3: 点击"基础中心"项目');
    console.log('='.repeat(60));
    
    await page.waitForTimeout(2000);
    
    // 查找基础中心项目
    const baseInfoItem = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.timeline-item'));
      const baseItem = items.find(item => {
        const title = item.querySelector('.timeline-title')?.textContent;
        return title?.includes('基础中心') || title?.includes('基础信息');
      });
      
      if (baseItem) {
        const title = baseItem.querySelector('.timeline-title')?.textContent;
        const desc = baseItem.querySelector('.timeline-description')?.textContent;
        return { found: true, title, desc };
      }
      
      return { found: false };
    });
    
    if (baseInfoItem.found) {
      console.log(`✅ 找到基础中心项目: ${baseInfoItem.title}`);
      console.log(`   描述: ${baseInfoItem.desc}`);
      
      // 点击基础中心项目
      await page.click('.timeline-item:has-text("基础中心")');
      await page.waitForTimeout(3000);
      
      console.log('✅ 点击基础中心项目\n');
      
      await page.screenshot({ path: 'screenshots/business-center-02-base-info.png', fullPage: true });
      console.log('📸 截图: business-center-02-base-info.png\n');
      
    } else {
      console.log('⚠️  未找到基础中心项目');
      
      // 列出所有timeline项目
      const allItems = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.timeline-item'));
        return items.map(item => {
          const title = item.querySelector('.timeline-title')?.textContent;
          const desc = item.querySelector('.timeline-description')?.textContent;
          return { title, desc };
        });
      });
      
      console.log('所有Timeline项目:');
      allItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title}`);
        console.log(`      ${item.desc}`);
      });
      console.log('');
    }
    
    // ========== 步骤4: 检查详情区域的基础信息 ==========
    console.log('📍 步骤4: 检查详情区域的基础信息');
    console.log('='.repeat(60));
    
    const detailInfo = await page.evaluate(() => {
      const detailSection = document.querySelector('.detail-section');
      if (!detailSection) {
        return { found: false };
      }
      
      // 查找基础信息部分
      const baseInfoSection = Array.from(detailSection.querySelectorAll('.detail-section-item'))
        .find(section => {
          const h5 = section.querySelector('h5');
          return h5?.textContent?.includes('基础信息');
        });
      
      if (baseInfoSection) {
        const infoItems = Array.from(baseInfoSection.querySelectorAll('.info-item'));
        const info = {};
        infoItems.forEach(item => {
          const label = item.querySelector('.info-label')?.textContent?.replace(':', '');
          const value = item.querySelector('.info-value')?.textContent;
          if (label && value) {
            info[label] = value;
          }
        });
        
        return { found: true, info };
      }
      
      return { found: false };
    });
    
    if (detailInfo.found) {
      console.log('✅ 找到基础信息部分:');
      Object.entries(detailInfo.info).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log('');
    } else {
      console.log('⚠️  未找到基础信息部分\n');
    }
    
    // ========== 步骤5: 检查API调用 ==========
    console.log('📍 步骤5: 检查API调用');
    console.log('='.repeat(60));
    
    const businessAPIs = apiCalls.filter(c => 
      c.url.includes('business-center') || 
      c.url.includes('basic-info') ||
      c.url.includes('kindergarten')
    );
    
    console.log(`总API调用: ${apiCalls.length}`);
    console.log(`业务相关API: ${businessAPIs.length}\n`);
    
    if (businessAPIs.length > 0) {
      console.log('业务相关API调用:');
      businessAPIs.forEach((api, index) => {
        console.log(`   ${index + 1}. ${api.method} ${api.url}`);
      });
      console.log('');
    }
    
    // 特别检查基础信息API
    const baseInfoAPIs = apiCalls.filter(c => 
      c.url.includes('basic-info') || c.url.includes('/kindergarten/basic')
    );
    
    if (baseInfoAPIs.length > 0) {
      console.log('✅ 基础信息API调用:');
      baseInfoAPIs.forEach((api, index) => {
        console.log(`   ${index + 1}. ${api.method} ${api.url}`);
      });
      console.log('');
    } else {
      console.log('⚠️  未检测到基础信息API调用');
      console.log('   可能原因:');
      console.log('   1. 基础中心未加载');
      console.log('   2. API路径不匹配');
      console.log('   3. 组件未正确调用API\n');
    }
    
    // ========== 步骤6: 测试结论 ==========
    console.log('📍 步骤6: 测试结论');
    console.log('='.repeat(60));
    
    const conclusion = {
      pageLoaded: pageInfo.hasBusinessCenter,
      timelineLoaded: pageInfo.hasTimeline,
      detailLoaded: pageInfo.hasDetail,
      baseInfoFound: baseInfoItem.found,
      baseInfoDetailFound: detailInfo.found,
      apiCalled: baseInfoAPIs.length > 0
    };
    
    console.log('测试结果:');
    console.log(`   ✅ 页面加载: ${conclusion.pageLoaded ? '成功' : '失败'}`);
    console.log(`   ✅ Timeline加载: ${conclusion.timelineLoaded ? '成功' : '失败'}`);
    console.log(`   ✅ 详情区域加载: ${conclusion.detailLoaded ? '成功' : '失败'}`);
    console.log(`   ✅ 基础中心项目: ${conclusion.baseInfoFound ? '找到' : '未找到'}`);
    console.log(`   ✅ 基础信息详情: ${conclusion.baseInfoDetailFound ? '显示' : '未显示'}`);
    console.log(`   ✅ 基础信息API: ${conclusion.apiCalled ? '已调用' : '未调用'}`);
    
    const allPassed = Object.values(conclusion).every(v => v === true);
    
    if (allPassed) {
      console.log('\n🎉 所有测试通过！业务中心功能正常！');
    } else {
      console.log('\n⚠️  部分测试未通过，需要进一步检查');
    }
    
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    await page.screenshot({ path: 'screenshots/business-center-error.png', fullPage: true });
  } finally {
    console.log('\n⏳ 浏览器将在30秒后关闭...');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('👋 测试完成');
  }
}

testBusinessCenter().catch(console.error);

