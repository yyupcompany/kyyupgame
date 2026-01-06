/**
 * 为video_projects表添加进度跟踪字段
 * 
 * 新增字段：
 * - progress: 任务进度(0-100)
 * - progressMessage: 进度消息
 * - completedAt: 完成时间
 * - notified: 是否已通知用户
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  database: process.env.DB_NAME || 'kargerdensales',
};

async function addProgressFields() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 检查字段是否已存在
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'video_projects'
    `, [dbConfig.database]);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('📋 现有字段:', existingColumns);

    // 添加progress字段
    if (!existingColumns.includes('progress')) {
      console.log('➕ 添加progress字段...');
      await connection.query(`
        ALTER TABLE video_projects 
        ADD COLUMN progress INT NOT NULL DEFAULT 0 COMMENT '任务进度(0-100)'
      `);
      console.log('✅ progress字段添加成功');
    } else {
      console.log('⏭️  progress字段已存在，跳过');
    }

    // 添加progressMessage字段
    if (!existingColumns.includes('progressMessage')) {
      console.log('➕ 添加progressMessage字段...');
      await connection.query(`
        ALTER TABLE video_projects 
        ADD COLUMN progressMessage VARCHAR(500) NULL COMMENT '进度消息'
      `);
      console.log('✅ progressMessage字段添加成功');
    } else {
      console.log('⏭️  progressMessage字段已存在，跳过');
    }

    // 添加completedAt字段
    if (!existingColumns.includes('completedAt')) {
      console.log('➕ 添加completedAt字段...');
      await connection.query(`
        ALTER TABLE video_projects 
        ADD COLUMN completedAt DATETIME NULL COMMENT '完成时间'
      `);
      console.log('✅ completedAt字段添加成功');
    } else {
      console.log('⏭️  completedAt字段已存在，跳过');
    }

    // 添加notified字段
    if (!existingColumns.includes('notified')) {
      console.log('➕ 添加notified字段...');
      await connection.query(`
        ALTER TABLE video_projects 
        ADD COLUMN notified BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已通知用户'
      `);
      console.log('✅ notified字段添加成功');
    } else {
      console.log('⏭️  notified字段已存在，跳过');
    }

    // 验证字段
    console.log('\n🔍 验证新增字段...');
    const [newColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'video_projects'
      AND COLUMN_NAME IN ('progress', 'progressMessage', 'completedAt', 'notified')
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);

    console.log('\n📊 新增字段详情:');
    newColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}:`);
      console.log(`    类型: ${col.DATA_TYPE}`);
      console.log(`    默认值: ${col.COLUMN_DEFAULT}`);
      console.log(`    可空: ${col.IS_NULLABLE}`);
      console.log(`    注释: ${col.COLUMN_COMMENT}`);
    });

    console.log('\n✅ 所有字段添加完成！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
addProgressFields()
  .then(() => {
    console.log('\n🎉 脚本执行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });

