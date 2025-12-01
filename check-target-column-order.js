const mysql = require('mysql2/promise');

async function checkTargetColumnOrder() {
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

    // 检查目标数据库列顺序
    console.log('\n📋 目标数据库 ai_model_config 表列顺序:');
    const [columns] = await targetConnection.execute('SHOW COLUMNS FROM ai_model_config');
    console.log('列名和顺序:');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    console.log('\n📝 生成的 INSERT 语句应该使用以下列顺序:');
    const columnNames = columns.map(col => col.Field).filter(col => col !== 'id'); // 排除自增ID
    console.log(columnNames.join(', '));

  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (targetConnection) {
      await targetConnection.end();
    }
  }
}

checkTargetColumnOrder();