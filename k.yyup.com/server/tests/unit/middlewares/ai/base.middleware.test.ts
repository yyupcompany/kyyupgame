import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock Express types
const mockRequest = {
  params: {},
  query: {},
  body: {},
  headers: {},
  user: null,
  method: 'POST',
  url: '/api/ai/chat',
  path: '/api/ai/chat'
} as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  locals: {}
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock AI models
const mockAIModel = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn()
};

const mockAIConversation = {
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

const mockAIUsage = {
  create: jest.fn(),
  findAll: jest.fn(),
  sum: jest.fn()
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock AI service
const mockAIService = {
  validateModel: jest.fn(),
  checkQuota: jest.fn(),
  rateLimit: jest.fn(),
  sanitizeInput: jest.fn(),
  trackUsage: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/models/ai-model.model', () => ({
  default: mockAIModel
}));

jest.unstable_mockModule('../../../../../../src/models/ai-conversation.model', () => ({
  default: mockAIConversation
}));

jest.unstable_mockModule('../../../../../../src/models/ai-usage.model', () => ({
  default: mockAIUsage
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/services/ai/ai.service', () => ({
  default: mockAIService
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

describe('AI Base Middleware', () => {
  let aiBaseMiddleware: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/middlewares/ai/base.middleware');
    aiBaseMiddleware = imported.default || imported.aiBase || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock objects
    mockRequest.params = {};
    mockRequest.query = {};
    mockRequest.body = {};
    mockRequest.headers = {};
    mockRequest.user = null;
    mockResponse.locals = {};
  });

  describe('基础功能', () => {
    it('应该是一个函数', () => {
      expect(typeof aiBaseMiddleware).toBe('function');
    });

    it('应该返回中间件函数', () => {
      const middleware = aiBaseMiddleware();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('应该拒绝未认证的用户', async () => {
      const middleware = aiBaseMiddleware();
      
      mockRequest.user = null;

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required for AI services'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('AI模型验证', () => {
    it('应该验证AI模型存在', async () => {
      const middleware = aiBaseMiddleware({
        requireModel: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        modelId: 'gpt-4',
        message: 'Hello AI'
      };

      mockAIModel.findOne.mockResolvedValue({
        id: 'gpt-4',
        name: 'GPT-4',
        status: 'active',
        maxTokens: 4096
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockAIModel.findOne).toHaveBeenCalledWith({
        where: { id: 'gpt-4', status: 'active' }
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝不存在的AI模型', async () => {
      const middleware = aiBaseMiddleware({
        requireModel: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        modelId: 'invalid-model',
        message: 'Hello AI'
      };

      mockAIModel.findOne.mockResolvedValue(null);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or inactive AI model',
        modelId: 'invalid-model'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该验证模型权限', async () => {
      const middleware = aiBaseMiddleware({
        requireModel: true,
        checkModelPermissions: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user',
        permissions: ['ai:basic']
      };
      mockRequest.body = {
        modelId: 'gpt-4',
        message: 'Hello AI'
      };

      mockAIModel.findOne.mockResolvedValue({
        id: 'gpt-4',
        name: 'GPT-4',
        status: 'active',
        requiredPermissions: ['ai:premium']
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions for this AI model',
        modelId: 'gpt-4',
        required: ['ai:premium'],
        current: ['ai:basic']
      });
    });
  });

  describe('使用配额检查', () => {
    it('应该检查用户AI使用配额', async () => {
      const middleware = aiBaseMiddleware({
        checkQuota: true,
        quotaLimits: {
          daily: 100,
          monthly: 1000
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      mockAIUsage.sum.mockResolvedValueOnce(50); // 今日使用
      mockAIUsage.sum.mockResolvedValueOnce(300); // 本月使用

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.locals.aiQuota).toEqual({
        daily: { used: 50, limit: 100, remaining: 50 },
        monthly: { used: 300, limit: 1000, remaining: 700 }
      });
    });

    it('应该拒绝超出配额的请求', async () => {
      const middleware = aiBaseMiddleware({
        checkQuota: true,
        quotaLimits: {
          daily: 100,
          monthly: 1000
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      mockAIUsage.sum.mockResolvedValueOnce(100); // 今日使用已达上限
      mockAIUsage.sum.mockResolvedValueOnce(300); // 本月使用

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'AI usage quota exceeded',
        quota: {
          daily: { used: 100, limit: 100, remaining: 0 },
          monthly: { used: 300, limit: 1000, remaining: 700 }
        },
        resetTime: expect.any(String)
      });
    });

    it('应该处理不同角色的配额限制', async () => {
      const middleware = aiBaseMiddleware({
        checkQuota: true,
        quotaLimits: {
          user: { daily: 50, monthly: 500 },
          premium: { daily: 200, monthly: 2000 },
          admin: { daily: -1, monthly: -1 } // 无限制
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockAIUsage.sum).not.toHaveBeenCalled(); // 管理员无需检查配额
    });
  });

  describe('速率限制', () => {
    it('应该检查AI请求速率限制', async () => {
      const middleware = aiBaseMiddleware({
        rateLimit: {
          windowMs: 60000, // 1分钟
          maxRequests: 10
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      mockAIService.rateLimit.mockResolvedValue({
        allowed: true,
        remaining: 8,
        resetTime: Date.now() + 60000
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.locals.rateLimit).toEqual({
        remaining: 8,
        resetTime: expect.any(Number)
      });
    });

    it('应该拒绝超出速率限制的请求', async () => {
      const middleware = aiBaseMiddleware({
        rateLimit: {
          windowMs: 60000,
          maxRequests: 10
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      mockAIService.rateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 45000
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'AI request rate limit exceeded',
        rateLimit: {
          remaining: 0,
          resetTime: expect.any(Number)
        }
      });
    });

    it('应该处理不同端点的速率限制', async () => {
      const middleware = aiBaseMiddleware({
        rateLimit: {
          chat: { windowMs: 60000, maxRequests: 20 },
          image: { windowMs: 300000, maxRequests: 5 },
          analysis: { windowMs: 60000, maxRequests: 10 }
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.path = '/api/ai/chat';

      mockAIService.rateLimit.mockResolvedValue({
        allowed: true,
        remaining: 18,
        resetTime: Date.now() + 60000
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockAIService.rateLimit).toHaveBeenCalledWith(
        mockRequest.user.id,
        'chat',
        { windowMs: 60000, maxRequests: 20 }
      );
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('输入验证和清理', () => {
    it('应该验证AI请求输入', async () => {
      const middleware = aiBaseMiddleware({
        validateInput: true,
        inputLimits: {
          maxMessageLength: 1000,
          maxMessages: 50
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        message: 'Hello AI, how are you?',
        conversationId: 'conv-123'
      };

      mockAIService.sanitizeInput.mockReturnValue({
        message: 'Hello AI, how are you?',
        conversationId: 'conv-123'
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockAIService.sanitizeInput).toHaveBeenCalledWith(mockRequest.body);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝过长的输入', async () => {
      const middleware = aiBaseMiddleware({
        validateInput: true,
        inputLimits: {
          maxMessageLength: 100
        }
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        message: 'A'.repeat(150) // 超过限制
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Input exceeds maximum length',
        maxLength: 100,
        actualLength: 150
      });
    });

    it('应该过滤危险内容', async () => {
      const middleware = aiBaseMiddleware({
        validateInput: true,
        contentFilter: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        message: 'How to make a bomb?'
      };

      mockAIService.sanitizeInput.mockReturnValue({
        filtered: true,
        reason: 'dangerous_content',
        originalMessage: 'How to make a bomb?'
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Content filtered due to policy violation',
        reason: 'dangerous_content'
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('AI content filtered'),
        expect.objectContaining({
          userId: 1,
          reason: 'dangerous_content'
        })
      );
    });
  });

  describe('会话管理', () => {
    it('应该验证会话存在', async () => {
      const middleware = aiBaseMiddleware({
        requireConversation: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        conversationId: 'conv-123',
        message: 'Hello'
      };

      mockAIConversation.findByPk.mockResolvedValue({
        id: 'conv-123',
        userId: 1,
        status: 'active'
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockAIConversation.findByPk).toHaveBeenCalledWith('conv-123');
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.locals.conversation).toBeDefined();
    });

    it('应该拒绝不存在的会话', async () => {
      const middleware = aiBaseMiddleware({
        requireConversation: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        conversationId: 'invalid-conv',
        message: 'Hello'
      };

      mockAIConversation.findByPk.mockResolvedValue(null);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Conversation not found',
        conversationId: 'invalid-conv'
      });
    });

    it('应该验证会话所有权', async () => {
      const middleware = aiBaseMiddleware({
        requireConversation: true,
        checkOwnership: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        conversationId: 'conv-123',
        message: 'Hello'
      };

      mockAIConversation.findByPk.mockResolvedValue({
        id: 'conv-123',
        userId: 2, // 不同的用户
        status: 'active'
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied to this conversation',
        conversationId: 'conv-123'
      });
    });

    it('应该自动创建新会话', async () => {
      const middleware = aiBaseMiddleware({
        autoCreateConversation: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        message: 'Hello AI'
      };

      mockAIConversation.create.mockResolvedValue({
        id: 'conv-new-123',
        userId: 1,
        status: 'active',
        createdAt: new Date()
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockAIConversation.create).toHaveBeenCalledWith({
        userId: 1,
        status: 'active',
        metadata: expect.any(Object)
      });
      expect(mockResponse.locals.conversation).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('使用跟踪', () => {
    it('应该跟踪AI使用情况', async () => {
      const middleware = aiBaseMiddleware({
        trackUsage: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        modelId: 'gpt-4',
        message: 'Hello AI'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.trackUsage).toBe(true);
      expect(mockResponse.locals.usageData).toEqual({
        userId: 1,
        modelId: 'gpt-4',
        endpoint: '/api/ai/chat',
        timestamp: expect.any(Number)
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该记录详细的使用指标', async () => {
      const middleware = aiBaseMiddleware({
        trackUsage: true,
        detailedTracking: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        modelId: 'gpt-4',
        message: 'Hello AI'
      };
      mockRequest.headers['user-agent'] = 'Mozilla/5.0';
      mockRequest.ip = '192.168.1.100';

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.usageData).toEqual({
        userId: 1,
        modelId: 'gpt-4',
        endpoint: '/api/ai/chat',
        timestamp: expect.any(Number),
        userAgent: 'Mozilla/5.0',
        ip: '192.168.1.100',
        inputLength: 8, // "Hello AI".length
        sessionId: expect.any(String)
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理AI服务错误', async () => {
      const middleware = aiBaseMiddleware({
        checkQuota: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      const serviceError = new Error('AI service unavailable');
      mockAIUsage.sum.mockRejectedValue(serviceError);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('AI middleware error'),
        expect.objectContaining({
          error: serviceError.message,
          userId: 1
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'AI service temporarily unavailable'
      });
    });

    it('应该处理数据库连接错误', async () => {
      const middleware = aiBaseMiddleware({
        requireModel: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        modelId: 'gpt-4'
      };

      const dbError = new Error('Database connection failed');
      mockAIModel.findOne.mockRejectedValue(dbError);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Database error in AI middleware'),
        expect.objectContaining({
          error: dbError.message
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('配置选项', () => {
    it('应该支持自定义配置', async () => {
      const customValidator = jest.fn().mockReturnValue(true);
      const customQuotaChecker = jest.fn().mockResolvedValue({ allowed: true });
      
      const middleware = aiBaseMiddleware({
        customValidator,
        customQuotaChecker,
        enableDebugLogging: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(customValidator).toHaveBeenCalledWith(mockRequest);
      expect(customQuotaChecker).toHaveBeenCalledWith(mockRequest.user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该支持环境特定配置', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const middleware = aiBaseMiddleware({
        developmentMode: true,
        skipQuotaInDev: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'developer',
        role: 'developer'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockAIUsage.sum).not.toHaveBeenCalled(); // 开发环境跳过配额检查
      expect(mockNext).toHaveBeenCalledWith();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('集成测试', () => {
    it('应该处理完整的AI请求流程', async () => {
      const middleware = aiBaseMiddleware({
        requireModel: true,
        checkQuota: true,
        rateLimit: { windowMs: 60000, maxRequests: 10 },
        validateInput: true,
        trackUsage: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        modelId: 'gpt-4',
        message: 'Hello AI, how are you today?'
      };

      // 设置所有mock返回值
      mockAIModel.findOne.mockResolvedValue({
        id: 'gpt-4',
        name: 'GPT-4',
        status: 'active'
      });
      mockAIUsage.sum.mockResolvedValueOnce(10); // 今日使用
      mockAIUsage.sum.mockResolvedValueOnce(100); // 本月使用
      mockAIService.rateLimit.mockResolvedValue({
        allowed: true,
        remaining: 8
      });
      mockAIService.sanitizeInput.mockReturnValue(mockRequest.body);

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.locals.aiModel).toBeDefined();
      expect(mockResponse.locals.aiQuota).toBeDefined();
      expect(mockResponse.locals.rateLimit).toBeDefined();
      expect(mockResponse.locals.trackUsage).toBe(true);
    });

    it('应该与其他中间件协同工作', async () => {
      const middleware = aiBaseMiddleware({
        requireConversation: true,
        checkOwnership: true
      });
      
      mockRequest.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };
      mockRequest.body = {
        conversationId: 'conv-123',
        message: 'Continue our chat'
      };
      mockRequest.headers.authorization = 'Bearer valid-token';

      mockAIConversation.findByPk.mockResolvedValue({
        id: 'conv-123',
        userId: 1,
        status: 'active'
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.locals.conversation).toBeDefined();
    });
  });
});
