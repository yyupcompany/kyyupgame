-- =====================================================
-- permissions表安全去重SQL脚本
-- 生成时间: 2025-07-22
-- 说明: 基于引用关系分析的安全去重方案
-- =====================================================

-- 1. 备份现有表
CREATE TABLE IF NOT EXISTS permissions_backup_20250722 AS SELECT * FROM permissions;
CREATE TABLE IF NOT EXISTS role_permissions_backup_20250722 AS SELECT * FROM role_permissions;

-- 2. 开始事务
START TRANSACTION;

-- =====================================================
-- 第一步：处理[已清理]标记的记录
-- =====================================================

-- 3.1 先删除[已清理]记录的角色权限关联
DELETE FROM role_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%'
);

-- 3.2 更新以[已清理]记录为父权限的子权限
-- 将ID=2012(班级管理)下的子权限移到ID=1262(班级管理)下
UPDATE permissions 
SET parent_id = 1262 
WHERE parent_id = 2012;

-- 3.3 删除所有[已清理]标记的记录
DELETE FROM permissions 
WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%';

-- =====================================================
-- 第二步：合并路径重复的权限
-- =====================================================

-- 4.1 /principal/dashboard 路径 (保留1205，删除2001)
UPDATE role_permissions SET permission_id = 1205 WHERE permission_id = 2001;
DELETE FROM permissions WHERE id = 2001;

-- 4.2 /principal/basic-info 路径 (保留1352，删除2002)
UPDATE role_permissions SET permission_id = 1352 WHERE permission_id = 2002;
DELETE FROM permissions WHERE id = 2002;

-- 4.3 /principal/customer-pool 路径 (保留1204，删除2006)
UPDATE role_permissions SET permission_id = 1204 WHERE permission_id = 2006;
DELETE FROM permissions WHERE id = 2006;

-- 4.4 /principal/decision-support/intelligent-dashboard 路径 (保留1212，删除2007)
UPDATE role_permissions SET permission_id = 1212 WHERE permission_id = 2007;
DELETE FROM permissions WHERE id = 2007;

-- 4.5 /class 路径 (保留1262，删除2012)
-- 子权限已在前面处理
UPDATE role_permissions SET permission_id = 1262 WHERE permission_id = 2012;
DELETE FROM permissions WHERE id = 2012;

-- =====================================================
-- 第三步：处理名称重复（添加前缀区分）
-- =====================================================

-- 5.1 为principal下的重复名称添加前缀
UPDATE permissions SET name = CONCAT('principal_', name) 
WHERE id IN (1257, 1258, 1259, 1260, 1187) AND parent_id = 1203;

-- 5.2 为主菜单的重复名称添加前缀
UPDATE permissions SET name = CONCAT('main_', name) 
WHERE id IN (2008, 2009, 2010, 2011, 2013, 2014) AND parent_id IS NULL;

-- 5.3 处理"申请管理"重复
UPDATE permissions SET name = 'application_main' WHERE id = 1091;
UPDATE permissions SET name = 'application_category', chinese_name = '申请管理' WHERE id = 1126;

-- 5.4 处理角色管理和权限管理重复
UPDATE permissions SET name = 'role_permission_mgmt' WHERE id = 1266;
UPDATE permissions SET name = 'permission_config' WHERE id = 1267;

-- =====================================================
-- 第四步：清理role_permissions表中的重复记录
-- =====================================================

-- 6. 删除重复的角色权限关联（保留ID最小的）
DELETE t1 FROM role_permissions t1
INNER JOIN role_permissions t2 
WHERE t1.role_id = t2.role_id 
  AND t1.permission_id = t2.permission_id 
  AND t1.id > t2.id;

-- =====================================================
-- 第五步：验证去重结果
-- =====================================================

-- 7. 显示去重统计
SELECT '=== 去重统计 ===' as info;
SELECT '去重前权限总数:' as description, 
       (SELECT COUNT(*) FROM permissions_backup_20250722) as count
UNION ALL
SELECT '去重后权限总数:', COUNT(*) FROM permissions
UNION ALL
SELECT '删除的权限数:', 
       (SELECT COUNT(*) FROM permissions_backup_20250722) - COUNT(*) FROM permissions
UNION ALL
SELECT '去重前角色权限关联数:', 
       (SELECT COUNT(*) FROM role_permissions_backup_20250722) as count
UNION ALL
SELECT '去重后角色权限关联数:', COUNT(*) FROM role_permissions;

-- 8. 检查是否还有重复
SELECT '=== 重复检查 ===' as info;
SELECT 'path重复数:' as check_type, COUNT(*) as count FROM (
    SELECT path FROM permissions 
    WHERE path IS NOT NULL AND path != '' 
    GROUP BY path HAVING COUNT(*) > 1
) t
UNION ALL
SELECT 'name重复数:', COUNT(*) FROM (
    SELECT name FROM permissions 
    WHERE name IS NOT NULL 
    GROUP BY name HAVING COUNT(*) > 1
) t;

-- 9. 检查孤立的子权限
SELECT '=== 孤立权限检查 ===' as info;
SELECT COUNT(*) as orphan_count 
FROM permissions p1 
WHERE p1.parent_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM permissions p2 WHERE p2.id = p1.parent_id
  );

-- 提交事务
COMMIT;

-- =====================================================
-- 回滚脚本（如需要）
-- =====================================================
-- ROLLBACK;
-- DROP TABLE IF EXISTS permissions;
-- DROP TABLE IF EXISTS role_permissions;
-- CREATE TABLE permissions AS SELECT * FROM permissions_backup_20250722;
-- CREATE TABLE role_permissions AS SELECT * FROM role_permissions_backup_20250722;