#!/usr/bin/env node

/**
 * 将督查中心的type从menu改为category
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../server/.env') });

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

async function main() {
  console.log('🔧 将督查中心的type从menu改为category...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查询当前状态
    console.log('📋 步骤1: 查询督查中心当前状态...');
    const [before] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, status, sort 
      FROM permissions 
      WHERE id = 5001
    `);

    if (before.length > 0) {
      console.log('当前状态:');
      console.log(`   ID: ${before[0].id}`);
      console.log(`   名称: ${before[0].chinese_name || before[0].name}`);
      console.log(`   代码: ${before[0].code}`);
      console.log(`   类型: ${before[0].type}`);
      console.log(`   路径: ${before[0].path}`);
      console.log(`   状态: ${before[0].status === 1 ? '启用' : '禁用'}`);
      console.log(`   排序: ${before[0].sort}\n`);
    }

    // 2. 更新type为category
    console.log('🔧 步骤2: 更新督查中心type为category...');
    await sequelize.query(`
      UPDATE permissions 
      SET type = 'category', updated_at = NOW()
      WHERE id = 5001
    `);
    console.log('✅ 类型已更新\n');

    // 3. 验证更新
    console.log('🔍 步骤3: 验证更新结果...');
    const [after] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, status, sort 
      FROM permissions 
      WHERE id = 5001
    `);

    if (after.length > 0) {
      console.log('更新后状态:');
      console.log(`   ID: ${after[0].id}`);
      console.log(`   名称: ${after[0].chinese_name || after[0].name}`);
      console.log(`   代码: ${after[0].code}`);
      console.log(`   类型: ${after[0].type} ${after[0].type === 'category' ? '✅' : '❌'}`);
      console.log(`   路径: ${after[0].path}`);
      console.log(`   状态: ${after[0].status === 1 ? '✅ 启用' : '❌ 禁用'}`);
      console.log(`   排序: ${after[0].sort}\n`);
    }

    // 4. 显示所有category类型的中心
    console.log('📊 步骤4: 显示所有category类型的中心...');
    const [categories] = await sequelize.query(`
      SELECT id, chinese_name, code, path, sort, status
      FROM permissions
      WHERE type = 'category'
      AND path LIKE '/centers/%'
      AND status = 1
      ORDER BY sort, id
    `);

    console.log(`✅ 共有 ${categories.length} 个category类型的中心:\n`);
    categories.forEach((c, index) => {
      console.log(`   ${index + 1}. ${c.chinese_name} (ID: ${c.id}, Sort: ${c.sort})`);
    });
    console.log();

    console.log('🎉 督查中心类型修正完成！\n');
    console.log('📋 下一步:');
    console.log('   1. 重启后端服务器');
    console.log('   2. 重新登录系统');
    console.log('   3. 检查侧边栏是否显示"督查中心"\n');

  } catch (error) {
    console.error('\n❌ 修正失败:');
    console.error('   错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

