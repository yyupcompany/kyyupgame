-- 网站自动化功能数据库迁移
-- 创建时间: 2025-08-15

-- 创建自动化任务表
CREATE TABLE IF NOT EXISTS automation_tasks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL COMMENT '任务名称',
  description TEXT COMMENT '任务描述',
  url VARCHAR(500) NOT NULL COMMENT '目标网站URL',
  steps JSON NOT NULL DEFAULT ('[]') COMMENT '任务步骤配置',
  config JSON NOT NULL DEFAULT ('{}') COMMENT '任务配置信息',
  status ENUM('pending', 'running', 'completed', 'failed', 'stopped') NOT NULL DEFAULT 'pending' COMMENT '任务状态',
  progress INT NOT NULL DEFAULT 0 COMMENT '执行进度（0-100）',
  template_id CHAR(36) COMMENT '关联的模板ID',
  user_id CHAR(36) NOT NULL COMMENT '创建用户ID',
  last_executed DATETIME COMMENT '最后执行时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_progress CHECK (progress >= 0 AND progress <= 100),
  
  INDEX idx_automation_tasks_user_id (user_id),
  INDEX idx_automation_tasks_status (status),
  INDEX idx_automation_tasks_template_id (template_id),
  INDEX idx_automation_tasks_created_at (created_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES automation_templates(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站自动化任务表';

-- 创建自动化模板表
CREATE TABLE IF NOT EXISTS automation_templates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL COMMENT '模板名称',
  description TEXT COMMENT '模板描述',
  category ENUM('web', 'form', 'data', 'test', 'custom') NOT NULL DEFAULT 'custom' COMMENT '模板分类',
  complexity ENUM('simple', 'medium', 'complex') NOT NULL DEFAULT 'simple' COMMENT '复杂度级别',
  steps JSON NOT NULL DEFAULT ('[]') COMMENT '模板步骤配置',
  parameters JSON NOT NULL DEFAULT ('[]') COMMENT '模板参数配置',
  config JSON NOT NULL DEFAULT ('{}') COMMENT '模板配置信息',
  usage_count INT NOT NULL DEFAULT 0 COMMENT '使用次数',
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0' COMMENT '模板版本',
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT '模板状态',
  is_public BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否公开',
  allow_parameterization BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否允许参数化',
  user_id CHAR(36) NOT NULL COMMENT '创建用户ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_automation_templates_user_id (user_id),
  INDEX idx_automation_templates_category (category),
  INDEX idx_automation_templates_status (status),
  INDEX idx_automation_templates_is_public (is_public),
  INDEX idx_automation_templates_usage_count (usage_count),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站自动化模板表';

-- 创建执行历史表
CREATE TABLE IF NOT EXISTS execution_histories (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  task_id CHAR(36) NOT NULL COMMENT '关联的任务ID',
  status ENUM('running', 'completed', 'failed', 'stopped') NOT NULL COMMENT '执行状态',
  start_time DATETIME NOT NULL COMMENT '开始执行时间',
  end_time DATETIME COMMENT '结束执行时间',
  logs LONGTEXT COMMENT '执行日志（JSON格式）',
  result LONGTEXT COMMENT '执行结果（JSON格式）',
  error TEXT COMMENT '错误信息',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_execution_histories_task_id (task_id),
  INDEX idx_execution_histories_status (status),
  INDEX idx_execution_histories_start_time (start_time),
  
  FOREIGN KEY (task_id) REFERENCES automation_tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务执行历史表';

-- 修复外键约束，先创建模板表，再添加任务表的外键
ALTER TABLE automation_tasks 
ADD CONSTRAINT fk_automation_tasks_template 
FOREIGN KEY (template_id) REFERENCES automation_templates(id) ON DELETE SET NULL;

-- 插入一些示例模板数据
INSERT INTO automation_templates (
  id, name, description, category, complexity, steps, parameters, config, 
  usage_count, version, status, is_public, allow_parameterization, user_id
) VALUES 
(
  UUID(),
  '网站登录模板',
  '通用的网站登录流程模板，支持用户名密码登录',
  'web',
  'simple',
  JSON_ARRAY(
    JSON_OBJECT(
      'id', '1',
      'name', '打开登录页面',
      'action', 'navigate',
      'url', '{{loginUrl}}',
      'description', '导航到登录页面',
      'delay', 0,
      'optional', false,
      'screenshot', false,
      'enableParameterization', true
    ),
    JSON_OBJECT(
      'id', '2',
      'name', '输入用户名',
      'action', 'input',
      'selector', 'input[name="username"]',
      'text', '{{username}}',
      'description', '输入用户名',
      'delay', 500,
      'optional', false,
      'screenshot', false,
      'enableParameterization', true
    ),
    JSON_OBJECT(
      'id', '3',
      'name', '输入密码',
      'action', 'input',
      'selector', 'input[type="password"]',
      'text', '{{password}}',
      'description', '输入密码',
      'delay', 500,
      'optional', false,
      'screenshot', false,
      'enableParameterization', true
    ),
    JSON_OBJECT(
      'id', '4',
      'name', '点击登录按钮',
      'action', 'click',
      'selector', 'button[type="submit"]',
      'description', '点击登录按钮',
      'delay', 0,
      'optional', false,
      'screenshot', true,
      'enableParameterization', false
    )
  ),
  JSON_ARRAY(
    JSON_OBJECT(
      'id', '1',
      'name', 'loginUrl',
      'type', 'url',
      'defaultValue', 'https://example.com/login',
      'description', '登录页面URL',
      'required', true,
      'validation', ''
    ),
    JSON_OBJECT(
      'id', '2',
      'name', 'username',
      'type', 'string',
      'defaultValue', '',
      'description', '用户名',
      'required', true,
      'validation', '^[a-zA-Z0-9_]+$'
    ),
    JSON_OBJECT(
      'id', '3',
      'name', 'password',
      'type', 'string',
      'defaultValue', '',
      'description', '密码',
      'required', true,
      'validation', ''
    )
  ),
  JSON_OBJECT(
    'executionMode', 'sequential',
    'errorHandling', 'stop',
    'timeout', 60,
    'enableLogging', true,
    'screenshotOnError', true,
    'allowParameterization', true
  ),
  0,
  '1.0.0',
  'published',
  true,
  true,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
),
(
  UUID(),
  '表单数据提取',
  '提取页面中的表单数据，包括所有输入字段的值',
  'data',
  'medium',
  JSON_ARRAY(
    JSON_OBJECT(
      'id', '1',
      'name', '等待页面加载',
      'action', 'wait',
      'waitTime', 2000,
      'description', '等待页面完全加载',
      'delay', 0,
      'optional', false,
      'screenshot', false,
      'enableParameterization', false
    ),
    JSON_OBJECT(
      'id', '2',
      'name', '提取表单数据',
      'action', 'extract',
      'selector', 'form input, form select, form textarea',
      'extractType', 'attribute',
      'attributeName', 'value',
      'variableName', 'formData',
      'description', '提取所有表单字段的值',
      'delay', 0,
      'optional', false,
      'screenshot', true,
      'enableParameterization', false
    )
  ),
  JSON_ARRAY(),
  JSON_OBJECT(
    'executionMode', 'sequential',
    'errorHandling', 'continue',
    'timeout', 30,
    'enableLogging', true,
    'screenshotOnError', true,
    'allowParameterization', false
  ),
  0,
  '1.1.0',
  'published',
  true,
  false,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
);

-- 创建权限记录
INSERT IGNORE INTO permissions (id, name, display_name, description, resource, action, level, category_id) VALUES
(UUID(), 'website_automation_access', '网站自动化访问', '访问网站自动化功能', 'website-automation', 'read', 1, 
 (SELECT id FROM permission_categories WHERE name = 'ai' LIMIT 1)),
(UUID(), 'website_automation_manage', '网站自动化管理', '管理网站自动化任务和模板', 'website-automation', 'write', 1,
 (SELECT id FROM permission_categories WHERE name = 'ai' LIMIT 1)),
(UUID(), 'website_automation_execute', '网站自动化执行', '执行网站自动化任务', 'website-automation', 'execute', 1,
 (SELECT id FROM permission_categories WHERE name = 'ai' LIMIT 1));

-- 为管理员和园长角色分配权限
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name IN ('admin', 'principal') 
  AND p.resource = 'website-automation';

-- 为教师角色分配基础权限
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'teacher' 
  AND p.name IN ('website_automation_access', 'website_automation_execute');

COMMIT;