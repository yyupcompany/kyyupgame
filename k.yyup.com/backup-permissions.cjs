const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function backupPermissions() {
  console.log('=== 备份permissions相关表 ===\n');
  
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 备份permissions表
    console.log('📋 备份permissions表...');
    await connection.execute('DROP TABLE IF EXISTS permissions_backup_20250722');
    await connection.execute('CREATE TABLE permissions_backup_20250722 AS SELECT * FROM permissions');
    const [permCount] = await connection.execute('SELECT COUNT(*) as count FROM permissions_backup_20250722');
    console.log(`✅ permissions表备份完成，共 ${permCount[0].count} 条记录\n`);

    // 2. 备份role_permissions表
    console.log('📋 备份role_permissions表...');
    await connection.execute('DROP TABLE IF EXISTS role_permissions_backup_20250722');
    await connection.execute('CREATE TABLE role_permissions_backup_20250722 AS SELECT * FROM role_permissions');
    const [rolePermCount] = await connection.execute('SELECT COUNT(*) as count FROM role_permissions_backup_20250722');
    console.log(`✅ role_permissions表备份完成，共 ${rolePermCount[0].count} 条记录\n`);

    // 3. 显示备份表结构
    console.log('📊 备份表结构验证:');
    const [tables] = await connection.execute(`
      SELECT table_name, table_rows 
      FROM information_schema.tables 
      WHERE table_schema = ? 
        AND table_name LIKE '%_backup_20250722'
      ORDER BY table_name
    `, [process.env.DB_NAME || 'kargerdensales']);
    
    console.table(tables);

    console.log('\n✅ 备份完成！可以安全执行去重操作。');
    console.log('💡 如需恢复，请执行:');
    console.log('   DROP TABLE permissions;');
    console.log('   CREATE TABLE permissions AS SELECT * FROM permissions_backup_20250722;');
    console.log('   DROP TABLE role_permissions;');
    console.log('   CREATE TABLE role_permissions AS SELECT * FROM role_permissions_backup_20250722;');

  } catch (error) {
    console.error('❌ 备份失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行备份
backupPermissions();