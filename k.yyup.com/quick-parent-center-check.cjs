const { chromium } = require('playwright');

async function quickParentCenterCheck() {
    console.log('🔍 快速检查家长中心页面...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // 直接检查路由是否存在
        console.log('\n📋 检查路由配置...');

        const routes = [
            '/parent-center/dashboard',
            '/parent-center/children',
            '/parent-center/activities',
            '/parent-center/assessment',
            '/parent-center/smart-communication'
        ];

        for (const route of routes) {
            try {
                const response = await page.goto(`http://localhost:5173${route}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 5000
                });

                const status = response?.status() || 0;
                const url = page.url();

                console.log(`${route}: HTTP ${status} -> ${url}`);

                // 检查是否是登录页面
                if (url.includes('/login')) {
                    console.log(`  ⚠️ 需要登录认证`);
                } else if (status === 404) {
                    console.log(`  ❌ 404页面不存在`);
                } else if (status === 200) {
                    console.log(`  ✅ 页面可访问`);

                    // 检查页面内容
                    const title = await page.title();
                    console.log(`  📄 标题: ${title}`);
                }

            } catch (error) {
                console.log(`${route}: 💥 访问失败 - ${error.message}`);
            }
        }

        // 检查是否有家长角色
        console.log('\n👤 检查用户角色...');
        try {
            const loginResponse = await page.evaluate(async () => {
                try {
                    const response = await fetch('http://localhost:3000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'admin', password: '123456' })
                    });
                    const data = await response.json();
                    return { success: response.ok, data };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            });

            if (loginResponse.success) {
                console.log(`  ✅ 管理员登录成功: ${loginResponse.data.data?.user?.role}`);

                // 检查是否有家长角色
                if (loginResponse.data.data?.user?.role === 'admin') {
                    console.log(`  📝 使用admin角色访问权限更高，应该可以访问所有页面`);
                }
            } else {
                console.log(`  ❌ 登录失败: ${loginResponse.error}`);
            }
        } catch (error) {
            console.log(`  💥 登录检查失败: ${error.message}`);
        }

    } finally {
        await browser.close();
    }
}

quickParentCenterCheck();