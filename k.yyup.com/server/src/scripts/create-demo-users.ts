/**
 * 创建演示用户脚本
 * 创建teacher和parent用户，并配置相应的角色和权限
 */

import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import scrypt from 'scrypt-js';
import crypto from 'crypto';

// Scrypt配置
const SCRYPT_PARAMS = {
  N: 16384, // CPU成本
  r: 8,     // 内存成本
  p: 1      // 并行度
};

// 生成密码哈希
const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(32);
  const passwordBuffer = Buffer.from(password, 'utf8');
  const derivedKey = await (scrypt as any)(
    passwordBuffer,
    salt,
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    32
  );
  return Buffer.concat([salt, Buffer.from(derivedKey)]).toString('hex');
};

async function createDemoUsers() {
  try {
    console.log('🚀 开始创建演示用户...');

    // 1. 检查并创建角色
    console.log('📋 检查角色...');
    
    // 检查teacher角色
    const teacherRoles = await sequelize.query(
      'SELECT * FROM roles WHERE code = "teacher"',
      { type: QueryTypes.SELECT }
    ) as any[];

    let teacherRoleId;
    if (teacherRoles.length === 0) {
      console.log('创建teacher角色...');
      await sequelize.query(`
        INSERT INTO roles (name, code, description, status, created_at, updated_at)
        VALUES ('教师', 'teacher', '幼儿园教师角色', 1, NOW(), NOW())
      `);
      const newTeacherRole = await sequelize.query(
        'SELECT * FROM roles WHERE code = "teacher"',
        { type: QueryTypes.SELECT }
      ) as any[];
      teacherRoleId = newTeacherRole[0].id;
    } else {
      teacherRoleId = teacherRoles[0].id;
      console.log('teacher角色已存在');
    }

    // 检查parent角色
    const parentRoles = await sequelize.query(
      'SELECT * FROM roles WHERE code = "parent"',
      { type: QueryTypes.SELECT }
    ) as any[];

    let parentRoleId;
    if (parentRoles.length === 0) {
      console.log('创建parent角色...');
      await sequelize.query(`
        INSERT INTO roles (name, code, description, status, created_at, updated_at)
        VALUES ('家长', 'parent', '学生家长角色', 1, NOW(), NOW())
      `);
      const newParentRole = await sequelize.query(
        'SELECT * FROM roles WHERE code = "parent"',
        { type: QueryTypes.SELECT }
      ) as any[];
      parentRoleId = newParentRole[0].id;
    } else {
      parentRoleId = parentRoles[0].id;
      console.log('parent角色已存在');
    }

    // 2. 检查并创建teacher用户
    console.log('👨‍🏫 检查teacher用户...');
    const teacherUsers = await sequelize.query(
      'SELECT * FROM users WHERE username = "teacher"',
      { type: QueryTypes.SELECT }
    ) as any[];

    let teacherUserId;
    if (teacherUsers.length === 0) {
      console.log('创建teacher用户...');
      const hashedPassword = await hashPassword('123456');
      await sequelize.query(`
        INSERT INTO users (username, password, email, real_name, phone, status, created_at, updated_at)
        VALUES ('teacher', ?, 'teacher@kindergarten.com', '李老师', '13800138003', 'active', NOW(), NOW())
      `, {
        replacements: [hashedPassword],
        type: QueryTypes.INSERT
      });

      const newTeacherUser = await sequelize.query(
        'SELECT * FROM users WHERE username = "teacher"',
        { type: QueryTypes.SELECT }
      ) as any[];
      teacherUserId = newTeacherUser[0].id;
    } else {
      teacherUserId = teacherUsers[0].id;
      console.log('teacher用户已存在');
    }

    // 3. 检查并创建parent用户
    console.log('👨‍👩‍👧‍👦 检查parent用户...');
    const parentUsers = await sequelize.query(
      'SELECT * FROM users WHERE username = "parent"',
      { type: QueryTypes.SELECT }
    ) as any[];

    let parentUserId;
    if (parentUsers.length === 0) {
      console.log('创建parent用户...');
      const hashedPassword = await hashPassword('123456');
      await sequelize.query(`
        INSERT INTO users (username, password, email, real_name, phone, status, created_at, updated_at)
        VALUES ('parent', ?, 'parent@kindergarten.com', '王家长', '13800138004', 'active', NOW(), NOW())
      `, {
        replacements: [hashedPassword],
        type: QueryTypes.INSERT
      });

      const newParentUser = await sequelize.query(
        'SELECT * FROM users WHERE username = "parent"',
        { type: QueryTypes.SELECT }
      ) as any[];
      parentUserId = newParentUser[0].id;
    } else {
      parentUserId = parentUsers[0].id;
      console.log('parent用户已存在');
    }

    // 4. 创建用户角色关联
    console.log('🔗 创建用户角色关联...');

    // teacher用户角色关联
    const teacherUserRoles = await sequelize.query(
      `SELECT * FROM user_roles WHERE user_id = ${teacherUserId} AND role_id = ${teacherRoleId}`,
      { type: QueryTypes.SELECT }
    ) as any[];

    if (teacherUserRoles.length === 0) {
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
        VALUES (${teacherUserId}, ${teacherRoleId}, NOW(), NOW())
      `);
      console.log('✅ 创建teacher用户角色关联');
    }

    // parent用户角色关联
    const parentUserRoles = await sequelize.query(
      `SELECT * FROM user_roles WHERE user_id = ${parentUserId} AND role_id = ${parentRoleId}`,
      { type: QueryTypes.SELECT }
    ) as any[];

    if (parentUserRoles.length === 0) {
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
        VALUES (${parentUserId}, ${parentRoleId}, NOW(), NOW())
      `);
      console.log('✅ 创建parent用户角色关联');
    }

    console.log('🎉 演示用户创建完成！');
    console.log('📝 登录信息：');
    console.log('  Teacher: username=teacher, password=123456');
    console.log('  Parent: username=parent, password=123456');
    
  } catch (error) {
    console.error('❌ 创建演示用户失败:', error);
    throw error;
  }
}

// 运行脚本
if (require.main === module) {
  createDemoUsers()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { createDemoUsers };
