/**
 * 直接执行SQL创建 course_assignments 表
 * 用于修复教学中心500错误
 */
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5l57j',
  database: process.env.DB_NAME || 'kindergarten_db',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

async function createCourseAssignmentsTable() {
  try {
    console.log('🔄 连接到数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查表是否存在
    const [results] = await sequelize.query("SHOW TABLES LIKE 'course_assignments';");
    if (results.length > 0) {
      console.log('✅ course_assignments 表已存在');
      return;
    }

    console.log('🔄 创建 course_assignments 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS course_assignments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分配ID',
        course_id INT UNSIGNED NOT NULL COMMENT '课程ID',
        teacher_id INT UNSIGNED NOT NULL COMMENT '教师ID',
        class_id INT UNSIGNED NOT NULL COMMENT '班级ID',
        assigned_by INT UNSIGNED NOT NULL COMMENT '分配人ID',
        assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
        status ENUM('assigned', 'in_progress', 'completed', 'paused') NOT NULL DEFAULT 'assigned' COMMENT '分配状态',
        start_date DATE COMMENT '开始日期',
        expected_end_date DATE COMMENT '预期结束日期',
        actual_end_date DATE COMMENT '实际结束日期',
        notes TEXT COMMENT '备注',
        is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否有效',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_course_assignments_course_id (course_id),
        INDEX idx_course_assignments_teacher_id (teacher_id),
        INDEX idx_course_assignments_class_id (class_id),
        INDEX idx_course_assignments_assigned_by (assigned_by),
        INDEX idx_course_assignments_status (status),
        INDEX idx_course_assignments_is_active (is_active),
        UNIQUE INDEX idx_course_assignments_unique (course_id, teacher_id, class_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程分配表 - 建立课程与教师的分配关系';
    `);

    console.log('✅ course_assignments 表创建成功');

    // 记录到 SequelizeMeta
    await sequelize.query("INSERT INTO SequelizeMeta (name) VALUES ('20240101000001-create-course-assignments.ts');");

    console.log('✅ 迁移记录已添加到 SequelizeMeta');
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createCourseAssignmentsTable()
  .then(() => {
    console.log('🎉 迁移完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 迁移失败:', error);
    process.exit(1);
  });
