-- ========================================
-- 修复菜单权限 - 为所有中心添加完整的子菜单
-- ========================================

-- 1. 人员中心 (Personnel Center) - ID: 3002
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3002 AND type = 'menu';

-- 添加人员中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Student Management', '学生管理', 'PERSONNEL_STUDENT', 'menu', 3002, '/student', 'pages/student/index.vue', 'user', 1, 1, NOW(), NOW()),
('Teacher Management', '教师管理', 'PERSONNEL_TEACHER', 'menu', 3002, '/teacher', 'pages/teacher/index.vue', 'user-tie', 2, 1, NOW(), NOW()),
('Parent Management', '家长管理', 'PERSONNEL_PARENT', 'menu', 3002, '/parent', 'pages/parent/index.vue', 'users', 3, 1, NOW(), NOW()),
('Class Management', '班级管理', 'PERSONNEL_CLASS', 'menu', 3002, '/class', 'pages/class/index.vue', 'school', 4, 1, NOW(), NOW());

-- 2. 活动中心 (Activity Center) - ID: 3003
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3003 AND type = 'menu';

-- 添加活动中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Activity List', '活动列表', 'ACTIVITY_LIST', 'menu', 3003, '/activity', 'pages/activity/index.vue', 'calendar', 1, 1, NOW(), NOW()),
('Activity Create', '创建活动', 'ACTIVITY_CREATE', 'menu', 3003, '/activity/create', 'pages/activity/ActivityCreate.vue', 'plus', 2, 1, NOW(), NOW()),
('Activity Analytics', '活动分析', 'ACTIVITY_ANALYTICS', 'menu', 3003, '/activity/analytics', 'pages/activity/analytics/ActivityAnalytics.vue', 'chart-line', 3, 1, NOW(), NOW()),
('Activity Evaluation', '活动评估', 'ACTIVITY_EVALUATION', 'menu', 3003, '/activity/evaluation', 'pages/activity/evaluation/ActivityEvaluation.vue', 'star', 4, 1, NOW(), NOW()),
('Activity Registration', '活动报名', 'ACTIVITY_REGISTRATION', 'menu', 3003, '/activity/registration', 'pages/activity/registration/RegistrationDashboard.vue', 'user-check', 5, 1, NOW(), NOW());

-- 3. 招生中心 (Enrollment Center) - ID: 3004
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3004 AND type = 'menu';

-- 添加招生中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Enrollment List', '招生列表', 'ENROLLMENT_LIST', 'menu', 3004, '/enrollment', 'pages/enrollment/index.vue', 'list', 1, 1, NOW(), NOW()),
('Enrollment Plan', '招生计划', 'ENROLLMENT_PLAN', 'menu', 3004, '/enrollment-plan', 'pages/enrollment-plan/PlanList.vue', 'clipboard-list', 2, 1, NOW(), NOW()),
('Enrollment Strategy', '招生策略', 'ENROLLMENT_STRATEGY', 'menu', 3004, '/enrollment-plan/strategy', 'pages/enrollment-plan/EnrollmentStrategy.vue', 'lightbulb', 3, 1, NOW(), NOW()),
('Enrollment Analytics', '招生分析', 'ENROLLMENT_ANALYTICS', 'menu', 3004, '/enrollment-plan/analytics', 'pages/enrollment-plan/analytics/enrollment-analytics.vue', 'chart-bar', 4, 1, NOW(), NOW()),
('Quota Management', '名额管理', 'ENROLLMENT_QUOTA', 'menu', 3004, '/enrollment-plan/quota', 'pages/enrollment-plan/QuotaManagement.vue', 'users-cog', 5, 1, NOW(), NOW());

-- 4. 营销中心 (Marketing Center) - ID: 3005
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3005 AND type = 'menu';

-- 添加营销中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Marketing Channels', '营销渠道', 'MARKETING_CHANNELS', 'menu', 3005, '/marketing/channels', 'pages/marketing/channels/index.vue', 'share-2', 1, 1, NOW(), NOW()),
('Marketing Funnel', '营销漏斗', 'MARKETING_FUNNEL', 'menu', 3005, '/marketing/funnel', 'pages/marketing/funnel/index.vue', 'filter', 2, 1, NOW(), NOW()),
('Conversion Analysis', '转化分析', 'MARKETING_CONVERSIONS', 'menu', 3005, '/marketing/conversions', 'pages/marketing/conversions/index.vue', 'trending-up', 3, 1, NOW(), NOW()),
('Referral Program', '推荐计划', 'MARKETING_REFERRALS', 'menu', 3005, '/marketing/referrals', 'pages/marketing/referrals/index.vue', 'users', 4, 1, NOW(), NOW());

-- 5. 系统中心 (System Center) - ID: 2013
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 2013 AND type = 'menu';

