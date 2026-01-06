const mysql = require('mysql2/promise');

async function checkAdminTenant() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mysql'
  });

  try {
    // 检查 admin 租户数据库是否存在
    const [databases] = await connection.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME LIKE 'tenant_%'"
    );
    console.log('\n=== 租户数据库列表 ===');
    databases.forEach(db => console.log('  - ' + db.SCHEMA_NAME));

    // 检查 admin 租户的 ai_model_configs 表
    const [adminTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'tenant_admin' AND TABLE_NAME LIKE '%ai%model%'"
    );
    console.log('\n=== tenant_admin 数据库中的 AI 相关表 ===');
    adminTables.forEach(t => console.log('  - ' + t.TABLE_NAME));

    // 查询 admin 租户的 AI 模型配置
    const [models] = await connection.query(
      "SELECT id, name, displayName, provider, modelType, endpointUrl, apiKey, isDefault, status FROM tenant_admin.ai_model_configs LIMIT 10"
    );
    console.log('\n=== tenant_admin.ai_model_configs 数据 ===');
    models.forEach(m => {
      const displayName = m.displayName || m.name || 'N/A';
      const maskedKey = m.apiKey ? m.apiKey.substring(0, 10) + '...' : 'NULL';
      console.log('  - ' + displayName);
      console.log('    Name: ' + m.name);
      console.log('    Provider: ' + m.provider + ', Type: ' + m.modelType);
      console.log('    Endpoint: ' + (m.endpointUrl || 'N/A'));
      console.log('    API Key: ' + maskedKey);
      console.log('    Default: ' + m.isDefault + ', Status: ' + m.status);
    });

    if (models.length === 0) {
      console.log('\n⚠️  警告: tenant_admin.ai_model_configs 表中没有数据！');
    }

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkAdminTenant();
