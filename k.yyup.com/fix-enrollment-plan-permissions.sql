-- 修复招生计划页面权限配置
-- 自动生成时间: 2025-01-23

START TRANSACTION;

-- 1. 添加招生计划管理主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('招生计划管理', 'ENROLLMENT_PLAN_MANAGE', 'menu', NULL, '/enrollment-plan', 'layouts/default/index.vue', 'enrollment:plan:manage', 'el-icon-s-flag', 30, 1, NOW(), NOW());

-- 获取刚插入的招生计划菜单ID
SET @enrollment_plan_menu_id = (SELECT id FROM permissions WHERE code = 'ENROLLMENT_PLAN_MANAGE' LIMIT 1);

-- 2. 添加招生计划子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 计划列表页面 (对应 /enrollment-plan/list)
('计划列表', 'ENROLLMENT_PLAN_LIST', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/list', 'pages/enrollment-plan/PlanList.vue', 'enrollment:plan:list', 'el-icon-tickets', 10, 1, NOW(), NOW()),
-- 计划表单页面 (对应 /enrollment-plan/PlanForm)
('计划表单', 'ENROLLMENT_PLAN_FORM', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/PlanForm', 'pages/enrollment-plan/PlanForm.vue', 'enrollment:plan:form', 'el-icon-edit', 20, 1, NOW(), NOW()),
-- 计划编辑页面 (对应 /enrollment-plan/PlanEdit)
('计划编辑', 'ENROLLMENT_PLAN_EDIT', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/PlanEdit', 'pages/enrollment-plan/PlanEdit.vue', 'enrollment:plan:edit', 'el-icon-edit-outline', 30, 1, NOW(), NOW()),
-- 计划详情页面 (对应 /enrollment-plan/PlanDetail)
('计划详情', 'ENROLLMENT_PLAN_DETAIL', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/PlanDetail', 'pages/enrollment-plan/PlanDetail.vue', 'enrollment:plan:detail', 'el-icon-view', 40, 1, NOW(), NOW()),
-- 创建计划页面
('创建计划', 'ENROLLMENT_PLAN_CREATE', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/create', 'pages/enrollment-plan/PlanEdit.vue', 'enrollment:plan:create', 'el-icon-plus', 50, 1, NOW(), NOW()),
-- 名额管理页面
('名额管理', 'ENROLLMENT_QUOTA_MANAGE', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/quota/:id', 'pages/enrollment-plan/QuotaManage.vue', 'enrollment:quota:manage', 'el-icon-pie-chart', 60, 1, NOW(), NOW()),
-- 招生统计页面
('招生统计', 'ENROLLMENT_PLAN_STATISTICS', 'menu', @enrollment_plan_menu_id, '/enrollment-plan/statistics', 'pages/enrollment-plan/Statistics.vue', 'enrollment:plan:statistics', 'el-icon-data-analysis', 70, 1, NOW(), NOW());

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

-- 7. 添加活动模板管理权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES
('活动模板管理', 'ACTIVITY_TEMPLATE_MANAGE', 'menu', NULL, '/activity/ActivityTemplate', 'pages/activity/ActivityTemplate.vue', 'activity:template:manage', 'el-icon-document', 50, 1, NOW(), NOW());

-- 获取活动模板菜单ID
SET @activity_template_menu_id = (SELECT id FROM permissions WHERE code = 'ACTIVITY_TEMPLATE_MANAGE' LIMIT 1);

-- 8. 添加活动模板操作权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES
-- 基础权限
('查看模板列表', 'ACTIVITY_TEMPLATE_VIEW', 'button', @activity_template_menu_id, '', '', 'activity:template:view', '', 10, 1, NOW(), NOW()),
('搜索模板', 'ACTIVITY_TEMPLATE_SEARCH', 'button', @activity_template_menu_id, '', '', 'activity:template:search', '', 20, 1, NOW(), NOW()),
('筛选模板', 'ACTIVITY_TEMPLATE_FILTER', 'button', @activity_template_menu_id, '', '', 'activity:template:filter', '', 30, 1, NOW(), NOW()),
-- 操作权限
('创建模板', 'ACTIVITY_TEMPLATE_CREATE', 'button', @activity_template_menu_id, '', '', 'activity:template:create', '', 40, 1, NOW(), NOW()),
('编辑模板', 'ACTIVITY_TEMPLATE_EDIT', 'button', @activity_template_menu_id, '', '', 'activity:template:edit', '', 50, 1, NOW(), NOW()),
('删除模板', 'ACTIVITY_TEMPLATE_DELETE', 'button', @activity_template_menu_id, '', '', 'activity:template:delete', '', 60, 1, NOW(), NOW()),
('复制模板', 'ACTIVITY_TEMPLATE_COPY', 'button', @activity_template_menu_id, '', '', 'activity:template:copy', '', 70, 1, NOW(), NOW()),
('预览模板', 'ACTIVITY_TEMPLATE_PREVIEW', 'button', @activity_template_menu_id, '', '', 'activity:template:preview', '', 80, 1, NOW(), NOW()),
('使用模板', 'ACTIVITY_TEMPLATE_USE', 'button', @activity_template_menu_id, '', '', 'activity:template:use', '', 90, 1, NOW(), NOW()),
-- 状态管理
('启用模板', 'ACTIVITY_TEMPLATE_ENABLE', 'button', @activity_template_menu_id, '', '', 'activity:template:enable', '', 100, 1, NOW(), NOW()),
('禁用模板', 'ACTIVITY_TEMPLATE_DISABLE', 'button', @activity_template_menu_id, '', '', 'activity:template:disable', '', 110, 1, NOW(), NOW()),
-- 数据操作
('导出模板', 'ACTIVITY_TEMPLATE_EXPORT', 'button', @activity_template_menu_id, '', '', 'activity:template:export', '', 120, 1, NOW(), NOW()),
('导入模板', 'ACTIVITY_TEMPLATE_IMPORT', 'button', @activity_template_menu_id, '', '', 'activity:template:import', '', 130, 1, NOW(), NOW());

-- 9. 为admin角色分配活动模板权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, id, NOW(), NOW()
FROM permissions
WHERE code LIKE 'ACTIVITY_TEMPLATE_%';

-- 10. 为principal角色分配活动模板权限（除了删除权限）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 2, id, NOW(), NOW()
FROM permissions
WHERE code LIKE 'ACTIVITY_TEMPLATE_%'
AND code NOT IN ('ACTIVITY_TEMPLATE_DELETE');

-- 11. 为teacher角色分配基础查看权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 3, id, NOW(), NOW()
FROM permissions
WHERE code IN (
    'ACTIVITY_TEMPLATE_MANAGE',
    'ACTIVITY_TEMPLATE_VIEW',
    'ACTIVITY_TEMPLATE_SEARCH',
    'ACTIVITY_TEMPLATE_FILTER',
    'ACTIVITY_TEMPLATE_PREVIEW',
    'ACTIVITY_TEMPLATE_USE'
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
WHERE p.code LIKE 'ENROLLMENT_PLAN_%' OR p.code LIKE 'ENROLLMENT_QUOTA_%' OR p.code LIKE 'ACTIVITY_TEMPLATE_%'
ORDER BY p.parent_id, p.sort;
