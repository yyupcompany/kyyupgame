// 简单数据库查询脚本
const mysql = require('mysql2/promise');

async function queryAIModels() {
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('🔍 连接到 kargerdensales 数据库...');

    const [rows] = await connection.execute('SELECT * FROM ai_model_config ORDER BY created_at ASC');

    console.log(`\n📋 找到 ${rows.length} 个 AI 模型配置:\n`);

    if (rows.length > 0) {
      console.log('-- 准备插入到 admin_tenant_management 数据库的 SQL 语句:');
      console.log('-- =====================================\n');

      rows.forEach((row) => {
        const params = row.model_parameters ? JSON.stringify(row.model_parameters).replace(/'/g, "''") : null;
        const capabilities = row.capabilities ? JSON.stringify(row.capabilities).replace(/'/g, "''") : null;

        const sql = `INSERT INTO admin_tenant_management.ai_model_config (
          name, display_name, provider, model_type, api_version, endpoint_url, api_key,
          model_parameters, is_default, status, description, capabilities, max_tokens,
          creator_id, created_at, updated_at
        ) VALUES (
          '${row.name}',
          '${row.display_name}',
          '${row.provider}',
          '${row.model_type}',
          '${row.api_version}',
          '${row.endpoint_url}',
          '${row.api_key}',
          ${params ? `'${params}'` : 'NULL'},
          ${row.is_default},
          '${row.status}',
          ${row.description ? `'${row.description.replace(/'/g, "''")}'` : 'NULL'},
          ${capabilities ? `'${capabilities}'` : 'NULL'},
          ${row.max_tokens ? row.max_tokens : 'NULL'},
          ${row.creator_id ? row.creator_id : 'NULL'},
          '${row.created_at}',
          '${row.updated_at}'
        );`;

        console.log(sql);
        console.log('');
      });

      console.log(`📊 总计 ${rows.length} 个模型配置已准备插入`);
    }

    await connection.end();
    console.log('✅ 查询完成');

  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

queryAIModels();