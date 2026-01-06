#!/usr/bin/env node

/**
 * 检查数据库表结构脚本
 * 对比文档要求和实际数据库表
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false
  }
);

async function checkDatabaseTables() {
  try {
    console.log('🔍 检查数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 文档要求的表
    const requiredTables = {
      'customers': '客户信息表',
      'sop_progress': 'SOP进度表',
      'conversations': '对话记录表',
      'tasks': '任务表',
      'sop_stages': 'SOP阶段表',
      'sop_tasks': 'SOP任务表',
      'customer_sop_progress': '客户SOP进度表',
      'conversation_records': '对话记录表',
      'conversation_screenshots': '截图表',
      'ai_suggestions_history': 'AI建议历史表'
    };

    console.log('📊 检查数据库表结构:\n');
    console.log('=' .repeat(80));
    console.log('表名'.padEnd(35) + '状态'.padEnd(15) + '说明');
    console.log('=' .repeat(80));

    for (const [tableName, description] of Object.entries(requiredTables)) {
      try {
        const [tables] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
        if (tables.length > 0) {
          // 获取表结构
          const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
          console.log(`${tableName.padEnd(35)}${'✅ 存在'.padEnd(15)}${description} (${columns.length}列)`);
        } else {
          console.log(`${tableName.padEnd(35)}${'❌ 不存在'.padEnd(15)}${description}`);
        }
      } catch (error) {
        console.log(`${tableName.padEnd(35)}${'❌ 错误'.padEnd(15)}${error.message}`);
      }
    }
    console.log('=' .repeat(80));

    // 检查SOP相关表的详细结构
    console.log('\n📋 SOP阶段表 (sop_stages) 结构:');
    try {
      const [columns] = await sequelize.query('DESCRIBE sop_stages');
      columns.forEach(col => {
        console.log(`  - ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (error) {
      console.log('  ❌ 表不存在');
    }

    console.log('\n📋 客户SOP进度表 (customer_sop_progress) 结构:');
    try {
      const [columns] = await sequelize.query('DESCRIBE customer_sop_progress');
      columns.forEach(col => {
        console.log(`  - ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (error) {
      console.log('  ❌ 表不存在');
    }

    console.log('\n📋 对话记录表 (conversation_records) 结构:');
    try {
      const [columns] = await sequelize.query('DESCRIBE conversation_records');
      columns.forEach(col => {
        console.log(`  - ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (error) {
      console.log('  ❌ 表不存在');
    }

    // 检查数据
    console.log('\n📊 数据统计:');
    console.log('=' .repeat(80));
    
    const dataChecks = [
      { table: 'sop_stages', name: 'SOP阶段' },
      { table: 'sop_tasks', name: 'SOP任务' },
      { table: 'customer_sop_progress', name: '客户进度' },
      { table: 'conversation_records', name: '对话记录' },
      { table: 'conversation_screenshots', name: '截图' },
      { table: 'ai_suggestions_history', name: 'AI建议历史' }
    ];

    for (const check of dataChecks) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${check.table}`);
        const count = result[0].count;
        console.log(`${check.name.padEnd(20)} ${count.toString().padStart(10)} 条记录`);
      } catch (error) {
        console.log(`${check.name.padEnd(20)} ${'❌ 表不存在'.padStart(10)}`);
      }
    }
    console.log('=' .repeat(80));

    // 对比文档要求
    console.log('\n📝 文档要求对比:');
    console.log('=' .repeat(80));
    
    const documentRequirements = [
      { item: 'customers表', required: true, exists: true },
      { item: 'sop_progress表', required: true, exists: false },
      { item: 'conversations表', required: true, exists: false },
      { item: 'tasks表', required: true, exists: false },
      { item: 'sop_stages表', required: true, exists: true },
      { item: 'sop_tasks表', required: true, exists: true },
      { item: 'customer_sop_progress表', required: true, exists: true },
      { item: 'conversation_records表', required: true, exists: true },
      { item: 'conversation_screenshots表', required: true, exists: true },
      { item: 'ai_suggestions_history表', required: true, exists: true }
    ];

    console.log('需求项'.padEnd(40) + '文档要求'.padEnd(15) + '实际状态');
    console.log('=' .repeat(80));
    
    for (const req of documentRequirements) {
      const status = req.exists ? '✅ 已实现' : '❌ 缺失';
      console.log(`${req.item.padEnd(40)}${'必需'.padEnd(15)}${status}`);
    }
    console.log('=' .repeat(80));

    // 总结
    console.log('\n🎯 总结:');
    const existingCount = documentRequirements.filter(r => r.exists).length;
    const totalCount = documentRequirements.length;
    const percentage = ((existingCount / totalCount) * 100).toFixed(1);
    
    console.log(`✅ 已实现: ${existingCount}/${totalCount} (${percentage}%)`);
    console.log(`❌ 缺失: ${totalCount - existingCount}/${totalCount}`);
    
    if (existingCount === totalCount) {
      console.log('\n🎉 所有必需的数据库表都已创建！');
    } else {
      console.log('\n⚠️  还有部分表需要创建或迁移');
      console.log('\n建议:');
      console.log('1. 检查是否需要创建 customers, sop_progress, conversations, tasks 表');
      console.log('2. 或者这些表可能使用了不同的命名（如 customer_sop_progress 代替 sop_progress）');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 运行脚本
checkDatabaseTables();

