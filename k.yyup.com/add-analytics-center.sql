-- 添加数据分析中心页面感知说明

-- 1. 添加数据分析中心页面
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/analytics', '数据分析中心', '数据分析中心是幼儿园数据驱动决策的核心平台，提供深度数据挖掘、趋势分析、预测建模、智能报告等专业的数据分析功能。这里可以进行业务分析、运营优化、决策支持等数据科学应用。', 'analytics', 9, JSON_ARRAY('all_tables'), '用户正在数据分析中心页面，这是一个专业的数据分析平台。用户可能需要进行数据挖掘、趋势分析、预测建模等。请根据用户的具体问题，结合数据分析相关的功能提供专业建议。', 1);

-- 2. 添加数据分析中心功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '分析概览',
  '数据分析的整体状况和关键洞察的综合展示，提供数据驱动决策的全面视图',
  '/centers/analytics',
  JSON_ARRAY('数据概览', '关键洞察', '趋势分析', '异常检测', '预测结果', '决策建议'),
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT 
  pg.id,
  '招生分析',
  '招生数据的深度分析和趋势预测，为招生策略优化提供数据支持',
  '/statistics',
  JSON_ARRAY('招生趋势', '渠道分析', '转化漏斗', '成本效益', '预测模型', '策略优化'),
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT 
  pg.id,
  '运营分析',
  '幼儿园运营数据的综合分析，包括效率、质量、成本等多维度分析',
  '/analytics/operations',
  JSON_ARRAY('运营效率', '资源利用', '成本分析', '质量指标', '绩效评估', '优化建议'),
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT 
  pg.id,
  '财务分析',
  '财务数据的专业分析和预测，支持财务决策和风险控制',
  '/analytics/finance',
  JSON_ARRAY('收入分析', '成本结构', '盈利能力', '现金流', '财务预测', '风险评估'),
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT 
  pg.id,
  '学生分析',
  '学生数据的深度挖掘和个性化分析，支持个性化教育和发展规划',
  '/analytics/students',
  JSON_ARRAY('学习分析', '发展轨迹', '能力评估', '个性化建议', '预警机制', '成长预测'),
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT 
  pg.id,
  '智能报告',
  '基于AI的智能报告生成和洞察发现，自动化数据分析和报告制作',
  '/analytics/reports',
  JSON_ARRAY('自动报告', '智能洞察', '异常发现', '趋势预测', '建议生成', '报告定制'),
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics';
