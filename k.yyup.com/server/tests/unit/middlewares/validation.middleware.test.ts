import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn(),
  string: jest.fn(),
  number: jest.fn(),
  boolean: jest.fn(),
  array: jest.fn(),
  date: jest.fn(),
  any: jest.fn(),
  valid: jest.fn(),
  required: jest.fn(),
  optional: jest.fn(),
  min: jest.fn(),
  max: jest.fn(),
  email: jest.fn(),
  pattern: jest.fn(),
  validate: jest.fn()
};

// Mock chain methods
const mockChain = {
  required: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  max: jest.fn().mockReturnThis(),
  email: jest.fn().mockReturnThis(),
  pattern: jest.fn().mockReturnThis(),
  valid: jest.fn().mockReturnThis(),
  messages: jest.fn().mockReturnThis()
};

// Setup mock chain for all Joi methods
Object.keys(mockJoi).forEach(key => {
  if (typeof mockJoi[key] === 'function') {
    mockJoi[key].mockReturnValue(mockChain);
  }
});

// Mock imports
jest.unstable_mockModule('joi', () => mockJoi);

jest.unstable_mockModule('../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('Validation Middleware', () => {
  let validationMiddleware: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/validation.middleware');
    validationMiddleware = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {},
      method: 'POST',
      path: '/test'
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('validateBody', () => {
    it('应该验证有效的请求体数据', async () => {
      const schema = mockJoi.object();
      const validData = {
        name: '测试用户',
        email: 'test@example.com',
        age: 25
      };

      mockReq.body = validData;
      
      // Mock successful validation
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validData
      });

      const middleware = validationMiddleware.validateBody(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, schema);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝无效的请求体数据', async () => {
      const schema = mockJoi.object();
      const invalidData = {
        name: '',
        email: 'invalid-email',
        age: -1
      };

      mockReq.body = invalidData;
      
      // Mock validation error
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"name" is not allowed to be empty',
              path: ['name'],
              type: 'string.empty'
            },
            {
              message: '"email" must be a valid email',
              path: ['email'],
              type: 'string.email'
            },
            {
              message: '"age" must be a positive number',
              path: ['age'],
              type: 'number.positive'
            }
          ]
        },
        value: invalidData
      });

      const middleware = validationMiddleware.validateBody(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('验证失败'),
          statusCode: 400,
          details: expect.any(Array)
        })
      );
    });

    it('应该处理空请求体', async () => {
      const schema = mockJoi.object();
      mockReq.body = {};
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: {}
      });

      const middleware = validationMiddleware.validateBody(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该支持自定义错误消息', async () => {
      const schema = mockJoi.object();
      const options = {
        messages: {
          'string.empty': '字段不能为空',
          'string.email': '邮箱格式不正确'
        }
      };

      mockReq.body = { name: '', email: 'invalid' };
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '字段不能为空',
              path: ['name'],
              type: 'string.empty'
            }
          ]
        },
        value: mockReq.body
      });

      const middleware = validationMiddleware.validateBody(schema, options);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(mockReq.body, schema, options);
    });
  });

  describe('validateParams', () => {
    it('应该验证有效的路径参数', async () => {
      const schema = mockJoi.object();
      const validParams = {
        id: '123',
        userId: '456'
      };

      mockReq.params = validParams;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: { id: 123, userId: 456 }
      });

      const middleware = validationMiddleware.validateParams(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validParams, schema);
      expect(mockReq.params).toEqual({ id: 123, userId: 456 });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝无效的路径参数', async () => {
      const schema = mockJoi.object();
      const invalidParams = {
        id: 'invalid',
        userId: '-1'
      };

      mockReq.params = invalidParams;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"id" must be a number',
              path: ['id'],
              type: 'number.base'
            },
            {
              message: '"userId" must be a positive number',
              path: ['userId'],
              type: 'number.positive'
            }
          ]
        },
        value: invalidParams
      });

      const middleware = validationMiddleware.validateParams(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('参数验证失败'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateQuery', () => {
    it('应该验证有效的查询参数', async () => {
      const schema = mockJoi.object();
      const validQuery = {
        page: '1',
        pageSize: '10',
        search: 'test',
        status: 'active'
      };

      mockReq.query = validQuery;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: {
          page: 1,
          pageSize: 10,
          search: 'test',
          status: 'active'
        }
      });

      const middleware = validationMiddleware.validateQuery(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validQuery, schema);
      expect(mockReq.query).toEqual({
        page: 1,
        pageSize: 10,
        search: 'test',
        status: 'active'
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝无效的查询参数', async () => {
      const schema = mockJoi.object();
      const invalidQuery = {
        page: '0',
        pageSize: '101',
        sortOrder: 'invalid'
      };

      mockReq.query = invalidQuery;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"page" must be greater than or equal to 1',
              path: ['page'],
              type: 'number.min'
            },
            {
              message: '"pageSize" must be less than or equal to 100',
              path: ['pageSize'],
              type: 'number.max'
            },
            {
              message: '"sortOrder" must be one of [asc, desc]',
              path: ['sortOrder'],
              type: 'any.only'
            }
          ]
        },
        value: invalidQuery
      });

      const middleware = validationMiddleware.validateQuery(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('查询参数验证失败'),
          statusCode: 400
        })
      );
    });

    it('应该设置默认查询参数', async () => {
      const schema = mockJoi.object();
      mockReq.query = {};
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: {
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      const middleware = validationMiddleware.validateQuery(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.query).toEqual({
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });
  });

  describe('validateHeaders', () => {
    it('应该验证有效的请求头', async () => {
      const schema = mockJoi.object();
      const validHeaders = {
        'content-type': 'application/json',
        'authorization': 'Bearer token123',
        'x-api-version': '1.0'
      };

      mockReq.headers = validHeaders;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validHeaders
      });

      const middleware = validationMiddleware.validateHeaders(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validHeaders, schema);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝无效的请求头', async () => {
      const schema = mockJoi.object();
      const invalidHeaders = {
        'content-type': 'invalid/type',
        'x-api-version': '999'
      };

      mockReq.headers = invalidHeaders;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"content-type" must be application/json',
              path: ['content-type'],
              type: 'any.only'
            },
            {
              message: '"x-api-version" must be a valid version',
              path: ['x-api-version'],
              type: 'string.pattern.base'
            }
          ]
        },
        value: invalidHeaders
      });

      const middleware = validationMiddleware.validateHeaders(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('请求头验证失败'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateAll', () => {
    it('应该同时验证多个部分', async () => {
      const schemas = {
        body: mockJoi.object(),
        params: mockJoi.object(),
        query: mockJoi.object()
      };

      mockReq.body = { name: '测试' };
      mockReq.params = { id: '123' };
      mockReq.query = { page: '1' };
      
      mockJoi.validate
        .mockReturnValueOnce({ error: null, value: { name: '测试' } })
        .mockReturnValueOnce({ error: null, value: { id: 123 } })
        .mockReturnValueOnce({ error: null, value: { page: 1 } });

      const middleware = validationMiddleware.validateAll(schemas);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在任一部分验证失败时停止', async () => {
      const schemas = {
        body: mockJoi.object(),
        params: mockJoi.object()
      };

      mockReq.body = { name: '' };
      mockReq.params = { id: '123' };
      
      mockJoi.validate
        .mockReturnValueOnce({
          error: {
            details: [{ message: '"name" is required', path: ['name'] }]
          },
          value: { name: '' }
        });

      const middleware = validationMiddleware.validateAll(schemas);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400
        })
      );
    });
  });

  describe('createValidator', () => {
    it('应该创建自定义验证器', async () => {
      const customSchema = mockJoi.object();
      const customOptions = {
        allowUnknown: true,
        stripUnknown: true
      };

      const validator = validationMiddleware.createValidator(customSchema, customOptions);
      
      mockReq.body = { name: '测试', extra: '额外字段' };
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: { name: '测试' }
      });

      await validator(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(
        mockReq.body,
        customSchema,
        customOptions
      );
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该支持异步验证', async () => {
      const asyncSchema = mockJoi.object();
      const validator = validationMiddleware.createValidator(asyncSchema);
      
      mockReq.body = { email: 'test@example.com' };
      
      // 模拟异步验证
      mockJoi.validate.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ error: null, value: { email: 'test@example.com' } });
          }, 10);
        });
      });

      await validator(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('conditionalValidation', () => {
    it('应该根据条件执行验证', async () => {
      const schema = mockJoi.object();
      const condition = (req: any) => req.method === 'POST';

      mockReq.method = 'POST';
      mockReq.body = { name: '测试' };
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: { name: '测试' }
      });

      const middleware = validationMiddleware.conditionalValidation(condition, schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该在条件不满足时跳过验证', async () => {
      const schema = mockJoi.object();
      const condition = (req: any) => req.method === 'POST';

      mockReq.method = 'GET';
      mockReq.body = { name: '' };

      const middleware = validationMiddleware.conditionalValidation(condition, schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('sanitizeInput', () => {
    it('应该清理输入数据', async () => {
      const sanitizers = {
        trim: true,
        lowercase: ['email'],
        escape: ['name', 'description']
      };

      mockReq.body = {
        name: '  <script>alert("xss")</script>测试  ',
        email: '  TEST@EXAMPLE.COM  ',
        description: '<p>描述内容</p>'
      };

      const middleware = validationMiddleware.sanitizeInput(sanitizers);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual({
        name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;测试',
        email: 'test@example.com',
        description: '&lt;p&gt;描述内容&lt;/p&gt;'
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该支持自定义清理函数', async () => {
      const sanitizers = {
        custom: {
          phone: (value: string) => value.replace(/\D/g, '')
        }
      };

      mockReq.body = {
        phone: '138-0013-8000'
      };

      const middleware = validationMiddleware.sanitizeInput(sanitizers);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.phone).toBe('13800138000');
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateFileUpload', () => {
    it('应该验证文件上传', async () => {
      const options = {
        maxSize: 1024 * 1024, // 1MB
        allowedTypes: ['image/jpeg', 'image/png'],
        required: true
      };

      mockReq.file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 500 * 1024, // 500KB
        buffer: Buffer.from('fake image data')
      };

      const middleware = validationMiddleware.validateFileUpload(options);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝超大文件', async () => {
      const options = {
        maxSize: 1024 * 1024, // 1MB
        allowedTypes: ['image/jpeg', 'image/png']
      };

      mockReq.file = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 2 * 1024 * 1024, // 2MB
        buffer: Buffer.from('fake large image data')
      };

      const middleware = validationMiddleware.validateFileUpload(options);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('文件大小超出限制'),
          statusCode: 400
        })
      );
    });

    it('应该拒绝不支持的文件类型', async () => {
      const options = {
        allowedTypes: ['image/jpeg', 'image/png']
      };

      mockReq.file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 100 * 1024,
        buffer: Buffer.from('fake pdf data')
      };

      const middleware = validationMiddleware.validateFileUpload(options);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('不支持的文件类型'),
          statusCode: 400
        })
      );
    });

    it('应该处理必需文件缺失', async () => {
      const options = {
        required: true
      };

      mockReq.file = undefined;

      const middleware = validationMiddleware.validateFileUpload(options);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('文件是必需的'),
          statusCode: 400
        })
      );
    });

    it('应该支持多文件验证', async () => {
      const options = {
        maxFiles: 3,
        maxSize: 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png']
      };

      mockReq.files = [
        {
          originalname: 'image1.jpg',
          mimetype: 'image/jpeg',
          size: 500 * 1024
        },
        {
          originalname: 'image2.png',
          mimetype: 'image/png',
          size: 300 * 1024
        }
      ];

      const middleware = validationMiddleware.validateFileUpload(options);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝过多文件', async () => {
      const options = {
        maxFiles: 2
      };

      mockReq.files = [
        { originalname: 'file1.jpg' },
        { originalname: 'file2.jpg' },
        { originalname: 'file3.jpg' }
      ];

      const middleware = validationMiddleware.validateFileUpload(options);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('文件数量超出限制'),
          statusCode: 400
        })
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理验证器内部错误', async () => {
      const schema = mockJoi.object();
      mockReq.body = { name: '测试' };
      
      mockJoi.validate.mockImplementation(() => {
        throw new Error('验证器内部错误');
      });

      const middleware = validationMiddleware.validateBody(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('验证器内部错误'),
          statusCode: 500
        })
      );
    });

    it('应该处理异步验证错误', async () => {
      const schema = mockJoi.object();
      mockReq.body = { email: 'test@example.com' };
      
      mockJoi.validate.mockRejectedValue(new Error('异步验证失败'));

      const middleware = validationMiddleware.validateBody(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('异步验证失败')
        })
      );
    });
  });
});
