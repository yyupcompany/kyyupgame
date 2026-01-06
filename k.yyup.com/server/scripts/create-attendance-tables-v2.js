/**
 * 创建考勤功能数据库表 (版本2 - 直接执行SQL)
 * 执行命令: node server/scripts/create-attendance-tables-v2.js
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 数据库配置（从环境变量读取）
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: console.log
  }
);

async function createTables() {
  try {
    console.log('🚀 开始创建考勤功能数据库表...\n');

    // 1. 创建attendances表
    console.log('📝 创建attendances表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS attendances (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '考勤记录ID',
        student_id INT NOT NULL COMMENT '学生ID',
        class_id INT NOT NULL COMMENT '班级ID',
        kindergarten_id INT NOT NULL COMMENT '幼儿园ID',
        attendance_date DATE NOT NULL COMMENT '考勤日期',
        status ENUM('present', 'absent', 'late', 'early_leave', 'sick_leave', 'personal_leave', 'excused') NOT NULL DEFAULT 'present' COMMENT '考勤状态',
        check_in_time TIME COMMENT '签到时间',
        check_out_time TIME COMMENT '签退时间',
        temperature DECIMAL(3,1) COMMENT '体温（℃）',
        health_status ENUM('normal', 'abnormal', 'quarantine') DEFAULT 'normal' COMMENT '健康状态',
        notes TEXT COMMENT '备注说明',
        leave_reason VARCHAR(500) COMMENT '请假原因',
        recorded_by INT NOT NULL COMMENT '记录人ID',
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
        updated_by INT COMMENT '最后修改人ID',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
        is_approved BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
        approved_by INT COMMENT '审核人ID',
        approved_at TIMESTAMP NULL COMMENT '审核时间',
        deleted_at TIMESTAMP NULL COMMENT '删除时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id),
        INDEX idx_student_date (student_id, attendance_date),
        INDEX idx_class_date (class_id, attendance_date),
        INDEX idx_kindergarten_date (kindergarten_id, attendance_date),
        INDEX idx_status (status),
        INDEX idx_date (attendance_date),
        UNIQUE KEY uk_student_date (student_id, attendance_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生考勤记录表'
    `);
    console.log('  ✓ attendances表创建成功\n');

    // 2. 创建attendance_statistics表
    console.log('📝 创建attendance_statistics表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS attendance_statistics (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
        stat_type ENUM('student', 'class', 'kindergarten') NOT NULL COMMENT '统计类型',
        stat_period ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL COMMENT '统计周期',
        student_id INT COMMENT '学生ID（学生维度）',
        class_id INT COMMENT '班级ID（班级维度）',
        kindergarten_id INT NOT NULL COMMENT '幼儿园ID',
        stat_date DATE NOT NULL COMMENT '统计日期',
        year INT NOT NULL COMMENT '年份',
        quarter INT COMMENT '季度（1-4）',
        month INT COMMENT '月份（1-12）',
        week INT COMMENT '周数',
        total_days INT DEFAULT 0 COMMENT '总天数',
        present_days INT DEFAULT 0 COMMENT '出勤天数',
        absent_days INT DEFAULT 0 COMMENT '缺勤天数',
        late_count INT DEFAULT 0 COMMENT '迟到次数',
        early_leave_count INT DEFAULT 0 COMMENT '早退次数',
        sick_leave_days INT DEFAULT 0 COMMENT '病假天数',
        personal_leave_days INT DEFAULT 0 COMMENT '事假天数',
        excused_days INT DEFAULT 0 COMMENT '请假天数',
        attendance_rate DECIMAL(5,2) COMMENT '出勤率（%）',
        punctuality_rate DECIMAL(5,2) COMMENT '准时率（%）',
        abnormal_temperature_count INT DEFAULT 0 COMMENT '体温异常次数',
        avg_temperature DECIMAL(3,1) COMMENT '平均体温',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id) ON DELETE CASCADE,
        INDEX idx_type_period (stat_type, stat_period),
        INDEX idx_student_date_stats (student_id, stat_date),
        INDEX idx_class_date_stats (class_id, stat_date),
        INDEX idx_kindergarten_date_stats (kindergarten_id, stat_date),
        INDEX idx_year_month (year, month)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤统计表'
    `);
    console.log('  ✓ attendance_statistics表创建成功\n');

    // 3. 创建attendance_change_logs表
    console.log('📝 创建attendance_change_logs表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS attendance_change_logs (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
        attendance_id INT NOT NULL COMMENT '考勤记录ID',
        change_type ENUM('create', 'update', 'delete', 'reset') NOT NULL COMMENT '修改类型',
        old_status VARCHAR(50) COMMENT '修改前状态',
        new_status VARCHAR(50) COMMENT '修改后状态',
        old_data JSON COMMENT '修改前完整数据',
        new_data JSON COMMENT '修改后完整数据',
        changed_by INT NOT NULL COMMENT '修改人ID',
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
        change_reason VARCHAR(500) COMMENT '修改原因',
        requires_approval BOOLEAN DEFAULT FALSE COMMENT '是否需要审核',
        is_approved BOOLEAN COMMENT '是否已审核',
        approved_by INT COMMENT '审核人ID',
        approved_at TIMESTAMP NULL COMMENT '审核时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id),
        INDEX idx_attendance (attendance_id),
        INDEX idx_changed_by (changed_by),
        INDEX idx_changed_at (changed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤修改日志表'
    `);
    console.log('  ✓ attendance_change_logs表创建成功\n');

    console.log('✅ 所有表创建成功！\n');

    // 验证表是否创建成功
    console.log('🔍 验证表结构...\n');
    
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_COMMENT, TABLE_ROWS
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'kargerdensales'}' 
      AND TABLE_NAME IN ('attendances', 'attendance_statistics', 'attendance_change_logs')
      ORDER BY TABLE_NAME
    `);

    console.log('📊 已创建的表:');
    if (tables.length === 0) {
      console.log('  ❌ 未找到考勤功能表！');
    } else {
      tables.forEach(table => {
        console.log(`  ✓ ${table.TABLE_NAME}`);
        console.log(`    说明: ${table.TABLE_COMMENT || '无'}`);
        console.log(`    行数: ${table.TABLE_ROWS || 0}`);
      });
    }

    console.log('\n🎉 考勤功能数据库表创建完成！');

  } catch (error) {
    console.error('\n❌ 创建表失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行创建
createTables();

