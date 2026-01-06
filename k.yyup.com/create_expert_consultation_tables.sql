-- 创建专家咨询系统相关表的SQL脚本

-- 创建专家咨询会话表
CREATE TABLE IF NOT EXISTS `expert_consultations` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` INT NOT NULL,
  `topic` VARCHAR(500) NOT NULL COMMENT '咨询主题',
  `description` TEXT NOT NULL COMMENT '问题描述',
  `urgency` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT '紧急程度',
  `expected_experts` JSON DEFAULT ('[]') COMMENT '期望的专家类型列表',
  `context` JSON DEFAULT ('{}') COMMENT '背景信息和上下文',
  `status` ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '会话状态',
  `progress_percentage` INT DEFAULT 0 COMMENT '进度百分比',
  `total_experts` INT DEFAULT 0 COMMENT '参与专家总数',
  `current_round` INT DEFAULT 1 COMMENT '当前轮次',
  `max_rounds` INT DEFAULT 5 COMMENT '最大轮次',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专家咨询会话表';

-- 创建专家发言记录表
CREATE TABLE IF NOT EXISTS `expert_speeches` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `consultation_id` VARCHAR(36) NOT NULL COMMENT '咨询会话ID',
  `expert_type` VARCHAR(100) NOT NULL COMMENT '专家类型',
  `expert_name` VARCHAR(200) NOT NULL COMMENT '专家名称',
  `content` TEXT NOT NULL COMMENT '发言内容',
  `round` INT NOT NULL DEFAULT 1 COMMENT '发言轮次',
  `order` INT NOT NULL COMMENT '在该轮次中的发言顺序',
  `confidence` FLOAT DEFAULT 0.8 COMMENT '发言置信度',
  `keywords` JSON DEFAULT ('[]') COMMENT '关键词标签',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`consultation_id`) REFERENCES `expert_consultations`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专家发言记录表';

-- 创建行动计划表
CREATE TABLE IF NOT EXISTS `action_plans` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `consultation_id` VARCHAR(36) NOT NULL COMMENT '咨询会话ID',
  `plan_type` ENUM('immediate', 'short-term', 'long-term') NOT NULL COMMENT '计划类型',
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '优先级',
  `title` VARCHAR(500) NOT NULL COMMENT '计划标题',
  `description` TEXT NOT NULL COMMENT '计划描述',
  `timeline` VARCHAR(200) NOT NULL COMMENT '时间规划',
  `resources` JSON DEFAULT ('[]') COMMENT '所需资源',
  `constraints` JSON DEFAULT ('[]') COMMENT '约束条件',
  `expected_outcome` TEXT COMMENT '预期结果',
  `success_metrics` JSON DEFAULT ('[]') COMMENT '成功指标',
  `status` ENUM('pending', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '执行状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`consultation_id`) REFERENCES `expert_consultations`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行动计划表';

-- 创建咨询汇总表
CREATE TABLE IF NOT EXISTS `consultation_summaries` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `consultation_id` VARCHAR(36) NOT NULL UNIQUE COMMENT '咨询会话ID',
  `executive_summary` TEXT NOT NULL COMMENT '执行摘要',
  `key_insights` JSON DEFAULT ('[]') COMMENT '关键洞察',
  `consensus_points` JSON DEFAULT ('[]') COMMENT '一致观点',
  `conflicting_views` JSON DEFAULT ('[]') COMMENT '分歧观点',
  `recommendations` JSON DEFAULT ('[]') COMMENT '建议事项',
  `next_steps` JSON DEFAULT ('[]') COMMENT '后续步骤',
  `participating_experts` JSON DEFAULT ('[]') COMMENT '参与专家',
  `confidence_score` FLOAT DEFAULT 0.8 COMMENT '整体置信度',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`consultation_id`) REFERENCES `expert_consultations`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询汇总表';

-- 创建索引
CREATE INDEX `expert_consultations_user_id_idx` ON `expert_consultations` (`user_id`);
CREATE INDEX `expert_consultations_status_idx` ON `expert_consultations` (`status`);
CREATE INDEX `expert_consultations_urgency_idx` ON `expert_consultations` (`urgency`);
CREATE INDEX `expert_consultations_created_at_idx` ON `expert_consultations` (`created_at`);

CREATE INDEX `expert_speeches_consultation_id_idx` ON `expert_speeches` (`consultation_id`);
CREATE INDEX `expert_speeches_round_order_idx` ON `expert_speeches` (`round`, `order`);
CREATE INDEX `expert_speeches_expert_type_idx` ON `expert_speeches` (`expert_type`);

CREATE INDEX `action_plans_consultation_id_idx` ON `action_plans` (`consultation_id`);
CREATE INDEX `action_plans_plan_type_idx` ON `action_plans` (`plan_type`);
CREATE INDEX `action_plans_priority_idx` ON `action_plans` (`priority`);
CREATE INDEX `action_plans_status_idx` ON `action_plans` (`status`);

CREATE INDEX `consultation_summaries_consultation_id_idx` ON `consultation_summaries` (`consultation_id`);
CREATE INDEX `consultation_summaries_confidence_score_idx` ON `consultation_summaries` (`confidence_score`);
