/**
 * 权限管理器 - 实现细粒度的权限控制
 *
 * 这个文件提供了统一的权限管理功能，包括：
 * - 权限检查和验证
 * - 动态权限加载
 * - 权限缓存管理
 * - 角色权限映射
 * - 权限装饰器
 */

import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { permissionApi, apiCache } from '@/api/unified-api'
import { ElMessage } from 'element-plus'

// 前端日志工具
const frontendLogger = {
  log: (...args: any[]) => console.log('[Permission]', ...args),
  error: (...args: any[]) => console.error('[Permission]', ...args),
  warn: (...args: any[]) => console.warn('[Permission]', ...args)
};

// 权限类型定义
export type Permission = string
export type Role = string
export type Resource = string

// 权限级别
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

// 权限资源类型
export enum ResourceType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  SYSTEM = 'system',
  PARENT = 'parent',
  CHILD = 'child',
  ACTIVITY = 'activity',
  NOTIFICATION = 'notification',
  AI = 'ai',
  REPORT = 'report'
}

// 权限接口定义
export interface UserPermission {
  id: string
  userId: string
  resource: ResourceType
  resourceId?: string
  permissions: PermissionLevel[]
  conditions?: Record<string, any>
}

export interface RolePermission {
  roleId: string
  resource: ResourceType
  permissions: PermissionLevel[]
  conditions?: Record<string, any>
}

/**
 * 权限管理器类
 */
export class PermissionManager {
  private static instance: PermissionManager
  private userStore = useUserStore()
  private permissions = ref<Set<Permission>>(new Set())
  private rolePermissions = ref<Map<Role, Set<Permission>>>(new Map())
  private dynamicPermissions = ref<UserPermission[]>([])
  private isLoaded = ref(false)
  private loading = ref(false)

  private constructor() {}

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager()
    }
    return PermissionManager.instance
  }

  /**
   * 初始化权限管理器
   */
  async initialize(): Promise<void> {
    if (this.isLoaded.value || this.loading.value) return

    this.loading.value = true
    try {
      await this.loadUserPermissions()
      await this.loadDynamicPermissions()
      this.isLoaded.value = true
    } catch (error) {
      frontendLogger.error('权限管理器初始化失败:', error)
      ElMessage.error('权限加载失败，部分功能可能受限')
    } finally {
      this.loading.value = false
    }
  }

  /**
   * 加载用户基础权限
   */
  private async loadUserPermissions(): Promise<void> {
    try {
      const cached = apiCache.get('user-permissions')
      if (cached) {
        this.permissions.value = new Set(cached)
        return
      }

      const response = await permissionApi.getUserPermissions()
      if (response.success && response.data) {
        const permissions = Array.isArray(response.data) ? response.data : []
        this.permissions.value = new Set(permissions)
        apiCache.set('user-permissions', permissions, 600000) // 缓存10分钟
      }
    } catch (error) {
      frontendLogger.error('加载用户权限失败:', error)
    }
  }

  /**
   * 加载动态权限
   */
  private async loadDynamicPermissions(): Promise<void> {
    try {
      const cached = apiCache.get('dynamic-permissions')
      if (cached) {
        this.dynamicPermissions.value = cached
        return
      }

      // 模拟动态权限数据，实际项目中应从API获取
      const mockDynamicPermissions: UserPermission[] = [
        {
          id: '1',
          userId: this.userStore.userInfo?.id ? String(this.userStore.userInfo.id) : '',
          resource: ResourceType.CHILD,
          resourceId: '1',
          permissions: [PermissionLevel.READ, PermissionLevel.WRITE],
          conditions: { isParent: true }
        },
        {
          id: '2',
          userId: this.userStore.userInfo?.id ? String(this.userStore.userInfo.id) : '',
          resource: ResourceType.ACTIVITY,
          permissions: [PermissionLevel.READ, PermissionLevel.WRITE],
          conditions: { canEnroll: true }
        }
      ]

      this.dynamicPermissions.value = mockDynamicPermissions
      apiCache.set('dynamic-permissions', mockDynamicPermissions, 600000)
    } catch (error) {
      frontendLogger.error('加载动态权限失败:', error)
    }
  }

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(permission: string): boolean {
    if (!this.isLoaded.value) {
      frontendLogger.warn('权限管理器未初始化，建议先调用 initialize()')
      return false
    }

    return this.permissions.value.has(permission)
  }

  /**
   * 检查用户是否有资源的指定操作权限
   */
  hasResourcePermission(
    resource: ResourceType,
    permission: PermissionLevel,
    resourceId?: string
  ): boolean {
    // 检查基础权限
    const basePermission = `${resource}:${permission}`
    if (this.hasPermission(basePermission)) {
      return true
    }

    // 检查动态权限
    if (resourceId) {
      return this.dynamicPermissions.value.some(dp =>
        dp.resource === resource &&
        dp.resourceId === resourceId &&
        dp.permissions.includes(permission) &&
        this.checkPermissionConditions(dp.conditions)
      )
    }

    return false
  }

  /**
   * 检查权限条件
   */
  private checkPermissionConditions(conditions?: Record<string, any>): boolean {
    if (!conditions) return true

    // 这里可以根据实际业务逻辑检查各种条件
    // 例如：检查时间、IP地址、用户状态等
    return true
  }

  /**
   * 获取用户的所有权限
   */
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.value)
  }

  /**
   * 获取资源的动态权限
   */
  getResourcePermissions(resource: ResourceType, resourceId?: string): UserPermission[] {
    return this.dynamicPermissions.value.filter(dp =>
      dp.resource === resource &&
      (!resourceId || dp.resourceId === resourceId)
    )
  }

  /**
   * 刷新权限缓存
   */
  async refreshPermissions(): Promise<void> {
    this.isLoaded.value = false
    apiCache.delete('user-permissions')
    apiCache.delete('dynamic-permissions')
    await this.initialize()
  }

  /**
   * 添加权限（临时）
   */
  addPermission(permission: Permission): void {
    this.permissions.value.add(permission)
  }

  /**
   * 移除权限（临时）
   */
  removePermission(permission: Permission): void {
    this.permissions.value.delete(permission)
  }

  /**
   * 检查是否为管理员
   */
  isAdmin(): boolean {
    return this.hasPermission('admin') || this.hasPermission('system:admin')
  }

  /**
   * 检查是否为家长用户
   */
  isParent(): boolean {
    return this.hasPermission('parent') || this.hasPermission('parent:read')
  }

  /**
   * 获取加载状态
   */
  get isLoading(): boolean {
    return this.loading.value
  }

  /**
   * 获取初始化状态
   */
  get isInitialized(): boolean {
    return this.isLoaded.value
  }
}

