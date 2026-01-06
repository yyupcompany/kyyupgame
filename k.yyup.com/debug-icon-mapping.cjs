const { chromium } = require('playwright');

async function debugIconMapping() {
    console.log('🔍 调试图标映射问题');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 监听控制台消息
        const consoleMessages = [];
        page.on('console', msg => {
            if (msg.type() === 'warn' || msg.type() === 'error') {
                consoleMessages.push({
                    type: msg.type(),
                    text: msg.text(),
                    location: msg.location()
                });
                console.log(`[控制台${msg.type().toUpperCase()}] ${msg.text()}`);
            }
        });

        // 访问仪表板
        console.log('📍 访问仪表板页面...');
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);

        // 检查UnifiedIcon组件的属性
        console.log('\n🔍 检查UnifiedIcon组件的name属性:');

        const iconElements = await page.locator('unified-icon, [class*="unified-icon"]').all();
        console.log(`📊 找到 ${iconElements.length} 个UnifiedIcon组件`);

        for (let i = 0; i < Math.min(iconElements.length, 10); i++) {
            try {
                const icon = iconElements[i];
                const nameAttr = await icon.getAttribute('name');
                const visible = await icon.isVisible();
                const innerHTML = await icon.innerHTML();

                console.log(`\n   UnifiedIcon ${i + 1}:`);
                console.log(`   - name属性: "${nameAttr}"`);
                console.log(`   - 可见: ${visible}`);
                console.log(`   - SVG内容: ${innerHTML.substring(0, 100)}${innerHTML.length > 100 ? '...' : ''}`);

                // 获取父级菜单项的文本
                const parentItem = icon.locator('..').locator('..').locator('.nav-text');
                if (await parentItem.count() > 0) {
                    const menuText = await parentItem.first().textContent();
                    console.log(`   - 菜单文本: "${menuText?.trim()}"`);
                }

            } catch (error) {
                console.log(`   ❌ 检查UnifiedIcon ${i + 1} 时出错: ${error.message}`);
            }
        }

        // 检查页面中所有包含文本的菜单项
        console.log('\n🔍 检查所有菜单项的文本和对应的图标:');
        const menuItems = await page.locator('.nav-item').all();
        console.log(`📊 找到 ${menuItems.length} 个菜单项`);

        for (let i = 0; i < Math.min(menuItems.length, 15); i++) {
            try {
                const item = menuItems[i];
                const textElement = item.locator('.nav-text');
                const iconElement = item.locator('unified-icon, .nav-icon');

                if (await textElement.count() > 0 && await iconElement.count() > 0) {
                    const menuText = await textElement.first().textContent();
                    const iconHTML = await iconElement.first().innerHTML();
                    const iconName = await iconElement.first().getAttribute('name');

                    console.log(`\n   菜单项 ${i + 1}:`);
                    console.log(`   - 文本: "${menuText?.trim()}"`);
                    console.log(`   - 图标name: "${iconName}"`);
                    console.log(`   - SVG内容: ${iconHTML.substring(0, 80)}...`);
                }

            } catch (error) {
                console.log(`   ❌ 检查菜单项 ${i + 1} 时出错: ${error.message}`);
            }
        }

        // 注入JavaScript来检查图标映射逻辑
        console.log('\n🔍 注入JS检查图标映射逻辑:');
        const debugResult = await page.evaluate(() => {
            // 模拟getIconByTitle函数
            const getIconByTitle = (title) => {
                const iconMap = {
                    '管理中心': 'settings',
                    '业务中心': 'service',
                    '招生中心': 'enrollment',
                    '活动中心': 'activities',
                    '教学中心': 'user',
                    '测评中心': 'statistics',
                    '检查中心': 'search',
                    '考勤中心': 'calendar',
                    '相册中心': 'media',
                    '营销中心': 'marketing',
                    '呼叫中心': 'messages',
                    '客户池中心': 'customers',
                    '话术中心': 'script',
                    '财务中心': 'finance',
                    '绩效中心': 'performance',
                    '分析中心': 'analytics',
                    '人员中心': 'personnel',
                    '任务中心': 'task',
                    '反馈中心': 'messages',
                    '系统中心': 'system',
                    '文档模板中心': 'design',
                    '用量中心': 'monitor'
                };
                return iconMap[title] || 'menu';
            };

            // 获取所有菜单项
            const menuTexts = Array.from(document.querySelectorAll('.nav-text')).map(el => el.textContent.trim());
            const iconNames = menuTexts.map(text => getIconByTitle(text));

            return {
                menuTexts,
                iconNames,
                mappings: menuTexts.map((text, index) => ({
                    text,
                    iconName: iconNames[index]
                }))
            };
        });

        console.log('\n📊 菜单文本到图标名称的映射:');
        debugResult.mappings.forEach((mapping, index) => {
            console.log(`   ${index + 1}. "${mapping.text}" -> "${mapping.iconName}"`);
        });

        console.log('\n📸 截图保存...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/icon-mapping-debug-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n✅ 调试完成!');
        console.log('⏳ 保持浏览器打开10秒供手动检查...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ 调试出错:', error.message);
    } finally {
        await browser.close();
    }
}

debugIconMapping();