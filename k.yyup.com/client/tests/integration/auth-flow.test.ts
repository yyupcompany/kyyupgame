
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { expectNoConsoleErrors, startConsoleMonitoring } from '../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure
} from '../utils/data-validation'
import {
  validateJWTToken,
  validateRefreshToken,
  validateUserInfo,
  validateAuthResponse,
  validateLoginRequest,
  createAuthValidationReport
} from '../utils/auth-validation'

// Mock API calls
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getProfile: vi.fn()
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    error: null,
    validateToken: vi.fn()
  })
}))

describe('Auth Flow Integration Tests - Strict Validation', () => {
  let router: Router
  let pinia: any

  beforeEach(async () => {
    vi.clearAllMocks()
    startConsoleMonitoring()

    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login Page</div>' }
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: { template: '<div>Dashboard Page</div>' },
          meta: { requiresAuth: true }
        },
        {
          path: '/',
          redirect: '/dashboard'
        }
      ]
    })

    // Setup pinia
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    expectNoConsoleErrors()
    vi.restoreAllMocks()
  })

  describe('Login Flow', () => {
    it('should redirect to login when accessing protected route without authentication', async () => {
      router.push('/dashboard')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('should successfully login and redirect to dashboard', async () => {
      const { login } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      // Mock successful login
      const mockLoginResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@school.com',
          role: 'admin'
        }
      }
      login.mockResolvedValue(mockLoginResponse)

      const userStore = useUserStore()
      userStore.login.mockResolvedValue(true)

      // Mount login page
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia, i18n],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true
          }
        }
      })

      // Simulate login form submission
      await wrapper.vm.login({
        username: 'admin',
        password: 'password123'
      })

      // Verify login API was called
      expect(login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password123'
      })

      // Verify user store login was called
      expect(userStore.login).toHaveBeenCalledWith(mockLoginResponse)

      // Wait for navigation
      await new Promise(resolve => setTimeout(resolve, 0))

      // Verify redirect to dashboard
      expect(router.currentRoute.value.name).toBe('Dashboard')
    })

    it('should handle login failure', async () => {
      const { login } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      
      // Mock failed login
      const mockErrorResponse = {
        success: false,
        message: 'Invalid username or password'
      }
      login.mockResolvedValue(mockErrorResponse)

      // Mount login page
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia, i18n],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-alert': true
          }
        }
      })

      // Simulate login form submission
      await wrapper.vm.login({
        username: 'invalid',
        password: 'wrongpassword'
      })

      // Verify login API was called
      expect(login).toHaveBeenCalledWith({
        username: 'invalid',
        password: 'wrongpassword'
      })

      // Verify error message is displayed
      expect(wrapper.vm.error).toBe('Invalid username or password')
      expect(wrapper.find('.error-message').exists()).toBe(true)

      // Verify no navigation occurred
      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('should handle login API error', async () => {
      const { login } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      
      // Mock API error
      const apiError = new Error('Network error')
      login.mockRejectedValue(apiError)

      // Mount login page
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia, i18n],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-alert': true
          }
        }
      })

      // Simulate login form submission
      await wrapper.vm.login({
        username: 'admin',
        password: 'password123'
      })

      // Verify error handling
      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.find('.error-message').exists()).toBe(true)
    })

    it('should validate login form before submission', async () => {
      // Mount login page
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia, i18n],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-button': true,
            'el-card': true
          }
        }
      })

      // Try to submit empty form
      await wrapper.vm.login({
        username: '',
        password: ''
      })

      // Verify form validation
      expect(wrapper.vm.errors.username).toBeDefined()
      expect(wrapper.vm.errors.password).toBeDefined()
      
      // Verify API was not called
      const { login } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      expect(login).not.toHaveBeenCalled()
    })
  })

  describe('Logout Flow', () => {
    it('should successfully logout and redirect to login', async () => {
      const { logout } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      // Mock successful logout
      logout.mockResolvedValue({ success: true })

      const userStore = useUserStore()
      userStore.user = { id: 1, username: 'admin' }
      userStore.isAuthenticated = true
      userStore.logout.mockResolvedValue()

      // Navigate to dashboard first
      await router.push('/dashboard')
      await router.isReady()

      // Mount dashboard page
      const wrapper = mount(DashboardIndex, {
        global: {
          plugins: [router, pinia, i18n],
          stubs: {
            'el-card': true,
            'el-button': true
          }
        }
      })

      // Simulate logout
      await wrapper.vm.logout()

      // Verify logout API was called
      expect(logout).toHaveBeenCalled()

      // Verify user store logout was called
      expect(userStore.logout).toHaveBeenCalled()

      // Wait for navigation
      await new Promise(resolve => setTimeout(resolve, 0))

      // Verify redirect to login
      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('should handle logout error gracefully', async () => {
      const { logout } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      // Mock logout error
      const logoutError = new Error('Logout failed')
      logout.mockRejectedValue(logoutError)

      const userStore = useUserStore()
      userStore.user = { id: 1, username: 'admin' }
      userStore.isAuthenticated = true
      userStore.logout.mockResolvedValue()

      // Mount dashboard page
      const wrapper = mount(DashboardIndex, {
        global: {
          plugins: [router, pinia, i18n],
          stubs: {
            'el-card': true,
            'el-button': true,
            'el-alert': true
          }
        }
      })

      // Simulate logout
      await wrapper.vm.logout()

      // Verify logout API was called
      expect(logout).toHaveBeenCalled()

      // Verify user store logout was still called
      expect(userStore.logout).toHaveBeenCalled()

      // Verify redirect still occurred
      expect(router.currentRoute.value.name).toBe('Login')
    })
  })

  describe('Route Guards', () => {
    it('should allow access to protected route when authenticated', async () => {
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      const userStore = useUserStore()
      userStore.user = { id: 1, username: 'admin' }
      userStore.isAuthenticated = true

      // Navigate to dashboard
      await router.push('/dashboard')
      await router.isReady()

      // Verify access is granted
      expect(router.currentRoute.value.name).toBe('Dashboard')
    })

    it('should redirect to login when accessing protected route without authentication', async () => {
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      const userStore = useUserStore()
      userStore.user = null
      userStore.isAuthenticated = false

      // Navigate to dashboard
      await router.push('/dashboard')
      await router.isReady()

      // Verify redirect to login
      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('should allow access to login page when not authenticated', async () => {
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      const userStore = useUserStore()
      userStore.user = null
      userStore.isAuthenticated = false

      // Navigate to login
      await router.push('/login')
      await router.isReady()

      // Verify access is granted
      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('should redirect to dashboard when accessing login page while authenticated', async () => {
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      const userStore = useUserStore()
      userStore.user = { id: 1, username: 'admin' }
      userStore.isAuthenticated = true

      // Navigate to login
      await router.push('/login')
      await router.isReady()

      // Verify redirect to dashboard
      expect(router.currentRoute.value.name).toBe('Dashboard')
    })
  })

  describe('Token Validation', () => {
    it('should validate token on app startup', async () => {
      const { getProfile } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      // Mock successful profile fetch
      const mockProfile = {
        success: true,
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@school.com',
          role: 'admin'
        }
      }
      getProfile.mockResolvedValue(mockProfile)

      const userStore = useUserStore()
      userStore.isAuthenticated = true

      // Simulate token validation
      await userStore.validateToken()

      // Verify profile API was called
      expect(getProfile).toHaveBeenCalled()

      // Verify user is still authenticated
      expect(userStore.isAuthenticated).toBe(true)
    })

    it('should handle invalid token on app startup', async () => {
      const { getProfile } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/api/auth')
      const { useUserStore } = await import('/home/zhgue/yyupcc/k.yyup.com/client/src/stores/user')
      
      // Mock invalid token response
      getProfile.mockRejectedValue(new Error('Invalid token'))

      const userStore = useUserStore()
      userStore.isAuthenticated = true

      // Simulate token validation
      await userStore.validateToken()

      // Verify profile API was called
      expect(getProfile).toHaveBeenCalled()

      // Verify user is logged out
      expect(userStore.isAuthenticated).toBe(false)
      expect(userStore.user).toBeNull()
    })
  })
})