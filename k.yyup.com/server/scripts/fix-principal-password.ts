/**
 * 修复园长用户密码
 * 使用方法: npx ts-node scripts/fix-principal-password.ts
 */

import bcrypt from 'bcryptjs';
import { User } from '../src/models/user.model';
import { initDatabase } from '../src/config/database';

async function fixPrincipalPassword() {
  try {
    console.log('🔧 开始修复园长用户密码...\n');

    // 连接数据库
    const sequelize = await initDatabase();
    console.log('✅ 数据库连接成功\n');

    // 查找园长用户
    const principal = await User.findOne({
      where: { username: 'principal' }
    });

    if (!principal) {
      console.log('❌ 未找到用户名为 "principal" 的用户');
      console.log('📋 正在查找所有可能的园长用户...\n');

      const { Op } = require('sequelize');
      const users = await User.findAll({
        where: {
          username: {
            [Op.like]: '%principal%'
          }
        },
        limit: 10
      });

      if (users.length === 0) {
        console.log('❌ 未找到任何园长用户');
        console.log('💡 建议: 请检查数据库中是否存在园长用户');
        process.exit(1);
      }

      console.log('找到以下用户:');
      users.forEach((user: any) => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, RealName: ${user.realName}`);
      });
      process.exit(0);
    }

    // 生成新密码哈希
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('📋 用户信息:');
    console.log(`  ID: ${principal.id}`);
    console.log(`  Username: ${principal.username}`);
    console.log(`  RealName: ${principal.realName}`);
    console.log(`  Email: ${principal.email}`);
    console.log('');

    // 更新密码
    await principal.update({ password: hashedPassword });

    console.log('✅ 密码更新成功!');
    console.log('');
    console.log('📝 新的登录凭据:');
    console.log(`  Username: ${principal.username}`);
    console.log(`  Password: ${newPassword}`);
    console.log('');

    // 验证密码
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`🔐 密码验证: ${isValid ? '✅ 通过' : '❌ 失败'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

fixPrincipalPassword();

