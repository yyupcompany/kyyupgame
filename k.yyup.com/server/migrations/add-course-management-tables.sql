-- =====================================================
-- 课程管理表迁移脚本
-- 创建 custom_courses, course_contents, course_schedules, course_assignments 表
-- 执行时间: 2026-01-08
-- =====================================================

-- 如果表已存在则先删除（仅用于开发环境）
DROP TABLE IF EXISTS `course_assignments`;
DROP TABLE IF EXISTS `course_schedules`;
DROP TABLE IF EXISTS `course_contents`;
DROP TABLE IF EXISTS `custom_courses`;

-- =====================================================
-- 1. 创建自定义课程表
-- =====================================================
CREATE TABLE `custom_courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '课程ID',
  `course_name` VARCHAR(200) NOT NULL COMMENT '课程名称',
  `course_description` TEXT DEFAULT NULL COMMENT '课程描述',
  `course_type` ENUM('brain_science', 'custom', 'theme') NOT NULL DEFAULT 'custom' COMMENT '课程类型',
  `age_group` VARCHAR(20) NOT NULL COMMENT '年龄组 (3-4, 4-5, 5-6, 3-6)',
  `semester` VARCHAR(20) DEFAULT NULL COMMENT '学期',
  `academic_year` VARCHAR(20) DEFAULT NULL COMMENT '学年',
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT '状态',
  `thumbnail_url` VARCHAR(500) DEFAULT NULL COMMENT '封面图片',
  `progress_config` JSON DEFAULT NULL COMMENT '四进度配置',
  `objectives` TEXT DEFAULT NULL COMMENT '课程目标',
  `target_class_type` VARCHAR(100) DEFAULT NULL COMMENT '适用班级类型',
  `total_sessions` INT DEFAULT NULL COMMENT '总课时数',
  `session_duration` INT DEFAULT NULL COMMENT '每节课时长(分钟)',
  `created_by` INT UNSIGNED NOT NULL COMMENT '创建人ID',
  `kindergarten_id` INT UNSIGNED DEFAULT NULL COMMENT '幼儿园ID',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否有效',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`id`),
  INDEX `idx_course_type` (`course_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_age_group` (`age_group`),
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='自定义课程表';

-- =====================================================
-- 2. 创建课程内容表
-- =====================================================
CREATE TABLE `course_contents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '内容ID',
  `course_id` INT UNSIGNED NOT NULL COMMENT '课程ID',
  `content_type` ENUM('text', 'image', 'video', 'interactive', 'document') NOT NULL DEFAULT 'text' COMMENT '内容类型',
  `content_title` VARCHAR(200) NOT NULL COMMENT '内容标题',
  `content_data` JSON NOT NULL COMMENT '内容数据',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `duration_minutes` INT DEFAULT NULL COMMENT '时长(分钟)',
  `is_required` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否必学',
  `teaching_notes` TEXT DEFAULT NULL COMMENT '教学备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`id`),
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_content_type` (`content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='课程内容表';

-- =====================================================
-- 3. 创建课程排期表
-- =====================================================
CREATE TABLE `course_schedules` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '排期ID',
  `course_id` INT UNSIGNED NOT NULL COMMENT '课程ID',
  `class_id` INT UNSIGNED NOT NULL COMMENT '班级ID',
  `teacher_id` INT UNSIGNED DEFAULT NULL COMMENT '教师ID',
  `planned_start_date` DATE NOT NULL COMMENT '计划开始日期',
  `planned_end_date` DATE NOT NULL COMMENT '计划结束日期',
  `actual_start_date` DATE DEFAULT NULL COMMENT '实际开始日期',
  `actual_end_date` DATE DEFAULT NULL COMMENT '实际结束日期',
  `schedule_config` JSON DEFAULT NULL COMMENT '排课时间配置',
  `schedule_status` ENUM('pending', 'in_progress', 'completed', 'delayed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '排期状态',
  `delay_days` INT NOT NULL DEFAULT 0 COMMENT '延期天数',
  `delay_reason` TEXT DEFAULT NULL COMMENT '延期原因',
  `completed_sessions` INT NOT NULL DEFAULT 0 COMMENT '已完成课时',
  `total_sessions` INT NOT NULL DEFAULT 0 COMMENT '总课时数',
  `alert_level` ENUM('none', 'warning', 'critical') NOT NULL DEFAULT 'none' COMMENT '告警级别',
  `alert_sent` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已发送告警',
  `teacher_confirmed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '教师是否确认',
  `notes` TEXT DEFAULT NULL COMMENT '备注',
  `created_by` INT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`id`),
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_class_id` (`class_id`),
  INDEX `idx_teacher_id` (`teacher_id`),
  INDEX `idx_schedule_status` (`schedule_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='课程排期表';

-- =====================================================
-- 4. 创建课程分配表
-- =====================================================
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

  PRIMARY KEY (`id`),
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_teacher_id` (`teacher_id`),
  INDEX `idx_class_id` (`class_id`),
  INDEX `idx_status` (`status`),
  UNIQUE INDEX `unique_assignment` (`course_id`, `teacher_id`, `class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='课程分配表 - 建立课程与教师的分配关系';

-- =====================================================
-- 5. 添加示例数据
-- =====================================================

-- 示例课程
INSERT INTO `custom_courses` (course_name, course_description, course_type, age_group, semester, academic_year, status, objectives, total_sessions, session_duration, created_by)
VALUES
('脑科学基础课程', '培养儿童大脑发育的基础课程', 'brain_science', '3-6', '上学期', '2024-2025', 'published', '促进儿童大脑发育，提升认知能力', 16, 30, 1),
('创意绘画课程', '培养儿童创造力和艺术表现力', 'custom', '3-4', '上学期', '2024-2025', 'published', '培养创造力和艺术表达', 12, 45, 1),
('户外运动课程', '增强体质，培养运动习惯', 'custom', '4-5', '上学期', '2024-2025', 'published', '增强体质，培养运动习惯', 20, 40, 1);

-- 示例内容
INSERT INTO `course_contents` (course_id, content_type, content_title, content_data, sort_order, duration_minutes, is_required)
VALUES
(1, 'video', '大脑发育基础知识', '{"video_url": "https://example.com/video1.mp4", "video_cover": "https://example.com/cover1.jpg"}', 1, 15, 1),
(1, 'image', '大脑结构图解', '{"image_urls": ["https://example.com/image1.jpg"]}', 2, 10, 1),
(1, 'text', '教学指导', '{"text": "本课程旨在通过游戏和互动活动促进儿童大脑发育。"}', 3, 5, 1);

-- =====================================================
-- 验证表创建
-- =====================================================
SELECT '✅ 课程管理表创建成功！' AS result;

-- 验证数据
SELECT '📚 课程数量:' AS info, COUNT(*) AS count FROM custom_courses;
SELECT '📄 内容数量:' AS info, COUNT(*) AS count FROM course_contents;
