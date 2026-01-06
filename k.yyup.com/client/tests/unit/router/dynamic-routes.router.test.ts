import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateDynamicRoutes,
  getDynamicRoutesData,
  getAllRoutesData,
  validatePermissionConfig,
  checkRouteHealth,
  validateRouteComponent,
  clearRouteCache,
  preloadRoutes,
  RouteErrorHandler,
  safeNavigate,
  updateRoutePermissions,
  getFallbackRoutes
} from '@/router/dynamic-routes';
import type { RouteRecordRaw } from 'vue-router';
import { get } from '@/utils/request';

// Mock external dependencies
vi.mock('@/utils/request', () => ({
  get: vi.fn()
}));

vi.mock('@/layouts/MainLayout.vue', () => ({
  default: vi.fn(() => 'MainLayout')
}));

// Mock component imports
const mockComponent = vi.fn(() => Promise.resolve({ default: vi.fn(() => 'MockComponent') }));
vi.mock('@/pages/Login/index.vue', () => ({ default: mockComponent }));
vi.mock('@/pages/dashboard/index.vue', () => ({ default: mockComponent }));
vi.mock('@/pages/403.vue', () => ({ default: mockComponent }));
vi.mock('@/pages/404.vue', () => ({ default: mockComponent }));
vi.mock('@/components/common/ErrorFallback.vue', () => ({ default: mockComponent }));

