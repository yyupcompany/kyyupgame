import { chromium } from 'playwright';

async function testAIAssistant() {
    console.log('🚀 开始AI助手功能测试...');

    // 启动浏览器
    const browser = await chromium.launch({
        headless: false,  // 显示浏览器界面
        slowMo: 1000     // 慢速执行，便于观察
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
        await page.waitForTimeout(2000);

        // 截图记录
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        await page.screenshot({ path: `docs/浏览器检查/${timestamp}_01-主页加载.png` });
        console.log('✅ 主页加载完成');

        // 步骤2: 登录系统
        console.log('📍 步骤2: 登录系统...');

        // 查找登录表单
        await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', { timeout: 10000 });

        // 尝试找到用户名输入框
        const usernameInput = await page.locator('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]').first();
        await usernameInput.fill('admin');

        // 尝试找到密码输入框
        const passwordInput = await page.locator('input[type="password"]').first();
        await passwordInput.fill('123456');

        // 点击登录按钮
        const loginButton = await page.locator('button[type="submit"], button:has-text("登录"), .el-button--primary').first();
        await loginButton.click();

        // 等待登录完成
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `docs/浏览器检查/${timestamp}_02-登录完成.png` });
        console.log('✅ 登录完成');

        // 步骤3: 查找AI助手图标
        console.log('📍 步骤3: 查找AI助手图标...');

        // 等待页面完全加载
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // 查找AI助手相关的图标或按钮
        const aiSelectors = [
            'button[title*="AI"], button[aria-label*="AI"]',
            '.ai-assistant, .ai-chat, .ai-icon',
            '[data-testid*="ai"], [data-role*="ai"]',
            'button:has-text("AI"), button:has-text("助手")',
            '.el-icon-chat-dot-round, .el-icon-headset',
            'svg[class*="ai"], i[class*="ai"]'
        ];

        let aiButton = null;
        for (const selector of aiSelectors) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible({ timeout: 2000 })) {
                    aiButton = element;
                    console.log(`找到AI助手按钮: ${selector}`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!aiButton) {
            // 如果没找到，尝试在头部导航中查找
            const headerButtons = await page.locator('header button, .navbar button, .nav button').all();
            for (const button of headerButtons) {
                const text = await button.textContent();
                const title = await button.getAttribute('title');
                const ariaLabel = await button.getAttribute('aria-label');

                if (text?.includes('AI') || title?.includes('AI') || ariaLabel?.includes('AI') ||
                    text?.includes('助手') || title?.includes('助手') || ariaLabel?.includes('助手')) {
                    aiButton = button;
                    console.log('在头部导航找到AI助手按钮');
                    break;
                }
            }
        }

        if (!aiButton) {
            console.log('⚠️ 未找到AI助手按钮，尝试直接访问AI页面...');
            await page.screenshot({ path: `docs/浏览器检查/${timestamp}_03-未找到AI按钮.png` });

            try {
                // 尝试直接导航到AI助手页面
                console.log('🔍 尝试访问 /ai 页面...');
                await page.goto('http://localhost:5173/ai', {
                    waitUntil: 'networkidle',
                    timeout: 15000
                });

                await page.waitForTimeout(2000);
                await page.screenshot({ path: `docs/浏览器检查/${timestamp}_04-AI页面访问.png` });
                console.log('✅ AI页面访问成功');

            } catch (error) {
                console.log('❌ 无法访问AI页面，尝试其他方式...');

                // 检查页面内容
                const pageContent = await page.content();
                console.log('页面内容长度:', pageContent.length);

                // 尝试查找可能的AI助手容器
                const aiContainers = await page.locator('.ai-assistant, .ai-sidebar, .chat-sidebar, [class*="ai"]').all();
                console.log('找到AI相关容器数量:', aiContainers.length);

                if (aiContainers.length > 0) {
                    console.log('✅ 找到AI助手容器，可能已经展开');
                } else {
                    // 尝试通过URL导航到其他可能的AI页面
                    const aiPageUrls = [
                        '/ai-center',
                        '/ai-chat',
                        '/assistant',
                        '/chat'
                    ];

                    for (const url of aiPageUrls) {
                        try {
                            console.log(`🔍 尝试访问 ${url} 页面...`);
                            await page.goto(`http://localhost:5173${url}`, {
                                waitUntil: 'networkidle',
                                timeout: 10000
                            });
                            await page.waitForTimeout(1000);

                            // 检查是否有AI相关内容
                            const hasAIContent = await page.locator('[class*="ai"], .ai-assistant, .chat-interface').count() > 0;
                            if (hasAIContent) {
                                console.log(`✅ 在 ${url} 页面找到AI内容`);
                                await page.screenshot({ path: `docs/浏览器检查/2025-11-14_11-41-00_05-AI内容-${url.replace('/', '')}.png` });
                                break;
                            }
                        } catch (e) {
                            console.log(`⚠️ 无法访问 ${url} 页面`);
                        }
                    }

                    // 最后检查：查找所有可能的AI相关元素
                    const allAIElements = await page.locator('*').filter({ hasText: /AI|助手|智能/ }).all();
                    console.log('包含AI文本的元素数量:', allAIElements.length);

                    if (allAIElements.length === 0) {
                        throw new Error('未找到任何AI助手入口');
                    }
                }
            }
        } else {
            // 步骤4: 点击AI助手图标
            console.log('📍 步骤4: 点击AI助手图标...');
            await aiButton.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_04-点击AI按钮.png' });
            console.log('✅ AI助手按钮点击完成');
        }

        // 步骤5: 确认右侧侧边栏是否正确弹出
        console.log('📍 步骤5: 确认右侧侧边栏是否正确弹出...');

        // 查找侧边栏
        const sidebarSelectors = [
            '.ai-sidebar, .chat-sidebar, .assistant-sidebar',
            '.right-sidebar, .side-panel:has(.ai, .chat)',
            '.el-drawer__body:has(.ai), .el-drawer:has(.chat)',
            '[class*="sidebar"][class*="right"], [class*="drawer"][class*="right"]'
        ];

        let sidebar = null;
        for (const selector of sidebarSelectors) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible({ timeout: 2000 })) {
                    sidebar = element;
                    console.log(`找到侧边栏: ${selector}`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (sidebar) {
            await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_05-侧边栏展开.png' });
            console.log('✅ 右侧侧边栏正常弹出');
        } else {
            console.log('⚠️ 未找到明显的侧边栏，检查页面变化...');
            await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_05-侧边栏检查.png' });
        }

        // 步骤6: 在侧边栏中输入测试提示词
        console.log('📍 步骤6: 在侧边栏中输入测试提示词...');

        // 查找输入框
        const inputSelectors = [
            'textarea[placeholder*="输入"], textarea[placeholder*="消息"]',
            'input[placeholder*="输入"], input[placeholder*="消息"]',
            '.el-textarea__inner, .el-input__inner',
            'textarea.ai-input, input.ai-input',
            '.chat-input textarea, .message-input input'
        ];

        let inputBox = null;
        for (const selector of inputSelectors) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible({ timeout: 2000 })) {
                    inputBox = element;
                    console.log(`找到输入框: ${selector}`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (inputBox) {
            const testMessage = '你好，请简单介绍一下系统的主要功能';
            await inputBox.fill(testMessage);
            await page.waitForTimeout(1000);

            await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_06-输入测试消息.png' });
            console.log('✅ 测试消息输入完成');

            // 查找发送按钮
            const sendSelectors = [
                'button[title*="发送"], button[aria-label*="发送"]',
                '.send-button, .submit-button',
                'button:has-text("发送"), button:has-text("提交")',
                '.el-button--primary:has-text("发送")'
            ];

            let sendButton = null;
            for (const selector of sendSelectors) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible({ timeout: 2000 })) {
                        sendButton = element;
                        console.log(`找到发送按钮: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (sendButton) {
                console.log('📍 步骤7: 发送测试消息...');
                await sendButton.click();
                await page.waitForTimeout(3000);

                await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_07-发送消息后.png' });
                console.log('✅ 测试消息发送完成');
            } else {
                console.log('⚠️ 未找到发送按钮，尝试按回车键');
                await inputBox.press('Enter');
                await page.waitForTimeout(3000);
                await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_07-回车发送后.png' });
            }
        } else {
            console.log('⚠️ 未找到输入框，无法发送测试消息');
        }

        // 步骤8: 观察响应和等待一段时间
        console.log('📍 步骤8: 观察AI响应...');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_08-观察响应.png' });

        console.log('✅ AI助手功能测试完成！');

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
        await page.screenshot({ path: 'docs/浏览器检查/2025-01-14_10-30-00_错误-测试失败.png' });
    } finally {
        // 保持浏览器打开一段时间供观察
        console.log('📍 保持浏览器打开30秒供观察...');
        await page.waitForTimeout(30000);

        await browser.close();
        console.log('🔚 测试结束，浏览器已关闭');
    }
}

// 运行测试
testAIAssistant().catch(console.error);