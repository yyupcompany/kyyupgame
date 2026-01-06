#!/usr/bin/env node

/**
 * 重置admin用户密码脚本
 * 将admin用户密码重置为 admin123
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// 数据库配置
const dbConfig = {
  database: process.env.DB_NAME || 'kindergarten_management',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false
};

async function resetAdminPassword() {
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: false
    }
  );

  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 生成新密码的哈希
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`🔐 生成密码哈希: ${hashedPassword.substring(0, 30)}...\n`);

    // 更新admin用户密码
    const [result] = await sequelize.query(`
      UPDATE users
      SET password = ?
      WHERE username = 'admin'
    `, {
      replacements: [hashedPassword]
    });

    if (result.affectedRows > 0) {
      console.log('✅ admin用户密码已重置为: admin123\n');
      console.log('💡 现在可以使用以下凭证登录:');
      console.log('   用户名: admin');
      console.log('   密码: admin123\n');
    } else {
      console.log('❌ 没有找到admin用户\n');
    }

    // 验证密码
    const [users] = await sequelize.query(`
      SELECT id, username, password, email
      FROM users
      WHERE username = 'admin'
    `);

    if (users.length > 0) {
      const admin = users[0];
      console.log('📋 admin用户信息:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   用户名: ${admin.username}`);
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   密码哈希: ${admin.password.substring(0, 30)}...\n`);

      // 验证密码是否正确
      const isValid = await bcrypt.compare(newPassword, admin.password);
      console.log(`✅ 密码验证: ${isValid ? '成功' : '失败'}\n`);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

resetAdminPassword();

