/**
 * 为家长账号生成测试token
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

async function generateParentToken() {
  try {
    console.log('🔑 为家长账号生成测试token...\n');

    // 查询家长账号
    const [parents] = await sequelize.query(`
      SELECT u.id, u.username, u.email, r.code as role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'parent'
      LIMIT 1
    `) as any[];

    if (parents.length === 0) {
      console.log('❌ 没有找到家长账号');
      return;
    }

    const parent = parents[0];
    console.log(`✅ 找到家长账号: ${parent.username}\n`);

    // 生成token
    const payload = {
      id: parent.id,
      userId: parent.id,
      username: parent.username,
      email: parent.email,
      role: parent.role
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

generateParentToken();

