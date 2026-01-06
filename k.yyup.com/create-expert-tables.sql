-- 创建专家咨询表的SQL脚本

-- 创建专家咨询会话表
CREATE TABLE IF NOT EXISTS `expert_consultations` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
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
  PRIMARY KEY (`id`),
  INDEX `expert_consultations_user_id_idx` (`user_id`),
  INDEX `expert_consultations_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专家咨询会话表';

-- 创建专家发言记录表
CREATE TABLE IF NOT EXISTS `expert_speeches` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `consultation_id` VARCHAR(36) NOT NULL,
  `expert_type` VARCHAR(50) NOT NULL COMMENT '专家类型',
  `expert_name` VARCHAR(100) NOT NULL COMMENT '专家姓名',
  `content` TEXT NOT NULL COMMENT '发言内容',
  `round` INT NOT NULL COMMENT '发言轮次',
  `order` INT NOT NULL COMMENT '发言顺序',
  `confidence` DECIMAL(3,2) DEFAULT 0.80 COMMENT '置信度',
  `keywords` JSON DEFAULT ('[]') COMMENT '关键词',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `expert_speeches_consultation_id_idx` (`consultation_id`),
  INDEX `expert_speeches_expert_type_idx` (`expert_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专家发言记录表';

-- 创建行动计划表
CREATE TABLE IF NOT EXISTS `action_plans` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `consultation_id` VARCHAR(36) NOT NULL,
  `summary` TEXT NOT NULL COMMENT '计划摘要',
  `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT '优先级',
  `estimated_duration` VARCHAR(100) COMMENT '预计执行时间',
  `estimated_cost` DECIMAL(10,2) COMMENT '预计成本',
  `success_metrics` JSON DEFAULT ('[]') COMMENT '成功指标',
  `risk_assessment` TEXT COMMENT '风险评估',
  `implementation_steps` JSON DEFAULT ('[]') COMMENT '实施步骤',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `action_plans_consultation_id_idx` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行动计划表';

-- 创建咨询汇总表
CREATE TABLE IF NOT EXISTS `consultation_summaries` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `consultation_id` VARCHAR(36) NOT NULL,
  `overall_analysis` TEXT NOT NULL COMMENT '整体分析',
  `key_insights` JSON DEFAULT ('[]') COMMENT '关键洞察',
  `consensus_points` JSON DEFAULT ('[]') COMMENT '共识要点',
  `conflicting_views` JSON DEFAULT ('[]') COMMENT '冲突观点',
  `final_recommendations` JSON DEFAULT ('[]') COMMENT '最终建议',
  `confidence_score` DECIMAL(3,2) DEFAULT 0.80 COMMENT '置信度分数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `consultation_summaries_consultation_id_idx` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询汇总表';
