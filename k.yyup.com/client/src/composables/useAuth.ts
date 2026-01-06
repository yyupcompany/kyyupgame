import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { LoginCredentials, User, LoginResponse } from '../types/auth'

/**
 * Authentication composable with comprehensive error handling and validation
 */
export function useAuth() {
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const loading = ref(false)
  const isProcessing = ref(false) // Prevent concurrent login attempts

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * Validate login credentials
   */
  const validateCredentials = (credentials: LoginCredentials): string[] => {
    const errors: string[] = []
    
    if (!credentials.username?.trim()) {
      errors.push('用户名不能为空')
    } else if (!/^[a-zA-Z0-9_]+$/.test(credentials.username)) {
      errors.push('用户名格式不正确')
    }
    
    if (!credentials.password?.trim()) {
      errors.push('密码不能为空')
    } else if (credentials.password.length < 6) {
      errors.push('密码长度不能少于6位')
    }
    
    return errors
  }

  /**
   * Handle different types of authentication errors
   */
  const handleAuthError = (error: any): string => {
    if (error.code === 'TIMEOUT') {
      return '网络连接失败，请检查网络设置'
    }
    
    if (error.status === 429) {
      return '请求过于频繁，请稍后重试'
    }
    
    if (error.status === 503) {
      return '系统维护中，请稍后访问'
    }
    
    if (!error.response) {
      return '网络连接失败，请检查网络设置'
    }
    
    if (!error.response.data) {
      return '服务器响应异常，请稍后重试'
    }
    
    return error.message || '用户名或密码错误'
  }

  /**
   * Login with comprehensive validation and error handling
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Prevent concurrent login attempts
    if (isProcessing.value) {
      throw new Error('登录正在进行中，请勿重复提交')
    }

    // Validate credentials
    const validationErrors = validateCredentials(credentials)
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0])
    }

    isProcessing.value = true
    loading.value = true

    try {
      // Use real API call - use relative path for vite proxy
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败')
      }

      // Handle successful login
      const loginResponse: LoginResponse = {
        token: data.data.token,
        user: data.data.user
      }

      // Update state
      token.value = loginResponse.token
      user.value = loginResponse.user
      
      // Persist to localStorage with correct key
      localStorage.setItem('kindergarten_token', loginResponse.token)
      localStorage.setItem('kindergarten_user_info', JSON.stringify(loginResponse.user))

      return loginResponse
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      ElMessage.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
      isProcessing.value = false
    }
  }

  /**
   * Logout and clear all authentication data
   */
  const logout = async (): Promise<void> => {
    try {
      // Call API to logout
      if (token.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.value}`
          }
        })
      }
      
      // Clear state
      user.value = null
      token.value = ''
      
      // Clear localStorage with correct keys
      localStorage.removeItem('kindergarten_token')
      localStorage.removeItem('kindergarten_user_info')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      ElMessage.success('登出成功')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if API fails
      user.value = null
      token.value = ''
      localStorage.removeItem('kindergarten_token')
      localStorage.removeItem('kindergarten_user_info')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  /**
   * Refresh authentication token
   */
  const refreshToken = async (): Promise<string> => {
    try {
      // Use real API call for token refresh
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: localStorage.getItem('kindergarten_refresh_token')
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '刷新令牌失败')
      }

      // Update tokens
      const newToken = data.data.token
      token.value = newToken
      localStorage.setItem('kindergarten_token', newToken)
      
      if (data.data.refreshToken) {
        localStorage.setItem('kindergarten_refresh_token', data.data.refreshToken)
      }
      
      return newToken
    } catch (error) {
      await logout()
      throw error
    }
  }

  /**
   * Initialize authentication state from localStorage
   */
  const initializeAuth = (): void => {
    try {
      const savedToken = localStorage.getItem('kindergarten_token')
      const savedUser = localStorage.getItem('kindergarten_user_info')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error)
      logout()
    }
  }

  return {
    // State
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    loading: computed(() => loading.value),
    
    // Methods
    login,
    logout,
    refreshToken,
    initializeAuth,
    validateCredentials
  }
}