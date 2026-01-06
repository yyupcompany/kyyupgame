/**
 * 查找家长账号
 */

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

async function findParentAccount() {
  try {
    console.log('🔍 查找家长账号...\n');

    // 查询家长角色的用户
    const [parents] = await sequelize.query(`
      SELECT u.id, u.username, u.email, r.code as role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'parent'
      LIMIT 5
    `) as any[];

    if (parents.length === 0) {
      console.log('❌ 没有找到家长账号');
      return;
    }

    console.log(`✅ 找到 ${parents.length} 个家长账号:\n`);
    parents.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ID: ${p.id}, Username: ${p.username}, Email: ${p.email}`);
    });

    console.log('\n💡 使用以下账号进行测试:');
    console.log(`   Username: ${parents[0].username}`);
    console.log(`   Password: (需要知道密码)`);
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

findParentAccount();

