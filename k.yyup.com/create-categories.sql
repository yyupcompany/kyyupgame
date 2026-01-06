-- 手动创建一级分类
-- 创建招生管理分类
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, icon, sort, status, created_at, updated_at)
VALUES ('招生管理', '招生管理', 'enrollment-management', 'category', NULL, '#enrollment', 'UserAdd', 10, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE chinese_name = '招生管理';

-- 创建活动管理分类
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, icon, sort, status, created_at, updated_at)
VALUES ('活动管理', '活动管理', 'activity-management', 'category', NULL, '#activity', 'Calendar', 20, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE chinese_name = '活动管理';

-- 创建学生管理分类
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, icon, sort, status, created_at, updated_at)
VALUES ('学生管理', '学生管理', 'student-management', 'category', NULL, '#student', 'User', 30, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE chinese_name = '学生管理';

-- 创建教师管理分类
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, icon, sort, status, created_at, updated_at)
VALUES ('教师管理', '教师管理', 'teacher-management', 'category', NULL, '#teacher', 'UserCheck', 40, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE chinese_name = '教师管理';

-- 创建班级管理分类
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, icon, sort, status, created_at, updated_at)
VALUES ('班级管理', '班级管理', 'class-management', 'category', NULL, '#class', 'Users', 50, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE chinese_name = '班级管理';

-- 创建系统管理分类
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, icon, sort, status, created_at, updated_at)
VALUES ('系统管理', '系统管理', 'system-management', 'category', NULL, '#system', 'Settings', 90, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE chinese_name = '系统管理';

SELECT '✅ 一级分类创建完成！' as result;
