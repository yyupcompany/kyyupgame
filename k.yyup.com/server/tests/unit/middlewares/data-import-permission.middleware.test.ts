import { 
  DataImportPermissionMiddleware,
  detectImportIntent,
  checkImportPermission,
  requireImportPermission,
  requireAnyImportPermission,
  smartImportPermissionCheck,
  importPermissionPresets
} from '../../../src/middlewares/data-import-permission.middleware';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';
import { DataImportService } from '../../../src/services/data-import.service';
import { ApiError } from '../../../src/utils/apiError';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/services/data-import.service');
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

describe('DataImportPermissionMiddleware', () => {
  let middleware: DataImportPermissionMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    middleware = new DataImportPermissionMiddleware();
    
    mockReq = {
      body: {},
      user: { id: 1, username: 'testuser' }
    };

    mockJson = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: mockJson
    };

    mockNext = jest.fn();

    // Mock logger
    (logger as any).info = jest.fn();
    (logger as any).error = jest.fn();
    (logger as any).warn = jest.fn();
  });

  describe('detectImportIntent', () => {
    it('should detect student import intent', async () => {
      mockReq.body = { query: '导入学生数据' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBe('student');
      expect(logger.info).toHaveBeenCalledWith(
        '检测到数据导入意图',
        expect.objectContaining({
          userId: 1,
          importType: 'student',
          query: '导入学生数据'
        })
      );
    });

    it('should detect parent import intent', async () => {
      mockReq.body = { message: '批量导入家长信息' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBe('parent');
    });

    it('should detect teacher import intent', async () => {
      mockReq.body = { content: '需要导入教师档案' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBe('teacher');
    });

    it('should not detect import intent when no relevant keywords', async () => {
      mockReq.body = { query: '查看学生列表' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBeUndefined();
    });

    it('should handle empty request body', async () => {
      mockReq.body = {};
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBeUndefined();
    });

    it('should handle service error gracefully', async () => {
      (DataImportService.prototype as any).detectImportIntent = jest.fn().mockImplementation(() => {
        throw new Error('Service error');
      });

      mockReq.body = { query: '导入数据' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        '导入意图检测失败',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('checkImportPermission', () => {
    beforeEach(() => {
      (DataImportService.prototype.checkImportPermission as jest.Mock).mockResolvedValue(undefined);
    });

    it('should allow import when permission granted', async () => {
      (mockReq as any).importType = 'student';
      
      await checkImportPermission(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).hasImportPermission).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        '数据导入权限验证通过',
        expect.objectContaining({
          userId: 1,
          importType: 'student'
        })
      );
    });

    it('should deny import when permission rejected', async () => {
      (DataImportService.prototype.checkImportPermission as jest.Mock).mockResolvedValue(undefined);
      (mockReq as any).importType = 'teacher';
      
      await checkImportPermission(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '您没有teacher数据导入权限，请联系管理员',
          code: 'INSUFFICIENT_PERMISSION'
        })
      );
      expect(logger.warn).toHaveBeenCalledWith(
        '用户无数据导入权限',
        expect.objectContaining({
          userId: 1,
          importType: 'teacher'
        })
      );
    });

    it('should skip check when no import type detected', async () => {
      (mockReq as any).importType = undefined;
      
      await checkImportPermission(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(DataImportService.prototype.checkImportPermission).not.toHaveBeenCalled();
    });

    it('should handle unauthorized user', async () => {
      mockReq.user = undefined;
      (mockReq as any).importType = 'student';
      
      await checkImportPermission(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '用户未登录'
        })
      );
    });

    it('should handle service error', async () => {
      (DataImportService.prototype.checkImportPermission as jest.Mock).mockRejectedValue(new Error('Database error'));
      (mockReq as any).importType = 'student';
      
      await checkImportPermission(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        '导入权限检查失败',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('requireImportPermission', () => {
    it('should create middleware for specific import type', async () => {
      (DataImportService.prototype.checkImportPermission as jest.Mock).mockResolvedValue(undefined);
      
      const middleware = requireImportPermission('student');
      await middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle forbidden access', async () => {
      (DataImportService.prototype.checkImportPermission as jest.Mock).mockResolvedValue(undefined);
      
      const middleware = requireImportPermission('teacher');
      await middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should handle unauthorized user', async () => {
      mockReq.user = undefined;
      
      const middleware = requireImportPermission('student');
      await middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requireAnyImportPermission', () => {
    it('should allow user with any import permission', async () => {
      (DataImportService.prototype.checkImportPermission as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      
      await requireAnyImportPermission(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).availableImportTypes).toEqual(['parent']);
    });

    it('should deny user with no import permissions', async () => {
      (DataImportService.prototype.checkImportPermission as jest.Mock)
        .mockResolvedValue(undefined)
        .mockResolvedValue(undefined)
        .mockResolvedValue(undefined);
      
      await requireAnyImportPermission(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should handle unauthorized user', async () => {
      mockReq.user = undefined;
      
      await requireAnyImportPermission(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('smartImportPermissionCheck', () => {
    it('should work as combined middleware array', () => {
      expect(Array.isArray(smartImportPermissionCheck)).toBe(true);
      expect(smartImportPermissionCheck).toHaveLength(2);
      expect(smartImportPermissionCheck[0]).toBe(detectImportIntent);
      expect(smartImportPermissionCheck[1]).toBe(checkImportPermission);
    });
  });

  describe('importPermissionPresets', () => {
    it('should provide preset middlewares for different import types', () => {
      expect(importPermissionPresets.student).toBeDefined();
      expect(importPermissionPresets.parent).toBeDefined();
      expect(importPermissionPresets.teacher).toBeDefined();
      expect(importPermissionPresets.any).toBeDefined();
      
      expect(typeof importPermissionPresets.student).toBe('function');
      expect(typeof importPermissionPresets.parent).toBe('function');
      expect(typeof importPermissionPresets.teacher).toBe('function');
      expect(typeof importPermissionPresets.any).toBe('function');
    });
  });

  describe('getRequiredPermission', () => {
    it('should return correct permission for student import', () => {
      // Access private method through middleware instance
      const permission = (middleware as any).getRequiredPermission('student');
      expect(permission).toBe('STUDENT_CREATE');
    });

    it('should return correct permission for parent import', () => {
      const permission = (middleware as any).getRequiredPermission('parent');
      expect(permission).toBe('PARENT_MANAGE');
    });

    it('should return correct permission for teacher import', () => {
      const permission = (middleware as any).getRequiredPermission('teacher');
      expect(permission).toBe('TEACHER_MANAGE');
    });

    it('should return unknown for invalid import type', () => {
      const permission = (middleware as any).getRequiredPermission('invalid');
      expect(permission).toBe('UNKNOWN');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple import keywords in query', async () => {
      mockReq.body = { query: '需要导入学生和家长数据' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBeDefined();
    });

    it('should handle case insensitive keywords', async () => {
      mockReq.body = { query: 'IMPORT STUDENT DATA' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBe('student');
    });

    it('should handle partial matches correctly', async () => {
      mockReq.body = { query: '学生成绩导入' };
      
      await detectImportIntent(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).importType).toBe('student');
    });

    it('should handle service throwing ApiError', async () => {
      const apiError = new ApiError(500, 'Service unavailable');
      (DataImportService.prototype.checkImportPermission as jest.Mock).mockRejectedValue(apiError);
      (mockReq as any).importType = 'student';
      
      await checkImportPermission(mockReq as any, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        '导入权限检查失败',
        expect.objectContaining({ error: apiError })
      );
    });
  });
});