/**
 * 创建admin用户脚本 - CommonJS版本
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
  N: 16384, // CPU成本
  r: 8,     // 内存成本
  p: 1      // 并行度
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

async function createAdminUser() {
  let connection;

  try {
    console.log('🚀 开始创建admin用户...');

    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 1. 检查并创建admin角色
    console.log('📋 检查admin角色...');
    const [adminRoles] = await connection.execute(
      'SELECT * FROM roles WHERE code = "admin"'
    );

    let adminRoleId;
    if (adminRoles.length === 0) {
      console.log('创建admin角色...');
      const [result] = await connection.execute(`
        INSERT INTO roles (name, code, description, status, created_at, updated_at)
        VALUES ('系统管理员', 'admin', '系统管理员角色，拥有所有权限', 1, NOW(), NOW())
      `);
      adminRoleId = result.insertId;
      console.log('✅ admin角色创建成功');
    } else {
      adminRoleId = adminRoles[0].id;
      console.log('admin角色已存在');
    }

    // 2. 检查并创建admin用户
    console.log('👑 检查admin用户...');
    const [adminUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = "admin"'
    );

    let adminUserId;
    if (adminUsers.length === 0) {
      console.log('创建admin用户...');
      const hashedPassword = await hashPassword('123456');
      const [result] = await connection.execute(`
        INSERT INTO users (username, password, email, real_name, phone, status, created_at, updated_at)
        VALUES ('admin', ?, 'admin@kindergarten.com', '系统管理员', '13800138001', 'active', NOW(), NOW())
      `, [hashedPassword]);
      adminUserId = result.insertId;
      console.log('✅ admin用户创建成功');
    } else {
      adminUserId = adminUsers[0].id;
      console.log('admin用户已存在');
    }

    // 3. 创建用户角色关联
    console.log('🔗 创建admin用户角色关联...');
    const [adminUserRoles] = await connection.execute(
      'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
      [adminUserId, adminRoleId]
    );

    if (adminUserRoles.length === 0) {
      await connection.execute(`
        INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `, [adminUserId, adminRoleId]);
      console.log('✅ 创建admin用户角色关联');
    } else {
      console.log('admin用户角色关联已存在');
    }

    console.log('🎉 Admin用户创建完成！');
    console.log('📝 登录信息：');
    console.log('  Admin: username=admin, password=123456');

  } catch (error) {
    console.error('❌ 创建admin用户失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行脚本
createAdminUser()
  .then(() => {
    console.log('✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });