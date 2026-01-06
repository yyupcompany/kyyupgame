const puppeteer = require('puppeteer');
const path = require('path');

async function testAIUpload() {
    let browser;
    try {
        console.log('🚀 启动浏览器测试AI助手上传功能...');

        // 启动浏览器
        browser = await puppeteer.launch({
            headless: false,  // 显示浏览器界面
            defaultViewport: { width: 1400, height: 1000 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 监听控制台消息
        page.on('console', msg => {
            console.log('浏览器控制台:', msg.type(), msg.text());
        });

        // 监听页面错误
        page.on('pageerror', error => {
            console.error('页面错误:', error.message);
        });

        // 访问AI助手页面
        console.log('📍 访问AI助手页面...');
        await page.goto('http://localhost:5173/ai/query', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 检查是否需要登录
        const needLogin = await page.$('el-button[type="submit"]');
        if (needLogin) {
            console.log('🔐 需要登录，使用快捷登录...');

            // 查找快捷登录按钮
            const quickLoginButtons = await page.$$('el-button');
            let adminButton = null;

            for (let button of quickLoginButtons) {
                const text = await page.evaluate(el => el.textContent, button);
                if (text && text.includes('admin')) {
                    adminButton = button;
                    break;
                }
            }

            if (adminButton) {
                await adminButton.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log('✅ Admin登录成功');
            } else {
                throw new Error('未找到admin快捷登录按钮');
            }

            // 重新访问AI助手页面
            await page.goto('http://localhost:5173/ai/query', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // 截图保存当前页面状态
        await page.screenshot({ path: 'ai-query-page.png', fullPage: true });
        console.log('📸 已保存页面截图: ai-query-page.png');

        // 查找侧边栏和上传功能
        console.log('🔍 查找AI助手侧边栏功能...');

        // 查找可能的上传按钮或区域
        const uploadSelectors = [
            'input[type="file"]',
            '.upload-btn',
            '.file-upload',
            '[class*="upload"]',
            '[class*="file"]',
            'el-upload',
            '.el-upload',
            'el-button:has([class*="upload"])',
            '[aria-label*="上传"]',
            '[title*="上传"]'
        ];

        let uploadElements = [];
        for (let selector of uploadSelectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    uploadElements.push({ selector, count: elements.length });
                    console.log(`✅ 找到上传元素: ${selector} (${elements.length}个)`);
                }
            } catch (error) {
                // 忽略选择器错误
            }
        }

        // 查找侧边栏
        const sidebarSelectors = [
            '.sidebar',
            '.side-panel',
            '.ai-sidebar',
            '[class*="sidebar"]',
            '[class*="side"]',
            'el-aside',
            '.el-aside'
        ];

        let sidebarFound = false;
        for (let selector of sidebarSelectors) {
            try {
                const sidebar = await page.$(selector);
                if (sidebar) {
                    sidebarFound = true;
                    console.log(`✅ 找到侧边栏: ${selector}`);

                    // 获取侧边栏内容
                    const sidebarContent = await page.evaluate((sel) => {
                        const element = document.querySelector(sel);
                        return element ? element.innerText : '';
                    }, selector);

                    console.log('📝 侧边栏内容:', sidebarContent.substring(0, 200));
                    break;
                }
            } catch (error) {
                // 忽略选择器错误
            }
        }

        if (!sidebarFound) {
            console.log('⚠️ 未找到明显的侧边栏元素');
        }

        // 检查页面中是否有文件上传相关的文本
        const pageText = await page.evaluate(() => document.body.innerText);
        const uploadKeywords = ['上传', 'upload', '文件', '图片', '文档', 'file', 'image', 'document'];

        console.log('🔍 搜索上传相关功能...');
        for (let keyword of uploadKeywords) {
            if (pageText.includes(keyword)) {
                console.log(`✅ 页面包含关键词: ${keyword}`);
            }
        }

        // 尝试查找隐藏的文件输入框
        const hiddenFileInputs = await page.$$eval('input[type="file"]', inputs =>
            inputs.map(input => ({
                id: input.id,
                className: input.className,
                style: input.style.cssText,
                accept: input.accept,
                multiple: input.multiple
            }))
        );

        if (hiddenFileInputs.length > 0) {
            console.log('✅ 找到文件输入框:', hiddenFileInputs);
        } else {
            console.log('❌ 未找到文件输入框');
        }

        // 查找AI助手的主要交互元素
        const aiElements = await page.$$eval('*', elements =>
            elements
                .filter(el => el.textContent && (
                    el.textContent.includes('发送') ||
                    el.textContent.includes('提交') ||
                    el.textContent.includes('分析') ||
                    (el.className && el.className.includes && el.className.includes('send')) ||
                    (el.className && el.className.includes && el.className.includes('submit'))
                ))
                .map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    textContent: el.textContent ? el.textContent.substring(0, 50) : ''
                }))
                .slice(0, 10)
        );

        console.log('🤖 AI交互元素:', aiElements);

        // 保存页面HTML以供分析
        const pageHTML = await page.content();
        require('fs').writeFileSync('ai-query-page.html', pageHTML);
        console.log('💾 已保存页面HTML: ai-query-page.html');

        console.log('✅ AI助手页面测试完成');
        return {
            success: true,
            uploadElements,
            sidebarFound,
            hiddenFileInputs,
            aiElements
        };

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
testAIUpload().then(result => {
    console.log('\n📊 测试结果总结:');
    console.log('==================');
    if (result.success) {
        console.log('✅ 测试成功完成');
        console.log('📁 找到的上传元素:', result.uploadElements.length);
        console.log('🎛️ 侧边栏状态:', result.sidebarFound ? '找到' : '未找到');
        console.log('📤 文件输入框:', result.hiddenFileInputs.length);
        console.log('🤖 AI交互元素:', result.aiElements.length);
    } else {
        console.log('❌ 测试失败:', result.error);
    }
}).catch(console.error);