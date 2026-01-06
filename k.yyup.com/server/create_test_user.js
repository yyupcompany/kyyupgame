const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '/home/zhgue/kyyupgame/unified-tenant-system/.env' });

async function createTestUser() {
  let connection;
  try {
    // 数据库连接配置
    const dbConfig = {
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: Number(process.env.DB_PORT) || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_NAME || 'kargerdensales',
      charset: 'utf8mb4'
    };

    console.log('🔌 连接到数据库...', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 生成密码哈希
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('🔐 密码哈希:', hashedPassword);

    // 检查用户是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  用户 admin 已存在');

      // 更新密码
      await connection.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE username = ?',
        [hashedPassword, 'admin']
      );
      console.log('✅ 密码已更新');
    } else {
      // 创建用户
      const [result] = await connection.execute(
        `INSERT INTO users (
          username, password, email, real_name, phone,
          status, auth_source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'admin',           // username作为显示名
          hashedPassword,
          'admin@test.com',
          '管理员',
          '13800138000',     // 手机号作为唯一登录凭证
          'active',
          'local'
        ]
      );
      console.log('✅ 用户创建成功, ID:', result.insertId);
      console.log('✅ 登录凭证: 手机号 13800138000');
    }

    // 创建管理员角色（如果不存在）
    const [roleResult] = await connection.execute(
      'SELECT id FROM roles WHERE code = ? LIMIT 1',
      ['admin']
    );

    let roleId;
    if (roleResult.length === 0) {
      const [roleInsert] = await connection.execute(
        `INSERT INTO roles (name, code, description, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        ['管理员', 'admin', '系统管理员角色']
      );
      roleId = roleInsert.insertId;
      console.log('✅ 管理员角色创建成功, ID:', roleId);
    } else {
      roleId = roleResult[0].id;
      console.log('✅ 管理员角色已存在, ID:', roleId);
    }

    // 为用户分配管理员角色
    const [userRows] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );
    const userId = userRows[0].id;

    const [userRoleExists] = await connection.execute(
      'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );

    if (userRoleExists.length === 0) {
      await connection.execute(
        'INSERT INTO user_roles (user_id, role_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [userId, roleId]
      );
      console.log('✅ 管理员角色已分配给用户');
    } else {
      console.log('✅ 用户已有管理员角色');
    }

    // 验证创建的用户
    const [verifyUser] = await connection.execute(
      'SELECT id, username, email, status FROM users WHERE username = ?',
      ['admin']
    );
    console.log('✅ 用户验证:', verifyUser[0]);

    console.log('\n🎉 测试用户创建完成!');
    console.log('📝 登录信息:');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('  手机: 13800138000');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

createTestUser();
