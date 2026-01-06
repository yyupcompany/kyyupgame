const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建输出目录
const outputDir = path.join(__dirname, 'parent-center-detailed-analysis');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🚀 开始家长中心详细用户体验分析...');
console.log('📱 前端地址: http://localhost:5173');
console.log('🔧 后端API: http://localhost:3000');

// 家长中心页面配置（基于static-menu.ts）
const parentCenterPages = [
    {
        name: '家长中心工作台',
        path: '/parent-center/dashboard',
        description: '家长主控制台，显示概览信息'
    },
    {
        name: '孩子管理',
        path: '/parent-center/children',
        description: '管理孩子的个人信息和档案'
    },
    {
        name: '招生活动',
        path: '/parent-center/activities',
        description: '查看和报名各类招生活动'
    },
    {
        name: '成长评估',
        path: '/parent-center/assessment',
        description: '查看孩子的成长评估报告'
    },
    {
        name: '家校沟通',
        path: '/parent-center/communication',
        description: '与教师进行沟通互动'
    },
    {
        name: 'AI智能助手',
        path: '/ai/assistant',
        description: 'AI育儿助手和智能咨询'
    },
    {
        name: 'AI智能查询',
        path: '/ai/query-interface',
        description: '智能查询功能和数据分析'
    }
];

