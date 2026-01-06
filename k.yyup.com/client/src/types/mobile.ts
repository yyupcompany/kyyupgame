/**
 * 移动端组件类型定义
 * Mobile Component Type Definitions
 */

export interface HeaderAction {
  /** 图标名称 */
  icon: string
  /** 显示文本 */
  text?: string
  /** 动作标识 */
  action: string
  /** 徽章数字 */
  badge?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 工具提示 */
  tooltip?: string
  /** 点击处理函数 */
  handler?: () => void
}

export interface FooterTab {
  /** 标签名称 */
  name: string
  /** 显示标题 */
  title: string
  /** 图标名称 */
  icon: string
  /** 跳转路径 */
  path: string
  /** 徽章数字 */
  badge?: number | string
  /** 是否显示圆点 */
  dot?: boolean
  /** 自定义图标 */
  customIcon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 权限角色 */
  roles?: string[]
  /** 是否隐藏 */
  hide?: boolean
  /** 工具提示 */
  tooltip?: string
  /** 角色权限检查函数 */
  hasPermission?: () => boolean
}

export interface MobileLayoutProps {
  /** 页面标题 */
  title?: string
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 是否显示菜单按钮 */
  showMenu?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 内容区域内边距 */
  contentPadding?: string
  /** 头部操作按钮 */
  headerActions?: HeaderAction[]
  /** 底部导航标签 */
  footerTabs?: FooterTab[]
  /** 是否启用下拉刷新 */
  enablePullRefresh?: boolean
  /** 是否启用上拉加载 */
  enableLoadMore?: boolean
  /** 是否固定布局 */
  fixedLayout?: boolean
  /** 是否使用安全区域 */
  useSafeArea?: boolean
  /** 主题颜色覆盖 */
  themeColor?: string
  /** 自定义样式类 */
  customClass?: string
}

export interface MobileHeaderProps {
  /** 页面标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 是否显示菜单按钮 */
  showMenu?: boolean
  /** 是否显示搜索按钮 */
  showSearch?: boolean
  /** 是否固定定位 */
  fixed?: boolean
  /** 是否占位 */
  placeholder?: boolean
  /** 是否使用安全区域 */
  useSafeArea?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 头部高度 */
  height?: string
  /** 是否启用手势 */
  enableGestures?: boolean
  /** 是否透明背景 */
  transparent?: boolean
  /** 是否启用毛玻璃效果 */
  blur?: boolean
  /** 头部操作按钮 */
  actions?: HeaderAction[]
  /** 左侧内容插槽 */
  leftContent?: string
  /** 右侧内容插槽 */
  rightContent?: string
}

export interface MobileFooterProps {
  /** 底部导航标签 */
  tabs?: FooterTab[]
  /** 当前激活标签 */
  activeTab?: string
  /** 是否固定定位 */
  fixed?: boolean
  /** 是否占位 */
  placeholder?: boolean
  /** 是否显示边框 */
  showBorder?: boolean
  /** 是否使用安全区域 */
  useSafeArea?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 底部高度 */
  height?: string
  /** 是否启用动画 */
  enableAnimation?: boolean
  /** 是否启用手势 */
  enableGestures?: boolean
  /** 是否透明背景 */
  transparent?: boolean
  /** 是否启用毛玻璃效果 */
  blur?: boolean
  /** 是否启用触觉反馈 */
  hapticFeedback?: boolean
  /** 自定义样式类 */
  customClass?: string
}

export interface MobileMainContentProps {
  /** 是否包含头部 */
  withHeader?: boolean
  /** 是否包含底部 */
  withFooter?: boolean
  /** 内边距 */
  padding?: string | boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否启用滚动 */
  enableScroll?: boolean
  /** 是否启用下拉刷新 */
  enablePullRefresh?: boolean
  /** 是否启用上拉加载 */
  enableLoadMore?: boolean
  /** 滚动阈值 */
  scrollThreshold?: number
  /** 最大高度 */
  maxHeight?: string
  /** 最小高度 */
  minHeight?: string
  /** 是否平滑滚动 */
  smoothScroll?: boolean
  /** 是否启用惯性滚动 */
  momentumScroll?: boolean
  /** 是否启用橡皮筋效果 */
  rubberBand?: boolean
  /** 滚越行为 */
  overscrollBehavior?: 'auto' | 'contain' | 'none'
  /** 自定义滚动条样式 */
  customScrollbar?: boolean
  /** 是否启用滚动锚定 */
  scrollAnchoring?: boolean
}

export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 显示名称 */
  displayName: string
  /** 图标 */
  icon: string
  /** 颜色配置 */
  colors: {
    /** 主色调 */
    primary: string
    /** 背景色 */
    background: string
    /** 表面色 */
    surface: string
    /** 文字色 */
    text: string
  }
  /** 是否暗色主题 */
  isDark?: boolean
  /** 主题描述 */
  description?: string
  /** 主题预览图 */
  preview?: string
}

export type ThemeType = 'default' | 'dark' | 'custom' | 'glassmorphism' | 'cyberpunk' | 'nature' | 'ocean' | 'sunset' | 'midnight'

export type ScrollDirection = 'up' | 'down' | 'left' | 'right'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

