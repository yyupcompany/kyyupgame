const { chromium } = require('playwright');

async function quickIconCheck() {
    console.log('🚀 快速图标检查');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 访问仪表板
        console.log('📍 访问仪表板页面...');
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);

        // 截图当前状态
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/quick-dashboard-check-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n🔍 检查侧边栏结构:');

        // 检查各种可能的侧边栏选择器
        const sidebarSelectors = [
            '.sidebar',
            '.el-aside',
            '.nav-sidebar',
            '.main-sidebar',
            '.layout-sidebar',
            'aside'
        ];

        let foundSidebar = false;
        for (const selector of sidebarSelectors) {
            const element = page.locator(selector);
            if (await element.isVisible()) {
                console.log(`✅ 找到侧边栏: ${selector}`);
                foundSidebar = true;

                // 检查其中的菜单项
                const menuItems = await element.locator('.menu-item, .nav-item, .el-menu-item, li').all();
                console.log(`📊 在侧边栏中找到 ${menuItems.length} 个菜单项`);

                for (let i = 0; i < Math.min(menuItems.length, 10); i++) {
                    const item = menuItems[i];
                    const text = await item.textContent();
                    const visible = await item.isVisible();

                    console.log(`\n   菜单项 ${i + 1}:`);
                    console.log(`   - 文本: "${text?.trim()}"`);
                    console.log(`   - 可见: ${visible}`);

                    // 检查图标
                    const icons = await item.locator('i, .icon, svg').all();
                    console.log(`   - 图标元素: ${icons.length}个`);

                    for (let j = 0; j < icons.length; j++) {
                        const icon = icons[j];
                        const iconVisible = await icon.isVisible();
                        const iconHtml = await icon.innerHTML();
                        console.log(`     图标 ${j + 1}: 可见=${iconVisible}, 内容="${iconHtml.substring(0, 50)}"`);
                    }
                }
                break;
            }
        }

        if (!foundSidebar) {
            console.log('❌ 未找到侧边栏元素');

            // 检查页面整体结构
            console.log('\n🔍 检查页面结构:');
            const mainElements = await page.locator('main, .main, .content, .app-main').all();
            console.log(`📊 找到 ${mainElements.length} 个主要内容区域`);
        }

        // 检查所有图标元素
        console.log('\n🔍 检查页面所有图标元素:');
        const allIcons = await page.locator('i[class*="icon"], .icon, svg').all();
        console.log(`📊 页面中共找到 ${allIcons.length} 个图标元素`);

        let placeholderCount = 0;
        for (let i = 0; i < Math.min(allIcons.length, 20); i++) {
            const icon = allIcons[i];
            const visible = await icon.isVisible();
            const html = await icon.innerHTML();

            if (html && (html.includes('☰') || html.includes('≡'))) {
                placeholderCount++;
                console.log(`⚠️ 占位符图标 ${placeholderCount}: HTML="${html}"`);
            }
        }

        console.log(`\n📊 检查结果:`);
        console.log(`- 侧边栏: ${foundSidebar ? '✅ 找到' : '❌ 未找到'}`);
        console.log(`- 图标元素: ${allIcons.length}个`);
        console.log(`- 占位符图标: ${placeholderCount}个`);

        if (placeholderCount > 0) {
            console.log('⚠️ 仍有占位符图标需要修复');
        } else {
            console.log('✅ 没有发现占位符图标');
        }

        console.log('\n📸 截图已保存');
        console.log('⏳ 保持浏览器打开10秒供手动检查...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ 检查出错:', error.message);
    } finally {
        await browser.close();
    }
}

quickIconCheck();