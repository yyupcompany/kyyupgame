const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verifyIconStyles() {
    console.log('开始验证 UnifiedIcon 组件样式修复...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        // 访问dashboard页面
        console.log('正在访问 http://localhost:5173/dashboard...');
        await page.goto('http://localhost:5173/dashboard', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // 等待页面加载
        await page.waitForTimeout(2000);

        // 检查是否需要登录
        const needLogin = await page.locator('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]').count() > 0;

        if (needLogin) {
            console.log('检测到需要登录，尝试快捷登录...');

            // 尝试admin快捷登录
            await page.locator('input[type="text"]').fill('admin');
            await page.locator('input[type="password"]').fill('admin123');

            const loginButton = page.locator('button:has-text("登录"), button[type="submit"], .el-button:has-text("登录")').first();
            if (await loginButton.isVisible()) {
                await loginButton.click();
                await page.waitForTimeout(3000);

                // 重新导航到dashboard
                await page.goto('http://localhost:5173/dashboard', {
                    waitUntil: 'networkidle'
                });
            }
        }

        // 等待页面完全加载
        await page.waitForTimeout(3000);

        console.log('页面加载完成，开始截图...');

        // 创建截图目录
        const screenshotDir = path.join(__dirname, 'docs', 'browser-checks');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(screenshotDir, `dashboard-icons-verification-${timestamp}.png`);

        // 截取整页
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        console.log(`✅ 截图已保存: ${screenshotPath}`);

        // 分析图标元素
        console.log('开始分析图标HTML结构...');

        // 查找所有图标元素
        const iconElements = await page.$$('[class*="icon"], [class*="Icon"], svg, i[class*="el-icon"], .unified-icon');

        console.log(`找到 ${iconElements.length} 个可能的图标元素`);

        let analysisResults = {
            totalIcons: iconElements.length,
            svgIcons: 0,
            outlineStyleIcons: 0,
            filledStyleIcons: 0,
            placeholderIcons: 0,
            iconDetails: []
        };

        // 检查每个图标元素
        for (let i = 0; i < Math.min(iconElements.length, 20); i++) {
            const element = iconElements[i];

            try {
                const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                const className = await element.evaluate(el => el.className);
                const outerHTML = await element.evaluate(el => el.outerHTML.substring(0, 200));

                let iconDetail = {
                    index: i,
                    tagName,
                    className,
                    isSVG: tagName === 'svg',
                    hasOutlineStyle: false,
                    hasFilledStyle: false,
                    isPlaceholder: false,
                    svgAttributes: {}
                };

                if (tagName === 'svg') {
                    analysisResults.svgIcons++;

                    // 检查SVG属性
                    const svgAttrs = await element.evaluate(el => {
                        const attrs = {};
                        for (let attr of el.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                        return attrs;
                    });

                    iconDetail.svgAttributes = svgAttrs;

                    // 检查是否为outline样式
                    if (svgAttrs.fill === 'none' && svgAttrs.stroke) {
                        iconDetail.hasOutlineStyle = true;
                        analysisResults.outlineStyleIcons++;
                    } else if (svgAttrs.fill && svgAttrs.fill !== 'none') {
                        iconDetail.hasFilledStyle = true;
                        analysisResults.filledStyleIcons++;
                    }

                    // 检查子元素的path
                    const childElements = await element.$$('path, circle, rect, line, polyline');
                    for (let child of childElements) {
                        const childAttrs = await child.evaluate(el => {
                            const attrs = {};
                            for (let attr of el.attributes) {
                                attrs[attr.name] = attr.value;
                            }
                            return attrs;
                        });

                        if (childAttrs.fill === 'none' && childAttrs.stroke) {
                            iconDetail.hasOutlineStyle = true;
                        }
                    }
                }

                // 检查是否为占位符（三个杠）
                if (outerHTML.includes('|||') || outerHTML.includes('---') || className.includes('placeholder')) {
                    iconDetail.isPlaceholder = true;
                    analysisResults.placeholderIcons++;
                }

                // 检查文本内容是否为占位符
                const textContent = await element.evaluate(el => el.textContent || '');
                if (textContent.includes('|||') || textContent.includes('---') || textContent.trim() === '…') {
                    iconDetail.isPlaceholder = true;
                }

                iconDetail.outerHTML = outerHTML;
                analysisResults.iconDetails.push(iconDetail);

            } catch (error) {
                console.warn(`分析图标 ${i} 时出错:`, error.message);
            }
        }

        // 查找UnifiedIcon组件
        const unifiedIcons = await page.$$('[class*="UnifiedIcon"], [data-component*="UnifiedIcon"], .unified-icon');
        console.log(`找到 ${unifiedIcons.length} 个UnifiedIcon组件`);

        // 检查控制台错误
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push({
                    text: msg.text(),
                    location: msg.location()
                });
            }
        });

        // 等待一下收集控制台错误
        await page.waitForTimeout(2000);

        // 生成报告
        const report = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:5173/dashboard',
            screenshot: screenshotPath,
            analysis: analysisResults,
            unifiedIconCount: unifiedIcons.length,
            consoleErrors: consoleErrors,
            summary: {
               修复状态: analysisResults.outlineStyleIcons > analysisResults.filledStyleIcons ? '✅ 修复成功' : '⚠️ 需要检查',
                图标总数: analysisResults.totalIcons,
                SVG图标数: analysisResults.svgIcons,
                空心图标数: analysisResults.outlineStyleIcons,
                实心图标数: analysisResults.filledStyleIcons,
                占位符图标数: analysisResults.placeholderIcons,
                控制台错误数: consoleErrors.length
            }
        };

        // 保存详细报告
        const reportPath = path.join(screenshotDir, `icon-style-analysis-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n📊 图标样式分析报告:');
        console.log('='.repeat(50));
        console.log(`✅ 修复状态: ${report.summary.修复状态}`);
        console.log(`🔢 图标总数: ${report.summary.图标总数}`);
        console.log(`🎨 SVG图标数: ${report.summary.SVG图标数}`);
        console.log(`⭕ 空心图标数: ${report.summary.空心图标数}`);
        console.log(`⚫ 实心图标数: ${report.summary.实心图标数}`);
        console.log(`❓ 占位符图标数: ${report.summary.占位符图标数}`);
        console.log(`🐛 控制台错误数: ${report.summary.控制台错误数}`);
        console.log(`📸 截图路径: ${screenshotPath}`);
        console.log(`📄 详细报告: ${reportPath}`);

        if (consoleErrors.length > 0) {
            console.log('\n⚠️ 控制台错误:');
            consoleErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.text}`);
            });
        }

        // 生成Markdown报告
        const markdownReport = generateMarkdownReport(report);
        const markdownPath = path.join(screenshotDir, `icon-style-verification-${timestamp}.md`);
        fs.writeFileSync(markdownPath, markdownReport);

        console.log(`\n📝 Markdown报告: ${markdownPath}`);

        return report;

    } catch (error) {
        console.error('❌ 验证过程中出错:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function generateMarkdownReport(report) {
    return `# UnifiedIcon 图标样式验证报告

## 📋 验证信息

- **时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}
- **URL**: ${report.url}
- **截图**: [查看截图](${path.basename(report.screenshot)})

## 📊 分析结果

| 指标 | 数量 | 状态 |
|------|------|------|
| 图标总数 | ${report.analysis.totalIcons} | - |
| SVG图标数 | ${report.analysis.svgIcons} | - |
| 空心图标数 | ${report.analysis.outlineStyleIcons} | ✅ 期望样式 |
| 实心图标数 | ${report.analysis.filledStyleIcons} | ⚠️ 需要修复 |
| 占位符图标数 | ${report.analysis.placeholderIcons} | ❌ 需要修复 |
| UnifiedIcon组件数 | ${report.unifiedIconCount} | - |
| 控制台错误数 | ${report.consoleErrors.length} | ${report.consoleErrors.length === 0 ? '✅ 无错误' : '⚠️ 有错误'} |

## 🎯 修复状态

**总体状态**: ${report.summary.修复状态}

${report.analysis.outlineStyleIcons > report.analysis.filledStyleIcons ?
'✅ **修复成功**: 大部分图标已显示为空心轮廓样式' :
'⚠️ **需要检查**: 仍有较多实心图标或占位符'}

## 📸 截图分析

![Dashboard截图](${path.basename(report.screenshot)})

## 🔍 详细图标分析

${report.analysis.iconDetails.map((icon, index) => `
### 图标 ${index + 1}

- **标签**: \`${icon.tagName}\`
- **类名**: \`${icon.className}\`
- **SVG**: ${icon.isSVG ? '是' : '否'}
- **空心样式**: ${icon.hasOutlineStyle ? '✅' : '❌'}
- **实心样式**: ${icon.hasFilledStyle ? '⚠️' : '✅'}
- **占位符**: ${icon.isPlaceholder ? '❌' : '✅'}

\`\`\`html
${icon.outerHTML}
\`\`\`
`).join('\n')}

${report.consoleErrors.length > 0 ? `
## ⚠️ 控制台错误

${report.consoleErrors.map((error, index) => `
${index + 1}. **${error.text}**
   - 位置: ${error.location.url}:${error.location.lineNumber}
`).join('\n')}
` : ''}

## 📝 结论

${report.analysis.outlineStyleIcons > report.analysis.filledStyleIcons * 2 ?
'✅ **验证通过**: UnifiedIcon组件已成功修复，图标显示为空心轮廓样式' :
'⚠️ **需要进一步修复**: 图标样式修复不完整，建议检查UnifiedIcon组件实现'}

---

*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;
}

// 运行验证
if (require.main === module) {
    verifyIconStyles()
        .then(() => {
            console.log('\n✅ 图标样式验证完成');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ 验证失败:', error);
            process.exit(1);
        });
}

module.exports = { verifyIconStyles };