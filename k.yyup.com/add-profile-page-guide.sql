-- 为 /profile 页面添加页面说明文档
-- 解决个人档案页面的404错误

USE kargerdensales;

-- 插入个人档案页面说明文档
INSERT INTO page_guides (
  page_path, 
  page_name, 
  page_description, 
  category, 
  importance, 
  related_tables, 
  context_prompt, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  '/profile',
  '个人档案',
  '个人档案页面是用户管理个人信息和账户设置的专属空间。在这里您可以查看和编辑个人基本信息、修改登录密码、管理头像、更新联系方式等。该页面提供完整的个人信息管理功能，确保您的账户信息准确且安全。',
  '用户管理',
  7,
  '["users", "user_profiles", "user_sessions"]',
  '用户正在个人档案页面，这是个人信息管理的专属空间。用户可能需要查看个人信息、修改资料、更改密码、管理账户设置等。请提供个人信息管理相关的专业建议和操作指导。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 为个人档案页面添加功能板块说明
INSERT INTO page_guide_sections (
  page_guide_id,
  section_name,
  section_description,
  section_path,
  features,
  sort_order,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  (SELECT id FROM page_guides WHERE page_path = '/profile'),
  '基本信息管理',
  '查看和编辑个人基本信息，包括姓名、邮箱、手机号等',
  '/profile#basic-info',
  '["查看个人信息", "编辑基本资料", "更换头像", "联系方式管理"]',
  1,
  1,
  NOW(),
  NOW()
),
(
  (SELECT id FROM page_guides WHERE page_path = '/profile'),
  '详细信息设置',
  '管理更详细的个人信息，如性别、生日、学历、地址等',
  '/profile#detailed-info',
  '["性别设置", "生日管理", "学历信息", "地址管理", "个人介绍"]',
  2,
  1,
  NOW(),
  NOW()
),
(
  (SELECT id FROM page_guides WHERE page_path = '/profile'),
  '安全设置',
  '管理账户安全相关设置，包括密码修改等',
  '/profile#security',
  '["修改登录密码", "安全设置", "账户安全"]',
  3,
  1,
  NOW(),
  NOW()
);

-- 验证插入结果
SELECT 
  pg.page_path,
  pg.page_name,
  pg.category,
  COUNT(pgs.id) as section_count
FROM page_guides pg
LEFT JOIN page_guide_sections pgs ON pg.id = pgs.page_guide_id
WHERE pg.page_path = '/profile'
GROUP BY pg.id;

SELECT 'Profile page guide created successfully!' as result;
