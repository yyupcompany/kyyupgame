/**
 * 为test_teacher用户分配teacher角色
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// 使用server目录的数据库连接
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

async function fixTeacherUserRole() {
  try {
    console.log('🔧 开始修复test_teacher用户角色...\n');

    // 1. 查找test_teacher用户
    const [userResults] = await sequelize.query(`
      SELECT id, username, name FROM users
      WHERE username = 'test_teacher' AND deleted_at IS NULL
    `);

    if (userResults.length === 0) {
      console.log('❌ 未找到test_teacher用户');
      return;
    }

    const user = userResults[0];
    console.log(`✅ 找到用户: ${user.username} (ID: ${user.id})`);

    // 2. 查找teacher角色
    const [roleResults] = await sequelize.query(`
      SELECT id, code, name FROM roles
      WHERE code = 'teacher' AND deleted_at IS NULL
    `);

    if (roleResults.length === 0) {
      console.log('❌ 未找到teacher角色');
      return;
    }

    const role = roleResults[0];
    console.log(`✅ 找到角色: ${role.code} (${role.name}, ID: ${role.id})`);

    // 3. 检查是否已存在用户角色关联
    const [existingRelation] = await sequelize.query(`
      SELECT id FROM user_roles
      WHERE user_id = :userId AND role_id = :roleId AND deleted_at IS NULL
    `, {
      replacements: { userId: user.id, roleId: role.id }
    });

    if (existingRelation.length > 0) {
      console.log('⚠️  用户已分配teacher角色，跳过');
    } else {
      // 4. 分配角色
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id, grantor_id, created_at, updated_at)
        VALUES (:userId, :roleId, 1, NOW(), NOW())
      `, {
        replacements: { userId: user.id, roleId: role.id }
      });

      console.log('✅ 成功为test_teacher分配teacher角色');
    }

    // 5. 验证分配结果
    const [verifyResults] = await sequelize.query(`
      SELECT u.username, u.name, r.code as role_code, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = 'test_teacher' AND u.deleted_at IS NULL AND ur.deleted_at IS NULL
    `);

    console.log('\n📋 分配结果:');
    verifyResults.forEach(row => {
      console.log(`用户: ${row.username} -> 角色: ${row.role_code} (${row.role_name})`);
    });

    console.log('\n🎉 角色分配完成！现在test_teacher用户应该可以访问教师菜单了。');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await sequelize.close();
  }
}

fixTeacherUserRole();