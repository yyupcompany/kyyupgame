-- 考勤功能数据库表创建脚本
-- 创建日期: 2025-01-09
-- 说明: 创建考勤记录表、考勤统计表、考勤修改日志表

-- USE kargerdensales;

-- 1. 创建考勤记录表 (attendances)
CREATE TABLE IF NOT EXISTS attendances (
  -- 主键
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '考勤记录ID',
  
  -- 关联字段
  student_id INT NOT NULL COMMENT '学生ID',
  class_id INT NOT NULL COMMENT '班级ID',
  kindergarten_id INT NOT NULL COMMENT '幼儿园ID',
  
  -- 考勤信息
  attendance_date DATE NOT NULL COMMENT '考勤日期',
  status ENUM(
    'present',        -- 出勤
    'absent',         -- 缺勤
    'late',           -- 迟到
    'early_leave',    -- 早退
    'sick_leave',     -- 病假
    'personal_leave', -- 事假
    'excused'         -- 请假（已批准）
  ) NOT NULL DEFAULT 'present' COMMENT '考勤状态',
  
  -- 时间记录
  check_in_time TIME COMMENT '签到时间',
  check_out_time TIME COMMENT '签退时间',
  
  -- 健康信息
  temperature DECIMAL(3,1) COMMENT '体温（℃）',
  health_status ENUM('normal', 'abnormal', 'quarantine') DEFAULT 'normal' COMMENT '健康状态',
  
  -- 备注信息
  notes TEXT COMMENT '备注说明',
  leave_reason VARCHAR(500) COMMENT '请假原因',
  
  -- 操作信息
  recorded_by INT NOT NULL COMMENT '记录人ID',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  updated_by INT COMMENT '最后修改人ID',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
  
  -- 审核信息
  is_approved BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
  approved_by INT COMMENT '审核人ID',
  approved_at TIMESTAMP NULL COMMENT '审核时间',
  
  -- 软删除
  deleted_at TIMESTAMP NULL COMMENT '删除时间',
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 外键约束
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  -- 索引
  INDEX idx_student_date (student_id, attendance_date),
  INDEX idx_class_date (class_id, attendance_date),
  INDEX idx_kindergarten_date (kindergarten_id, attendance_date),
  INDEX idx_status (status),
  INDEX idx_date (attendance_date),
  UNIQUE KEY uk_student_date (student_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生考勤记录表';

-- 2. 创建考勤统计表 (attendance_statistics)
CREATE TABLE IF NOT EXISTS attendance_statistics (
  -- 主键
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
  
  -- 统计维度
  stat_type ENUM('student', 'class', 'kindergarten') NOT NULL COMMENT '统计类型',
  stat_period ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL COMMENT '统计周期',
  
  -- 关联字段
  student_id INT COMMENT '学生ID（学生维度）',
  class_id INT COMMENT '班级ID（班级维度）',
  kindergarten_id INT NOT NULL COMMENT '幼儿园ID',
  
  -- 时间字段
  stat_date DATE NOT NULL COMMENT '统计日期',
  year INT NOT NULL COMMENT '年份',
  quarter INT COMMENT '季度（1-4）',
  month INT COMMENT '月份（1-12）',
  week INT COMMENT '周数',
  
  -- 统计数据
  total_days INT DEFAULT 0 COMMENT '总天数',
  present_days INT DEFAULT 0 COMMENT '出勤天数',
  absent_days INT DEFAULT 0 COMMENT '缺勤天数',
  late_count INT DEFAULT 0 COMMENT '迟到次数',
  early_leave_count INT DEFAULT 0 COMMENT '早退次数',
  sick_leave_days INT DEFAULT 0 COMMENT '病假天数',
  personal_leave_days INT DEFAULT 0 COMMENT '事假天数',
  excused_days INT DEFAULT 0 COMMENT '请假天数',
  
  -- 计算字段
  attendance_rate DECIMAL(5,2) COMMENT '出勤率（%）',
  punctuality_rate DECIMAL(5,2) COMMENT '准时率（%）',
  
  -- 健康统计
  abnormal_temperature_count INT DEFAULT 0 COMMENT '体温异常次数',
  avg_temperature DECIMAL(3,1) COMMENT '平均体温',
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 外键约束
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id) ON DELETE CASCADE,
  
  -- 索引
  INDEX idx_type_period (stat_type, stat_period),
  INDEX idx_student_date_stats (student_id, stat_date),
  INDEX idx_class_date_stats (class_id, stat_date),
  INDEX idx_kindergarten_date_stats (kindergarten_id, stat_date),
  INDEX idx_year_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤统计表';

-- 3. 创建考勤修改日志表 (attendance_change_logs)
CREATE TABLE IF NOT EXISTS attendance_change_logs (
  -- 主键
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  
  -- 关联字段
  attendance_id INT NOT NULL COMMENT '考勤记录ID',
  
  -- 修改信息
  change_type ENUM('create', 'update', 'delete', 'reset') NOT NULL COMMENT '修改类型',
  old_status VARCHAR(50) COMMENT '修改前状态',
  new_status VARCHAR(50) COMMENT '修改后状态',
  old_data JSON COMMENT '修改前完整数据',
  new_data JSON COMMENT '修改后完整数据',
  
  -- 操作信息
  changed_by INT NOT NULL COMMENT '修改人ID',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  change_reason VARCHAR(500) COMMENT '修改原因',
  
  -- 审核信息
  requires_approval BOOLEAN DEFAULT FALSE COMMENT '是否需要审核',
  is_approved BOOLEAN COMMENT '是否已审核',
  approved_by INT COMMENT '审核人ID',
  approved_at TIMESTAMP NULL COMMENT '审核时间',
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 外键约束
  FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  -- 索引
  INDEX idx_attendance (attendance_id),
  INDEX idx_changed_by (changed_by),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤修改日志表';

-- 显示创建结果
SELECT 'attendances表创建成功' AS result;
SELECT 'attendance_statistics表创建成功' AS result;
SELECT 'attendance_change_logs表创建成功' AS result;

