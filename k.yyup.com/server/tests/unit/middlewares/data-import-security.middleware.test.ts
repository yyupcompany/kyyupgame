import { 
  DataImportSecurityMiddleware,
  ImportSecurityContext
} from '../../../src/middlewares/data-import-security.middleware';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
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

describe('DataImportSecurityMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      user: { id: 1, role: 'admin' },
      ip: '192.168.1.1',
      get: jest.fn()
    };

    mockJson = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: mockJson,
      locals: {}
    };

    mockNext = jest.fn();

    // Mock logger
    (logger as any).info = jest.fn();
    (logger as any).error = jest.fn();
    (logger as any).warn = jest.fn();
  });

  describe('preImportSecurityCheck', () => {
    it('should pass security check for admin user with small dataset', async () => {
      mockReq.body = {
        importType: 'student',
        data: Array(5).fill({ name: 'Test Student' })
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity).toBeDefined();
      expect(mockReq.importSecurity).toEqual(
        expect.objectContaining({
          userId: 1,
          userRole: 'admin',
          importType: 'student',
          recordCount: 5,
          riskLevel: 'LOW'
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        '数据导入安全检查通过',
        expect.objectContaining({
          userId: 1,
          importType: 'student',
          riskLevel: 'LOW',
          recordCount: 5
        })
      );
    });

    it('should reject unauthorized user', async () => {
      mockReq.user = undefined;

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '用户身份验证失败',
          code: 'AUTHENTICATION_FAILED'
        })
      );
    });

    it('should assess HIGH risk for teacher import with medium dataset', async () => {
      mockReq.body = {
        importType: 'teacher',
        data: Array(50).fill({ name: 'Test Teacher' })
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity.riskLevel).toBe('HIGH');
    });

    it('should assess CRITICAL risk for large dataset', async () => {
      mockReq.body = {
        importType: 'student',
        data: Array(1500).fill({ name: 'Test Student' })
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity.riskLevel).toBe('CRITICAL');
    });

    it('should reject non-admin user for CRITICAL risk operation', async () => {
      mockReq.user = { id: 2, role: 'teacher' };
      mockReq.body = {
        importType: 'student',
        data: Array(1500).fill({ name: 'Test Student' })
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '批量导入超过1000条记录需要管理员权限',
          code: 'IMPORT_PERMISSION_DENIED'
        })
      );
    });

    it('should reject teacher import for non-authorized roles', async () => {
      mockReq.user = { id: 2, role: 'teacher' };
      mockReq.body = {
        importType: 'teacher',
        data: Array(10).fill({ name: 'Test Teacher' })
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '教师数据导入需要管理员或人事经理权限',
          code: 'IMPORT_PERMISSION_DENIED'
        })
      );
    });

    it('should handle single record data', async () => {
      mockReq.body = {
        importType: 'parent',
        data: { name: 'Test Parent', email: 'parent@test.com' }
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity.recordCount).toBe(1);
      expect(mockReq.importSecurity.riskLevel).toBe('MEDIUM');
    });

    it('should handle service error gracefully', async () => {
      // Simulate an error during security check
      const originalMethod = DataImportSecurityMiddleware.preImportSecurityCheck;
      DataImportSecurityMiddleware.preImportSecurityCheck = jest.fn().mockImplementation(() => {
        throw new Error('Security service error');
      });

      try {
        mockReq.body = {
          importType: 'student',
          data: Array(5).fill({ name: 'Test Student' })
        };

        await DataImportSecurityMiddleware.preImportSecurityCheck(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      } catch (error) {
        // Restore original method
        DataImportSecurityMiddleware.preImportSecurityCheck = originalMethod;
        
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: '安全检查失败',
            code: 'SECURITY_CHECK_FAILED'
          })
        );
      }
    });
  });

  describe('assessRiskLevel', () => {
    it('should assess LOW risk for small datasets', () => {
      const smallData = Array(5).fill({});
      const riskLevel = (DataImportSecurityMiddleware as any).assessRiskLevel(smallData, 'student');
      expect(riskLevel).toBe('LOW');
    });

    it('should assess MEDIUM risk for medium datasets', () => {
      const mediumData = Array(50).fill({});
      const riskLevel = (DataImportSecurityMiddleware as any).assessRiskLevel(mediumData, 'student');
      expect(riskLevel).toBe('MEDIUM');
    });

    it('should assess HIGH risk for large datasets', () => {
      const largeData = Array(500).fill({});
      const riskLevel = (DataImportSecurityMiddleware as any).assessRiskLevel(largeData, 'student');
      expect(riskLevel).toBe('HIGH');
    });

    it('should assess CRITICAL risk for very large datasets', () => {
      const veryLargeData = Array(1500).fill({});
      const riskLevel = (DataImportSecurityMiddleware as any).assessRiskLevel(veryLargeData, 'student');
      expect(riskLevel).toBe('CRITICAL');
    });

    it('should assess higher risk for sensitive data types', () => {
      const smallData = Array(5).fill({});
      const teacherRisk = (DataImportSecurityMiddleware as any).assessRiskLevel(smallData, 'teacher');
      const parentRisk = (DataImportSecurityMiddleware as any).assessRiskLevel(smallData, 'parent');
      const studentRisk = (DataImportSecurityMiddleware as any).assessRiskLevel(smallData, 'student');

      expect(teacherRisk).toBe('HIGH');
      expect(parentRisk).toBe('MEDIUM');
      expect(studentRisk).toBe('LOW');
    });
  });

  describe('checkImportPermission', () => {
    it('should allow super_admin for all operations', async () => {
      const permission = await (DataImportSecurityMiddleware as any).checkImportPermission(
        1, 'super_admin', 'student', 'CRITICAL'
      );
      expect(permission.allowed).toBe(true);
    });

    it('should reject non-admin for CRITICAL operations', async () => {
      const permission = await (DataImportSecurityMiddleware as any).checkImportPermission(
        2, 'teacher', 'student', 'CRITICAL'
      );
      expect(permission.allowed).toBe(false);
      expect(permission.reason).toBe('批量导入超过1000条记录需要管理员权限');
    });

    it('should reject non-authorized roles for teacher imports', async () => {
      const permission = await (DataImportSecurityMiddleware as any).checkImportPermission(
        2, 'teacher', 'teacher', 'HIGH'
      );
      expect(permission.allowed).toBe(false);
      expect(permission.reason).toBe('教师数据导入需要管理员或人事经理权限');
    });

    it('should allow admin for teacher imports', async () => {
      const permission = await (DataImportSecurityMiddleware as any).checkImportPermission(
        1, 'admin', 'teacher', 'HIGH'
      );
      expect(permission.allowed).toBe(true);
    });

    it('should allow hr_manager for teacher imports', async () => {
      const permission = await (DataImportSecurityMiddleware as any).checkImportPermission(
        3, 'hr_manager', 'teacher', 'HIGH'
      );
      expect(permission.allowed).toBe(true);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow import within rate limits', async () => {
      const result = await (DataImportSecurityMiddleware as any).checkRateLimit(1, 'student');
      expect(result.allowed).toBe(true);
    });

    it('should reject import exceeding hourly limit', async () => {
      // Mock the getImportCount method to return high count
      (DataImportSecurityMiddleware as any).getImportCount = jest.fn()
        .mockResolvedValueOnce(6)  // hourly count exceeds limit of 5
        .mockResolvedValueOnce(0); // daily count

      const result = await (DataImportSecurityMiddleware as any).checkRateLimit(1, 'student');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('每小时最多导入5次，请稍后再试');
    });

    it('should reject import exceeding daily limit', async () => {
      // Mock the getImportCount method to return high count
      (DataImportSecurityMiddleware as any).getImportCount = jest.fn()
        .mockResolvedValueOnce(0)   // hourly count
        .mockResolvedValueOnce(25); // daily count exceeds limit of 20

      const result = await (DataImportSecurityMiddleware as any).checkRateLimit(1, 'student');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('每天最多导入20次，已达到限制');
    });
  });

  describe('postImportSecurityAudit', () => {
    it('should perform post-import audit', async () => {
      mockReq.importSecurity = {
        userId: 1,
        importType: 'student',
        riskLevel: 'LOW',
        recordCount: 5
      } as ImportSecurityContext;
      
      mockRes.locals.importResult = {
        successCount: 5,
        failureCount: 0
      };

      await DataImportSecurityMiddleware.postImportSecurityAudit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        '数据导入安全审计',
        expect.objectContaining({
          userId: 1,
          importType: 'student',
          riskLevel: 'LOW',
          recordCount: 5,
          successCount: 5,
          failureCount: 0
        })
      );
    });

    it('should handle audit logging error gracefully', async () => {
      mockReq.importSecurity = {
        userId: 1,
        importType: 'student',
        riskLevel: 'LOW',
        recordCount: 5
      } as ImportSecurityContext;
      
      mockRes.locals.importResult = {
        successCount: 5,
        failureCount: 0
      };

      // Mock logger to throw error
      (logger as any).info = jest.fn().mockImplementation(() => {
        throw new Error('Logging error');
      });

      await DataImportSecurityMiddleware.postImportSecurityAudit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        '导入后安全审计失败',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });

    it('should notify for high risk imports', async () => {
      mockReq.importSecurity = {
        userId: 1,
        importType: 'teacher',
        riskLevel: 'HIGH',
        recordCount: 100
      } as ImportSecurityContext;
      
      mockRes.locals.importResult = {
        successCount: 100,
        failureCount: 0
      };

      await DataImportSecurityMiddleware.postImportSecurityAudit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(logger.warn).toHaveBeenCalledWith(
        '高风险数据导入操作',
        expect.objectContaining({
          userId: 1,
          importType: 'teacher',
          riskLevel: 'HIGH',
          recordCount: 100
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing importType in request body', async () => {
      mockReq.body = {
        data: Array(5).fill({ name: 'Test Student' })
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity.importType).toBeUndefined();
    });

    it('should handle missing data in request body', async () => {
      mockReq.body = {
        importType: 'student'
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity.recordCount).toBe(1);
    });

    it('should handle null data in request body', async () => {
      mockReq.body = {
        importType: 'student',
        data: null
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity.recordCount).toBe(1);
    });

    it('should handle undefined user role', async () => {
      mockReq.user = { id: 1 };
      mockReq.body = {
        importType: 'student',
        data: Array(5).fill({ name: 'Test Student' })
      };

      await DataImportSecurityMiddleware.preImportSecurityCheck(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.importSecurity.userRole).toBeUndefined();
    });
  });
});