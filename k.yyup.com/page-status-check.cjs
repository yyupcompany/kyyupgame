const { chromium } = require('playwright');

async function pageStatusCheck() {
    console.log('🔍 检查页面状态和登录情况');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 监听所有控制台消息
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
            if (msg.type() === 'error' || msg.type() === 'warn') {
                console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
            }
        });

        // 访问根路径
        console.log('📍 访问根路径...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // 检查当前URL和页面标题
        const currentUrl = page.url();
        const title = await page.title();
        console.log(`📍 当前URL: ${currentUrl}`);
        console.log(`📍 页面标题: ${title}`);

        // 检查页面内容
        const pageContent = await page.content();
        console.log(`📄 页面内容长度: ${pageContent.length} 字符`);

        // 检查是否有登录表单
        const loginForm = await page.locator('input[placeholder*="用户名"], input[placeholder*="密码"], button:has-text("登录")').count();
        console.log(`🔐 登录表单元素: ${loginForm} 个`);

        // 检查是否有侧边栏
        const sidebar = await page.locator('.sidebar').count();
        console.log(`📋 侧边栏元素: ${sidebar} 个`);

        // 如果需要登录，执行登录
        if (loginForm > 0) {
            console.log('🔐 需要登录，执行登录流程...');
            try {
                await page.fill('input[placeholder*="用户名"], input[type="text"]', 'admin');
                await page.fill('input[placeholder*="密码"], input[type="password"]', '123456');
                await page.click('button:has-text("登录"), button[type="button"]');
                console.log('⏳ 等待登录完成...');
                await page.waitForTimeout(5000);

                // 检查登录后的URL
                const loginUrl = page.url();
                console.log(`📍 登录后URL: ${loginUrl}`);

                // 如果还在登录页，尝试直接访问仪表板
                if (loginUrl.includes('login')) {
                    console.log('📍 仍在登录页，尝试直接访问仪表板...');
                    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
                    await page.waitForTimeout(3000);
                }
            } catch (error) {
                console.log(`❌ 登录失败: ${error.message}`);
            }
        }

        // 再次检查页面状态
        const finalUrl = page.url();
        const finalTitle = await page.title();
        console.log(`📍 最终URL: ${finalUrl}`);
        console.log(`📍 最终标题: ${finalTitle}`);

        // 检查页面的主要内容区域
        console.log('\n🔍 检查页面主要元素:');

        const mainElements = {
            '侧边栏': '.sidebar',
            '导航菜单': '.sidebar-nav, .nav',
            '菜单项': '.nav-item, .menu-item',
            '主要内容': 'main, .main, .content',
            'UnifiedIcon': 'unified-icon, [class*="unified-icon"]',
            '图标元素': '.icon, i[class*="icon"], svg'
        };

        for (const [name, selector] of Object.entries(mainElements)) {
            try {
                const count = await page.locator(selector).count();
                console.log(`   ${name}: ${count} 个 (${selector})`);
            } catch (error) {
                console.log(`   ${name}: 检查出错 - ${error.message}`);
            }
        }

        // 截图保存当前状态
        console.log('\n📸 保存页面截图...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/page-status-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n⏳ 保持浏览器打开20秒供手动检查...');
        console.log('📝 请手动检查以下内容:');
        console.log('   1. 页面是否正确加载');
        console.log('   2. 是否已经登录');
        console.log('   3. 侧边栏是否可见');
        console.log('   4. 图标显示情况');

        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('❌ 检查出错:', error.message);
    } finally {
        await browser.close();
    }
}

pageStatusCheck();