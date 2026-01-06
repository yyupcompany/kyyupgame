-- 添加所有中心的权限记录到数据库
-- 这些权限ID与 server/src/config/role-mapping.ts 中的 centerPermissionIds 对应

-- 1. 人事中心 (ID: 3002)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3002, 'Personnel Center', '人事中心', 'PERSONNEL_CENTER', 'menu',
  NULL, '/centers/personnel', 'PersonnelCenter',
  'pages/centers/PersonnelCenter.vue', 'PERSONNEL_CENTER',
  'user', 1, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '人事中心',
  path = '/centers/personnel',
  component = 'PersonnelCenter',
  file_path = 'pages/centers/PersonnelCenter.vue',
  status = 1,
  updated_at = NOW();

-- 2. 活动中心 (ID: 3003)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3003, 'Activity Center', '活动中心', 'ACTIVITY_CENTER', 'menu',
  NULL, '/centers/activity', 'ActivityCenter',
  'pages/centers/ActivityCenter.vue', 'ACTIVITY_CENTER',
  'calendar', 2, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '活动中心',
  path = '/centers/activity',
  component = 'ActivityCenter',
  file_path = 'pages/centers/ActivityCenter.vue',
  status = 1,
  updated_at = NOW();

-- 3. 招生中心 (ID: 3004)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3004, 'Enrollment Center', '招生中心', 'ENROLLMENT_CENTER', 'menu',
  NULL, '/centers/enrollment', 'EnrollmentCenter',
  'pages/centers/EnrollmentCenter.vue', 'ENROLLMENT_CENTER',
  'user-plus', 3, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '招生中心',
  path = '/centers/enrollment',
  component = 'EnrollmentCenter',
  file_path = 'pages/centers/EnrollmentCenter.vue',
  status = 1,
  updated_at = NOW();

-- 4. 营销中心 (ID: 3005)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3005, 'Marketing Center', '营销中心', 'MARKETING_CENTER', 'menu',
  NULL, '/centers/marketing', 'MarketingCenter',
  'pages/centers/MarketingCenter.vue', 'MARKETING_CENTER',
  'megaphone', 4, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '营销中心',
  path = '/centers/marketing',
  component = 'MarketingCenter',
  file_path = 'pages/centers/MarketingCenter.vue',
  status = 1,
  updated_at = NOW();

-- 5. AI中心 (ID: 3006)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3006, 'AI Center', 'AI中心', 'AI_CENTER', 'menu',
  NULL, '/centers/ai', 'AICenter',
  'pages/centers/AICenter.vue', 'AI_CENTER',
  'robot', 5, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = 'AI中心',
  path = '/centers/ai',
  component = 'AICenter',
  file_path = 'pages/centers/AICenter.vue',
  status = 1,
  updated_at = NOW();

-- 6. 客户池中心 (ID: 3054)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3054, 'Customer Pool Center', '客户池中心', 'CUSTOMER_POOL_CENTER', 'menu',
  NULL, '/centers/customer-pool', 'CustomerPoolCenter',
  'pages/centers/CustomerPoolCenter.vue', 'CUSTOMER_POOL_CENTER',
  'users', 6, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '客户池中心',
  path = '/centers/customer-pool',
  component = 'CustomerPoolCenter',
  file_path = 'pages/centers/CustomerPoolCenter.vue',
  status = 1,
  updated_at = NOW();

-- 7. 任务中心 (ID: 3035)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3035, 'Task Center', '任务中心', 'TASK_CENTER_CATEGORY', 'menu',
  NULL, '/centers/task', 'TaskCenter',
  'pages/centers/TaskCenter.vue', 'TASK_CENTER_CATEGORY',
  'check-square', 7, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '任务中心',
  path = '/centers/task',
  component = 'TaskCenter',
  file_path = 'pages/centers/TaskCenter.vue',
  status = 1,
  updated_at = NOW();

-- 8. 系统中心 (ID: 2013)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  2013, 'System Center', '系统中心', 'SYSTEM_CENTER', 'menu',
  NULL, '/centers/system', 'SystemCenter',
  'pages/centers/SystemCenter.vue', 'SYSTEM_CENTER',
  'settings', 8, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '系统中心',
  path = '/centers/system',
  component = 'SystemCenter',
  file_path = 'pages/centers/SystemCenter.vue',
  status = 1,
  updated_at = NOW();

-- 9. 财务中心 (ID: 3074)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3074, 'Finance Center', '财务中心', 'FINANCE_CENTER', 'menu',
  NULL, '/centers/finance', 'FinanceCenter',
  'pages/centers/FinanceCenter.vue', 'FINANCE_CENTER',
  'dollar-sign', 9, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '财务中心',
  path = '/centers/finance',
  component = 'FinanceCenter',
  file_path = 'pages/centers/FinanceCenter.vue',
  status = 1,
  updated_at = NOW();

-- 10. 分析中心 (ID: 3073)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  3073, 'Analytics Center', '分析中心', 'ANALYTICS_CENTER', 'menu',
  NULL, '/centers/analytics', 'AnalyticsCenter',
  'pages/centers/AnalyticsCenter.vue', 'ANALYTICS_CENTER',
  'bar-chart', 10, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '分析中心',
  path = '/centers/analytics',
  component = 'AnalyticsCenter',
  file_path = 'pages/centers/AnalyticsCenter.vue',
  status = 1,
  updated_at = NOW();

-- 11. 教学中心 (ID: 4059)
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  4059, 'Teaching Center', '教学中心', 'TEACHING_CENTER', 'menu',
  NULL, '/centers/teaching', 'TeachingCenter',
  'pages/centers/TeachingCenter.vue', 'TEACHING_CENTER',
  'book', 11, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '教学中心',
  path = '/centers/teaching',
  component = 'TeachingCenter',
  file_path = 'pages/centers/TeachingCenter.vue',
  status = 1,
  updated_at = NOW();

-- 12. 检查中心 (ID: 5001) - 已存在，更新确保状态正确
INSERT INTO permissions (
  id, name, chinese_name, code, type, parent_id, path, component,
  file_path, permission, icon, sort, status, created_at, updated_at
) VALUES (
  5001, 'Inspection Center', '检查中心', 'INSPECTION_CENTER', 'menu',
  NULL, '/centers/inspection', 'InspectionCenter',
  'pages/centers/InspectionCenter.vue', 'INSPECTION_CENTER',
  'inspection', 12, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '检查中心',
  path = '/centers/inspection',
  component = 'InspectionCenter',
  file_path = 'pages/centers/InspectionCenter.vue',
  status = 1,
  updated_at = NOW();

-- 为Admin角色添加所有中心权限
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, id, NOW(), NOW()
FROM permissions
WHERE id IN (3002, 3003, 3004, 3005, 3006, 3054, 3035, 2013, 3074, 3073, 4059, 5001)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 为Principal角色添加所有中心权限
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 2, id, NOW(), NOW()
FROM permissions
WHERE id IN (3002, 3003, 3004, 3005, 3006, 3054, 3035, 2013, 3074, 3073, 4059, 5001)
ON DUPLICATE KEY UPDATE updated_at = NOW();

