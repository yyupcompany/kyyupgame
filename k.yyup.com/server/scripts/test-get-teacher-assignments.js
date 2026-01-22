/**
 * 测试 getTeacherAssignments 方法
 * 直接使用 Sequelize 查询数据库
 */
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  database: process.env.DB_NAME || 'kargerdensales',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

async function testGetTeacherAssignments() {
  try {
    console.log('🔄 测试 getTeacherAssignments...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 测试查询 - 使用教师ID 124
    console.log('\n📊 执行查询...');
    const [assignments] = await sequelize.query(`
      SELECT id, course_id, teacher_id, class_id, status, is_active
      FROM course_assignments
      WHERE teacher_id = 124 AND is_active = 1
      LIMIT 10
    `);

    console.log('✅ 查询成功，返回记录数:', assignments.length);
    console.log('记录:', JSON.stringify(assignments, null, 2));

    // 测试 CourseAssignment 模型方法
    console.log('\n🔄 测试 CourseAssignment.findAll...');

    // 使用 Sequelize 的 model 来查询
    const CourseAssignment = sequelize.define('CourseAssignment', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      teacher_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      class_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      assigned_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      status: { type: Sequelize.ENUM('assigned', 'in_progress', 'completed', 'paused'), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
      tableName: 'course_assignments',
      timestamps: true
    });

    const records = await CourseAssignment.findAll({
      attributes: ['id', 'course_id', 'teacher_id', 'class_id', 'status', 'is_active'],
      where: { teacher_id: 124, is_active: true },
      limit: 10
    });

    console.log('✅ CourseAssignment.findAll 成功，返回记录数:', records.length);

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
}

testGetTeacherAssignments()
  .then(() => {
    console.log('\n🎉 测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 测试失败:', error);
    process.exit(1);
  });
