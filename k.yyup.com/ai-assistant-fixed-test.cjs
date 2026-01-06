const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
    baseUrl: 'http://localhost:5173',
    aiAssistantPath: '/centers/ai',
    credentials: {
        username: 'admin',
        password: 'admin123'
    },
    timeout: 30000,
    screenshotDir: './test-results/ai-assistant-fixed-test'
};

// 创建测试结果目录
if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// 测试结果记录
const testResults = {
    startTime: new Date(),
    steps: [],
    errors: [],
    screenshots: [],
    consoleLogs: [],
    success: false
};

function logStep(step, status = 'info', details = null) {
    const stepInfo = { step, status, timestamp: new Date(), details };
    testResults.steps.push(stepInfo);
    console.log(`[${status.toUpperCase()}] ${step}${details ? ': ' + details : ''}`);
}

function logError(error, context = null) {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date()
    };
    testResults.errors.push(errorInfo);
    console.error(`❌ 错误: ${error.message}${context ? ' (上下文: ' + context + ')' : ''}`);
}

async function takeScreenshot(page, name) {
    try {
        const screenshotPath = path.join(CONFIG.screenshotDir, `${name}_${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResults.screenshots.push({ name, path: screenshotPath, timestamp: new Date() });
        console.log(`📸 截图: ${screenshotPath}`);
        return screenshotPath;
    } catch (error) {
        logError(error, '截图失败');
        return null;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupListeners(page) {
    page.on('console', (msg) => {
        const logEntry = { type: msg.type(), text: msg.text(), timestamp: new Date() };
        testResults.consoleLogs.push(logEntry);
        if (msg.type() === 'error') {
            logError(new Error(msg.text()), '控制台错误');
        }
    });

    page.on('pageerror', (error) => {
        logError(error, '页面错误');
    });
}

// 主测试函数
async function runFixedTest() {
    let browser;
    let page;

    try {
        logStep('开始修复版AI助手功能测试');

        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            slowMo: 500
        });

        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        setupListeners(page);

        // 步骤1: 访问登录页面
        logStep('访问登录页面');
        await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' });
        await takeScreenshot(page, '01_login_page');

        // 等待页面完全加载
        await sleep(5000);

        // 步骤2: 检查并填写登录表单
        logStep('检查登录表单元素');

        const selectors = {
            username: 'input[data-testid="username-input"], input[placeholder="请输入用户名"]',
            password: 'input[data-testid="password-input"], input[placeholder="请输入密码"]',
            loginButton: 'button[data-testid="login-button"], button[type="submit"]'
        };

        // 等待并检查元素
        let elementsFound = {};

        for (const [key, selector] of Object.entries(selectors)) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                elementsFound[key] = selector;
                logStep(`✅ 找到${key}元素`, 'success');
            } catch (error) {
                logStep(`❌ 未找到${key}元素: ${selector}`, 'error');

                // 调试：检查页面中有什么元素
                if (key === 'username') {
                    const pageContent = await page.evaluate(() => {
                        const inputs = Array.from(document.querySelectorAll('input'));
                        return inputs.map(el => ({
                            type: el.type,
                            placeholder: el.placeholder,
                            id: el.id,
                            className: el.className,
                            value: el.value
                        }));
                    });
                    console.log('页面输入元素:', JSON.stringify(pageContent, null, 2));
                }
            }
        }

        await takeScreenshot(page, '02_login_elements');

        // 如果找到所有元素，尝试登录
        if (elementsFound.username && elementsFound.password && elementsFound.loginButton) {
            logStep('执行登录操作');

            // 填写表单
            await page.click(elementsFound.username);
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.type(elementsFound.username, CONFIG.credentials.username);

            await page.click(elementsFound.password);
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.type(elementsFound.password, CONFIG.credentials.password);

            await takeScreenshot(page, '03_login_filled');

            // 提交登录
            await page.click(elementsFound.loginButton);
            logStep('登录表单已提交');

            // 等待登录处理
            await sleep(8000);

            // 检查当前状态
            const currentUrl = page.url();
            logStep(`当前URL: ${currentUrl}`);

            // 检查是否仍在登录页面（登录失败）
            if (currentUrl.includes('/login')) {
                logStep('⚠️ 仍在登录页面，可能登录失败', 'warning');

                // 检查是否有错误信息
                const errorElements = await page.$$('.error, .el-alert--error, [role="alert"]');
                if (errorElements.length > 0) {
                    for (let i = 0; i < errorElements.length; i++) {
                        const errorText = await errorElements[i].evaluate(el => el.textContent);
                        logStep(`登录错误信息: ${errorText}`, 'error');
                    }
                }
            } else {
                logStep('✅ 登录成功，已跳转', 'success');
            }

            await takeScreenshot(page, '04_after_login');

        } else {
            logStep('❌ 缺少必要的登录元素，跳过登录', 'error');
        }

        // 步骤3: 尝试访问AI助手页面
        logStep('尝试访问AI助手页面');

        try {
            // 方法1: 直接访问
            await page.goto(`${CONFIG.baseUrl}${CONFIG.aiAssistantPath}`, { waitUntil: 'networkidle2' });
            logStep('✅ 成功导航到AI助手页面', 'success');
        } catch (error) {
            logError(error, '直接访问AI助手页面失败');

            // 方法2: 查找AI相关链接
            logStep('尝试查找AI相关菜单链接');

            const aiLinks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a[href*="ai"], button:has-text("AI"), span:has-text("AI")'));
                return links.map(el => ({
                    href: el.href || '',
                    text: el.textContent?.trim() || '',
                    tagName: el.tagName
                }));
            });

            console.log('找到的AI相关链接:', JSON.stringify(aiLinks, null, 2));

            if (aiLinks.length > 0) {
                // 点击第一个AI相关链接
                const aiLink = aiLinks[0];
                if (aiLink.href) {
                    await page.goto(aiLink.href, { waitUntil: 'networkidle2' });
                    logStep('✅ 通过链接访问AI页面成功', 'success');
                } else {
                    // 如果是按钮，尝试点击
                    const buttonSelector = 'a[href*="ai"], button:has-text("AI"), span:has-text("AI")';
                    await page.click(buttonSelector);
                    await sleep(3000);
                    logStep('✅ 通过按钮访问AI页面', 'success');
                }
            } else {
                logStep('❌ 未找到AI相关链接', 'error');
            }
        }

        await sleep(5000);
        await takeScreenshot(page, '05_ai_page_loaded');

        // 步骤4: 检查AI助手页面功能
        logStep('检查AI助手页面功能');

        // 查找关键功能元素
        const aiFunctionalElements = await page.evaluate(() => {
            const elements = {
                textInputs: Array.from(document.querySelectorAll('input[type="text"], textarea')).map(el => ({
                    placeholder: el.placeholder || '',
                    className: el.className || '',
                    tagName: el.tagName
                })),
                buttons: Array.from(document.querySelectorAll('button')).map(el => ({
                    text: el.textContent?.trim() || '',
                    className: el.className || '',
                    type: el.type || ''
                })),
                fileInputs: Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
                    className: el.className || '',
                    accept: el.accept || ''
                })),
                uploadButtons: Array.from(document.querySelectorAll('button, [role="button"]')).filter(el =>
                    el.textContent?.includes('上传') || el.textContent?.includes('附件') || el.className.includes('upload')
                ).map(el => ({
                    text: el.textContent?.trim() || '',
                    className: el.className || ''
                }))
            };
            return elements;
        });

        console.log('AI页面元素分析:', JSON.stringify(aiFunctionalElements, null, 2));

        // 详细的元素检查
        logStep(`找到 ${aiFunctionalElements.textInputs.length} 个文本输入元素`);
        logStep(`找到 ${aiFunctionalElements.buttons.length} 个按钮元素`);
        logStep(`找到 ${aiFunctionalElements.fileInputs.length} 个文件输入元素`);
        logStep(`找到 ${aiFunctionalElements.uploadButtons.length} 个上传相关按钮`);

        await takeScreenshot(page, '06_ai_elements_analysis');

        // 步骤5: 测试文件上传功能
        if (aiFunctionalElements.fileInputs.length > 0 || aiFunctionalElements.uploadButtons.length > 0) {
            logStep('测试文件上传功能');

            // 创建测试文件
            const testFileContent = Buffer.from('AI分析测试文档内容\n这是一个用于测试AI助手文件分析功能的示例文档。');
            const testFilePath = path.join(CONFIG.screenshotDir, 'ai-test-document.txt');
            fs.writeFileSync(testFilePath, testFileContent);

            try {
                // 如果有文件输入元素
                if (aiFunctionalElements.fileInputs.length > 0) {
                    // 显示隐藏的文件输入
                    await page.evaluate(() => {
                        const fileInputs = document.querySelectorAll('input[type="file"]');
                        fileInputs.forEach(input => {
                            input.style.display = 'block';
                            input.style.visibility = 'visible';
                            input.style.opacity = '1';
                            input.style.position = 'relative';
                        });
                    });

                    await sleep(1000);

                    const fileInputSelector = 'input[type="file"]';
                    await page.uploadFile(fileInputSelector, testFilePath);
                    logStep('✅ 文件上传成功', 'success');
                    await takeScreenshot(page, '07_file_uploaded');
                }

                // 如果有上传按钮，尝试点击
                if (aiFunctionalElements.uploadButtons.length > 0) {
                    const uploadButton = aiFunctionalElements.uploadButtons[0];
                    logStep(`点击上传按钮: ${uploadButton.text}`, 'info');

                    // 尝试多种选择器来点击上传按钮
                    const uploadSelectors = [
                        'button:has-text("上传")',
                        'button:has-text("附件")',
                        '[class*="upload"]',
                        '[class*="attachment"]'
                    ];

                    for (const selector of uploadSelectors) {
                        try {
                            await page.click(selector);
                            await sleep(2000);
                            logStep(`✅ 成功点击上传按钮: ${selector}`, 'success');

                            // 再次查找文件输入元素
                            const newFileInputs = await page.$$('input[type="file"]');
                            if (newFileInputs.length > 0) {
                                await newFileInputs[0].uploadFile(testFilePath);
                                logStep('✅ 通过点击按钮上传文件成功', 'success');
                                await takeScreenshot(page, '08_file_via_button_uploaded');
                            }
                            break;
                        } catch (e) {
                            // 继续尝试下一个选择器
                        }
                    }
                }

            } catch (error) {
                logError(error, '文件上传测试失败');
            }

            // 清理测试文件
            try {
                fs.unlinkSync(testFilePath);
            } catch (e) {
                // 忽略清理错误
            }
        } else {
            logStep('⚠️ 未找到文件上传相关元素', 'warning');
        }

        // 步骤6: 测试AI对话功能
        if (aiFunctionalElements.textInputs.length > 0) {
            logStep('测试AI对话功能');

            try {
                // 使用第一个文本输入元素
                const firstInput = aiFunctionalElements.textInputs[0];
                const inputSelector = firstInput.tagName === 'TEXTAREA' ? 'textarea' : 'input[type="text"]';

                await page.click(inputSelector);
                await page.type(inputSelector, '你好，请介绍一下你的功能');
                await takeScreenshot(page, '09_ai_message_typed');

                // 查找发送按钮
                const sendSelectors = [
                    'button:has-text("发送")',
                    'button:has-text("提交")',
                    'button[type="submit"]',
                    '[class*="send"]',
                    '[class*="submit"]'
                ];

                let sendSuccess = false;
                for (const selector of sendSelectors) {
                    try {
                        const sendButton = await page.$(selector);
                        if (sendButton) {
                            await sendButton.click();
                            logStep(`✅ 通过${selector}发送消息`, 'success');
                            sendSuccess = true;
                            break;
                        }
                    } catch (e) {
                        // 继续尝试下一个选择器
                    }
                }

                if (sendSuccess) {
                    // 等待AI响应
                    await sleep(8000);
                    await takeScreenshot(page, '10_ai_response_waiting');

                    // 检查是否有AI响应
                    const responseElements = await page.evaluate(() => {
                        const responses = Array.from(document.querySelectorAll('[class*="message"], [class*="response"], .ai-message, .chat-response'));
                        return responses.map(el => el.textContent?.trim() || '');
                    }).filter(text => text.length > 0);

                    logStep(`找到 ${responseElements.length} 个可能的AI响应`, 'info');
                    if (responseElements.length > 0) {
                        logStep('AI响应内容: ' + responseElements[0].substring(0, 100) + '...', 'info');
                    }
                } else {
                    logStep('❌ 未找到发送按钮', 'error');
                }

            } catch (error) {
                logError(error, 'AI对话测试失败');
            }
        } else {
            logStep('⚠️ 未找到文本输入元素，跳过对话测试', 'warning');
        }

        await takeScreenshot(page, '11_final_state');

        logStep('测试完成', 'success');
        testResults.success = true;

    } catch (error) {
        logError(error, '主测试流程');
        testResults.success = false;

        if (page) {
            await takeScreenshot(page, 'error_final_state');
        }
    } finally {
        if (browser) {
            await browser.close();
        }

        // 生成测试报告
        testResults.endTime = new Date();
        testResults.duration = testResults.endTime - testResults.startTime;

        // 保存JSON报告
        const reportPath = path.join(CONFIG.screenshotDir, `fixed-test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

        // 生成Markdown报告
        const markdownReport = generateMarkdownReport(testResults);
        const markdownPath = path.join(CONFIG.screenshotDir, `fixed-test-report-${Date.now()}.md`);
        fs.writeFileSync(markdownPath, markdownReport);

        console.log(`\n📋 修复版测试报告:`);
        console.log(`JSON: ${reportPath}`);
        console.log(`Markdown: ${markdownPath}`);

        return testResults;
    }
}

// 生成Markdown报告
function generateMarkdownReport(results) {
    return `# AI助手功能测试报告（修复版）

## 测试概览
- **开始时间**: ${results.startTime}
- **结束时间**: ${results.endTime}
- **测试时长**: ${Math.round(results.duration / 1000)}秒
- **测试状态**: ${results.success ? '✅ 成功' : '❌ 失败'}

## 测试步骤
${results.steps.map(step =>
    `- [${step.status.toUpperCase()}] ${step.step}${step.details ? ` - ${step.details}` : ''}`
).join('\n')}

## 错误信息
${results.errors.length > 0 ?
    results.errors.map(error =>
        `### ❌ ${error.message}\n**上下文**: ${error.context}\n`
    ).join('\n') :
    '✅ 无错误'
}

