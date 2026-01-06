-- 添加招生计划统计页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加招生计划统计主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('招生统计', 'ENROLLMENT_STATISTICS_VIEW', 'menu', NULL, '/enrollment-plan/statistics', 'pages/enrollment-plan/Statistics.vue', 'enrollment:statistics:view', 'icon-chart', 35, 1, NOW(), NOW());

-- 获取刚插入的招生统计菜单ID
SET @enrollment_stats_menu_id = (SELECT id FROM permissions WHERE code = 'ENROLLMENT_STATISTICS_VIEW' LIMIT 1);

-- 2. 添加招生统计子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 基础权限
('招生统计查看', 'ENROLLMENT_STATISTICS_VIEW_BASIC', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:statistics:view:basic', '', 10, 1, NOW(), NOW()),
('招生统计管理', 'ENROLLMENT_STATISTICS_MANAGE', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:statistics:manage', '', 20, 1, NOW(), NOW()),
('招生数据分析', 'ENROLLMENT_DATA_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:data:analysis', '', 30, 1, NOW(), NOW()),
('招生趋势分析', 'ENROLLMENT_TREND_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:trend:analysis', '', 40, 1, NOW(), NOW()),
-- 高级功能
('渠道统计分析', 'ENROLLMENT_CHANNEL_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:channel:analysis', '', 50, 1, NOW(), NOW()),
('班级分布统计', 'ENROLLMENT_CLASS_DISTRIBUTION', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:class:distribution', '', 60, 1, NOW(), NOW()),
('转化率分析', 'ENROLLMENT_CONVERSION_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:conversion:analysis', '', 70, 1, NOW(), NOW()),
('招生计划分析', 'ENROLLMENT_PLAN_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:plan:analysis', '', 80, 1, NOW(), NOW()),
('招生报告生成', 'ENROLLMENT_REPORT_GENERATION', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:report:generation', '', 90, 1, NOW(), NOW()),
('招生数据导出', 'ENROLLMENT_DATA_EXPORT', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:data:export', '', 100, 1, NOW(), NOW()),
('招生预测分析', 'ENROLLMENT_PREDICTION_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:prediction:analysis', '', 110, 1, NOW(), NOW()),
('招生效果评估', 'ENROLLMENT_EFFECTIVENESS_EVALUATION', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:effectiveness:evaluation', '', 120, 1, NOW(), NOW()),
('招生成本分析', 'ENROLLMENT_COST_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:cost:analysis', '', 130, 1, NOW(), NOW()),
('招生ROI分析', 'ENROLLMENT_ROI_ANALYSIS', 'button', @enrollment_stats_menu_id, '', '', 'enrollment:roi:analysis', '', 140, 1, NOW(), NOW());

-- 3. 添加招生统计相关页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 招生统计页面别名（大写S）
('招生统计页面', 'ENROLLMENT_STATISTICS_PAGE', 'menu', @enrollment_stats_menu_id, '/enrollment-plan/Statistics', 'pages/enrollment-plan/Statistics.vue', 'enrollment:statistics:page', '', 150, 1, NOW(), NOW()),
-- 招生计划管理页面
('招生计划管理页面', 'ENROLLMENT_PLAN_MANAGE_PAGE', 'menu', @enrollment_stats_menu_id, '/enrollment-plan', 'pages/enrollment-plan/PlanList.vue', 'enrollment:plan:manage:page', '', 160, 1, NOW(), NOW()),
-- 名额管理页面
('名额管理页面', 'ENROLLMENT_QUOTA_MANAGE_PAGE', 'menu', @enrollment_stats_menu_id, '/enrollment-plan/quota/:id', 'pages/enrollment-plan/QuotaManage.vue', 'enrollment:quota:manage:page', '', 170, 1, NOW(), NOW()),
-- 智能规划页面
('智能规划页面', 'ENROLLMENT_SMART_PLANNING_PAGE', 'menu', @enrollment_stats_menu_id, '/enrollment-plan/smart-planning/smart-planning', 'pages/enrollment-plan/smart-planning/smart-planning.vue', 'enrollment:smart:planning:page', '', 180, 1, NOW(), NOW());

-- 4. 为admin角色分配招生统计权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @enrollment_stats_menu_id, NOW(), NOW()
WHERE @enrollment_stats_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @enrollment_stats_menu_id;

-- 6. 为园长角色分配招生统计权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @enrollment_stats_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @enrollment_stats_menu_id IS NOT NULL;

-- 7. 为园长角色分配核心权限（查看、分析、报告、预测、效果评估、ROI分析）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @enrollment_stats_menu_id AND p.code IN ('ENROLLMENT_STATISTICS_VIEW_BASIC', 'ENROLLMENT_DATA_ANALYSIS', 'ENROLLMENT_TREND_ANALYSIS', 'ENROLLMENT_CHANNEL_ANALYSIS', 'ENROLLMENT_CONVERSION_ANALYSIS', 'ENROLLMENT_REPORT_GENERATION', 'ENROLLMENT_PREDICTION_ANALYSIS', 'ENROLLMENT_EFFECTIVENESS_EVALUATION', 'ENROLLMENT_ROI_ANALYSIS', 'ENROLLMENT_DATA_EXPORT');

-- 8. 为招生专员角色分配权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @enrollment_stats_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('招生专员', '招生老师', '招生主管') AND @enrollment_stats_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('招生专员', '招生老师', '招生主管') AND p.parent_id = @enrollment_stats_menu_id;

-- 9. 为数据分析师角色分配分析权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '数据分析师' AND p.parent_id = @enrollment_stats_menu_id AND p.code IN ('ENROLLMENT_STATISTICS_VIEW_BASIC', 'ENROLLMENT_DATA_ANALYSIS', 'ENROLLMENT_TREND_ANALYSIS', 'ENROLLMENT_CHANNEL_ANALYSIS', 'ENROLLMENT_CONVERSION_ANALYSIS', 'ENROLLMENT_PLAN_ANALYSIS', 'ENROLLMENT_PREDICTION_ANALYSIS', 'ENROLLMENT_COST_ANALYSIS', 'ENROLLMENT_ROI_ANALYSIS', 'ENROLLMENT_DATA_EXPORT');

-- 10. 为教务主任角色分配管理权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '教务主任' AND p.parent_id = @enrollment_stats_menu_id AND p.code IN ('ENROLLMENT_STATISTICS_VIEW_BASIC', 'ENROLLMENT_STATISTICS_MANAGE', 'ENROLLMENT_DATA_ANALYSIS', 'ENROLLMENT_CLASS_DISTRIBUTION', 'ENROLLMENT_PLAN_ANALYSIS', 'ENROLLMENT_REPORT_GENERATION', 'ENROLLMENT_DATA_EXPORT');

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
WHERE p.code LIKE '%ENROLLMENT%'
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
WHERE p.code LIKE '%ENROLLMENT%'
ORDER BY r.name, p.sort;

COMMIT;
