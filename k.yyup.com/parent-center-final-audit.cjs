const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建截图保存目录
const screenshotDir = path.join(__dirname, 'screenshots-parent-center-final');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

// 生成时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('🚀 启动家长中心最终客户体验检查');
console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));
console.log('📁 截图保存目录:', screenshotDir);
console.log('');

async function finalParentCenterAudit() {
    const browser = await chromium.launch({
        headless: false,
        devtools: true,
        slowMo: 800
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });

        const page = await context.newPage();

        // 监听控制台消息
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

        // 2. 创建家长用户并登录
        console.log('2️⃣ 创建家长用户并登录...');

        try {
            // 尝试直接API登录，创建家长角色用户
            const loginResponse = await page.evaluate(async () => {
                try {
                    const loginResult = await fetch('http://localhost:3000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: 'parent_demo',
                            password: '123456'
                        })
                    });

                    if (loginResult.ok) {
                        const loginData = await loginResult.json();
                        if (loginData.success && loginData.data?.token) {
                            localStorage.setItem('token', loginData.data.token);
                            localStorage.setItem('userInfo', JSON.stringify(loginData.data.user));
                            return { success: true, user: loginData.data.user };
                        }
                    }

                    // 如果登录失败，尝试创建家长用户
                    const createResult = await fetch('http://localhost:3000/api/users/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: 'parent_demo',
                            password: '123456',
                            email: 'parent@demo.com',
                            phone: '13800138000',
                            role: 'parent',
                            name: '演示家长',
                            status: 'active'
                        })
                    });

                    if (createResult.ok) {
                        const createData = await createResult.json();
                        if (createData.success) {
                            // 重新尝试登录
                            const retryLogin = await fetch('http://localhost:3000/api/auth/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    username: 'parent_demo',
                                    password: '123456'
                                })
                            });

                            if (retryLogin.ok) {
                                const retryData = await retryLogin.json();
                                if (retryData.success && retryData.data?.token) {
                                    localStorage.setItem('token', retryData.data.token);
                                    localStorage.setItem('userInfo', JSON.stringify(retryData.data.user));
                                    return { success: true, user: retryData.data.user, created: true };
                                }
                            }
                        }
                    }

                    return { success: false, error: 'Failed to create or login parent user' };
                } catch (error) {
                    console.log('Parent user creation/login error:', error.message);
                    return { success: false, error: error.message };
                }
            });

            if (loginResponse.success) {
                console.log(`✅ ${loginResponse.created ? '创建并' : ''}登录家长用户成功`);
                console.log(`   用户信息:`, loginResponse.user);
            } else {
                console.log(`⚠️ 家长用户创建/登录失败:`, loginResponse.error);

                // 尝试使用快速体验登录
                const quickLoginBtn = await page.locator('text=/快速体验|快速登录|demo|test|guest/i').first();
                if (await quickLoginBtn.isVisible({ timeout: 2000 })) {
                    await quickLoginBtn.click();
                    await page.waitForTimeout(3000);
                    console.log('✅ 使用快速体验登录');
                }
            }
        } catch (error) {
            console.log('❌ 登录过程异常:', error.message);
        }

        await page.waitForTimeout(2000);

        // 3. 刷新页面确保登录状态生效
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // 4. 检查家长中心页面（使用正确路径）
        console.log('4️⃣ 检查家长中心页面...');

        const parentCenterPages = [
            {
                name: '家长中心工作台',
                path: '/parent-center/dashboard',
                description: '家长中心主仪表板页面'
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
                path: '/parent-center/smart-communication',
                description: '与老师和学校的沟通渠道'
            }
        ];

        const auditResults = [];

        for (let i = 0; i < parentCenterPages.length; i++) {
            const pageConfig = parentCenterPages[i];
            console.log(`\n4.${i + 1} 检查 ${pageConfig.name} (${pageConfig.path})`);

            try {
                // 访问页面
                const response = await page.goto(`http://localhost:5173${pageConfig.path}`, {
                    waitUntil: 'networkidle',
                    timeout: 15000
                });

                // 等待页面完全加载
                await page.waitForTimeout(4000);

                // 检查HTTP状态码
                const httpStatus = response?.status() || 0;

                // 检查是否被重定向到登录页
                const currentUrl = page.url();
                const isRedirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/auth');

                // 检查页面标题
                const pageTitle = await page.title();

                // 检查是否是404页面
                const is404 = await page.locator('text=/404|not found|页面不存在/i').isVisible({ timeout: 2000 });

                // 检查是否有权限错误信息
                const hasPermissionError = await page.locator('text=/权限|permission|无权访问/i').isVisible({ timeout: 2000 });

                // 检查页面主要内容区域
                const mainContent = await page.locator('main, .main, .content, .app-main').first();
                const hasMainContent = await mainContent.isVisible({ timeout: 2000 });

                // 获取页面文本内容
                const bodyText = await page.locator('body').textContent();
                const hasContent = bodyText && bodyText.length > 200;

                // 检查页面布局
                const layoutElements = {
                    header: await page.locator('header, .header, .navbar, .app-header').isVisible({ timeout: 2000 }),
                    sidebar: await page.locator('.sidebar, .menu, nav, .app-sidebar').isVisible({ timeout: 2000 }),
                    mainContent: hasMainContent,
                    footer: await page.locator('footer, .footer, .app-footer').isVisible({ timeout: 2000 })
                };

                // 检查是否有家长中心相关的导航
                const hasParentNav = await page.locator('text=/家长中心|parent-center|我的首页|我的孩子/').isVisible({ timeout: 2000 });

                // 检查是否有错误信息
                const errorMessage = await page.locator('.error, .alert-error, .el-message--error, [data-testid="error"]').textContent().catch(() => '');

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
                    httpStatus: httpStatus,
                    is404: is404,
                    hasPermissionError: hasPermissionError,
                    needsAuth: isRedirectedToLogin,
                    hasContent: hasContent,
                    hasParentNav: hasParentNav,
                    layout: layoutElements,
                    errorMessage: errorMessage,
                    screenshot: screenshotPath,
                    timestamp: new Date().toISOString()
                };

                auditResults.push(result);

                // 输出检查结果
                if (is404) {
                    console.log(`❌ 404错误: 页面不存在 (HTTP ${httpStatus})`);
                    result.status = '404错误';
                } else if (isRedirectedToLogin) {
                    console.log(`🔐 需要认证: 被重定向到登录页面`);
                    result.status = '需要认证';
                } else if (hasPermissionError) {
                    console.log(`🚫 权限错误: 无权限访问此页面`);
                    result.status = '权限错误';
                } else if (hasContent && hasMainContent) {
                    console.log(`✅ 页面正常加载`);
                    result.status = '正常';
                    console.log(`   标题: ${pageTitle}`);
                    console.log(`   HTTP状态: ${httpStatus}`);
                    console.log(`   布局: 头部${layoutElements.header ? '✓' : '✗'} | 侧边栏${layoutElements.sidebar ? '✓' : '✗'} | 主内容${layoutElements.mainContent ? '✓' : '✗'} | 底部${layoutElements.footer ? '✓' : '✗'}`);
                    console.log(`   家长导航: ${hasParentNav ? '✓' : '✗'}`);
                } else {
                    console.log(`⚠️ 页面加载但内容异常`);
                    result.status = '内容异常';
                }

                if (errorMessage) {
                    console.log(`🚨 错误信息: ${errorMessage}`);
                }

                console.log(`   截图: ${path.basename(screenshotPath)}`);

            } catch (error) {
                console.log(`💥 访问页面时发生错误: ${error.message}`);

                const result = {
                    page: pageConfig.name,
                    path: pageConfig.path,
                    title: '访问失败',
                    url: page.url(),
                    httpStatus: 0,
                    is404: false,
                    hasPermissionError: false,
                    needsAuth: false,
                    hasContent: false,
                    hasParentNav: false,
                    layout: { header: false, sidebar: false, mainContent: false, footer: false },
                    error: error.message,
                    status: '访问失败',
                    timestamp: new Date().toISOString()
                };

                auditResults.push(result);
            }
        }

        // 5. 生成详细报告
        console.log('\n📋 生成家长中心最终体验检查报告...');

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
                successfulPages: auditResults.filter(r => r.status === '正常').length,
                pagesNeedingAuth: auditResults.filter(r => r.needsAuth).length,
                pagesWith404: auditResults.filter(r => r.is404).length,
                pagesWithPermissionError: auditResults.filter(r => r.hasPermissionError).length,
                pagesWithErrors: auditResults.filter(r => r.status === '访问失败').length,
                pagesWithContentIssues: auditResults.filter(r => r.status === '内容异常').length,
                pagesWithParentNav: auditResults.filter(r => r.hasParentNav).length
            },
            pages: auditResults,
            consoleMessages: consoleMessages,
            pageErrors: pageErrors
        };

        // 保存详细报告
        const reportPath = path.join(screenshotDir, `家长中心最终体验检查报告-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownReport = generateFinalMarkdownReport(report);
        const markdownPath = path.join(screenshotDir, `家长中心最终体验检查报告-${timestamp}.md`);
        fs.writeFileSync(markdownPath, markdownReport, 'utf8');

        console.log(`\n✅ 最终检查完成！`);
        console.log(`📊 统计信息:`);
        console.log(`   总页面数: ${report.summary.totalPages}`);
        console.log(`   成功页面: ${report.summary.successfulPages}`);
        console.log(`   需要认证: ${report.summary.pagesNeedingAuth}`);
        console.log(`   404页面: ${report.summary.pagesWith404}`);
        console.log(`   权限错误: ${report.summary.pagesWithPermissionError}`);
        console.log(`   访问失败: ${report.summary.pagesWithErrors}`);
        console.log(`   内容异常: ${report.summary.pagesWithContentIssues}`);
        console.log(`   有家长导航: ${report.summary.pagesWithParentNav}/${report.summary.totalPages}`);

        const successRate = report.summary.totalPages > 0 ?
            ((report.summary.successfulPages / report.summary.totalPages) * 100).toFixed(1) : 0;
        console.log(`   成功率: ${successRate}%`);

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

// 生成最终Markdown报告
function generateFinalMarkdownReport(report) {
    const { auditInfo, summary, pages } = report;

    let markdown = `# 家长中心客户体验检查最终报告\n\n`;
    markdown += `## 检查信息\n`;
    markdown += `- **检查时间**: ${new Date(auditInfo.timestamp).toLocaleString('zh-CN')}\n`;
    markdown += `- **检查员**: ${auditInfo.auditor}\n`;
    markdown += `- **浏览器**: ${auditInfo.browser}\n`;
    markdown += `- **分辨率**: ${auditInfo.viewport}\n`;
    markdown += `- **基础URL**: ${auditInfo.baseUrl}\n\n`;

    markdown += `## 统计概览\n`;
    markdown += `- **总页面数**: ${summary.totalPages}\n`;
    markdown += `- **成功页面**: ${summary.successfulPages}\n`;
    markdown += `- **需要认证**: ${summary.pagesNeedingAuth}\n`;
    markdown += `- **404页面**: ${summary.pagesWith404}\n`;
    markdown += `- **权限错误**: ${summary.pagesWithPermissionError}\n`;
    markdown += `- **访问失败**: ${summary.pagesWithErrors}\n`;
    markdown += `- **内容异常**: ${summary.pagesWithContentIssues}\n`;
    markdown += `- **包含家长导航**: ${summary.pagesWithParentNav}/${summary.totalPages}\n\n`;

    const successRate = summary.totalPages > 0 ?
        ((summary.successfulPages / summary.totalPages) * 100).toFixed(1) : 0;
    markdown += `- **整体成功率**: ${successRate}%\n\n`;

    // 页面详细分析
    markdown += `## 页面详细分析\n\n`;

    pages.forEach((page, index) => {
        markdown += `### ${index + 1}. ${page.page}\n\n`;
        markdown += `**路径**: \`${page.path}\`\n\n`;
        markdown += `**状态**: `;

        const statusEmojis = {
            '正常': '✅',
            '需要认证': '🔐',
            '404错误': '❌',
            '访问失败': '💥',
            '内容异常': '⚠️',
            '权限错误': '🚫'
        };

        const emoji = statusEmojis[page.status] || '❓';
        markdown += `${emoji} ${page.status}\n\n`;

        markdown += `**技术信息**:\n`;
        markdown += `- HTTP状态: ${page.httpStatus}\n`;
        markdown += `- 页面标题: ${page.title}\n`;
        markdown += `- 最终URL: ${page.url}\n\n`;

        if (page.needsAuth) {
            markdown += `**认证状态**: 需要登录后才能访问\n\n`;
        }

        if (page.hasPermissionError) {
            markdown += `**权限状态**: 当前用户无权限访问此页面\n\n`;
        }

        if (page.status !== '需要认证' && page.status !== '404错误' && page.status !== '访问失败') {
            markdown += `**页面分析**:\n`;
            markdown += `- 页面内容: ${page.hasContent ? '✅ 充足' : '❌ 不足'}\n`;
            markdown += `- 家长导航: ${page.hasParentNav ? '✅ 存在' : '❌ 缺失'}\n`;
            markdown += `- 布局结构: \n`;
            markdown += `  - 头部导航: ${page.layout.header ? '✅' : '❌'}\n`;
            markdown += `  - 侧边栏: ${page.layout.sidebar ? '✅' : '❌'}\n`;
            markdown += `  - 主内容区: ${page.layout.mainContent ? '✅' : '❌'}\n`;
            markdown += `  - 底部: ${page.layout.footer ? '✅' : '❌'}\n\n`;
        }

        if (page.errorMessage) {
            markdown += `**错误信息**: 🚨 \`${page.errorMessage}\`\n\n`;
        }

        if (page.error) {
            markdown += `**访问错误**: \`${page.error}\`\n\n`;
        }

        if (page.screenshot) {
            markdown += `**截图**: [查看截图](${path.basename(page.screenshot)})\n\n`;
        }

        markdown += `---\n\n`;
    });

    // 用户体验评估
    markdown += `## 用户体验评估\n\n`;

    if (summary.successfulPages === summary.totalPages) {
        markdown += `### 🎉 整体体验：优秀\n`;
        markdown += `所有家长中心页面都能正常访问，功能完整，用户体验良好。\n\n`;
    } else if (summary.successfulPages >= summary.totalPages * 0.8) {
        markdown += `### 👍 整体体验：良好\n`;
        markdown += `大部分家长中心页面功能正常，少数页面需要优化。\n\n`;
    } else if (summary.successfulPages >= summary.totalPages * 0.5) {
        markdown += `### ⚠️ 整体体验：一般\n`;
        markdown += `约一半的家长中心页面功能正常，另一半存在各种问题需要解决。\n\n`;
    } else {
        markdown += `### ❌ 整体体验：需要改进\n`;
        markdown += `大部分家长中心页面存在问题，需要全面优化。\n\n`;
    }

    // 设计和布局评估
    markdown += `### 🎨 设计和布局\n`;
    const pagesWithCompleteLayout = pages.filter(p =>
        p.layout.header && p.layout.mainContent && !p.needsAuth && !p.is404
    ).length;

    markdown += `- **布局完整性**: ${pagesWithCompleteLayout}/${summary.totalPages - summary.pagesNeedingAuth - summary.pagesWith404} 页面具有完整布局\n`;
    markdown += `- **导航一致性**: ${summary.pagesWithParentNav}/${summary.totalPages} 页面包含家长中心导航\n\n`;

    // 问题诊断
    markdown += `## 问题诊断和解决方案\n\n`;

    if (summary.pagesWith404 > 0) {
        markdown += `### 🔧 404错误问题\n`;
        markdown += `**问题描述**: ${summary.pagesWith404} 个页面返回404错误\n`;
        markdown += `**可能原因**: 路由配置错误或页面组件不存在\n`;
        markdown += `**解决方案**: \n`;
        markdown += `1. 检查 Vue Router 配置文件中的路由定义\n`;
        markdown += `2. 确认页面组件文件是否存在\n`;
        markdown += `3. 验证路由路径是否正确匹配\n\n`;
    }

    if (summary.pagesWithPermissionError > 0) {
        markdown += `### 🔒 权限配置问题\n`;
        markdown += `**问题描述**: ${summary.pagesWithPermissionError} 个页面存在权限访问问题\n`;
        markdown += `**可能原因**: 用户角色配置或权限验证逻辑问题\n`;
        markdown += `**解决方案**: \n`;
        markdown += `1. 检查家长角色的权限配置\n`;
        markdown += `2. 验证路由守卫中的权限验证逻辑\n`;
        markdown += `3. 确认用户角色分配是否正确\n\n`;
    }

    if (summary.pagesNeedingAuth > 0) {
        markdown += `### 🔐 认证流程问题\n`;
        markdown += `**问题描述**: ${summary.pagesNeedingAuth} 个页面需要登录才能访问\n`;
        markdown += `**当前状态**: 这是正常的安全措施\n`;
        markdown += `**建议优化**: \n`;
        markdown += `1. 为未登录用户提供友好的登录引导\n`;
        markdown += `2. 登录成功后自动跳转到目标页面\n`;
        markdown += `3. 提供家长角色的快速登录入口\n\n`;
    }

    if (summary.pagesWithContentIssues > 0) {
        markdown += `### 📄 内容渲染问题\n`;
        markdown += `**问题描述**: ${summary.pagesWithContentIssues} 个页面内容渲染异常\n`;
        markdown += `**可能原因**: 数据加载失败或组件渲染逻辑问题\n`;
        markdown += `**解决方案**: \n`;
        markdown += `1. 检查API接口是否正常返回数据\n`;
        markdown += `2. 验证组件的数据绑定和状态管理\n`;
        markdown += `3. 添加错误处理和加载状态\n\n`;
    }

    // 改进建议
    markdown += `## 改进建议\n\n`;

    markdown += `### 🚀 短期改进（立即执行）\n`;
    markdown += `1. **修复404错误**: 立即解决不存在的页面问题\n`;
    markdown += `2. **权限配置**: 优化家长角色的权限验证逻辑\n`;
    markdown += `3. **登录体验**: 添加家长角色的一键登录功能\n`;
    markdown += `4. **错误提示**: 为各种错误状态提供友好的提示信息\n\n`;

    markdown += `### 🎯 中期优化（1-2周内）\n`;
    markdown += `1. **界面统一**: 确保所有家长中心页面使用一致的设计风格\n`;
    markdown += `2. **响应式设计**: 优化移动端和不同分辨率的显示效果\n`;
    markdown += `3. **性能优化**: 优化页面加载速度和交互响应\n`;
    markdown += `4. **功能完善**: 补充缺失的功能模块和数据展示\n\n`;

    markdown += `### 🏆 长期规划（1个月内）\n`;
    markdown += `1. **用户体验**: 建立完整的用户体验评估体系\n`;
    markdown += `2. **可访问性**: 提升页面的可访问性和无障碍设计\n`;
    markdown += `3. **国际化**: 支持多语言切换\n`;
    markdown += `4. **智能化**: 集成AI功能提升用户体验\n\n`;

    // 技术建议
    markdown += `## 技术建议\n\n`;
    markdown += `### 🛠️ 开发层面\n`;
    markdown += `1. **路由管理**: 统一管理家长中心的路由配置\n`;
    markdown += `2. **组件复用**: 抽象公共组件减少代码重复\n`;
    markdown += `3. **状态管理**: 优化家长中心的状态管理逻辑\n`;
    markdown += `4. **错误处理**: 建立统一的错误处理机制\n\n`;

    markdown += `### 🔍 测试和质量保证\n`;
    markdown += `1. **自动化测试**: 建立家长中心的E2E测试套件\n`;
    markdown += `2. **性能监控**: 监控页面加载性能和用户体验指标\n`;
    markdown += `3. **兼容性测试**: 确保跨浏览器和跨设备兼容性\n`;
    markdown += `4. **用户反馈**: 建立用户反馈收集和处理机制\n\n`;

    markdown += `## 总结\n\n`;

    if (successRate >= 80) {
        markdown += `家长中心的整体表现${successRate >= 90 ? '优秀' : '良好'}，大部分功能都能正常使用。`;
    } else if (successRate >= 50) {
        markdown += `家长中心基本功能可用，但存在一些需要优化的问题。`;
    } else {
        markdown += `家长中心需要全面优化，当前存在较多影响用户体验的问题。`;
    }

    markdown += `建议按照上述改进计划逐步优化，优先解决404错误和权限配置问题，然后逐步提升用户体验。\n\n`;

    markdown += `---\n`;
    markdown += `*报告生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    markdown += `*检查工具: Playwright + AI Assistant*\n`;

    return markdown;
}

// 运行最终检查
finalParentCenterAudit()
    .then(() => {
        console.log('\n🎉 家长中心最终客户体验检查完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 最终检查失败:', error);
        process.exit(1);
    });