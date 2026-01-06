const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: console.log
  }
);

const createTableSQL = `
CREATE TABLE IF NOT EXISTS \`teacher_attendances\` (
  \`id\` INT NOT NULL AUTO_INCREMENT COMMENT '教师考勤记录ID',
  \`teacher_id\` INT NOT NULL COMMENT '教师ID',
  \`user_id\` INT NOT NULL COMMENT '用户ID',
  \`kindergarten_id\` INT NOT NULL COMMENT '幼儿园ID',
  \`attendance_date\` DATE NOT NULL COMMENT '考勤日期',
  \`status\` ENUM('present', 'absent', 'late', 'early_leave', 'leave') NOT NULL DEFAULT 'present' COMMENT '考勤状态',
  \`check_in_time\` TIME NULL COMMENT '签到时间',
  \`check_out_time\` TIME NULL COMMENT '签退时间',
  \`work_duration\` INT NULL COMMENT '工作时长（分钟）',
  \`leave_type\` ENUM('sick', 'personal', 'annual', 'maternity', 'other') NULL COMMENT '请假类型',
  \`leave_reason\` TEXT NULL COMMENT '请假原因',
  \`leave_start_time\` DATETIME NULL COMMENT '请假开始时间',
  \`leave_end_time\` DATETIME NULL COMMENT '请假结束时间',
  \`notes\` TEXT NULL COMMENT '备注说明',
  \`recorded_by\` INT NULL COMMENT '记录人ID（自己打卡时为空）',
  \`recorded_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  \`updated_by\` INT NULL COMMENT '最后修改人ID',
  \`is_approved\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否已审核（打卡默认通过，请假需要审核）',
  \`approved_by\` INT NULL COMMENT '审核人ID',
  \`approved_at\` DATETIME NULL COMMENT '审核时间',
  \`approval_notes\` TEXT NULL COMMENT '审核备注',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  \`deleted_at\` DATETIME NULL COMMENT '删除时间（软删除）',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_teacher_date\` (\`teacher_id\`, \`attendance_date\`),
  KEY \`idx_teacher_date\` (\`teacher_id\`, \`attendance_date\`),
  KEY \`idx_user_date\` (\`user_id\`, \`attendance_date\`),
  KEY \`idx_kindergarten_date\` (\`kindergarten_id\`, \`attendance_date\`),
  KEY \`idx_status\` (\`status\`),
  KEY \`idx_date\` (\`attendance_date\`),
  CONSTRAINT \`fk_teacher_attendance_teacher\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_teacher_attendance_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_teacher_attendance_kindergarten\` FOREIGN KEY (\`kindergarten_id\`) REFERENCES \`kindergartens\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_teacher_attendance_recorder\` FOREIGN KEY (\`recorded_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT \`fk_teacher_attendance_updater\` FOREIGN KEY (\`updated_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT \`fk_teacher_attendance_approver\` FOREIGN KEY (\`approved_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师考勤记录表';
`;

async function createTable() {
  try {
    console.log('🔄 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('🔄 正在创建教师考勤表...');
    await sequelize.query(createTableSQL);
    console.log('✅ 教师考勤表创建成功');

    console.log('🔄 正在验证表结构...');
    const [results] = await sequelize.query('DESCRIBE teacher_attendances');
    console.log('✅ 表结构验证成功:');
    console.table(results);

  } catch (error) {
    console.error('❌ 创建表失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('✅ 数据库连接已关闭');
  }
}

createTable();

