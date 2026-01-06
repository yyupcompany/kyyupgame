const { chromium } = require('playwright');

async function detailedIconDebug() {
    console.log('🔍 详细调试图标显示问题');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 监听控制台消息，特别是警告信息
        page.on('console', msg => {
            if (msg.type() === 'warn') {
                console.log(`⚠️ [警告] ${msg.text()}`);
            }
            if (msg.type() === 'error') {
                console.log(`❌ [错误] ${msg.text()}`);
            }
        });

        // 访问仪表板并登录
        console.log('📍 访问并登录仪表板...');
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

        // 检查是否需要登录
        if (page.url().includes('login')) {
            console.log('🔐 执行登录...');
            await page.fill('input[placeholder*="用户名"]', 'admin');
            await page.fill('input[placeholder*="密码"]', '123456');
            await page.click('button:has-text("登录")');
            await page.waitForTimeout(5000);
        }

        await page.waitForTimeout(3000);

        // 注入JavaScript来直接检查图标映射问题
        console.log('\n🔍 注入JS检查图标映射:');
        const mappingResult = await page.evaluate(() => {
            // 获取所有菜单项的详细信息
            const menuItems = Array.from(document.querySelectorAll('.nav-item')).map((item, index) => {
                const textEl = item.querySelector('.nav-text');
                const iconEl = item.querySelector('unified-icon');
                const svgEl = item.querySelector('svg path');

                return {
                    index: index + 1,
                    text: textEl ? textEl.textContent.trim() : '',
                    iconName: iconEl ? iconEl.getAttribute('name') : '',
                    svgPath: svgEl ? svgEl.getAttribute('d') : ''
                };
            });

            // 模拟getIconByTitle函数
            const getIconByTitle = (title) => {
                const iconMap = {
                    '用户管理': 'user',
                    '角色管理': 'user-group',
                    '权限管理': 'key',
                    '总览': 'dashboard',
                    '数据统计': 'statistics',
                    '学生管理': 'students',
                    '教师管理': 'teachers',
                    '家长管理': 'user-group',
                    '班级管理': 'classes',
                    '招生概览': 'enrollment'
                };
                return iconMap[title] || 'menu';
            };

            // 添加预期图标映射
            return menuItems.map(item => ({
                ...item,
                expectedIcon: getIconByTitle(item.text)
            }));
        });

        console.log('\n📊 菜单项图标映射分析:');
        mappingResult.forEach(item => {
            console.log(`\n   菜单项 ${item.index}:`);
            console.log(`   - 文本: "${item.text}"`);
            console.log(`   - 实际图标名: "${item.iconName}"`);
            console.log(`   - 预期图标名: "${item.expectedIcon}"`);
            console.log(`   - SVG Path: ${item.svgPath.substring(0, 50)}...`);

            if (item.iconName !== item.expectedIcon) {
                console.log(`   ⚠️ 图标名不匹配! 实际: "${item.iconName}" 预期: "${item.expectedIcon}"`);
            }
        });

        // 统计分析
        console.log('\n📈 统计分析:');
        const uniquePaths = [...new Set(mappingResult.map(item => item.svgPath))];
        const uniqueIcons = [...new Set(mappingResult.map(item => item.iconName))];
        const uniqueTexts = [...new Set(mappingResult.map(item => item.text))];

        console.log(`   - 菜单项总数: ${mappingResult.length}`);
        console.log(`   - 不同SVG路径数: ${uniquePaths.length}`);
        console.log(`   - 不同图标名称数: ${uniqueIcons.length}`);
        console.log(`   - 不同菜单文本数: ${uniqueTexts.length}`);

        if (uniquePaths.length === 1) {
            console.log(`   🚨 所有图标使用相同的SVG路径!`);
            console.log(`   路径: ${uniquePaths[0].substring(0, 100)}...`);
        }

        console.log('\n📸 保存截图...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/icon-mapping-analysis-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n✅ 调试完成!');
        console.log('⏳ 保持浏览器打开15秒供手动检查...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('❌ 调试出错:', error.message);
    } finally {
        await browser.close();
    }
}

detailedIconDebug();