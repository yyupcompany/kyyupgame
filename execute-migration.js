/**
 * 执行AI模型数据库迁移
 * 使用Sequelize通过应用程序的数据库连接执行迁移
 */

const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales_local', 'root', '', {
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    logging: false
});

async function executeMigration() {
    try {
        console.log('🚀 开始执行AI模型数据库迁移...');
        console.log('='.repeat(60));

        // 测试数据库连接
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');

        // 1. 创建统一AI模型配置表
        console.log('\n📋 步骤1: 创建统一AI模型配置表...');

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS ai_model_config_unified (
                id INT AUTO_INCREMENT PRIMARY KEY,
                source_id INT UNIQUE,
                name VARCHAR(100) NOT NULL,
                displayName VARCHAR(100) NOT NULL,
                provider VARCHAR(50) NOT NULL,
                modelType ENUM('text', 'speech', 'image', 'video', 'multimodal', 'embedding', 'search') NOT NULL,
                apiVersion VARCHAR(20) DEFAULT 'v1',
                endpointUrl VARCHAR(255) NOT NULL,
                apiKey VARCHAR(255) DEFAULT 'default-key',
                modelParameters JSON,
                isDefault BOOLEAN DEFAULT false,
                status ENUM('active', 'inactive', 'testing') DEFAULT 'inactive',
                description TEXT,
                capabilities JSON,
                maxTokens INT,
                migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name_provider (name, provider),
                INDEX idx_model_type (modelType),
                INDEX idx_status (status),
                INDEX idx_source_id (source_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await sequelize.query(createTableSQL);
        console.log('✅ 统一AI模型配置表创建成功');

        // 2. 插入真实AI模型数据
        console.log('\n📋 步骤2: 插入真实AI模型数据...');

        const models = [
            {
                sourceId: 1,
                name: 'doubao-pro-128k',
                displayName: '豆包Pro-128K',
                provider: 'ByteDance',
                modelType: 'text',
                apiVersion: 'v3',
                endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                modelParameters: {
                    maxTokens: 128000,
                    temperature: 0.7,
                    topP: 0.9,
                    contextWindow: 128000
                },
                isDefault: false,
                status: 'active',
                description: '字节跳动豆包Pro大语言模型，支持128K上下文',
                capabilities: ['chat', 'completion', 'analysis'],
                maxTokens: 128000
            },
            {
                sourceId: 2,
                name: 'doubao-pro-32k',
                displayName: '豆包Pro-32K',
                provider: 'ByteDance',
                modelType: 'text',
                apiVersion: 'v3',
                endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                modelParameters: {
                    maxTokens: 32000,
                    temperature: 0.7,
                    topP: 0.9,
                    contextWindow: 32000
                },
                isDefault: false,
                status: 'active',
                description: '字节跳动豆包Pro大语言模型，支持32K上下文',
                capabilities: ['chat', 'completion', 'analysis'],
                maxTokens: 32000
            },
            {
                sourceId: 3,
                name: 'doubao-tts-1',
                displayName: '豆包TTS语音合成',
                provider: 'ByteDance',
                modelType: 'speech',
                apiVersion: 'v1',
                endpointUrl: 'https://ark.cn-beijing.volces.com/api/v1/tts',
                modelParameters: {
                    voice: 'zh-CN-female-1',
                    speed: 1
                },
                isDefault: true,
                status: 'active',
                description: '豆包语音合成服务，支持多种音色',
                capabilities: ['text-to-speech', 'voice-synthesis'],
                maxTokens: null
            },
            {
                sourceId: 4,
                name: 'doubao-flash-1.6',
                displayName: '豆包Flash 1.6',
                provider: 'ByteDance',
                modelType: 'text',
                apiVersion: 'v3',
                endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                modelParameters: {
                    maxTokens: 8000,
                    temperature: 0.7,
                    topP: 0.9
                },
                isDefault: false,
                status: 'active',
                description: '豆包Flash 1.6 高速推理模型',
                capabilities: ['chat', 'completion', 'fast-response'],
                maxTokens: 8000
            },
            {
                sourceId: 5,
                name: 'doubao-image-gen',
                displayName: '豆包文生图',
                provider: 'ByteDance',
                modelType: 'image',
                apiVersion: 'v1',
                endpointUrl: 'https://ark.cn-beijing.volces.com/api/v1/images/generations',
                modelParameters: {
                    size: '1024x1024',
                    quality: 'standard'
                },
                isDefault: true,
                status: 'active',
                description: '豆包图像生成模型，支持文生图功能',
                capabilities: ['text-to-image', 'image-generation'],
                maxTokens: null
            },
            {
                sourceId: 6,
                name: 'doubao-think',
                displayName: '豆包Think推理模型',
                provider: 'ByteDance',
                modelType: 'text',
                apiVersion: 'v3',
                endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                modelParameters: {
                    maxTokens: 64000,
                    temperature: 0.7,
                    topP: 0.9
                },
                isDefault: false,
                status: 'active',
                description: '豆包Think专业推理模型',
                capabilities: ['chat', 'completion', 'reasoning', 'analysis'],
                maxTokens: 64000
            },
            {
                sourceId: 11,
                name: 'volcano-fusion-search',
                displayName: '火山融合搜索',
                provider: 'ByteDance',
                modelType: 'search',
                apiVersion: 'v1',
                endpointUrl: 'https://open.volcengineapi.com',
                modelParameters: {},
                isDefault: true,
                status: 'active',
                description: '火山引擎融合搜索服务',
                capabilities: ['web-search', 'information-retrieval'],
                maxTokens: null
            }
        ];

        let insertedCount = 0;
        for (const model of models) {
            try {
                const insertSQL = `
                    INSERT IGNORE INTO ai_model_config_unified (
                        source_id, name, displayName, provider, modelType, apiVersion,
                        endpointUrl, modelParameters, isDefault, status,
                        description, capabilities, maxTokens, createdAt, updatedAt
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;

                await sequelize.query(insertSQL, {
                    replacements: [
                        model.sourceId,
                        model.name,
                        model.displayName,
                        model.provider,
                        model.modelType,
                        model.apiVersion,
                        model.endpointUrl,
                        JSON.stringify(model.modelParameters),
                        model.isDefault,
                        model.status,
                        model.description,
                        JSON.stringify(model.capabilities),
                        model.maxTokens
                    ]
                });

                console.log(`✅ 插入模型: ${model.displayName} (${model.provider})`);
                insertedCount++;
            } catch (error) {
                console.log(`⚠️ 模型可能已存在: ${model.displayName} - ${error.message}`);
            }
        }

        // 3. 验证迁移结果
        console.log('\n📋 步骤3: 验证迁移结果...');

        const [results] = await sequelize.query(`
            SELECT source_id, name, displayName, provider, modelType, status
            FROM ai_model_config_unified
            ORDER BY id
        `);

        console.log(`✅ 统一租户中心现有 ${results.length} 个AI模型:`);
        results.forEach((model, index) => {
            console.log(`   ${index + 1}. ${model.displayName} (${model.provider} - ${model.modelType})`);
            console.log(`      源ID: ${model.source_id} → 状态: ${model.status}`);
        });

        // 4. 创建租户配置表（如果不存在）
        console.log('\n📋 步骤4: 创建租户配置表...');

        const createTenantTableSQL = `
            CREATE TABLE IF NOT EXISTS tenant_ai_model_configs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id INT NOT NULL,
                model_id INT NOT NULL,
                is_enabled BOOLEAN DEFAULT true,
                priority INT DEFAULT 1,
                rate_limit INT DEFAULT 100,
                monthly_quota INT DEFAULT 100000,
                monthly_used INT DEFAULT 0,
                last_used TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_tenant_model (tenant_id, model_id),
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_model_id (model_id),
                FOREIGN KEY (model_id) REFERENCES ai_model_config_unified(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await sequelize.query(createTenantTableSQL);
        console.log('✅ 租户配置表创建成功');

        // 5. 插入默认租户配置
        console.log('\n📋 步骤5: 插入默认租户配置...');

        const tenantConfigs = [
            { tenantId: 1, name: '默认租户', enabledModels: [1, 3, 4, 7] }, // 豆包Pro-128K, TTS, Flash, 搜索
            { tenantId: 2, name: '教育机构租户', enabledModels: [1, 3, 5, 6] }  // 豆包Pro-128K, TTS, 文生图, Think
        ];

        for (const tenant of tenantConfigs) {
            console.log(`\n   配置租户: ${tenant.name} (ID: ${tenant.tenantId})`);

            for (const modelId of tenant.enabledModels) {
                try {
                    await sequelize.query(`
                        INSERT IGNORE INTO tenant_ai_model_configs (
                            tenant_id, model_id, is_enabled, priority, rate_limit, monthly_quota
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `, {
                        replacements: [
                            tenant.tenantId,
                            modelId,
                            true,
                            1,
                            tenant.tenantId === 1 ? 100 : 80,
                            tenant.tenantId === 1 ? 500000 : 300000
                        ]
                    });
                    console.log(`     ✅ 启用模型ID: ${modelId}`);
                } catch (error) {
                    console.log(`     ⚠️ 模型配置可能已存在: ID ${modelId}`);
                }
            }
        }

        // 6. 最终验证
        console.log('\n📋 步骤6: 最终验证...');

        const [tenantResults] = await sequelize.query(`
            SELECT
                t.tenant_id,
                COUNT(t.model_id) as enabled_models,
                SUM(m.maxTokens) as total_max_tokens
            FROM tenant_ai_model_configs t
            JOIN ai_model_config_unified m ON t.model_id = m.id
            WHERE t.is_enabled = true
            GROUP BY t.tenant_id
        `);

        console.log('✅ 租户配置验证:');
        tenantResults.forEach(tenant => {
            console.log(`   租户ID ${tenant.tenant_id}: ${tenant.enabled_models}个模型, 总最大Token: ${tenant.total_max_tokens || 0}`);
        });

        console.log('\n🎉 AI模型数据库迁移完成！');
        console.log('='.repeat(60));
        console.log('✅ 迁移统计:');
        console.log(`   📦 成功插入模型: ${insertedCount} 个`);
        console.log(`   🏢 配置租户: ${tenantConfigs.length} 个`);
        console.log(`   🔧 创建表: 2个 (ai_model_config_unified, tenant_ai_model_configs)`);
        console.log(`   🚀 服务地址: http://localhost:4001 (AI Bridge - 真实模型版本)`);
        console.log('\n✅ 统一租户中心现在拥有了您的真实AI模型配置！');
        console.log('🎯 可以开始使用多模态AI服务：文本、语音、图像、搜索');

    } catch (error) {
        console.error('💥 迁移过程发生错误:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// 执行迁移
if (require.main === module) {
    executeMigration().catch(error => {
        console.error('💥 迁移失败:', error);
        process.exit(1);
    });
}

module.exports = { executeMigration };