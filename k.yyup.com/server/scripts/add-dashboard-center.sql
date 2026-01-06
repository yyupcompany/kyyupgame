-- 添加仪表板中心页面说明文档
-- 数据库: kargerdensales
-- 表: page_guides

-- 插入仪表板中心页面说明文档
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

-- 查询确认数据是否插入成功
SELECT 
  page_path as '页面路径',
  page_name as '页面名称',
  category as '分类',
  importance as '重要性',
  is_active as '是否启用',
  created_at as '创建时间'
FROM page_guides 
WHERE page_path = '/centers/dashboard';

-- 查询所有页面说明文档（可选）
-- SELECT page_path, page_name, category FROM page_guides ORDER BY category, page_path;
