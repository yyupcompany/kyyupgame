const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixNotificationFields() {
  let connection;

  try {
    console.log('🔧 连接数据库...');

    // 使用项目配置连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kindergarten',
      charset: 'utf8mb4'
    });

    console.log('✅ 数据库连接成功');

    // 1. 检查notifications表结构
    console.log('\n🔍 检查 notifications 表结构...');
    const [structure] = await connection.execute('DESCRIBE notifications');

    const fields = structure.map(row => row.Field);
    console.log('📋 当前字段:', fields);

    // 2. 检查并添加缺失的字段
    const requiredFields = [
      { name: 'cancelled_at', sql: 'ADD COLUMN cancelled_at TIMESTAMP NULL COMMENT "取消时间"' },
      { name: 'cancelled_by', sql: 'ADD COLUMN cancelled_by INT NULL COMMENT "取消人ID"' },
      { name: 'cancel_reason', sql: 'ADD COLUMN cancel_reason VARCHAR(255) NULL COMMENT "取消原因"' }
    ];

    for (const field of requiredFields) {
      if (!fields.includes(field.name)) {
        console.log(`➕ 添加字段: ${field.name}`);
        try {
          await connection.execute(`ALTER TABLE notifications ${field.sql}`);
          console.log(`✅ 成功添加字段: ${field.name}`);
        } catch (error) {
          if (error.message.includes('Duplicate column name')) {
            console.log(`⚠️ 字段 ${field.name} 已存在，跳过`);
          } else {
            console.error(`❌ 添加字段 ${field.name} 失败:`, error.message);
          }
        }
      } else {
        console.log(`✅ 字段 ${field.name} 已存在`);
      }
    }

    // 3. 验证修改后的表结构
    console.log('\n🔍 验证修改后的表结构...');
    const [newStructure] = await connection.execute('DESCRIBE notifications');
    console.log('📋 修改后字段:');
    newStructure.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 4. 检查数据数量
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM notifications');
    console.log(`\n📊 notifications 表中有 ${countResult[0].count} 条记录`);

    console.log('\n✅ Notification表字段修复完成!');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixNotificationFields();