const { chromium } = require('playwright');

async function quickVerifyFix() {
    console.log('🔍 快速验证家长中心权限修复效果');
    console.log('⏰ 验证时间:', new Date().toLocaleString('zh-CN'));
    console.log('');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // 1. 登录系统
        console.log('1️⃣ 登录系统...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

        // 填写登录信息
        await page.fill('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]', 'admin');
        await page.fill('input[type="password"], input[placeholder*="密码"]', '123456');
        await page.click('button[type="submit"], .login-btn');

        await page.waitForTimeout(3000);
        console.log('✅ 登录完成');

        // 2. 测试家长中心页面访问
        const testPages = [
            { name: '家长中心工作台', path: '/parent-center/dashboard' },
            { name: '孩子管理', path: '/parent-center/children' },
            { name: '招生活动', path: '/parent-center/activities' },
            { name: '成长评估', path: '/parent-center/assessment' },
            { name: '家校沟通', path: '/parent-center/smart-communication' }
        ];

        console.log('\n2️⃣ 测试家长中心页面访问...');

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < testPages.length; i++) {
            const pageConfig = testPages[i];
            console.log(`\n2.${i + 1} 测试 ${pageConfig.name}`);

            try {
                const response = await page.goto(`http://localhost:5173${pageConfig.path}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 8000
                });

                await page.waitForTimeout(1500);

                const currentUrl = page.url();
                const httpStatus = response?.status() || 0;

                // 检查是否是403页面
                const is403Page = currentUrl.includes('/403');

                // 检查页面标题
                const pageTitle = await page.title();

                // 简单检查是否有实际内容
                const bodyText = await page.locator('body').textContent() || '';
                const hasContent = bodyText.length > 200;

                if (!is403Page && httpStatus === 200 && hasContent) {
                    console.log(`✅ 成功访问`);
                    console.log(`   HTTP状态: ${httpStatus}`);
                    console.log(`   页面标题: ${pageTitle}`);
                    console.log(`   内容长度: ${bodyText.length} 字符`);
                    successCount++;
                } else {
                    console.log(`❌ 访问失败`);
                    if (is403Page) {
                        console.log(`   原因: 仍被重定向到403页面`);
                    } else if (httpStatus !== 200) {
                        console.log(`   原因: HTTP状态错误 ${httpStatus}`);
                    } else if (!hasContent) {
                        console.log(`   原因: 页面内容为空`);
                    }
                    failCount++;
                }

            } catch (error) {
                console.log(`💥 访问异常: ${error.message}`);
                failCount++;
            }
        }

        // 3. 输出测试结果
        console.log(`\n📋 测试结果汇总:`);
        console.log(`   总页面数: ${testPages.length}`);
        console.log(`   成功访问: ${successCount}`);
        console.log(`   访问失败: ${failCount}`);
        console.log(`   成功率: ${((successCount / testPages.length) * 100).toFixed(1)}%`);

        if (successCount === testPages.length) {
            console.log(`\n🎉 权限修复完全成功！`);
            console.log(`   所有家长中心页面都可以正常访问了。`);
            console.log(`\n📝 建议后续工作:`);
            console.log(`   1. 进行详细的功能测试`);
            console.log(`   2. 检查页面美观度和用户体验`);
            console.log(`   3. 验证移动端适配`);
            console.log(`   4. 测试家长角色用户的访问`);
        } else if (successCount > 0) {
            console.log(`\n👍 权限修复部分成功`);
            console.log(`   ${successCount}个页面可以访问，${failCount}个页面仍需检查`);
        } else {
            console.log(`\n❌ 权限修复未生效`);
            console.log(`   建议检查:`);
            console.log(`   1. 前端服务是否已重启`);
            console.log(`   2. 浏览器缓存是否已清理`);
            console.log(`   3. 是否还有其他权限检查点`);
        }

    } catch (error) {
        console.error('❌ 验证过程失败:', error.message);
    } finally {
        await browser.close();
    }
}

// 运行快速验证
quickVerifyFix()
    .then(() => {
        console.log('\n🎉 快速验证完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 验证失败:', error);
        process.exit(1);
    });