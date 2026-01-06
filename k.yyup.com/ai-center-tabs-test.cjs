const { chromium } = require('playwright');

// AI中心页面Tab功能详细验证测试
async function testAICenterPageTabs() {
    console.log('🚀 开始AI中心页面Tab功能详细验证测试...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    // 监听网络请求
    const networkRequests = [];
    page.on('request', request => {
        networkRequests.push({
            url: request.url(),
            method: request.method(),
            type: request.resourceType()
        });
    });

    page.on('response', response => {
        const status = response.status();
        if (status >= 400) {
            console.log(`❌ 网络请求失败: ${response.url()} - ${status}`);
        }
    });

    try {
        // 1. 访问AI中心页面
        console.log('📍 步骤1: 访问AI中心页面 http://localhost:5173/centers/ai');
        await page.goto('http://localhost:5173/centers/ai', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        // 截图初始页面
        await page.screenshot({ path: 'ai-center-initial.png' });
        console.log('✅ AI中心页面加载完成');

        // 2. 识别所有Tab标签页
        console.log('\n📍 步骤2: 识别所有Tab标签页');

        // 等待页面完全加载
        await page.waitForTimeout(3000);

        // 查找Tab元素 - 尝试多种可能的Tab选择器
        const tabSelectors = [
            'el-tabs__item',
            '.tabs-item',
            '[role="tab"]',
            '.tab-button',
            '.ai-center-tab',
            '.el-tabs-item',
            'tab-component',
            '.nav-tab',
            '[class*="tab"]'
        ];

        let allTabs = [];
        let usedSelector = null;

        for (const selector of tabSelectors) {
            try {
                const tabs = await page.locator(selector).all();
                if (tabs.length > 0) {
                    allTabs = tabs;
                    usedSelector = selector;
                    console.log(`✅ 找到 ${tabs.length} 个Tab，使用选择器: ${selector}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }

        // 如果没有找到Tab，尝试查找可能的导航元素
        if (allTabs.length === 0) {
            console.log('⚠️ 未找到标准Tab元素，尝试查找其他导航元素...');

            const navSelectors = [
                'nav button',
                '.navigation button',
                '.menu-item',
                '.nav-item',
                'button[role="tab"]',
                '[class*="nav"] button',
                '[class*="menu"] button'
            ];

            for (const selector of navSelectors) {
                try {
                    const elements = await page.locator(selector).all();
                    const clickableElements = [];

                    for (const element of elements) {
                        const isVisible = await element.isVisible();
                        const isEnabled = await element.isEnabled();
                        if (isVisible && isEnabled) {
                            clickableElements.push(element);
                        }
                    }

                    if (clickableElements.length > 0) {
                        allTabs = clickableElements;
                        usedSelector = selector;
                        console.log(`✅ 找到 ${clickableElements.length} 个可点击导航元素，使用选择器: ${selector}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        if (allTabs.length === 0) {
            console.log('❌ 未找到任何Tab或导航元素');
            // 尝试获取页面文本内容进行分析
            const pageContent = await page.content();
            console.log('页面内容长度:', pageContent.length);

            // 查找页面中所有的按钮和链接
            const buttons = await page.locator('button, a, [role="button"]').all();
            console.log(`页面中总共有 ${buttons.length} 个按钮/链接`);

            for (let i = 0; i < Math.min(buttons.length, 10); i++) {
                try {
                    const text = await buttons[i].textContent();
                    const isVisible = await buttons[i].isVisible();
                    console.log(`  按钮${i + 1}: "${text?.trim()}" (可见: ${isVisible})`);
                } catch (error) {
                    console.log(`  按钮${i + 1}: 无法获取文本`);
                }
            }
        }

        // 3. 获取页面主要内容区域
        console.log('\n📍 步骤3: 分析页面主要内容区域');

        const contentSelectors = [
            '.ai-center-content',
            '.main-content',
            '.content-area',
            '.tab-content',
            '.panel-content',
            '[class*="content"]',
            'main',
            '.container'
        ];

        let mainContent = null;
        for (const selector of contentSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    mainContent = element;
                    console.log(`✅ 找到主要内容区域: ${selector}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }

        // 4. 测试找到的Tab/导航元素
        if (allTabs.length > 0) {
            console.log(`\n📍 步骤4: 测试 ${allTabs.length} 个Tab/导航元素`);

            for (let i = 0; i < allTabs.length; i++) {
                const tab = allTabs[i];
                console.log(`\n--- 测试Tab ${i + 1}/${allTabs.length} ---`);

                try {
                    // 获取Tab文本信息
                    const tabText = await tab.textContent();
                    const isVisible = await tab.isVisible();
                    const isEnabled = await tab.isEnabled();
                    const className = await tab.getAttribute('class');

                    console.log(`Tab文本: "${tabText?.trim()}"`);
                    console.log(`可见性: ${isVisible}`);
                    console.log(`可用性: ${isEnabled}`);
                    console.log(`CSS类: ${className}`);

                    if (isVisible && isEnabled) {
                        // 截图当前状态
                        await page.screenshot({ path: `before-tab-${i + 1}.png` });

                        // 点击Tab
                        console.log(`🖱️ 点击Tab ${i + 1}`);
                        await tab.click();

                        // 等待内容加载
                        await page.waitForTimeout(2000);

                        // 截图点击后状态
                        await page.screenshot({ path: `after-tab-${i + 1}.png` });

                        // 检查是否有新的内容加载
                        const contentChanged = await checkContentChange(page, i + 1);
                        console.log(`内容变化: ${contentChanged}`);

                        // 检查控制台错误
                        const recentErrors = consoleMessages.filter(
                            msg => msg.type === 'error' &&
                            consoleMessages.indexOf(msg) > consoleMessages.length - 10
                        );

                        if (recentErrors.length > 0) {
                            console.log('⚠️ 发现控制台错误:');
                            recentErrors.forEach(error => {
                                console.log(`  - ${error.text}`);
                            });
                        } else {
                            console.log('✅ 无控制台错误');
                        }

                    } else {
                        console.log(`⚠️ Tab不可用 (可见: ${isVisible}, 可用: ${isEnabled})`);
                    }

                } catch (error) {
                    console.log(`❌ Tab ${i + 1} 测试失败:`, error.message);
                }

                // 等待一下再测试下一个Tab
                await page.waitForTimeout(1000);
            }
        }

        // 5. 测试页面中的交互元素
        console.log('\n📍 步骤5: 测试页面交互元素');

        const interactiveElements = [
            { selector: 'input[type="text"]', name: '文本输入框' },
            { selector: 'input[type="search"]', name: '搜索框' },
            { selector: 'button:not([disabled])', name: '按钮' },
            { selector: 'select', name: '下拉菜单' },
            { selector: 'textarea', name: '文本域' },
            { selector: '.el-button', name: 'Element UI按钮' },
            { selector: '.ai-function-button', name: 'AI功能按钮' }
        ];

        for (const elementInfo of interactiveElements) {
            try {
                const elements = await page.locator(elementInfo.selector).all();
                const visibleElements = [];

                for (const element of elements) {
                    if (await element.isVisible()) {
                        visibleElements.push(element);
                    }
                }

                if (visibleElements.length > 0) {
                    console.log(`✅ 找到 ${visibleElements.length} 个${elementInfo.name}`);

                    // 测试前几个元素
                    const testCount = Math.min(3, visibleElements.length);
                    for (let i = 0; i < testCount; i++) {
                        try {
                            if (elementInfo.selector.includes('input')) {
                                await visibleElements[i].fill('测试输入');
                                console.log(`  ✅ ${elementInfo.name}${i + 1} 可以输入文本`);
                            } else {
                                // 对于按钮，只测试悬停
                                await visibleElements[i].hover();
                                console.log(`  ✅ ${elementInfo.name}${i + 1} 可以悬停`);
                            }
                        } catch (error) {
                            console.log(`  ❌ ${elementInfo.name}${i + 1} 测试失败: ${error.message}`);
                        }
                    }
                }
            } catch (error) {
                console.log(`⚠️ ${elementInfo.name}测试失败: ${error.message}`);
            }
        }

        // 6. 最终页面截图
        console.log('\n📍 步骤6: 最终页面截图');
        await page.screenshot({ path: 'ai-center-final.png', fullPage: true });

        // 7. 生成测试报告
        console.log('\n📍 步骤7: 生成测试报告');

        const report = {
            timestamp: new Date().toISOString(),
            pageInfo: {
                url: 'http://localhost:5173/centers/ai',
                title: await page.title(),
                finalUrl: page.url()
            },
            tabs: {
                found: allTabs.length,
                selector: usedSelector,
                tested: allTabs.length
            },
            consoleErrors: consoleMessages.filter(msg => msg.type === 'error'),
            networkRequests: networkRequests.length,
            screenshots: [
                'ai-center-initial.png',
                'ai-center-final.png'
            ]
        };

        // 添加Tab截图
        for (let i = 0; i < allTabs.length; i++) {
            report.screenshots.push(`before-tab-${i + 1}.png`);
            report.screenshots.push(`after-tab-${i + 1}.png`);
        }

        return report;

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// 检查内容是否发生变化
async function checkContentChange(page, tabIndex) {
    try {
        // 等待可能的动画或加载
        await page.waitForTimeout(1000);

        // 检查是否有加载指示器
        const loadingSelectors = [
            '.loading',
            '.el-loading',
            '[class*="loading"]',
            '.spinner',
            '.skeleton'
        ];

        let hasLoading = false;
        for (const selector of loadingSelectors) {
            try {
                const loading = page.locator(selector);
                if (await loading.isVisible({ timeout: 1000 })) {
                    hasLoading = true;
                    break;
                }
            } catch (error) {
                continue;
            }
        }

        if (hasLoading) {
            console.log('  检测到加载指示器，等待加载完成...');
            await page.waitForTimeout(3000);
        }

        // 获取当前页面的主要内容文本
        const contentSelectors = [
            '.main-content',
            '.content-area',
            '.tab-content',
            '.panel-content',
            'main',
            '.container'
        ];

        let contentText = '';
        for (const selector of contentSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 })) {
                    contentText = await element.textContent();
                    break;
                }
            } catch (error) {
                continue;
            }
        }

        // 如果没有找到内容区域，获取body文本
        if (!contentText) {
            contentText = await page.locator('body').textContent();
        }

        return {
            hasContent: contentText && contentText.trim().length > 0,
            contentLength: contentText ? contentText.length : 0,
            hasLoading: hasLoading
        };

    } catch (error) {
        console.log(`内容检查失败: ${error.message}`);
        return {
            hasContent: false,
            contentLength: 0,
            hasLoading: false,
            error: error.message
        };
    }
}

// 执行测试
testAICenterPageTabs()
    .then(report => {
        console.log('\n🎉 AI中心页面Tab功能验证完成！');
        console.log('\n📊 测试报告:');
        console.log(JSON.stringify(report, null, 2));

        // 保存报告到文件
        const fs = require('fs');
        fs.writeFileSync(
            `ai-center-tabs-test-report-${Date.now()}.json`,
            JSON.stringify(report, null, 2)
        );

        console.log(`\n📄 详细报告已保存到: ai-center-tabs-test-report-${Date.now()}.json`);
    })
    .catch(error => {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    });