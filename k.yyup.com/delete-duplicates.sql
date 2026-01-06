-- =====================================================
-- 手动删除权限重复记录
-- 基于检查脚本的分析结果，逐条删除重复记录
-- =====================================================

-- 1. 备份当前权限表
CREATE TABLE IF NOT EXISTS permissions_backup_20250724 AS 
SELECT * FROM permissions;

-- 2. 备份角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions_backup_20250724 AS 
SELECT * FROM role_permissions;

-- 开始事务
START TRANSACTION;

-- =====================================================
-- 删除重复路径的权限记录
-- 保留功能最完整、最早创建的记录
-- =====================================================

-- 1. /ai 路径重复 (保留 2026，删除 2128, 2129)
-- 分析：2026是最早的AI助手记录，2128和2129是后来添加的重复
-- 先转移角色关联到保留的记录
UPDATE role_permissions SET permission_id = 2026 WHERE permission_id IN (2128, 2129);
-- 删除重复记录
DELETE FROM permissions WHERE id IN (2128, 2129);

-- 2. /class 路径重复 (保留 1262，删除 2028, 2030)
-- 分析：1262是最早的班级管理记录，功能最完整
-- 先转移角色关联
UPDATE role_permissions SET permission_id = 1262 WHERE permission_id IN (2028, 2030);
-- 删除重复记录
DELETE FROM permissions WHERE id IN (2028, 2030);

-- 3. /activities 路径重复 (保留 2120，删除 2121)
-- 分析：2120是父级菜单，2121是子级列表，但路径重复了
-- 修改2121的路径而不是删除，因为它是有意义的子菜单
UPDATE permissions SET path = '/activities/list' WHERE id = 2121;

-- 4. /enrollment-plans 路径重复 (保留 2113，删除 2114)
-- 分析：2113是父级菜单，2114是子级列表，但路径重复了
-- 修改2114的路径而不是删除
UPDATE permissions SET path = '/enrollment-plans/list' WHERE id = 2114;

-- 5. /principal/dashboard 路径重复 (保留 1205，删除 2037)
-- 分析：1205是原始的仪表板记录，2037是重复的园长仪表板
-- 先转移角色关联
UPDATE role_permissions SET permission_id = 1205 WHERE permission_id = 2037;
-- 删除重复记录
DELETE FROM permissions WHERE id = 2037;

-- 6. /statistics 路径重复 (保留 1214，删除 2038)
-- 分析：1214是原始的统计分析记录，2038是重复的
-- 先转移角色关联
UPDATE role_permissions SET permission_id = 1214 WHERE permission_id = 2038;
-- 删除重复记录
DELETE FROM permissions WHERE id = 2038;

-- =====================================================
-- 删除重复名称但功能相同的权限记录
-- =====================================================

-- 7. 系统管理相关重复
-- 权限管理：保留 1238 (/system/permissions)，删除 1230, 1267
UPDATE role_permissions SET permission_id = 1238 WHERE permission_id IN (1230, 1267);
DELETE FROM permissions WHERE id IN (1230, 1267);

-- 角色管理：保留 1241 (/system/roles)，删除 1231, 1266
UPDATE role_permissions SET permission_id = 1241 WHERE permission_id IN (1231, 1266);
DELETE FROM permissions WHERE id IN (1231, 1266);

-- 用户管理：保留 1243 (/system/users)，删除 1233
UPDATE role_permissions SET permission_id = 1243 WHERE permission_id = 1233;
DELETE FROM permissions WHERE id = 1233;

-- 8. 家长管理相关重复
-- 保留 1201 (/parent)，删除 1261, 2094
UPDATE role_permissions SET permission_id = 1201 WHERE permission_id IN (1261, 2094);
DELETE FROM permissions WHERE id IN (1261, 2094);

-- 9. 活动管理相关重复
-- 保留 2120 (/activities)，删除 1203, 2029
UPDATE role_permissions SET permission_id = 2120 WHERE permission_id IN (1203, 2029);
DELETE FROM permissions WHERE id IN (1203, 2029);

-- 10. 营销管理相关重复
-- 保留 1096 (/marketing)，删除 1187, 2014
UPDATE role_permissions SET permission_id = 1096 WHERE permission_id IN (1187, 2014);
DELETE FROM permissions WHERE id IN (1187, 2014);

-- 11. 学生管理相关重复
-- 保留 1259 (/principal/students)，删除 2010
UPDATE role_permissions SET permission_id = 1259 WHERE permission_id = 2010;
DELETE FROM permissions WHERE id = 2010;

