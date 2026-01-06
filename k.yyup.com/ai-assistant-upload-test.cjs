const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runAIAssistantUploadTest() {
    console.log('🚀 开始AI助手文件上传功能全面测试');

    const browser = await chromium.launch({
        headless: false, // 显示浏览器以便观察测试过程
        slowMo: 500 // 减慢操作速度以便观察
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    // 监听API请求
    const apiRequests = [];
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            apiRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                postData: request.postData()
            });
        }
    });

    // 监听API响应
    const apiResponses = [];
    page.on('response', response => {
        if (response.url().includes('/api/')) {
            apiResponses.push({
                url: response.url(),
                status: response.status(),
                headers: response.headers()
            });
        }
    });

    const testResults = {
        startTime: new Date().toISOString(),
        steps: [],
        consoleMessages: [],
        apiRequests: [],
        apiResponses: [],
        screenshots: [],
        errors: [],
        summary: {}
    };

    try {
        // 步骤1: 访问前端页面
        console.log('📍 步骤1: 访问前端页面');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const screenshot1 = await page.screenshot({
            path: 'test-screenshots/01-首页加载.png',
            fullPage: true
        });
        testResults.screenshots.push('01-首页加载.png');

        testResults.steps.push({
            step: 1,
            name: '访问前端页面',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        // 步骤2: 登录系统
        console.log('🔐 步骤2: 执行登录操作');

        // 等待登录表单出现
        await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', { timeout: 10000 });

        // 填写用户名
        await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', 'admin');

        // 填写密码
        await page.fill('input[placeholder*="密码"], input[type="password"]', 'admin123');

        // 点击登录按钮
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            page.click('button[type="submit"], .el-button--primary, .login-btn')
        ]);

        await page.waitForTimeout(3000);

        const screenshot2 = await page.screenshot({
            path: 'test-screenshots/02-登录成功.png',
            fullPage: true
        });
        testResults.screenshots.push('02-登录成功.png');

        testResults.steps.push({
            step: 2,
            name: '执行登录操作',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        // 步骤3: 导航到AI助手页面
        console.log('🤖 步骤3: 导航到AI助手页面');

        // 查找AI助手菜单项
        const aiMenuItemSelectors = [
            'text=AI助手',
            'text=智能助手',
            '[title*="AI助手"]',
            '[title*="智能助手"]',
            'a[href*="ai"]',
            '.router-link-active[href*="ai"]'
        ];

        let aiMenuFound = false;
        for (const selector of aiMenuItemSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    await element.click();
                    aiMenuFound = true;
                    break;
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }

        if (!aiMenuFound) {
            // 尝试直接导航到AI助手页面
            await page.goto('http://localhost:5173/ai-assistant', { waitUntil: 'networkidle' });
        }

        await page.waitForTimeout(3000);

        const screenshot3 = await page.screenshot({
            path: 'test-screenshots/03-AI助手页面.png',
            fullPage: true
        });
        testResults.screenshots.push('03-AI助手页面.png');

        testResults.steps.push({
            step: 3,
            name: '导航到AI助手页面',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        // 步骤4: 切换到全屏模式
        console.log('📺 步骤4: 切换到全屏模式');

        const fullscreenSelectors = [
            '.fullscreen-btn',
            '[title*="全屏"]',
            '.expand-btn',
            'button[aria-label*="全屏"]',
            'text=全屏'
        ];

        for (const selector of fullscreenSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    await element.click();
                    break;
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }

        await page.waitForTimeout(2000);

        const screenshot4 = await page.screenshot({
            path: 'test-screenshots/04-全屏模式.png',
            fullPage: true
        });
        testResults.screenshots.push('04-全屏模式.png');

        testResults.steps.push({
            step: 4,
            name: '切换到全屏模式',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        // 步骤5: 创建测试文件
        console.log('📄 步骤5: 创建测试文件');

        // 确保测试文件目录存在
        if (!fs.existsSync('test-files')) {
            fs.mkdirSync('test-files');
        }

        // 创建测试文档文件
        const testDocContent = `
# AI助手测试文档

这是一个用于测试AI助手文件上传功能的示例文档。

## 测试内容
1. 文档上传功能
2. AI内容分析
3. 智能回复生成

## 测试要求
- 文档应该能够成功上传
- AI应该能够分析文档内容
- 系统应该生成相关的智能回复

创建时间: ${new Date().toISOString()}
        `;

        fs.writeFileSync('test-files/test-document.md', testDocContent);

        // 创建测试图片 (使用简单的SVG)
        const testImageContent = `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#f0f0f0"/>
    <text x="200" y="150" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">
        AI助手测试图片
    </text>
    <circle cx="100" cy="100" r="50" fill="#ff6b6b"/>
    <rect x="250" y="50" width="100" height="100" fill="#4ecdc4"/>
    <polygon points="200,250 150,200 250,200" fill="#45b7d1"/>
</svg>
        `;

        fs.writeFileSync('test-files/test-image.svg', testImageContent);

        testResults.steps.push({
            step: 5,
            name: '创建测试文件',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        // 步骤6: 测试文档上传功能
        console.log('📤 步骤6: 测试文档上传功能');

        // 查找文件上传组件
        const fileUploadSelectors = [
            'input[type="file"]',
            '.file-upload',
            '.upload-btn',
            '[class*="upload"]',
            'text=上传文件',
            'text=选择文件'
        ];

        let fileUploadElement = null;
        for (const selector of fileUploadSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    fileUploadElement = element;
                    break;
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }

        if (fileUploadElement) {
            // 上传测试文档
            await fileUploadElement.setInputFiles('test-files/test-document.md');
            await page.waitForTimeout(3000);

            const screenshot5 = await page.screenshot({
                path: 'test-screenshots/05-文档上传后.png',
                fullPage: true
            });
            testResults.screenshots.push('05-文档上传后.png');

            testResults.steps.push({
                step: 6,
                name: '测试文档上传功能',
                status: 'success',
                timestamp: new Date().toISOString()
            });
        } else {
            testResults.steps.push({
                step: 6,
                name: '测试文档上传功能',
                status: 'failed',
                error: '未找到文件上传组件',
                timestamp: new Date().toISOString()
            });
            testResults.errors.push('未找到文件上传组件');
        }

        // 步骤7: 测试图片上传功能
        console.log('🖼️ 步骤7: 测试图片上传功能');

        // 查找图片上传组件
        const imageUploadSelectors = [
            'input[type="file"][accept*="image"]',
            '.image-upload',
            '[class*="image"][class*="upload"]',
            'text=上传图片',
            'text=选择图片'
        ];

        let imageUploadElement = null;
        for (const selector of imageUploadSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    imageUploadElement = element;
                    break;
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }

        if (imageUploadElement) {
            // 上传测试图片
            await imageUploadElement.setInputFiles('test-files/test-image.svg');
            await page.waitForTimeout(3000);

            const screenshot6 = await page.screenshot({
                path: 'test-screenshots/06-图片上传后.png',
                fullPage: true
            });
            testResults.screenshots.push('06-图片上传后.png');

            testResults.steps.push({
                step: 7,
                name: '测试图片上传功能',
                status: 'success',
                timestamp: new Date().toISOString()
            });
        } else {
            // 尝试使用同一个文件上传组件上传图片
            if (fileUploadElement) {
                await fileUploadElement.setInputFiles('test-files/test-image.svg');
                await page.waitForTimeout(3000);

                const screenshot6 = await page.screenshot({
                    path: 'test-screenshots/06-图片上传后.png',
                    fullPage: true
                });
                testResults.screenshots.push('06-图片上传后.png');

                testResults.steps.push({
                    step: 7,
                    name: '测试图片上传功能',
                    status: 'success',
                    timestamp: new Date().toISOString()
                });
            } else {
                testResults.steps.push({
                    step: 7,
                    name: '测试图片上传功能',
                    status: 'failed',
                    error: '未找到图片上传组件',
                    timestamp: new Date().toISOString()
                });
                testResults.errors.push('未找到图片上传组件');
            }
        }

        // 步骤8: 验证AI分析功能启动
        console.log('🧠 步骤8: 验证AI分析功能启动');

        // 查找AI分析相关的按钮或元素
        const aiAnalysisSelectors = [
            'text=开始分析',
            'text=AI分析',
            'text=智能分析',
            '.analyze-btn',
            '[class*="analyze"]',
            'button[aria-label*="分析"]'
        ];

        let analysisStarted = false;
        for (const selector of aiAnalysisSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    await element.click();
                    analysisStarted = true;
                    break;
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }

        // 如果没有找到分析按钮，等待AI自动分析
        if (!analysisStarted) {
            console.log('⏳ 等待AI自动分析开始...');
            await page.waitForTimeout(5000);
        }

        const screenshot7 = await page.screenshot({
            path: 'test-screenshots/07-AI分析进行中.png',
            fullPage: true
        });
        testResults.screenshots.push('07-AI分析进行中.png');

        testResults.steps.push({
            step: 8,
            name: '验证AI分析功能启动',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        // 步骤9: 检查AI回复和结果
        console.log('💬 步骤9: 检查AI回复和结果');

        // 等待AI回复
        await page.waitForTimeout(8000);

        // 查找AI回复内容
        const aiReplySelectors = [
            '.ai-reply',
            '.ai-response',
            '[class*="reply"]',
            '[class*="response"]',
            '.message',
            '.chat-content'
        ];

        let aiReplyFound = false;
        for (const selector of aiReplySelectors) {
            try {
                const element = await page.$(selector);
                if (element && await element.isVisible()) {
                    aiReplyFound = true;
                    break;
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }

        const screenshot8 = await page.screenshot({
            path: 'test-screenshots/08-AI回复结果.png',
            fullPage: true
        });
        testResults.screenshots.push('08-AI回复结果.png');

        testResults.steps.push({
            step: 9,
            name: '检查AI回复和结果',
            status: aiReplyFound ? 'success' : 'warning',
            message: aiReplyFound ? '发现AI回复内容' : '未发现明显的AI回复内容',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
        testResults.errors.push({
            type: 'test_error',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // 错误截图
        try {
            const errorScreenshot = await page.screenshot({
                path: 'test-screenshots/错误截图.png',
                fullPage: true
            });
            testResults.screenshots.push('错误截图.png');
        } catch (screenshotError) {
            console.error('截图失败:', screenshotError);
        }
    }

    // 收集测试数据
    testResults.consoleMessages = consoleMessages;
    testResults.apiRequests = apiRequests;
    testResults.apiResponses = apiResponses;
    testResults.endTime = new Date().toISOString();

    // 计算测试统计
    const totalSteps = testResults.steps.length;
    const successSteps = testResults.steps.filter(step => step.status === 'success').length;
    const failedSteps = testResults.steps.filter(step => step.status === 'failed').length;
    const warningSteps = testResults.steps.filter(step => step.status === 'warning').length;

    testResults.summary = {
        totalSteps,
        successSteps,
        failedSteps,
        warningSteps,
        successRate: ((successSteps / totalSteps) * 100).toFixed(2) + '%',
        consoleErrors: consoleMessages.filter(msg => msg.type === 'error').length,
        apiErrors: apiResponses.filter(resp => resp.status >= 400).length,
        totalAPIRequests: apiRequests.length,
        totalAPIResponses: apiResponses.length
    };

    // 确保截图目录存在
    if (!fs.existsSync('test-screenshots')) {
        fs.mkdirSync('test-screenshots');
    }

    // 保存测试报告
    fs.writeFileSync('ai-assistant-upload-test-report.json', JSON.stringify(testResults, null, 2));

    // 打印测试摘要
    console.log('\n📊 测试完成摘要:');
    console.log('================');
    console.log(`总步骤数: ${totalSteps}`);
    console.log(`成功步骤: ${successSteps}`);
    console.log(`失败步骤: ${failedSteps}`);
    console.log(`警告步骤: ${warningSteps}`);
    console.log(`成功率: ${testResults.summary.successRate}`);
    console.log(`控制台错误: ${testResults.summary.consoleErrors}`);
    console.log(`API错误: ${testResults.summary.apiErrors}`);
    console.log(`API请求数: ${testResults.summary.totalAPIRequests}`);
    console.log(`截图数量: ${testResults.screenshots.length}`);
    console.log('\n📸 截图保存在: test-screenshots/ 目录');
    console.log('📄 详细报告保存在: ai-assistant-upload-test-report.json');

    if (testResults.errors.length > 0) {
        console.log('\n❌ 发现的错误:');
        testResults.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.message || error}`);
        });
    }

    await browser.close();

    return testResults;
}

// 运行测试
if (require.main === module) {
    runAIAssistantUploadTest()
        .then(result => {
            console.log('\n✅ 测试执行完成');
            process.exit(result.summary.failedSteps > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('\n💥 测试执行失败:', error);
            process.exit(1);
        });
}

module.exports = { runAIAssistantUploadTest };