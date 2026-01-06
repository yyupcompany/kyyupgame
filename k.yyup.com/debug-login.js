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

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugAdminLogin() {
    console.log('开始管理员登录调试测试...');
    console.log(`测试目标: ${BASE_URL}`);
    console.log('='.repeat(60));

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. 导航到首页
        console.log('\n步骤1: 导航到首页');
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await delay(2000);

        // 截图 - 首页
        const homepageScreenshot = path.join(SCREENSHOT_DIR, 'debug_homepage.png');
        await page.screenshot({ path: homepageScreenshot, fullPage: true });
        console.log(`首页截图保存: ${homepageScreenshot}`);

        // 2. 查找并点击登录按钮
        console.log('\n步骤2: 查找登录按钮');
        try {
            // 查找所有可能的登录按钮
            const loginSelectors = [
                'button:has-text("登录")',
                'a:has-text("登录")',
                '.login-btn',
                'header button:has-text("登录")'
            ];

            for (const selector of loginSelectors) {
                try {
                    const elements = await page.locator(selector).all();
                    console.log(`选择器 "${selector}" 找到 ${elements.length} 个元素`);
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        if (await element.isVisible()) {
                            console.log(`  - 元素 ${i + 1}: 可见`);
                            await element.click();
                            console.log(`点击了元素 ${i + 1}`);
                            break;
                        } else {
                            console.log(`  - 元素 ${i + 1}: 不可见`);
                        }
                    }

                    // 等待页面跳转
                    await delay(2000);
                    const currentUrl = page.url();
                    if (currentUrl !== BASE_URL) {
                        console.log(`页面已跳转到: ${currentUrl}`);
                        break;
                    }
                } catch (e) {
                    console.log(`选择器 "${selector}" 出错: ${e.message}`);
                }
            }

            await page.waitForLoadState('networkidle');
            await delay(2000);
        } catch (error) {
            console.log(`点击登录按钮失败: ${error.message}`);
            return;
        }

        // 3. 检查是否到达登录页面
        console.log('\n步骤3: 检查登录页面');
        const currentUrl = page.url();
        console.log(`当前URL: ${currentUrl}`);

        // 截图 - 登录页面
        const loginPageScreenshot = path.join(SCREENSHOT_DIR, 'debug_login_page.png');
        await page.screenshot({ path: loginPageScreenshot, fullPage: true });
        console.log(`登录页面截图保存: ${loginPageScreenshot}`);

        // 4. 查找快捷登录按钮
        console.log('\n步骤4: 查找快捷登录按钮');
        try {
            const quickLoginSelectors = [
                'button:has-text("管理员")',
                'button:has-text("园长")',
                'button:has-text("老师")',
                'button:has-text("家长")',
                '[class*="quick"] button',
                '[class*="role"] button'
            ];

            for (const selector of quickLoginSelectors) {
                try {
                    const elements = await page.locator(selector).all();
                    console.log(`快捷登录选择器 "${selector}" 找到 ${elements.length} 个元素`);
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        const text = await element.textContent();
                        const visible = await element.isVisible();
                        console.log(`  - 元素 ${i + 1}: "${text}" - ${visible ? '可见' : '不可见'}`);
                    }
                } catch (e) {
                    console.log(`快捷登录选择器 "${selector}" 出错: ${e.message}`);
                }
            }

            // 查找并点击管理员按钮
            const adminButton = await page.locator('button:has-text("管理员")').first();
            if (await adminButton.isVisible()) {
                console.log('找到管理员快捷登录按钮，准备点击');
                await adminButton.click();
                console.log('点击管理员按钮成功');
                await delay(1000);
            } else {
                console.log('未找到管理员快捷登录按钮');
                return;
            }
        } catch (error) {
            console.log(`查找快捷登录按钮失败: ${error.message}`);
            return;
        }

        // 5. 检查表单填入
        console.log('\n步骤5: 检查表单填入');
        try {
            // 查找用户名输入框
            const usernameSelectors = [
                'input[placeholder*="用户名"]',
                'input[name="username"]',
                'input#username',
                'input[type="text"]'
            ];

            let usernameValue = null;
            for (const selector of usernameSelectors) {
                try {
                    const input = await page.locator(selector).first();
                    if (await input.isVisible()) {
                        usernameValue = await input.inputValue();
                        console.log(`用户名输入框 (${selector}): "${usernameValue}"`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // 查找密码输入框
            const passwordSelectors = [
                'input[placeholder*="密码"]',
                'input[name="password"]',
                'input[type="password"]'
            ];

            let passwordValue = null;
            for (const selector of passwordSelectors) {
                try {
                    const input = await page.locator(selector).first();
                    if (await input.isVisible()) {
                        passwordValue = await input.inputValue();
                        console.log(`密码输入框 (${selector}): ${passwordValue ? '已填入' : '空'}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // 截图 - 填入后状态
            const afterFillScreenshot = path.join(SCREENSHOT_DIR, 'debug_after_fill.png');
            await page.screenshot({ path: afterFillScreenshot, fullPage: true });
            console.log(`填入后截图保存: ${afterFillScreenshot}`);

        } catch (error) {
            console.log(`检查表单填入失败: ${error.message}`);
        }

        // 6. 查找登录提交按钮
        console.log('\n步骤6: 查找登录提交按钮');
        try {
            const submitSelectors = [
                'button:has-text("登录")',
                'button[type="submit"]',
                'form button',
                '.el-button--primary',
                '.el-button'
            ];

            let submitButtonFound = false;
            for (const selector of submitSelectors) {
                try {
                    const elements = await page.locator(selector).all();
                    console.log(`提交按钮选择器 "${selector}" 找到 ${elements.length} 个元素`);
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        const text = await element.textContent();
                        const visible = await element.isVisible();
                        const enabled = await element.isEnabled();
                        console.log(`  - 元素 ${i + 1}: "${text}" - ${visible ? '可见' : '不可见'} - ${enabled ? '可用' : '禁用'}`);

                        if (visible && enabled && text && text.includes('登录')) {
                            console.log(`找到可用的登录按钮，准备点击`);
                            await element.click();
                            console.log('点击登录按钮成功');
                            submitButtonFound = true;
                            break;
                        }
                    }

                    if (submitButtonFound) break;
                } catch (e) {
                    console.log(`提交按钮选择器 "${selector}" 出错: ${e.message}`);
                }
            }

            if (!submitButtonFound) {
                console.log('未找到可用的登录提交按钮');
            }

            await delay(3000);
        } catch (error) {
            console.log(`查找登录提交按钮失败: ${error.message}`);
        }

        // 7. 检查登录结果
        console.log('\n步骤7: 检查登录结果');
        const finalUrl = page.url();
        console.log(`最终URL: ${finalUrl}`);

        // 截图 - 最终结果
        const finalScreenshot = path.join(SCREENSHOT_DIR, 'debug_final_result.png');
        await page.screenshot({ path: finalScreenshot, fullPage: true });
        console.log(`最终结果截图保存: ${finalScreenshot}`);

    } finally {
        await delay(5000); // 等待5秒让用户观察
        await browser.close();
        console.log('\n浏览器已关闭，调试测试完成！');
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
        await debugAdminLogin();
    } else {
        process.exit(1);
    }
})();