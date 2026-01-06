-- =====================================================
-- 批量添加缺失权限SQL脚本
-- 生成时间: 2025-07-22
-- 说明: 为75个缺失权限的前端页面添加权限记录
-- =====================================================

-- 设置变量存储父级ID
SET @ai_parent_id = (SELECT id FROM permissions WHERE path = '/ai' LIMIT 1);
SET @activity_parent_id = (SELECT id FROM permissions WHERE path = '/activity' LIMIT 1);
SET @enrollment_plan_parent_id = (SELECT id FROM permissions WHERE path = '/enrollment-plan' LIMIT 1);
SET @class_parent_id = (SELECT id FROM permissions WHERE path = '/class' LIMIT 1);
SET @parent_parent_id = (SELECT id FROM permissions WHERE path = '/parent' LIMIT 1);
SET @system_parent_id = (SELECT id FROM permissions WHERE path = '/system' LIMIT 1);
SET @teacher_parent_id = (SELECT id FROM permissions WHERE path = '/teacher' LIMIT 1);

-- 如果父级不存在，先创建父级菜单
INSERT IGNORE INTO permissions (name, chinese_name, path, component, type, status, sort) VALUES
('AI功能', 'AI功能', '/ai', 'Layout', 'menu', 1, 50),
('活动管理', '活动管理', '/activity', 'Layout', 'menu', 1, 30);

-- 更新父级ID
SET @ai_parent_id = (SELECT id FROM permissions WHERE path = '/ai' LIMIT 1);
SET @activity_parent_id = (SELECT id FROM permissions WHERE path = '/activity' LIMIT 1);

-- =====================================================
-- 1. AI功能模块权限 (19个页面)
-- =====================================================
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
-- AI主要功能页面
('AI助手', 'AI助手', '/ai/AIAssistantPage', 'pages/ai/AIAssistantPage.vue', 'menu', @ai_parent_id, 1, 1),
('AI查询界面', 'AI查询界面', '/ai/AIQueryInterface', 'pages/ai/AIQueryInterface.vue', 'menu', @ai_parent_id, 1, 2),
('聊天界面', '聊天界面', '/ai/ChatInterface', 'pages/ai/ChatInterface.vue', 'menu', @ai_parent_id, 1, 3),
('专家咨询', '专家咨询', '/ai/ExpertConsultationPage', 'pages/ai/ExpertConsultationPage.vue', 'menu', @ai_parent_id, 1, 4),
('内存管理', '内存管理', '/ai/MemoryManagementPage', 'pages/ai/MemoryManagementPage.vue', 'menu', @ai_parent_id, 1, 5),
('模型管理', '模型管理', '/ai/ModelManagementPage', 'pages/ai/ModelManagementPage.vue', 'menu', @ai_parent_id, 1, 6),

-- AI分析功能
('NLP分析', 'NLP分析', '/ai/conversation/nlp-analytics', 'pages/ai/conversation/nlp-analytics.vue', 'menu', @ai_parent_id, 1, 10),
('预测引擎', '预测引擎', '/ai/deep-learning/prediction-engine', 'pages/ai/deep-learning/prediction-engine.vue', 'menu', @ai_parent_id, 1, 11),
('3D分析', '3D分析', '/ai/visualization/3d-analytics', 'pages/ai/visualization/3d-analytics.vue', 'menu', @ai_parent_id, 1, 12),
('维护优化器', '维护优化器', '/ai/predictive/maintenance-optimizer', 'pages/ai/predictive/maintenance-optimizer.vue', 'menu', @ai_parent_id, 1, 13);

-- AI组件权限（这些可能不需要菜单权限，但为了完整性添加）
-- ('示例查询对话框', '示例查询对话框', '/ai/components/ExampleQueriesDialog', 'pages/ai/components/ExampleQueriesDialog.vue', 'menu', @ai_parent_id, 0, 20),
-- ('反馈对话框', '反馈对话框', '/ai/components/FeedbackDialog', 'pages/ai/components/FeedbackDialog.vue', 'menu', @ai_parent_id, 0, 21),
-- ('查询历史对话框', '查询历史对话框', '/ai/components/QueryHistoryDialog', 'pages/ai/components/QueryHistoryDialog.vue', 'menu', @ai_parent_id, 0, 22),
-- ('查询结果显示', '查询结果显示', '/ai/components/QueryResultDisplay', 'pages/ai/components/QueryResultDisplay.vue', 'menu', @ai_parent_id, 0, 23),
-- ('查询模板对话框', '查询模板对话框', '/ai/components/QueryTemplatesDialog', 'pages/ai/components/QueryTemplatesDialog.vue', 'menu', @ai_parent_id, 0, 24);

