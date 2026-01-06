-- 添加文档导入页面权限配置

-- 1. 首先在permissions表中添加文档导入页面权限
INSERT INTO `permissions` (
  `name`, 
  `chinese_name`, 
  `code`, 
  `type`, 
  `parent_id`, 
  `path`, 
  `component`, 
  `permission`, 
  `icon`, 
  `sort`, 
  `status`, 
  `created_at`, 
  `updated_at`
) VALUES 
(
  'AI Document Import', 
  'AI文档导入', 
  'AI_DOCUMENT_IMPORT', 
  'menu', 
  (SELECT id FROM permissions WHERE code = 'AI_CENTER' LIMIT 1), 
  '/ai/document-import', 
  'pages/ai/DocumentImportPage.vue', 
  'ai:document:import', 
  'document', 
  30, 
  1, 
  NOW(), 
  NOW()
);

-- 2. 获取刚插入的权限ID和管理员角色ID
SET @document_import_permission_id = LAST_INSERT_ID();
SET @admin_role_id = (SELECT id FROM roles WHERE code = 'admin' LIMIT 1);
SET @principal_role_id = (SELECT id FROM roles WHERE code = 'principal' LIMIT 1);

-- 3. 为管理员角色分配文档导入权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`, `updated_at`)
VALUES (@admin_role_id, @document_import_permission_id, NOW(), NOW());

-- 4. 为园长角色分配文档导入权限（如果存在）
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`, `updated_at`)
SELECT @principal_role_id, @document_import_permission_id, NOW(), NOW()
WHERE @principal_role_id IS NOT NULL;

-- 5. 查看结果
SELECT 
  p.name as permission_name,
  p.chinese_name,
  p.code,
  p.path,
  p.component,
  r.name as role_name
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id  
LEFT JOIN roles r ON rp.role_id = r.id
WHERE p.code = 'AI_DOCUMENT_IMPORT';