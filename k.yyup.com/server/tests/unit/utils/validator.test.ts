/**
 * 验证器工具函数测试
 */
// @ts-ignore
const Joi = require('joi');
import { validateRequest } from '../../../src/utils/validator';
import { vi } from 'vitest'
import { ApiError } from '../../../src/utils/apiError';


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

describe('Validator Utils', () => {
  describe('validateRequest', () => {
    it('应该验证有效的数据', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().min(0).max(120),
        email: Joi.string().email()
      });

      const data = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      };

      const result = await validateRequest(data, schema);

      expect(result).toEqual({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      });
    });

    it('应该移除未知字段', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number()
      });

      const data = {
        name: 'John Doe',
        age: 30,
        unknownField: 'should be removed',
        anotherUnknown: 123
      };

      const result = await validateRequest(data, schema);

      expect(result).toEqual({
        name: 'John Doe',
        age: 30
      });
      expect(result).not.toHaveProperty('unknownField');
      expect(result).not.toHaveProperty('anotherUnknown');
    });

    it('应该抛出ApiError当验证失败时', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().min(0).max(120).required(),
        email: Joi.string().email().required()
      });

      const data = {
        name: '', // 空字符串
        age: -5, // 负数
        email: 'invalid-email' // 无效邮箱
      };

      await expect(validateRequest(data, schema)).rejects.toThrow(ApiError);
      
      try {
        await validateRequest(data, schema);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(400);
        expect((error as ApiError).message).toContain('is not allowed to be empty');
      }
    });

    it('应该处理多个验证错误', async () => {
      const schema = Joi.object({
        name: Joi.string().min(2).required(),
        age: Joi.number().min(0).max(120).required(),
        email: Joi.string().email().required()
      });

      const data = {
        name: 'A', // 太短
        age: 150, // 超出范围
        email: 'not-an-email' // 无效邮箱
      };

      try {
        await validateRequest(data, schema);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(400);
        const message = (error as ApiError).message;
        expect(message).toContain('length must be at least 2');
        expect(message).toContain('must be less than or equal to 120');
        expect(message).toContain('must be a valid email');
      }
    });

    it('应该处理嵌套对象验证', async () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          profile: Joi.object({
            age: Joi.number().min(0),
            bio: Joi.string().max(500)
          })
        }).required()
      });

      const data = {
        user: {
          name: 'John Doe',
          profile: {
            age: 30,
            bio: 'Software developer'
          }
        }
      };

      const result = await validateRequest(data, schema);

      expect(result).toEqual(data);
    });

    it('应该处理数组验证', async () => {
      const schema = Joi.object({
        tags: Joi.array().items(Joi.string()).min(1).max(5),
        scores: Joi.array().items(Joi.number().min(0).max(100))
      });

      const data = {
        tags: ['javascript', 'nodejs', 'testing'],
        scores: [85, 92, 78]
      };

      const result = await validateRequest(data, schema);

      expect(result).toEqual(data);
    });

    it('应该处理可选字段', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().optional(),
        email: Joi.string().email().optional()
      });

      const data = {
        name: 'John Doe'
        // age 和 email 是可选的
      };

      const result = await validateRequest(data, schema);

      expect(result).toEqual({
        name: 'John Doe'
      });
    });

    it('应该处理默认值', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        status: Joi.string().default('active'),
        priority: Joi.number().default(1)
      });

      const data = {
        name: 'John Doe'
      };

      const result = await validateRequest(data, schema);

      expect(result).toEqual({
        name: 'John Doe',
        status: 'active',
        priority: 1
      });
    });

    it('应该处理条件验证', async () => {
      const schema = Joi.object({
        type: Joi.string().valid('user', 'admin').required(),
        permissions: Joi.when('type', {
          is: 'admin',
          then: Joi.array().items(Joi.string()).required(),
          otherwise: Joi.forbidden()
        })
      });

      // 管理员用户
      const adminData = {
        type: 'admin',
        permissions: ['read', 'write', 'delete']
      };

      const adminResult = await validateRequest(adminData, schema);
      expect(adminResult).toEqual(adminData);

      // 普通用户
      const userData = {
        type: 'user'
      };

      const userResult = await validateRequest(userData, schema);
      expect(userResult).toEqual(userData);
    });

    it('应该处理自定义验证规则', async () => {
      const schema = Joi.object({
        password: Joi.string()
          .min(8)
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
          .required()
          .messages({
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one digit'
          })
      });

      const validData = {
        password: 'MyPassword123'
      };

      const result = await validateRequest(validData, schema);
      expect(result).toEqual(validData);

      // 无效密码
      const invalidData = {
        password: 'weakpass'
      };

      try {
        await validateRequest(invalidData, schema);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toContain('Password must contain at least one lowercase letter');
      }
    });

    it('应该处理非Joi错误', async () => {
      const schema = {
        validateAsync: jest.fn().mockRejectedValue(new Error('Non-Joi error'))
      };

      const data = { name: 'test' };

      await expect(validateRequest(data, schema)).rejects.toThrow('Non-Joi error');
    });

    it('应该处理空数据', async () => {
      const schema = Joi.object({
        name: Joi.string().optional()
      });

      const result = await validateRequest({}, schema);
      expect(result).toEqual({});
    });

    it('应该处理null和undefined值', async () => {
      const schema = Joi.object({
        name: Joi.string().allow(null),
        age: Joi.number().optional()
      });

      const data = {
        name: null,
        age: undefined
      };

      const result = await validateRequest(data, schema);
      expect(result).toEqual({
        name: null
      });
    });

    it('应该处理复杂的验证场景', async () => {
      const schema = Joi.object({
        user: Joi.object({
          id: Joi.number().integer().positive().required(),
          username: Joi.string().alphanum().min(3).max(30).required(),
          email: Joi.string().email().required(),
          profile: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            birthDate: Joi.date().max('now').required(),
            preferences: Joi.object({
              theme: Joi.string().valid('light', 'dark').default('light'),
              notifications: Joi.boolean().default(true),
              language: Joi.string().valid('en', 'zh', 'es').default('en')
            }).default({})
          }).required()
        }).required(),
        metadata: Joi.object().pattern(Joi.string(), Joi.any()).optional()
      });

      const data = {
        user: {
          id: 123,
          username: 'johndoe',
          email: 'john@example.com',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            birthDate: '1990-01-01',
            preferences: {
              theme: 'dark',
              notifications: false
            }
          }
        },
        metadata: {
          source: 'api',
          version: '1.0'
        }
      };

      const result = await validateRequest(data, schema);
      
      expect((result as any).user.id).toBe(123);
      expect((result as any).user.profile.preferences.theme).toBe('dark');
      expect((result as any).user.profile.preferences.language).toBe('en'); // 默认值
      expect((result as any).metadata.source).toBe('api');
    });
  });
});
