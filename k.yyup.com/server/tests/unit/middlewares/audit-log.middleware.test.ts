import { auditLog, auditLogPresets } from '../../../src/middlewares/audit-log.middleware';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';
import { OperationLog, OperationType, OperationResult } from '../../../src/models/operation-log.model';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/models/operation-log.model');
jest.mock('../../../src/utils/logger');


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

describe('AuditLog Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockSend: jest.Mock;
  let mockJson: jest.Mock;
  let mockOn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      method: 'GET',
      path: '/api/test',
      originalUrl: '/api/test?id=123',
      ip: '192.168.1.1',
      get: jest.fn(),
      user: { id: 1, username: 'testuser' }
    };

    mockSend = jest.fn();
    mockJson = jest.fn();
    mockOn = jest.fn();

    mockRes = {
      statusCode: 200,
      send: mockSend,
      json: mockJson,
      on: mockOn
    };

    mockNext = jest.fn();

    // Mock logger
    (logger as any).info = jest.fn();
    (logger as any).error = jest.fn();
  });

  describe('auditLog middleware', () => {
    it('should audit successful GET request', async () => {
      const middleware = auditLog({ module: '测试模块' });
      
      // Execute middleware
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      // Verify audit log creation
      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          module: '测试模块',
          action: 'get',
          operationType: OperationType.READ,
          description: '查询测试模块',
          requestMethod: 'GET',
          requestUrl: '/api/test?id=123',
          operationResult: OperationResult.SUCCESS,
          executionTime: expect.any(Number)
        })
      );
    });

    it('should audit POST request with resource ID', async () => {
      mockReq.method = 'POST';
      mockReq.path = '/api/users/123';
      mockReq.body = { name: 'John Doe', email: 'john@example.com' };

      const middleware = auditLog({ module: '用户管理' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          module: '用户管理',
          action: 'post',
          operationType: OperationType.CREATE,
          description: '创建ID为123的用户管理',
          resourceId: '123',
          requestParams: expect.stringContaining('John Doe')
        })
      );
    });

    it('should audit failed request with error details', async () => {
      mockRes.statusCode = 400;
      mockJson.mockImplementation((data) => {
        // Simulate error response
        return mockRes;
      });

      const middleware = auditLog({ module: '测试模块' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          operationResult: OperationResult.FAILED,
          resultMessage: '操作失败'
        })
      );
    });

    it('should skip logging when skipLogging is true', async () => {
      const middleware = auditLog({ module: '测试模块', skipLogging: true });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Should not create audit log
      expect(OperationLog.create).not.toHaveBeenCalled();
    });

    it('should handle custom action name', async () => {
      const middleware = auditLog({ module: '测试模块', action: 'custom_action' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'custom_action'
        })
      );
    });

    it('should handle custom resource type', async () => {
      const middleware = auditLog({ module: '测试模块', resourceType: 'custom_resource' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'custom_resource'
        })
      );
    });

    it('should handle database error gracefully', async () => {
      (OperationLog.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const middleware = auditLog({ module: '测试模块' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(logger.error).toHaveBeenCalledWith(
        '审计日志记录失败',
        expect.objectContaining({
          error: 'Database error'
        })
      );
    });

    it('should extract resource ID from path correctly', () => {
      const testPaths = [
        { path: '/api/users/123', expected: '123' },
        { path: '/api/users/123/profile', expected: '123' },
        { path: '/api/users/abc', expected: null },
        { path: '/api/users', expected: null },
        { path: '/api/users/123.456', expected: '123' }
      ];

      testPaths.forEach(({ path, expected }) => {
        mockReq.path = path;
        const middleware = auditLog({ module: '测试模块' });
        
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Simulate response finish
        const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
        if (finishCallback) {
          finishCallback();
        }

        if (expected) {
          expect(OperationLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
              resourceId: expected
            })
          );
        }
      });
    });

    it('should handle different HTTP methods correctly', () => {
      const testMethods = [
        { method: 'GET', expected: OperationType.READ },
        { method: 'POST', expected: OperationType.CREATE },
        { method: 'PUT', expected: OperationType.UPDATE },
        { method: 'PATCH', expected: OperationType.UPDATE },
        { method: 'DELETE', expected: OperationType.DELETE },
        { method: 'OPTIONS', expected: OperationType.OTHER }
      ];

      testMethods.forEach(({ method, expected }) => {
        mockReq.method = method;
        const middleware = auditLog({ module: '测试模块' });
        
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Simulate response finish
        const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
        if (finishCallback) {
          finishCallback();
        }

        expect(OperationLog.create).toHaveBeenCalledWith(
          expect.objectContaining({
            operationType: expected
          })
        );
      });
    });
  });

  describe('auditLogPresets', () => {
    it('should provide preset middlewares for different modules', () => {
      expect(auditLogPresets.student).toBeDefined();
      expect(auditLogPresets.parent).toBeDefined();
      expect(auditLogPresets.teacher).toBeDefined();
      expect(auditLogPresets.user).toBeDefined();
      expect(auditLogPresets.role).toBeDefined();
      expect(auditLogPresets.permission).toBeDefined();
      expect(auditLogPresets.enrollment).toBeDefined();
      expect(auditLogPresets.activity).toBeDefined();
      expect(auditLogPresets.class).toBeDefined();
      expect(auditLogPresets.system).toBeDefined();
      expect(auditLogPresets.dataImport).toBeDefined();
    });

    it('should use correct module names for presets', () => {
      // Test that presets create audit log with correct module names
      const testPreset = auditLogPresets.student;
      
      testPreset(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          module: '学生管理',
          resourceType: 'student'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user object', async () => {
      mockReq.user = undefined;

      const middleware = auditLog({ module: '测试模块' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null
        })
      );
    });

    it('should handle missing IP address', async () => {
      mockReq.ip = undefined;

      const middleware = auditLog({ module: '测试模块' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestIp: null
        })
      );
    });

    it('should handle large request bodies', async () => {
      const largeBody = { data: 'x'.repeat(10000) };
      mockReq.body = largeBody;

      const middleware = auditLog({ module: '测试模块' });
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      const finishCallback = mockOn.mock.calls.find(call => call[0] === 'finish')?.[1];
      if (finishCallback) {
        await finishCallback();
      }

      expect(OperationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestParams: expect.stringContaining('data')
        })
      );
    });
  });
});