const puppeteer = require('puppeteer');
const fs = require('fs');

// 简化的AI测试脚本
async function simpleAITest() {
    console.log('🚀 开始简化AI助手测试');

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();

        // 监听控制台消息
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`❌ 页面错误: ${msg.text()}`);
            }
        });

        // 首先访问登录页面
        console.log('📍 访问登录页面');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
        await page.screenshot({ path: 'test-login-page.png' });

        // 检查是否有登录表单
        const loginForm = await page.$('form');
        if (loginForm) {
            console.log('✅ 发现登录表单');

            // 尝试快速登录
            try {
                await page.type('input[type="text"], input[type="email"], input[placeholder*="用户"], input[placeholder*="账号"]', 'admin');
                await page.type('input[type="password"]', 'admin123');

                // 点击登录按钮
                const loginButton = await page.$('button[type="submit"], .login-btn');
                if (loginButton) {
                    await loginButton.click();
                    console.log('🔐 尝试登录...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            } catch (error) {
                console.log(`⚠️ 登录过程: ${error.message}`);
            }
        }

        // 直接访问AI助手页面
        console.log('📍 访问AI助手页面');
        await page.goto('http://localhost:5173/centers/ai', { waitUntil: 'networkidle2' });
        await page.screenshot({ path: 'test-ai-page.png' });

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 查找AI相关的元素
        const pageContent = await page.content();
        console.log('📄 页面内容分析:');
        console.log(`- 页面标题: ${await page.title()}`);
        console.log(`- 当前URL: ${page.url()}`);
        console.log(`- 是否包含AI相关内容: ${pageContent.includes('AI') || pageContent.includes('ai') || pageContent.includes('助手')}`);

        // 查找输入框
        const textareas = await page.$$('textarea');
        const inputs = await page.$$('input[type="text"]');
        console.log(`📝 发现文本域: ${textareas.length}个`);
        console.log(`📝 发现文本输入框: ${inputs.length}个`);

        // 查找聊天相关元素
        const chatElements = await page.$$('[class*="chat"], [class*="message"], [class*="ai"], [id*="chat"], [id*="ai"]');
        console.log(`💬 发现聊天相关元素: ${chatElements.length}个`);

        // 尝试找到聊天输入框
        for (const textarea of textareas) {
            const placeholder = await page.evaluate(el => el.placeholder, textarea);
            console.log(`📝 文本域占位符: ${placeholder}`);

            if (placeholder && (placeholder.includes('输入') || placeholder.includes('消息') || placeholder.includes('提问'))) {
                console.log('✅ 找到聊天输入框');

                // 尝试输入测试消息
                await textarea.click();
                await page.keyboard.type('你好，这是一个测试消息');
                await page.screenshot({ path: 'test-chat-input.png' });
                console.log('✅ 已输入测试消息');

                // 查找发送按钮
                const sendButton = await page.$('button:contains("发送"), button:contains("提交"), .send-btn, [class*="send"]');
                if (sendButton) {
                    await sendButton.click();
                    console.log('📤 点击发送按钮');
                    await page.screenshot({ path: 'test-message-sent.png' });
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    console.log('❌ 未找到发送按钮');
                }

                break;
            }
        }

        // 查找文件上传相关元素
        const fileInputs = await page.$$('input[type="file"]');
        const uploadButtons = await page.$$('button:contains("上传"), [class*="upload"]');
        console.log(`📁 发现文件输入框: ${fileInputs.length}个`);
        console.log(`📁 发现上传按钮: ${uploadButtons.length}个`);

        // 最终截图
        await page.screenshot({ path: 'test-final-state.png', fullPage: true });
        console.log('📸 已保存最终状态截图');

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error.message);
    } finally {
        await browser.close();
        console.log('🎉 测试完成');
    }
}

// 运行测试
simpleAITest().catch(console.error);