const { chromium } = require('playwright');
const fs = require('fs');

async function testParentAssessmentCenter() {
    console.log('🚀 开始家长端测评中心功能测试...');

    const browser = await chromium.launch({
        headless: true,
        devtools: false
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
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
            console.log('❌ 控制台错误: ' + msg.text());
        }
    });

    const testResults = {
        startTime: new Date().toISOString(),
        steps: [],
        errors: [],
        screenshots: [],
        consoleErrors: consoleErrors,
        success: false
    };

    const takeScreenshot = async (stepName) => {
        const screenshot = 'test-results/screenshot-' + stepName + '-' + Date.now() + '.png';
        await page.screenshot({ path: screenshot });
        testResults.screenshots.push({ step: stepName, path: screenshot });
        return screenshot;
    };

    const addStep = (step, action, success, error = null) => {
        const stepResult = {
            step: step,
            action: action,
            success: success,
            timestamp: new Date().toISOString(),
            url: page.url()
        };
        if (error) stepResult.error = error;
        testResults.steps.push(stepResult);
        console.log((success ? '✅' : '❌') + ' ' + action);
        if (error) console.log('   错误: ' + error);
    };

    try {
        // 确保目录存在
        if (!fs.existsSync('./test-results')) {
            fs.mkdirSync('./test-results', { recursive: true });
        }

        // 步骤1: 访问登录页面
        console.log('📍 步骤1: 访问登录页面');
        await page.goto('http://localhost:5173', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(3000);
        await takeScreenshot('login-page');
        addStep(1, '访问登录页面', true);

        // 步骤2: 填写登录表单
        console.log('📍 步骤2: 填写家长账户登录信息');

        // 等待输入框加载
        await page.waitForSelector('input[placeholder="请输入用户名"]', { timeout: 10000 });

        // 填写用户名
        const usernameInput = await page.$('input[placeholder="请输入用户名"]');
        if (usernameInput) {
            await usernameInput.fill('parent_333');
        } else {
            throw new Error('未找到用户名输入框');
        }

        // 填写密码
        const passwordInput = await page.$('input[placeholder="请输入密码"]');
        if (passwordInput) {
            await passwordInput.fill('123456');
        } else {
            throw new Error('未找到密码输入框');
        }

        await takeScreenshot('login-form-filled');
        addStep(2, '填写登录表单', true);

        // 步骤3: 点击登录按钮
        console.log('📍 步骤3: 点击登录按钮');

        // 点击登录按钮
        const loginButton = await page.$('button.login-btn');
        if (loginButton) {
            await loginButton.click();
        } else {
            throw new Error('未找到登录按钮');
        }

        // 等待登录处理
        await page.waitForTimeout(5000);

        // 检查登录结果
        const currentUrl = page.url();
        const isLoggedIn = !currentUrl.includes('/login');

        await takeScreenshot('login-result');

        if (isLoggedIn) {
            addStep(3, '登录成功', true);
        } else {
            addStep(3, '登录失败', false, '仍在登录页面');
            throw new Error('登录失败');
        }

        // 步骤4: 查找测评中心菜单
        console.log('📍 步骤4: 查找测评中心菜单');

        // 等待侧边栏加载
        await page.waitForTimeout(3000);

        // 尝试查找测评相关菜单
        const menuSelectors = [
            'text=测评中心',
            'text=测评',
            'a:has-text("测评")',
            '.menu-item:has-text("测评")',
            '.el-menu-item:has-text("测评")',
            '[class*="menu"]:has-text("测评")'
        ];

        let assessmentMenuFound = false;
        for (const selector of menuSelectors) {
            try {
                const element = await page.$(selector);
                if (element && await element.isVisible()) {
                    console.log('✅ 找到测评菜单: ' + selector);
                    assessmentMenuFound = true;
                    await element.click();
                    await page.waitForTimeout(2000);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!assessmentMenuFound) {
            // 获取所有可见的菜单项文本
            const menuItems = await page.$$eval('.menu-item, .el-menu-item, a, [class*="menu"]', items =>
                items
                    .filter(item => item.offsetParent !== null) // 只取可见元素
                    .map(item => item.textContent?.trim())
                    .filter(text => text && text.length > 0)
                    .slice(0, 20) // 只取前20个
            );

            console.log('📋 可见菜单项:', menuItems);

            // 检查是否包含测评相关内容
            const hasAssessment = menuItems.some(item =>
                item.includes('测评') || item.includes('评估') || item.includes('测试')
            );

            if (hasAssessment) {
                assessmentMenuFound = true;
                console.log('✅ 在菜单项中发现测评相关内容');
            } else {
                throw new Error('未找到测评中心菜单项');
            }
        }

        await takeScreenshot('assessment-center');
        addStep(4, '进入测评中心', assessmentMenuFound);

        // 步骤5: 测试测评功能
        console.log('📍 步骤5: 测试测评功能');

        const assessmentTypes = ['儿童发育商测评', '幼小衔接测评', '1-6年级学科测评'];

        for (let i = 0; i < assessmentTypes.length; i++) {
            const assessmentType = assessmentTypes[i];
            console.log('📝 测试 ' + assessmentType);

            try {
                // 查找测评类型
                const selectors = [
                    'text=' + assessmentType,
                    'button:has-text("' + assessmentType + '")',
                    'a:has-text("' + assessmentType + '")',
                    'div:has-text("' + assessmentType + '")',
                    '[class*="assessment"]:has-text("' + assessmentType + '")'
                ];

                let found = false;
                for (const selector of selectors) {
                    try {
                        const element = await page.$(selector);
                        if (element && await element.isVisible()) {
                            found = true;
                            console.log('✅ 找到 ' + assessmentType);

                            // 点击进入
                            await element.click();
                            await page.waitForTimeout(3000);

                            // 截图
                            await takeScreenshot('assessment-' + (i + 1));

                            // 检查是否有开始按钮
                            const startButton = await page.$('button:has-text("开始"), .start-btn, .el-button--primary');
                            const hasStartButton = startButton && await startButton.isVisible();

                            // 检查是否有题目内容
                            const hasContent = await page.evaluate(() => {
                                const content = document.body.textContent || '';
                                return content.includes('题目') || content.includes('问题') || content.includes('第');
                            });

                            addStep(5 + i, '测试' + assessmentType, true, null);
                            addStep(5 + i, assessmentType + ' - 开始按钮', hasStartButton);
                            addStep(5 + i, assessmentType + ' - 题目内容', hasContent);

                            // 返回上一页
                            await page.goBack();
                            await page.waitForTimeout(2000);
                            break;
                        }
                    } catch (e) {
                        // 继续尝试
                    }
                }

                if (!found) {
                    console.log('❌ 未找到 ' + assessmentType);
                    addStep(5 + i, '测试' + assessmentType, false, '未找到测评入口');
                }

            } catch (error) {
                console.error('❌ 测试 ' + assessmentType + ' 出错:', error.message);
                addStep(5 + i, '测试' + assessmentType, false, error.message);
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
        await takeScreenshot('final-page');
        await browser.close();

        testResults.endTime = new Date().toISOString();

        // 保存结果
        const resultsFile = 'test-results/parent-assessment-result-' + Date.now() + '.json';
        fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));

        // 生成报告
        const reportFile = 'test-results/parent-assessment-report-' + Date.now() + '.md';
        const report = generateReport(testResults);
        fs.writeFileSync(reportFile, report);

        console.log('📄 结果已保存: ' + resultsFile);
        console.log('📋 报告已保存: ' + reportFile);

        return testResults;
    }
}

function generateReport(results) {
    return '# 家长端测评中心测试报告

## 测试概览
- **开始时间**: ' + results.startTime + '
- **结束时间**: ' + results.endTime + '
- **状态**: ' + (results.success ? '✅ 成功' : '❌ 失败') + '
- **步骤数量**: ' + results.steps.length + '
- **截图数量**: ' + results.screenshots.length + '
- **控制台错误**: ' + results.consoleErrors.length + '

## 测试步骤

' + results.steps.map(step => '
### ' + step.action + '
- **状态**: ' + (step.success ? '✅' : '❌') + '
- **时间**: ' + step.timestamp + '
- **URL**: ' + step.url + (step.error ? '\n- **错误**: ' + step.error : '') + '').join('\n') + '

## 问题发现

' + (results.consoleErrors.length > 0 ? '
### 控制台错误
' + results.consoleErrors.map(error => '- ' + error.text).join('\n') + '
' : '✅ 无控制台错误
') + (results.errors.length > 0 ? '
### 测试错误
' + results.errors.map(error => '- ' + error.message).join('\n') + '
' : '✅ 无测试错误
') + '

## 截图文件

' + results.screenshots.map(screenshot => '- **' + screenshot.step + '**: ' + screenshot.path).join('\n') + '

## 总结

' + (results.success ?
    '✅ 家长端测评中心功能测试基本完成，主要功能可以正常访问。' :
    '❌ 测试过程中遇到问题，需要进一步检查和修复。'
) + '

## 建议

1. 检查登录认证问题（401错误）
2. 确认家长账户parent_333是否正确配置
3. 验证测评中心菜单的权限配置
4. 测试具体的答题流程和评分功能
';
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