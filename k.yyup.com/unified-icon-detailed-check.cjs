const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function detailedUnifiedIconCheck() {
    console.log('🔍 开始详细的UnifiedIcon组件检查...');

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
        console.log('📍 正在访问 http://localhost:5173/dashboard...');
        await page.goto('http://localhost:5173/dashboard', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // 检查是否需要登录
        const needLogin = await page.locator('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]').count() > 0;

        if (needLogin) {
            console.log('🔐 需要登录，尝试admin快捷登录...');
            await page.locator('input[type="text"]').fill('admin');
            await page.locator('input[type="password"]').fill('admin123');

            const loginButton = page.locator('button:has-text("登录"), button[type="submit"], .el-button:has-text("登录")').first();
            if (await loginButton.isVisible()) {
                await loginButton.click();
                await page.waitForTimeout(3000);
                await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
            }
        }

        await page.waitForTimeout(3000);

        // 获取页面源码
        const pageContent = await page.content();

        // 创建详细的检查报告
        const report = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:5173/dashboard',
            unifiedIconAnalysis: {
                inHTML: pageContent.includes('UnifiedIcon') || pageContent.includes('unified-icon'),
                exactMatches: (pageContent.match(/UnifiedIcon/g) || []).length,
                unifiedIconClasses: (pageContent.match(/unified-icon/g) || []).length
            },
            iconAnalysis: {
                totalSVGs: (pageContent.match(/<svg/g) || []).length,
                outlineSVGs: (pageContent.match(/fill="none"/g) || []).length,
                strokeSVGs: (pageContent.match(/stroke="currentColor"/g) || []).length,
                strokeLinecap: (pageContent.match(/stroke-linecap="round"/g) || []).length,
                strokeLinejoin: (pageContent.match(/stroke-linejoin="round"/g) || []).length
            },
            sidebarIcons: [],
            headerIcons: [],
            cardIcons: []
        };

        // 检查侧边栏图标
        console.log('🔍 检查侧边栏图标...');
        const sidebarIcons = await page.locator('.sidebar .icon, .sidebar svg, .sidebar [class*="icon"]').all();
        for (let i = 0; i < Math.min(sidebarIcons.length, 10); i++) {
            const icon = sidebarIcons[i];
            try {
                const isVisible = await icon.isVisible();
                const textContent = await icon.textContent();
                const className = await icon.getAttribute('class');

                report.sidebarIcons.push({
                    index: i,
                    isVisible,
                    textContent: textContent || '',
                    className: className || '',
                    isPlaceholder: textContent && (textContent.includes('|||') || textContent.includes('---'))
                });
            } catch (error) {
                // 忽略错误
            }
        }

        // 检查头部图标
        console.log('🔍 检查头部功能按钮图标...');
        const headerIcons = await page.locator('.header .icon, .navbar svg, .header [class*="icon"]').all();
        for (let i = 0; i < Math.min(headerIcons.length, 10); i++) {
            const icon = headerIcons[i];
            try {
                const isVisible = await icon.isVisible();
                const textContent = await icon.textContent();
                const className = await icon.getAttribute('class');

                report.headerIcons.push({
                    index: i,
                    isVisible,
                    textContent: textContent || '',
                    className: className || '',
                    isPlaceholder: textContent && (textContent.includes('|||') || textContent.includes('---'))
                });
            } catch (error) {
                // 忽略错误
            }
        }

        // 检查仪表板卡片图标
        console.log('🔍 检查仪表板卡片图标...');
        const cardIcons = await page.locator('.stat-card .icon, .dashboard-card svg, .value-icon').all();
        for (let i = 0; i < Math.min(cardIcons.length, 15); i++) {
            const icon = cardIcons[i];
            try {
                const isVisible = await icon.isVisible();
                const textContent = await icon.textContent();
                const className = await icon.getAttribute('class');

                // 检查SVG属性
                let svgAttrs = {};
                const svgElement = await icon.$('svg');
                if (svgElement) {
                    svgAttrs = await svgElement.evaluate(el => {
                        const attrs = {};
                        for (let attr of el.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                        return attrs;
                    });
                }

                report.cardIcons.push({
                    index: i,
                    isVisible,
                    textContent: textContent || '',
                    className: className || '',
                    isPlaceholder: textContent && (textContent.includes('|||') || textContent.includes('---')),
                    svgAttributes: svgAttrs,
                    isOutlineStyle: svgAttrs.fill === 'none' && svgAttrs.stroke === 'currentColor'
                });
            } catch (error) {
                // 忽略错误
            }
        }

        // 截图
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotDir = path.join(__dirname, 'docs', 'browser-checks');
        const screenshotPath = path.join(screenshotDir, `unified-icon-detailed-${timestamp}.png`);

        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        report.screenshot = screenshotPath;

        // 保存报告
        const reportPath = path.join(screenshotDir, `unified-icon-detailed-analysis-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // 生成Markdown报告
        const markdownReport = generateDetailedMarkdownReport(report);
        const markdownPath = path.join(screenshotDir, `unified-icon-detailed-report-${timestamp}.md`);
        fs.writeFileSync(markdownPath, markdownReport);

        console.log('\n📊 详细检查结果:');
        console.log('='.repeat(60));
        console.log(`✅ UnifiedIcon在HTML中: ${report.unifiedIconAnalysis.inHTML ? '是' : '否'}`);
        console.log(`🔢 UnifiedIcon匹配次数: ${report.unifiedIconAnalysis.exactMatches}`);
        console.log(`🏷️ unified-icon类名次数: ${report.unifiedIconAnalysis.unifiedIconClasses}`);
        console.log(`🎨 总SVG数量: ${report.iconAnalysis.totalSVGs}`);
        console.log(`⭕ 空心SVG (fill="none"): ${report.iconAnalysis.outlineSVGs}`);
        console.log(`🖊️ 描边SVG (stroke="currentColor"): ${report.iconAnalysis.strokeSVGs}`);
        console.log(`🔁 圆角线帽: ${report.iconAnalysis.strokeLinecap}`);
        console.log(`🔗 圆角连接: ${report.iconAnalysis.strokeLinejoin}`);
        console.log(`📸 截图: ${screenshotPath}`);
        console.log(`📄 详细报告: ${reportPath}`);
        console.log(`📝 Markdown报告: ${markdownPath}`);

        // 检查是否需要进一步修复
        const needsMoreWork = report.unifiedIconAnalysis.exactMatches === 0 ||
                             report.cardIcons.filter(icon => icon.isPlaceholder).length > 0;

        if (needsMoreWork) {
            console.log('\n⚠️ 需要进一步检查:');
            if (report.unifiedIconAnalysis.exactMatches === 0) {
                console.log('  - UnifiedIcon组件可能没有在dashboard页面中使用');
            }
            const placeholderCount = report.cardIcons.filter(icon => icon.isPlaceholder).length;
            if (placeholderCount > 0) {
                console.log(`  - 发现 ${placeholderCount} 个占位符图标`);
            }
        } else {
            console.log('\n✅ UnifiedIcon组件检查通过');
        }

        return report;

    } catch (error) {
        console.error('❌ 详细检查失败:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function generateDetailedMarkdownReport(report) {
    return `# UnifiedIcon 组件详细检查报告

## 📋 检查信息

- **时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}
- **URL**: ${report.url}
- **截图**: [查看截图](${path.basename(report.screenshot)})

## 🎯 UnifiedIcon 组件分析

| 检查项 | 结果 | 状态 |
|--------|------|------|
| 在HTML中存在 | ${report.unifiedIconAnalysis.inHTML ? '是' : '否'} | ${report.unifiedIconAnalysis.inHTML ? '✅' : '❌'} |
| 精确匹配次数 | ${report.unifiedIconAnalysis.exactMatches} | ${report.unifiedIconAnalysis.exactMatches > 0 ? '✅' : '❌'} |
| unified-icon类名 | ${report.unifiedIconAnalysis.unifiedIconClasses} | ${report.unifiedIconAnalysis.unifiedIconClasses > 0 ? '✅' : '❌'} |

## 🎨 图标样式统计

| 样式属性 | 数量 | 说明 |
|----------|------|------|
| 总SVG数 | ${report.iconAnalysis.totalSVGs} | 页面中所有SVG元素 |
| 空心SVG (fill="none") | ${report.iconAnalysis.outlineSVGs} | ✅ 空心轮廓样式 |
| 描边SVG (stroke="currentColor") | ${report.iconAnalysis.strokeSVGs} | ✅ 描边样式 |
| 圆角线帽 | ${report.iconAnalysis.strokeLinecap} | ✅ 现代化样式 |
| 圆角连接 | ${report.iconAnalysis.strokeLinejoin} | ✅ 现代化样式 |

## 📱 各区域图标检查

### 侧边栏图标 (${report.sidebarIcons.length} 个)

${report.sidebarIcons.map(icon => `
- **图标 ${icon.index + 1}**: ${icon.isVisible ? '✅ 可见' : '❌ 不可见'} ${icon.isPlaceholder ? '⚠️ 占位符' : ''}
  - 类名: \`${icon.className}\`
  - 内容: \`${icon.textContent}\`
`).join('')}

### 头部图标 (${report.headerIcons.length} 个)

${report.headerIcons.map(icon => `
- **图标 ${icon.index + 1}**: ${icon.isVisible ? '✅ 可见' : '❌ 不可见'} ${icon.isPlaceholder ? '⚠️ 占位符' : ''}
  - 类名: \`${icon.className}\`
  - 内容: \`${icon.textContent}\`
`).join('')}

### 仪表板卡片图标 (${report.cardIcons.length} 个)

${report.cardIcons.map(icon => `
- **图标 ${icon.index + 1}**: ${icon.isVisible ? '✅ 可见' : '❌ 不可见'} ${icon.isPlaceholder ? '⚠️ 占位符' : ''} ${icon.isOutlineStyle ? '✅ 空心样式' : ''}
  - 类名: \`${icon.className}\`
  - 内容: \`${icon.textContent}\`
  - SVG属性: \`${JSON.stringify(icon.svgAttributes)}\`
`).join('')}

## 🎯 修复状态评估

### ✅ 成功的方面
${report.iconAnalysis.outlineSVGs > 0 ? '- 图标样式已改为空心轮廓 (fill="none")' : ''}
${report.iconAnalysis.strokeSVGs > 0 ? '- 使用了描边样式 (stroke="currentColor")' : ''}
${report.iconAnalysis.strokeLinecap > 0 ? '- 应用了圆角线帽样式' : ''}
${report.iconAnalysis.strokeLinejoin > 0 ? '- 应用了圆角连接样式' : ''}

### ⚠️ 需要检查的方面
${report.unifiedIconAnalysis.exactMatches === 0 ? '- UnifiedIcon组件可能没有在dashboard页面中直接使用' : ''}
${report.sidebarIcons.filter(icon => icon.isPlaceholder).length > 0 ? `- 侧边栏有 ${report.sidebarIcons.filter(icon => icon.isPlaceholder).length} 个占位符` : ''}
${report.headerIcons.filter(icon => icon.isPlaceholder).length > 0 ? `- 头部有 ${report.headerIcons.filter(icon => icon.isPlaceholder).length} 个占位符` : ''}
${report.cardIcons.filter(icon => icon.isPlaceholder).length > 0 ? `- 卡片有 ${report.cardIcons.filter(icon => icon.isPlaceholder).length} 个占位符` : ''}

## 📸 截图分析

![详细检查截图](${path.basename(report.screenshot)})

## 📝 总结

${report.unifiedIconAnalysis.exactMatches > 0 && report.iconAnalysis.outlineSVGs > report.iconAnalysis.totalSVGs / 2 ?
'✅ **修复成功**: UnifiedIcon组件已成功应用，图标显示为现代化空心轮廓样式' :
'⚠️ **部分修复**: 图标样式有所改善，但UnifiedIcon组件的使用需要进一步检查'}

---

*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;
}

// 运行详细检查
if (require.main === module) {
    detailedUnifiedIconCheck()
        .then(() => {
            console.log('\n✅ 详细检查完成');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ 详细检查失败:', error);
            process.exit(1);
        });
}

module.exports = { detailedUnifiedIconCheck };