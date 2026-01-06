/**
 * 中心图标映射工具
 * Center Icons Mapping Utility
 *
 * 为每个业务中心分配对应的图标
 * 处理缺失图标的替代方案
 */

/**
 * 中心图标映射表
 * 将中心名称/路由映射到 UnifiedIcon 支持的图标名称
 */
export const centerIconMap: Record<string, string> = {
  // ==================== 园所管理 ====================
  'user-center': 'user',                    // 人员中心
  'personnel-center': 'user-group',         // 人事中心
  'attendance-center': 'clock',             // 考勤中心
  'teaching-center': 'book-open',           // 教学中心
  'assessment-center': 'analytics',         // 评估中心
  'class-center': 'users',                  // 班级中心

  // ==================== 业务管理 ====================
  'enrollment-center': 'user-plus',         // 招生中心
  'activity-center': 'calendar',            // 活动中心
  'marketing-center': 'megaphone',          // 营销中心
  'customer-pool-center': 'user-group',     // 客户池中心
  'call-center': 'phone',                   // 呼叫中心
  'business-center': 'grid',                // 业务中心
  'customer-center': 'user',                // 客户中心

  // ==================== 财务管理 ====================
  'finance-center': 'wallet',               // 财务中心 -> 使用替代图标

  // ==================== 系统管理 ====================
  'system-center': 'settings',              // 系统中心 -> 使用替代图标
  'task-center': 'check-square',            // 任务中心 -> 使用替代图标
  'my-task-center': 'check-square',         // 我的任务 -> 使用替代图标
  'inspection-center': 'search',            // 检查中心
  'script-center': 'message-square',        // 话术中心
  'settings-center': 'cog',                 // 设置中心 -> 使用替代图标
  'notification-center': 'bell',            // 通知中心
  'schedule-center': 'calendar',            // 日程中心

  // ==================== AI 智能 ====================
  'ai-center': 'message-circle',            // 智能中心 -> 使用替代图标
  'analytics-center': 'trending-up',        // 分析中心 -> 使用替代图标
  'document-template-center': 'file-text',  // 文档模板中心
  'document-center': 'file-text',           // 文档中心
  'document-collaboration': 'users',        // 文档协作
  'document-editor': 'edit',                // 文档编辑器

  // ==================== 其他中心 ====================
  'media-center': 'image',                  // 媒体中心
  'photo-album-center': 'image',            // 相册中心
  'usage-center': 'bar-chart',              // 使用中心
  'profile-center': 'user',                 // 个人中心
  'user-profile': 'user',                   // 用户资料
}

/**
 * 图标替代映射
 * 将缺失或不支持的图标映射到可用的替代图标
 */
export const iconFallbackMap: Record<string, string> = {
  'wallet': 'credit-card',                  // 钱包 -> 信用卡
  'cog': 'settings',                        // 齿轮 -> 设置
  'check-square': 'check-square',           // 方形勾选 -> 使用同名
  'message-circle': 'message-circle',       // 圆形消息 -> 使用同名
  'trending-up': 'trending-up',             // 趋势向上 -> 使用同名
}

/**
 * 图标分组（用于快捷操作等功能）
 */
export const iconGroups = {
  // 管理功能
  management: [
    'settings',
    'cog',
    'edit',
    'delete',
    'check-square',
  ],

  // 查看功能
  view: [
    'eye',
    'search',
    'filter',
    'sort',
  ],

  // 操作功能
  actions: [
    'plus',
    'minus',
    'upload',
    'download',
    'share',
  ],

  // 导航功能
  navigation: [
    'home',
    'grid',
    'list',
    'menu',
  ],
}

/**
 * 获取中心对应的图标名称
 * @param centerRoute - 中心路由或标识
 * @returns 图标名称
 */
export function getCenterIcon(centerRoute: string): string {
  // 直接匹配
  if (centerIconMap[centerRoute]) {
    return centerIconMap[centerRoute]
  }

  // 模糊匹配（提取关键部分）
  const routeKey = Object.keys(centerIconMap).find(key => {
    return centerRoute.includes(key) || key.includes(centerRoute)
  })

  return routeKey ? centerIconMap[routeKey] : 'grid' // 默认使用网格图标
}

/**
 * 获取图标的替代方案
 * @param iconName - 原始图标名称
 * @returns 替代图标名称
 */
export function getIconFallback(iconName: string): string {
  return iconFallbackMap[iconName] || 'grid'
}

/**
 * 检查图标是否需要替代
 * @param iconName - 图标名称
 * @returns 是否需要替代
 */
export function needsIconFallback(iconName: string): boolean {
  return Object.keys(iconFallbackMap).includes(iconName)
}

/**
 * 批量获取中心的图标信息
 * @param centers - 中心列表
 * @returns 带有图标信息的中心列表
 */
export function enrichCentersWithIcons<T extends { route?: string; name?: string; icon?: string }>(
  centers: T[]
): Array<T & { iconName: string; needsFallback: boolean }> {
  return centers.map(center => {
    const route = center.route || center.name || ''
    const originalIcon = center.icon || getCenterIcon(route)
    const needsFallback = needsIconFallback(originalIcon)

    return {
      ...center,
      iconName: needsFallback ? getIconFallback(originalIcon) : originalIcon,
      needsFallback,
    }
  })
}

/**
 * 获取图标组件所需的颜色
 * 根据中心类型返回对应的颜色
 * @param centerRoute - 中心路由或标识
 * @returns 颜色值（可选）
 */
export function getCenterIconColor(centerRoute: string): string | undefined {
  const colorMap: Record<string, string> = {
    'user-center': '#6366F1',
    'personnel-center': '#6366F1',
    'enrollment-center': '#3B82F6',
    'activity-center': '#F59E0B',
    'marketing-center': '#8B5CF6',
    'finance-center': '#52c41a',
    'system-center': '#06B6D4',
    'ai-center': '#0EA5E9',
    'analytics-center': '#0EA5E9',
  }

  return colorMap[centerRoute]
}

/**
 * 图标尺寸预设
 */
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const

/**
 * 获取推荐图标尺寸
 * @param usage - 使用场景
 * @returns 图标尺寸
 */
export function getRecommendedIconSize(usage: 'card' | 'list' | 'button' | 'header'): number {
  const sizeMap = {
    card: iconSizes.lg,      // 32px
    list: iconSizes.md,      // 24px
    button: iconSizes.sm,    // 20px
    header: iconSizes.xl,    // 40px
  }

  return sizeMap[usage]
}

/**
 * 导出类型定义
 */
export type CenterRoute = keyof typeof centerIconMap
export type IconGroupName = keyof typeof iconGroups
export type IconSize = keyof typeof iconSizes
export type IconUsage = 'card' | 'list' | 'button' | 'header'
