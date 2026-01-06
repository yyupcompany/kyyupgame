const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建截图保存目录
const screenshotDir = path.join(__dirname, 'parent-center-fix-verification');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('🔍 验证家长中心权限修复效果');
console.log('📅 验证时间:', new Date().toLocaleString('zh-CN'));
console.log('');

async function verifyParentCenterFix() {
    const browser = await chromium.launch({
        headless: false,
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

        // 2. 验证家长中心页面访问
        const parentCenterPages = [
            { name: '家长中心工作台', path: '/parent-center/dashboard' },
            { name: '孩子管理', path: '/parent-center/children' },
            { name: '招生活动', path: '/parent-center/activities' },
            { name: '成长评估', path: '/parent-center/assessment' },
            { name: '家校沟通', path: '/parent-center/smart-communication' }
        ];

        const results = [];

        console.log('\n2️⃣ 验证家长中心页面访问权限...');

        for (let i = 0; i < parentCenterPages.length; i++) {
            const pageConfig = parentCenterPages[i];
            console.log(`\n2.${i + 1} 验证 ${pageConfig.name} (${pageConfig.path})`);

            try {
                // 访问页面
                const response = await page.goto(`http://localhost:5173${pageConfig.path}`, {
                    waitUntil: 'networkidle',
                    timeout: 10000
                });

                await page.waitForTimeout(2000);

                // 检查结果
                const currentUrl = page.url();
                const pageTitle = await page.title();
                const httpStatus = response?.status() || 0;

                // 检查是否是403页面
                const is403Page = currentUrl.includes('/403');

                // 检查是否有页面内容
                const hasContent = await page.locator('body').textContent() > 200;

                // 检查是否有错误信息
                const hasError = await page.locator('text=/错误|error|403|权限/i').isVisible();

                // 截图
                const screenshotPath = path.join(screenshotDir,
                    `${String(i + 1).padStart(2, '0')}-${pageConfig.name.replace(/[^\w\u4e00-\u9fa5]/g, '-')}-${timestamp}.png`);
                await page.screenshot({
                    path: screenshotPath,
                    fullPage: true
                });

                const result = {
                    page: pageConfig.name,
                    path: pageConfig.path,
                    title: pageTitle,
                    url: currentUrl,
                    httpStatus: httpStatus,
                    is403: is403Page,
                    hasContent: hasContent,
                    hasError: hasError,
                    success: !is403Page && hasContent && !hasError,
                    screenshot: screenshotPath
                };

                results.push(result);

                // 输出验证结果
                if (result.success) {
                    console.log(`✅ 访问成功`);
                    console.log(`   HTTP状态: ${httpStatus}`);
                    console.log(`   页面标题: ${pageTitle}`);
                    console.log(`   内容加载: ${hasContent ? '✅' : '❌'}`);
                } else {
                    console.log(`❌ 访问失败`);
                    if (is403Page) {
                        console.log(`   原因: 仍然被重定向到403页面`);
                    } else if (!hasContent) {
                        console.log(`   原因: 页面内容为空`);
                    } else if (hasError) {
                        console.log(`   原因: 页面存在错误`);
                    }
                }

                console.log(`   截图: ${path.basename(screenshotPath)}`);

            } catch (error) {
                console.log(`💥 访问失败: ${error.message}`);

                results.push({
                    page: pageConfig.name,
                    path: pageConfig.path,
                    title: '访问失败',
                    url: page.url(),
                    httpStatus: 0,
                    is403: false,
                    hasContent: false,
                    hasError: true,
                    success: false,
                    error: error.message
                });
            }
        }

        // 3. 生成验证报告
        console.log('\n📋 生成验证报告...');

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        const report = {
            verificationInfo: {
                timestamp: new Date().toISOString(),
                browser: 'Chromium',
                viewport: '1920x1080',
                baseUrl: 'http://localhost:5173'
            },
            summary: {
                totalPages: results.length,
                successfulPages: successCount,
                failedPages: failCount,
                successRate: ((successCount / results.length) * 100).toFixed(1)
            },
            results: results
        };

        // 保存验证报告
        const reportPath = path.join(screenshotDir, `权限修复验证报告-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownReport = generateVerificationReport(report);
        const markdownPath = path.join(screenshotDir, `权限修复验证报告-${timestamp}.md`);
        fs.writeFileSync(markdownPath, markdownReport, 'utf8');

        console.log(`\n✅ 验证完成！`);
        console.log(`📊 验证结果:`);
        console.log(`   总页面数: ${report.summary.totalPages}`);
        console.log(`   成功访问: ${report.summary.successfulPages}`);
        console.log(`   访问失败: ${report.summary.failedPages}`);
        console.log(`   成功率: ${report.summary.successRate}%`);

        if (successCount === results.length) {
            console.log(`\n🎉 权限修复成功！所有家长中心页面都可以正常访问了。`);
        } else if (successCount > 0) {
            console.log(`\n👍 权限修复部分成功，${successCount}个页面可以访问，${failCount}个页面仍有问题。`);
        } else {
            console.log(`\n❌ 权限修复失败，所有页面仍然无法访问。`);
        }

        console.log(`\n📄 报告文件:`);
        console.log(`   JSON报告: ${reportPath}`);
        console.log(`   Markdown报告: ${markdownPath}`);
        console.log(`   截图目录: ${screenshotDir}`);

        return report;

    } catch (error) {
        console.error('❌ 验证过程中发生错误:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// 生成验证报告
function generateVerificationReport(report) {
    const { verificationInfo, summary, results } = report;

    let markdown = `# 家长中心权限修复验证报告\n\n`;
    markdown += `## 验证信息\n`;
    markdown += `- **验证时间**: ${new Date(verificationInfo.timestamp).toLocaleString('zh-CN')}\n`;
    markdown += `- **浏览器**: ${verificationInfo.browser}\n`;
    markdown += `- **分辨率**: ${verificationInfo.viewport}\n`;
    markdown += `- **基础URL**: ${verificationInfo.baseUrl}\n\n`;

    markdown += `## 验证结果概览\n`;
    markdown += `- **总页面数**: ${summary.totalPages}\n`;
    markdown += `- **成功访问**: ${summary.successfulPages}\n`;
    markdown += `- **访问失败**: ${summary.failedPages}\n`;
    markdown += `- **成功率**: ${summary.successRate}%\n\n`;

    // 结果分析
    if (summary.successRate === '100.0') {
        markdown += `### 🎉 验证结果：完全成功\n`;
        markdown += `权限修复成功！所有家长中心页面都可以正常访问。\n\n`;
    } else if (parseFloat(summary.successRate) >= 80) {
        markdown += `### 👍 验证结果：基本成功\n`;
        markdown += `权限修复基本成功，大部分页面可以正常访问，少数页面可能需要进一步检查。\n\n`;
    } else if (parseFloat(summary.successRate) >= 50) {
        markdown += `### ⚠️ 验证结果：部分成功\n`;
        markdown += `权限修复部分成功，约一半页面可以访问，还需要进一步排查问题。\n\n`;
    } else {
        markdown += `### ❌ 验证结果：需要进一步修复\n`;
        markdown += `权限修复效果不佳，大部分页面仍然无法访问，需要重新检查修复方案。\n\n`;
    }

    // 详细结果
    markdown += `## 详细验证结果\n\n`;

    results.forEach((result, index) => {
        markdown += `### ${index + 1}. ${result.page}\n\n`;
        markdown += `**路径**: \`${result.path}\`\n\n`;
        markdown += `**验证结果**: `;

        if (result.success) {
            markdown += `✅ 成功\n\n`;
        } else {
            markdown += `❌ 失败\n\n`;
        }

        markdown += `**技术信息**:\n`;
        markdown += `- HTTP状态: ${result.httpStatus}\n`;
        markdown += `- 页面标题: ${result.title}\n`;
        markdown += `- 最终URL: ${result.url}\n`;
        markdown += `- 是否403: ${result.is403 ? '是' : '否'}\n`;
        markdown += `- 有内容: ${result.hasContent ? '是' : '否'}\n`;
        markdown += `- 有错误: ${result.hasError ? '是' : '否'}\n\n`;

        if (result.error) {
            markdown += `**错误信息**: \`${result.error}\`\n\n`;
        }

        if (result.screenshot) {
            markdown += `**截图**: [查看截图](${path.basename(result.screenshot)})\n\n`;
        }

        markdown += `---\n\n`;
    });

    // 问题分析
    if (summary.failedPages > 0) {
        markdown += `## 问题分析\n\n`;

        const still403Pages = results.filter(r => r.is403);
        const emptyContentPages = results.filter(r => !r.hasContent && !r.is403);
        const errorPages = results.filter(r => r.hasError && !r.is403);

        if (still403Pages.length > 0) {
            markdown += `### 仍然出现403错误的页面\n`;
            still403Pages.forEach(page => {
                markdown += `- ${page.page} (${page.path})\n`;
            });
            markdown += `\n**可能原因**: 权限验证逻辑未完全更新，可能存在其他权限检查点。\n\n`;
        }

        if (emptyContentPages.length > 0) {
            markdown += `### 内容为空的页面\n`;
            emptyContentPages.forEach(page => {
                markdown += `- ${page.page} (${page.path})\n`;
            });
            markdown += `\n**可能原因**: 页面组件加载失败或数据获取问题。\n\n`;
        }

        if (errorPages.length > 0) {
            markdown += `### 存在其他错误的页面\n`;
            errorPages.forEach(page => {
                markdown += `- ${page.page} (${page.path}): ${page.error || '未知错误'}\n`;
            });
            markdown += `\n**可能原因**: 组件错误或网络问题。\n\n`;
        }
    }

    // 后续建议
    markdown += `## 后续建议\n\n`;

    if (summary.successRate === '100.0') {
        markdown += `### 🚀 验证通过后的建议\n\n`;
        markdown += `1. **功能测试**: 对每个页面进行详细的功能测试\n`;
        markdown += `2. **用户体验**: 评估页面设计和交互体验\n`;
        markdown += `3. **性能优化**: 检查页面加载性能\n`;
        markdown += `4. **移动端测试**: 验证移动端适配效果\n\n`;
    } else {
        markdown += `### 🔧 进一步修复建议\n\n`;
        markdown += `1. **权限检查**: 检查是否有其他权限验证中间件\n`;
        markdown += `2. **缓存清理**: 清除浏览器缓存和构建缓存\n`;
        markdown += `3. **组件检查**: 验证页面组件是否正确导入\n`;
        markdown += `4. **路由重载**: 确认路由配置已重新加载\n\n`;
    }

    markdown += `### 🧪 测试建议\n\n`;
    markdown += `1. **多角色测试**: 使用不同角色账号进行测试\n`;
    markdown += `2. **边界测试**: 测试各种边界情况和异常状态\n`;
    markdown += `3. **集成测试**: 建立自动化测试覆盖\n`;
    markdown += `4. **用户验收**: 邀请实际用户进行验收测试\n\n`;

    markdown += `---\n`;
    markdown += `*报告生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    markdown += `*验证工具: Playwright + AI Assistant*\n`;

    return markdown;
}

// 运行验证
verifyParentCenterFix()
    .then(() => {
        console.log('\n🎉 家长中心权限修复验证完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 验证失败:', error);
        process.exit(1);
    });