const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建截图保存目录
const screenshotDir = path.join(__dirname, 'comprehensive-parent-center-report');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

// 生成时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('🚀 启动家长中心综合客户体验检查');
console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));
console.log('📁 截图保存目录:', screenshotDir);
console.log('');

async function comprehensiveParentCenterAudit() {
    const browser = await chromium.launch({
        headless: false, // 使用有头模式以便观察
        slowMo: 500
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        const page = await context.newPage();

        // 1. 登录系统
        console.log('1️⃣ 登录系统...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

        // 填写登录信息
        await page.fill('input[placeholder*="用户"], input[placeholder*="账号"], input[type="text"]', 'admin');
        await page.fill('input[placeholder*="密码"], input[type="password"]', '123456');
        await page.click('button[type="submit"], .login-btn');

        await page.waitForTimeout(3000);
        console.log('✅ 登录完成');

        // 2. 访问家长中心页面
        const parentCenterPages = [
            {
                name: '家长中心工作台',
                path: '/parent-center/dashboard',
                key: 'dashboard',
                description: '家长中心主仪表板页面',
                checks: {
                    hasWelcome: /欢迎|welcome|仪表板|dashboard/i,
                    hasStats: /统计|数据|概览|overview/i,
                    hasQuickActions: /快速操作|快捷入口|quick/i
                }
            },
            {
                name: '孩子管理',
                path: '/parent-center/children',
                key: 'children',
                description: '管理孩子的信息和档案',
                checks: {
                    hasChildList: /孩子列表|学生列表|child list/i,
                    hasAddButton: /添加|新增|新建/i,
                    hasSearch: /搜索|查找|search/i
                }
            },
            {
                name: '招生活动',
                path: '/parent-center/activities',
                key: 'activities',
                description: '查看和参与招生活动',
                checks: {
                    hasActivityList: /活动列表|activities/i,
                    hasCategories: /分类|category|类型/i,
                    hasRegistration: /报名|注册|registration/i
                }
            },
            {
                name: '成长评估',
                path: '/parent-center/assessment',
                key: 'assessment',
                description: '查看孩子的成长评估报告',
                checks: {
                    hasAssessmentTypes: /测评类型|评估类型|assessment/i,
                    hasReports: /报告|report/i,
                    hasCharts: /图表|chart|统计/i
                }
            },
            {
                name: '家校沟通',
                path: '/parent-center/smart-communication',
                key: 'communication',
                description: '与老师和学校的沟通渠道',
                checks: {
                    hasChat: /聊天|消息|chat/i,
                    hasTeachers: /老师|teacher/i,
                    hasMessages: /消息|message/i
                }
            }
        ];

        const auditResults = [];

        console.log('\n2️⃣ 检查家长中心页面...');

        for (let i = 0; i < parentCenterPages.length; i++) {
            const pageConfig = parentCenterPages[i];
            console.log(`\n2.${i + 1} 检查 ${pageConfig.name} (${pageConfig.path})`);

            try {
                // 访问页面
                const response = await page.goto(`http://localhost:5173${pageConfig.path}`, {
                    waitUntil: 'networkidle',
                    timeout: 10000
                });

                await page.waitForTimeout(2000);

                // 基本检查
                const pageTitle = await page.title();
                const currentUrl = page.url();
                const httpStatus = response?.status() || 0;

                // 检查是否是错误页面
                const isErrorPage = await page.locator('text=/404|not found|页面不存在|错误/i').isVisible();
                const hasContent = await page.locator('body').textContent() > 100;

                // 检查布局元素
                const layoutElements = {
                    header: await page.locator('header, .header, .navbar, .app-header').isVisible(),
                    sidebar: await page.locator('.sidebar, .menu, nav, .app-sidebar').isVisible(),
                    mainContent: await page.locator('main, .main, .content, .app-main').isVisible(),
                    footer: await page.locator('footer, .footer, .app-footer').isVisible()
                };

                // 检查页面特定的内容
                const contentChecks = {};
                for (const [checkName, pattern] of Object.entries(pageConfig.checks)) {
                    contentChecks[checkName] = await page.locator(`text=${pattern}`).isVisible();
                }

                // 检查家长中心导航
                const hasParentNav = await page.locator('text=/家长中心|parent-center|我的首页|我的孩子/').isVisible();

                // 检查交互元素
                const hasButtons = await page.locator('button, .btn, [role="button"]').count() > 0;
                const hasForms = await page.locator('form, input, select, textarea').count() > 0;
                const hasLinks = await page.locator('a').count() > 0;

                // 检查错误信息
                const errorMessages = await page.locator('.error, .alert-error, .el-message--error').allTextContents();

                // 截图
                const screenshotPath = path.join(screenshotDir,
                    `${String(i + 1).padStart(2, '0')}-${pageConfig.key}-${timestamp}.png`);
                await page.screenshot({
                    path: screenshotPath,
                    fullPage: true
                });

                // 记录结果
                const result = {
                    page: pageConfig.name,
                    path: pageConfig.path,
                    title: pageTitle,
                    url: currentUrl,
                    httpStatus: httpStatus,
                    isErrorPage: isErrorPage,
                    hasContent: hasContent,
                    layout: layoutElements,
                    contentChecks: contentChecks,
                    hasParentNav: hasParentNav,
                    hasInteractive: {
                        buttons: hasButtons,
                        forms: hasForms,
                        links: hasLinks
                    },
                    errorMessages: errorMessages,
                    screenshot: screenshotPath,
                    status: isErrorPage ? '错误页面' : (hasContent ? '正常' : '内容为空'),
                    timestamp: new Date().toISOString()
                };

                auditResults.push(result);

                // 输出检查结果
                if (isErrorPage) {
                    console.log(`❌ 错误页面`);
                } else if (hasContent) {
                    console.log(`✅ 页面正常加载`);
                    console.log(`   HTTP状态: ${httpStatus}`);
                    console.log(`   布局: 头部${layoutElements.header ? '✓' : '✗'} | 侧边栏${layoutElements.sidebar ? '✓' : '✗'} | 主内容${layoutElements.mainContent ? '✓' : '✗'} | 底部${layoutElements.footer ? '✓' : '✗'}`);
                    console.log(`   家长导航: ${hasParentNav ? '✓' : '✗'}`);
                    console.log(`   交互元素: 按钮${hasButtons ? '✓' : '✗'} | 表单${hasForms ? '✓' : '✗'} | 链接${hasLinks ? '✓' : '✗'}`);

                    // 内容检查结果
                    const passedChecks = Object.values(contentChecks).filter(Boolean).length;
                    const totalChecks = Object.keys(contentChecks).length;
                    console.log(`   内容完整性: ${passedChecks}/${totalChecks} 项检查通过`);
                } else {
                    console.log(`⚠️ 页面加载但内容为空`);
                }

                if (errorMessages.length > 0) {
                    console.log(`   🚨 错误信息: ${errorMessages.join(', ')}`);
                }

                console.log(`   截图: ${path.basename(screenshotPath)}`);

            } catch (error) {
                console.log(`💥 访问失败: ${error.message}`);

                const result = {
                    page: pageConfig.name,
                    path: pageConfig.path,
                    title: '访问失败',
                    url: page.url(),
                    httpStatus: 0,
                    isErrorPage: false,
                    hasContent: false,
                    layout: { header: false, sidebar: false, mainContent: false, footer: false },
                    contentChecks: {},
                    hasParentNav: false,
                    hasInteractive: { buttons: false, forms: false, links: false },
                    errorMessages: [],
                    error: error.message,
                    status: '访问失败',
                    timestamp: new Date().toISOString()
                };

                auditResults.push(result);
            }
        }

        // 3. 生成报告
        console.log('\n📋 生成综合检查报告...');

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
                pagesWithErrors: auditResults.filter(r => r.isErrorPage).length,
                pagesWithEmptyContent: auditResults.filter(r => r.status === '内容为空').length,
                pagesWithFailedAccess: auditResults.filter(r => r.status === '访问失败').length,
                pagesWithParentNav: auditResults.filter(r => r.hasParentNav).length,
                pagesWithCompleteLayout: auditResults.filter(r =>
                    r.layout.header && r.layout.mainContent && r.layout.sidebar
                ).length,
                pagesWithInteractiveElements: auditResults.filter(r =>
                    r.hasInteractive.buttons || r.hasInteractive.forms || r.hasInteractive.links
                ).length
            },
            pages: auditResults
        };

        // 保存报告
        const reportPath = path.join(screenshotDir, `家长中心综合检查报告-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownReport = generateComprehensiveReport(report);
        const markdownPath = path.join(screenshotDir, `家长中心综合检查报告-${timestamp}.md`);
        fs.writeFileSync(markdownPath, markdownReport, 'utf8');

        console.log(`\n✅ 综合检查完成！`);
        console.log(`📊 统计信息:`);
        console.log(`   总页面数: ${report.summary.totalPages}`);
        console.log(`   正常页面: ${report.summary.successfulPages}`);
        console.log(`   错误页面: ${report.summary.pagesWithErrors}`);
        console.log(`   内容为空: ${report.summary.pagesWithEmptyContent}`);
        console.log(`   访问失败: ${report.summary.pagesWithFailedAccess}`);
        console.log(`   包含导航: ${report.summary.pagesWithParentNav}/${report.summary.totalPages}`);
        console.log(`   完整布局: ${report.summary.pagesWithCompleteLayout}/${report.summary.totalPages}`);
        console.log(`   有交互元素: ${report.summary.pagesWithInteractiveElements}/${report.summary.totalPages}`);

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

// 生成综合报告
function generateComprehensiveReport(report) {
    const { auditInfo, summary, pages } = report;

    let markdown = `# 家长中心综合客户体验检查报告\n\n`;
    markdown += `## 检查信息\n`;
    markdown += `- **检查时间**: ${new Date(auditInfo.timestamp).toLocaleString('zh-CN')}\n`;
    markdown += `- **检查员**: ${auditInfo.auditor}\n`;
    markdown += `- **浏览器**: ${auditInfo.browser}\n`;
    markdown += `- **分辨率**: ${auditInfo.viewport}\n`;
    markdown += `- **基础URL**: ${auditInfo.baseUrl}\n\n`;

    markdown += `## 统计概览\n`;
    markdown += `- **总页面数**: ${summary.totalPages}\n`;
    markdown += `- **正常页面**: ${summary.successfulPages}\n`;
    markdown += `- **错误页面**: ${summary.pagesWithErrors}\n`;
    markdown += `- **内容为空**: ${summary.pagesWithEmptyContent}\n`;
    markdown += `- **访问失败**: ${summary.pagesWithFailedAccess}\n`;
    markdown += `- **包含家长导航**: ${summary.pagesWithParentNav}/${summary.totalPages}\n`;
    markdown += `- **完整布局**: ${summary.pagesWithCompleteLayout}/${summary.totalPages}\n`;
    markdown += `- **有交互元素**: ${summary.pagesWithInteractiveElements}/${summary.totalPages}\n\n`;

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
            '错误页面': '❌',
            '访问失败': '💥',
            '内容为空': '⚠️'
        };

        const emoji = statusEmojis[page.status] || '❓';
        markdown += `${emoji} ${page.status}\n\n`;

        markdown += `**技术信息**:\n`;
        markdown += `- HTTP状态: ${page.httpStatus}\n`;
        markdown += `- 页面标题: ${page.title}\n`;
        markdown += `- 最终URL: ${page.url}\n\n`;

        if (page.status === '正常') {
            markdown += `**布局分析**:\n`;
            markdown += `- 头部导航: ${page.layout.header ? '✅' : '❌'}\n`;
            markdown += `- 侧边栏: ${page.layout.sidebar ? '✅' : '❌'}\n`;
            markdown += `- 主内容区: ${page.layout.mainContent ? '✅' : '❌'}\n`;
            markdown += `- 底部: ${page.layout.footer ? '✅' : '❌'}\n\n`;

            markdown += `**功能分析**:\n`;
            markdown += `- 家长中心导航: ${page.hasParentNav ? '✅' : '❌'}\n`;
            markdown += `- 交互按钮: ${page.hasInteractive.buttons ? '✅' : '❌'}\n`;
            markdown += `- 表单元素: ${page.hasInteractive.forms ? '✅' : '❌'}\n`;
            markdown += `- 链接导航: ${page.hasInteractive.links ? '✅' : '❌'}\n\n`;

            if (Object.keys(page.contentChecks).length > 0) {
                markdown += `**内容完整性**:\n`;
                for (const [checkName, passed] of Object.entries(page.contentChecks)) {
                    markdown += `- ${checkName}: ${passed ? '✅' : '❌'}\n`;
                }
                markdown += `\n`;
            }
        }

        if (page.errorMessages.length > 0) {
            markdown += `**错误信息**:\n`;
            page.errorMessages.forEach(msg => {
                markdown += `- 🚨 ${msg}\n`;
            });
            markdown += `\n`;
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

    if (successRate >= 80) {
        markdown += `### 🎉 整体体验：优秀\n`;
        markdown += `家长中心页面整体功能完善，用户体验良好。\n\n`;
    } else if (successRate >= 60) {
        markdown += `### 👍 整体体验：良好\n`;
        markdown += `家长中心基本功能正常，部分页面需要优化。\n\n`;
    } else if (successRate >= 40) {
        markdown += `### ⚠️ 整体体验：一般\n`;
        markdown += `家长中心存在一些问题，需要针对性改进。\n\n`;
    } else {
        markdown += `### ❌ 整体体验：需要改进\n`;
        markdown += `家长中心存在较多问题，需要全面优化。\n\n`;
    }

    // 设计评估
    markdown += `### 🎨 设计评估\n`;

    const layoutCompleteness = summary.totalPages > 0 ?
        ((summary.pagesWithCompleteLayout / summary.totalPages) * 100).toFixed(1) : 0;
    markdown += `- **布局完整性**: ${layoutCompleteness}% (${summary.pagesWithCompleteLayout}/${summary.totalPages})\n`;

    const navigationConsistency = summary.totalPages > 0 ?
        ((summary.pagesWithParentNav / summary.totalPages) * 100).toFixed(1) : 0;
    markdown += `- **导航一致性**: ${navigationConsistency}% (${summary.pagesWithParentNav}/${summary.totalPages})\n`;

    const interactivity = summary.totalPages > 0 ?
        ((summary.pagesWithInteractiveElements / summary.totalPages) * 100).toFixed(1) : 0;
    markdown += `- **交互功能**: ${interactivity}% (${summary.pagesWithInteractiveElements}/${summary.totalPages})\n\n`;

    // 改进建议
    markdown += `## 改进建议\n\n`;

    markdown += `### 🚀 优先级改进建议\n\n`;

    if (summary.pagesWithFailedAccess > 0) {
        markdown += `#### 1. 修复访问问题 (高优先级)\n`;
        markdown += `${summary.pagesWithFailedAccess} 个页面无法访问，需要检查路由配置和权限设置。\n\n`;
    }

    if (summary.pagesWithErrors > 0) {
        markdown += `#### 2. 解决页面错误 (高优先级)\n`;
        markdown += `${summary.pagesWithErrors} 个页面存在错误，需要检查组件和数据处理逻辑。\n\n`;
    }

    if (summary.pagesWithEmptyContent > 0) {
        markdown += `#### 3. 完善页面内容 (中优先级)\n`;
        markdown += `${summary.pagesWithEmptyContent} 个页面内容为空，需要添加实际数据和功能。\n\n`;
    }

    if (parseInt(layoutCompleteness) < 80) {
        markdown += `#### 4. 统一页面布局 (中优先级)\n`;
        markdown += `页面布局一致性不足，建议统一设计规范和组件结构。\n\n`;
    }

    if (parseInt(navigationConsistency) < 80) {
        markdown += `#### 5. 完善导航系统 (中优先级)\n`;
        markdown += `家长中心导航缺失，需要在所有页面添加统一的导航元素。\n\n`;
    }

    markdown += `### 🎯 用户体验优化\n\n`;
    markdown += `1. **响应式设计**: 确保在不同设备上的良好显示效果\n`;
    markdown += `2. **加载性能**: 优化页面加载速度，添加加载状态指示\n`;
    markdown += `3. **错误处理**: 提供友好的错误提示和恢复机制\n`;
    markdown += `4. **交互反馈**: 增强按钮点击、表单提交等交互的视觉反馈\n`;
    markdown += `5. **可访问性**: 提升页面的无障碍访问能力\n\n`;

    markdown += `### 🛠️ 技术改进\n\n`;
    markdown += `1. **组件化**: 抽象通用组件，提高代码复用性\n`;
    markdown += `2. **状态管理**: 优化数据状态管理，确保数据一致性\n`;
    markdown += `3. **错误边界**: 添加错误边界，防止组件错误影响整个页面\n`;
    markdown += `4. **缓存策略**: 实现合理的数据缓存，提升用户体验\n`;
    markdown += `5. **测试覆盖**: 建立自动化测试，确保质量\n\n`;

    // 总结
    markdown += `## 总结\n\n`;

    if (successRate >= 80) {
        markdown += `家长中心表现${successRate >= 90 ? '优秀' : '良好'}，核心功能完善，用户体验较好。`;
    } else if (successRate >= 60) {
        markdown += `家长中心基本功能可用，但存在一些需要优化的问题，建议重点解决布局和内容问题。`;
    } else {
        markdown += `家长中心需要重点优化，当前成功率较低，建议优先解决访问和错误问题。`;
    }

    markdown += `建议按照上述优先级逐步改进，预计通过系统性优化可以显著提升用户体验。\n\n`;

    markdown += `---\n`;
    markdown += `*报告生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    markdown += `*检查工具: Playwright + AI Assistant*\n`;

    return markdown;
}

// 运行综合检查
comprehensiveParentCenterAudit()
    .then(() => {
        console.log('\n🎉 家长中心综合客户体验检查完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 综合检查失败:', error);
        process.exit(1);
    });