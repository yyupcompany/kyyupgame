-- 添加客户管理页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加客户管理主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('客户管理', 'CUSTOMER_MANAGE', 'menu', NULL, '/customer', 'pages/customer/index.vue', 'customer:manage', 'icon-postcard', 70, 1, NOW(), NOW());

-- 获取刚插入的客户管理菜单ID
SET @customer_menu_id = (SELECT id FROM permissions WHERE code = 'CUSTOMER_MANAGE' LIMIT 1);

-- 2. 添加客户管理子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 基础权限
('客户查看', 'CUSTOMER_VIEW', 'button', @customer_menu_id, '', '', 'customer:view', '', 10, 1, NOW(), NOW()),
('客户创建', 'CUSTOMER_CREATE', 'button', @customer_menu_id, '', '', 'customer:create', '', 20, 1, NOW(), NOW()),
('客户编辑', 'CUSTOMER_UPDATE', 'button', @customer_menu_id, '', '', 'customer:update', '', 30, 1, NOW(), NOW()),
('客户删除', 'CUSTOMER_DELETE', 'button', @customer_menu_id, '', '', 'customer:delete', '', 40, 1, NOW(), NOW()),
-- 高级功能
('客户搜索', 'CUSTOMER_SEARCH', 'button', @customer_menu_id, '', '', 'customer:search', '', 50, 1, NOW(), NOW()),
('客户导入', 'CUSTOMER_IMPORT', 'button', @customer_menu_id, '', '', 'customer:import', '', 60, 1, NOW(), NOW()),
('客户导出', 'CUSTOMER_EXPORT', 'button', @customer_menu_id, '', '', 'customer:export', '', 70, 1, NOW(), NOW()),
('客户跟进', 'CUSTOMER_FOLLOW', 'button', @customer_menu_id, '', '', 'customer:follow', '', 80, 1, NOW(), NOW()),
('客户分配', 'CUSTOMER_ASSIGN', 'button', @customer_menu_id, '', '', 'customer:assign', '', 90, 1, NOW(), NOW()),
('客户分析', 'CUSTOMER_ANALYTICS_VIEW', 'button', @customer_menu_id, '', '', 'customer:analytics:view', '', 100, 1, NOW(), NOW()),
('客户统计', 'CUSTOMER_STATISTICS', 'button', @customer_menu_id, '', '', 'customer:statistics', '', 110, 1, NOW(), NOW()),
('客户池管理', 'CUSTOMER_POOL_MANAGE', 'button', @customer_menu_id, '', '', 'customer:pool:manage', '', 120, 1, NOW(), NOW()),
('客户状态更新', 'CUSTOMER_STATUS_UPDATE', 'button', @customer_menu_id, '', '', 'customer:status:update', '', 130, 1, NOW(), NOW()),
('客户联系记录', 'CUSTOMER_CONTACT_RECORD', 'button', @customer_menu_id, '', '', 'customer:contact:record', '', 140, 1, NOW(), NOW());

-- 3. 添加客户管理子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 客户详情页面
('客户详情页面', 'CUSTOMER_DETAIL_PAGE', 'menu', @customer_menu_id, '/customer/:id', 'pages/customer/detail/CustomerDetail.vue', 'customer:detail:page', '', 150, 1, NOW(), NOW()),
-- 客户分析页面
('客户分析页面', 'CUSTOMER_ANALYTICS_PAGE', 'menu', @customer_menu_id, '/customer/analytics/customer-analytics', 'pages/customer/analytics/CustomerAnalytics.vue', 'customer:analytics:page', '', 160, 1, NOW(), NOW()),
-- 客户统计页面
('客户统计页面', 'CUSTOMER_STATISTICS_PAGE', 'menu', @customer_menu_id, '/customer/statistics', 'pages/customer/CustomerStatistics.vue', 'customer:statistics:page', '', 170, 1, NOW(), NOW()),
-- 客户编辑页面
('客户编辑页面', 'CUSTOMER_EDIT_PAGE', 'menu', @customer_menu_id, '/customer/edit/:id', 'pages/customer/edit/CustomerEdit.vue', 'customer:edit:page', '', 180, 1, NOW(), NOW()),
-- 客户创建页面
('客户创建页面', 'CUSTOMER_CREATE_PAGE', 'menu', @customer_menu_id, '/customer/create', 'pages/customer/create/CustomerCreate.vue', 'customer:create:page', '', 190, 1, NOW(), NOW());

-- 4. 为admin角色分配客户管理权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @customer_menu_id, NOW(), NOW()
WHERE @customer_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @customer_menu_id;

-- 6. 为园长角色分配客户管理权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @customer_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @customer_menu_id IS NOT NULL;

-- 7. 为园长角色分配核心权限（查看、创建、编辑、搜索、分析、统计、分配）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @customer_menu_id AND p.code IN ('CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE', 'CUSTOMER_SEARCH', 'CUSTOMER_ASSIGN', 'CUSTOMER_ANALYTICS_VIEW', 'CUSTOMER_STATISTICS', 'CUSTOMER_EXPORT');

-- 8. 为招生专员角色分配权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @customer_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('招生专员', '招生老师') AND @customer_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('招生专员', '招生老师') AND p.parent_id = @customer_menu_id;

-- 9. 为教师角色分配基础权限（查看、跟进、联系记录）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '教师' AND p.parent_id = @customer_menu_id AND p.code IN ('CUSTOMER_VIEW', 'CUSTOMER_SEARCH', 'CUSTOMER_FOLLOW', 'CUSTOMER_CONTACT_RECORD', 'CUSTOMER_STATUS_UPDATE');

-- 10. 为销售经理角色分配完整权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @customer_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('销售经理', '招生主管') AND @customer_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('销售经理', '招生主管') AND p.parent_id = @customer_menu_id;

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
WHERE p.code LIKE '%CUSTOMER%'
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
WHERE p.code LIKE '%CUSTOMER%'
ORDER BY r.name, p.sort;

COMMIT;
