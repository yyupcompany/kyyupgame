/**
 * AI功能API专项测试
 * 
 * 测试覆盖：
 * - AI服务健康检查
 * - AI模型管理
 * - 对话管理
 * - 消息处理
 * - AI配额管理
 * - 性能监控
 */

import request from 'supertest';
import { vi } from 'vitest'
import { app } from '../../src/app';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database';
import { createAdminUser, createTeacherUser } from '../setup/auth';
import { TestDataFactory } from '../setup/test-data-factory';


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

describe('AI API Tests', () => {
  let adminToken: string;
  let teacherToken: string;
  let testDataFactory: TestDataFactory;

  beforeAll(async () => {
    await setupTestDatabase();
    testDataFactory = new TestDataFactory();

    const admin = await createAdminUser('ai-test-admin');
    adminToken = admin.token;

    const teacher = await createTeacherUser('ai-test-teacher');
    teacherToken = teacher.token;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('GET /api/ai/health', () => {
    it('should return AI service health status', async () => {
      const response = await request(app)
        .get('/api/ai/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('services');
      
      // 验证服务状态结构
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.data.status);
    });

    it('should include service details in health check', async () => {
      const response = await request(app)
        .get('/api/ai/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.services).toHaveProperty('database');
      expect(response.body.data.services).toHaveProperty('ai_models');
      expect(response.body.data.services).toHaveProperty('memory_system');
    });

    it('should allow teachers to check AI health', async () => {
      const response = await request(app)
        .get('/api/ai/health')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/ai/models', () => {
    it('should return available AI models', async () => {
      const response = await request(app)
        .get('/api/ai/models')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('models');
      expect(Array.isArray(response.body.data.models)).toBe(true);

      if (response.body.data.models.length > 0) {
        const model = response.body.data.models[0];
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('type');
        expect(model).toHaveProperty('status');
        expect(model).toHaveProperty('capabilities');
      }
    });

    it('should filter models by type', async () => {
      const response = await request(app)
        .get('/api/ai/models')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ type: 'chat' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      if (response.body.data.models.length > 0) {
        response.body.data.models.forEach((model: any) => {
          expect(model.type).toBe('chat');
        });
      }
    });

    it('should include model capabilities', async () => {
      const response = await request(app)
        .get('/api/ai/models')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.data.models.length > 0) {
        const model = response.body.data.models[0];
        expect(model.capabilities).toHaveProperty('maxTokens');
        expect(model.capabilities).toHaveProperty('supportedLanguages');
        expect(model.capabilities).toHaveProperty('features');
      }
    });
  });

  describe('AI Conversations Management', () => {
    let testConversation: any;

    describe('POST /api/ai/conversations', () => {
      it('should create new AI conversation', async () => {
        const conversationData = {
          title: '测试AI对话',
          context: {
            userRole: 'teacher',
            permissions: ['students:read', 'classes:read'],
            currentPage: '/dashboard'
          },
          modelId: 'gpt-3.5-turbo'
        };

        const response = await request(app)
          .post('/api/ai/conversations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(conversationData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('title', conversationData.title);
        expect(response.body.data).toHaveProperty('context');
        expect(response.body.data).toHaveProperty('status', 'active');
        expect(response.body.data).toHaveProperty('createdAt');

        testConversation = response.body.data;
      });

      it('should validate conversation data', async () => {
        const response = await request(app)
          .post('/api/ai/conversations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
      });

      it('should set default values for optional fields', async () => {
        const response = await request(app)
          .post('/api/ai/conversations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            title: '简单对话'
          })
          .expect(201);

        expect(response.body.data).toHaveProperty('context');
        expect(response.body.data).toHaveProperty('status', 'active');
      });
    });

    describe('GET /api/ai/conversations', () => {
      it('should return user conversations', async () => {
        const response = await request(app)
          .get('/api/ai/conversations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('conversations');
        expect(Array.isArray(response.body.data.conversations)).toBe(true);
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('page');
        expect(response.body.data).toHaveProperty('limit');
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/ai/conversations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body.data.page).toBe(1);
        expect(response.body.data.limit).toBe(5);
        expect(response.body.data.conversations.length).toBeLessThanOrEqual(5);
      });

      it('should filter conversations by status', async () => {
        const response = await request(app)
          .get('/api/ai/conversations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({ status: 'active' })
          .expect(200);

        response.body.data.conversations.forEach((conv: any) => {
          expect(conv.status).toBe('active');
        });
      });
    });

    describe('GET /api/ai/conversations/:id', () => {
      it('should return conversation details', async () => {
        const response = await request(app)
          .get(`/api/ai/conversations/${testConversation.id}`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id', testConversation.id);
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('messages');
        expect(Array.isArray(response.body.data.messages)).toBe(true);
      });

      it('should return 404 for nonexistent conversation', async () => {
        const response = await request(app)
          .get('/api/ai/conversations/99999')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
      });

      it('should deny access to other users conversations', async () => {
        const response = await request(app)
          .get(`/api/ai/conversations/${testConversation.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('权限不足');
      });
    });
  });

  describe('AI Messages Management', () => {
    let testConversation: any;

    beforeAll(async () => {
      // 创建测试对话
      testConversation = await testDataFactory.createAIConversation({
        userId: 1, // 假设teacher用户ID为1
        title: '消息测试对话',
        context: { userRole: 'teacher' }
      });
    });

    describe('POST /api/ai/conversations/:id/messages', () => {
      it('should send message to AI', async () => {
        const messageData = {
          content: '请帮我分析一下班级的学习情况',
          role: 'user',
          metadata: {
            messageType: 'query',
            context: 'classroom_analysis'
          }
        };

        const response = await request(app)
          .post(`/api/ai/conversations/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(messageData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('userMessage');
        expect(response.body.data).toHaveProperty('aiResponse');
        
        expect(response.body.data.userMessage).toHaveProperty('content', messageData.content);
        expect(response.body.data.userMessage).toHaveProperty('role', 'user');
        
        expect(response.body.data.aiResponse).toHaveProperty('content');
        expect(response.body.data.aiResponse).toHaveProperty('role', 'assistant');
        expect(response.body.data.aiResponse).toHaveProperty('metadata');
      });

      it('should validate message content', async () => {
        const response = await request(app)
          .post(`/api/ai/conversations/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('消息内容不能为空');
      });

      it('should handle long messages', async () => {
        const longMessage = 'A'.repeat(5000); // 5000字符的长消息
        
        const response = await request(app)
          .post(`/api/ai/conversations/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            content: longMessage,
            role: 'user'
          })
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.userMessage.content).toBe(longMessage);
      });

      it('should handle AI service errors gracefully', async () => {
        // 模拟AI服务不可用的情况
        const response = await request(app)
          .post(`/api/ai/conversations/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            content: 'SIMULATE_AI_ERROR', // 特殊标记触发错误
            role: 'user'
          });

        // 根据实际错误处理策略，可能返回200（带错误信息）或500
        if (response.status === 500) {
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('message');
        } else {
          expect(response.body.data.aiResponse).toHaveProperty('error');
        }
      });
    });

    describe('GET /api/ai/conversations/:id/messages', () => {
      it('should return conversation messages', async () => {
        const response = await request(app)
          .get(`/api/ai/conversations/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('messages');
        expect(Array.isArray(response.body.data.messages)).toBe(true);
        expect(response.body.data).toHaveProperty('total');
      });

      it('should support message pagination', async () => {
        const response = await request(app)
          .get(`/api/ai/conversations/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.data.page).toBe(1);
        expect(response.body.data.limit).toBe(10);
      });

      it('should filter messages by role', async () => {
        const response = await request(app)
          .get(`/api/ai/conversations/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({ role: 'user' })
          .expect(200);

        response.body.data.messages.forEach((message: any) => {
          expect(message.role).toBe('user');
        });
      });
    });
  });

  describe('AI Quota Management', () => {
    describe('GET /api/ai/quota/user', () => {
      it('should return user AI quota information', async () => {
        const response = await request(app)
          .get('/api/ai/quota/user')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('totalQuota');
        expect(response.body.data).toHaveProperty('usedQuota');
        expect(response.body.data).toHaveProperty('remainingQuota');
        expect(response.body.data).toHaveProperty('resetDate');
        expect(response.body.data).toHaveProperty('quotaType');
      });

      it('should show quota usage details', async () => {
        const response = await request(app)
          .get('/api/ai/quota/user')
          .set('Authorization', `Bearer ${teacherToken}`)
          .query({ detailed: true })
          .expect(200);

        expect(response.body.data).toHaveProperty('usageHistory');
        expect(response.body.data).toHaveProperty('dailyUsage');
        expect(response.body.data).toHaveProperty('monthlyUsage');
      });
    });
  });

  describe('AI Analytics', () => {
    describe('GET /api/ai/analytics', () => {
      it('should return AI usage analytics for admin', async () => {
        const response = await request(app)
          .get('/api/ai/analytics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('totalConversations');
        expect(response.body.data).toHaveProperty('totalMessages');
        expect(response.body.data).toHaveProperty('activeUsers');
        expect(response.body.data).toHaveProperty('averageResponseTime');
        expect(response.body.data).toHaveProperty('popularModels');
      });

      it('should deny access to non-admin users', async () => {
        const response = await request(app)
          .get('/api/ai/analytics')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
      });

      it('should support date range filtering', async () => {
        const response = await request(app)
          .get('/api/ai/analytics')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('dateRange');
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent AI requests', async () => {
      const conversation = await testDataFactory.createAIConversation({
        userId: 1,
        title: '并发测试对话'
      });

      const requests = Array(5).fill(null).map((_, i) =>
        request(app)
          .post(`/api/ai/conversations/${conversation.id}/messages`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            content: `并发测试消息 ${i + 1}`,
            role: 'user'
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect([200, 201]).toContain(response.status);
        if (response.status === 201) {
          expect(response.body).toHaveProperty('success', true);
        }
      });
    });

    it('should respond to AI requests within reasonable time', async () => {
      const conversation = await testDataFactory.createAIConversation({
        userId: 1,
        title: '性能测试对话'
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .post(`/api/ai/conversations/${conversation.id}/messages`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          content: '这是一个简单的测试消息',
          role: 'user'
        });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(10000); // 10秒内响应
      expect([200, 201]).toContain(response.status);
    });
  });
});