(async () => {
    const browser = await chromium.launch({
        headless: true, // 强制无头模式
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    try {
        // 1. 访问登录页面
        console.log('\n📍 步骤1: 访问登录页面');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // 截屏登录页面
        await page.screenshot({ path: path.join(outputDir, '01-login-page.png'), fullPage: true });
        console.log('✅ 登录页面截图保存');

        // 2. 执行快速体验登录
        console.log('\n📍 步骤2: 执行快速体验登录');
        try {
            // 查找快速体验登录按钮
            const quickLoginButton = await page.locator('text=/快速体验/i').first();
            if (await quickLoginButton.isVisible()) {
                await quickLoginButton.click();
                console.log('✅ 点击快速体验登录按钮');
                await page.waitForTimeout(2000);
            }

            // 选择家长角色
            console.log('\n📍 步骤3: 选择家长角色');
            const parentRoleButton = await page.locator('text=/家长/i').first();
            if (await parentRoleButton.isVisible()) {
                await parentRoleButton.click();
                console.log('✅ 选择家长角色');
                await page.waitForTimeout(3000);
            }

            // 等待系统加载
            console.log('\n📍 步骤4: 等待系统加载完成');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);

            // 检查是否成功登录并导航到家长中心
            const currentUrl = page.url();
            console.log(`📋 当前URL: ${currentUrl}`);

            // 如果还在登录页面，尝试直接访问家长中心
            if (currentUrl.includes('/login')) {
                console.log('🔄 仍在登录页面，尝试直接访问家长中心...');
                await page.goto('http://localhost:5173/parent-center/dashboard', { waitUntil: 'networkidle' });
                await page.waitForTimeout(3000);
            }

            // 截屏主页面
            await page.screenshot({ path: path.join(outputDir, '02-main-dashboard.png'), fullPage: true });
            console.log('✅ 主页面截图保存');

            // 5. 分析家长中心页面
            console.log('\n📍 步骤5: 逐一分析家长中心页面');
            const analysisResults = [];

            for (let i = 0; i < parentCenterPages.length; i++) {
                const pageInfo = parentCenterPages[i];
                console.log(`\n📄 分析页面: ${pageInfo.name}`);
                console.log(`🔗 路径: ${pageInfo.path}`);

                try {
                    // 访问页面
                    await page.goto(`http://localhost:5173${pageInfo.path}`, { waitUntil: 'networkidle' });
                    await page.waitForTimeout(3000);

                    // 截屏
                    const screenshotFile = `03-${String(i + 1).padStart(2, '0')}-${pageInfo.name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')}.png`;
                    const screenshotPath = path.join(outputDir, screenshotFile);
                    await page.screenshot({ path: screenshotPath, fullPage: true });
                    console.log(`✅ 页面截图保存: ${screenshotFile}`);

                    // 页面分析
                    const analysis = await analyzePage(page, pageInfo);
                    analysisResults.push(analysis);

                    // 移动端响应式测试
                    await page.setViewportSize({ width: 375, height: 667 });
                    await page.waitForTimeout(1000);

                    const mobileScreenshotFile = `mobile-${String(i + 1).padStart(2, '0')}-${pageInfo.name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')}.png`;
                    const mobileScreenshotPath = path.join(outputDir, mobileScreenshotFile);
                    await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
                    console.log(`📱 移动端截图保存: ${mobileScreenshotFile}`);

                    // 恢复桌面端视口
                    await page.setViewportSize({ width: 1920, height: 1080 });

                } catch (error) {
                    console.log(`❌ 页面访问失败: ${pageInfo.name} - ${error.message}`);

                    analysisResults.push({
                        page: pageInfo.name,
                        path: pageInfo.path,
                        status: 'error',
                        error: error.message,
                        analysis: {
                           美观度: { score: 0, issues: ['页面无法访问'] },
                           布局: { score: 0, issues: ['页面无法访问'] },
                           操作便利性: { score: 0, issues: ['页面无法访问'] },
                           功能完整性: { score: 0, issues: ['页面无法访问'] },
                           移动端适配: { score: 0, issues: ['页面无法访问'] }
                        }
                    });
                }
            }

            // 6. 保存分析结果
            console.log('\n📍 步骤6: 保存详细分析结果');
            const reportData = {
                timestamp: new Date().toISOString(),
                systemInfo: {
                    url: page.url(),
                    title: await page.title(),
                    userAgent: await page.evaluate(() => navigator.userAgent)
                },
                pages: analysisResults,
                summary: generateSummary(analysisResults)
            };

            fs.writeFileSync(
                path.join(outputDir, 'analysis-report.json'),
                JSON.stringify(reportData, null, 2)
            );

            // 7. 生成HTML报告
            generateHTMLReport(reportData, outputDir);

            console.log('\n🎉 家长中心详细分析完成！');
            console.log(`📁 分析结果保存在: ${outputDir}`);
            console.log('📊 生成的文件:');
            console.log('- analysis-report.json: 详细分析数据');
            console.log('- analysis-report.html: 可视化分析报告');
            console.log('- 03-XX.png: 各页面截图');
            console.log('- mobile-XX.png: 移动端截图');

        } catch (error) {
            console.error('❌ 分析过程中出现错误:', error.message);
        }

    } catch (error) {
        console.error('❌ 系统访问错误:', error.message);
    } finally {
        await browser.close();
    }
})();

// 页面分析函数
async function analyzePage(page, pageInfo) {
    const analysis = {
        page: pageInfo.name,
        path: pageInfo.path,
        status: 'success',
        timestamp: new Date().toISOString(),
        analysis: {
            美观度: { score: 0, issues: [], strengths: [] },
            布局: { score: 0, issues: [], strengths: [] },
            操作便利性: { score: 0, issues: [], strengths: [] },
            功能完整性: { score: 0, issues: [], strengths: [] },
            移动端适配: { score: 0, issues: [], strengths: [] }
        }
    };

    try {
        // 检查页面标题
        const title = await page.title();
        if (title && title.length > 0) {
            analysis.analysis.美观度.strengths.push('页面标题完整');
        } else {
            analysis.analysis.美观度.issues.push('缺少页面标题');
        }

        // 检查是否有错误信息
        const errorElements = await page.locator('.error, .alert-danger, [class*="error"]').count();
        if (errorElements > 0) {
            analysis.analysis.功能完整性.issues.push('页面显示错误信息');
        }

        // 检查是否有加载状态
        const loadingElements = await page.locator('.loading, [class*="loading"]').count();
        if (loadingElements > 0) {
            analysis.analysis.功能完整性.strengths.push('页面有加载状态');
        }

        // 检查是否有内容区域
        const contentElements = await page.locator('main, .content, [class*="content"]').count();
        if (contentElements > 0) {
            analysis.analysis.布局.strengths.push('页面有明确的内容区域');
        } else {
            analysis.analysis.布局.issues.push('缺少内容区域');
        }

        // 检查导航结构
        const navElements = await page.locator('nav, .nav, [class*="nav"]').count();
        if (navElements > 0) {
            analysis.analysis.操作便利性.strengths.push('页面有导航结构');
        }

        // 检查表单元素
        const formElements = await page.locator('input, select, textarea, button').count();
        if (formElements > 0) {
            analysis.analysis.操作便利性.strengths.push('页面包含交互元素');
        }

        // 检查响应式设计
        const responsiveMeta = await page.locator('meta[name="viewport"]').count();
        if (responsiveMeta > 0) {
            analysis.analysis.移动端适配.strengths.push('包含移动端适配配置');
        } else {
            analysis.analysis.移动端适配.issues.push('缺少移动端适配配置');
        }

        // 计算分数（简单评分算法）
        let totalScore = 0;
        let maxScore = 0;

        for (const category in analysis.analysis) {
            const strengths = analysis.analysis[category].strengths.length;
            const issues = analysis.analysis[category].issues.length;

            const score = Math.max(0, Math.min(10, 5 + strengths - issues));
            analysis.analysis[category].score = score;

            totalScore += score;
            maxScore += 10;
        }

        analysis.overallScore = Math.round((totalScore / maxScore) * 100);

    } catch (error) {
        analysis.status = 'error';
        analysis.error = error.message;
        console.log(`⚠️ 页面分析出错: ${error.message}`);
    }

    return analysis;
}

// 生成分析摘要
function generateSummary(analysisResults) {
    const summary = {
        totalPages: analysisResults.length,
        successfulPages: analysisResults.filter(r => r.status === 'success').length,
        errorPages: analysisResults.filter(r => r.status === 'error').length,
        averageScore: 0,
        categoryAverages: {
            美观度: 0,
            布局: 0,
            操作便利性: 0,
            功能完整性: 0,
            移动端适配: 0
        },
        topIssues: [],
        recommendations: []
    };

    const successfulResults = analysisResults.filter(r => r.status === 'success');

    if (successfulResults.length > 0) {
        // 计算平均分
        const totalScore = successfulResults.reduce((sum, r) => sum + (r.overallScore || 0), 0);
        summary.averageScore = Math.round(totalScore / successfulResults.length);

        // 计算各类别平均分
        for (const category in summary.categoryAverages) {
            const categoryTotal = successfulResults.reduce((sum, r) => {
                return sum + (r.analysis[category]?.score || 0);
            }, 0);
            summary.categoryAverages[category] = Math.round(categoryTotal / successfulResults.length);
        }

        // 收集所有问题
        const allIssues = [];
        successfulResults.forEach(result => {
            Object.values(result.analysis).forEach(category => {
                if (category.issues && category.issues.length > 0) {
                    allIssues.push(...category.issues);
                }
            });
        });

        // 统计问题频率
        const issueFrequency = {};
        allIssues.forEach(issue => {
            issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
        });

        summary.topIssues = Object.entries(issueFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([issue, count]) => ({ issue, count }));

        // 生成改进建议
        if (summary.categoryAverages.移动端适配 < 7) {
            summary.recommendations.push('优化移动端响应式设计，提升移动用户体验');
        }
        if (summary.categoryAverages.功能完整性 < 7) {
            summary.recommendations.push('完善页面功能实现，修复显示错误');
        }
        if (summary.categoryAverages.操作便利性 < 7) {
            summary.recommendations.push('改善用户交互设计，提升操作便利性');
        }
    }

    return summary;
}

// 生成HTML报告
function generateHTMLReport(reportData, outputDir) {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>家长中心用户体验分析报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        h2 { color: #555; border-bottom: 2px solid #409EFF; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #409EFF; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #333; }
        .page-analysis { margin-bottom: 30px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
        .page-header { background: #409EFF; color: white; padding: 15px 20px; font-weight: bold; }
        .page-content { padding: 20px; }
        .scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .score-card { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .score-value { font-size: 1.5em; font-weight: bold; margin-bottom: 5px; }
        .score-label { font-size: 0.9em; color: #666; }
        .high-score { color: #67C23A; }
        .medium-score { color: #E6A23C; }
        .low-score { color: #F56C6C; }
        .issues { background: #FEF0F0; border-left: 4px solid #F56C6C; padding: 15px; margin: 10px 0; }
        .strengths { background: #F0F9FF; border-left: 4px solid #409EFF; padding: 15px; margin: 10px 0; }
        .recommendations { background: #FDF6EC; border-left: 4px solid #E6A23C; padding: 15px; margin: 20px 0; }
        .timestamp { text-align: center; color: #666; margin-top: 30px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 家长中心用户体验分析报告</h1>

        <div class="summary">
            <div class="summary-card">
                <h3>总页面数</h3>
                <div class="value">${reportData.summary.totalPages}</div>
            </div>
            <div class="summary-card">
                <h3>成功访问</h3>
                <div class="value">${reportData.summary.successfulPages}</div>
            </div>
            <div class="summary-card">
                <h3>访问失败</h3>
                <div class="value">${reportData.summary.errorPages}</div>
            </div>
            <div class="summary-card">
                <h3>平均得分</h3>
                <div class="value">${reportData.summary.averageScore}%</div>
            </div>
        </div>

        <h2>📊 各类别平均得分</h2>
        <div class="scores">
            ${Object.entries(reportData.summary.categoryAverages).map(([category, score]) => `
                <div class="score-card">
                    <div class="score-value ${score >= 7 ? 'high-score' : score >= 5 ? 'medium-score' : 'low-score'}">${score}/10</div>
                    <div class="score-label">${category}</div>
                </div>
            `).join('')}
        </div>

        ${reportData.summary.topIssues.length > 0 ? `
        <h2>⚠️ 主要问题</h2>
        ${reportData.summary.topIssues.map(issue => `
            <div class="issues">
                <strong>${issue.issue}</strong> (出现 ${issue.count} 次)
            </div>
        `).join('')}
        ` : ''}

        ${reportData.summary.recommendations.length > 0 ? `
        <h2>💡 改进建议</h2>
        <div class="recommendations">
            ${reportData.summary.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
        </div>
        ` : ''}

        <h2>📄 页面详细分析</h2>
        ${reportData.pages.map(page => `
            <div class="page-analysis">
                <div class="page-header">
                    ${page.page} ${page.status === 'error' ? '(❌ 访问失败)' : `(✅ 得分: ${page.overallScore || 0}%)`}
                </div>
                <div class="page-content">
                    ${page.status === 'error' ? `
                        <div class="issues">
                            错误信息: ${page.error}
                        </div>
                    ` : `
                        <div class="scores">
                            ${Object.entries(page.analysis).map(([category, analysis]) => `
                                <div class="score-card">
                                    <div class="score-value ${analysis.score >= 7 ? 'high-score' : analysis.score >= 5 ? 'medium-score' : 'low-score'}">${analysis.score}/10</div>
                                    <div class="score-label">${category}</div>
                                </div>
                            `).join('')}
                        </div>

                        ${Object.entries(page.analysis).map(([category, analysis]) => {
                            if (analysis.issues && analysis.issues.length > 0) {
                                return `
                                    <div class="issues">
                                        <strong>${category} 问题:</strong>
                                        <ul>${analysis.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                                    </div>
                                `;
                            }
                            return '';
                        }).join('')}

                        ${Object.entries(page.analysis).map(([category, analysis]) => {
                            if (analysis.strengths && analysis.strengths.length > 0) {
                                return `
                                    <div class="strengths">
                                        <strong>${category} 优势:</strong>
                                        <ul>${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}</ul>
                                    </div>
                                `;
                            }
                            return '';
                        }).join('')}
                    `}
                </div>
            </div>
        `).join('')}

        <div class="timestamp">
            报告生成时间: ${new Date(reportData.timestamp).toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(outputDir, 'analysis-report.html'), html);
    console.log('✅ HTML报告生成完成');
}