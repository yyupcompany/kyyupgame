const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function parentCenterErrorTest() {
    console.log('🚀 开始家长中心侧边栏页面错误检测...');

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
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString()
        });

        // 实时输出错误消息
        if (msg.type() === 'error') {
            console.log(`🐛 控制台错误: ${msg.text()}`);
        }
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.log(`⚠️ 页面错误: ${error.message}`);
    });

    // 监听请求失败
    const failedRequests = [];
    page.on('requestfailed', request => {
        failedRequests.push({
            url: request.url(),
            failure: request.failure(),
            timestamp: new Date().toISOString()
        });
        console.log(`❌ 请求失败: ${request.url()} - ${request.failure().errorText}`);
    });

    const testResults = {
        timestamp: new Date().toISOString(),
        loginStatus: 'unknown',
        roleInfo: {},
        sidebarAnalysis: {},
        testedPages: [],
        errors: {
            console: [],
            page: [],
            network: [],
            notFound: []
        },
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
            errorCount: 0
        }
    };

    try {
        console.log('📍 第1步：访问登录页面');
        await page.goto('http://localhost:5173/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(2000);
        console.log('✅ 登录页面加载成功');

        console.log('📍 第2步：使用家长角色登录');

        // 先尝试快速体验登录
        try {
            const quickLoginButton = await page.locator('text=快速体验').first();
            if (await quickLoginButton.isVisible()) {
                await quickLoginButton.click();
                await page.waitForTimeout(2000);
                console.log('✅ 快速体验按钮点击成功');

                // 查找家长选项
                const parentOption = await page.locator('text=家长').first();
                if (await parentOption.isVisible()) {
                    await parentOption.click();
                    await page.waitForTimeout(5000);
                    console.log('✅ 家长角色选择成功');

                    testResults.loginStatus = 'success';
                    testResults.roleInfo = { role: 'parent', method: 'quick_experience' };
                } else {
                    throw new Error('未找到家长选项');
                }
            } else {
                throw new Error('未找到快速体验按钮');
            }
        } catch (quickLoginError) {
            console.log(`❌ 快速登录失败: ${quickLoginError.message}`);

            // 尝试直接登录（创建或使用现有家长账号）
            try {
                console.log('🔄 尝试直接登录家长账号...');

                // 输入家长账号
                const usernameInput = await page.locator('input[placeholder*="用户"], input[name="username"]').first();
                await usernameInput.fill('parent_test');

                // 输入密码
                const passwordInput = await page.locator('input[type="password"], input[placeholder*="密码"]').first();
                await passwordInput.fill('123456');

                // 点击登录
                const loginButton = await page.locator('button[type="submit"], .el-button--primary').first();
                await loginButton.click();

                await page.waitForTimeout(5000);

                const currentUrl = page.url();
                if (!currentUrl.includes('login')) {
                    testResults.loginStatus = 'success';
                    testResults.roleInfo = { role: 'parent', method: 'direct_login', username: 'parent_test' };
                    console.log('✅ 家长账号直接登录成功');
                } else {
                    throw new Error('登录后仍在登录页面');
                }
            } catch (directLoginError) {
                console.log(`❌ 直接登录也失败: ${directLoginError.message}`);
                testResults.loginStatus = 'failed';
            }
        }

        if (testResults.loginStatus === 'success') {
            console.log('📍 第3步：分析家长中心页面结构');

            // 检查当前页面
            const currentUrl = page.url();
            const pageTitle = await page.title();
            console.log(`📋 当前URL: ${currentUrl}`);
            console.log(`📋 页面标题: ${pageTitle}`);

            // 分析侧边栏结构
            console.log('📍 第4步：分析侧边栏导航结构');

            const sidebarAnalysis = {
                found: false,
                type: '',
                menuItems: [],
                parentRelatedItems: []
            };

            // 查找侧边栏
            const sidebarSelectors = [
                '.el-aside',
                '.sidebar',
                '.side-bar',
                '.el-menu-vertical',
                '.navigation-sidebar',
                '.el-menu'
            ];

            for (const selector of sidebarSelectors) {
                try {
                    const sidebar = await page.locator(selector).first();
                    if (await sidebar.isVisible()) {
                        sidebarAnalysis.found = true;
                        sidebarAnalysis.type = selector;
                        console.log(`✅ 找到侧边栏: ${selector}`);

                        // 获取所有菜单项
                        const menuItems = await sidebar.locator('li, .menu-item, .el-menu-item, .nav-item').all();
                        console.log(`📋 发现 ${menuItems.length} 个菜单项`);

                        for (let i = 0; i < Math.min(menuItems.length, 50); i++) {
                            try {
                                const item = menuItems[i];
                                const text = await item.textContent();
                                const isVisible = await item.isVisible();
                                const hasChildren = await item.locator('ul, .submenu').count() > 0;

                                if (text && text.trim() && isVisible) {
                                    const menuItemInfo = {
                                        index: i + 1,
                                        text: text.trim(),
                                        hasChildren,
                                        isVisible
                                    };

                                    // 检查是否是家长相关功能
                                    const parentKeywords = [
                                        '家长', 'parent', '孩子', '学生', '班级', 'class',
                                        '成绩', '考勤', '通知', '作业', '课程表', '照片',
                                        '视频', '费用', '请假', '沟通', '我的孩子', '成长',
                                        '家园', '互通', '联系', '老师'
                                    ];

                                    const isParentRelated = parentKeywords.some(keyword =>
                                        menuItemInfo.text.includes(keyword) ||
                                        menuItemInfo.text.toLowerCase().includes(keyword.toLowerCase())
                                    );

                                    if (isParentRelated) {
                                        sidebarAnalysis.parentRelatedItems.push({
                                            ...menuItemInfo,
                                            matchedKeywords: parentKeywords.filter(keyword =>
                                                menuItemInfo.text.includes(keyword) ||
                                                menuItemInfo.text.toLowerCase().includes(keyword.toLowerCase())
                                            )
                                        });
                                    }

                                    sidebarAnalysis.menuItems.push(menuItemInfo);
                                }
                            } catch (e) {
                                // 忽略单个项目的错误
                            }
                        }
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            testResults.sidebarAnalysis = sidebarAnalysis;

            console.log(`📊 侧边栏分析结果:`);
            console.log(`   - 侧边栏存在: ${sidebarAnalysis.found}`);
            console.log(`   - 菜单项总数: ${sidebarAnalysis.menuItems.length}`);
            console.log(`   - 家长相关功能: ${sidebarAnalysis.parentRelatedItems.length}`);

            if (sidebarAnalysis.parentRelatedItems.length > 0) {
                console.log('\n🎯 家长中心相关功能:');
                sidebarAnalysis.parentRelatedItems.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.text}`);
                });
            }

            console.log('\n📍 第5步：测试家长中心相关页面');

            // 定义要测试的页面
            const pagesToTest = [
                {
                    name: '家长中心主页',
                    url: 'http://localhost:5173/parent',
                    keywords: ['家长', 'parent']
                },
                {
                    name: '我的孩子',
                    url: 'http://localhost:5173/parent/children',
                    keywords: ['孩子', 'student', '我的孩子']
                },
                {
                    name: '班级信息',
                    url: 'http://localhost:5173/parent/class',
                    keywords: ['班级', 'class']
                },
                {
                    name: '成绩查看',
                    url: 'http://localhost:5173/parent/grades',
                    keywords: ['成绩', 'grade']
                },
                {
                    name: '考勤记录',
                    url: 'http://localhost:5173/parent/attendance',
                    keywords: ['考勤', 'attendance']
                },
                {
                    name: '通知公告',
                    url: 'http://localhost:5173/parent/notifications',
                    keywords: ['通知', 'notification']
                },
                {
                    name: '作业查看',
                    url: 'http://localhost:5173/parent/homework',
                    keywords: ['作业', 'homework']
                },
                {
                    name: '课程表',
                    url: 'http://localhost:5173/parent/schedule',
                    keywords: ['课程表', 'schedule']
                },
                {
                    name: '照片相册',
                    url: 'http://localhost:5173/parent/photos',
                    keywords: ['照片', 'photo', '相册']
                },
                {
                    name: '视频监控',
                    url: 'http://localhost:5173/parent/videos',
                    keywords: ['视频', 'video']
                },
                {
                    name: '费用管理',
                    url: 'http://localhost:5173/parent/fees',
                    keywords: ['费用', 'fee', '缴费']
                },
                {
                    name: '请假申请',
                    url: 'http://localhost:5173/parent/leave',
                    keywords: ['请假', 'leave']
                },
                {
                    name: '家校沟通',
                    url: 'http://localhost:5173/parent/communication',
                    keywords: ['沟通', 'communication', '联系']
                }
            ];

            // 添加从侧边栏发现的家长相关页面
            if (sidebarAnalysis.parentRelatedItems.length > 0) {
                for (const item of sidebarAnalysis.parentRelatedItems) {
                    // 尝试构造URL
                    const urlSlug = item.text.toLowerCase()
                        .replace(/[^\w\u4e00-\u9fa5]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');

                    if (urlSlug && !pagesToTest.some(p => p.name === item.text)) {
                        pagesToTest.push({
                            name: item.text,
                            url: `http://localhost:5173/${urlSlug}`,
                            keywords: item.matchedKeywords
                        });
                    }
                }
            }

            for (const pageInfo of pagesToTest) {
                console.log(`\n🔍 测试页面: ${pageInfo.name}`);
                console.log(`📍 URL: ${pageInfo.url}`);

                // 清空之前的错误记录
                const previousConsoleErrors = consoleMessages.length;
                const previousPageErrors = pageErrors.length;
                const previousFailedRequests = failedRequests.length;

                const pageResult = {
                    name: pageInfo.name,
                    url: pageInfo.url,
                    keywords: pageInfo.keywords,
                    loadStatus: 'unknown',
                    loadTime: 0,
                    title: '',
                    httpStatus: null,
                    content: {
                        hasMainContent: false,
                        hasError404: false,
                        hasError500: false,
                        errorMessage: '',
                        contentPreview: ''
                    },
                    errors: {
                        console: [],
                        page: [],
                        network: []
                    },
                    screenshot: null,
                    passed: false
                };

                try {
                    const startTime = Date.now();

                    // 访问页面
                    const response = await page.goto(pageInfo.url, {
                        waitUntil: 'networkidle',
                        timeout: 15000
                    });

                    pageResult.loadTime = Date.now() - startTime;
                    pageResult.httpStatus = response ? response.status() : null;

                    await page.waitForTimeout(3000);

                    pageResult.title = await page.title();

                    // 检查页面状态
                    if (pageResult.httpStatus === 404) {
                        pageResult.content.hasError404 = true;
                        pageResult.content.errorMessage = '页面未找到 (404)';
                        console.log(`❌ 404错误: 页面未找到`);
                    } else if (pageResult.httpStatus === 500) {
                        pageResult.content.hasError500 = true;
                        pageResult.content.errorMessage = '服务器错误 (500)';
                        console.log(`❌ 500错误: 服务器错误`);
                    } else if (pageResult.title.includes('404') || pageResult.title.includes('Not Found')) {
                        pageResult.content.hasError404 = true;
                        pageResult.content.errorMessage = '页面标题显示404错误';
                        console.log(`❌ 标题显示404错误`);
                    } else {
                        // 检查页面内容
                        try {
                            const bodyText = await page.locator('body').textContent();
                            pageResult.content.contentPreview = bodyText ? bodyText.substring(0, 200) : '';

                            // 检查主要内容区域
                            const mainContent = await page.$('main, .main-content, .content, .el-main, .container');
                            if (mainContent) {
                                const contentText = await mainContent.textContent();
                                pageResult.content.hasMainContent = contentText && contentText.trim().length > 20;
                            }

                            // 检查错误消息
                            const errorElements = await page.$$('.error-message, .error, .alert-error, [class*="error"]');
                            if (errorElements.length > 0) {
                                const errorText = await errorElements[0].textContent();
                                if (errorText && errorText.trim()) {
                                    pageResult.content.errorMessage = errorText.trim();
                                }
                            }

                            console.log(`📄 主要内容: ${pageResult.content.hasMainContent ? '存在' : '不存在'}`);
                            if (pageResult.content.errorMessage) {
                                console.log(`⚠️ 错误消息: ${pageResult.content.errorMessage}`);
                            }

                        } catch (contentError) {
                            console.log(`内容检查失败: ${contentError.message}`);
                        }
                    }

                    // 收集错误信息
                    pageResult.errors.console = consoleMessages.slice(previousConsoleErrors)
                        .filter(msg => msg.type === 'error');
                    pageResult.errors.page = pageErrors.slice(previousPageErrors);
                    pageResult.errors.network = failedRequests.slice(previousFailedRequests)
                        .filter(req => req.url.includes(pageInfo.url) || req.failure.errorText.includes('404'));

                    // 截图
                    try {
                        const screenshotName = `parent_test_${pageInfo.name.replace(/[^\w\u4e00-\u9fa5]/g, '_')}_${Date.now()}.png`;
                        const screenshotPath = path.join(__dirname, screenshotName);

                        await page.screenshot({
                            path: screenshotPath,
                            fullPage: false
                        });
                        pageResult.screenshot = screenshotPath;
                        console.log(`📸 截图已保存: ${screenshotName}`);
                    } catch (screenshotError) {
                        console.log(`📸 截图失败: ${screenshotError.message}`);
                    }

                    // 判断测试是否通过
                    pageResult.passed = (
                        pageResult.httpStatus !== 404 &&
                        !pageResult.content.hasError404 &&
                        !pageResult.content.hasError500 &&
                        pageResult.errors.console.length === 0 &&
                        pageResult.errors.page.length === 0 &&
                        (pageResult.content.hasMainContent || pageInfo.url.includes('parent'))
                    );

                    console.log(`📊 测试结果:`);
                    console.log(`   - HTTP状态: ${pageResult.httpStatus}`);
                    console.log(`   - 加载时间: ${pageResult.loadTime}ms`);
                    console.log(`   - 控制台错误: ${pageResult.errors.console.length}个`);
                    console.log(`   - 页面错误: ${pageResult.errors.page.length}个`);
                    console.log(`   - 网络错误: ${pageResult.errors.network.length}个`);
                    console.log(`   ${pageResult.passed ? '✅ 通过' : '❌ 失败'}`);

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
                    testResults.summary.errorCount +=
                        pageResult.errors.console.length +
                        pageResult.errors.page.length +
                        pageResult.errors.network.length;
                }

                // 等待一下再测试下一个页面
                await page.waitForTimeout(1000);
            }

        } else {
            console.log('❌ 登录失败，跳过页面测试');
        }

    } catch (error) {
        console.log(`❌ 测试过程出错: ${error.message}`);
        testResults.errors.page.push({
            message: error.message,
            stack: error.stack
        });
    }

    // 收集所有错误
    testResults.errors.console = consoleMessages.filter(msg => msg.type === 'error');
    testResults.errors.page = pageErrors;
    testResults.errors.network = failedRequests;
    testResults.errors.notFound = testResults.testedPages.filter(p =>
        p.httpStatus === 404 || p.content.hasError404
    );

    await browser.close();

    // 保存测试结果
    const resultsPath = path.join(__dirname, 'parent-center-error-test-report.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    console.log('\n📊 家长中心错误检测完成!');
    console.log(`📄 详细报告: ${resultsPath}`);
    console.log(`🔐 登录状态: ${testResults.loginStatus}`);
    console.log(`📋 侧边栏: ${testResults.sidebarAnalysis.found ? '存在' : '不存在'}`);
    console.log(`📈 测试统计:`);
    console.log(`   - 总页面数: ${testResults.summary.total}`);
    console.log(`   - 通过页面: ${testResults.summary.passed}`);
    console.log(`   - 失败页面: ${testResults.summary.failed}`);
    console.log(`   - 错误总数: ${testResults.summary.errorCount}`);
    console.log(`🐛 控制台错误: ${testResults.errors.console.length}个`);
    console.log(`⚠️ 页面错误: ${testResults.errors.page.length}个`);
    console.log(`🌐 网络错误: ${testResults.errors.network.length}个`);
    console.log(`❌ 404错误: ${testResults.errors.notFound.length}个`);

    return testResults;
}

// 运行测试
parentCenterErrorTest().catch(console.error);