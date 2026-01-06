const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
    baseUrl: 'http://localhost:5173',
    apiUrl: 'http://localhost:3000',
    aiAssistantPath: '/centers/ai',
    credentials: {
        username: 'admin',
        password: 'admin123'
    },
    timeout: 30000,
    screenshotDir: './test-results/ai-assistant-test',
    testFiles: {
        document: {
            path: './test-data/sample-document.pdf',
            name: 'sample-document.pdf'
        },
        image: {
            path: './test-data/sample-image.jpg',
            name: 'sample-image.jpg'
        }
    }
};

// 创建测试结果目录
if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// 创建测试数据目录
const testDir = './test-data';
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

// 创建测试文件
function createTestFiles() {
    // 创建一个简单的文本文件作为测试文档
    const sampleDoc = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n178\n%%EOF');

    // 创建一个简单的图片文件
    const sampleImage = Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');

    fs.writeFileSync(CONFIG.testFiles.document.path, sampleDoc);
    fs.writeFileSync(CONFIG.testFiles.image.path, sampleImage);

    console.log('✅ 测试文件创建完成');
}

// 记录测试结果
const testResults = {
    startTime: new Date(),
    steps: [],
    errors: [],
    screenshots: [],
    consoleLogs: [],
    networkRequests: [],
    success: false
};

// 记录步骤
function logStep(step, status = 'info', details = null) {
    const stepInfo = {
        step,
        status,
        timestamp: new Date(),
        details
    };
    testResults.steps.push(stepInfo);
    console.log(`[${status.toUpperCase()}] ${step}${details ? ': ' + details : ''}`);
}

// 记录错误
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

