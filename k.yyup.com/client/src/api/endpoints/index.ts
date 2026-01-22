/**
 * API端点统一导出文件
 * 
 * 使用方法：
 * import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '@/api/endpoints'
 * 
 * 或者：
 * import { AUTH_ENDPOINTS } from '@/api/endpoints/auth'
 */

// 基础配置
export * from './base';

// 认证相关
export * from './auth';

// 用户管理
export * from './user';

// 系统管理
export * from './system';

// 仪表盘
export * from './dashboard';

// 业务核心
export * from './business';

// 统计分析
export * from './statistics';

// AI功能
export * from './ai';

// 招生管理
export * from './enrollment';

// 活动管理
export * from './activity';

// 营销管理
export * from './marketing';

// 文件管理
export * from './file';

// 考勤管理
export * from './attendance';

// 通用工具
export * from './utils';

// 硬编码数据替换
export * from './hardcoded-data-replacements';