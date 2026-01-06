-- 启用督查中心权限
-- 执行时间: 2025-10-08

-- 1. 检查督查中心权限是否存在
SELECT '=== 检查督查中心权限 ===' AS step;
SELECT id, name, chinese_name, code, type, path, component, status 
FROM permissions 
WHERE code = 'INSPECTION_CENTER' OR id = 5001;

-- 2. 更新或插入督查中心权限
SELECT '=== 更新/插入督查中心权限 ===' AS step;
INSERT INTO permissions (
  id,
  name,
  chinese_name,
  code,
  type,
  parent_id,
  path,
  component,
  file_path,
  permission,
  icon,
  sort,
  status,
  created_at,
  updated_at
) VALUES (
  5001,
  'Inspection Center',
  '督查中心',
  'INSPECTION_CENTER',
  'menu',
  NULL,
  '/centers/inspection',
  'InspectionCenter',
  'pages/centers/InspectionCenter.vue',
  'INSPECTION_CENTER',
  'inspection',
  13,
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '督查中心',
  path = '/centers/inspection',
  component = 'InspectionCenter',
  file_path = 'pages/centers/InspectionCenter.vue',
  status = 1,
  sort = 13,
  updated_at = NOW();

-- 3. 验证督查中心权限
SELECT '=== 验证督查中心权限 ===' AS step;
SELECT id, name, chinese_name, code, type, path, component, status 
FROM permissions 
WHERE code = 'INSPECTION_CENTER';

-- 4. 为Admin角色分配督查中心权限
SELECT '=== 为Admin角色分配督查中心权限 ===' AS step;

-- 先检查Admin角色ID
SELECT id, name, code FROM roles WHERE code = 'ADMIN' OR name = 'Admin';

-- 为Admin角色添加督查中心权限（如果不存在）
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, 5001, NOW(), NOW()
FROM roles r
WHERE (r.code = 'ADMIN' OR r.name = 'Admin')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = 5001
);

-- 5. 验证角色权限分配
SELECT '=== 验证Admin角色的督查中心权限 ===' AS step;
SELECT 
  r.id AS role_id,
  r.name AS role_name,
  p.id AS permission_id,
  p.name AS permission_name,
  p.chinese_name,
  p.path
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE (r.code = 'ADMIN' OR r.name = 'Admin')
AND p.code = 'INSPECTION_CENTER';

-- 6. 显示所有活跃的中心权限
SELECT '=== 所有活跃的中心权限 ===' AS step;
SELECT 
  id,
  name,
  chinese_name,
  code,
  path,
  sort,
  status
FROM permissions
WHERE type = 'menu'
AND path LIKE '/centers/%'
AND status = 1
ORDER BY sort;

SELECT '=== 督查中心启用完成 ===' AS step;

