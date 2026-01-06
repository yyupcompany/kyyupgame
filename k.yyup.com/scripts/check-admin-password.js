#!/usr/bin/env node

/**
 * 检查admin用户的密码哈希
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
  console.log('🔍 检查admin用户密码...\n');

  try {
    await sequelize.authenticate();

    const [users] = await sequelize.query(`
      SELECT id, username, password, email
      FROM users
      WHERE username = 'admin'
    `);

    if (users.length > 0) {
      const admin = users[0];
      console.log('✅ 找到admin用户:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   用户名: ${admin.username}`);
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   密码哈希: ${admin.password.substring(0, 20)}...`);
      console.log();
      console.log('💡 提示: 如果不知道密码，可以重置为 "123456"');
      console.log('   运行: node scripts/reset-admin-password.js');
      console.log();
    } else {
      console.log('❌ 没有找到admin用户');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

main();

