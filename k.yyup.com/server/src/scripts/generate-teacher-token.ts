/**
 * 为教师账号生成测试token
 */

import * as jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

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

async function generateTeacherToken() {
  try {
    console.log('🔑 为教师账号生成测试token...\n');

    // 查询教师账号
    const [teachers] = await sequelize.query(`
      SELECT u.id, u.username, u.email, r.code as role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'teacher'
      LIMIT 1
    `) as any[];

    if (teachers.length === 0) {
      console.log('❌ 没有找到教师账号');
      return;
    }

    const teacher = teachers[0];
    console.log(`✅ 找到教师账号: ${teacher.username}\n`);

    // 生成token
    const payload = {
      id: teacher.id,
      userId: teacher.id,
      username: teacher.username,
      email: teacher.email,
      role: teacher.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '24h'
    });

    console.log('🔑 生成的Token:');
    console.log(`\n${token}\n`);

    console.log('📝 使用方式:');
    console.log(`curl -X GET http://localhost:3000/api/auth-permissions/menu \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json"\n`);

    console.log('✅ Token生成完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

generateTeacherToken();

