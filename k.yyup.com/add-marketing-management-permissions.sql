-- 添加营销管理页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加营销管理主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('营销管理', 'MARKETING_MANAGE', 'menu', NULL, '/marketing', 'pages/marketing/index.vue', 'marketing:manage', 'icon-marketing', 50, 1, NOW(), NOW());

-- 获取刚插入的营销管理菜单ID
SET @marketing_menu_id = (SELECT id FROM permissions WHERE code = 'MARKETING_MANAGE' LIMIT 1);

-- 2. 添加营销管理子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 查看权限
('营销管理查看', 'MARKETING_MANAGE_VIEW', 'button', @marketing_menu_id, '', '', 'marketing:view', '', 10, 1, NOW(), NOW()),
-- 营销活动管理
('营销活动管理', 'MARKETING_CAMPAIGN_MANAGE', 'button', @marketing_menu_id, '', '', 'marketing:campaign:manage', '', 20, 1, NOW(), NOW()),
-- 优惠券管理
('营销优惠券管理', 'MARKETING_COUPONS_MANAGE', 'button', @marketing_menu_id, '', '', 'marketing:coupons:manage', '', 30, 1, NOW(), NOW()),
-- 咨询管理
('营销咨询管理', 'MARKETING_CONSULTATIONS_MANAGE', 'button', @marketing_menu_id, '', '', 'marketing:consultations:manage', '', 40, 1, NOW(), NOW()),
-- 智能营销引擎
('智能营销引擎', 'MARKETING_ENGINE_USE', 'button', @marketing_menu_id, '', '', 'marketing:engine:use', '', 50, 1, NOW(), NOW()),
-- 渠道跟踪
('渠道跟踪', 'MARKETING_CHANNEL_TRACKING', 'button', @marketing_menu_id, '', '', 'marketing:channel:tracking', '', 60, 1, NOW(), NOW()),
-- 转化跟踪
('转化跟踪', 'MARKETING_CONVERSION_TRACKING', 'button', @marketing_menu_id, '', '', 'marketing:conversion:tracking', '', 70, 1, NOW(), NOW()),
-- 海报模板管理
('海报模板管理', 'MARKETING_POSTER_TEMPLATE', 'button', @marketing_menu_id, '', '', 'marketing:poster:template', '', 80, 1, NOW(), NOW()),
-- 海报生成
('海报生成', 'MARKETING_POSTER_GENERATION', 'button', @marketing_menu_id, '', '', 'marketing:poster:generation', '', 90, 1, NOW(), NOW());

-- 3. 添加营销管理子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 优惠券页面
('营销优惠券页面', 'MARKETING_COUPONS_PAGE', 'menu', @marketing_menu_id, '/marketing/coupons', 'pages/marketing/coupons/MarketingCoupons.vue', 'marketing:coupons:page', '', 100, 1, NOW(), NOW()),
-- 咨询页面
('营销咨询页面', 'MARKETING_CONSULTATIONS_PAGE', 'menu', @marketing_menu_id, '/marketing/consultations', 'pages/marketing/consultations/MarketingConsultations.vue', 'marketing:consultations:page', '', 110, 1, NOW(), NOW()),
-- 智能营销引擎页面
('智能营销引擎页面', 'MARKETING_ENGINE_PAGE', 'menu', @marketing_menu_id, '/marketing/intelligent-engine/marketing-engine', 'pages/marketing.vue', 'marketing:engine:page', '', 120, 1, NOW(), NOW());

-- 4. 为admin角色分配营销管理权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @marketing_menu_id, NOW(), NOW()
WHERE @marketing_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @marketing_menu_id;

-- 6. 为园长角色分配营销管理权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @marketing_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @marketing_menu_id IS NOT NULL;

-- 7. 为园长角色分配基础权限（查看、活动管理、优惠券管理）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @marketing_menu_id AND p.code IN ('MARKETING_MANAGE_VIEW', 'MARKETING_CAMPAIGN_MANAGE', 'MARKETING_COUPONS_MANAGE');

-- 8. 为营销专员角色分配权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @marketing_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('营销专员', '市场专员') AND @marketing_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('营销专员', '市场专员') AND p.parent_id = @marketing_menu_id;

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
WHERE p.code LIKE '%MARKETING%'
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
WHERE p.code LIKE '%MARKETING%'
ORDER BY r.name, p.sort;

COMMIT;
