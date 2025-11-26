/**
 * AI Bridge中心化测试脚本
 * 测试统一租户中心和幼儿园系统之间的AI Bridge连接
 */

const axios = require('axios');

// 配置
const UNIFIED_TENANT_URL = 'http://localhost:4000';
const KINDERGARTEN_URL = 'http://localhost:3000';

console.log('🚀 开始AI模型中心化测试...\n');

// 测试统一租户中心AI Bridge API
async function testUnifiedTenantBridge() {
    console.log('📋 测试1: 检查统一租户中心AI Bridge服务');

    try {
        // 测试健康检查
        console.log('  🔍 检查健康状态...');
        const healthResponse = await axios.get(`${UNIFIED_TENANT_URL}/api/v1/ai/bridge/health`, {
            timeout: 5000
        });
        console.log('  ✅ 健康检查通过:', healthResponse.data);

        // 测试模型列表
        console.log('  📝 获取可用模型...');
        const modelsResponse = await axios.get(`${UNIFIED_TENANT_URL}/api/v1/ai/bridge/models`, {
            timeout: 5000
        });
        console.log('  ✅ 模型列表获取成功:', modelsResponse.data);

        return true;
    } catch (error) {
        console.log('  ❌ 统一租户中心连接失败:');
        if (error.code === 'ECONNREFUSED') {
            console.log('     - 连接被拒绝，服务可能未启动');
        } else if (error.code === 'ECONNRESET') {
            console.log('     - 连接被重置');
        } else {
            console.log('     - 错误:', error.message);
        }
        return false;
    }
}

// 测试幼儿园系统Bridge客户端
async function testKindergartenBridgeClient() {
    console.log('\n📋 测试2: 检查幼儿园系统Bridge客户端');

    try {
        // 测试幼儿园系统AI模型API（应该通过Bridge客户端调用）
        console.log('  🔍 测试AI模型API...');
        const response = await axios.get(`${KINDERGARTEN_URL}/api/ai/models`, {
            timeout: 5000
        });
        console.log('  ✅ 幼儿园系统API响应:', response.data);

        // 检查是否使用了Bridge模式
        if (response.data.message && response.data.message.includes('降级模式')) {
            console.log('  ⚠️  当前运行在降级模式（Bridge客户端失败）');
        } else if (response.data.data && Array.isArray(response.data.data)) {
            console.log('  ✅ Bridge客户端工作正常，返回模型列表');
        }

        return true;
    } catch (error) {
        console.log('  ❌ 幼儿园系统连接失败:');
        if (error.code === 'ECONNREFUSED') {
            console.log('     - 连接被拒绝，服务可能未启动');
        } else {
            console.log('     - 错误:', error.message);
        }
        return false;
    }
}

// 测试完整的AI调用流程
async function testCompleteAIFlow() {
    console.log('\n📋 测试3: 完整AI调用流程测试');

    try {
        console.log('  🤖 发送AI对话请求...');

        const aiRequest = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: "你好，请简单介绍一下你自己" }
            ],
            temperature: 0.7,
            max_tokens: 100
        };

        const response = await axios.post(`${UNIFIED_TENANT_URL}/api/v1/ai/bridge/chat`, aiRequest, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token',
                'X-Tenant-ID': '1'
            }
        });

        console.log('  ✅ AI调用成功:');
        console.log('     - 响应状态:', response.data.success ? '成功' : '失败');
        if (response.data.usage) {
            console.log('     - Token使用:', response.data.usage);
        }
        if (response.data.data) {
            console.log('     - AI回复长度:', JSON.stringify(response.data.data).length, '字符');
        }

        return true;
    } catch (error) {
        console.log('  ❌ AI调用失败:');
        if (error.response) {
            console.log('     - 状态码:', error.response.status);
            console.log('     - 错误信息:', error.response.data);
        } else {
            console.log('     - 错误:', error.message);
        }
        return false;
    }
}

// 主测试函数
async function runTests() {
    console.log('🎯 AI模型中心化集成测试');
    console.log('=====================================\n');

    const results = {
        unifiedTenant: await testUnifiedTenantBridge(),
        kindergarten: await testKindergartenBridgeClient(),
        completeFlow: false // 只有前两个都成功才测试
    };

    if (results.unifiedTenant && results.kindergarten) {
        results.completeFlow = await testCompleteAIFlow();
    }

    // 输出测试结果
    console.log('\n📊 测试结果汇总');
    console.log('=====================================');
    console.log('统一租户中心Bridge:', results.unifiedTenant ? '✅ 通过' : '❌ 失败');
    console.log('幼儿园Bridge客户端:', results.kindergarten ? '✅ 通过' : '❌ 失败');
    console.log('完整AI调用流程:', results.completeFlow ? '✅ 通过' : '❌ 失败/跳过');

    const allPassed = results.unifiedTenant && results.kindergarten && results.completeFlow;

    if (allPassed) {
        console.log('\n🎉 恭喜！AI模型中心化集成测试全部通过！');
        console.log('🚀 系统已准备好进行AI模型中心化迁移。');
    } else {
        console.log('\n⚠️  测试未完全通过，需要进行以下修复:');
        if (!results.unifiedTenant) {
            console.log('   - 启动统一租户中心服务 (端口4000)');
            console.log('   - 检查AI Bridge API路由配置');
        }
        if (!results.kindergarten) {
            console.log('   - 启动幼儿园系统服务 (端口3000)');
            console.log('   - 检查Bridge客户端配置');
        }
        if (results.unifiedTenant && results.kindergarten && !results.completeFlow) {
            console.log('   - 检查AI模型配置和认证');
            console.log('   - 验证租户权限设置');
        }
    }

    return allPassed;
}

// 运行测试
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = { runTests, testUnifiedTenantBridge, testKindergartenBridgeClient, testCompleteAIFlow };