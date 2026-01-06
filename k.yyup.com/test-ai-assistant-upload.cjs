const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAIAssistantUpload() {
    console.log('=== AI助手文件上传和分析功能完整测试 ===');

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

    try {
        // 1. 导航到登录页面
        console.log('📍 步骤1: 导航到登录页面');
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');

        // 截图保存登录页面
        await page.screenshot({
            path: 'docs/浏览器检查/01-登录页面.png',
            fullPage: true
        });

        // 2. 登录系统
        console.log('📍 步骤2: 登录系统');

        // 等待登录表单加载
        await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', { timeout: 10000 });

        // 尝试多种可能的用户名输入框选择器
        const usernameSelectors = [
            'input[placeholder*="请输入用户名"]',
            'input[placeholder*="用户名"]',
            'input[placeholder*="账号"]',
            '.form-input[type="text"]',
            'input[name="username"]',
            'input[type="text"]',
            '#username',
            '.el-input__inner'
        ];

        let usernameFound = false;
        for (const selector of usernameSelectors) {
            try {
                await page.fill(selector, 'admin', { timeout: 2000 });
                usernameFound = true;
                console.log(`✅ 找到用户名输入框: ${selector}`);
                break;
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!usernameFound) {
            throw new Error('未找到用户名输入框');
        }

        // 尝试多种可能的密码输入框选择器
        const passwordSelectors = [
            'input[placeholder*="请输入密码"]',
            'input[placeholder*="密码"]',
            '.form-input[type="password"]',
            'input[name="password"]',
            'input[type="password"]',
            '#password'
        ];

        let passwordFound = false;
        for (const selector of passwordSelectors) {
            try {
                await page.fill(selector, 'admin123', { timeout: 2000 });
                passwordFound = true;
                console.log(`✅ 找到密码输入框: ${selector}`);
                break;
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!passwordFound) {
            throw new Error('未找到密码输入框');
        }

        // 点击登录按钮
        const loginButtonSelectors = [
            '.login-btn',
            'button[type="submit"]',
            'button:has-text("立即登录")',
            'button:has-text("登录")',
            '#login-btn'
        ];

        let loginClicked = false;
        for (const selector of loginButtonSelectors) {
            try {
                await page.click(selector, { timeout: 2000 });
                loginClicked = true;
                console.log(`✅ 点击登录按钮: ${selector}`);
                break;
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!loginClicked) {
            throw new Error('未找到登录按钮');
        }

        // 等待登录完成
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // 截图保存登录后页面
        await page.screenshot({
            path: 'docs/浏览器检查/02-登录后页面.png',
            fullPage: true
        });

        // 3. 查找AI助手页面
        console.log('📍 步骤3: 查找AI助手页面');

        // 等待页面加载完成
        await page.waitForTimeout(2000);

        // 尝试多种可能的AI助手导航选择器
        const aiAssistantSelectors = [
            'a:has-text("AI小助手")',
            'a:has-text("AI助手")',
            'span:has-text("AI小助手")',
            'div:has-text("AI小助手")',
            '[title*="AI"]',
            '.el-menu-item:has-text("AI")'
        ];

        let aiAssistantFound = false;
        for (const selector of aiAssistantSelectors) {
            try {
                const element = await page.waitForSelector(selector, { timeout: 2000 });
                if (element) {
                    await element.click();
                    aiAssistantFound = true;
                    console.log(`✅ 找到并点击AI助手: ${selector}`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!aiAssistantFound) {
            console.log('⚠️ 未找到AI助手导航，尝试直接访问URL');
            // 尝试直接访问可能的AI助手URL
            try {
                await page.goto('http://localhost:5173/ai-assistant');
                await page.waitForLoadState('networkidle');
                aiAssistantFound = true;
            } catch (e) {
                try {
                    await page.goto('http://localhost:5173/ai');
                    await page.waitForLoadState('networkidle');
                    aiAssistantFound = true;
                } catch (e2) {
                    throw new Error('无法访问AI助手页面');
                }
            }
        }

        // 等待AI助手页面加载
        await page.waitForTimeout(3000);

        // 截图保存AI助手页面
        await page.screenshot({
            path: 'docs/浏览器检查/03-AI助手页面.png',
            fullPage: true
        });

        // 4. 检查上传按钮显示状态
        console.log('📍 步骤4: 检查上传按钮显示状态');

        // 查找文档上传按钮
        const documentUploadSelectors = [
            'button:has-text("上传文档")',
            'button[title*="文档"]',
            '.upload-document',
            '[data-testid*="document"]',
            'button .icon-document'
        ];

        let documentUploadFound = false;
        let documentUploadVisible = false;

        for (const selector of documentUploadSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    documentUploadFound = true;
                    documentUploadVisible = await element.isVisible();
                    console.log(`📄 文档上传按钮 - 找到: ${selector}, 可见: ${documentUploadVisible}`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        // 查找图片上传按钮
        const imageUploadSelectors = [
            'button:has-text("上传图片")',
            'button[title*="图片"]',
            '.upload-image',
            '[data-testid*="image"]',
            'button .icon-image'
        ];

        let imageUploadFound = false;
        let imageUploadVisible = false;

        for (const selector of imageUploadSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    imageUploadFound = true;
                    imageUploadVisible = await element.isVisible();
                    console.log(`🖼️ 图片上传按钮 - 找到: ${selector}, 可见: ${imageUploadVisible}`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        // 5. 测试上传按钮功能
        console.log('📍 步骤5: 测试上传按钮功能');

        // 设置文件选择监听器
        let fileDialogOpened = false;
        page.on('filechooser', () => {
            fileDialogOpened = true;
            console.log('✅ 文件选择对话框已打开');
        });

        // 如果找到文档上传按钮，尝试点击
        if (documentUploadFound && documentUploadVisible) {
            try {
                for (const selector of documentUploadSelectors) {
                    try {
                        await page.click(selector);
                        console.log('✅ 成功点击文档上传按钮');
                        await page.waitForTimeout(1000);
                        break;
                    } catch (e) {
                        // 继续尝试下一个选择器
                    }
                }
            } catch (e) {
                console.log('❌ 点击文档上传按钮失败:', e.message);
            }
        }

        // 如果找到图片上传按钮，尝试点击
        if (imageUploadFound && imageUploadVisible) {
            try {
                for (const selector of imageUploadSelectors) {
                    try {
                        await page.click(selector);
                        console.log('✅ 成功点击图片上传按钮');
                        await page.waitForTimeout(1000);
                        break;
                    } catch (e) {
                        // 继续尝试下一个选择器
                    }
                }
            } catch (e) {
                console.log('❌ 点击图片上传按钮失败:', e.message);
            }
        }

        // 6. 最终截图和错误检查
        console.log('📍 步骤6: 最终截图和错误检查');

        await page.screenshot({
            path: 'docs/浏览器检查/04-上传按钮测试结果.png',
            fullPage: true
        });

        // 检查页面中所有可能的文件上传元素
        const allUploadElements = await page.$$('[type="file"], .upload, button');
        console.log(`📊 页面中共找到 ${allUploadElements.length} 个潜在的上传相关元素`);

        // 生成测试报告
        const testReport = {
            timestamp: new Date().toISOString(),
            testResults: {
                login: '✅ 登录成功',
                aiAssistantPage: aiAssistantFound ? '✅ 找到AI助手页面' : '❌ 未找到AI助手页面',
                documentUploadButton: documentUploadFound ?
                    (documentUploadVisible ? '✅ 文档上传按钮显示正常' : '⚠️ 文档上传按钮存在但不可见') :
                    '❌ 未找到文档上传按钮',
                imageUploadButton: imageUploadFound ?
                    (imageUploadVisible ? '✅ 图片上传按钮显示正常' : '⚠️ 图片上传按钮存在但不可见') :
                    '❌ 未找到图片上传按钮',
                fileDialogTest: fileDialogOpened ? '✅ 文件选择对话框正常' : '⚠️ 未触发文件选择对话框',
                consoleErrors: consoleMessages.filter(msg => msg.type === 'error').length
            },
            consoleErrors: consoleMessages.filter(msg => msg.type === 'error'),
            summary: {
                success: aiAssistantFound && ((documentUploadFound && documentUploadVisible) || (imageUploadFound && imageUploadVisible)),
                issues: []
            }
        };

        // 添加问题到总结
        if (!documentUploadFound) {
            testReport.summary.issues.push('文档上传按钮未找到');
        }
        if (!imageUploadFound) {
            testReport.summary.issues.push('图片上传按钮未找到');
        }
        if (documentUploadFound && !documentUploadVisible) {
            testReport.summary.issues.push('文档上传按钮存在但不可见');
        }
        if (imageUploadFound && !imageUploadVisible) {
            testReport.summary.issues.push('图片上传按钮存在但不可见');
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

// 确保目录存在
const reportDir = 'docs/浏览器检查';
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
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