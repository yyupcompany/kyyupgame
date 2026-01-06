const { chromium } = require('playwright');

async function verifyAICenterWithAuth() {
    console.log('🚀 开始带认证的AI中心页面验证测试...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    // 监听控制台消息
    const consoleMessages = [];
    context.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text()
        });
    });

    // 监听页面错误
    const pageErrors = [];
    context.on('pageerror', error => {
        pageErrors.push(error.message);
    });

    const page = await context.newPage();

    try {
        // 1. 首先访问登录页面
        console.log('\n🔐 步骤1: 访问登录页面');
        await page.goto('http://localhost:5173/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // 2. 执行登录操作
        console.log('\n🔑 步骤2: 执行管理员登录');

        // 填写登录表单
        await page.fill('input[name="username"], input[placeholder*="用户"], input[type="text"]', 'admin');
        await page.fill('input[name="password"], input[placeholder*="密码"], input[type="password"]', '123456');

        // 点击登录按钮
        const loginButtonSelectors = [
            'button:has-text("登录")',
            '.login-button',
            '.el-button--primary',
            'button[type="submit"]'
        ];

        let loginSuccess = false;
        for (const selector of loginButtonSelectors) {
            try {
                const button = await page.$(selector);
                if (button && await button.isVisible()) {
                    await button.click();
                    console.log(`  ✓ 点击登录按钮: ${selector}`);
                    loginSuccess = true;
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!loginSuccess) {
            console.log('  ⚠️ 未找到登录按钮，尝试直接访问AI中心页面');
        }

        // 等待登录完成
        await page.waitForTimeout(3000);

        // 3. 访问AI中心页面
        console.log('\n📍 步骤3: 访问AI中心页面');
        await page.goto('http://localhost:5173/centers/ai');
        await page.waitForLoadState('networkidle');

        // 等待页面完全加载
        await page.waitForTimeout(5000);

        // 4. 检查页面加载状态
        console.log('\n📋 步骤4: 检查页面加载状态');

        // 检查页面是否成功加载（检查是否有Vue应用内容）
        const appContent = await page.$('#app');
        const hasApp = appContent !== null;
        console.log(`  ✓ Vue应用容器: ${hasApp ? '✅ 存在' : '❌ 缺失'}`);

        // 检查页面标题 - 使用更广泛的选择器
        const titleSelectors = [
            'text=智能中心',
            'h1:has-text("智能中心")',
            'h2:has-text("智能中心")',
            '.center-title:has-text("智能中心")',
            '[class*="title"]:has-text("智能中心")'
        ];

        let hasTitle = false;
        let titleElement = null;
        for (const selector of titleSelectors) {
            try {
                titleElement = await page.$(selector);
                if (titleElement && await titleElement.isVisible()) {
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
            'text=欢迎',
            'text=智能中心',
            '.welcome-section',
            '.welcome-content',
            '[class*="welcome"]'
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

        // 5. 检查AI功能模块（使用文本搜索方式）
        console.log('\n🤖 步骤5: 检查AI功能模块');

        const aiModulesText = [
            'AI智能查询',
            'AI数据分析',
            'AI模型管理',
            'AI自动化',
            'AI预测分析',
            'AI性能监控',
            'AI自动配图',
            'Function Tools',
            'AI专家咨询'
        ];

        const moduleResults = [];

        for (const moduleName of aiModulesText) {
            try {
                // 尝试通过文本内容查找
                const textElements = await page.$$(`text=${moduleName}`);
                if (textElements.length > 0) {
                    console.log(`  ✓ ${moduleName}: ✅ 找到文本`);

                    // 检查是否在可点击的元素中
                    let isInClickableElement = false;
                    for (const element of textElements) {
                        const parent = await element.$('xpath=./ancestor::*[contains(@class, "card") or contains(@class, "module") or contains(@class, "button") or @onclick]');
                        if (parent) {
                            isInClickableElement = true;
                            break;
                        }
                    }

                    moduleResults.push({
                        name: moduleName,
                        found: true,
                        clickable: isInClickableElement,
                        textCount: textElements.length
                    });
                } else {
                    console.log(`  ✗ ${moduleName}: ❌ 未找到文本`);
                    moduleResults.push({
                        name: moduleName,
                        found: false,
                        clickable: false,
                        textCount: 0
                    });
                }
            } catch (error) {
                console.log(`  ✗ ${moduleName}: ❌ 检查出错 - ${error.message}`);
                moduleResults.push({
                    name: moduleName,
                    found: false,
                    clickable: false,
                    textCount: 0,
                    error: error.message
                });
            }
        }

        // 6. 检查统计卡片
        console.log('\n📊 步骤6: 检查统计卡片');

        const statCardSelectors = [
            '.CentersStatCard',
            '.stat-card',
            '[class*="stat"][class*="card"]',
            '.stats-grid [class*="card"]',
            '.el-card'
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

        // 7. 测试模块点击功能
        console.log('\n🖱️  步骤7: 测试模块点击功能');

        let navigationTestResult = false;
        if (moduleResults.some(m => m.found && m.clickable)) {
            try {
                // 找到第一个可点击的模块
                const firstClickableModule = moduleResults.find(m => m.found && m.clickable);
                if (firstClickableModule) {
                    const moduleElement = await page.$(`text=${firstClickableModule.name}`);
                    if (moduleElement) {
                        // 点击模块
                        await moduleElement.click();
                        await page.waitForTimeout(2000);

                        // 检查是否发生了导航
                        const currentUrl = page.url();
                        if (currentUrl !== 'http://localhost:5173/centers/ai') {
                            console.log(`  ✓ 模块导航: ✅ 成功导航到 ${currentUrl}`);
                            navigationTestResult = true;
                        } else {
                            console.log(`  ✓ 模块导航: ⚠️ 点击但未发生导航`);
                        }

                        // 返回原页面
                        await page.goto('http://localhost:5173/centers/ai');
                        await page.waitForLoadState('networkidle');
                        await page.waitForTimeout(2000);
                    }
                }
            } catch (error) {
                console.log(`  ✗ 模块导航: ❌ 导航测试失败 - ${error.message}`);
            }
        } else {
            console.log(`  ✓ 模块导航: ⚠️ 没有可点击的模块可测试`);
        }

        // 8. 检查控制台错误
        console.log('\n🔍 步骤8: 检查控制台错误');

        const errors = consoleMessages.filter(msg => msg.type === 'error');
        const warnings = consoleMessages.filter(msg => msg.type === 'warning');

        console.log(`  ✓ 控制台错误数量: ${errors.length}`);
        console.log(`  ✓ 控制台警告数量: ${warnings.length}`);
        console.log(`  ✓ 页面错误数量: ${pageErrors.length}`);

        if (errors.length > 0) {
            console.log('  ❌ 控制台错误详情:');
            errors.slice(0, 5).forEach((error, index) => {
                console.log(`    ${index + 1}. ${error.text.substring(0, 100)}...`);
            });
        }

        if (pageErrors.length > 0) {
            console.log('  ❌ 页面错误详情:');
            pageErrors.slice(0, 5).forEach((error, index) => {
                console.log(`    ${index + 1}. ${error.substring(0, 100)}...`);
            });
        }

        // 9. 生成页面截图
        console.log('\n📸 步骤9: 生成页面截图');
        const screenshotPath = 'ai-center-authenticated-verification.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  ✓ 页面截图已保存: ${screenshotPath}`);

        // 10. 生成最终验证报告
        console.log('\n📊 步骤10: 生成验证报告');

        const foundModulesCount = moduleResults.filter(m => m.found).length;
        const clickableModulesCount = moduleResults.filter(m => m.clickable).length;

        const verificationResults = {
            timestamp: new Date().toISOString(),
            authentication: {
                loginAttempted: true,
                loginSuccess: loginSuccess
            },
            pageInfo: {
                url: 'http://localhost:5173/centers/ai',
                hasApp,
                title: hasTitle,
                welcome: hasWelcome,
                statCardsCount: statCards.length,
                aiModulesFound: foundModulesCount,
                aiModulesClickable: clickableModulesCount
            },
            moduleVerification: moduleResults,
            errorAnalysis: {
                consoleErrors: errors,
                consoleWarnings: warnings,
                pageErrors: pageErrors
            },
            interactionTests: {
                navigationTest: navigationTestResult
            },
            overallStatus: {
                success: hasApp && hasTitle && foundModulesCount >= 3,
                issues: []
            }
        };

        // 添加问题诊断
        if (!hasApp) verificationResults.overallStatus.issues.push('Vue应用容器未加载');
        if (!hasTitle) verificationResults.overallStatus.issues.push('页面标题缺失');
        if (!hasWelcome) verificationResults.overallStatus.issues.push('欢迎词内容缺失');
        if (foundModulesCount === 0) verificationResults.overallStatus.issues.push('所有AI功能模块都未找到');
        if (foundModulesCount < 3) verificationResults.overallStatus.issues.push(`AI功能模块数量不足，实际${foundModulesCount}个，期望至少3个`);
        if (errors.length > 5) verificationResults.overallStatus.issues.push(`存在${errors.length}个控制台错误`);
        if (pageErrors.length > 0) verificationResults.overallStatus.issues.push(`存在${pageErrors.length}个页面错误`);

        // 保存验证结果
        const fs = require('fs');
        fs.writeFileSync('ai-center-authenticated-verification-results.json', JSON.stringify(verificationResults, null, 2));

        // 输出最终结果
        console.log('\n🎯 AI中心页面带认证验证完成！');
        console.log('=' .repeat(60));
        console.log(`🔐 登录状态: ${loginSuccess ? '✅ 成功' : '❌ 失败'}`);
        console.log(`✅ 页面加载状态: ${verificationResults.overallStatus.success ? '✅ 成功' : '❌ 存在问题'}`);
        console.log(`📱 Vue应用: ${hasApp ? '✅ 正常' : '❌ 缺失'}`);
        console.log(`📄 页面标题: ${hasTitle ? '✅ 正常' : '❌ 缺失'}`);
        console.log(`👋 欢迎词: ${hasWelcome ? '✅ 正常' : '❌ 缺失'}`);
        console.log(`📊 统计卡片: ${statCards.length} 个`);
        console.log(`🤖 AI功能模块: ${foundModulesCount}/9 个找到`);
        console.log(`🖱️  可点击模块: ${clickableModulesCount} 个`);
        console.log(`🧭 导航测试: ${navigationTestResult ? '✅ 成功' : '❌ 失败'}`);
        console.log(`⚠️  控制台错误: ${errors.length} 个`);
        console.log(`🔥 页面错误: ${pageErrors.length} 个`);

        console.log('\n📋 AI功能模块详细结果:');
        moduleResults.forEach(module => {
            const status = module.found ? (module.clickable ? '✅' : '⚠️') : '❌';
            console.log(`  ${status} ${module.name}: ${module.found ? `找到(${module.textCount}处)` : '未找到'} ${module.clickable ? '可点击' : ''}`);
        });

        if (verificationResults.overallStatus.issues.length > 0) {
            console.log('\n❌ 发现的问题:');
            verificationResults.overallStatus.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }

        // 给出最终评级
        let finalGrade = 'F';
        if (verificationResults.overallStatus.success && foundModulesCount >= 6 && clickableModulesCount >= 3) {
            finalGrade = 'A';
        } else if (verificationResults.overallStatus.success && foundModulesCount >= 3) {
            finalGrade = 'B';
        } else if (foundModulesCount >= 1) {
            finalGrade = 'C';
        } else if (hasApp) {
            finalGrade = 'D';
        }

        console.log(`\n🏆 最终评级: ${finalGrade}`);

        console.log('\n📁 验证文件已生成:');
        console.log(`  - ai-center-authenticated-verification-results.json (详细数据)`);
        console.log(`  - ai-center-authenticated-verification.png (页面截图)`);

    } catch (error) {
        console.error('\n❌ 验证过程出错:', error.message);

        // 即使出错也尝试截图
        try {
            await page.screenshot({ path: 'ai-center-authenticated-error-screenshot.png' });
            console.log('📸 错误截图已保存: ai-center-authenticated-error-screenshot.png');
        } catch (screenshotError) {
            console.log('无法保存错误截图:', screenshotError.message);
        }

    } finally {
        await browser.close();
        console.log('\n🏁 AI中心页面带认证验证测试完成！');
    }
}

// 执行验证
verifyAICenterWithAuth().catch(console.error);