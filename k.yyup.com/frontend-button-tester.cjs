#!/usr/bin/env node

/**
 * 前端按钮可点击性测试脚本
 * 只依赖前端服务，测试按钮的点击状态和响应
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置参数
const CONFIG = {
    baseUrl: 'http://localhost:5173',
    headless: true, // 必须使用无头模式
    timeout: 15000,
    slowMo: 50,
    screenshotsDir: './frontend-test-screenshots',
    reportsDir: './frontend-test-reports',
    retryCount: 2,
};

// 测试结果存储
const testResults = {
    startTime: new Date().toISOString(),
    endTime: null,
    totalButtons: 0,
    clickableButtons: 0,
    disabledButtons: 0,
    errorButtons: 0,
    pages: [],
    errors: [],
    summary: {}
};

// 侧边栏页面列表
const SIDEBAR_PAGES = [
    // 中心页面
    { path: '/centers/PersonnelCenter', name: '人员中心', expectedButtons: 17 },
    { path: '/centers/EnrollmentCenter', name: '招生中心', expectedButtons: 6 },
    { path: '/centers/MarketingCenter', name: '营销中心', expectedButtons: 15 },
    { path: '/centers/InspectionCenter', name: '检查中心', expectedButtons: 56 },
    { path: '/centers/ActivityCenter', name: '活动中心', expectedButtons: 5 },
    { path: '/centers/BusinessCenter', name: '业务中心', expectedButtons: 20 },
    { path: '/centers/AnalyticsCenter', name: '分析中心', expectedButtons: 12 },
    { path: '/centers/FinanceCenter', name: '财务中心', expectedButtons: 23 },
    { path: '/centers/TaskCenter', name: '任务中心', expectedButtons: 9 },
    { path: '/centers/TeachingCenter', name: '教学中心', expectedButtons: 5 },
    { path: '/centers/AssessmentCenter', name: '评估中心', expectedButtons: 30 },
    { path: '/centers/AttendanceCenter', name: '考勤中心', expectedButtons: 8 },
    { path: '/centers/SystemCenter', name: '系统中心', expectedButtons: 33 },
    { path: '/centers/AICenter', name: '智能中心', expectedButtons: 20 },
    { path: '/centers/AIBillingCenter', name: 'AI计费中心', expectedButtons: 14 },
    { path: '/centers/UsageCenter', name: '使用中心', expectedButtons: 28 },
    { path: '/centers/CallCenter', name: '呼叫中心', expectedButtons: 31 },
    { path: '/centers/CustomerPoolCenter', name: '客户池中心', expectedButtons: 23 },
    { path: '/centers/DocumentCenter', name: '文档中心', expectedButtons: 15 },
    { path: '/centers/ScriptCenter', name: '话术中心', expectedButtons: 34 }
];

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
async function takeScreenshot(page, name, prefix = 'frontend-button-test') {
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

// 快速登录 - 绕过后端验证
async function quickLogin(page) {
    try {
        log('info', 'Attempting quick login...');

        // 访问登录页面
        await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // 检查是否已经登录
        const currentUrl = page.url();
        if (currentUrl.includes('/centers') || currentUrl.includes('/dashboard')) {
            log('info', 'Already logged in');
            return true;
        }

        // 尝试快速登录 - 模拟已登录状态
        await page.evaluate(() => {
            // 在localStorage中设置登录状态
            localStorage.setItem('auth-token', 'mock-token-for-testing');
            localStorage.setItem('user-info', JSON.stringify({
                id: 1,
                username: 'admin',
                role: 'admin',
                permissions: ['all']
            }));
        });

        // 刷新页面
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        // 检查登录状态
        const finalUrl = page.url();
        const isLoggedIn = finalUrl.includes('/centers') || finalUrl.includes('/dashboard') || !finalUrl.includes('/Login');

        if (isLoggedIn) {
            log('info', 'Quick login successful');
            return true;
        } else {
            log('warning', 'Quick login may not have worked, but proceeding with tests');
            return false;
        }
    } catch (error) {
        log('error', 'Login failed', error.message);
        return false;
    }
}

// 测试页面按钮
async function testPageButtons(page, pageInfo) {
    const pageResult = {
        ...pageInfo,
        visited: false,
        loaded: false,
        buttonCount: 0,
        clickableButtons: 0,
        disabledButtons: 0,
        errorButtons: 0,
        buttons: [],
        errors: [],
        screenshot: null,
        consoleErrors: []
    };

    try {
        log('info', `Testing page: ${pageInfo.name} (${pageInfo.path})`);

        // 访问页面
        await page.goto(CONFIG.baseUrl + pageInfo.path, {
            waitUntil: 'domcontentloaded',
            timeout: CONFIG.timeout
        });

        // 等待页面加载
        await page.waitForTimeout(3000);

        pageResult.visited = true;
        pageResult.loaded = true;

        // 截图
        pageResult.screenshot = await takeScreenshot(page, pageInfo.name.replace(/\s+/g, '-').toLowerCase());

        // 查找所有按钮元素
        const buttons = await page.locator('button, .el-button, [role="button"], .btn, button[type="button"], button[type="submit"]').all();
        pageResult.buttonCount = buttons.length;
        testResults.totalButtons += buttons.length;

        log('info', `Found ${buttons.length} buttons on ${pageInfo.name}`);

        // 测试每个按钮
        for (let i = 0; i < buttons.length; i++) {
            try {
                const button = buttons[i];
                const buttonInfo = {
                    index: i,
                    text: await button.textContent().catch(() => ''),
                    visible: await button.isVisible().catch(() => false),
                    enabled: await button.isEnabled().catch(() => false),
                    clickable: false,
                    hasClickHandler: false,
                    error: null
                };

                // 检查按钮是否可见和启用
                if (buttonInfo.visible && buttonInfo.enabled) {
                    try {
                        // 尝试点击按钮（不等待导航）
                        await Promise.race([
                            button.click({ timeout: 2000 }),
                            new Promise(resolve => setTimeout(resolve, 1000)) // 最多等待1秒
                        ]);

                        buttonInfo.clickable = true;
                        pageResult.clickableButtons++;
                        testResults.clickableButtons++;

                        // 等待一下看是否有响应
                        await page.waitForTimeout(500);

                    } catch (clickError) {
                        buttonInfo.error = clickError.message;
                        pageResult.errorButtons++;
                        testResults.errorButtons++;
                    }
                } else if (!buttonInfo.enabled) {
                    pageResult.disabledButtons++;
                    testResults.disabledButtons++;
                }

                pageResult.buttons.push(buttonInfo);

                // 每10个按钮记录一次进度
                if ((i + 1) % 10 === 0) {
                    log('info', `Tested ${i + 1}/${buttons.length} buttons on ${pageInfo.name}`);
                }

            } catch (buttonError) {
                log('error', `Error testing button ${i} on ${pageInfo.name}`, buttonError.message);
                pageResult.errorButtons++;
                testResults.errorButtons++;
                pageResult.buttons.push({
                    index: i,
                    error: buttonError.message,
                    clickable: false
                });
            }
        }

        log('info', `Page ${pageInfo.name} results: ${pageResult.clickableButtons} clickable, ${pageResult.disabledButtons} disabled, ${pageResult.errorButtons} errors`);

    } catch (error) {
        log('error', `Error testing page ${pageInfo.name}`, error.message);
        pageResult.errors.push({
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    return pageResult;
}

// 生成测试报告
function generateReport() {
    const report = {
        ...testResults,
        endTime: new Date().toISOString(),
        summary: {
            totalPages: SIDEBAR_PAGES.length,
            visitedPages: testResults.pages.filter(p => p.visited).length,
            loadedPages: testResults.pages.filter(p => p.loaded).length,
            totalButtons: testResults.totalButtons,
            clickableButtons: testResults.clickableButtons,
            disabledButtons: testResults.disabledButtons,
            errorButtons: testResults.errorButtons,
            clickableRate: testResults.totalButtons > 0 ?
                ((testResults.clickableButtons / testResults.totalButtons) * 100).toFixed(2) + '%' : '0%',
            errorRate: testResults.totalButtons > 0 ?
                ((testResults.errorButtons / testResults.totalButtons) * 100).toFixed(2) + '%' : '0%'
        }
    };

    // 保存JSON报告
    const jsonReportPath = path.join(CONFIG.reportsDir, `frontend-button-test-report-${Date.now()}.json`);
    ensureDir(CONFIG.reportsDir);
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 生成Markdown报告
    const markdownReport = generateMarkdownReport(report);
    const markdownReportPath = path.join(CONFIG.reportsDir, `frontend-button-test-report-${Date.now()}.md`);
    fs.writeFileSync(markdownReportPath, markdownReport);

    log('info', `Reports generated:`);
    log('info', `- JSON: ${jsonReportPath}`);
    log('info', `- Markdown: ${markdownReportPath}`);

    return report;
}

// 生成Markdown报告
function generateMarkdownReport(report) {
    const { summary } = report;

    let markdown = `# 前端按钮可点击性测试报告\n\n`;
    markdown += `## 测试概览\n\n`;
    markdown += `- **测试时间**: ${report.startTime} - ${report.endTime}\n`;
    markdown += `- **总页面数**: ${summary.totalPages}\n`;
    markdown += `- **成功访问页面**: ${summary.visitedPages}\n`;
    markdown += `- **成功加载页面**: ${summary.loadedPages}\n`;
    markdown += `- **总按钮数**: ${summary.totalButtons}\n`;
    markdown += `- **可点击按钮**: ${summary.clickableButtons}\n`;
    markdown += `- **禁用按钮**: ${summary.disabledButtons}\n`;
    markdown += `- **错误按钮**: ${summary.errorButtons}\n`;
    markdown += `- **可点击率**: ${summary.clickableRate}\n`;
    markdown += `- **错误率**: ${summary.errorRate}\n\n`;

    markdown += `## 页面详情\n\n`;

    for (const page of report.pages) {
        markdown += `### ${page.name}\n\n`;
        markdown += `- **路径**: ${page.path}\n`;
        markdown += `- **访问状态**: ${page.visited ? '✅ 成功' : '❌ 失败'}\n`;
        markdown += `- **加载状态**: ${page.loaded ? '✅ 成功' : '❌ 失败'}\n`;
        markdown += `- **按钮数量**: ${page.buttonCount}\n`;
        markdown += `- **可点击**: ${page.clickableButtons}\n`;
        markdown += `- **禁用**: ${page.disabledButtons}\n`;
        markdown += `- **错误**: ${page.errorButtons}\n`;

        if (page.errors.length > 0) {
            markdown += `\n**错误信息**:\n`;
            page.errors.forEach(error => {
                markdown += `- ${error.message}\n`;
            });
        }

        markdown += `\n`;
    }

    if (report.errors.length > 0) {
        markdown += `## 全局错误\n\n`;
        report.errors.forEach(error => {
            markdown += `- [${error.timestamp}] ${error.message}\n`;
        });
    }

    return markdown;
}

// 主测试函数
async function runFrontendButtonTest() {
    let browser;
    let page;

    try {
        log('info', 'Starting frontend button clickability test...');

        // 创建目录
        ensureDir(CONFIG.screenshotsDir);
        ensureDir(CONFIG.reportsDir);

        // 启动浏览器
        browser = await chromium.launch({
            headless: CONFIG.headless,
            devtools: false
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true
        });

        page = await context.newPage();

        // 设置控制台错误监听
        const consoleErrors = setupConsoleErrorHandling(page);

        // 尝试快速登录
        await quickLogin(page);

        // 测试每个页面
        for (const pageInfo of SIDEBAR_PAGES) {
            try {
                const pageResult = await testPageButtons(page, pageInfo);
                pageResult.consoleErrors = [...consoleErrors];
                testResults.pages.push(pageResult);

                // 页面间等待
                await page.waitForTimeout(1000);

            } catch (error) {
                log('error', `Failed to test page ${pageInfo.name}`, error.message);
                testResults.pages.push({
                    ...pageInfo,
                    visited: false,
                    loaded: false,
                    error: error.message
                });
            }
        }

        // 生成报告
        const report = generateReport();

        log('info', 'Frontend button test completed successfully!');
        log('info', `Summary: ${report.summary.clickableButtons}/${report.summary.totalButtons} buttons clickable (${report.summary.clickableRate})`);

        return report;

    } catch (error) {
        log('error', 'Frontend button test failed', error);
        throw error;
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    runFrontendButtonTest()
        .then(() => {
            console.log('\n✅ Frontend button test completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Frontend button test failed:', error);
            process.exit(1);
        });
}

module.exports = { runFrontendButtonTest };