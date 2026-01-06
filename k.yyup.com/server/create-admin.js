/**
 * 创建admin用户脚本
 */

const { sequelize } = require('./src/init.ts');
const { QueryTypes } = require('sequelize');
const scrypt = require('scrypt-js');
const crypto = require('crypto');

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
  try {
    console.log('🚀 开始创建admin用户...');

    // 1. 检查并创建admin角色
    console.log('📋 检查admin角色...');

    const adminRoles = await sequelize.query(
      'SELECT * FROM roles WHERE code = "admin"',
      { type: QueryTypes.SELECT }
    );

    let adminRoleId;
    if (adminRoles.length === 0) {
      console.log('创建admin角色...');
      await sequelize.query(`
        INSERT INTO roles (name, code, description, status, created_at, updated_at)
        VALUES ('系统管理员', 'admin', '系统管理员角色，拥有所有权限', 1, NOW(), NOW())
      `);
      const newAdminRole = await sequelize.query(
        'SELECT * FROM roles WHERE code = "admin"',
        { type: QueryTypes.SELECT }
      );
      adminRoleId = newAdminRole[0].id;
    } else {
      adminRoleId = adminRoles[0].id;
      console.log('admin角色已存在');
    }

    // 2. 检查并创建admin用户
    console.log('👑 检查admin用户...');
    const adminUsers = await sequelize.query(
      'SELECT * FROM users WHERE username = "admin"',
      { type: QueryTypes.SELECT }
    );

    let adminUserId;
    if (adminUsers.length === 0) {
      console.log('创建admin用户...');
      const hashedPassword = await hashPassword('123456');
      await sequelize.query(`
        INSERT INTO users (username, password, email, real_name, phone, status, created_at, updated_at)
        VALUES ('admin', ?, 'admin@kindergarten.com', '系统管理员', '13800138001', 'active', NOW(), NOW())
      `, {
        replacements: [hashedPassword],
        type: QueryTypes.INSERT
      });

      const newAdminUser = await sequelize.query(
        'SELECT * FROM users WHERE username = "admin"',
        { type: QueryTypes.SELECT }
      );
      adminUserId = newAdminUser[0].id;
    } else {
      adminUserId = adminUsers[0].id;
      console.log('admin用户已存在');
    }

    // 3. 创建用户角色关联
    console.log('🔗 创建admin用户角色关联...');
    const adminUserRoles = await sequelize.query(
      `SELECT * FROM user_roles WHERE user_id = ${adminUserId} AND role_id = ${adminRoleId}`,
      { type: QueryTypes.SELECT }
    );

    if (adminUserRoles.length === 0) {
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
        VALUES (${adminUserId}, ${adminRoleId}, NOW(), NOW())
      `);
      console.log('✅ 创建admin用户角色关联');
    }

    console.log('🎉 Admin用户创建完成！');
    console.log('📝 登录信息：');
    console.log  ('  Admin: username=admin, password=123456');

  } catch (error) {
    console.error('❌ 创建admin用户失败:', error);
    throw error;
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