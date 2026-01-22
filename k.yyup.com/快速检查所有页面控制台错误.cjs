#!/usr/bin/env node

const { chromium } = require('playwright');

const pages = [
  // 顶层
  { name: 'Dashboard', url: 'http://localhost:5173/dashboard' },
  
  // 业务管理
  { name: '业务中心', url: 'http://localhost:5173/centers/business' },
  { name: '活动中心', url: 'http://localhost:5173/centers/activity' },
  { name: '招生中心', url: 'http://localhost:5173/centers/enrollment' },
  { name: '客户池中心', url: 'http://localhost:5173/centers/customer-pool' },
  { name: '任务中心', url: 'http://localhost:5173/centers/task' },
  { name: '话术中心', url: 'http://localhost:5173/centers/script' },
  { name: '文档中心', url: 'http://localhost:5173/centers/document-center' },
  { name: '财务中心', url: 'http://localhost:5173/centers/finance' },
  
  // 营销管理
  { name: '营销中心', url: 'http://localhost:5173/centers/marketing' },
  { name: '呼叫中心', url: 'http://localhost:5173/centers/call-center' },
  { name: '相册中心', url: 'http://localhost:5173/centers/media' },
  { name: '新媒体中心', url: 'http://localhost:5173/principal/media-center' },
];

async function checkPageErrors() {
  console.log('开始检查所有页面的控制台错误...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {};
  const consoleErrors = [];
  const consoleWarnings = [];
  
  // 监听控制台消息
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), location: msg.location() });
    } else if (msg.type() === 'warning') {
      consoleWarnings.push({ text: msg.text(), location: msg.location() });
    }
  });
  
  // 监听页面错误
  page.on('pageerror', error => {
    consoleErrors.push({ text: error.message, location: error.stack });
  });

  try {
    // 先登录
    console.log('正在登录...');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    
    // 点击admin快捷登录
    await page.click('button:has-text("系统管理员")');
    await page.waitForTimeout(5000);
    
    console.log('登录成功，开始检查页面...\n');
    
    // 检查每个页面
    for (const pageInfo of pages) {
      consoleErrors.length = 0;
      consoleWarnings.length = 0;
      
      console.log(`检查页面: ${pageInfo.name}`);
      await page.goto(pageInfo.url);
      await page.waitForTimeout(3000);
      
      const errors = [...consoleErrors];
      const warnings = [...consoleWarnings];
      
      results[pageInfo.name] = {
        url: pageInfo.url,
        errors: errors.filter(e => 
          !e.text.includes('[vite]') && 
          !e.text.includes('性能') &&
          !e.text.includes('Failed to load resource') // 暂时过滤资源加载错误
        ),
        warnings: warnings.filter(w => 
          !w.text.includes('[vite]') &&
          !w.text.includes('性能')
        )
      };
      
      console.log(`  错误: ${results[pageInfo.name].errors.length}`);
      console.log(`  警告: ${results[pageInfo.name].warnings.length}`);
    }
    
    // 打印详细报告
    console.log('\n\n=== 详细错误报告 ===\n');
    
    for (const [pageName, pageResult] of Object.entries(results)) {
      if (pageResult.errors.length > 0 || pageResult.warnings.length > 0) {
        console.log(`\n${pageName} (${pageResult.url})`);
        console.log('='.repeat(80));
        
        if (pageResult.errors.length > 0) {
          console.log('\n错误:');
          pageResult.errors.forEach((err, idx) => {
            console.log(`  ${idx + 1}. ${err.text}`);
          });
        }
        
        if (pageResult.warnings.length > 0) {
          console.log('\n警告:');
          pageResult.warnings.forEach((warn, idx) => {
            console.log(`  ${idx + 1}. ${warn.text}`);
          });
        }
      } else {
        console.log(`\n✅ ${pageName} - 无错误`);
      }
    }
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await browser.close();
  }
}

checkPageErrors().catch(console.error);
















