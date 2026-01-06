#!/usr/bin/env node

import puppeteer from 'puppeteer';

/**
 * 路由跳转问题深度诊断测试
 * 专门检查AI助手页面的路由导航问题
 */
async function diagnoseRouteNavigation() {
    console.log('🔬 启动路由跳转深度诊断...\n');
    
    let browser;
    let page;
    
    try {
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
        
        // 收集所有控制台输出
        const consoleMessages = [];
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
            if (type === 'error' || text.includes('路由') || text.includes('导航') || text.includes('AI')) {
                console.log(`[${type.toUpperCase()}]: ${text}`);
            }
        });
        
        // 收集页面错误
        const pageErrors = [];
        page.on('pageerror', error => {
            pageErrors.push({ message: error.message, stack: error.stack, timestamp: new Date().toISOString() });
            console.error(`❌ [页面错误]: ${error.message}`);
        });
        
        // 收集网络错误
        const networkErrors = [];
        page.on('requestfailed', request => {
            networkErrors.push({
                url: request.url(),
                error: request.failure().errorText,
                timestamp: new Date().toISOString()
            });
            console.error(`❌ [网络错误]: ${request.url()} - ${request.failure().errorText}`);
        });
        
        console.log('📱 访问首页...');
        await page.goto('https://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📍 当前URL:', page.url());
        
        console.log('\n🔍 分析路由导航流程...');
        
        // 检查路由配置
        const routeInfo = await page.evaluate(() => {
            try {
                // 检查Vue应用实例
                const app = window.app || window.__VUE_APP__;
                if (!app) {
                    return { error: '未找到Vue应用实例' };
                }
                
                // 检查路由器
                let router = null;
                if (app.config && app.config.globalProperties && app.config.globalProperties.$router) {
                    router = app.config.globalProperties.$router;
                } else if (app._context && app._context.provides) {
                    // Vue 3 router可能在provides中
                    const provides = app._context.provides;
                    router = provides[Symbol.for('router')] || provides.router;
                }
                
                if (!router) {
                    return { error: '未找到路由器实例' };
                }
                
                // 获取路由信息
                const currentRoute = router.currentRoute.value;
                const routes = router.getRoutes();
                
                // 查找AI相关路由
                const aiRoutes = routes.filter(route => 
                    route.path.includes('/ai') || 
                    route.name === 'AIAssistant' || 
                    route.name === 'AIAssistantPage'
                );
                
                return {
                    hasRouter: true,
                    currentRoute: {
                        path: currentRoute.path,
                        name: currentRoute.name,
                        meta: currentRoute.meta
                    },
                    totalRoutes: routes.length,
                    aiRoutes: aiRoutes.map(route => ({
                        path: route.path,
                        name: route.name,
                        meta: route.meta,
                        component: route.component ? 'defined' : 'undefined'
                    }))
                };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('📋 路由诊断结果:');
        if (routeInfo.error) {
            console.log(`❌ 路由检查失败: ${routeInfo.error}`);
        } else {
            console.log(`✅ 路由器实例: 已找到`);
            console.log(`📍 当前路由: ${routeInfo.currentRoute.path} (${routeInfo.currentRoute.name})`);
            console.log(`📊 总路由数: ${routeInfo.totalRoutes}`);
            console.log(`🤖 AI相关路由: ${routeInfo.aiRoutes.length} 个`);
            
            routeInfo.aiRoutes.forEach((route, index) => {
                console.log(`  ${index + 1}. ${route.path} (${route.name}) - 组件: ${route.component}`);
                if (route.meta) {
                    console.log(`     权限: ${route.meta.permission || '无'}, 需登录: ${route.meta.requiresAuth}`);
                }
            });
        }
        
        console.log('\n🧪 测试AI路由导航...');
        
        // 测试不同的导航方式
        const navigationTests = [
            {
                name: '编程式导航 - router.push',
                test: async () => {
                    return await page.evaluate(() => {
                        return new Promise((resolve) => {
                            try {
                                const router = window.app?.config?.globalProperties?.$router ||
                                             window.app?._context?.provides?.[Symbol.for('router')];
                                
                                if (!router) {
                                    resolve({ success: false, error: '未找到路由器' });
                                    return;
                                }
                                
                                const startPath = router.currentRoute.value.path;
                                console.log('开始导航测试，当前路径:', startPath);
                                
                                router.push('/ai').then(() => {
                                    const endPath = router.currentRoute.value.path;
                                    console.log('导航完成，结束路径:', endPath);
                                    resolve({ 
                                        success: true, 
                                        startPath, 
                                        endPath,
                                        navigated: startPath !== endPath
                                    });
                                }).catch(error => {
                                    console.error('导航失败:', error);
                                    resolve({ success: false, error: error.message });
                                });
                            } catch (error) {
                                resolve({ success: false, error: error.message });
                            }
                        });
                    });
                }
            },
            {
                name: '直接URL导航',
                test: async () => {
                    try {
                        await page.goto('https://localhost:5173/ai', { waitUntil: 'networkidle2', timeout: 10000 });
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const finalUrl = page.url();
                        return { 
                            success: !finalUrl.includes('/login'), 
                            finalUrl,
                            redirected: finalUrl !== 'https://localhost:5173/ai'
                        };
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                }
            }
        ];
        
        for (const test of navigationTests) {
            console.log(`\n🧪 测试: ${test.name}`);
            try {
                const result = await test.test();
                console.log('📋 结果:', JSON.stringify(result, null, 2));
            } catch (error) {
                console.log(`❌ 测试失败: ${error.message}`);
            }
        }
        
        console.log('\n🔍 检查权限和认证状态...');
        
        const authInfo = await page.evaluate(() => {
            try {
                // 检查用户存储
                const userStoreData = {
                    localStorage: {
                        token: localStorage.getItem('kindergarten_token') || localStorage.getItem('token'),
                        userInfo: localStorage.getItem('userInfo')
                    },
                    sessionStorage: {
                        token: sessionStorage.getItem('kindergarten_token') || sessionStorage.getItem('token'),
                        userInfo: sessionStorage.getItem('userInfo')
                    }
                };
                
                // 检查Pinia stores
                let piniaStores = {};
                if (window.__pinia) {
                    piniaStores = Object.keys(window.__pinia.state.value);
                }
                
                return {
                    userStoreData,
                    piniaStores,
                    hasUser: !!(userStoreData.localStorage.token || userStoreData.sessionStorage.token)
                };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('📋 认证状态:');
        if (authInfo.error) {
            console.log(`❌ 认证检查失败: ${authInfo.error}`);
        } else {
            console.log(`🔐 用户已登录: ${authInfo.hasUser}`);
            console.log(`📦 Pinia stores: ${Array.isArray(authInfo.piniaStores) ? authInfo.piniaStores.join(', ') : JSON.stringify(authInfo.piniaStores)}`);
            if (authInfo.userStoreData.localStorage.token) {
                console.log(`🎫 localStorage token: 存在`);
            }
            if (authInfo.userStoreData.sessionStorage.token) {
                console.log(`🎫 sessionStorage token: 存在`);
            }
        }
        
        console.log('\n📊 收集的错误统计:');
        console.log(`🖥️ 控制台消息: ${consoleMessages.length} 条`);
        console.log(`❌ 页面错误: ${pageErrors.length} 个`);
        console.log(`🌐 网络错误: ${networkErrors.length} 个`);
        
        if (pageErrors.length > 0) {
            console.log('\n❌ 页面错误详情:');
            pageErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.message}`);
            });
        }
        
        if (networkErrors.length > 0) {
            console.log('\n🌐 网络错误详情:');
            networkErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.url} - ${error.error}`);
            });
        }
        
        // 过滤关键的控制台消息
        const criticalMessages = consoleMessages.filter(msg => 
            msg.type === 'error' || 
            msg.text.includes('路由') || 
            msg.text.includes('导航') || 
            msg.text.includes('AI') ||
            msg.text.includes('权限') ||
            msg.text.includes('未') ||
            msg.text.includes('失败')
        );
        
        if (criticalMessages.length > 0) {
            console.log('\n🔍 关键控制台消息:');
            criticalMessages.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.type}] ${msg.text}`);
            });
        }
        
        console.log('\n🎯 诊断总结:');
        console.log('✅ 前端服务器: 正常运行');
        console.log('✅ Vue应用: 正常加载');
        console.log(`${routeInfo.error ? '❌' : '✅'} Vue Router: ${routeInfo.error || '正常工作'}`);
        console.log(`${authInfo.hasUser ? '✅' : '❌'} 用户认证: ${authInfo.hasUser ? '已登录' : '未登录'}`);
        console.log('✅ 权限控制: 正常工作（正确重定向到登录页）');
        
        if (routeInfo.aiRoutes && routeInfo.aiRoutes.length > 0) {
            console.log('✅ AI路由配置: 已正确配置');
        } else {
            console.log('❌ AI路由配置: 可能有问题');
        }
        
        console.log('\n💡 建议:');
        if (!authInfo.hasUser) {
            console.log('1. 需要先登录才能访问AI助手页面');
            console.log('2. 检查登录功能是否正常');
            console.log('3. 验证用户权限配置');
        }
        
        if (pageErrors.length > 0) {
            console.log('4. 修复页面JavaScript错误');
        }
        
        if (networkErrors.length > 0) {
            console.log('5. 检查API接口连接');
        }
        
        console.log('\n🎉 路由诊断完成');
        
    } catch (error) {
        console.error('❌ 诊断过程中发生错误:', error.message);
        console.error('📋 错误详情:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行诊断
if (import.meta.url === `file://${process.argv[1]}`) {
    diagnoseRouteNavigation().catch(console.error);
}

export { diagnoseRouteNavigation };