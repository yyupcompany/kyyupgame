import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import router, { loadDynamicRoutes } from '@/router/index';
import { optimizedRoutes } from '@/router/optimized-routes';
import { generateDynamicRoutes } from '@/router/dynamic-routes';
import { usePermissionsStore } from '@/stores/permissions';
import { createDeviceRedirectMiddleware } from '@/utils/device-detection';
import { routerConfig, isAdminUser, isWhiteListRoute, getMockUserData } from '@/config/router';
import { currentEnvironment } from '@/config/environment';

// Mock external dependencies
vi.mock('@/router/dynamic-routes', () => ({
  generateDynamicRoutes: vi.fn(),
  loadDynamicRoutes: vi.fn()
}));

vi.mock('@/router/optimized-routes', () => ({
  optimizedRoutes: [
    {
      path: '/login',
      name: 'Login',
      component: vi.fn(),
      meta: {
        title: '用户登录',
        requiresAuth: false,
        hideInMenu: true,
        preload: true
      }
    },
    {
      path: '/',
      component: vi.fn(),
      redirect: '/dashboard',
      meta: { preload: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: vi.fn(),
          meta: {
            title: '仪表板',
            icon: 'Dashboard',
            requiresAuth: true,
            preload: true,
            priority: 'high'
          }
        }
      ]
    }
  ]
}));

vi.mock('@/stores/permissions', () => ({
  usePermissionsStore: vi.fn(() => ({
    hasMenuItems: true,
    hasPermissions: true,
    isAdmin: false,
    hasPermission: vi.fn(() => true),
    hasPermissionCode: vi.fn(() => true),
    hasRole: vi.fn(() => true),
    checkPagePermission: vi.fn(() => Promise.resolve(true)),
    initializePermissions: vi.fn(() => Promise.resolve())
  }))
}));

vi.mock('@/utils/device-detection', () => ({
  createDeviceRedirectMiddleware: vi.fn(() => vi.fn())
}));

vi.mock('@/config/router', () => ({
  routerConfig: {
    redirects: {
      loginPath: '/login',
      homePath: '/dashboard'
    },
    whiteList: ['/login', '/register', '/404', '/403'],
    adminRoles: ['admin', 'superadmin']
  },
  isAdminUser: vi.fn(() => false),
  isWhiteListRoute: vi.fn(() => false),
  getMockUserData: vi.fn(() => ({
    token: 'mock-token',
    userInfo: {
      id: 1,
      username: 'testuser',
      role: 'user',
      isAdmin: false
    }
  }))
}));

vi.mock('@/config/environment', () => ({
  currentEnvironment: 'development'
}));

