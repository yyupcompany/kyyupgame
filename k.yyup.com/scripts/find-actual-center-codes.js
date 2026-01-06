#!/usr/bin/env node

/**
 * 查找数据库中实际的中心权限code
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
  console.log('🔍 查找数据库中实际的中心权限code...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询所有中心权限
    const [centers] = await sequelize.query(`
      SELECT 
        id, 
        name, 
        chinese_name, 
        code, 
        path, 
        type, 
        status,
        sort
      FROM permissions 
      WHERE path LIKE '/centers/%'
      AND status = 1
      ORDER BY sort, id
    `);

    console.log(`📊 数据库中的中心权限 (共 ${centers.length} 个):\n`);
    
    centers.forEach((c, index) => {
      console.log(`${index + 1}. ${c.chinese_name || c.name}`);
      console.log(`   ID: ${c.id}`);
      console.log(`   Code: ${c.code || '❌ 无code'}`);
      console.log(`   Path: ${c.path}`);
      console.log(`   Type: ${c.type}`);
      console.log(`   Sort: ${c.sort}`);
      console.log();
    });

    // 生成配置建议
    console.log('📝 建议的centerPermissions配置:\n');
    console.log('export const centerPermissions = {');
    centers.forEach(c => {
      if (c.code) {
        const constName = c.code.toUpperCase();
        console.log(`  ${constName}: '${c.code}',  // ${c.chinese_name || c.name}`);
      }
    });
    console.log('};\n');

    console.log('📝 建议的centerPermissionIds配置:\n');
    console.log('export const centerPermissionIds = {');
    centers.forEach(c => {
      if (c.code) {
        const constName = c.code.toUpperCase();
        console.log(`  [centerPermissions.${constName}]: ${c.id},  // ${c.chinese_name || c.name}`);
      }
    });
    console.log('};\n');

  } catch (error) {
    console.error('\n❌ 查询失败:');
    console.error('   错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

