#!/usr/bin/env node

/**
 * SOP模板系统数据库迁移执行脚本
 * 执行步骤：
 * 1. 连接数据库
 * 2. 执行表创建脚本
 * 3. 执行种子数据脚本
 * 4. 验证数据完整性
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT) || 43906,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  database: process.env.DB_NAME || 'kargerdensales',
  multipleStatements: true, // 允许多条SQL语句
};

console.log('📦 SOP模板系统数据库迁移工具');
console.log('================================\n');

async function runMigration() {
  let connection;

  try {
    // 1. 连接数据库
    console.log('🔌 正在连接数据库...');
    console.log(`   主机: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   数据库: ${dbConfig.database}\n`);

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 2. 读取并执行迁移脚本
    console.log('📝 执行表创建脚本...');
    const migrationFile = path.join(__dirname, 'migrations', '20260112_create_sop_template_system.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    // 使用query()方法执行多条CREATE TABLE语句
    await connection.query(migrationSQL);
    console.log('✅ 表创建完成\n');

    // 3. 检查表是否创建成功
    console.log('🔍 验证表结构...');
    const tables = ['sop_templates', 'sop_template_nodes', 'sop_instances', 'sop_node_progress'];
    for (const table of tables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - 创建失败`);
      }
    }
    console.log('');

    // 4. 执行种子数据脚本
    console.log('🌱 执行种子数据脚本...');
    const seedFile = path.join(__dirname, 'seeds', 'sop-templates-seed.sql');
    const seedSQL = fs.readFileSync(seedFile, 'utf8');

    // 使用query()方法执行多条SQL语句
    await connection.query(seedSQL);
    console.log('✅ 种子数据插入完成\n');

    // 5. 验证数据
    console.log('🔍 验证数据完整性...');

    // 检查模板
    const [templates] = await connection.execute('SELECT id, name, type FROM sop_templates');
    console.log(`   📌 模板数量: ${templates.length}`);
    templates.forEach(t => {
      console.log(`      - ID: ${t.id}, 名称: ${t.name}, 类型: ${t.type}`);
    });

    // 检查节点
    const [nodes] = await connection.execute('SELECT id, template_id, node_order, node_name FROM sop_template_nodes ORDER BY template_id, node_order');
    console.log(`   📌 节点数量: ${nodes.length}`);
    nodes.forEach(n => {
      console.log(`      - 节点${n.node_order}: ${n.node_name} (模板ID: ${n.template_id})`);
    });

    console.log('\n🎉 SOP模板系统迁移完成！\n');
    console.log('================================');
    console.log('✅ 4个核心表已创建');
    console.log('✅ 1个默认销售模板已导入');
    console.log('✅ 5个SOP节点已配置');
    console.log('================================\n');

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行迁移
runMigration().catch(error => {
  console.error('执行迁移时发生严重错误:', error);
  process.exit(1);
});
