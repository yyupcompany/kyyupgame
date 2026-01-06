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
import type { RouteRecordRaw } from 'vue-router';

// Mock dynamic imports for components
vi.mock('@/layouts/MainLayout.vue', () => ({
  default: vi.fn(() => 'MainLayout')
}));

vi.mock('@/pages/Login/index.vue', () => ({
  default: vi.fn(() => 'Login')
}));

vi.mock('@/pages/Register.vue', () => ({
  default: vi.fn(() => 'Register')
}));

vi.mock('@/pages/dashboard/index.vue', () => ({
  default: vi.fn(() => 'Dashboard')
}));

vi.mock('@/pages/Profile.vue', () => ({
  default: vi.fn(() => 'Profile')
}));

vi.mock('@/pages/ProfileSettings.vue', () => ({
  default: vi.fn(() => 'ProfileSettings')
}));

vi.mock('@/pages/Notifications.vue', () => ({
  default: vi.fn(() => 'Notifications')
}));

vi.mock('@/pages/Messages.vue', () => ({
  default: vi.fn(() => 'Messages')
}));

vi.mock('@/pages/Error.vue', () => ({
  default: vi.fn(() => 'Error')
}));

vi.mock('@/pages/Finance.vue', () => ({
  default: vi.fn(() => 'Finance')
}));

vi.mock('@/pages/finance/FinancialReports.vue', () => ({
  default: vi.fn(() => 'FinancialReports')
}));

vi.mock('@/pages/finance/FeeManagement.vue', () => ({
  default: vi.fn(() => 'FeeManagement')
}));

// Mock all other component imports
const mockComponent = vi.fn(() => 'MockComponent');
vi.doMock('@/pages/student/index.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/teacher/TeacherList.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/teacher/TeacherDetail.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/teacher/TeacherEdit.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/enrollment-plan/PlanList.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/enrollment/index.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/enrollment-plan/QuotaManage.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/activity/ActivityList.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/activity/ActivityDetail.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/parent/ParentList.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/parent/ParentDetail.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/principal/Dashboard.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/principal/PrincipalReports.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/ai/ChatInterface.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/statistics/index.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/application/ApplicationList.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/application/ApplicationDetail.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/customer/index.vue', () => ({ default: mockComponent }));
vi.doMock('@/pages/404.vue', () => ({ default: mockComponent }));

