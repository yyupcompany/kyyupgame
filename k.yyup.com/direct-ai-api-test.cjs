const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runDirectAIAPITest() {
    console.log('🚀 开始直接AI API测试');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 监听网络请求
    const apiCalls = [];
    page.on('response', response => {
        if (response.url().includes('/api/ai') || response.url().includes('/api/ai-query')) {
            apiCalls.push({
                url: response.url(),
                status: response.status(),
                method: response.request().method()
            });
            console.log(`🤖 AI API调用: ${response.request().method()} ${response.url()} - ${response.status()}`);
        }
    });

    // 监听控制台消息
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ 控制台错误: ${msg.text()}`);
        }
    });

    try {
        // 创建测试文件
        console.log('📄 创建测试文件...');
        if (!fs.existsSync('test-files')) {
            fs.mkdirSync('test-files');
        }

        const testDoc = `# AI助手测试文档

这是用于测试AI助手文件上传和分析功能的示例文档。

## 测试内容
1. 文件上传功能测试
2. AI内容分析功能测试
3. 智能回复生成测试

## 期望结果
- 文件应该能够成功上传
- AI应该能够分析文档内容
- 系统应该生成相关的智能回复

测试时间: ${new Date().toISOString()}

## 文档内容分析
这是一个中文文档，包含了测试相关的信息。AI助手应该能够理解文档的主要内容并提供相关的分析和建议。
        `;

        fs.writeFileSync('test-files/ai-test-document.md', testDoc);

        // 创建测试图片
        const testImageSVG = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" fill="#f8f9fa"/>
            <text x="200" y="50" font-family="Arial, font-size="20" text-anchor="middle" fill="#333">
                AI助手测试图片
            </text>
            <circle cx="100" cy="100" r="40" fill="#ff6b6b"/>
            <rect x="250" y="80" width="80" height="80" fill="#4ecdc4"/>
            <polygon points="200,250 150,180 250,180" fill="#45b7d1"/>
            <text x="200" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">
                这是一个包含几何图形的测试图片
            </text>
        </svg>`;

        fs.writeFileSync('test-files/ai-test-image.svg', testImageSVG);

        console.log('✅ 测试文件创建完成');

        // 步骤1: 直接访问AI助手API页面
        console.log('🤖 步骤1: 访问AI助手API页面');

        // 尝试不同的AI助手页面路径
        const aiPaths = [
            'http://localhost:5173/ai-assistant',
            'http://localhost:5173/ai',
            'http://localhost:5173/smart-assistant',
            'http://localhost:5173/chat'
        ];

        let aiPageLoaded = false;
        let workingUrl = '';

        for (const url of aiPaths) {
            try {
                console.log(`尝试访问: ${url}`);
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
                await page.waitForTimeout(2000);

                // 检查页面是否包含AI相关内容
                const pageContent = await page.content();
                if (pageContent.includes('AI') || pageContent.includes('助手') || pageContent.includes('chat')) {
                    aiPageLoaded = true;
                    workingUrl = url;
                    console.log(`✅ 成功加载AI页面: ${url}`);
                    break;
                }
            } catch (error) {
                console.log(`❌ 访问 ${url} 失败: ${error.message}`);
            }
        }

        if (!aiPageLoaded) {
            console.log('⚠️ 无法找到可用的AI助手页面，尝试创建自定义测试页面');
            await createCustomTestPage(page);
        } else {
            // 截图AI页面
            await page.screenshot({ path: 'test-screenshots/direct-01-AI页面.png', fullPage: true });

            // 步骤2: 查找文件上传功能
            console.log('📤 步骤2: 查找文件上传功能');

            // 查找文件上传元素
            const fileInputs = await page.$$('input[type="file"]');
            console.log(`找到 ${fileInputs.length} 个文件输入元素`);

            if (fileInputs.length > 0) {
                console.log('✅ 找到文件上传功能，开始上传测试...');

                // 上传文档文件
                try {
                    await fileInputs[0].setInputFiles('test-files/ai-test-document.md');
                    console.log('✅ 文档文件上传成功');
                    await page.waitForTimeout(3000);
                } catch (error) {
                    console.log('❌ 文档上传失败:', error.message);
                }

                // 上传图片文件
                try {
                    await fileInputs[0].setInputFiles('test-files/ai-test-image.svg');
                    console.log('✅ 图片文件上传成功');
                    await page.waitForTimeout(3000);
                } catch (error) {
                    console.log('❌ 图片上传失败:', error.message);
                }

                await page.screenshot({ path: 'test-screenshots/direct-02-文件上传后.png', fullPage: true });
            }

            // 步骤3: 查找AI分析或发送按钮
            console.log('🧠 步骤3: 查找AI分析功能');

            // 查找可能的AI交互按钮
            const buttonSelectors = [
                'button',
                '.btn',
                '.el-button',
                '[class*="button"]',
                '[role="button"]'
            ];

            for (const selector of buttonSelectors) {
                try {
                    const buttons = await page.$$(selector);
                    for (const button of buttons) {
                        if (await button.isVisible()) {
                            const text = await button.textContent();
                            if (text && (text.includes('发送') || text.includes('分析') || text.includes('开始') || text.includes('提交'))) {
                                console.log(`✅ 找到AI交互按钮: ${text.trim()}`);
                                await button.click();
                                await page.waitForTimeout(5000);
                                break;
                            }
                        }
                    }
                } catch (error) {
                    // 继续尝试
                }
            }

            await page.screenshot({ path: 'test-screenshots/direct-03-AI交互后.png', fullPage: true });
        }

        // 步骤4: 直接测试AI API
        console.log('🔬 步骤4: 直接测试AI API');

        // 直接调用AI助手API
        await page.evaluate(async () => {
            try {
                const response = await fetch('http://localhost:3000/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: '你好，这是一个测试消息。请告诉我你的功能。',
                        conversationId: 'test-conversation-' + Date.now()
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ AI API调用成功:', data);
                    window.aiTestResult = { success: true, data };
                } else {
                    console.log('❌ AI API调用失败:', response.status, response.statusText);
                    window.aiTestResult = { success: false, status: response.status };
                }
            } catch (error) {
                console.log('❌ AI API调用错误:', error.message);
                window.aiTestResult = { success: false, error: error.message };
            }
        });

        await page.waitForTimeout(5000);

        // 获取API测试结果
        const apiResult = await page.evaluate(() => window.aiTestResult);
        console.log('AI API测试结果:', apiResult);

        // 步骤5: 测试文件上传API
        console.log('📁 步骤5: 测试文件上传API');

        // 读取测试文件
        const testFileContent = fs.readFileSync('test-files/ai-test-document.md');
        const testFileBase64 = Buffer.from(testFileContent).toString('base64');

        await page.evaluate(async (fileData) => {
            try {
                const response = await fetch('http://localhost:3000/api/ai/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        file: fileData,
                        filename: 'ai-test-document.md',
                        conversationId: 'test-upload-' + Date.now()
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ 文件上传API调用成功:', data);
                    window.uploadTestResult = { success: true, data };
                } else {
                    console.log('❌ 文件上传API调用失败:', response.status, response.statusText);
                    window.uploadTestResult = { success: false, status: response.status };
                }
            } catch (error) {
                console.log('❌ 文件上传API调用错误:', error.message);
                window.uploadTestResult = { success: false, error: error.message };
            }
        }, testFileBase64);

        await page.waitForTimeout(5000);

        // 获取上传测试结果
        const uploadResult = await page.evaluate(() => window.uploadTestResult);
        console.log('文件上传API测试结果:', uploadResult);

        await page.screenshot({ path: 'test-screenshots/direct-04-API测试完成.png', fullPage: true });

        // 生成测试报告
        const testReport = {
            startTime: new Date().toISOString(),
            aiPageLoaded,
            workingUrl,
            fileInputsFound: fileInputs.length,
            apiCalls,
            aiApiResult: apiResult,
            uploadApiResult: uploadResult,
            consoleErrors: [],
            summary: {
                totalTests: 2,
                successTests: (apiResult?.success ? 1 : 0) + (uploadResult?.success ? 1 : 0),
                failedTests: (apiResult?.success ? 0 : 1) + (uploadResult?.success ? 0 : 1)
            }
        };

        fs.writeFileSync('direct-ai-api-test-report.json', JSON.stringify(testReport, null, 2));

        console.log('\n📊 直接AI API测试完成摘要:');
        console.log('==========================');
        console.log(`AI页面加载: ${aiPageLoaded ? '✅ 成功' : '❌ 失败'}`);
        console.log(`工作URL: ${workingUrl || '未找到'}`);
        console.log(`文件输入框: ${fileInputs.length} 个`);
        console.log(`AI API调用: ${apiResult?.success ? '✅ 成功' : '❌ 失败'}`);
        console.log(`文件上传API: ${uploadResult?.success ? '✅ 成功' : '❌ 失败'}`);
        console.log(`API调用总数: ${apiCalls.length}`);

    } catch (error) {
        console.error('❌ 直接API测试过程中发生错误:', error);
    }

    await browser.close();
}

