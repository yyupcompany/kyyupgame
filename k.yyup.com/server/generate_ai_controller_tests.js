const fs = require('fs');
const path = require('path');

// Template for AI controller test
const aiControllerTestTemplate = (controllerName, controllerPath, imports = [], methods = []) => `// Mock dependencies
jest.mock('${controllerPath}');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
${imports.map(imp => `import { ${imp} } from '${controllerPath}';`).join('\n')}
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

describe('${controllerName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  ${methods.map(method => {
    const methodName = method.name;
    const description = method.description || methodName;
    const requiresAuth = method.requiresAuth || false;
    const validations = method.validations || [];
    
    return `describe('${methodName}', () => {
    it('应该成功${description}', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${requiresAuth ? 'req.user = { id: 1 };' : ''}
      ${method.setupRequest || ''}

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ${method.expectedResponse ? `data: ${method.expectedResponse},` : 'data: expect.any(Object),'}
        message: expect.any(String)
      });
    });

    ${requiresAuth ? `it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${method.setupRequest || ''}
      req.user = null;

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      ${method.usesNext ? `expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );` : `expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });`}
    });` : ''}

    ${validations.map(validation => `
    it('应该验证${validation.description}', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${requiresAuth ? 'req.user = { id: 1 };' : ''}
      ${validation.setup || ''}

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      ${method.usesNext ? `expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: ${validation.statusCode || 400},
          code: '${validation.code || 'BAD_REQUEST'}'
        })
      );` : `expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: '${validation.message}',
        statusCode: ${validation.statusCode || 400}
      });`}
    });`).join('')}

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${requiresAuth ? 'req.user = { id: 1 };' : ''}
      ${method.setupRequest || ''}

      // 模拟错误
      const original${methodName.charAt(0).toUpperCase() + methodName.slice(1)} = ${methodName};
      (${methodName} as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      ${method.usesNext ? 'expect(mockNext).toHaveBeenCalledWith(expect.any(Error));' : `expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });`}

      // 恢复原始函数
      (${methodName} as jest.Mock).mockImplementation(original${methodName.charAt(0).toUpperCase() + methodName.slice(1)});
    });
  });`;
  }).join('\n  ')}
});`;

