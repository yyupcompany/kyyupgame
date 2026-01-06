const { chromium } = require('playwright');

async function dashboardIconAnalysis() {
    console.log('🚀 开始仪表板侧边栏图标详细分析');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));
    console.log('=' .repeat(60));

    const browser = await chromium.launch({
        headless: false, // 显示浏览器窗口
        slowMo: 500 // 减慢操作速度
    });

    try {
        // 创建页面
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 });

        // 监听控制台消息
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
        });

        console.log('📍 步骤 1: 访问登录页面');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

        // 等待页面加载
        await page.waitForTimeout(2000);

        console.log('📍 步骤 2: 执行登录');
        try {
            // 填写登录表单
            await page.fill('input[placeholder="请输入用户名"]', 'admin');
            await page.fill('input[placeholder="请输入密码"]', '123456');

            // 点击登录按钮
            await page.click('button[type="button"]:has-text("登录")');

            console.log('⏳ 等待登录完成...');
            await page.waitForTimeout(3000);

        } catch (error) {
            console.log('❌ 登录失败:', error.message);
        }

        console.log('📍 步骤 3: 访问仪表板页面');
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        console.log('📍 步骤 4: 详细检查侧边栏图标');

        // 4.1 检查侧边栏整体结构
        console.log('\n🔍 4.1 检查侧边栏整体结构:');
        const sidebar = await page.locator('.sidebar').first();
        if (await sidebar.isVisible()) {
            console.log('✅ 侧边栏可见');
        } else {
            console.log('❌ 侧边栏不可见');
        }

        // 4.2 检查所有菜单项
        console.log('\n🔍 4.2 检查所有菜单项:');
        const menuItems = await page.locator('.sidebar .menu-item, .sidebar .nav-item, .sidebar .el-menu-item').all();
        console.log(`📊 找到 ${menuItems.length} 个菜单项`);

        for (let i = 0; i < Math.min(menuItems.length, 15); i++) {
            try {
                const item = menuItems[i];
                const isVisible = await item.isVisible();
                const textContent = await item.textContent();

                console.log(`\n   菜单项 ${i + 1}:`);
                console.log(`   - 文本: "${textContent?.trim()}"`);
                console.log(`   - 可见: ${isVisible}`);

                // 检查图标元素
                const iconElements = await item.locator('i, .icon, [class*="icon"], svg').all();
                console.log(`   - 图标元素数量: ${iconElements.length}`);

                for (let j = 0; j < iconElements.length; j++) {
                    const icon = iconElements[j];
                    const iconVisible = await icon.isVisible();
                    const iconClasses = await icon.getAttribute('class');
                    const iconHtml = await icon.innerHTML();

                    console.log(`     图标 ${j + 1}:`);
                    console.log(`     - 可见: ${iconVisible}`);
                    console.log(`     - 类名: ${iconClasses}`);
                    console.log(`     - HTML: ${iconHtml.substring(0, 100)}${iconHtml.length > 100 ? '...' : ''}`);

                    // 检查是否是占位符
                    if (iconHtml && (iconHtml.includes('☰') || iconHtml.includes('≡') || iconHtml.includes('menu'))) {
                        console.log(`     ⚠️ 发现占位符图标!`);
                    }
                }

                // 检查UnifiedIcon组件
                const unifiedIcons = await item.locator('[class*="UnifiedIcon"], [class*="unified-icon"]').all();
                if (unifiedIcons.length > 0) {
                    console.log(`   - UnifiedIcon组件: ${unifiedIcons.length}个`);
                    for (let k = 0; k < unifiedIcons.length; k++) {
                        const unifiedIcon = unifiedIcons[k];
                        const unifiedVisible = await unifiedIcon.isVisible();
                        const unifiedClasses = await unifiedIcon.getAttribute('class');
                        console.log(`     UnifiedIcon ${k + 1}:`);
                        console.log(`     - 可见: ${unifiedVisible}`);
                        console.log(`     - 类名: ${unifiedClasses}`);
                    }
                }

            } catch (error) {
                console.log(`   ❌ 检查菜单项 ${i + 1} 时出错: ${error.message}`);
            }
        }

        // 4.3 检查特定的图标组件
        console.log('\n🔍 4.3 检查UnifiedIcon组件:');
        const unifiedIcons = await page.locator('[class*="UnifiedIcon"]').all();
        console.log(`📊 找到 ${unifiedIcons.length} 个UnifiedIcon组件`);

        for (let i = 0; i < Math.min(unifiedIcons.length, 10); i++) {
            try {
                const unifiedIcon = unifiedIcons[i];
                const isVisible = await unifiedIcon.isVisible();
                const classes = await unifiedIcon.getAttribute('class');
                const innerHTML = await unifiedIcon.innerHTML();

                console.log(`\n   UnifiedIcon ${i + 1}:`);
                console.log(`   - 可见: ${isVisible}`);
                console.log(`   - 类名: ${classes}`);
                console.log(`   - 内容: ${innerHTML.substring(0, 150)}${innerHTML.length > 150 ? '...' : ''}`);

                // 检查SVG元素
                const svgElements = await unifiedIcon.locator('svg').all();
                if (svgElements.length > 0) {
                    console.log(`   - SVG元素: ${svgElements.length}个`);
                    for (let j = 0; j < svgElements.length; j++) {
                        const svg = svgElements[j];
                        const svgVisible = await svg.isVisible();
                        const svgClasses = await svg.getAttribute('class');
                        console.log(`     SVG ${j + 1}: 可见=${svgVisible}, 类名=${svgClasses}`);
                    }
                }

            } catch (error) {
                console.log(`   ❌ 检查UnifiedIcon ${i + 1} 时出错: ${error.message}`);
            }
        }

        // 4.4 检查图标相关的CSS样式
        console.log('\n🔍 4.4 检查图标CSS样式:');
        const iconStyles = await page.evaluate(() => {
            const styles = [];
            const icons = document.querySelectorAll('i.icon, .unified-icon, [class*="icon"]');

            icons.forEach((icon, index) => {
                if (index < 10) { // 只检查前10个
                    const computedStyle = window.getComputedStyle(icon);
                    styles.push({
                        index: index,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        opacity: computedStyle.opacity,
                        fontSize: computedStyle.fontSize,
                        color: computedStyle.color,
                        content: computedStyle.content
                    });
                }
            });

            return styles;
        });

        iconStyles.forEach(style => {
            console.log(`\n   图标 ${style.index + 1}:`);
            console.log(`   - display: ${style.display}`);
            console.log(`   - visibility: ${style.visibility}`);
            console.log(`   - opacity: ${style.opacity}`);
            console.log(`   - fontSize: ${style.fontSize}`);
            console.log(`   - color: ${style.color}`);
            if (style.content && style.content !== 'none') {
                console.log(`   - content: ${style.content}`);
            }
        });

        // 4.5 截图保存
        console.log('\n📸 步骤 5: 保存截图');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');

        // 整页截图
        await page.screenshot({
            path: `docs/浏览器检查/dashboard-full-page-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        // 侧边栏特写截图
        try {
            const sidebarElement = await page.locator('.sidebar').first();
            if (await sidebarElement.isVisible()) {
                await sidebarElement.screenshot({
                    path: `docs/浏览器检查/sidebar-detail-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`
                });
                console.log('✅ 侧边栏特写截图已保存');
            }
        } catch (error) {
            console.log('❌ 侧边栏截图失败:', error.message);
        }

        console.log('\n📍 步骤 6: 控制台错误检查');
        if (consoleMessages.length > 0) {
            console.log(`📊 发现 ${consoleMessages.length} 条控制台消息:`);
            consoleMessages.forEach((msg, index) => {
                if (index < 20) { // 只显示前20条
                    console.log(`   [${msg.type.toUpperCase()}] ${msg.text}`);
                    if (msg.location && msg.location.url) {
                        console.log(`       位置: ${msg.location.url}:${msg.location.lineNumber}`);
                    }
                }
            });
        } else {
            console.log('✅ 没有发现控制台消息');
        }

        console.log('\n📍 步骤 7: 生成检查报告');
        const reportContent = `# 仪表板侧边栏图标详细分析报告
生成时间: ${new Date().toLocaleString('zh-CN')}
检查页面: http://localhost:5173/dashboard

## 检查结果摘要

### 菜单项统计
- 菜单项总数: ${menuItems.length}
- UnifiedIcon组件总数: ${unifiedIcons.length}

### 发现的问题
1. 图标显示情况需要通过截图确认
2. 控制台消息数量: ${consoleMessages.length}

### 详细分析
请查看截图文件和上述控制台输出了解详细情况。

## 下一步建议
1. 如果图标仍然显示为占位符，需要检查UnifiedIcon组件的实现
2. 确认图标数据是否正确传递到组件
3. 检查CSS样式是否正确应用
`;

        const reportPath = `docs/浏览器检查/dashboard-icon-analysis-${timestamp[0]}-${timestamp[1].substring(0, 8)}.md`;
        await fs.promises.writeFile(reportPath, reportContent);
        console.log(`📋 分析报告已保存: ${reportPath}`);

        console.log('\n✅ 检查完成! 请查看以下文件:');
        console.log(`📸 整页截图: docs/浏览器检查/dashboard-full-page-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`);
        console.log(`📸 侧边栏截图: docs/浏览器检查/sidebar-detail-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`);
        console.log(`📋 分析报告: ${reportPath}`);

        // 保持浏览器打开一段时间供手动检查
        console.log('\n⏳ 浏览器将保持打开30秒供手动检查...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ 检查过程中出错:', error);
    } finally {
        await browser.close();
        console.log('🔚 浏览器已关闭');
    }
}

const fs = require('fs');

// 运行检查
dashboardIconAnalysis().catch(console.error);