// 创建全局权限管理器实例
export const permissionManager = PermissionManager.getInstance()

/**
 * 权限检查 Composable
 */
export function usePermissions() {
  const hasPermission = (permission: string): boolean => {
    return permissionManager.hasPermission(permission)
  }

  const hasResourcePermission = (
    resource: ResourceType,
    permission: PermissionLevel,
    resourceId?: string
  ): boolean => {
    return permissionManager.hasResourcePermission(resource, permission, resourceId)
  }

  const isAdmin = (): boolean => {
    return permissionManager.isAdmin()
  }

  const isParent = (): boolean => {
    return permissionManager.isParent()
  }

  const requirePermission = (permission: string): boolean => {
    if (!hasPermission(permission)) {
      ElMessage.error('您没有权限执行此操作')
      return false
    }
    return true
  }

  const requireResourcePermission = (
    resource: ResourceType,
    permission: PermissionLevel,
    resourceId?: string
  ): boolean => {
    if (!hasResourcePermission(resource, permission, resourceId)) {
      ElMessage.error('您没有权限执行此操作')
      return false
    }
    return true
  }

  return {
    hasPermission,
    hasResourcePermission,
    isAdmin,
    isParent,
    requirePermission,
    requireResourcePermission,
    isLoading: computed(() => permissionManager.isLoading),
    isInitialized: computed(() => permissionManager.isInitialized),
    refresh: () => permissionManager.refreshPermissions()
  }
}

/**
 * 权限装饰器
 */
