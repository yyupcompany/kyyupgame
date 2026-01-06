/**
 * 调试登录问题
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://k.yyup.cc';

async function main() {
  console.log('🚀 调试登录流程...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // 使用可见模式
    slowMo: 500       // 减慢操作速度
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    console.log(`[浏览器控制台 ${msg.type()}]:`, msg.text());
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.error('[页面错误]:', error.message);
  });

  try {
    console.log('1. 访问登录页面...');
    await page.goto(`${BASE_URL}/login`);
    
    console.log('2. 等待页面加载...');
    await page.waitForLoadState('networkidle');
    
    console.log('3. 当前URL:', page.url());
    
    console.log('4. 页面标题:', await page.title());
    
    console.log('5. 查找登录表单...');
    const loginForm = await page.$('.login-form');
    console.log('   登录表单存在:', !!loginForm);
    
    if (!loginForm) {
      console.log('6. 查找所有可能的表单元素...');
      const forms = await page.$$('form');
      console.log(`   找到 ${forms.length} 个表单`);
      
      const inputs = await page.$$('input');
      console.log(`   找到 ${inputs.length} 个输入框`);
      
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type');
        const placeholder = await inputs[i].getAttribute('placeholder');
        console.log(`   输入框 ${i + 1}: type=${type}, placeholder=${placeholder}`);
      }
    }
    
    console.log('\n等待10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await browser.close();
  }
}

main();

