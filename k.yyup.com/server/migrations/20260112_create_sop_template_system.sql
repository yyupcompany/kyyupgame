-- ============================================
-- SOP模板系统数据库迁移脚本
-- 创建日期: 2026-01-12
-- 描述: 创建SOP模板管理系统的4个核心表
-- ============================================

-- 1. SOP模板表
CREATE TABLE IF NOT EXISTS sop_templates (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
  name VARCHAR(100) NOT NULL COMMENT '模板名称',
  type ENUM('course', 'sales', 'activity') NOT NULL COMMENT '模板类型：课程/销售/活动',
  description TEXT COMMENT '模板描述',
  icon VARCHAR(50) COMMENT '图标名称',
  color VARCHAR(20) DEFAULT '#409EFF' COMMENT '颜色标识',
  is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统模板（系统模板不可删除）',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  created_by INT COMMENT '创建者ID（关联users表）',
  tenant_id INT NOT NULL COMMENT '租户ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_type (type),
  INDEX idx_tenant (tenant_id),
  INDEX idx_created_by (created_by),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP模板表';

-- 2. SOP模板节点表
CREATE TABLE IF NOT EXISTS sop_template_nodes (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '节点ID',
  template_id INT NOT NULL COMMENT '模板ID',
  node_order INT NOT NULL COMMENT '节点顺序（1,2,3...）',
  node_name VARCHAR(100) NOT NULL COMMENT '节点名称',
  node_description TEXT COMMENT '节点描述',
  content_type ENUM('text', 'video', 'image', 'audio', 'mixed') DEFAULT 'mixed' COMMENT '内容类型',
  content_data JSON COMMENT '内容数据（文本/视频/图片/音频URL等）',
  feedback_config JSON COMMENT '反馈表单配置',
  duration_days INT DEFAULT 7 COMMENT '预计完成天数',
  is_required BOOLEAN DEFAULT TRUE COMMENT '是否必需完成',
  checklist JSON COMMENT '检查清单配置',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (template_id) REFERENCES sop_templates(id) ON DELETE CASCADE,
  INDEX idx_template (template_id),
  INDEX idx_order (template_id, node_order),
  UNIQUE KEY uk_template_order (template_id, node_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP模板节点表';

-- 3. SOP实例表（教师创建的实例）
CREATE TABLE IF NOT EXISTS sop_instances (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '实例ID',
  template_id INT NOT NULL COMMENT '模板ID',
  teacher_id INT NOT NULL COMMENT '教师ID（创建者）',
  customer_id INT COMMENT '关联客户ID（可选）',
  instance_name VARCHAR(100) COMMENT '实例名称',
  current_node_order INT DEFAULT 1 COMMENT '当前节点顺序',
  status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress' COMMENT '实例状态',
  start_date DATE COMMENT '开始日期',
  end_date DATE COMMENT '结束日期',
  custom_nodes JSON COMMENT '自定义节点修改（覆盖模板节点）',
  notes TEXT COMMENT '备注',
  tenant_id INT NOT NULL COMMENT '租户ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (template_id) REFERENCES sop_templates(id) ON DELETE RESTRICT,
  INDEX idx_teacher (teacher_id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_tenant (tenant_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP实例表';

-- 4. SOP节点进度表
CREATE TABLE IF NOT EXISTS sop_node_progress (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '进度ID',
  instance_id INT NOT NULL COMMENT '实例ID',
  node_order INT NOT NULL COMMENT '节点顺序',
  status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending' COMMENT '节点状态',
  started_at TIMESTAMP NULL COMMENT '开始时间',
  completed_at TIMESTAMP NULL COMMENT '完成时间',
  feedback_data JSON COMMENT '用户反馈数据',
  notes TEXT COMMENT '备注',
  attachments JSON COMMENT '附件（图片/文档等）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (instance_id) REFERENCES sop_instances(id) ON DELETE CASCADE,
  UNIQUE KEY uk_instance_node (instance_id, node_order),
  INDEX idx_instance (instance_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP节点进度表';

-- ============================================
-- 索引优化说明
-- ============================================
-- 1. type索引：按类型筛选模板（课程/销售/活动）
-- 2. tenant_id索引：多租户数据隔离
-- 3. template_id + node_order：快速定位模板节点
-- 4. teacher_id索引：查询教师的所有实例
-- 5. customer_id索引：查询客户关联的SOP实例
-- 6. status索引：按状态筛选实例
-- ============================================
