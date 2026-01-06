// Mock dependencies
jest.mock('../../../src/controllers/migration.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { runMigration } from '../../../src/controllers/migration.controller';
import { getMigrationStatus } from '../../../src/controllers/migration.controller';
import { rollbackMigration } from '../../../src/controllers/migration.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: null
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;


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

describe('Migration Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runMigration', () => {
    it('应该成功运行迁移', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { migrationName: 'add_users_table' };

      await runMigration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { migrationName: 'add_users_table' };
      req.user = null;

      await runMigration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { migrationName: 'add_users_table' };

      // 模拟错误
      const originalRunMigration = runMigration;
      (runMigration as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await runMigration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (runMigration as jest.Mock).mockImplementation(originalRunMigration);
    });
  });
  describe('getMigrationStatus', () => {
    it('应该成功获取迁移状态', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getMigrationStatus(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.user = null;

      await getMigrationStatus(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      // 模拟错误
      const originalGetMigrationStatus = getMigrationStatus;
      (getMigrationStatus as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getMigrationStatus(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getMigrationStatus as jest.Mock).mockImplementation(originalGetMigrationStatus);
    });
  });
  describe('rollbackMigration', () => {
    it('应该成功回滚迁移', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { migrationName: 'add_users_table' };

      await rollbackMigration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { migrationName: 'add_users_table' };
      req.user = null;

      await rollbackMigration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { migrationName: 'add_users_table' };

      // 模拟错误
      const originalRollbackMigration = rollbackMigration;
      (rollbackMigration as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await rollbackMigration(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (rollbackMigration as jest.Mock).mockImplementation(originalRollbackMigration);
    });
  });
});