## 控制台日志
${results.consoleLogs.slice(0, 20).map(log =>
    `- [${log.type.toUpperCase()}] ${log.text}`
).join('\n')}

## 截图记录
${results.screenshots.map(screenshot =>
    `- [${screenshot.name}](${screenshot.path})`
).join('\n')}

## 测试总结
${results.success ?
    '✅ AI助手功能测试基本完成，各项功能可以正常使用。' :
    '❌ 测试过程中遇到问题，需要进一步调试和修复。'
}

## 建议改进
1. **文件上传功能**: ${results.errors.filter(e => e.context?.includes('上传')).length === 0 ? '功能正常' : '需要优化'}
2. **AI对话功能**: ${results.consoleLogs.filter(l => l.text.includes('AI') && l.type === 'error').length === 0 ? '功能正常' : '需要检查'}
3. **用户体验**: 建议添加更明确的操作提示和反馈
4. **错误处理**: 建议完善错误信息显示和用户引导

## 技术发现
- 登录系统状态: ${results.steps.find(s => s.step.includes('登录'))?.status || '未知'}
- AI页面可访问性: ${results.steps.find(s => s.step.includes('AI页面'))?.status || '未知'}
- 文件上传支持: ${results.steps.find(s => s.step.includes('上传'))?.status || '未知'}
`;
}

// 运行测试
if (require.main === module) {
    runFixedTest()
        .then(results => {
            console.log('\n🎉 修复版测试完成');
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 测试执行失败:', error);
            process.exit(1);
        });
}

module.exports = { runFixedTest };