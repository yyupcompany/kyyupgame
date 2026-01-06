import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as routerUtils from '../../../src/utils/router-utils'

// Mock router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: {
    value: {
      path: '/dashboard',
      name: 'dashboard',
      params: {},
      query: {},
      hash: '',
      fullPath: '/dashboard',
      matched: [],
      meta: {}
    }
  },
  hasRoute: vi.fn(),
  resolve: vi.fn(),
  addRoute: vi.fn(),
  removeRoute: vi.fn(),
  getRoutes: vi.fn(),
  beforeEach: vi.fn(),
  afterEach: vi.fn(),
  onError: vi.fn(),
  isReady: vi.fn()
}

// Mock route
const mockRoute = {
  path: '/dashboard',
  name: 'dashboard',
  params: {},
  query: {},
  hash: '',
  fullPath: '/dashboard',
  matched: [],
  meta: {}
}

// Mock location
const mockLocation = {
  href: 'https://example.com/dashboard',
  origin: 'https://example.com',
  pathname: '/dashboard',
  search: '?param=value',
  hash: '#section',
  protocol: 'https:',
  host: 'example.com',
  hostname: 'example.com',
  port: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn()
}

// Mock history
const mockHistory = {
  length: 10,
  state: {},
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  pushState: vi.fn(),
  replaceState: vi.fn()
}

// 控制台错误检测变量
let consoleSpy: any

