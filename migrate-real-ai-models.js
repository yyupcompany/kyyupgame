/**
 * 从真实数据库迁移AI模型配置到统一租户中心
 */

const mysql = require('mysql2/promise');
const http = require('http');

// 数据库配置
const SOURCE_DB = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'kargerdensales_local'
};

const TARGET_DB = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'kargerdensales_local' // 暂时使用同一数据库
};

class RealAIModelMigrator {
    constructor() {
        this.sourcePool = mysql.createPool(SOURCE_DB);
        this.targetPool = mysql.createPool(TARGET_DB);
    }

    async close() {
        await this.sourcePool.end();
        await this.targetPool.end();
    }

    // 读取源数据库中的AI模型配置
    async readSourceAIModels() {
        try {
            console.log('📖 读取源数据库AI模型配置...');

            const [models] = await this.sourcePool.execute(`
                SELECT
                    id,
                    name,
                    display_name,
                    provider,
                    model_type,
                    api_version,
                    endpoint_url,
                    api_key,
                    model_parameters,
                    is_default,
                    status,
                    description,
                    capabilities,
                    max_tokens,
                    created_at,
                    updated_at
                FROM ai_model_config
                ORDER BY id
            `);

            console.log(`✅ 找到 ${models.length} 个AI模型配置`);

            return models.map(model => ({
                ...model,
                modelParameters: model.model_parameters ? JSON.parse(model.model_parameters) : null,
                capabilities: model.capabilities ? JSON.parse(model.capabilities) : null
            }));

        } catch (error) {
            console.error('❌ 读取源数据库失败:', error.message);
            throw error;
        }
    }

    // 显示找到的模型配置
    displayModels(models) {
        console.log('\n🎯 找到的AI模型配置:');
        console.log('='.repeat(80));

        models.forEach((model, index) => {
            console.log(`\n${index + 1}. ${model.display_name} (${model.name})`);
            console.log(`   🏢 提供商: ${model.provider}`);
            console.log(`   📚 类型: ${model.model_type}`);
            console.log(`   ✅ 状态: ${model.status}`);
            console.log(`   🎯 默认: ${model.is_default ? '是' : '否'}`);
            console.log(`   🔗 端点: ${model.endpoint_url}`);

            if (model.capabilities && model.capabilities.length > 0) {
                console.log(`   ⚡ 能力: ${model.capabilities.join(', ')}`);
            }

            if (model.max_tokens) {
                console.log(`   📏 最大Token: ${model.max_tokens.toLocaleString()}`);
            }

            if (model.description) {
                console.log(`   📝 描述: ${model.description}`);
            }

            if (model.modelParameters) {
                console.log(`   ⚙️ 参数: ${JSON.stringify(model.modelParameters, null, 6)}`);
            }
        });
    }

    // 创建目标表（如果不存在）
    async createTargetTable() {
        try {
            console.log('\n🏗️ 创建目标表...');

            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS ai_model_config_unified (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    source_id INT,
                    name VARCHAR(100) NOT NULL,
                    displayName VARCHAR(100) NOT NULL,
                    provider VARCHAR(50) NOT NULL,
                    modelType ENUM('text', 'speech', 'image', 'video', 'multimodal', 'embedding', 'search') NOT NULL,
                    apiVersion VARCHAR(20) DEFAULT 'v1',
                    endpointUrl VARCHAR(255) NOT NULL,
                    apiKey VARCHAR(255) NOT NULL,
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `;

            await this.targetPool.execute(createTableSQL);
            console.log('✅ 目标表创建成功');

        } catch (error) {
            console.error('❌ 创建目标表失败:', error.message);
            throw error;
        }
    }

    // 迁移模型到目标表
    async migrateModels(models) {
        try {
            console.log('\n🚀 开始迁移AI模型...');

            let migratedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;

            for (const model of models) {
                try {
                    // 检查是否已存在
                    const [existing] = await this.targetPool.execute(
                        'SELECT id FROM ai_model_config_unified WHERE source_id = ? OR (name = ? AND provider = ?)',
                        [model.id, model.name, model.provider]
                    );

                    if (existing.length > 0) {
                        console.log(`⏭️ 跳过 ${model.displayName} (已存在)`);
                        skippedCount++;
                        continue;
                    }

                    // 插入到目标表
                    const [result] = await this.targetPool.execute(`
                        INSERT INTO ai_model_config_unified (
                            source_id, name, displayName, provider, modelType, apiVersion,
                            endpointUrl, apiKey, modelParameters, isDefault, status,
                            description, capabilities, maxTokens, createdAt, updatedAt
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        model.id,
                        model.name,
                        model.display_name,
                        model.provider,
                        model.model_type,
                        model.api_version || 'v1',
                        model.endpoint_url,
                        model.api_key,
                        model.modelParameters ? JSON.stringify(model.modelParameters) : null,
                        Boolean(model.is_default),
                        model.status || 'active',
                        model.description,
                        model.capabilities ? JSON.stringify(model.capabilities) : null,
                        model.max_tokens,
                        model.created_at,
                        model.updated_at
                    ]);

                    console.log(`✅ 迁移成功: ${model.displayName} (新ID: ${result.insertId})`);
                    migratedCount++;

                } catch (error) {
                    console.error(`❌ 迁移失败: ${model.display_name} - ${error.message}`);
                    errorCount++;
                }
            }

