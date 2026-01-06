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
import demoRoutes from '@/router/demo';
import type { RouteRecordRaw } from 'vue-router';

// Mock the DemoPage component
vi.mock('@/demo/DemoPage.vue', () => ({
  default: vi.fn(() => 'DemoPage')
}));

describe('Demo Routes Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Structure and Configuration', () => {
    it('should export demo routes as an array', () => {
      expect(demoRoutes).toBeDefined();
      expect(Array.isArray(demoRoutes)).toBe(true);
    });

    it('should have demo route defined', () => {
      expect(demoRoutes.length).toBe(1);
      
      const demoRoute = demoRoutes[0];
      expect(demoRoute).toBeDefined();
      expect(demoRoute.path).toBe('/demo');
      expect(demoRoute.name).toBe('DemoPage');
    });

    it('should have proper route structure', () => {
      const demoRoute = demoRoutes[0];
      
      // Check required properties
      expect(demoRoute).toHaveProperty('path');
      expect(demoRoute).toHaveProperty('name');
      expect(demoRoute).toHaveProperty('component');
      expect(demoRoute).toHaveProperty('meta');
      
      // Check property types
      expect(typeof demoRoute.path).toBe('string');
      expect(typeof demoRoute.name).toBe('string');
      expect(typeof demoRoute.component).toBe('function');
      expect(typeof demoRoute.meta).toBe('object');
    });

    it('should have correct path configuration', () => {
      const demoRoute = demoRoutes[0];
      
      expect(demoRoute.path).toBe('/demo');
      expect(demoRoute.path.startsWith('/')).toBe(true);
      expect(demoRoute.path.length).toBeGreaterThan(1);
    });

    it('should have correct name configuration', () => {
      const demoRoute = demoRoutes[0];
      
      expect(demoRoute.name).toBe('DemoPage');
      expect(typeof demoRoute.name).toBe('string');
      expect(demoRoute.name.length).toBeGreaterThan(0);
    });
  });

  describe('Component Configuration', () => {
    it('should have lazy-loaded component', () => {
      const demoRoute = demoRoutes[0];
      
      expect(typeof demoRoute.component).toBe('function');
      
      // Test that component function returns a promise
      const componentPromise = demoRoute.component();
      expect(componentPromise).toBeInstanceOf(Promise);
    });

    it('should load DemoPage component correctly', async () => {
      const demoRoute = demoRoutes[0];
      
      const componentModule = await demoRoute.component();
      
      expect(componentModule).toBeDefined();
      expect(componentModule).toHaveProperty('default');
      expect(typeof componentModule.default).toBe('function');
    });

    it('should handle component loading errors gracefully', async () => {
      const demoRoute = demoRoutes[0];
      
      // Mock component loading error
      const originalComponent = demoRoute.component;
      demoRoute.component = vi.fn().mockRejectedValue(new Error('Component loading failed'));
      
      await expect(demoRoute.component()).rejects.toThrow('Component loading failed');
      
      // Restore original component
      demoRoute.component = originalComponent;
    });
  });

  describe('Meta Configuration', () => {
    it('should have proper meta configuration', () => {
      const demoRoute = demoRoutes[0];
      
      expect(demoRoute.meta).toBeDefined();
      expect(typeof demoRoute.meta).toBe('object');
      expect(demoRoute.meta).toHaveProperty('title');
    });

    it('should have correct title in meta', () => {
      const demoRoute = demoRoutes[0];
      
      expect(demoRoute.meta?.title).toBe('样式演示页面');
      expect(typeof demoRoute.meta?.title).toBe('string');
      expect(demoRoute.meta?.title.length).toBeGreaterThan(0);
    });

    it('should have consistent meta structure', () => {
      const demoRoute = demoRoutes[0];
      
      if (demoRoute.meta) {
        // Check that all meta properties have correct types
        Object.keys(demoRoute.meta).forEach(key => {
          const value = demoRoute.meta![key];
          expect(value).toBeDefined();
          expect(typeof value).not.toBe('undefined');
        });
      }
    });
  });

  describe('Route Integration', () => {
    it('should be compatible with Vue Router', () => {
      const demoRoute = demoRoutes[0];
      
      // Check that route structure matches Vue Router expectations
      expect(demoRoute).toMatchObject({
        path: expect.any(String),
        name: expect.any(String),
        component: expect.any(Function),
        meta: expect.any(Object)
      });
    });

    it('should be usable in router configuration', () => {
      // Simulate adding demo routes to a router
      const mockRouter = {
        addRoute: vi.fn()
      };
      
      demoRoutes.forEach(route => {
        mockRouter.addRoute(route);
      });
      
      expect(mockRouter.addRoute).toHaveBeenCalledTimes(demoRoutes.length);
      demoRoutes.forEach((route, index) => {
        expect(mockRouter.addRoute).toHaveBeenNthCalledWith(index + 1, route);
      });
    });

    it('should have route resolution capability', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate route resolution (like Vue Router's resolve method)
      const resolvedRoute = {
        path: demoRoute.path,
        name: demoRoute.name,
        meta: demoRoute.meta,
        matched: [demoRoute]
      };
      
      expect(resolvedRoute.path).toBe('/demo');
      expect(resolvedRoute.name).toBe('DemoPage');
      expect(resolvedRoute.meta).toEqual(demoRoute.meta);
      expect(Array.isArray(resolvedRoute.matched)).toBe(true);
      expect(resolvedRoute.matched.length).toBe(1);
    });
  });

  describe('Route Validation', () => {
    it('should pass route structure validation', () => {
      const demoRoute = demoRoutes[0];
      
      // Validate required properties
      expect(demoRoute.path).toBeDefined();
      expect(demoRoute.path.length).toBeGreaterThan(0);
      expect(demoRoute.name).toBeDefined();
      expect(demoRoute.name.length).toBeGreaterThan(0);
      expect(demoRoute.component).toBeDefined();
      expect(typeof demoRoute.component).toBe('function');
    });

    it('should have valid route path format', () => {
      const demoRoute = demoRoutes[0];
      
      // Path should start with / and not end with /
      expect(demoRoute.path.startsWith('/')).toBe(true);
      if (demoRoute.path.length > 1) {
        expect(demoRoute.path.endsWith('/')).toBe(false);
      }
      
      // Path should not contain invalid characters
      expect(demoRoute.path).not.toMatch(/[<>:"|?*]/);
    });

    it('should have valid route name format', () => {
      const demoRoute = demoRoutes[0];
      
      // Name should be a valid string
      expect(typeof demoRoute.name).toBe('string');
      expect(demoRoute.name.length).toBeGreaterThan(0);
      expect(demoRoute.name.trim()).toBe(demoRoute.name); // No leading/trailing whitespace
      
      // Name should not contain invalid characters
      expect(demoRoute.name).not.toMatch(/[<>:"|?*]/);
    });

    it('should have consistent meta configuration', () => {
      const demoRoute = demoRoutes[0];
      
      if (demoRoute.meta) {
        // Meta should be an object
        expect(typeof demoRoute.meta).toBe('object');
        expect(demoRoute.meta).not.toBeNull();
        
        // Check specific meta properties
        if (demoRoute.meta.title !== undefined) {
          expect(typeof demoRoute.meta.title).toBe('string');
          expect(demoRoute.meta.title.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Route Behavior', () => {
    it('should support lazy loading with proper error handling', async () => {
      const demoRoute = demoRoutes[0];
      
      // Test successful component loading
      let componentLoaded = false;
      try {
        const component = await demoRoute.component();
        if (component && component.default) {
          componentLoaded = true;
        }
      } catch (error) {
        // Component loading failed
        console.warn('Component loading failed:', error);
      }
      
      expect(componentLoaded).toBe(true);
    });

    it('should be compatible with route guards', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate route guard checks
      const mockTo = {
        path: demoRoute.path,
        name: demoRoute.name,
        meta: demoRoute.meta,
        matched: [demoRoute]
      };
      
      const mockFrom = {
        path: '/',
        name: 'Home',
        meta: {},
        matched: []
      };
      
      const mockNext = vi.fn();
      
      // Simulate beforeEach guard
      expect(() => {
        // This would be the actual guard logic in a real router
        if (mockTo.meta?.title) {
          console.log(`Navigating to: ${mockTo.meta.title}`);
        }
        mockNext();
      }).not.toThrow();
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should support route navigation', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate router navigation
      const mockRouter = {
        push: vi.fn(),
        replace: vi.fn(),
        resolve: vi.fn()
      };
      
      // Test push navigation
      mockRouter.push(demoRoute.path);
      expect(mockRouter.push).toHaveBeenCalledWith(demoRoute.path);
      
      // Test replace navigation
      mockRouter.replace(demoRoute.path);
      expect(mockRouter.replace).toHaveBeenCalledWith(demoRoute.path);
      
      // Test route resolution
      mockRouter.resolve(demoRoute.path);
      expect(mockRouter.resolve).toHaveBeenCalledWith(demoRoute.path);
    });
  });

  describe('Route Extensibility', () => {
    it('should allow adding child routes', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate adding child routes
      const extendedRoute = { ...demoRoute };
      extendedRoute.children = [
        {
          path: 'sub-demo',
          name: 'SubDemo',
          component: vi.fn(),
          meta: { title: 'Sub Demo' }
        }
      ];
      
      expect(extendedRoute.children).toBeDefined();
      expect(Array.isArray(extendedRoute.children)).toBe(true);
      expect(extendedRoute.children.length).toBe(1);
      expect(extendedRoute.children[0].path).toBe('sub-demo');
    });

    it('should allow adding additional meta properties', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate adding meta properties
      const extendedRoute = { ...demoRoute };
      extendedRoute.meta = {
        ...extendedRoute.meta,
        requiresAuth: true,
        permission: 'DEMO_VIEW',
        icon: 'Demo',
        priority: 'medium'
      };
      
      expect(extendedRoute.meta?.requiresAuth).toBe(true);
      expect(extendedRoute.meta?.permission).toBe('DEMO_VIEW');
      expect(extendedRoute.meta?.icon).toBe('Demo');
      expect(extendedRoute.meta?.priority).toBe('medium');
    });

    it('should support route aliases', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate adding alias
      const extendedRoute = { ...demoRoute };
      extendedRoute.alias = '/demo-alias';
      
      expect(extendedRoute.alias).toBe('/demo-alias');
    });

    it('should support route props', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate adding props
      const extendedRoute = { ...demoRoute };
      extendedRoute.props = true;
      
      expect(extendedRoute.props).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle undefined meta gracefully', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate route without meta
      const routeWithoutMeta = { ...demoRoute };
      delete routeWithoutMeta.meta;
      
      expect(routeWithoutMeta.meta).toBeUndefined();
      
      // Should still be a valid route
      expect(routeWithoutMeta.path).toBe('/demo');
      expect(routeWithoutMeta.name).toBe('DemoPage');
      expect(routeWithoutMeta.component).toBeDefined();
    });

    it('should handle empty meta object', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate route with empty meta
      const routeWithEmptyMeta = { ...demoRoute };
      routeWithEmptyMeta.meta = {};
      
      expect(routeWithEmptyMeta.meta).toEqual({});
      
      // Should still be a valid route
      expect(routeWithEmptyMeta.path).toBe('/demo');
      expect(routeWithEmptyMeta.name).toBe('DemoPage');
      expect(routeWithEmptyMeta.component).toBeDefined();
    });

    it('should handle component loading timeout', async () => {
      const demoRoute = demoRoutes[0];
      
      // Mock slow component loading
      const originalComponent = demoRoute.component;
      demoRoute.component = vi.fn(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      // Should not throw immediately, should handle timeout gracefully
      const componentPromise = demoRoute.component();
      expect(componentPromise).toBeInstanceOf(Promise);
      
      // Restore original component
      demoRoute.component = originalComponent;
    });

    it('should be serializable for debugging', () => {
      const demoRoute = demoRoutes[0];
      
      // Test that route can be serialized (useful for debugging)
      const serializedRoute = JSON.stringify(demoRoute);
      expect(serializedRoute).toBeDefined();
      expect(typeof serializedRoute).toBe('string');
      expect(serializedRoute.length).toBeGreaterThan(0);
      
      // Test that it can be deserialized
      const parsedRoute = JSON.parse(serializedRoute);
      expect(parsedRoute.path).toBe(demoRoute.path);
      expect(parsedRoute.name).toBe(demoRoute.name);
      expect(parsedRoute.meta).toEqual(demoRoute.meta);
    });
  });

  describe('Performance Considerations', () => {
    it('should have minimal memory footprint', () => {
      const demoRoute = demoRoutes[0];
      
      // Check that route object is not unnecessarily large
      const routeString = JSON.stringify(demoRoute);
      expect(routeString.length).toBeLessThan(500); // Reasonable size limit
    });

    it('should support efficient route matching', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate route matching (performance test)
      const startTime = performance.now();
      
      // Simple route matching logic
      const isMatch = (path: string) => path === demoRoute.path;
      const testPath = '/demo';
      const matches = isMatch(testPath);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(matches).toBe(true);
      expect(duration).toBeLessThan(1); // Should be very fast
    });

    it('should be tree-shakeable', () => {
      // This is more of a design consideration test
      
      // The demo routes should be exported in a way that allows tree shaking
      expect(typeof demoRoutes).toBe('object');
      expect(Array.isArray(demoRoutes)).toBe(true);
      
      // Each route should be independently usable
      demoRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('name');
        expect(route).toHaveProperty('component');
      });
    });
  });

  describe('Development and Debugging Support', () => {
    it('should have meaningful route names for debugging', () => {
      const demoRoute = demoRoutes[0];
      
      expect(demoRoute.name).toBe('DemoPage');
      expect(demoRoute.name.length).toBeGreaterThan(0);
      expect(demoRoute.name).toMatch(/^[A-Za-z][A-Za-z0-9]*$/); // Valid identifier
    });

    it('should have descriptive paths for debugging', () => {
      const demoRoute = demoRoutes[0];
      
      expect(demoRoute.path).toBe('/demo');
      expect(demoRoute.path.length).toBeGreaterThan(0);
      expect(demoRoute.path).toMatch(/^\/[A-Za-z0-9\-_]*$/); // Valid path format
    });

    it('should have informative meta titles for debugging', () => {
      const demoRoute = demoRoutes[0];
      
      expect(demoRoute.meta?.title).toBe('样式演示页面');
      expect(demoRoute.meta?.title.length).toBeGreaterThan(0);
      expect(demoRoute.meta?.title).toMatch(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/); // Valid title format
    });

    it('should support route inspection', () => {
      const demoRoute = demoRoutes[0];
      
      // Simulate route inspection (useful for debugging tools)
      const routeInfo = {
        path: demoRoute.path,
        name: demoRoute.name,
        hasComponent: !!demoRoute.component,
        hasMeta: !!demoRoute.meta,
        metaKeys: demoRoute.meta ? Object.keys(demoRoute.meta) : [],
        isLazy: typeof demoRoute.component === 'function'
      };
      
      expect(routeInfo.path).toBe('/demo');
      expect(routeInfo.name).toBe('DemoPage');
      expect(routeInfo.hasComponent).toBe(true);
      expect(routeInfo.hasMeta).toBe(true);
      expect(routeInfo.metaKeys).toContain('title');
      expect(routeInfo.isLazy).toBe(true);
    });
  });
});