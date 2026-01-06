-- 修复教师角色AI权限问题
-- 为教师角色添加访问 /api/ai 路由所需的权限

-- 1. 查找或创建 '/ai' 权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES ('AI中心访问', '/ai', 'menu', NULL, '/api/ai', NULL, NULL, 'ChatDotRound', 40, 1, NOW(), NOW());

-- 2. 获取权限ID
SET @ai_permission_id = (SELECT id FROM permissions WHERE code = '/ai' LIMIT 1);

-- 3. 获取教师角色ID
SET @teacher_role_id = (SELECT id FROM roles WHERE code = 'teacher' LIMIT 1);

-- 4. 为教师角色分配 '/ai' 权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
VALUES (@teacher_role_id, @ai_permission_id, NOW(), NOW());

-- 5. 验证权限是否添加成功
SELECT 
    r.name AS role_name,
    r.code AS role_code,
    p.name AS permission_name,
    p.code AS permission_code,
    p.path AS permission_path
FROM role_permissions rp
INNER JOIN roles r ON rp.role_id = r.id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE r.code = 'teacher' AND p.code = '/ai';

