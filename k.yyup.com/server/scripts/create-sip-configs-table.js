/**
 * 创建sip_configs表脚本
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSIPConfigsTable() {
  let connection;

  try {
    console.log('🔌 正在连接数据库...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    console.log('✅ 数据库连接成功\n');

    console.log('📝 创建sip_configs表...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sip_configs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        server_host VARCHAR(100) NOT NULL DEFAULT '47.94.82.59',
        server_port INT NOT NULL DEFAULT 5060,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        protocol ENUM('UDP', 'TCP') DEFAULT 'UDP',
        is_active BOOLEAN DEFAULT TRUE,
        last_register_time TIMESTAMP NULL,
        register_interval INT DEFAULT 3600,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ sip_configs表创建成功\n');

    // 验证表结构
    console.log('🔍 验证表结构...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM sip_configs
    `);

    console.log('✅ 表结构验证成功:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    console.log('\n🎉 sip_configs表创建完成！');

  } catch (error) {
    console.error('\n❌ 创建表失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

createSIPConfigsTable();