-- =====================================================
-- 2. 活动管理模块权限 (13个页面)
-- =====================================================
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
-- 活动基础功能
('活动首页', '活动首页', '/activity', 'pages/activity/index.vue', 'menu', @activity_parent_id, 1, 1),
('创建活动', '创建活动', '/activity/ActivityCreate', 'pages/activity/ActivityCreate.vue', 'menu', @activity_parent_id, 1, 2),
('活动详情', '活动详情', '/activity/ActivityDetail', 'pages/activity/ActivityDetail.vue', 'menu', @activity_parent_id, 1, 3),
('编辑活动', '编辑活动', '/activity/ActivityEdit', 'pages/activity/ActivityEdit.vue', 'menu', @activity_parent_id, 1, 4),
('活动表单', '活动表单', '/activity/ActivityForm', 'pages/activity/ActivityForm.vue', 'menu', @activity_parent_id, 1, 5),
('活动列表', '活动列表', '/activity/ActivityList', 'pages/activity/ActivityList.vue', 'menu', @activity_parent_id, 1, 6),

-- 活动高级功能
('活动分析', '活动分析', '/activity/analytics/ActivityAnalytics', 'pages/activity/analytics/ActivityAnalytics.vue', 'menu', @activity_parent_id, 1, 10),
('智能分析', '智能分析', '/activity/analytics/intelligent-analysis', 'pages/activity/analytics/intelligent-analysis.vue', 'menu', @activity_parent_id, 1, 11),
('活动评估', '活动评估', '/activity/evaluation/ActivityEvaluation', 'pages/activity/evaluation/ActivityEvaluation.vue', 'menu', @activity_parent_id, 1, 12),
('活动优化器', '活动优化器', '/activity/optimization/ActivityOptimizer', 'pages/activity/optimization/ActivityOptimizer.vue', 'menu', @activity_parent_id, 1, 13),
('活动计划器', '活动计划器', '/activity/plan/ActivityPlanner', 'pages/activity/plan/ActivityPlanner.vue', 'menu', @activity_parent_id, 1, 14);

-- =====================================================
-- 3. 招生计划模块权限 (15个页面)
-- =====================================================
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
-- 招生计划基础功能
('计划详情', '计划详情', '/enrollment-plan/PlanDetail', 'pages/enrollment-plan/PlanDetail.vue', 'menu', @enrollment_plan_parent_id, 1, 2),
('编辑计划', '编辑计划', '/enrollment-plan/PlanEdit', 'pages/enrollment-plan/PlanEdit.vue', 'menu', @enrollment_plan_parent_id, 1, 3),
('计划表单', '计划表单', '/enrollment-plan/PlanForm', 'pages/enrollment-plan/PlanForm.vue', 'menu', @enrollment_plan_parent_id, 1, 4),
('配额管理', '配额管理', '/enrollment-plan/QuotaManagement', 'pages/enrollment-plan/QuotaManagement.vue', 'menu', @enrollment_plan_parent_id, 1, 5),

-- 招生计划高级功能
('AI预测', 'AI预测', '/enrollment-plan/ai-forecasting', 'pages/enrollment-plan/ai-forecasting.vue', 'menu', @enrollment_plan_parent_id, 1, 10),
('招生分析', '招生分析', '/enrollment-plan/analytics/enrollment-analytics', 'pages/enrollment-plan/analytics/enrollment-analytics.vue', 'menu', @enrollment_plan_parent_id, 1, 11),
('计划评估', '计划评估', '/enrollment-plan/evaluation/plan-evaluation', 'pages/enrollment-plan/evaluation/plan-evaluation.vue', 'menu', @enrollment_plan_parent_id, 1, 12),
('招生预测', '招生预测', '/enrollment-plan/forecast/enrollment-forecast', 'pages/enrollment-plan/forecast/enrollment-forecast.vue', 'menu', @enrollment_plan_parent_id, 1, 13),
('计划管理', '计划管理', '/enrollment-plan/management/PlanManagement', 'pages/enrollment-plan/management/PlanManagement.vue', 'menu', @enrollment_plan_parent_id, 1, 14),
('容量优化', '容量优化', '/enrollment-plan/optimization/capacity-optimization', 'pages/enrollment-plan/optimization/capacity-optimization.vue', 'menu', @enrollment_plan_parent_id, 1, 15),
('招生仿真', '招生仿真', '/enrollment-plan/simulation/enrollment-simulation', 'pages/enrollment-plan/simulation/enrollment-simulation.vue', 'menu', @enrollment_plan_parent_id, 1, 16),
('智能规划', '智能规划', '/enrollment-plan/smart-planning/smart-planning', 'pages/enrollment-plan/smart-planning/smart-planning.vue', 'menu', @enrollment_plan_parent_id, 1, 17),
('招生策略', '招生策略', '/enrollment-plan/strategy/enrollment-strategy', 'pages/enrollment-plan/strategy/enrollment-strategy.vue', 'menu', @enrollment_plan_parent_id, 1, 18),
('趋势分析', '趋势分析', '/enrollment-plan/trends/trend-analysis', 'pages/enrollment-plan/trends/trend-analysis.vue', 'menu', @enrollment_plan_parent_id, 1, 19);

