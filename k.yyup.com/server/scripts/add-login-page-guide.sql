-- 添加登录页面说明文档
INSERT INTO `page_guides` (
  `page_path`,
  `page_name`, 
  `page_description`,
  `category`,
  `importance`,
  `related_tables`,
  `context_prompt`,
  `is_active`,
  `created_at`,
  `updated_at`
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
  `page_description` = VALUES(`page_description`),
  `context_prompt` = VALUES(`context_prompt`),
  `updated_at` = NOW();

-- 添加注册页面说明文档
INSERT INTO `page_guides` (
  `page_path`,
  `page_name`, 
  `page_description`,
  `category`,
  `importance`,
  `related_tables`,
  `context_prompt`,
  `is_active`,
  `created_at`,
  `updated_at`
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
  `page_description` = VALUES(`page_description`),
  `context_prompt` = VALUES(`context_prompt`),
  `updated_at` = NOW();

-- 查询确认数据是否插入成功
SELECT 
  `page_path`,
  `page_name`,
  `category`,
  `importance`,
  `is_active`
FROM `page_guides` 
WHERE `page_path` IN ('/login', '/register')
ORDER BY `page_path`;
