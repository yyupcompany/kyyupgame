const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testCentersWithLogin() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const testResults = {
        timestamp: new Date().toISOString(),
        loginStatus: 'unknown',
        testedPages: [],
        summary: {
            total: 0,
            passed: 0,
            failed: 0
        }
    };

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

    try {
        console.log('🔐 开始登录流程...');

        // 访问主页
        await page.goto('http://localhost:5173/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        // 查找登录表单
        const loginSelectors = [
            'input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]',
            'input[name="password"], input[placeholder*="密码"], input[type="password"]',
            'button[type="submit"], .el-button--primary, [class*="login"] button'
        ];

        let loginSuccess = false;

        try {
            // 输入用户名
            const usernameInput = await page.waitForSelector('input[placeholder*="用户"], input[name="username"], #username', { timeout: 10000 });
            await usernameInput.fill('admin');

            // 输入密码
            const passwordInput = await page.waitForSelector('input[type="password"], input[placeholder*="密码"], input[name="password"]', { timeout: 5000 });
            await passwordInput.fill('123456');

            // 点击登录按钮
            const loginButton = await page.waitForSelector('button[type="submit"], .el-button--primary, [class*="login"] button', { timeout: 5000 });
            await loginButton.click();

            // 等待登录完成
            await page.waitForTimeout(3000);

            // 检查是否登录成功
            const currentUrl = page.url();
            const pageTitle = await page.title();

            console.log(`📍 登录后URL: ${currentUrl}`);
            console.log(`📋 登录后标题: ${pageTitle}`);

            if (!currentUrl.includes('login') && !pageTitle.includes('登录')) {
                loginSuccess = true;
                testResults.loginStatus = 'success';
                console.log('✅ 登录成功!');
            } else {
                testResults.loginStatus = 'failed';
                console.log('❌ 登录失败');
            }

        } catch (loginError) {
            testResults.loginStatus = 'error';
            console.log(`❌ 登录过程出错: ${loginError.message}`);
        }

        if (loginSuccess) {
            console.log('\n🎯 开始测试教学中心页面...');

            const pagesToTest = [
                {
                    name: '教学中心主页',
                    url: 'http://localhost:5173/centers',
                    description: '测试教学中心主页的侧边栏和功能'
                },
                {
                    name: '人事中心',
                    url: 'http://localhost:5173/centers/personnel',
                    description: '测试人事中心页面和相关功能'
                },
                {
                    name: '活动中心',
                    url: 'http://localhost:5173/centers/activity',
                    description: '测试活动中心页面和相关功能'
                },
                {
                    name: '招生中心',
                    url: 'http://localhost:5173/centers/enrollment',
                    description: '测试招生中心页面和相关功能'
                },
                {
                    name: '营销中心',
                    url: 'http://localhost:5173/centers/marketing',
                    description: '测试营销中心页面和相关功能'
                },
                {
                    name: 'AI中心',
                    url: 'http://localhost:5173/centers/ai',
                    description: '测试AI中心页面和相关功能'
                },
                {
                    name: '系统中心',
                    url: 'http://localhost:5173/centers/system',
                    description: '测试系统中心页面和相关功能'
                }
            ];

            for (const pageInfo of pagesToTest) {
                console.log(`\n🔍 测试页面: ${pageInfo.name}`);
                console.log(`📍 URL: ${pageInfo.url}`);

                // 清空之前的消息
                consoleMessages.length = 0;
                pageErrors.length = 0;

                const pageResult = {
                    name: pageInfo.name,
                    url: pageInfo.url,
                    description: pageInfo.description,
                    loadStatus: 'unknown',
                    loadTime: 0,
                    title: '',
                    content: {
                        hasMainContent: false,
                        hasSidebar: false,
                        navigation: [],
                        interactiveElements: [],
                        errorElements: []
                    },
                    errors: {
                        console: [],
                        page: []
                    },
                    screenshot: null,
                    passed: false
                };

                try {
                    // 记录开始时间
                    const startTime = Date.now();

                    // 访问页面
                    const response = await page.goto(pageInfo.url, {
                        waitUntil: 'networkidle',
                        timeout: 30000
                    });

                    // 计算加载时间
                    pageResult.loadTime = Date.now() - startTime;
                    pageResult.loadStatus = response ? response.status() : 'failed';

                    // 等待页面完全加载
                    await page.waitForTimeout(3000);

                    // 获取页面标题
                    pageResult.title = await page.title();

                    // 检查是否被重定向到登录页面
                    if (pageResult.title.includes('登录') || page.url().includes('login')) {
                        console.log('🔄 页面重定向到登录页面');
                        pageResult.loadStatus = 'redirect_to_login';
                        pageResult.errors.page.push({
                            message: '页面重定向到登录页面，可能权限不足',
                            type: 'auth_error'
                        });
                    } else {
                        // 检查主要内容区域
                        try {
                            const mainContent = await page.$('main, .main-content, .content, .el-main');
                            if (mainContent) {
                                const contentText = await mainContent.textContent();
                                pageResult.content.hasMainContent = contentText && contentText.trim().length > 10;
                                console.log(`📄 主要内容: ${pageResult.content.hasMainContent ? '存在' : '不存在'}`);
                            }

                            // 检查侧边栏
                            const sidebarSelectors = [
                                '.el-aside',
                                '.sidebar',
                                '.side-bar',
                                '.el-menu-vertical',
                                '.navigation-sidebar'
                            ];

                            for (const selector of sidebarSelectors) {
                                const sidebar = await page.$(selector);
                                if (sidebar && await sidebar.isVisible()) {
                                    pageResult.content.hasSidebar = true;
                                    console.log(`📱 找到侧边栏: ${selector}`);
                                    break;
                                }
                            }

                            // 查找导航元素
                            const navElements = await page.$$('.el-menu-item, .nav-item, .breadcrumb-item, a[href*="centers"]');
                            for (const nav of navElements.slice(0, 10)) {
                                try {
                                    const text = await nav.textContent();
                                    const isVisible = await nav.isVisible();
                                    if (text && isVisible && text.trim().length > 0) {
                                        pageResult.content.navigation.push({
                                            text: text.trim(),
                                            visible: isVisible
                                        });
                                    }
                                } catch (e) {
                                    // 忽略个别元素的错误
                                }
                            }

                            console.log(`🧭 导航元素: ${pageResult.content.navigation.length}个`);

                            // 查找交互元素
                            const interactiveElements = await page.$$('button:not([disabled]), a[href], input:not([disabled]), .el-button:not([disabled])');
                            for (const element of interactiveElements.slice(0, 20)) {
                                try {
                                    const isVisible = await element.isVisible();
                                    const text = await element.textContent();
                                    if (isVisible) {
                                        pageResult.content.interactiveElements.push({
                                            text: text ? text.trim().substring(0, 30) : '',
                                            type: await element.evaluate(el => el.tagName.toLowerCase())
                                        });
                                    }
                                } catch (e) {
                                    // 忽略个别元素的错误
                                }
                            }

                            console.log(`🔗 交互元素: ${pageResult.content.interactiveElements.length}个`);

                        } catch (contentError) {
                            console.log(`内容检查失败: ${contentError.message}`);
                        }
                    }

                    // 收集错误信息
                    pageResult.errors.console = consoleMessages.filter(msg => msg.type === 'error');
                    pageResult.errors.page = pageResult.errors.page.concat(pageErrors);

                    // 截图
                    try {
                        const screenshot = await page.screenshot({
                            type: 'png',
                            fullPage: false
                        });
                        const screenshotPath = path.join(__dirname, 'test-screenshots', `logged_${pageInfo.name.replace(/\s+/g, '_')}_${Date.now()}.png`);

                        fs.writeFileSync(screenshotPath, screenshot);
                        pageResult.screenshot = screenshotPath;
                        console.log(`📸 截图已保存: ${screenshotPath}`);
                    } catch (screenshotError) {
                        console.log(`📸 截图失败: ${screenshotError.message}`);
                    }

                    // 判断页面是否通过测试
                    pageResult.passed = (
                        pageResult.loadStatus === 200 &&
                        !pageResult.title.includes('登录') &&
                        (pageResult.content.hasMainContent || pageResult.content.navigation.length > 0)
                    );

                    console.log(`✅ 页面加载状态: ${pageResult.loadStatus} (${pageResult.loadTime}ms)`);
                    console.log(`📋 页面标题: ${pageResult.title}`);
                    console.log(`📱 侧边栏: ${pageResult.content.hasSidebar ? '存在' : '不存在'}`);
                    console.log(`🐛 控制台错误: ${pageResult.errors.console.length}个`);
                    console.log(`⚠️ 页面错误: ${pageResult.errors.page.length}个`);
                    console.log(`${pageResult.passed ? '✅' : '❌'} 测试结果: ${pageResult.passed ? '通过' : '失败'}`);

                } catch (error) {
                    pageResult.loadStatus = 'failed';
                    pageResult.errors.page.push({
                        message: error.message,
                        stack: error.stack
                    });
                    console.log(`❌ 页面测试失败: ${error.message}`);
                }

                testResults.testedPages.push(pageResult);
                testResults.summary.total++;
                if (pageResult.passed) {
                    testResults.summary.passed++;
                } else {
                    testResults.summary.failed++;
                }

                // 等待一下再测试下一个页面
                await page.waitForTimeout(2000);
            }
        }

    } catch (error) {
        console.log(`❌ 测试过程出错: ${error.message}`);
        testResults.loginStatus = 'error';
    }

    await browser.close();

    // 保存测试结果
    const resultsPath = path.join(__dirname, 'centers-test-results-with-login.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    console.log(`\n📊 测试完成! 结果已保存到: ${resultsPath}`);
    console.log(`🔐 登录状态: ${testResults.loginStatus}`);
    if (testResults.summary.total > 0) {
        console.log(`📈 总计: ${testResults.summary.total}个页面`);
        console.log(`✅ 通过: ${testResults.summary.passed}个页面`);
        console.log(`❌ 失败: ${testResults.summary.failed}个页面`);
    }

    return testResults;
}

// 运行测试
testCentersWithLogin().catch(console.error);