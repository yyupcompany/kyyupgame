/**
 * 移动端导航类型定义
 * 支持"底部Tab + 抽屉菜单"的移动端标准导航架构
 */

// ==================== 基础类型 ====================

/**
 * 底部Tab项接口
 */
export interface BottomTab {
  id: string              // 唯一标识
  title: string           // 显示标题
  icon: string            // Vant图标名称
  path: string            // 路由路径
  badge?: number | string // 徽章数字或文本
  dot?: boolean           // 是否显示红点
  fixed?: boolean         // 是否固定（园长端首页固定）
  disabled?: boolean      // 是否禁用
}

/**
 * 抽屉菜单项接口
 */
export interface DrawerMenuItem {
  id: string              // 唯一标识
  title: string           // 显示标题
  icon: string            // Vant图标名称
  path: string            // 路由路径
  badge?: number | string // 徽章
  description?: string    // 描述文本
  disabled?: boolean      // 是否禁用
}

/**
 * 抽屉菜单分类接口
 */
export interface DrawerCategory {
  id: string              // 分类唯一标识
  title: string           // 分类标题
  icon?: string           // 分类图标
  items: DrawerMenuItem[] // 该分类下的菜单项
  collapsible?: boolean   // 是否可折叠（默认true）
  defaultCollapsed?: boolean // 默认是否折叠（默认false）
}

/**
 * 抽屉菜单完整配置接口
 */
export interface DrawerMenu {
  categories: DrawerCategory[]  // 分类列表
}

/**
 * 移动端导航配置接口
 */
export interface MobileNavigationConfig {
  role: string                 // 角色名称: 'parent' | 'teacher' | 'principal' | 'admin'
  bottomTabs: BottomTab[]      // 底部Tab列表（通常5个）
  drawerMenu?: DrawerMenu      // 抽屉菜单配置
  defaultTabOrder: string[]    // 默认Tab排序ID列表
}

// ==================== 用户角色类型 ====================

/**
 * 用户角色类型
 */
export type UserRole = 'parent' | 'teacher' | 'principal' | 'admin'

/**
 * 角色配置映射接口
 */
export interface RoleConfigMap {
  [key: string]: MobileNavigationConfig
}

// ==================== 导航状态管理类型 ====================

/**
 * 抽屉菜单状态接口
 */
export interface DrawerState {
  visible: boolean        // 是否可见
  activeCategory?: string // 当前激活的分类ID
}

/**
 * 移动端导航状态接口
 */
export interface MobileNavigationState {
  activeTab: string       // 当前激活的底部Tab ID
  drawerState: DrawerState // 抽屉菜单状态
  userRole: UserRole      // 当前用户角色
}

// ==================== 工具函数类型 ====================

/**
 * 获取导航配置选项接口
 */
export interface GetNavConfigOptions {
  includeDisabled?: boolean // 是否包含禁用的菜单项（默认false）
}

/**
 * 激活Tab匹配结果接口
 */
export interface ActiveTabMatch {
  tab: BottomTab           // 匹配的Tab
  isExact?: boolean        // 是否精确匹配
  isPrefix?: boolean       // 是否前缀匹配
}

// ==================== 事件类型 ====================

/**
 * Tab切换事件参数
 */
export interface TabChangeEvent {
  tabId: string            // Tab ID
  tab: BottomTab           // Tab对象
  from: string             // 来源Tab ID
}

/**
 * 菜单项点击事件参数
 */
export interface MenuItemClickEvent {
  itemId: string           // 菜单项ID
  item: DrawerMenuItem     // 菜单项对象
  categoryId?: string      // 所属分类ID
}

/**
 * 抽屉状态变化事件参数
 */
export interface DrawerStateChangeEvent {
  visible: boolean         // 新的可见状态
  reason?: 'toggle' | 'navigate' | 'outside-click' | 'back' // 变化原因
}

// ==================== 配置验证类型 ====================

/**
 * 配置验证错误接口
 */
export interface ConfigValidationError {
  field: string            // 错误字段
  message: string          // 错误消息
  value?: any              // 错误值
}

/**
 * 配置验证结果接口
 */
export interface ConfigValidationResult {
  valid: boolean           // 是否有效
  errors: ConfigValidationError[] // 错误列表
  warnings: string[]       // 警告列表
}

// ==================== 统计信息类型 ====================

/**
 * 导航统计信息接口
 */
export interface NavigationStats {
  role: string             // 角色
  bottomTabsCount: number  // 底部Tab数量
  drawerCategoriesCount: number // 抽屉菜单分类数量
  drawerItemsCount: number // 抽屉菜单项总数
  totalItems: number       // 总菜单项数量（底部Tab + 抽屉菜单项）
}

// ==================== 主题相关类型 ====================

/**
 * 导航主题配置接口
 */
export interface NavigationTheme {
  primaryColor?: string    // 主题色
  backgroundColor?: string // 背景色
  textColor?: string       // 文字颜色
  activeColor?: string     // 激活状态颜色
  borderRadius?: string    // 圆角大小
}
