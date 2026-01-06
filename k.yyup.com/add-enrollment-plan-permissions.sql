-- 添加招生计划管理页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加招生计划管理主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('招生计划', 'ENROLLMENT_PLAN_MANAGE', 'menu', NULL, '/enrollment-plan', 'layouts/default/index.vue', 'enrollment:plan:manage', 'icon-flag', 30, 1, NOW(), NOW());

-- 获取刚插入的招生计划菜单ID
SET @enrollment_plan_menu_id = (SELECT id FROM permissions WHERE code = 'ENROLLMENT_PLAN_MANAGE' LIMIT 1);

-- 2. 添加招生计划子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 计划列表页面
('计划列表', 'ENROLLMENT_PLAN_LIST', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/list', 'pages/enrollment-plan/PlanList.vue', 'enrollment:plan:list', 'icon-tickets', 10, 1, NOW(), NOW()),
-- 计划表单页面
('计划表单', 'ENROLLMENT_PLAN_FORM', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/PlanForm', 'pages/enrollment-plan/PlanForm.vue', 'enrollment:plan:form', 'icon-edit', 20, 1, NOW(), NOW()),
-- 计划编辑页面
('计划编辑', 'ENROLLMENT_PLAN_EDIT', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/PlanEdit', 'pages/enrollment-plan/PlanEdit.vue', 'enrollment:plan:edit', 'icon-edit-outline', 30, 1, NOW(), NOW()),
-- 计划详情页面
('计划详情', 'ENROLLMENT_PLAN_DETAIL', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/PlanDetail', 'pages/enrollment-plan/PlanDetail.vue', 'enrollment:plan:detail', 'icon-view', 40, 1, NOW(), NOW()),
-- 创建计划页面
('创建计划', 'ENROLLMENT_PLAN_CREATE', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/create', 'pages/enrollment-plan/PlanEdit.vue', 'enrollment:plan:create', 'icon-plus', 50, 1, NOW(), NOW()),
-- 名额管理页面
('名额管理', 'ENROLLMENT_QUOTA_MANAGE', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/quota/:id', 'pages/enrollment-plan/QuotaManage.vue', 'enrollment:quota:manage', 'icon-pie-chart', 60, 1, NOW(), NOW()),
-- 招生统计页面
('招生统计', 'ENROLLMENT_PLAN_STATISTICS', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/statistics', 'pages/enrollment-plan/Statistics.vue', 'enrollment:plan:statistics', 'icon-data-analysis', 70, 1, NOW(), NOW());

-- 获取计划列表页面ID
SET @plan_list_id = (SELECT id FROM permissions WHERE code = 'ENROLLMENT_PLAN_LIST' LIMIT 1);

-- 3. 添加计划列表页面的操作权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 基础权限
('查看计划列表', 'ENROLLMENT_PLAN_LIST_VIEW', 'button', @plan_list_id, '', '', 'enrollment:plan:list:view', '', 10, 1, NOW(), NOW()),
('搜索计划', 'ENROLLMENT_PLAN_SEARCH', 'button', @plan_list_id, '', '', 'enrollment:plan:search', '', 20, 1, NOW(), NOW()),
('筛选计划', 'ENROLLMENT_PLAN_FILTER', 'button', @plan_list_id, '', '', 'enrollment:plan:filter', '', 30, 1, NOW(), NOW()),
-- 操作权限
('创建计划', 'ENROLLMENT_PLAN_CREATE_BTN', 'button', @plan_list_id, '', '', 'enrollment:plan:create', '', 40, 1, NOW(), NOW()),
('编辑计划', 'ENROLLMENT_PLAN_EDIT_BTN', 'button', @plan_list_id, '', '', 'enrollment:plan:edit', '', 50, 1, NOW(), NOW()),
('删除计划', 'ENROLLMENT_PLAN_DELETE', 'button', @plan_list_id, '', '', 'enrollment:plan:delete', '', 60, 1, NOW(), NOW()),
('复制计划', 'ENROLLMENT_PLAN_COPY', 'button', @plan_list_id, '', '', 'enrollment:plan:copy', '', 70, 1, NOW(), NOW()),
-- 状态管理
('启用计划', 'ENROLLMENT_PLAN_ENABLE', 'button', @plan_list_id, '', '', 'enrollment:plan:enable', '', 80, 1, NOW(), NOW()),
('禁用计划', 'ENROLLMENT_PLAN_DISABLE', 'button', @plan_list_id, '', '', 'enrollment:plan:disable', '', 90, 1, NOW(), NOW()),
('发布计划', 'ENROLLMENT_PLAN_PUBLISH', 'button', @plan_list_id, '', '', 'enrollment:plan:publish', '', 100, 1, NOW(), NOW()),
-- 数据操作
('导出计划', 'ENROLLMENT_PLAN_EXPORT', 'button', @plan_list_id, '', '', 'enrollment:plan:export', '', 110, 1, NOW(), NOW()),
('导入计划', 'ENROLLMENT_PLAN_IMPORT', 'button', @plan_list_id, '', '', 'enrollment:plan:import', '', 120, 1, NOW(), NOW()),
('批量操作', 'ENROLLMENT_PLAN_BATCH', 'button', @plan_list_id, '', '', 'enrollment:plan:batch', '', 130, 1, NOW(), NOW());

-- 4. 为admin角色分配所有招生计划权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, id, NOW(), NOW() 
FROM permissions 
WHERE code LIKE 'ENROLLMENT_PLAN_%' OR code LIKE 'ENROLLMENT_QUOTA_%';

-- 5. 为principal角色分配招生计划权限（除了删除权限）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 2, id, NOW(), NOW() 
FROM permissions 
WHERE (code LIKE 'ENROLLMENT_PLAN_%' OR code LIKE 'ENROLLMENT_QUOTA_%')
AND code NOT IN ('ENROLLMENT_PLAN_DELETE');

-- 6. 为teacher角色分配基础查看权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 3, id, NOW(), NOW() 
FROM permissions 
WHERE code IN (
    'ENROLLMENT_PLAN_MANAGE',
    'ENROLLMENT_PLAN_LIST', 
    'ENROLLMENT_PLAN_LIST_VIEW',
    'ENROLLMENT_PLAN_DETAIL',
    'ENROLLMENT_PLAN_SEARCH',
    'ENROLLMENT_PLAN_FILTER',
    'ENROLLMENT_PLAN_STATISTICS'
);

COMMIT;

-- 验证权限是否正确添加
SELECT 
    p.id,
    p.name,
    p.code,
    p.type,
    p.path,
    p.component,
    p.permission,
    p.parent_id,
    parent.name as parent_name
FROM permissions p
LEFT JOIN permissions parent ON p.parent_id = parent.id
WHERE p.code LIKE 'ENROLLMENT_PLAN_%' OR p.code LIKE 'ENROLLMENT_QUOTA_%'
ORDER BY p.parent_id, p.sort;