// 创建自定义测试页面
async function createCustomTestPage(page) {
    console.log('🛠️ 创建自定义AI测试页面');

    const customHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI助手功能测试</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .upload-area { border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 10px 0; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .result { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .error { background: #f8d7da; color: #721c24; }
        .success { background: #d4edda; color: #155724; }
    </style>
</head>
<body>
    <h1>🤖 AI助手功能测试页面</h1>

    <div class="test-section">
        <h2>📤 文件上传测试</h2>
        <div class="upload-area">
            <input type="file" id="fileInput" accept=".txt,.md,.doc,.docx,.jpg,.jpeg,.png,.svg" />
            <p>选择文件进行上传测试</p>
        </div>
        <button onclick="testUpload()">测试文件上传</button>
        <div id="uploadResult" class="result"></div>
    </div>

    <div class="test-section">
        <h2>🧠 AI对话测试</h2>
        <textarea id="messageInput" rows="4" cols="50" placeholder="输入测试消息...">你好，请分析一下上传的文件内容。</textarea>
        <br>
        <button onclick="testAIChat()">发送AI消息</button>
        <div id="chatResult" class="result"></div>
    </div>

    <div class="test-section">
        <h2>🔬 API健康检查</h2>
        <button onclick="checkAPIHealth()">检查API状态</button>
        <div id="healthResult" class="result"></div>
    </div>

    <script>
        async function testUpload() {
            const fileInput = document.getElementById('fileInput');
            const resultDiv = document.getElementById('uploadResult');

            if (!fileInput.files[0]) {
                resultDiv.innerHTML = '<div class="error">请选择一个文件</div>';
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async function(e) {
                const fileData = e.target.result.split(',')[1]; // Base64

                try {
                    const response = await fetch('http://localhost:3000/api/ai/upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            file: fileData,
                            filename: file.name,
                            conversationId: 'test-' + Date.now()
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        resultDiv.innerHTML = '<div class="success">✅ 文件上传成功: ' + JSON.stringify(data, null, 2) + '</div>';
                    } else {
                        resultDiv.innerHTML = '<div class="error">❌ 文件上传失败: ' + response.status + ' ' + response.statusText + '</div>';
                    }
                } catch (error) {
                    resultDiv.innerHTML = '<div class="error">❌ 上传错误: ' + error.message + '</div>';
                }
            };

            reader.readAsDataURL(file);
        }

        async function testAIChat() {
            const messageInput = document.getElementById('messageInput');
            const resultDiv = document.getElementById('chatResult');
            const message = messageInput.value.trim();

            if (!message) {
                resultDiv.innerHTML = '<div class="error">请输入消息</div>';
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        conversationId: 'test-chat-' + Date.now()
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    resultDiv.innerHTML = '<div class="success">✅ AI回复: ' + JSON.stringify(data, null, 2) + '</div>';
                } else {
                    resultDiv.innerHTML = '<div class="error">❌ AI对话失败: ' + response.status + ' ' + response.statusText + '</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">❌ 对话错误: ' + error.message + '</div>';
            }
        }

        async function checkAPIHealth() {
            const resultDiv = document.getElementById('healthResult');

            try {
                const response = await fetch('http://localhost:3000/api/health');
                const data = await response.json();

                if (response.ok) {
                    resultDiv.innerHTML = '<div class="success">✅ API健康: ' + JSON.stringify(data, null, 2) + '</div>';
                } else {
                    resultDiv.innerHTML = '<div class="error">❌ API不健康: ' + response.status + '</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">❌ 健康检查失败: ' + error.message + '</div>';
            }
        }

        // 页面加载时自动检查API健康状态
        window.onload = function() {
            checkAPIHealth();
        };
    </script>
</body>
</html>`;

    // 设置自定义HTML内容
    await page.setContent(customHTML);
    await page.waitForTimeout(2000);

    console.log('✅ 自定义测试页面创建完成');
}

// 运行测试
if (require.main === module) {
    runDirectAIAPITest()
        .then(() => {
            console.log('\n✅ 直接AI API测试完成');
        })
        .catch(error => {
            console.error('\n💥 测试执行失败:', error);
            process.exit(1);
        });
}

module.exports = { runDirectAIAPITest };