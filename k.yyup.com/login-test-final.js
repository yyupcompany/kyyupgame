import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前目录的ES模块兼容方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// 确保截图目录存在
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 测试角色配置
const testRoles = [
    {
        name: '管理员',
        username: 'admin',
        password: '123456',
        quickLoginSelector: 'button:has-text("管理员")',
        screenshotPrefix: 'admin'
    },
    {
        name: '园长',
        username: 'principal',
        password: '123456',
        quickLoginSelector: 'button:has-text("园长")',
        screenshotPrefix: 'principal'
    },
    {
        name: '老师',
        username: 'test_teacher',
        password: '123456',
        quickLoginSelector: 'button:has-text("老师")',
        screenshotPrefix: 'teacher'
    },
    {
        name: '家长',
        username: 'test_parent',
        password: '123456',
        quickLoginSelector: 'button:has-text("家长")',
        screenshotPrefix: 'parent'
    }
];

// 记录测试结果的数组
const testResults = [];

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 测试单个角色的登录
async function testRoleLogin(page, role) {
    console.log(`\n开始测试 ${role.name} 角色登录...`);
    console.log(`期望的用户名: ${role.username}, 密码: ${role.password}`);

    const result = {
        role: role.name,
        username: role.username,
        password: role.password,
        success: false,
        errorMessage: null,
        actualUsername: null,
        actualPassword: null,
        loginSuccess: false,
        screenshotPath: null
    };

    try {
        // 1. 导航到首页
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await delay(2000); // 等待页面完全加载

        // 2. 查找并点击登录按钮
        try {
            // 尝试多种可能的登录按钮选择器
            const loginSelectors = [
                'button:has-text("登录")',
                'a:has-text("登录")',
                '.login-btn',
                '[class*="login"] button',
                'header button:has-text("登录")',
                '.nav button:has-text("登录")'
            ];

            let loginButton = null;
            for (const selector of loginSelectors) {
                try {
                    const btn = await page.locator(selector).first();
                    if (await btn.isVisible()) {
                        loginButton = btn;
                        console.log(`找到登录按钮: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (loginButton) {
                await loginButton.click();
                console.log("点击登录按钮，进入登录页面");
                await page.waitForLoadState('networkidle');
                await delay(2000);
            } else {
                result.errorMessage = "未找到登录按钮";
                console.log(`错误: ${result.errorMessage}`);
                return result;
            }
        } catch (error) {
            result.errorMessage = "点击登录按钮失败";
            console.log(`错误: ${result.errorMessage}`);
            return result;
        }

        // 3. 截图 - 登录页面初始状态
        const loginPageScreenshot = path.join(SCREENSHOT_DIR, `${role.screenshotPrefix}_login_page.png`);
        await page.screenshot({ path: loginPageScreenshot, fullPage: true });
        console.log(`截图保存: ${loginPageScreenshot}`);

        // 4. 查找并点击快捷登录按钮
        try {
            await page.waitForSelector(role.quickLoginSelector, { timeout: 10000 });
            console.log(`找到 ${role.name} 快捷登录按钮`);
        } catch (error) {
            result.errorMessage = `未找到 ${role.name} 快捷登录按钮`;
            console.log(`错误: ${result.errorMessage}`);
            return result;
        }

        // 5. 点击快捷登录按钮
        await page.click(role.quickLoginSelector);
        await delay(1000); // 等待表单填入

        // 6. 检查表单填入情况
        const usernameSelectors = [
            'input[placeholder*="用户名"]',
            'input[name="username"]',
            'input#username',
            'input[type="text"]',
            '.el-input__inner[type="text"]'
        ];

        const passwordSelectors = [
            'input[placeholder*="密码"]',
            'input[name="password"]',
            'input[type="password"]',
            '.el-input__inner[type="password"]'
        ];

        let usernameInput = null;
        let passwordInput = null;

        for (const selector of usernameSelectors) {
            try {
                const input = await page.locator(selector).first();
                if (await input.isVisible()) {
                    usernameInput = input;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        for (const selector of passwordSelectors) {
            try {
                const input = await page.locator(selector).first();
                if (await input.isVisible()) {
                    passwordInput = input;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (usernameInput) {
            result.actualUsername = await usernameInput.inputValue();
            console.log(`实际填入的用户名: ${result.actualUsername}`);
        }

        if (passwordInput) {
            result.actualPassword = await passwordInput.inputValue();
            console.log(`实际填入的密码: ${result.actualPassword || '密码已隐藏'}`);
        }

        // 7. 截图 - 点击快捷登录按钮后
        const afterClickScreenshot = path.join(SCREENSHOT_DIR, `${role.screenshotPrefix}_after_quick_click.png`);
        await page.screenshot({ path: afterClickScreenshot, fullPage: true });
        console.log(`截图保存: ${afterClickScreenshot}`);

        // 8. 查找并点击登录提交按钮
        try {
            const submitSelectors = [
                'button:has-text("登录")',
                'button[type="submit"]',
                'form button',
                '.el-button--primary',
                '.login-submit',
                '[class*="login"] button:has-text("登录")',
                'button.el-button'
            ];

            let submitButton = null;
            for (const selector of submitSelectors) {
                try {
                    const btn = await page.locator(selector).first();
                    if (await btn.isVisible() && await btn.isEnabled()) {
                        submitButton = btn;
                        console.log(`找到登录提交按钮: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (submitButton) {
                await submitButton.click();
                console.log("点击登录提交按钮");
            } else {
                result.errorMessage = "未找到登录提交按钮";
                console.log(`错误: ${result.errorMessage}`);
                return result;
            }
        } catch (error) {
            result.errorMessage = "点击登录提交按钮失败";
            console.log(`错误: ${result.errorMessage}`);
            return result;
        }

        // 9. 等待登录结果
        await page.waitForLoadState('networkidle');
        await delay(3000); // 等待登录处理

        // 10. 检查登录结果
        const currentUrl = page.url();
        console.log(`登录后页面URL: ${currentUrl}`);

        // 检查是否登录成功
        if (currentUrl.includes('/dashboard') || currentUrl.includes('/home') || currentUrl.includes('/index')) {
            result.loginSuccess = true;
            result.success = true;
            console.log(`${role.name} 登录成功！`);
        } else if (currentUrl !== BASE_URL && currentUrl.includes('/login') === false) {
            result.loginSuccess = true;
            result.success = true;
            console.log(`${role.name} 登录成功！重定向到: ${currentUrl}`);
        } else {
            // 检查是否有错误消息
            const errorSelectors = [
                '.error-message',
                '.alert-danger',
                '.message-error',
                '.el-message--error',
                '[role="alert"]'
            ];

            let errorFound = false;
            for (const selector of errorSelectors) {
                try {
                    const errorElement = await page.locator(selector).first();
                    if (await errorElement.isVisible()) {
                        result.errorMessage = await errorElement.textContent();
                        console.log(`登录失败，错误信息: ${result.errorMessage}`);
                        errorFound = true;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!errorFound) {
                result.errorMessage = '登录失败，未找到明确错误信息';
                console.log(result.errorMessage);
            }
        }

        // 11. 截图 - 登录结果
        const resultScreenshot = path.join(SCREENSHOT_DIR, `${role.screenshotPrefix}_result.png`);
        await page.screenshot({ path: resultScreenshot, fullPage: true });
        result.screenshotPath = resultScreenshot;
        console.log(`截图保存: ${resultScreenshot}`);

        // 12. 验证用户名密码是否正确
        result.passwordCorrect = (result.actualUsername === role.username) && (result.actualPassword === role.password);
        if (!result.passwordCorrect) {
            console.log(`警告: 用户名或密码不匹配！`);
            console.log(`期望: ${role.username}/${role.password}`);
            console.log(`实际: ${result.actualUsername}/${result.actualPassword || '空'}`);
        }

    } catch (error) {
        result.errorMessage = `测试过程中发生异常: ${error.message}`;
        console.log(`异常: ${result.errorMessage}`);
    }

    return result;
}

// 生成测试报告
function generateReport(results) {
    const report = {
        testTime: new Date().toISOString(),
        baseUrl: BASE_URL,
        summary: {
            totalTests: results.length,
            successTests: results.filter(r => r.success).length,
            failedTests: results.filter(r => !r.success).length,
            correctPasswordTests: results.filter(r => r.passwordCorrect).length,
            incorrectPasswordTests: results.filter(r => !r.passwordCorrect).length
        },
        results: results,
        screenshots: fs.readdirSync(SCREENSHOT_DIR).filter(file => file.endsWith('.png'))
    };

    // 保存报告
    const reportPath = path.join(__dirname, 'login_test_final_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n测试报告已保存到: ${reportPath}`);

    return report;
}

// 主测试函数
async function runTests() {
    console.log('开始快捷登录功能最终测试...');
    console.log(`测试目标: ${BASE_URL}`);
    console.log('='.repeat(60));

    const browser = await chromium.launch({
        headless: false, // 设置为true可以在后台运行
        slowMo: 1000 // 操作间延迟，便于观察
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 测试每个角色
        for (const role of testRoles) {
            const result = await testRoleLogin(page, role);
            testResults.push(result);

            // 如果登录成功，退出登录并返回首页进行下一个测试
            if (result.loginSuccess) {
                try {
                    // 查找退出登录按钮
                    const logoutSelectors = [
                        'button:has-text("退出")',
                        'a:has-text("退出")',
                        '.logout-btn',
                        '[class*="logout"]',
                        '.user-info button',
                        '.dropdown button'
                    ];

                    let logoutButton = null;
                    for (const selector of logoutSelectors) {
                        try {
                            const btn = await page.locator(selector).first();
                            if (await btn.isVisible()) {
                                logoutButton = btn;
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }

                    if (logoutButton) {
                        await logoutButton.click();
                        await delay(2000);
                    } else {
                        // 如果没有退出按钮，直接返回首页
                        await page.goto(BASE_URL);
                        await delay(2000);
                    }
                } catch (e) {
                    console.log('退出登录失败，直接返回首页');
                    await page.goto(BASE_URL);
                    await delay(2000);
                }
            } else {
                // 登录失败，也返回首页
                await page.goto(BASE_URL);
                await delay(2000);
            }

            // 角色间延迟
            await delay(2000);
        }

        // 生成测试报告
        const report = generateReport(testResults);

        // 打印测试摘要
        console.log('\n' + '='.repeat(60));
        console.log('测试摘要:');
        console.log(`总测试数: ${report.summary.totalTests}`);
        console.log(`登录成功: ${report.summary.successTests}`);
        console.log(`登录失败: ${report.summary.failedTests}`);
        console.log(`密码正确: ${report.summary.correctPasswordTests}`);
        console.log(`密码错误: ${report.summary.incorrectPasswordTests}`);
        console.log('='.repeat(60));

        // 打印详细结果
        testResults.forEach(result => {
            console.log(`\n${result.role} 角色:`);
            console.log(`  期望用户名: ${result.username}`);
            console.log(`  实际用户名: ${result.actualUsername || '未获取'}`);
            console.log(`  期望密码: ${result.password}`);
            console.log(`  实际密码: ${result.actualPassword ? '密码已隐藏' : '未获取'}`);
            console.log(`  密码匹配: ${result.passwordCorrect ? '✓' : '✗'}`);
            console.log(`  登录状态: ${result.loginSuccess ? '成功' : '失败'}`);
            if (result.errorMessage) {
                console.log(`  错误信息: ${result.errorMessage}`);
            }
            if (result.screenshotPath) {
                console.log(`  结果截图: ${result.screenshotPath}`);
            }
        });

    } finally {
        await browser.close();
        console.log('\n浏览器已关闭，测试完成！');
    }
}

// 检查服务器是否启动
async function checkServer() {
    console.log('检查服务器状态...');
    try {
        const response = await fetch(`${BASE_URL}`);
        if (response.ok) {
            console.log('服务器运行正常！');
            return true;
        }
    } catch (error) {
        console.log(`服务器连接失败: ${error.message}`);
        console.log('请确保前端服务器已启动 (npm run start:frontend)');
        return false;
    }
}

// 运行测试
(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runTests();
    } else {
        process.exit(1);
    }
})();