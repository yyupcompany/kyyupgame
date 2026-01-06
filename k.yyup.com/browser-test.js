// 浏览器自动化测试脚本
import http from 'http';

// 简单的HTTP请求函数
function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// 测试完整流程
async function testCompleteFlow() {
    console.log('🚀 开始完整的AI助手测试流程...');
    console.log('=====================================');

    try {
        // 1. 测试登录
        console.log('\n🔐 步骤1: 测试管理员登录...');
        const loginResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, {
            username: 'admin',
            password: '123456'
        });

        console.log('登录状态:', loginResponse.status);
        if (loginResponse.status === 200 && loginResponse.data.success) {
            const token = loginResponse.data.data.token;
            console.log('✅ 登录成功，Token获取成功');
            console.log('用户信息:', loginResponse.data.data.user.realName, '-', loginResponse.data.data.user.role);

            // 2. 测试用户权限验证
            console.log('\n🛡️ 步骤2: 测试JWT认证...');
            const profileResponse = await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/auth/profile',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('权限验证状态:', profileResponse.status);
            if (profileResponse.status === 200) {
                console.log('✅ JWT认证成功');
            } else {
                console.log('❌ JWT认证失败');
            }

            // 3. 测试AI助手查询接口
            console.log('\n🤖 步骤3: 测试AI助手查询...');
            const aiResponse = await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/ai-query',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }, {
                query: '请帮我查询所有学生信息',
                context: {
                    useTools: true,
                    maxTokens: 2000
                }
            });

            console.log('AI查询状态:', aiResponse.status);
            if (aiResponse.status === 200) {
                console.log('✅ AI查询成功');
                console.log('AI响应类型:', aiResponse.data.data.type);
                console.log('使用的模型:', aiResponse.data.data.metadata.usedModel);
                console.log('执行时间:', aiResponse.data.data.metadata.executionTime + 'ms');
                console.log('优化级别:', aiResponse.data.data.metadata.optimizationLevel);

                // 4. 测试AI工具调用
                console.log('\n🔧 步骤4: 验证AI工具调用链路...');
                if (aiResponse.data.data.metadata.optimizationApplied.includes('smart_model_routing')) {
                    console.log('✅ 智能模型路由已应用');
                }
                if (aiResponse.data.data.metadata.optimizationApplied.includes('caching')) {
                    console.log('✅ 缓存优化已应用');
                }
            } else {
                console.log('❌ AI查询失败');
                console.log('错误信息:', aiResponse.data);
            }

            // 5. 测试前端页面访问
            console.log('\n🌐 步骤5: 测试前端页面访问...');
            const frontendResponse = await makeRequest({
                hostname: 'localhost',
                port: 5173,
                path: '/',
                method: 'GET'
            });

            console.log('前端访问状态:', frontendResponse.status);
            if (frontendResponse.status === 200) {
                console.log('✅ 前端页面访问正常');
                if (frontendResponse.data.includes('幼儿园招生管理系统')) {
                    console.log('✅ 页面标题正确');
                }
            } else {
                console.log('❌ 前端页面访问失败');
            }

        } else {
            console.log('❌ 登录失败');
            console.log('错误信息:', loginResponse.data);
        }

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
    }

    console.log('\n📊 测试流程完成！');
    console.log('=====================================');
}

// 运行测试
testCompleteFlow();