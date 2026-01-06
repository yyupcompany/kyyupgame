const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 创建截图目录
const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

// 样式检测脚本
const styleDetectionScript = () => {
    // 检测CSS变量（设计令牌）
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = {};
    for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--')) {
            cssVars[prop] = rootStyles.getPropertyValue(prop);
        }
    }

    // 检测主要组件的样式类
    const components = {
        header: document.querySelector('header, .header, .navbar, .el-header')?.className || 'not-found',
        sidebar: document.querySelector('.sidebar, aside, .el-aside, .el-menu')?.className || 'not-found',
        main: document.querySelector('main, .main-content, .el-main')?.className || 'not-found',
        cards: Array.from(document.querySelectorAll('.card, .app-card, .el-card')).slice(0, 5).map(el => el.className),
        buttons: Array.from(document.querySelectorAll('.el-button, .btn')).slice(0, 10).map(el => el.className)
    };

    // 检测颜色使用情况
    const computedStyles = {
        primaryColor: rootStyles.getPropertyValue('--el-color-primary') || rootStyles.getPropertyValue('--primary-color') || 'not-found',
        backgroundColor: rootStyles.getPropertyValue('--bg-color') || rootStyles.getPropertyValue('--background-color') || rootStyles.getPropertyValue('--el-bg-color') || 'not-found',
        textColor: rootStyles.getPropertyValue('--text-color') || rootStyles.getPropertyValue('--el-text-color-primary') || 'not-found',
        successColor: rootStyles.getPropertyValue('--el-color-success') || 'not-found',
        warningColor: rootStyles.getPropertyValue('--el-color-warning') || 'not-found',
        dangerColor: rootStyles.getPropertyValue('--el-color-danger') || 'not-found'
    };

    // 检测Element Plus主题
    const elementPlusTheme = {
        primary: rootStyles.getPropertyValue('--el-color-primary'),
        success: rootStyles.getPropertyValue('--el-color-success'),
        warning: rootStyles.getPropertyValue('--el-color-warning'),
        danger: rootStyles.getPropertyValue('--el-color-danger'),
        info: rootStyles.getPropertyValue('--el-color-info')
    };

    return {
        cssVariables: cssVars,
        components: components,
        colors: computedStyles,
        elementPlusTheme: elementPlusTheme,
        pageInfo: {
            title: document.title,
            url: window.location.href,
            userAgent: navigator.userAgent
        }
    };
};

