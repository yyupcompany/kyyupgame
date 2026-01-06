const { chromium } = require('playwright');

async function checkMenuStructure() {
    console.log('🔍 检查菜单数据结构');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
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

        // 注入JavaScript来检查Vue组件的数据结构
        console.log('\n🔍 检查Vue组件数据结构:');
        const componentData = await page.evaluate(() => {
            // 尝试访问Vue应用的实例数据
            const checkVueData = () => {
                const app = document.querySelector('#app').__vue_app__;
                if (!app) return null;

                // 尝试获取store数据
                const store = app._instance?.setupState || {};
                const stores = {};

                // 查找可能的store引用
                Object.keys(store).forEach(key => {
                    if (key.includes('Store') || key.includes('store')) {
                        stores[key] = store[key];
                    }
                });

                return {
                    hasApp: !!app,
                    stores: Object.keys(stores),
                    storeKeys: Object.keys(stores)
                };
            };

            // 检查菜单项的完整数据结构
            const menuItems = Array.from(document.querySelectorAll('.nav-item')).map((item, index) => {
                const textEl = item.querySelector('.nav-text');
                const iconEl = item.querySelector('unified-icon');
                const svgEl = item.querySelector('svg path');

                // 尝试获取Vue组件实例
                const vueInstance = item.__vueParentComponent;

                return {
                    index: index + 1,
                    text: textEl ? textEl.textContent.trim() : '',
                    iconName: iconEl ? iconEl.getAttribute('name') : '',
                    iconData: iconEl ? {
                        name: iconEl.getAttribute('name'),
                        size: iconEl.getAttribute('size'),
                        class: iconEl.getAttribute('class'),
                        innerHTML: iconEl.innerHTML
                    } : null,
                    svgPath: svgEl ? svgEl.getAttribute('d') : '',
                    hasVueInstance: !!vueInstance,
                    vueData: vueInstance ? {
                        props: vueInstance.props,
                        setupState: Object.keys(vueInstance.setupState || {})
                    } : null
                };
            });

            return {
                vueApp: checkVueData(),
                menuItems: menuItems.slice(0, 10) // 只显示前10个
            };
        });

        console.log('\n📊 Vue应用数据:');
        console.log(`   - 应用存在: ${componentData.vueApp?.hasApp}`);
        console.log(`   - Store数量: ${componentData.vueApp?.stores?.length || 0}`);
        if (componentData.vueApp?.stores?.length > 0) {
            componentData.vueApp.stores.forEach(store => {
                console.log(`     - ${store}`);
            });
        }

        console.log('\n📊 菜单项详细数据:');
        componentData.menuItems.forEach(item => {
            console.log(`\n   菜单项 ${item.index}:`);
            console.log(`   - 文本: "${item.text}"`);
            console.log(`   - 图标名称: "${item.iconName}"`);
            console.log(`   - 有Vue实例: ${item.hasVueInstance}`);

            if (item.iconData) {
                console.log(`   - 图标详细数据:`);
                console.log(`     * name: "${item.iconData.name}"`);
                console.log(`     * size: "${item.iconData.size}"`);
                console.log(`     * class: "${item.iconData.class}"`);
                console.log(`     * innerHTML: ${item.iconData.innerHTML.substring(0, 100)}...`);
            }

            if (item.vueData && item.vueData.props) {
                console.log(`   - Vue Props:`, item.vueData.props);
            }
        });

        console.log('\n📸 保存截图...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/menu-structure-check-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n✅ 检查完成!');
        console.log('⏳ 保持浏览器打开15秒供手动检查...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('❌ 检查出错:', error.message);
    } finally {
        await browser.close();
    }
}

checkMenuStructure();