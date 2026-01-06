-- 修复仪表板中心页面说明文档
USE kindergarten_management;

-- 插入仪表板中心页面说明文档
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

-- 查询确认
SELECT page_path, page_name, category FROM page_guides WHERE page_path = '/centers/dashboard';
