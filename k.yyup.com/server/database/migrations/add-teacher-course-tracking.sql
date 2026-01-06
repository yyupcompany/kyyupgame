-- 教师课程跟踪扩展
-- 目的: 支持教师跟踪管理多个课程的执行

-- 1. 教师-班级-课程关联表 (如果不存在)
CREATE TABLE IF NOT EXISTS teacher_class_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL COMMENT '教师ID',
  class_id INT NOT NULL COMMENT '班级ID',
  course_plan_id INT NOT NULL COMMENT '课程计划ID',
  brain_science_course_id INT NOT NULL COMMENT '脑科学课程ID',
  assigned_by INT COMMENT '分配人ID(园长/管理员)',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  status ENUM('assigned', 'in_progress', 'completed', 'paused') DEFAULT 'assigned' COMMENT '课程状态',
  start_date DATE COMMENT '开始日期',
  expected_end_date DATE COMMENT '预计结束日期',
  actual_end_date DATE COMMENT '实际结束日期',
  remarks TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY idx_teacher_class_course (teacher_id, class_id, course_plan_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_class (class_id),
  INDEX idx_course_plan (course_plan_id),
  INDEX idx_status (status),
  
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_plan_id) REFERENCES course_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (brain_science_course_id) REFERENCES brain_science_courses(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师-班级-课程关联表';

-- 2. 教师课程执行记录表
CREATE TABLE IF NOT EXISTS teacher_course_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_class_course_id INT NOT NULL COMMENT '教师课程关联ID',
  teacher_id INT NOT NULL COMMENT '教师ID',
  class_id INT NOT NULL COMMENT '班级ID',
  course_plan_id INT NOT NULL COMMENT '课程计划ID',
  lesson_number INT COMMENT '第几课',
  lesson_date DATE NOT NULL COMMENT '上课日期',
  lesson_duration INT COMMENT '课时(分钟)',
  attendance_count INT COMMENT '出勤人数',
  teaching_content TEXT COMMENT '教学内容',
  teaching_method VARCHAR(100) COMMENT '教学方法',
  teaching_effect ENUM('excellent', 'good', 'average', 'poor') COMMENT '教学效果',
  student_feedback TEXT COMMENT '学生反馈',
  difficulties TEXT COMMENT '遇到的困难',
  improvements TEXT COMMENT '改进建议',
  media_files JSON COMMENT '媒体文件(图片/视频)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_teacher_course (teacher_class_course_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_lesson_date (lesson_date),
  
  FOREIGN KEY (teacher_class_course_id) REFERENCES teacher_class_courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_plan_id) REFERENCES course_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师课程执行记录表';

-- 3. 扩展 course_progress 表 (添加教师关联)
-- 检查并添加字段（如果不存在）
SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_progress ADD COLUMN teacher_id INT COMMENT "负责教师ID"',
    'SELECT "teacher_id already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_progress'
    AND COLUMN_NAME = 'teacher_id'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_progress ADD COLUMN last_lesson_date DATE COMMENT "最后上课日期"',
    'SELECT "last_lesson_date already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_progress'
    AND COLUMN_NAME = 'last_lesson_date'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_progress ADD COLUMN total_lessons INT DEFAULT 0 COMMENT "总课时数"',
    'SELECT "total_lessons already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_progress'
    AND COLUMN_NAME = 'total_lessons'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_progress ADD COLUMN completed_lessons INT DEFAULT 0 COMMENT "已完成课时"',
    'SELECT "completed_lessons already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_progress'
    AND COLUMN_NAME = 'completed_lessons'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_progress ADD INDEX idx_teacher (teacher_id)',
    'SELECT "idx_teacher already exists" AS msg'
  ) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_progress'
    AND INDEX_NAME = 'idx_teacher'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

