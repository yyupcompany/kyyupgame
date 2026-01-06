import { defineStore } from 'pinia'
import { ROLE_PERMISSIONS, ROLES } from '../utils/permission'

// 用户信息接口
interface UserInfo {
  id?: number
  username: string
  role: string
  roles?: string[]
  permissions: string[]
  email?: string
  realName?: string
  phone?: string
  status?: string
  isAdmin?: boolean
  kindergartenId?: number
  teacherId?: number  // 添加教师ID字段
}

export const useUserStore = defineStore('user', {
  state: () => {
    // 初始化时从localStorage恢复用户信息
    const token = localStorage.getItem('kindergarten_token') || ''
    let userInfo = null as UserInfo | null
    let permissions = [] as string[]

    // 如果有token，尝试恢复用户信息
    if (token) {
      // 如果有token，尝试恢复用户信息（支持多种存储键）
      const savedUserInfo = localStorage.getItem('kindergarten_user_info') ||
                          localStorage.getItem('userInfo') ||
                          localStorage.getItem('kindergarten_token') && localStorage.getItem('auth_token') && 'auto'

      if (savedUserInfo && savedUserInfo !== 'auto') {
        try {
          userInfo = JSON.parse(savedUserInfo)
          permissions = userInfo?.permissions || []
          console.log('✅ [前端Store] 从localStorage恢复用户信息:', userInfo.username)
        } catch (error) {
          console.error('恢复用户信息失败:', error)
        }
      } else if (savedUserInfo === 'auto') {
        // 如果有token但没有用户信息，创建一个基础的用户信息结构
        userInfo = {
          id: 0,
          username: 'unknown',
          role: 'user',
          roles: ['user'],
          permissions: [],
          email: '',
          status: 'active'
        }
        console.log('⚠️ [前端Store] 检测到token但缺少用户信息，创建基础用户结构')
      }
    }

    return {
      token,
      userInfo,
      permissions
    }
  },

  getters: {
    isAuthenticated: (state) => {
      // 确保token存在且用户信息完整
      const hasValidToken = !!state.token && state.token.length > 0
      const hasValidUserInfo = !!state.userInfo && !!state.userInfo.username
      return hasValidToken && hasValidUserInfo
    },
    isLoggedIn: (state) => {
      // 与isAuthenticated保持一致
      const hasValidToken = !!state.token && state.token.length > 0
      const hasValidUserInfo = !!state.userInfo && !!state.userInfo.username
      return hasValidToken && hasValidUserInfo
    },
    user: (state) => state.userInfo,
    userToken: (state) => state.token,
    roles: (state) => state.userInfo?.roles || [state.userInfo?.role].filter(Boolean) || [],
    userPermissions: (state) => state.userInfo?.permissions || state.permissions || [],
    userRole: (state) => state.userInfo?.role || ROLES.USER,
    isAdmin: (state) => {
      const role = state.userInfo?.role || ROLES.USER
      const isAdminFlag = state.userInfo?.isAdmin === true

      // 支持后端返回的小写角色和前端定义的角色常量
      const roleBasedAdmin = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN ||
                           role === 'admin' || role === 'super_admin'

      const finalResult = roleBasedAdmin || isAdminFlag

      // 添加详细调试日志
      console.log('🔍 [权限检查] isAdmin判断详情:', {
        userInfo: state.userInfo,
        role: role,
        isAdminFlag: isAdminFlag,
        roleBasedAdmin: roleBasedAdmin,
        finalResult: finalResult
      })

      return finalResult
    }
  },

  actions: {
    async login(credentials: { username: string; password: string }) {
      try {
        // 调用真实的登录API
        const { login } = await import('../api/modules/auth')
        const response = await login(credentials)
        
        if (response.success && response.data) {
          this.setUserInfo(response.data)

          // 存储refresh token
          if (response.data.refreshToken) {
            localStorage.setItem('kindergarten_refresh_token', response.data.refreshToken)
            localStorage.setItem('refreshToken', response.data.refreshToken)
          }

          return response.data
        } else {
          throw new Error(response.message || '登录失败')
        }
      } catch (error) {
        throw error
      }
    },

    async logout() {
      this.clearUserInfo()
      return true
    },

    async refreshToken() {
      try {
        // 使用真实的refresh token API调用
        const refreshToken = localStorage.getItem('kindergarten_refresh_token') || localStorage.getItem('refreshToken')

        if (!refreshToken) {
          throw new Error('没有找到refresh token')
        }

        const { refreshToken: refreshTokenAPI } = await import('../api/modules/auth')
        const response = await refreshTokenAPI({ refreshToken })

        if (response.success && response.data) {
          const { token, refreshToken: newRefreshToken } = response.data

          // 更新tokens
          this.token = token
          localStorage.setItem('kindergarten_token', token)

          if (newRefreshToken) {
            localStorage.setItem('kindergarten_refresh_token', newRefreshToken)
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          return { token, refreshToken: newRefreshToken }
        } else {
          throw new Error(response.message || 'Token刷新失败')
        }
      } catch (error) {
        console.error('Token刷新失败:', error)
        this.clearUserInfo()
        throw error
      }
    },

    setUserInfo(loginData: any) {
      // 处理不同的数据结构
      if (loginData.token && loginData.user) {
        // API 返回结构: { token, user }
        this.token = loginData.token
        this.userInfo = loginData.user
        this.permissions = loginData.user.permissions || []
        
        localStorage.setItem('kindergarten_token', loginData.token)
        localStorage.setItem('token', loginData.token)
        localStorage.setItem('kindergarten_user_info', JSON.stringify(loginData.user))
      } else if (loginData.token && (loginData.username || loginData.roles)) {
        // 登录页面传递结构: { token, username, roles, permissions }
        this.token = loginData.token

        // 确保 role 字段存在
        const role = loginData.roles?.[0]?.code || loginData.role || 'user'

        this.userInfo = {
          username: loginData.username,
          role: role,
          roles: loginData.roles || [],
          permissions: loginData.permissions || [],
          isAdmin: role === 'admin' || role === 'super_admin',
          kindergartenId: loginData.kindergartenId  // ✅ 添加kindergartenId字段
        }
        this.permissions = loginData.permissions || []

        localStorage.setItem('kindergarten_token', loginData.token)
        localStorage.setItem('token', loginData.token)
        localStorage.setItem('auth_token', loginData.token)
        localStorage.setItem('kindergarten_user_info', JSON.stringify(this.userInfo))
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      } else {
        // 兼容旧结构
        const { token, ...userInfo } = loginData
        this.token = token
        this.userInfo = userInfo
        this.permissions = userInfo.permissions || []
        
        localStorage.setItem('kindergarten_token', token)
        localStorage.setItem('token', token)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('kindergarten_user_info', JSON.stringify(userInfo))
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
      
      // 根据角色设置权限（如果没有明确权限）
      if (this.permissions.length === 0 && this.userInfo?.role) {
        this.setPermissionsByRole(this.userInfo.role)
      }

      // 确保 role 字段存在
      if (this.userInfo && !this.userInfo.role && this.userInfo.roles?.length && this.userInfo.roles.length > 0) {
        this.userInfo.role = (this.userInfo.roles[0] as any).code || this.userInfo.roles[0]
        this.userInfo.isAdmin = this.userInfo.role === 'admin' || this.userInfo.role === 'super_admin'
        localStorage.setItem('kindergarten_user_info', JSON.stringify(this.userInfo))
      }
    },

    clearUserInfo() {
      this.token = ''
      this.userInfo = null
      this.permissions = []

      // 清除localStorage中的所有认证相关信息
      localStorage.removeItem('kindergarten_token')
      localStorage.removeItem('kindergarten_refresh_token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('kindergarten_user_info')
      localStorage.removeItem('userInfo')
    },

    resetState() {
      this.clearUserInfo()
    },

    async getUserInfo() {
      // 如果已有用户信息，直接返回
      if (this.userInfo?.id) {
        return { user: this.userInfo }
      }

      // 如果有token但没有用户信息，尝试从localStorage恢复
      if (this.token) {
        const savedUserInfo = localStorage.getItem('userInfo')
        if (savedUserInfo) {
          try {
            this.userInfo = JSON.parse(savedUserInfo)
            if (this.userInfo?.id) {
              this.permissions = this.userInfo.permissions || []
              return { user: this.userInfo }
            }
          } catch (error) {
            console.error('解析用户信息失败:', error)
          }
        }
      }

      // 调用API获取用户信息
      try {
        const { getUserInfo } = await import('../api/modules/auth')
        const response = await getUserInfo()
        
        if (response.success && response.data) {
          // 转换后端返回的用户信息格式
          const userData = response.data
          const userInfo: UserInfo = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            realName: userData.realName,
            phone: userData.phone,
            status: userData.status,
            role: userData.roles?.[0]?.code || 'user',
            roles: userData.roles?.map((role: any) => role.code) || [],
            permissions: userData.permissions || [],
            isAdmin: userData.roles?.some((role: any) => role.code === 'admin') || false,
            kindergartenId: userData.kindergartenId
          }
          
          this.userInfo = userInfo
          this.permissions = userInfo.permissions
          localStorage.setItem('kindergarten_user_info', JSON.stringify(userInfo))
          
          return { user: userInfo }
        } else {
          throw new Error('获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息错误:', error)
        
        // 如果API调用失败，返回默认用户信息以保持应用运行
        const defaultUser: UserInfo = {
          id: 1,
          username: '演示用户',
          role: ROLES.ADMIN,
          permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
          email: 'demo@example.com',
          realName: '演示管理员',
          isAdmin: true
        }
        
        this.userInfo = defaultUser
        this.permissions = defaultUser.permissions
        localStorage.setItem('kindergarten_user_info', JSON.stringify(defaultUser))
        
        return { user: defaultUser }
      }
    },

    hasPermission(permission: string): boolean {
      // 如果没有用户信息，尝试从localStorage恢复
      if (!this.userInfo) {
        this.tryRestoreFromLocalStorage()
      }

      // 如果仍然没有用户信息，返回false
      if (!this.userInfo) {
        console.warn('权限检查失败：用户未登录', permission)
        return false
      }

      // 如果没有权限信息，则根据角色重新设置权限
      if (this.permissions.length === 0 && this.userInfo.role) {
        this.setPermissionsByRole(this.userInfo.role)
      }

      // 管理员拥有所有权限
      if (this.isAdmin) {
        console.log('权限检查通过：管理员权限', permission)
        return true
      }

      // 检查通配符权限
      if (this.userPermissions.includes('*')) {
        console.log('权限检查通过：通配符权限', permission)
        return true
      }

      // 检查具体权限
      const hasPermission = this.userPermissions.includes(permission)

      // 调试日志
      console.log('用户权限检查:', {
        permission,
        hasPermission,
        userPermissions: this.userPermissions.slice(0, 5), // 只显示前5个权限避免日志过长
        userRole: this.userRole,
        isAdmin: this.isAdmin,
        userId: this.userInfo.id,
        username: this.userInfo.username
      })

      return hasPermission
    },

    hasRole(roleCode: string): boolean {
      return this.userRole === roleCode
    },

    hasAnyRole(roleCodes: string[]): boolean {
      return roleCodes.includes(this.userRole)
    },

    setPermissionsByRole(role: string) {
      // 使用统一的角色权限映射
      this.permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.USER]
      
      if (this.userInfo) {
        this.userInfo.permissions = this.permissions
        this.userInfo.role = role
        localStorage.setItem('kindergarten_user_info', JSON.stringify(this.userInfo))
      }
    },

    updateUserRole(role: string) {
      if (this.userInfo) {
        this.userInfo.role = role
        this.setPermissionsByRole(role)
      }
    },

    addPermission(permission: string) {
      if (!this.permissions.includes(permission)) {
        this.permissions.push(permission)
        if (this.userInfo) {
          this.userInfo.permissions = this.permissions
          localStorage.setItem('kindergarten_user_info', JSON.stringify(this.userInfo))
        }
      }
    },

    removePermission(permission: string) {
      const index = this.permissions.indexOf(permission)
      if (index > -1) {
        this.permissions.splice(index, 1)
        if (this.userInfo) {
          this.userInfo.permissions = this.permissions
          localStorage.setItem('kindergarten_user_info', JSON.stringify(this.userInfo))
        }
      }
    },

    tryRestoreFromLocalStorage() {
      // 尝试从localStorage恢复用户信息
      const token = localStorage.getItem('kindergarten_token')
      const savedUserInfo = localStorage.getItem('kindergarten_user_info') || localStorage.getItem('userInfo')

      if (token && savedUserInfo) {
        try {
          const userInfo = JSON.parse(savedUserInfo)
          this.token = token
          this.userInfo = userInfo
          this.permissions = userInfo.permissions || []
          console.log('从localStorage恢复用户信息:', userInfo)

          // 确保token在所有存储位置都同步
          localStorage.setItem('kindergarten_token', token)
          localStorage.setItem('auth_token', token)
        } catch (error) {
          console.error('恢复用户信息失败:', error)
          // 清理损坏的数据
          this.clearUserInfo()
        }
      } else if (!token || !savedUserInfo) {
        // 如果任何一个缺失，清理所有认证信息
        console.warn('Token或用户信息缺失，清理认证信息')
        this.clearUserInfo()
      }
    },

    async getCurrentUserTeacherId(): Promise<number | null> {
      // 如果用户信息中已有教师ID，直接返回
      if (this.userInfo?.teacherId) {
        return this.userInfo.teacherId
      }

      // 如果没有用户ID，无法查询教师信息
      if (!this.userInfo?.id) {
        console.warn('当前用户信息中没有用户ID，无法查询教师信息')
        return null
      }

      try {
        // 动态导入API模块以避免循环依赖
        const { request } = await import('../utils/request')
        
        // 调用后端API根据用户ID查询教师信息
        const response = await request.get(`/teachers/by-user/${this.userInfo.id}`)

        if (response.success && response.data) {
          const teacherId = response.data.id || response.data.teacherId
          
          // 更新用户信息中的教师ID
          if (this.userInfo && teacherId) {
            this.userInfo.teacherId = teacherId
            localStorage.setItem('kindergarten_user_info', JSON.stringify(this.userInfo))
            console.log('获取到当前用户的教师ID:', teacherId)
            return teacherId
          }
        }
        
        return null
      } catch (error) {
        console.error('获取当前用户教师ID失败:', error)
        return null
      }
    }
  }
}) 