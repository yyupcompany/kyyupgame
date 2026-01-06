const { chromium } = require('playwright');

async function testAfterFix() {
    console.log('🧪 测试修复后的图标显示效果');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 强制刷新缓存
        await page.route('**/*', async route => {
            const request = route.request();
            if (request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'stylesheet') {
                await route.continue({
                    headers: {
                        ...request.headers(),
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
            } else {
                await route.continue();
            }
        });

        // 访问仪表板并登录
        console.log('📍 访问并登录仪表板（清除缓存）...');
        await page.goto('http://localhost:5173/dashboard', {
            waitUntil: 'networkidle',
            extraHTTPHeaders: {
                'Cache-Control': 'no-cache'
            }
        });

        // 检查是否需要登录
        if (page.url().includes('login')) {
            console.log('🔐 执行登录...');
            await page.fill('input[placeholder*="用户名"]', 'admin');
            await page.fill('input[placeholder*="密码"]', '123456');
            await page.click('button:has-text("登录")');
            await page.waitForTimeout(5000);
        }

        // 强制刷新页面
        console.log('🔄 强制刷新页面...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);

        // 详细检查修复后的效果
        console.log('\n🔍 检查修复后的图标显示:');

        const iconCheck = await page.evaluate(() => {
            const menuItems = Array.from(document.querySelectorAll('.nav-item')).map((item, index) => {
                const textEl = item.querySelector('.nav-text');
                const iconEl = item.querySelector('unified-icon');
                const svgEl = iconEl?.querySelector('svg path');

                return {
                    index: index + 1,
                    text: textEl ? textEl.textContent.trim() : '',
                    iconName: iconEl ? iconEl.getAttribute('name') : '',
                    iconSize: iconEl ? iconEl.getAttribute('size') : '',
                    svgPath: svgEl ? svgEl.getAttribute('d')?.substring(0, 50) + '...' : '',
                    innerHTML: iconEl ? iconEl.innerHTML.substring(0, 100) + '...' : ''
                };
            });

            return menuItems;
        });

        console.log('\n📊 修复后的图标检查结果:');
        iconCheck.forEach(item => {
            console.log(`\n   菜单项 ${item.index}: "${item.text}"`);
            console.log(`   - 图标名称: "${item.iconName}"`);
            console.log(`   - 图标大小: "${item.iconSize}"`);
            console.log(`   - SVG路径: ${item.svgPath}`);

            if (item.iconName) {
                console.log(`   ✅ 图标名称已设置!`);
            } else {
                console.log(`   ❌ 图标名称仍为空!`);
            }
        });

        // 统计修复效果
        const withIconName = iconCheck.filter(item => item.iconName).length;
        const totalItems = iconCheck.length;

        console.log(`\n📈 修复效果统计:`);
        console.log(`   - 总菜单项: ${totalItems}`);
        console.log(`   - 有图标名称: ${withIconName}`);
        console.log(`   - 成功率: ${((withIconName / totalItems) * 100).toFixed(1)}%`);

        // 检查是否还有相同的SVG路径
        const uniquePaths = [...new Set(iconCheck.map(item => item.svgPath))];
        console.log(`   - 不同SVG路径: ${uniquePaths.length} 个`);

        if (uniquePaths.length === 1) {
            console.log(`   ⚠️ 仍然使用相同的SVG路径`);
        } else {
            console.log(`   ✅ SVG路径已多样化`);
        }

        // 截图保存
        console.log('\n📸 保存修复后截图...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/after-fix-test-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n✅ 测试完成!');
        console.log('⏳ 保持浏览器打开20秒供手动检查...');
        console.log('📝 请手动检查侧边栏图标是否已修复');

        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('❌ 测试出错:', error.message);
    } finally {
        await browser.close();
    }
}

testAfterFix();