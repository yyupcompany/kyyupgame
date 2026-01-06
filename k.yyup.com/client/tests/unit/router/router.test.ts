import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest';
import { optimizedRoutes } from '@/router/optimized-routes';
import {
  generateDynamicRoutes,
  getDynamicRoutesData,
  getAllRoutesData,
  validatePermissionConfig,
  checkRouteHealth,
  validateRouteComponent
} from '@/router/dynamic-routes';

// Mock API requests
vi.mock('@/utils/request', () => ({
  get: vi.fn()
}));

describe('Dynamic Router System', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('Static Routes (Optimized)', () => {
    it('should have optimized routes defined', () => {
      expect(optimizedRoutes).toBeDefined();
      expect(Array.isArray(optimizedRoutes)).toBe(true);
      expect(optimizedRoutes.length).toBeGreaterThan(0);
    });

    it('should have key routes defined in optimized routes', () => {
      const loginRoute = optimizedRoutes.find(route => route.path === '/login');
      const rootRoute = optimizedRoutes.find(route => route.path === '/');

      // Check login route exists and has correct structure
      expect(loginRoute).toBeDefined();
      if (loginRoute) {
        expect(loginRoute).toHaveProperty('name', 'Login');
        expect(loginRoute).toHaveProperty('component');
        expect(loginRoute.meta?.requiresAuth).toBe(false);
      }

      // Check root route exists and has correct structure
      expect(rootRoute).toBeDefined();
      if (rootRoute) {
        expect(rootRoute).toHaveProperty('component');
        expect(rootRoute).toHaveProperty('redirect', '/dashboard');
        expect(rootRoute).toHaveProperty('children');
        expect(Array.isArray(rootRoute.children)).toBe(true);
      }
    });

    it('should have dashboard route in children', () => {
      const rootRoute = optimizedRoutes.find(route => route.path === '/');

      if (rootRoute && rootRoute.children) {
        const dashboardRoute = rootRoute.children.find(route => route.path === 'dashboard');

        expect(dashboardRoute).toBeDefined();
        if (dashboardRoute) {
          expect(dashboardRoute).toHaveProperty('name', 'Dashboard');
          expect(dashboardRoute).toHaveProperty('component');
          expect(dashboardRoute.meta?.requiresAuth).toBe(true);
        }
      }
    });
  });

  describe('Dynamic Routes Generation', () => {
    it('should have dynamic routes function defined', () => {
      expect(generateDynamicRoutes).toBeDefined();
      expect(typeof generateDynamicRoutes).toBe('function');
    });

    it('should have API data fetching functions defined', () => {
      expect(getDynamicRoutesData).toBeDefined();
      expect(typeof getDynamicRoutesData).toBe('function');

      expect(getAllRoutesData).toBeDefined();
      expect(typeof getAllRoutesData).toBe('function');
    });

    it('should generate fallback routes when API fails', async () => {
      // Mock API failure
      const { get } = await import('@/utils/request');
      vi.mocked(get).mockRejectedValue(new Error('API Error'));

      const routes = await generateDynamicRoutes();

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);

      // Should have basic routes even when API fails
      const loginRoute = routes.find(route => route.path === '/login');
      const rootRoute = routes.find(route => route.path === '/');

      expect(loginRoute).toBeDefined();
      expect(rootRoute).toBeDefined();
    });

    it('should generate routes from API data successfully', async () => {
      // Mock successful API response
      const mockApiData = {
        routes: [
          {
            path: '/test',
            component: 'pages/test/index.vue',
            file_path: 'pages/test/index.vue',
            name: '测试页面',
            code: 'TEST_PAGE',
            type: 'menu',
            parent_id: null,
            icon: 'Test',
            sort: 1,
            meta: {
              title: '测试页面',
              requiresAuth: true,
              permission: 'TEST_VIEW'
            }
          }
        ]
      };

      const { get } = await import('@/utils/request');
      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockApiData
      });

      const routes = await generateDynamicRoutes();

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);

      // Should have login route
      const loginRoute = routes.find(route => route.path === '/login');
      expect(loginRoute).toBeDefined();

      // Should have main layout route with children
      const rootRoute = routes.find(route => route.path === '/');
      expect(rootRoute).toBeDefined();
      expect(rootRoute?.children).toBeDefined();
      expect(Array.isArray(rootRoute?.children)).toBe(true);
    });
  });

  describe('Route Validation', () => {
    it('should validate permission configuration', () => {
      const mockRoutes = [
        {
          path: '/test',
          name: 'Test',
          component: () => Promise.resolve({}),
          meta: {
            title: '测试',
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

    it('should check route health', () => {
      const mockRoutes = [
        {
          path: '/test',
          name: 'Test',
          component: () => Promise.resolve({})
        },
        {
          path: '/invalid',
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
    });

    it('should validate route components', () => {
      // Test valid component paths
      expect(validateRouteComponent('pages/dashboard/index.vue')).toBe(true);
      expect(validateRouteComponent('pages/test/TestComponent.vue')).toBe(true);

      // Test invalid component paths
      expect(validateRouteComponent('invalid-path')).toBe(false);
      expect(validateRouteComponent('')).toBe(false);
    });
  });

  describe('Route Meta Configuration', () => {
    it('should have proper route meta configuration in optimized routes', () => {
      const routesWithMeta = optimizedRoutes.filter(route => route.meta);

      expect(routesWithMeta.length).toBeGreaterThan(0);

      routesWithMeta.forEach(route => {
        if (route.meta) {
          expect(route.meta).toHaveProperty('title');
          expect(typeof route.meta.title).toBe('string');
          expect(route.meta).toHaveProperty('requiresAuth');
          expect(typeof route.meta.requiresAuth).toBe('boolean');
        }
      });
    });

    it('should handle center routes configuration', () => {
      const rootRoute = optimizedRoutes.find(route => route.path === '/');

      if (rootRoute && rootRoute.children) {
        // Look for center routes (like ActivityCenter, MarketingCenter, etc.)
        const centerRoutes = rootRoute.children.filter(route =>
          route.path && route.path.includes('centers/')
        );

        // Should have some center routes defined
        expect(centerRoutes.length).toBeGreaterThan(0);

        centerRoutes.forEach(centerRoute => {
          expect(centerRoute.meta).toBeDefined();
          expect(centerRoute.meta?.title).toBeDefined();
          expect(centerRoute.meta?.requiresAuth).toBe(true);
          expect(centerRoute.meta?.permission).toBeDefined();
        });
      }
    });
  });
});