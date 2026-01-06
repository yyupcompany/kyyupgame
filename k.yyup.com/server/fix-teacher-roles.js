const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function fixTeacherRoles() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 首先修复test_teacher用户的角色
    console.log('\n🔧 修复test_teacher用户角色...');
    const [updateResult] = await sequelize.query(`
      UPDATE users
      SET role = 'teacher', updated_at = NOW()
      WHERE username = 'test_teacher' AND (role IS NULL OR role = '')
    `);

    console.log(`✅ test_teacher用户角色修复完成，影响行数: ${updateResult[1]}`);

    // 2. 智能修复其他教师用户（基于用户名模式）
    console.log('\n🔧 智能修复其他教师用户角色...');
    const [updateOtherTeachers] = await sequelize.query(`
      UPDATE users
      SET role = 'teacher', updated_at = NOW()
      WHERE (role IS NULL OR role = '')
      AND (
        username LIKE 'teacher_%'
        OR username LIKE '%teacher%'
        OR username LIKE 'test_teacher%'
      )
    `);

    console.log(`✅ 其他教师用户角色修复完成，影响行数: ${updateOtherTeachers[1]}`);

    // 3. 验证修复结果
    console.log('\n📊 验证修复结果...');
    const [teacherResults] = await sequelize.query(`
      SELECT id, username, email, role, real_name, status
      FROM users
      WHERE role = 'teacher'
      ORDER BY id
    `);

    console.log('\n👨‍🏫 修复后的教师用户列表:');
    console.table(teacherResults);

    // 4. 再次检查角色分布统计
    const [roleStats] = await sequelize.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    console.log('\n📈 修复后的用户角色分布统计:');
    console.table(roleStats);

    // 5. 特别验证test_teacher用户
    const [testTeacherResult] = await sequelize.query(`
      SELECT id, username, email, role, real_name, status
      FROM users
      WHERE username = 'test_teacher'
    `);

    console.log('\n✅ test_teacher用户修复验证:');
    if (testTeacherResult.length > 0) {
      console.table(testTeacherResult);
      const user = testTeacherResult[0];
      if (user.role === 'teacher') {
        console.log('🎉 test_teacher用户角色修复成功！');
      } else {
        console.log('❌ test_teacher用户角色修复失败，当前角色:', user.role);
      }
    } else {
      console.log('❌ 未找到test_teacher用户');
    }

    console.log('\n🎯 修复任务完成！');

  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await sequelize.close();
  }
}

fixTeacherRoles();