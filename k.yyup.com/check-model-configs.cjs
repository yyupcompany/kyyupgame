const mysql = require('mysql2/promise');

async function checkModelConfigs() {
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'k5z12qT9',
      database: 'kargerdensales',
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await connection.execute('SELECT id, name, endpointUrl, status, isDefault FROM ai_model_configs');

    console.log('📋 AI模型配置:');
    if (rows.length === 0) {
      console.log('❌ 没有找到任何模型配置');
    } else {
      rows.forEach(m => {
        console.log(`ID: ${m.id}, 名称: ${m.name}, 端点: ${m.endpointUrl}, 状态: ${m.status}, 默认: ${m.isDefault}`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

checkModelConfigs();