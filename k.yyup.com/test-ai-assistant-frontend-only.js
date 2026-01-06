import { chromium } from 'playwright';

async function testAIAssistantFrontendOnly() {
    console.log('🚀 开始AI助手前端UI测试（无需后端）...');

    // 启动浏览器
    const browser = await chromium.launch({
        headless: false,  // 显示浏览器界面
        slowMo: 500       // 慢速执行，便于观察
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        // 步骤1: 访问幼儿园管理系统主页
        console.log('📍 步骤1: 访问幼儿园管理系统主页...');
        await page.goto('http://localhost:5173');

        // 等待页面加载
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // 截图记录
        await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-45-00_01-主页加载.png' });
        console.log('✅ 主页加载完成');

        // 步骤2: 检查页面结构，寻找AI助手相关组件
        console.log('📍 步骤2: 检查页面结构和AI助手组件...');

        // 查找所有可能的AI助手相关元素
        const aiSelectors = [
            '[data-testid*="ai"]',
            '[class*="ai-"]',
            '[id*="ai-"]',
            'button[title*="AI"]',
            'button[aria-label*="AI"]',
            '.el-button:has-text("AI")',
            '.el-button:has-text("助手")'
        ];

        let aiElements = [];
        for (const selector of aiSelectors) {
            try {
                const elements = await page.locator(selector).all();
                if (elements.length > 0) {
                    aiElements = aiElements.concat(elements);
                    console.log(`找到AI相关元素: ${selector} (${elements.length}个)`);
                }
            } catch (e) {
                // 忽略错误，继续尝试下一个选择器
            }
        }

        // 截图记录页面结构
        await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-45-00_02-页面结构分析.png' });

        if (aiElements.length > 0) {
            console.log(`✅ 找到 ${aiElements.length} 个AI相关元素`);

            // 检查AI助手组件是否已经在DOM中
            const aiAssistantComponent = await page.locator('.ai-assistant, [class*="AIAssistant"]').first();
            if (await aiAssistantComponent.isVisible()) {
                console.log('✅ AI助手组件已在页面中');
                await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-45-00_03-AI组件可见.png' });
            } else {
                console.log('⚠️ AI助手组件在DOM中但不可见');
            }

            // 尝试点击第一个AI相关元素
            console.log('📍 步骤3: 尝试点击AI相关元素...');
            await aiElements[0].click();
            await page.waitForTimeout(2000);

            // 检查是否有侧边栏弹出
            const sidebarSelectors = [
                '.ai-sidebar, .chat-sidebar, .assistant-sidebar',
                '.right-sidebar, .side-panel',
                '.el-drawer:has(.ai, .chat)',
                '[class*="sidebar"][class*="right"]'
            ];

            let sidebarFound = false;
            for (const selector of sidebarSelectors) {
                try {
                    const sidebar = await page.locator(selector).first();
                    if (await sidebar.isVisible({ timeout: 1000 })) {
                        console.log(`✅ 找到侧边栏: ${selector}`);
                        await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-45-00_04-侧边栏弹出.png' });
                        sidebarFound = true;
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (!sidebarFound) {
                console.log('⚠️ 未找到明显的侧边栏，但可能有其他交互');
                await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-45-00_04-点击后状态.png' });
            }

        } else {
            console.log('⚠️ 未找到明显的AI相关元素');

            // 尝试检查开发者工具中的组件
            const pageContent = await page.content();
            const hasAIAssistant = pageContent.includes('AIAssistant') ||
                                  pageContent.includes('ai-assistant') ||
                                  pageContent.includes('AI助手');

            if (hasAIAssistant) {
                console.log('✅ 在页面源码中找到AI助手相关代码');
            } else {
                console.log('⚠️ 页面源码中也没有明显的AI助手相关代码');
            }
        }

        // 步骤4: 检查网络请求（即使后端不工作，也能看到前端的请求尝试）
        console.log('📍 步骤4: 监控网络请求...');

        // 设置请求监听
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('/api/ai') ||
                request.url().includes('/api/ai-query') ||
                request.url().includes('ai')) {
                requests.push({
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers()
                });
                console.log(`📡 AI相关请求: ${request.method()} ${request.url()}`);
            }
        });

        // 等待一段时间收集请求
        await page.waitForTimeout(5000);

        if (requests.length > 0) {
            console.log(`✅ 捕获到 ${requests.length} 个AI相关请求`);
            requests.forEach(req => {
                console.log(`   - ${req.method} ${req.url}`);
            });
        } else {
            console.log('⚠️ 未捕获到AI相关请求');
        }

        // 步骤5: 尝试在控制台中查找AI助手组件
        console.log('📍 步骤5: 检查控制台信息...');

        const consoleLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('AI') || text.includes('ai') || text.includes('assistant')) {
                consoleLogs.push({
                    type: msg.type(),
                    text: text
                });
                console.log(`🖥️ 控制台 (${msg.type()}): ${text}`);
            }
        });

        // 等待一段时间收集控制台信息
        await page.waitForTimeout(3000);

        if (consoleLogs.length > 0) {
            console.log(`✅ 捕获到 ${consoleLogs.length} 条AI相关控制台信息`);
        } else {
            console.log('⚠️ 未捕获到AI相关控制台信息');
        }

        console.log('✅ 前端UI测试完成！');

        // 生成测试报告
        const report = {
            timestamp: new Date().toISOString(),
            pageUrl: page.url(),
            aiElementsFound: aiElements.length,
            aiRequests: requests.length,
            consoleLogs: consoleLogs.length,
            status: 'completed'
        };

        await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-45-00_05-最终状态.png' });

        console.log('📊 测试报告:', JSON.stringify(report, null, 2));

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
        await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-45-00_错误-测试失败.png' });
    } finally {
        // 保持浏览器打开一段时间供观察
        console.log('📍 保持浏览器打开20秒供观察...');
        await page.waitForTimeout(20000);

        await browser.close();
        console.log('🔚 测试结束，浏览器已关闭');
    }
}

// 运行测试
testAIAssistantFrontendOnly().catch(console.error);