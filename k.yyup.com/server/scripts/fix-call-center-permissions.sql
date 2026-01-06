-- 为园长角色分配呼叫中心权限

-- 1. 查询园长角色ID
SELECT @principal_role_id := id FROM roles WHERE code = 'principal' LIMIT 1;

-- 2. 查询呼叫中心权限ID
SELECT @call_center_perm_id := id FROM permissions WHERE code = 'CALL_CENTER' LIMIT 1;

-- 3. 为园长角色分配呼叫中心权限（如果还没有）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
VALUES (@principal_role_id, @call_center_perm_id, NOW(), NOW());

-- 4. 验证权限分配
SELECT 
  r.id as role_id,
  r.name as role_name,
  r.code as role_code,
  p.id as permission_id,
  p.name as permission_name,
  p.code as permission_code,
  p.path as permission_path,
  p.type as permission_type
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.code = 'principal' AND (p.code = 'CALL_CENTER' OR p.code LIKE 'call_center_%')
ORDER BY p.id;

