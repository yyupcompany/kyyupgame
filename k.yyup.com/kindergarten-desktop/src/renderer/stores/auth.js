import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/request'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || '')
  const userName = computed(() => user.value?.fullName || user.value?.username || '')

  // 登录
  const login = async (credentials) => {
    try {
      isLoading.value = true

      const response = await api.post('/auth/login', credentials)

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data

        token.value = newToken
        user.value = userData

        // 保存到本地存储
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))

        return { success: true, data: userData }
      } else {
        throw new Error(response.data.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除状态和本地存储
      token.value = ''
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 获取用户信息
  const fetchUser = async () => {
    try {
      if (!token.value) {
        throw new Error('未登录')
      }

      const response = await api.get('/auth/me')

      if (response.data.success) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
        return response.data.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除登录状态
      await logout()
      throw error
    }
  }

  // 初始化用户信息
  const initAuth = async () => {
    try {
      const savedUser = localStorage.getItem('user')

      if (savedUser) {
        user.value = JSON.parse(savedUser)
      }

      if (token.value && !user.value) {
        // 有token但没有用户信息，从服务器获取
        await fetchUser()
      }

      return true
    } catch (error) {
      console.error('初始化认证状态失败:', error)
      await logout()
      return false
    }
  }

  // 更新用户信息
  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // 检查权限
  const hasRole = (role) => {
    return userRole.value === role
  }

  const hasPermission = (permission) => {
    if (!user.value) return false

    // 管理员拥有所有权限
    if (userRole.value === 'admin') return true

    // 这里可以添加更复杂的权限检查逻辑
    return false
  }

  return {
    // 状态
    token,
    user,
    isLoading,

    // 计算属性
    isAuthenticated,
    userRole,
    userName,

    // 方法
    login,
    logout,
    fetchUser,
    initAuth,
    updateUser,
    hasRole,
    hasPermission
  }
})