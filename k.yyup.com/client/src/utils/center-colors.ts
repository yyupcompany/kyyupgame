/**
 * 中心颜色映射工具
 * Center Colors Mapping Utility
 *
 * 为每个业务中心分配对应的点缀色
 * 与 PC 端 design-tokens.scss 中的中心点缀色保持一致
 */

/**
 * 中心点缀色映射表
 * 使用 CSS 变量引用，确保与主题系统完全对齐
 */
export const centerAccentColors: Record<string, string> = {
  // ==================== 园所管理 ====================
  'user-center': 'var(--accent-personnel)',         // 人员中心 - 靛蓝
  'personnel-center': 'var(--accent-personnel)',     // 人事中心 - 靛蓝
  'attendance-center': 'var(--accent-personnel)',    // 考勤中心 - 靛蓝
  'teaching-center': 'var(--accent-personnel)',      // 教学中心 - 靛蓝
  'assessment-center': 'var(--accent-personnel)',    // 评估中心 - 靛蓝
  'class-center': 'var(--accent-personnel)',         // 班级中心 - 靛蓝

  // ==================== 业务管理 ====================
  'enrollment-center': 'var(--accent-enrollment)',   // 招生中心 - 蓝色
  'activity-center': 'var(--accent-activity)',       // 活动中心 - 橙色
  'marketing-center': 'var(--accent-marketing)',     // 营销中心 - 紫色
  'customer-pool-center': 'var(--accent-enrollment)', // 客户池中心 - 蓝色
  'call-center': 'var(--accent-enrollment)',         // 呼叫中心 - 蓝色
  'business-center': 'var(--accent-enrollment)',     // 业务中心 - 蓝色
  'customer-center': 'var(--accent-enrollment)',     // 客户中心 - 蓝色

  // ==================== 财务管理 ====================
  'finance-center': 'var(--success-color)',          // 财务中心 - 绿色

  // ==================== 系统管理 ====================
  'system-center': 'var(--accent-system)',           // 系统中心 - 青色
  'task-center': 'var(--accent-system)',             // 任务中心 - 青色
  'my-task-center': 'var(--accent-system)',          // 我的任务 - 青色
  'inspection-center': 'var(--accent-system)',       // 检查中心 - 青色
  'script-center': 'var(--accent-system)',           // 话术中心 - 青色
  'settings-center': 'var(--accent-system)',         // 设置中心 - 青色
  'notification-center': 'var(--accent-system)',     // 通知中心 - 青色
  'schedule-center': 'var(--accent-system)',         // 日程中心 - 青色

  // ==================== AI 智能 ====================
  'ai-center': 'var(--accent-ai)',                   // 智能中心 - 天蓝
  'analytics-center': 'var(--accent-ai)',            // 分析中心 - 天蓝
  'document-template-center': 'var(--accent-ai)',    // 文档模板中心 - 天蓝
  'document-center': 'var(--accent-ai)',             // 文档中心 - 天蓝
  'document-collaboration': 'var(--accent-ai)',      // 文档协作 - 天蓝
  'document-editor': 'var(--accent-ai)',             // 文档编辑器 - 天蓝

  // ==================== 其他中心 ====================
  'media-center': 'var(--accent-marketing)',          // 媒体中心 - 紫色
  'photo-album-center': 'var(--accent-marketing)',    // 相册中心 - 紫色
  'usage-center': 'var(--accent-enrollment)',        // 使用中心 - 蓝色
  'profile-center': 'var(--accent-personnel)',       // 个人中心 - 靛蓝
  'user-profile': 'var(--accent-personnel)',         // 用户资料 - 靛蓝
}

/**
 * 中心分组颜色映射
 * 为每个分组分配主题色
 */
export const sectionColors: Record<string, string> = {
  'kindergarten-management': 'var(--accent-personnel)',   // 园所管理
  'business-management': 'var(--accent-enrollment)',      // 业务管理
  'finance-management': 'var(--success-color)',           // 财务管理
  'system-management': 'var(--accent-system)',            // 系统管理
  'ai-intelligence': 'var(--accent-ai)',                  // AI智能
}

