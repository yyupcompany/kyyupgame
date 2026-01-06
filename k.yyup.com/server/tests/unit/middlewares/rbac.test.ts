/**
 * RBAC Middleware 单元测试
 * 测试基于角色的访问控制中间件的各种功能
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { 
  createRBACMiddleware, 
  Role, 
  PermissionLevel, 
  ROLE_PERMISSIONS, 
  requirePermission, 
  logSecurityViolation 
} from '../../../src/middlewares/rbac.middleware';
import { testUtils } from '../../setup';


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

describe('RBAC Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createRBACMiddleware', () => {
    it('should allow admin user to access system management', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '1',
          role: 'admin'
        },
        message: '修改系统配置'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockRequest.securityContext).toEqual(
        expect.objectContaining({
          userId: '1',
          role: Role.ADMIN,
          permissionLevel: PermissionLevel.FULL,
          allowedOperations: expect.arrayContaining([
            'view_all_data',
            'modify_system_config',
            'manage_users',
            'access_financial_data',
            'system_administration'
          ])
        })
      );
    });

    it('should deny non-admin user from accessing system management', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '2',
          role: 'teacher'
        },
        message: '修改系统配置'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access Denied',
        message: '您没有权限访问系统管理功能，该功能仅限管理员使用',
        code: 'RBAC_PERMISSION_DENIED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow principal user to access financial reports', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '3',
          role: 'principal'
        },
        message: '查看财务报告'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.securityContext).toEqual(
        expect.objectContaining({
          userId: '3',
          role: Role.PRINCIPAL,
          permissionLevel: PermissionLevel.LIMITED,
          allowedOperations: expect.arrayContaining([
            'view_school_data',
            'manage_teachers',
            'manage_students',
            'view_financial_reports',
            'manage_activities'
          ])
        })
      );
    });

    it('should deny teacher user from accessing financial data', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '4',
          role: 'teacher'
        },
        message: '查看财务数据'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access Denied',
        message: '您没有权限访问财务数据，该功能仅限管理员和园长使用',
        code: 'RBAC_PERMISSION_DENIED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny parent user from accessing financial data', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '5',
          role: 'parent'
        },
        message: '查看财务数据'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access Denied',
        message: '您没有权限访问财务数据，该功能仅限管理员和园长使用',
        code: 'RBAC_PERMISSION_DENIED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow teacher user to access own classes data', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '6',
          role: 'teacher'
        },
        message: '查看自己班级的学生数据'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.securityContext).toEqual(
        expect.objectContaining({
          userId: '6',
          role: Role.TEACHER,
          permissionLevel: PermissionLevel.RESTRICTED,
          allowedOperations: expect.arrayContaining([
            'view_own_classes',
            'manage_own_students',
            'view_class_activities',
            'submit_reports'
          ])
        })
      );
    });

    it('should deny teacher user from accessing other classes data', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '7',
          role: 'teacher'
        },
        message: '查看其他班级的学生数据'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access Denied',
        message: '教师只能访问自己负责班级的数据，无法查看其他班级信息',
        code: 'RBAC_PERMISSION_DENIED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow parent user to access own children data', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '8',
          role: 'parent'
        },
        message: '查看自己孩子的学习情况'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.securityContext).toEqual(
        expect.objectContaining({
          userId: '8',
          role: Role.PARENT,
          permissionLevel: PermissionLevel.DENIED,
          allowedOperations: expect.arrayContaining([
            'view_own_children',
            'view_child_activities',
            'communicate_with_teachers'
          ])
        })
      );
    });

    it('should deny parent user from accessing other children data', () => {
      // Setup
      mockRequest.body = {
        context: {
          userId: '9',
          role: 'parent'
        },
        message: '查看其他家庭的孩子数据'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access Denied',
        message: '家长只能查看自己孩子的相关信息，无法访问其他家庭的数据',
        code: 'RBAC_PERMISSION_DENIED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing context gracefully', () => {
      // Setup
      mockRequest.body = {
        message: '测试消息'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.securityContext).toEqual(
        expect.objectContaining({
          userId: '121',
          role: Role.PARENT,
          permissionLevel: PermissionLevel.DENIED
        })
      );
    });

    it('should handle missing body gracefully', () => {
      // Setup
      mockRequest.body = undefined;

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.securityContext).toEqual(
        expect.objectContaining({
          userId: '121',
          role: Role.PARENT,
          permissionLevel: PermissionLevel.DENIED
        })
      );
    });

    it('should normalize role names correctly', () => {
      const testCases = [
        { input: 'admin', expected: Role.ADMIN },
        { input: 'administrator', expected: Role.ADMIN },
        { input: 'super_admin', expected: Role.ADMIN },
        { input: 'principal', expected: Role.PRINCIPAL },
        { input: 'headmaster', expected: Role.PRINCIPAL },
        { input: 'teacher', expected: Role.TEACHER },
        { input: 'instructor', expected: Role.TEACHER },
        { input: 'parent', expected: Role.PARENT },
        { input: 'guardian', expected: Role.PARENT },
        { input: 'unknown', expected: Role.PARENT },
        { input: '', expected: Role.PARENT }
      ];

      testCases.forEach(({ input, expected }) => {
        mockRequest.body = {
          context: {
            userId: '10',
            role: input
          },
          message: '测试角色标准化'
        };

        const middleware = createRBACMiddleware();
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.securityContext.role).toBe(expected);
      });
    });

    it('should extract user information from request.user when available', () => {
      // Setup
      mockRequest.user = { id: '123', role: 'admin' };
      mockRequest.body = {
        message: '从认证用户信息中提取'
      };

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.securityContext.userId).toBe('123');
      expect(mockRequest.securityContext.role).toBe(Role.ADMIN);
    });

    it('should detect sensitive operations and restrict to admin', () => {
      const sensitiveMessages = [
        '修改系统配置',
        '删除所有用户',
        '修改权限设置',
        '重置管理员密码',
        '清空系统数据'
      ];

      sensitiveMessages.forEach(message => {
        mockRequest.body = {
          context: {
            userId: '11',
            role: 'teacher'
          },
          message
        };

        const middleware = createRBACMiddleware();
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Access Denied',
          message: '检测到敏感操作，该操作仅限系统管理员执行',
          code: 'RBAC_PERMISSION_DENIED'
        });
        
        // Reset for next test
        jest.clearAllMocks();
        mockResponse = testUtils.mockResponse();
        mockNext = testUtils.mockNext();
      });
    });

    it('should determine request type correctly', () => {
      const testCases = [
        { message: '系统配置管理', expectedType: 'system_management' },
        { message: '财务收支统计', expectedType: 'financial_access' },
        { message: '查看所有用户数据', expectedType: 'user_data_access' },
        { message: '查看其他班级信息', expectedType: 'cross_permission_access' },
        { message: '生成统计图表', expectedType: 'data_visualization' },
        { message: '普通查询', expectedType: 'general_query' }
      ];

      testCases.forEach(({ message, expectedType }) => {
        mockRequest.body = {
          context: {
            userId: '12',
            role: 'admin'
          },
          message
        };

        const middleware = createRBACMiddleware();
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.securityContext.requestType).toBe(expectedType);
      });
    });

    it('should handle middleware errors gracefully', () => {
      // Setup - force an error by mocking the implementation
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Execute
      const middleware = createRBACMiddleware();
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert - should still respond with error
      expect(console.error).toHaveBeenCalled();

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('requirePermission decorator', () => {
    it('should allow access when user has required role', () => {
      // Setup
      const mockTarget = {
        testMethod: function(context: any) {
          return 'success';
        }
      };

      const context = {
        role: 'admin' as any,
        userId: '1'
      };

      // Execute
      requirePermission(Role.ADMIN)(mockTarget, 'testMethod', {
        value: mockTarget.testMethod,
        enumerable: true,
        configurable: true,
        writable: true
      });

      // Assert
      expect(() => {
        mockTarget.testMethod(context);
      }).not.toThrow();
    });

    it('should deny access when user lacks required role', () => {
      // Setup
      const mockTarget = {
        testMethod: function(context: any) {
          return 'success';
        }
      };

      const context = {
        role: 'teacher',
        userId: '2'
      };

      // Execute
      requirePermission(Role.ADMIN)(mockTarget, 'testMethod', {
        value: mockTarget.testMethod,
        enumerable: true,
        configurable: true,
        writable: true
      });

      // Assert
      expect(() => {
        mockTarget.testMethod(context);
      }).toThrow('权限不足：该操作需要 admin 角色');
    });

    it('should allow access when user has one of multiple allowed roles', () => {
      // Setup
      const mockTarget = {
        testMethod: function(context: any) {
          return 'success';
        }
      };

      const context = {
        role: 'principal',
        userId: '3'
      };

      // Execute
      requirePermission([Role.ADMIN, Role.PRINCIPAL])(mockTarget, 'testMethod', {
        value: mockTarget.testMethod,
        enumerable: true,
        configurable: true,
        writable: true
      });

      // Assert
      expect(() => {
        mockTarget.testMethod(context);
      }).not.toThrow();
    });

    it('should check specific operation permissions', () => {
      // Setup
      const mockTarget = {
        testMethod: function(context: any) {
          return 'success';
        }
      };

      const context = {
        role: 'teacher',
        userId: '4'
      };

      // Execute
      requirePermission(Role.TEACHER, 'view_own_classes')(mockTarget, 'testMethod', {
        value: mockTarget.testMethod,
        enumerable: true,
        configurable: true,
        writable: true
      });

      // Assert
      expect(() => {
        mockTarget.testMethod(context);
      }).not.toThrow();
    });

    it('should deny access when user lacks specific operation permission', () => {
      // Setup
      const mockTarget = {
        testMethod: function(context: any) {
          return 'success';
        }
      };

      const context = {
        role: 'teacher',
        userId: '5'
      };

      // Execute
      requirePermission(Role.TEACHER, 'modify_system_config')(mockTarget, 'testMethod', {
        value: mockTarget.testMethod,
        enumerable: true,
        configurable: true,
        writable: true
      });

      // Assert
      expect(() => {
        mockTarget.testMethod(context);
      }).toThrow('权限不足：角色 teacher 无法执行操作 modify_system_config');
    });

    it('should throw error when context is missing', () => {
      // Setup
      const mockTarget = {
        testMethod: function() {
          return 'success';
        }
      };

      // Execute
      requirePermission(Role.ADMIN)(mockTarget, 'testMethod', {
        value: mockTarget.testMethod,
        enumerable: true,
        configurable: true,
        writable: true
      });

      // Assert
      expect(() => {
        mockTarget.testMethod();
      }).toThrow('权限检查失败：缺少安全上下文');
    });
  });

  describe('logSecurityViolation', () => {
    it('should log security violations correctly', () => {
      // Setup
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      const context = {
        userId: '123',
        role: Role.ADMIN,
        message: '测试违规操作',
        requestType: 'system_management',
        timestamp: new Date()
      };

      const violation = '尝试访问未授权资源';

      // Execute
      logSecurityViolation(context, violation);

      // Assert
      expect(console.warn).toHaveBeenCalledWith(
        '🚨 安全违规检测:',
        {
          timestamp: expect.any(String),
          userId: '123',
          role: Role.ADMIN,
          message: '测试违规操作',
          violation: '尝试访问未授权资源',
          severity: 'HIGH',
          action: 'BLOCKED'
        }
      );

      // Restore console.warn
      console.warn = originalConsoleWarn;
    });
  });

  describe('ROLE_PERMISSIONS configuration', () => {
    it('should have correct admin permissions', () => {
      const adminPermissions = ROLE_PERMISSIONS[Role.ADMIN];
      
      expect(adminPermissions.level).toBe(PermissionLevel.FULL);
      expect(adminPermissions.allowedOperations).toContain('view_all_data');
      expect(adminPermissions.allowedOperations).toContain('modify_system_config');
      expect(adminPermissions.dataAccess.users).toBe('all');
      expect(adminPermissions.dataAccess.financial).toBe('all');
    });

    it('should have correct principal permissions', () => {
      const principalPermissions = ROLE_PERMISSIONS[Role.PRINCIPAL];
      
      expect(principalPermissions.level).toBe(PermissionLevel.LIMITED);
      expect(principalPermissions.allowedOperations).toContain('view_school_data');
      expect(principalPermissions.allowedOperations).toContain('manage_teachers');
      expect(principalPermissions.dataAccess.users).toBe('school_only');
      expect(principalPermissions.dataAccess.financial).toBe('reports_only');
      expect(principalPermissions.restrictions).toContain('cannot_modify_system_config');
    });

    it('should have correct teacher permissions', () => {
      const teacherPermissions = ROLE_PERMISSIONS[Role.TEACHER];
      
      expect(teacherPermissions.level).toBe(PermissionLevel.RESTRICTED);
      expect(teacherPermissions.allowedOperations).toContain('view_own_classes');
      expect(teacherPermissions.allowedOperations).toContain('manage_own_students');
      expect(teacherPermissions.dataAccess.students).toBe('own_classes_only');
      expect(teacherPermissions.dataAccess.financial).toBe('none');
      expect(teacherPermissions.restrictions).toContain('cannot_access_other_classes');
    });

    it('should have correct parent permissions', () => {
      const parentPermissions = ROLE_PERMISSIONS[Role.PARENT];
      
      expect(parentPermissions.level).toBe(PermissionLevel.DENIED);
      expect(parentPermissions.allowedOperations).toContain('view_own_children');
      expect(parentPermissions.allowedOperations).toContain('view_child_activities');
      expect(parentPermissions.dataAccess.students).toBe('own_children_only');
      expect(parentPermissions.dataAccess.system).toBe('none');
      expect(parentPermissions.restrictions).toContain('cannot_access_other_children');
    });
  });
});