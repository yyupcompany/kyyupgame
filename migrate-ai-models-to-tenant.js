/**
 * AI模型数据迁移脚本
 * 将幼儿园系统的AI模型配置迁移到统一租户中心
 */

const http = require('http');
const mysql = require('mysql2/promise');

// 数据库配置
const KINDERGARTEN_DB = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'kargerdensales_local'
};

const TENANT_DB = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'kargerdensales_local' // 统一租户中心使用同一数据库
};

class AIModelMigrator {
    constructor() {
        this.kgPool = mysql.createPool(KINDERGARTEN_DB);
        this.tenantPool = mysql.createPool(TENANT_DB);
    }

    async close() {
        await this.kgPool.end();
        await this.tenantPool.end();
    }

    // 查询幼儿园系统AI模型
    async getKinderGartenModels() {
        try {
            console.log('🔍 查询幼儿园系统AI模型配置...');
            const [rows] = await this.kgPool.execute(`
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
                WHERE status = 'active'
                ORDER BY created_at DESC
            `);

            console.log(`✅ 找到 ${rows.length} 个活跃的AI模型配置`);
            return rows;
        } catch (error) {
            console.error('❌ 查询幼儿园AI模型失败:', error.message);
            throw error;
        }
    }

    // 查询统一租户中心现有模型
    async getTenantModels() {
        try {
            console.log('🔍 查询统一租户中心现有AI模型...');
            const [rows] = await this.tenantPool.execute(`
                SELECT
                    id,
                    name,
                    displayName,
                    provider,
                    modelType
                FROM ai_model_config
                ORDER BY created_at DESC
            `);

            console.log(`✅ 统一租户中心现有 ${rows.length} 个AI模型`);
            return rows;
        } catch (error) {
            console.error('❌ 查询统一租户中心AI模型失败:', error.message);
            return [];
        }
    }

    // 数据标准化处理
    normalizeModelData(model) {
        return {
            name: model.name,
            displayName: model.display_name || model.name,
            provider: model.provider,
            modelType: model.model_type,
            apiVersion: model.api_version || 'v1',
            endpointUrl: model.endpoint_url,
            apiKey: model.api_key,
            modelParameters: model.model_parameters ? JSON.parse(model.model_parameters) : null,
            isDefault: Boolean(model.is_default),
            status: model.status === 'active' ? 'active' : 'inactive',
            description: model.description || `${model.provider} ${model.display_name || model.name} AI模型`,
            capabilities: model.capabilities ? JSON.parse(model.capabilities) : null,
            maxTokens: model.max_tokens || null,
            createdAt: model.created_at,
            updatedAt: model.updated_at || new Date()
        };
    }