describe('Router Index Configuration', () => {
  let mockRouter: any;
  let mockPermissionsStore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock permissions store
    mockPermissionsStore = {
      hasMenuItems: true,
      hasPermissions: true,
      isAdmin: false,
      hasPermission: vi.fn(() => true),
      hasPermissionCode: vi.fn(() => true),
      hasRole: vi.fn(() => true),
      checkPagePermission: vi.fn(() => Promise.resolve(true)),
      initializePermissions: vi.fn(() => Promise.resolve())
    };
    
    vi.mocked(usePermissionsStore).mockReturnValue(mockPermissionsStore);
    
    // Mock device detection middleware
    const mockDeviceMiddleware = vi.fn();
    vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);
    
    // Mock dynamic routes
    vi.mocked(generateDynamicRoutes).mockResolvedValue([
      {
        path: '/dynamic-test',
        name: 'DynamicTest',
        component: vi.fn(),
        meta: {
          title: 'Dynamic Test',
          requiresAuth: true
        }
      }
    ]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Router Instance Creation', () => {
    it('should create router instance with correct configuration', () => {
      expect(router).toBeDefined();
      expect(router).toHaveProperty('options');
      expect(router.options.history).toBeDefined();
      expect(router.options.routes).toBeDefined();
      expect(Array.isArray(router.options.routes)).toBe(true);
    });

    it('should use web history mode', () => {
      expect(router.options.history).toBeDefined();
      expect(router.options.history.type).toBe('history');
    });

    it('should have scroll behavior configuration', () => {
      const scrollBehavior = router.options.scrollBehavior;
      expect(typeof scrollBehavior).toBe('function');
      
      // Test saved position behavior
      const savedPosition = { x: 100, y: 200 };
      const result1 = scrollBehavior({}, {}, savedPosition);
      expect(result1).toEqual(savedPosition);
      
      // Test default behavior (scroll to top)
      const result2 = scrollBehavior({}, {}, null);
      expect(result2).toEqual({ top: 0 });
    });

    it('should initialize with optimized routes', () => {
      const routes = router.getRoutes();
      expect(routes.length).toBeGreaterThan(0);
      
      const loginRoute = routes.find(r => r.path === '/login');
      expect(loginRoute).toBeDefined();
      expect(loginRoute?.name).toBe('Login');
    });
  });

  describe('Route Guards and Navigation', () => {
    let mockTo: any;
    let mockFrom: any;
    let mockNext: any;

    beforeEach(() => {
      mockTo = {
        path: '/dashboard',
        fullPath: '/dashboard',
        name: 'Dashboard',
        meta: {
          title: '仪表板',
          requiresAuth: true,
          permission: 'DASHBOARD_VIEW'
        },
        matched: [],
        params: {},
        query: {},
        hash: ''
      };

      mockFrom = {
        path: '/login',
        fullPath: '/login',
        name: 'Login',
        meta: {},
        matched: [],
        params: {},
        query: {},
        hash: ''
      };

      mockNext = vi.fn();
    });

    it('should handle device detection middleware', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null); // Continue normal flow
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockDeviceMiddleware).toHaveBeenCalled();
      expect(mockDeviceMiddleware).toHaveBeenCalledWith(mockTo, mockFrom, expect.any(Function));
    });

    it('should handle device redirect when middleware returns redirect path', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback({ path: '/mobile-redirect' }); // Trigger redirect
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalledWith({ path: '/mobile-redirect' });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should set page title when route has meta title', async () => {
      const originalTitle = document.title;
      
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null); // Continue normal flow
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(document.title).toBe('仪表板 - 幼儿园招生管理系统');
      
      // Restore original title
      document.title = originalTitle;
    });

    it('should allow access to whitelist routes without authentication', async () => {
      mockTo.path = '/login';
      mockTo.meta = { requiresAuth: false };
      
      vi.mocked(isWhiteListRoute).mockReturnValue(true);

      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(); // Called without arguments
    });

    it('should handle NotFound route and attempt to load dynamic routes', async () => {
      mockTo.name = 'NotFound';
      mockTo.path = '/unknown-path';

      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      mockPermissionsStore.hasMenuItems = false;

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockPermissionsStore.initializePermissions).toHaveBeenCalled();
      expect(vi.mocked(generateDynamicRoutes)).toHaveBeenCalled();
    });

    it('should handle dynamic route loading timeout', async () => {
      mockTo.name = 'NotFound';
      mockTo.path = '/unknown-path';

      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      mockPermissionsStore.hasMenuItems = false;
      mockPermissionsStore.initializePermissions.mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 6000)); // Simulate timeout
      });

      // Mock setTimeout to trigger timeout immediately
      vi.useFakeTimers();
      
      const promise = router.beforeEach(mockTo, mockFrom, mockNext);
      
      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(5000);
      
      await promise;

      expect(mockNext).toHaveBeenCalledWith('/404');
      
      vi.useRealTimers();
    });

    it('should check page permissions for authenticated routes', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      // Mock localStorage token
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'kindergarten_token') return 'mock-token';
        if (key === 'kindergarten_user_info') return JSON.stringify({
          id: 1,
          username: 'testuser',
          role: 'user'
        });
        return null;
      });

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockPermissionsStore.checkPagePermission).toHaveBeenCalledWith(
        mockTo.path,
        mockTo.meta?.permission
      );
    });

    it('should redirect to 403 when page permission check fails', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      mockPermissionsStore.checkPagePermission.mockResolvedValue(false);

      // Mock localStorage token
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'kindergarten_token') return 'mock-token';
        if (key === 'kindergarten_user_info') return JSON.stringify({
          id: 1,
          username: 'testuser',
          role: 'user'
        });
        return null;
      });

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalledWith('/403');
    });

    it('should handle admin user access', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      vi.mocked(isAdminUser).mockReturnValue(true);
      mockPermissionsStore.isAdmin = true;

      // Mock localStorage token
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'kindergarten_token') return 'mock-token';
        if (key === 'kindergarten_user_info') return JSON.stringify({
          id: 1,
          username: 'admin',
          role: 'admin',
          isAdmin: true
        });
        return null;
      });

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(); // Admin should have access
    });

    it('should redirect to login when no token is found', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      // Mock no token
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
    });

    it('should redirect to home when accessing login page while authenticated', async () => {
      mockTo.path = '/login';

      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      // Mock token
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'kindergarten_token') return 'mock-token';
        if (key === 'kindergarten_user_info') return JSON.stringify({
          id: 1,
          username: 'testuser',
          role: 'user'
        });
        return null;
      });

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalledWith({ path: '/dashboard' });
    });

    it('should handle development environment auto-login', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      vi.mocked(currentEnvironment, 'get').mockReturnValue('development');
      vi.mocked(getMockUserData).mockReturnValue({
        token: 'dev-mock-token',
        userInfo: {
          id: 1,
          username: 'devuser',
          role: 'user'
        }
      });

      // Mock no token initially
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
      const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockSetItem).toHaveBeenCalledWith('kindergarten_token', 'dev-mock-token');
      expect(mockSetItem).toHaveBeenCalledWith('token', 'dev-mock-token');
      expect(mockSetItem).toHaveBeenCalledWith('auth_token', 'dev-mock-token');
    });

    it('should handle route guard errors gracefully', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      // Simulate an error in permission checking
      mockPermissionsStore.checkPagePermission.mockRejectedValue(new Error('Permission check failed'));

      // Mock token
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'kindergarten_token') return 'mock-token';
        if (key === 'kindergarten_user_info') return JSON.stringify({
          id: 1,
          username: 'testuser',
          role: 'user'
        });
        return null;
      });

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalledWith('/403');
    });

    it('should check final route matching after dynamic loading', async () => {
      const mockDeviceMiddleware = vi.fn((to, from, callback) => {
        callback(null);
      });
      vi.mocked(createDeviceRedirectMiddleware).mockReturnValue(mockDeviceMiddleware);

      // Mock route with no matches
      mockTo.matched = [];

      // Mock token
      vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'kindergarten_token') return 'mock-token';
        if (key === 'kindergarten_user_info') return JSON.stringify({
          id: 1,
          username: 'testuser',
          role: 'user'
        });
        return null;
      });

      await router.beforeEach(mockTo, mockFrom, mockNext);

      expect(mockNext).toHaveBeenCalledWith('/404');
    });
  });

  describe('After Each Hook', () => {
    it('should call afterEach hook after navigation', () => {
      const mockTo = { path: '/dashboard' };
      const mockFrom = { path: '/login' };
      
      // Mock console.log to verify hook execution
      const consoleSpy = vi.spyOn(console, 'log');
      
      router.afterEach(mockTo, mockFrom);
      
      expect(consoleSpy).toHaveBeenCalledWith('导航完成: /login -> /dashboard');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Dynamic Routes Loading', () => {
    it('should export loadDynamicRoutes function', () => {
      expect(loadDynamicRoutes).toBeDefined();
      expect(typeof loadDynamicRoutes).toBe('function');
    });

    it('should call generateDynamicRoutes when loading dynamic routes', async () => {
      await loadDynamicRoutes();
      
      expect(vi.mocked(generateDynamicRoutes)).toHaveBeenCalled();
    });

    it('should handle dynamic routes loading errors gracefully', async () => {
      vi.mocked(generateDynamicRoutes).mockRejectedValue(new Error('Dynamic routes loading failed'));
      
      await expect(loadDynamicRoutes()).resolves.not.toThrow();
    });
  });

  describe('Route Configuration Validation', () => {
    it('should have all required route properties', () => {
      const routes = router.getRoutes();
      
      routes.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(typeof route.path).toBe('string');
        
        if (route.name) {
          expect(typeof route.name).toBe('string' || 'symbol');
        }
        
        if (route.meta) {
          expect(typeof route.meta).toBe('object');
        }
      });
    });

    it('should have proper meta configuration for protected routes', () => {
      const routes = router.getRoutes();
      const protectedRoutes = routes.filter(route => route.meta?.requiresAuth === true);
      
      protectedRoutes.forEach(route => {
        expect(route.meta).toHaveProperty('requiresAuth', true);
        expect(route.meta).toHaveProperty('title');
        expect(typeof route.meta.title).toBe('string');
      });
    });

    it('should have proper configuration for public routes', () => {
      const routes = router.getRoutes();
      const publicRoutes = routes.filter(route => route.meta?.requiresAuth === false);
      
      publicRoutes.forEach(route => {
        expect(route.meta).toHaveProperty('requiresAuth', false);
        expect(route.meta).toHaveProperty('title');
      });
    });
  });

  describe('Router Integration', () => {
    it('should be compatible with Vue Router API', () => {
      expect(router).toHaveProperty('push');
      expect(router).toHaveProperty('replace');
      expect(router).toHaveProperty('go');
      expect(router).toHaveProperty('back');
      expect(router).toHaveProperty('forward');
      expect(router).toHaveProperty('addRoute');
      expect(router).toHaveProperty('removeRoute');
      expect(router).toHaveProperty('hasRoute');
      expect(router).toHaveProperty('getRoutes');
      expect(router).toHaveProperty('resolve');
      
      expect(typeof router.push).toBe('function');
      expect(typeof router.replace).toBe('function');
      expect(typeof router.go).toBe('function');
      expect(typeof router.back).toBe('function');
      expect(typeof router.forward).toBe('function');
      expect(typeof router.addRoute).toBe('function');
      expect(typeof router.removeRoute).toBe('function');
      expect(typeof router.hasRoute).toBe('function');
      expect(typeof router.getRoutes).toBe('function');
      expect(typeof router.resolve).toBe('function');
    });

    it('should handle route resolution', () => {
      const resolved = router.resolve('/dashboard');
      
      expect(resolved).toHaveProperty('href');
      expect(resolved).toHaveProperty('route');
      expect(resolved).toHaveProperty('matched');
      expect(Array.isArray(resolved.matched)).toBe(true);
    });
  });
});