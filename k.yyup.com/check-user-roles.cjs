/**
 * 检查用户角色分配情况
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT) || 43906,
    dialect: 'mysql',
    logging: false
  }
);

async function checkUserRoles() {
  try {
    console.log('🔍 检查用户角色分配情况...\n');

    // 检查用户和角色
    const [userResults] = await sequelize.query(`
      SELECT
        u.id as user_id,
        u.username,
        u.name as user_name,
        r.id as role_id,
        r.code as role_code,
        r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.id, r.id
    `);

    console.log('📋 用户角色分配表:');
    console.log('用户ID | 用户名    | 用户名      | 角色ID | 角色代码 | 角色名');
    console.log('------|----------|-------------|--------|----------|--------');

    userResults.forEach(row => {
      console.log(`${row.user_id.toString().padEnd(6)} | ${row.username.padEnd(8)} | ${row.user_name.padEnd(11)} | ${row.role_id?.toString().padEnd(6) || 'NULL'.padEnd(6)} | ${row.role_code?.padEnd(8) || 'NULL'.padEnd(8)} | ${row.role_name || 'NULL'}`);
    });

    console.log('\n🎯 重点检查教师用户:');
    const teacherUsers = userResults.filter(row => row.username && row.username.includes('teacher'));
    teacherUsers.forEach(row => {
      console.log(`用户 ${row.username} (${row.user_name}) - 角色: ${row.role_code || '未分配'} (${row.role_name || '无'})`);
    });

    console.log('\n📊 统计各角色用户数量:');
    const [roleStats] = await sequelize.query(`
      SELECT
        r.code as role_code,
        r.name as role_name,
        COUNT(ur.user_id) as user_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN users u ON ur.user_id = u.id AND u.deleted_at IS NULL
      WHERE r.deleted_at IS NULL
      GROUP BY r.id, r.code, r.name
      ORDER BY user_count DESC
    `);

    roleStats.forEach(stat => {
      console.log(`${stat.role_code} (${stat.role_name}): ${stat.user_count} 个用户`);
    });

    console.log('\n🔐 检查TEACHER_权限数量:');
    const [permResults] = await sequelize.query(`
      SELECT COUNT(*) as count FROM permissions
      WHERE code LIKE 'TEACHER_%' AND deleted_at IS NULL
    `);

    console.log(`现有 ${permResults[0].count} 个TEACHER_权限`);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkUserRoles();