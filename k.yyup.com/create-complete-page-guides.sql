-- 完整的页面感知说明文档数据
-- 为幼儿园招生管理系统的所有主要中心和页面创建详细的功能说明

-- 首先清理现有数据（保留活动中心、AI中心、招生中心的现有数据）
-- DELETE FROM page_guide_sections WHERE page_guide_id NOT IN (
--   SELECT id FROM page_guides WHERE page_path IN ('/centers/activity', '/centers/ai', '/centers/enrollment')
-- );
-- DELETE FROM page_guides WHERE page_path NOT IN ('/centers/activity', '/centers/ai', '/centers/enrollment');

-- 1. 数据概览页面 - 补充功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '数据概览首页',
  '系统核心数据的实时展示中心，提供关键指标的快速查看和分析功能',
  '/dashboard',
  '["实时数据看板", "关键指标统计", "趋势图表", "快速导航", "数据刷新", "个性化配置"]',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '校园概览',
  '全面展示校园运营状况，包括学生、教师、班级等核心信息的综合视图',
  '/dashboard/campus-overview',
  '学生总数统计, 教师分布情况, 班级运营状态, 设施使用情况, 安全监控, 实时更新',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '数据统计',
  '深度数据分析和统计报表功能，支持多维度数据挖掘和可视化展示',
  '/dashboard/data-statistics',
  '多维度统计, 图表可视化, 数据导出, 自定义报表, 趋势分析, 对比分析',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '重要通知',
  '系统重要信息和通知的集中管理和展示平台，确保关键信息及时传达',
  '/dashboard/important-notices',
  '通知发布, 消息推送, 优先级管理, 阅读状态, 分类筛选, 历史记录',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '日程管理',
  '个人和团队日程的统一管理平台，支持多种视图和提醒功能',
  '/dashboard/schedule',
  '日历视图, 待办事项, 事件提醒, 周月视图, 任务分配, 进度跟踪',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard'
UNION ALL
SELECT 
  pg.id,
  '通知中心',
  '系统消息和通知的统一处理中心，提供消息分类、处理和响应功能',
  '/dashboard/notification-center',
  '消息分类, 批量处理, 状态管理, 自动回复, 消息模板, 发送记录',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/dashboard';

-- 2. 人员中心页面
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/personnel', '人员中心', '人员中心是幼儿园人力资源管理的核心平台，提供教师、学生、家长等所有人员信息的统一管理。这里可以进行人员档案管理、权限分配、绩效评估等全方位的人员管理功能。', 'management', 9, 'teachers, students, parents, users, user_roles', '用户正在人员中心页面，这是一个综合性的人员管理平台。用户可能需要查看人员信息、管理权限、分析绩效等。请根据用户的具体问题，结合人员相关的数据库信息提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '人员概览',
  '全面展示幼儿园所有人员的基本信息和统计数据，提供人员结构的整体视图',
  '/centers/personnel',
  '人员总数统计, 角色分布图, 在职状态, 新增人员, 人员变动趋势, 快速搜索',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '教师管理',
  '专业的教师信息管理系统，包括教师档案、资质认证、课程安排等功能',
  '/teacher',
  '教师档案, 资质管理, 课程分配, 绩效评估, 培训记录, 考勤管理',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '学生管理',
  '学生信息的全生命周期管理，从入学到毕业的完整记录和跟踪',
  '/student',
  '学生档案, 班级分配, 成长记录, 健康档案, 家长联系, 学习进度',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '家长服务',
  '家长信息管理和服务平台，提供家校沟通和家长参与的各种功能',
  '/customer',
  '家长档案, 联系方式, 沟通记录, 参与活动, 反馈意见, 满意度调查',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '权限管理',
  '系统用户权限和角色的统一管理，确保信息安全和访问控制',
  '/system/permissions',
  '角色定义, 权限分配, 访问控制, 安全审计, 用户组管理, 权限继承',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '绩效评估',
  '人员绩效的科学评估和管理系统，支持多维度评价和发展规划',
  '/performance',
  '评估指标, 评价周期, 绩效报告, 改进建议, 发展规划, 激励机制',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel';

-- 3. 系统管理中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/system', '系统管理中心', '系统管理中心是整个幼儿园管理系统的控制核心，提供系统配置、安全管理、数据备份、日志监控等关键功能。这里是系统管理员进行系统维护和优化的专业平台。', 'system', 10, 'system_config, system_logs, user_roles, permissions, backups', '用户正在系统管理中心页面，这是系统的核心管理平台。用户可能需要进行系统配置、安全管理、监控维护等。请根据用户的具体问题，结合系统管理相关的功能提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '系统概览',
  '系统运行状态的实时监控和关键指标展示，提供系统健康度的全面视图',
  '/centers/system',
  '系统状态监控, 性能指标, 资源使用率, 在线用户, 系统负载, 健康检查',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '用户管理',
  '系统用户账户的创建、管理和维护，包括用户信息和访问权限的统一管理',
  '/system/users',
  '用户创建, 账户管理, 密码策略, 登录记录, 状态管理, 批量操作',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '角色权限',
  '系统角色和权限的精细化管理，确保不同用户拥有适当的系统访问权限',
  '/system/roles',
  '角色定义, 权限矩阵, 继承关系, 权限审计, 访问控制, 安全策略',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '系统配置',
  '系统参数和配置项的统一管理，支持系统行为的个性化定制和优化',
  '/system/settings',
  '参数配置, 功能开关, 界面定制, 业务规则, 集成设置, 环境配置',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '日志监控',
  '系统运行日志的收集、分析和监控，提供问题诊断和安全审计功能',
  '/system/logs',
  '日志收集, 错误监控, 性能分析, 安全审计, 报警机制, 日志归档',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '数据备份',
  '系统数据的定期备份和恢复管理，确保数据安全和业务连续性',
  '/system/backup',
  '自动备份, 手动备份, 数据恢复, 备份策略, 存储管理, 恢复测试',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system';

-- 4. 财务管理中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/finance', '财务管理中心', '财务管理中心是幼儿园财务运营的核心平台，提供收费管理、财务分析、预算控制、报表生成等全方位的财务管理功能。这里可以进行学费收缴、成本控制、财务报告等专业财务操作。', 'finance', 9, 'enrollments, payments, budgets, financial_records', '用户正在财务管理中心页面，这是一个专业的财务管理平台。用户可能需要查看财务数据、管理收费、分析成本等。请根据用户的具体问题，结合财务相关的数据库信息提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active)
SELECT
  pg.id,
  '财务概览',
  '财务状况的实时展示和关键财务指标的综合分析，提供财务健康度的全面视图',
  '/centers/finance',
  '收入统计, 支出分析, 利润率, 现金流, 预算执行, 财务趋势',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/finance'
UNION ALL
SELECT
  pg.id,
  '收费管理',
  '学费和各项费用的统一管理系统，支持多种收费模式和缴费方式',
  '/finance/tuition',
  '学费设置, 缴费记录, 欠费管理, 退费处理, 优惠政策, 收费统计',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/finance'
UNION ALL
SELECT
  pg.id,
  '预算管理',
  '年度和月度预算的制定、执行和监控，确保财务计划的有效实施',
  '/finance/budget',
  '预算制定, 预算执行, 差异分析, 预算调整, 成本控制, 预算报告',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/finance'
UNION ALL
SELECT
  pg.id,
  '财务报表',
  '专业的财务报表生成和分析系统，支持多种财务报告的自动生成',
  '/finance/reports',
  '损益表, 资产负债表, 现金流量表, 自定义报表, 报表导出, 财务分析',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/finance'
UNION ALL
SELECT
  pg.id,
  '成本分析',
  '运营成本的详细分析和优化建议，帮助提高财务效率和盈利能力',
  '/finance/cost-analysis',
  '成本分类, 成本分摊, 效率分析, 成本优化, 盈亏平衡, 投资回报',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/finance'
UNION ALL
SELECT
  pg.id,
  '财务审计',
  '财务数据的审计和合规性检查，确保财务管理的规范性和准确性',
  '/finance/audit',
  '审计记录, 合规检查, 风险评估, 内控管理, 审计报告, 整改跟踪',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/finance';

