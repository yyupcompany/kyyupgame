const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 创建文档目录
const docsDir = path.join(__dirname, 'docs', '浏览器检查');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

// 生成带时间戳的文件名
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const docPath = path.join(docsDir, `${timestamp}_暗黑模式卡片边框检查.md`);

async function checkDarkThemeBorders() {
    let browser;
    let page;
    let context;

    try {
        // 启动浏览器
        browser = await chromium.launch({ headless: false, slowMo: 500 });
        context = await browser.newContext({
            viewport: { width: 1280, height: 800 }
        });
        page = await context.newPage();

        // 导航到登录页面
        await page.goto('http://localhost:5173/login');

        // 登录（使用快捷登录功能）
        const adminQuickBtn = await page.waitForSelector('.quick-btn.admin-btn');
        await adminQuickBtn.click();

        // 等待导航到dashboard
        await page.waitForURL('http://localhost:5173/dashboard');
        console.log('✅ 登录成功，进入dashboard');

        // 直接通过JavaScript切换到暗黑模式
        await page.evaluate(() => {
            // 查找所有可能的主题切换元素
            const themeElements = document.querySelectorAll('.theme-switcher, .theme-toggle-btn, [data-theme]');
            if (themeElements.length > 0) {
                // 尝试点击第一个主题切换按钮
                themeElements[0].click();
            } else {
                // 如果找不到UI元素，直接修改DOM
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });

        // 检查暗黑模式是否生效
        await page.waitForTimeout(1000); // 等待主题切换完成
        const isDark = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
        });
        console.log(`✅ 暗黑模式状态: ${isDark ? '已启用' : '未启用'}`);

        // 等待卡片加载
        await page.waitForSelector('.stat-card', { timeout: 5000 });
        const cards = await page.$$('.stat-card');
        console.log(`✅ 找到 ${cards.length} 个统计卡片`);

        // 分析每个卡片的边框样式
        const results = [];
        let hasHardcodedBorders = false;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            // 获取卡片的边框样式
            const borderStyle = await card.evaluate(el => {
                const style = window.getComputedStyle(el);
                return {
                    border: style.border,
                    borderColor: style.borderColor,
                    borderWidth: style.borderWidth,
                    borderStyle: style.borderStyle,
                    className: el.className,
                    element: el.tagName.toLowerCase()
                };
            });

            // 检查边框是否硬编码（非CSS变量）
            const isHardcoded = !borderStyle.borderColor.includes('var(--');

            if (isHardcoded) {
                hasHardcodedBorders = true;
            }

            results.push({
                cardIndex: i + 1,
                borderStyle: borderStyle.border,
                borderColor: borderStyle.borderColor,
                borderWidth: borderStyle.borderWidth,
                borderStyleType: borderStyle.borderStyle,
                className: borderStyle.className,
                isHardcodedBorder: isHardcoded
            });

            // 截图保存
            await card.screenshot({
                path: path.join(docsDir, `${timestamp}_card_${i+1}.png`),
                type: 'png'
            });
        }

        // 生成文档
        generateReport(results, hasHardcodedBorders);

        // 检查控制台错误
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // 等待3秒确保所有控制台信息都被捕获
        await page.waitForTimeout(3000);

        if (consoleErrors.length > 0) {
            console.log('❌ 控制台错误:');
            consoleErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
            generateConsoleErrorsReport(consoleErrors);
        } else {
            console.log('✅ 控制台无错误');
        }

        // 关闭浏览器
        await browser.close();

        return {
            success: true,
            hasHardcodedBorders,
            results,
            consoleErrors
        };

    } catch (error) {
        console.error('❌ 执行过程中出错:', error.message);
        if (browser) {
            await browser.close();
        }
        return {
            success: false,
            error: error.message
        };
    }
}

function generateReport(results, hasHardcodedBorders) {
    let content = `# 暗黑模式卡片边框检查报告\n\n`;
    content += `## 检查时间\n${new Date().toLocaleString('zh-CN')}\n\n`;
    content += `## 检查结果\n`;
    content += `是否存在硬编码边框颜色: ${hasHardcodedBorders ? '是' : '否'}\n\n`;

    content += `## 卡片边框分析\n\n`;
    results.forEach(result => {
        content += `### 卡片 ${result.cardIndex}\n`;
        content += `- 边框样式: ${result.borderStyle}\n`;
        content += `- 边框颜色: ${result.borderColor}\n`;
        content += `- 边框宽度: ${result.borderWidth}\n`;
        content += `- 边框类型: ${result.borderStyleType}\n`;
        content += `- CSS类: ${result.className}\n`;
        content += `- 硬编码检测: ${result.isHardcodedBorder ? '✅ 硬编码' : '❌ 使用CSS变量'}\n`;
        content += `- 截图: ${timestamp}_card_${result.cardIndex}.png\n\n`;
    });

    content += `## 问题原因分析\n`;
    if (hasHardcodedBorders) {
        content += `1. **设计一致性问题**: 硬编码边框颜色破坏了主题系统的一致性\n`;
        content += `2. **可维护性问题**: 需要手动更新所有硬编码颜色来支持新主题\n`;
        content += `3. **用户体验问题**: 在暗黑模式下可能导致视觉不协调\n`;
        content += `4. **技术实现问题**: 没有正确使用Element Plus提供的主题变量系统\n`;
        content += `5. **组件设计问题**: 组件没有采用响应式主题设计模式\n`;
    } else {
        content += `所有卡片都正确使用了CSS变量，符合主题系统设计规范\n`;
    }

    fs.writeFileSync(docPath, content, 'utf-8');
    console.log(`✅ 报告已生成: ${docPath}`);
}

function generateConsoleErrorsReport(consoleErrors) {
    const errorsContent = `# 控制台错误报告\n\n` +
                          `## 检查时间\n${new Date().toLocaleString('zh-CN')}\n\n` +
                          `## 错误列表\n\n` +
                          consoleErrors.map((error, index) => `${index + 1}. ${error}\n\n`).join('');

    const errorsPath = path.join(docsDir, `${timestamp}_console_errors.md`);
    fs.writeFileSync(errorsPath, errorsContent, 'utf-8');
    console.log(`✅ 控制台错误报告已生成: ${errorsPath}`);
}

// 执行测试
checkDarkThemeBorders().then(result => {
    if (result.success) {
        console.log('\n✅ 测试完成');
        console.log(`📊 总卡片数: ${result.results.length}`);
        console.log(`🚨 硬编码边框卡片数: ${result.results.filter(r => r.isHardcodedBorder).length}`);
        console.log(`📝 报告已保存到: ${docPath}`);
    } else {
        console.log('\n❌ 测试失败');
    }
});
