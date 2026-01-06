-- 督查中心功能数据表创建脚本
-- 执行日期: 2025-11-01
-- 说明: 手动执行此SQL脚本以创建检查记录和整改管理相关的表

USE kindergarten_system;

-- =====================================================
-- 1. 创建检查记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS `inspection_records` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `inspection_plan_id` INT NOT NULL COMMENT '关联的检查计划ID',
  `check_date` DATE NOT NULL COMMENT '实际检查日期',
  `checker_id` INT DEFAULT NULL COMMENT '检查人员ID',
  `checker_name` VARCHAR(100) DEFAULT NULL COMMENT '检查人员姓名',
  `total_score` DECIMAL(5, 2) DEFAULT 0 COMMENT '总分',
  `grade` VARCHAR(20) DEFAULT NULL COMMENT '等级：优秀/良好/合格/不合格',
  `summary` TEXT COMMENT '检查总结',
  `suggestions` TEXT COMMENT '改进建议',
  `attachments` JSON COMMENT '附件列表（照片、文档等）',
  `checker_signature` VARCHAR(500) DEFAULT NULL COMMENT '检查人签名（图片URL或base64）',
  `created_by` INT DEFAULT NULL COMMENT '创建人ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_inspection_plan_id` (`inspection_plan_id`),
  KEY `idx_check_date` (`check_date`),
  KEY `idx_grade` (`grade`),
  CONSTRAINT `fk_inspection_records_plan` FOREIGN KEY (`inspection_plan_id`) REFERENCES `inspection_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查记录表';

-- =====================================================
-- 2. 创建检查项目明细表
-- =====================================================
CREATE TABLE IF NOT EXISTS `inspection_record_items` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '检查项ID',
  `record_id` INT NOT NULL COMMENT '检查记录ID',
  `item_name` VARCHAR(200) NOT NULL COMMENT '检查项名称',
  `item_category` VARCHAR(100) DEFAULT NULL COMMENT '检查项分类',
  `status` ENUM('pass', 'warning', 'fail') NOT NULL DEFAULT 'pass' COMMENT '检查状态：pass-通过, warning-警告, fail-不通过',
  `score` DECIMAL(5, 2) DEFAULT NULL COMMENT '得分',
  `max_score` DECIMAL(5, 2) DEFAULT NULL COMMENT '满分',
  `problem_description` TEXT COMMENT '问题描述',
  `photos` JSON COMMENT '问题照片列表',
  `notes` TEXT COMMENT '备注',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_record_items_record` FOREIGN KEY (`record_id`) REFERENCES `inspection_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查项目明细表';

-- =====================================================
-- 3. 创建整改任务表
-- =====================================================
CREATE TABLE IF NOT EXISTS `inspection_rectifications` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '整改任务ID',
  `inspection_plan_id` INT NOT NULL COMMENT '关联的检查计划ID',
  `record_id` INT DEFAULT NULL COMMENT '关联的检查记录ID',
  `record_item_id` INT DEFAULT NULL COMMENT '关联的检查项ID',
  `problem_description` TEXT NOT NULL COMMENT '问题描述',
  `problem_severity` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium' COMMENT '问题严重程度',
  `rectification_measures` TEXT COMMENT '整改措施',
  `responsible_person_id` INT DEFAULT NULL COMMENT '责任人ID',
  `responsible_person_name` VARCHAR(100) DEFAULT NULL COMMENT '责任人姓名',
  `deadline` DATE DEFAULT NULL COMMENT '整改截止日期',
  `status` ENUM('pending', 'in_progress', 'completed', 'verified', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '整改状态',
  `progress` INT NOT NULL DEFAULT 0 COMMENT '整改进度 0-100',
  `completion_date` DATE DEFAULT NULL COMMENT '完成日期',
  `completion_description` TEXT COMMENT '完成情况说明',
  `completion_photos` JSON COMMENT '整改完成照片',
  `verifier_id` INT DEFAULT NULL COMMENT '验收人ID',
  `verifier_name` VARCHAR(100) DEFAULT NULL COMMENT '验收人姓名',
  `verification_date` DATE DEFAULT NULL COMMENT '验收日期',
  `verification_result` TEXT COMMENT '验收结果',
  `verification_status` ENUM('pass', 'fail', 'pending') DEFAULT NULL COMMENT '验收状态',
  `notes` TEXT COMMENT '备注',
  `created_by` INT DEFAULT NULL COMMENT '创建人ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_rectif_plan_id` (`inspection_plan_id`),
  KEY `idx_rectif_status` (`status`),
  KEY `idx_rectif_responsible` (`responsible_person_id`),
  KEY `idx_rectif_deadline` (`deadline`),
  CONSTRAINT `fk_rectifications_plan` FOREIGN KEY (`inspection_plan_id`) REFERENCES `inspection_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rectifications_record` FOREIGN KEY (`record_id`) REFERENCES `inspection_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rectifications_item` FOREIGN KEY (`record_item_id`) REFERENCES `inspection_record_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='整改任务表';

-- =====================================================
-- 4. 创建整改进度跟踪表
-- =====================================================
CREATE TABLE IF NOT EXISTS `rectification_progress_logs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `rectification_id` INT NOT NULL COMMENT '整改任务ID',
  `log_date` DATE NOT NULL COMMENT '日志日期',
  `progress` INT NOT NULL COMMENT '进度',
  `description` TEXT COMMENT '进度说明',
  `photos` JSON COMMENT '进度照片',
  `operator_id` INT DEFAULT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(100) DEFAULT NULL COMMENT '操作人姓名',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_progress_rectif_id` (`rectification_id`),
  CONSTRAINT `fk_progress_rectification` FOREIGN KEY (`rectification_id`) REFERENCES `inspection_rectifications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='整改进度跟踪表';

-- =====================================================
-- 验证表创建
-- =====================================================
SELECT 
  TABLE_NAME, 
  TABLE_COMMENT,
  CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'kindergarten_system' 
  AND TABLE_NAME IN (
    'inspection_records',
    'inspection_record_items', 
    'inspection_rectifications',
    'rectification_progress_logs'
  )
ORDER BY TABLE_NAME;

-- =====================================================
-- 查看表结构
-- =====================================================
SHOW CREATE TABLE inspection_records;
SHOW CREATE TABLE inspection_record_items;
SHOW CREATE TABLE inspection_rectifications;
SHOW CREATE TABLE rectification_progress_logs;

SELECT '✅ 督查中心数据表创建完成！' AS status;

