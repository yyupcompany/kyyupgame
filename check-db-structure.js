const mysql = require('mysql2/promise');

async function checkDatabaseStructure() {
  let sourceConnection = null;
  let targetConnection = null;

  try {
    // 连接到源数据库 (kargerdensales)
    console.log('🔗 连接到源数据库 kargerdensales...');
    sourceConnection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

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

    // 检查源数据库表结构
    console.log('\n📋 源数据库 (kargerdensales) ai_model_config 表结构:');
    const [sourceColumns] = await sourceConnection.execute('DESCRIBE ai_model_config');
    sourceColumns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // 检查目标数据库表结构
    console.log('\n📋 目标数据库 (admin_tenant_management) ai_model_config 表结构:');
    const [targetColumns] = await targetConnection.execute('DESCRIBE ai_model_config');
    targetColumns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    console.log(`\n📊 结构对比:`);
    console.log(`- 源数据库列数: ${sourceColumns.length}`);
    console.log(`- 目标数据库列数: ${targetColumns.length}`);

    // 找出差异
    const sourceFields = sourceColumns.map(c => c.Field);
    const targetFields = targetColumns.map(c => c.Field);

    const missingInTarget = sourceFields.filter(f => !targetFields.includes(f));
    const extraInTarget = targetFields.filter(f => !sourceFields.includes(f));

    if (missingInTarget.length > 0) {
      console.log(`\n❌ 目标数据库缺少的列: ${missingInTarget.join(', ')}`);
    }
    if (extraInTarget.length > 0) {
      console.log(`\n➕ 目标数据库多出的列: ${extraInTarget.join(', ')}`);
    }

    // 查看一条样本数据
    console.log('\n📋 源数据库样本数据:');
    const [sourceData] = await sourceConnection.execute('SELECT * FROM ai_model_config LIMIT 1');
    if (sourceData.length > 0) {
      console.log('字段:', Object.keys(sourceData[0]));
      console.log('值:', sourceData[0]);
    }

  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (sourceConnection) {
      await sourceConnection.end();
    }
    if (targetConnection) {
      await targetConnection.end();
    }
  }
}

checkDatabaseStructure();