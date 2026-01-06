-- 修复园长角色权限 - 设置为与admin完全相同
-- 作者: Claude Code
-- 日期: 2025-11-12

-- 1. 首先查询当前admin和principal角色的权限情况
SELECT
    r1.name as admin_role,
    COUNT(rp1.permission_id) as admin_permissions,
    r2.name as principal_role,
    COUNT(rp2.permission_id) as principal_permissions
FROM roles r1
LEFT JOIN role_permissions rp1 ON r1.id = rp1.role_id
LEFT JOIN roles r2 ON r2.key = 'principal'
LEFT JOIN role_permissions rp2 ON r2.id = rp2.role_id
WHERE r1.key = 'admin'
GROUP BY r1.name, r2.name;

-- 2. 删除principal角色的所有现有权限
DELETE rp FROM role_permissions rp
INNER JOIN roles r ON rp.role_id = r.id
WHERE r.key = 'principal';

-- 3. 将admin角色的所有权限复制给principal角色
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT
    p_r.id as role_id,
    a_p.permission_id,
    NOW() as created_at,
    NOW() as updated_at
FROM roles p_r
CROSS JOIN role_permissions a_p
WHERE p_r.key = 'principal'
  AND a_p.role_id = (SELECT id FROM roles WHERE key = 'admin');

-- 4. 验证修复结果
SELECT
    r1.name as admin_role,
    COUNT(rp1.permission_id) as admin_permissions,
    r2.name as principal_role,
    COUNT(rp2.permission_id) as principal_permissions,
    CASE
        WHEN COUNT(rp1.permission_id) = COUNT(rp2.permission_id) THEN '✅ 权限同步成功'
        ELSE '❌ 权限同步失败'
    END as status
FROM roles r1
LEFT JOIN role_permissions rp1 ON r1.id = rp1.role_id
LEFT JOIN roles r2 ON r2.key = 'principal'
LEFT JOIN role_permissions rp2 ON r2.id = rp2.role_id
WHERE r1.key = 'admin'
GROUP BY r1.name, r2.name;