-- 添加系统中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('User Management', '用户管理', 'SYSTEM_USER', 'menu', 2013, '/system/users', 'pages/system/users/index.vue', 'user', 1, 1, NOW(), NOW()),
('Role Management', '角色管理', 'SYSTEM_ROLE', 'menu', 2013, '/system/roles', 'pages/system/roles/index.vue', 'shield', 2, 1, NOW(), NOW()),
('Permission Management', '权限管理', 'SYSTEM_PERMISSION', 'menu', 2013, '/system/permissions', 'pages/system/permissions/index.vue', 'key', 3, 1, NOW(), NOW()),
('System Settings', '系统设置', 'SYSTEM_SETTINGS', 'menu', 2013, '/system/settings', 'pages/system/settings/index.vue', 'settings', 4, 1, NOW(), NOW()),
('Backup Management', '备份管理', 'SYSTEM_BACKUP', 'menu', 2013, '/system/backup', 'pages/system/backup/BackupManagement.vue', 'database', 5, 1, NOW(), NOW()),
('AI Model Config', 'AI模型配置', 'SYSTEM_AI_MODEL', 'menu', 2013, '/system/ai-model', 'pages/system/AIModelConfig.vue', 'cpu', 6, 1, NOW(), NOW());

-- 6. 财务中心 (Finance Center) - ID: 3074
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3074 AND type = 'menu';

-- 添加财务中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Fee Management', '收费管理', 'FINANCE_FEE', 'menu', 3074, '/finance/fee', 'pages/finance/FeeManagement.vue', 'dollar-sign', 1, 1, NOW(), NOW()),
('Payment Management', '缴费管理', 'FINANCE_PAYMENT', 'menu', 3074, '/finance/payment', 'pages/finance/PaymentManagement.vue', 'credit-card', 2, 1, NOW(), NOW()),
('Fee Configuration', '收费配置', 'FINANCE_CONFIG', 'menu', 3074, '/finance/config', 'pages/finance/FeeConfig.vue', 'sliders', 3, 1, NOW(), NOW()),
('Finance Workbench', '财务工作台', 'FINANCE_WORKBENCH', 'menu', 3074, '/finance/workbench', 'pages/finance/workbench/UniversalFinanceWorkbench.vue', 'briefcase', 4, 1, NOW(), NOW());

-- 7. AI中心 (AI Center) - ID: 3006
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3006 AND type = 'menu';

-- 添加AI中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('AI Assistant', 'AI助手', 'AI_ASSISTANT', 'menu', 3006, '/ai-center/assistant', 'pages/ai-center/AIAssistant.vue', 'bot', 1, 1, NOW(), NOW()),
('AI Analytics', 'AI分析', 'AI_ANALYTICS', 'menu', 3006, '/ai-center/analytics', 'pages/ai-center/AIAnalytics.vue', 'brain', 2, 1, NOW(), NOW());

-- 8. 客户池中心 (Customer Pool Center) - ID: 3054
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3054 AND type = 'menu';

-- 添加客户池中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Customer Pool', '客户池', 'CUSTOMER_POOL', 'menu', 3054, '/customer/pool', 'pages/customer/pool/index.vue', 'users', 1, 1, NOW(), NOW()),
('Customer Follow-up', '客户跟进', 'CUSTOMER_FOLLOWUP', 'menu', 3054, '/customer/followup', 'pages/customer/followup/index.vue', 'user-check', 2, 1, NOW(), NOW()),
('Customer Analytics', '客户分析', 'CUSTOMER_ANALYTICS', 'menu', 3054, '/customer/analytics', 'pages/customer/analytics/index.vue', 'chart-pie', 3, 1, NOW(), NOW());

-- 9. 任务中心 (Task Center) - ID: 3035
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 3035 AND type = 'menu';

-- 添加任务中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Task List', '任务列表', 'TASK_LIST', 'menu', 3035, '/task/list', 'pages/task/TaskList.vue', 'check-square', 1, 1, NOW(), NOW()),
('Task Calendar', '任务日历', 'TASK_CALENDAR', 'menu', 3035, '/task/calendar', 'pages/task/TaskCalendar.vue', 'calendar', 2, 1, NOW(), NOW());

-- 10. 教学中心 (Teaching Center) - ID: 4059
-- 删除旧的子菜单
DELETE FROM permissions WHERE parent_id = 4059 AND type = 'menu';

-- 添加教学中心子菜单
INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at) VALUES
('Teaching Plan', '教学计划', 'TEACHING_PLAN', 'menu', 4059, '/teaching/plan', 'pages/teaching/TeachingPlan.vue', 'book-open', 1, 1, NOW(), NOW()),
('Course Management', '课程管理', 'TEACHING_COURSE', 'menu', 4059, '/teaching/course', 'pages/teaching/CourseManagement.vue', 'book', 2, 1, NOW(), NOW());

-- 验证结果
SELECT 
    c.id as category_id,
    c.chinese_name as category_name,
    COUNT(m.id) as menu_count
FROM permissions c
LEFT JOIN permissions m ON m.parent_id = c.id AND m.type = 'menu' AND m.status = 1
WHERE c.type = 'category' AND c.status = 1
GROUP BY c.id, c.chinese_name
ORDER BY c.sort;

