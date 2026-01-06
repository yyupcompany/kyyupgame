-- 初始化所有页面说明文档
-- 确保数据库中有完整的页面说明文档数据

USE kindergarten_management;

-- 清空现有数据（可选，如果需要重新初始化）
-- DELETE FROM page_guides;

-- 1. 登录页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance, 
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/login',
  '用户登录',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是用户登录页面，这是进入系统的安全入口。请使用您的账号和密码登录，系统支持多种用户角色（园长、教师、招生专员等），登录后您将根据权限访问相应的功能模块，开始您的智能招生管理之旅。',
  '认证页面',
  9,
  '["users", "user_sessions", "login_logs"]',
  '用户正在登录页面，准备进入系统。用户可能需要了解登录流程、忘记密码处理、账号权限说明等。请提供友好的登录指导。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 2. 注册页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance, 
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/register',
  '用户注册',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是用户注册页面，这是创建新账户的地方。请填写准确的个人信息和联系方式，选择合适的用户角色，我们将为您创建专属账户，让您快速开始使用我们的智能招生管理功能。',
  '认证页面',
  8,
  '["users", "user_profiles", "registration_logs"]',
  '用户正在注册页面，准备创建新账户。用户可能需要了解注册流程、角色权限、信息填写要求等。请提供详细的注册指导。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 3. 数据概览页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance, 
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/dashboard',
  '数据概览',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是数据概览页面，这是系统的主仪表板，为您提供幼儿园运营的全局数据概览。在这里您可以查看关键指标、趋势分析、进行快速操作，全面掌握幼儿园的运营状况。',
  '仪表板',
  9,
  '["students", "teachers", "activities", "enrollment_applications", "classes"]',
  '用户正在主仪表板页面，这里显示幼儿园的整体运营数据。用户可能需要了解总体情况、查看关键指标或进行快速操作。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 4. 仪表板中心页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance, 
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/centers/dashboard',
  '仪表板中心',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
  '中心页面',
  9,
  '["students", "teachers", "activities", "enrollment_applications", "classes", "statistics"]',
  '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 5. 活动中心页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance,
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/centers/activity',
  '活动中心',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是活动中心页面，这是招生环节非常重要的功能模块。我们为您提供全方位的活动管理解决方案，在这里您可以统一管理所有活动相关的功能，包括活动策划、活动发布、报名管理、签到统计、效果分析等，让每一场活动都能发挥最大的招生价值。',
  '中心页面',
  9,
  '["activities", "activity_registrations", "activity_templates", "activity_evaluations", "activity_checkins"]',
  '用户正在活动中心页面，这是一个综合性的活动管理平台。用户可能需要查看活动数据、管理活动、分析活动效果等。请根据用户的具体问题，结合活动相关的数据库信息提供专业建议。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 6. 招生中心页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance,
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/centers/enrollment',
  '招生中心',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是招生中心页面，这是幼儿园招生工作的核心平台。在这里您可以管理招生计划、处理入园申请、提供咨询服务、分析招生数据，我们整合了招生全流程功能，为您提供一站式的智能招生解决方案，让招生工作更高效、更精准。',
  '中心页面',
  10,
  '["enrollment_plans", "enrollment_applications", "enrollment_consultations", "enrollment_statistics"]',
  '用户正在招生中心页面，这是招生工作的核心管理平台。用户可能需要查看招生数据、管理招生计划、处理申请等。请结合招生相关数据提供专业指导。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 7. 人事中心页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance,
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/centers/personnel',
  '人事中心',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是人事中心页面，这是幼儿园人力资源管理的核心平台。在这里您可以管理教师信息、查看教师绩效、安排工作任务、进行人员培训管理，全面提升幼儿园的人力资源管理效率。',
  '中心页面',
  8,
  '["teachers", "teacher_performance", "teacher_schedules", "teacher_training"]',
  '用户正在人事中心页面，这是人力资源管理的专业平台。用户可能需要管理教师信息、查看绩效数据、安排工作等。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 8. 营销中心页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance,
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/centers/marketing',
  '营销中心',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是营销中心页面，这是幼儿园品牌推广和营销活动的专业平台。在这里您可以制定营销策略、管理推广活动、分析营销效果、优化投放渠道，全面提升幼儿园的品牌影响力和招生转化率。',
  '中心页面',
  8,
  '["marketing_campaigns", "advertisements", "marketing_analytics", "customer_pool"]',
  '用户正在营销中心页面，这是营销推广的专业管理平台。用户可能需要制定营销策略、管理推广活动、分析营销效果等。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 9. AI中心页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance,
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/centers/ai',
  'AI中心',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是AI中心页面，这是人工智能功能的集中管理平台。在这里您可以体验AI查询、智能分析、模型管理等前沿功能，我们的AI助手将为您提供智能化的数据分析和决策支持，让数据洞察变得更简单、更智能。',
  '中心页面',
  8,
  '["ai_query_history", "ai_model_configs", "ai_conversations", "ai_shortcuts"]',
  '用户正在AI中心页面，这里提供各种AI功能和服务。用户可能需要进行数据查询、AI分析或管理AI功能。请提供AI相关的专业建议。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 10. 系统管理中心页面
INSERT INTO page_guides (
  page_path, page_name, page_description, category, importance,
  related_tables, context_prompt, is_active, created_at, updated_at
) VALUES (
  '/centers/system',
  '系统管理中心',
  '欢迎使用婴婴向上智能招生系统！您现在来到的是系统管理中心页面，这是整个系统的控制核心。在这里您可以进行系统配置、用户管理、权限设置、数据备份、安全管理等关键操作，确保系统稳定高效运行。',
  '中心页面',
  7,
  '["users", "roles", "permissions", "system_configs", "system_logs"]',
  '用户正在系统管理中心页面，这是系统管理员的专业工作台。用户可能需要进行系统配置、用户管理、安全设置等管理操作。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 查询确认所有数据是否插入成功
SELECT
  page_path as '页面路径',
  page_name as '页面名称',
  category as '分类',
  importance as '重要性',
  is_active as '是否启用'
FROM page_guides
ORDER BY
  CASE category
    WHEN '认证页面' THEN 1
    WHEN '仪表板' THEN 2
    WHEN '中心页面' THEN 3
    ELSE 4
  END,
  importance DESC,
  page_path;