describe('Optimized Routes Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Structure and Configuration', () => {
    it('should define optimized routes array', () => {
      expect(optimizedRoutes).toBeDefined();
      expect(Array.isArray(optimizedRoutes)).toBe(true);
      expect(optimizedRoutes.length).toBeGreaterThan(0);
    });

    it('should have properly structured route objects', () => {
      optimizedRoutes.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
        
        if (route.name) {
          expect(typeof route.name).toBe('string' || 'symbol');
        }
        
        if (route.component) {
          expect(typeof route.component).toBe('function');
        }
        
        if (route.meta) {
          expect(typeof route.meta).toBe('object');
        }
      });
    });

    it('should have login route with correct configuration', () => {
      const loginRoute = optimizedRoutes.find(route => route.path === '/login');
      
      expect(loginRoute).toBeDefined();
      expect(loginRoute?.name).toBe('Login');
      expect(loginRoute?.component).toBeDefined();
      expect(typeof loginRoute?.component).toBe('function');
      expect(loginRoute?.meta).toBeDefined();
      
      if (loginRoute?.meta) {
        expect(loginRoute.meta.title).toBe('用户登录');
        expect(loginRoute.meta.requiresAuth).toBe(false);
        expect(loginRoute.meta.hideInMenu).toBe(true);
        expect(loginRoute.meta.preload).toBe(true);
      }
    });

    it('should have register route with correct configuration', () => {
      const registerRoute = optimizedRoutes.find(route => route.path === '/register');
      
      expect(registerRoute).toBeDefined();
      expect(registerRoute?.name).toBe('Register');
      expect(registerRoute?.meta).toBeDefined();
      
      if (registerRoute?.meta) {
        expect(registerRoute.meta.title).toBe('用户注册');
        expect(registerRoute.meta.requiresAuth).toBe(false);
        expect(registerRoute.meta.hideInMenu).toBe(true);
        expect(registerRoute.meta.preload).toBe(true);
      }
    });

    it('should have main layout route with redirect', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      expect(mainRoute).toBeDefined();
      expect(mainRoute?.component).toBeDefined();
      expect(mainRoute?.redirect).toBe('/dashboard');
      expect(mainRoute?.children).toBeDefined();
      expect(Array.isArray(mainRoute?.children)).toBe(true);
    });

    it('should have dashboard route in main layout children', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      const dashboardRoute = mainRoute?.children?.find(child => child.path === 'dashboard');
      
      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute?.name).toBe('Dashboard');
      expect(dashboardRoute?.meta).toBeDefined();
      
      if (dashboardRoute?.meta) {
        expect(dashboardRoute.meta.title).toBe('仪表板');
        expect(dashboardRoute.meta.requiresAuth).toBe(true);
        expect(dashboardRoute.meta.preload).toBe(true);
        expect(dashboardRoute.meta.priority).toBe('high');
      }
    });
  });

  describe('Route Meta Configuration', () => {
    it('should have consistent meta configuration across routes', () => {
      const routesWithMeta = optimizedRoutes.filter(route => route.meta);
      
      expect(routesWithMeta.length).toBeGreaterThan(0);
      
      routesWithMeta.forEach(route => {
        if (route.meta) {
          // Check required meta properties
          expect(route.meta).toHaveProperty('title');
          expect(typeof route.meta.title).toBe('string');
          expect(route.meta.title.length).toBeGreaterThan(0);
          
          // Check requiresAuth property
          expect(route.meta).toHaveProperty('requiresAuth');
          expect(typeof route.meta.requiresAuth).toBe('boolean');
        }
      });
    });

    it('should have proper permission configuration for protected routes', () => {
      const protectedRoutes = optimizedRoutes.filter(route => 
        route.meta?.requiresAuth === true && route.meta?.permission
      );
      
      protectedRoutes.forEach(route => {
        expect(route.meta?.permission).toBeDefined();
        expect(typeof route.meta?.permission).toBe('string');
        expect(route.meta?.permission.length).toBeGreaterThan(0);
      });
    });

    it('should have proper priority configuration', () => {
      const routesWithPriority = optimizedRoutes.filter(route => route.meta?.priority);
      
      routesWithPriority.forEach(route => {
        expect(['high', 'medium', 'low']).toContain(route.meta?.priority);
      });
    });

    it('should have hideInMenu configuration for hidden routes', () => {
      const hiddenRoutes = optimizedRoutes.filter(route => route.meta?.hideInMenu === true);
      
      hiddenRoutes.forEach(route => {
        expect(route.meta?.hideInMenu).toBe(true);
      });
    });
  });

  describe('Nested Routes and Children', () => {
    it('should have properly structured nested routes', () => {
      const routesWithChildren = optimizedRoutes.filter(route => route.children);
      
      expect(routesWithChildren.length).toBeGreaterThan(0);
      
      routesWithChildren.forEach(route => {
        expect(Array.isArray(route.children)).toBe(true);
        
        if (route.children && route.children.length > 0) {
          route.children.forEach(child => {
            expect(child).toHaveProperty('path');
            expect(typeof child.path).toBe('string');
            
            // Child path should not start with / (relative to parent)
            if (child.path.length > 0) {
              expect(child.path.startsWith('/')).toBe(false);
            }
          });
        }
      });
    });

    it('should have teacher management nested routes', () => {
      const teacherRoute = optimizedRoutes.find(route => route.path === '/');
      const teacherManagementRoute = teacherRoute?.children?.find(child => child.path === 'teacher');
      
      expect(teacherManagementRoute).toBeDefined();
      expect(teacherManagementRoute?.name).toBe('TeacherManagement');
      expect(teacherManagementRoute?.redirect).toEqual({ name: 'TeacherList' });
      expect(teacherManagementRoute?.children).toBeDefined();
      expect(Array.isArray(teacherManagementRoute?.children)).toBe(true);
      
      if (teacherManagementRoute?.children) {
        const teacherListRoute = teacherManagementRoute.children.find(child => child.path === '');
        expect(teacherListRoute).toBeDefined();
        expect(teacherListRoute?.name).toBe('TeacherList');
        
        const teacherDetailRoute = teacherManagementRoute.children.find(child => child.path === 'detail/:id');
        expect(teacherDetailRoute).toBeDefined();
        expect(teacherDetailRoute?.name).toBe('TeacherDetail');
      }
    });

    it('should have parent management nested routes', () => {
      const parentRoute = optimizedRoutes.find(route => route.path === '/');
      const parentManagementRoute = parentRoute?.children?.find(child => child.path === 'parent');
      
      expect(parentManagementRoute).toBeDefined();
      expect(parentManagementRoute?.name).toBe('ParentManagement');
      expect(parentManagementRoute?.redirect).toEqual({ name: 'ParentList' });
      expect(parentManagementRoute?.children).toBeDefined();
      expect(Array.isArray(parentManagementRoute?.children)).toBe(true);
    });

    it('should have enrollment plan nested routes', () => {
      const enrollmentPlanRoute = optimizedRoutes.find(route => route.path === '/');
      const planRoute = enrollmentPlanRoute?.children?.find(child => child.path === 'enrollment-plan');
      
      expect(planRoute).toBeDefined();
      expect(planRoute?.name).toBe('EnrollmentPlan');
      expect(planRoute?.redirect).toEqual({ name: 'PlanList' });
      expect(planRoute?.children).toBeDefined();
      expect(Array.isArray(planRoute?.children)).toBe(true);
    });

    it('should have system management nested routes', () => {
      const systemRoute = optimizedRoutes.find(route => route.path === '/');
      const systemManagementRoute = systemRoute?.children?.find(child => child.path === 'system');
      
      expect(systemManagementRoute).toBeDefined();
      expect(systemManagementRoute?.name).toBe('SystemManagement');
      expect(systemManagementRoute?.redirect).toEqual({ name: 'UserManagement' });
      expect(systemManagementRoute?.children).toBeDefined();
      expect(Array.isArray(systemManagementRoute?.children)).toBe(true);
    });

    it('should have AI assistant nested routes', () => {
      const aiRoute = optimizedRoutes.find(route => route.path === '/');
      const aiAssistantRoute = aiRoute?.children?.find(child => child.path === 'ai');
      
      expect(aiAssistantRoute).toBeDefined();
      expect(aiAssistantRoute?.name).toBe('AIAssistant');
      expect(aiAssistantRoute?.redirect).toEqual({ name: 'AIChatInterface' });
      expect(aiAssistantRoute?.children).toBeDefined();
      expect(Array.isArray(aiAssistantRoute?.children)).toBe(true);
    });
  });

  describe('Dynamic Route Parameters', () => {
    it('should have routes with dynamic parameters', () => {
      const routesWithParams = optimizedRoutes.filter(route => 
        route.path?.includes(':') || 
        route.children?.some(child => child.path?.includes(':'))
      );
      
      expect(routesWithParams.length).toBeGreaterThan(0);
      
      routesWithParams.forEach(route => {
        // Check route itself
        if (route.path?.includes(':')) {
          expect(route.path).toMatch(/:\w+/);
        }
        
        // Check children
        if (route.children) {
          route.children.forEach(child => {
            if (child.path?.includes(':')) {
              expect(child.path).toMatch(/:\w+/);
            }
          });
        }
      });
    });

    it('should have proper detail routes with ID parameters', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      // Check for various detail routes
      const detailRoutes = [
        'teacher/detail/:id',
        'teacher/edit/:id',
        'student/detail/:id',
        'student/analytics/:id',
        'student/growth/:id',
        'customer/:id',
        'activity/detail/:id',
        'activity/edit/:id',
        'application/detail/:id',
        'class/detail/:id',
        'class/smart-management/:id'
      ];
      
      detailRoutes.forEach(routePath => {
        const [parentPath, childPath] = routePath.split('/');
        const parentRoute = mainRoute?.children?.find(child => child.path === parentPath);
        const detailRoute = parentRoute?.children?.find(child => child.path === childPath);
        
        if (detailRoute) {
          expect(detailRoute.path).toMatch(/:\w+/);
          expect(detailRoute.meta?.hideInMenu).toBe(true);
        }
      });
    });
  });

  describe('Route Components and Lazy Loading', () => {
    it('should have lazy-loaded components for routes', () => {
      const routesWithComponents = optimizedRoutes.filter(route => route.component);
      
      expect(routesWithComponents.length).toBeGreaterThan(0);
      
      routesWithComponents.forEach(route => {
        expect(typeof route.component).toBe('function');
        
        // Test that component function returns a promise
        const componentPromise = route.component();
        expect(componentPromise).toBeInstanceOf(Promise);
      });
    });

    it('should have proper component imports for main routes', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      expect(mainRoute?.component).toBeDefined();
      expect(typeof mainRoute?.component).toBe('function');
    });

    it('should have lazy-loaded child components', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      if (mainRoute?.children) {
        const childRoutesWithComponents = mainRoute.children.filter(child => child.component);
        
        expect(childRoutesWithComponents.length).toBeGreaterThan(0);
        
        childRoutesWithComponents.forEach(child => {
          expect(typeof child.component).toBe('function');
        });
      }
    });
  });

  describe('Route Redirects and Aliases', () => {
    it('should have proper redirect configuration', () => {
      const routesWithRedirects = optimizedRoutes.filter(route => route.redirect);
      
      expect(routesWithRedirects.length).toBeGreaterThan(0);
      
      routesWithRedirects.forEach(route => {
        expect(route.redirect).toBeDefined();
        
        if (typeof route.redirect === 'string') {
          expect(route.redirect.length).toBeGreaterThan(0);
        } else if (typeof route.redirect === 'object') {
          expect(route.redirect).toHaveProperty('name');
        }
      });
    });

    it('should have nested route redirects', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      if (mainRoute?.children) {
        const routesWithRedirects = mainRoute.children.filter(child => child.redirect);
        
        expect(routesWithRedirects.length).toBeGreaterThan(0);
        
        routesWithRedirects.forEach(route => {
          expect(route.redirect).toBeDefined();
        });
      }
    });

    it('should have settings redirect route', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      const settingsRoute = mainRoute?.children?.find(child => child.path === 'settings');
      
      expect(settingsRoute).toBeDefined();
      expect(settingsRoute?.redirect).toBe('/system/settings');
      expect(settingsRoute?.meta?.hideInMenu).toBe(true);
    });
  });

  describe('Center Routes Configuration', () => {
    it('should have center routes defined', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      const centerPaths = [
        'centers/EnrollmentCenter',
        'centers/PersonnelCenter',
        'centers/ActivityCenter',
        'centers/TaskCenter',
        'centers/MarketingCenter',
        'centers/AICenter',
        'centers/SystemCenter',
        'centers/CustomerPoolCenter',
        'centers/AnalyticsCenter'
      ];
      
      centerPaths.forEach(centerPath => {
        const centerRoute = mainRoute?.children?.find(child => child.path === centerPath);
        expect(centerRoute).toBeDefined();
        expect(centerRoute?.meta?.title).toBeDefined();
        expect(centerRoute?.meta?.requiresAuth).toBe(true);
        expect(centerRoute?.meta?.permission).toBeDefined();
      });
    });

    it('should have marketing center with nested routes', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      const marketingCenterRoute = mainRoute?.children?.find(child => child.path === 'centers/MarketingCenter');
      
      expect(marketingCenterRoute).toBeDefined();
      expect(marketingCenterRoute?.children).toBeDefined();
      expect(Array.isArray(marketingCenterRoute?.children)).toBe(true);
      
      if (marketingCenterRoute?.children) {
        const marketingRoutes = [
          'channels', 'referrals', 'conversions', 'funnel'
        ];
        
        marketingRoutes.forEach(routePath => {
          const route = marketingCenterRoute.children.find(child => child.path === routePath);
          expect(route).toBeDefined();
          expect(route?.meta?.title).toBeDefined();
          expect(route?.meta?.requiresAuth).toBe(true);
          expect(route?.meta?.permission).toBeDefined();
        });
      }
    });
  });

  describe('AI Features Routes', () => {
    it('should have AI-related routes defined', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      const aiPaths = [
        'ai/query',
        'ai/analytics',
        'ai/models',
        'ai/predictions',
        'ai/monitoring'
      ];
      
      aiPaths.forEach(aiPath => {
        const aiRoute = mainRoute?.children?.find(child => child.path === aiPath);
        if (aiRoute) {
          expect(aiRoute.meta?.title).toBeDefined();
          expect(aiRoute.meta?.requiresAuth).toBe(true);
          expect(aiRoute.meta?.permission).toBeDefined();
        }
      });
    });

    it('should have AI expert consultation route', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      const expertRoute = mainRoute?.children?.find(child => child.path === 'centers/ai/expert-consultation');
      
      expect(expertRoute).toBeDefined();
      expect(expertRoute?.meta?.title).toBe('AI专家咨询');
      expect(expertRoute?.meta?.requiresAuth).toBe(true);
      expect(expertRoute?.meta?.permission).toBe('AI_EXPERT_CONSULTATION');
    });
  });

  describe('Error Handling Routes', () => {
    it('should have error page routes', () => {
      const mainRoute = optimizedRoutes.find(route => route.path === '/');
      
      const errorRoute = mainRoute?.children?.find(child => child.path === 'error');
      expect(errorRoute).toBeDefined();
      expect(errorRoute?.name).toBe('Error');
      expect(errorRoute?.meta?.requiresAuth).toBe(false);
      expect(errorRoute?.meta?.hideInMenu).toBe(true);
    });
  });

  describe('Route Validation and Integrity', () => {
    it('should have unique route names within the same scope', () => {
      const routeNames = new Set();
      let hasDuplicateNames = false;
      
      function checkRouteNames(routes: RouteRecordRaw[], parentPath = '') {
        routes.forEach(route => {
          const fullPath = `${parentPath}${route.path}`;
          
          if (route.name) {
            const nameString = String(route.name);
            if (routeNames.has(nameString)) {
              hasDuplicateNames = true;
              console.warn(`Duplicate route name found: ${nameString} at ${fullPath}`);
            }
            routeNames.add(nameString);
          }
          
          if (route.children) {
            checkRouteNames(route.children, fullPath);
          }
        });
      }
      
      checkRouteNames(optimizedRoutes);
      expect(hasDuplicateNames).toBe(false);
    });

    it('should have proper path structure', () => {
      function validatePathStructure(routes: RouteRecordRaw[], isChild = false) {
        routes.forEach(route => {
          expect(route.path).toBeDefined();
          expect(typeof route.path).toBe('string');
          expect(route.path.length).toBeGreaterThan(0);
          
          // Root routes should start with /
          if (!isChild && route.path !== '/') {
            expect(route.path.startsWith('/')).toBe(true);
          }
          
          // Child routes should not start with /
          if (isChild && route.path.length > 0) {
            expect(route.path.startsWith('/')).toBe(false);
          }
          
          if (route.children) {
            validatePathStructure(route.children, true);
          }
        });
      }
      
      validatePathStructure(optimizedRoutes);
    });

    it('should have consistent meta structure', () => {
      function validateMetaStructure(routes: RouteRecordRaw[]) {
        routes.forEach(route => {
          if (route.meta) {
            expect(typeof route.meta).toBe('object');
            
            if (route.meta.title !== undefined) {
              expect(typeof route.meta.title).toBe('string');
            }
            
            if (route.meta.requiresAuth !== undefined) {
              expect(typeof route.meta.requiresAuth).toBe('boolean');
            }
            
            if (route.meta.permission !== undefined) {
              expect(typeof route.meta.permission).toBe('string');
            }
            
            if (route.meta.hideInMenu !== undefined) {
              expect(typeof route.meta.hideInMenu).toBe('boolean');
            }
            
            if (route.meta.priority !== undefined) {
              expect(['high', 'medium', 'low']).toContain(route.meta.priority);
            }
          }
          
          if (route.children) {
            validateMetaStructure(route.children);
          }
        });
      }
      
      validateMetaStructure(optimizedRoutes);
    });
  });

  describe('Route Performance Optimization', () => {
    it('should have preload configuration for critical routes', () => {
      const preloadRoutes = optimizedRoutes.filter(route => route.meta?.preload === true);
      
      expect(preloadRoutes.length).toBeGreaterThan(0);
      
      preloadRoutes.forEach(route => {
        expect(route.meta?.preload).toBe(true);
      });
    });

    it('should have priority configuration for performance optimization', () => {
      const highPriorityRoutes = optimizedRoutes.filter(route => route.meta?.priority === 'high');
      const mediumPriorityRoutes = optimizedRoutes.filter(route => route.meta?.priority === 'medium');
      const lowPriorityRoutes = optimizedRoutes.filter(route => route.meta?.priority === 'low');
      
      expect(highPriorityRoutes.length).toBeGreaterThan(0);
      expect(mediumPriorityRoutes.length).toBeGreaterThan(0);
      expect(lowPriorityRoutes.length).toBeGreaterThan(0);
    });
  });
});