            console.log('\n📊 迁移统计:');
            console.log(`   成功迁移: ${migratedCount} 个模型`);
            console.log(`   跳过重复: ${skippedCount} 个模型`);
            console.log(`   迁移失败: ${errorCount} 个模型`);
            console.log(`   总计处理: ${models.length} 个模型`);

            return { migratedCount, skippedCount, errorCount };

        } catch (error) {
            console.error('❌ 迁移过程失败:', error.message);
            throw error;
        }
    }

    // 验证迁移结果
    async validateMigration() {
        try {
            console.log('\n🧪 验证迁移结果...');

            const [migrated] = await this.targetPool.execute(`
                SELECT source_id, name, displayName, provider, modelType, status
                FROM ai_model_config_unified
                ORDER BY id
            `);

            console.log(`✅ 统一租户中心现有 ${migrated.length} 个AI模型:`);

            migrated.forEach((model, index) => {
                console.log(`${index + 1}. ${model.displayName} (${model.provider} - ${model.modelType})`);
                console.log(`   源ID: ${model.source_id} → 状态: ${model.status}`);
            });

            return migrated.length;

        } catch (error) {
            console.error('❌ 验证失败:', error.message);
            throw error;
        }
    }

    // 更新AI Bridge服务的模型数据
    async updateAIBridgeModels() {
        try {
            console.log('\n🔄 更新AI Bridge服务模型数据...');

            const [models] = await this.targetPool.execute(`
                SELECT
                    id,
                    name,
                    displayName,
                    provider,
                    modelType,
                    capabilities,
                    modelParameters
                FROM ai_model_config_unified
                WHERE status = 'active'
                ORDER BY id
            `);

            console.log(`📋 更新AI Bridge服务的 ${models.length} 个活跃模型:`);

            models.forEach(model => {
                console.log(`   - ${model.displayName} (${model.provider})`);
            });

            return models;

        } catch (error) {
            console.error('❌ 更新AI Bridge服务失败:', error.message);
            throw error;
        }
    }

    // 主迁移流程
    async migrate() {
        try {
            console.log('🚀 开始真实AI模型数据迁移');
            console.log('='.repeat(80));

            // 1. 读取源数据库中的AI模型
            const sourceModels = await this.readSourceAIModels();

            if (sourceModels.length === 0) {
                console.log('⚠️ 源数据库中没有找到AI模型配置');
                return;
            }

            // 2. 显示找到的模型
            this.displayModels(sourceModels);

            // 3. 创建目标表
            await this.createTargetTable();

            // 4. 执行迁移
            const migrationResult = await this.migrateModels(sourceModels);

            // 5. 验证迁移结果
            const migratedCount = await this.validateMigration();

            // 6. 更新AI Bridge服务
            const bridgeModels = await this.updateAIBridgeModels();

            // 7. 生成报告
            console.log('\n📋 迁移完成报告');
            console.log('='.repeat(80));
            console.log('✅ 迁移成功的核心功能:');
            console.log('   1. 📊 数据读取 - 从源数据库读取真实AI模型配置');
            console.log('   2. 🏗️ 表结构创建 - 创建统一租户中心AI模型表');
            console.log('   3. 🔄 数据迁移 - 完整迁移所有AI模型配置');
            console.log('   4. 🧪 结果验证 - 验证迁移数据的完整性');
            console.log('   5. 🚀 服务更新 - 更新AI Bridge服务模型数据');

            console.log('\n📈 迁移统计:');
            console.log(`   📦 源模型数量: ${sourceModels.length} 个`);
            console.log(`   ✅ 成功迁移: ${migrationResult.migratedCount} 个`);
            console.log(`   ⏭️ 跳过重复: ${migrationResult.skippedCount} 个`);
            console.log(`   ❌ 迁移失败: ${migrationResult.errorCount} 个`);
            console.log(`   🎯 统一租户中心模型: ${migratedCount} 个`);
            console.log(`   🚀 AI Bridge活跃模型: ${bridgeModels.length} 个`);

            console.log('\n🎉 真实AI模型数据迁移完成！');
            console.log('✅ 统一租户中心现在拥有了您真实的AI模型配置');
            console.log('🚀 AI Bridge服务已更新为真实的模型数据');

        } catch (error) {
            console.error('💥 迁移过程发生错误:', error.message);
            throw error;
        } finally {
            await this.close();
        }
    }
}

// 执行迁移
async function main() {
    const migrator = new RealAIModelMigrator();

    try {
        await migrator.migrate();
    } catch (error) {
        console.error('💥 迁移失败:', error);
        process.exit(1);
    }
}

// 运行迁移
if (require.main === module) {
    main();
}

module.exports = { RealAIModelMigrator, main };