-- =====================================================
-- 课程分配表迁移脚本
-- 创建 course_assignments 表用于关联课程与教师
-- 执行时间: 2026-01-08
-- =====================================================

-- 如果表已存在则先删除（仅用于开发环境）
DROP TABLE IF EXISTS `course_assignments`;

-- 创建课程分配表
CREATE TABLE `course_assignments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分配ID',
  `course_id` INT UNSIGNED NOT NULL COMMENT '课程ID',
  `teacher_id` INT UNSIGNED NOT NULL COMMENT '教师ID',
  `class_id` INT UNSIGNED NOT NULL COMMENT '班级ID',
  `assigned_by` INT UNSIGNED NOT NULL COMMENT '分配人ID',
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  `status` ENUM('assigned', 'in_progress', 'completed', 'paused') NOT NULL DEFAULT 'assigned' COMMENT '分配状态',
  `start_date` DATE DEFAULT NULL COMMENT '开始日期',
  `expected_end_date` DATE DEFAULT NULL COMMENT '预期结束日期',
  `actual_end_date` DATE DEFAULT NULL COMMENT '实际结束日期',
  `notes` TEXT DEFAULT NULL COMMENT '备注',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否有效',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  -- 主键
  PRIMARY KEY (`id`),

  -- 索引
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_teacher_id` (`teacher_id`),
  INDEX `idx_class_id` (`class_id`),
  INDEX `idx_assigned_by` (`assigned_by`),
  INDEX `idx_status` (`status`),
  INDEX `idx_is_active` (`is_active`),

  -- 唯一约束 - 防止重复分配
  UNIQUE INDEX `unique_assignment` (`course_id`, `teacher_id`, `class_id`),

  -- 外键约束
  CONSTRAINT `fk_assignment_course`
    FOREIGN KEY (`course_id`) REFERENCES `custom_courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `fk_assignment_teacher`
    FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `fk_assignment_class`
    FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `fk_assignment_assigned_by`
    FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='课程分配表 - 建立课程与教师的分配关系';

-- =====================================================
-- 添加示例数据（可选）
-- =====================================================

-- 示例：分配脑科学课程给教师
-- INSERT INTO `course_assignments`
--   (course_id, teacher_id, class_id, assigned_by, status, start_date, expected_end_date)
-- VALUES
--   (1, 5, 3, 1, 'in_progress', '2024-09-01', '2025-01-15'),
--   (2, 6, 4, 1, 'assigned', '2024-09-01', '2025-01-15');

-- =====================================================
-- 验证表创建
-- =====================================================

-- 查看表结构
-- DESCRIBE `course_assignments`;

-- 查看所有索引
-- SHOW INDEX FROM `course_assignments`;

SELECT '✅ 课程分配表创建成功！' AS result;
