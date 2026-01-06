const { chromium } = require('playwright');

async function verifyAICenterPageEnhanced() {
    console.log('🚀 开始AI中心页面增强验证测试...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text()
        });
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });

    try {
        // 1. 访问AI中心页面
        console.log('\n📍 步骤1: 访问AI中心页面');
        await page.goto('http://localhost:5173/centers/ai');
        await page.waitForLoadState('networkidle');

        // 等待页面加载完成
        await page.waitForTimeout(5000);

        // 2. 检查页面基本加载状态
        console.log('\n📋 步骤2: 检查页面加载状态');

        // 检查标题 - 使用多种选择器
        const titleSelectors = [
            'text=智能中心',
            'text=欢迎来到智能中心',
            '.center-title',
            '[class*="title"]'
        ];

        let hasTitle = false;
        for (const selector of titleSelectors) {
            try {
                const element = await page.$(selector);
                if (element && await element.isVisible()) {
                    hasTitle = true;
                    console.log(`  ✓ 智能中心标题: ✅ 找到 (${selector})`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }
        if (!hasTitle) {
            console.log(`  ✓ 智能中心标题: ❌ 缺失`);
        }

        // 检查欢迎词
        const welcomeSelectors = [
            'text=欢迎来到智能中心',
            'text=探索强大的人工智能功能',
            '.welcome-section',
            '.welcome-content'
        ];

        let hasWelcome = false;
        for (const selector of welcomeSelectors) {
            try {
                const element = await page.$(selector);
                if (element && await element.isVisible()) {
                    hasWelcome = true;
                    console.log(`  ✓ 欢迎词内容: ✅ 找到 (${selector})`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }
        if (!hasWelcome) {
            console.log(`  ✓ 欢迎词内容: ❌ 缺失`);
        }

        // 检查统计卡片区域
        const statCardSelectors = [
            '.CentersStatCard',
            '.stat-card',
            '.stats-grid-unified',
            '.stats-section [class*="card"]'
        ];

        let statCards = [];
        for (const selector of statCardSelectors) {
            try {
                const cards = await page.$$(selector);
                if (cards.length > 0) {
                    statCards = cards;
                    console.log(`  ✓ 统计卡片: ${cards.length} 个 (${selector})`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }
        if (statCards.length === 0) {
            console.log(`  ✓ 统计卡片: ❌ 未找到`);
        }

        // 检查AI功能模块卡片
        const moduleSelectors = [
            '.module-card',
            '.modules-grid [class*="card"]',
            '.ai-modules [class*="module"]',
            '.ai-modules .module-card'
        ];

        let aiModules = [];
        for (const selector of moduleSelectors) {
            try {
                const modules = await page.$$(selector);
                if (modules.length > 0) {
                    aiModules = modules;
                    console.log(`  ✓ AI功能模块: ${modules.length} 个 (${selector})`);
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }
        if (aiModules.length === 0) {
            console.log(`  ✓ AI功能模块: ❌ 未找到`);
        }

        // 3. 详细验证AI功能模块
        console.log('\n🔗 步骤3: 验证AI功能模块内容');

        // 检查AI功能模块的文本内容
        const expectedModules = [
            { name: 'AI智能查询', text: 'AI智能查询' },
            { name: 'AI数据分析', text: 'AI数据分析' },
            { name: 'AI模型管理', text: 'AI模型管理' },
            { name: 'AI自动化', text: 'AI自动化' },
            { name: 'AI预测分析', text: 'AI预测分析' },
            { name: 'AI性能监控', text: 'AI性能监控' },
            { name: 'AI自动配图', text: 'AI自动配图' },
            { name: 'Function Tools', text: 'Function Tools' },
            { name: 'AI专家咨询', text: 'AI专家咨询' }
        ];

        const moduleResults = [];

        // 尝试通过文本内容查找
        for (const module of expectedModules) {
            try {
                const textElement = await page.$(`text="${module.text}"`);
                if (textElement) {
                    console.log(`  ✓ ${module.name}: ✅ 通过文本找到`);

                    // 查找包含该文本的父模块卡片
                    const moduleCard = await textElement.$('xpath=./ancestor::*[contains(@class, "module-card")]');
                    const isClickable = moduleCard ? await moduleCard.isVisible() : false;

                    moduleResults.push({
                        name: module.name,
                        found: true,
                        clickable: isClickable,
                        textFound: true
                    });
                } else {
                    console.log(`  ✗ ${module.name}: ❌ 未找到文本`);
                    moduleResults.push({
                        name: module.name,
                        found: false,
                        clickable: false,
                        textFound: false
                    });
                }
            } catch (error) {
                console.log(`  ✗ ${module.name}: ❌ 检查出错 - ${error.message}`);
                moduleResults.push({
                    name: module.name,
                    found: false,
                    clickable: false,
                    textFound: false,
                    error: error.message
                });
            }
        }

        // 4. 测试导航功能
        console.log('\n🧭 步骤4: 测试导航功能');

        // 测试点击第一个模块卡片进行导航
        if (aiModules.length > 0) {
            try {
                // 监听导航事件
                let navigatedUrl = null;
                page.on('response', response => {
                    if (response.url().includes('/ai/') || response.url().includes('/admin/')) {
                        navigatedUrl = response.url();
                    }
                });

                await aiModules[0].click();
                await page.waitForTimeout(2000);

                if (navigatedUrl) {
                    console.log(`  ✓ 模块导航: ✅ 成功导航到 ${navigatedUrl}`);
                } else {
                    console.log(`  ✓ 模块导航: ⚠️ 点击但未检测到导航`);
                }

                // 返回原页面
                await page.goto('http://localhost:5173/centers/ai');
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(2000);
            } catch (error) {
                console.log(`  ✗ 模块导航: ❌ 导航测试失败 - ${error.message}`);
            }
        }

        // 5. 检查控制台错误
        console.log('\n🔍 步骤5: 检查控制台错误');

        const errors = consoleMessages.filter(msg => msg.type === 'error');
        const warnings = consoleMessages.filter(msg => msg.type === 'warning');

        console.log(`  ✓ 控制台错误数量: ${errors.length}`);
        console.log(`  ✓ 控制台警告数量: ${warnings.length}`);
        console.log(`  ✓ 页面错误数量: ${pageErrors.length}`);

        if (errors.length > 0) {
            console.log('  ❌ 控制台错误详情:');
            errors.forEach((error, index) => {
                console.log(`    ${index + 1}. ${error.text}`);
            });
        }

        if (pageErrors.length > 0) {
            console.log('  ❌ 页面错误详情:');
            pageErrors.forEach((error, index) => {
                console.log(`    ${index + 1}. ${error}`);
            });
        }

        // 6. 测试交互功能
        console.log('\n🖱️  步骤6: 测试交互功能');

        // 测试统计卡片点击
        let statCardClickTest = false;
        if (statCards.length > 0) {
            try {
                const firstStatCard = statCards[0];
                await firstStatCard.click();
                console.log('  ✓ 统计卡片点击: ✅ 响应正常');
                statCardClickTest = true;
            } catch (error) {
                console.log(`  ✗ 统计卡片点击: ❌ 点击失败 - ${error.message}`);
            }
        }

        // 测试"创建AI模型"按钮
        let createModelButtonTest = false;
        try {
            const createButtonSelectors = [
                'text=创建AI模型',
                'button:has-text("创建AI模型")',
                'button:has-text("创建")',
                '.el-button:has-text("创建")'
            ];

            for (const selector of createButtonSelectors) {
                const button = await page.$(selector);
                if (button) {
                    await button.click();
                    console.log(`  ✓ 创建AI模型按钮: ✅ 点击响应 (${selector})`);
                    createModelButtonTest = true;
                    break;
                }
            }
            if (!createModelButtonTest) {
                console.log('  ✓ 创建AI模型按钮: ⚠️ 未找到按钮');
            }
        } catch (error) {
            console.log(`  ✗ 创建AI模型按钮: ❌ 点击失败 - ${error.message}`);
        }

        // 7. 生成页面截图
        console.log('\n📸 步骤7: 生成页面截图');
        const screenshotPath = 'ai-center-enhanced-verification.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  ✓ 页面截图已保存: ${screenshotPath}`);

        // 8. 生成验证报告
        console.log('\n📊 步骤8: 生成验证报告');

        const verificationResults = {
            timestamp: new Date().toISOString(),
            pageInfo: {
                url: 'http://localhost:5173/centers/ai',
                title: hasTitle,
                welcome: hasWelcome,
                statCardsCount: statCards.length,
                aiModulesCount: aiModules.length
            },
            moduleVerification: moduleResults,
            errorAnalysis: {
                consoleErrors: errors,
                consoleWarnings: warnings,
                pageErrors: pageErrors
            },
            interactionTests: {
                statCardClick: statCardClickTest,
                createModelButton: createModelButtonTest
            },
            overallStatus: {
                success: hasTitle && hasWelcome && statCards.length >= 1 && aiModules.length >= 1,
                issues: []
            }
        };

        // 添加问题诊断
        if (!hasTitle) verificationResults.overallStatus.issues.push('页面标题缺失');
        if (!hasWelcome) verificationResults.overallStatus.issues.push('欢迎词内容缺失');
        if (statCards.length === 0) verificationResults.overallStatus.issues.push('统计卡片未找到');
        if (aiModules.length === 0) verificationResults.overallStatus.issues.push('AI功能模块未找到');
        if (errors.length > 0) verificationResults.overallStatus.issues.push(`存在${errors.length}个控制台错误`);
        if (pageErrors.length > 0) verificationResults.overallStatus.issues.push(`存在${pageErrors.length}个页面错误`);

        // 保存验证结果
        const fs = require('fs');
        fs.writeFileSync('ai-center-enhanced-verification-results.json', JSON.stringify(verificationResults, null, 2));

        // 输出最终结果
        console.log('\n🎯 AI中心页面增强验证完成！');
        console.log('=' .repeat(60));
        console.log(`✅ 页面加载状态: ${verificationResults.overallStatus.success ? '✅ 成功' : '❌ 存在问题'}`);
        console.log(`📄 页面标题: ${hasTitle ? '✅ 正常' : '❌ 缺失'}`);
        console.log(`👋 欢迎词: ${hasWelcome ? '✅ 正常' : '❌ 缺失'}`);
        console.log(`📊 统计卡片: ${statCards.length} 个`);
        console.log(`🤖 AI功能模块: ${aiModules.length} 个`);
        console.log(`⚠️  控制台错误: ${errors.length} 个`);
        console.log(`🔥 页面错误: ${pageErrors.length} 个`);

        console.log('\n📋 AI功能模块验证结果:');
        moduleResults.forEach(module => {
            const status = module.found ? '✅' : '❌';
            console.log(`  ${status} ${module.name}: ${module.found ? '找到' : '未找到'}`);
        });

        if (verificationResults.overallStatus.issues.length > 0) {
            console.log('\n❌ 发现的问题:');
            verificationResults.overallStatus.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }

        console.log('\n📁 验证文件已生成:');
        console.log(`  - ai-center-enhanced-verification-results.json (详细数据)`);
        console.log(`  - ai-center-enhanced-verification.png (页面截图)`);

    } catch (error) {
        console.error('\n❌ 验证过程出错:', error.message);

        // 即使出错也尝试截图
        try {
            await page.screenshot({ path: 'ai-center-enhanced-error-screenshot.png' });
            console.log('📸 错误截图已保存: ai-center-enhanced-error-screenshot.png');
        } catch (screenshotError) {
            console.log('无法保存错误截图:', screenshotError.message);
        }

    } finally {
        await browser.close();
        console.log('\n🏁 AI中心页面增强验证测试完成！');
    }
}

// 执行验证
verifyAICenterPageEnhanced().catch(console.error);