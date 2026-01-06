const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testCenterPages() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const testResults = {
        timestamp: new Date().toISOString(),
        summary: {
            total: 0,
            passed: 0,
            failed: 0
        },
        pages: []
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

    // 监听网络请求
    const networkRequests = [];
    page.on('request', request => {
        networkRequests.push({
            url: request.url(),
            method: request.method(),
            status: 'pending'
        });
    });

    page.on('response', response => {
        const request = networkRequests.find(req => req.url === response.url());
        if (request) {
            request.status = response.status();
            request.ok = response.ok();
        }
    });

    const pagesToTest = [
        {
            name: '教学中心主页',
            url: 'http://localhost:5173/centers',
            description: '测试教学中心主页的加载和侧边栏功能'
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

        const pageResult = {
            name: pageInfo.name,
            url: pageInfo.url,
            description: pageInfo.description,
            loadStatus: 'unknown',
            loadTime: 0,
            title: '',
            sidebar: {
                exists: false,
                visible: false,
                interactive: false,
                menuItems: []
            },
            content: {
                mainElements: [],
                interactiveElements: [],
                errorElements: []
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
            // 清空之前的消息
            consoleMessages.length = 0;
            pageErrors.length = 0;
            networkRequests.length = 0;

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

            // 等待页面加载完成
            await page.waitForTimeout(3000);

            // 获取页面标题
            pageResult.title = await page.title();

            // 检查侧边栏
            try {
                // 查找可能的侧边栏元素
                const sidebarSelectors = [
                    '.sidebar',
                    '.side-bar',
                    '.sidebar-container',
                    '.sidebar-wrapper',
                    '[class*="sidebar"]',
                    '[class*="side-bar"]',
                    '.el-aside',
                    '.el-menu',
                    '.navigation',
                    '.nav-sidebar'
                ];

                for (const selector of sidebarSelectors) {
                    const sidebar = await page.$(selector);
                    if (sidebar) {
                        pageResult.sidebar.exists = true;
                        pageResult.sidebar.visible = await sidebar.isVisible();

                        if (pageResult.sidebar.visible) {
                            // 查找侧边栏菜单项
                            const menuItems = await page.$$(`${selector} .el-menu-item, ${selector} [class*="menu-item"], ${selector} a, ${selector} button`);
                            pageResult.sidebar.menuItems = [];

                            for (const item of menuItems.slice(0, 10)) { // 限制只获取前10个菜单项
                                try {
                                    const text = await item.textContent();
                                    const isVisible = await item.isVisible();
                                    const isEnabled = await item.isEnabled();

                                    if (text && isVisible) {
                                        pageResult.sidebar.menuItems.push({
                                            text: text.trim(),
                                            visible: isVisible,
                                            enabled: isEnabled,
                                            selector: await item.evaluate(el => el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').join('.') : ''))
                                        });
                                    }
                                } catch (e) {
                                    // 忽略个别菜单项的错误
                                }
                            }

                            // 测试侧边栏交互
                            if (pageResult.sidebar.menuItems.length > 0) {
                                const firstItem = menuItems[0];
                                if (firstItem && await firstItem.isVisible() && await firstItem.isEnabled()) {
                                    try {
                                        await firstItem.hover();
                                        pageResult.sidebar.interactive = true;
                                    } catch (e) {
                                        pageResult.sidebar.interactive = false;
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            } catch (sidebarError) {
                console.log(`侧边栏检查失败: ${sidebarError.message}`);
            }

            // 检查页面主要内容元素
            try {
                // 查找主要内容元素
                const mainSelectors = [
                    'main',
                    '.main-content',
                    '.content',
                    '.page-content',
                    '.container',
                    '.el-main',
                    '[class*="content"]'
                ];

                for (const selector of mainSelectors) {
                    const element = await page.$(selector);
                    if (element && await element.isVisible()) {
                        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                        const hasContent = await element.evaluate(el => el.textContent.trim().length > 0);

                        pageResult.content.mainElements.push({
                            selector,
                            tagName,
                            hasContent,
                            visible: true
                        });
                    }
                }

                // 查找交互元素
                const interactiveSelectors = [
                    'button:not([disabled])',
                    'a[href]',
                    'input:not([disabled])',
                    'select:not([disabled])',
                    '.el-button:not([disabled])',
                    '.el-link',
                    '[role="button"]',
                    '.clickable'
                ];

                for (const selector of interactiveSelectors) {
                    const elements = await page.$$(selector);
                    for (const element of elements.slice(0, 20)) { // 限制只获取前20个元素
                        try {
                            const isVisible = await element.isVisible();
                            const isEnabled = await element.isEnabled();
                            const text = await element.textContent();

                            if (isVisible) {
                                pageResult.content.interactiveElements.push({
                                    selector,
                                    text: text ? text.trim().substring(0, 50) : '',
                                    visible: isVisible,
                                    enabled: isEnabled,
                                    tagName: await element.evaluate(el => el.tagName.toLowerCase())
                                });
                            }
                        } catch (e) {
                            // 忽略个别元素的错误
                        }
                    }
                }

                // 查找可能的错误元素
                const errorSelectors = [
                    '.error',
                    '.error-message',
                    '[class*="error"]',
                    '.warning',
                    '.alert',
                    '[role="alert"]',
                    '.el-message--error',
                    '.el-notification--error'
                ];

                for (const selector of errorSelectors) {
                    const elements = await page.$$(selector);
                    for (const element of elements) {
                        try {
                            const isVisible = await element.isVisible();
                            const text = await element.textContent();

                            if (isVisible && text) {
                                pageResult.content.errorElements.push({
                                    selector,
                                    text: text.trim(),
                                    visible: isVisible
                                });
                            }
                        } catch (e) {
                            // 忽略个别元素的错误
                        }
                    }
                }
            } catch (contentError) {
                console.log(`内容检查失败: ${contentError.message}`);
            }

            // 收集错误信息
            pageResult.errors.console = consoleMessages.filter(msg => msg.type === 'error');
            pageResult.errors.page = pageErrors;
            pageResult.errors.network = networkRequests.filter(req => req.status >= 400);

            // 截图
            try {
                const screenshot = await page.screenshot({
                    type: 'png',
                    fullPage: false
                });
                const screenshotPath = path.join(__dirname, 'test-screenshots', `${pageInfo.name.replace(/\s+/g, '_')}_${Date.now()}.png`);

                // 确保截图目录存在
                const screenshotDir = path.dirname(screenshotPath);
                if (!fs.existsSync(screenshotDir)) {
                    fs.mkdirSync(screenshotDir, { recursive: true });
                }

                fs.writeFileSync(screenshotPath, screenshot);
                pageResult.screenshot = screenshotPath;
            } catch (screenshotError) {
                console.log(`截图失败: ${screenshotError.message}`);
            }

            // 判断页面是否通过测试
            pageResult.passed = (
                pageResult.loadStatus === 200 &&
                pageResult.errors.console.length === 0 &&
                pageResult.errors.page.length === 0 &&
                pageResult.content.mainElements.length > 0
            );

            console.log(`✅ 页面加载状态: ${pageResult.loadStatus} (${pageResult.loadTime}ms)`);
            console.log(`📋 页面标题: ${pageResult.title}`);
            console.log(`📱 侧边栏: ${pageResult.sidebar.exists ? '存在' : '不存在'} ${pageResult.sidebar.visible ? '- 可见' : '- 不可见'}`);
            console.log(`📝 侧边栏菜单项: ${pageResult.sidebar.menuItems.length}个`);
            console.log(`🎯 主要内容元素: ${pageResult.content.mainElements.length}个`);
            console.log(`🔗 交互元素: ${pageResult.content.interactiveElements.length}个`);
            console.log(`❌ 错误元素: ${pageResult.content.errorElements.length}个`);
            console.log(`🐛 控制台错误: ${pageResult.errors.console.length}个`);
            console.log(`📡 网络错误: ${pageResult.errors.network.length}个`);
            console.log(`${pageResult.passed ? '✅' : '❌'} 测试结果: ${pageResult.passed ? '通过' : '失败'}`);

        } catch (error) {
            pageResult.loadStatus = 'failed';
            pageResult.errors.page.push({
                message: error.message,
                stack: error.stack
            });
            console.log(`❌ 页面测试失败: ${error.message}`);
        }

        testResults.pages.push(pageResult);
        testResults.summary.total++;
        if (pageResult.passed) {
            testResults.summary.passed++;
        } else {
            testResults.summary.failed++;
        }

        // 等待一下再测试下一个页面
        await page.waitForTimeout(2000);
    }

    await browser.close();

    // 保存测试结果
    const resultsPath = path.join(__dirname, 'center-pages-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    console.log(`\n📊 测试完成! 结果已保存到: ${resultsPath}`);
    console.log(`📈 总计: ${testResults.summary.total}个页面`);
    console.log(`✅ 通过: ${testResults.summary.passed}个页面`);
    console.log(`❌ 失败: ${testResults.summary.failed}个页面`);

    return testResults;
}

// 运行测试
testCenterPages().catch(console.error);