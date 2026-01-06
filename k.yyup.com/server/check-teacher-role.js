const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function checkTeacherRole() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查询users表中的教师用户
    const [results, metadata] = await sequelize.query(`
      SELECT id, username, email, role, real_name, status, created_at, updated_at
      FROM users
      WHERE username LIKE '%teacher%' OR role LIKE '%teacher%'
      ORDER BY id
    `);

    console.log('\n📋 用户表中包含"teacher"的记录:');
    console.table(results);

    // 查询所有用户的role字段分布
    const [roleStats] = await sequelize.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    console.log('\n📊 用户角色分布统计:');
    console.table(roleStats);

    // 检查test_teacher具体用户
    const [testTeacher] = await sequelize.query(`
      SELECT id, username, email, role, real_name, status
      FROM users
      WHERE username = 'test_teacher'
    `);

    console.log('\n👨‍🏫 test_teacher用户详情:');
    if (testTeacher.length > 0) {
      console.table(testTeacher);
    } else {
      console.log('❌ 未找到test_teacher用户');
    }

  } catch (error) {
    console.error('❌ 数据库查询失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkTeacherRole();