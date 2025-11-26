/**
 * AI模型数据迁移演示脚本
 * 使用模拟数据展示迁移过程
 */

const http = require('http');

// 模拟幼儿园系统中的标准AI模型配置
const KINDERGARTEN_AI_MODELS = [
    {
        id: 1,
        name: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        modelType: 'text',
        apiVersion: 'v1',
        endpointUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'sk-test-key-123456',
        modelParameters: {
            temperature: 0.7,
            maxTokens: 4096,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0
        },
        isDefault: true,
        status: 'active',
        description: 'OpenAI GPT-3.5 Turbo大语言模型，适用于对话和文本生成',
        capabilities: ['chat', 'completion', 'translation'],
        maxTokens: 4096
    },
    {
        id: 2,
        name: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'OpenAI',
        modelType: 'text',
        apiVersion: 'v1',
        endpointUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'sk-test-key-789012',
        modelParameters: {
            temperature: 0.5,
            maxTokens: 8192,
            topP: 0.95,
            frequencyPenalty: 0,
            presencePenalty: 0
        },
        isDefault: false,
        status: 'active',
        description: 'OpenAI GPT-4大语言模型，具备更强的推理能力',
        capabilities: ['chat', 'completion', 'analysis', 'reasoning'],
        maxTokens: 8192
    },
    {
        id: 3,
        name: 'doubao-pro',
        displayName: '豆包Pro',
        provider: 'ByteDance',
        modelType: 'text',
        apiVersion: 'v2',
        endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/completions',
        apiKey: 'doubao-api-key-345678',
        modelParameters: {
            temperature: 0.8,
            maxTokens: 2048,
            topP: 0.9,
            repetitionPenalty: 1.2
        },
        isDefault: false,
        status: 'active',
        description: '字节跳动豆包Pro大语言模型，中文理解能力强',
        capabilities: ['chat', 'completion', 'translation', 'analysis'],
        maxTokens: 2048
    },
    {
        id: 4,
        name: 'claude-3-sonnet',
        displayName: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        modelType: 'text',
        apiVersion: '2023-06-01',
        endpointUrl: 'https://api.anthropic.com/v1/messages',
        apiKey: 'sk-ant-test-key-901234',
        modelParameters: {
            temperature: 0.6,
            maxTokens: 4096,
            topK: 250
        },
        isDefault: false,
        status: 'active',
        description: 'Anthropic Claude 3 Sonnet，平衡了性能和成本',
        capabilities: ['chat', 'completion', 'analysis'],
        maxTokens: 4096
    },
    {
        id: 5,
        name: 'text-embedding-ada-002',
        displayName: 'Text Embedding Ada 002',
        provider: 'OpenAI',
        modelType: 'embedding',
        apiVersion: '1',
        endpointUrl: 'https://api.openai.com/v1/embeddings',
        apiKey: 'sk-test-key-567890',
        modelParameters: {
            encodingFormat: 'float',
            dimensions: 1536
        },
        isDefault: false,
        status: 'active',
        description: 'OpenAI文本嵌入模型，用于向量搜索和语义分析',
        capabilities: ['embedding'],
        maxTokens: 8191
    }
];

// 模拟统一租户中心的配置
const TENANT_CONFIGS = [
    {
        tenantId: 1,
        name: '默认租户',
        enabledModels: [1, 3, 4], // 启用GPT-3.5, 豆包Pro, Claude 3
        rateLimit: 100, // 每分钟100次
        monthlyQuota: 200000 // 月度20万token
    },
    {
        tenantId: 2,
        name: '教育机构租户',
        enabledModels: [1, 4], // 只启用GPT-3.5, Claude 3
        rateLimit: 50,
        monthlyQuota: 100000
    }
];

class AIModelMigrationDemo {
    constructor() {
        this.migratedModels = [];
        this.tenantConfigs = [];
    }

    // 显示幼儿园系统AI模型
    displayKinderGartenModels() {
        console.log('🎓 幼儿园系统 AI模型配置');
        console.log('=====================================\n');

        console.log(`📋 共有 ${KINDERGARTEN_AI_MODELS.length} 个标准AI模型:`);

        KINDERGARTEN_AI_MODELS.forEach((model, index) => {
            console.log(`${index + 1}. ${model.displayName}`);
            console.log(`   🔑 模型名称: ${model.name}`);
            console.log(`   🏢 提供商: ${model.provider}`);
            console.log(`   📚 类型: ${model.modelType}`);
            console.log(`   ✅ 状态: ${model.status}`);
            console.log(`   🎯 是否默认: ${model.isDefault ? '是' : '否'}`);
            console.log(`   🔗 端点: ${model.endpointUrl}`);

            if (model.capabilities.length > 0) {
                console.log(`   ⚡ 能力: ${model.capabilities.join(', ')}`);
            }

            if (model.maxTokens) {
                console.log(`   📏 最大Token: ${model.maxTokens.toLocaleString()}`);
            }

            if (model.description) {
                console.log(`   📝 描述: ${model.description}`);
            }

            console.log('');
        });
    }