-- 5. 教学管理中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/education', '教学管理中心', '教学管理中心是幼儿园教育教学活动的核心管理平台，提供课程管理、教学计划、学习评估、教学资源等全方位的教学管理功能。这里可以进行课程安排、教学质量监控、学生发展评估等专业教学管理。', 'education', 9, 'classes, courses, teachers, students, assessments', '用户正在教学管理中心页面，这是一个专业的教学管理平台。用户可能需要管理课程、安排教学、评估学习等。请根据用户的具体问题，结合教学相关的数据库信息提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active)
SELECT
  pg.id,
  '教学概览',
  '教学活动的整体状况展示，包括课程进度、教学质量、学生表现等关键指标',
  '/centers/education',
  '课程统计, 教学进度, 学生表现, 教师评价, 教学质量, 发展趋势',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/education'
UNION ALL
SELECT
  pg.id,
  '课程管理',
  '幼儿园课程体系的统一管理，包括课程设置、教学大纲、课程安排等功能',
  '/education/courses',
  '课程设置, 教学大纲, 课程安排, 教材管理, 课程评估, 课程优化',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/education'
UNION ALL
SELECT
  pg.id,
  '班级管理',
  '班级的日常管理和教学组织，包括班级信息、学生管理、教学安排等',
  '/class',
  '班级信息, 学生名单, 教师分配, 课程安排, 班级活动, 成长记录',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/education'
UNION ALL
SELECT
  pg.id,
  '学习评估',
  '学生学习成果的科学评估和发展跟踪，支持个性化教育和发展规划',
  '/education/assessment',
  '发展评估, 学习记录, 能力测评, 成长档案, 个性化建议, 家长反馈',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/education'
UNION ALL
SELECT
  pg.id,
  '教学资源',
  '教学材料和资源的统一管理，包括教具、图书、多媒体资源等',
  '/education/resources',
  '教具管理, 图书资源, 多媒体库, 资源共享, 使用记录, 资源评价',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/education'
UNION ALL
SELECT
  pg.id,
  '教学质量',
  '教学质量的监控和改进，包括教学评估、质量分析、改进措施等',
  '/education/quality',
  '质量监控, 教学评估, 问题分析, 改进计划, 质量报告, 持续改进',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/education';

-- 6. 营销推广中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/marketing', '营销推广中心', '营销推广中心是幼儿园品牌建设和市场推广的专业平台，提供广告管理、营销活动、品牌宣传、市场分析等全方位的营销推广功能。这里可以进行招生宣传、品牌建设、市场调研等营销活动管理。', 'marketing', 8, 'advertisements, marketing_campaigns, posters, market_analysis', '用户正在营销推广中心页面，这是一个专业的营销管理平台。用户可能需要管理广告、策划活动、分析市场等。请根据用户的具体问题，结合营销相关的数据库信息提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active)
SELECT
  pg.id,
  '营销概览',
  '营销活动的整体效果展示和关键营销指标的综合分析，提供营销ROI的全面视图',
  '/centers/marketing',
  '营销效果统计, 转化率分析, 投入产出比, 渠道效果, 品牌影响力, 市场份额',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '广告管理',
  '各类广告投放的统一管理平台，支持多渠道广告的创建、投放和效果监控',
  '/advertisement',
  '广告创建, 投放管理, 效果监控, 预算控制, 渠道分析, 创意优化',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '营销活动',
  '营销活动的策划、执行和效果评估，包括线上线下各类推广活动的管理',
  '/marketing/campaigns',
  '活动策划, 执行跟踪, 效果评估, 参与统计, 成本分析, 活动优化',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '海报设计',
  '营销海报和宣传材料的设计、制作和管理，支持多种模板和自定义设计',
  '/marketing/posters',
  '海报模板, 设计工具, 素材库, 批量生成, 发布管理, 效果跟踪',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '市场分析',
  '市场趋势和竞争对手的深度分析，为营销决策提供数据支持',
  '/marketing/analysis',
  '市场调研, 竞品分析, 趋势预测, 用户画像, 需求分析, 策略建议',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '品牌管理',
  '品牌形象和声誉的统一管理，包括品牌建设、维护和传播策略',
  '/marketing/brand',
  '品牌定位, 形象设计, 声誉监控, 传播策略, 品牌价值, 影响力评估',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing';

