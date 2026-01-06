const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 创建截图目录
const screenshotDir = path.join(__dirname, 'docs', '浏览器检查');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

// 生成时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

async function testAIAssistantEnhanced() {
    console.log('🚀 开始增强版AI助手功能测试...');

    let browser;
    let page;

    const testResults = {
        startTime: new Date(),
        steps: [],
        errors: [],
        screenshots: [],
        performance: {}
    };

    try {
        // 启动浏览器
        browser = await chromium.launch({
            headless: false,
            slowMo: 500
        });

        const context = await browser.newContext({
            viewport: { width: 1366, height: 768 }
        });

        page = await context.newPage();

        // 监听控制台和网络
        const consoleMessages = [];
        const networkRequests = [];

        page.on('console', msg => {
            const text = msg.text();
            const type = msg.type();
            consoleMessages.push({ type, text, timestamp: new Date() });

            if (type === 'error') {
                testResults.errors.push({
                    type: 'console_error',
                    message: text,
                    timestamp: new Date()
                });
            }
        });

        page.on('request', req => {
            networkRequests.push({
                url: req.url(),
                method: req.method(),
                timestamp: new Date()
            });
        });

        // 步骤1: 导航到主页
        console.log('\n📍 步骤1: 导航到幼儿园管理系统主页');
        const navStart = Date.now();

        await page.goto('http://localhost:5173', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        const navTime = Date.now() - navStart;
        testResults.performance.navigation = navTime;

        await page.screenshot({
            path: path.join(screenshotDir, `${timestamp}_01-主页加载.png`),
            fullPage: true
        });
        testResults.screenshots.push(`${timestamp}_01-主页加载.png`);

        testResults.steps.push({
            step: 1,
            action: '导航到主页',
            duration: navTime,
            status: 'completed'
        });

        console.log(`✅ 主页加载完成，耗时: ${navTime}ms`);

        // 步骤2: 登录系统
        console.log('\n🔐 步骤2: 执行登录');
        const loginStart = Date.now();

        // 等待登录表单
        await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', {
            timeout: 10000
        });

        // 填写登录信息
        await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', 'admin');
        await page.fill('input[type="password"]', '123456');

        console.log('✅ 登录信息填写完成');

        await page.screenshot({
            path: path.join(screenshotDir, `${timestamp}_02-登录表单填写.png`),
            fullPage: true
        });

        // 点击登录
        await page.click('button[type="submit"], button:has-text("登录"), .el-button--primary');

        // 等待登录完成
        await page.waitForTimeout(3000);

        const loginTime = Date.now() - loginStart;
        testResults.performance.login = loginTime;

        await page.screenshot({
            path: path.join(screenshotDir, `${timestamp}_03-登录完成.png`),
            fullPage: true
        });

        testResults.steps.push({
            step: 2,
            action: '执行登录',
            duration: loginTime,
            status: 'completed'
        });

        console.log(`✅ 登录完成，耗时: ${loginTime}ms`);

        // 步骤3: 尝试多种方式访问AI助手
        console.log('\n🤖 步骤3: 访问AI助手页面');
        const aiAccessStart = Date.now();

        let aiPageFound = false;

        // 方法1: 直接访问AI页面
        const aiPageUrls = [
            '/ai',
            '/ai-center',
            '/ai-chat',
            '/assistant',
            '/chat',
            '/centers/AICenter',
            '/AIQueryInterface'
        ];

        for (const url of aiPageUrls) {
            try {
                console.log(`🔍 尝试访问 ${url} 页面...`);
                await page.goto(`http://localhost:5173${url}`, {
                    waitUntil: 'networkidle',
                    timeout: 10000
                });

                await page.waitForTimeout(2000);

                // 检查页面是否包含AI相关内容
                const pageContent = await page.content();
                const hasAIContent = pageContent.includes('ai') ||
                                   pageContent.includes('AI') ||
                                   pageContent.includes('助手') ||
                                   pageContent.includes('智能');

                // 检查是否有AI相关元素
                const aiElements = await page.locator('[class*="ai"], .ai-assistant, .chat-interface, [id*="ai"]').count();

                if (hasAIContent || aiElements > 0) {
                    console.log(`✅ 在 ${url} 页面找到AI内容`);
                    aiPageFound = true;

                    await page.screenshot({
                        path: path.join(screenshotDir, `${timestamp}_04-AI页面-${url.replace('/', '-')}访问成功.png`),
                        fullPage: true
                    });
                    testResults.screenshots.push(`${timestamp}_04-AI页面-${url.replace('/', '-')}访问成功.png`);
                    break;
                }
            } catch (error) {
                console.log(`⚠️ 无法访问 ${url}: ${error.message}`);
            }
        }

        // 方法2: 如果直接访问失败，尝试在当前页面查找AI功能
        if (!aiPageFound) {
            console.log('🔍 在当前页面查找AI相关功能...');

            // 返回主页或dashboard
            try {
                await page.goto('http://localhost:5173', {
                    waitUntil: 'networkidle',
                    timeout: 10000
                });
                await page.waitForTimeout(2000);
            } catch (e) {
                // 忽略错误
            }

            // 查找所有可能的AI相关按钮或链接
            const aiSelectors = [
                'a:has-text("AI")',
                'button:has-text("AI")',
                'span:has-text("AI")',
                'div:has-text("AI")',
                '[href*="ai"]',
                '.el-menu-item:has-text("AI")',
                '*:has-text("AI助手")',
                '*:has-text("智能助手")'
            ];

            for (const selector of aiSelectors) {
                try {
                    const elements = await page.locator(selector).all();
                    for (const element of elements) {
                        if (await element.isVisible()) {
                            console.log(`✅ 找到AI相关元素: ${selector}`);
                            await element.click();
                            await page.waitForTimeout(3000);
                            aiPageFound = true;
                            break;
                        }
                    }
                    if (aiPageFound) break;
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (aiPageFound) {
                await page.screenshot({
                    path: path.join(screenshotDir, `${timestamp}_04-AI功能点击成功.png`),
                    fullPage: true
                });
                testResults.screenshots.push(`${timestamp}_04-AI功能点击成功.png`);
            }
        }

        const aiAccessTime = Date.now() - aiAccessStart;
        testResults.performance.aiAccess = aiAccessTime;

        testResults.steps.push({
            step: 3,
            action: '访问AI助手页面',
            duration: aiAccessTime,
            status: aiPageFound ? 'completed' : 'failed'
        });

        if (!aiPageFound) {
            console.log('❌ 未能找到AI助手功能');
            await page.screenshot({
                path: path.join(screenshotDir, `${timestamp}_04-AI功能未找到.png`),
                fullPage: true
            });
            throw new Error('未找到AI助手功能');
        }

        console.log(`✅ AI助手页面访问完成，耗时: ${aiAccessTime}ms`);

        // 步骤4: 测试简单聊天
        console.log('\n💬 步骤4: 测试简单聊天');
        const simpleChatStart = Date.now();

        try {
            // 查找输入框
            const inputSelectors = [
                'textarea[placeholder*="输入"]',
                'input[placeholder*="输入"]',
                '.el-textarea__inner',
                '.chat-input',
                '.ai-input',
                'textarea',
                'input[type="text"]'
            ];

            let chatInput = null;
            for (const selector of inputSelectors) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible({ timeout: 2000 })) {
                        chatInput = element;
                        console.log(`✅ 找到聊天输入框: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (chatInput) {
                await chatInput.click();
                await chatInput.fill('你好');
                console.log('✅ 输入简单消息: "你好"');

                await page.screenshot({
                    path: path.join(screenshotDir, `${timestamp}_05-简单聊天输入.png`),
                    fullPage: true
                });

                // 查找发送按钮
                const sendSelectors = [
                    'button:has-text("发送")',
                    'button:has-text("Send")',
                    '.send-btn',
                    '.el-button--primary',
                    'button[type="submit"]'
                ];

                let sendButton = null;
                for (const selector of sendSelectors) {
                    try {
                        const element = await page.locator(selector).first();
                        if (await element.isVisible({ timeout: 2000 })) {
                            sendButton = element;
                            console.log(`✅ 找到发送按钮: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        // 继续尝试下一个选择器
                    }
                }

                if (sendButton) {
                    await sendButton.click();
                    console.log('✅ 发送简单消息');

                    // 等待响应
                    await page.waitForTimeout(5000);

                    const simpleChatTime = Date.now() - simpleChatStart;
                    testResults.performance.simpleChat = simpleChatTime;

                    await page.screenshot({
                        path: path.join(screenshotDir, `${timestamp}_06-简单聊天响应.png`),
                        fullPage: true
                    });

                    testResults.steps.push({
                        step: 4,
                        action: '测试简单聊天',
                        duration: simpleChatTime,
                        status: 'completed'
                    });

                    console.log(`✅ 简单聊天测试完成，耗时: ${simpleChatTime}ms`);
                } else {
                    throw new Error('未找到发送按钮');
                }
            } else {
                throw new Error('未找到聊天输入框');
            }
        } catch (error) {
            console.error('❌ 简单聊天测试失败:', error.message);
            testResults.errors.push({
                type: 'simple_chat_error',
                message: error.message,
                timestamp: new Date()
            });
        }

        // 步骤5: 测试复杂查询
        console.log('\n🔍 步骤5: 测试复杂查询');
        const complexQueryStart = Date.now();

        try {
            // 再次查找输入框
            const chatInput = await page.locator('textarea, .el-textarea__inner, input[placeholder*="输入"]').first();
            if (await chatInput.isVisible()) {
                await chatInput.click();
                await chatInput.fill('查询所有学生信息');
                console.log('✅ 输入复杂查询: "查询所有学生信息"');

                await page.screenshot({
                    path: path.join(screenshotDir, `${timestamp}_07-复杂查询输入.png`),
                    fullPage: true
                });

                // 点击发送
                const sendButton = await page.locator('button:has-text("发送"), .send-btn, .el-button--primary').first();
                if (await sendButton.isVisible()) {
                    await sendButton.click();
                    console.log('✅ 发送复杂查询');

                    // 等待更长时间，因为复杂查询需要工具调用
                    await page.waitForTimeout(10000);

                    const complexQueryTime = Date.now() - complexQueryStart;
                    testResults.performance.complexQuery = complexQueryTime;

                    await page.screenshot({
                        path: path.join(screenshotDir, `${timestamp}_08-复杂查询响应.png`),
                        fullPage: true
                    });

                    testResults.steps.push({
                        step: 5,
                        action: '测试复杂查询',
                        duration: complexQueryTime,
                        status: 'completed'
                    });

                    console.log(`✅ 复杂查询测试完成，耗时: ${complexQueryTime}ms`);
                } else {
                    throw new Error('未找到发送按钮');
                }
            } else {
                throw new Error('未找到聊天输入框');
            }
        } catch (error) {
            console.error('❌ 复杂查询测试失败:', error.message);
            testResults.errors.push({
                type: 'complex_query_error',
                message: error.message,
                timestamp: new Date()
            });
        }

        // 最终截图
        await page.screenshot({
            path: path.join(screenshotDir, `${timestamp}_09-最终状态.png`),
            fullPage: true
        });

        console.log('\n📊 测试总结:');
        console.log('='.repeat(50));
        console.log(`总测试时间: ${Date.now() - testResults.startTime.getTime()}ms`);
        console.log(`完成步骤数: ${testResults.steps.length}`);
        console.log(`错误数量: ${testResults.errors.length}`);
        console.log(`截图数量: ${testResults.screenshots.length}`);
        console.log(`网络请求数: ${networkRequests.length}`);

        // 性能统计
        console.log('\n⏱️ 性能统计:');
        Object.entries(testResults.performance).forEach(([key, value]) => {
            console.log(`${key}: ${value}ms`);
        });

        // 错误汇总
        if (testResults.errors.length > 0) {
            console.log('\n❌ 错误汇总:');
            testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. [${error.type}] ${error.message}`);
            });
        }

        // 网络请求统计
        console.log('\n🌐 网络请求统计:');
        const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
        console.log(`总请求数: ${networkRequests.length}`);
        console.log(`API请求数: ${apiRequests.length}`);

        apiRequests.slice(0, 10).forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url}`);
        });

        // 保存测试结果
        testResults.endTime = new Date();
        testResults.totalDuration = testResults.endTime.getTime() - testResults.startTime.getTime();
        testResults.consoleMessages = consoleMessages;
        testResults.networkRequests = networkRequests;

        const resultsPath = path.join(__dirname, 'ai-assistant-test-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

        console.log(`\n📁 测试结果已保存到: ${resultsPath}`);
        console.log(`📸 截图已保存到: ${screenshotDir}`);

    } catch (error) {
        console.error('❌ 测试执行失败:', error);
        testResults.errors.push({
            type: 'test_execution_error',
            message: error.message,
            timestamp: new Date()
        });

        if (page) {
            await page.screenshot({
                path: path.join(screenshotDir, `${timestamp}_错误-测试失败.png`),
                fullPage: true
            });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
testAIAssistantEnhanced().catch(console.error);