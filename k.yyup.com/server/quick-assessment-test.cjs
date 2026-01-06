const { chromium } = require('playwright');

async function quickAssessmentTest() {
    console.log('🚀 快速测评中心测试');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // 访问登录页面
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(3000);
        
        console.log('当前URL:', page.url());
        
        // 填写登录表单
        const usernameInput = await page.$('input[placeholder="请输入用户名"]');
        const passwordInput = await page.$('input[placeholder="请输入密码"]');
        const loginButton = await page.$('button.login-btn');
        
        if (usernameInput && passwordInput && loginButton) {
            console.log('✅ 找到登录表单');
            await usernameInput.fill('parent_333');
            await passwordInput.fill('123456');
            await loginButton.click();
            await page.waitForTimeout(5000);
            
            console.log('登录后URL:', page.url());
            
            if (!page.url().includes('/login')) {
                console.log('✅ 登录成功');
                
                // 查找测评菜单
                await page.waitForTimeout(3000);
                
                // 获取所有菜单项
                const menuItems = await page.$$eval('.menu-item, .el-menu-item, a', items =>
                    items
                        .filter(item => item.offsetParent !== null)
                        .map(item => item.textContent?.trim())
                        .filter(text => text && text.length > 0)
                        .slice(0, 20)
                );
                
                console.log('菜单项:', menuItems);
                
                // 查找测评相关内容
                const assessmentItems = menuItems.filter(item => 
                    item.includes('测评') || item.includes('评估') || item.includes('测试')
                );
                
                console.log('测评相关菜单:', assessmentItems);
                
                if (assessmentItems.length > 0) {
                    console.log('✅ 找到测评功能');
                } else {
                    console.log('❌ 未找到测评功能');
                }
                
            } else {
                console.log('❌ 登录失败');
            }
        } else {
            console.log('❌ 未找到登录表单');
        }
        
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ 测试出错:', error.message);
    } finally {
        await browser.close();
    }
}

quickAssessmentTest();
