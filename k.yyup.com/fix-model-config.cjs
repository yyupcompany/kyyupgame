/**
 * 修复AI模型配置中的模型名称问题
 */

const mysql = require('mysql2/promise');

async function fixModelConfig() {
  let connection;
  try {
    console.log('🔧 开始修复AI模型配置...');

    // 连接数据库
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'k5z12qT9',
      database: 'kargerdensales',
      ssl: { rejectUnauthorized: false }
    });

    console.log('✅ 数据库连接成功');

    // 查询当前的模型配置
    const [rows] = await connection.execute('SELECT id, name, displayName, endpointUrl, status FROM ai_model_configs');

    if (rows.length === 0) {
      console.log('❌ 没有找到任何模型配置');
      return;
    }

    console.log('📋 当前的模型配置:');
    rows.forEach(m => {
      console.log(`ID: ${m.id}, 名称: ${m.name}, 显示名: ${m.displayName}, 状态: ${m.status}`);
    });

    // 检查是否有错误的模型名称
    const wrongModel = rows.find(m => m.name === '250715' || (m.name && m.name.includes('250715') && !m.name.includes('doubao')));

    if (wrongModel) {
      console.log(`🎯 发现错误的模型配置: ID=${wrongModel.id}, 名称=${wrongModel.name}`);

      // 修复模型名称
      const correctName = 'doubao-seed-1-6-flash-250715';
      const correctDisplayName = 'Doubao Flash 1.6 (250715)';

      await connection.execute(
        'UPDATE ai_model_configs SET name = ?, displayName = ? WHERE id = ?',
        [correctName, correctDisplayName, wrongModel.id]
      );

      console.log(`✅ 已修复模型配置: ${wrongModel.name} -> ${correctName}`);
    } else {
      console.log('✅ 没有发现错误的模型配置');
    }

    // 确保有正确的Flash模型配置
    const flashModel = rows.find(m => m.name === 'doubao-seed-1-6-flash-250715');

    if (!flashModel) {
      console.log('🔧 添加正确的Flash模型配置...');
      await connection.execute(`
        INSERT INTO ai_model_configs (name, displayName, endpointUrl, apiKey, status, isDefault, createdAt, updatedAt)
        VALUES ('doubao-seed-1-6-flash-250715', 'Doubao Flash 1.6 (250715)', 'https://ark.cn-beijing.volces.com/api/v3', '', 'active', true, NOW(), NOW())
      `);
      console.log('✅ 已添加正确的Flash模型配置');
    }

    // 最终验证
    const [finalRows] = await connection.execute('SELECT id, name, displayName FROM ai_model_configs WHERE status = "active"');
    console.log('\n📋 修复后的活跃模型配置:');
    finalRows.forEach(m => {
      console.log(`ID: ${m.id}, 名称: ${m.name}, 显示名: ${m.displayName}`);
    });

  } catch (error) {
    console.error('❌ 修复过程中出错:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

fixModelConfig().then(() => {
  console.log('\n🎉 修复完成');
  process.exit(0);
}).catch(error => {
  console.error('💥 修复脚本错误:', error);
  process.exit(1);
});