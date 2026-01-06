const { chromium } = require('playwright');

async function parentCenterFinalTest() {
    console.log('🚀 开始家长中心最终测试...');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push({
                text: msg.text(),
                location: msg.location()
            });
            console.log(`🐛 控制台错误: ${msg.text()}`);
        }
    });

    try {
        // 1. 访问登录页面
        console.log('📍 第1步：访问登录页面');
        await page.goto('http://localhost:5173/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // 2. 家长快速登录
        console.log('📍 第2步：家长快速登录');
        const quickLoginButton = await page.locator('text=快速体验').first();
        if (await quickLoginButton.isVisible()) {
            await quickLoginButton.click();
            await page.waitForTimeout(2000);

            const parentOption = await page.locator('text=家长').first();
            if (await parentOption.isVisible()) {
                await parentOption.click();
                await page.waitForTimeout(5000);
            }
        }

        // 3. 检查是否登录成功
        console.log('📍 第3步：检查登录状态');
        const currentUrl = page.url();
        const pageTitle = await page.title();

        // 4. 尝试访问家长中心页面
        console.log('📍 第4步：访问家长中心页面');
        await page.goto('http://localhost:5173/parent-center/dashboard', {
            waitUntil: 'networkidle',
            timeout: 15000
        });

        await page.waitForTimeout(3000);

        // 检查最终状态
        const finalUrl = page.url();
        const finalTitle = await page.title();

        // 生成测试报告
        const testResults = {
            timestamp: new Date().toISOString(),
            initialLogin: {
                url: currentUrl,
                title: pageTitle
            },
            parentCenterAccess: {
                url: finalUrl,
                title: finalTitle,
                success: !finalUrl.includes('login') && finalUrl.includes('parent-center')
            },
            consoleErrors: consoleMessages,
            summary: {
                totalErrors: consoleMessages.length,
                loginSuccess: !currentUrl.includes('login'),
                parentCenterAccessible: !finalUrl.includes('login') && finalUrl.includes('parent-center')
            }
        };

        console.log('\n📊 测试结果:');
        console.log(`   - 登录状态: ${testResults.initialLogin.success ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   - 家长中心访问: ${testResults.parentCenterAccess.success ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   - 控制台错误: ${testResults.summary.totalErrors}个`);

        if (consoleMessages.length > 0) {
            console.log('\n🐛 控制台错误详情:');
            consoleMessages.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.text}`);
            });
        }

        // 截图
        try {
            await page.screenshot({
                path: 'parent-center-final-test.png',
                fullPage: true
            });
            console.log('📸 测试截图已保存');
        } catch (e) {
            console.log('📸 截图失败');
        }

        // 保存结果
        const fs = require('fs');
        fs.writeFileSync('parent-center-final-test-report.json', JSON.stringify(testResults, null, 2));
        console.log('📄 测试报告已保存');

    } catch (error) {
        console.error('❌ 测试过程出错:', error);
    } finally {
        await browser.close();
    }
}

parentCenterFinalTest().catch(console.error);