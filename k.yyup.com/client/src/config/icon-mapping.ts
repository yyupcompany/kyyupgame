/**
 * 图标映射表 - 将错误的SVG path映射到正确的图标名称
 * 用于修复navigation.ts中被错误替换的icon字段
 */

// UnifiedIcon 已内置的图标名称（需与组件内定义保持一致）
const KNOWN_ICON_NAMES = new Set([
  'lightning', 'principal', 'dashboard', 'enrollment', 'activity', 'marketing', 'ai-center', 'system',
  'personnel', 'students', 'teachers', 'classes', 'grades', 'notifications', 'schedule', 'reports',
  'finance', 'settings', 'monitor', 'statistics', 'messages', 'media', 'task', 'script', 'search',
  'health', 'growth', 'gift', 'security', 'profile', 'performance', 'customers', 'ai-brain', 'design',
  'activities', 'analytics', 'ai-robot', 'chevron-down', 'chevron-up', 'chevron-right', 'chevron-left',
  'check', 'close', 'warning', 'info', 'service', 'target', 'setting', 'user', 'user-filled',
  'calendar', 'school', 'promotion', 'cpu', 'list', 'money', 'user-plus', 'arrow-right', 'user-group',
  'user-check', 'plus', 'document', 'picture', 'trend-charts', 'arrow-left', 'edit', 'chat-dot-round',
  'magic-stick', 'data-analysis', 'default', 'clock', 'refresh', 'video-camera', 'reading',
  'document-new', 'location', 'bell', 'setting-new', 'chat-square', 'dashboard-new', 'home', 'menu',
  'grid', 'folder', 'tag', 'bookmark', 'download', 'upload', 'star', 'heart', 'share', 'lock', 'unlock',
  // CentersSidebar 新增图标
  'briefcase', 'phone', 'book-open',
  // 新增通用图标
  'eye', 'play', 'trend', 'success', 'alert', 'ticket'
])

// 常见第三方命名到统一图标名称的映射
const ICON_ALIASES: Record<string, string> = {
  'dashboard': 'dashboard',
  'building': 'home',
  'user': 'user',
  'student': 'students',
  'teacher': 'teachers',
  'class': 'classes',
  'parent': 'parent-group',
  'users': 'user-group',
  'avatar': 'user-filled',
  'user-circle': 'user',
  'userplus': 'user-plus',
  'user-plus': 'user-plus',
  'usercheck': 'user-check',
  'monitor': 'monitor',
  'home': 'home',
  'menu': 'menu',
  'grid': 'grid',
  'calendar': 'calendar',
  'school': 'school',
  'graduation-cap': 'school',
  'message': 'messages',
  'message-square': 'chat-square',
  'chat-line-round': 'chat-dot-round',
  'chat-line-square': 'chat-square',
  'chatdotround': 'chat-dot-round',
  'magicstick': 'magic-stick',
  'magic-stick': 'magic-stick',
  'data-analysis': 'data-analysis',
  'megaphone': 'marketing',
  'marketing': 'marketing',
  'money': 'money',
  'credit-card': 'finance',
  'dollar-sign': 'finance',
  'list': 'list',
  'folder-opened': 'folder',
  'document': 'document',
  'document-add': 'document-new',
  'document-checked': 'document',
  'file-text': 'document',
  'picture': 'picture',
  'image': 'picture',
  'photo': 'picture',
  'promotion': 'design',
  'target': 'target',
  'bell': 'bell',
  'clock': 'clock',
  'location': 'location',
  'refresh': 'refresh',
  'loading': 'refresh',
  'spinner': 'refresh',
  'video-camera': 'video-camera',
  'reading': 'reading',
  'setting': 'setting',
  'settings': 'settings',
  'setting-new': 'setting-new',
  'system': 'system',
  'statistics': 'statistics',
  'analytics': 'analytics',
  'trendcharts': 'trend-charts',
  'trend-charts': 'trend-charts',
  'chart-line': 'trend-charts',
  'bar-chart': 'analytics',
  'pie-chart': 'analytics',
  'lock': 'lock',
  'unlock': 'unlock',
  'notification': 'notifications',
  'notifications': 'notifications',
  'ai': 'ai-center',
  'brain': 'ai-brain',
  'chat': 'messages',
  'document-new': 'document-new',
  'plus': 'plus',
  'download': 'download',
  'upload': 'upload',
  'star': 'star',
  'heart': 'heart',
  'share': 'share',
  'warning': 'warning',
  'info': 'info',
  'service': 'service',
  'customers': 'customers',
  'enrollment': 'enrollment',
  'activity': 'activity',
  'activities': 'activities',
  'finance': 'finance',
  'personnel': 'personnel',
  'task': 'task',
  'script': 'script',
  'media': 'media',
  'ai-center': 'ai-center',
  'application': 'document',
  'peoples': 'user-group',
  'tree-table': 'grid',
  // CentersSidebar 专用图标映射
  'layoutdashboard': 'dashboard',
  'graduationcap': 'school',
  'checksquare': 'task',
  'messagesquare': 'chat-square',
  'files': 'document',
  'dollarsign': 'finance',
  'phone': 'phone',
  'video': 'video-camera',
  'bookopen': 'book-open',
  'checkcircle2': 'check',
  // ParentCenter & TeacherCenter 专用图标映射
  'filetext': 'document',
  'trendingup': 'growth'
}

