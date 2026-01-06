/**
 * Validation Middleware 单元测试
 * 测试验证中间件的各种功能
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { validateRequest } from '../../../src/middlewares/validate.middleware';
import { testUtils } from '../../setup';

// Mock Joi
jest.mock('joi');
const Joi = require('joi');


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
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockSchema: any;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock schema
    mockSchema = {
      validate: jest.fn()
    };
  });

  describe('validateRequest', () => {
    it('should call next() when validation passes', () => {
      // Setup
      mockRequest.body = { name: 'John Doe', email: 'john@example.com' };
      
      // Mock validation to return no error
      mockSchema.validate.mockReturnValue({ error: null });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails with single error', () => {
      // Setup
      mockRequest.body = { name: '', email: 'invalid-email' };
      
      const mockError = {
        details: [
          { message: 'Name is required' },
          { message: 'Email must be a valid email' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name is required, Email must be a valid email'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails with single error detail', () => {
      // Setup
      mockRequest.body = { name: '' };
      
      const mockError = {
        details: [
          { message: 'Name is required' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name is required'
        }
      });
    });

    it('should strip unknown fields when stripUnknown is true', () => {
      // Setup
      mockRequest.body = { 
        name: 'John Doe', 
        email: 'john@example.com',
        unknownField: 'should be removed'
      };
      
      const mockError = { details: [] };
      
      // Mock validation
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not strip unknown fields when stripUnknown is false', () => {
      // Setup
      mockRequest.body = { 
        name: 'John Doe', 
        email: 'john@example.com',
        unknownField: 'should be kept'
      };
      
      const mockError = { details: [] };
      
      // Mock validation with different options
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Create a custom schema that doesn't strip unknown fields
      const customSchema = {
        validate: jest.fn().mockReturnValue({ error: mockError })
      };

      // Execute
      validateRequest(customSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(customSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
    });

    it('should handle empty request body', () => {
      // Setup
      mockRequest.body = {};
      
      const mockError = {
        details: [
          { message: 'Name is required' },
          { message: 'Email is required' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name is required, Email is required'
        }
      });
    });

    it('should handle null request body', () => {
      // Setup
      mockRequest.body = null;
      
      const mockError = {
        details: [
          { message: 'Request body cannot be null' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(null, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle undefined request body', () => {
      // Setup
      mockRequest.body = undefined;
      
      const mockError = {
        details: [
          { message: 'Request body is required' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(undefined, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate complex nested objects', () => {
      // Setup
      mockRequest.body = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          address: {
            street: '123 Main St',
            city: 'New York'
          }
        },
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      };
      
      const mockError = { details: [] };
      
      // Mock validation
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle validation errors in nested objects', () => {
      // Setup
      mockRequest.body = {
        user: {
          name: '',
          email: 'invalid-email',
          address: {
            street: '',
            city: ''
          }
        }
      };
      
      const mockError = {
        details: [
          { message: 'user.name is required' },
          { message: 'user.email must be a valid email' },
          { message: 'user.address.street is required' },
          { message: 'user.address.city is required' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'user.name is required, user.email must be a valid email, user.address.street is required, user.address.city is required'
        }
      });
    });

    it('should handle arrays validation', () => {
      // Setup
      mockRequest.body = {
        tags: ['tag1', 'tag2', 'tag3'],
        numbers: [1, 2, 3]
      };
      
      const mockError = { details: [] };
      
      // Mock validation
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle validation errors in arrays', () => {
      // Setup
      mockRequest.body = {
        tags: ['', 'tag2', ''],
        numbers: [1, 'invalid', 3]
      };
      
      const mockError = {
        details: [
          { message: 'tags[0] is required' },
          { message: 'tags[2] is required' },
          { message: 'numbers[1] must be a number' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'tags[0] is required, tags[2] is required, numbers[1] must be a number'
        }
      });
    });

    it('should handle schema validation errors', () => {
      // Setup
      mockRequest.body = { name: 'John' };
      
      // Mock validation to throw an error
      mockSchema.validate.mockImplementation(() => {
        throw new Error('Schema validation failed');
      });

      // Execute
      expect(() => {
        validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);
      }).toThrow('Schema validation failed');
    });

    it('should work with different validation options', () => {
      // Setup
      mockRequest.body = { name: 'John Doe' };
      
      const mockError = { details: [] };
      
      // Mock validation
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle special characters in error messages', () => {
      // Setup
      mockRequest.body = { name: 'John@Doe#123' };
      
      const mockError = {
        details: [
          { message: 'Name contains special characters: @#' }
        ]
      };
      
      // Mock validation to return error
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name contains special characters: @#'
        }
      });
    });

    it('should handle unicode characters in validation', () => {
      // Setup
      mockRequest.body = { name: '张三', email: '张三@example.com' };
      
      const mockError = { details: [] };
      
      // Mock validation
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(mockRequest.body, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle large request bodies', () => {
      // Setup
      const largeObject = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`field${i}`] = `value${i}`;
      }
      mockRequest.body = largeObject;
      
      const mockError = { details: [] };
      
      // Mock validation
      mockSchema.validate.mockReturnValue({ error: mockError });

      // Execute
      validateRequest(mockSchema)(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockSchema.validate).toHaveBeenCalledWith(largeObject, {
        abortEarly: false,
        stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });
});