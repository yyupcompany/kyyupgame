const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建输出目录
const outputDir = path.join(__dirname, 'parent-center-analysis');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🚀 开始家长中心用户体验分析...');
console.log('📱 前端地址: http://localhost:5173');
console.log('🔧 后端API: http://localhost:3000');

(async () => {
    const browser = await chromium.launch({
        headless: true, // 强制无头模式
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    try {
        // 1. 访问登录页面
        console.log('\n📍 步骤1: 访问登录页面');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // 截屏登录页面
        await page.screenshot({ path: path.join(outputDir, '01-login-page.png'), fullPage: true });
        console.log('✅ 登录页面截图保存');

        // 2. 查找并点击快速体验登录
        console.log('\n📍 步骤2: 执行快速体验登录');
        try {
            // 查找快速体验登录按钮
            const quickLoginButton = await page.locator('text=/快速体验/i').first();
            if (await quickLoginButton.isVisible()) {
                await quickLoginButton.click();
                console.log('✅ 点击快速体验登录按钮');
                await page.waitForTimeout(2000);
            } else {
                // 尝试其他可能的快速登录按钮
                const alternativeButton = await page.locator('button').filter({ hasText: /体验|试用|快速/i }).first();
                if (await alternativeButton.isVisible()) {
                    await alternativeButton.click();
                    console.log('✅ 点击替代快速登录按钮');
                    await page.waitForTimeout(2000);
                }
            }

            // 3. 选择家长角色
            console.log('\n📍 步骤3: 选择家长角色');
            const parentRoleButton = await page.locator('text=/家长|parent/i').first();
            if (await parentRoleButton.isVisible()) {
                await parentRoleButton.click();
                console.log('✅ 选择家长角色');
            } else {
                // 尝试卡片式选择
                const roleCards = await page.locator('[class*="card"], [class*="role"]').all();
                for (const card of roleCards) {
                    const text = await card.textContent();
                    if (text && text.includes('家长')) {
                        await card.click();
                        console.log('✅ 通过卡片选择家长角色');
                        break;
                    }
                }
            }

            await page.waitForTimeout(3000);

            // 截屏角色选择页面
            await page.screenshot({ path: path.join(outputDir, '02-role-selection.png'), fullPage: true });
            console.log('✅ 角色选择页面截图保存');

            // 4. 等待系统加载完成
            console.log('\n📍 步骤4: 等待系统加载');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);

            // 5. 分析侧边栏导航
            console.log('\n📍 步骤5: 分析侧边栏导航结构');
            await page.screenshot({ path: path.join(outputDir, '03-main-dashboard.png'), fullPage: true });

            // 获取所有导航链接
            const navigationLinks = await page.locator('[class*="menu"], [class*="nav"], [class*="sidebar"] a').all();
            console.log(`📋 发现 ${navigationLinks.length} 个导航链接`);

            // 6. 查找家长中心相关页面
            console.log('\n📍 步骤6: 查找家长中心页面');
            const parentCenterKeywords = ['家长', '个人信息', '孩子', '成长', '记录', '智能', '测评', 'AI', '育儿', '助手', '游戏', '活动', '报名', '家校', '沟通', '相册'];
            const parentCenterLinks = [];

            for (const link of navigationLinks) {
                try {
                    const text = await link.textContent();
                    if (text && parentCenterKeywords.some(keyword => text.includes(keyword))) {
                        const href = await link.getAttribute('href');
                        parentCenterLinks.push({ text: text.trim(), href });
                        console.log(`🔗 找到家长相关链接: ${text.trim()}`);
                    }
                } catch (e) {
                    // 忽略无法访问的链接
                }
            }

            // 7. 逐一访问家长中心页面
            console.log('\n📍 步骤7: 逐一访问家长中心页面');
            let pageCounter = 4;

            for (const link of parentCenterLinks.slice(0, 10)) { // 限制访问前10个页面
                try {
                    console.log(`\n📄 访问页面: ${link.text}`);

                    // 点击链接
                    await page.locator(`text=${link.text}`).first().click();
                    await page.waitForTimeout(3000);
                    await page.waitForLoadState('networkidle');

                    // 截屏
                    const screenshotPath = path.join(outputDir, `${String(pageCounter).padStart(2, '0')}-${link.text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')}.png`);
                    await page.screenshot({ path: screenshotPath, fullPage: true });
                    console.log(`✅ 页面截图保存: ${screenshotPath}`);

                    // 收集页面信息
                    const pageTitle = await page.title();
                    const pageContent = await page.locator('body').textContent();
                    const hasError = pageContent.includes('错误') || pageContent.includes('Error') || pageContent.includes('404');

                    console.log(`📋 页面标题: ${pageTitle}`);
                    console.log(`📋 页面状态: ${hasError ? '❌ 存在错误' : '✅ 正常'}`);

                    pageCounter++;

                    // 返回主页
                    await page.goBack();
                    await page.waitForTimeout(2000);
                } catch (error) {
                    console.log(`❌ 访问页面失败: ${link.text} - ${error.message}`);
                }
            }

            // 8. 移动端响应式测试
            console.log('\n📍 步骤8: 移动端响应式测试');
            await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 尺寸
            await page.reload();
            await page.waitForTimeout(3000);

            await page.screenshot({ path: path.join(outputDir, 'mobile-responsive-test.png'), fullPage: true });
            console.log('✅ 移动端响应式截图保存');

            // 9. 收集系统信息
            console.log('\n📍 步骤9: 收集系统分析信息');
            const systemInfo = {
                url: page.url(),
                title: await page.title(),
                timestamp: new Date().toISOString(),
                parentCenterPages: parentCenterLinks,
                viewport: { width: 1920, height: 1080 },
                mobileViewport: { width: 375, height: 667 }
            };

            fs.writeFileSync(
                path.join(outputDir, 'system-info.json'),
                JSON.stringify(systemInfo, null, 2)
            );
            console.log('✅ 系统信息保存');

        } catch (error) {
            console.error('❌ 快速登录过程中出现错误:', error.message);

            // 尝试直接访问可能的家长页面
            console.log('🔄 尝试直接访问家长相关页面...');
            const directAccessPages = [
                'http://localhost:5173/parent',
                'http://localhost:5173/parent-center',
                'http://localhost:5173/parent-info',
                'http://localhost:5173/student-growth'
            ];

            for (const url of directAccessPages) {
                try {
                    console.log(`📄 尝试访问: ${url}`);
                    await page.goto(url, { waitUntil: 'networkidle' });
                    await page.waitForTimeout(2000);

                    const pageTitle = await page.title();
                    console.log(`📋 页面标题: ${pageTitle}`);

                    await page.screenshot({ path: path.join(outputDir, `direct-access-${url.split('/').pop()}.png`), fullPage: true });
                } catch (e) {
                    console.log(`❌ 无法访问: ${url}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ 分析过程中出现错误:', error.message);
    } finally {
        await browser.close();
        console.log('\n🎉 家长中心用户体验分析完成！');
        console.log(`📁 分析结果保存在: ${outputDir}`);
        console.log('\n📊 分析摘要:');
        console.log('- 登录页面截图: 01-login-page.png');
        console.log('- 角色选择截图: 02-role-selection.png');
        console.log('- 主控制台截图: 03-main-dashboard.png');
        console.log('- 家长中心页面截图: 04-XX.png');
        console.log('- 移动端响应式测试: mobile-responsive-test.png');
        console.log('- 系统信息: system-info.json');
    }
})();