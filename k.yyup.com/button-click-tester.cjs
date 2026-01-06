#!/usr/bin/env node

/**
 * 自动化按钮点击测试脚本
 * 用于测试所有侧边栏页面中的按钮是否可以正常点击
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置参数
const CONFIG = {
    baseUrl: 'http://localhost:5173',
    headless: true, // 必须使用无头模式
    timeout: 30000,
    slowMo: 100,
    screenshotsDir: './test-screenshots',
    reportsDir: './test-reports',
    maxConcurrentPages: 3, // 并发页面数量
    retryCount: 2, // 失败重试次数
};

// 测试结果存储
const testResults = {
    startTime: new Date().toISOString(),
    endTime: null,
    totalButtons: 0,
    successfulClicks: 0,
    failedClicks: 0,
    errors: [],
    pages: [],
    summary: {}
};

// 登录凭据
const CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
};

// 日志函数
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
        console.log(logMessage, data);
    } else {
        console.log(logMessage);
    }

    // 记录错误到结果中
    if (level === 'error') {
        testResults.errors.push({
            timestamp,
            message,
            data
        });
    }
}

// 创建目录
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// 截图保存
async function takeScreenshot(page, name, prefix = 'button-test') {
    try {
        const screenshotPath = path.join(CONFIG.screenshotsDir, `${prefix}-${name}-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        log('info', `Screenshot saved: ${screenshotPath}`);
        return screenshotPath;
    } catch (error) {
        log('error', `Failed to take screenshot: ${error.message}`);
        return null;
    }
}

// 监听控制台错误
function setupConsoleErrorHandling(page) {
    const consoleErrors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push({
                text: msg.text(),
                location: msg.location(),
                timestamp: new Date().toISOString()
            });
        }
    });

    page.on('pageerror', error => {
        consoleErrors.push({
            text: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    });

    return consoleErrors;
}

// 监听网络错误
function setupNetworkErrorHandling(page) {
    const networkErrors = [];

    page.on('response', response => {
        if (response.status() >= 400) {
            networkErrors.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                timestamp: new Date().toISOString()
            });
        }
    });

    page.on('requestfailed', request => {
        networkErrors.push({
            url: request.url(),
            failure: request.failure(),
            timestamp: new Date().toISOString()
        });
    });

    return networkErrors;
}

// 登录系统
async function login(browser) {
    const page = await browser.newPage();
    const consoleErrors = setupConsoleErrorHandling(page);
    const networkErrors = setupNetworkErrorHandling(page);

    try {
        log('info', `Navigating to login page: ${CONFIG.baseUrl}`);
        await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });

        // 等待登录表单加载
        await page.waitForSelector('#username, [placeholder*="用户名"], [placeholder*="账号"]', { timeout: 10000 });

        // 填写登录信息
        await page.fill('#username, [placeholder*="用户名"], [placeholder*="账号"]', CREDENTIALS.username);
        await page.fill('#password, [placeholder*="密码"]', CREDENTIALS.password);

        // 截图：登录前
        await takeScreenshot(page, 'before-login');

        // 点击登录按钮
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
            page.click('button[type="submit"], .login-btn, [class*="login"]')
        ]);

        // 检查是否登录成功
        await page.waitForSelector('.el-menu, .sidebar, [class*="nav"], .layout', { timeout: 10000 });

        // 截图：登录后
        await takeScreenshot(page, 'after-login');

        // 检查控制台和网络错误
        if (consoleErrors.length > 0) {
            log('warn', `Login completed with ${consoleErrors.length} console errors`, consoleErrors);
        }
        if (networkErrors.length > 0) {
            log('warn', `Login completed with ${networkErrors.length} network errors`, networkErrors);
        }

        log('info', 'Login successful');
        return { page, consoleErrors, networkErrors };

    } catch (error) {
        await takeScreenshot(page, 'login-error');
        log('error', `Login failed: ${error.message}`);
        throw error;
    }
}

// 获取所有侧边栏菜单项
async function getSidebarMenuItems(page) {
    try {
        log('info', 'Extracting sidebar menu items...');

        // 等待侧边栏加载
        await page.waitForSelector('.el-menu, .sidebar, [class*="nav"], .layout', { timeout: 10000 });

        // 获取所有菜单项
        const menuItems = await page.evaluate(() => {
            const items = [];

            // 查找菜单链接
            const links = document.querySelectorAll('a[href*="/"], .el-menu-item, .menu-item, [class*="nav-item"]');

            links.forEach(link => {
                const href = link.href || link.getAttribute('href') || '';
                const text = link.textContent?.trim() || '';
                const id = link.id || link.getAttribute('data-id') || '';

                // 过滤掉外部链接和无效链接
                if (href && href.includes('/') && !href.includes('http') && text) {
                    items.push({
                        href,
                        text,
                        id,
                        element: link.tagName.toLowerCase()
                    });
                }
            });

            return items;
        });

        log('info', `Found ${menuItems.length} menu items`);
        return menuItems;

    } catch (error) {
        log('error', `Failed to extract menu items: ${error.message}`);
        return [];
    }
}

// 获取页面中的所有按钮
async function getButtonsInPage(page) {
    try {
        const buttons = await page.evaluate(() => {
            const buttonList = [];

            // 查找所有可能的按钮元素
            const selectors = [
                'button',
                '.el-button',
                '.btn',
                '[role="button"]',
                'input[type="button"]',
                'input[type="submit"]',
                '.el-tag',
                '.el-badge',
                '.clickable',
                '[class*="btn"]',
                '[class*="button"]',
                '[onclick]',
                '.el-link'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // 排除隐藏元素
                    if (element.offsetParent !== null) {
                        const text = element.textContent?.trim() ||
                                    element.value ||
                                    element.title ||
                                    element.getAttribute('aria-label') ||
                                    '';

                        const rect = element.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            buttonList.push({
                                text: text.substring(0, 50),
                                tagName: element.tagName.toLowerCase(),
                                className: element.className,
                                id: element.id,
                                selector: selector,
                                position: {
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + rect.height / 2
                                }
                            });
                        }
                    }
                });
            });

            // 去重
            const uniqueButtons = [];
            const seen = new Set();

            buttonList.forEach(button => {
                const key = `${button.tagName}-${button.text}-${button.position.x}-${button.position.y}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueButtons.push(button);
                }
            });

            return uniqueButtons;
        });

        return buttons;
    } catch (error) {
        log('error', `Failed to get buttons: ${error.message}`);
        return [];
    }
}

// 点击单个按钮
async function clickButton(page, button, menuItem, retryCount = 0) {
    const buttonInfo = {
        text: button.text,
        menuItem: menuItem.text,
        menuItemUrl: menuItem.href,
        status: 'pending',
        error: null,
        consoleErrors: [],
        networkErrors: [],
        screenshot: null,
        timestamp: new Date().toISOString()
    };

    try {
        log('info', `Clicking button: "${button.text}" in page "${menuItem.text}"`);

        // 设置错误监听
        const consoleErrors = setupConsoleErrorHandling(page);
        const networkErrors = setupNetworkErrorHandling(page);

        // 等待一小段时间确保页面稳定
        await page.waitForTimeout(500);

        // 点击按钮
        await Promise.race([
            page.click('button, .el-button, .btn, [role="button"], input[type="button"], input[type="submit"], .el-tag, .el-badge, .clickable, [class*="btn"], [class*="button"], [onclick], .el-link', {
                position: button.position,
                timeout: 5000
            }),
            new Promise(resolve => setTimeout(resolve, 3000))
        ]);

        // 等待页面响应
        await page.waitForTimeout(1000);

        // 检查是否有弹窗需要处理
        try {
            const dialog = await page.waitForEvent('dialog', { timeout: 1000 });
            await dialog.accept();
            log('info', `Accepted dialog: ${dialog.message()}`);
        } catch (e) {
            // 没有弹窗是正常的
        }

        // 收集错误
        const errors = [...consoleErrors, ...networkErrors];
        if (errors.length > 0) {
            buttonInfo.consoleErrors = consoleErrors;
            buttonInfo.networkErrors = networkErrors;
            buttonInfo.status = 'warning';
            log('warn', `Button clicked with ${errors.length} errors`, { button: button.text, errors });
        } else {
            buttonInfo.status = 'success';
            log('info', `Button clicked successfully: ${button.text}`);
        }

        testResults.successfulClicks++;

    } catch (error) {
        buttonInfo.status = 'failed';
        buttonInfo.error = {
            message: error.message,
            stack: error.stack
        };

        testResults.failedClicks++;
        log('error', `Failed to click button: ${button.text}`, error.message);

        // 重试机制
        if (retryCount < CONFIG.retryCount) {
            log('info', `Retrying button click (${retryCount + 1}/${CONFIG.retryCount})`);
            return await clickButton(page, button, menuItem, retryCount + 1);
        }

        // 截图保存错误状态
        await takeScreenshot(page, `button-error-${button.text.replace(/[^a-z0-9]/gi, '-')}`);
    }

    testResults.totalButtons++;
    return buttonInfo;
}

// 测试单个页面的按钮
async function testPageButtons(browser, menuItem) {
    const pageInfo = {
        menuItem: menuItem.text,
        url: menuItem.href,
        buttons: [],
        totalButtons: 0,
        successfulClicks: 0,
        failedClicks: 0,
        errors: [],
        startTime: new Date().toISOString(),
        endTime: null
    };

    const page = await browser.newPage();
    const consoleErrors = setupConsoleErrorHandling(page);
    const networkErrors = setupNetworkErrorHandling(page);

    try {
        log('info', `Testing page: ${menuItem.text} (${menuItem.href})`);

        // 导航到页面
        await page.goto(menuItem.href, { waitUntil: 'networkidle', timeout: 15000 });

        // 等待页面加载完成
        await page.waitForTimeout(2000);

        // 截图：页面加载后
        await takeScreenshot(page, `page-${menuItem.text.replace(/[^a-z0-9]/gi, '-')}`);

        // 检查页面是否有错误
        if (consoleErrors.length > 0 || networkErrors.length > 0) {
            pageInfo.errors.push({
                type: 'page_load',
                consoleErrors,
                networkErrors
            });
        }

        // 获取页面中的所有按钮
        const buttons = await getButtonsInPage(page);
        pageInfo.totalButtons = buttons.length;

        log('info', `Found ${buttons.length} buttons in page ${menuItem.text}`);

        if (buttons.length === 0) {
            log('warn', `No buttons found in page: ${menuItem.text}`);
            pageInfo.endTime = new Date().toISOString();
            return pageInfo;
        }

        // 依次点击每个按钮
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];

            try {
                // 重新导航到页面以确保状态一致
                if (i > 0 && i % 10 === 0) {
                    await page.goto(menuItem.href, { waitUntil: 'networkidle' });
                    await page.waitForTimeout(1000);
                }

                const buttonResult = await clickButton(page, button, menuItem);
                pageInfo.buttons.push(buttonResult);

                if (buttonResult.status === 'success') {
                    pageInfo.successfulClicks++;
                } else {
                    pageInfo.failedClicks++;
                }

                // 等待一段时间避免过快操作
                await page.waitForTimeout(300);

            } catch (error) {
                log('error', `Error testing button ${button.text}: ${error.message}`);
                pageInfo.failedClicks++;
                pageInfo.buttons.push({
                    ...button,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        pageInfo.endTime = new Date().toISOString();
        log('info', `Page testing completed: ${menuItem.text}`, {
            total: pageInfo.totalButtons,
            successful: pageInfo.successfulClicks,
            failed: pageInfo.failedClicks
        });

    } catch (error) {
        pageInfo.endTime = new Date().toISOString();
        pageInfo.errors.push({
            type: 'navigation',
            message: error.message,
            stack: error.stack
        });

        await takeScreenshot(page, `page-error-${menuItem.text.replace(/[^a-z0-9]/gi, '-')}`);
        log('error', `Failed to test page ${menuItem.text}: ${error.message}`);
    } finally {
        await page.close();
    }

    return pageInfo;
}

// 生成测试报告
function generateTestReport() {
    testResults.endTime = new Date().toISOString();

    // 计算统计信息
    testResults.summary = {
        duration: Math.round((new Date(testResults.endTime) - new Date(testResults.startTime)) / 1000),
        totalButtons: testResults.totalButtons,
        successRate: testResults.totalButtons > 0 ? Math.round((testResults.successfulClicks / testResults.totalButtons) * 100) : 0,
        pagesTested: testResults.pages.length,
        totalErrors: testResults.errors.length
    };

    // 生成详细报告
    const reportContent = `# 自动化按钮点击测试报告

## 测试概览
- **开始时间**: ${testResults.startTime}
- **结束时间**: ${testResults.endTime}
- **总耗时**: ${testResults.summary.duration} 秒
- **测试页面数**: ${testResults.summary.pagesTested}
- **总按钮数**: ${testResults.summary.totalButtons}
- **成功点击**: ${testResults.successfulClicks}
- **失败点击**: ${testResults.failedClicks}
- **成功率**: ${testResults.summary.successRate}%
- **总错误数**: ${testResults.summary.totalErrors}

## 页面测试详情

${testResults.pages.map(page => `
### ${page.menuItem} (${page.url})
- **测试时间**: ${page.startTime} - ${page.endTime}
- **按钮总数**: ${page.totalButtons}
- **成功点击**: ${page.successfulClicks}
- **失败点击**: ${page.failedClicks}
- **成功率**: ${page.totalButtons > 0 ? Math.round((page.successfulClicks / page.totalButtons) * 100) : 0}%

${page.errors.length > 0 ? `
**页面错误**:
${page.errors.map(error => `- ${error.type}: ${error.message}`).join('\n')}
` : ''}

${page.buttons.length > 0 ? `
**按钮测试详情**:
${page.buttons.map(button => `
- **按钮**: "${button.text}"
- **状态**: ${button.status}
${button.error ? `- **错误**: ${button.error.message}` : ''}
${button.consoleErrors.length > 0 ? `- **控制台错误**: ${button.consoleErrors.length} 个` : ''}
${button.networkErrors.length > 0 ? `- **网络错误**: ${button.networkErrors.length} 个` : ''}
`).join('')}
` : ''}
`).join('')}

## 全局错误汇总

${testResults.errors.length > 0 ? `
${testResults.errors.map((error, index) => `
${index + 1}. **${error.timestamp}** - ${error.message}
   ${error.data ? JSON.stringify(error.data, null, 2) : ''}
`).join('')}
` : '无全局错误'}

## 测试建议

1. **高优先级修复** (失败率高的页面):
${testResults.pages
    .filter(page => page.totalButtons > 0 && (page.failedClicks / page.totalButtons) > 0.2)
    .map(page => `- ${page.menuItem}: ${Math.round((page.failedClicks / page.totalButtons) * 100)}% 失败率`)
    .join('\n') || '无'}

2. **建议优化**:
${testResults.summary.successRate < 90 ? `- 整体成功率较低 (${testResults.summary.successRate}%)，建议全面检查` : ''}
${testResults.summary.totalErrors > 0 ? `- 发现 ${testResults.summary.totalErrors} 个错误，需要修复` : ''}
${testResults.summary.duration > 300 ? `- 测试耗时较长 (${testResults.summary.duration}s)，考虑优化测试策略` : ''}

## 截图文件
所有测试截图保存在: ${CONFIG.screenshotsDir}/

---
*报告生成时间: ${new Date().toISOString()}*
`;

    // 保存报告
    const reportPath = path.join(CONFIG.reportsDir, `button-test-report-${Date.now()}.md`);
    ensureDir(CONFIG.reportsDir);
    fs.writeFileSync(reportPath, reportContent);

    // 保存JSON格式的结果
    const jsonPath = path.join(CONFIG.reportsDir, `button-test-results-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(testResults, null, 2));

    log('info', `Test report generated: ${reportPath}`);
    log('info', `Test results saved: ${jsonPath}`);

    return { reportPath, jsonPath };
}

// 主测试函数
async function runButtonClickTest() {
    let browser;

    try {
        log('info', 'Starting automated button click test...');
        log('info', `Configuration: ${JSON.stringify(CONFIG, null, 2)}`);

        // 创建必要的目录
        ensureDir(CONFIG.screenshotsDir);
        ensureDir(CONFIG.reportsDir);

        // 启动浏览器
        browser = await chromium.launch({
            headless: CONFIG.headless,
            slowMo: CONFIG.slowMo,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        // 登录系统
        const { page: loginPage } = await login(browser);

        // 获取所有菜单项
        const menuItems = await getSidebarMenuItems(loginPage);
        await loginPage.close();

        if (menuItems.length === 0) {
            log('error', 'No menu items found. Cannot proceed with button testing.');
            return;
        }

        log('info', `Starting button testing for ${menuItems.length} pages...`);

        // 并发测试页面
        const pagesToTest = menuItems.slice(0, 20); // 限制测试页面数量避免过长测试

        const pagePromises = pagesToTest.map(async (menuItem) => {
            try {
                return await testPageButtons(browser, menuItem);
            } catch (error) {
                log('error', `Failed to test page ${menuItem.text}: ${error.message}`);
                return {
                    menuItem: menuItem.text,
                    url: menuItem.href,
                    error: error.message,
                    buttons: [],
                    totalButtons: 0,
                    successfulClicks: 0,
                    failedClicks: 0,
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        });

        // 等待所有页面测试完成
        const pageResults = await Promise.all(pagePromises);
        testResults.pages = pageResults;

        // 生成测试报告
        const { reportPath, jsonPath } = generateTestReport();

        // 输出测试结果摘要
        console.log('\n=== 测试完成 ===');
        console.log(`总页面数: ${testResults.summary.pagesTested}`);
        console.log(`总按钮数: ${testResults.summary.totalButtons}`);
        console.log(`成功点击: ${testResults.successfulClicks}`);
        console.log(`失败点击: ${testResults.failedClicks}`);
        console.log(`成功率: ${testResults.summary.successRate}%`);
        console.log(`总耗时: ${testResults.summary.duration} 秒`);
        console.log(`测试报告: ${reportPath}`);
        console.log(`详细结果: ${jsonPath}`);

    } catch (error) {
        log('error', `Test execution failed: ${error.message}`, error.stack);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
            log('info', 'Browser closed');
        }
    }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    log('error', `Uncaught Exception: ${error.message}`, error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log('error', `Unhandled Rejection: ${reason}`, promise);
    process.exit(1);
});

// 运行测试
if (require.main === module) {
    runButtonClickTest().catch(error => {
        log('error', `Test failed: ${error.message}`, error.stack);
        process.exit(1);
    });
}

module.exports = {
    runButtonClickTest,
    CONFIG,
    CREDENTIALS
};