// AI Controller configurations
const aiControllerConfigs = [
  {
    name: 'AI Memory Controller',
    fileName: 'ai/ai-memory.controller.test.ts',
    imports: ['storeMemory', 'retrieveMemory', 'searchMemory'],
    methods: [
      {
        name: 'storeMemory',
        description: '存储记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          content: '用户偏好设置',
          type: 'preference',
          userId: 1
        };`
      },
      {
        name: 'retrieveMemory',
        description: '检索记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { userId: '1', type: 'preference' };`
      },
      {
        name: 'searchMemory',
        description: '搜索记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { 
          query: '用户偏好',
          userId: 1,
          limit: 10
        };`
      }
    ]
  },
  {
    name: 'AI Performance Monitor Controller',
    fileName: 'ai/ai-performance-monitor.controller.test.ts',
    imports: ['getPerformanceMetrics', 'getSystemHealth', 'optimizePerformance'],
    methods: [
      {
        name: 'getPerformanceMetrics',
        description: '获取性能指标',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          timeRange: '24h',
          metrics: ['cpu', 'memory', 'response_time']
        };`
      },
      {
        name: 'getSystemHealth',
        description: '获取系统健康状态',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'optimizePerformance',
        description: '优化性能',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { 
          optimizationType: 'memory_cleanup',
          target: 'ai_service'
        };`
      }
    ]
  },
  {
    name: 'AI Analytics Controller',
    fileName: 'ai/analytics.controller.test.ts',
    imports: ['analyzeData', 'generateReport', 'getInsights'],
    methods: [
      {
        name: 'analyzeData',
        description: '分析数据',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          dataSource: 'enrollment_data',
          analysisType: 'trend_analysis',
          parameters: { timeRange: '6months' }
        };`
      },
      {
        name: 'generateReport',
        description: '生成报告',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          reportType: 'enrollment_summary',
          format: 'pdf',
          parameters: { includeCharts: true }
        };`
      },
      {
        name: 'getInsights',
        description: '获取洞察',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          category: 'enrollment',
          timeRange: 'month'
        };`
      }
    ]
  },
  {
    name: 'AI Conversation Controller',
    fileName: 'ai/conversation.controller.test.ts',
    imports: ['startConversation', 'sendMessage', 'getConversationHistory'],
    methods: [
      {
        name: 'startConversation',
        description: '开始对话',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          type: 'consultation',
          initialMessage: '我想了解招生信息'
        };`
      },
      {
        name: 'sendMessage',
        description: '发送消息',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          conversationId: 1,
          message: '请问学费是多少？',
          messageType: 'text'
        };`
      },
      {
        name: 'getConversationHistory',
        description: '获取对话历史',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          conversationId: '1',
          limit: '50'
        };`
      }
    ]
  },
  {
    name: 'AI Expert Consultation Controller',
    fileName: 'ai/expert-consultation.controller.test.ts',
    imports: ['requestConsultation', 'getConsultationStatus', 'getConsultationHistory'],
    methods: [
      {
        name: 'requestConsultation',
        description: '请求专家咨询',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          topic: '教育咨询',
          question: '如何选择适合的幼儿园？',
          priority: 'normal'
        };`
      },
      {
        name: 'getConsultationStatus',
        description: '获取咨询状态',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { consultationId: '1' };`
      },
      {
        name: 'getConsultationHistory',
        description: '获取咨询历史',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          userId: '1',
          status: 'completed'
        };`
      }
    ]
  },
  {
    name: 'AI Feedback Controller',
    fileName: 'ai/feedback.controller.test.ts',
    imports: ['submitFeedback', 'getFeedbackStats', 'analyzeFeedback'],
    methods: [
      {
        name: 'submitFeedback',
        description: '提交反馈',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          type: 'ai_response',
          rating: 5,
          content: 'AI回答很准确',
          sessionId: 'session_123'
        };`
      },
      {
        name: 'getFeedbackStats',
        description: '获取反馈统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          type: 'ai_response',
          timeRange: 'week'
        };`
      },
      {
        name: 'analyzeFeedback',
        description: '分析反馈',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          feedbackIds: [1, 2, 3],
          analysisType: 'sentiment'
        };`
      }
    ]
  },
  {
    name: 'AI Memory Controller (Main)',
    fileName: 'ai/memory.controller.test.ts',
    imports: ['createMemory', 'getMemories', 'updateMemory'],
    methods: [
      {
        name: 'createMemory',
        description: '创建记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          title: '用户偏好',
          content: '用户喜欢简洁的界面',
          tags: ['preference', 'ui']
        };`
      },
      {
        name: 'getMemories',
        description: '获取记忆列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          tags: 'preference',
          page: '1',
          limit: '10'
        };`
      },
      {
        name: 'updateMemory',
        description: '更新记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { content: '更新后的记忆内容' };`
      }
    ]
  },
  {
    name: 'AI Message Controller',
    fileName: 'ai/message.controller.test.ts',
    imports: ['sendMessage', 'getMessages', 'deleteMessage'],
    methods: [
      {
        name: 'sendMessage',
        description: '发送消息',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          recipientId: 2,
          content: '您好，我想咨询一下',
          messageType: 'text'
        };`
      },
      {
        name: 'getMessages',
        description: '获取消息列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          conversationId: '1',
          page: '1',
          limit: '20'
        };`
      },
      {
        name: 'deleteMessage',
        description: '删除消息',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'AI OpenAI Compatible Controller',
    fileName: 'ai/openai-compatible.controller.test.ts',
    imports: ['chatCompletion', 'getModels', 'getEmbeddings'],
    methods: [
      {
        name: 'chatCompletion',
        description: '聊天补全',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: '你好' }
          ],
          temperature: 0.7
        };`
      },
      {
        name: 'getModels',
        description: '获取模型列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'getEmbeddings',
        description: '获取嵌入向量',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          input: '这是一个测试文本',
          model: 'text-embedding-ada-002'
        };`
      }
    ]
  },
  {
    name: 'AI Quota Controller',
    fileName: 'ai/quota.controller.test.ts',
    imports: ['getQuota', 'updateQuota', 'checkQuota'],
    methods: [
      {
        name: 'getQuota',
        description: '获取配额',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { userId: '1', service: 'chatgpt' };`
      },
      {
        name: 'updateQuota',
        description: '更新配额',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          userId: 1,
          service: 'chatgpt',
          quota: 1000,
          expirationDate: new Date()
        };`
      },
      {
        name: 'checkQuota',
        description: '检查配额',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          userId: '1',
          service: 'chatgpt',
          requestedAmount: 10
        };`
      }
    ]
  },
  {
    name: 'AI Six Dimension Memory Controller',
    fileName: 'ai/six-dimension-memory.controller.test.ts',
    imports: ['storeSixDimensionMemory', 'retrieveSixDimensionMemory', 'analyzeSixDimensionMemory'],
    methods: [
      {
        name: 'storeSixDimensionMemory',
        description: '存储六维记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          dimensions: {
            cognitive: 0.8,
            emotional: 0.7,
            social: 0.9,
            physical: 0.6,
            creative: 0.8,
            spiritual: 0.5
          },
          context: '学习活动',
          timestamp: new Date()
        };`
      },
      {
        name: 'retrieveSixDimensionMemory',
        description: '检索六维记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          userId: '1',
          timeRange: 'week'
        };`
      },
      {
        name: 'analyzeSixDimensionMemory',
        description: '分析六维记忆',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          userId: 1,
          analysisType: 'trend',
          timeRange: 'month'
        };`
      }
    ]
  },
  {
    name: 'AI Video Controller',
    fileName: 'ai/video.controller.test.ts',
    imports: ['analyzeVideo', 'generateVideoSummary', 'extractVideoInsights'],
    methods: [
      {
        name: 'analyzeVideo',
        description: '分析视频',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          videoUrl: 'http://example.com/video.mp4',
          analysisType: 'content_analysis'
        };`
      },
      {
        name: 'generateVideoSummary',
        description: '生成视频摘要',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          videoId: 1,
          summaryLength: 'medium',
          includeHighlights: true
        };`
      },
      {
        name: 'extractVideoInsights',
        description: '提取视频洞察',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { videoId: '1' };`
      }
    ]
  }
];

// Create test files
const testDir = path.join(__dirname, 'tests/unit/controllers/ai');

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

aiControllerConfigs.forEach(config => {
  const testContent = aiControllerTestTemplate(
    config.name,
    `../../../src/controllers/${config.fileName.replace('.test.ts', '')}`,
    config.imports,
    config.methods
  );

  const filePath = path.join(testDir, config.fileName.split('/').pop());
  fs.writeFileSync(filePath, testContent);
  console.log(`Created test file: ${filePath}`);
});

console.log(`Generated ${aiControllerConfigs.length} AI controller test files`);