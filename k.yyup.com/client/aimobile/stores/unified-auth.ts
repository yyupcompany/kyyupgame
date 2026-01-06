/**
 * 移动端统一认证状态管理
 * 集成PC端统一认证系统的完整功能
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  AuthenticateRequest,
  AuthenticateResponse,
  RegisterRequest,
  RegisterResponse,
  FindUserTenantsResponse,
  TenantInfo,
  UserStats,
  LoginWithCodeRequest,
  TokenRefreshResponse,
  mobileUnifiedAuthAPI
} from '../api/unified-auth'
import { CallingLogger, type LogContext } from '../../../src/utils/CallingLogger'

// ===== 接口类型定义 =====

export interface UnifiedUser {
  globalUserId: string;
  phone: string;
  realName?: string;
  email?: string;
  avatar?: string;
  isNewUser: boolean;
  token?: string;
  refreshToken?: string;
  tenantCount?: number;
  totalLoginCount?: number;
  lastLoginAt?: string;
  activeTenants?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UnifiedUser | null;
  tenants: TenantInfo[];
  currentTenant: TenantInfo | null;
  error: string | null;
  tokenRefreshTimer: NodeJS.Timeout | null;
}

export interface LoginCredentials {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface CodeLoginCredentials {
  phone: string;
  code: string;
  password?: string;
  role?: 'parent' | 'teacher' | 'admin';
  autoRegister?: boolean;
}

// ===== Store 定义 =====

/**
 * 创建认证相关的日志上下文
 */
const createAuthContext = (operation: string, additionalContext?: any): LogContext => {
  return CallingLogger.createComponentContext('unified-auth', {
    module: 'AUTH',
    operation,
    platform: 'mobile',
    ...additionalContext
  })
}

