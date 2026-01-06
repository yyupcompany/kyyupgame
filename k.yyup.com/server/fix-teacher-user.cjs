/**
 * 修复教师测试用户
 */

const { Sequelize, QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false
  }
);

async function fixTeacherUser() {
  console.log('🔧 开始修复教师测试用户...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查找教师角色
    const teacherRole = await sequelize.query(
      `SELECT id FROM roles WHERE code = 'teacher' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!teacherRole || teacherRole.length === 0) {
      console.log('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = teacherRole[0].id;
    console.log(`✅ 教师角色ID: ${teacherRoleId}\n`);

    // 2. 检查 teacher@test.com 用户
    const existingUser = await sequelize.query(
      `SELECT id, username, email, role FROM users WHERE email = 'teacher@test.com' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    let userId;

    if (existingUser && existingUser.length > 0) {
      userId = existingUser[0].id;
      console.log(`✅ 找到现有用户: ${existingUser[0].email} (ID: ${userId})`);
      console.log(`   当前角色字段: ${existingUser[0].role}`);
      
      // 更新用户的role字段为teacher
      await sequelize.query(
        `UPDATE users SET role = 'teacher' WHERE id = ?`,
        { replacements: [userId] }
      );
      console.log('   ✅ 已更新用户role字段为teacher\n');
      
    } else {
      // 创建新用户
      console.log('创建新的教师测试用户...');
      
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      await sequelize.query(`
        INSERT INTO users (username, email, password, role, status, created_at, updated_at)
        VALUES ('teacher_test', 'teacher@test.com', ?, 'teacher', 1, NOW(), NOW())
      `, { replacements: [hashedPassword] });
      
      const newUser = await sequelize.query(
        `SELECT id FROM users WHERE email = 'teacher@test.com' LIMIT 1`,
        { type: QueryTypes.SELECT }
      );
      
      userId = newUser[0].id;
      console.log(`   ✅ 已创建用户 (ID: ${userId})\n`);
    }

    // 3. 检查用户角色关联
    const userRole = await sequelize.query(
      `SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?`,
      { replacements: [userId, teacherRoleId], type: QueryTypes.SELECT }
    );

    if (!userRole || userRole.length === 0) {
      // 添加角色关联
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id, is_primary, created_at, updated_at)
        VALUES (?, ?, 1, NOW(), NOW())
      `, { replacements: [userId, teacherRoleId] });
      
      console.log('✅ 已添加用户角色关联\n');
    } else {
      console.log('✅ 用户角色关联已存在\n');
    }

    // 4. 验证配置
    console.log('📋 验证用户配置...');
    
    const userInfo = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role as user_role,
        r.name as role_name,
        r.code as role_code
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'teacher@test.com'
    `, { type: QueryTypes.SELECT });

    console.log('\n用户信息:');
    userInfo.forEach(info => {
      console.log(`   用户名: ${info.username}`);
      console.log(`   邮箱: ${info.email}`);
      console.log(`   用户role字段: ${info.user_role}`);
      console.log(`   关联角色: ${info.role_name} (${info.role_code})`);
    });

    // 5. 检查权限
    const permissions = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.code LIKE 'TEACHER_CUSTOMER_TRACKING%'
    `, { replacements: [teacherRoleId], type: QueryTypes.SELECT });

    console.log(`\n✅ 教师角色拥有 ${permissions[0].count} 个客户跟踪权限`);

    console.log('\n✅ 教师用户配置完成！');
    console.log('\n📝 登录信息:');
    console.log('   邮箱: teacher@test.com');
    console.log('   密码: 123456');
    console.log('   角色: 教师');

  } catch (error) {
    console.error('❌ 配置失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行
fixTeacherUser()
  .then(() => {
    console.log('\n🎉 完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  });

