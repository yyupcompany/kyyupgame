/**
 * 创建考勤功能数据库表
 * 执行命令: node server/scripts/create-attendance-tables.js
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 数据库配置（从环境变量读取）
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: console.log
  }
);

async function createTables() {
  try {
    console.log('🚀 开始创建考勤功能数据库表...\n');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../src/migrations/20250109-create-attendance-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 分割SQL语句（按分号分割，但排除注释）
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('USE'));

    // 执行每个SQL语句
    for (const statement of statements) {
      if (statement.includes('CREATE TABLE')) {
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
        if (match) {
          const tableName = match[1];
          console.log(`📝 创建表: ${tableName}...`);
        }
      } else if (statement.includes('SELECT')) {
        // 跳过SELECT语句
        continue;
      }

      try {
        const result = await sequelize.query(statement);
        console.log(`  ✓ SQL执行成功`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⚠️  表已存在，跳过创建`);
        } else {
          console.error(`  ❌ SQL执行失败:`, error.message);
          console.error(`  SQL语句:`, statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }

    console.log('\n✅ 所有表创建成功！\n');

    // 验证表是否创建成功
    console.log('🔍 验证表结构...\n');
    
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_COMMENT
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'kargerdensales'}'
      AND TABLE_NAME IN ('attendances', 'attendance_statistics', 'attendance_change_logs')
    `);

    console.log('📊 已创建的表:');
    tables.forEach(table => {
      console.log(`  ✓ ${table.TABLE_NAME} - ${table.TABLE_COMMENT}`);
    });

    console.log('\n🎉 考勤功能数据库表创建完成！');

  } catch (error) {
    console.error('\n❌ 创建表失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行创建
createTables();

