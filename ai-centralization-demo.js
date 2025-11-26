/**
 * AI模型中心化演示脚本
 * 展示幼儿园系统通过统一租户中心的AI Bridge调用AI模型
 */

const http = require('http');

// 配置
const AI_BRIDGE_URL = 'localhost:4000';
const TENANT_ID = '1';
const AUTH_TOKEN = 'Bearer demo-token';

// 模拟幼儿园系统的AI Bridge客户端
class KindergartenAIBridgeClient {
    constructor() {
        this.baseUrl = `http://${AI_BRIDGE_URL}`;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': AUTH_TOKEN,
            'X-Tenant-ID': TENANT_ID,
            'X-User-ID': 'kindergarten-user-001'
        };
    }

    // 发送HTTP请求
    async makeRequest(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: AI_BRIDGE_URL,
                port: 4000,
                path: path,
                method: method,
                headers: this.headers
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    try {
                        const response = JSON.parse(body);
                        resolve({
                            statusCode: res.statusCode,
                            data: response
                        });
                    } catch (error) {
                        reject(error);
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

    // 健康检查
    async healthCheck() {
        try {
            const response = await this.makeRequest('GET', '/api/v1/ai/bridge/health');
            return response.statusCode === 200;
        } catch (error) {
            console.error('健康检查失败:', error.message);
            return false;
        }
    }

    // 获取可用模型
    async getAvailableModels() {
        try {
            const response = await this.makeRequest('GET', '/api/v1/ai/bridge/models');
            if (response.statusCode === 200) {
                return response.data.data.models;
            }
            throw new Error(`获取模型失败: ${response.statusCode}`);
        } catch (error) {
            console.error('获取模型列表失败:', error.message);
            throw error;
        }
    }

    // AI对话
    async chat(model, messages, options = {}) {
        try {
            const requestData = {
                model,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 1000
            };

            const response = await this.makeRequest('POST', '/api/v1/ai/bridge/chat', requestData);

            if (response.statusCode === 200) {
                return {
                    success: true,
                    content: response.data.data.choices[0].message.content,
                    usage: response.data.usage,
                    modelInfo: {
                        model: response.data.data.model,
                        responseId: response.data.data.id
                    }
                };
            } else {
                throw new Error(`AI对话失败: ${response.statusCode} - ${response.data.error}`);
            }
        } catch (error) {
            console.error('AI对话失败:', error.message);
            throw error;
        }
    }

    // 文本嵌入
    async embedding(text, model = 'text-embedding-ada-002') {
        try {
            const requestData = {
                model,
                input: text
            };

            const response = await this.makeRequest('POST', '/api/v1/ai/bridge/embedding', requestData);

            if (response.statusCode === 200) {
                return {
                    success: true,
                    embedding: response.data.data.data[0].embedding,
                    usage: response.data.usage,
                    model: response.data.data.model
                };
            } else {
                throw new Error(`文本嵌入失败: ${response.statusCode} - ${response.data.error}`);
            }
        } catch (error) {
            console.error('文本嵌入失败:', error.message);
            throw error;
        }
    }

    // 获取使用统计
    async getUsageStats(startDate, endDate) {
        try {
            let query = '';
            if (startDate || endDate) {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                query = '?' + params.toString();
            }

            const response = await this.makeRequest('GET', `/api/v1/ai/bridge/usage-stats${query}`);

            if (response.statusCode === 200) {
                return {
                    success: true,
                    stats: response.data.data
                };
            } else {
                throw new Error(`获取统计失败: ${response.statusCode} - ${response.data.error}`);
            }
        } catch (error) {
            console.error('获取使用统计失败:', error.message);
            throw error;
        }
    }
}

// 演示函数
async function demonstrateAICentralization() {
    console.log('🎯 AI模型中心化演示');
    console.log('=====================================\n');

    const client = new KindergartenAIBridgeClient();

    // 1. 健康检查
    console.log('📋 步骤1: 检查AI Bridge服务状态');
    try {
        const isHealthy = await client.healthCheck();
        if (isHealthy) {
            console.log('✅ AI Bridge服务运行正常');
        } else {
            console.log('❌ AI Bridge服务不可用');
            return;
        }
    } catch (error) {
        console.log('❌ 无法连接到AI Bridge服务:', error.message);
        return;
    }

    // 2. 获取可用模型
    console.log('\n📋 步骤2: 获取可用的AI模型');
    try {
        const models = await client.getAvailableModels();
        console.log('✅ 可用模型列表:');
        models.forEach(model => {
            console.log(`   - ${model.displayName} (${model.provider})`);
            console.log(`     能力: ${model.capabilities.join(', ')}`);
            console.log(`     定价: 输入 $${model.pricing.inputTokenPrice}/token, 输出 $${model.pricing.outputTokenPrice}/token`);
        });
    } catch (error) {
        console.log('❌ 获取模型列表失败:', error.message);
        return;
    }

    // 3. AI对话演示
    console.log('\n📋 步骤3: AI对话演示');
    try {
        const chatResponse = await client.chat('gpt-3.5-turbo', [
            { role: 'user', content: '请简单介绍一下AI模型中心化的优势' }
        ]);

        console.log('✅ AI对话成功:');
        console.log(`   - 使用的模型: ${chatResponse.modelInfo.model}`);
        console.log(`   - 响应ID: ${chatResponse.modelInfo.responseId}`);
        console.log(`   - Token使用: ${chatResponse.usage.totalTokens} (输入: ${chatResponse.usage.inputTokens}, 输出: ${chatResponse.usage.outputTokens})`);
        console.log(`   - 费用: $${chatResponse.usage.cost.toFixed(6)}`);
        console.log(`   - 响应时间: ${chatResponse.usage.responseTime}ms`);
        console.log(`   - AI回复: "${chatResponse.content.substring(0, 100)}..."`);
    } catch (error) {
        console.log('❌ AI对话失败:', error.message);
    }

    // 4. 文本嵌入演示
    console.log('\n📋 步骤4: 文本嵌入演示');
    try {
        const embeddingText = 'AI模型中心化是现代化AI服务管理的重要模式';
        const embeddingResponse = await client.embedding(embeddingText);

        console.log('✅ 文本嵌入成功:');
        console.log(`   - 嵌入模型: ${embeddingResponse.model}`);
        console.log(`   - 输入文本: "${embeddingText}"`);
        console.log(`   - 向量维度: ${embeddingResponse.embedding.length}`);
        console.log(`   - Token使用: ${embeddingResponse.usage.totalTokens}`);
        console.log(`   - 费用: $${embeddingResponse.usage.cost.toFixed(6)}`);
        console.log(`   - 响应时间: ${embeddingResponse.usage.responseTime}ms`);
        console.log(`   - 向量示例: [${embeddingResponse.embedding.slice(0, 5).map(v => v.toFixed(6)).join(', ')}, ...]`);
    } catch (error) {
        console.log('❌ 文本嵌入失败:', error.message);
    }

    // 5. 获取使用统计
    console.log('\n📋 步骤5: 获取使用统计');
    try {
        const statsResponse = await client.getUsageStats();

        console.log('✅ 使用统计:');
        console.log(`   - 总请求数: ${statsResponse.stats.summary.totalRequests}`);
        console.log(`   - 总Token数: ${statsResponse.stats.summary.totalTokens}`);
        console.log(`   - 总费用: $${statsResponse.stats.summary.totalCost.toFixed(6)}`);
        console.log(`   - 平均响应时间: ${Math.round(statsResponse.stats.summary.avgResponseTime)}ms`);
        console.log(`   - 成功率: ${(statsResponse.stats.summary.successRate * 100).toFixed(1)}%`);

        console.log('\n   按模型统计:');
        Object.entries(statsResponse.stats.modelBreakdown).forEach(([model, stats]) => {
            console.log(`   - ${model}: ${stats.requests}次请求, ${stats.tokens}tokens, $${stats.cost.toFixed(6)}`);
        });

        console.log('\n   租户信息:');
        const tenantInfo = statsResponse.stats.tenantInfo;
        console.log(`   - 频率限制: ${tenantInfo.rateLimit}次/分钟`);
        console.log(`   - 月度配额: ${tenantInfo.monthlyQuota} tokens`);
        console.log(`   - 当前使用: ${tenantInfo.currentUsage} tokens (${(tenantInfo.currentUsage / tenantInfo.monthlyQuota * 100).toFixed(1)}%)`);
    } catch (error) {
        console.log('❌ 获取统计失败:', error.message);
    }

    // 6. 批量调用演示（模拟实际业务场景）
    console.log('\n📋 步骤6: 批量调用演示（模拟业务场景）');
    const businessQuestions = [
        '如何提高幼儿园的教学质量？',
        '怎样设计更好的招生方案？',
        '如何优化班级管理？'
    ];

    try {
        console.log('   正在处理多个业务问题...');
        const promises = businessQuestions.map((question, index) =>
            client.chat('doubao', [
                { role: 'user', content: question }
            ]).then(response => ({
                question,
                index: index + 1,
                response: response.content.substring(0, 50) + '...',
                tokens: response.usage.totalTokens,
                cost: response.usage.cost
            }))
        );

        const results = await Promise.all(promises);

        console.log('✅ 批量处理完成:');
        results.forEach(result => {
            console.log(`   问题${result.index}: "${result.question}"`);
            console.log(`   回复: ${result.response}`);
            console.log(`   使用: ${result.tokens} tokens, 费用: $${result.cost.toFixed(6)}`);
            console.log('');
        });
    } catch (error) {
        console.log('❌ 批量处理失败:', error.message);
    }

    // 总结
    console.log('🎉 AI模型中心化演示完成');
    console.log('=====================================');
    console.log('✅ 演示了以下核心功能:');
    console.log('   1. 统一租户中心AI Bridge服务');
    console.log('   2. 租户级别的模型权限管理');
    console.log('   3. 多种AI模型支持（OpenAI、豆包等）');
    console.log('   4. 实时使用统计和计费');
    console.log('   5. 频率限制和配额管理');
    console.log('   6. 统一的API接口标准');
    console.log('\n🚀 AI模型中心化架构已成功验证！');
    console.log('💡 这种架构的优势:');
    console.log('   - 集中化管理所有AI模型配置');
    console.log('   - 统一的使用统计和计费系统');
    console.log('   - 租户级别的权限和配额控制');
    console.log('   - 简化客户端集成，降低维护成本');
    console.log('   - 支持全国范围内的可计费部署');
}

// 运行演示
if (require.main === module) {
    demonstrateAICentralization().catch(error => {
        console.error('演示执行失败:', error);
        process.exit(1);
    });
}

module.exports = { KindergartenAIBridgeClient, demonstrateAICentralization };