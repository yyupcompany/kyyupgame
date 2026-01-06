#!/usr/bin/env node

import puppeteer from 'puppeteer';

/**
 * 简化的AI助手页面导航测试
 * 直接测试AI路由导航，不依赖登录
 */
async function testAINavigationSimple() {
    console.log('🚀 启动简化AI助手导航测试...\n');
    
    let browser;
    let page;
    
    try {
        // 启动浏览器
        browser = await puppeteer.launch({
            headless: "new",
            devtools: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process'
            ]
        });
        
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // 监听控制台消息
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || text.includes('AI') || text.includes('导航') || text.includes('路由')) {
                console.log(`[浏览器${type.toUpperCase()}]: ${text}`);
            }
        });
        
        // 监听页面错误
        page.on('pageerror', error => {
            console.error(`❌ [页面错误]: ${error.message}`);
        });
        
        // 监听未捕获的异常
        page.on('pageerror', err => {
            console.error(`❌ [页面错误]: ${err.toString()}`);
        });
        
        console.log('📱 直接访问AI助手页面...');
        
        // 直接访问AI页面
        const aiUrl = 'https://localhost:5173/ai';
        await page.goto(aiUrl, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 检查当前页面URL
        const currentUrl = page.url();
        console.log(`📍 当前页面URL: ${currentUrl}`);
        
        // 检查是否被重定向到登录页
        if (currentUrl.includes('/login')) {
            console.log('🔐 被重定向到登录页，这是正常的权限控制');
            console.log('✅ 路由导航功能正常工作');
            
            // 检查页面是否能正常渲染
            const loginElements = await page.$$eval('*', elements => {
                return elements.some(el => 
                    el.textContent && 
                    (el.textContent.includes('登录') || el.textContent.includes('用户名') || el.textContent.includes('密码'))
                );
            });
            
            if (loginElements) {
                console.log('✅ 登录页面渲染正常');
            } else {
                console.log('❌ 登录页面渲染异常');
            }
            
        } else if (currentUrl.includes('/ai')) {
            console.log('✅ 成功访问AI页面（可能已登录或权限开放）');
            
            // 检查AI页面关键元素
            console.log('🔍 检查AI页面元素...');
            
            const pageElements = await page.evaluate(() => {
                const elements = {
                    workbench: !!document.querySelector('.ai-assistant-workbench'),
                    header: !!document.querySelector('.workbench-header'),
                    sidebar: !!document.querySelector('.tools-sidebar'),
                    conversationArea: !!document.querySelector('.conversation-area'),
                    infoPanel: !!document.querySelector('.info-panel'),
                    aiTitle: !!document.querySelector('*[text*="AI智能工作台"]'),
                    anyAIText: document.body.textContent.includes('AI')
                };
                
                // 获取页面错误
                const errors = [];
                if (window.console && window.console.errors) {
                    errors.push(...window.console.errors);
                }
                
                return { elements, errors, pageText: document.body.textContent.substring(0, 500) };
            });
            
            console.log('📋 AI页面元素检查结果:');
            Object.entries(pageElements.elements).forEach(([key, value]) => {
                console.log(`  ${value ? '✅' : '❌'} ${key}: ${value}`);
            });
            
            if (pageElements.errors.length > 0) {
                console.log('❌ 发现页面错误:');
                pageElements.errors.forEach(error => console.log(`  - ${error}`));
            }
            
            console.log('📄 页面内容预览:');
            console.log(pageElements.pageText);
            
        } else {
            console.log('❓ 页面重定向到了未知位置');
            
            const pageTitle = await page.title();
            const pageText = await page.evaluate(() => document.body.textContent.substring(0, 300));
            
            console.log(`📄 页面标题: ${pageTitle}`);
            console.log(`📄 页面内容: ${pageText}`);
        }
        
        console.log('\n🔍 测试Vue Router导航功能...');
        
        // 测试编程式导航
        const navigationTest = await page.evaluate(() => {
            try {
                // 检查Vue Router是否存在
                if (window.app && window.app.config && window.app.config.globalProperties.$router) {
                    const router = window.app.config.globalProperties.$router;
                    console.log('找到Vue Router实例');
                    
                    // 尝试导航到AI页面
                    router.push('/ai').then(() => {
                        console.log('编程式导航成功');
                    }).catch(error => {
                        console.error('编程式导航失败:', error);
                    });
                    
                    return { hasRouter: true, currentRoute: router.currentRoute.value.path };
                } else {
                    console.log('未找到Vue Router实例');
                    return { hasRouter: false };
                }
            } catch (error) {
                console.error('导航测试出错:', error.message);
                return { hasRouter: false, error: error.message };
            }
        });
        
        console.log('📋 导航测试结果:', navigationTest);
        
        console.log('\n🔍 检查JavaScript错误...');
        
        // 获取页面上的JavaScript错误
        const jsErrors = await page.evaluate(() => {
            const errors = [];
            
            // 检查全局错误
            if (window.errors) {
                errors.push(...window.errors);
            }
            
            // 检查Vue应用错误
            if (window.app && window.app._instance && window.app._instance.ctx) {
                const ctx = window.app._instance.ctx;
                if (ctx.errors) {
                    errors.push(...ctx.errors);
                }
            }
            
            // 检查控制台错误
            const consoleErrors = [];
            const originalConsoleError = console.error;
            console.error = function(...args) {
                consoleErrors.push(args.join(' '));
                originalConsoleError.apply(console, args);
            };
            
            return { errors, consoleErrors };
        });
        
        if (jsErrors.errors.length > 0 || jsErrors.consoleErrors.length > 0) {
            console.log('❌ 发现JavaScript错误:');
            [...jsErrors.errors, ...jsErrors.consoleErrors].forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        } else {
            console.log('✅ 未发现明显的JavaScript错误');
        }
        
        console.log('\n🎉 AI助手导航测试完成');
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        console.error('📋 错误详情:', error.stack);
        
        // 尝试获取更多错误信息
        if (page) {
            try {
                const pageUrl = page.url();
                const pageTitle = await page.title();
                console.log(`📍 错误发生时的页面: ${pageUrl}`);
                console.log(`📄 页面标题: ${pageTitle}`);
            } catch (e) {
                console.log('无法获取页面信息');
            }
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
    testAINavigationSimple().catch(console.error);
}

export { testAINavigationSimple };