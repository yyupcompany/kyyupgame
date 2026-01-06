/**
 * 查找教师账号
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

async function findTeacherAccount() {
  try {
    console.log('🔍 查找教师账号...\n');

    // 查询教师角色的用户
    const [teachers] = await sequelize.query(`
      SELECT u.id, u.username, u.email, r.code as role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'teacher'
      LIMIT 5
    `) as any[];

    if (teachers.length === 0) {
      console.log('❌ 没有找到教师账号');
      return;
    }

    console.log(`✅ 找到 ${teachers.length} 个教师账号:\n`);
    teachers.forEach((t: any, i: number) => {
      console.log(`${i + 1}. ID: ${t.id}, Username: ${t.username}, Email: ${t.email}`);
    });

    console.log('\n💡 使用以下账号进行测试:');
    console.log(`   Username: ${teachers[0].username}`);
    console.log(`   Password: (需要知道密码)`);
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

findTeacherAccount();

