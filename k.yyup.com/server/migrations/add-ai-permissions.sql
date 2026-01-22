-- AI助手角色权限配置数据库迁移脚本
-- 创建时间：2026-01-06
-- 说明：添加AI功能权限并为三种角色分配权限

-- ============================================
-- 第一步：添加8个AI功能权限到permissions表
-- ============================================

INSERT INTO permissions (permission_code, permission_name, resource_type, description, created_at, updated_at)
VALUES
-- 数据查询权限
('AI_DATA_QUERY_ALL', 'AI数据全局查询', 'ai_feature', '园长可查询所有数据，无限制', NOW(), NOW()),
('AI_DATA_QUERY_CLASS', 'AI数据班级查询', 'ai_feature', '老师只能查询自己班级的数据', NOW(), NOW()),
('AI_DATA_QUERY_CHILD', 'AI数据孩子查询', 'ai_feature', '家长只能查询自己孩子的数据', NOW(), NOW()),

-- 工具使用权限
('AI_TOOL_WEB_SEARCH', 'AI网络搜索', 'ai_feature', '允许使用网络搜索工具', NOW(), NOW()),
('AI_TOOL_COMPONENT_RENDER', 'AI组件渲染', 'ai_feature', '允许渲染可视化组件（图表、表格等）', NOW(), NOW()),
('AI_AGENT_MODE', 'AI智能代理模式', 'ai_feature', '允许使用Auto智能代理功能', NOW(), NOW()),

-- 文件上传权限
('AI_FILE_UPLOAD_ALL', 'AI全文件上传', 'ai_feature', '允许上传所有类型文件（文档、图片、Excel等）', NOW(), NOW()),
('AI_FILE_UPLOAD_IMAGE', 'AI图片上传', 'ai_feature', '仅允许上传图片文件', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  permission_name = VALUES(permission_name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================
-- 第二步：为园长角色分配AI权限
-- ============================================

-- 园长拥有最高权限：全局数据查询、网络搜索、组件渲染、智能代理、全文件上传
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
  r.id, 
  p.id,
  NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.role_code = 'principal'
AND p.permission_code IN (
  'AI_DATA_QUERY_ALL',        -- 全局数据查询
  'AI_TOOL_WEB_SEARCH',       -- 网络搜索
  'AI_TOOL_COMPONENT_RENDER', -- 组件渲染
  'AI_AGENT_MODE',            -- 智能代理
  'AI_FILE_UPLOAD_ALL'        -- 全文件上传
)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- 第三步：为老师角色分配AI权限
-- ============================================

-- 老师拥有中等权限：班级数据查询、网络搜索、组件渲染、智能代理、全文件上传
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
  r.id, 
  p.id,
  NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.role_code = 'teacher'
AND p.permission_code IN (
  'AI_DATA_QUERY_CLASS',      -- 班级数据查询
  'AI_TOOL_WEB_SEARCH',       -- 网络搜索
  'AI_TOOL_COMPONENT_RENDER', -- 组件渲染
  'AI_AGENT_MODE',            -- 智能代理
  'AI_FILE_UPLOAD_ALL'        -- 全文件上传
)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- 第四步：为家长角色分配AI权限
-- ============================================

-- 家长拥有基础权限：孩子数据查询、仅图片上传
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
  r.id, 
  p.id,
  NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.role_code = 'parent'
AND p.permission_code IN (
  'AI_DATA_QUERY_CHILD',      -- 孩子数据查询
  'AI_FILE_UPLOAD_IMAGE'      -- 仅图片上传
)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- 验证SQL：查询各角色的AI权限
-- ============================================

-- 查询园长AI权限
SELECT 
  r.role_name AS '角色',
  p.permission_name AS '权限名称',
  p.description AS '说明'
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.role_code = 'principal'
AND p.resource_type = 'ai_feature'
ORDER BY p.permission_code;

-- 查询老师AI权限
SELECT 
  r.role_name AS '角色',
  p.permission_name AS '权限名称',
  p.description AS '说明'
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.role_code = 'teacher'
AND p.resource_type = 'ai_feature'
ORDER BY p.permission_code;

-- 查询家长AI权限
SELECT 
  r.role_name AS '角色',
  p.permission_name AS '权限名称',
  p.description AS '说明'
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.role_code = 'parent'
AND p.resource_type = 'ai_feature'
ORDER BY p.permission_code;
