-- ============================================
-- 添加话术中心和新媒体中心权限
-- 目的：将前端临时添加的菜单纳入后端权限系统
-- ============================================

-- 检查话术中心权限是否已存在
SELECT '检查话术中心权限...' AS step;
SELECT id, name, code FROM permissions WHERE code = 'SCRIPT_CENTER';

-- 添加话术中心权限（如果不存在）
INSERT INTO permissions (name, code, type, path, icon, sort, status, parent_id, created_at, updated_at) 
SELECT 'Script Center', 'SCRIPT_CENTER', 'category', '/centers/script', 'MessageSquare', 21, 1, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'SCRIPT_CENTER');

-- 获取话术中心权限ID
SET @script_center_id = (SELECT id FROM permissions WHERE code = 'SCRIPT_CENTER');
SELECT CONCAT('话术中心权限ID: ', @script_center_id) AS info;

-- 添加话术中心页面权限
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id, created_at, updated_at) 
SELECT 'script-center-page', 'SCRIPT_CENTER_PAGE', 'menu', '/centers/script', 'pages/centers/ScriptCenter.vue', 'MessageSquare', 10, 1, @script_center_id, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'SCRIPT_CENTER_PAGE');

-- 检查新媒体中心权限是否已存在
SELECT '检查新媒体中心权限...' AS step;
SELECT id, name, code FROM permissions WHERE code = 'MEDIA_CENTER';

-- 添加新媒体中心权限（如果不存在）
INSERT INTO permissions (name, code, type, path, icon, sort, status, parent_id, created_at, updated_at) 
SELECT 'Media Center', 'MEDIA_CENTER', 'category', '/centers/media', 'VideoCamera', 25, 1, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'MEDIA_CENTER');

-- 获取新媒体中心权限ID
SET @media_center_id = (SELECT id FROM permissions WHERE code = 'MEDIA_CENTER');
SELECT CONCAT('新媒体中心权限ID: ', @media_center_id) AS info;

-- 添加新媒体中心页面权限
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id, created_at, updated_at) 
SELECT 'media-center-page', 'MEDIA_CENTER_PAGE', 'menu', '/centers/media', 'pages/principal/MediaCenter.vue', 'VideoCamera', 10, 1, @media_center_id, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'MEDIA_CENTER_PAGE');

-- 显示添加的权限
SELECT '添加的权限:' AS step;
SELECT id, name, code, type, path, parent_id FROM permissions 
WHERE code IN ('SCRIPT_CENTER', 'SCRIPT_CENTER_PAGE', 'MEDIA_CENTER', 'MEDIA_CENTER_PAGE')
ORDER BY id;

-- ============================================
-- 配置角色-权限关联
-- ============================================

-- 为管理员角色添加话术中心权限
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p
WHERE r.code = 'admin' 
  AND p.code = 'SCRIPT_CENTER'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 为管理员角色添加新媒体中心权限
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p
WHERE r.code = 'admin' 
  AND p.code = 'MEDIA_CENTER'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 为园长角色添加话术中心权限
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p
WHERE r.code = 'principal' 
  AND p.code = 'SCRIPT_CENTER'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 为园长角色添加新媒体中心权限
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p
WHERE r.code = 'principal' 
  AND p.code = 'MEDIA_CENTER'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 显示角色-权限关联
SELECT '角色-权限关联:' AS step;
SELECT r.name AS role_name, r.code AS role_code, p.name AS permission_name, p.code AS permission_code
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code IN ('SCRIPT_CENTER', 'MEDIA_CENTER')
ORDER BY r.code, p.code;

-- 完成
SELECT '✅ 权限添加完成！' AS result;
SELECT '注意：教师角色不包括话术中心和新媒体中心权限' AS note;

