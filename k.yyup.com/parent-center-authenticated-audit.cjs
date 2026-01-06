const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建截图保存目录
const screenshotDir = path.join(__dirname, 'screenshots-parent-center-authenticated');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

// 生成时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('🚀 启动带认证的家长中心客户体验检查');
console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));
console.log('📁 截图保存目录:', screenshotDir);
console.log('');

async function auditParentCenterWithAuth() {
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
        await page.waitForTimeout(3000);

        // 截图首页
        await page.screenshot({
            path: path.join(screenshotDir, `01-homepage-${timestamp}.png`),
            fullPage: true
        });

        // 2. 尝试登录 - 寻找登录表单
        console.log('2️⃣ 尝试登录系统...');

        let loginSuccess = false;

        // 尝试多种登录方式
        const loginStrategies = [
            {
                name: '快速体验登录',
                action: async () => {
                    const quickLoginBtn = await page.locator('text=/快速体验|快速登录|demo|test|guest/i').first();
                    if (await quickLoginBtn.isVisible({ timeout: 2000 })) {
                        await quickLoginBtn.click();
                        await page.waitForTimeout(3000);
                        return true;
                    }
                    return false;
                }
            },
            {
                name: '表单登录 - 默认账号',
                action: async () => {
                    const usernameInput = await page.locator('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]').first();
                    const passwordInput = await page.locator('input[type="password"], input[name="password"], input[placeholder*="密码"]').first();

                    if (await usernameInput.isVisible({ timeout: 2000 }) && await passwordInput.isVisible({ timeout: 2000 })) {
                        await usernameInput.fill('admin');
                        await passwordInput.fill('123456');

                        const submitBtn = await page.locator('button[type="submit"], .login-btn, [data-testid="login-button"]').first();
                        if (await submitBtn.isVisible()) {
                            await submitBtn.click();
                            await page.waitForTimeout(3000);
                            return true;
                        }
                    }
                    return false;
                }
            },
            {
                name: '直接访问API登录',
                action: async () => {
                    try {
                        // 尝试调用登录API
                        const response = await page.evaluate(async () => {
                            try {
                                const res = await fetch('http://localhost:3000/api/auth/login', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        username: 'admin',
                                        password: '123456'
                                    })
                                });
                                const data = await res.json();
                                if (data.success && data.data?.token) {
                                    localStorage.setItem('token', data.data.token);
                                    return true;
                                }
                            } catch (e) {
                                console.log('API登录失败:', e.message);
                            }
                            return false;
                        });

                        if (response) {
                            await page.reload({ waitUntil: 'networkidle' });
                            await page.waitForTimeout(2000);
                            return true;
                        }
                    } catch (e) {
                        console.log('API登录异常:', e.message);
                    }
                    return false;
                }
            }
        ];

        // 逐个尝试登录策略
        for (const strategy of loginStrategies) {
            console.log(`🔍 尝试${strategy.name}...`);
            try {
                if (await strategy.action()) {
                    console.log(`✅ ${strategy.name}成功`);
                    loginSuccess = true;
                    break;
                }
            } catch (e) {
                console.log(`❌ ${strategy.name}失败:`, e.message);
            }
        }

        if (!loginSuccess) {
            console.log('⚠️ 所有登录方式都失败，将尝试无token访问');
        }

        // 3. 检查登录状态
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        console.log('当前URL:', currentUrl);

        // 检查页面是否有登录后的内容
        const hasDashboard = await page.locator('text=/仪表板|dashboard|工作台|首页/').isVisible();
        console.log('是否显示仪表板:', hasDashboard);

        // 4. 查找家长中心入口
        console.log('3️⃣ 查找家长中心入口...');

        const parentCenterSelectors = [
            'text=家长中心',
            'text=/家长/i',
            '[data-testid="parent-center"]',
            '.parent-center',
            'a[href*="parent-center"]',
            '[role="menuitem"]:has-text("家长")',
            '.menu-item:has-text("家长")',
            'nav:has-text("家长")',
            '.sidebar:has-text("家长")'
        ];

        let parentCenterFound = false;

        // 先检查是否有菜单
        const menuVisible = await page.locator('.sidebar, .menu, nav').isVisible();
        console.log('侧边栏/菜单是否可见:', menuVisible);

        if (menuVisible) {
            // 尝试点击可能包含家长中心的菜单
            for (const selector of parentCenterSelectors) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible({ timeout: 1000 })) {
                        console.log(`✅ 找到家长中心: ${selector}`);
                        await element.click();
                        await page.waitForTimeout(2000);
                        parentCenterFound = true;
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }
        }

        if (!parentCenterFound) {
            console.log('⚠️ 未找到家长中心入口，尝试直接访问家长中心页面');
        }

        // 5. 检查家长中心各个页面
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

            try {
                // 访问页面
                await page.goto(`http://localhost:5173${pageConfig.path}`, {
                    waitUntil: 'networkidle',
                    timeout: 15000
                });

                // 等待页面完全加载
                await page.waitForTimeout(4000);

                // 检查是否被重定向到登录页
                const currentUrl = page.url();
                const isRedirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/auth');

                if (isRedirectedToLogin) {
                    console.log(`⚠️ 被重定向到登录页面，需要认证才能访问`);

                    const result = {
                        page: pageConfig.name,
                        path: pageConfig.path,
                        title: await page.title(),
                        url: currentUrl,
                        is404: false,
                        needsAuth: true,
                        hasContent: false,
                        layout: { header: false, sidebar: false, mainContent: false, footer: false },
                        status: '需要认证',
                        message: '页面需要登录后才能访问'
                    };

                    auditResults.push(result);
                    continue;
                }

                // 检查页面状态
                const pageTitle = await page.title();

                // 检查是否是404页面
                const is404 = await page.locator('text=/404|not found|页面不存在/i').isVisible({ timeout: 2000 });

                // 检查是否有页面内容
                const bodyText = await page.locator('body').textContent();
                const hasContent = bodyText && bodyText.length > 100;

                // 检查页面布局
                const layoutElements = {
                    header: await page.locator('header, .header, .navbar').isVisible({ timeout: 2000 }),
                    sidebar: await page.locator('.sidebar, .menu, nav').isVisible({ timeout: 2000 }),
                    mainContent: await page.locator('main, .main, .content').isVisible({ timeout: 2000 }),
                    footer: await page.locator('footer, .footer').isVisible({ timeout: 2000 })
                };

                // 检查是否有加载状态或错误信息
                const loadingState = await page.locator('.loading, .spinner, [data-testid="loading"]').isVisible({ timeout: 1000 });
                const errorMessage = await page.locator('.error, .alert-error, [data-testid="error"]').textContent().catch(() => '');

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
                    url: currentUrl,
                    is404: is404,
                    needsAuth: false,
                    hasContent: hasContent,
                    layout: layoutElements,
                    loading: loadingState,
                    errorMessage: errorMessage,
                    screenshot: screenshotPath,
                    timestamp: new Date().toISOString()
                };

                auditResults.push(result);

                // 输出检查结果
                if (is404) {
                    console.log(`❌ 404错误: 页面不存在`);
                    result.status = '404错误';
                } else if (hasContent) {
                    console.log(`✅ 页面正常加载`);
                    result.status = '正常';
                    console.log(`   标题: ${pageTitle}`);
                    console.log(`   布局: 头部${layoutElements.header ? '✓' : '✗'} | 侧边栏${layoutElements.sidebar ? '✓' : '✗'} | 主内容${layoutElements.mainContent ? '✓' : '✗'} | 底部${layoutElements.footer ? '✓' : '✗'}`);
                } else {
                    console.log(`⚠️ 页面加载但内容为空`);
                    result.status = '内容为空';
                }

                if (loadingState) {
                    console.log(`⏳ 页面处于加载状态`);
                }

                if (errorMessage) {
                    console.log(`🚨 页面错误信息: ${errorMessage}`);
                }

                console.log(`   截图: ${screenshotPath}`);

            } catch (error) {
                console.log(`💥 访问页面时发生错误: ${error.message}`);

                const result = {
                    page: pageConfig.name,
                    path: pageConfig.path,
                    title: '访问失败',
                    url: page.url(),
                    is404: false,
                    needsAuth: false,
                    hasContent: false,
                    layout: { header: false, sidebar: false, mainContent: false, footer: false },
                    error: error.message,
                    status: '访问失败',
                    timestamp: new Date().toISOString()
                };

                auditResults.push(result);
            }
        }

        // 6. 生成详细报告
        console.log('\n📋 生成家长中心客户体验检查报告...');

        const report = {
            auditInfo: {
                timestamp: new Date().toISOString(),
                auditor: 'AI Assistant',
                browser: 'Chromium',
                viewport: '1920x1080',
                baseUrl: 'http://localhost:5173',
                loginSuccess: loginSuccess
            },
            summary: {
                totalPages: parentCenterPages.length,
                successfulPages: auditResults.filter(r => r.status === '正常').length,
                pagesWith404: auditResults.filter(r => r.is404).length,
                pagesNeedingAuth: auditResults.filter(r => r.needsAuth).length,
                pagesWithErrors: auditResults.filter(r => r.status === '访问失败' || r.status === '404错误').length,
                pagesWithEmptyContent: auditResults.filter(r => r.status === '内容为空').length
            },
            pages: auditResults,
            consoleMessages: consoleMessages,
            pageErrors: pageErrors
        };

        // 保存详细报告
        const reportPath = path.join(screenshotDir, `家长中心认证体验检查报告-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownReport = generateMarkdownReport(report);
        const markdownPath = path.join(screenshotDir, `家长中心认证体验检查报告-${timestamp}.md`);
        fs.writeFileSync(markdownPath, markdownReport, 'utf8');

        console.log(`\n✅ 检查完成！`);
        console.log(`📊 统计信息:`);
        console.log(`   总页面数: ${report.summary.totalPages}`);
        console.log(`   成功页面: ${report.summary.successfulPages}`);
        console.log(`   需要认证: ${report.summary.pagesNeedingAuth}`);
        console.log(`   404页面: ${report.summary.pagesWith404}`);
        console.log(`   错误页面: ${report.summary.pagesWithErrors}`);
        console.log(`   内容为空: ${report.summary.pagesWithEmptyContent}`);
        console.log(`   登录状态: ${loginSuccess ? '✅ 已登录' : '❌ 未登录'}`);
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

    let markdown = `# 家长中心客户体验检查报告（带认证）\n\n`;
    markdown += `## 检查信息\n`;
    markdown += `- **检查时间**: ${new Date(auditInfo.timestamp).toLocaleString('zh-CN')}\n`;
    markdown += `- **检查员**: ${auditInfo.auditor}\n`;
    markdown += `- **浏览器**: ${auditInfo.browser}\n`;
    markdown += `- **分辨率**: ${auditInfo.viewport}\n`;
    markdown += `- **基础URL**: ${auditInfo.baseUrl}\n`;
    markdown += `- **登录状态**: ${auditInfo.loginSuccess ? '✅ 成功登录' : '❌ 未登录'}\n\n`;

    markdown += `## 统计概览\n`;
    markdown += `- **总页面数**: ${summary.totalPages}\n`;
    markdown += `- **成功页面**: ${summary.successfulPages}\n`;
    markdown += `- **需要认证**: ${summary.pagesNeedingAuth}\n`;
    markdown += `- **404页面**: ${summary.pagesWith404}\n`;
    markdown += `- **错误页面**: ${summary.pagesWithErrors}\n`;
    markdown += `- **内容为空**: ${summary.pagesWithEmptyContent}\n`;

    const successRate = summary.totalPages > 0 ? ((summary.successfulPages / summary.totalPages) * 100).toFixed(1) : 0;
    markdown += `- **成功率**: ${successRate}%\n\n`;

    markdown += `## 页面检查详情\n\n`;

    pages.forEach((page, index) => {
        markdown += `### ${index + 1}. ${page.page}\n\n`;
        markdown += `**路径**: \`${page.path}\`\n\n`;
        markdown += `**状态**: `;

        const statusEmojis = {
            '正常': '✅',
            '需要认证': '🔐',
            '404错误': '❌',
            '访问失败': '💥',
            '内容为空': '⚠️'
        };

        const emoji = statusEmojis[page.status] || '❓';
        markdown += `${emoji} ${page.status}\n\n`;

        markdown += `**页面标题**: ${page.title}\n\n`;
        markdown += `**实际URL**: ${page.url}\n\n`;

        if (page.needsAuth) {
            markdown += `**认证要求**: 需要登录后才能访问\n\n`;
        }

        if (!page.needsAuth) {
            markdown += `**布局检查**:\n`;
            markdown += `- 头部导航: ${page.layout.header ? '✅' : '❌'}\n`;
            markdown += `- 侧边栏: ${page.layout.sidebar ? '✅' : '❌'}\n`;
            markdown += `- 主内容区: ${page.layout.mainContent ? '✅' : '❌'}\n`;
            markdown += `- 底部: ${page.layout.footer ? '✅' : '❌'}\n\n`;

            if (page.loading) {
                markdown += `**加载状态**: ⏳ 页面处于加载中\n\n`;
            }

            if (page.errorMessage) {
                markdown += `**错误信息**: 🚨 ${page.errorMessage}\n\n`;
            }
        }

        if (page.error) {
            markdown += `**访问错误**: ${page.error}\n\n`;
        }

        if (page.screenshot) {
            markdown += `**截图**: [查看截图](${path.basename(page.screenshot)})\n\n`;
        }

        markdown += `---\n\n`;
    });

    markdown += `## 改进建议\n\n`;

    // 基于检查结果生成建议
    if (!auditInfo.loginSuccess) {
        markdown += `### 🔐 登录系统优化\n`;
        markdown += `1. **快速体验入口**: 在首页添加明显的"快速体验"或"Demo演示"按钮\n`;
        markdown += `2. **测试账号**: 提供默认测试账号和密码，方便演示\n`;
        markdown += `3. **API登录**: 确保API登录接口正常工作\n`;
        markdown += `4. **权限提示**: 对于需要认证的页面，提供清晰的登录引导\n\n`;
    }

    if (summary.pagesNeedingAuth > 0) {
        markdown += `### 🛡️ 权限和访问控制\n`;
        markdown += `发现 ${summary.pagesNeedingAuth} 个页面需要认证访问，这是正常的安全措施。\n`;
        markdown += `建议：\n`;
        markdown += `- 为未登录用户提供友好的登录页面\n`;
        markdown += `- 登录成功后自动跳转到原来请求的页面\n`;
        markdown += `- 在家长中心入口处添加登录状态提示\n\n`;
    }

    if (summary.pagesWith404 > 0) {
        markdown += `### 🔧 404错误修复\n`;
        markdown += `发现 ${summary.pagesWith404} 个页面返回404错误，需要检查：\n`;
        markdown += `- Vue Router配置是否正确\n`;
        markdown += `- 页面组件是否存在\n`;
        markdown += `- 路由路径是否匹配\n\n`;
    }

    if (summary.pagesWithEmptyContent > 0) {
        markdown += `### 📄 内容加载优化\n`;
        markdown += `发现 ${summary.pagesWithEmptyContent} 个页面内容为空，可能的原因：\n`;
        markdown += `- API请求失败或返回空数据\n`;
        markdown += `- 组件渲染逻辑问题\n`;
        markdown += `- 权限不足导致数据无法加载\n\n`;
    }

    const pagesWithoutSidebar = pages.filter(p => !p.needsAuth && !p.layout.sidebar && p.status === '正常');
    if (pagesWithoutSidebar.length > 0) {
        markdown += `### 🎨 页面布局优化\n`;
        markdown += `以下正常页面缺少侧边栏，影响导航体验：\n`;
        pagesWithoutSidebar.forEach(p => {
            markdown += `- ${p.page}\n`;
        });
        markdown += `\n`;
    }

    markdown += `### 🎯 用户体验提升\n`;
    markdown += `1. **一致性**: 确保所有家长中心页面使用统一的布局和设计风格\n`;
    markdown += `2. **响应式设计**: 检查页面在不同设备上的显示效果\n`;
    markdown += `3. **加载优化**: 优化页面加载速度，提供加载状态指示\n`;
    markdown += `4. **错误处理**: 为各种错误状态提供友好的提示信息\n`;
    markdown += `5. **导航便利**: 在家长中心页面间提供便捷的切换导航\n\n`;

    markdown += `## 技术建议\n\n`;
    markdown += `1. **路由守卫**: 检查家长中心相关的路由守卫配置\n`;
    markdown += `2. **权限验证**: 确认家长用户角色的权限设置\n`;
    markdown += `3. **组件导入**: 验证页面组件是否正确导入和注册\n`;
    markdown += `4. **API接口**: 检查家长中心相关API接口是否正常工作\n`;
    markdown += `5. **测试覆盖**: 为家长中心页面添加自动化测试\n\n`;

    markdown += `## 下一步行动计划\n\n`;
    markdown += `1. **立即修复**: 解决404错误和访问失败的问题\n`;
    markdown += `2. **登录优化**: 完善登录流程，确保Demo演示可用\n`;
    markdown += `3. **内容填充**: 为空内容页面添加实际数据和功能\n`;
    markdown += `4. **用户体验**: 统一设计风格，优化交互体验\n`;
    markdown += `5. **测试验证**: 建立完整的测试体系确保质量\n\n`;

    markdown += `---\n`;
    markdown += `*报告生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    markdown += `*检查工具: Playwright + AI Assistant*\n`;

    return markdown;
}

// 运行检查
auditParentCenterWithAuth()
    .then(() => {
        console.log('\n🎉 家长中心认证体验检查完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 检查失败:', error);
        process.exit(1);
    });