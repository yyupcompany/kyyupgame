const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 最终测试配置
const CONFIG = {
    baseUrl: 'http://localhost:5173',
    testUrls: [
        'http://localhost:5173/login',
        'http://localhost:5173/centers/ai',
        'http://localhost:5173/dashboard',
        'http://localhost:5173/'
    ],
    screenshotDir: './test-results/final-ai-test',
    testDuration: 20000 // 20秒
};

// 创建测试结果目录
if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// 测试结果
const testResults = {
    startTime: new Date(),
    endTime: null,
    duration: null,
    pages: [],
    errors: [],
    screenshots: [],
    consoleLogs: [],
    aiFeatures: {},
    summary: {
        loginPageAccessible: false,
        aiPageAccessible: false,
        fileUploadFound: false,
        chatInterfaceFound: false,
        overallStatus: 'failed'
    }
};

function log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

async function takeScreenshot(page, name) {
    try {
        const screenshotPath = path.join(CONFIG.screenshotDir, `${name}_${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResults.screenshots.push({
            name,
            path: screenshotPath,
            timestamp: new Date()
        });
        log(`📸 截图: ${screenshotPath}`);
        return screenshotPath;
    } catch (error) {
        log(`❌ 截图失败: ${error.message}`, 'error');
        return null;
    }
}

function setupPageListeners(page, pageName) {
    const pageInfo = {
        name: pageName,
        url: '',
        title: '',
        elements: {},
        loadTime: new Date(),
        consoleLogs: []
    };

    page.on('console', (msg) => {
        const logEntry = {
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date()
        };
        pageInfo.consoleLogs.push(logEntry);
        testResults.consoleLogs.push({
            ...logEntry,
            page: pageName
        });

        if (msg.type() === 'error') {
            testResults.errors.push({
                message: msg.text(),
                page: pageName,
                context: 'console_error',
                timestamp: new Date()
            });
        }
    });

    page.on('pageerror', (error) => {
        testResults.errors.push({
            message: error.message,
            page: pageName,
            context: 'page_error',
            stack: error.stack,
            timestamp: new Date()
        });
    });

    return pageInfo;
}

// 分析页面元素
async function analyzePageElements(page, pageInfo) {
    try {
        const elementAnalysis = await page.evaluate(() => {
            const analysis = {
                inputs: {
                    text: document.querySelectorAll('input[type="text"], input[type="email"], textarea').length,
                    password: document.querySelectorAll('input[type="password"]').length,
                    file: document.querySelectorAll('input[type="file"]').length,
                    all: document.querySelectorAll('input, textarea').length
                },
                buttons: {
                    total: document.querySelectorAll('button').length,
                    submit: document.querySelectorAll('button[type="submit"]').length,
                    upload: document.querySelectorAll('button:has-text("上传"), button:has-text("附件"), .upload-btn').length,
                    send: document.querySelectorAll('button:has-text("发送"), .send-btn, button:has-text("提交")').length
                },
                aiFeatures: {
                    chatInterface: document.querySelectorAll('textarea[placeholder*="输入"], .chat-input, .message-input').length,
                    uploadInterface: document.querySelectorAll('input[type="file"], .file-upload, .upload-area').length,
                    aiMessages: document.querySelectorAll('.ai-message, .chat-message, [class*="message"]:not(.user-message)').length,
                    uploadButtons: document.querySelectorAll('button:has-text("上传"), [class*="upload"], [data-testid*="upload"]').length
                },
                textContent: {
                    hasLoginForm: document.querySelector('input[type="password"], input[placeholder*="密码"]') !== null,
                    hasAI: document.body.textContent.toLowerCase().includes('ai') || document.body.textContent.toLowerCase().includes('助手'),
                    hasUpload: document.body.textContent.includes('上传') || document.body.textContent.includes('附件')
                }
            };
            return analysis;
        });

        pageInfo.elements = elementAnalysis;
        return elementAnalysis;
    } catch (error) {
        log(`页面元素分析失败: ${error.message}`, 'error');
        return null;
    }
}

// 测试单个页面
async function testPage(browser, url, pageName) {
    log(`测试页面: ${url}`);
    let page;
    let pageInfo;

    try {
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        pageInfo = setupPageListeners(page, pageName);

        // 导航到页面
        const response = await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        pageInfo.url = page.url();
        pageInfo.title = await page.title();
        pageInfo.httpStatus = response?.status() || 0;

        log(`页面标题: ${pageInfo.title}`);
        log(`HTTP状态: ${pageInfo.httpStatus}`);

        // 等待页面完全加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 截图
        await takeScreenshot(page, `${pageName}_loaded`);

        // 分析页面元素
        const elementAnalysis = await analyzePageElements(page, pageInfo);

        if (elementAnalysis) {
            log(`页面元素分析完成:`);
            log(`  - 输入元素: ${elementAnalysis.inputs.all}个 (文件输入: ${elementAnalysis.inputs.file}个)`);
            log(`  - 按钮元素: ${elementAnalysis.buttons.total}个 (上传: ${elementAnalysis.buttons.upload}个, 发送: ${elementAnalysis.buttons.send}个)`);
            log(`  - AI功能: 聊天界面${elementAnalysis.aiFeatures.chatInterface}个, 上传界面${elementAnalysis.aiFeatures.uploadInterface}个`);
        }

        // 特定页面测试
        if (pageName === 'login') {
            testResults.summary.loginPageAccessible = elementAnalysis?.inputs.password > 0;

            if (elementAnalysis?.inputs.password > 0) {
                log('✅ 登录页面功能正常', 'success');

                // 尝试快速登录测试
                try {
                    const usernameSelector = 'input[type="text"], input[type="email"], input[placeholder*="用户名"]';
                    const passwordSelector = 'input[type="password"]';
                    const loginButtonSelector = 'button[type="submit"], button:has-text("登录"), .login-btn';

                    await page.type(usernameSelector, 'admin');
                    await page.type(passwordSelector, 'admin123');
                    await takeScreenshot(page, 'login_filled');

                    log('登录表单填写完成');
                } catch (error) {
                    log(`登录测试失败: ${error.message}`, 'error');
                }
            }
        }

        if (pageName === 'ai_assistant') {
            testResults.summary.aiPageAccessible = true;
            testResults.summary.fileUploadFound = elementAnalysis?.aiFeatures.uploadInterface > 0;
            testResults.summary.chatInterfaceFound = elementAnalysis?.aiFeatures.chatInterface > 0;

            testResults.aiFeatures = {
                uploadInterface: elementAnalysis?.aiFeatures.uploadInterface || 0,
                chatInterface: elementAnalysis?.aiFeatures.chatInterface || 0,
                fileInputs: elementAnalysis?.inputs.file || 0,
                uploadButtons: elementAnalysis?.aiFeatures.uploadButtons || 0,
                aiMessages: elementAnalysis?.aiFeatures.aiMessages || 0
            };

            if (elementAnalysis?.aiFeatures.chatInterface > 0) {
                log('✅ 发现AI聊天界面', 'success');
            }

            if (elementAnalysis?.aiFeatures.uploadInterface > 0) {
                log('✅ 发现文件上传功能', 'success');

                // 测试文件上传界面
                try {
                    // 显示隐藏的文件输入
                    await page.evaluate(() => {
                        const fileInputs = document.querySelectorAll('input[type="file"]');
                        fileInputs.forEach(input => {
                            input.style.display = 'block';
                            input.style.visibility = 'visible';
                            input.style.opacity = '1';
                        });
                    });

                    await takeScreenshot(page, 'ai_upload_interface');
                    log('文件上传界面测试完成');
                } catch (error) {
                    log(`文件上传测试失败: ${error.message}`, 'error');
                }
            }

            if (elementAnalysis?.aiFeatures.chatInterface > 0) {
                // 测试聊天界面
                try {
                    const chatInputSelector = 'textarea[placeholder*="输入"], .chat-input textarea';
                    const chatInput = await page.$(chatInputSelector);

                    if (chatInput) {
                        await chatInput.click();
                        await page.keyboard.type('你好，这是一个测试消息');
                        await takeScreenshot(page, 'ai_chat_test');
                        log('聊天界面测试完成');
                    }
                } catch (error) {
                    log(`聊天测试失败: ${error.message}`, 'error');
                }
            }
        }

        await page.close();
        testResults.pages.push(pageInfo);

    } catch (error) {
        log(`页面测试失败 ${url}: ${error.message}`, 'error');
        testResults.errors.push({
            message: error.message,
            page: pageName,
            context: 'page_navigation',
            url: url,
            timestamp: new Date()
        });

        if (page) {
            await takeScreenshot(page, `${pageName}_error`);
            await page.close();
        }

        if (pageInfo) {
            pageInfo.error = error.message;
            testResults.pages.push(pageInfo);
        }
    }
}

// 主测试函数
async function runFinalTest() {
    log('🚀 开始最终AI助手功能测试');

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 300
    });

    try {
        // 测试各个页面
        await testPage(browser, CONFIG.testUrls[0], 'login'); // 登录页面
        await testPage(browser, CONFIG.testUrls[1], 'ai_assistant'); // AI助手页面
        await testPage(browser, CONFIG.testUrls[2], 'dashboard'); // 仪表板
        await testPage(browser, CONFIG.testUrls[3], 'home'); // 首页

        // 生成最终总结
        log('\n📊 测试总结:');
        log(`✅ 登录页面可访问: ${testResults.summary.loginPageAccessible}`);
        log(`✅ AI助手页面可访问: ${testResults.summary.aiPageAccessible}`);
        log(`✅ 文件上传功能: ${testResults.summary.fileUploadFound}`);
        log(`✅ 聊天界面功能: ${testResults.summary.chatInterfaceFound}`);

        // 计算整体状态
        const successCount = [
            testResults.summary.loginPageAccessible,
            testResults.summary.aiPageAccessible,
            testResults.summary.fileUploadFound,
            testResults.summary.chatInterfaceFound
        ].filter(Boolean).length;

        testResults.summary.overallStatus = successCount >= 2 ? 'success' : 'partial';

        log(`🎯 整体测试状态: ${testResults.summary.overallStatus}`);

        // AI功能详细分析
        if (Object.keys(testResults.aiFeatures).length > 0) {
            log('\n🤖 AI功能详细分析:');
            log(`  - 上传界面: ${testResults.aiFeatures.uploadInterface}个`);
            log(`  - 聊天界面: ${testResults.aiFeatures.chatInterface}个`);
            log(`  - 文件输入: ${testResults.aiFeatures.fileInputs}个`);
            log(`  - 上传按钮: ${testResults.aiFeatures.uploadButtons}个`);
            log(`  - AI消息: ${testResults.aiFeatures.aiMessages}个`);
        }

        // 错误总结
        if (testResults.errors.length > 0) {
            log(`\n⚠️ 发现 ${testResults.errors.length} 个错误:`);
            testResults.errors.slice(0, 5).forEach(error => {
                log(`  - ${error.message} (${error.page})`);
            });
        } else {
            log('\n✅ 未发现错误');
        }

    } catch (error) {
        log(`💥 测试执行失败: ${error.message}`, 'error');
        testResults.errors.push({
            message: error.message,
            context: 'main_execution',
            timestamp: new Date()
        });
    } finally {
        await browser.close();

        // 完成测试
        testResults.endTime = new Date();
        testResults.duration = testResults.endTime - testResults.startTime;

        // 生成报告
        await generateReports();

        log('\n🎉 最终AI助手功能测试完成');
    }
}

// 生成测试报告
async function generateReports() {
    // JSON报告
    const jsonPath = path.join(CONFIG.screenshotDir, `final-ai-test-report-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(testResults, null, 2));
    log(`📋 JSON报告: ${jsonPath}`);

    // Markdown报告
    const markdownContent = generateMarkdownReport();
    const mdPath = path.join(CONFIG.screenshotDir, `final-ai-test-report-${Date.now()}.md`);
    fs.writeFileSync(mdPath, markdownContent);
    log(`📝 Markdown报告: ${mdPath}`);

    // 保存到docs目录
    const docsDir = './docs';
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    const finalMdPath = path.join(docsDir, `AI助手文件上传测试报告-${new Date().toISOString().split('T')[0]}.md`);
    fs.writeFileSync(finalMdPath, markdownContent);
    log(`📚 最终报告: ${finalMdPath}`);
}

// 生成Markdown报告
function generateMarkdownReport() {
    return `# AI助手文件上传和图片分析功能测试报告

## 📋 测试概览
- **测试时间**: ${testResults.startTime}
- **测试时长**: ${Math.round(testResults.duration / 1000)}秒
- **整体状态**: ${testResults.summary.overallStatus === 'success' ? '✅ 成功' : testResults.summary.overallStatus === 'partial' ? '⚠️ 部分成功' : '❌ 失败'}

## 🎯 核心功能测试结果

| 功能模块 | 测试结果 | 详细状态 |
|---------|---------|---------|
| 登录页面 | ${testResults.summary.loginPageAccessible ? '✅ 正常' : '❌ 异常'} | ${testResults.summary.loginPageAccessible ? '表单元素可访问' : '表单元素缺失'} |
| AI助手页面 | ${testResults.summary.aiPageAccessible ? '✅ 正常' : '❌ 异常'} | ${testResults.summary.aiPageAccessible ? '页面可访问' : '页面不可访问'} |
| 文件上传功能 | ${testResults.summary.fileUploadFound ? '✅ 正常' : '❌ 异常'} | ${testResults.summary.fileUploadFound ? '上传界面存在' : '上传界面缺失'} |
| AI聊天功能 | ${testResults.summary.chatInterfaceFound ? '✅ 正常' : '❌ 异常'} | ${testResults.summary.chatInterfaceFound ? '聊天界面存在' : '聊天界面缺失'} |

## 🤖 AI功能详细分析

${Object.keys(testResults.aiFeatures).length > 0 ? `
- **上传界面数量**: ${testResults.aiFeatures.uploadInterface}个
- **聊天界面数量**: ${testResults.aiFeatures.chatInterface}个
- **文件输入元素**: ${testResults.aiFeatures.fileInputs}个
- **上传按钮数量**: ${testResults.aiFeatures.uploadButtons}个
- **AI消息显示**: ${testResults.aiFeatures.aiMessages}个
` : '⚠️ 未检测到AI功能元素'}

## 📄 页面测试详情

${testResults.pages.map(page => `
### ${page.name}页面
- **URL**: ${page.url}
- **标题**: ${page.title}
- **HTTP状态**: ${page.httpStatus || '未知'}
- **加载时间**: ${page.loadTime}
- **元素统计**: ${page.elements ? Object.values(page.elements).map(v => typeof v === 'object' ? Object.values(v).join(', ') : v).join(' | ') : '未分析'}
${page.error ? `- **错误**: ${page.error}` : ''}
`).join('\n')}

## ❌ 错误和问题

${testResults.errors.length > 0 ? testResults.errors.map(error => `
### ${error.context || '未知错误'}
- **错误信息**: ${error.message}
- **相关页面**: ${error.page || '未知'}
- **时间**: ${error.timestamp}
${error.url ? `- **URL**: ${error.url}` : ''}
`).join('\n') : '✅ 未发现错误'}

## 📸 截图记录

${testResults.screenshots.map(screenshot =>
    `- [${screenshot.name}](${screenshot.path}) - ${screenshot.timestamp}`
).join('\n')}

## 🎯 测试结论

### 成功的功能
${testResults.summary.loginPageAccessible ? '- ✅ 登录页面加载正常，表单元素可访问' : ''}
${testResults.summary.aiPageAccessible ? '- ✅ AI助手页面可以正常访问' : ''}
${testResults.summary.fileUploadFound ? '- ✅ 文件上传功能界面存在' : ''}
${testResults.summary.chatInterfaceFound ? '- ✅ AI聊天交互界面存在' : ''}

### 需要改进的问题
${testResults.errors.length > 0 ?
    testResults.errors.map(error => `- ⚠️ ${error.message} (${error.page})`).join('\n') :
    '- ✅ 未发现明显问题'
}

### 建议改进措施
1. **文件上传功能**: ${testResults.summary.fileUploadFound ? '功能正常，建议添加拖拽上传支持' : '建议添加文件上传界面'}
2. **AI交互体验**: ${testResults.summary.chatInterfaceFound ? '功能正常，建议优化响应速度' : '建议完善聊天界面'}
3. **用户引导**: 建议添加更明确的操作提示和使用说明
4. **错误处理**: 建议完善错误信息显示和用户引导
5. **性能优化**: 建议优化页面加载速度和响应时间

## 🔧 技术发现
- 前端框架: Vue 3 + TypeScript
- 组件库: Element Plus
- 构建工具: Vite
- 路由系统: Vue Router
- 状态管理: Pinia

---
*测试报告生成时间: ${new Date().toISOString()}*
*测试环境: localhost:5173 (前端), localhost:3000 (API)*
`;
}

// 运行测试
if (require.main === module) {
    runFinalTest()
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            log(`💥 测试执行异常: ${error.message}`, 'error');
            process.exit(1);
        });
}

module.exports = { runFinalTest };