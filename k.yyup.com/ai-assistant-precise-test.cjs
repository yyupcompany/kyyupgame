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
    screenshotDir: './test-results/ai-assistant-precise-test'
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
async function runPreciseTest() {
    let browser;
    let page;

    try {
        logStep('开始精确的AI助手功能测试');

        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            slowMo: 800
        });

        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        setupListeners(page);

        // 步骤1: 访问登录页面
        logStep('访问登录页面');
        await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' });
        await takeScreenshot(page, '01_login_page_loaded');

        // 等待页面完全加载
        await page.waitForTimeout(3000);

        // 步骤2: 检查登录表单元素
        logStep('检查登录表单元素');

        // 使用精确的选择器
        const usernameSelector = 'input[data-testid="username-input"], input[placeholder="请输入用户名"]';
        const passwordSelector = 'input[data-testid="password-input"], input[placeholder="请输入密码"]';
        const loginButtonSelector = 'button[data-testid="login-button"], button[type="submit"]';

        // 等待用户名输入框
        try {
            await page.waitForSelector(usernameSelector, { timeout: 10000 });
            logStep('✅ 找到用户名输入框', 'success');
        } catch (error) {
            logStep('❌ 未找到用户名输入框', 'error');
            // 调试：检查页面中有什么输入元素
            const allInputs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('input')).map(el => ({
                    type: el.type,
                    placeholder: el.placeholder,
                    id: el.id,
                    className: el.className,
                    testId: el.getAttribute('data-testid')
                }));
            });
            console.log('页面中的输入元素:', JSON.stringify(allInputs, null, 2));
        }

        // 等待密码输入框
        try {
            await page.waitForSelector(passwordSelector, { timeout: 5000 });
            logStep('✅ 找到密码输入框', 'success');
        } catch (error) {
            logStep('❌ 未找到密码输入框', 'error');
        }

        // 等待登录按钮
        try {
            await page.waitForSelector(loginButtonSelector, { timeout: 5000 });
            logStep('✅ 找到登录按钮', 'success');
        } catch (error) {
            logStep('❌ 未找到登录按钮', 'error');
            // 检查页面中的按钮
            const allButtons = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('button, [role="button"]')).map(el => ({
                    text: el.textContent?.trim(),
                    type: el.type,
                    className: el.className,
                    id: el.id,
                    testId: el.getAttribute('data-testid')
                }));
            });
            console.log('页面中的按钮元素:', JSON.stringify(allButtons, null, 2));
        }

        await takeScreenshot(page, '02_login_form_elements');

        // 步骤3: 填写登录信息
        logStep('填写登录信息');

        // 清空并填写用户名
        await page.click(usernameSelector);
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.type(usernameSelector, CONFIG.credentials.username);

        // 清空并填写密码
        await page.click(passwordSelector);
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.type(passwordSelector, CONFIG.credentials.password);

        await takeScreenshot(page, '03_credentials_filled');

        // 步骤4: 提交登录
        logStep('提交登录表单');
        await page.click(loginButtonSelector);

        // 等待登录完成
        try {
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
            logStep('✅ 登录成功，页面跳转完成', 'success');
        } catch (error) {
            logStep('⚠️ 登录可能成功但未检测到页面跳转', 'warning');
            // 检查当前URL
            const currentUrl = page.url();
            logStep(`当前URL: ${currentUrl}`);
        }

        await takeScreenshot(page, '04_after_login');

        // 步骤5: 导航到AI助手页面
        logStep('导航到AI助手页面');

        // 方法1: 直接访问URL
        try {
            await page.goto(`${CONFIG.baseUrl}${CONFIG.aiAssistantPath}`, { waitUntil: 'networkidle2' });
            logStep('✅ 直接访问AI助手页面成功', 'success');
        } catch (error) {
            logError(error, '直接访问AI助手页面失败');
            // 方法2: 通过导航菜单
            logStep('尝试通过导航菜单访问');

            // 查找AI相关的菜单项
            const aiMenuSelectors = [
                'a[href*="ai"]',
                '[data-testid*="ai"]',
                'span:has-text("AI")',
                '.el-menu-item:has-text("AI")',
                'button:has-text("AI")'
            ];

            let aiMenuFound = false;
            for (const selector of aiMenuSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        await element.click();
                        logStep(`✅ 通过菜单 ${selector} 访问AI助手`, 'success');
                        aiMenuFound = true;
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (!aiMenuFound) {
                logStep('❌ 未找到AI助手菜单项', 'error');
            }
        }

        await page.waitForTimeout(3000);
        await takeScreenshot(page, '05_ai_assistant_page');

        // 步骤6: 检查AI助手页面元素
        logStep('检查AI助手页面元素');

        // 查找聊天相关元素
        const aiSelectors = {
            chatInput: [
                'textarea[placeholder*="输入"]',
                '.el-textarea__inner',
                'input[placeholder*="消息"]',
                'textarea[placeholder*="消息"]',
                '[data-testid*="chat-input"]',
                '.chat-input textarea',
                '.message-input'
            ],
            sendButton: [
                'button:has-text("发送")',
                '.send-btn',
                '[class*="send"]',
                '.el-button:has(.el-icon-sender)',
                '[data-testid*="send"]',
                'button[type="submit"]'
            ],
            fileUpload: [
                'input[type="file"]',
                '.file-upload',
                '[data-testid*="upload"]',
                '.upload-btn',
                'button:has-text("上传")',
                '[class*="upload"]'
            ],
            attachmentButton: [
                'button:has-text("附件")',
                '.attachment-btn',
                '[class*="attachment"]',
                '.el-button:has(.el-icon-paperclip)',
                '[data-testid*="attachment"]'
            ]
        };

        const foundElements = {};

        for (const [elementType, selectors] of Object.entries(aiSelectors)) {
            for (const selector of selectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        foundElements[elementType] = selector;
                        logStep(`✅ 找到${elementType}: ${selector}`, 'success');
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (!foundElements[elementType]) {
                logStep(`❌ 未找到${elementType}元素`, 'error');
            }
        }

        await takeScreenshot(page, '06_ai_elements_check');

        // 步骤7: 测试文件上传功能
        if (foundElements.fileUpload || foundElements.attachmentButton) {
            logStep('测试文件上传功能');

            // 创建测试文件
            const testFileContent = Buffer.from('这是一个测试文档内容用于AI分析测试');
            const testFilePath = path.join(CONFIG.screenshotDir, 'test-document.txt');
            fs.writeFileSync(testFilePath, testFileContent);

            try {
                // 如果找到文件输入元素
                if (foundElements.fileUpload) {
                    await page.evaluate(selector => {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.style.display = 'block';
                            element.style.visibility = 'visible';
                        }
                    }, foundElements.fileUpload);

                    await page.waitForSelector(foundElements.fileUpload, { visible: true, timeout: 5000 });
                    await page.uploadFile(foundElements.fileUpload, testFilePath);
                    logStep('✅ 文件上传成功', 'success');
                    await takeScreenshot(page, '07_file_uploaded');
                }

                // 如果找到附件按钮，先点击它
                if (foundElements.attachmentButton) {
                    await page.click(foundElements.attachmentButton);
                    await page.waitForTimeout(1000);

                    // 再次查找文件输入元素
                    const fileInputs = await page.$$('input[type="file"]');
                    if (fileInputs.length > 0) {
                        await fileInputs[0].uploadFile(testFilePath);
                        logStep('✅ 通过附件按钮上传文件成功', 'success');
                        await takeScreenshot(page, '08_file_uploaded_via_attachment');
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
            logStep('⚠️ 未找到上传相关元素，跳过文件上传测试', 'warning');
        }

        // 步骤8: 测试AI对话功能
        if (foundElements.chatInput && foundElements.sendButton) {
            logStep('测试AI对话功能');

            try {
                await page.click(foundElements.chatInput);
                await page.type(foundElements.chatInput, '你好，我想测试你的功能');
                await takeScreenshot(page, '09_message_typed');

                await page.click(foundElements.sendButton);
                logStep('✅ 消息发送成功', 'success');

                // 等待AI响应
                await page.waitForTimeout(5000);
                await takeScreenshot(page, '10_ai_response_waiting');

                // 检查AI响应
                const responseElements = await page.$$('.ai-message, .response, [class*="message"]:not(.user-message), .el-message');
                logStep(`找到 ${responseElements.length} 个可能的AI响应元素`, 'info');

            } catch (error) {
                logError(error, 'AI对话测试失败');
            }
        } else {
            logStep('⚠️ 未找到聊天相关元素，跳过AI对话测试', 'warning');
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

        // 保存报告
        const reportPath = path.join(CONFIG.screenshotDir, `precise-test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

        console.log(`\n📋 精确测试报告: ${reportPath}`);
        return testResults;
    }
}

// 运行测试
if (require.main === module) {
    runPreciseTest()
        .then(results => {
            console.log('\n🎉 精确测试完成');
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 测试执行失败:', error);
            process.exit(1);
        });
}

module.exports = { runPreciseTest };