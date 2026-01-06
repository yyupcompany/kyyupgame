const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTestUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'kargerdensales'
  });

  try {
    console.log('🔍 查看测试用户...\n');

    // 查看所有用户
    const [users] = await connection.execute(`
      SELECT u.id, u.username, u.email, u.status,
              GROUP_CONCAT(r.code) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.status = 'active'
      GROUP BY u.id, u.username, u.email, u.status
      ORDER BY u.id
      LIMIT 10
    `);

    console.log('📋 活跃用户列表:');
    console.table(users);

    // 查看管理员角色用户
    const [adminUsers] = await connection.execute(`
      SELECT u.id, u.username, u.email,
             GROUP_CONCAT(r.code) as roles
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code IN ('admin', 'principal', 'teacher')
      AND u.status = 'active'
      GROUP BY u.id, u.username, u.email
    `);

    if (adminUsers.length > 0) {
      console.log('\n👑 管理员角色用户:');
      console.table(adminUsers);
    }

    // 查看是否有快速登录账户
    const [quickLoginUsers] = await connection.execute(`
      SELECT u.id, u.username, u.email, u.quick_login_token
      FROM users u
      WHERE u.quick_login_token IS NOT NULL
      AND u.quick_login_token != ''
      AND u.status = 'active'
      LIMIT 5
    `);

    if (quickLoginUsers.length > 0) {
      console.log('\n🚀 快速登录账户:');
      console.table(quickLoginUsers);
    }

    console.log('\n🎉 用户检查完成！');

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkTestUsers();