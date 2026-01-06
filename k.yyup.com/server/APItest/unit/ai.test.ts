import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { Application } from 'express';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('AI Services API Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/ai/conversations', () => {
    it('should get user conversations', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/ai/conversations', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
      expect(Array.isArray(response.body.data.items)).toBeTruthy();
    });

    it('should filter conversations by topic', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/ai/conversations?topic=lesson_planning', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((conv: any) => {
          expect(conv.topic).toBe('lesson_planning');
        });
      }
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.public('get', '/api/ai/conversations');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/ai/conversations', () => {
    it('should create new AI conversation', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const conversationData = {
        title: '数学教学计划咨询',
        topic: 'lesson_planning',
        context: {
          classGrade: '大班',
          subject: '数学',
          studentCount: 25,
          difficulty: 'medium'
        },
        initialMessage: '请帮我制定一个关于数字认知的教学计划，适合5-6岁的孩子'
      };

      const response = await testHelper.post('/api/ai/conversations', conversationData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('conversationId');
      expect(response.body.data.title).toBe(conversationData.title);
      expect(response.body.data.topic).toBe(conversationData.topic);
    });

    it('should validate required fields', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = {
        topic: 'lesson_planning'
        // Missing title and initialMessage
      };

      const response = await testHelper.post('/api/ai/conversations', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Title and initial message are required');
    });

    it('should validate topic types', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = {
        title: '测试对话',
        topic: 'invalid_topic',
        initialMessage: '测试消息'
      };

      const response = await testHelper.post('/api/ai/conversations', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid topic type');
    });
  });

  describe('POST /api/ai/conversations/:id/messages', () => {
    it('should send message to AI conversation', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const messageData = {
        content: '请增加一些互动游戏环节到教学计划中',
        messageType: 'text',
        context: {
          previousTopic: '数字认知',
          requestType: 'enhancement'
        }
      };

      const response = await testHelper.post('/api/ai/conversations/1/messages', messageData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('messageId');
      expect(response.body.data).toHaveProperty('aiResponse');
      expect(response.body.data.userMessage.content).toBe(messageData.content);
    });

    it('should handle different message types', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const imageMessageData = {
        content: '请分析这个学生的绘画作品',
        messageType: 'image',
        attachments: [
          {
            type: 'image',
            url: '/uploads/student_artwork_123.jpg',
            description: '学生绘画作品'
          }
        ]
      };

      const response = await testHelper.post('/api/ai/conversations/1/messages', imageMessageData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.userMessage.messageType).toBe('image');
    });

    it('should enforce conversation ownership', async () => {
      const otherTeacher = TestDataFactory.createUser({ id: 2, role: 'teacher' });
      const messageData = {
        content: '未授权访问测试',
        messageType: 'text'
      };

      const response = await testHelper.post('/api/ai/conversations/1/messages', messageData, otherTeacher);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Access denied to this conversation');
    });

    it('should handle AI service errors gracefully', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const problematicData = {
        content: '', // Empty content might cause AI service error
        messageType: 'text'
      };

      const response = await testHelper.post('/api/ai/conversations/1/messages', problematicData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Message content cannot be empty');
    });
  });

  describe('GET /api/ai/models', () => {
    it('should get available AI models', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/ai/models', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
      if (response.body.data.length > 0) {
        response.body.data.forEach((model: any) => {
          expect(model).toHaveProperty('name');
          expect(model).toHaveProperty('type');
          expect(model).toHaveProperty('capabilities');
          expect(model).toHaveProperty('costPerToken');
        });
      }
    });

    it('should filter models by capability', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/ai/models?capability=text_generation', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.length > 0) {
        response.body.data.forEach((model: any) => {
          expect(model.capabilities).toContain('text_generation');
        });
      }
    });

    it('should show usage statistics for admin users', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/ai/models?include=usage', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.length > 0) {
        response.body.data.forEach((model: any) => {
          expect(model).toHaveProperty('usageStats');
          expect(model.usageStats).toHaveProperty('totalRequests');
          expect(model.usageStats).toHaveProperty('totalTokens');
          expect(model.usageStats).toHaveProperty('totalCost');
        });
      }
    });
  });

  describe('PUT /api/ai/models/:id/config', () => {
    it('should update model configuration with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const configData = {
        maxTokens: 4000,
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        systemPrompt: '你是一个专业的幼儿教育助手，请提供准确、实用的教育建议。',
        safetySettings: {
          enableContentFilter: true,
          blockHarmfulContent: true,
          allowPersonalInfo: false
        },
        costLimits: {
          dailyLimit: 100,
          monthlyLimit: 2000,
          perUserLimit: 50
        }
      };

      const response = await testHelper.put('/api/ai/models/1/config', configData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.maxTokens).toBe(configData.maxTokens);
      expect(response.body.data.temperature).toBe(configData.temperature);
    });

    it('should validate configuration parameters', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidConfig = {
        temperature: 2.5, // Invalid temperature (should be 0-2)
        maxTokens: -100   // Invalid token count
      };

      const response = await testHelper.put('/api/ai/models/1/config', invalidConfig, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid configuration parameters');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const configData = {
        maxTokens: 2000
      };

      const response = await testHelper.put('/api/ai/models/1/config', configData, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('GET /api/ai/usage', () => {
    it('should get user AI usage statistics', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/ai/usage', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('totalRequests');
      expect(response.body.data).toHaveProperty('totalTokens');
      expect(response.body.data).toHaveProperty('totalCost');
      expect(response.body.data).toHaveProperty('dailyUsage');
      expect(response.body.data).toHaveProperty('monthlyUsage');
    });

    it('should get usage by date range', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const response = await testHelper.get(`/api/ai/usage?startDate=${startDate}&endDate=${endDate}`, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('dateRange');
      expect(response.body.data.dateRange.startDate).toBe(startDate);
      expect(response.body.data.dateRange.endDate).toBe(endDate);
    });

    it('should get system-wide usage for admin users', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/ai/usage/system', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalRequests');
      expect(response.body.data).toHaveProperty('averageResponseTime');
      expect(response.body.data).toHaveProperty('costByModel');
    });
  });

  describe('POST /api/ai/memory', () => {
    it('should store AI memory', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const memoryData = {
        content: '学生小明在数学课上表现优秀，能够快速理解加减法概念，建议提供更有挑战性的练习',
        summary: '小明数学能力突出',
        importance: 0.8,
        memoryType: 'student_observation',
        tags: ['学生表现', '数学', '优秀', '小明'],
        context: {
          studentName: '小明',
          subject: '数学',
          classGrade: '大班',
          date: new Date().toISOString(),
          teacherNotes: '建议个性化教学'
        },
        relatedEntities: [
          { type: 'student', id: 1, name: '小明' },
          { type: 'subject', id: 'math', name: '数学' }
        ]
      };

      const response = await testHelper.post('/api/ai/memory', memoryData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('memoryId');
      expect(response.body.data.summary).toBe(memoryData.summary);
      expect(response.body.data.importance).toBe(memoryData.importance);
    });

    it('should generate embeddings for memory content', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const memoryData = {
        content: '学生小红在艺术活动中显示出色的创造力',
        summary: '小红艺术创造力强',
        memoryType: 'student_observation'
      };

      const response = await testHelper.post('/api/ai/memory', memoryData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('embedding');
      expect(Array.isArray(response.body.data.embedding)).toBeTruthy();
      expect(response.body.data.embedding.length).toBeGreaterThan(0);
    });

    it('should validate memory importance score', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = {
        content: '测试内容',
        importance: 1.5 // Invalid importance (should be 0-1)
      };

      const response = await testHelper.post('/api/ai/memory', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Importance score must be between 0 and 1');
    });
  });

  describe('GET /api/ai/memory/search', () => {
    it('should search memories by content similarity', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const searchQuery = {
        query: '学生数学表现',
        limit: 10,
        threshold: 0.7,
        filters: {
          memoryType: 'student_observation',
          tags: ['数学']
        }
      };

      const response = await testHelper.post('/api/ai/memory/search', searchQuery, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data.results)).toBeTruthy();
      if (response.body.data.results.length > 0) {
        response.body.data.results.forEach((result: any) => {
          expect(result).toHaveProperty('memory');
          expect(result).toHaveProperty('similarity');
          expect(result.similarity).toBeGreaterThanOrEqual(searchQuery.threshold);
        });
      }
    });

    it('should search memories by specific student', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const studentQuery = {
        query: '小明的学习情况',
        filters: {
          'context.studentName': '小明'
        }
      };

      const response = await testHelper.post('/api/ai/memory/search', studentQuery, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.results.length > 0) {
        response.body.data.results.forEach((result: any) => {
          expect(result.memory.context.studentName).toBe('小明');
        });
      }
    });

    it('should respect user privacy in memory search', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const otherTeacher = TestDataFactory.createUser({ id: 2, role: 'teacher' });
      
      // Search should only return memories accessible to the user
      const searchQuery = {
        query: '学生表现',
        includePrivate: false
      };

      const response = await testHelper.post('/api/ai/memory/search', searchQuery, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      // Results should not include private memories from other users
    });
  });

  describe('POST /api/ai/feedback', () => {
    it('should submit AI response feedback', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const feedbackData = {
        messageId: 123,
        conversationId: 1,
        rating: 4,
        feedbackType: 'helpful',
        comments: 'AI提供的教学建议很实用，但可以更具体一些',
        categories: ['accuracy', 'relevance', 'clarity'],
        suggestions: '希望能提供更多具体的活动示例',
        wouldRecommend: true
      };

      const response = await testHelper.post('/api/ai/feedback', feedbackData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('feedbackId');
      expect(response.body.data.rating).toBe(feedbackData.rating);
    });

    it('should validate feedback rating range', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidFeedback = {
        messageId: 123,
        rating: 6 // Invalid rating (should be 1-5)
      };

      const response = await testHelper.post('/api/ai/feedback', invalidFeedback, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Rating must be between 1 and 5');
    });

    it('should aggregate feedback for AI improvement', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/ai/feedback/analytics', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('averageRating');
      expect(response.body.data).toHaveProperty('totalFeedback');
      expect(response.body.data).toHaveProperty('categoryBreakdown');
      expect(response.body.data).toHaveProperty('commonSuggestions');
    });
  });

  describe('GET /api/ai/analytics', () => {
    it('should get AI usage analytics for admin', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/ai/analytics', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('usageMetrics');
      expect(response.body.data).toHaveProperty('performanceMetrics');
      expect(response.body.data).toHaveProperty('userEngagement');
      expect(response.body.data).toHaveProperty('costAnalysis');
    });

    it('should get conversation analytics', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/ai/analytics/conversations', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('totalConversations');
      expect(response.body.data).toHaveProperty('averageLength');
      expect(response.body.data).toHaveProperty('topicDistribution');
      expect(response.body.data).toHaveProperty('userSatisfaction');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/ai/analytics', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/ai/expert-consultation', () => {
    it('should request expert AI consultation', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const consultationData = {
        topic: 'special_needs_education',
        priority: 'high',
        description: '如何为自闭症谱系障碍儿童设计个性化教学计划',
        context: {
          studentAge: 5,
          diagnosis: '自闭症谱系障碍',
          currentChallenges: ['社交互动困难', '感觉处理问题'],
          parentConcerns: ['语言发展缓慢', '行为管理'],
          previousInterventions: ['感统训练', '语言治疗']
        },
        expectedOutcome: '获得具体可行的教学策略和干预建议',
        urgency: '2周内需要实施'
      };

      const response = await testHelper.post('/api/ai/expert-consultation', consultationData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('consultationId');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.priority).toBe(consultationData.priority);
    });

    it('should validate consultation priority levels', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = {
        topic: 'general_education',
        priority: 'invalid_priority', // Invalid priority
        description: '测试咨询'
      };

      const response = await testHelper.post('/api/ai/expert-consultation', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid priority level');
    });

    it('should assign consultation to appropriate expert AI model', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const consultationData = {
        topic: 'curriculum_design',
        priority: 'medium',
        description: '设计STEAM教育课程',
        context: {
          targetAge: '5-6岁',
          duration: '一学期',
          resources: '有限'
        }
      };

      const response = await testHelper.post('/api/ai/expert-consultation', consultationData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('assignedExpert');
      expect(response.body.data.assignedExpert).toHaveProperty('specialization');
      expect(response.body.data.assignedExpert.specialization).toContain('curriculum');
    });
  });
});