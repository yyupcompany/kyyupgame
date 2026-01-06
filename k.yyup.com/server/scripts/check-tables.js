const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔍 检查数据库中的表...\n');

    // 查看所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 数据库中的所有表:');
    console.table(tables);

    // 查找权限相关的表
    const [permissionTables] = await connection.execute(`
      SHOW TABLES LIKE '%permission%'
    `);
    console.log('\n🔐 权限相关的表:');
    console.table(permissionTables);

    // 查找菜单相关的表
    const [menuTables] = await connection.execute(`
      SHOW TABLES LIKE '%menu%'
    `);
    console.log('\n📋 菜单相关的表:');
    console.table(menuTables);

  } catch (error) {
    console.error('❌ 检查表失败:', error);
  } finally {
    await connection.end();
  }
}

checkTables();
