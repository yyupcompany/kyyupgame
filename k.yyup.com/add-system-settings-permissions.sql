-- 添加系统设置页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加系统设置主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('系统设置', 'SYSTEM_SETTINGS', 'menu', NULL, '/system/settings', 'pages/system/settings/index.vue', 'system:settings:view', 'icon-settings', 90, 1, NOW(), NOW());

-- 获取刚插入的系统设置菜单ID
SET @settings_menu_id = (SELECT id FROM permissions WHERE code = 'SYSTEM_SETTINGS' LIMIT 1);

-- 2. 添加系统设置子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 查看权限
('系统设置查看', 'SYSTEM_SETTINGS_VIEW', 'button', @settings_menu_id, '', '', 'system:settings:view', '', 10, 1, NOW(), NOW()),
-- 管理权限
('系统设置管理', 'SYSTEM_SETTINGS_MANAGE', 'button', @settings_menu_id, '', '', 'system:settings:manage', '', 20, 1, NOW(), NOW()),
-- 基础设置
('基础设置', 'SYSTEM_SETTINGS_BASIC', 'button', @settings_menu_id, '', '', 'system:settings:basic', '', 30, 1, NOW(), NOW()),
-- 邮件设置
('邮件设置', 'SYSTEM_SETTINGS_EMAIL', 'button', @settings_menu_id, '', '', 'system:settings:email', '', 40, 1, NOW(), NOW()),
-- 安全设置
('安全设置', 'SYSTEM_SETTINGS_SECURITY', 'button', @settings_menu_id, '', '', 'system:settings:security', '', 50, 1, NOW(), NOW()),
-- 存储设置
('存储设置', 'SYSTEM_SETTINGS_STORAGE', 'button', @settings_menu_id, '', '', 'system:settings:storage', '', 60, 1, NOW(), NOW()),
-- 备份设置
('备份设置', 'SYSTEM_SETTINGS_BACKUP', 'button', @settings_menu_id, '', '', 'system:settings:backup', '', 70, 1, NOW(), NOW()),
-- 导入导出
('设置导入导出', 'SYSTEM_SETTINGS_IMPORT_EXPORT', 'button', @settings_menu_id, '', '', 'system:settings:import_export', '', 80, 1, NOW(), NOW());

-- 3. 添加系统设置路由别名权限（修复/settings重定向）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('系统设置别名', 'SYSTEM_SETTINGS_ALIAS', 'menu', @settings_menu_id, '/settings', '', 'system:settings:alias', '', 5, 1, NOW(), NOW());

-- 4. 为admin角色分配系统设置权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @settings_menu_id, NOW(), NOW()
WHERE @settings_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @settings_menu_id;

-- 6. 为园长角色分配系统设置权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @settings_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @settings_menu_id IS NOT NULL;

-- 7. 为园长角色分配基础权限（查看、基础设置、邮件设置）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @settings_menu_id AND p.code IN ('SYSTEM_SETTINGS_VIEW', 'SYSTEM_SETTINGS_BASIC', 'SYSTEM_SETTINGS_EMAIL');

-- 8. 为系统管理员角色分配所有权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @settings_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('系统管理员', 'super_admin') AND @settings_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('系统管理员', 'super_admin') AND p.parent_id = @settings_menu_id;

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
WHERE p.code LIKE '%SYSTEM_SETTINGS%'
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
WHERE p.code LIKE '%SYSTEM_SETTINGS%'
ORDER BY r.name, p.sort;

COMMIT;
