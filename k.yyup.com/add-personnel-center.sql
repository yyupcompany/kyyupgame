-- 添加人员中心页面感知说明

-- 1. 添加人员中心页面
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/personnel', '人员中心', '人员中心是幼儿园人力资源管理的核心平台，提供教师、学生、家长等所有人员信息的统一管理。这里可以进行人员档案管理、权限分配、绩效评估等全方位的人员管理功能。', 'management', 9, JSON_ARRAY('teachers', 'students', 'parents', 'users', 'user_roles'), '用户正在人员中心页面，这是一个综合性的人员管理平台。用户可能需要查看人员信息、管理权限、分析绩效等。请根据用户的具体问题，结合人员相关的数据库信息提供专业建议。', 1);

-- 2. 添加人员中心功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '人员概览',
  '全面展示幼儿园所有人员的基本信息和统计数据，提供人员结构的整体视图',
  '/centers/personnel',
  JSON_ARRAY('人员总数统计', '角色分布图', '在职状态', '新增人员', '人员变动趋势', '快速搜索'),
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '教师管理',
  '专业的教师信息管理系统，包括教师档案、资质认证、课程安排等功能',
  '/teacher',
  JSON_ARRAY('教师档案', '资质管理', '课程分配', '绩效评估', '培训记录', '考勤管理'),
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '学生管理',
  '学生信息的全生命周期管理，从入学到毕业的完整记录和跟踪',
  '/student',
  JSON_ARRAY('学生档案', '班级分配', '成长记录', '健康档案', '家长联系', '学习进度'),
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '家长服务',
  '家长信息管理和服务平台，提供家校沟通和家长参与的各种功能',
  '/customer',
  JSON_ARRAY('家长档案', '联系方式', '沟通记录', '参与活动', '反馈意见', '满意度调查'),
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '权限管理',
  '系统用户权限和角色的统一管理，确保信息安全和访问控制',
  '/system/permissions',
  JSON_ARRAY('角色定义', '权限分配', '访问控制', '安全审计', '用户组管理', '权限继承'),
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel'
UNION ALL
SELECT 
  pg.id,
  '绩效评估',
  '人员绩效的科学评估和管理系统，支持多维度评价和发展规划',
  '/performance',
  JSON_ARRAY('评估指标', '评价周期', '绩效报告', '改进建议', '发展规划', '激励机制'),
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/personnel';
