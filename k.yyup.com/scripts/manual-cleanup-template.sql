-- =====================================================
-- 手动清理权限重复记录模板
-- 使用前请先运行检查脚本确认重复记录
-- 执行前请备份数据库！
-- =====================================================

-- 1. 备份当前权限表
CREATE TABLE IF NOT EXISTS permissions_backup_manual AS 
SELECT * FROM permissions;

-- 2. 备份角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions_backup_manual AS 
SELECT * FROM role_permissions;

-- 开始事务
START TRANSACTION;

-- =====================================================
-- 手动删除重复权限记录
-- 请根据检查脚本的结果，手动填写要删除的权限ID
-- =====================================================

-- 示例：删除重复的权限记录
-- 步骤1：先删除角色权限关联
-- DELETE FROM role_permissions WHERE permission_id IN (要删除的权限ID列表);

-- 步骤2：再删除权限记录
-- DELETE FROM permissions WHERE id IN (要删除的权限ID列表);

-- =====================================================
-- 具体删除操作（请根据实际情况修改）
-- =====================================================

-- 示例1：删除重复的 /class 路径权限
-- 假设检查后发现ID 2012, 1139, 1262 是重复的，保留 1133
-- DELETE FROM role_permissions WHERE permission_id IN (2012, 1139, 1262);
-- DELETE FROM permissions WHERE id IN (2012, 1139, 1262);

-- 示例2：删除重复的 /dashboard 路径权限
-- 假设检查后发现ID 2001 是重复的，保留其他
-- DELETE FROM role_permissions WHERE permission_id = 2001;
-- DELETE FROM permissions WHERE id = 2001;

-- =====================================================
-- 请在下面添加实际的删除语句
-- =====================================================

-- TODO: 根据检查脚本的结果，在这里添加具体的删除语句

-- 删除重复权限的角色关联
-- DELETE FROM role_permissions WHERE permission_id IN ();

-- 删除重复权限记录
-- DELETE FROM permissions WHERE id IN ();

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

-- 检查是否还有重复的代码
SELECT '重复代码检查' as check_type, code, COUNT(*) as count
FROM permissions 
WHERE code IS NOT NULL AND code != '' 
GROUP BY code 
HAVING COUNT(*) > 1;

-- 统计删除前后的记录数
SELECT 
  '删除前记录数' as description, 
  COUNT(*) as count 
FROM permissions_backup_manual
UNION ALL
SELECT 
  '删除后记录数', 
  COUNT(*) 
FROM permissions
UNION ALL
SELECT 
  '删除的记录数', 
  (SELECT COUNT(*) FROM permissions_backup_manual) - COUNT(*) 
FROM permissions;

-- =====================================================
-- 如果验证无误，提交事务
-- 如果有问题，回滚事务
-- =====================================================

-- 提交事务（确认删除无误后取消注释）
-- COMMIT;

-- 回滚事务（如果有问题）
-- ROLLBACK;

-- =====================================================
-- 清理备份表（可选，建议保留一段时间）
-- =====================================================

-- 删除备份表（谨慎操作）
-- DROP TABLE IF EXISTS permissions_backup_manual;
-- DROP TABLE IF EXISTS role_permissions_backup_manual;
