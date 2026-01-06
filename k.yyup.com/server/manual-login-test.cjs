const { chromium } = require('playwright');

async function manualLoginTest() {
    console.log('🚀 手动登录测试 - 请在浏览器中查看');
    
    const browser = await chromium.launch({ 
        headless: false, 
        devtools: true,
        slowMo: 500 
    });
    
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(5000);
        
        console.log('📍 页面已加载，URL:', page.url());
        
        // 查看页面上是否有任何提示信息
        const pageText = await page.textContent('body');
        console.log('📋 页面包含用户提示:', pageText.includes('演示') || pageText.includes('demo'));
        
        // 保持浏览器打开60秒供手动测试
        console.log('⏳ 浏览器将保持打开60秒，请手动尝试登录');
        console.log('💡 提示: 可以尝试 admin/123456 或查看页面上的演示账户信息');
        
        await page.waitForTimeout(60000);
        
    } catch (error) {
        console.error('❌ 测试出错:', error.message);
    } finally {
        await browser.close();
    }
}

manualLoginTest();
