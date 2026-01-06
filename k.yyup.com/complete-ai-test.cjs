const puppeteer = require('puppeteer');
const fs = require('fs');

async function completeAITest() {
    let browser;
    try {
        console.log('🚀 完整AI助手页面测试开始...');

        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1400, height: 1000 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 监听所有网络请求
        page.on('request', request => {
            if (request.url().includes('/auth/login')) {
                console.log('🔐 发现登录请求:', request.url());
            }
        });

        page.on('response', response => {
            if (response.url().includes('/auth/login')) {
                console.log('✅ 登录响应状态:', response.status());
            }
        });

        // 监听控制台消息
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('快捷登录') || text.includes('admin') || text.includes('登录成功')) {
                console.log('🔐 浏览器控制台:', text);
            }
            if (text.includes('error') || text.includes('Error')) {
                console.log('⚠️ 浏览器错误:', text);
            }
        });

        console.log('📍 第一步：访问登录页面...');
        await page.goto('http://localhost:5173/login', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 5000));

        // 查找快捷登录区域
        console.log('🔍 第二步：查找快捷登录功能...');

        // 首先检查是否有快捷登录卡片或区域
        const quickLoginSelectors = [
            '.quick-login',
            '[class*="quick"]',
            '[class*="快捷"]',
            '.demo-login',
            '[class*="demo"]',
            '.test-login'
        ];

        let quickLoginArea = null;
        for (let selector of quickLoginSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    console.log('✅ 找到快捷登录区域:', selector);
                    quickLoginArea = element;
                    break;
                }
            } catch (e) {
                // 忽略错误
            }
        }

        if (!quickLoginArea) {
            // 查找包含"admin"、"test"、"demo"等文本的按钮
            console.log('🔍 搜索所有可能的登录按钮...');
            const allButtons = await page.$$('button, [role="button"], .btn, [class*="button"]');

            for (let button of allButtons) {
                try {
                    const buttonInfo = await page.evaluate(el => {
                        const text = el.textContent || el.innerText || '';
                        const className = el.className || '';
                        const id = el.id || '';
                        const ariaLabel = el.getAttribute('aria-label') || '';
                        const title = el.getAttribute('title') || '';

                        return {
                            text: text.trim(),
                            className,
                            id,
                            ariaLabel,
                            title,
                            visible: el.offsetParent !== null
                        };
                    }, button);

                    if (buttonInfo.visible &&
                        (buttonInfo.text.toLowerCase().includes('admin') ||
                         buttonInfo.text.toLowerCase().includes('test') ||
                         buttonInfo.text.toLowerCase().includes('demo') ||
                         buttonInfo.text.includes('管理员') ||
                         buttonInfo.text.includes('演示') ||
                         buttonInfo.className.includes('quick') ||
                         buttonInfo.className.includes('demo'))) {

                        console.log('✅ 找到登录按钮:', buttonInfo.text);
                        console.log('   - 类名:', buttonInfo.className);
                        console.log('   - ID:', buttonInfo.id);

                        // 点击这个按钮
                        await button.click();
                        console.log('🖱️ 已点击登录按钮');
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        break;
                    }
                } catch (e) {
                    // 忽略错误
                }
            }
        }

        // 如果还是没有找到，尝试查找并填写登录表单
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
            console.log('📝 第三步：尝试表单登录...');

            // 查找用户名和密码输入框
            const usernameInput = await page.$('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"], input[placeholder*="邮箱"]');
            const passwordInput = await page.$('input[type="password"], input[name="password"], input[placeholder*="密码"]');

            if (usernameInput && passwordInput) {
                console.log('✅ 找到登录表单，正在填写...');
                await usernameInput.type('admin');
                await passwordInput.type('admin123');

                // 查找提交按钮
                const submitButton = await page.$('button[type="submit"], [class*="submit"], [class*="login"]');
                if (submitButton) {
                    await submitButton.click();
                    console.log('🔐 提交登录表单');
                }
            } else {
                console.log('⚠️ 未找到完整的登录表单');
            }
        }

        // 等待登录完成
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 检查是否成功登录
        const newUrl = page.url();
        console.log('📍 当前页面URL:', newUrl);

        if (newUrl.includes('/login')) {
            console.log('❌ 登录失败，仍在登录页面');

            // 再次尝试查找admin快捷登录，可能需要等待页面完全加载
            console.log('🔄 再次尝试快捷登录...');
            await page.waitForSelector('body', { timeout: 10000 });

            // 执行JavaScript查找并点击admin按钮
            const clicked = await page.evaluate(() => {
                // 查找所有可能包含admin文本的元素
                const allElements = document.querySelectorAll('*');
                for (let element of allElements) {
                    if (element.textContent &&
                        (element.textContent.includes('admin') ||
                         element.textContent.includes('管理员') ||
                         element.textContent.includes('演示'))) {
                        // 检查是否可点击
                        const style = window.getComputedStyle(element);
                        if (style.cursor === 'pointer' ||
                            element.tagName === 'BUTTON' ||
                            element.tagName === 'A' ||
                            element.onclick) {
                            element.click();
                            return true;
                        }
                    }
                }
                return false;
            });

            if (clicked) {
                console.log('✅ JavaScript执行了admin点击');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // 现在尝试访问AI助手页面
        console.log('🤖 第四步：访问AI助手页面...');

        const aiUrls = ['/ai/query', '/ai', '/ai/chat', '/assistant'];
        let aiPageLoaded = false;

        for (const url of aiUrls) {
            try {
                console.log(`📍 尝试访问: http://localhost:5173${url}`);
                await page.goto(`http://localhost:5173${url}`, {
                    waitUntil: 'networkidle2',
                    timeout: 15000
                });

                await new Promise(resolve => setTimeout(resolve, 3000));

                const finalUrl = page.url();
                if (!finalUrl.includes('/login')) {
                    console.log('✅ 成功访问AI页面:', finalUrl);
                    aiPageLoaded = true;
                    break;
                } else {
                    console.log('❌ 被重定向到登录页面');
                }
            } catch (error) {
                console.log(`⚠️ 访问${url}失败:`, error.message);
            }
        }

        if (!aiPageLoaded) {
            throw new Error('无法成功访问AI助手页面，可能需要正确的登录凭证');
        }

        // 分析AI助手页面
        console.log('🔍 第五步：分析AI助手页面...');

        // 截图
        const screenshotPath = 'ai-assistant-page.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('📸 AI助手页面截图已保存:', screenshotPath);

        // 保存HTML
        const aiHtmlContent = await page.content();
        fs.writeFileSync('ai-assistant-page.html', aiHtmlContent);
        console.log('💾 AI助手页面HTML已保存: ai-assistant-page.html');

        // 分析页面结构
        const pageAnalysis = await page.evaluate(() => {
            const analysis = {
                title: document.title,
                url: window.location.href,
                bodyText: document.body.innerText.substring(0, 1000),
                elements: {
                    inputs: document.querySelectorAll('input, textarea').length,
                    buttons: document.querySelectorAll('button, [role="button"]').length,
                    fileInputs: document.querySelectorAll('input[type="file"]').length,
                    uploads: document.querySelectorAll('[class*="upload"], [class*="文件"], [class*="图片"]').length,
                    sidebars: document.querySelectorAll('.sidebar, .side-panel, [class*="sidebar"], [class*="side"], el-aside').length
                },
                keywords: []
            };

            // 检查关键词
            const keywords = ['上传', '文件', '图片', '文档', '发送', '输入', 'AI', '助手', '侧边栏', '工具', '功能'];
            keywords.forEach(keyword => {
                if (analysis.bodyText.includes(keyword) || document.documentElement.innerHTML.includes(keyword)) {
                    analysis.keywords.push(keyword);
                }
            });

            return analysis;
        });

        console.log('📊 页面分析结果:');
        console.log('  - 标题:', pageAnalysis.title);
        console.log('  - URL:', pageAnalysis.url);
        console.log('  - 输入框:', pageAnalysis.elements.inputs);
        console.log('  - 按钮:', pageAnalysis.elements.buttons);
        console.log('  - 文件上传框:', pageAnalysis.elements.fileInputs);
        console.log('  - 上传相关元素:', pageAnalysis.elements.uploads);
        console.log('  - 侧边栏:', pageAnalysis.elements.sidebars);
        console.log('  - 关键词:', pageAnalysis.keywords.join(', '));

        // 如果找到文件上传框，尝试上传文件
        if (pageAnalysis.elements.fileInputs > 0) {
            console.log('📤 第六步：测试文件上传功能...');

            const testFilePath = '/home/zhgue/kyyupgame/k.yyup.com/test-files/test-document.txt';
            if (fs.existsSync(testFilePath)) {
                const fileInput = await page.$('input[type="file"]');
                if (fileInput) {
                    await fileInput.uploadFile(testFilePath);
                    console.log('✅ 已上传测试文档:', testFilePath);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        console.log('✅ 完整测试成功完成');
        return {
            success: true,
            analysis: pageAnalysis,
            aiPageLoaded: true
        };

    } catch (error) {
        console.error('❌ 测试过程中出错:', error.message);
        return {
            success: false,
            error: error.message,
            aiPageLoaded: false
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
completeAITest().then(result => {
    console.log('\n🎯 最终测试结果:');
    console.log('==================');

    if (result.success && result.aiPageLoaded) {
        console.log('✅ AI助手页面访问成功');
        console.log('📊 页面分析:');
        console.log(`  - 输入框: ${result.analysis.elements.inputs}`);
        console.log(`  - 按钮: ${result.analysis.elements.buttons}`);
        console.log(`  - 文件上传框: ${result.analysis.elements.fileInputs}`);
        console.log(`  - 上传相关元素: ${result.analysis.elements.uploads}`);
        console.log(`  - 侧边栏: ${result.analysis.elements.sidebars}`);
        console.log(`  - 发现关键词: ${result.analysis.keywords.join(', ')}`);

        if (result.analysis.elements.fileInputs > 0) {
            console.log('🎉 发现文件上传功能！');
        } else {
            console.log('⚠️ 未发现明显的文件上传功能');
        }

        if (result.analysis.elements.sidebars > 0) {
            console.log('🎛️ 发现侧边栏功能！');
        } else {
            console.log('⚠️ 未发现明显的侧边栏');
        }

    } else {
        console.log('❌ 测试失败:', result.error);
        console.log('💡 建议:');
        console.log('  1. 检查服务器是否正常运行');
        console.log('  2. 确认登录功能是否正常');
        console.log('  3. 检查AI助手页面路径是否正确');
        console.log('  4. 验证用户权限配置');
    }
}).catch(console.error);