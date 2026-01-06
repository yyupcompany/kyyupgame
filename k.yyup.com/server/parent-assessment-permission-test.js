const { chromium } = require('playwright');

async function testParentAssessmentPermissions() {
    console.log('开始测试家长端测评中心权限修复...');

    let browser;
    try {
        // 启动浏览器
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await browser.newContext({
            viewport: { width: 1366, height: 768 }
        });

        const page = await context.newPage();

        // 步骤1: 访问首页
        console.log('1. 访问应用首页 http://localhost:5173');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // 检查是否成功加载
        const pageTitle = await page.title();
        console.log('页面标题:', pageTitle);

        // 步骤2: 家长登录
        console.log('2. 使用家长账户登录 (testparent/123456)');

        // 查找登录相关元素
        const loginButton = await page.$('text=登录');
        if (loginButton) {
            await loginButton.click();
            await page.waitForTimeout(1000);
        }

        // 填写登录表单
        const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"], input[name="username"]');
        if (usernameInput) {
            await usernameInput.fill('testparent');
        }

        const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"], input[name="password"]');
        if (passwordInput) {
            await passwordInput.fill('123456');
        }

        // 点击登录按钮
        const submitLogin = await page.$('button[type="submit"], button:has-text("登录"), .login-btn');
        if (submitLogin) {
            await submitLogin.click();
            await page.waitForTimeout(3000);
        }

        // 步骤3: 检查侧边栏是否显示测评中心菜单
        console.log('3. 检查侧边栏是否出现测评中心菜单');

        // 等待页面加载完成
        await page.waitForTimeout(2000);

        // 查找侧边栏
        const sidebarSelector = '.sidebar, .nav-menu, .menu-container';
        const sidebar = await page.$(sidebarSelector);

        let assessmentMenuFound = false;
        if (sidebar) {
            console.log('找到侧边栏');

            // 查找测评中心相关菜单
            const assessmentSelectors = [
                'text=测评中心',
                'text=测评',
                '[data-menu="assessment"]',
                'a[href*="assessment"]',
                '.menu-item:has-text("测评")'
            ];

            for (const selector of assessmentSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        console.log(`✅ 找到测评菜单: ${selector}`);
                        assessmentMenuFound = true;
                        await element.click();
                        await page.waitForTimeout(2000);
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }
        }

        if (!assessmentMenuFound) {
            console.log('❌ 未在侧边栏找到测评中心菜单');
        }

        // 步骤4: 直接访问测评页面
        console.log('4. 直接访问测评页面测试权限');

        const testPaths = [
            '/parent-center/assessment',
            '/parent-center/assessment/start',
            '/parent-center/assessment/doing',
            '/parent-center/assessment/report',
            '/parent-center/assessment/growth-trajectory'
        ];

        for (const path of testPaths) {
            console.log(`测试路径: ${path}`);
            await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // 检查页面内容
            const pageContent = await page.content();

            // 检查是否有403错误
            const has403Error = pageContent.includes('403') || pageContent.includes('无权限') || pageContent.includes('访问被拒绝');

            // 检查是否有测评相关内容
            const hasAssessmentContent = pageContent.includes('测评') || pageContent.includes('评估') || pageContent.includes('测试');

            if (has403Error) {
                console.log(`❌ ${path} - 访问被拒绝 (403错误)`);
            } else if (hasAssessmentContent) {
                console.log(`✅ ${path} - 可以正常访问测评内容`);
            } else {
                console.log(`⚠️  ${path} - 页面可访问但内容可能不完整`);
            }
        }

        // 步骤5: 截图保存
        console.log('5. 保存测试截图');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        await page.screenshot({ path: `parent-assessment-test-${timestamp}.png`, fullPage: true });

        console.log('✅ 家长端测评权限测试完成');

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
testParentAssessmentPermissions();