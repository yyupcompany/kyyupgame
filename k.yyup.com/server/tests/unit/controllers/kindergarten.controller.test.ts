// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/validator');
jest.mock('../../../src/validations/kindergarten.validation');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { KindergartenController } from '../../../src/controllers/kindergarten.controller';
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { validateRequest } from '../../../src/utils/validator';
import { RequestWithUser } from '../../../src/types/express';

// Mock implementations
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'testuser' }
} as Partial<RequestWithUser>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


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

describe('Kindergarten Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('create', () => {
    it('应该成功创建幼儿园', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '阳光幼儿园',
        address: '北京市朝阳区',
        phone: '010-12345678',
        principal: '张园长',
        code: 'SUNSHINE_KG',
        type: 1,
        level: 2
      };

      const mockInsertResult = [{ insertId: 1 }];
      const mockKindergarten = {
        id: 1,
        name: '阳光幼儿园',
        code: 'SUNSHINE_KG',
        address: '北京市朝阳区',
        phone: '010-12345678',
        principal: '张园长'
      };

      mockSequelize.query
        .mockResolvedValueOnce(mockInsertResult) // INSERT query
        .mockResolvedValueOnce([mockKindergarten]); // SELECT query

      await KindergartenController.create(req as RequestWithUser, res as Response);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '幼儿园创建成功',
        data: mockKindergarten
      });
    });

    it('应该验证必需字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '阳光幼儿园',
        address: '北京市朝阳区'
        // 缺少phone和principal
      };

      await KindergartenController.create(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '缺少必要字段：name, address, phone, principal'
      });
    });

    it('应该使用默认值填充可选字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '简单幼儿园',
        address: '上海市浦东新区',
        phone: '021-87654321',
        principal: '李园长'
      };

      const mockInsertResult = [{ insertId: 1 }];
      const mockKindergarten = { id: 1, name: '简单幼儿园' };

      mockSequelize.query
        .mockResolvedValueOnce(mockInsertResult)
        .mockResolvedValueOnce([mockKindergarten]);

      await KindergartenController.create(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenNthCalledWith(1,
        expect.stringContaining('INSERT INTO kindergartens'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            code: expect.stringMatching(/^KG_\d+$/),
            type: 1,
            level: 1,
            longitude: 116.4074,
            latitude: 39.9042,
            email: expect.stringMatching(/^\d+@example\.com$/),
            area: 1000,
            buildingArea: 800,
            classCount: 0,
            teacherCount: 0,
            studentCount: 0
          })
        })
      );
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '测试幼儿园',
        address: '测试地址',
        phone: '123456789',
        principal: '测试园长'
      };

      const dbError = new Error('Database connection failed');
      mockSequelize.query.mockRejectedValue(dbError);

      await KindergartenController.create(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '创建幼儿园失败'
      });
    });

    it('应该处理重复的幼儿园代码', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '重复幼儿园',
        code: 'EXISTING_CODE',
        address: '测试地址',
        phone: '123456789',
        principal: '测试园长'
      };

      const duplicateError = new Error('Duplicate entry');
      (duplicateError as any).code = 'ER_DUP_ENTRY';
      mockSequelize.query.mockRejectedValue(duplicateError);

      await KindergartenController.create(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: '幼儿园代码已存在'
      });
    });
  });

  describe('getAll', () => {
    it('应该成功获取幼儿园列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10'
      };

      const mockKindergartens = [
        { id: 1, name: '阳光幼儿园', address: '北京市朝阳区' },
        { id: 2, name: '彩虹幼儿园', address: '上海市浦东新区' }
      ];

      const mockCountResult = [{ total: 2 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult) // COUNT query
        .mockResolvedValueOnce(mockKindergartens); // SELECT query

      await KindergartenController.getAll(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          kindergartens: mockKindergartens,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      });
    });

    it('应该支持搜索功能', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        search: '阳光',
        page: '1',
        pageSize: '10'
      };

      const mockKindergartens = [
        { id: 1, name: '阳光幼儿园', address: '北京市朝阳区' }
      ];

      const mockCountResult = [{ total: 1 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockKindergartens);

      await KindergartenController.getAll(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenNthCalledWith(1,
        expect.stringContaining('WHERE (name LIKE :search OR address LIKE :search)'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            search: '%阳光%'
          })
        })
      );
    });

    it('应该处理分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '2',
        pageSize: '5'
      };

      mockSequelize.query
        .mockResolvedValueOnce([{ total: 12 }])
        .mockResolvedValueOnce([]);

      await KindergartenController.getAll(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('LIMIT 5 OFFSET 5'),
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          kindergartens: [],
          total: 12,
          page: 2,
          pageSize: 5,
          totalPages: 3
        }
      });
    });

    it('应该处理无效的分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: 'invalid',
        pageSize: '-1'
      };

      mockSequelize.query
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([]);

      await KindergartenController.getAll(req as RequestWithUser, res as Response);

      // 应该使用默认值
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          kindergartens: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }
      });
    });
  });

  describe('getById', () => {
    it('应该成功获取幼儿园详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockKindergarten = {
        id: 1,
        name: '阳光幼儿园',
        address: '北京市朝阳区',
        phone: '010-12345678',
        principal: '张园长',
        classCount: 5,
        teacherCount: 15,
        studentCount: 120
      };

      mockSequelize.query.mockResolvedValue([mockKindergarten]);

      await KindergartenController.getById(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM kindergartens WHERE id = :id'),
        {
          replacements: { id: 1 },
          type: 'SELECT'
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockKindergarten
      });
    });

    it('应该处理幼儿园不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSequelize.query.mockResolvedValue([]);

      await KindergartenController.getById(req as RequestWithUser, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'NOT_FOUND',
        message: '幼儿园不存在'
      });
    });

    it('应该验证ID格式', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await KindergartenController.getById(req as RequestWithUser, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的幼儿园ID'
      });
    });
  });

  describe('update', () => {
    it('应该成功更新幼儿园信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        name: '更新的幼儿园',
        address: '更新的地址',
        phone: '010-87654321'
      };

      const mockExistingKindergarten = [{ id: 1, name: '原幼儿园' }];
      const mockUpdatedKindergarten = {
        id: 1,
        name: '更新的幼儿园',
        address: '更新的地址',
        phone: '010-87654321'
      };

      mockSequelize.query
        .mockResolvedValueOnce(mockExistingKindergarten) // 检查存在
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE query
        .mockResolvedValueOnce([mockUpdatedKindergarten]); // SELECT updated

      await KindergartenController.update(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(3);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '幼儿园信息更新成功',
        data: mockUpdatedKindergarten
      });
    });

    it('应该处理更新不存在的幼儿园', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { name: '不存在的幼儿园' };

      mockSequelize.query.mockResolvedValue([]); // 幼儿园不存在

      await KindergartenController.update(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'NOT_FOUND',
        message: '幼儿园不存在'
      });
    });

    it('应该防止更新敏感字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        name: '更新的幼儿园',
        id: 999, // 尝试更新ID
        created_at: new Date(), // 尝试更新创建时间
        updated_at: new Date() // 尝试更新修改时间
      };

      const mockExistingKindergarten = [{ id: 1, name: '原幼儿园' }];

      mockSequelize.query
        .mockResolvedValueOnce(mockExistingKindergarten)
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ id: 1, name: '更新的幼儿园' }]);

      await KindergartenController.update(req as RequestWithUser, res as Response);

      // 验证UPDATE查询不包含敏感字段
      expect(mockSequelize.query).toHaveBeenNthCalledWith(2,
        expect.not.stringContaining('id ='),
        expect.any(Object)
      );
      expect(mockSequelize.query).toHaveBeenNthCalledWith(2,
        expect.not.stringContaining('created_at ='),
        expect.any(Object)
      );
    });
  });

  describe('delete', () => {
    it('应该成功删除幼儿园', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingKindergarten = [{ id: 1, name: '待删除幼儿园' }];

      mockSequelize.query
        .mockResolvedValueOnce(mockExistingKindergarten) // 检查存在
        .mockResolvedValueOnce([{ count: 0 }]) // 检查关联数据
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE query

      await KindergartenController.delete(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(3);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '幼儿园删除成功'
      });
    });

    it('应该阻止删除有关联数据的幼儿园', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingKindergarten = [{ id: 1, name: '有关联数据的幼儿园' }];

      mockSequelize.query
        .mockResolvedValueOnce(mockExistingKindergarten)
        .mockResolvedValueOnce([{ count: 5 }]); // 有关联的学生

      await KindergartenController.delete(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'CONFLICT',
        message: '幼儿园下还有学生或教师，无法删除'
      });
    });

    it('应该处理删除不存在的幼儿园', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSequelize.query.mockResolvedValue([]); // 幼儿园不存在

      await KindergartenController.delete(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'NOT_FOUND',
        message: '幼儿园不存在'
      });
    });
  });
});
