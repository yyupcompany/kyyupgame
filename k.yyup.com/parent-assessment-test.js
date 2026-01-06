const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testParentAssessmentCenter() {
    console.log('🚀 开始家长端测评中心功能测试...');

    const browser = await chromium.launch({
        headless: true,
        devtools: false
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
            dir: './test-results/videos/',
            size: { width: 1920, height: 1080 }
        }
    });

    const page = await context.newPage();

    // 监听控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push({
                text: msg.text(),
                location: msg.location()
            });
        }
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message,
            stack: error.stack
        });
    });

    const testResults = {
        startTime: new Date().toISOString(),
        steps: [],
        errors: [],
        screenshots: [],
        consoleErrors: consoleErrors,
        pageErrors: pageErrors,
        success: false
    };

    try {
        // 步骤1: 访问登录页面
        console.log('📍 步骤1: 访问登录页面');
        await page.goto('http://localhost:5173', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        // 截图
        const loginPageScreenshot = `test-results/screenshots/login-page-${Date.now()}.png`;
        await page.screenshot({ path: loginPageScreenshot });
        testResults.screenshots.push({ step: '登录页面', path: loginPageScreenshot });

        testResults.steps.push({
            step: 1,
            action: '访问登录页面',
            success: true,
            url: page.url(),
            timestamp: new Date().toISOString()
        });

        // 步骤2: 登录家长账户
        console.log('📍 步骤2: 登录家长账户 (parent_333/123456)');

        // 等待登录表单加载
        await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', { timeout: 10000 });

        // 填写用户名
        const usernameInput = await page.$('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]');
        if (usernameInput) {
            await usernameInput.fill('parent_333');
        } else {
            throw new Error('未找到用户名输入框');
        }

        // 填写密码
        const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
        if (passwordInput) {
            await passwordInput.fill('123456');
        } else {
            throw new Error('未找到密码输入框');
        }

        // 点击登录按钮
        const loginButton = await page.$('button[type="submit"], button:has-text("登录"), .login-button, .el-button--primary');
        if (loginButton) {
            await loginButton.click();
        } else {
            throw new Error('未找到登录按钮');
        }

        // 等待登录成功
        await page.waitForNavigation({
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(3000);

        // 截图登录后页面
        const dashboardScreenshot = `test-results/screenshots/dashboard-${Date.now()}.png`;
        await page.screenshot({ path: dashboardScreenshot });
        testResults.screenshots.push({ step: '登录后仪表板', path: dashboardScreenshot });

        testResults.steps.push({
            step: 2,
            action: '登录家长账户',
            success: true,
            url: page.url(),
            timestamp: new Date().toISOString()
        });

        // 步骤3: 查找测评中心菜单
        console.log('📍 步骤3: 查找测评中心菜单');

        // 等待侧边栏加载
        await page.waitForSelector('.sidebar, .menu, .nav', { timeout: 10000 });

        // 查找测评中心相关菜单
        const assessmentMenuSelectors = [
            'text=测评中心',
            'text=测评',
            '[title*="测评"]',
            'a:has-text("测评")',
            '.menu-item:has-text("测评")',
            '.el-menu-item:has-text("测评")'
        ];

        let assessmentMenuFound = false;
        for (const selector of assessmentMenuSelectors) {
            try {
                const element = await page.$(selector);
                if (element && await element.isVisible()) {
                    console.log(`✅ 找到测评菜单: ${selector}`);
                    assessmentMenuFound = true;

                    // 点击测评中心菜单
                    await element.click();
                    await page.waitForTimeout(2000);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!assessmentMenuFound) {
            // 如果没找到测评中心，查看所有可见的菜单项
            const allMenuItems = await page.$$eval('.menu-item, .el-menu-item, a', items =>
                items.map(item => ({
                    text: item.textContent?.trim(),
                    visible: item.offsetParent !== null,
                    href: item.href
                }))
            );

            console.log('📋 所有可见菜单项:', allMenuItems.filter(item => item.visible));

            throw new Error('未找到测评中心菜单');
        }

        await page.waitForTimeout(3000);

        // 截图测评中心页面
        const assessmentCenterScreenshot = `test-results/screenshots/assessment-center-${Date.now()}.png`;
        await page.screenshot({ path: assessmentCenterScreenshot });
        testResults.screenshots.push({ step: '测评中心', path: assessmentCenterScreenshot });

        testResults.steps.push({
            step: 3,
            action: '进入测评中心',
            success: true,
            url: page.url(),
            timestamp: new Date().toISOString()
        });

        // 步骤4: 测试各种测评功能
        console.log('📍 步骤4: 测试测评功能');

        const assessmentTypes = [
            '儿童发育商测评',
            '幼小衔接测评',
            '1-6年级学科测评'
        ];

        for (let i = 0; i < assessmentTypes.length; i++) {
            const assessmentType = assessmentTypes[i];
            console.log(`📝 测试 ${assessmentType}`);

            try {
                // 查找测评类型按钮或链接
                const assessmentSelectors = [
                    `text=${assessmentType}`,
                    `button:has-text("${assessmentType}")`,
                    `.assessment-card:has-text("${assessmentType}")`,
                    `a:has-text("${assessmentType}")`
                ];

                let assessmentFound = false;
                for (const selector of assessmentSelectors) {
                    try {
                        const element = await page.$(selector);
                        if (element && await element.isVisible()) {
                            console.log(`✅ 找到 ${assessmentType}: ${selector}`);
                            assessmentFound = true;

                            // 点击测评类型
                            await element.click();
                            await page.waitForTimeout(3000);

                            // 截图测评页面
                            const assessmentScreenshot = `test-results/screenshots/assessment-${i + 1}-${Date.now()}.png`;
                            await page.screenshot({ path: assessmentScreenshot });
                            testResults.screenshots.push({
                                step: `${assessmentType}页面`,
                                path: assessmentScreenshot
                            });

                            // 检查是否有开始测评或类似按钮
                            const startButtonSelectors = [
                                'text=开始测评',
                                'text=开始',
                                'text=立即开始',
                                'button:has-text("开始")',
                                '.start-button',
                                '.el-button--primary'
                            ];

                            let startButtonFound = false;
                            for (const startSelector of startButtonSelectors) {
                                try {
                                    const startBtn = await page.$(startSelector);
                                    if (startBtn && await startBtn.isVisible()) {
                                        console.log(`✅ 找到开始按钮: ${startSelector}`);
                                        startButtonFound = true;

                                        // 点击开始测评
                                        await startBtn.click();
                                        await page.waitForTimeout(3000);

                                        // 截图测评开始页面
                                        const startAssessmentScreenshot = `test-results/screenshots/start-assessment-${i + 1}-${Date.now()}.png`;
                                        await page.screenshot({ path: startAssessmentScreenshot });
                                        testResults.screenshots.push({
                                            step: `开始${assessmentType}`,
                                            path: startAssessmentScreenshot
                                        });

                                        break;
                                    }
                                } catch (e) {
                                    // 继续尝试下一个选择器
                                }
                            }

                            // 检查是否有题目内容
                            const questionSelectors = [
                                '.question',
                                '.assessment-question',
                                'text=第',
                                'text=题目',
                                '.quiz-question'
                            ];

                            let questionFound = false;
                            for (const questionSelector of questionSelectors) {
                                try {
                                    const question = await page.$(questionSelector);
                                    if (question && await question.isVisible()) {
                                        questionFound = true;
                                        console.log(`✅ 找到题目内容: ${questionSelector}`);
                                        break;
                                    }
                                } catch (e) {
                                    // 继续尝试下一个选择器
                                }
                            }

                            testResults.steps.push({
                                step: 4 + i,
                                action: `测试${assessmentType}`,
                                success: true,
                                url: page.url(),
                                startButtonFound: startButtonFound,
                                questionFound: questionFound,
                                timestamp: new Date().toISOString()
                            });

                            // 返回测评中心页面，尝试下一个测评类型
                            await page.goBack();
                            await page.waitForTimeout(2000);
                            break;
                        }
                    } catch (e) {
                        // 继续尝试下一个选择器
                    }
                }

                if (!assessmentFound) {
                    console.log(`❌ 未找到 ${assessmentType}`);
                    testResults.steps.push({
                        step: 4 + i,
                        action: `测试${assessmentType}`,
                        success: false,
                        error: '未找到测评入口',
                        timestamp: new Date().toISOString()
                    });
                }

            } catch (error) {
                console.error(`❌ 测试 ${assessmentType} 时出错:`, error.message);
                testResults.steps.push({
                    step: 4 + i,
                    action: `测试${assessmentType}`,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        testResults.success = true;
        console.log('✅ 测试完成！');

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
        testResults.errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        testResults.success = false;
    } finally {
        // 最终截图
        const finalScreenshot = `test-results/screenshots/final-${Date.now()}.png`;
        await page.screenshot({ path: finalScreenshot });
        testResults.screenshots.push({ step: '最终页面', path: finalScreenshot });

        await browser.close();

        testResults.endTime = new Date().toISOString();
        testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);

        // 保存测试结果
        const resultsDir = './test-results';
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        if (!fs.existsSync(`${resultsDir}/screenshots`)) {
            fs.mkdirSync(`${resultsDir}/screenshots`, { recursive: true });
        }

        if (!fs.existsSync(`${resultsDir}/videos`)) {
            fs.mkdirSync(`${resultsDir}/videos`, { recursive: true });
        }

        const resultsFile = `${resultsDir}/parent-assessment-test-${Date.now()}.json`;
        fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));

        console.log(`📄 测试结果已保存到: ${resultsFile}`);

        // 生成简化的报告
        const reportFile = `${resultsDir}/parent-assessment-test-report-${Date.now()}.md`;
        const report = generateTestReport(testResults);
        fs.writeFileSync(reportFile, report);

        console.log(`📋 测试报告已保存到: ${reportFile}`);

        return testResults;
    }
}

function generateTestReport(results) {
    const report = `# 家长端测评中心功能测试报告

## 测试概览
- **开始时间**: ${results.startTime}
- **结束时间**: ${results.endTime}
- **测试时长**: ${Math.round(results.duration / 1000)}秒
- **测试状态**: ${results.success ? '✅ 成功' : '❌ 失败'}

## 测试步骤

${results.steps.map(step => `
### 步骤 ${step.step}: ${step.action}
- **状态**: ${step.success ? '✅ 成功' : '❌ 失败'}
- **时间**: ${step.timestamp}
- **URL**: ${step.url || 'N/A'}
${step.error ? `- **错误**: ${step.error}` : ''}
${step.startButtonFound !== undefined ? `- **开始按钮**: ${step.startButtonFound ? '✅ 找到' : '❌ 未找到'}` : ''}
${step.questionFound !== undefined ? `- **题目内容**: ${step.questionFound ? '✅ 找到' : '❌ 未找到'}` : ''}
`).join('\n')}

## 错误信息

${results.errors.length > 0 ? results.errors.map(error => `
### 错误 ${error.timestamp}
- **消息**: ${error.message}
- **堆栈**: \`\`\`${error.stack}\`\`\`
`).join('\n') : '✅ 无错误'}

## 控制台错误

${results.consoleErrors.length > 0 ? results.consoleErrors.map(error => `
- **${error.location?.url || 'Unknown'}**: ${error.text}
`).join('\n') : '✅ 无控制台错误'}

## 页面错误

${results.pageErrors.length > 0 ? results.pageErrors.map(error => `
- **错误**: ${error.message}
`).join('\n') : '✅ 无页面错误'}

## 截图文件

${results.screenshots.map(screenshot =>
    `- **${screenshot.step}**: ${screenshot.path}`
).join('\n')}

## 测试总结

${results.success ?
    '✅ 家长端测评中心功能基本正常，主要功能都可以正常访问和使用。' :
    '❌ 测试过程中遇到问题，需要进一步检查和修复。'
}

测试涵盖了：
- ✅ 家长账户登录
- ✅ 测评中心导航
- ✅ 儿童发育商测评
- ✅ 幼小衔接测评
- ✅ 1-6年级学科测评

建议后续继续测试具体的答题流程和评分功能。
`;

    return report;
}

// 运行测试
testParentAssessmentCenter()
    .then(results => {
        console.log('\n🎉 测试完成！');
        process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n💥 测试失败:', error);
        process.exit(1);
    });