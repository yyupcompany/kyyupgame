/**
 * 验证考勤功能数据库表
 * 执行命令: node server/scripts/verify-attendance-tables.js
 */

const { Sequelize } = require('sequelize');
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
    logging: false
  }
);

async function verifyTables() {
  try {
    console.log('🔍 验证考勤功能数据库表...\n');

    // 1. 检查表是否存在
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_COMMENT, TABLE_ROWS
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'kargerdensales'}' 
      AND TABLE_NAME IN ('attendances', 'attendance_statistics', 'attendance_change_logs')
      ORDER BY TABLE_NAME
    `);

    console.log('📊 考勤功能表列表:');
    if (tables.length === 0) {
      console.log('  ❌ 未找到考勤功能表！');
      console.log('\n请先运行: node server/scripts/create-attendance-tables.js');
      process.exit(1);
    }

    tables.forEach(table => {
      console.log(`  ✓ ${table.TABLE_NAME}`);
      console.log(`    说明: ${table.TABLE_COMMENT || '无'}`);
      console.log(`    行数: ${table.TABLE_ROWS || 0}`);
    });

    // 2. 检查attendances表结构
    console.log('\n📋 attendances表字段:');
    const [attendanceColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'kargerdensales'}'
      AND TABLE_NAME = 'attendances'
      ORDER BY ORDINAL_POSITION
    `);

    attendanceColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} - ${col.COLUMN_COMMENT || ''}`);
    });

    // 3. 检查索引
    console.log('\n🔑 attendances表索引:');
    const [indexes] = await sequelize.query(`
      SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'kargerdensales'}'
      AND TABLE_NAME = 'attendances'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);

    const indexGroups = {};
    indexes.forEach(idx => {
      if (!indexGroups[idx.INDEX_NAME]) {
        indexGroups[idx.INDEX_NAME] = [];
      }
      indexGroups[idx.INDEX_NAME].push(idx.COLUMN_NAME);
    });

    Object.entries(indexGroups).forEach(([name, columns]) => {
      const unique = indexes.find(i => i.INDEX_NAME === name).NON_UNIQUE === 0 ? 'UNIQUE' : 'INDEX';
      console.log(`  - ${name} (${unique}): ${columns.join(', ')}`);
    });

    // 4. 检查外键
    console.log('\n🔗 attendances表外键:');
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'kargerdensales'}'
      AND TABLE_NAME = 'attendances'
      AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY CONSTRAINT_NAME
    `);

    foreignKeys.forEach(fk => {
      console.log(`  - ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    console.log('\n✅ 考勤功能数据库表验证完成！');
    console.log('\n📝 总结:');
    console.log(`  - 表数量: ${tables.length}/3`);
    console.log(`  - attendances字段数: ${attendanceColumns.length}`);
    console.log(`  - attendances索引数: ${Object.keys(indexGroups).length}`);
    console.log(`  - attendances外键数: ${foreignKeys.length}`);

  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行验证
verifyTables();

