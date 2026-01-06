const mysql = require('mysql2/promise');

async function checkKindergartenStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'tenant_001'
    });

    console.log('📋 检查kindergartens表结构:\n');
    
    const [columns] = await connection.execute('SHOW COLUMNS FROM kindergartens');
    
    console.log('字段名'.padEnd(30) + '类型'.padEnd(25) + '允许NULL'.padEnd(12) + '键'.padEnd(8) + '默认值');
    console.log('─'.repeat(100));
    
    columns.forEach(col => {
      console.log(
        col.Field.padEnd(30) +
        col.Type.padEnd(25) +
        col.Null.padEnd(12) +
        (col.Key || '').padEnd(8) +
        (col.Default || '')
      );
    });
    
    console.log('\n📋 检查classes表结构:\n');
    
    const [classColumns] = await connection.execute('SHOW COLUMNS FROM classes');
    
    console.log('字段名'.padEnd(30) + '类型'.padEnd(25) + '允许NULL'.padEnd(12) + '键'.padEnd(8) + '默认值');
    console.log('─'.repeat(100));
    
    classColumns.forEach(col => {
      console.log(
        col.Field.padEnd(30) +
        col.Type.padEnd(25) +
        col.Null.padEnd(12) +
        (col.Key || '').padEnd(8) +
        (col.Default || '')
      );
    });

    await connection.end();

  } catch (error) {
    console.error('错误:', error.message);
  }
}

checkKindergartenStructure();
