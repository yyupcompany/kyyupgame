const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAIAssistantUpload() {
    console.log('🚀 开始AI助手文件上传功能测试...');

    const browser = await chromium.launch({
        headless: false, // 显示浏览器窗口
        slowMo: 1000 // 慢速操作以便观察
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
        if (msg.type() === 'error') {
            console.log('❌ 控制台错误:', msg.text());
        }
    });

    // 监听文件选择对话框
    let fileDialogOpened = false;
    page.on('filechooser', () => {
        fileDialogOpened = true;
        console.log('✅ 文件选择对话框已打开');
    });

    try {
        // 1. 导航到登录页面
        console.log('📍 步骤1: 导航到登录页面');
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');

        // 确保目录存在
        const reportDir = 'docs/浏览器检查';
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        // 截图保存登录页面
        await page.screenshot({
            path: 'docs/浏览器检查/01-登录页面.png',
            fullPage: true
        });

        // 2. 使用快捷登录按钮
        console.log('📍 步骤2: 使用管理员快捷登录');

        // 等待快捷登录按钮出现
        await page.waitForSelector('.quick-btn.admin-btn', { timeout: 15000 });
        await page.click('.quick-btn.admin-btn');
        console.log('✅ 点击管理员快捷登录按钮');

        // 等待登录完成
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // 额外等待确保登录成功

        // 截图保存登录后页面
        await page.screenshot({
            path: 'docs/浏览器检查/02-登录后页面.png',
            fullPage: true
        });

        // 3. 查找AI助手页面
        console.log('📍 步骤3: 查找AI助手页面');

        // 尝试多种可能的AI助手导航选择器
        const aiAssistantSelectors = [
            'a:has-text("AI小助手")',
            'a:has-text("AI助手")',
            'span:has-text("AI小助手")',
            'div:has-text("AI小助手")',
            '.el-menu-item:has-text("AI")',
            '[role="menuitem"]:has-text("AI")'
        ];

        let aiAssistantFound = false;
        for (const selector of aiAssistantSelectors) {
            try {
                const element = await page.$(selector);
                if (element && await element.isVisible()) {
                    await element.click();
                    aiAssistantFound = true;
                    console.log(`✅ 找到并点击AI助手: ${selector}`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        // 如果没找到导航，尝试直接访问URL
        if (!aiAssistantFound) {
            console.log('⚠️ 未找到AI助手导航，尝试直接访问URL');
            const possibleUrls = [
                '/ai-assistant',
                '/ai',
                '/chat',
                '/assistant'
            ];

            for (const url of possibleUrls) {
                try {
                    await page.goto(`http://localhost:5173${url}`);
                    await page.waitForLoadState('networkidle');

                    // 检查是否成功进入AI助手页面
                    const hasAIContent = await page.evaluate(() => {
                        const content = document.body.textContent || '';
                        return content.includes('AI') || content.includes('助手') || content.includes('聊天');
                    });

                    if (hasAIContent) {
                        aiAssistantFound = true;
                        console.log(`✅ 成功访问AI助手页面: ${url}`);
                        break;
                    }
                } catch (e) {
                    console.log(`❌ 访问 ${url} 失败:`, e.message);
                }
            }
        }

        if (!aiAssistantFound) {
            throw new Error('无法找到或访问AI助手页面');
        }

        // 等待AI助手页面加载
        await page.waitForTimeout(3000);

        // 截图保存AI助手页面
        await page.screenshot({
            path: 'docs/浏览器检查/03-AI助手页面.png',
            fullPage: true
        });

        // 4. 详细检查页面中的上传相关元素
        console.log('📍 步骤4: 检查上传功能');

        // 获取页面上所有的按钮和输入元素 - 修复版本
        const pageContent = await page.evaluate(() => {
            // 安全的辅助函数
            const safeToString = (value) => {
                if (value === null || value === undefined) return '';
                return String(value);
            };

            const safeGetClassName = (element) => {
                try {
                    return safeToString(element.className);
                } catch (e) {
                    return '';
                }
            };

            const safeGetTextContent = (element) => {
                try {
                    return safeToString(element.textContent);
                } catch (e) {
                    return '';
                }
            };

            // 获取所有按钮元素
            const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"]'))
                .map(btn => ({
                    text: safeGetTextContent(btn).trim(),
                    title: safeToString(btn.title),
                    className: safeGetClassName(btn),
                    visible: btn.offsetParent !== null,
                    innerHTML: safeToString(btn.innerHTML).substring(0, 200)
                }));

            // 获取所有文件输入元素
            const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'))
                .map(input => ({
                    accept: safeToString(input.accept),
                    multiple: input.multiple,
                    visible: input.offsetParent !== null,
                    className: safeGetClassName(input)
                }));

            // 获取包含上传相关文本的元素
            const uploadElements = Array.from(document.querySelectorAll('*'))
                .filter(el => {
                    const text = safeGetTextContent(el).toLowerCase();
                    const className = safeGetClassName(el).toLowerCase();
                    const title = safeToString(el.title).toLowerCase();
                    return text.includes('上传') ||
                           text.includes('文件') ||
                           text.includes('图片') ||
                           text.includes('文档') ||
                           className.includes('upload') ||
                           title.includes('上传');
                })
                .map(el => ({
                    tagName: safeToString(el.tagName),
                    text: safeGetTextContent(el).trim().substring(0, 100),
                    className: safeGetClassName(el),
                    visible: el.offsetParent !== null,
                    title: safeToString(el.title)
                }));

            // 获取所有图标元素（可能代表上传按钮）
            const iconElements = Array.from(document.querySelectorAll('.icon, [class*="icon"], svg'))
                .map(icon => ({
                    className: safeGetClassName(icon),
                    visible: icon.offsetParent !== null,
                    innerHTML: safeToString(icon.outerHTML).substring(0, 200)
                }));

            return {
                buttons,
                fileInputs,
                uploadElements,
                iconElements,
                pageText: safeGetTextContent(document.body).substring(0, 1000),
                pageTitle: safeToString(document.title)
            };
        });

        console.log('📊 页面分析结果:');
        console.log(`- 按钮数量: ${pageContent.buttons.length}`);
        console.log(`- 文件输入数量: ${pageContent.fileInputs.length}`);
        console.log(`- 上传相关元素数量: ${pageContent.uploadElements.length}`);
        console.log(`- 图标元素数量: ${pageContent.iconElements.length}`);

        // 详细检查上传相关元素
        const uploadButtons = pageContent.buttons.filter(btn =>
            btn.text?.includes('上传') ||
            btn.title?.includes('上传') ||
            btn.className?.includes('upload')
        );

        console.log('\n🔍 检查到的上传按钮:');
        uploadButtons.forEach((btn, index) => {
            console.log(`${index + 1}. 文本: "${btn.text}" | 标题: "${btn.title}" | 可见: ${btn.visible}`);
        });

        // 显示上传相关元素
        console.log('\n🔍 检查到的上传相关元素:');
        pageContent.uploadElements.slice(0, 10).forEach((el, index) => {
            console.log(`${index + 1}. 标签: ${el.tagName} | 文本: "${el.text}" | 类名: "${el.className}" | 可见: ${el.visible}`);
        });

        // 5. 尝试点击上传相关按钮
        console.log('\n📍 步骤5: 测试上传按钮功能');

        let uploadButtonClicked = false;
        let successfulClicks = [];

        // 尝试点击所有可能的上传按钮
        for (const btn of uploadButtons) {
            if (!btn.visible) continue;

            try {
                // 尝试找到并点击这个按钮
                let buttonSelector;
                if (btn.text) {
                    buttonSelector = `button:has-text("${btn.text}")`;
                } else if (btn.title) {
                    buttonSelector = `[title="${btn.title}"]`;
                } else {
                    // 通过类名查找
                    const firstClass = btn.className.split(' ')[0];
                    if (firstClass) {
                        buttonSelector = `.${firstClass}`;
                    }
                }

                if (buttonSelector) {
                    await page.click(buttonSelector, { timeout: 2000 });
                    uploadButtonClicked = true;
                    successfulClicks.push(btn.text || btn.title || buttonSelector);
                    console.log(`✅ 成功点击上传按钮: ${btn.text || btn.title || buttonSelector}`);

                    // 等待可能的文件选择对话框
                    await page.waitForTimeout(2000);
                }
            } catch (e) {
                console.log(`❌ 点击按钮失败: ${btn.text || btn.title} - ${e.message}`);
            }
        }

        // 如果没有找到上传按钮，尝试检查文件输入元素
        if (uploadButtons.length === 0 && pageContent.fileInputs.length > 0) {
            console.log('📁 尝试触发文件输入元素');
            for (const input of pageContent.fileInputs) {
                try {
                    const fileInput = await page.$('input[type="file"]');
                    if (fileInput) {
                        await fileInput.click();
                        uploadButtonClicked = true;
                        console.log('✅ 成功点击文件输入元素');
                        await page.waitForTimeout(2000);
                        break;
                    }
                } catch (e) {
                    console.log(`❌ 点击文件输入失败: ${e.message}`);
                }
            }
        }

        // 6. 最终截图
        console.log('\n📍 步骤6: 最终截图和报告');
        await page.screenshot({
            path: 'docs/浏览器检查/04-上传功能测试结果.png',
            fullPage: true
        });

        // 生成测试报告
        const testReport = {
            timestamp: new Date().toISOString(),
            testResults: {
                login: '✅ 登录成功',
                aiAssistantPage: aiAssistantFound ? '✅ 找到AI助手页面' : '❌ 未找到AI助手页面',
                uploadButtonsFound: uploadButtons.length > 0 ? `✅ 找到 ${uploadButtons.length} 个上传按钮` : '❌ 未找到上传按钮',
                fileInputsFound: pageContent.fileInputs.length > 0 ? `✅ 找到 ${pageContent.fileInputs.length} 个文件输入` : '❌ 未找到文件输入',
                uploadElementsFound: pageContent.uploadElements.length > 0 ? `✅ 找到 ${pageContent.uploadElements.length} 个上传相关元素` : '❌ 未找到上传相关元素',
                uploadButtonTest: uploadButtonClicked ? `✅ 成功点击 ${successfulClicks.length} 个上传按钮` : '❌ 未点击任何上传按钮',
                successfulClicks: successfulClicks,
                fileDialogTest: fileDialogOpened ? '✅ 文件选择对话框正常' : '⚠️ 未触发文件选择对话框',
                consoleErrors: consoleMessages.filter(msg => msg.type === 'error').length
            },
            pageAnalysis: {
                pageTitle: pageContent.pageTitle,
                totalButtons: pageContent.buttons.length,
                uploadButtons: uploadButtons.length,
                fileInputs: pageContent.fileInputs.length,
                uploadElements: pageContent.uploadElements.length,
                iconElements: pageContent.iconElements.length
            },
            uploadButtons: uploadButtons,
            fileInputs: pageContent.fileInputs,
            uploadElements: pageContent.uploadElements.slice(0, 20), // 限制长度
            consoleErrors: consoleMessages.filter(msg => msg.type === 'error'),
            summary: {
                success: aiAssistantFound && (uploadButtons.length > 0 || pageContent.fileInputs.length > 0),
                issues: []
            }
        };

        // 添加问题到总结
        if (!aiAssistantFound) {
            testReport.summary.issues.push('AI助手页面未找到');
        }
        if (uploadButtons.length === 0 && pageContent.fileInputs.length === 0 && pageContent.uploadElements.length === 0) {
            testReport.summary.issues.push('未找到任何上传相关元素');
        }
        if (uploadButtonClicked && !fileDialogOpened) {
            testReport.summary.issues.push('点击上传按钮但未触发文件选择对话框');
        }
        if (consoleMessages.filter(msg => msg.type === 'error').length > 0) {
            testReport.summary.issues.push(`发现 ${consoleMessages.filter(msg => msg.type === 'error').length} 个控制台错误`);
        }

        // 保存测试报告
        const reportPath = 'docs/浏览器检查/AI助手上传功能测试报告.json';
        fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2), 'utf8');

        console.log('\n📋 测试报告:');
        console.log('===========');
        Object.entries(testReport.testResults).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });

        console.log(`\n📄 详细报告已保存到: ${reportPath}`);
        console.log(`📸 截图已保存到: docs/浏览器检查/目录`);

        return testReport;

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);

        // 错误时也截图
        try {
            await page.screenshot({
                path: 'docs/浏览器检查/错误状态截图.png',
                fullPage: true
            });
        } catch (e) {
            // 忽略截图错误
        }

        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

    } finally {
        await browser.close();
        console.log('🏁 测试完成，浏览器已关闭');
    }
}

// 运行测试
testAIAssistantUpload().then(result => {
    console.log('\n🎯 最终测试结果:', result.success ? '✅ 成功' : '❌ 失败');
    if (result.error) {
        console.log('错误信息:', result.error);
    }
}).catch(error => {
    console.error('💥 测试执行失败:', error);
});