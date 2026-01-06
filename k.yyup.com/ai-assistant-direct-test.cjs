#!/usr/bin/env node

/**
 * AI助手直接API测试
 * 绕过前端，直接测试后端AI助手功能
 */

const http = require('http');
const https = require('https');

// 配置
const API_BASE = 'http://localhost:3000';
const LOGIN_DATA = {
    username: 'admin',
    password: '123456'
};

// AI测试提示词
const TEST_PROMPTS = [
    {
        name: '基础对话测试',
        prompt: '你好，你是谁？请介绍一下你的功能。'
    },
    {
        name: '专业咨询测试',
        prompt: '请帮我生成一份幼儿园招生活动的策划方案。'
    },
    {
        name: '数据查询测试',
        prompt: '查询最近5个活动的基本信息。'
    }
];

// HTTP请求工具函数
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AI-Assistant-Test/1.0'
            },
            ...options
        };

        const req = protocol.request(url, requestOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

// 登录获取token
async function login() {
    console.log('🔐 正在登录...');

    try {
        const response = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Host': 'localhost:5173'
            },
            body: JSON.stringify(LOGIN_DATA)
        });

        if (response.status === 200 && response.data.success) {
            console.log('✅ 登录成功');
            console.log('用户信息:', response.data.data.user.username, '(', response.data.data.user.role, ')');
            console.log('Token:', response.data.data.token.substring(0, 50) + '...');
            return response.data.data.token;
        } else {
            throw new Error(`登录失败: ${response.data.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('❌ 登录失败:', error.message);
        throw error;
    }
}

// 测试AI助手流式响应
async function testAIStreaming(token, prompt) {
    console.log(`\n🤖 测试提示: ${prompt}`);
    console.log('=' .repeat(50));

    try {
        const response = await makeRequest(`${API_BASE}/api/ai/unified/stream-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Host': 'localhost:5173'
            },
            body: JSON.stringify({
                message: prompt,
                conversationId: `test_${Date.now()}`,
                userId: 121
            })
        });

        console.log(`HTTP状态: ${response.status}`);

        if (response.status !== 200) {
            console.log('错误响应:', response.data);
            return { success: false, error: response.data };
        }

        // 解析流式响应数据
        const responseData = response.data;
        const lines = responseData.split('\n');

        let events = [];
        let aiResponse = '';
        let connected = false;
        let thinkingComplete = false;

        for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.substring(6));
                    events.push(data.type);

                    switch (data.type) {
                        case 'connected':
                            connected = true;
                            console.log('🔗 连接建立');
                            break;
                        case 'thinking_start':
                            console.log('🤔 AI开始思考...');
                            break;
                        case 'thinking':
                            if (data.message) {
                                console.log('💭', data.message);
                            }
                            break;
                        case 'thinking_complete':
                            thinkingComplete = true;
                            console.log('✅ 思考完成');
                            break;
                        case 'answer':
                            if (data.message) {
                                aiResponse += data.message;
                                console.log('🎯 AI回复:', data.message);
                            }
                            break;
                        case 'complete':
                            console.log('🎉 对话完成');
                            break;
                        default:
                            if (data.message) {
                                console.log(`📨 ${data.type}:`, data.message);
                            }
                    }
                } catch (parseError) {
                    // 忽略解析错误
                }
            }
        }

        console.log('\n📊 测试结果:');
        console.log(`- 收到事件: [${events.join(', ')}]`);
        console.log(`- 连接建立: ${connected ? '✅' : '❌'}`);
        console.log(`- 思考完成: ${thinkingComplete ? '✅' : '❌'}`);
        console.log(`- AI回复长度: ${aiResponse.length} 字符`);
        console.log(`- 收到事件数: ${events.length}`);

        return {
            success: connected && thinkingComplete,
            events: events,
            responseLength: aiResponse.length,
            connected: connected,
            thinkingComplete: thinkingComplete
        };

    } catch (error) {
        console.error('❌ AI测试失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 主测试函数
async function main() {
    console.log('🚀 AI助手功能测试开始');
    console.log('=' .repeat(60));

    try {
        // 1. 登录获取token
        const token = await login();

        console.log('\n🧪 开始AI助手功能测试...');

        const results = [];

        // 2. 测试各种提示词
        for (const testPrompt of TEST_PROMPTS) {
            console.log(`\n${testPrompt.name}:`);
            const result = await testAIStreaming(token, testPrompt.prompt);
            results.push({
                ...testPrompt,
                ...result
            });

            // 等待一下再测试下一个
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 3. 生成测试报告
        console.log('\n📋 测试报告');
        console.log('=' .repeat(60));

        const successfulTests = results.filter(r => r.success).length;
        const totalTests = results.length;

        console.log(`总体通过率: ${successfulTests}/${totalTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`);
        console.log('');

        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.name}`);
            console.log(`   状态: ${result.success ? '✅ 通过' : '❌ 失败'}`);
            console.log(`   收到事件: [${result.events ? result.events.join(', ') : '无'}]`);
            console.log(`   回复长度: ${result.responseLength || 0} 字符`);
            if (result.error) {
                console.log(`   错误: ${result.error}`);
            }
            console.log('');
        });

        console.log('🎯 测试完成!');

        if (successfulTests === totalTests) {
            console.log('🎉 所有测试通过! AI助手功能正常工作。');
            process.exit(0);
        } else if (successfulTests > 0) {
            console.log('⚠️ 部分测试通过，AI助手部分功能正常。');
            process.exit(1);
        } else {
            console.log('❌ 所有测试失败，AI助手功能异常。');
            process.exit(2);
        }

    } catch (error) {
        console.error('\n💥 测试过程出错:', error.message);
        process.exit(3);
    }
}

// 运行测试
if (require.main === module) {
    main();
}

module.exports = { login, testAIStreaming, main };