export function RequirePermission(permission: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      if (!permissionManager.hasPermission(permission)) {
        ElMessage.error('您没有权限执行此操作')
        return false
      }

      return method.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 资源权限装饰器
 */
export function RequireResourcePermission(
  resource: ResourceType,
  permission: PermissionLevel,
  resourceIdParam?: string | number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      let resourceId: string | number | undefined
      if (typeof resourceIdParam === 'number') {
        resourceId = args[resourceIdParam]
      } else if (typeof resourceIdParam === 'string') {
        resourceId = (args[0] as any)?.[resourceIdParam]
      }

      const normalizedResourceId = resourceId !== undefined ? String(resourceId) : undefined
      if (!permissionManager.hasResourcePermission(resource, permission, normalizedResourceId)) {
        ElMessage.error('您没有权限执行此操作')
        return false
      }

      return method.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 权限检查高阶组件
 */
export function withPermission(permission: string) {
  return function (WrappedComponent: any) {
    return {
      name: `WithPermission${WrappedComponent.name}`,
      setup(props: any, { slots }: any) {
        const { hasPermission } = usePermissions()

        if (!hasPermission(permission)) {
          return h('div', { class: 'permission-denied' }, '权限不足')
        }

        return h(WrappedComponent, props, slots)
      }
    }
  }
}

/**
 * Vue指令：v-permission
 */
export const vPermission = {
  mounted(el: HTMLElement, binding: any) {
    const { hasPermission } = usePermissions()
    const permission = binding.value

    if (!hasPermission(permission)) {
      el.style.display = 'none'
      // 或者移除元素
      // el.parentNode?.removeChild(el)
    }
  },
  updated(el: HTMLElement, binding: any) {
    const { hasPermission } = usePermissions()
    const permission = binding.value

    if (!hasPermission(permission)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

/**
 * Vue指令：v-resource-permission
 */
export const vResourcePermission = {
  mounted(el: HTMLElement, binding: any) {
    const { hasResourcePermission } = usePermissions()
    const { resource, permission, resourceId } = binding.value

    if (!hasResourcePermission(resource, permission, resourceId)) {
      el.style.display = 'none'
    }
  },
  updated(el: HTMLElement, binding: any) {
    const { hasResourcePermission } = usePermissions()
    const { resource, permission, resourceId } = binding.value

    if (!hasResourcePermission(resource, permission, resourceId)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

/**
 * 预定义的权限常量
 */
export const PERMISSIONS = {
  // 系统权限
  SYSTEM_READ: 'system:read',
  SYSTEM_WRITE: 'system:write',
  SYSTEM_ADMIN: 'system:admin',

  // 用户管理权限
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  USER_ADMIN: 'user:admin',

  // 角色管理权限
  ROLE_READ: 'role:read',
  ROLE_WRITE: 'role:write',
  ROLE_DELETE: 'role:delete',
  ROLE_ADMIN: 'role:admin',

  // 家长中心权限
  PARENT_READ: 'parent:read',
  PARENT_WRITE: 'parent:write',
  PARENT_CHILD_READ: 'parent:child:read',
  PARENT_CHILD_WRITE: 'parent:child:write',

  // 活动权限
  ACTIVITY_READ: 'activity:read',
  ACTIVITY_WRITE: 'activity:write',
  ACTIVITY_ENROLL: 'activity:enroll',

  // 通知权限
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_WRITE: 'notification:write',
  NOTIFICATION_SEND: 'notification:send',

  // AI助手权限
  AI_READ: 'ai:read',
  AI_WRITE: 'ai:write',
  AI_CHAT: 'ai:chat',

  // 报告权限
  REPORT_READ: 'report:read',
  REPORT_WRITE: 'report:write',
  REPORT_EXPORT: 'report:export'
} as const

/**
 * 权限组定义
 */
export const PERMISSION_GROUPS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  SYSTEM_ADMIN: [
    PERMISSIONS.SYSTEM_READ,
    PERMISSIONS.SYSTEM_WRITE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_WRITE
  ],
  PARENT: [
    PERMISSIONS.PARENT_READ,
    PERMISSIONS.PARENT_WRITE,
    PERMISSIONS.PARENT_CHILD_READ,
    PERMISSIONS.PARENT_CHILD_WRITE,
    PERMISSIONS.ACTIVITY_READ,
    PERMISSIONS.ACTIVITY_ENROLL,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.AI_READ,
    PERMISSIONS.AI_CHAT,
    PERMISSIONS.REPORT_READ
  ],
  TEACHER: [
    PERMISSIONS.PARENT_READ,
    PERMISSIONS.ACTIVITY_READ,
    PERMISSIONS.ACTIVITY_WRITE,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.NOTIFICATION_SEND,
    PERMISSIONS.AI_READ,
    PERMISSIONS.AI_CHAT,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_WRITE,
    PERMISSIONS.REPORT_EXPORT
  ]
} as const

/**
 * 初始化权限管理器
 * 这个函数应该在应用启动时调用
 */
export async function initializePermissions(): Promise<void> {
  await permissionManager.initialize()
}

/**
 * 使用示例：
 *
 * // 1. 在应用初始化时
 * import { initializePermissions } from '@/utils/permission-manager'
 * await initializePermissions()
 *
 * // 2. 在组件中使用
 * import { usePermissions } from '@/utils/permission-manager'
 *
 * const { hasPermission, hasResourcePermission, isAdmin } = usePermissions()
 *
 * // 检查基础权限
 * if (hasPermission('user:read')) {
 *   // 显示用户管理
 * }
 *
 * // 检查资源权限
 * if (hasResourcePermission(ResourceType.CHILD, PermissionLevel.READ, 'child-123')) {
 *   // 显示孩子信息
 * }
 *
 * // 3. 在模板中使用指令
 * <div v-permission="'user:read'">用户管理</div>
 * <div v-resource-permission="{ resource: 'child', permission: 'read', resourceId: '123' }">孩子信息</div>
 *
 * // 4. 使用装饰器
 * @RequirePermission('user:admin')
 * async deleteUser(userId: string) {
 *   // 删除用户逻辑
 * }
 *
 * // 5. 预定义权限常量
 * if (hasPermission(PERMISSIONS.USER_ADMIN)) {
 *   // 用户管理员操作
 * }
 */