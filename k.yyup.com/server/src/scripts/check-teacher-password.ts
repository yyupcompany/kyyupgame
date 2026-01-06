/**
 * 检查教师账号密码
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: 'server/.env' });

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

async function checkTeacherPassword() {
  try {
    console.log('🔍 检查教师账号密码...\n');

    // 查询教师账号
    const [teachers] = await sequelize.query(`
      SELECT u.id, u.username, u.password_hash
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'teacher'
      LIMIT 3
    `) as any[];

    if (teachers.length === 0) {
      console.log('❌ 没有找到教师账号');
      return;
    }

    console.log(`✅ 找到 ${teachers.length} 个教师账号:\n`);

    for (const teacher of teachers) {
      console.log(`账号: ${teacher.username}`);
      console.log(`密码哈希: ${teacher.password_hash}`);
      
      // 尝试常见密码
      const commonPasswords = ['password', 'password123', '123456', 'admin123', 'teacher', 'teacher123'];
      
      for (const pwd of commonPasswords) {
        try {
          const match = await bcrypt.compare(pwd, teacher.password_hash);
          if (match) {
            console.log(`✅ 密码匹配: ${pwd}`);
            break;
          }
        } catch (e) {
          // 忽略错误
        }
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

checkTeacherPassword();

