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

jest.unstable_mockModule('../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message: string, statusCode: number) => {
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

describe('User Validation', () => {
  let userValidation: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/user.validation');
    userValidation = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('validateCreateUser', () => {
    it('应该验证有效的用户创建数据', async () => {
      const validUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户',
        phone: '13800138000',
        gender: 'male',
        birthDate: '1990-01-01'
      };

      mockReq.body = validUserData;
      
      // Mock successful validation
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validUserData
      });

      await userValidation.validateCreateUser(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validUserData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝缺少必填字段的数据', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        password: 'password123'
        // 缺少 username 和 realName
      };

      mockReq.body = invalidUserData;
      
      // Mock validation error
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"username" is required',
              path: ['username'],
              type: 'any.required'
            }
          ]
        },
        value: invalidUserData
      });

      await userValidation.validateCreateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('username'),
          statusCode: 400
        })
      );
    });

    it('应该验证用户名格式', async () => {
      const invalidUserData = {
        username: 'ab', // 太短
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户'
      };

      mockReq.body = invalidUserData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"username" length must be at least 3 characters long',
              path: ['username'],
              type: 'string.min'
            }
          ]
        },
        value: invalidUserData
      });

      await userValidation.validateCreateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('username'),
          statusCode: 400
        })
      );
    });

    it('应该验证邮箱格式', async () => {
      const invalidUserData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        realName: '测试用户'
      };

      mockReq.body = invalidUserData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"email" must be a valid email',
              path: ['email'],
              type: 'string.email'
            }
          ]
        },
        value: invalidUserData
      });

      await userValidation.validateCreateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('email'),
          statusCode: 400
        })
      );
    });

    it('应该验证密码强度', async () => {
      const invalidUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // 太弱
        realName: '测试用户'
      };

      mockReq.body = invalidUserData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"password" length must be at least 6 characters long',
              path: ['password'],
              type: 'string.min'
            }
          ]
        },
        value: invalidUserData
      });

      await userValidation.validateCreateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('password'),
          statusCode: 400
        })
      );
    });

    it('应该验证手机号格式', async () => {
      const invalidUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户',
        phone: '123' // 无效手机号
      };

      mockReq.body = invalidUserData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"phone" with value "123" fails to match the required pattern',
              path: ['phone'],
              type: 'string.pattern.base'
            }
          ]
        },
        value: invalidUserData
      });

      await userValidation.validateCreateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('phone'),
          statusCode: 400
        })
      );
    });

    it('应该验证性别枚举值', async () => {
      const invalidUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户',
        gender: 'invalid' // 无效性别
      };

      mockReq.body = invalidUserData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"gender" must be one of [male, female, other]',
              path: ['gender'],
              type: 'any.only'
            }
          ]
        },
        value: invalidUserData
      });

      await userValidation.validateCreateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('gender'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateUpdateUser', () => {
    it('应该验证有效的用户更新数据', async () => {
      const validUpdateData = {
        realName: '更新的用户名',
        email: 'updated@example.com',
        phone: '13900139000',
        avatar: '/avatars/user.jpg'
      };

      mockReq.body = validUpdateData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validUpdateData
      });

      await userValidation.validateUpdateUser(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validUpdateData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该允许部分字段更新', async () => {
      const partialUpdateData = {
        realName: '新名称'
      };

      mockReq.body = partialUpdateData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: partialUpdateData
      });

      await userValidation.validateUpdateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝更新用户名', async () => {
      const invalidUpdateData = {
        username: 'newusername', // 不允许更新用户名
        realName: '新名称'
      };

      mockReq.body = invalidUpdateData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"username" is not allowed',
              path: ['username'],
              type: 'object.unknown'
            }
          ]
        },
        value: invalidUpdateData
      });

      await userValidation.validateUpdateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('username'),
          statusCode: 400
        })
      );
    });

    it('应该拒绝更新密码', async () => {
      const invalidUpdateData = {
        password: 'newpassword', // 不允许通过此接口更新密码
        realName: '新名称'
      };

      mockReq.body = invalidUpdateData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"password" is not allowed',
              path: ['password'],
              type: 'object.unknown'
            }
          ]
        },
        value: invalidUpdateData
      });

      await userValidation.validateUpdateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('password'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateChangePassword', () => {
    it('应该验证有效的密码修改数据', async () => {
      const validPasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      mockReq.body = validPasswordData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validPasswordData
      });

      await userValidation.validateChangePassword(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validPasswordData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该要求所有密码字段', async () => {
      const invalidPasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
        // 缺少 confirmPassword
      };

      mockReq.body = invalidPasswordData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"confirmPassword" is required',
              path: ['confirmPassword'],
              type: 'any.required'
            }
          ]
        },
        value: invalidPasswordData
      });

      await userValidation.validateChangePassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('confirmPassword'),
          statusCode: 400
        })
      );
    });

    it('应该验证新密码和确认密码匹配', async () => {
      const invalidPasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword123'
      };

      mockReq.body = invalidPasswordData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"confirmPassword" must be [ref:newPassword]',
              path: ['confirmPassword'],
              type: 'any.only'
            }
          ]
        },
        value: invalidPasswordData
      });

      await userValidation.validateChangePassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('密码不匹配'),
          statusCode: 400
        })
      );
    });

    it('应该验证新密码强度', async () => {
      const invalidPasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: '123', // 太弱
        confirmPassword: '123'
      };

      mockReq.body = invalidPasswordData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"newPassword" length must be at least 6 characters long',
              path: ['newPassword'],
              type: 'string.min'
            }
          ]
        },
        value: invalidPasswordData
      });

      await userValidation.validateChangePassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('newPassword'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateUserQuery', () => {
    it('应该验证有效的查询参数', async () => {
      const validQuery = {
        page: '1',
        pageSize: '10',
        search: 'test',
        status: 'active',
        role: 'user',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      mockReq.query = validQuery;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: {
          page: 1,
          pageSize: 10,
          search: 'test',
          status: 'active',
          role: 'user',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      await userValidation.validateUserQuery(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validQuery, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该设置默认查询参数', async () => {
      const emptyQuery = {};

      mockReq.query = emptyQuery;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: {
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      await userValidation.validateUserQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该验证页码范围', async () => {
      const invalidQuery = {
        page: '0' // 无效页码
      };

      mockReq.query = invalidQuery;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"page" must be greater than or equal to 1',
              path: ['page'],
              type: 'number.min'
            }
          ]
        },
        value: invalidQuery
      });

      await userValidation.validateUserQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('page'),
          statusCode: 400
        })
      );
    });

    it('应该验证页面大小范围', async () => {
      const invalidQuery = {
        pageSize: '101' // 超过最大值
      };

      mockReq.query = invalidQuery;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"pageSize" must be less than or equal to 100',
              path: ['pageSize'],
              type: 'number.max'
            }
          ]
        },
        value: invalidQuery
      });

      await userValidation.validateUserQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('pageSize'),
          statusCode: 400
        })
      );
    });

    it('应该验证排序字段', async () => {
      const invalidQuery = {
        sortBy: 'invalidField'
      };

      mockReq.query = invalidQuery;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"sortBy" must be one of [id, username, email, realName, createdAt, updatedAt]',
              path: ['sortBy'],
              type: 'any.only'
            }
          ]
        },
        value: invalidQuery
      });

      await userValidation.validateUserQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('sortBy'),
          statusCode: 400
        })
      );
    });

    it('应该验证排序顺序', async () => {
      const invalidQuery = {
        sortOrder: 'invalid'
      };

      mockReq.query = invalidQuery;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"sortOrder" must be one of [asc, desc]',
              path: ['sortOrder'],
              type: 'any.only'
            }
          ]
        },
        value: invalidQuery
      });

      await userValidation.validateUserQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('sortOrder'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateUserId', () => {
    it('应该验证有效的用户ID', async () => {
      mockReq.params = { id: '123' };
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: { id: 123 }
      });

      await userValidation.validateUserId(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith({ id: '123' }, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝无效的用户ID', async () => {
      mockReq.params = { id: 'invalid' };
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"id" must be a number',
              path: ['id'],
              type: 'number.base'
            }
          ]
        },
        value: { id: 'invalid' }
      });

      await userValidation.validateUserId(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('id'),
          statusCode: 400
        })
      );
    });

    it('应该要求用户ID为正整数', async () => {
      mockReq.params = { id: '-1' };
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"id" must be a positive number',
              path: ['id'],
              type: 'number.positive'
            }
          ]
        },
        value: { id: -1 }
      });

      await userValidation.validateUserId(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('id'),
          statusCode: 400
        })
      );
    });
  });
});
