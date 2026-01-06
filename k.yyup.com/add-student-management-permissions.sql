-- 添加学生管理页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加学生管理主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('学生管理', 'STUDENT_MANAGE', 'menu', NULL, '/student', 'pages/student/index.vue', 'student:manage', 'icon-user', 30, 1, NOW(), NOW());

-- 获取刚插入的学生管理菜单ID
SET @student_menu_id = (SELECT id FROM permissions WHERE code = 'STUDENT_MANAGE' LIMIT 1);

-- 2. 添加学生管理子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 基础权限
('学生查看', 'STUDENT_VIEW', 'button', @student_menu_id, '', '', 'student:view', '', 10, 1, NOW(), NOW()),
('学生创建', 'STUDENT_CREATE', 'button', @student_menu_id, '', '', 'student:create', '', 20, 1, NOW(), NOW()),
('学生编辑', 'STUDENT_UPDATE', 'button', @student_menu_id, '', '', 'student:update', '', 30, 1, NOW(), NOW()),
('学生删除', 'STUDENT_DELETE', 'button', @student_menu_id, '', '', 'student:delete', '', 40, 1, NOW(), NOW()),
-- 高级功能
('学生搜索', 'STUDENT_SEARCH', 'button', @student_menu_id, '', '', 'student:search', '', 50, 1, NOW(), NOW()),
('学生导入', 'STUDENT_IMPORT', 'button', @student_menu_id, '', '', 'student:import', '', 60, 1, NOW(), NOW()),
('学生导出', 'STUDENT_EXPORT', 'button', @student_menu_id, '', '', 'student:export', '', 70, 1, NOW(), NOW()),
('学生转班', 'STUDENT_TRANSFER', 'button', @student_menu_id, '', '', 'student:transfer', '', 80, 1, NOW(), NOW()),
('学生分析', 'STUDENT_ANALYTICS_VIEW', 'button', @student_menu_id, '', '', 'student:analytics:view', '', 90, 1, NOW(), NOW()),
('学生成长记录', 'STUDENT_GROWTH_VIEW', 'button', @student_menu_id, '', '', 'student:growth:view', '', 100, 1, NOW(), NOW()),
('学生考勤管理', 'STUDENT_ATTENDANCE', 'button', @student_menu_id, '', '', 'student:attendance', '', 110, 1, NOW(), NOW()),
('学生家长联系', 'STUDENT_PARENT_CONTACT', 'button', @student_menu_id, '', '', 'student:parent:contact', '', 120, 1, NOW(), NOW());

-- 3. 添加学生管理子页面权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 学生详情页面
('学生详情页面', 'STUDENT_DETAIL_PAGE', 'menu', @student_menu_id, '/student/detail/:id', 'pages/student/detail/StudentDetail.vue', 'student:detail:page', '', 130, 1, NOW(), NOW()),
-- 学生分析页面
('学生分析页面', 'STUDENT_ANALYTICS_PAGE', 'menu', @student_menu_id, '/student/analytics/:id', 'pages/student/analytics/[id].vue', 'student:analytics:page', '', 140, 1, NOW(), NOW()),
-- 学生成长页面
('学生成长页面', 'STUDENT_GROWTH_PAGE', 'menu', @student_menu_id, '/student/growth/:id', 'pages/student/growth/StudentGrowth.vue', 'student:growth:page', '', 150, 1, NOW(), NOW()),
-- 学生搜索页面
('学生搜索页面', 'STUDENT_SEARCH_PAGE', 'menu', @student_menu_id, '/student/search', 'pages/student/StudentSearch.vue', 'student:search:page', '', 160, 1, NOW(), NOW()),
-- 学生编辑页面
('学生编辑页面', 'STUDENT_EDIT_PAGE', 'menu', @student_menu_id, '/student/edit/:id', 'pages/student/edit/StudentEdit.vue', 'student:edit:page', '', 170, 1, NOW(), NOW()),
-- 学生添加页面
('学生添加页面', 'STUDENT_ADD_PAGE', 'menu', @student_menu_id, '/student/add', 'pages/student/add/StudentAdd.vue', 'student:add:page', '', 180, 1, NOW(), NOW());

-- 4. 为admin角色分配学生管理权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @student_menu_id, NOW(), NOW()
WHERE @student_menu_id IS NOT NULL;

-- 5. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @student_menu_id;

-- 6. 为园长角色分配学生管理权限（假设园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @student_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @student_menu_id IS NOT NULL;

-- 7. 为园长角色分配核心权限（查看、创建、编辑、搜索、分析、成长记录）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @student_menu_id AND p.code IN ('STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_UPDATE', 'STUDENT_SEARCH', 'STUDENT_ANALYTICS_VIEW', 'STUDENT_GROWTH_VIEW', 'STUDENT_EXPORT');

-- 8. 为教师角色分配基础权限（查看、搜索、成长记录、考勤）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '教师' AND p.parent_id = @student_menu_id AND p.code IN ('STUDENT_VIEW', 'STUDENT_SEARCH', 'STUDENT_GROWTH_VIEW', 'STUDENT_ATTENDANCE', 'STUDENT_PARENT_CONTACT');

-- 9. 为班主任角色分配扩展权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '班主任' AND p.parent_id = @student_menu_id AND p.code IN ('STUDENT_VIEW', 'STUDENT_UPDATE', 'STUDENT_SEARCH', 'STUDENT_TRANSFER', 'STUDENT_ANALYTICS_VIEW', 'STUDENT_GROWTH_VIEW', 'STUDENT_ATTENDANCE', 'STUDENT_PARENT_CONTACT', 'STUDENT_EXPORT');

-- 10. 为学籍管理员角色分配完整权限（如果存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @student_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name IN ('学籍管理员', '教务主任') AND @student_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name IN ('学籍管理员', '教务主任') AND p.parent_id = @student_menu_id;

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
WHERE p.code LIKE '%STUDENT%'
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
WHERE p.code LIKE '%STUDENT%'
ORDER BY r.name, p.sort;

COMMIT;