/**
 * 获取中心对应的点缀色
 * @param centerRoute - 中心路由或标识
 * @returns CSS 变量字符串
 */
export function getCenterAccentColor(centerRoute: string): string {
  // 直接匹配
  if (centerAccentColors[centerRoute]) {
    return centerAccentColors[centerRoute]
  }

  // 模糊匹配（提取关键部分）
  const routeKey = Object.keys(centerAccentColors).find(key => {
    return centerRoute.includes(key) || key.includes(centerRoute)
  })

  return routeKey ? centerAccentColors[routeKey] : 'var(--accent-default)'
}

/**
 * 获取中心分组对应的颜色
 * @param sectionId - 分组ID
 * @returns CSS 变量字符串
 */
export function getSectionColor(sectionId: string): string {
  return sectionColors[sectionId] || 'var(--primary-color)'
}

/**
 * 获取中心对应的主题类名
 * @param centerRoute - 中心路由或标识
 * @returns 主题类名
 */
export function getCenterThemeClass(centerRoute: string): string {
  const colorMap: Record<string, string> = {
    'user-center': 'center-theme-personnel',
    'personnel-center': 'center-theme-personnel',
    'attendance-center': 'center-theme-personnel',
    'teaching-center': 'center-theme-personnel',
    'assessment-center': 'center-theme-personnel',
    'enrollment-center': 'center-theme-enrollment',
    'activity-center': 'center-theme-activity',
    'marketing-center': 'center-theme-marketing',
    'customer-pool-center': 'center-theme-enrollment',
    'call-center': 'center-theme-enrollment',
    'business-center': 'center-theme-enrollment',
    'finance-center': 'center-theme-finance',
    'system-center': 'center-theme-system',
    'task-center': 'center-theme-system',
    'inspection-center': 'center-theme-system',
    'script-center': 'center-theme-system',
    'ai-center': 'center-theme-ai',
    'analytics-center': 'center-theme-ai',
    'document-center': 'center-theme-ai',
    'document-template-center': 'center-theme-ai',
  }

  return colorMap[centerRoute] || ''
}

/**
 * 批量获取中心的颜色信息
 * @param centers - 中心列表
 * @returns 带有颜色信息的中心列表
 */
export function enrichCentersWithColors<T extends { route?: string; name?: string }>(
  centers: T[]
): Array<T & { accentColor: string; themeClass: string }> {
  return centers.map(center => {
    const route = center.route || center.name || ''
    return {
      ...center,
      accentColor: getCenterAccentColor(route),
      themeClass: getCenterThemeClass(route),
    }
  })
}

/**
 * 颜色常量（用于 JS 中直接使用颜色值）
 */
export const colorValues = {
  accentPersonnel: '#6366F1',
  accentEnrollment: '#3B82F6',
  accentActivity: '#F59E0B',
  accentMarketing: '#8B5CF6',
  accentSystem: '#06B6D4',
  accentAI: '#0EA5E9',
  success: '#52c41a',
  primary: '#5b8def',
  default: '#6366F1',
} as const

/**
 * 获取中心对应的实际颜色值（用于 Canvas 等场景）
 * @param centerRoute - 中心路由或标识
 * @returns 颜色值
 */
export function getCenterColorValue(centerRoute: string): string {
  const cssVar = getCenterAccentColor(centerRoute)

  // 将 CSS 变量映射到实际颜色值
  const varToValue: Record<string, string> = {
    'var(--accent-personnel)': colorValues.accentPersonnel,
    'var(--accent-enrollment)': colorValues.accentEnrollment,
    'var(--accent-activity)': colorValues.accentActivity,
    'var(--accent-marketing)': colorValues.accentMarketing,
    'var(--accent-system)': colorValues.accentSystem,
    'var(--accent-ai)': colorValues.accentAI,
    'var(--success-color)': colorValues.success,
    'var(--primary-color)': colorValues.primary,
    'var(--accent-default)': colorValues.default,
  }

  return varToValue[cssVar] || colorValues.default
}

/**
 * 导出类型定义
 */
export type CenterRoute = keyof typeof centerAccentColors
export type SectionId = keyof typeof sectionColors
export type ColorValue = typeof colorValues[keyof typeof colorValues]
