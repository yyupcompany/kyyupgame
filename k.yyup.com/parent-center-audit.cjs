const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建截图保存目录
const screenshotDir = path.join(__dirname, 'screenshots-parent-center');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

// 生成时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('🚀 启动家长中心客户体验检查');
console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));
console.log('📁 截图保存目录:', screenshotDir);
console.log('');

async function auditParentCenter() {
    const browser = await chromium.launch({
        headless: false, // 使用有头模式以便观察
        devtools: true,
        slowMo: 1000
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });

        const page = await context.newPage();

        // 监听控制台消息和错误
        const consoleMessages = [];
        const pageErrors = [];

        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
            if (msg.type() === 'error') {
                console.log(`❌ 控制台错误: ${msg.text()}`);
            }
        });

        page.on('pageerror', error => {
            pageErrors.push({
                message: error.message,
                stack: error.stack
            });
            console.log(`🔥 页面错误: ${error.message}`);
        });

        // 1. 访问首页
        console.log('1️⃣ 访问系统首页...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // 截图首页
        await page.screenshot({
            path: path.join(screenshotDir, `01-homepage-${timestamp}.png`),
            fullPage: true
        });
        console.log('✅ 首页已加载');

        // 2. 尝试登录 - 使用测试账号
        console.log('2️⃣ 尝试登录系统...');
        try {
            // 查找登录相关元素
            const loginButton = await page.locator('button[type="submit"], .login-btn, [data-testid="login-button"]').first();
            if (await loginButton.isVisible()) {
                console.log('🔍 发现登录按钮，尝试使用快速登录');

                // 尝试快速体验登录
                const quickLoginBtn = await page.locator('text=/快速体验|快速登录|demo|test/i').first();
                if (await quickLoginBtn.isVisible()) {
                    await quickLoginBtn.click();
                    await page.waitForTimeout(3000);
                    console.log('✅ 使用快速登录');
                }
            }
        } catch (error) {
            console.log('⚠️ 登录过程遇到问题:', error.message);
        }

        // 等待页面加载
        await page.waitForTimeout(3000);

        // 3. 查找并点击家长中心
        console.log('3️⃣ 查找家长中心入口...');

        const parentCenterSelectors = [
            'text=家长中心',
            'text=/家长/i',
            '[data-testid="parent-center"]',
            '.parent-center',
            'a[href*="parent-center"]',
            '[role="menuitem"]:has-text("家长")'
        ];

        let parentCenterFound = false;
        for (const selector of parentCenterSelectors) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible({ timeout: 2000 })) {
                    console.log(`✅ 找到家长中心: ${selector}`);
                    await element.click();
                    parentCenterFound = true;
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!parentCenterFound) {
            console.log('⚠️ 未找到家长中心入口，尝试直接访问家长中心页面');
            // 直接访问家长中心工作台
            await page.goto('http://localhost:5173/parent-center/dashboard', { waitUntil: 'networkidle' });
        }

        await page.waitForTimeout(3000);

        // 4. 检查家长中心各个页面
        const parentCenterPages = [
            {
                name: '家长中心工作台',
                path: '/parent-center/dashboard',
                description: '家长中心主要仪表板页面'
            },
            {
                name: '孩子管理',
                path: '/parent-center/children',
                description: '管理孩子的信息和档案'
            },
            {
                name: '招生活动',
                path: '/parent-center/activities',
                description: '查看和参与招生活动'
            },
            {
                name: '成长评估',
                path: '/parent-center/assessment',
                description: '查看孩子的成长评估报告'
            },
            {
                name: '家校沟通',
                path: '/parent-center/communication',
                description: '与老师和学校的沟通渠道'
            }
        ];

        const auditResults = [];

        for (let i = 0; i < parentCenterPages.length; i++) {
            const pageConfig = parentCenterPages[i];
            console.log(`\n4.${i + 1} 检查 ${pageConfig.name} (${pageConfig.path})`);

            // 访问页面
            await page.goto(`http://localhost:5173${pageConfig.path}`, {
                waitUntil: 'networkidle',
                timeout: 10000
            });

            // 清空之前的错误记录
            const currentConsoleErrors = [];
            const currentPageErrors = [];

            // 等待页面完全加载
            await page.waitForTimeout(3000);

            // 检查页面状态
            const pageTitle = await page.title();
            const pageUrl = page.url();

            // 检查是否是404页面
            const is404 = await page.locator('text=/404|not found|页面不存在/i').isVisible();

            // 检查是否有页面内容
            const hasContent = await page.locator('body').textContent() > 100;

            // 检查页面布局
            const layoutElements = {
                header: await page.locator('header, .header, .navbar').isVisible(),
                sidebar: await page.locator('.sidebar, .menu, nav').isVisible(),
                mainContent: await page.locator('main, .main, .content').isVisible(),
                footer: await page.locator('footer, .footer').isVisible()
            };

            // 截图
            const screenshotPath = path.join(screenshotDir,
                `${String(i + 2).padStart(2, '0')}-${pageConfig.name.replace(/[^\w\u4e00-\u9fa5]/g, '-')}-${timestamp}.png`);
            await page.screenshot({
                path: screenshotPath,
                fullPage: true
            });

            // 记录检查结果
            const result = {
                page: pageConfig.name,
                path: pageConfig.path,
                title: pageTitle,
                url: pageUrl,
                is404: is404,
                hasContent: hasContent,
                layout: layoutElements,
                consoleErrors: currentConsoleErrors,
                pageErrors: currentPageErrors,
                screenshot: screenshotPath,
                timestamp: new Date().toISOString()
            };

            auditResults.push(result);

            // 输出检查结果
            if (is404) {
                console.log(`❌ 404错误: 页面不存在`);
            } else if (hasContent) {
                console.log(`✅ 页面正常加载`);
                console.log(`   标题: ${pageTitle}`);
                console.log(`   布局: 头部${layoutElements.header ? '✓' : '✗'} | 侧边栏${layoutElements.sidebar ? '✓' : '✗'} | 主内容${layoutElements.mainContent ? '✓' : '✗'} | 底部${layoutElements.footer ? '✓' : '✗'}`);
            } else {
                console.log(`⚠️ 页面加载但内容为空`);
            }

            console.log(`   截图: ${screenshotPath}`);
        }

        // 5. 生成详细报告
        console.log('\n📋 生成家长中心客户体验检查报告...');

        const report = {
            auditInfo: {
                timestamp: new Date().toISOString(),
                auditor: 'AI Assistant',
                browser: 'Chromium',
                viewport: '1920x1080',
                baseUrl: 'http://localhost:5173'
            },
            summary: {
                totalPages: parentCenterPages.length,
                successfulPages: auditResults.filter(r => !r.is404 && r.hasContent).length,
                pagesWithErrors: auditResults.filter(r => r.is404 || r.pageErrors.length > 0).length,
                pagesWith404: auditResults.filter(r => r.is404).length
            },
            pages: auditResults,
            consoleMessages: consoleMessages,
            pageErrors: pageErrors
        };

        // 保存详细报告
        const reportPath = path.join(screenshotDir, `家长中心客户体验检查报告-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownReport = generateMarkdownReport(report);
        const markdownPath = path.join(screenshotDir, `家长中心客户体验检查报告-${timestamp}.md`);
        fs.writeFileSync(markdownPath, markdownReport, 'utf8');

        console.log(`\n✅ 检查完成！`);
        console.log(`📊 统计信息:`);
        console.log(`   总页面数: ${report.summary.totalPages}`);
        console.log(`   成功页面: ${report.summary.successfulPages}`);
        console.log(`   404页面: ${report.summary.pagesWith404}`);
        console.log(`   错误页面: ${report.summary.pagesWithErrors}`);
        console.log(`\n📄 报告文件:`);
        console.log(`   JSON报告: ${reportPath}`);
        console.log(`   Markdown报告: ${markdownPath}`);
        console.log(`   截图目录: ${screenshotDir}`);

        return report;

    } catch (error) {
        console.error('❌ 检查过程中发生错误:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// 生成Markdown报告
function generateMarkdownReport(report) {
    const { auditInfo, summary, pages } = report;

    let markdown = `# 家长中心客户体验检查报告\n\n`;
    markdown += `## 检查信息\n`;
    markdown += `- **检查时间**: ${new Date(auditInfo.timestamp).toLocaleString('zh-CN')}\n`;
    markdown += `- **检查员**: ${auditInfo.auditor}\n`;
    markdown += `- **浏览器**: ${auditInfo.browser}\n`;
    markdown += `- **分辨率**: ${auditInfo.viewport}\n`;
    markdown += `- **基础URL**: ${auditInfo.baseUrl}\n\n`;

    markdown += `## 统计概览\n`;
    markdown += `- **总页面数**: ${summary.totalPages}\n`;
    markdown += `- **成功页面**: ${summary.successfulPages}\n`;
    markdown += `- **404页面**: ${summary.pagesWith404}\n`;
    markdown += `- **错误页面**: ${summary.pagesWithErrors}\n`;
    markdown += `- **成功率**: ${((summary.successfulPages / summary.totalPages) * 100).toFixed(1)}%\n\n`;

    markdown += `## 页面检查详情\n\n`;

    pages.forEach((page, index) => {
        markdown += `### ${index + 1}. ${page.page}\n\n`;
        markdown += `**路径**: \`${page.path}\`\n\n`;
        markdown += `**状态**: `;
        if (page.is404) {
            markdown += `❌ 404错误\n\n`;
        } else if (page.hasContent) {
            markdown += `✅ 正常\n\n`;
        } else {
            markdown += `⚠️ 内容为空\n\n`;
        }

        markdown += `**页面标题**: ${page.title}\n\n`;
        markdown += `**实际URL**: ${page.url}\n\n`;

        markdown += `**布局检查**:\n`;
        markdown += `- 头部导航: ${page.layout.header ? '✅' : '❌'}\n`;
        markdown += `- 侧边栏: ${page.layout.sidebar ? '✅' : '❌'}\n`;
        markdown += `- 主内容区: ${page.layout.mainContent ? '✅' : '❌'}\n`;
        markdown += `- 底部: ${page.layout.footer ? '✅' : '❌'}\n\n`;

        if (page.pageErrors && page.pageErrors.length > 0) {
            markdown += `**页面错误**:\n`;
            page.pageErrors.forEach(error => {
                markdown += `- ${error.message}\n`;
            });
            markdown += `\n`;
        }

        markdown += `**截图**: [查看截图](${path.basename(page.screenshot)})\n\n`;
        markdown += `---\n\n`;
    });

    markdown += `## 改进建议\n\n`;

    // 基于检查结果生成建议
    if (summary.pagesWith404 > 0) {
        markdown += `### 🔧 404错误修复\n`;
        markdown += `发现 ${summary.pagesWith404} 个页面返回404错误，需要检查路由配置和页面组件是否存在。\n\n`;
    }

    const pagesWithoutSidebar = pages.filter(p => !p.layout.sidebar && !p.is404);
    if (pagesWithoutSidebar.length > 0) {
        markdown += `### 🎨 页面布局优化\n`;
        markdown += `以下页面缺少侧边栏，影响导航体验：\n`;
        pagesWithoutSidebar.forEach(p => {
            markdown += `- ${p.page}\n`;
        });
        markdown += `\n`;
    }

    markdown += `### 🎯 用户体验提升\n`;
    markdown += `1. **一致性**: 确保所有家长中心页面使用统一的布局和设计风格\n`;
    markdown += `2. **响应式设计**: 检查页面在不同设备上的显示效果\n`;
    markdown += `3. **加载优化**: 优化页面加载速度，提供加载状态指示\n`;
    markdown += `4. **错误处理**: 为404页面提供友好的错误提示和返回导航\n\n`;

    markdown += `## 技术建议\n\n`;
    markdown += `1. **路由配置**: 检查 Vue Router 配置，确保所有家长中心路由正确映射\n`;
    markdown += `2. **组件导入**: 验证页面组件是否正确导入和注册\n`;
    markdown += `3. **权限控制**: 确认家长中心页面的权限设置是否正确\n`;
    markdown += `4. **测试覆盖**: 为家长中心页面添加自动化测试\n\n`;

    markdown += `---\n`;
    markdown += `*报告生成时间: ${new Date().toLocaleString('zh-CN')}*`;

    return markdown;
}

// 运行检查
auditParentCenter()
    .then(() => {
        console.log('\n🎉 家长中心客户体验检查完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 检查失败:', error);
        process.exit(1);
    });