const { chromium } = require('playwright');

async function verifyAICenterPage() {
    console.log('🚀 开始AI中心页面最终验证测试...');

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
        await page.waitForTimeout(3000);

        // 2. 检查页面基本加载状态
        console.log('\n📋 步骤2: 检查页面加载状态');

        // 检查标题
        const titleElement = await page.$('text=智能中心');
        const hasTitle = titleElement !== null;
        console.log(`  ✓ 智能中心标题: ${hasTitle ? '✅ 显示' : '❌ 缺失'}`);

        // 检查欢迎词
        const welcomeElement = await page.$('text=欢迎使用智能中心');
        const hasWelcome = welcomeElement !== null;
        console.log(`  ✓ 欢迎词内容: ${hasWelcome ? '✅ 显示' : '❌ 缺失'}`);

        // 检查统计卡片区域
        const statCards = await page.$$('.stat-card, .el-card, [class*="stat"], [class*="card"]');
        console.log(`  ✓ 统计卡片数量: ${statCards.length} 个`);

        // 检查AI功能模块卡片
        const aiModules = await page.$$('[class*="ai-card"], [class*="module"], .function-card');
        console.log(`  ✓ AI功能模块数量: ${aiModules.length} 个`);

        // 3. 详细验证AI功能模块
        console.log('\n🔗 步骤3: 验证AI功能模块跳转');

        const expectedModules = [
            { name: 'AI智能查询', selector: 'text=AI智能查询', expectedPath: '/ai/query' },
            { name: 'AI数据分析', selector: 'text=AI数据分析', expectedPath: '/ai/analytics' },
            { name: 'AI模型管理', selector: 'text=AI模型管理', expectedPath: '/ai/models' },
            { name: 'AI自动化', selector: 'text=AI自动化', expectedPath: '/ai/automation/WorkflowAutomation' },
            { name: 'AI预测分析', selector: 'text=AI预测分析', expectedPath: '/ai/predictions' },
            { name: 'AI性能监控', selector: 'text=AI性能监控', expectedPath: '/ai/monitoring/AIPerformanceMonitor' },
            { name: 'AI自动配图', selector: 'text=AI自动配图', expectedPath: '/admin/image-replacement' },
            { name: 'Function Tools', selector: 'text=Function Tools', expectedPath: '/ai-center/function-tools' },
            { name: 'AI专家咨询', selector: 'text=AI专家咨询', expectedPath: '/ai-center/expert-consultation' }
        ];

        const moduleResults = [];

        for (const module of expectedModules) {
            try {
                const element = await page.$(module.selector);
                if (element) {
                    console.log(`  ✓ ${module.name}: ✅ 找到元素`);

                    // 检查是否可点击
                    const isVisible = await element.isVisible();
                    const isEnabled = await element.isEnabled();
                    console.log(`    - 可见性: ${isVisible ? '✅' : '❌'}`);
                    console.log(`    - 可点击: ${isEnabled ? '✅' : '❌'}`);

                    // 检查href属性
                    const href = await element.getAttribute('href');
                    if (href) {
                        console.log(`    - 链接: ${href}`);
                        moduleResults.push({
                            name: module.name,
                            found: true,
                            clickable: isEnabled,
                            href: href,
                            expected: module.expectedPath,
                            correct: href.includes(module.expectedPath.replace('/', ''))
                        });
                    } else {
                        moduleResults.push({
                            name: module.name,
                            found: true,
                            clickable: isEnabled,
                            href: null,
                            expected: module.expectedPath,
                            correct: false
                        });
                    }
                } else {
                    console.log(`  ✗ ${module.name}: ❌ 未找到元素`);
                    moduleResults.push({
                        name: module.name,
                        found: false,
                        clickable: false,
                        href: null,
                        expected: module.expectedPath,
                        correct: false
                    });
                }
            } catch (error) {
                console.log(`  ✗ ${module.name}: ❌ 检查出错 - ${error.message}`);
                moduleResults.push({
                    name: module.name,
                    found: false,
                    clickable: false,
                    href: null,
                    expected: module.expectedPath,
                    correct: false,
                    error: error.message
                });
            }
        }

        // 4. 检查控制台错误
        console.log('\n🔍 步骤4: 检查控制台错误');

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

        // 5. 测试交互功能
        console.log('\n🖱️  步骤5: 测试交互功能');

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
            const createButton = await page.$('text=创建AI模型, button:has-text("创建")');
            if (createButton) {
                await createButton.click();
                console.log('  ✓ 创建AI模型按钮: ✅ 点击响应');
                createModelButtonTest = true;
            } else {
                console.log('  ✓ 创建AI模型按钮: ⚠️ 未找到按钮');
            }
        } catch (error) {
            console.log(`  ✗ 创建AI模型按钮: ❌ 点击失败 - ${error.message}`);
        }

        // 6. 生成页面截图
        console.log('\n📸 步骤6: 生成页面截图');
        const screenshotPath = 'ai-center-page-verification.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  ✓ 页面截图已保存: ${screenshotPath}`);

        // 7. 生成验证报告
        console.log('\n📊 步骤7: 生成验证报告');

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
                success: hasTitle && hasWelcome && statCards.length >= 4 && aiModules.length >= 6,
                issues: []
            }
        };

        // 添加问题诊断
        if (!hasTitle) verificationResults.overallStatus.issues.push('页面标题缺失');
        if (!hasWelcome) verificationResults.overallStatus.issues.push('欢迎词内容缺失');
        if (statCards.length < 4) verificationResults.overallStatus.issues.push(`统计卡片数量不足，实际${statCards.length}个，期望至少4个`);
        if (aiModules.length < 6) verificationResults.overallStatus.issues.push(`AI功能模块数量不足，实际${aiModules.length}个，期望至少6个`);
        if (errors.length > 0) verificationResults.overallStatus.issues.push(`存在${errors.length}个控制台错误`);
        if (pageErrors.length > 0) verificationResults.overallStatus.issues.push(`存在${pageErrors.length}个页面错误`);

        // 保存验证结果
        const fs = require('fs');
        fs.writeFileSync('ai-center-verification-results.json', JSON.stringify(verificationResults, null, 2));

        // 输出最终结果
        console.log('\n🎯 AI中心页面验证完成！');
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
            const status = module.found ? (module.correct ? '✅' : '⚠️') : '❌';
            console.log(`  ${status} ${module.name}: ${module.found ? '找到' : '未找到'} ${module.href ? `(${module.href})` : ''}`);
        });

        if (verificationResults.overallStatus.issues.length > 0) {
            console.log('\n❌ 发现的问题:');
            verificationResults.overallStatus.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }

        console.log('\n📁 验证文件已生成:');
        console.log(`  - ai-center-verification-results.json (详细数据)`);
        console.log(`  - ai-center-page-verification.png (页面截图)`);

    } catch (error) {
        console.error('\n❌ 验证过程出错:', error.message);

        // 即使出错也尝试截图
        try {
            await page.screenshot({ path: 'ai-center-error-screenshot.png' });
            console.log('📸 错误截图已保存: ai-center-error-screenshot.png');
        } catch (screenshotError) {
            console.log('无法保存错误截图:', screenshotError.message);
        }

    } finally {
        await browser.close();
        console.log('\n🏁 AI中心页面验证测试完成！');
    }
}

// 执行验证
verifyAICenterPage().catch(console.error);