export interface TouchEvent {
  /** 触摸点X坐标 */
  clientX: number
  /** 触摸点Y坐标 */
  clientY: number
  /** 触摸力 */
  force?: number
  /** 触摸半径 */
  radiusX?: number
  radiusY?: number
  /** 触摸角度 */
  rotationAngle?: number
}

export interface GestureEvent {
  /** 手势类型 */
  type: 'tap' | 'doubletap' | 'press' | 'swipe' | 'pinch' | 'rotate'
  /** 手势方向 */
  direction: SwipeDirection
  /** 手势速度 */
  velocity: number
  /** 手势距离 */
  distance: number
  /** 缩放比例 */
  scale?: number
  /** 旋转角度 */
  rotation?: number
  /** 触摸点 */
  touches: TouchEvent[]
  /** 时间戳 */
  timestamp: number
}

export interface PerformanceMetrics {
  /** 渲染时间 */
  renderTime: number
  /** 滚动帧率 */
  scrollFPS: number
  /** 内存使用 */
  memoryUsage: number
  /** 动画帧率 */
  animationFPS: number
  /** 触摸响应时间 */
  touchResponseTime: number
  /** 主题切换时间 */
  themeSwitchTime: number
}

export interface AccessibilityConfig {
  /** 是否启用高对比度 */
  highContrast?: boolean
  /** 是否启用大字体 */
  largeText?: boolean
  /** 是否减少动画 */
  reducedMotion?: boolean
  /** 屏幕阅读器支持 */
  screenReader?: boolean
  /** 键盘导航 */
  keyboardNavigation?: boolean
  /** 触摸目标大小 */
  touchTargetSize?: number
  /** 焦点指示器 */
  focusIndicator?: boolean
  /** 颜色盲支持 */
  colorBlindSupport?: boolean
}

export interface ResponsiveConfig {
  /** 断点配置 */
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  /** 容器最大宽度 */
  containerMaxWidth: {
    sm: number
    md: number
    lg: number
    xl: number
  }
  /** 网格配置 */
  grid: {
    columns: number
    gap: number
  }
  /** 字体大小配置 */
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
  }
}

export interface AnimationConfig {
  /** 动画持续时间 */
  duration: {
    fast: number
    normal: number
    slow: number
  }
  /** 缓动函数 */
  easing: {
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
    bounce: string
    elastic: string
  }
  /** 是否启用动画 */
  enabled: boolean
  /** 是否减少动画 */
  reduced: boolean
}

// 事件类型定义
export interface MobileLayoutEvents {
  /** 返回点击 */
  'back': () => void
  /** 菜单点击 */
  'menu-click': (action: string) => void
  /** 标签切换 */
  'tab-change': (tab: string) => void
  /** 下拉刷新 */
  'refresh': () => void
  /** 上拉加载 */
  'load-more': () => void
  /** 滚动事件 */
  'scroll': (scrollTop: number) => void
  /** 滚动到底部 */
  'scroll-to-bottom': () => void
  /** 手势事件 */
  'swipe-left': () => void
  'swipe-right': () => void
  'swipe-up': () => void
  'swipe-down': () => void
  /** 触摸事件 */
  'touch-start': (event: TouchEvent) => void
  'touch-end': (event: TouchEvent) => void
  /** 主题变化 */
  'theme-change': (theme: ThemeType) => void
  /** 性能指标 */
  'performance-metric': (metrics: PerformanceMetrics) => void
}

// 组件ref类型
export interface MobileHeaderRef {
  /** 设置标题 */
  setTitle: (title: string) => void
  /** 设置副标题 */
  setSubtitle: (subtitle?: string) => void
  /** 显示/隐藏返回按钮 */
  setShowBack: (show: boolean) => void
  /** 显示/隐藏菜单按钮 */
  setShowMenu: (show: boolean) => void
}

export interface MobileFooterRef {
  /** 设置激活标签 */
  setActiveTab: (tab: string) => void
  /** 获取当前激活标签 */
  getActiveTab: () => string
  /** 更新标签徽章 */
  updateBadge: (tabName: string, badge: number | string) => void
  /** 隐藏标签 */
  hideTab: (tabName: string) => void
  /** 显示标签 */
  showTab: (tabName: string) => void
}

export interface MobileMainContentRef {
  /** 滚动到顶部 */
  scrollToTop: () => void
  /** 滚动到指定位置 */
  scrollTo: (top: number) => void
  /** 获取当前滚动位置 */
  getScrollTop: () => number
  /** 获取滚动高度 */
  getScrollHeight: () => number
  /** 刷新内容 */
  refresh: () => Promise<void>
  /** 加载更多 */
  loadMore: () => Promise<void>
}

export interface MobileMainLayoutRef {
  /** 获取头部组件实例 */
  header: MobileHeaderRef | null
  /** 获取底部组件实例 */
  footer: MobileFooterRef | null
  /** 获取内容组件实例 */
  content: MobileMainContentRef | null
  /** 切换主题 */
  switchTheme: (theme: ThemeType) => Promise<void>
  /** 获取性能指标 */
  getPerformanceMetrics: () => PerformanceMetrics
  /** 设置无障碍配置 */
  setAccessibilityConfig: (config: AccessibilityConfig) => void
  /** 设置响应式配置 */
  setResponsiveConfig: (config: ResponsiveConfig) => void
}