-- =====================================================
-- 4. 班级管理模块权限 (7个页面)
-- =====================================================
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
('班级分析', '班级分析', '/class/analytics/ClassAnalytics', 'pages/class/analytics/ClassAnalytics.vue', 'menu', @class_parent_id, 1, 10),
('班级详情', '班级详情', '/class/detail/ClassDetail', 'pages/class/detail/ClassDetail.vue', 'menu', @class_parent_id, 1, 11),
('班级优化', '班级优化', '/class/optimization/ClassOptimization', 'pages/class/optimization/ClassOptimization.vue', 'menu', @class_parent_id, 1, 12),
('智能管理', '智能管理', '/class/smart-management/SmartManagement', 'pages/class/smart-management/SmartManagement.vue', 'menu', @class_parent_id, 1, 13);

-- =====================================================
-- 5. 家长管理模块权限 (6个页面)
-- =====================================================
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
('儿童列表', '儿童列表', '/parent/ChildrenList', 'pages/parent/ChildrenList.vue', 'menu', @parent_parent_id, 1, 10),
('家长详情', '家长详情', '/parent/ParentDetail', 'pages/parent/ParentDetail.vue', 'menu', @parent_parent_id, 1, 11),
('家长列表', '家长列表', '/parent/ParentList', 'pages/parent/ParentList.vue', 'menu', @parent_parent_id, 1, 12),
('智能中心', '智能中心', '/parent/communication/SmartHub', 'pages/parent/communication/SmartHub.vue', 'menu', @parent_parent_id, 1, 13);

-- =====================================================
-- 6. 其他模块权限
-- =====================================================

-- 申请管理
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
('申请详情', '申请详情', '/application/ApplicationDetail', 'pages/application/ApplicationDetail.vue', 'menu', 
  (SELECT id FROM permissions WHERE path = '/application' LIMIT 1), 1, 10),
('申请面试', '申请面试', '/application/interview/ApplicationInterview', 'pages/application/interview/ApplicationInterview.vue', 'menu', 
  (SELECT id FROM permissions WHERE path = '/application' LIMIT 1), 1, 11),
('申请审核', '申请审核', '/application/review/ApplicationReview', 'pages/application/review/ApplicationReview.vue', 'menu', 
  (SELECT id FROM permissions WHERE path = '/application' LIMIT 1), 1, 12);

-- 招生模块
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
('招生首页', '招生首页', '/enrollment', 'pages/enrollment/index.vue', 'menu', 
  (SELECT id FROM permissions WHERE path = '#enrollment' LIMIT 1), 1, 1),
('漏斗分析', '漏斗分析', '/enrollment/funnel-analytics', 'pages/enrollment/funnel-analytics.vue', 'menu', 
  (SELECT id FROM permissions WHERE path = '#enrollment' LIMIT 1), 1, 10),
('个性化策略', '个性化策略', '/enrollment/personalized-strategy', 'pages/enrollment/personalized-strategy.vue', 'menu', 
  (SELECT id FROM permissions WHERE path = '#enrollment' LIMIT 1), 1, 11);

-- 教师管理
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
('教师列表', '教师列表', '/teacher/TeacherList', 'pages/teacher/TeacherList.vue', 'menu', @teacher_parent_id, 1, 10),
('教师发展', '教师发展', '/teacher/development/TeacherDevelopment', 'pages/teacher/development/TeacherDevelopment.vue', 'menu', @teacher_parent_id, 1, 11),
('教师评估', '教师评估', '/teacher/evaluation/TeacherEvaluation', 'pages/teacher/evaluation/TeacherEvaluation.vue', 'menu', @teacher_parent_id, 1, 12);

-- 系统管理
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
('备份管理', '备份管理', '/system/backup/BackupManagement', 'pages/system/backup/BackupManagement.vue', 'menu', @system_parent_id, 1, 20),
('角色管理', '角色管理', '/system/roles/RoleManagement', 'pages/system/roles/RoleManagement.vue', 'menu', @system_parent_id, 1, 21);

-- 其他独立页面
INSERT INTO permissions (name, chinese_name, path, component, type, parent_id, status, sort) VALUES
('登录页面', '登录页面', '/Login', 'pages/Login/index.vue', 'menu', NULL, 1, 999);

-- =====================================================
-- 验证添加结果
-- =====================================================
SELECT '添加前权限总数:' as info, COUNT(*) as count FROM permissions
UNION ALL
SELECT '预计添加数量:', 75
UNION ALL
SELECT '添加后权限总数:', COUNT(*) + 75 FROM permissions;