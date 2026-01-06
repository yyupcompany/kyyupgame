-- 创建页面说明文档表
CREATE TABLE IF NOT EXISTS page_guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL UNIQUE COMMENT '页面路径，如 /centers/activity',
  page_name VARCHAR(100) NOT NULL COMMENT '页面名称，如 活动中心',
  page_description TEXT NOT NULL COMMENT '页面详细描述',
  category VARCHAR(50) NOT NULL COMMENT '页面分类，如 中心页面、管理页面等',
  importance INT NOT NULL DEFAULT 5 COMMENT '页面重要性，1-10，影响AI介绍的详细程度',
  related_tables JSON COMMENT '页面相关的数据库表名列表',
  context_prompt TEXT COMMENT '发送给AI的上下文提示词',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_page_path (page_path),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面说明文档表';

-- 创建页面功能板块表
CREATE TABLE IF NOT EXISTS page_guide_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_guide_id INT NOT NULL COMMENT '关联的页面说明文档ID',
  section_name VARCHAR(100) NOT NULL COMMENT '功能板块名称',
  section_description TEXT NOT NULL COMMENT '功能板块描述',
  section_path VARCHAR(255) COMMENT '功能板块对应的路径（如果有）',
  features JSON COMMENT '功能特性列表',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_guide_id) REFERENCES page_guides(id) ON DELETE CASCADE,
  INDEX idx_page_guide_id (page_guide_id),
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面功能板块表';

-- 插入示例数据
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/activity', '活动中心', '活动中心是招生环节非常重要的环节，我们覆盖了多个功能板块，为幼儿园提供全方位的活动管理解决方案。这里可以统一管理所有活动相关的功能，包括活动策划、报名管理、数据分析等。', '中心页面', 9, '["activities", "activity_registrations", "activity_templates", "activity_evaluations", "activity_checkins"]', '用户正在活动中心页面，这是一个综合性的活动管理平台。用户可能需要查看活动数据、管理活动、分析活动效果等。请根据用户的具体问题，结合活动相关的数据库信息提供专业建议。', TRUE),

('/centers/enrollment', '招生中心', '招生中心是幼儿园招生工作的核心平台，整合了招生计划、申请管理、咨询服务等全流程功能，为招生工作提供一站式解决方案。', '中心页面', 10, '["enrollment_plans", "enrollment_applications", "enrollment_consultations", "enrollment_statistics"]', '用户正在招生中心页面，这是招生工作的核心管理平台。用户可能需要查看招生数据、管理招生计划、处理申请等。请结合招生相关数据提供专业指导。', TRUE),

('/centers/ai', 'AI中心', 'AI中心是人工智能功能的集中管理平台，包含AI查询、智能分析、模型管理等功能，为幼儿园提供智能化的数据分析和决策支持。', '中心页面', 8, '["ai_query_history", "ai_model_configs", "ai_conversations", "ai_shortcuts"]', '用户正在AI中心页面，这里提供各种AI功能和服务。用户可能需要进行数据查询、AI分析或管理AI功能。请提供AI相关的专业建议。', TRUE),

('/dashboard', '数据概览', '系统主仪表板，提供幼儿园运营的全局数据概览，包括关键指标、趋势分析、快速操作等功能。', '仪表板', 9, '["students", "teachers", "activities", "enrollment_applications", "classes"]', '用户正在主仪表板页面，这里显示幼儿园的整体运营数据。用户可能需要了解总体情况、查看关键指标或进行快速操作。', TRUE);

-- 插入活动中心的功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) VALUES
((SELECT id FROM page_guides WHERE page_path = '/centers/activity'), '活动中心首页', '实时了解我们当前所有活动的最新看板数据，包括活动统计、参与情况、效果分析等关键指标', '/centers/activity?tab=overview', '["活动总数统计", "进行中活动", "报名人数统计", "平均评分", "实时数据看板", "快速操作入口"]', 1, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/activity'), '活动管理', '全面的活动管理功能，包括活动列表查看、活动创建、编辑、删除等核心操作', '/centers/activity?tab=activities', '["活动列表", "活动创建", "活动编辑", "活动删除", "活动状态管理", "活动搜索筛选"]', 2, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/activity'), '活动模板', '丰富的活动模板库，提供各种类型的活动模板，帮助快速创建标准化活动', '/centers/activity?tab=templates', '["模板库管理", "模板预览", "模板使用", "自定义模板", "模板分类", "模板统计"]', 3, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/activity'), '报名管理', '完整的活动报名管理系统，处理报名申请、审核、统计等相关功能', '/centers/activity?tab=registrations', '["报名列表", "报名审核", "报名统计", "报名导出", "报名通知", "报名设置"]', 4, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/activity'), '数据分析', '深度的活动数据分析，包括参与趋势、效果评估、满意度分析等', '/centers/activity?tab=analytics', '["参与趋势分析", "活动类型分布", "满意度统计", "效果对比", "数据可视化", "报表导出"]', 5, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/activity'), '海报管理', '活动宣传海报的设计、生成、管理功能，支持多种模板和自定义设计', '/activity/poster', '["海报模板", "海报设计", "海报生成", "海报预览", "海报发布", "海报管理"]', 6, TRUE);

-- 插入招生中心的功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) VALUES
((SELECT id FROM page_guides WHERE page_path = '/centers/enrollment'), '招生概览', '招生工作的整体数据概览，包括招生进度、申请统计、转化率等关键指标', '/centers/enrollment?tab=overview', '["招生计划进度", "申请数量统计", "转化率分析", "招生趋势", "关键指标看板"]', 1, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/enrollment'), '招生计划', '招生计划的制定、管理和执行，包括名额分配、时间安排、策略制定等', '/centers/enrollment?tab=plans', '["计划制定", "名额管理", "时间安排", "策略配置", "计划执行监控"]', 2, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/enrollment'), '申请管理', '处理入园申请的完整流程，包括申请审核、资料管理、录取决策等', '/centers/enrollment?tab=applications', '["申请列表", "申请审核", "资料管理", "录取决策", "申请统计"]', 3, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/enrollment'), '咨询服务', '家长咨询的管理和跟进，包括咨询记录、回访安排、满意度调查等', '/centers/enrollment?tab=consultations', '["咨询记录", "回访管理", "满意度调查", "咨询统计", "服务质量监控"]', 4, TRUE);

-- 插入AI中心的功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) VALUES
((SELECT id FROM page_guides WHERE page_path = '/centers/ai'), 'AI查询', '智能数据查询功能，支持自然语言查询数据库，获取各种统计分析结果', '/centers/ai?tab=query', '["自然语言查询", "数据库查询", "查询历史", "结果导出", "查询模板"]', 1, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/ai'), '智能分析', '基于AI的数据分析功能，提供深度洞察和预测分析', '/centers/ai?tab=analysis', '["趋势分析", "预测模型", "异常检测", "关联分析", "智能报告"]', 2, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/ai'), '模型管理', 'AI模型的配置和管理，包括模型选择、参数调优、性能监控等', '/centers/ai?tab=models', '["模型配置", "性能监控", "参数调优", "模型切换", "使用统计"]', 3, TRUE),

((SELECT id FROM page_guides WHERE page_path = '/centers/ai'), '快捷操作', '预设的AI快捷操作，提供常用的分析模板和操作流程', '/centers/ai?tab=shortcuts', '["快捷模板", "操作流程", "自定义快捷操作", "使用统计", "效果评估"]', 4, TRUE);