-- 12. 教师管理相关重复
-- 保留 1260 (/principal/teachers)，删除 2011
UPDATE role_permissions SET permission_id = 1260 WHERE permission_id = 2011;
DELETE FROM permissions WHERE id = 2011;

-- 13. 招生管理相关重复
-- 保留 2049 (/enrollment)，删除 2008
UPDATE role_permissions SET permission_id = 2049 WHERE permission_id = 2008;
DELETE FROM permissions WHERE id = 2008;

-- 14. 招生计划相关重复
-- 保留 1095 (/enrollment-plan)，删除 1263
UPDATE role_permissions SET permission_id = 1095 WHERE permission_id = 1263;
DELETE FROM permissions WHERE id = 1263;

-- 15. 数据分析相关重复
-- 保留 1125 (/analytics)，删除 1151
UPDATE role_permissions SET permission_id = 1125 WHERE permission_id = 1151;
DELETE FROM permissions WHERE id = 1151;

-- 16. 客户管理相关重复
-- 保留 1148 (/customer)，删除 1350
UPDATE role_permissions SET permission_id = 1148 WHERE permission_id = 1350;
DELETE FROM permissions WHERE id = 1350;

-- 17. 申请管理相关重复
-- 保留 1091 (/application)，删除 1126
UPDATE role_permissions SET permission_id = 1091 WHERE permission_id = 1126;
DELETE FROM permissions WHERE id = 1126;

-- 18. 系统管理相关重复
-- 保留 2013 (#system)，删除 1255
UPDATE role_permissions SET permission_id = 2013 WHERE permission_id = 1255;
DELETE FROM permissions WHERE id = 1255;

-- =====================================================
-- 删除重复的按钮权限
-- =====================================================

-- 19. 家长搜索相关重复按钮
-- 保留 2080，删除 2101
UPDATE role_permissions SET permission_id = 2080 WHERE permission_id = 2101;
DELETE FROM permissions WHERE id = 2101;

-- 20. 批量操作相关重复按钮
-- 保留 2083，删除 2100
UPDATE role_permissions SET permission_id = 2083 WHERE permission_id = 2100;
DELETE FROM permissions WHERE id = 2100;

-- 21. 编辑家长相关重复
-- 保留 1195，删除 2097
UPDATE role_permissions SET permission_id = 1195 WHERE permission_id = 2097;
DELETE FROM permissions WHERE id = 2097;

-- 22. AI助手相关重复
-- 保留 2026，删除 2035
UPDATE role_permissions SET permission_id = 2026 WHERE permission_id = 2035;
DELETE FROM permissions WHERE id = 2035;

-- 23. 班级列表相关重复
-- 保留 1155，删除重复的班级列表功能（已在前面处理）

-- 24. Id详情相关重复（这些实际上是不同页面的详情，保留所有）
-- 1138: /class/detail/:id
-- 1142: /class/smart-management/:id  
-- 1253: /teacher/performance/:id
-- 这些是不同功能的详情页面，不删除

-- 25. 活动统计重复
-- 保留 2126 (/activities/statistics)，删除 2043
UPDATE role_permissions SET permission_id = 2126 WHERE permission_id = 2043;
DELETE FROM permissions WHERE id = 2043;

-- =====================================================
-- 验证删除结果
-- =====================================================

-- 检查是否还有重复的路径
SELECT '重复路径检查' as check_type, path, COUNT(*) as count
FROM permissions 
WHERE path IS NOT NULL AND path != '' 
GROUP BY path 
HAVING COUNT(*) > 1;

-- 检查是否还有重复的名称
SELECT '重复名称检查' as check_type, name, COUNT(*) as count
FROM permissions 
WHERE name IS NOT NULL AND name != '' 
GROUP BY name 
HAVING COUNT(*) > 1;

-- 统计删除前后的记录数
SELECT 
  '删除前记录数' as description, 
  COUNT(*) as count 
FROM permissions_backup_20250724
UNION ALL
SELECT 
  '删除后记录数', 
  COUNT(*) 
FROM permissions
UNION ALL
SELECT 
  '删除的记录数', 
  (SELECT COUNT(*) FROM permissions_backup_20250724) - COUNT(*) 
FROM permissions;

-- 检查是否有孤立的角色权限关联
SELECT '孤立关联检查' as check_type, COUNT(*) as count
FROM role_permissions rp 
LEFT JOIN permissions p ON rp.permission_id = p.id 
WHERE p.id IS NULL;

-- =====================================================
-- 提交事务（确认无误后取消注释）
-- =====================================================

-- 如果验证结果正确，取消下面的注释提交事务
-- COMMIT;

-- 如果有问题，运行下面的回滚
-- ROLLBACK;
