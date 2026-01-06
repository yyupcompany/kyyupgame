-- =====================================================
-- permissions表去重SQL脚本
-- 生成时间: 2025-07-22
-- 说明: 处理permissions表中的重复记录
-- =====================================================

-- 1. 备份现有permissions表
CREATE TABLE IF NOT EXISTS permissions_backup_20250722 AS 
SELECT * FROM permissions;

-- 2. 开始事务
START TRANSACTION;

-- 3. 处理路径重复的记录
-- 3.1 /class 路径重复（保留ID最小的）
DELETE FROM permissions WHERE id IN (2012, 1139, 1262) AND path = '/class';
-- 保留 ID: 1133

-- 3.2 /principal/dashboard 路径重复（保留功能更完整的）
DELETE FROM permissions WHERE id = 2001 AND path = '/principal/dashboard';
-- 保留 ID: 1205 (园长仪表板)

-- 3.3 /principal/basic-info 路径重复
DELETE FROM permissions WHERE id = 2002 AND path = '/principal/basic-info';
-- 保留 ID: 1352

-- 3.4 /principal/performance 路径重复
DELETE FROM permissions WHERE id = 2003 AND path = '/principal/performance';
-- 保留 ID: 1207

-- 3.5 /principal/performance-rules 路径重复
DELETE FROM permissions WHERE id = 2004 AND path = '/principal/performance-rules';
-- 保留 ID: 1208

-- 3.6 /principal/customer-pool 路径重复
DELETE FROM permissions WHERE id = 2006 AND path = '/principal/customer-pool';
-- 保留 ID: 1204

-- 3.7 /principal/decision-support/intelligent-dashboard 路径重复
DELETE FROM permissions WHERE id = 2007 AND path = '/principal/decision-support/intelligent-dashboard';
-- 保留 ID: 1212

-- 3.8 /principal/marketing-analysis 路径重复
DELETE FROM permissions WHERE id = 2005 AND path = '/principal/marketing-analysis';
-- 保留 ID: 1206

-- 3.9 /enrollment-plan/PlanList 路径重复
DELETE FROM permissions WHERE id = 1173 AND path = '/enrollment-plan/PlanList';
-- 保留 ID: 1263

-- 3.10 /application/ApplicationList 路径重复
DELETE FROM permissions WHERE id = 1128 AND path = '/application/ApplicationList';
-- 保留 ID: 1264

-- 3.11 /system/permissions 路径重复
DELETE FROM permissions WHERE id = 1239 AND path = '/system/permissions';
-- 保留 ID: 1238

-- 3.12 /dashboard 路径重复
DELETE FROM permissions WHERE id = 1254 AND path = '/dashboard';
-- 保留 ID: 1164

-- 3.13 /advertisement 路径重复
DELETE FROM permissions WHERE id = 1111 AND path = '/advertisement';
-- 保留 ID: 1112

-- 4. 处理名称重复的记录
-- 4.1 更新重复的名称，添加唯一标识
UPDATE permissions SET name = CONCAT(name, '_principal') WHERE id IN (1257, 1258, 1259, 1260, 1187) AND parent_id = 1203;
UPDATE permissions SET name = CONCAT(name, '_main') WHERE id IN (2008, 2009, 2010, 2011, 2013, 2014);

-- 4.2 处理"申请管理"重复
UPDATE permissions SET chinese_name = '申请管理' WHERE id = 1126 AND chinese_name IS NULL;
UPDATE permissions SET name = 'application_category' WHERE id = 1126;

-- 4.3 处理角色管理和权限管理重复
UPDATE permissions SET name = 'role_permission_management' WHERE id = 1266;
UPDATE permissions SET name = 'permission_config' WHERE id = 1267;

-- 5. 清理标记为[已清理]的记录
DELETE FROM permissions WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%';

-- 6. 更新parent_id为已删除记录的子权限
-- 将孤立的子权限移到合适的父级下
UPDATE permissions SET parent_id = NULL WHERE parent_id IN (
    SELECT id FROM (
        SELECT id FROM permissions WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%'
    ) AS temp
);

-- 7. 验证去重结果
SELECT '去重前总记录数:' as description, COUNT(*) as count FROM permissions_backup_20250722
UNION ALL
SELECT '去重后总记录数:', COUNT(*) FROM permissions
UNION ALL
SELECT '删除记录数:', (SELECT COUNT(*) FROM permissions_backup_20250722) - COUNT(*) FROM permissions;

-- 8. 检查是否还有重复
SELECT 'path重复检查:' as check_type, COUNT(*) as duplicate_count FROM (
    SELECT path, COUNT(*) as cnt FROM permissions 
    WHERE path IS NOT NULL AND path != '' 
    GROUP BY path HAVING COUNT(*) > 1
) as t
UNION ALL
SELECT 'name重复检查:', COUNT(*) FROM (
    SELECT name, COUNT(*) as cnt FROM permissions 
    WHERE name IS NOT NULL 
    GROUP BY name HAVING COUNT(*) > 1
) as t;

-- 提交事务
COMMIT;

-- 如果需要回滚，执行以下命令：
-- ROLLBACK;
-- DROP TABLE permissions;
-- CREATE TABLE permissions AS SELECT * FROM permissions_backup_20250722;