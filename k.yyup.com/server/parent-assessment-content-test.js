const { chromium } = require('playwright');

async function testParentAssessmentContent() {
    console.log('开始详细检查家长端测评页面内容和渲染...');

    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await browser.newContext({
            viewport: { width: 1366, height: 768 }
        });

        const page = await context.newPage();

        // 监听控制台错误和日志
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || type === 'warn') {
                console.log(`浏览器控制台 [${type.toUpperCase()}]: ${text}`);
            }
        });

        page.on('pageerror', error => {
            console.log(`页面错误: ${error.message}`);
        });

        // 步骤1: 确认登录状态
        console.log('1. 访问应用首页并确认登录状态...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // 检查是否已经登录
        const isLoggedIn = await page.evaluate(() => {
            // 检查localStorage中是否有用户信息
            const userToken = localStorage.getItem('token');
            const userInfo = localStorage.getItem('user');
            return {
                hasToken: !!userToken,
                hasUser: !!userInfo,
                tokenLength: userToken ? userToken.length : 0
            };
        });

        console.log('登录状态:', isLoggedIn);

        if (!isLoggedIn.hasToken) {
            console.log('未检测到登录状态，尝试登录...');
            // 尝试快捷登录
            const quickLoginBtn = await page.$('.quick-login-btn, [data-role="parent"]');
            if (quickLoginBtn) {
                await quickLoginBtn.click();
                await page.waitForTimeout(3000);
            } else {
                // 手动登录
                const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"]');
                if (usernameInput) await usernameInput.fill('testparent');

                const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
                if (passwordInput) await passwordInput.fill('123456');

                const loginBtn = await page.$('button[type="submit"], button:has-text("登录")');
                if (loginBtn) {
                    await loginBtn.click();
                    await page.waitForTimeout(3000);
                }
            }

            // 重新检查登录状态
            const loginCheck = await page.evaluate(() => {
                const userToken = localStorage.getItem('token');
                const userInfo = localStorage.getItem('user');
                return { hasToken: !!userToken, hasUser: !!userInfo };
            });

            console.log('登录后状态:', loginCheck);
        }

        // 步骤2: 测试测评页面内容
        const assessmentPages = [
            {
                name: '测评中心主页',
                path: '/parent-center/assessment',
                expectedSelectors: [
                    '.hero-section',
                    '.features-section',
                    'h1',
                    '.el-button'
                ]
            },
            {
                name: '2-6岁发育测评',
                path: '/parent-center/assessment/development',
                expectedSelectors: [
                    '.assessment-index-page',
                    '.hero-section',
                    'h1:has-text("2-6岁")',
                    '.features-grid',
                    '.el-button'
                ]
            },
            {
                name: '幼小衔接测评',
                path: '/parent-center/assessment/school-readiness',
                expectedSelectors: [
                    '.school-readiness-assessment',
                    '.assessment-header',
                    'h1:has-text("幼小衔接")',
                    '.el-card',
                    '.assessment-intro'
                ]
            },
            {
                name: '学科测评',
                path: '/parent-center/assessment/academic',
                expectedSelectors: [
                    '.academic-assessment-page',
                    '.assessment-header',
                    'h1:has-text("学科测评")',
                    '.grade-selection',
                    '.subject-cards'
                ]
            },
            {
                name: '成长轨迹',
                path: '/parent-center/assessment/growth-trajectory',
                expectedSelectors: [
                    '.growth-trajectory-page',
                    '.trajectory-header',
                    '.chart-container',
                    '.growth-data',
                    '.el-tabs'
                ]
            }
        ];

        let successfulPages = 0;
        let totalTests = assessmentPages.length;

        for (const pageTest of assessmentPages) {
            console.log(`\n=== 测试 ${pageTest.name} ===`);

            await page.goto(`http://localhost:5173${pageTest.path}`, {
                waitUntil: 'networkidle',
                timeout: 10000
            });
            await page.waitForTimeout(3000);

            // 等待Vue组件渲染
            await page.waitForFunction(() => {
                return document.readyState === 'complete' &&
                       !document.querySelector('.loading') &&
                       !document.querySelector('[data-testid="loading"]');
            }, { timeout: 5000 }).catch(() => {
                console.log('等待页面加载超时，继续分析...');
            });

            const currentUrl = page.url();
            console.log(`当前URL: ${currentUrl}`);

            // 检查页面是否被重定向
            if (currentUrl.includes('login')) {
                console.log('❌ 被重定向到登录页面，权限检查失败');
                continue;
            }

            // 检查页面内容
            let foundElements = 0;
            let detailedContent = [];

            for (const selector of pageTest.expectedSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        foundElements++;
                        const isVisible = await element.isVisible();
                        const text = await element.textContent();

                        detailedContent.push({
                            selector,
                            found: true,
                            visible: isVisible,
                            textLength: text ? text.length : 0,
                            text: text ? text.substring(0, 100) + (text.length > 100 ? '...' : '') : ''
                        });
                    } else {
                        detailedContent.push({ selector, found: false });
                    }
                } catch (error) {
                    detailedContent.push({ selector, found: false, error: error.message });
                }
            }

            console.log(`找到的元素: ${foundElements}/${pageTest.expectedSelectors.length}`);

            // 详细输出找到的元素
            for (const content of detailedContent) {
                if (content.found) {
                    console.log(`  ✅ ${content.selector} - 可见: ${content.visible}, 长度: ${content.textLength}`);
                    if (content.text && content.textLength > 0) {
                        console.log(`     内容: ${content.text.substring(0, 50)}...`);
                    }
                } else {
                    console.log(`  ❌ ${content.selector} - 未找到`);
                }
            }

            // 检查页面整体内容
            const pageContent = await page.content();
            const bodyContent = await page.evaluate(() => document.body.innerHTML);

            console.log(`页面总大小: ${Math.round(pageContent.length/1024)}KB`);
            console.log(`body内容大小: ${Math.round(bodyContent.length/1024)}KB`);

            // 检查是否有实际的Vue组件内容
            const hasVueApp = await page.evaluate(() => {
                return !!document.querySelector('#app') &&
                       document.querySelector('#app').children.length > 0;
            });

            console.log(`Vue应用已渲染: ${hasVueApp}`);

            // 检查是否有错误信息
            const hasErrorMessages = await page.evaluate(() => {
                const errorSelectors = [
                    '.error-message',
                    '[class*="error"]',
                    '[class*="warning"]',
                    '.el-message--error',
                    '.el-notification--error'
                ];

                return errorSelectors.some(selector => {
                    const element = document.querySelector(selector);
                    return element && element.offsetParent !== null;
                });
            });

            if (hasErrorMessages) {
                console.log('⚠️  页面显示错误信息');
            }

            // 获取页面的主要标题
            const mainTitles = await page.$$eval('h1, h2, h3', elements =>
                elements.map(el => el.textContent.trim()).filter(text => text)
            );

            if (mainTitles.length > 0) {
                console.log('页面标题:', mainTitles.slice(0, 3));
                successfulPages++;
            }

            // 截图
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const screenshotName = `assessment-${pageTest.name.replace(/\\s/g, '-')}-${timestamp}.png`;
            await page.screenshot({
                path: screenshotName,
                fullPage: true,
                quality: 90
            });
            console.log(`截图已保存: ${screenshotName}`);
        }

        // 最终总结
        console.log('\n=== 内容分析总结 ===');
        console.log(`成功渲染页面: ${successfulPages}/${totalTests}`);
        console.log(`渲染成功率: ${Math.round((successfulPages / totalTests) * 100)}%`);

        if (successfulPages >= totalTests * 0.8) {
            console.log('✅ 测评页面内容渲染正常，权限修复成功！');
        } else if (successfulPages >= totalTests * 0.5) {
            console.log('⚠️  部分页面内容渲染正常，可能存在组件加载问题');
        } else {
            console.log('❌ 大部分页面内容为空，可能存在权限或组件渲染问题');
        }

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error.message);
        console.error(error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
testParentAssessmentContent();