-- 6. 营销推广中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/marketing', '营销推广中心', '营销推广中心是幼儿园品牌建设和市场推广的专业平台，提供广告管理、营销活动、品牌宣传、市场分析等全方位的营销推广功能。这里可以进行招生宣传、品牌建设、市场调研等营销活动管理。', 'marketing', 8, 'advertisements, marketing_campaigns, posters, market_analysis', '用户正在营销推广中心页面，这是一个专业的营销管理平台。用户可能需要管理广告、策划活动、分析市场等。请根据用户的具体问题，结合营销相关的数据库信息提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active)
SELECT
  pg.id,
  '营销概览',
  '营销活动的整体效果展示和关键营销指标的综合分析，提供营销ROI的全面视图',
  '/centers/marketing',
  '营销效果统计, 转化率分析, 投入产出比, 渠道效果, 品牌影响力, 市场份额',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '广告管理',
  '各类广告投放的统一管理平台，支持多渠道广告的创建、投放和效果监控',
  '/advertisement',
  '广告创建, 投放管理, 效果监控, 预算控制, 渠道分析, 创意优化',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '营销活动',
  '营销活动的策划、执行和效果评估，包括线上线下各类推广活动的管理',
  '/marketing/campaigns',
  '活动策划, 执行跟踪, 效果评估, 参与统计, 成本分析, 活动优化',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '海报设计',
  '营销海报和宣传材料的设计、制作和管理，支持多种模板和自定义设计',
  '/marketing/posters',
  '海报模板, 设计工具, 素材库, 批量生成, 发布管理, 效果跟踪',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '市场分析',
  '市场趋势和竞争对手的深度分析，为营销决策提供数据支持',
  '/marketing/analysis',
  '市场调研, 竞品分析, 趋势预测, 用户画像, 需求分析, 策略建议',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing'
UNION ALL
SELECT
  pg.id,
  '品牌管理',
  '品牌形象和声誉的统一管理，包括品牌建设、维护和传播策略',
  '/marketing/brand',
  '品牌定位, 形象设计, 声誉监控, 传播策略, 品牌价值, 影响力评估',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/marketing';

-- 7. 数据分析中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/analytics', '数据分析中心', '数据分析中心是幼儿园数据驱动决策的核心平台，提供深度数据挖掘、趋势分析、预测建模、智能报告等专业的数据分析功能。这里可以进行业务分析、运营优化、决策支持等数据科学应用。', 'analytics', 9, 'all_tables', '用户正在数据分析中心页面，这是一个专业的数据分析平台。用户可能需要进行数据挖掘、趋势分析、预测建模等。请根据用户的具体问题，结合数据分析相关的功能提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active)
SELECT
  pg.id,
  '分析概览',
  '数据分析的整体状况和关键洞察的综合展示，提供数据驱动决策的全面视图',
  '/centers/analytics',
  '数据概览, 关键洞察, 趋势分析, 异常检测, 预测结果, 决策建议',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '招生分析',
  '招生数据的深度分析和趋势预测，为招生策略优化提供数据支持',
  '/statistics',
  '招生趋势, 渠道分析, 转化漏斗, 成本效益, 预测模型, 策略优化',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '运营分析',
  '幼儿园运营数据的综合分析，包括效率、质量、成本等多维度分析',
  '/analytics/operations',
  '运营效率, 资源利用, 成本分析, 质量指标, 绩效评估, 优化建议',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '财务分析',
  '财务数据的专业分析和预测，支持财务决策和风险控制',
  '/analytics/finance',
  '收入分析, 成本结构, 盈利能力, 现金流, 财务预测, 风险评估',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '学生分析',
  '学生数据的深度挖掘和个性化分析，支持个性化教育和发展规划',
  '/analytics/students',
  '学习分析, 发展轨迹, 能力评估, 个性化建议, 预警机制, 成长预测',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '智能报告',
  '基于AI的智能报告生成和洞察发现，自动化数据分析和报告制作',
  '/analytics/reports',
  '自动报告, 智能洞察, 异常发现, 趋势预测, 建议生成, 报告定制',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics';

-- 8. 园长决策中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/principal', '园长决策中心', '园长决策中心是幼儿园高层管理和战略决策的专业平台，提供全面的管理视图、决策支持、绩效监控、战略规划等功能。这里是园长进行全局管理和重要决策的核心工作台。', 'management', 10, 'all_tables', '用户正在园长决策中心页面，这是园长的专业管理平台。用户可能需要查看全局数据、制定决策、监控绩效等。请根据用户的具体问题，结合园长管理相关的功能提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active)
SELECT
  pg.id,
  '园长仪表板',
  '园长专用的综合管理仪表板，提供全园运营状况的实时监控和关键决策信息',
  '/principal/dashboard',
  '全园概览, 关键指标, 运营状态, 财务概况, 人员状况, 决策提醒',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/principal'
