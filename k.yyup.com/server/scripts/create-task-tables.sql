-- 任务管理系统数据库表结构
-- 创建时间: 2024-01-31
-- 描述: 任务中心相关的数据库表，支持任务管理、协作、模板等功能

-- 1. 任务主表
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
  title VARCHAR(200) NOT NULL COMMENT '任务标题',
  description TEXT COMMENT '任务描述',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '任务状态',
  type ENUM('enrollment', 'activity', 'daily', 'management') DEFAULT 'daily' COMMENT '任务类型',
  
  -- 人员信息
  creator_id INT NOT NULL COMMENT '创建者ID',
  assignee_id INT NOT NULL COMMENT '执行者ID',
  reviewer_id INT NULL COMMENT '审核者ID',
  
  -- 时间信息
  due_date DATETIME NULL COMMENT '截止时间',
  start_date DATETIME NULL COMMENT '开始时间',
  completed_at DATETIME NULL COMMENT '完成时间',
  
  -- 关联信息（灵活关联设计）
  related_type VARCHAR(50) NULL COMMENT '关联类型：enrollment_plan, activity, general',
  related_id INT NULL COMMENT '关联对象ID',
  
  -- 进度和工时
  progress INT DEFAULT 0 COMMENT '进度百分比 0-100',
  estimated_hours DECIMAL(5,2) NULL COMMENT '预估工时',
  actual_hours DECIMAL(5,2) NULL COMMENT '实际工时',
  
  -- 附加信息
  tags JSON NULL COMMENT '标签信息',
  attachments JSON NULL COMMENT '附件信息',
  requirements TEXT NULL COMMENT '任务要求',
  acceptance_criteria TEXT NULL COMMENT '验收标准',
  
  -- 系统字段
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX idx_assignee_status (assignee_id, status),
  INDEX idx_creator_id (creator_id),
  INDEX idx_related (related_type, related_id),
  INDEX idx_due_date (due_date),
  INDEX idx_status_priority (status, priority),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务主表';

-- 2. 任务评论/反馈表
CREATE TABLE IF NOT EXISTS task_comments (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  task_id INT NOT NULL COMMENT '任务ID',
  user_id INT NOT NULL COMMENT '用户ID',
  content TEXT NOT NULL COMMENT '评论内容',
  type ENUM('comment', 'feedback', 'correction', 'completion', 'question') DEFAULT 'comment' COMMENT '评论类型',
  parent_id INT NULL COMMENT '父评论ID（用于回复）',
  attachments JSON NULL COMMENT '附件信息',
  is_internal TINYINT DEFAULT 0 COMMENT '是否内部评论',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_task_id (task_id),
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论反馈表';

-- 3. 任务模板表
CREATE TABLE IF NOT EXISTS task_templates (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
  name VARCHAR(100) NOT NULL COMMENT '模板名称',
  description TEXT COMMENT '模板描述',
  type ENUM('enrollment', 'activity', 'daily', 'management') NOT NULL COMMENT '模板类型',
  category VARCHAR(50) NULL COMMENT '模板分类',
  
  -- 模板内容
  template_content JSON NOT NULL COMMENT '模板内容配置',
  default_priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '默认优先级',
  default_estimated_hours DECIMAL(5,2) NULL COMMENT '默认预估工时',
  
  -- 使用统计
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  
  -- 状态和权限
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  is_public TINYINT DEFAULT 1 COMMENT '是否公开',
  created_by INT NOT NULL COMMENT '创建者ID',
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_created_by (created_by),
  INDEX idx_is_active (is_active),
  INDEX idx_usage_count (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表';

-- 4. 任务子任务表
CREATE TABLE IF NOT EXISTS task_subtasks (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '子任务ID',
  parent_task_id INT NOT NULL COMMENT '父任务ID',
  title VARCHAR(200) NOT NULL COMMENT '子任务标题',
  description TEXT COMMENT '子任务描述',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '状态',
  assignee_id INT NULL COMMENT '执行者ID',
  due_date DATETIME NULL COMMENT '截止时间',
  completed_at DATETIME NULL COMMENT '完成时间',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_parent_task (parent_task_id),
  INDEX idx_assignee_id (assignee_id),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务子任务表';

-- 5. 任务依赖关系表
CREATE TABLE IF NOT EXISTS task_dependencies (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '依赖关系ID',
  task_id INT NOT NULL COMMENT '任务ID',
  depends_on_task_id INT NOT NULL COMMENT '依赖的任务ID',
  dependency_type ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish') DEFAULT 'finish_to_start' COMMENT '依赖类型',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY uk_task_dependency (task_id, depends_on_task_id),
  INDEX idx_task_id (task_id),
  INDEX idx_depends_on (depends_on_task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务依赖关系表';

-- 6. 任务操作日志表
CREATE TABLE IF NOT EXISTS task_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  task_id INT NOT NULL COMMENT '任务ID',
  user_id INT NOT NULL COMMENT '操作用户ID',
  action VARCHAR(50) NOT NULL COMMENT '操作类型',
  old_value JSON NULL COMMENT '旧值',
  new_value JSON NULL COMMENT '新值',
  description TEXT NULL COMMENT '操作描述',
  ip_address VARCHAR(45) NULL COMMENT 'IP地址',
  user_agent TEXT NULL COMMENT '用户代理',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_task_id (task_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务操作日志表';

-- 7. 任务提醒表
CREATE TABLE IF NOT EXISTS task_reminders (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '提醒ID',
  task_id INT NOT NULL COMMENT '任务ID',
  user_id INT NOT NULL COMMENT '用户ID',
  reminder_type ENUM('due_date', 'start_date', 'custom') NOT NULL COMMENT '提醒类型',
  reminder_time DATETIME NOT NULL COMMENT '提醒时间',
  message TEXT NULL COMMENT '提醒消息',
  is_sent TINYINT DEFAULT 0 COMMENT '是否已发送',
  sent_at DATETIME NULL COMMENT '发送时间',
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_task_id (task_id),
  INDEX idx_user_id (user_id),
  INDEX idx_reminder_time (reminder_time),
  INDEX idx_is_sent (is_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务提醒表';
