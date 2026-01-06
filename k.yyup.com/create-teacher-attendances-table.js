import { Sequelize, DataTypes } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log,
});

async function createTeacherAttendancesTable() {
  try {
    console.log('🔍 正在连接数据库...\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    console.log('📋 开始创建teacher_attendances表...\n');
    
    // 创建teacher_attendances表的SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS teacher_attendances (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '教师考勤记录ID',
        
        -- 关联字段
        teacher_id INT NOT NULL COMMENT '教师ID',
        user_id INT NOT NULL COMMENT '用户ID',
        kindergarten_id INT NOT NULL COMMENT '幼儿园ID',
        
        -- 考勤信息
        attendance_date DATE NOT NULL COMMENT '考勤日期',
        status ENUM('present', 'absent', 'late', 'early_leave', 'sick_leave', 'personal_leave', 'excused') NOT NULL COMMENT '考勤状态',
        
        -- 时间记录
        check_in_time TIME NULL COMMENT '签到时间',
        check_out_time TIME NULL COMMENT '签退时间',
        work_duration INT NULL COMMENT '工作时长（分钟）',
        
        -- 请假信息
        leave_type ENUM('sick', 'personal', 'annual', 'maternity', 'paternity', 'bereavement', 'other') NULL COMMENT '请假类型',
        leave_reason VARCHAR(500) NULL COMMENT '请假原因',
        leave_start_time DATETIME NULL COMMENT '请假开始时间',
        leave_end_time DATETIME NULL COMMENT '请假结束时间',
        
        -- 备注信息
        notes TEXT NULL COMMENT '备注',
        
        -- 操作信息
        recorded_by INT NULL COMMENT '记录人ID',
        recorded_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
        updated_by INT NULL COMMENT '更新人ID',
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        -- 审核信息
        is_approved TINYINT(1) DEFAULT 0 COMMENT '是否已审核',
        approved_by INT NULL COMMENT '审核人ID',
        approved_at TIMESTAMP NULL COMMENT '审核时间',
        approval_notes VARCHAR(500) NULL COMMENT '审核备注',
        
        -- 软删除
        deleted_at TIMESTAMP NULL COMMENT '删除时间',
        
        -- 时间戳
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        
        -- 外键约束
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        
        -- 索引
        INDEX idx_teacher_date (teacher_id, attendance_date),
        INDEX idx_user_date (user_id, attendance_date),
        INDEX idx_kindergarten_date (kindergarten_id, attendance_date),
        INDEX idx_status (status),
        INDEX idx_date (attendance_date),
        
        -- 唯一索引：确保一天只有一条记录
        UNIQUE INDEX uk_teacher_date (teacher_id, attendance_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师考勤记录表';
    `;
    
    await sequelize.query(createTableSQL);
    
    console.log('✅ teacher_attendances表创建成功！\n');
    
    // 验证表是否创建成功
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'teacher_attendances'
    `);
    
    if (tables.length > 0) {
      console.log('✅ 验证成功：teacher_attendances表已存在\n');
      
      // 显示表结构
      const [columns] = await sequelize.query(`DESCRIBE teacher_attendances`);
      
      console.log('📋 表结构:');
      console.log('='.repeat(80));
      columns.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // 显示索引
      const [indexes] = await sequelize.query(`SHOW INDEX FROM teacher_attendances`);
      if (indexes.length > 0) {
        console.log('\n📋 索引:');
        console.log('='.repeat(80));
        const indexMap = new Map();
        indexes.forEach(idx => {
          if (!indexMap.has(idx.Key_name)) {
            indexMap.set(idx.Key_name, {
              name: idx.Key_name,
              unique: idx.Non_unique === 0,
              columns: []
            });
          }
          indexMap.get(idx.Key_name).columns.push(idx.Column_name);
        });
        
        indexMap.forEach((idx, name) => {
          const type = idx.unique ? 'UNIQUE' : 'INDEX';
          console.log(`  - ${name} (${type}): ${idx.columns.join(', ')}`);
        });
      }
    } else {
      console.log('❌ 验证失败：teacher_attendances表不存在\n');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ 所有操作完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

createTeacherAttendancesTable();

