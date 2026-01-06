-- 创建教师权限记录的SQL脚本
-- 确保教师角色能够访问teacher-center目录下的页面

-- 首先检查是否已存在TEACHER_开头的权限
SELECT COUNT(*) as existing_teacher_permissions
FROM permissions
WHERE code LIKE 'TEACHER_%' AND deleted_at IS NULL;

-- 如果没有，则创建教师权限记录
-- 注意：只有在没有TEACHER_权限的情况下才执行插入

-- 1. 教师工作台主分类
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Teacher Dashboard', '教师工作台', 'TEACHER_DASHBOARD', 'category', NULL, '#teacher-dashboard', NULL, 'Monitor', 1, 1, NOW(), NOW()
);

-- 获取刚插入的父权限ID
SET @teacher_dashboard_id = LAST_INSERT_ID();

-- 2. 教师仪表板
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Teacher Dashboard', '教师仪表板', 'TEACHER_DASHBOARD_PAGE', 'menu', @teacher_dashboard_id, '/teacher-center/dashboard', 'pages/teacher-center/dashboard/index.vue', 'Dashboard', 1, 1, NOW(), NOW()
);

-- 3. 互动课程管理（AI课程创建功能）
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Interactive Curriculum', '互动课程', 'TEACHER_INTERACTIVE_CURRICULUM', 'menu', @teacher_dashboard_id, '/teacher-center/creative-curriculum', 'pages/teacher-center/creative-curriculum/index.vue', 'Sparkles', 2, 1, NOW(), NOW()
);

-- 4. 教学管理
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Teaching Management', '教学管理', 'TEACHER_TEACHING', 'menu', @teacher_dashboard_id, '/teacher-center/teaching', 'pages/teacher-center/teaching/index.vue', 'BookOpen', 3, 1, NOW(), NOW()
);

-- 5. 活动管理
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Activities', '活动管理', 'TEACHER_ACTIVITIES', 'menu', @teacher_dashboard_id, '/teacher-center/activities', 'pages/teacher-center/activities/index.vue', 'Calendar', 4, 1, NOW(), NOW()
);

-- 6. 考勤管理
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Attendance', '考勤管理', 'TEACHER_ATTENDANCE', 'menu', @teacher_dashboard_id, '/teacher-center/attendance', 'pages/teacher-center/attendance/index.vue', 'Clock', 5, 1, NOW(), NOW()
);

-- 7. 任务管理
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Tasks', '任务管理', 'TEACHER_TASKS', 'menu', @teacher_dashboard_id, '/teacher-center/tasks', 'pages/teacher-center/tasks/index.vue', 'CheckSquare', 6, 1, NOW(), NOW()
);

-- 8. 通知管理
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Notifications', '通知管理', 'TEACHER_NOTIFICATIONS', 'menu', @teacher_dashboard_id, '/teacher-center/notifications', 'pages/teacher-center/notifications/index.vue', 'Bell', 7, 1, NOW(), NOW()
);

-- 9. 招生管理
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Enrollment', '招生管理', 'TEACHER_ENROLLMENT', 'menu', @teacher_dashboard_id, '/teacher-center/enrollment', 'pages/teacher-center/enrollment/index.vue', 'UserPlus', 8, 1, NOW(), NOW()
);

-- 10. 客户跟踪
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Customer Tracking', '客户跟踪', 'TEACHER_CUSTOMER_TRACKING', 'menu', @teacher_dashboard_id, '/teacher-center/customer-tracking', 'pages/teacher-center/customer-tracking/index.vue', 'Users', 9, 1, NOW(), NOW()
);

-- 11. 客户池管理
INSERT IGNORE INTO permissions (
  name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at
) VALUES (
  'Customer Pool', '客户池管理', 'TEACHER_CUSTOMER_POOL', 'menu', @teacher_dashboard_id, '/teacher-center/customer-pool', 'pages/teacher-center/customer-pool/index.vue', 'Users', 10, 1, NOW(), NOW()
);

-- 为teacher角色分配这些权限
-- 首先获取teacher角色的ID
SELECT id INTO @teacher_role_id FROM roles WHERE code = 'teacher' AND deleted_at IS NULL;

-- 如果teacher角色存在，分配权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
SELECT
  @teacher_role_id as role_id,
  p.id as permission_id,
  1 as grantor_id, -- 假设系统管理员ID为1
  NOW() as created_at,
  NOW() as updated_at
FROM permissions p
WHERE p.code LIKE 'TEACHER_%'
  AND p.deleted_at IS NULL
  AND @teacher_role_id IS NOT NULL;

-- 显示创建结果
SELECT
  'Teacher permissions created successfully' as result,
  COUNT(*) as total_teacher_permissions
FROM permissions
WHERE code LIKE 'TEACHER_%' AND deleted_at IS NULL;