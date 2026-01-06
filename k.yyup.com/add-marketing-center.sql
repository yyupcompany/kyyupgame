-- 添加营销推广中心页面感知说明

-- 1. 添加营销推广中心页面
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/marketing', '营销推广中心', '营销推广中心是幼儿园品牌建设和市场推广的专业平台，提供广告管理、营销活动、品牌宣传、市场分析等全方位的营销推广功能。这里可以进行招生宣传、品牌建设、市场调研等营销活动管理。', 'marketing', 8, JSON_ARRAY('advertisements', 'marketing_campaigns', 'posters', 'market_analysis'), '用户正在营销推广中心页面，这是一个专业的营销管理平台。用户可能需要管理广告、策划活动、分析市场等。请根据用户的具体问题，结合营销相关的数据库信息提供专业建议。', 1);

-- 2. 添加营销推广中心功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '营销概览',
  '营销活动的整体效果展示和关键营销指标的综合分析，提供营销ROI的全面视图',
  '/centers/marketing',
  JSON_ARRAY('营销效果统计', '转化率分析', '投入产出比', '渠道效果', '品牌影响力', '市场份额'),
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT 
  pg.id,
  '广告管理',
  '各类广告投放的统一管理平台，支持多渠道广告的创建、投放和效果监控',
  '/advertisement',
  JSON_ARRAY('广告创建', '投放管理', '效果监控', '预算控制', '渠道分析', '创意优化'),
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT 
  pg.id,
  '营销活动',
  '营销活动的策划、执行和效果评估，包括线上线下各类推广活动的管理',
  '/marketing/campaigns',
  JSON_ARRAY('活动策划', '执行跟踪', '效果评估', '参与统计', '成本分析', '活动优化'),
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT 
  pg.id,
  '海报设计',
  '营销海报和宣传材料的设计、制作和管理，支持多种模板和自定义设计',
  '/marketing/posters',
  JSON_ARRAY('海报模板', '设计工具', '素材库', '批量生成', '发布管理', '效果跟踪'),
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT 
  pg.id,
  '市场分析',
  '市场趋势和竞争对手的深度分析，为营销决策提供数据支持',
  '/marketing/analysis',
  JSON_ARRAY('市场调研', '竞品分析', '趋势预测', '用户画像', '需求分析', '策略建议'),
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT 
  pg.id,
  '品牌管理',
  '品牌形象和声誉的统一管理，包括品牌建设、维护和传播策略',
  '/marketing/brand',
  JSON_ARRAY('品牌定位', '形象设计', '声誉监控', '传播策略', '品牌价值', '影响力评估'),
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing';
