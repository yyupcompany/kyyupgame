const { chromium } = require('playwright');

async function testParentAssessmentCorrect() {
    console.log('开始测试家长端测评中心权限修复 (正确路径)...');

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

        // 登录家长账户
        console.log('1. 访问应用首页并登录家长账户...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // 尝试快捷登录
        const quickLoginBtn = await page.$('.quick-login-btn, [data-role="parent"], button:has-text("家长登录")');
        if (quickLoginBtn) {
            console.log('找到家长快捷登录按钮');
            await quickLoginBtn.click();
            await page.waitForTimeout(3000);
        } else {
            // 手动登录
            console.log('使用手动登录...');
            const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"]');
            if (usernameInput) {
                await usernameInput.fill('testparent');
            }
            const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
            if (passwordInput) {
                await passwordInput.fill('123456');
            }
            const loginBtn = await page.$('button[type="submit"], button:has-text("登录")');
            if (loginBtn) {
                await loginBtn.click();
                await page.waitForTimeout(3000);
            }
        }

        // 检查登录是否成功
        const currentUrl = page.url();
        console.log(`登录后URL: ${currentUrl}`);

        // 测试正确的测评路径
        const assessmentTests = [
            {
                name: '测评中心主页',
                path: '/parent-center/assessment',
                keywords: ['测评', '评估', '发育', '儿童'],
                expectedContent: ['测评', '发育', '开始测评', '2-6岁']
            },
            {
                name: '2-6岁发育测评',
                path: '/parent-center/assessment/development',
                keywords: ['发育', '测评', '2-6岁', '发育商'],
                expectedContent: ['发育测评', '开始', '儿童', '评估']
            },
            {
                name: '幼小衔接测评',
                path: '/parent-center/assessment/school-readiness',
                keywords: ['幼小', '衔接', '入学', '准备'],
                expectedContent: ['幼小衔接', '入学准备', '测评', '测试']
            },
            {
                name: '学科测评',
                path: '/parent-center/assessment/academic',
                keywords: ['学科', '测评', '1-6年级', '语文数学'],
                expectedContent: ['学科测评', '语文', '数学', '英语']
            },
            {
                name: '成长轨迹',
                path: '/parent-center/assessment/growth-trajectory',
                keywords: ['成长', '轨迹', '发展', '曲线'],
                expectedContent: ['成长轨迹', '发展', '数据', '图表']
            }
        ];

        let testResults = {
            accessible: 0,
            accessibleWithContent: 0,
            permissionDenied: 0,
            notFound: 0,
            empty: 0
        };

        for (const test of assessmentTests) {
            console.log(`\n=== 测试 ${test.name} ===`);
            console.log(`路径: ${test.path}`);

            await page.goto(`http://localhost:5173${test.path}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);

            // 获取页面信息
            const pageUrl = page.url();
            const pageTitle = await page.title();
            const pageContent = await page.content();

            console.log(`实际URL: ${pageUrl}`);
            console.log(`页面标题: ${pageTitle}`);

            // 检查是否被重定向到登录页
            if (pageUrl.includes('login') || pageContent.includes('登录')) {
                console.log('❌ 未登录或登录已过期，被重定向到登录页');
                testResults.permissionDenied++;
                continue;
            }

            // 检查是否有权限错误
            const hasPermissionError = pageContent.includes('403') ||
                                      pageContent.includes('无权限') ||
                                      pageContent.includes('访问被拒绝') ||
                                      pageContent.includes('permission denied');

            // 检查是否有404错误
            const hasNotFoundError = pageContent.includes('404') ||
                                    pageContent.includes('页面不存在') ||
                                    pageContent.includes('Not Found');

            if (hasPermissionError) {
                console.log(`❌ ${test.name} - 权限不足 (403错误)`);
                testResults.permissionDenied++;
                continue;
            }

            if (hasNotFoundError) {
                console.log(`❌ ${test.name} - 页面不存在 (404错误)`);
                testResults.notFound++;
                continue;
            }

            // 检查页面内容
            let contentMatches = 0;
            let keywordMatches = 0;

            for (const content of test.expectedContent) {
                if (pageContent.includes(content)) {
                    contentMatches++;
                }
            }

            for (const keyword of test.keywords) {
                if (pageContent.includes(keyword)) {
                    keywordMatches++;
                }
            }

            const hasSubstantialContent = pageContent.length > 2000;
            const hasInteractiveElements = await page.$$('button, input, select, .btn, [role="button"], a[href]');

            console.log(`内容匹配: ${contentMatches}/${test.expectedContent.length}`);
            console.log(`关键词匹配: ${keywordMatches}/${test.keywords.length}`);
            console.log(`页面大小: ${Math.round(pageContent.length/1024)}KB`);
            console.log(`交互元素: ${hasInteractiveElements.length}个`);

            testResults.accessible++;

            if (contentMatches >= 2 || keywordMatches >= 2 || hasSubstantialContent) {
                console.log(`✅ ${test.name} - 可以访问且有相关内容`);
                testResults.accessibleWithContent++;
            } else {
                console.log(`⚠️  ${test.name} - 可以访问但内容可能不完整`);
                testResults.empty++;
            }

            // 检查是否有具体的功能元素
            const functionalElements = await checkFunctionalElements(page);
            if (functionalElements.length > 0) {
                console.log(`  → 功能元素: ${functionalElements.join(', ')}`);
            }

            // 截图
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `assessment-${test.name.replace(/[\\s/]/g, '-')}-${timestamp}.png`;
            await page.screenshot({ path: fileName, fullPage: true });
            console.log(`  → 截图已保存: ${fileName}`);
        }

        // 检查家长端导航菜单
        console.log('\n=== 检查家长端导航菜单 ===');
        await page.goto('http://localhost:5173/parent-center/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const menuSelectors = [
            '.sidebar-menu',
            '.nav-menu',
            '.el-menu',
            '[class*="sidebar"]',
            '[class*="nav"]'
        ];

        let assessmentMenuFound = false;
        let menuItems = [];

        for (const selector of menuSelectors) {
            try {
                const menu = await page.$(selector);
                if (menu) {
                    console.log(`找到菜单容器: ${selector}`);

                    // 查找所有菜单项
                    const items = await menu.$$('li, a, .menu-item, [class*="item"]');

                    for (const item of items) {
                        try {
                            const text = await item.textContent();
                            if (text && text.trim()) {
                                menuItems.push(text.trim());
                                if (text.includes('测评') || text.includes('评估')) {
                                    assessmentMenuFound = true;
                                    console.log(`✅ 找到测评相关菜单项: ${text.trim()}`);
                                }
                            }
                        } catch (e) {
                            // 忽略单个项的错误
                        }
                    }
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!assessmentMenuFound) {
            console.log('❌ 在导航菜单中未找到测评相关项目');
            console.log('发现的菜单项:', menuItems.slice(0, 10)); // 显示前10个菜单项
        }

        // 输出测试总结
        console.log('\n=== 测试总结 ===');
        console.log(`总测试页面: ${assessmentTests.length}`);
        console.log(`✅ 可访问: ${testResults.accessible}`);
        console.log(`✅ 有实际内容: ${testResults.accessibleWithContent}`);
        console.log(`❌ 权限被拒绝: ${testResults.permissionDenied}`);
        console.log(`❌ 页面不存在: ${testResults.notFound}`);
        console.log(`⚠️  内容为空: ${testResults.empty}`);
        console.log(`📊 成功率: ${Math.round((testResults.accessibleWithContent / assessmentTests.length) * 100)}%`);

        // 判断权限修复是否成功
        if (testResults.accessibleWithContent >= 3) {
            console.log('\n✅ 权限修复成功！家长可以访问大部分测评功能');
        } else if (testResults.accessible >= 3) {
            console.log('\n⚠️  权限部分修复，但需要完善页面内容');
        } else {
            console.log('\n❌ 权限修复不成功，需要进一步检查');
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

async function checkFunctionalElements(page) {
    const functionalElements = [];

    try {
        const buttons = await page.$$('button:has-text("开始"), button:has-text("测评"), button:has-text("测试")');
        if (buttons.length > 0) functionalElements.push('测评按钮');

        const progressBars = await page.$$('.progress, .el-progress, [class*="progress"]');
        if (progressBars.length > 0) functionalElements.push('进度条');

        const charts = await page.$$('canvas, svg, .chart, [class*="chart"]');
        if (charts.length > 0) functionalElements.push('图表');

        const forms = await page.$$('form, input, select, textarea');
        if (forms.length > 0) functionalElements.push('表单');

        const cards = await page.$$('.card, .el-card, [class*="card"]');
        if (cards.length > 0) functionalElements.push('卡片');
    } catch (e) {
        // 忽略功能检查错误
    }

    return functionalElements;
}

// 运行测试
testParentAssessmentCorrect();