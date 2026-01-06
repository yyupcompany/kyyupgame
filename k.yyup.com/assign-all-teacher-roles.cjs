/**
 * 为所有教师测试用户分配teacher角色
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

async function assignAllTeacherRoles() {
  try {
    console.log('🔧 开始为所有教师测试用户分配角色...\n');

    // 1. 查找所有可能的教师用户
    const [userResults] = await sequelize.query(`
      SELECT id, username, name, email FROM users
      WHERE (username LIKE '%teacher%' OR name LIKE '%teacher%' OR username LIKE '%教师%' OR name LIKE '%教师%')
      AND deleted_at IS NULL
      ORDER BY username
    `);

    console.log(`📋 找到 ${userResults.length} 个可能的教师用户:`);
    userResults.forEach(user => {
      console.log(`  - ${user.username} (${user.name || '无姓名'}) - ID: ${user.id}`);
    });

    if (userResults.length === 0) {
      console.log('⚠️  未找到任何教师用户');
      return;
    }

    // 2. 查找teacher角色
    const [roleResults] = await sequelize.query(`
      SELECT id, code, name FROM roles
      WHERE code = 'teacher' AND deleted_at IS NULL
    `);

    if (roleResults.length === 0) {
      console.log('❌ 未找到teacher角色');
      return;
    }

    const teacherRole = roleResults[0];
    console.log(`\n✅ 找到teacher角色: ${teacherRole.name} (ID: ${teacherRole.id})`);

    // 3. 为每个教师用户分配角色
    let assignedCount = 0;
    let skippedCount = 0;

    for (const user of userResults) {
      // 检查是否已存在用户角色关联
      const [existingRelation] = await sequelize.query(`
        SELECT id FROM user_roles
        WHERE user_id = :userId AND role_id = :roleId AND deleted_at IS NULL
      `, {
        replacements: { userId: user.id, roleId: teacherRole.id }
      });

      if (existingRelation.length > 0) {
        console.log(`⚠️  用户 ${user.username} 已分配teacher角色，跳过`);
        skippedCount++;
      } else {
        // 分配角色
        await sequelize.query(`
          INSERT INTO user_roles (user_id, role_id, grantor_id, created_at, updated_at)
          VALUES (:userId, :roleId, 1, NOW(), NOW())
        `, {
          replacements: { userId: user.id, roleId: teacherRole.id }
        });

        console.log(`✅ 成功为 ${user.username} 分配teacher角色`);
        assignedCount++;
      }
    }

    // 4. 验证分配结果
    const [verifyResults] = await sequelize.query(`
      SELECT u.username, u.name, r.code as role_code, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE (u.username LIKE '%teacher%' OR u.name LIKE '%teacher%' OR u.username LIKE '%教师%' OR u.name LIKE '%教师%')
      AND u.deleted_at IS NULL
      AND ur.deleted_at IS NULL
      ORDER BY u.username
    `);

    console.log('\n📋 分配结果验证:');
    verifyResults.forEach(row => {
      console.log(`用户: ${row.username} -> 角色: ${row.role_code || '无角色'} (${row.role_name || '无'})`);
    });

    console.log(`\n🎉 角色分配完成！`);
    console.log(`✅ 新分配: ${assignedCount} 个用户`);
    console.log(`⚠️  跳过: ${skippedCount} 个用户（已存在）`);
    console.log(`📊 总计: ${assignedCount + skippedCount} 个教师用户现在拥有teacher角色`);

  } catch (error) {
    console.error('❌ 分配失败:', error);
  } finally {
    await sequelize.close();
  }
}

assignAllTeacherRoles();