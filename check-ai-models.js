/**
 * 检查幼儿园系统AI模型数据的简化版本
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'kargerdensales_local'
};

async function checkAIModels() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('🔍 连接数据库成功');

        // 查询AI模型配置
        const [models] = await connection.execute(`
            SELECT
                id,
                name,
                display_name,
                provider,
                model_type,
                status,
                is_default,
                created_at
            FROM ai_model_config
            ORDER BY id
        `);

        console.log(`\n📋 找到 ${models.length} 个AI模型配置:`);
        console.log('================================');

        models.forEach((model, index) => {
            console.log(`${index + 1}. ${model.display_name || model.name}`);
            console.log(`   ID: ${model.id}`);
            console.log(`   提供商: ${model.provider}`);
            console.log(`   类型: ${model.model_type}`);
            console.log(`   状态: ${model.status}`);
            console.log(`   默认: ${model.is_default ? '是' : '否'}`);
            console.log(`   创建时间: ${model.created_at}`);
            console.log('');
        });

        // 查询使用统计
        const [usage] = await connection.execute(`
            SELECT
                COUNT(*) as total_requests,
                SUM(tokens) as total_tokens,
                COUNT(DISTINCT model_id) as models_used
            FROM ai_model_usage
        `);

        console.log('📊 AI模型使用统计:');
        console.log(`   总请求次数: ${usage[0].total_requests || 0}`);
        console.log(`   总Token数: ${usage[0].total_tokens || 0}`);
        console.log(`   使用的模型数: ${usage[0].models_used || 0}`);

        return models;

    } catch (error) {
        console.error('❌ 查询失败:', error.message);
        return [];
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 运行检查
if (require.main === module) {
    checkAIModels();
}

module.exports = { checkAIModels };