import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock Express types
const mockRequest = {
  params: {},
  query: {},
  body: {},
  headers: {},
  user: { id: 1, role: 'admin' },
  method: 'GET',
  url: '/api/users',
  path: '/api/users'
} as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  locals: {}
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock Sequelize model
const mockModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn(),
  bulkUpdate: jest.fn(),
  bulkDestroy: jest.fn()
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock validation
const mockValidation = {
  validate: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));


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

describe('CRUD Factory Middleware', () => {
  let crudFactory: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/crud-factory.middleware');
    crudFactory = imported.default || imported.crudFactory || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock objects
    mockRequest.params = {};
    mockRequest.query = {};
    mockRequest.body = {};
    mockRequest.headers = {};
    mockRequest.user = { id: 1, role: 'admin' };
    mockResponse.locals = {};
  });

  describe('createCRUDMiddleware', () => {
    it('应该创建CRUD中间件工厂', () => {
      expect(typeof crudFactory).toBe('function');
    });

    it('应该返回CRUD操作对象', () => {
      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        validation: mockValidation
      });

      expect(crudMiddleware).toHaveProperty('list');
      expect(crudMiddleware).toHaveProperty('get');
      expect(crudMiddleware).toHaveProperty('create');
      expect(crudMiddleware).toHaveProperty('update');
      expect(crudMiddleware).toHaveProperty('delete');
      expect(typeof crudMiddleware.list).toBe('function');
      expect(typeof crudMiddleware.get).toBe('function');
      expect(typeof crudMiddleware.create).toBe('function');
      expect(typeof crudMiddleware.update).toBe('function');
      expect(typeof crudMiddleware.delete).toBe('function');
    });
  });

  describe('List Operation', () => {
    it('应该处理列表查询', async () => {
      const mockData = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ];
      mockModel.findAndCountAll.mockResolvedValue({
        rows: mockData,
        count: 2
      });

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.query = { page: '1', pageSize: '10' };

      await crudMiddleware.list(mockRequest, mockResponse, mockNext);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1
        }
      });
    });

    it('应该处理搜索查询', async () => {
      const mockData = [{ id: 1, name: 'John Doe' }];
      mockModel.findAndCountAll.mockResolvedValue({
        rows: mockData,
        count: 1
      });

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        searchFields: ['name', 'email']
      });
      
      mockRequest.query = { search: 'John' };

      await crudMiddleware.list(mockRequest, mockResponse, mockNext);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Symbol.for('or')]: expect.any(Array)
          })
        })
      );
    });

    it('应该处理排序参数', async () => {
      const mockData = [{ id: 1, name: 'User 1' }];
      mockModel.findAndCountAll.mockResolvedValue({
        rows: mockData,
        count: 1
      });

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.query = { sortBy: 'name', sortOrder: 'asc' };

      await crudMiddleware.list(mockRequest, mockResponse, mockNext);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['name', 'ASC']]
        })
      );
    });

    it('应该处理筛选条件', async () => {
      const mockData = [{ id: 1, name: 'Active User' }];
      mockModel.findAndCountAll.mockResolvedValue({
        rows: mockData,
        count: 1
      });

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        filterFields: ['status', 'role']
      });
      
      mockRequest.query = { status: 'active', role: 'admin' };

      await crudMiddleware.list(mockRequest, mockResponse, mockNext);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
            role: 'admin'
          })
        })
      );
    });

    it('应该处理关联查询', async () => {
      const mockData = [{ id: 1, name: 'User 1', profile: { bio: 'Bio' } }];
      mockModel.findAndCountAll.mockResolvedValue({
        rows: mockData,
        count: 1
      });

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        include: ['profile', 'roles']
      });

      await crudMiddleware.list(mockRequest, mockResponse, mockNext);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: ['profile', 'roles']
        })
      );
    });
  });

  describe('Get Operation', () => {
    it('应该获取单个记录', async () => {
      const mockData = { id: 1, name: 'User 1' };
      mockModel.findByPk.mockResolvedValue(mockData);

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.params = { id: '1' };

      await crudMiddleware.get(mockRequest, mockResponse, mockNext);

      expect(mockModel.findByPk).toHaveBeenCalledWith('1', {});
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });

    it('应该处理记录不存在', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.params = { id: '999' };

      await crudMiddleware.get(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('应该包含关联数据', async () => {
      const mockData = { id: 1, name: 'User 1', profile: { bio: 'Bio' } };
      mockModel.findByPk.mockResolvedValue(mockData);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        include: ['profile']
      });
      
      mockRequest.params = { id: '1' };

      await crudMiddleware.get(mockRequest, mockResponse, mockNext);

      expect(mockModel.findByPk).toHaveBeenCalledWith('1', {
        include: ['profile']
      });
    });
  });

  describe('Create Operation', () => {
    it('应该创建新记录', async () => {
      const createData = { name: 'New User', email: 'user@example.com' };
      const mockCreatedData = { id: 1, ...createData };
      
      mockValidation.validate.mockResolvedValue({ error: null, value: createData });
      mockModel.create.mockResolvedValue(mockCreatedData);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        validation: mockValidation
      });
      
      mockRequest.body = createData;

      await crudMiddleware.create(mockRequest, mockResponse, mockNext);

      expect(mockValidation.validate).toHaveBeenCalledWith(createData);
      expect(mockModel.create).toHaveBeenCalledWith(createData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedData,
        message: 'User created successfully'
      });
    });

    it('应该处理验证错误', async () => {
      const createData = { name: '', email: 'invalid-email' };
      const validationError = {
        error: {
          details: [
            { message: 'Name is required' },
            { message: 'Email format is invalid' }
          ]
        }
      };
      
      mockValidation.validate.mockResolvedValue(validationError);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        validation: mockValidation
      });
      
      mockRequest.body = createData;

      await crudMiddleware.create(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: validationError.error.details
      });
      expect(mockModel.create).not.toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      const createData = { name: 'User', email: 'user@example.com' };
      const dbError = new Error('Database constraint violation');
      
      mockValidation.validate.mockResolvedValue({ error: null, value: createData });
      mockModel.create.mockRejectedValue(dbError);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        validation: mockValidation
      });
      
      mockRequest.body = createData;

      await crudMiddleware.create(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it('应该处理权限检查', async () => {
      const createData = { name: 'User', email: 'user@example.com' };
      
      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        permissions: {
          create: (req: Request) => req.user?.role === 'admin'
        }
      });
      
      mockRequest.user = { id: 1, role: 'user' }; // 非管理员
      mockRequest.body = createData;

      await crudMiddleware.create(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission denied'
      });
    });
  });

  describe('Update Operation', () => {
    it('应该更新记录', async () => {
      const updateData = { name: 'Updated User' };
      const existingData = { id: 1, name: 'Old User', email: 'user@example.com' };
      const updatedData = { ...existingData, ...updateData };
      
      mockModel.findByPk.mockResolvedValue(existingData);
      mockValidation.validate.mockResolvedValue({ error: null, value: updateData });
      mockModel.update.mockResolvedValue([1]);
      mockModel.findByPk.mockResolvedValueOnce(updatedData);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        validation: mockValidation
      });
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      await crudMiddleware.update(mockRequest, mockResponse, mockNext);

      expect(mockModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: '1' }
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedData,
        message: 'User updated successfully'
      });
    });

    it('应该处理记录不存在', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Updated User' };

      await crudMiddleware.update(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('应该处理部分更新', async () => {
      const updateData = { name: 'Updated Name' };
      const existingData = { id: 1, name: 'Old Name', email: 'user@example.com' };
      
      mockModel.findByPk.mockResolvedValue(existingData);
      mockValidation.validate.mockResolvedValue({ error: null, value: updateData });
      mockModel.update.mockResolvedValue([1]);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        validation: mockValidation,
        allowPartialUpdate: true
      });
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      await crudMiddleware.update(mockRequest, mockResponse, mockNext);

      expect(mockModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: '1' }
      });
    });
  });

  describe('Delete Operation', () => {
    it('应该删除记录', async () => {
      const existingData = { id: 1, name: 'User to Delete' };
      
      mockModel.findByPk.mockResolvedValue(existingData);
      mockModel.destroy.mockResolvedValue(1);

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.params = { id: '1' };

      await crudMiddleware.delete(mockRequest, mockResponse, mockNext);

      expect(mockModel.destroy).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully'
      });
    });

    it('应该处理记录不存在', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.params = { id: '999' };

      await crudMiddleware.delete(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('应该处理软删除', async () => {
      const existingData = { id: 1, name: 'User', deletedAt: null };
      
      mockModel.findByPk.mockResolvedValue(existingData);
      mockModel.update.mockResolvedValue([1]);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        softDelete: true
      });
      
      mockRequest.params = { id: '1' };

      await crudMiddleware.delete(mockRequest, mockResponse, mockNext);

      expect(mockModel.update).toHaveBeenCalledWith(
        { deletedAt: expect.any(Date) },
        { where: { id: '1' } }
      );
    });

    it('应该处理级联删除', async () => {
      const existingData = { id: 1, name: 'User' };
      
      mockModel.findByPk.mockResolvedValue(existingData);
      mockModel.destroy.mockResolvedValue(1);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        cascadeDelete: ['profile', 'posts']
      });
      
      mockRequest.params = { id: '1' };

      await crudMiddleware.delete(mockRequest, mockResponse, mockNext);

      expect(mockModel.destroy).toHaveBeenCalledWith({
        where: { id: '1' },
        cascade: true
      });
    });
  });

  describe('Bulk Operations', () => {
    it('应该处理批量创建', async () => {
      const bulkData = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' }
      ];
      const createdData = bulkData.map((item, index) => ({ id: index + 1, ...item }));
      
      mockModel.bulkCreate.mockResolvedValue(createdData);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        enableBulkOperations: true
      });
      
      mockRequest.body = { items: bulkData };

      await crudMiddleware.bulkCreate(mockRequest, mockResponse, mockNext);

      expect(mockModel.bulkCreate).toHaveBeenCalledWith(bulkData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdData,
        message: `${createdData.length} Users created successfully`
      });
    });

    it('应该处理批量更新', async () => {
      const updateData = { status: 'active' };
      const ids = [1, 2, 3];
      
      mockModel.update.mockResolvedValue([3]);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        enableBulkOperations: true
      });
      
      mockRequest.body = { ids, data: updateData };

      await crudMiddleware.bulkUpdate(mockRequest, mockResponse, mockNext);

      expect(mockModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: { [Symbol.for('in')]: ids } }
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '3 Users updated successfully'
      });
    });

    it('应该处理批量删除', async () => {
      const ids = [1, 2, 3];
      
      mockModel.destroy.mockResolvedValue(3);

      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        enableBulkOperations: true
      });
      
      mockRequest.body = { ids };

      await crudMiddleware.bulkDelete(mockRequest, mockResponse, mockNext);

      expect(mockModel.destroy).toHaveBeenCalledWith({
        where: { id: { [Symbol.for('in')]: ids } }
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '3 Users deleted successfully'
      });
    });
  });

  describe('Error Handling', () => {
    it('应该处理数据库连接错误', async () => {
      const dbError = new Error('Database connection failed');
      mockModel.findAndCountAll.mockRejectedValue(dbError);

      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });

      await crudMiddleware.list(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('CRUD operation failed'),
        expect.objectContaining({
          operation: 'list',
          model: 'User',
          error: dbError.message
        })
      );
    });

    it('应该处理权限错误', async () => {
      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        permissions: {
          list: () => false
        }
      });

      await crudMiddleware.list(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permission denied'
      });
    });

    it('应该处理无效参数', async () => {
      const crudMiddleware = crudFactory(mockModel, { modelName: 'User' });
      
      mockRequest.params = { id: 'invalid-id' };

      await crudMiddleware.get(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Hooks and Middleware', () => {
    it('应该执行前置钩子', async () => {
      const beforeHook = jest.fn().mockResolvedValue(undefined);
      
      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        hooks: {
          beforeCreate: beforeHook
        }
      });
      
      mockRequest.body = { name: 'User', email: 'user@example.com' };
      mockModel.create.mockResolvedValue({ id: 1, ...mockRequest.body });

      await crudMiddleware.create(mockRequest, mockResponse, mockNext);

      expect(beforeHook).toHaveBeenCalledWith(mockRequest.body, mockRequest);
    });

    it('应该执行后置钩子', async () => {
      const afterHook = jest.fn().mockResolvedValue(undefined);
      const createdData = { id: 1, name: 'User', email: 'user@example.com' };
      
      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        hooks: {
          afterCreate: afterHook
        }
      });
      
      mockRequest.body = { name: 'User', email: 'user@example.com' };
      mockModel.create.mockResolvedValue(createdData);

      await crudMiddleware.create(mockRequest, mockResponse, mockNext);

      expect(afterHook).toHaveBeenCalledWith(createdData, mockRequest);
    });

    it('应该处理钩子中的错误', async () => {
      const hookError = new Error('Hook execution failed');
      const beforeHook = jest.fn().mockRejectedValue(hookError);
      
      const crudMiddleware = crudFactory(mockModel, {
        modelName: 'User',
        hooks: {
          beforeCreate: beforeHook
        }
      });
      
      mockRequest.body = { name: 'User', email: 'user@example.com' };

      await crudMiddleware.create(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(hookError);
      expect(mockModel.create).not.toHaveBeenCalled();
    });
  });
});
