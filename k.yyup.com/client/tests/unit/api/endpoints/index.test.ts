
vi.mock('@/api/endpoints', () => ({
  AUTH_ENDPOINTS: {
    LOGIN: '/api/auth/unified-login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  API_ENDPOINTS: {},
  USER_ENDPOINTS: {}
}))

/**
 * API端点统一导出测试
 * 测试文件: /home/zhgue/yyup.com/client/src/api/endpoints/index.ts
 */

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

describe, it, expect } from 'vitest';
import * as endpointsIndex from '@/api/endpoints/index';
import { authApi } from '@/api/auth';


describe('API端点统一导出', () => {
  describe('基础配置导出', () => {
    it('应该导出API_PREFIX', () => {
      expect(endpointsIndex.API_PREFIX).toBeDefined();
      expect(typeof endpointsIndex.API_PREFIX).toBe('string');
    });

    it('应该导出基础类型定义', () => {
      expect(endpointsIndex.ApiResponse).toBeDefined();
      expect(endpointsIndex.PaginationParams).toBeDefined();
      expect(endpointsIndex.BaseSearchParams).toBeDefined();
    });
  });

  describe('认证相关导出', () => {
    it('应该导出AUTH_ENDPOINTS', () => {
      expect(endpointsIndex.AUTH_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.AUTH_ENDPOINTS).toBe('object');
    });

    it('AUTH_ENDPOINTS应该包含必要的端点', () => {
      const authEndpoints = endpointsIndex.AUTH_ENDPOINTS;
      expect(authEndpoints.LOGIN).toBeDefined();
      expect(authEndpoints.LOGOUT).toBeDefined();
      expect(authEndpoints.REGISTER).toBeDefined();
      expect(authEndpoints.REFRESH_TOKEN).toBeDefined();
    });
  });

  describe('用户管理导出', () => {
    it('应该导出USER_ENDPOINTS', () => {
      expect(endpointsIndex.USER_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.USER_ENDPOINTS).toBe('object');
    });

    it('USER_ENDPOINTS应该包含CRUD操作', () => {
      const userEndpoints = endpointsIndex.USER_ENDPOINTS;
      expect(userEndpoints.BASE).toBeDefined();
      expect(userEndpoints.GET_BY_ID).toBeDefined();
      expect(userEndpoints.UPDATE).toBeDefined();
      expect(userEndpoints.DELETE).toBeDefined();
    });
  });

  describe('系统管理导出', () => {
    it('应该导出SYSTEM_ENDPOINTS', () => {
      expect(endpointsIndex.SYSTEM_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.SYSTEM_ENDPOINTS).toBe('object');
    });

    it('SYSTEM_ENDPOINTS应该包含系统相关端点', () => {
      const systemEndpoints = endpointsIndex.SYSTEM_ENDPOINTS;
      expect(systemEndpoints.HEALTH).toBeDefined();
      expect(systemEndpoints.VERSION).toBeDefined();
      expect(systemEndpoints.API_LIST).toBeDefined();
    });
  });

  describe('仪表盘导出', () => {
    it('应该导出DASHBOARD_ENDPOINTS', () => {
      expect(endpointsIndex.DASHBOARD_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.DASHBOARD_ENDPOINTS).toBe('object');
    });

    it('DASHBOARD_ENDPOINTS应该包含统计和概览端点', () => {
      const dashboardEndpoints = endpointsIndex.DASHBOARD_ENDPOINTS;
      expect(dashboardEndpoints.STATS).toBeDefined();
      expect(dashboardEndpoints.CLASSES).toBeDefined();
      expect(dashboardEndpoints.OVERVIEW).toBeDefined();
    });
  });

  describe('业务核心导出', () => {
    it('应该导出业务核心相关端点', () => {
      expect(endpointsIndex.KINDERGARTEN_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.CLASS_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.TEACHER_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.STUDENT_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.PARENT_ENDPOINTS).toBeDefined();
    });

    it('业务核心端点应该具有正确的类型', () => {
      expect(typeof endpointsIndex.KINDERGARTEN_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.CLASS_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.TEACHER_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.STUDENT_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.PARENT_ENDPOINTS).toBe('object');
    });
  });

  describe('统计分析导出', () => {
    it('应该导出STATISTICS_ENDPOINTS', () => {
      expect(endpointsIndex.STATISTICS_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.STATISTICS_ENDPOINTS).toBe('object');
    });

    it('STATISTICS_ENDPOINTS应该包含分析相关端点', () => {
      const statisticsEndpoints = endpointsIndex.STATISTICS_ENDPOINTS;
      expect(statisticsEndpoints.BASE).toBeDefined();
      expect(statisticsEndpoints.DASHBOARD).toBeDefined();
      expect(statisticsEndpoints.ENROLLMENT).toBeDefined();
    });
  });

  describe('AI功能导出', () => {
    it('应该导出AI_ENDPOINTS', () => {
      expect(endpointsIndex.AI_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.AI_ENDPOINTS).toBe('object');
    });

    it('AI_ENDPOINTS应该包含AI相关功能', () => {
      const aiEndpoints = endpointsIndex.AI_ENDPOINTS;
      expect(aiEndpoints.INITIALIZE).toBeDefined();
      expect(aiEndpoints.MODELS).toBeDefined();
      expect(aiEndpoints.CONVERSATIONS).toBeDefined();
    });
  });

  describe('招生管理导出', () => {
    it('应该导出招生管理相关端点', () => {
      expect(endpointsIndex.ENROLLMENT_PLAN_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.ENROLLMENT_QUOTA_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.ENROLLMENT_APPLICATION_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.ENROLLMENT_CONSULTATION_ENDPOINTS).toBeDefined();
    });

    it('招生管理端点应该具有正确的类型', () => {
      expect(typeof endpointsIndex.ENROLLMENT_PLAN_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.ENROLLMENT_QUOTA_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.ENROLLMENT_APPLICATION_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.ENROLLMENT_CONSULTATION_ENDPOINTS).toBe('object');
    });
  });

  describe('活动管理导出', () => {
    it('应该导出活动管理相关端点', () => {
      expect(endpointsIndex.ACTIVITY_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.ACTIVITY_PLAN_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.ACTIVITY_REGISTRATION_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.ACTIVITY_CHECKIN_ENDPOINTS).toBeDefined();
      expect(endpointsIndex.ACTIVITY_EVALUATION_ENDPOINTS).toBeDefined();
    });

    it('活动管理端点应该具有正确的类型', () => {
      expect(typeof endpointsIndex.ACTIVITY_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.ACTIVITY_PLAN_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.ACTIVITY_REGISTRATION_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.ACTIVITY_CHECKIN_ENDPOINTS).toBe('object');
      expect(typeof endpointsIndex.ACTIVITY_EVALUATION_ENDPOINTS).toBe('object');
    });
  });

  describe('营销管理导出', () => {
    it('应该导出MARKETING_ENDPOINTS', () => {
      expect(endpointsIndex.MARKETING_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.MARKETING_ENDPOINTS).toBe('object');
    });

    it('MARKETING_ENDPOINTS应该包含营销相关端点', () => {
      const marketingEndpoints = endpointsIndex.MARKETING_ENDPOINTS;
      expect(marketingEndpoints.BASE).toBeDefined();
      expect(marketingEndpoints.CAMPAIGNS).toBeDefined();
      expect(marketingEndpoints.INTELLIGENT_CAMPAIGN).toBeDefined();
    });
  });

  describe('文件管理导出', () => {
    it('应该导出FILE_ENDPOINTS', () => {
      expect(endpointsIndex.FILE_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.FILE_ENDPOINTS).toBe('object');
    });

    it('FILE_ENDPOINTS应该包含文件操作端点', () => {
      const fileEndpoints = endpointsIndex.FILE_ENDPOINTS;
      expect(fileEndpoints.UPLOAD).toBeDefined();
      expect(fileEndpoints.DOWNLOAD).toBeDefined();
      expect(fileEndpoints.DELETE).toBeDefined();
    });
  });

  describe('通用工具导出', () => {
    it('应该导出UTILS_ENDPOINTS', () => {
      expect(endpointsIndex.UTILS_ENDPOINTS).toBeDefined();
      expect(typeof endpointsIndex.UTILS_ENDPOINTS).toBe('object');
    });

    it('UTILS_ENDPOINTS应该包含工具相关端点', () => {
      const utilsEndpoints = endpointsIndex.UTILS_ENDPOINTS;
      expect(utilsEndpoints.BASE).toBeDefined();
      expect(utilsEndpoints.HEALTH_CHECK).toBeDefined();
      expect(utilsEndpoints.VERSION).toBeDefined();
    });
  });

  describe('导出完整性', () => {
    it('应该导出所有必要的模块', () => {
      const expectedExports = [
        'API_PREFIX',
        'ApiResponse',
        'PaginationParams',
        'BaseSearchParams',
        'AUTH_ENDPOINTS',
        'USER_ENDPOINTS',
        'SYSTEM_ENDPOINTS',
        'DASHBOARD_ENDPOINTS',
        'KINDERGARTEN_ENDPOINTS',
        'CLASS_ENDPOINTS',
        'TEACHER_ENDPOINTS',
        'STUDENT_ENDPOINTS',
        'PARENT_ENDPOINTS',
        'STATISTICS_ENDPOINTS',
        'AI_ENDPOINTS',
        'ENROLLMENT_PLAN_ENDPOINTS',
        'ENROLLMENT_QUOTA_ENDPOINTS',
        'ENROLLMENT_APPLICATION_ENDPOINTS',
        'ENROLLMENT_CONSULTATION_ENDPOINTS',
        'ACTIVITY_ENDPOINTS',
        'ACTIVITY_PLAN_ENDPOINTS',
        'ACTIVITY_REGISTRATION_ENDPOINTS',
        'ACTIVITY_CHECKIN_ENDPOINTS',
        'ACTIVITY_EVALUATION_ENDPOINTS',
        'MARKETING_ENDPOINTS',
        'FILE_ENDPOINTS',
        'UTILS_ENDPOINTS'
      ];

      expectedExports.forEach(exportName => {
        expect(endpointsIndex).toHaveProperty(exportName);
      });
    });

    it('所有导出的端点对象都应该不为空', () => {
      const endpointObjects = [
        'AUTH_ENDPOINTS',
        'USER_ENDPOINTS',
        'SYSTEM_ENDPOINTS',
        'DASHBOARD_ENDPOINTS',
        'KINDERGARTEN_ENDPOINTS',
        'CLASS_ENDPOINTS',
        'TEACHER_ENDPOINTS',
        'STUDENT_ENDPOINTS',
        'PARENT_ENDPOINTS',
        'STATISTICS_ENDPOINTS',
        'AI_ENDPOINTS',
        'ENROLLMENT_PLAN_ENDPOINTS',
        'ENROLLMENT_QUOTA_ENDPOINTS',
        'ENROLLMENT_APPLICATION_ENDPOINTS',
        'ENROLLMENT_CONSULTATION_ENDPOINTS',
        'ACTIVITY_ENDPOINTS',
        'ACTIVITY_PLAN_ENDPOINTS',
        'ACTIVITY_REGISTRATION_ENDPOINTS',
        'ACTIVITY_CHECKIN_ENDPOINTS',
        'ACTIVITY_EVALUATION_ENDPOINTS',
        'MARKETING_ENDPOINTS',
        'FILE_ENDPOINTS',
        'UTILS_ENDPOINTS'
      ];

      endpointObjects.forEach(objectName => {
        const endpointObject = endpointsIndex[objectName as keyof typeof endpointsIndex];
        expect(endpointObject).toBeDefined();
        expect(typeof endpointObject).toBe('object');
        expect(Object.keys(endpointObject as object).length).toBeGreaterThan(0);
      });
    });
  });

  describe('向后兼容性', () => {
    it('应该支持从统一文件导入所有端点', () => {
      // 测试可以同时导入多个端点
      const {
        AUTH_ENDPOINTS,
        USER_ENDPOINTS,
        DASHBOARD_ENDPOINTS,
        ENROLLMENT_PLAN_ENDPOINTS
      } = endpointsIndex;

      expect(AUTH_ENDPOINTS).toBeDefined();
      expect(USER_ENDPOINTS).toBeDefined();
      expect(DASHBOARD_ENDPOINTS).toBeDefined();
      expect(ENROLLMENT_PLAN_ENDPOINTS).toBeDefined();
    });

    it('应该支持从具体模块导入', () => {
      // 这是一个编译时测试，确保模块导出正确
      expect(() => {
        // 这些导入应该在运行时工作
        return {
          auth: endpointsIndex.AUTH_ENDPOINTS,
          user: endpointsIndex.USER_ENDPOINTS,
          system: endpointsIndex.SYSTEM_ENDPOINTS
        };
      }).not.toThrow();
    });
  });

  describe('类型安全', () => {
    it('导出的常量应该具有正确的类型', () => {
      expect(typeof endpointsIndex.API_PREFIX).toBe('string');
      
      // 测试类型定义是否正确导出
      expect(typeof endpointsIndex.ApiResponse).toBe('object'); // 类型定义在运行时是对象
      expect(typeof endpointsIndex.PaginationParams).toBe('object');
      expect(typeof endpointsIndex.BaseSearchParams).toBe('object');
    });

    it('端点对象应该包含函数和字符串', () => {
      const testEndpointObject = (obj: any) => {
        Object.values(obj).forEach((value: any) => {
          expect(['string', 'function']).toContain(typeof value);
        });
      };

      testEndpointObject(endpointsIndex.AUTH_ENDPOINTS);
      testEndpointObject(endpointsIndex.USER_ENDPOINTS);
      testEndpointObject(endpointsIndex.DASHBOARD_ENDPOINTS);
    });
  });
});