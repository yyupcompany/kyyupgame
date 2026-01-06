#!/usr/bin/env node

import puppeteer from 'puppeteer';

/**
 * 实时演示后端API交互
 * 打开浏览器开发者工具，展示真实的网络请求和响应
 */
async function demonstrateBackendAPIInteraction() {
    console.log('🚀 开始演示后端API交互...\n');
    
    let browser;
    let page;
    
    try {
        // 启动浏览器（可视化模式，打开开发者工具）
        browser = await puppeteer.launch({
            headless: false, // 显示浏览器界面
            devtools: true,  // 自动打开开发者工具
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        page = await browser.newPage();
        
        // 监听所有网络请求和响应
        const networkLogs = [];
        
        page.on('request', request => {
            if (request.url().includes('shlxlyzagqnc.sealoshzh.site') || request.url().includes('/api/')) {
                const logEntry = {
                    type: 'REQUEST',
                    timestamp: new Date().toISOString(),
                    method: request.method(),
                    url: request.url(),
                    headers: request.headers(),
                    postData: request.postData()
                };
                networkLogs.push(logEntry);
                console.log(`📤 [${logEntry.timestamp}] ${logEntry.method} ${logEntry.url}`);
                if (logEntry.postData) {
                    console.log(`📝 请求数据: ${logEntry.postData}`);
                }
            }
        });
        
        page.on('response', async response => {
            if (response.url().includes('shlxlyzagqnc.sealoshzh.site') || response.url().includes('/api/')) {
                try {
                    const responseText = await response.text();
                    const logEntry = {
                        type: 'RESPONSE',
                        timestamp: new Date().toISOString(),
                        status: response.status(),
                        statusText: response.statusText(),
                        url: response.url(),
                        headers: response.headers(),
                        body: responseText
                    };
                    networkLogs.push(logEntry);
                    console.log(`📥 [${logEntry.timestamp}] ${logEntry.status} ${logEntry.url}`);
                    console.log(`📋 响应数据: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
                    console.log('---');
                } catch (error) {
                    console.log(`📥 [${new Date().toISOString()}] ${response.status()} ${response.url()} (无法读取响应体)`);
                }
            }
        });
        
        // 监听控制台消息
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (text.includes('API') || text.includes('请求') || text.includes('响应') || text.includes('🚀') || text.includes('📡')) {
                console.log(`[前端${type.toUpperCase()}]: ${text}`);
            }
        });
        
        console.log('🌐 访问登录页面...');
        await page.goto('https://localhost:5173/login', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // 等待页面完全加载
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n🔧 注入网络监控脚本到前端...');
        
        // 注入脚本到前端，监控axios请求
        await page.evaluateOnNewDocument(() => {
            // 重写XMLHttpRequest
            const originalXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
                const xhr = new originalXHR();
                const originalOpen = xhr.open;
                const originalSend = xhr.send;
                
                xhr.open = function(method, url, ...args) {
                    this._method = method;
                    this._url = url;
                    console.log(`🔗 [前端] 准备发送 ${method} 请求到: ${url}`);
                    return originalOpen.apply(this, [method, url, ...args]);
                };
                
                xhr.send = function(data) {
                    if (data) {
                        console.log(`📤 [前端] 发送请求数据:`, data);
                    }
                    
                    this.addEventListener('readystatechange', function() {
                        if (this.readyState === 4) {
                            console.log(`📥 [前端] 收到响应 ${this.status} ${this._url}:`, this.responseText.substring(0, 200));
                        }
                    });
                    
                    return originalSend.apply(this, [data]);
                };
                
                return xhr;
            };
            
            // 重写fetch
            const originalFetch = window.fetch;
            window.fetch = function(url, options = {}) {
                console.log(`🌐 [前端] Fetch请求: ${options.method || 'GET'} ${url}`);
                if (options.body) {
                    console.log(`📤 [前端] Fetch数据:`, options.body);
                }
                
                return originalFetch.apply(this, arguments).then(response => {
                    console.log(`📥 [前端] Fetch响应 ${response.status} ${url}`);
                    return response;
                });
            };
        });
        
        // 刷新页面以应用监控脚本
        await page.reload({ waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n🧪 执行管理员快捷登录（真实API调用）...');
        
        // 执行管理员登录
        const adminBtn = await page.$('.admin-btn');
        if (adminBtn) {
            await adminBtn.click();
            console.log('🖱️ 点击管理员快捷登录按钮');
            
            // 等待登录API调用完成
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            console.log('\n📍 检查登录结果...');
            const currentUrl = page.url();
            console.log(`当前URL: ${currentUrl}`);
            
            if (currentUrl.includes('/dashboard')) {
                console.log('✅ 登录成功，已跳转到仪表板');
                
                console.log('\n🧪 访问AI助手页面（测试API权限）...');
                await page.goto('https://localhost:5173/ai', { waitUntil: 'networkidle2' });
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const aiPageUrl = page.url();
                console.log(`AI页面URL: ${aiPageUrl}`);
                
                if (aiPageUrl.includes('/ai')) {
                    console.log('✅ AI助手页面加载成功');
                    
                    console.log('\n🤖 测试AI对话API调用...');
                    
                    // 查找并点击智能对话工具
                    const chatTool = await page.$('[data-tool="ai-chat"]');
                    if (chatTool) {
                        await chatTool.click();
                        console.log('🖱️ 点击智能对话工具');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // 查找消息输入框
                        const messageInput = await page.$('.message-input textarea, .input-area textarea, input[placeholder*="消息"], textarea[placeholder*="消息"]');
                        if (messageInput) {
                            await messageInput.type('你好，这是一个测试消息，请简单回复。', { delay: 100 });
                            console.log('✏️ 输入测试消息');
                            
                            // 查找发送按钮
                            const sendBtn = await page.$('.send-btn, .submit-btn, button[type="submit"]');
                            if (sendBtn) {
                                await sendBtn.click();
                                console.log('📤 发送AI对话请求');
                                
                                // 等待AI响应
                                await new Promise(resolve => setTimeout(resolve, 8000));
                            } else {
                                console.log('⚠️ 未找到发送按钮');
                            }
                        } else {
                            console.log('⚠️ 未找到消息输入框');
                        }
                    } else {
                        console.log('⚠️ 未找到智能对话工具');
                    }
                    
                    console.log('\n📊 测试其他API调用...');
                    
                    // 测试获取AI模型列表
                    await page.evaluate(() => {
                        console.log('🧪 [前端] 测试获取AI模型列表API...');
                        // 模拟调用AI模型API
                        if (window.fetch) {
                            fetch('https://shlxlyzagqnc.sealoshzh.site/api/ai/models', {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('kindergarten_token')}`,
                                    'Content-Type': 'application/json'
                                }
                            }).then(response => {
                                console.log('📥 [前端] AI模型列表响应状态:', response.status);
                                return response.text();
                            }).then(data => {
                                console.log('📋 [前端] AI模型列表数据:', data.substring(0, 200));
                            }).catch(error => {
                                console.log('❌ [前端] AI模型列表API错误:', error);
                            });
                        }
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // 测试用户信息API
                    await page.evaluate(() => {
                        console.log('🧪 [前端] 测试获取用户信息API...');
                        if (window.fetch) {
                            fetch('https://shlxlyzagqnc.sealoshzh.site/api/user/profile', {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('kindergarten_token')}`,
                                    'Content-Type': 'application/json'
                                }
                            }).then(response => {
                                console.log('📥 [前端] 用户信息响应状态:', response.status);
                                return response.text();
                            }).then(data => {
                                console.log('📋 [前端] 用户信息数据:', data.substring(0, 200));
                            }).catch(error => {
                                console.log('❌ [前端] 用户信息API错误:', error);
                            });
                        }
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            } else {
                console.log('❌ 登录失败或跳转异常');
            }
        } else {
            console.log('❌ 未找到管理员登录按钮');
        }
        
        console.log('\n📊 网络交互总结:');
        console.log(`总计网络请求: ${networkLogs.filter(log => log.type === 'REQUEST').length}`);
        console.log(`总计网络响应: ${networkLogs.filter(log => log.type === 'RESPONSE').length}`);
        
        const apiRequests = networkLogs.filter(log => 
            log.type === 'REQUEST' && 
            (log.url.includes('shlxlyzagqnc.sealoshzh.site') || log.url.includes('/api/'))
        );
        
        console.log(`后端API请求: ${apiRequests.length}`);
        
        if (apiRequests.length > 0) {
            console.log('\n🔗 API请求详情:');
            apiRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.method} ${req.url}`);
            });
        }
        
        console.log('\n✅ 演示完成！浏览器将保持打开状态，您可以在开发者工具的Network标签页中查看所有网络请求。');
        console.log('💡 提示：在Network标签页中，您可以：');
        console.log('   - 查看所有HTTP请求和响应');
        console.log('   - 查看请求头和响应头');
        console.log('   - 查看请求和响应的具体内容');
        console.log('   - 过滤显示只有API相关的请求');
        
        // 保持浏览器打开以便查看
        console.log('\n🔍 浏览器将保持打开状态30秒，您可以查看开发者工具中的网络请求...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
    } catch (error) {
        console.error('❌ 演示过程中发生错误:', error.message);
        console.error('📋 错误详情:', error.stack);
    } finally {
        if (browser) {
            console.log('\n👋 关闭浏览器...');
            await browser.close();
        }
    }
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
    demonstrateBackendAPIInteraction().catch(console.error);
}

export { demonstrateBackendAPIInteraction };