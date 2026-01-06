const { chromium } = require('playwright');

async function testParentAssessmentDetailed() {
    console.log('开始详细测试家长端测评中心功能...');

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
        console.log('登录家长账户...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // 尝试快速登录
        const quickLoginBtn = await page.$('.quick-login-btn, [data-role="parent"], button:has-text("家长登录")');
        if (quickLoginBtn) {
            console.log('找到快捷登录按钮');
            await quickLoginBtn.click();
            await page.waitForTimeout(2000);
        }

        // 手动登录（如果快捷登录不存在）
        if (!quickLoginBtn || await page.url().includes('login')) {
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

        // 测试各个测评功能
        const assessmentTests = [
            {
                name: '儿童发育商测评',
                path: '/parent-center/assessment/start',
                keywords: ['发育', '测评', '儿童', '成长'],
                expectedContent: ['开始测评', '发育商', '评估', '测试']
            },
            {
                name: '幼小衔接测评',
                path: '/parent-center/assessment/doing',
                keywords: ['幼小', '衔接', '入学', '准备'],
                expectedContent: ['测评', '问题', '选项', '提交']
            },
            {
                name: '测评报告',
                path: '/parent-center/assessment/report',
                keywords: ['报告', '结果', '分析', '评估'],
                expectedContent: ['测评报告', '分析', '建议', '结果']
            },
            {
                name: '成长轨迹',
                path: '/parent-center/assessment/growth-trajectory',
                keywords: ['成长', '轨迹', '发展', '曲线'],
                expectedContent: ['成长', '发展', '轨迹', '数据']
            }
        ];

        for (const test of assessmentTests) {
            console.log(`\n=== 测试 ${test.name} ===`);

            await page.goto(`http://localhost:5173${test.path}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // 获取页面内容
            const pageContent = await page.content();
            const pageTitle = await page.title();
            const currentUrl = page.url();

            console.log(`当前URL: ${currentUrl}`);
            console.log(`页面标题: ${pageTitle}`);

            // 检查是否有权限错误
            const hasPermissionError = pageContent.includes('403') ||
                                      pageContent.includes('无权限') ||
                                      pageContent.includes('访问被拒绝') ||
                                      pageContent.includes('permission') ||
                                      pageContent.includes('unauthorized');

            // 检查是否有错误页面
            const hasError = pageContent.includes('404') ||
                            pageContent.includes('页面不存在') ||
                            pageContent.includes('error');

            if (hasPermissionError) {
                console.log(`❌ ${test.name} - 权限不足，无法访问`);
                continue;
            }

            if (hasError) {
                console.log(`❌ ${test.name} - 页面错误或不存在`);
                continue;
            }

            // 检查页面内容
            let contentMatch = 0;
            let keywordMatch = 0;

            for (const content of test.expectedContent) {
                if (pageContent.includes(content)) {
                    contentMatch++;
                }
            }

            for (const keyword of test.keywords) {
                if (pageContent.includes(keyword)) {
                    keywordMatch++;
                }
            }

            // 检查是否有实际的内容（不只是空白页面）
            const hasSubstantialContent = pageContent.length > 5000; // 至少5KB的内容
            const hasInteractiveElements = await page.$$('button, input, select, .btn, [role="button"]');

            console.log(`内容匹配度: ${contentMatch}/${test.expectedContent.length}`);
            console.log(`关键词匹配: ${keywordMatch}/${test.keywords.length}`);
            console.log(`页面内容大小: ${pageContent.length} 字符`);
            console.log(`交互元素数量: ${hasInteractiveElements.length}`);

            if (contentMatch >= test.expectedContent.length * 0.6 && keywordMatch >= test.keywords.length * 0.5) {
                console.log(`✅ ${test.name} - 内容丰富，功能正常`);

                // 进一步检查功能
                await checkAssessmentFunctionality(page, test);
            } else if (hasSubstantialContent) {
                console.log(`⚠️  ${test.name} - 页面可访问但内容可能不完整`);
            } else {
                console.log(`❌ ${test.name} - 页面内容为空或加载失败`);
            }

            // 截图保存
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `assessment-${test.name.replace(/[\\s/]/g, '-')}-${timestamp}.png`;
            await page.screenshot({ path: fileName, fullPage: true });
            console.log(`截图已保存: ${fileName}`);
        }

        // 最后检查侧边栏导航
        console.log('\n=== 检查家长端导航菜单 ===');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const menuSelectors = [
            '.sidebar-menu',
            '.nav-sidebar',
            '[class*="menu"]',
            '[class*="nav"]',
            '.sidebar'
        ];

        let menuFound = false;
        for (const selector of menuSelectors) {
            try {
                const menu = await page.$(selector);
                if (menu) {
                    const menuText = await menu.textContent();
                    if (menuText && (menuText.includes('测评') || menuText.includes('评估'))) {
                        console.log(`✅ 找到包含测评的菜单: ${selector}`);
                        menuFound = true;
                        break;
                    }
                }
            } catch (e) {
                // 继续尝试
            }
        }

        if (!menuFound) {
            console.log('❌ 未找到测评相关的导航菜单');
        }

        console.log('\n✅ 详细测试完成');

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error.message);
        console.error(error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function checkAssessmentFunctionality(page, test) {
    try {
        // 检查是否有开始测评按钮
        const startButtons = await page.$$('button:has-text("开始"), button:has-text("启动"), .btn-start, [data-action="start"]');
        if (startButtons.length > 0) {
            console.log('  → 找到开始测评按钮');
        }

        // 检查是否有进度指示器
        const progressElements = await page.$$('.progress, [class*="progress"], .step, [class*="step"]');
        if (progressElements.length > 0) {
            console.log('  → 找到进度指示器');
        }

        // 检查是否有问题或选项
        const questionElements = await page.$$('.question, [class*="question"], .item, [class*="item"]');
        if (questionElements.length > 0) {
            console.log(`  → 找到 ${questionElements.length} 个问题/选项元素`);
        }

        // 检查是否有图表或数据展示
        const chartElements = await page.$$('canvas, svg, .chart, [class*="chart"], [class*="graph"]');
        if (chartElements.length > 0) {
            console.log(`  → 找到 ${chartElements.length} 个图表元素`);
        }

    } catch (error) {
        console.log(`  → 功能检查出错: ${error.message}`);
    }
}

// 运行测试
testParentAssessmentDetailed();