    // 检查模型是否已存在
    async modelExists(name, provider) {
        try {
            const [rows] = await this.tenantPool.execute(
                'SELECT id FROM ai_model_config WHERE name = ? AND provider = ?',
                [name, provider]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('❌ 检查模型存在性失败:', error.message);
            return false;
        }
    }

    // 插入AI模型到统一租户中心
    async insertModelToTenant(normalizedModel) {
        try {
            const [result] = await this.tenantPool.execute(`
                INSERT INTO ai_model_config (
                    name, displayName, provider, modelType, apiVersion,
                    endpointUrl, apiKey, modelParameters, isDefault, status,
                    description, capabilities, maxTokens, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                normalizedModel.name,
                normalizedModel.displayName,
                normalizedModel.provider,
                normalizedModel.modelType,
                normalizedModel.apiVersion,
                normalizedModel.endpointUrl,
                normalizedModel.apiKey,
                normalizedModel.modelParameters ? JSON.stringify(normalizedModel.modelParameters) : null,
                normalizedModel.isDefault,
                normalizedModel.status,
                normalizedModel.description,
                normalizedModel.capabilities ? JSON.stringify(normalizedModel.capabilities) : null,
                normalizedModel.maxTokens,
                normalizedModel.createdAt,
                normalizedModel.updatedAt
            ]);

            return result.insertId;
        } catch (error) {
            console.error(`❌ 插入模型 ${normalizedModel.name} 失败:`, error.message);
            throw error;
        }
    }

    // 添加默认租户配置
    async addTenantConfig(modelId) {
        try {
            // 为默认租户(假设ID=1)添加AI模型配置
            await this.tenantPool.execute(`
                INSERT IGNORE INTO tenant_ai_model_configs (
                    tenant_id, model_id, is_enabled, priority, rate_limit, monthly_quota
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [1, modelId, true, 1, 100, 100000]);

            console.log(`✅ 为模型 ${modelId} 添加默认租户配置`);
        } catch (error) {
            console.error(`❌ 添加租户配置失败:`, error.message);
            // 不抛出错误，因为租户表可能不存在
        }
    }

    // 显示模型信息
    displayModelInfo(model) {
        console.log(`\n📋 模型信息:`);
        console.log(`   名称: ${model.display_name || model.name} (${model.provider})`);
        console.log(`   类型: ${model.model_type}`);
        console.log(`   状态: ${model.status}`);
        console.log(`   端点: ${model.endpoint_url}`);

        if (model.capabilities) {
            try {
                const capabilities = JSON.parse(model.capabilities);
                console.log(`   能力: ${capabilities.join(', ')}`);
            } catch (e) {
                console.log(`   能力: ${model.capabilities}`);
            }
        }

        if (model.max_tokens) {
            console.log(`   最大Token: ${model.max_tokens}`);
        }
    }

    // 主要迁移函数
    async migrateModels() {
        console.log('🚀 开始AI模型数据迁移');
        console.log('=====================================\n');

        try {
            // 1. 查询幼儿园系统AI模型
            const kgModels = await this.getKinderGartenModels();

            if (kgModels.length === 0) {
                console.log('⚠️  幼儿园系统中没有找到活跃的AI模型');
                return;
            }

            // 2. 查询统一租户中心现有模型
            const tenantModels = await this.getTenantModels();

            // 3. 统计现有模型
            console.log('\n📊 迁移前统计:');
            console.log(`   幼儿园系统: ${kgModels.length} 个模型`);
            console.log(`   统一租户中心: ${tenantModels.length} 个模型`);

            // 4. 显示待迁移模型
            console.log('\n📋 待迁移的AI模型:');
            kgModels.forEach((model, index) => {
                console.log(`${index + 1}. ${model.display_name || model.name}`);
                this.displayModelInfo(model);
            });

            // 5. 执行迁移
            console.log('\n🔄 开始数据迁移...');
            let migratedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;

            for (const model of kgModels) {
                try {
                    // 标准化数据
                    const normalizedModel = this.normalizeModelData(model);

                    // 检查是否已存在
                    if (await this.modelExists(normalizedModel.name, normalizedModel.provider)) {
                        console.log(`⏭️  跳过 ${normalizedModel.displayName} (已存在)`);
                        skippedCount++;
                        continue;
                    }

                    // 插入到统一租户中心
                    const insertId = await this.insertModelToTenant(normalizedModel);

                    // 添加租户配置
                    await this.addTenantConfig(insertId);

                    console.log(`✅ 迁移成功: ${normalizedModel.displayName} (ID: ${insertId})`);
                    migratedCount++;

                } catch (error) {
                    console.error(`❌ 迁移失败: ${model.display_name || model.name}`);
                    console.error(`   错误: ${error.message}`);
                    errorCount++;
                }
            }

            // 6. 迁移结果统计
            console.log('\n📊 迁移结果:');
            console.log(`   成功迁移: ${migratedCount} 个模型`);
            console.log(`   跳过重复: ${skippedCount} 个模型`);
            console.log(`   迁移失败: ${errorCount} 个模型`);
            console.log(`   总计处理: ${kgModels.length} 个模型`);

            // 7. 验证迁移结果
            console.log('\n🔍 验证迁移结果...');
            const newTenantModels = await this.getTenantModels();
            console.log(`✅ 统一租户中心现有 ${newTenantModels.length} 个AI模型`);

            if (migratedCount > 0) {
                console.log('\n🎉 AI模型数据迁移完成！');
                console.log('✅ 统一租户中心现在拥有了标准的AI模型配置');
                console.log('🚀 可以开始使用统一的AI Bridge服务');
            } else {
                console.log('\n⚠️  没有新的模型被迁移');
            }

        } catch (error) {
            console.error('❌ 迁移过程发生错误:', error.message);
            throw error;
        } finally {
            await this.close();
        }
    }

    // 测试统一租户中心AI模型
    async testTenantModels() {
        console.log('\n🧪 测试统一租户中心AI模型...');

        try {
            // 测试通过我们创建的AI Bridge服务
            const testResponse = await this.httpRequest('GET', '/api/v1/ai/bridge/models', null, {
                'Authorization': 'Bearer test-token',
                'X-Tenant-ID': '1'
            });

            if (testResponse.statusCode === 200) {
                const data = JSON.parse(testResponse.body);
                console.log('✅ AI Bridge服务响应正常');
                console.log(`📋 可用模型数量: ${data.data.models.length}`);
                data.data.models.forEach(model => {
                    console.log(`   - ${model.displayName} (${model.provider})`);
                });
                return true;
            } else {
                console.log('❌ AI Bridge服务响应异常');
                return false;
            }
        } catch (error) {
            console.log('❌ 测试AI Bridge服务失败:', error.message);
            return false;
        }
    }

    // 简单的HTTP请求方法
    httpRequest(method, path, data, headers = {}) {
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
                res.on('data', (chunk) => {
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
}

// 主执行函数
async function main() {
    const migrator = new AIModelMigrator();

    try {
        // 执行迁移
        await migrator.migrateModels();

        // 测试迁移结果
        await migrator.testTenantModels();

    } catch (error) {
        console.error('💥 迁移失败:', error.message);
        process.exit(1);
    }
}

// 运行迁移
if (require.main === module) {
    main();
}

module.exports = { AIModelMigrator, main };