describe('Router Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: mockLocation,
      history: mockHistory
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Reset all mock functions
    Object.values(mockRouter).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    Object.values(mockLocation).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    Object.values(mockHistory).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Navigation', () => {
    describe('navigateTo', () => {
      it('should navigate to path using router', () => {
        routerUtils.navigateTo(mockRouter, '/dashboard')
        
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })

      it('should navigate to path with query parameters', () => {
        const query = { page: 1, limit: 10 }
        
        routerUtils.navigateTo(mockRouter, '/dashboard', { query })
        
        expect(mockRouter.push).toHaveBeenCalledWith({
          path: '/dashboard',
          query
        })
      })

      it('should navigate to path with params', () => {
        const params = { id: '123' }
        
        routerUtils.navigateTo(mockRouter, '/user/:id', { params })
        
        expect(mockRouter.push).toHaveBeenCalledWith({
          path: '/user/:id',
          params
        })
      })

      it('should navigate to path with hash', () => {
        routerUtils.navigateTo(mockRouter, '/dashboard', { hash: '#section' })
        
        expect(mockRouter.push).toHaveBeenCalledWith({
          path: '/dashboard',
          hash: '#section'
        })
      })

      it('should navigate using replace option', () => {
        routerUtils.navigateTo(mockRouter, '/dashboard', { replace: true })
        
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
      })
    })

    describe('navigateBack', () => {
      it('should navigate back using router', () => {
        routerUtils.navigateBack(mockRouter)
        
        expect(mockRouter.back).toHaveBeenCalled()
      })

      it('should navigate back using history if no router', () => {
        routerUtils.navigateBack()
        
        expect(window.history.back).toHaveBeenCalled()
      })
    })

    describe('navigateForward', () => {
      it('should navigate forward using router', () => {
        routerUtils.navigateForward(mockRouter)
        
        expect(mockRouter.forward).toHaveBeenCalled()
      })

      it('should navigate forward using history if no router', () => {
        routerUtils.navigateForward()
        
        expect(window.history.forward).toHaveBeenCalled()
      })
    })

    describe('navigateToLogin', () => {
      it('should navigate to login page with return URL', () => {
        routerUtils.navigateToLogin(mockRouter, '/dashboard')
        
        expect(mockRouter.push).toHaveBeenCalledWith({
          path: '/login',
          query: { returnUrl: '/dashboard' }
        })
      })

      it('should use current path as return URL if not provided', () => {
        routerUtils.navigateToLogin(mockRouter)
        
        expect(mockRouter.push).toHaveBeenCalledWith({
          path: '/login',
          query: { returnUrl: '/dashboard' }
        })
      })
    })

    describe('navigateToHome', () => {
      it('should navigate to home page', () => {
        routerUtils.navigateToHome(mockRouter)
        
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      })
    })

    describe('navigateTo404', () => {
      it('should navigate to 404 page', () => {
        routerUtils.navigateTo404(mockRouter)
        
        expect(mockRouter.push).toHaveBeenCalledWith('/404')
      })
    })

    describe('navigateTo403', () => {
      it('should navigate to 403 page', () => {
        routerUtils.navigateTo403(mockRouter)
        
        expect(mockRouter.push).toHaveBeenCalledWith('/403')
      })
    })

    describe('navigateTo500', () => {
      it('should navigate to 500 page', () => {
        routerUtils.navigateTo500(mockRouter)
        
        expect(mockRouter.push).toHaveBeenCalledWith('/500')
      })
    })

    describe('refreshPage', () => {
      it('should refresh current page', () => {
        routerUtils.refreshPage()
        
        expect(window.location.reload).toHaveBeenCalled()
      })
    })
  })

  describe('Route Information', () => {
    describe('getCurrentPath', () => {
      it('should get current path from router', () => {
        const result = routerUtils.getCurrentPath(mockRouter)
        
        expect(result).toBe('/dashboard')
      })

      it('should get current path from window location if no router', () => {
        const result = routerUtils.getCurrentPath()
        
        expect(result).toBe('/dashboard')
      })
    })

    describe('getCurrentRoute', () => {
      it('should get current route from router', () => {
        const result = routerUtils.getCurrentRoute(mockRouter)
        
        expect(result).toEqual(mockRoute)
      })

      it('should return null if no router', () => {
        const result = routerUtils.getCurrentRoute()
        
        expect(result).toBeNull()
      })
    })

    describe('getCurrentRouteName', () => {
      it('should get current route name from router', () => {
        const result = routerUtils.getCurrentRouteName(mockRouter)
        
        expect(result).toBe('dashboard')
      })

      it('should return null if no router', () => {
        const result = routerUtils.getCurrentRouteName()
        
        expect(result).toBeNull()
      })
    })

    describe('getCurrentQuery', () => {
      it('should get current query parameters from router', () => {
        mockRouter.currentRoute.value.query = { page: '1', limit: '10' }
        
        const result = routerUtils.getCurrentQuery(mockRouter)
        
        expect(result).toEqual({ page: '1', limit: '10' })
      })

      it('should get current query parameters from window location if no router', () => {
        mockLocation.search = '?page=1&limit=10'
        
        const result = routerUtils.getCurrentQuery()
        
        expect(result).toEqual({ page: '1', limit: '10' })
      })
    })

    describe('getCurrentParams', () => {
      it('should get current route parameters from router', () => {
        mockRouter.currentRoute.value.params = { id: '123' }
        
        const result = routerUtils.getCurrentParams(mockRouter)
        
        expect(result).toEqual({ id: '123' })
      })

      it('should return empty object if no router', () => {
        const result = routerUtils.getCurrentParams()
        
        expect(result).toEqual({})
      })
    })

    describe('getCurrentHash', () => {
      it('should get current hash from router', () => {
        mockRouter.currentRoute.value.hash = '#section'
        
        const result = routerUtils.getCurrentHash(mockRouter)
        
        expect(result).toBe('#section')
      })

      it('should get current hash from window location if no router', () => {
        mockLocation.hash = '#section'
        
        const result = routerUtils.getCurrentHash()
        
        expect(result).toBe('#section')
      })
    })

    describe('getCurrentFullUrl', () => {
      it('should get current full URL from router', () => {
        mockRouter.currentRoute.value.fullPath = '/dashboard?page=1#section'
        
        const result = routerUtils.getCurrentFullUrl(mockRouter)
        
        expect(result).toBe('/dashboard?page=1#section')
      })

      it('should get current full URL from window location if no router', () => {
        mockLocation.pathname = '/dashboard'
        mockLocation.search = '?page=1'
        mockLocation.hash = '#section'
        
        const result = routerUtils.getCurrentFullUrl()
        
        expect(result).toBe('/dashboard?page=1#section')
      })
    })

    describe('getRouteMeta', () => {
      it('should get route meta from router', () => {
        mockRouter.currentRoute.value.meta = { requiresAuth: true, title: 'Dashboard' }
        
        const result = routerUtils.getRouteMeta(mockRouter)
        
        expect(result).toEqual({ requiresAuth: true, title: 'Dashboard' })
      })

      it('should return empty object if no router', () => {
        const result = routerUtils.getRouteMeta()
        
        expect(result).toEqual({})
      })
    })
  })

  describe('Route Validation', () => {
    describe('hasRoute', () => {
      it('should check if route exists using router', () => {
        mockRouter.hasRoute.mockReturnValue(true)
        
        const result = routerUtils.hasRoute(mockRouter, 'dashboard')
        
        expect(mockRouter.hasRoute).toHaveBeenCalledWith('dashboard')
        expect(result).toBe(true)
      })

      it('should return false if no router', () => {
        const result = routerUtils.hasRoute(undefined, 'dashboard')
        
        expect(result).toBe(false)
      })
    })

    describe('isCurrentRoute', () => {
      it('should check if current route matches path', () => {
        const result = routerUtils.isCurrentRoute(mockRouter, '/dashboard')
        
        expect(result).toBe(true)
      })

      it('should check if current route matches name', () => {
        const result = routerUtils.isCurrentRoute(mockRouter, 'dashboard')
        
        expect(result).toBe(true)
      })

      it('should return false if route does not match', () => {
        const result = routerUtils.isCurrentRoute(mockRouter, '/profile')
        
        expect(result).toBe(false)
      })

      it('should return false if no router', () => {
        const result = routerUtils.isCurrentRoute(undefined, '/dashboard')
        
        expect(result).toBe(false)
      })
    })

    describe('isRouteActive', () => {
      it('should check if route is active', () => {
        const result = routerUtils.isRouteActive(mockRouter, '/dashboard')
        
        expect(result).toBe(true)
      })

      it('should check if route is active with exact match', () => {
        const result = routerUtils.isRouteActive(mockRouter, '/dashboard', true)
        
        expect(result).toBe(true)
      })

      it('should return false if route is not active', () => {
        const result = routerUtils.isRouteActive(mockRouter, '/profile')
        
        expect(result).toBe(false)
      })
    })

    describe('requiresAuth', () => {
      it('should check if route requires authentication', () => {
        mockRouter.currentRoute.value.meta = { requiresAuth: true }
        
        const result = routerUtils.requiresAuth(mockRouter)
        
        expect(result).toBe(true)
      })

      it('should return false if route does not require authentication', () => {
        mockRouter.currentRoute.value.meta = { requiresAuth: false }
        
        const result = routerUtils.requiresAuth(mockRouter)
        
        expect(result).toBe(false)
      })

      it('should return false if no meta or router', () => {
        const result = routerUtils.requiresAuth(undefined)
        
        expect(result).toBe(false)
      })
    })

    describe('hasPermission', () => {
      it('should check if user has permission for route', () => {
        mockRouter.currentRoute.value.meta = { permissions: ['read', 'write'] }
        
        const result = routerUtils.hasPermission(mockRouter, ['read'])
        
        expect(result).toBe(true)
      })

      it('should return false if user does not have permission', () => {
        mockRouter.currentRoute.value.meta = { permissions: ['read', 'write'] }
        
        const result = routerUtils.hasPermission(mockRouter, ['delete'])
        
        expect(result).toBe(false)
      })

      it('should return false if no permissions in meta', () => {
        mockRouter.currentRoute.value.meta = {}
        
        const result = routerUtils.hasPermission(mockRouter, ['read'])
        
        expect(result).toBe(false)
      })
    })

    describe('hasRole', () => {
      it('should check if user has role for route', () => {
        mockRouter.currentRoute.value.meta = { roles: ['admin', 'user'] }
        
        const result = routerUtils.hasRole(mockRouter, ['admin'])
        
        expect(result).toBe(true)
      })

      it('should return false if user does not have role', () => {
        mockRouter.currentRoute.value.meta = { roles: ['admin', 'user'] }
        
        const result = routerUtils.hasRole(mockRouter, ['superadmin'])
        
        expect(result).toBe(false)
      })

      it('should return false if no roles in meta', () => {
        mockRouter.currentRoute.value.meta = {}
        
        const result = routerUtils.hasRole(mockRouter, ['admin'])
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Route Building', () => {
    describe('buildRoute', () => {
      it('should build route with path', () => {
        const result = routerUtils.buildRoute('/dashboard')
        
        expect(result).toBe('/dashboard')
      })

      it('should build route with path and params', () => {
        const result = routerUtils.buildRoute('/user/:id', { id: '123' })
        
        expect(result).toBe('/user/123')
      })

      it('should build route with path and query', () => {
        const result = routerUtils.buildRoute('/dashboard', undefined, { page: 1 })
        
        expect(result).toBe('/dashboard?page=1')
      })

      it('should build route with path, params, and query', () => {
        const result = routerUtils.buildRoute('/user/:id', { id: '123' }, { page: 1 })
        
        expect(result).toBe('/user/123?page=1')
      })

      it('should build route with hash', () => {
        const result = routerUtils.buildRoute('/dashboard', undefined, undefined, '#section')
        
        expect(result).toBe('/dashboard#section')
      })
    })

    describe('buildQuery', () => {
      it('should build query string from object', () => {
        const query = { page: 1, limit: 10, search: 'test' }
        
        const result = routerUtils.buildQuery(query)
        
        expect(result).toBe('page=1&limit=10&search=test')
      })

      it('should handle array values', () => {
        const query = { ids: [1, 2, 3] }
        
        const result = routerUtils.buildQuery(query)
        
        expect(result).toBe('ids=1,2,3')
      })

      it('should handle null and undefined values', () => {
        const query = { page: 1, limit: null, search: undefined }
        
        const result = routerUtils.buildQuery(query)
        
        expect(result).toBe('page=1')
      })

      it('should handle empty object', () => {
        const query = {}
        
        const result = routerUtils.buildQuery(query)
        
        expect(result).toBe('')
      })
    })

    describe('parseQuery', () => {
      it('should parse query string to object', () => {
        const queryString = 'page=1&limit=10&search=test'
        
        const result = routerUtils.parseQuery(queryString)
        
        expect(result).toEqual({ page: '1', limit: '10', search: 'test' })
      })

      it('should handle empty query string', () => {
        const queryString = ''
        
        const result = routerUtils.parseQuery(queryString)
        
        expect(result).toEqual({})
      })

      it('should handle query string without value', () => {
        const queryString = 'page&limit=10'
        
        const result = routerUtils.parseQuery(queryString)
        
        expect(result).toEqual({ page: '', limit: '10' })
      })
    })

    describe('resolveRoute', () => {
      it('should resolve route using router', () => {
        const resolvedRoute = {
          href: '/dashboard',
          route: mockRoute
        }
        
        mockRouter.resolve.mockReturnValue(resolvedRoute)
        
        const result = routerUtils.resolveRoute(mockRouter, '/dashboard')
        
        expect(mockRouter.resolve).toHaveBeenCalledWith('/dashboard')
        expect(result).toBe(resolvedRoute)
      })

      it('should return null if no router', () => {
        const result = routerUtils.resolveRoute(undefined, '/dashboard')
        
        expect(result).toBeNull()
      })
    })
  })

  describe('Route Guards', () => {
    describe('createAuthGuard', () => {
      it('should create authentication guard', () => {
        const isAuthenticated = vi.fn().mockReturnValue(true)
        const guard = routerUtils.createAuthGuard(isAuthenticated)
        
        expect(typeof guard).toBe('function')
      })
    })

    describe('createPermissionGuard', () => {
      it('should create permission guard', () => {
        const hasPermission = vi.fn().mockReturnValue(true)
        const guard = routerUtils.createPermissionGuard(hasPermission)
        
        expect(typeof guard).toBe('function')
      })
    })

    describe('createRoleGuard', () => {
      it('should create role guard', () => {
        const hasRole = vi.fn().mockReturnValue(true)
        const guard = routerUtils.createRoleGuard(hasRole)
        
        expect(typeof guard).toBe('function')
      })
    })
  })

  describe('Route History', () => {
    describe('getHistoryLength', () => {
      it('should get history length', () => {
        const result = routerUtils.getHistoryLength()
        
        expect(result).toBe(10)
      })
    })

    describe('canGoBack', () => {
      it('should return true if can go back', () => {
        mockHistory.length = 2
        
        const result = routerUtils.canGoBack()
        
        expect(result).toBe(true)
      })

      it('should return false if cannot go back', () => {
        mockHistory.length = 1
        
        const result = routerUtils.canGoBack()
        
        expect(result).toBe(false)
      })
    })

    describe('canGoForward', () => {
      it('should return true if can go forward', () => {
        // This is a simplified test - in reality, this would need more complex logic
        const result = routerUtils.canGoForward()
        
        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('Route Utilities', () => {
    describe('normalizePath', () => {
      it('should normalize path by removing trailing slash', () => {
        const result = routerUtils.normalizePath('/dashboard/')
        
        expect(result).toBe('/dashboard')
      })

      it('should normalize path by adding leading slash', () => {
        const result = routerUtils.normalizePath('dashboard')
        
        expect(result).toBe('/dashboard')
      })

      it('should handle empty path', () => {
        const result = routerUtils.normalizePath('')
        
        expect(result).toBe('/')
      })

      it('should handle root path', () => {
        const result = routerUtils.normalizePath('/')
        
        expect(result).toBe('/')
      })
    })

    describe('isExternalUrl', () => {
      it('should return true for external URL', () => {
        const result = routerUtils.isExternalUrl('https://example.com')
        
        expect(result).toBe(true)
      })

      it('should return false for internal URL', () => {
        const result = routerUtils.isExternalUrl('/dashboard')
        
        expect(result).toBe(false)
      })

      it('should return false for relative URL', () => {
        const result = routerUtils.isExternalUrl('dashboard')
        
        expect(result).toBe(false)
      })
    })

    describe('isHashLink', () => {
      it('should return true for hash link', () => {
        const result = routerUtils.isHashLink('#section')
        
        expect(result).toBe(true)
      })

      it('should return false for non-hash link', () => {
        const result = routerUtils.isHashLink('/dashboard')
        
        expect(result).toBe(false)
      })
    })

    describe('isMailtoLink', () => {
      it('should return true for mailto link', () => {
        const result = routerUtils.isMailtoLink('mailto:test@example.com')
        
        expect(result).toBe(true)
      })

      it('should return false for non-mailto link', () => {
        const result = routerUtils.isMailtoLink('/dashboard')
        
        expect(result).toBe(false)
      })
    })

    describe('isTelLink', () => {
      it('should return true for tel link', () => {
        const result = routerUtils.isTelLink('tel:+1234567890')
        
        expect(result).toBe(true)
      })

      it('should return false for non-tel link', () => {
        const result = routerUtils.isTelLink('/dashboard')
        
        expect(result).toBe(false)
      })
    })

    describe('getRouteTitle', () => {
      it('should get route title from meta', () => {
        mockRouter.currentRoute.value.meta = { title: 'Dashboard' }
        
        const result = routerUtils.getRouteTitle(mockRouter)
        
        expect(result).toBe('Dashboard')
      })

      it('should return empty string if no title in meta', () => {
        mockRouter.currentRoute.value.meta = {}
        
        const result = routerUtils.getRouteTitle(mockRouter)
        
        expect(result).toBe('')
      })

      it('should return empty string if no router', () => {
        const result = routerUtils.getRouteTitle(undefined)
        
        expect(result).toBe('')
      })
    })
  })
})