// 截图功能
async function takeScreenshot(page, name) {
    try {
        const screenshotPath = path.join(CONFIG.screenshotDir, `${name}_${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResults.screenshots.push({
            name,
            path: screenshotPath,
            timestamp: new Date()
        });
        console.log(`📸 截图已保存: ${screenshotPath}`);
        return screenshotPath;
    } catch (error) {
        logError(error, '截图失败');
        return null;
    }
}

// 监听控制台日志
function setupConsoleListener(page) {
    page.on('console', (msg) => {
        const logEntry = {
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date()
        };
        testResults.consoleLogs.push(logEntry);

        if (msg.type() === 'error') {
            logError(new Error(msg.text()), '控制台错误');
        }
    });
}

// 监听网络请求
function setupNetworkListener(page) {
    page.on('request', (request) => {
        const requestInfo = {
            url: request.url(),
            method: request.method(),
            timestamp: new Date()
        };
        testResults.networkRequests.push(requestInfo);
    });

    page.on('response', (response) => {
        const responseInfo = {
            url: response.url(),
            status: response.status(),
            timestamp: new Date()
        };

        if (response.status() >= 400) {
            logError(new Error(`HTTP ${response.status()}: ${response.url()}`), '网络请求错误');
        }
    });
}

// 主测试函数
async function runAIAssistantTest() {
    let browser;
    let page;

    try {
        logStep('开始AI助手文件上传和图片分析功能测试');

        // 创建测试文件
        createTestFiles();

        logStep('启动浏览器');
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            slowMo: 500
        });

        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // 设置监听器
        setupConsoleListener(page);
        setupNetworkListener(page);

        logStep('导航到登录页面');
        await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' });
        await takeScreenshot(page, '01_login_page');

        // 等待登录页面加载
        await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });

        logStep('填写登录凭据');
        await page.type('input[type="text"], input[type="email"]', CONFIG.credentials.username);
        await page.type('input[type="password"]', CONFIG.credentials.password);
        await takeScreenshot(page, '02_credentials_filled');

        logStep('提交登录表单');
        await page.click('button[type="submit"], button:has-text("登录"), .el-button--primary');

        // 等待登录成功
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        await takeScreenshot(page, '03_login_success');

        logStep('导航到AI助手页面');
        await page.goto(`${CONFIG.baseUrl}${CONFIG.aiAssistantPath}`, { waitUntil: 'networkidle2' });
        await takeScreenshot(page, '04_ai_assistant_page');

        // 检查页面是否正确加载
        const pageTitle = await page.title();
        logStep(`页面标题: ${pageTitle}`);

        // 等待AI助手页面完全加载
        await page.waitForTimeout(3000);

        // 检查AI助手界面的关键元素
        logStep('检查AI助手界面元素');

        // 查找聊天输入框
        const chatInput = await page.$('textarea[placeholder*="输入"], .el-textarea__inner, input[placeholder*="消息"]');
        if (chatInput) {
            logStep('✅ 找到聊天输入框', 'success');
        } else {
            logStep('❌ 未找到聊天输入框', 'error');
        }

        // 查找上传按钮
        const uploadButtons = await page.$$('button:has-text("上传"), .upload-btn, [class*="upload"], .el-button:has(.el-icon-upload)');
        logStep(`找到 ${uploadButtons.length} 个上传按钮`, 'info');

        if (uploadButtons.length === 0) {
            // 尝试其他选择器
            const altUploadButtons = await page.$$('input[type="file"], .file-upload, [data-testid*="upload"]');
            logStep(`使用替代选择器找到 ${altUploadButtons.length} 个上传元素`, 'info');
        }

        // 查找附件按钮
        const attachmentButtons = await page.$$('button:has-text("附件"), .attachment-btn, [class*="attachment"], .el-button:has(.el-icon-paperclip)');
        logStep(`找到 ${attachmentButtons.length} 个附件按钮`, 'info');

        await takeScreenshot(page, '05_ui_elements_check');

        // 测试文件上传功能
        logStep('开始测试文件上传功能');

        // 首先尝试直接查找文件输入元素
        const fileInputs = await page.$$('input[type="file"]');
        logStep(`找到 ${fileInputs.length} 个文件输入元素`, 'info');

        if (fileInputs.length > 0) {
            // 测试文档上传
            logStep('测试文档上传');
            const documentBuffer = fs.readFileSync(CONFIG.testFiles.document.path);
            await fileInputs[0].uploadFile(CONFIG.testFiles.document.path);
            await takeScreenshot(page, '06_document_uploaded');
            logStep('✅ 文档上传完成', 'success');

            // 等待文件处理
            await page.waitForTimeout(2000);

            // 检查是否有文件显示
            const fileDisplays = await page.$$('.file-item, .upload-file, [class*="file-item"]');
            logStep(`找到 ${fileDisplays.length} 个文件显示元素`, 'info');

            // 测试发送消息给AI
            if (chatInput) {
                logStep('发送消息给AI分析文档');
                await chatInput.click();
                await chatInput.type('请分析我上传的文档内容');
                await takeScreenshot(page, '07_message_typed');

                // 查找发送按钮
                const sendButton = await page.$('button:has-text("发送"), .send-btn, [class*="send"], .el-button:has(.el-icon-sender)');
                if (sendButton) {
                    await sendButton.click();
                    logStep('✅ 消息已发送', 'success');
                    await takeScreenshot(page, '08_message_sent');

                    // 等待AI响应
                    await page.waitForTimeout(5000);
                    await takeScreenshot(page, '09_ai_response');
                } else {
                    logStep('❌ 未找到发送按钮', 'error');
                }
            }

        } else {
            logStep('❌ 未找到文件输入元素，尝试其他方式', 'error');

            // 尝试点击上传按钮
            if (uploadButtons.length > 0) {
                logStep('尝试点击上传按钮');
                await uploadButtons[0].click();
                await page.waitForTimeout(1000);
                await takeScreenshot(page, '06_upload_button_clicked');

                // 再次查找文件输入元素
                const fileInputsAfterClick = await page.$$('input[type="file"]');
                if (fileInputsAfterClick.length > 0) {
                    logStep('✅ 点击后找到文件输入元素', 'success');
                    await fileInputsAfterClick[0].uploadFile(CONFIG.testFiles.document.path);
                    await takeScreenshot(page, '07_file_uploaded_after_click');
                }
            }
        }

        // 测试图片上传
        logStep('开始测试图片上传功能');
        const fileInputsForImage = await page.$$('input[type="file"]');

        if (fileInputsForImage.length > 0) {
            const imageBuffer = fs.readFileSync(CONFIG.testFiles.image.path);
            await fileInputsForImage[0].uploadFile(CONFIG.testFiles.image.path);
            await takeScreenshot(page, '10_image_uploaded');
            logStep('✅ 图片上传完成', 'success');

            // 等待图片处理
            await page.waitForTimeout(2000);

            // 发送消息请求AI分析图片
            if (chatInput) {
                logStep('请求AI分析图片');
                await chatInput.click();
                await chatInput.type('请分析我上传的图片内容');
                await takeScreenshot(page, '11_image_analysis_request');

                // 查找发送按钮
                const sendButton = await page.$('button:has-text("发送"), .send-btn, [class*="send"], .el-button:has(.el-icon-sender)');
                if (sendButton) {
                    await sendButton.click();
                    logStep('✅ 图片分析请求已发送', 'success');
                    await takeScreenshot(page, '12_image_analysis_sent');

                    // 等待AI响应
                    await page.waitForTimeout(8000);
                    await takeScreenshot(page, '13_image_analysis_response');
                }
            }
        }

        // 检查AI响应区域
        logStep('检查AI响应区域');
        const aiResponses = await page.$$('.ai-message, .response, [class*="message"]:not(.user-message), .el-message');
        logStep(`找到 ${aiResponses.length} 个AI响应元素`, 'info');

        // 检查是否有错误信息
        const errorMessages = await page.$$('.error, .el-alert--error, [role="alert"], .message-error');
        logStep(`找到 ${errorMessages.length} 个错误信息`, 'info');

        if (errorMessages.length > 0) {
            for (let i = 0; i < errorMessages.length; i++) {
                const errorText = await errorMessages[i].evaluate(el => el.textContent);
                logStep(`错误信息 ${i + 1}: ${errorText}`, 'error');
            }
        }

        await takeScreenshot(page, '14_final_state');

        logStep('测试完成', 'success');
        testResults.success = true;

    } catch (error) {
        logError(error, '主测试流程');
        testResults.success = false;

        if (page) {
            await takeScreenshot(page, 'error_state');
        }
    } finally {
        if (browser) {
            await browser.close();
        }

        // 生成测试报告
        testResults.endTime = new Date();
        testResults.duration = testResults.endTime - testResults.startTime;

        // 保存测试报告
        const reportPath = path.join(CONFIG.screenshotDir, `ai-assistant-test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

        // 生成Markdown报告
        const markdownReport = generateMarkdownReport(testResults);
        const markdownPath = path.join(CONFIG.screenshotDir, `ai-assistant-test-report-${Date.now()}.md`);
        fs.writeFileSync(markdownPath, markdownReport);

        console.log(`\n📋 测试报告已保存:`);
        console.log(`JSON: ${reportPath}`);
        console.log(`Markdown: ${markdownPath}`);

        // 清理测试文件
        try {
            fs.unlinkSync(CONFIG.testFiles.document.path);
            fs.unlinkSync(CONFIG.testFiles.image.path);
            console.log('🧹 测试文件已清理');
        } catch (error) {
            console.log('⚠️ 清理测试文件失败:', error.message);
        }

        return testResults;
    }
}

// 生成Markdown报告
function generateMarkdownReport(results) {
    return `# AI助手文件上传和图片分析功能测试报告

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
        `### ❌ ${error.message}\n\`\`\`\n${error.stack}\n\`\`\`\n**上下文**: ${error.context}\n`
    ).join('\n') :
    '✅ 无错误'
}

## 控制台日志
${results.consoleLogs.map(log =>
    `- [${log.type.toUpperCase()}] ${log.text}`
).join('\n')}

## 网络请求
- 总请求数: ${results.networkRequests.length}

## 截图
${results.screenshots.map(screenshot =>
    `- [${screenshot.name}](${screenshot.path}) - ${screenshot.timestamp}`
).join('\n')}

## 测试总结
${results.success ?
    '✅ 测试成功完成，AI助手文件上传功能基本正常。' :
    '❌ 测试过程中遇到问题，需要进一步调试。'
}

## 建议
1. ${results.errors.length === 0 ? '文件上传功能运行正常' : '需要修复文件上传相关错误'}
2. ${results.consoleLogs.filter(log => log.type === 'error').length === 0 ? '控制台无错误信息' : '需要检查前端控制台错误'}
3. 建议添加更明确的用户反馈机制
4. 建议优化文件上传的加载状态显示
`;
}

// 运行测试
if (require.main === module) {
    runAIAssistantTest()
        .then(results => {
            console.log('\n🎉 AI助手测试完成');
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 测试执行失败:', error);
            process.exit(1);
        });
}

module.exports = { runAIAssistantTest };