-- 添加仪表板页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加仪表板主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('仪表板', 'DASHBOARD_VIEW', 'menu', NULL, '/dashboard', 'pages/dashboard/index.vue', 'dashboard:view', 'icon-dashboard', 10, 1, NOW(), NOW());

-- 获取刚插入的仪表板菜单ID
SET @dashboard_menu_id = (SELECT id FROM permissions WHERE code = 'DASHBOARD_VIEW' LIMIT 1);

-- 2. 添加仪表板子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 基础查看权限
('仪表板查看', 'DASHBOARD_VIEW_BASIC', 'button', @dashboard_menu_id, '', '', 'dashboard:view:basic', '', 10, 1, NOW(), NOW()),
-- 统计数据查看
('统计数据查看', 'DASHBOARD_STATS_VIEW', 'button', @dashboard_menu_id, '', '', 'dashboard:stats:view', '', 20, 1, NOW(), NOW()),
-- 概览数据查看
('概览数据查看', 'DASHBOARD_OVERVIEW_VIEW', 'button', @dashboard_menu_id, '', '', 'dashboard:overview:view', '', 30, 1, NOW(), NOW()),
-- 待办事项查看
('待办事项查看', 'DASHBOARD_TODOS_VIEW', 'button', @dashboard_menu_id, '', '', 'dashboard:todos:view', '', 40, 1, NOW(), NOW()),
-- 日程安排查看
('日程安排查看', 'DASHBOARD_SCHEDULES_VIEW', 'button', @dashboard_menu_id, '', '', 'dashboard:schedules:view', '', 50, 1, NOW(), NOW()),
-- 最近活动查看
('最近活动查看', 'DASHBOARD_ACTIVITIES_VIEW', 'button', @dashboard_menu_id, '', '', 'dashboard:activities:view', '', 60, 1, NOW(), NOW()),
-- 数据刷新
('数据刷新', 'DASHBOARD_REFRESH', 'button', @dashboard_menu_id, '', '', 'dashboard:refresh', '', 70, 1, NOW(), NOW()),
-- 数据导出
('仪表板数据导出', 'DASHBOARD_EXPORT', 'button', @dashboard_menu_id, '', '', 'dashboard:export', '', 80, 1, NOW(), NOW()),
-- 个性化设置
('仪表板个性化', 'DASHBOARD_CUSTOMIZE', 'button', @dashboard_menu_id, '', '', 'dashboard:customize', '', 90, 1, NOW(), NOW()),
-- 高级分析
('高级分析', 'DASHBOARD_ADVANCED_ANALYTICS', 'button', @dashboard_menu_id, '', '', 'dashboard:analytics:advanced', '', 100, 1, NOW(), NOW());

-- 3. 添加仪表板子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 性能仪表板
('性能仪表板', 'DASHBOARD_PERFORMANCE_PAGE', 'menu', @dashboard_menu_id, '/dashboard/performance', 'pages/dashboard/Performance.vue', 'dashboard:performance:page', '', 110, 1, NOW(), NOW()),
-- 日程仪表板
('日程仪表板', 'DASHBOARD_SCHEDULE_PAGE', 'menu', @dashboard_menu_id, '/dashboard/schedule', 'pages/dashboard/Schedule.vue', 'dashboard:schedule:page', '', 120, 1, NOW(), NOW());

-- 4. 为admin角色分配仪表板权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @dashboard_menu_id, NOW(), NOW()
WHERE @dashboard_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @dashboard_menu_id;

-- 6. 为园长角色分配仪表板权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @dashboard_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @dashboard_menu_id IS NOT NULL;

-- 7. 为园长角色分配核心权限（查看、统计、概览、活动、高级分析）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @dashboard_menu_id AND p.code IN ('DASHBOARD_VIEW_BASIC', 'DASHBOARD_STATS_VIEW', 'DASHBOARD_OVERVIEW_VIEW', 'DASHBOARD_ACTIVITIES_VIEW', 'DASHBOARD_ADVANCED_ANALYTICS');

-- 8. 为教师角色分配基础权限（查看、待办、日程）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '教师' AND p.parent_id = @dashboard_menu_id AND p.code IN ('DASHBOARD_VIEW_BASIC', 'DASHBOARD_TODOS_VIEW', 'DASHBOARD_SCHEDULES_VIEW', 'DASHBOARD_ACTIVITIES_VIEW');

-- 9. 为所有员工角色分配基础查看权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('员工', '职员', '助教', '保育员') AND p.parent_id = @dashboard_menu_id AND p.code = 'DASHBOARD_VIEW_BASIC';

-- 10. 为管理层角色分配完整权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @dashboard_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('副园长', '主任', '部门经理') AND @dashboard_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('副园长', '主任', '部门经理') AND p.parent_id = @dashboard_menu_id;

-- 验证插入结果
SELECT 
    p.id,
    p.name,
    p.code,
    p.path,
    p.component,
    p.permission,
    p.icon,
    p.sort,
    p.status
FROM permissions p 
WHERE p.code LIKE '%DASHBOARD%'
ORDER BY p.sort;

-- 验证角色权限分配
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.code as permission_code,
    p.path as permission_path
FROM role_permissions rp
INNER JOIN roles r ON rp.role_id = r.id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE '%DASHBOARD%'
ORDER BY r.name, p.sort;

COMMIT;
