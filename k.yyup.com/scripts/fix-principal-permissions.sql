-- ============================================================================
-- 修复园长角色权限 - 移除系统中心
-- ============================================================================
-- 执行日期: 2025-01-08
-- 问题: 园长角色不应该有系统中心权限
-- 解决方案: 从 role_permissions 表中删除园长的系统中心权限
-- ============================================================================

-- 1. 查看当前园长角色的系统中心权限
SELECT 
    rp.id AS role_permission_id,
    r.id AS role_id,
    r.name AS role_name,
    p.id AS permission_id,
    p.name AS permission_name,
    p.code AS permission_code,
    p.path AS permission_path
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'principal'
AND (
    p.name LIKE '%System Center%' 
    OR p.name LIKE '%系统中心%'
    OR p.code LIKE '%SYSTEM_CENTER%'
    OR p.code LIKE '%system_center%'
    OR p.path LIKE '%/centers/system%'
);

-- 预期结果: 应该返回1条记录
-- permission_id: 2013
-- permission_code: SYSTEM_CENTER
-- permission_name: 系统中心

-- ============================================================================

-- 2. 删除园长角色的系统中心权限
DELETE FROM role_permissions 
WHERE permission_id = 2013 
AND role_id = (SELECT id FROM roles WHERE name = 'principal');

-- 预期结果: Query OK, 1 row affected

-- ============================================================================

-- 3. 验证删除结果
SELECT 
    COUNT(*) AS system_center_count
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'principal'
AND p.id = 2013;

-- 预期结果: system_center_count = 0

-- ============================================================================

-- 4. 查看园长角色剩余的权限数量
SELECT 
    r.name AS role_name,
    COUNT(rp.id) AS permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name = 'principal'
GROUP BY r.id, r.name;

-- 预期结果: permission_count = 55 (原来56个，删除1个)

-- ============================================================================

-- 5. 确认管理员仍然有系统中心权限
SELECT 
    r.name AS role_name,
    p.name AS permission_name,
    p.code AS permission_code
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
AND p.id = 2013;

-- 预期结果: 应该返回1条记录，确认admin仍有系统中心权限

-- ============================================================================
-- 执行完成后，请运行测试脚本验证:
-- node scripts/compare-principal-admin.cjs
-- ============================================================================

