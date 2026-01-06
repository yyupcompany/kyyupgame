import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  validateStatus: () => true,
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

describe('AI记忆管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testMemoryIds: string[] = [];
  let testUserId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始AI记忆管理API全面测试...');
    console.log('📋 测试范围: 20+个AI记忆管理端点的完整参数验证');

    try {
      // 使用真实的认证凭据获取token
      authToken = await getAuthToken('admin');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 管理员认证成功');
    } catch (error) {
      console.error('❌ 管理员认证失败:', error);
      throw new Error('Failed to authenticate admin user');
    }
  });

  afterAll(async () => {
    // 清理测试数据
    console.log('🧹 清理测试AI记忆数据...');
    for (const memoryId of testMemoryIds) {
      if (authToken) {
        await apiClient.delete(`/ai/memory/${memoryId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('GET /ai/memory/test - 基础连接测试', () => {
    it('应当成功连接AI记忆服务', async () => {
      const response = await apiClient.get('/ai/memory/test');

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('message');
        expect(response.data).toHaveProperty('timestamp');
      }
    });

    it('简单测试路由应当正常工作', async () => {
      const response = await apiClient.get('/ai/memory/simple-test');

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('message');
      }
    });
  });

  describe('POST /ai/memory - 创建AI记忆参数验证', () => {
    // 有效记忆参数组合
    const validMemoryParams = [
      {
        content: '学生小明在数学课上表现优秀，能够快速解决复杂问题',
        type: 'student_observation',
        importance: 0.8,
        tags: ['数学', '优秀表现', '小明'],
        metadata: {
          studentId: 1,
          subject: 'mathematics',
          classroom: 'A101'
        }
      },
      {
        content: '教师培训会议讨论了新的教学方法',
        type: 'meeting_notes',
        importance: 0.6,
        tags: ['教师培训', '教学方法'],
        metadata: {
          meetingDate: '2025-07-13',
          participants: 15
        }
      },
      {
        content: '家长反馈孩子在家的学习情况良好',
        type: 'parent_feedback',
        importance: 0.7,
        tags: ['家长反馈', '学习情况']
      }
    ];

    // 必填字段测试
    const requiredFields = ['content', 'type'];

    requiredFields.forEach(field => {
      it(`应当在缺少必填字段时返回错误 - ${field}`, async () => {
        const invalidParams: any = { ...validMemoryParams[0] };
        delete invalidParams[field];

        const response = await apiClient.post('/ai/memory', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        if (response.data) {
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 数据类型验证测试
    const invalidDataTypes = [
      { field: 'content', value: 123, description: '非字符串内容' },
      { field: 'type', value: 123, description: '非字符串类型' },
      { field: 'importance', value: 'invalid', description: '非数字重要度' },
      { field: 'tags', value: 'invalid', description: '非数组标签' },
      { field: 'metadata', value: 'invalid', description: '非对象元数据' }
    ];

    invalidDataTypes.forEach(testCase => {
      it(`应当在无效数据类型时返回错误 - ${testCase.description}`, async () => {
        const invalidParams: any = { ...validMemoryParams[0] };
        invalidParams[testCase.field] = testCase.value;

        const response = await apiClient.post('/ai/memory', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        if (response.data) {
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 边界值测试
    const boundaryTests = [
      {
        params: { ...validMemoryParams[0], content: '' },
        description: '空内容',
        shouldPass: false
      },
      {
        params: { ...validMemoryParams[0], content: 'A' },
        description: '最短内容',
        shouldPass: true
      },
      {
        params: { ...validMemoryParams[0], content: 'A'.repeat(10000) },
        description: '超长内容',
        shouldPass: false
      },
      {
        params: { ...validMemoryParams[0], importance: -0.1 },
        description: '负重要度',
        shouldPass: false
      },
      {
        params: { ...validMemoryParams[0], importance: 0.0 },
        description: '零重要度',
        shouldPass: true
      },
      {
        params: { ...validMemoryParams[0], importance: 1.0 },
        description: '最大重要度',
        shouldPass: true
      },
      {
        params: { ...validMemoryParams[0], importance: 1.1 },
        description: '超大重要度',
        shouldPass: false
      }
    ];

    boundaryTests.forEach(test => {
      it(`应当在边界值测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/ai/memory', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data?.success && response.data?.data?.id) {
            testMemoryIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
          if (response.data) {
            expect(response.data.success).toBe(false);
          }
        }
      });
    });

    // 特殊字符和安全测试
    const securityTests = [
      {
        params: { ...validMemoryParams[0], content: '记忆<script>alert("xss")</script>' },
        description: 'XSS攻击内容'
      },
      {
        params: { ...validMemoryParams[0], content: "记忆\\'; DROP TABLE memories; --" },
        description: 'SQL注入内容'
      },
      {
        params: { ...validMemoryParams[0], type: '${process.env.SECRET}' },
        description: '模板注入类型'
      },
      {
        params: { ...validMemoryParams[0], tags: ['<script>alert("xss")</script>'] },
        description: 'XSS攻击标签'
      }
    ];

    securityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/ai/memory', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 安全测试应该被正确处理，返回400、422或201(经过过滤)
        expect([200, 201, 400, 422]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          testMemoryIds.push(response.data.data.id);
        }
      });
    });

    // 有效参数测试
    validMemoryParams.forEach((params, index) => {
      it(`应当使用有效参数成功创建AI记忆 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/ai/memory', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data).toHaveProperty('content', params.content);
          expect(response.data.data).toHaveProperty('type', params.type);
          testMemoryIds.push(response.data.data.id);
        }
      });
    });
  });

  describe('POST /ai/memory/embedding - 创建带向量嵌入的记忆参数验证', () => {
    const embeddingParams = {
      content: '这是一个需要向量嵌入的AI记忆测试',
      type: 'embedding_test',
      importance: 0.8,
      generateEmbedding: true
    };

    it('应当成功创建带向量嵌入的记忆', async () => {
      const response = await apiClient.post('/ai/memory/embedding', embeddingParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 201]).toContain(response.status);
      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data).toHaveProperty('content', embeddingParams.content);
        testMemoryIds.push(response.data.data.id);
      }
    });

    it('应当在缺少内容时返回错误', async () => {
      const invalidParams = { ...embeddingParams };
      delete invalidParams.content;

      const response = await apiClient.post('/ai/memory/embedding', invalidParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('POST /ai/memory/similar - 查找相似记忆参数验证', () => {
    const similarityParams = {
      query: '数学课程相关的学生表现',
      limit: 5,
      threshold: 0.7
    };

    it('应当成功查找相似记忆', async () => {
      const response = await apiClient.post('/ai/memory/similar', similarityParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('memories');
        expect(Array.isArray(response.data.data.memories)).toBe(true);
      }
    });

    const invalidSimilarityTests = [
      { params: {}, description: '缺少查询参数', shouldFail: true },
      { params: { query: '' }, description: '空查询', shouldFail: true },
      { params: { query: 'test', limit: -1 }, description: '负数限制', shouldFail: true },
      { params: { query: 'test', limit: 1000 }, description: '超大限制', shouldFail: true },
      { params: { query: 'test', threshold: -0.1 }, description: '负阈值', shouldFail: true },
      { params: { query: 'test', threshold: 1.1 }, description: '超大阈值', shouldFail: true }
    ];

    invalidSimilarityTests.forEach(test => {
      it(`应当在相似度查询测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/ai/memory/similar', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /ai/memory/search/:userId - 搜索用户记忆参数验证', () => {
    it('应当成功搜索用户记忆', async () => {
      const response = await apiClient.get(`/ai/memory/search/${testUserId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
      }
    });

    const userIdTests = [
      { userId: 'invalid', description: '无效用户ID', shouldFail: true },
      { userId: 0, description: '零用户ID', shouldFail: true },
      { userId: -1, description: '负用户ID', shouldFail: true },
      { userId: 999999, description: '不存在的用户ID', shouldFail: false } // 可能返回空结果而不是错误
    ];

    userIdTests.forEach(test => {
      it(`应当在用户ID验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/ai/memory/search/${test.userId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 404, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /ai/memory/stats/:userId - 获取记忆统计参数验证', () => {
    it('应当成功获取记忆统计信息', async () => {
      const response = await apiClient.get(`/ai/memory/stats/${testUserId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('totalMemories');
        expect(response.data.data).toHaveProperty('memoryTypes');
      }
    });

    it('应当在无效用户ID时返回错误', async () => {
      const response = await apiClient.get('/ai/memory/stats/invalid', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('GET /ai/memory/conversation/:userId/:conversationId - 获取会话记忆参数验证', () => {
    const testConversationId = 'test-conversation-uuid';

    it('应当获取会话记忆', async () => {
      const response = await apiClient.get(`/ai/memory/conversation/${testUserId}/${testConversationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
      }
    });

    const conversationTests = [
      { userId: 'invalid', conversationId: 'test', description: '无效用户ID' },
      { userId: testUserId, conversationId: '', description: '空会话ID' },
      { userId: testUserId, conversationId: 'invalid-uuid', description: '无效会话ID格式' }
    ];

    conversationTests.forEach(test => {
      it(`应当在会话记忆查询时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/ai/memory/conversation/${test.userId}/${test.conversationId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 404, 422]).toContain(response.status);
      });
    });
  });

  describe('GET /ai/memory/:memoryId - 获取单个记忆详情参数验证', () => {
    let testMemoryId: string;

    beforeAll(async () => {
      // 创建一个测试记忆用于详情查询
      const testMemory = {
        content: 'AI记忆详情测试内容',
        type: 'detail_test',
        importance: 0.5
      };

      const response = await apiClient.post('/ai/memory', testMemory, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testMemoryId = response.data.data.id;
        testMemoryIds.push(testMemoryId);
      }
    });

    it('应当成功获取记忆详情', async () => {
      if (!testMemoryId) {
        console.warn('跳过记忆详情测试：无法创建测试记忆');
        return;
      }

      const response = await apiClient.get(`/ai/memory/${testMemoryId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('id', testMemoryId);
      }
    });

    it('应当在获取不存在记忆时返回404', async () => {
      const response = await apiClient.get('/ai/memory/nonexistent-id', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });
  });

  describe('PUT /ai/memory/:memoryId - 更新记忆参数验证', () => {
    let testMemoryId: string;

    beforeAll(async () => {
      // 创建一个测试记忆用于更新测试
      const testMemory = {
        content: 'AI记忆更新测试内容',
        type: 'update_test',
        importance: 0.6
      };

      const response = await apiClient.post('/ai/memory', testMemory, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testMemoryId = response.data.data.id;
        testMemoryIds.push(testMemoryId);
      }
    });

    const updateTests = [
      { data: { content: '更新的记忆内容' }, description: '更新记忆内容' },
      { data: { importance: 0.9 }, description: '更新重要度' },
      { data: { tags: ['新标签', '更新'] }, description: '更新标签' },
      { data: { content: '' }, description: '空内容更新', shouldFail: true },
      { data: { importance: 1.5 }, description: '无效重要度', shouldFail: true },
      { data: { tags: 'invalid' }, description: '无效标签格式', shouldFail: true }
    ];

    updateTests.forEach(test => {
      it(`应当在更新测试时正确处理 - ${test.description}`, async () => {
        if (!testMemoryId) {
          console.warn('跳过更新测试：无法创建测试记忆');
          return;
        }

        const response = await apiClient.put(`/ai/memory/${testMemoryId}`, test.data, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
          }
        }
      });
    });
  });

  describe('PUT /ai/memory/archive/:memoryId - 归档记忆参数验证', () => {
    let testMemoryId: string;

    beforeAll(async () => {
      // 创建一个测试记忆用于归档测试
      const testMemory = {
        content: 'AI记忆归档测试内容',
        type: 'archive_test',
        importance: 0.7
      };

      const response = await apiClient.post('/ai/memory', testMemory, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testMemoryId = response.data.data.id;
        testMemoryIds.push(testMemoryId);
      }
    });

    it('应当成功归档记忆', async () => {
      if (!testMemoryId) {
        console.warn('跳过归档测试：无法创建测试记忆');
        return;
      }

      const response = await apiClient.put(`/ai/memory/archive/${testMemoryId}`, {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
      }
    });

    it('应当在归档不存在记忆时返回404', async () => {
      const response = await apiClient.put('/ai/memory/archive/nonexistent-id', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'get', url: '/ai/memories' },
      { method: 'post', url: '/ai/memory', data: { content: 'Test', type: 'test' } },
      { method: 'post', url: '/ai/memory/similar', data: { query: 'test' } },
      { method: 'get', url: `/ai/memory/search/${testUserId}` },
      { method: 'get', url: `/ai/memory/stats/${testUserId}` },
      { method: 'get', url: '/ai/memory/test-id' },
      { method: 'put', url: '/ai/memory/test-id', data: { content: 'Updated' } },
      { method: 'delete', url: '/ai/memory/test-id' }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        } else if (endpoint.method === 'post') {
          response = await apiClient.post(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'put') {
          response = await apiClient.put(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'delete') {
          response = await apiClient.delete(endpoint.url);
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/ai/memories', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('性能测试', () => {
    it('创建AI记忆API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const testParams = {
        content: '性能测试AI记忆内容',
        type: 'performance_test',
        importance: 0.5
      };

      const response = await apiClient.post('/ai/memory', testParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 响应时间应小于3秒
      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testMemoryIds.push(response.data.data.id);
      }
    });

    it('查找相似记忆API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.post('/ai/memory/similar', {
        query: '测试查询',
        limit: 5
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // 向量搜索响应时间应小于5秒
      expect([200]).toContain(response.status);
    });

    it('并发记忆查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get(`/ai/memory/search/${testUserId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(6000); // 3个并发请求总时间应小于6秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });
  });
});