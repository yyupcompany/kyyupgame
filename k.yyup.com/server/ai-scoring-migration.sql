-- AI评分系统数据库迁移脚本
-- 创建时间: 2025-11-01

USE kindergarten_management;

-- 创建文档AI评分记录表
CREATE TABLE IF NOT EXISTS `document_ai_scores` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `document_instance_id` INT NOT NULL COMMENT '文档实例ID',
  `document_template_id` INT NOT NULL COMMENT '文档模板ID',
  `template_type` VARCHAR(100) NOT NULL COMMENT '模板类型',
  `template_name` VARCHAR(200) NULL COMMENT '模板名称',
  `prompt_version` VARCHAR(50) NOT NULL DEFAULT 'v1.0' COMMENT '提示词版本',
  `ai_model` VARCHAR(100) NOT NULL DEFAULT 'doubao-1.6-flash' COMMENT 'AI模型',
  `score` DECIMAL(5,2) NULL COMMENT '评分(0-100)',
  `grade` ENUM('excellent', 'good', 'average', 'poor', 'unqualified') NULL COMMENT '等级',
  `analysis_result` JSON NOT NULL COMMENT 'AI分析结果',
  `category_scores` JSON NULL COMMENT '分类评分',
  `suggestions` JSON NULL COMMENT '改进建议',
  `risks` JSON NULL COMMENT '风险点',
  `highlights` JSON NULL COMMENT '亮点',
  `processing_time` INT NOT NULL DEFAULT 0 COMMENT '处理时长(ms)',
  `status` ENUM('completed', 'failed') NOT NULL DEFAULT 'completed' COMMENT '状态',
  `error_message` TEXT NULL COMMENT '错误信息',
  `created_by` INT NOT NULL COMMENT '创建人',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_document_instance` (`document_instance_id`, `created_at`),
  INDEX `idx_document_template` (`document_template_id`, `created_at`),
  INDEX `idx_created_by` (`created_by`, `created_at`),
  INDEX `idx_template_type` (`template_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档AI评分记录表';

-- 验证表创建
SELECT 'AI评分表创建成功' AS status;

