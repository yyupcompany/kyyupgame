const mysql = require('mysql2/promise');

async function fixTargetDatabase() {
  let targetConnection = null;

  try {
    // 连接到目标数据库 (admin_tenant_management)
    console.log('🎯 连接到目标数据库 admin_tenant_management...');
    targetConnection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'admin_tenant_management'
    });

    console.log('✅ 数据库连接成功');

    // 修改 model_type 枚举值，添加 'vod' 和 'multimodal'
    console.log('🔧 修改 model_type 枚举值...');

    const alterSQL = `
      ALTER TABLE ai_model_config
      MODIFY COLUMN model_type ENUM('text','speech','image','video','multimodal','embedding','search','vod','')
      NOT NULL
    `;

    await targetConnection.execute(alterSQL);
    console.log('✅ model_type 枚举值已更新');

    // 验证修改结果
    console.log('\n📋 验证表结构:');
    const [columns] = await targetConnection.execute('DESCRIBE ai_model_config');
    const modelTypeColumn = columns.find(col => col.Field === 'model_type');
    console.log(`model_type 列类型: ${modelTypeColumn.Type}`);

    console.log('\n✅ 目标数据库修复完成！');

  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (targetConnection) {
      await targetConnection.end();
    }
  }
}

fixTargetDatabase();