async function runStyleDetection() {
    const browser = await chromium.launch({
        headless: false,  // 设置为false以便查看浏览器操作
        slowMo: 1000     // 减慢操作速度
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 配置控制台监听
    page.on('console', msg => {
        console.log(`浏览器控制台: ${msg.type()}: ${msg.text()}`);
    });

    // 配置页面错误监听
    page.on('pageerror', error => {
        console.error(`页面错误: ${error.message}`);
    });

    try {
        const results = {};

        // 定义角色登录信息
        const roles = [
            { name: 'admin', username: 'admin', password: '123456', role: '管理员' },
            { name: 'principal', username: 'principal', password: '123456', role: '园长' },
            { name: 'teacher', username: 'test_teacher', password: 'admin123', role: '老师' },
            { name: 'parent', username: 'test_parent', password: 'admin123', role: '家长' }
        ];

        for (const roleInfo of roles) {
            console.log(`\n🔍 开始检测 ${roleInfo.role} 角色...`);

            // 1. 导航到登录页面
            console.log(`导航到登录页面...`);
            await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // 2. 截图登录页面
            const loginScreenshot = `${screenshotDir}/login_${roleInfo.name}_${Date.now()}.png`;
            await page.screenshot({ path: loginScreenshot, fullPage: true });
            console.log(`登录页面截图已保存: ${loginScreenshot}`);

            // 3. 填写登录信息
            console.log(`填写 ${roleInfo.role} 登录信息...`);

            // 尝试多种可能的用户名输入框选择器
            const usernameSelectors = [
                'input[placeholder*="用户名"]',
                'input[placeholder*="账号"]',
                'input[type="text"]',
                '#username',
                '.el-input__inner'
            ];

            let usernameInput = null;
            for (const selector of usernameSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 2000 });
                    usernameInput = await page.$(selector);
                    if (usernameInput) {
                        console.log(`找到用户名输入框: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (usernameInput) {
                await usernameInput.click();
                await usernameInput.fill(roleInfo.username);
            } else {
                console.log('未找到用户名输入框，尝试直接填写...');
                await page.keyboard.type(roleInfo.username);
            }

            await page.waitForTimeout(1000);

            // 尝试多种可能的密码输入框选择器
            const passwordSelectors = [
                'input[placeholder*="密码"]',
                'input[type="password"]',
                '#password'
            ];

            let passwordInput = null;
            for (const selector of passwordSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 2000 });
                    passwordInput = await page.$(selector);
                    if (passwordInput) {
                        console.log(`找到密码输入框: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (passwordInput) {
                await passwordInput.click();
                await passwordInput.fill(roleInfo.password);
            } else {
                console.log('未找到密码输入框，尝试Tab键切换...');
                await page.keyboard.press('Tab');
                await page.keyboard.type(roleInfo.password);
            }

            await page.waitForTimeout(1000);

            // 4. 点击登录按钮
            console.log('点击登录按钮...');

            const loginButtonSelectors = [
                'button[type="button"]',
                '.el-button--primary',
                'button:has-text("登录")',
                '.login-btn',
                'button'
            ];

            let loginClicked = false;
            for (const selector of loginButtonSelectors) {
                try {
                    const buttons = await page.$$(selector);
                    for (const button of buttons) {
                        const text = await button.textContent();
                        if (text && (text.includes('登录') || text.includes('Login') || selector.includes('primary'))) {
                            await button.click();
                            loginClicked = true;
                            console.log(`点击了登录按钮: ${selector}`);
                            break;
                        }
                    }
                    if (loginClicked) break;
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (!loginClicked) {
                console.log('尝试按回车键登录...');
                await page.keyboard.press('Enter');
            }

            // 5. 等待登录完成
            console.log('等待登录完成...');
            await page.waitForTimeout(3000);

            // 6. 检查是否登录成功
            const currentUrl = page.url();
            console.log(`当前页面URL: ${currentUrl}`);

            // 7. 登录成功后截图
            const dashboardScreenshot = `${screenshotDir}/dashboard_${roleInfo.name}_${Date.now()}.png`;
            await page.screenshot({ path: dashboardScreenshot, fullPage: true });
            console.log(`${roleInfo.role} 控制台截图已保存: ${dashboardScreenshot}`);

            // 8. 执行样式检测
            console.log('执行样式检测...');
            const styleResults = await page.evaluate(styleDetectionScript);

            results[roleInfo.name] = {
                role: roleInfo.role,
                loginInfo: {
                    username: roleInfo.username,
                    success: !currentUrl.includes('login')
                },
                screenshots: {
                    login: loginScreenshot,
                    dashboard: dashboardScreenshot
                },
                styleDetection: styleResults
            };

            // 9. 输出检测结果
            console.log(`\n=== ${roleInfo.role} 角色样式检测结果 ===`);
            console.log('CSS变量数量:', Object.keys(styleResults.cssVariables).length);
            console.log('主要CSS变量:', Object.keys(styleResults.cssVariables).slice(0, 10));
            console.log('组件样式类:', styleResults.components);
            console.log('颜色配置:', styleResults.colors);
            console.log('Element Plus主题:', styleResults.elementPlusTheme);
            console.log('页面信息:', styleResults.pageInfo);

            // 10. 登出以便下个角色测试
            console.log('准备登出...');

            // 查找登出按钮
            const logoutSelectors = [
                'button:has-text("退出")',
                'button:has-text("登出")',
                'button:has-text("注销")',
                '.logout-btn',
                'a:has-text("退出")'
            ];

            for (const selector of logoutSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        await element.click();
                        console.log('点击了登出按钮');
                        break;
                    }
                } catch (e) {
                    // 继续尝试
                }
            }

            await page.waitForTimeout(2000);

            // 如果没有登出按钮，直接导航到登录页面
            if (page.url().includes('dashboard') || page.url() !== 'http://localhost:5173') {
                await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
            }
        }

        // 保存完整结果
        const resultsFile = `${__dirname}/style-detection-results-${Date.now()}.json`;
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`\n🎉 完整检测结果已保存到: ${resultsFile}`);

        return results;

    } catch (error) {
        console.error('❌ 检测过程中发生错误:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// 运行检测
if (require.main === module) {
    runStyleDetection()
        .then(() => {
            console.log('\n✅ 样式检测完成！');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ 样式检测失败:', error);
            process.exit(1);
        });
}

module.exports = { runStyleDetection };