UNION ALL
SELECT
  pg.id,
  '绩效管理',
  '全园绩效的综合管理和评估，包括教师绩效、部门绩效、整体运营绩效',
  '/principal/performance',
  '绩效指标, 评估体系, 绩效分析, 改进计划, 激励机制, 绩效报告',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/principal'
UNION ALL
SELECT
  pg.id,
  '战略规划',
  '幼儿园发展战略的制定、执行和监控，支持长期发展规划和目标管理',
  '/principal/strategy',
  '战略制定, 目标设定, 执行监控, 进度跟踪, 调整优化, 成果评估',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/principal'
UNION ALL
SELECT
  pg.id,
  '决策支持',
  '基于数据的智能决策支持系统，提供决策建议和风险评估',
  '/principal/decision-support',
  '数据分析, 决策建议, 风险评估, 方案对比, 影响预测, 决策记录',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/principal'
UNION ALL
SELECT
  pg.id,
  '质量监控',
  '教学质量和服务质量的全面监控，确保幼儿园运营质量的持续提升',
  '/principal/quality',
  '质量标准, 监控体系, 质量评估, 问题识别, 改进措施, 质量报告',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/principal'
UNION ALL
SELECT
  pg.id,
  '资源配置',
  '全园资源的优化配置和管理，包括人力、财力、物力的统筹安排',
  '/principal/resources',
  '资源规划, 配置优化, 使用监控, 效率分析, 成本控制, 资源报告',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/principal';

-- 9. 更新现有页面的详细信息
UPDATE page_guides SET
  page_description = '数据概览是幼儿园管理系统的核心仪表板，提供全园运营数据的实时展示和关键指标的综合分析。这里汇集了招生、教学、财务、人员等各个方面的重要数据，为管理决策提供全面的数据支持。',
  context_prompt = '用户正在数据概览页面，这是系统的核心仪表板。用户可能需要查看全园数据、分析趋势、监控指标等。请根据用户的具体问题，结合数据概览相关的功能提供专业建议。'
WHERE page_path = '/dashboard';

-- 7. 数据分析中心
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/analytics', '数据分析中心', '数据分析中心是幼儿园数据驱动决策的核心平台，提供深度数据挖掘、趋势分析、预测建模、智能报告等专业的数据分析功能。这里可以进行业务分析、运营优化、决策支持等数据科学应用。', 'analytics', 9, 'all_tables', '用户正在数据分析中心页面，这是一个专业的数据分析平台。用户可能需要进行数据挖掘、趋势分析、预测建模等。请根据用户的具体问题，结合数据分析相关的功能提供专业建议。', 1);

INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active)
SELECT
  pg.id,
  '分析概览',
  '数据分析的整体状况和关键洞察的综合展示，提供数据驱动决策的全面视图',
  '/centers/analytics',
  '数据概览, 关键洞察, 趋势分析, 异常检测, 预测结果, 决策建议',
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '招生分析',
  '招生数据的深度分析和趋势预测，为招生策略优化提供数据支持',
  '/statistics',
  '招生趋势, 渠道分析, 转化漏斗, 成本效益, 预测模型, 策略优化',
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '运营分析',
  '幼儿园运营数据的综合分析，包括效率、质量、成本等多维度分析',
  '/analytics/operations',
  '运营效率, 资源利用, 成本分析, 质量指标, 绩效评估, 优化建议',
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '财务分析',
  '财务数据的专业分析和预测，支持财务决策和风险控制',
  '/analytics/finance',
  '收入分析, 成本结构, 盈利能力, 现金流, 财务预测, 风险评估',
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '学生分析',
  '学生数据的深度挖掘和个性化分析，支持个性化教育和发展规划',
  '/analytics/students',
  '学习分析, 发展轨迹, 能力评估, 个性化建议, 预警机制, 成长预测',
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics'
UNION ALL
SELECT
  pg.id,
  '智能报告',
  '基于AI的智能报告生成和洞察发现，自动化数据分析和报告制作',
  '/analytics/reports',
  '自动报告, 智能洞察, 异常发现, 趋势预测, 建议生成, 报告定制',
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/analytics';