-- 4. 扩展 course_plans 表 (添加可见性控制)
SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_plans ADD COLUMN is_published BOOLEAN DEFAULT FALSE COMMENT "是否发布给教师"',
    'SELECT "is_published already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_plans'
    AND COLUMN_NAME = 'is_published'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_plans ADD COLUMN published_at TIMESTAMP NULL COMMENT "发布时间"',
    'SELECT "published_at already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_plans'
    AND COLUMN_NAME = 'published_at'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_plans ADD COLUMN published_by INT COMMENT "发布人ID"',
    'SELECT "published_by already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_plans'
    AND COLUMN_NAME = 'published_by'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_plans ADD COLUMN target_teachers JSON COMMENT "目标教师列表"',
    'SELECT "target_teachers already exists" AS msg'
  ) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_plans'
    AND COLUMN_NAME = 'target_teachers'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE course_plans ADD INDEX idx_published (is_published)',
    'SELECT "idx_published already exists" AS msg'
  ) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_plans'
    AND INDEX_NAME = 'idx_published'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

-- 5. 课程学生进度表 (可选 - 如需跟踪单个学生进度)
CREATE TABLE IF NOT EXISTS student_course_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL COMMENT '学生ID',
  class_id INT NOT NULL COMMENT '班级ID',
  course_plan_id INT NOT NULL COMMENT '课程计划ID',
  teacher_class_course_id INT COMMENT '教师课程关联ID',
  overall_progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '整体进度(%)',
  skill_assessments JSON COMMENT '技能评估',
  learning_records JSON COMMENT '学习记录',
  remarks TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY idx_student_course (student_id, course_plan_id),
  INDEX idx_student (student_id),
  INDEX idx_class (class_id),
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_plan_id) REFERENCES course_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_class_course_id) REFERENCES teacher_class_courses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生课程进度表';

-- 6. 创建视图 - 教师课程概览
CREATE OR REPLACE VIEW v_teacher_courses_overview AS
SELECT 
  tcc.id AS teacher_course_id,
  tcc.teacher_id,
  u.username AS teacher_name,
  tcc.class_id,
  c.name AS class_name,
  tcc.course_plan_id,
  tcc.brain_science_course_id,
  bsc.course_name,
  bsc.course_type,
  bsc.target_age_min,
  bsc.target_age_max,
  tcc.status,
  tcc.start_date,
  tcc.expected_end_date,
  tcc.actual_end_date,
  COALESCE(progress.completed_lessons, 0) AS completed_lessons,
  COALESCE(progress.total_lessons, 0) AS total_lessons,
  CASE 
    WHEN progress.total_lessons > 0 THEN 
      ROUND((progress.completed_lessons / progress.total_lessons) * 100, 2)
    ELSE 0 
  END AS progress_percentage,
  COUNT(DISTINCT tcr.id) AS total_records,
  tcc.assigned_at,
  tcc.created_at,
  tcc.updated_at
FROM teacher_class_courses tcc
JOIN users u ON tcc.teacher_id = u.id
JOIN classes c ON tcc.class_id = c.id
JOIN course_plans cp ON tcc.course_plan_id = cp.id
JOIN brain_science_courses bsc ON tcc.brain_science_course_id = bsc.id
LEFT JOIN course_progress progress ON 
  progress.course_plan_id = tcc.course_plan_id AND 
  progress.class_id = tcc.class_id
LEFT JOIN teacher_course_records tcr ON tcr.teacher_class_course_id = tcc.id
GROUP BY tcc.id;

-- 7. 创建索引优化查询
SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_course_progress_teacher_class ON course_progress(teacher_id, class_id, course_plan_id)',
    'SELECT "idx_course_progress_teacher_class already exists" AS msg'
  ) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_progress'
    AND INDEX_NAME = 'idx_course_progress_teacher_class'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @preparedStatement = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_teacher_records_date ON teacher_course_records(teacher_id, lesson_date)',
    'SELECT "idx_teacher_records_date already exists" AS msg'
  ) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'teacher_course_records'
    AND INDEX_NAME = 'idx_teacher_records_date'
);
PREPARE statement FROM @preparedStatement;
EXECUTE statement;
DEALLOCATE PREPARE statement;

-- 8. 初始数据同步 (将现有course_progress数据关联到教师)
-- 使用classes表的head_teacher_id
UPDATE course_progress cp
JOIN classes c ON cp.class_id = c.id
SET cp.teacher_id = c.head_teacher_id
WHERE cp.teacher_id IS NULL AND c.head_teacher_id IS NOT NULL;

COMMIT;
