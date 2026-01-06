-- AI性能监控页面权限配置
-- 直接插入AI性能监控权限到permissions表

-- 添加AI性能监控页面权限
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at
) VALUES
-- AI性能监控主页面
('AI Performance Monitor', 'AI性能监控', 'ai-performance-monitor', 'menu', NULL, '/ai/monitoring/AIPerformanceMonitor', 'pages/ai/monitoring/AIPerformanceMonitor.vue', 'AI_PERFORMANCE_MONITOR_ACCESS', 'Monitor', 301, 1, NOW(), NOW());

-- 显示当前插入的AI性能监控权限
SELECT
  id, name, chinese_name, code, type, path, permission, status
FROM permissions
WHERE code LIKE 'ai-performance%'
ORDER BY sort;

-- 4. 为管理员角色分配AI性能监控权限
-- 获取管理员角色ID
SET @admin_role_id = (SELECT id FROM roles WHERE code = 'admin' LIMIT 1);

-- 获取所有AI性能监控相关权限ID
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT @admin_role_id, id, NOW(), NOW()
FROM permissions 
WHERE code IN (
  'ai', 
  'ai-monitoring', 
  'ai-performance-monitor',
  'ai-performance-view',
  'ai-performance-refresh', 
  'ai-performance-export',
  'ai-performance-config'
);

-- 5. 为园长角色分配AI性能监控权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.code = 'principal' AND p.code IN (
  'ai', 
  'ai-monitoring', 
  'ai-performance-monitor',
  'ai-performance-view',
  'ai-performance-refresh'
);

-- 6. 为教师角色分配基础AI性能监控权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.code = 'teacher' AND p.code IN (
  'ai', 
  'ai-monitoring', 
  'ai-performance-monitor',
  'ai-performance-view'
);

-- 验证插入结果
SELECT 
    p.id,
    p.name,
    p.chinese_name,
    p.code,
    p.path,
    p.component,
    p.permission,
    p.icon,
    p.sort,
    p.status
FROM permissions p 
WHERE p.code LIKE '%ai-performance%' OR p.code LIKE '%ai-monitoring%'
ORDER BY p.sort;

-- 显示权限分配结果
SELECT 
  r.name as role_name,
  r.code as role_code,
  COUNT(rp.permission_id) as ai_performance_permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE 'ai-performance%' OR p.code LIKE 'ai-monitoring%' OR r.code IN ('admin', 'principal', 'teacher', 'parent')
GROUP BY r.id, r.name, r.code
ORDER BY ai_performance_permission_count DESC;

-- 显示所有AI性能监控相关的权限分配明细
SELECT 
  r.name as role_name,
  p.chinese_name as permission_name,
  p.code as permission_code,
  p.path,
  p.permission as permission_key
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE 'ai-performance%' OR p.code LIKE 'ai-monitoring%'
ORDER BY r.name, p.sort;
