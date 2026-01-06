-- 添加教师管理页面权限配置
-- 执行时间: 2025-07-23

START TRANSACTION;

-- 1. 添加教师管理主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('教师管理', 'TEACHER_MANAGEMENT', 'menu', NULL, '/teacher', 'pages/teacher/index.vue', 'teacher:management:view', 'icon-teacher', 40, 1, NOW(), NOW());

-- 获取刚插入的教师管理菜单ID
SET @management_menu_id = (SELECT id FROM permissions WHERE code = 'TEACHER_MANAGEMENT' LIMIT 1);

-- 2. 添加教师管理子权限
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
-- 查看权限
('教师查看', 'TEACHER_MANAGEMENT_VIEW', 'button', @management_menu_id, '', '', 'teacher:view', '', 10, 1, NOW(), NOW()),
-- 创建权限
('教师创建', 'TEACHER_MANAGEMENT_CREATE', 'button', @management_menu_id, '', '', 'teacher:create', '', 20, 1, NOW(), NOW()),
-- 编辑权限
('教师编辑', 'TEACHER_MANAGEMENT_EDIT', 'button', @management_menu_id, '', '', 'teacher:edit', '', 30, 1, NOW(), NOW()),
-- 删除权限
('教师删除', 'TEACHER_MANAGEMENT_DELETE', 'button', @management_menu_id, '', '', 'teacher:delete', '', 40, 1, NOW(), NOW()),
-- 搜索权限
('教师搜索', 'TEACHER_MANAGEMENT_SEARCH', 'button', @management_menu_id, '', '', 'teacher:search', '', 50, 1, NOW(), NOW()),
-- 导出权限
('教师导出', 'TEACHER_MANAGEMENT_EXPORT', 'button', @management_menu_id, '', '', 'teacher:export', '', 60, 1, NOW(), NOW()),
-- 详情页面
('教师详情', 'TEACHER_DETAIL', 'menu', @management_menu_id, '/teacher/detail/:id', 'pages/teacher/TeacherDetail.vue', 'teacher:detail', '', 70, 1, NOW(), NOW()),
-- 编辑页面
('教师编辑页面', 'TEACHER_EDIT_PAGE', 'menu', @management_menu_id, '/teacher/edit/:id', 'pages/teacher/TeacherEdit.vue', 'teacher:edit:page', '', 80, 1, NOW(), NOW()),
-- 新增页面
('教师新增页面', 'TEACHER_ADD_PAGE', 'menu', @management_menu_id, '/teacher/add', 'pages/teacher/add.vue', 'teacher:add:page', '', 90, 1, NOW(), NOW());

-- 3. 为admin角色分配教师管理权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @management_menu_id, NOW(), NOW()
WHERE @management_menu_id IS NOT NULL;

-- 4. 为admin角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, p.id, NOW(), NOW()
FROM permissions p 
WHERE p.parent_id = @management_menu_id;

-- 5. 为园长角色分配教师管理权限（假设园长角色ID为2）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @management_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @management_menu_id IS NOT NULL;

-- 6. 为园长角色分配所有子权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '园长' AND p.parent_id = @management_menu_id;

-- 7. 为教师角色分配基础权限（查看、搜索、详情）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r, permissions p 
WHERE r.name = '教师' AND p.parent_id = @management_menu_id AND p.code IN ('TEACHER_MANAGEMENT_VIEW', 'TEACHER_MANAGEMENT_SEARCH', 'TEACHER_DETAIL');

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
WHERE p.code LIKE '%TEACHER%'
ORDER BY p.sort;

-- 验证角色权限分配
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.code as permission_code
FROM role_permissions rp
INNER JOIN roles r ON rp.role_id = r.id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE '%TEACHER%'
ORDER BY r.name, p.sort;

COMMIT;
