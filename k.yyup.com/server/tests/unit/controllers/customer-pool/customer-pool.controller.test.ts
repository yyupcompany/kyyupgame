// Mock dependencies
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { 
  createCustomer, 
  getCustomers, 
  getCustomerById, 
  updateCustomer, 
  deleteCustomer,
  assignCustomer,
  getCustomerStats
} from '../../../src/controllers/customer-pool/customer-pool.controller';
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

describe('Customer Pool Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('应该成功创建客户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        source: 'web',
        type: 'potential',
        kindergartenId: 1
      };
      req.user = { id: 1 };

      await createCustomer(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的创建请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '张三',
        phone: '13800138000'
      };
      req.user = null;

      await createCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证客户姓名不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少name
        phone: '13800138000',
        email: 'zhangsan@example.com'
      };
      req.user = { id: 1 };

      await createCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '张三',
        phone: '13800138000'
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalCreateCustomer = createCustomer;
      (createCustomer as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (createCustomer as jest.Mock).mockImplementation(originalCreateCustomer);
    });
  });

  describe('getCustomers', () => {
    it('应该成功获取客户列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        limit: '10',
        type: 'potential',
        source: 'web'
      };
      req.user = { id: 1 };

      await getCustomers(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该使用默认分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {}; // 缺少分页参数
      req.user = { id: 1 };

      await getCustomers(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { page: '1', limit: '10' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetCustomers = getCustomers;
      (getCustomers as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCustomers(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getCustomers as jest.Mock).mockImplementation(originalGetCustomers);
    });
  });

  describe('getCustomerById', () => {
    it('应该成功获取客户详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await getCustomerById(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该验证客户ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await getCustomerById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetCustomerById = getCustomerById;
      (getCustomerById as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCustomerById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getCustomerById as jest.Mock).mockImplementation(originalGetCustomerById);
    });
  });

  describe('updateCustomer', () => {
    it('应该成功更新客户信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        name: '李四',
        phone: '13900139000',
        type: 'converted'
      };
      req.user = { id: 1 };

      await updateCustomer(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的更新请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { name: '李四' };
      req.user = null;

      await updateCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证客户ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.body = { name: '李四' };
      req.user = { id: 1 };

      await updateCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { name: '李四' };
      req.user = { id: 1 };

      // 模拟错误
      const originalUpdateCustomer = updateCustomer;
      (updateCustomer as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (updateCustomer as jest.Mock).mockImplementation(originalUpdateCustomer);
    });
  });

  describe('deleteCustomer', () => {
    it('应该成功删除客户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await deleteCustomer(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的删除请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = null;

      await deleteCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证客户ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await deleteCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟错误
      const originalDeleteCustomer = deleteCustomer;
      (deleteCustomer as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await deleteCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (deleteCustomer as jest.Mock).mockImplementation(originalDeleteCustomer);
    });
  });

  describe('assignCustomer', () => {
    it('应该成功分配客户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        customerId: 1,
        teacherId: 1,
        assignType: 'manual'
      };
      req.user = { id: 1 };

      await assignCustomer(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的分配请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        customerId: 1,
        teacherId: 1
      };
      req.user = null;

      await assignCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证客户ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少customerId
        teacherId: 1
      };
      req.user = { id: 1 };

      await assignCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该验证教师ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        customerId: 1
        // 缺少teacherId
      };
      req.user = { id: 1 };

      await assignCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        customerId: 1,
        teacherId: 1
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalAssignCustomer = assignCustomer;
      (assignCustomer as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await assignCustomer(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (assignCustomer as jest.Mock).mockImplementation(originalAssignCustomer);
    });
  });

  describe('getCustomerStats', () => {
    it('应该成功获取客户统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        timeRange: 'month',
        kindergartenId: '1'
      };
      req.user = { id: 1 };

      await getCustomerStats(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该使用默认时间范围', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {}; // 缺少时间范围
      req.user = { id: 1 };

      await getCustomerStats(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { timeRange: 'month' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetCustomerStats = getCustomerStats;
      (getCustomerStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCustomerStats(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getCustomerStats as jest.Mock).mockImplementation(originalGetCustomerStats);
    });
  });
});