describe('Dynamic Routes System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    clearRouteCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('API Data Fetching Functions', () => {
    it('should have getDynamicRoutesData function defined', () => {
      expect(getDynamicRoutesData).toBeDefined();
      expect(typeof getDynamicRoutesData).toBe('function');
    });

    it('should have getAllRoutesData function defined', () => {
      expect(getAllRoutesData).toBeDefined();
      expect(typeof getAllRoutesData).toBe('function');
    });

    it('should fetch dynamic routes data successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          permissions: [
            {
              id: 1,
              name: 'Dashboard',
              code: 'DASHBOARD_VIEW',
              type: 'menu',
              parent_id: null,
              path: '/dashboard',
              component: 'pages/dashboard/index.vue',
              file_path: 'pages/dashboard/index.vue',
              permission: 'DASHBOARD_VIEW',
              icon: 'Dashboard',
              sort: 1,
              status: 1
            }
          ],
          routes: [
            {
              id: 1,
              name: 'Dashboard',
              code: 'DASHBOARD_VIEW',
              path: 'dashboard',
              icon: 'Dashboard',
              sort: 1,
              children: [
                {
                  id: 2,
                  name: 'Dashboard',
                  code: 'DASHBOARD_VIEW',
                  path: 'dashboard',
                  component: 'pages/dashboard/index.vue',
                  file_path: 'pages/dashboard/index.vue',
                  permission: 'DASHBOARD_VIEW',
                  icon: 'Dashboard',
                  sort: 1,
                  type: 'menu'
                }
              ]
            }
          ]
        }
      };

      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await getDynamicRoutesData();

      expect(result).toEqual(mockResponse.data);
      expect(get).toHaveBeenCalledWith('/dynamic-permissions/dynamic-routes');
    });

    it('should handle API errors in getDynamicRoutesData', async () => {
      const mockError = new Error('API Error');
      vi.mocked(get).mockRejectedValue(mockError);

      await expect(getDynamicRoutesData()).rejects.toThrow('API Error');
    });

    it('should handle unsuccessful API response', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials'
      };

      vi.mocked(get).mockResolvedValue(mockResponse);

      await expect(getDynamicRoutesData()).rejects.toThrow('Invalid credentials');
    });

    it('should fetch all routes data successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          routes: [
            {
              path: '/dashboard',
              component: 'pages/dashboard/index.vue',
              file_path: 'pages/dashboard/index.vue',
              name: 'Dashboard',
              code: 'DASHBOARD_VIEW',
              type: 'menu',
              parent_id: null,
              icon: 'Dashboard',
              sort: 1,
              meta: {
                title: 'Dashboard',
                requiresAuth: true,
                permission: 'DASHBOARD_VIEW'
              }
            }
          ]
        }
      };

      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await getAllRoutesData();

      expect(result).toEqual(mockResponse.data);
      expect(get).toHaveBeenCalledWith('/dynamic-permissions/all-routes');
    });
  });

  describe('Dynamic Routes Generation', () => {
    it('should generate dynamic routes successfully', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/dashboard',
            component: 'pages/dashboard/index.vue',
            file_path: 'pages/dashboard/index.vue',
            name: 'Dashboard',
            code: 'DASHBOARD_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Dashboard',
            sort: 1,
            meta: {
              title: 'Dashboard',
              requiresAuth: true,
              permission: 'DASHBOARD_VIEW'
            }
          },
          {
            path: '/test',
            component: 'pages/test/index.vue',
            file_path: 'pages/test/index.vue',
            name: 'Test',
            code: 'TEST_VIEW',
            type: 'button',
            parent_id: null,
            icon: 'Test',
            sort: 2,
            meta: {
              title: 'Test',
              requiresAuth: true,
              permission: 'TEST_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);

      // Check for login route
      const loginRoute = routes.find(route => route.path === '/login');
      expect(loginRoute).toBeDefined();
      expect(loginRoute?.name).toBe('Login');

      // Check for main layout route
      const mainRoute = routes.find(route => route.path === '/');
      expect(mainRoute).toBeDefined();
      expect(mainRoute?.component).toBeDefined();
      expect(mainRoute?.children).toBeDefined();

      // Check for dashboard route
      if (mainRoute?.children) {
        const dashboardRoute = mainRoute.children.find(child => child.path === 'dashboard');
        expect(dashboardRoute).toBeDefined();
      }
    });

    it('should handle API failures and return fallback routes', async () => {
      vi.mocked(get).mockRejectedValue(new Error('API Error'));

      const routes = await generateDynamicRoutes();

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);

      // Should have basic fallback routes
      const loginRoute = routes.find(route => route.path === '/login');
      const mainRoute = routes.find(route => route.path === '/');
      const notFoundRoute = routes.find(route => route.path === '/:pathMatch(.*)*');

      expect(loginRoute).toBeDefined();
      expect(mainRoute).toBeDefined();
      expect(notFoundRoute).toBeDefined();
    });

    it('should cache generated routes', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/dashboard',
            component: 'pages/dashboard/index.vue',
            file_path: 'pages/dashboard/index.vue',
            name: 'Dashboard',
            code: 'DASHBOARD_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Dashboard',
            sort: 1,
            meta: {
              title: 'Dashboard',
              requiresAuth: true,
              permission: 'DASHBOARD_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      // First call should hit API
      const routes1 = await generateDynamicRoutes();
      expect(get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const routes2 = await generateDynamicRoutes();
      expect(get).toHaveBeenCalledTimes(1); // Should not increase

      expect(routes1).toEqual(routes2);
    });

    it('should force refresh cache when force parameter is true', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/dashboard',
            component: 'pages/dashboard/index.vue',
            file_path: 'pages/dashboard/index.vue',
            name: 'Dashboard',
            code: 'DASHBOARD_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Dashboard',
            sort: 1,
            meta: {
              title: 'Dashboard',
              requiresAuth: true,
              permission: 'DASHBOARD_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      // First call
      await generateDynamicRoutes();
      expect(get).toHaveBeenCalledTimes(1);

      // Force refresh
      await generateDynamicRoutes(true);
      expect(get).toHaveBeenCalledTimes(2);
    });

    it('should handle component loading errors gracefully', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/broken-component',
            component: 'pages/broken/NonExistent.vue',
            file_path: 'pages/broken/NonExistent.vue',
            name: 'Broken',
            code: 'BROKEN_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Broken',
            sort: 1,
            meta: {
              title: 'Broken',
              requiresAuth: true,
              permission: 'BROKEN_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      // Should not throw error, should handle gracefully
    });

    it('should add standard sub-routes to main route', async () => {
      const mockApiData = {
        routes: []
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();
      const mainRoute = routes.find(route => route.path === '/');

      expect(mainRoute).toBeDefined();
      expect(mainRoute?.children).toBeDefined();

      if (mainRoute?.children) {
        // Check for standard sub-routes
        const teacherDetailRoute = mainRoute.children.find(child => child.path === 'teacher/detail/:id');
        const studentDetailRoute = mainRoute.children.find(child => child.path === 'student/detail/:id');
        const customerDetailRoute = mainRoute.children.find(child => child.path === 'customer/detail/:id');

        expect(teacherDetailRoute).toBeDefined();
        expect(studentDetailRoute).toBeDefined();
        expect(customerDetailRoute).toBeDefined();
      }
    });

    it('should add center routes to main layout', async () => {
      const mockApiData = {
        routes: []
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();
      const mainRoute = routes.find(route => route.path === '/');

      expect(mainRoute).toBeDefined();
      expect(mainRoute?.children).toBeDefined();

      if (mainRoute?.children) {
        // Check for center routes
        const activityCenterRoute = mainRoute.children.find(child => child.path === 'centers/activity');
        const marketingCenterRoute = mainRoute.children.find(child => child.path === 'centers/marketing');
        const aiCenterRoute = mainRoute.children.find(child => child.path === 'centers/ai');

        expect(activityCenterRoute).toBeDefined();
        expect(marketingCenterRoute).toBeDefined();
        expect(aiCenterRoute).toBeDefined();
      }
    });

    it('should add finance sub-routes to main layout', async () => {
      const mockApiData = {
        routes: []
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();
      const mainRoute = routes.find(route => route.path === '/');

      expect(mainRoute).toBeDefined();
      expect(mainRoute?.children).toBeDefined();

      if (mainRoute?.children) {
        // Check for finance routes
        const feeConfigRoute = mainRoute.children.find(child => child.path === 'finance/fee-config');
        const paymentManagementRoute = mainRoute.children.find(child => child.path === 'finance/payment-management');
        const financialReportsRoute = mainRoute.children.find(child => child.path === 'finance/financial-reports');

        expect(feeConfigRoute).toBeDefined();
        expect(paymentManagementRoute).toBeDefined();
        expect(financialReportsRoute).toBeDefined();
      }
    });
  });

  describe('Route Cache Management', () => {
    it('should clear route cache', () => {
      expect(() => clearRouteCache()).not.toThrow();
    });

    it('should preload routes cache', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/dashboard',
            component: 'pages/dashboard/index.vue',
            file_path: 'pages/dashboard/index.vue',
            name: 'Dashboard',
            code: 'DASHBOARD_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Dashboard',
            sort: 1,
            meta: {
              title: 'Dashboard',
              requiresAuth: true,
              permission: 'DASHBOARD_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      await expect(preloadRoutes()).resolves.not.toThrow();
      expect(get).toHaveBeenCalled();
    });

    it('should handle preload routes errors gracefully', async () => {
      vi.mocked(get).mockRejectedValue(new Error('Preload failed'));

      await expect(preloadRoutes()).resolves.not.toThrow();
    });
  });

  describe('Route Error Handling', () => {
    it('should handle route errors with RouteErrorHandler', () => {
      const mockError = new Error('Route error');
      const context = 'test-context';

      expect(() => RouteErrorHandler.handleRouteError(mockError, context)).not.toThrow();
    });

    it('should enable fallback mode after multiple errors', () => {
      const mockError = new Error('Route error');

      // Trigger multiple errors
      for (let i = 0; i < 5; i++) {
        RouteErrorHandler.handleRouteError(mockError, 'test');
      }

      // Should enable fallback mode
      expect(() => RouteErrorHandler.handleRouteError(mockError, 'test')).not.toThrow();
    });

    it('should reset error count', () => {
      RouteErrorHandler.resetErrorCount();
      expect(() => RouteErrorHandler.handleRouteError(new Error('test'), 'test')).not.toThrow();
    });

    it('should provide safe navigation function', () => {
      const mockRouter = {
        push: vi.fn()
      };

      const path = '/test-path';
      const fallbackPath = '/fallback';

      safeNavigate(mockRouter, path, fallbackPath);

      expect(mockRouter.push).toHaveBeenCalledWith(path);
    });

    it('should handle navigation errors in safeNavigate', async () => {
      const mockError = new Error('Navigation failed');
      const mockRouter = {
        push: vi.fn().mockRejectedValue(mockError)
      };

      const path = '/test-path';
      const fallbackPath = '/fallback';

      await safeNavigate(mockRouter, path, fallbackPath);

      expect(mockRouter.push).toHaveBeenCalledWith(path);
      expect(mockRouter.push).toHaveBeenCalledWith(fallbackPath);
    });
  });

  describe('Route Validation Functions', () => {
    it('should validate permission configuration', () => {
      const mockRoutes: RouteRecordRaw[] = [
        {
          path: '/test',
          name: 'Test',
          component: mockComponent,
          meta: {
            title: 'Test',
            requiresAuth: true,
            permission: 'TEST_VIEW'
          }
        }
      ];

      const result = validatePermissionConfig(mockRoutes);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should detect permission naming issues', () => {
      const mockRoutes: RouteRecordRaw[] = [
        {
          path: '/test',
          name: 'Test',
          component: mockComponent,
          meta: {
            title: 'Test',
            requiresAuth: true,
            permission: 'invalid-permission-name' // Invalid naming
          }
        }
      ];

      const result = validatePermissionConfig(mockRoutes);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toContain('不符合命名规范');
    });

    it('should provide recommendations for hidden routes', () => {
      const mockRoutes: RouteRecordRaw[] = [
        {
          path: '/hidden',
          name: 'Hidden',
          component: mockComponent,
          meta: {
            title: 'Hidden',
            requiresAuth: true,
            hideInMenu: true
            // Missing permission
          }
        }
      ];

      const result = validatePermissionConfig(mockRoutes);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('建议配置权限');
    });

    it('should check route health', () => {
      const mockRoutes: RouteRecordRaw[] = [
        {
          path: '/healthy',
          name: 'Healthy',
          component: mockComponent
        },
        {
          path: '/unhealthy',
          name: 'Unhealthy'
          // Missing component
        }
      ];

      const result = checkRouteHealth(mockRoutes);

      expect(result).toHaveProperty('healthy');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('totalRoutes');
      expect(result).toHaveProperty('validRoutes');
      expect(typeof result.healthy).toBe('boolean');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(typeof result.totalRoutes).toBe('number');
      expect(typeof result.validRoutes).toBe('number');
      expect(result.healthy).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should validate route components', () => {
      // Valid component paths
      expect(validateRouteComponent('pages/dashboard/index.vue')).toBe(true);
      expect(validateRouteComponent('pages/test/TestComponent.vue')).toBe(true);
      expect(validateRouteComponent('pages/principal/basic-info')).toBe(true);

      // Invalid component paths
      expect(validateRouteComponent('invalid-path')).toBe(false);
      expect(validateRouteComponent('')).toBe(false);
      expect(validateRouteComponent('pages/invalid')).toBe(false);
    });
  });

  describe('Route Permission Updates', () => {
    it('should update route permissions', () => {
      const mockRoutes: RouteRecordRaw[] = [
        {
          path: '/test',
          name: 'Test',
          component: mockComponent,
          meta: {
            title: 'Test',
            requiresAuth: true
            // Missing permission
          }
        },
        {
          path: '/nested',
          name: 'Nested',
          component: mockComponent,
          children: [
            {
              path: 'child',
              name: 'Child',
              component: mockComponent,
              meta: {
                title: 'Child',
                requiresAuth: true
                // Missing permission
              }
            }
          ]
        }
      ];

      const updatedRoutes = updateRoutePermissions(mockRoutes);

      expect(updatedRoutes).toHaveLength(mockRoutes.length);

      // Check that permission was added
      const testRoute = updatedRoutes.find(route => route.path === '/test');
      expect(testRoute?.meta?.permission).toBe('_TEST_VIEW');

      // Check nested route
      const nestedRoute = updatedRoutes.find(route => route.path === '/nested');
      const childRoute = nestedRoute?.children?.find(child => child.path === 'child');
      expect(childRoute?.meta?.permission).toBe('_CHILD_VIEW');
    });

    it('should preserve existing permissions', () => {
      const mockRoutes: RouteRecordRaw[] = [
        {
          path: '/test',
          name: 'Test',
          component: mockComponent,
          meta: {
            title: 'Test',
            requiresAuth: true,
            permission: 'EXISTING_PERMISSION'
          }
        }
      ];

      const updatedRoutes = updateRoutePermissions(mockRoutes);
      const testRoute = updatedRoutes.find(route => route.path === '/test');

      expect(testRoute?.meta?.permission).toBe('EXISTING_PERMISSION');
    });
  });

  describe('Fallback Routes', () => {
    it('should generate fallback routes', () => {
      const fallbackRoutes = getFallbackRoutes();

      expect(fallbackRoutes).toBeDefined();
      expect(Array.isArray(fallbackRoutes)).toBe(true);
      expect(fallbackRoutes.length).toBeGreaterThan(0);

      // Check for essential fallback routes
      const loginRoute = fallbackRoutes.find(route => route.path === '/login');
      const mainRoute = fallbackRoutes.find(route => route.path === '/');
      const forbiddenRoute = fallbackRoutes.find(route => route.path === '/403');
      const notFoundRoute = fallbackRoutes.find(route => route.path === '/:pathMatch(.*)*');

      expect(loginRoute).toBeDefined();
      expect(mainRoute).toBeDefined();
      expect(forbiddenRoute).toBeDefined();
      expect(notFoundRoute).toBeDefined();

      // Check main route has dashboard and system status
      if (mainRoute?.children) {
        const dashboardRoute = mainRoute.children.find(child => child.path === 'dashboard');
        const systemStatusRoute = mainRoute.children.find(child => child.path === 'system-status');

        expect(dashboardRoute).toBeDefined();
        expect(systemStatusRoute).toBeDefined();
      }
    });

    it('should handle component loading errors in fallback routes', () => {
      const fallbackRoutes = getFallbackRoutes();

      fallbackRoutes.forEach(route => {
        if (route.component) {
          expect(typeof route.component).toBe('function');
        }
        if (route.children) {
          route.children.forEach(child => {
            if (child.component) {
              expect(typeof child.component).toBe('function');
            }
          });
        }
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should sort routes by sort order', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/first',
            component: 'pages/first/index.vue',
            file_path: 'pages/first/index.vue',
            name: 'First',
            code: 'FIRST_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'First',
            sort: 1,
            meta: {
              title: 'First',
              requiresAuth: true,
              permission: 'FIRST_VIEW'
            }
          },
          {
            path: '/second',
            component: 'pages/second/index.vue',
            file_path: 'pages/second/index.vue',
            name: 'Second',
            code: 'SECOND_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Second',
            sort: 2,
            meta: {
              title: 'Second',
              requiresAuth: true,
              permission: 'SECOND_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();
      const mainRoute = routes.find(route => route.path === '/');

      if (mainRoute?.children) {
        const firstRoute = mainRoute.children.find(child => child.path === 'first');
        const secondRoute = mainRoute.children.find(child => child.path === 'second');

        expect(firstRoute).toBeDefined();
        expect(secondRoute).toBeDefined();

        // Check that routes are sorted by sort order
        const firstIndex = mainRoute.children.findIndex(child => child.path === 'first');
        const secondIndex = mainRoute.children.findIndex(child => child.path === 'second');

        expect(firstIndex).toBeLessThan(secondIndex);
      }
    });

    it('should handle performance warnings for slow route generation', async () => {
      const mockApiData = {
        routes: []
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      // Mock performance.now to simulate slow generation
      let callCount = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        if (callCount === 0) {
          callCount++;
          return 0; // Start time
        } else {
          return 1500; // End time (1.5 seconds)
        }
      });

      const consoleSpy = vi.spyOn(console, 'warn');
      
      await generateDynamicRoutes();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('路由生成耗时较长')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Component Map', () => {
    it('should use predefined component mappings', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/principal/basic-info',
            component: 'pages/principal/basic-info',
            file_path: 'pages/principal/basic-info',
            name: 'BasicInfo',
            code: 'BASIC_INFO_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Info',
            sort: 1,
            meta: {
              title: 'Basic Info',
              requiresAuth: true,
              permission: 'BASIC_INFO_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();
      const mainRoute = routes.find(route => route.path === '/');

      if (mainRoute?.children) {
        const basicInfoRoute = mainRoute.children.find(child => child.path === 'principal/basic-info');
        expect(basicInfoRoute).toBeDefined();
        expect(basicInfoRoute?.component).toBeDefined();
      }
    });

    it('should handle dynamic component imports for unknown paths', async () => {
      const mockApiData = {
        routes: [
          {
            path: '/custom-component',
            component: 'pages/custom/CustomComponent.vue',
            file_path: 'pages/custom/CustomComponent.vue',
            name: 'CustomComponent',
            code: 'CUSTOM_VIEW',
            type: 'menu',
            parent_id: null,
            icon: 'Custom',
            sort: 1,
            meta: {
              title: 'Custom Component',
              requiresAuth: true,
              permission: 'CUSTOM_VIEW'
            }
          }
        ]
      };

      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();
      const mainRoute = routes.find(route => route.path === '/');

      if (mainRoute?.children) {
        const customRoute = mainRoute.children.find(child => child.path === 'custom-component');
        expect(customRoute).toBeDefined();
        expect(customRoute?.component).toBeDefined();
      }
    });
  });
});