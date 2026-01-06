#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * AI助手页面导航动态测试
 * 使用无头浏览器检测侧边栏AI助手链接点击后的问题
 */
async function testAINavigationDynamically() {
    console.log('🚀 启动AI助手导航动态测试...\n');
    
    let browser;
    let page;
    
    try {
        // 启动浏览器
        browser = await puppeteer.launch({
            headless: "new", // 使用新的无头模式
            devtools: false,
            slowMo: 50,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--single-process',
                '--no-default-browser-check',
                '--mute-audio',
                '--disable-extensions'
            ]
        });
        
        page = await browser.newPage();
        
        // 设置视口
        await page.setViewport({ width: 1920, height: 1080 });
        
        // 监听控制台错误
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            console.log(`[浏览器${type.toUpperCase()}]: ${text}`);
        });
        
        // 监听页面错误
        page.on('pageerror', error => {
            console.error(`❌ [页面错误]: ${error.message}`);
        });
        
        // 监听网络请求失败
        page.on('requestfailed', request => {
            console.error(`❌ [请求失败]: ${request.url()} - ${request.failure().errorText}`);
        });
        
        // 监听未处理的Promise拒绝
        page.on('response', response => {
            if (!response.ok()) {
                console.warn(`⚠️ [HTTP错误]: ${response.status()} ${response.url()}`);
            }
        });
        
        console.log('📱 访问前端首页...');
        
        // 访问首页
        const frontendUrl = 'https://localhost:5173';
        await page.goto(frontendUrl, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔐 检测登录状态...');
        
        // 检查是否在登录页面
        const isLoginPage = await page.evaluate(() => {
            return window.location.pathname.includes('/login') || 
                   document.querySelector('.login-container') !== null ||
                   document.querySelector('form[action*="login"]') !== null;
        });
        
        if (isLoginPage) {
            console.log('🔑 检测到需要登录，尝试登录...');
            
            // 尝试登录
            const loginSuccess = await attemptLogin(page);
            if (!loginSuccess) {
                throw new Error('登录失败，无法继续测试');
            }
        }
        
        // 等待主页面加载
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 查找AI助手侧边栏链接...');
        
        // 查找AI助手链接的多种可能选择器
        const aiLinkSelectors = [
            '[data-testid="ai-assistant"]',
            '.sidebar-menu [href="/ai"]',
            '.sidebar-menu [href*="/ai"]',
            '.el-menu-item[index="/ai"]',
            '.menu-item:contains("AI助手")',
            'a[href="/ai"]',
            'a[href*="/ai/assistant"]',
            '.sidebar a:contains("AI")',
            '[role="menuitem"]:contains("AI")',
            '.el-menu-item:contains("AI助手")'
        ];
        
        let aiLink = null;
        let foundSelector = '';
        
        for (const selector of aiLinkSelectors) {
            try {
                if (selector.includes(':contains')) {
                    // 对于包含文本的选择器，使用evaluate
                    aiLink = await page.evaluate((sel) => {
                        const text = sel.split(':contains("')[1].split('")')[0];
                        const elements = Array.from(document.querySelectorAll('*'));
                        return elements.find(el => 
                            el.textContent && 
                            el.textContent.includes(text) && 
                            (el.tagName === 'A' || el.onclick || el.getAttribute('href'))
                        );
                    }, selector);
                    if (aiLink) {
                        foundSelector = selector;
                        break;
                    }
                } else {
                    const element = await page.$(selector);
                    if (element) {
                        aiLink = element;
                        foundSelector = selector;
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!aiLink) {
            console.log('🔍 未找到AI助手链接，检查侧边栏结构...');
            
            // 获取侧边栏HTML结构
            const sidebarHTML = await page.evaluate(() => {
                const sidebar = document.querySelector('.sidebar') || 
                               document.querySelector('.el-aside') ||
                               document.querySelector('.layout-sidebar') ||
                               document.querySelector('nav');
                return sidebar ? sidebar.innerHTML : '未找到侧边栏';
            });
            
            console.log('📋 侧边栏HTML结构:');
            console.log(sidebarHTML.substring(0, 1000) + '...');
            
            // 查找所有包含"AI"的元素
            const aiElements = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements
                    .filter(el => el.textContent && el.textContent.includes('AI'))
                    .map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        textContent: el.textContent.trim().substring(0, 50),
                        href: el.href || el.getAttribute('href'),
                        onclick: !!el.onclick
                    }));
            });
            
            console.log('🎯 找到的AI相关元素:', aiElements);
            
            if (aiElements.length > 0) {
                // 尝试点击第一个AI相关元素
                const firstAIElement = aiElements[0];
                console.log(`🖱️ 尝试点击第一个AI元素: ${firstAIElement.textContent}`);
                
                await page.evaluate((element) => {
                    const el = Array.from(document.querySelectorAll('*'))
                        .find(e => e.textContent && e.textContent.includes('AI'));
                    if (el) {
                        el.click();
                    }
                }, firstAIElement);
            } else {
                throw new Error('未找到任何AI助手相关的导航元素');
            }
        } else {
            console.log(`✅ 找到AI助手链接: ${foundSelector}`);
            
            // 获取当前页面URL
            const currentUrl = page.url();
            console.log(`📍 当前页面: ${currentUrl}`);
            
            console.log('🖱️ 点击AI助手链接...');
            
            // 监听路由变化
            let navigationStarted = false;
            page.on('framenavigated', () => {
                navigationStarted = true;
                console.log('🔄 检测到页面导航开始...');
            });
            
            // 点击AI助手链接
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {
                    console.log('⚠️ 导航超时，可能是SPA路由');
                }),
                aiLink.click()
            ]);
        }
        
        // 等待页面稳定
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 检查导航结果
        const finalUrl = page.url();
        console.log(`📍 导航后页面: ${finalUrl}`);
        
        // 检查是否成功到达AI页面
        const isAIPage = finalUrl.includes('/ai');
        console.log(`🎯 是否到达AI页面: ${isAIPage}`);
        
        if (isAIPage) {
            console.log('✅ 成功导航到AI页面，检查页面内容...');
            
            // 等待AI页面关键元素加载
            const aiPageLoadTests = [
                { selector: '.ai-assistant-workbench', name: 'AI工作台容器' },
                { selector: '.workbench-header', name: '工作台头部' },
                { selector: '.tools-sidebar', name: '工具侧边栏' },
                { selector: '.conversation-area', name: '对话区域' },
                { selector: '.info-panel', name: '信息面板' }
            ];
            
            for (const test of aiPageLoadTests) {
                try {
                    await page.waitForSelector(test.selector, { timeout: 5000 });
                    console.log(`✅ ${test.name} 加载成功`);
                } catch (error) {
                    console.log(`❌ ${test.name} 加载失败: ${test.selector}`);
                }
            }
            
            // 检查控制台是否有错误
            const errors = await page.evaluate(() => {
                return window.console.errors || [];
            });
            
            if (errors.length > 0) {
                console.log('❌ 页面加载时发现错误:');
                errors.forEach(error => console.log(`  - ${error}`));
            }
            
            // 检查AI助手初始化日志
            const initLogs = await page.evaluate(() => {
                return window.console.logs?.filter(log => 
                    log.includes('AI助手') || log.includes('初始化')
                ) || [];
            });
            
            if (initLogs.length > 0) {
                console.log('📋 AI助手初始化日志:');
                initLogs.forEach(log => console.log(`  📝 ${log}`));
            }
            
        } else {
            console.log('❌ 未能成功导航到AI页面');
            
            // 检查页面内容以了解当前状态
            const pageTitle = await page.title();
            const pageContent = await page.evaluate(() => {
                return document.body.textContent.substring(0, 200);
            });
            
            console.log(`📄 当前页面标题: ${pageTitle}`);
            console.log(`📄 页面内容预览: ${pageContent}...`);
        }
        
        console.log('\n🎉 AI助手导航测试完成');
        
        // 保持浏览器开启一段时间以便观察
        console.log('⏰ 保持浏览器开启10秒以便观察...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        console.error('📋 错误详情:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * 尝试登录
 */
async function attemptLogin(page) {
    try {
        // 查找用户名/邮箱输入框
        const usernameSelectors = [
            'input[name="username"]',
            'input[name="email"]',
            'input[type="text"]',
            '.el-input__inner[placeholder*="用户名"]',
            '.el-input__inner[placeholder*="邮箱"]'
        ];
        
        let usernameInput = null;
        for (const selector of usernameSelectors) {
            const element = await page.$(selector);
            if (element) {
                usernameInput = element;
                break;
            }
        }
        
        // 查找密码输入框
        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            '.el-input__inner[placeholder*="密码"]'
        ];
        
        let passwordInput = null;
        for (const selector of passwordSelectors) {
            const element = await page.$(selector);
            if (element) {
                passwordInput = element;
                break;
            }
        }
        
        // 查找登录按钮
        const loginButtonSelectors = [
            'button[type="submit"]',
            '.el-button--primary',
            'button:contains("登录")',
            '.login-btn'
        ];
        
        let loginButton = null;
        for (const selector of loginButtonSelectors) {
            if (selector.includes(':contains')) {
                loginButton = await page.evaluateHandle(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(btn => btn.textContent.includes('登录'));
                });
                if (loginButton.asElement()) break;
            } else {
                const element = await page.$(selector);
                if (element) {
                    loginButton = element;
                    break;
                }
            }
        }
        
        if (usernameInput && passwordInput && loginButton) {
            console.log('📝 填写登录表单...');
            
            // 填写登录信息（使用测试账号）
            await usernameInput.type('admin', { delay: 100 });
            await passwordInput.type('123456', { delay: 100 });
            
            console.log('🔐 提交登录...');
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {
                    console.log('登录可能使用了AJAX，继续检查...');
                }),
                loginButton.click()
            ]);
            
            // 等待登录处理
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 检查是否登录成功
            const currentUrl = page.url();
            const isLoggedIn = !currentUrl.includes('/login');
            
            if (isLoggedIn) {
                console.log('✅ 登录成功');
                return true;
            } else {
                console.log('❌ 登录失败');
                return false;
            }
        } else {
            console.log('❌ 无法找到完整的登录表单元素');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 登录过程中发生错误:', error.message);
        return false;
    }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
    testAINavigationDynamically().catch(console.error);
}

export { testAINavigationDynamically };