export const useUnifiedAuthStore = defineStore('unifiedAuth', () => {
  // ===== 状态定义 =====

  const authState = ref<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    tenants: [],
    currentTenant: null,
    error: null,
    tokenRefreshTimer: null
  })

  // ===== 计算属性 =====

  const isLoggedIn = computed(() => authState.value.isAuthenticated)
  const currentUser = computed(() => authState.value.user)
  const userTenants = computed(() => authState.value.tenants)
  const hasMultipleTenants = computed(() => authState.value.tenants.length > 1)
  const currentTenant = computed(() => authState.value.currentTenant)
  const isLoading = computed(() => authState.value.isLoading)
  const authError = computed(() => authState.value.error)

  // 用户信息计算属性
  const userDisplayName = computed(() =>
    currentUser.value?.realName || currentUser.value?.phone || '未知用户'
  )

  const userRole = computed(() => {
    if (currentTenant.value?.role) {
      return currentTenant.value.role
    }
    // 默认角色判断逻辑
    return currentUser.value?.phone?.includes('admin') ? 'admin' : 'user'
  })

  const userPermissions = computed(() => {
    const role = userRole.value
    const permissions = ['basic']

    if (role === 'admin') {
      permissions.push('admin', 'manage', 'delete')
    } else if (role === 'teacher') {
      permissions.push('teach', 'manage_students')
    } else if (role === 'parent') {
      permissions.push('view_children', 'communicate')
    }

    return permissions
  })

  // ===== 核心认证方法 =====

  /**
   * 用户登录（手机号+密码）
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    const loggerContext = createAuthContext('login', { phone: credentials.phone })

    try {
      authState.value.isLoading = true
      authState.value.error = null

      const request: AuthenticateRequest = {
        phone: credentials.phone,
        password: credentials.password,
        registrationSource: 'mobile'
      }

      CallingLogger.logAuth(loggerContext, '开始统一认证登录', { phone: credentials.phone })

      const response = await mobileUnifiedAuthAPI.authenticate(request)

      if (response.success && response.data) {
        await handleLoginSuccess(response.data, credentials.rememberMe)
        CallingLogger.logSuccess(loggerContext, '登录成功', { user: userDisplayName.value })
        ElMessage.success(`欢迎回来，${userDisplayName.value}！`)
        return true
      } else {
        throw new Error(response.message || '登录失败')
      }

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '统一认证登录失败', error, { phone: credentials.phone })
      authState.value.error = error.message || '登录失败，请重试'
      ElMessage.error(authState.value.error)
      return false
    } finally {
      authState.value.isLoading = false
    }
  }

  /**
   * 验证码登录
   */
  const loginWithCode = async (credentials: CodeLoginCredentials): Promise<boolean> => {
    const loggerContext = createAuthContext('loginWithCode', {
      phone: credentials.phone,
      role: credentials.role || 'parent'
    })

    try {
      authState.value.isLoading = true
      authState.value.error = null

      const request: LoginWithCodeRequest = {
        phone: credentials.phone,
        code: credentials.code,
        password: credentials.password,
        role: credentials.role || 'parent',
        autoRegister: credentials.autoRegister ?? true
      }

      CallingLogger.logAuth(loggerContext, '开始验证码登录', {
        phone: credentials.phone,
        role: request.role,
        autoRegister: request.autoRegister
      })

      const response = await mobileUnifiedAuthAPI.loginWithCode(request)

      if (response.success && response.data) {
        await handleLoginSuccess(response.data, true)
        CallingLogger.logSuccess(loggerContext, '验证码登录成功', { user: userDisplayName.value })
        ElMessage.success(`登录成功，${userDisplayName.value}！`)
        return true
      } else {
        throw new Error(response.message || '验证码登录失败')
      }

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '验证码登录失败', error, {
        phone: credentials.phone,
        role: credentials.role || 'parent'
      })
      authState.value.error = error.message || '验证码登录失败，请重试'
      ElMessage.error(authState.value.error)
      return false
    } finally {
      authState.value.isLoading = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (registerData: RegisterRequest): Promise<boolean> => {
    const loggerContext = createAuthContext('register', { phone: registerData.phone })

    try {
      authState.value.isLoading = true
      authState.value.error = null

      const request: RegisterRequest = {
        ...registerData,
        registrationSource: 'mobile'
      }

      CallingLogger.logInfo(loggerContext, '开始用户注册', { phone: registerData.phone })

      const response = await mobileUnifiedAuthAPI.register(request)

      if (response.success && response.data) {
        CallingLogger.logSuccess(loggerContext, '用户注册成功', { phone: registerData.phone })
        ElMessage.success('注册成功！请登录')
        return true
      } else {
        throw new Error(response.message || '注册失败')
      }

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '用户注册失败', error, { phone: registerData.phone })
      authState.value.error = error.message || '注册失败，请重试'
      ElMessage.error(authState.value.error)
      return false
    } finally {
      authState.value.isLoading = false
    }
  }

  /**
   * 用户登出
   */
  const logout = async (): Promise<void> => {
    const loggerContext = createAuthContext('logout')

    try {
      CallingLogger.logAuth(loggerContext, '开始用户登出', {
        userId: currentUser.value?.globalUserId,
        phone: currentUser.value?.phone
      })

      // 清除状态
      authState.value.isAuthenticated = false
      authState.value.user = null
      authState.value.tenants = []
      authState.value.currentTenant = null
      authState.value.error = null

      // 清除定时器
      if (authState.value.tokenRefreshTimer) {
        clearInterval(authState.value.tokenRefreshTimer)
        authState.value.tokenRefreshTimer = null
      }

      // 清除本地存储
      clearAuthStorage()

      CallingLogger.logSuccess(loggerContext, '用户登出成功')
      ElMessage.success('已安全退出')

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '用户登出失败', error)
      ElMessage.error('退出登录失败')
    }
  }

  /**
   * 刷新Token
   */
  const refreshToken = async (): Promise<boolean> => {
    const loggerContext = createAuthContext('refreshToken')

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('没有刷新令牌')
      }

      CallingLogger.logAuth(loggerContext, '开始刷新Token')

      const response = await mobileUnifiedAuthAPI.refreshToken({ refreshToken })

      if (response.success && response.data) {
        // 更新本地Token
        localStorage.setItem('access_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refreshToken)

        // 更新用户状态
        if (authState.value.user) {
          authState.value.user.token = response.data.token
          authState.value.user.refreshToken = response.data.refreshToken
        }

        CallingLogger.logSuccess(loggerContext, 'Token刷新成功')
        return true
      } else {
        throw new Error(response.message || 'Token刷新失败')
      }

    } catch (error: any) {
      CallingLogger.logError(loggerContext, 'Token刷新失败', error)
      // Token刷新失败，需要重新登录
      await logout()
      ElMessage.error('登录已过期，请重新登录')
      return false
    }
  }

  /**
   * 获取用户租户列表
   */
  const fetchUserTenants = async (): Promise<TenantInfo[]> => {
    const loggerContext = createAuthContext('fetchUserTenants')

    try {
      if (!currentUser.value) {
        throw new Error('用户未登录')
      }

      CallingLogger.logAuth(loggerContext, '获取用户租户列表', {
        phone: currentUser.value.phone,
        globalUserId: currentUser.value.globalUserId
      })

      const response = await mobileUnifiedAuthAPI.findUserTenants({
        phone: currentUser.value.phone,
        globalUserId: currentUser.value.globalUserId
      })

      if (response.success && response.data) {
        authState.value.tenants = response.data.tenants

        // 设置默认租户
        if (!authState.value.currentTenant && response.data.tenants.length > 0) {
          const activeTenant = response.data.tenants.find(t => t.status === 'active')
          authState.value.currentTenant = activeTenant || response.data.tenants[0]
        }

        CallingLogger.logSuccess(loggerContext, '获取用户租户列表成功', {
          tenantCount: response.data.tenants.length,
          tenants: response.data.tenants.map(t => ({ tenantCode: t.tenantCode, tenantName: t.tenantName }))
        })
        return response.data.tenants
      } else {
        throw new Error(response.message || '获取租户列表失败')
      }

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '获取用户租户列表失败', error, {
        phone: currentUser.value?.phone,
        globalUserId: currentUser.value?.globalUserId
      })
      authState.value.error = error.message || '获取租户列表失败'
      return []
    }
  }

  /**
   * 切换当前租户
   */
  const switchTenant = async (tenantCode: string): Promise<boolean> => {
    const loggerContext = createAuthContext('switchTenant', { tenantCode })

    try {
      const tenant = authState.value.tenants.find(t => t.tenantCode === tenantCode)
      if (!tenant) {
        throw new Error('租户不存在')
      }

      CallingLogger.logAuth(loggerContext, '切换租户', {
        from: authState.value.currentTenant?.tenantCode,
        to: tenantCode,
        tenantName: tenant.tenantName
      })

      authState.value.currentTenant = tenant

      // 保存当前租户信息
      localStorage.setItem('current_tenant', JSON.stringify(tenant))

      CallingLogger.logSuccess(loggerContext, '租户切换成功', {
        tenantCode: tenant.tenantCode,
        tenantName: tenant.tenantName
      })
      ElMessage.success(`已切换到 ${tenant.tenantName}`)
      return true

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '切换租户失败', error, { tenantCode })
      authState.value.error = error.message || '切换租户失败'
      ElMessage.error(authState.value.error)
      return false
    }
  }

  // ===== 初始化和恢复方法 =====

  /**
   * 初始化认证状态
   */
  const initializeAuth = async (): Promise<void> => {
    const loggerContext = createAuthContext('initializeAuth')

    try {
      CallingLogger.logSystem(loggerContext, '初始化移动端统一认证状态')

      // 从本地存储恢复状态
      const savedUser = localStorage.getItem('unified_user')
      const savedToken = localStorage.getItem('access_token')
      const savedRefreshToken = localStorage.getItem('refresh_token')
      const savedCurrentTenant = localStorage.getItem('current_tenant')

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser) as UnifiedUser

        authState.value.isAuthenticated = true
        authState.value.user = { ...user, token: savedToken, refreshToken: savedRefreshToken }

        if (savedCurrentTenant) {
          authState.value.currentTenant = JSON.parse(savedCurrentTenant)
        }

        // 获取用户租户信息
        await fetchUserTenants()

        // 启动Token刷新定时器
        startTokenRefreshTimer()

        CallingLogger.logSuccess(loggerContext, '认证状态恢复成功', {
          userId: user.globalUserId,
          phone: user.phone,
          hasTenant: !!authState.value.currentTenant
        })
      }

    } catch (error: any) {
      CallingLogger.logError(loggerContext, '初始化认证状态失败', error)
      // 清理可能损坏的状态
      await logout()
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 处理登录成功
   */
  const handleLoginSuccess = async (data: AuthenticateResponse['data']!, rememberMe: boolean = false): Promise<void> => {
    if (!data) return

    const user: UnifiedUser = {
      globalUserId: data.globalUserId,
      phone: data.phone,
      realName: data.realName,
      email: data.email,
      isNewUser: data.isNewUser,
      token: data.token,
      refreshToken: data.refreshToken
    }

    // 更新状态
    authState.value.isAuthenticated = true
    authState.value.user = user
    authState.value.error = null

    // 保存到本地存储
    localStorage.setItem('unified_user', JSON.stringify(user))
    localStorage.setItem('access_token', data.token || '')
    localStorage.setItem('refresh_token', data.refreshToken || '')

    if (rememberMe) {
      localStorage.setItem('remember_me', 'true')
    }

    // 获取用户租户信息
    await fetchUserTenants()

    // 启动Token刷新定时器
    startTokenRefreshTimer()
  }

  /**
   * 启动Token刷新定时器
   */
  const startTokenRefreshTimer = (): void => {
    // 清除现有定时器
    if (authState.value.tokenRefreshTimer) {
      clearInterval(authState.value.tokenRefreshTimer)
    }

    // 每30分钟刷新一次Token
    authState.value.tokenRefreshTimer = setInterval(async () => {
      await refreshToken()
    }, 30 * 60 * 1000)
  }

  /**
   * 清除认证存储
   */
  const clearAuthStorage = (): void => {
    const keysToRemove = [
      'unified_user',
      'access_token',
      'refresh_token',
      'current_tenant',
      'remember_me'
    ]

    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  // ===== 返回状态和方法 =====

  return {
    // 状态
    authState: authState.value,

    // 计算属性
    isLoggedIn,
    currentUser,
    userTenants,
    hasMultipleTenants,
    currentTenant,
    isLoading,
    authError,
    userDisplayName,
    userRole,
    userPermissions,

    // 方法
    login,
    loginWithCode,
    register,
    logout,
    refreshToken,
    fetchUserTenants,
    switchTenant,
    initializeAuth
  }
})

// ===== 导出便捷函数 =====

export const useUnifiedAuth = () => {
  const store = useUnifiedAuthStore()

  return {
    // 基础认证
    ...store,

    // 快速方法
    isAuthenticated: store.isLoggedIn,
    user: store.currentUser,
    tenants: store.userTenants,
    tenant: store.currentTenant,
    loading: store.isLoading,
    error: store.authError,
    displayName: store.userDisplayName,
    role: store.userRole,
    permissions: store.userPermissions,

    // 检查权限
    hasPermission: (permission: string) => {
      return store.userPermissions.includes(permission) ||
             store.userPermissions.includes('*')
    },

    // 检查角色
    hasRole: (role: string) => {
      return store.userRole === role
    },

    // 检查是否为管理员
    isAdmin: () => {
      return store.userRole === 'admin' || store.userPermissions.includes('*')
    }
  }
}

export default useUnifiedAuth