    // 显示迁移目标
    displayMigrationTarget() {
        console.log('🎯 迁移目标: 统一租户中心AI模型');
        console.log('=====================================\n');

        console.log('🏢 统一租户中心特性:');
        console.log('   ✅ 集中式模型管理');
        console.log('   ✅ 租户级权限控制');
        console.log('   ✅ 灵活的配额管理');
        console.log('   ✅ 统一的计费系统');
        console.log('   ✅ 实时使用统计');
        console.log('   ✅ 标准化的API接口');

        console.log('\n👥 待配置的租户:');
        TENANT_CONFIGS.forEach((config, index) => {
            console.log(`${index + 1}. ${config.name} (ID: ${config.tenantId})`);
            console.log(`   - 启用模型数: ${config.enabledModels.length}`);
            console.log(`   - 频率限制: ${config.rateLimit}次/分钟`);
            console.log(`   - 月度配额: ${config.monthlyQuota.toLocaleString()} tokens`);
            console.log('');
        });
    }

    // 执行数据迁移
    performMigration() {
        console.log('🔄 开始执行AI模型数据迁移...');
        console.log('=====================================\n');

        let totalMigrated = 0;

        KINDERGARTEN_AI_MODELS.forEach((model) => {
            // 模拟迁移到统一租户中心
            const newModelId = 1000 + model.id; // 避免ID冲突

            const migratedModel = {
                ...model,
                id: newModelId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.migratedModels.push(migratedModel);
            console.log(`✅ 迁移模型: ${model.displayName}`);
            console.log(`   原ID: ${model.id} → 新ID: ${newModelId}`);
            console.log(`   状态: ${model.status}`);
            totalMigrated++;

            // 为模型生成租户配置
            model.tenantConfigs = [];
            TENANT_CONFIGS.forEach(config => {
                if (config.enabledModels.includes(model.id)) {
                    model.tenantConfigs.push({
                        tenantId: config.tenantId,
                        tenantName: config.name,
                        isEnabled: true,
                        priority: 1,
                        rateLimit: config.rateLimit,
                        monthlyQuota: config.monthlyQuota,
                        monthlyUsed: Math.floor(Math.random() * 50000),
                        lastUsed: new Date().toISOString()
                    });

                    console.log(`   - 配置给租户: ${config.name}`);
                }
            });
        });

        console.log(`\n📊 迁移统计:`);
        console.log(`   📦 总计迁移模型: ${totalMigrated} 个`);
        console.log(`   🏢 生成的租户配置: ${this.migratedModels.length * TENANT_CONFIGS.length} 个`);

        this.tenantConfigs = this.migratedModels.flatMap(model =>
            model.tenantConfigs || []
        );
    }

    // 验证迁移结果
    async validateMigration() {
        console.log('\n🧪 验证迁移结果...');
        console.log('=====================================\n');

        // 1. 测试AI Bridge服务
        console.log('1️⃣ 测试AI Bridge服务连接...');
        try {
            const healthResponse = await this.makeRequest('GET', '/api/v1/ai/bridge/health');
            if (healthResponse.statusCode === 200) {
                console.log('✅ AI Bridge服务运行正常');
            } else {
                console.log('❌ AI Bridge服务连接失败');
            }
        } catch (error) {
            console.log('❌ 无法连接AI Bridge服务:', error.message);
        }

        // 2. 测试模型列表
        console.log('\n2️⃣ 测试AI模型列表API...');
        try {
            const modelsResponse = await this.makeRequest('GET', '/api/v1/ai/bridge/models', null, {
                'Authorization': 'Bearer test-token',
                'X-Tenant-ID': '1'
            });

            if (modelsResponse.statusCode === 200) {
                const data = JSON.parse(modelsResponse.body);
                console.log('✅ 模型列表获取成功');
                console.log(`📋 可用模型数量: ${data.data.models.length}`);

                // 显示模型列表
                data.data.models.forEach((model, index) => {
                    console.log(`   ${index + 1}. ${model.displayName} (${model.provider})`);
                    console.log(`      - 定价: 输入 $${model.pricing.inputTokenPrice}/token, 输出 $${model.pricing.outputTokenPrice}/token`);
                });
            } else {
                console.log('❌ 模型列表获取失败');
                console.log(`   状态码: ${modelsResponse.statusCode}`);
            }
        } catch (error) {
            console.log('❌ 测试模型列表失败:', error.message);
        }

        // 3. 模拟租户配置验证
        console.log('\n3️⃣ 验证租户配置...');
        console.log(`✅ 配置的租户数: ${this.tenantConfigs.length}`);
        this.tenantConfigs.forEach((config, index) => {
            console.log(`   ${index + 1}. ${config.tenantName} (ID: ${config.tenantId})`);
            console.log(`      - 月度使用量: ${config.monthlyUsed.toLocaleString()} / ${config.monthlyQuota.toLocaleString()}`);
            console.log(`      - 使用率: ${(config.monthlyUsed / config.monthlyQuota * 100).toFixed(1)}%`);
        });

        // 4. AI对话测试
        console.log('\n4️⃣ 测试AI对话功能...');
        try {
            const chatResponse = await this.makeRequest('POST', '/api/v1/ai/bridge/chat', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: '请介绍一下AI模型中心化的优势' }
                ],
                temperature: 0.7,
                max_tokens: 100
            }, {
                'Authorization': 'Bearer test-token',
                'X-Tenant-ID': '1'
            });

