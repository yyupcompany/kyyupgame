#!/usr/bin/env node

/**
 * 检查幼儿园数据和用户的kindergartenId
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
  console.log('🔍 检查幼儿园数据和用户的kindergartenId...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 检查幼儿园表
    console.log('📊 步骤1: 检查幼儿园数据...');
    const [kindergartens] = await sequelize.query(`
      SELECT id, name, address, phone, status
      FROM kindergartens
      ORDER BY id
      LIMIT 10
    `);

    if (kindergartens.length > 0) {
      console.log(`✅ 找到 ${kindergartens.length} 个幼儿园:\n`);
      kindergartens.forEach((k, index) => {
        console.log(`   ${index + 1}. ID: ${k.id}, 名称: ${k.name}, 状态: ${k.status === 1 ? '启用' : '禁用'}`);
      });
      console.log();
    } else {
      console.log('❌ 没有找到幼儿园数据\n');
    }

    // 2. 检查admin用户
    console.log('👤 步骤2: 检查admin用户...');
    const [adminUsers] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.real_name,
        r.code as role_code,
        r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = 'admin'
    `);

    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log('✅ 找到admin用户:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   用户名: ${admin.username}`);
      console.log(`   邮箱: ${admin.email || '无'}`);
      console.log(`   真实姓名: ${admin.real_name || '无'}`);
      console.log(`   角色: ${admin.role_code} (${admin.role_name})`);
      console.log();

      // 3. 检查admin用户登录时会获得的kindergartenId
      if (admin.role_code === 'admin' || admin.role_code === 'super_admin') {
        console.log('🏢 步骤3: 检查admin用户会获得的kindergartenId...');
        const [firstKindergarten] = await sequelize.query(`
          SELECT id, name FROM kindergartens ORDER BY id LIMIT 1
        `);
        
        if (firstKindergarten.length > 0) {
          const kg = firstKindergarten[0];
          console.log(`✅ admin用户登录时会获得 kindergartenId: ${kg.id} (${kg.name})`);
          console.log();
        } else {
          console.log('❌ 没有幼儿园数据，admin用户登录时 kindergartenId 为 null\n');
        }
      }
    } else {
      console.log('❌ 没有找到admin用户\n');
    }

    // 4. 检查users表是否有kindergarten_id字段
    console.log('🔍 步骤4: 检查users表结构...');
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM users LIKE 'kindergarten_id'
    `);

    if (columns.length > 0) {
      console.log('✅ users表有 kindergarten_id 字段');
      console.log(`   类型: ${columns[0].Type}`);
      console.log(`   允许NULL: ${columns[0].Null}`);
      console.log(`   默认值: ${columns[0].Default || '无'}`);
      console.log();

      // 检查有多少用户有kindergarten_id
      const [userStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(kindergarten_id) as users_with_kg,
          COUNT(*) - COUNT(kindergarten_id) as users_without_kg
        FROM users
      `);
      
      const stats = userStats[0];
      console.log('📊 用户统计:');
      console.log(`   总用户数: ${stats.total_users}`);
      console.log(`   有kindergarten_id的用户: ${stats.users_with_kg}`);
      console.log(`   没有kindergarten_id的用户: ${stats.users_without_kg}`);
      console.log();
    } else {
      console.log('❌ users表没有 kindergarten_id 字段\n');
    }

    // 5. 总结
    console.log('📋 总结:\n');
    
    if (kindergartens.length > 0) {
      console.log('✅ 幼儿园数据正常');
    } else {
      console.log('❌ 需要添加幼儿园数据');
    }

    if (adminUsers.length > 0 && adminUsers[0].role_code === 'admin') {
      console.log('✅ admin用户角色正常');
    } else {
      console.log('❌ admin用户角色异常');
    }

    if (kindergartens.length > 0 && adminUsers.length > 0) {
      console.log('✅ admin用户登录时会获得kindergartenId');
    } else {
      console.log('❌ admin用户登录时kindergartenId为null');
    }

    console.log();

  } catch (error) {
    console.error('\n❌ 检查失败:');
    console.error('   错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

