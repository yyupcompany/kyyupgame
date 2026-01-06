/**
 * 批量重置用户密码为123456
 */

const mysql = require('mysql2/promise');
const scrypt = require('scrypt-js');
const crypto = require('crypto');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'XlQ5e42JkIf5V3ly',
  database: 'kargerdensales',
  ssl: {
    rejectUnauthorized: false
  }
};

// Scrypt配置
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1
};

// 生成密码哈希
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(32);
  const passwordBuffer = Buffer.from(password, 'utf8');
  const derivedKey = await scrypt(
    passwordBuffer,
    salt,
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    32
  );
  return Buffer.concat([salt, Buffer.from(derivedKey)]).toString('hex');
};

async function resetPasswords() {
  let connection;

  try {
    console.log('🔧 开始重置用户密码为123456...');

    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 要重置密码的用户列表
    const users = [
      { username: 'admin', realName: '系统管理员', email: 'admin@kindergarten.com', phone: '13800138001' },
      { username: 'principal_1', realName: '园长1', email: 'principal_1@kindergarten.com', phone: '15010272076' },
      { username: 'principal', realName: '园长', email: 'principal@kindergarten.com', phone: '13800138002' }
    ];

    const password = '123456';
    const hashedPassword = await hashPassword(password);

    for (const user of users) {
      console.log(`🔐 重置用户 ${user.username} 的密码...`);

      // 检查用户是否存在
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [user.username]
      );

      if (existingUsers.length === 0) {
        console.log(`用户 ${user.username} 不存在，创建新用户...`);
        // 创建用户
        await connection.execute(`
          INSERT INTO users (username, password, email, real_name, phone, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `, [user.username, hashedPassword, user.email, user.realName, user.phone]);

        console.log(`✅ 用户 ${user.username} 创建成功`);
      } else {
        console.log(`用户 ${user.username} 已存在，更新密码...`);
        // 更新密码
        await connection.execute(`
          UPDATE users SET password = ?, updated_at = NOW() WHERE username = ?
        `, [hashedPassword, user.username]);

        console.log(`✅ 用户 ${user.username} 密码更新成功`);
      }
    }

    // 验证admin用户是否有admin角色
    console.log('🔍 检查admin用户角色...');
    const [adminUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = "admin"'
    );

    if (adminUsers.length > 0) {
      const adminUserId = adminUsers[0].id;

      // 检查admin角色是否存在
      const [adminRoles] = await connection.execute(
        'SELECT id FROM roles WHERE code = "admin"'
      );

      let adminRoleId;
      if (adminRoles.length === 0) {
        console.log('创建admin角色...');
        const [result] = await connection.execute(`
          INSERT INTO roles (name, code, description, status, created_at, updated_at)
          VALUES ('系统管理员', 'admin', '系统管理员角色，拥有所有权限', 1, NOW(), NOW())
        `);
        adminRoleId = result.insertId;
      } else {
        adminRoleId = adminRoles[0].id;
      }

      // 检查用户角色关联
      const [userRoles] = await connection.execute(
        'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
        [adminUserId, adminRoleId]
      );

      if (userRoles.length === 0) {
        console.log('为admin用户分配admin角色...');
        await connection.execute(`
          INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [adminUserId, adminRoleId]);
      }
    }

    console.log('\n🎉 密码重置完成！');
    console.log('📝 登录信息：');
    console.log('  Admin: username=admin, password=123456');
    console.log('  Principal: username=principal_1, password=123456');
    console.log('  Teacher: username=teacher, password=123456');
    console.log('  Parent: username=test_parent, password=123456');

  } catch (error) {
    console.error('❌ 重置密码失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行脚本
resetPasswords()
  .then(() => {
    console.log('✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });