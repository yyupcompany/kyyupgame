-- 添加广告管理页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加广告管理主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('广告管理', 'ADVERTISEMENT_MANAGE', 'menu', NULL, '/advertisement', 'pages/advertisement/index.vue', 'advertisement:manage', 'icon-picture', 80, 1, NOW(), NOW());

-- 获取刚插入的广告管理菜单ID
SET @advertisement_menu_id = (SELECT id FROM permissions WHERE code = 'ADVERTISEMENT_MANAGE' LIMIT 1);

-- 2. 添加广告管理子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 基础权限
('广告查看', 'ADVERTISEMENT_VIEW', 'button', @advertisement_menu_id, '', '', 'advertisement:view', '', 10, 1, NOW(), NOW()),
('广告创建', 'ADVERTISEMENT_CREATE', 'button', @advertisement_menu_id, '', '', 'advertisement:create', '', 20, 1, NOW(), NOW()),
('广告编辑', 'ADVERTISEMENT_UPDATE', 'button', @advertisement_menu_id, '', '', 'advertisement:update', '', 30, 1, NOW(), NOW()),
('广告删除', 'ADVERTISEMENT_DELETE', 'button', @advertisement_menu_id, '', '', 'advertisement:delete', '', 40, 1, NOW(), NOW()),
-- 高级功能
('广告搜索', 'ADVERTISEMENT_SEARCH', 'button', @advertisement_menu_id, '', '', 'advertisement:search', '', 50, 1, NOW(), NOW()),
('广告导入', 'ADVERTISEMENT_IMPORT', 'button', @advertisement_menu_id, '', '', 'advertisement:import', '', 60, 1, NOW(), NOW()),
('广告导出', 'ADVERTISEMENT_EXPORT', 'button', @advertisement_menu_id, '', '', 'advertisement:export', '', 70, 1, NOW(), NOW()),
('广告暂停', 'ADVERTISEMENT_PAUSE', 'button', @advertisement_menu_id, '', '', 'advertisement:pause', '', 80, 1, NOW(), NOW()),
('广告恢复', 'ADVERTISEMENT_RESUME', 'button', @advertisement_menu_id, '', '', 'advertisement:resume', '', 90, 1, NOW(), NOW()),
('广告统计', 'ADVERTISEMENT_STATISTICS', 'button', @advertisement_menu_id, '', '', 'advertisement:statistics', '', 100, 1, NOW(), NOW()),
('广告分析', 'ADVERTISEMENT_ANALYTICS', 'button', @advertisement_menu_id, '', '', 'advertisement:analytics', '', 110, 1, NOW(), NOW()),
('广告投放管理', 'ADVERTISEMENT_PLACEMENT', 'button', @advertisement_menu_id, '', '', 'advertisement:placement', '', 120, 1, NOW(), NOW()),
('广告效果跟踪', 'ADVERTISEMENT_TRACKING', 'button', @advertisement_menu_id, '', '', 'advertisement:tracking', '', 130, 1, NOW(), NOW()),
('广告批量操作', 'ADVERTISEMENT_BATCH', 'button', @advertisement_menu_id, '', '', 'advertisement:batch', '', 140, 1, NOW(), NOW());

-- 3. 添加广告管理子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 广告详情页面
('广告详情页面', 'ADVERTISEMENT_DETAIL_PAGE', 'menu', @advertisement_menu_id, '/advertisement/:id', 'pages/advertisement/detail/AdvertisementDetail.vue', 'advertisement:detail:page', '', 150, 1, NOW(), NOW()),
-- 广告统计页面
('广告统计页面', 'ADVERTISEMENT_STATS_PAGE', 'menu', @advertisement_menu_id, '/advertisement/statistics', 'pages/advertisement/statistics/AdvertisementStats.vue', 'advertisement:stats:page', '', 160, 1, NOW(), NOW()),
-- 广告创建页面
('广告创建页面', 'ADVERTISEMENT_CREATE_PAGE', 'menu', @advertisement_menu_id, '/advertisement/create', 'pages/advertisement/create/AdvertisementCreate.vue', 'advertisement:create:page', '', 170, 1, NOW(), NOW()),
-- 广告编辑页面
('广告编辑页面', 'ADVERTISEMENT_EDIT_PAGE', 'menu', @advertisement_menu_id, '/advertisement/edit/:id', 'pages/advertisement/edit/AdvertisementEdit.vue', 'advertisement:edit:page', '', 180, 1, NOW(), NOW());

-- 4. 为admin角色分配广告管理权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @advertisement_menu_id, NOW(), NOW()
WHERE @advertisement_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @advertisement_menu_id;

-- 6. 为园长角色分配广告管理权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @advertisement_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @advertisement_menu_id IS NOT NULL;

-- 7. 为园长角色分配核心权限（查看、创建、编辑、统计、分析、投放管理）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @advertisement_menu_id AND p.code IN ('ADVERTISEMENT_VIEW', 'ADVERTISEMENT_CREATE', 'ADVERTISEMENT_UPDATE', 'ADVERTISEMENT_SEARCH', 'ADVERTISEMENT_STATISTICS', 'ADVERTISEMENT_ANALYTICS', 'ADVERTISEMENT_PLACEMENT', 'ADVERTISEMENT_EXPORT');

-- 8. 为营销专员角色分配权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @advertisement_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('营销专员', '市场专员', '广告专员') AND @advertisement_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('营销专员', '市场专员', '广告专员') AND p.parent_id = @advertisement_menu_id;

-- 9. 为设计师角色分配基础权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '设计师' AND p.parent_id = @advertisement_menu_id AND p.code IN ('ADVERTISEMENT_VIEW', 'ADVERTISEMENT_CREATE', 'ADVERTISEMENT_UPDATE', 'ADVERTISEMENT_SEARCH');

-- 10. 为运营经理角色分配完整权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @advertisement_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('运营经理', '营销经理') AND @advertisement_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('运营经理', '营销经理') AND p.parent_id = @advertisement_menu_id;

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
WHERE p.code LIKE '%ADVERTISEMENT%'
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
WHERE p.code LIKE '%ADVERTISEMENT%'
ORDER BY r.name, p.sort;

COMMIT;
