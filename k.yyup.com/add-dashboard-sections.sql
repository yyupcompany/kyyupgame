-- 为数据概览页面添加功能板块

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '数据概览首页',
  '系统核心数据的实时展示中心，提供关键指标的快速查看和分析功能',
  '/dashboard',
  JSON_ARRAY('实时数据看板', '关键指标统计', '趋势图表', '快速导航', '数据刷新', '个性化配置'),
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '校园概览',
  '全面展示校园运营状况，包括学生、教师、班级等核心信息的综合视图',
  '/dashboard/campus-overview',
  JSON_ARRAY('学生总数统计', '教师分布情况', '班级运营状态', '设施使用情况', '安全监控', '实时更新'),
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '数据统计',
  '深度数据分析和统计报表功能，支持多维度数据挖掘和可视化展示',
  '/dashboard/data-statistics',
  JSON_ARRAY('多维度统计', '图表可视化', '数据导出', '自定义报表', '趋势分析', '对比分析'),
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '重要通知',
  '系统重要信息和通知的集中管理和展示平台，确保关键信息及时传达',
  '/dashboard/important-notices',
  JSON_ARRAY('通知发布', '消息推送', '优先级管理', '阅读状态', '分类筛选', '历史记录'),
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '日程管理',
  '个人和团队日程的统一管理平台，支持多种视图和提醒功能',
  '/dashboard/schedule',
  JSON_ARRAY('日历视图', '待办事项', '事件提醒', '周月视图', '任务分配', '进度跟踪'),
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '通知中心',
  '系统消息和通知的统一处理中心，提供消息分类、处理和响应功能',
  '/dashboard/notification-center',
  JSON_ARRAY('消息分类', '批量处理', '状态管理', '自动回复', '消息模板', '发送记录'),
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard';

-- 更新数据概览页面的详细信息
UPDATE page_guides SET 
  page_description = '数据概览是幼儿园管理系统的核心仪表板，提供全园运营数据的实时展示和关键指标的综合分析。这里汇集了招生、教学、财务、人员等各个方面的重要数据，为管理决策提供全面的数据支持。',
  context_prompt = '用户正在数据概览页面，这是系统的核心仪表板。用户可能需要查看全园数据、分析趋势、监控指标等。请根据用户的具体问题，结合数据概览相关的功能提供专业建议。'
WHERE page_path = '/dashboard';
