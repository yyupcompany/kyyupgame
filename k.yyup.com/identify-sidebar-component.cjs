const { chromium } = require('playwright');

async function identifySidebarComponent() {
    console.log('🔍 识别当前使用的侧边栏组件');
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

        // 注入JavaScript来检查实际的组件结构
        console.log('\n🔍 检查实际的组件结构:');
        const componentAnalysis = await page.evaluate(() => {
            // 查找所有的侧边栏相关组件
            const sidebarComponents = [];

            // 检查各种可能的侧边栏组件
            const possibleSelectors = [
                '.sidebar',
                'improved-sidebar',
                'parent-sidebar',
                'teacher-sidebar',
                '[class*="sidebar"]'
            ];

            possibleSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    Array.from(elements).forEach((el, index) => {
                        const vueInstance = el.__vueParentComponent;
                        sidebarComponents.push({
                            selector,
                            index,
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            innerHTML: el.innerHTML.substring(0, 200) + '...',
                            hasVueInstance: !!vueInstance,
                            vueComponent: vueInstance ? {
                                type: vueInstance.type?.name || vueInstance.type?.__name || 'Unknown',
                                setupState: Object.keys(vueInstance.setupState || {})
                            } : null
                        });
                    });
                }
            });

            // 检查导航菜单结构
            const navStructure = {
                hasSidebar: !!document.querySelector('.sidebar'),
                hasNavItems: !!document.querySelector('.nav-item'),
                navItemCount: document.querySelectorAll('.nav-item').length,
                hasUnifiedIcons: !!document.querySelector('unified-icon'),
                unifiedIconCount: document.querySelectorAll('unified-icon').length,
                hasImprovedSidebar: !!document.querySelector('improved-sidebar'),
                hasParentSidebar: !!document.querySelector('parent-sidebar'),
                hasTeacherSidebar: !!document.querySelector('teacher-sidebar')
            };

            // 检查主布局组件
            const mainLayout = document.querySelector('#app')?.__vue_app__?._instance?.setupState;

            return {
                sidebarComponents,
                navStructure,
                hasMainLayout: !!mainLayout,
                mainLayoutKeys: mainLayout ? Object.keys(mainLayout) : []
            };
        });

        console.log('\n📊 导航结构分析:');
        Object.entries(componentAnalysis.navStructure).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });

        console.log('\n📊 侧边栏组件分析:');
        componentAnalysis.sidebarComponents.forEach((comp, index) => {
            console.log(`\n   组件 ${index + 1}:`);
            console.log(`   - 选择器: ${comp.selector}`);
            console.log(`   - 标签: ${comp.tagName}`);
            console.log(`   - 类名: ${comp.className}`);
            console.log(`   - ID: ${comp.id}`);
            console.log(`   - 有Vue实例: ${comp.hasVueInstance}`);

            if (comp.vueComponent) {
                console.log(`   - Vue组件类型: ${comp.vueComponent.type}`);
                console.log(`   - Vue setup状态: ${comp.vueComponent.setupState.length} 个属性`);
            }
        });

        // 检查页面的源码中可能包含的组件引用
        console.log('\n🔍 检查页面源码的组件引用:');
        const pageSource = await page.content();
        const componentReferences = [];

        // 查找各种组件的引用
        const componentNames = [
            'ImprovedSidebar',
            'ParentSidebar',
            'TeacherSidebar',
            'Sidebar',
            'MenuItemComponent'
        ];

        componentNames.forEach(name => {
            if (pageSource.includes(name)) {
                componentReferences.push(name);
            }
        });

        console.log(`   找到的组件引用: ${componentReferences.join(', ')}`);

        console.log('\n📸 保存组件分析截图...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/component-analysis-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        console.log('\n✅ 组件识别完成!');
        console.log('⏳ 保持浏览器打开15秒供手动检查...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('❌ 识别出错:', error.message);
    } finally {
        await browser.close();
    }
}

identifySidebarComponent();