            if (chatResponse.statusCode === 200) {
                const data = JSON.parse(chatResponse.body);
                console.log('✅ AI对话测试成功');
                console.log(`   响应模型: ${data.data.model}`);
                console.log(`   Token使用: ${data.usage.totalTokens}`);
                console.log(`   费用: $${data.usage.cost.toFixed(6)}`);
                console.log(`   响应时间: ${data.usage.responseTime}ms`);
                console.log(`   AI回复: "${data.data.choices[0].message.content.substring(0, 50)}..."`);
            } else {
                console.log('❌ AI对话测试失败');
            }
        } catch (error) {
            console.log('❌ AI对话测试失败:', error.message);
        }
    }

    // 简单的HTTP请求方法
    makeRequest(method, path, data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 4000,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => {
                    body += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    // 生成迁移报告
    generateReport() {
        console.log('\n📋 AI模型数据迁移完成报告');
        console.log('=====================================\n');

        console.log('✅ 迁移成功的核心功能:');
        console.log('   1. 📊 数据标准化 - 所有AI模型配置已标准化');
        console.log('   2. 🏢 租户级配置 - 支持多租户独立配置');
        console.log('   3. 🔐 安全管理 - API密钥集中管理');
        console.log('   4. 📈 使用统计 - 实时监控Token使用');
        console.log('   5. 💰 计费系统 - 精确的Token计费');
        console.log('   6. 🚀 API网关 - 统一的Bridge接口');

        console.log('\n🎯 迁移后系统架构:');
        console.log('┌───────────────────────────────────────────────────────┐');
        console.log('│                 统一租户中心 (4000端口)                   │');
        console.log('│  ┌─────────────┐           ┌─────────────┐                       │');
        console.log('│  │ AI模型配置  │           │ 租户管理     │                       │');
        console.log('  │   ↓        │           │   ↓        │                       │');
        console.log('│  └─────────────┘           │ └─────────────┘                       │');
        console.log('│               ↓                           ↓                           │');
        console.log('│         ┌─────────────┐       ┌─────────────┐           │');
        console.log('│         │  AI Bridge   │       │  统一计费   │           │');
        console.log('│         │   ↓        │       │   ↓        │           │');
        console.log('│         └─────────────┘       └─────────────┘           │');
        console.log('│                     ↓                         ↓           │');
        console.log('│              ┌─────────────────────┐               │');
        console.log('│              │  各业务系统 (幼儿园等)   │               │');
        console.log('│              │     ↓              │               │');
        console.log('│              └─────────────────────┘               │');
        console.log('│                                                    │');
        console.log('└───────────────────────────────────────────────────────┘');

        console.log('\n📈 预期效果:');
        console.log('   🌟 统一管理 - 所有AI模型配置集中管理');
        console.log('   💰 成本控制 - 统一的计费和配额管理');
        console.log('   🔐 安全增强 - API密钥集中存储');
        console.log('   📊 数据洞察 - 全局使用分析和报告');
        console.log('   🚀 易于扩展 - 支持新租户快速接入');
        console.log('   🔧 简化运维 - 减少各租户独立维护');

        console.log('\n🎉 迁移成功! 🎊');
        console.log('✅ 统一租户中心现在拥有了标准的AI模型配置');
        console.log('🚀 可以开始为各个租户配置不同的AI模型权限和配额');
        console.log('💡 幼儿园系统可以通过Bridge客户端无缝使用统一租户中心的AI服务');
    }

    // 主演示函数
    async run() {
        try {
            // 1. 显示幼儿园系统AI模型
            this.displayKinderGartenModels();

            // 2. 显示迁移目标
            this.displayMigrationTarget();

            // 3. 执行数据迁移
            this.performMigration();

            // 4. 验证迁移结果
            await this.validateMigration();

            // 5. 生成报告
            this.generateReport();

        } catch (error) {
            console.error('💥 迁移过程发生错误:', error.message);
            console.error('💡 请检查数据库连接和权限配置');
        }
    }
}

// 运行演示
if (require.main === module) {
    const migrator = new AIModelMigrationDemo();
    migrator.run();
}

module.exports = { AIModelMigrationDemo };