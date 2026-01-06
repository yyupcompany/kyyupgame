const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function retestCenterPages() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message,
            stack: error.stack
        });
    });

    const pagesToTest = [
        {
            name: '教学中心主页',
            url: 'http://localhost:5173/centers',
            description: '重新测试教学中心主页（后端已启动）'
        },
        {
            name: '人事中心',
            url: 'http://localhost:5173/centers/personnel',
            description: '重新测试人事中心页面（后端已启动）'
        }
    ];

    for (const pageInfo of pagesToTest) {
        console.log(`\n🔍 重新测试页面: ${pageInfo.name}`);
        console.log(`📍 URL: ${pageInfo.url}`);

        // 清空之前的消息
        consoleMessages.length = 0;
        pageErrors.length = 0;

        try {
            // 记录开始时间
            const startTime = Date.now();

            // 访问页面
            const response = await page.goto(pageInfo.url, {
                waitUntil: 'networkidle',
                timeout: 30000
            });

            // 计算加载时间
            const loadTime = Date.now() - startTime;
            const loadStatus = response ? response.status() : 'failed';

            console.log(`✅ 页面加载状态: ${loadStatus} (${loadTime}ms)`);

            // 等待页面完全加载
            await page.waitForTimeout(5000);

            // 获取页面标题
            const title = await page.title();
            console.log(`📋 页面标题: ${title}`);

            // 检查页面内容
            const pageContent = await page.content();
            const hasContent = pageContent.includes('幼儿园招生管理系统') ||
                            pageContent.includes('main') ||
                            pageContent.includes('content') ||
                            pageContent.includes('中心');

            console.log(`📄 页面内容长度: ${pageContent.length} 字符`);
            console.log(`🎯 页面有意义内容: ${hasContent ? '存在' : '不存在'}`);

            // 检查是否有Vue应用渲染
            const vueApp = await page.$('#app');
            const appContent = vueApp ? await vueApp.innerHTML() : '';
            console.log(`📱 Vue应用内容: ${appContent.length > 100 ? '存在' : '不存在或很少'}`);

            // 查找可能的导航或侧边栏元素
            const navigationSelectors = [
                '.el-aside',
                '.sidebar',
                '.el-menu',
                '.navigation',
                '.main-header',
                '.header',
                '.breadcrumb'
            ];

            let foundNavigation = false;
            for (const selector of navigationSelectors) {
                const element = await page.$(selector);
                if (element && await element.isVisible()) {
                    console.log(`🧭 找到导航元素: ${selector}`);
                    foundNavigation = true;
                    break;
                }
            }

            if (!foundNavigation) {
                console.log(`🧭 未找到导航元素`);
            }

            // 检查控制台错误
            const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
            console.log(`🐛 控制台错误: ${errorMessages.length}个`);
            if (errorMessages.length > 0) {
                errorMessages.forEach((err, index) => {
                    console.log(`   ${index + 1}. ${err.text}`);
                });
            }

            // 检查页面错误
            console.log(`⚠️ 页面错误: ${pageErrors.length}个`);
            if (pageErrors.length > 0) {
                pageErrors.forEach((err, index) => {
                    console.log(`   ${index + 1}. ${err.message}`);
                });
            }

            // 截图
            try {
                const screenshot = await page.screenshot({
                    type: 'png',
                    fullPage: false
                });
                const screenshotPath = path.join(__dirname, 'test-screenshots', `retest_${pageInfo.name.replace(/\s+/g, '_')}_${Date.now()}.png`);

                fs.writeFileSync(screenshotPath, screenshot);
                console.log(`📸 截图已保存: ${screenshotPath}`);
            } catch (screenshotError) {
                console.log(`📸 截图失败: ${screenshotError.message}`);
            }

            // 尝试检查是否需要登录
            const loginElements = await page.$$('.login, [class*="login"], #login');
            if (loginElements.length > 0) {
                console.log(`🔐 检测到登录相关元素`);
            }

        } catch (error) {
            console.log(`❌ 页面测试失败: ${error.message}`);
        }

        // 等待一下再测试下一个页面
        await page.waitForTimeout(2000);
    }

    await browser.close();
    console.log('\n📊 重新测试完成!');
}

// 运行重新测试
retestCenterPages().catch(console.error);