// SVG path到图标名称的映射
export const SVG_PATH_TO_ICON: Record<string, string> = {
  // 工作台相关
  'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z': 'dashboard',

  // 招生管理相关
  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z': 'enrollment',
  'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z': 'document',
  'M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1h.5c.3 0 .5-.1.7-.3L16.5 16H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z': 'chat-square',

  // 客户池相关
  'M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z': 'customers',

  // 人员管理相关
  'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z': 'teachers',
  'M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.31-1.76-2.46-1.76s-2.12.74-2.46 1.76L13 16h2.5v6h4.5z': 'students',
  'M12 3l-.28.65L9.97 8H4v13h16V8h-5.97L12 3z': 'classes',

  // 活动管理相关
  'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z': 'activities',

  // AI功能相关
  'M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z': 'ai-center',
  'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z': 'analytics',

  // 营销管理相关
  'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z': 'marketing',

  // 系统管理相关
  'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z': 'system',

  // 统计分析相关
  'M18 20V10M12 20V4M6 20v-6': 'statistics',

  // 园长工作台相关
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z': 'principal',

  // 父母管理相关
  'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z': 'parent-group',

  // 其他常见模式
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z': 'target',
  'M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z': 'document',
  'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z': 'chat-bubble'
}

/**
 * 检测字符串是否为SVG path
 * @param str 要检测的字符串
 * @returns 是否为SVG path
 */
export function isSvgPath(str: string): boolean {
  return typeof str === 'string' &&
         str.startsWith('M') &&
         /[MLCZH]/.test(str) &&
         str.length > 10 // 至少10个字符，确保是有效的path
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
}

/**
 * 根据SVG path获取对应的图标名称
 * @param svgPath SVG path字符串
 * @returns 图标名称，如果找不到则返回'dashboard'
 */
export function getIconNameFromSvgPath(svgPath: string): string {
  // 直接查找完整匹配
  if (SVG_PATH_TO_ICON[svgPath]) {
    return SVG_PATH_TO_ICON[svgPath]
  }

  // 尝试前缀匹配（处理被截断的情况）
  for (const [path, iconName] of Object.entries(SVG_PATH_TO_ICON)) {
    if (svgPath.startsWith(path.substring(0, 30))) {
      return iconName
    }
  }

  // 根据path特征推断图标类型
  if (svgPath.includes('c-1.1 0-2') || svgPath.includes('c1.1 0')) {
    return 'document'
  }

  if (svgPath.includes('M12 2') && svgPath.includes('l')) {
    if (svgPath.includes('z') || svgPath.includes('L')) {
      return 'star'
    }
    return 'target'
  }

  if (svgPath.includes('M3 3') && svgPath.includes('v')) {
    return 'grid'
  }

  if (svgPath.includes('M12') && svgPath.includes('C')) {
    return 'user'
  }

  // 默认返回dashboard
  return 'dashboard'
}

/**
 * 修复图标名称 - 如果传入的是SVG path，则转换为对应的图标名称
 * @param iconValue 图标名称或SVG path
 * @returns 修复后的图标名称
 */
export function fixIconName(iconValue: string): string {
  if (!iconValue || typeof iconValue !== 'string') {
    return 'dashboard'
  }

  const normalized = iconValue.trim()
  if (!normalized) {
    return 'dashboard'
  }

  if (isSvgPath(normalized)) {
    return getIconNameFromSvgPath(normalized)
  }

  const lower = normalized.toLowerCase()
  if (KNOWN_ICON_NAMES.has(lower)) {
    return lower
  }

  const kebab = toKebabCase(normalized)
  if (KNOWN_ICON_NAMES.has(kebab)) {
    return kebab
  }

  const alias =
    ICON_ALIASES[lower] ||
    ICON_ALIASES[kebab]

  if (alias && KNOWN_ICON_NAMES.has(alias)) {
    return alias
  }

  // 最后返回kebab结果，UnifiedIcon中会在找不到时回退
  return kebab || lower || 'dashboard'
}