const { chromium } = require('playwright');

async function checkHtmlStructure() {
    console.log('🔍 检查HTML结构和图标渲染');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 访问仪表板并登录
        console.log('📍 访问并登录仪表板...');
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

        if (page.url().includes('login')) {
            await page.fill('input[placeholder*="用户名"]', 'admin');
            await page.fill('input[placeholder*="密码"]', '123456');
            await page.click('button:has-text("登录")');
            await page.waitForTimeout(5000);
        }

        await page.waitForTimeout(3000);

        // 检查实际的HTML结构
        console.log('\n🔍 检查菜单项的HTML结构:');
        const htmlStructure = await page.evaluate(() => {
            const menuItems = Array.from(document.querySelectorAll('.nav-item')).slice(0, 3); // 只检查前3个

            return menuItems.map((item, index) => {
                return {
                    index: index + 1,
                    outerHTML: item.outerHTML,
                    innerHTML: item.innerHTML,
                    textContent: item.textContent.trim()
                };
            });
        });

        htmlStructure.forEach(item => {
            console.log(`\n   菜单项 ${item.index}:`);
            console.log(`   - 文本内容: "${item.textContent}"`);
            console.log(`   - 内部HTML: ${item.innerHTML}`);
            console.log(`   - 完整HTML: ${item.outerHTML.substring(0, 200)}...`);
        });

        // 检查是否有图标相关的自定义元素
        console.log('\n🔍 检查自定义元素和图标组件:');
        const customElements = await page.evaluate(() => {
            const elements = [];

            // 检查各种可能的图标元素
            const iconSelectors = [
                'unified-icon',
                '[class*="icon"]',
                '[class*="Icon"]',
                'i[class*="icon"]',
                'svg',
                '.nav-icon'
            ];

            iconSelectors.forEach(selector => {
                const found = document.querySelectorAll(selector);
                if (found.length > 0) {
                    elements.push({
                        selector,
                        count: found.length,
                        sample: found[0] ? found[0].outerHTML.substring(0, 150) : null
                    });
                }
            });

            return elements;
        });

        console.log('\n📊 图标元素统计:');
        customElements.forEach(el => {
            console.log(`   ${el.selector}: ${el.count} 个`);
            if (el.sample) {
                console.log(`   示例: ${el.sample}...`);
            }
        });

        // 检查Vue开发者工具中的组件树
        console.log('\n🔍 检查Vue组件树:');
        const vueTree = await page.evaluate(() => {
            const app = document.querySelector('#app').__vue_app__;
            if (!app) return null;

            const getInstanceInfo = (instance, depth = 0) => {
                if (!instance || depth > 3) return null;

                return {
                    name: instance.type?.name || instance.type?.__name || 'Anonymous',
                    hasChildren: !!(instance.subTree && instance.subTree.component),
                    children: instance.subTree && instance.subTree.component
                        ? [getInstanceInfo(instance.subTree.component, depth + 1)].filter(Boolean)
                        : []
                };
            };

            return getInstanceInfo(app._instance);
        });

        if (vueTree) {
            console.log(`   根组件: ${vueTree.name}`);
            vueTree.children.forEach(child => {
                console.log(`   子组件: ${child.name}`);
            });
        }

        console.log('\n📸 保存HTML结构截图...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/html-structure-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n✅ HTML结构检查完成!');
        console.log('⏳ 保持浏览器打开15秒供手动检查...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('❌ 检查出错:', error.message);
    } finally {
        await browser.close();
    }
}

checkHtmlStructure();