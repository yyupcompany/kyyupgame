-- 添加系统管理中心页面感知说明

-- 1. 添加系统管理中心页面
INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active) VALUES
('/centers/system', '系统管理中心', '系统管理中心是整个幼儿园管理系统的控制核心，提供系统配置、安全管理、数据备份、日志监控等关键功能。这里是系统管理员进行系统维护和优化的专业平台。', 'system', 10, JSON_ARRAY('system_config', 'system_logs', 'user_roles', 'permissions', 'backups'), '用户正在系统管理中心页面，这是系统的核心管理平台。用户可能需要进行系统配置、安全管理、监控维护等。请根据用户的具体问题，结合系统管理相关的功能提供专业建议。', 1);

-- 2. 添加系统管理中心功能板块
INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active) 
SELECT 
  pg.id,
  '系统概览',
  '系统运行状态的实时监控和关键指标展示，提供系统健康度的全面视图',
  '/centers/system',
  JSON_ARRAY('系统状态监控', '性能指标', '资源使用率', '在线用户', '系统负载', '健康检查'),
  1,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '用户管理',
  '系统用户账户的创建、管理和维护，包括用户信息和访问权限的统一管理',
  '/system/users',
  JSON_ARRAY('用户创建', '账户管理', '密码策略', '登录记录', '状态管理', '批量操作'),
  2,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '角色权限',
  '系统角色和权限的精细化管理，确保不同用户拥有适当的系统访问权限',
  '/system/roles',
  JSON_ARRAY('角色定义', '权限矩阵', '继承关系', '权限审计', '访问控制', '安全策略'),
  3,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '系统配置',
  '系统参数和配置项的统一管理，支持系统行为的个性化定制和优化',
  '/system/settings',
  JSON_ARRAY('参数配置', '功能开关', '界面定制', '业务规则', '集成设置', '环境配置'),
  4,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '日志监控',
  '系统运行日志的收集、分析和监控，提供问题诊断和安全审计功能',
  '/system/logs',
  JSON_ARRAY('日志收集', '错误监控', '性能分析', '安全审计', '报警机制', '日志归档'),
  5,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system'
UNION ALL
SELECT 
  pg.id,
  '数据备份',
  '系统数据的定期备份和恢复管理，确保数据安全和业务连续性',
  '/system/backup',
  JSON_ARRAY('自动备份', '手动备份', '数据恢复', '备份策略', '存储管理', '恢复测试'),
  6,
  1
FROM page_guides pg WHERE pg.page_path = '/centers/system';
