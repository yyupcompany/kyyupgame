const { chromium } = require('playwright');

async function simpleLoginTest() {
    console.log('🚀 开始简单登录测试...');

    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        console.log('📍 访问登录页面');
        await page.goto('http://localhost:5173', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('📄 页面标题:', await page.title());
        console.log('🔗 当前URL:', page.url());

        await page.waitForTimeout(5000);

        // 检查是否已经重定向到登录页面
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
            console.log('✅ 已自动重定向到登录页面');
        }

        // 等待10秒以便手动检查页面
        // 监听控制台和网络请求
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('浏览器控制台错误:', msg.text());
            }
        });

        page.on('response', response => {
            if (response.url().includes('/api/auth/login')) {
                console.log('登录API响应状态:', response.status());
                response.text().then(text => {
                    console.log('登录API响应内容:', text);
                }).catch(e => console.log('无法读取响应内容'));
            }
        });

        console.log('📍 尝试自动登录...');

        try {
            // 查找用户名输入框
            await page.waitForSelector('input[type="text"], input[placeholder*="用户"], input[name="username"]', { timeout: 5000 });

            // 检查找到的输入框
            const inputs = await page.$$eval('input', inputs =>
                inputs.map(input => ({
                    type: input.type,
                    placeholder: input.placeholder,
                    name: input.name,
                    id: input.id
                }))
            );
            console.log('找到的输入框:', inputs);

            // 填写登录信息
            await page.fill('input[type="text"], input[placeholder*="用户"], input[name="username"]', 'testparent');
            await page.fill('input[type="password"], input[placeholder*="密码"], input[name="password"]', '123456');

            console.log('✅ 登录信息填写完成');

            // 尝试点击登录按钮
            const loginButton = await page.$('button[type="submit"], button:has-text("登录"), .el-button--primary');
            if (loginButton) {
                await loginButton.click();
                console.log('✅ 点击了登录按钮');
            } else {
                await page.press('input[type="password"]', 'Enter');
                console.log('✅ 按Enter键登录');
            }

            // 等待登录结果
            await page.waitForTimeout(5000);

            const loginUrl = page.url();
            console.log('登录后URL:', loginUrl);

            if (loginUrl.includes('/login')) {
                console.log('⚠️ 仍在登录页面，登录可能失败');

                // 检查页面中的错误信息
                const errorElements = await page.$$eval('.error, .alert, .message, [class*="error"]',
                    els => els.map(el => el.textContent.trim()).filter(text => text));

                if (errorElements.length > 0) {
                    console.log('发现的错误信息:', errorElements);
                }

                // 检查页面内容
                const pageContent = await page.content();
                const hasErrorKeywords = pageContent.includes('用户名或密码') ||
                                        pageContent.includes('登录失败') ||
                                        pageContent.includes('账号不存在');

                if (hasErrorKeywords) {
                    console.log('页面包含登录失败相关信息');
                }

            } else {
                console.log('✅ 登录成功，页面已跳转');
            }

            // 截图登录结果
            await page.screenshot({ path: 'login-test-result.png' });
            console.log('📸 登录结果截图已保存');

        } catch (error) {
            console.error('❌ 自动登录失败:', error.message);
        }

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    } finally {
        await browser.close();
    }
}

simpleLoginTest();
