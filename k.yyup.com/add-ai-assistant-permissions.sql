-- 添加AI助手页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加AI助手主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('AI助手', 'AI_ASSISTANT_USE', 'menu', NULL, '/ai', 'pages/ai/ChatInterface.vue', 'ai:assistant:use', 'icon-robot', 20, 1, NOW(), NOW());

-- 获取刚插入的AI助手菜单ID
SET @ai_menu_id = (SELECT id FROM permissions WHERE code = 'AI_ASSISTANT_USE' LIMIT 1);

-- 2. 添加AI助手子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 基础权限
('AI对话', 'AI_CHAT_USE', 'button', @ai_menu_id, '', '', 'ai:chat:use', '', 10, 1, NOW(), NOW()),
('AI查询', 'AI_QUERY_EXECUTE', 'button', @ai_menu_id, '', '', 'ai:query:execute', '', 20, 1, NOW(), NOW()),
('AI模型配置', 'AI_MODEL_CONFIG_MANAGE', 'button', @ai_menu_id, '', '', 'ai:model:config', '', 30, 1, NOW(), NOW()),
('AI记忆管理', 'AI_MEMORY_MANAGE', 'button', @ai_menu_id, '', '', 'ai:memory:manage', '', 40, 1, NOW(), NOW()),
-- 高级功能
('AI专家咨询', 'AI_EXPERT_CONSULTATION', 'button', @ai_menu_id, '', '', 'ai:expert:consultation', '', 50, 1, NOW(), NOW()),
('AI服务使用', 'AI_SERVICES_USE', 'button', @ai_menu_id, '', '', 'ai:services:use', '', 60, 1, NOW(), NOW()),
('AI预测维护', 'AI_PREDICTIVE_MAINTENANCE', 'button', @ai_menu_id, '', '', 'ai:predictive:maintenance', '', 70, 1, NOW(), NOW()),
('AI数据分析', 'AI_DATA_ANALYSIS', 'button', @ai_menu_id, '', '', 'ai:data:analysis', '', 80, 1, NOW(), NOW()),
('AI报告生成', 'AI_REPORT_GENERATION', 'button', @ai_menu_id, '', '', 'ai:report:generation', '', 90, 1, NOW(), NOW()),
('AI活动策划', 'AI_ACTIVITY_PLANNING', 'button', @ai_menu_id, '', '', 'ai:activity:planning', '', 100, 1, NOW(), NOW()),
('AI配额管理', 'AI_QUOTA_MANAGE', 'button', @ai_menu_id, '', '', 'ai:quota:manage', '', 110, 1, NOW(), NOW()),
('AI反馈管理', 'AI_FEEDBACK_MANAGE', 'button', @ai_menu_id, '', '', 'ai:feedback:manage', '', 120, 1, NOW(), NOW()),
('AI分析统计', 'AI_ANALYTICS_VIEW', 'button', @ai_menu_id, '', '', 'ai:analytics:view', '', 130, 1, NOW(), NOW());

-- 3. 添加AI助手子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- AI助手页面别名
('AI助手页面', 'AI_ASSISTANT_PAGE', 'menu', @ai_menu_id, '/ai/AIAssistantPage', 'pages/ai/ChatInterface.vue', 'ai:assistant:page', '', 140, 1, NOW(), NOW()),
-- AI智能查询页面
('AI智能查询页面', 'AI_QUERY_PAGE', 'menu', @ai_menu_id, '/ai/query', 'pages/ai/AIQueryInterface.vue', 'ai:query:page', '', 150, 1, NOW(), NOW()),
-- AI模型管理页面
('AI模型管理页面', 'AI_MODEL_PAGE', 'menu', @ai_menu_id, '/ai/model', 'pages/ai/ModelManagementPage.vue', 'ai:model:page', '', 160, 1, NOW(), NOW()),
-- AI专家咨询页面
('AI专家咨询页面', 'AI_EXPERT_PAGE', 'menu', @ai_menu_id, '/ai-services/ExpertConsultationPage', 'pages/ai/ExpertConsultationPage.vue', 'ai:expert:page', '', 170, 1, NOW(), NOW()),
-- AI维护优化器页面
('AI维护优化器页面', 'AI_MAINTENANCE_PAGE', 'menu', @ai_menu_id, '/ai-services/predictive/maintenance-optimizer', 'pages/ai/MaintenanceOptimizer.vue', 'ai:maintenance:page', '', 180, 1, NOW(), NOW());

-- 4. 为admin角色分配AI助手权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @ai_menu_id, NOW(), NOW()
WHERE @ai_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @ai_menu_id;

-- 6. 为园长角色分配AI助手权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @ai_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @ai_menu_id IS NOT NULL;

-- 7. 为园长角色分配核心权限（对话、查询、数据分析、报告生成、活动策划）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @ai_menu_id AND p.code IN ('AI_CHAT_USE', 'AI_QUERY_EXECUTE', 'AI_DATA_ANALYSIS', 'AI_REPORT_GENERATION', 'AI_ACTIVITY_PLANNING', 'AI_ANALYTICS_VIEW');

-- 8. 为教师角色分配基础权限（对话、活动策划）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '教师' AND p.parent_id = @ai_menu_id AND p.code IN ('AI_CHAT_USE', 'AI_ACTIVITY_PLANNING', 'AI_EXPERT_CONSULTATION');

-- 9. 为技术管理员角色分配完整权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @ai_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('技术管理员', 'IT管理员', '系统管理员') AND @ai_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('技术管理员', 'IT管理员', '系统管理员') AND p.parent_id = @ai_menu_id;

-- 10. 为数据分析师角色分配分析权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '数据分析师' AND p.parent_id = @ai_menu_id AND p.code IN ('AI_CHAT_USE', 'AI_QUERY_EXECUTE', 'AI_DATA_ANALYSIS', 'AI_REPORT_GENERATION', 'AI_ANALYTICS_VIEW');

-- 验证插入结果
SELECT 
    p.id,
    p.name,
    p.code,
    p.path,
    p.component,
    p.permission,
    p.icon,
    p.sort,
    p.status
FROM permissions p 
WHERE p.code LIKE '%AI_%'
ORDER BY p.sort;

-- 验证角色权限分配
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.code as permission_code,
    p.path as permission_path
FROM role_permissions rp
INNER JOIN roles r ON rp.role_id = r.id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE '%AI_%'
ORDER BY r.name, p.sort;

COMMIT;
