-- 添加系统中心子页面的页面说明文档
-- 数据库: kargerdensales
-- 表: page_guides

-- 1. 系统配置页面
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
  '/system/settings',
  '系统配置',
  '系统配置页面是管理系统基础参数和功能设置的核心模块。在这里您可以配置系统的基本参数、功能开关、环境变量、业务规则等。通过合理的系统配置，可以确保系统按照您的需求稳定运行，提升工作效率。',
  '系统管理',
  8,
  '["system_configs", "system_settings", "config_categories"]',
  '用户正在系统配置页面，这里可以管理系统的各种参数和设置。用户可能需要修改系统配置、调整功能参数、设置业务规则等。请提供系统配置相关的专业建议。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 2. 用户管理页面
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
  '/system/users',
  '用户管理',
  '用户管理页面是管理系统用户账户、角色权限和访问控制的专业平台。在这里您可以创建和管理用户账户、分配角色权限、设置访问控制策略、监控用户活动。通过精细化的用户权限管理，确保系统安全和数据保护。',
  '系统管理',
  9,
  '["users", "roles", "permissions", "user_roles", "role_permissions"]',
  '用户正在用户管理页面，这里可以管理系统用户和权限。用户可能需要创建用户账户、分配角色、设置权限、管理访问控制等。请提供用户权限管理的专业指导。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 3. 系统监控页面
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
  '/system/dashboard',
  '系统监控',
  '系统监控页面提供实时的系统性能监控和资源使用情况分析。在这里您可以查看服务器性能指标、数据库状态、网络连接、存储使用情况等关键信息。通过持续的系统监控，及时发现和解决性能问题，确保系统稳定运行。',
  '系统管理',
  8,
  '["system_metrics", "performance_logs", "server_status", "resource_usage"]',
  '用户正在系统监控页面，这里可以查看系统性能和运行状态。用户可能需要监控系统指标、分析性能问题、查看资源使用情况等。请提供系统监控和性能优化的专业建议。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 4. 数据备份页面
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
  '/system/Backup',
  '数据备份',
  '数据备份页面是管理系统数据备份和恢复策略的重要工具。在这里您可以配置自动备份计划、执行手动备份、管理备份文件、进行数据恢复操作。定期的数据备份是保障数据安全和业务连续性的关键措施。',
  '系统管理',
  9,
  '["backup_records", "backup_configs", "restore_logs", "storage_management"]',
  '用户正在数据备份页面，这里可以管理数据备份和恢复。用户可能需要配置备份策略、执行备份操作、管理备份文件、进行数据恢复等。请提供数据备份和恢复的专业指导。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 5. 日志管理页面
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
  '/system/Log',
  '日志管理',
  '日志管理页面提供系统日志的查看、分析和管理功能。在这里您可以查看系统运行日志、操作记录、错误日志、安全日志等。通过日志分析，可以及时发现系统问题、追踪操作记录、进行安全审计，为系统维护和问题排查提供重要依据。',
  '系统管理',
  7,
  '["system_logs", "operation_logs", "error_logs", "security_logs", "audit_trails"]',
  '用户正在日志管理页面，这里可以查看和分析系统日志。用户可能需要查看操作记录、分析错误日志、进行安全审计、排查系统问题等。请提供日志分析和问题排查的专业建议。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 6. 安全设置页面
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
  '/system/Security',
  '安全设置',
  '安全设置页面是管理系统安全策略和防护措施的专业平台。在这里您可以配置密码策略、访问限制、防火墙规则、安全审计等。通过完善的安全设置，保护系统免受恶意攻击，确保数据安全和用户隐私。',
  '系统管理',
  9,
  '["security_policies", "access_controls", "firewall_rules", "security_audit", "threat_detection"]',
  '用户正在安全设置页面，这里可以管理系统安全策略和防护措施。用户可能需要配置安全策略、设置访问控制、管理防护规则、进行安全审计等。请提供系统安全管理的专业指导。',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  page_description = VALUES(page_description),
  context_prompt = VALUES(context_prompt),
  updated_at = NOW();

-- 验证插入结果
SELECT page_path, page_name, category FROM page_guides WHERE page_path LIKE '/system/%' ORDER BY page_path;
