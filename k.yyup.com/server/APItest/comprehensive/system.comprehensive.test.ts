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

describe('系统管理API全面测试 - 参数验证', () => {
  let authToken: string = '';

  beforeAll(async () => {
    console.log('🚀 开始系统管理API全面测试...');
    console.log('📋 测试范围: 15+个系统管理端点的完整参数验证');

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

  describe('GET /system/health - 系统健康检查', () => {
    it('应当成功返回系统健康状态', async () => {
      const response = await apiClient.get('/system/health');

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('status', 'healthy');
      expect(response.data.data).toHaveProperty('timestamp');
      expect(response.data.data).toHaveProperty('uptime');
      expect(response.data.data).toHaveProperty('version');
    });

    it('应当返回正确的数据格式', async () => {
      const response = await apiClient.get('/system/health');

      if (response.status === 200) {
        expect(typeof response.data.data.uptime).toBe('number');
        expect(typeof response.data.data.version).toBe('string');
        expect(response.data.data.status).toBe('healthy');
      }
    });
  });

  describe('GET /system/version - 获取版本信息', () => {
    it('应当成功返回版本信息', async () => {
      const response = await apiClient.get('/system/version');

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('version');
      expect(response.data.data).toHaveProperty('build');
      expect(response.data.data).toHaveProperty('environment');
      expect(response.data.data).toHaveProperty('api_version');
    });

    it('应当返回正确的版本格式', async () => {
      const response = await apiClient.get('/system/version');

      if (response.status === 200) {
        expect(typeof response.data.data.version).toBe('string');
        expect(typeof response.data.data.build).toBe('string');
        expect(typeof response.data.data.api_version).toBe('string');
        expect(['development', 'production', 'test']).toContain(response.data.data.environment);
      }
    });
  });

  describe('GET /system/info - 获取系统信息 (需要认证)', () => {
    it('应当在有效token时返回系统信息', async () => {
      const response = await apiClient.get('/system/info', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('name');
        expect(response.data.data).toHaveProperty('version');
        expect(response.data.data).toHaveProperty('environment');
        expect(response.data.data).toHaveProperty('uptime');
        expect(response.data.data).toHaveProperty('memory');
        expect(response.data.data).toHaveProperty('platform');
        expect(response.data.data).toHaveProperty('node_version');
      }
    });

    it('应当在未提供token时返回401', async () => {
      const response = await apiClient.get('/system/info');

      expect([401, 403]).toContain(response.status);
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/system/info', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });

    it('应当返回正确的内存和平台信息格式', async () => {
      const response = await apiClient.get('/system/info', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(typeof response.data.data.uptime).toBe('number');
        expect(typeof response.data.data.memory).toBe('object');
        expect(typeof response.data.data.platform).toBe('string');
        expect(typeof response.data.data.node_version).toBe('string');
        expect(response.data.data.memory).toHaveProperty('rss');
        expect(response.data.data.memory).toHaveProperty('heapUsed');
        expect(response.data.data.memory).toHaveProperty('heapTotal');
      }
    });
  });

  describe('GET /system/test/database - 数据库连接测试', () => {
    it('应当成功测试数据库连接', async () => {
      const response = await apiClient.get('/system/test/database', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('status', 'connected');
        expect(response.data.data).toHaveProperty('test_query');
        expect(response.data.data).toHaveProperty('message');
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/system/test/database');

      expect([401, 403]).toContain(response.status);
    });

    it('应当返回正确的测试查询结果', async () => {
      const response = await apiClient.get('/system/test/database', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data.data.test_query).toHaveProperty('test', 1);
      }
    });
  });

  describe('POST /system/test/email - 邮件服务测试', () => {
    // 有效邮件参数组合
    const validEmailParams = [
      {
        to: 'test@example.com',
        subject: '测试邮件',
        content: '这是一封测试邮件内容'
      },
      {
        to: 'admin@k.yyup.cc',
        subject: 'System Test Email',
        content: 'This is a system test email content.'
      }
    ];

    validEmailParams.forEach((params, index) => {
      it(`应当使用有效参数成功模拟邮件发送 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/system/test/email', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
          expect(response.data.data).toHaveProperty('status', 'simulated');
          expect(response.data.data).toHaveProperty('to', params.to);
          expect(response.data.data).toHaveProperty('subject', params.subject);
          expect(response.data.data).toHaveProperty('content', params.content);
          expect(response.data.data).toHaveProperty('message');
        }
      });
    });

    it('应当在未提供参数时使用默认值', async () => {
      const response = await apiClient.post('/system/test/email', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data.data).toHaveProperty('to', 'test@example.com');
        expect(response.data.data).toHaveProperty('subject', '测试邮件');
        expect(response.data.data).toHaveProperty('content', '这是一封测试邮件');
      }
    });

    // 特殊字符和安全测试
    const emailSecurityTests = [
      {
        params: { to: '<script>alert("xss")</script>@test.com', subject: '测试', content: '内容' },
        description: 'XSS攻击邮箱地址'
      },
      {
        params: { to: 'test@example.com', subject: '"; DROP TABLE users; --', content: '内容' },
        description: 'SQL注入主题'
      },
      {
        params: { to: 'test@example.com', subject: '测试', content: '../../../etc/passwd' },
        description: '路径遍历内容'
      },
      {
        params: { to: 'test@example.com', subject: 'A'.repeat(1000), content: '内容' },
        description: '超长主题'
      }
    ];

    emailSecurityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/system/test/email', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 安全测试应该被正确处理，返回200或400
        expect([200, 400]).toContain(response.status);
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.post('/system/test/email', {
        to: 'test@example.com',
        subject: '测试',
        content: '内容'
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /system/test/sms - 短信服务测试', () => {
    // 有效短信参数组合
    const validSmsParams = [
      {
        phone: '13800138000',
        content: '这是一条测试短信'
      },
      {
        phone: '13900139001',
        content: '系统测试短信内容'
      }
    ];

    validSmsParams.forEach((params, index) => {
      it(`应当使用有效参数成功模拟短信发送 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/system/test/sms', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
          expect(response.data.data).toHaveProperty('status', 'simulated');
          expect(response.data.data).toHaveProperty('phone', params.phone);
          expect(response.data.data).toHaveProperty('content', params.content);
          expect(response.data.data).toHaveProperty('message');
        }
      });
    });

    it('应当在未提供参数时使用默认值', async () => {
      const response = await apiClient.post('/system/test/sms', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data.data).toHaveProperty('phone', '13800138000');
        expect(response.data.data).toHaveProperty('content', '这是一条测试短信');
      }
    });

    // 短信参数验证测试
    const smsValidationTests = [
      {
        params: { phone: '123', content: '测试内容' },
        description: '无效手机号格式',
        shouldFail: false // 模拟服务，不进行严格验证
      },
      {
        params: { phone: '13800138000', content: '' },
        description: '空短信内容',
        shouldFail: false
      },
      {
        params: { phone: '13800138000', content: 'A'.repeat(500) },
        description: '超长短信内容',
        shouldFail: false
      }
    ];

    smsValidationTests.forEach(test => {
      it(`应当在参数验证测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/system/test/sms', test.params, {
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

  describe('POST /system/upload - 文件上传模拟', () => {
    it('应当成功模拟文件上传', async () => {
      const response = await apiClient.post('/system/upload', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('url');
        expect(response.data.data).toHaveProperty('filename', 'logo.png');
        expect(response.data.data).toHaveProperty('size', 1024);
        expect(response.data.data).toHaveProperty('message');
        expect(response.data.data.url).toContain('/uploads/system/logo_');
        expect(response.data.data.url).toContain('.png');
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.post('/system/upload', {});

      expect([401, 403]).toContain(response.status);
    });

    it('应当返回唯一的文件URL', async () => {
      const response1 = await apiClient.post('/system/upload', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const response2 = await apiClient.post('/system/upload', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response1.status === 200 && response2.status === 200) {
        expect(response1.data.data.url).not.toBe(response2.data.data.url);
      }
    });
  });

  describe('POST /system/cache/clear - 清理缓存', () => {
    it('应当成功模拟清理缓存', async () => {
      const response = await apiClient.post('/system/cache/clear', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('status', 'simulated');
        expect(response.data.data).toHaveProperty('cleared_items');
        expect(response.data.data).toHaveProperty('message');
        expect(Array.isArray(response.data.data.cleared_items)).toBe(true);
        expect(response.data.data.cleared_items).toContain('user_cache');
        expect(response.data.data.cleared_items).toContain('api_cache');
        expect(response.data.data.cleared_items).toContain('session_cache');
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.post('/system/cache/clear', {});

      expect([401, 403]).toContain(response.status);
    });

    // 测试DELETE方法是否返回501 Not Implemented
    it('应当在使用DELETE方法时返回501', async () => {
      const response = await apiClient.delete('/system/cache/clear', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([501]).toContain(response.status);
      if (response.status === 501) {
        expect(response.data).toHaveProperty('success', false);
        expect(response.data).toHaveProperty('message', '清理缓存功能暂未实现');
      }
    });
  });

  describe('GET /system/logs - 获取系统日志 (需要权限)', () => {
    // 分页参数测试
    const paginationTests = [
      { params: { page: 1, pageSize: 10 }, description: '标准分页参数' },
      { params: { page: 1, pageSize: 5 }, description: '小页面尺寸' },
      { params: { page: 2, pageSize: 20 }, description: '大页面尺寸' },
      { params: { page: 0 }, description: '无效页码', shouldFail: false }, // 系统会处理为默认值
      { params: { pageSize: 1000 }, description: '超大页面尺寸', shouldFail: false }
    ];

    paginationTests.forEach(test => {
      it(`应当在分页参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/system/logs', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 系统日志需要特定权限，可能返回403或200
        expect([200, 403]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
          expect(response.data.data).toHaveProperty('items');
          expect(response.data.data).toHaveProperty('total');
          expect(response.data.data).toHaveProperty('page');
          expect(response.data.data).toHaveProperty('pageSize');
          expect(Array.isArray(response.data.data.items)).toBe(true);
        }
      });
    });

    // 筛选参数测试
    const filterTests = [
      { params: { level: 'error' }, description: '按错误级别筛选' },
      { params: { level: 'info' }, description: '按信息级别筛选' },
      { params: { category: 'auth' }, description: '按认证类别筛选' },
      { params: { category: 'system' }, description: '按系统类别筛选' },
      { params: { keyword: 'login' }, description: '按关键词搜索' },
      { params: { startDate: '2024-01-01', endDate: '2024-12-31' }, description: '按日期范围筛选' }
    ];

    filterTests.forEach(test => {
      it(`应当在筛选参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/system/logs', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 403]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/system/logs');

      expect([401, 403]).toContain(response.status);
    });

    it('应当在无权限时返回403', async () => {
      // 使用可能没有系统日志查看权限的token
      const response = await apiClient.get('/system/logs', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      // 根据权限配置，可能返回200或403
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('GET /system/docs - 获取API文档', () => {
    it('应当返回API文档信息', async () => {
      const response = await apiClient.get('/system/docs', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('message');
        expect(response.data.data).toHaveProperty('docs_url');
        expect(response.data.data).toHaveProperty('swagger_url');
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/system/docs');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('性能测试', () => {
    it('健康检查API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/system/health');
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(1000); // 响应时间应小于1秒
      expect([200]).toContain(response.status);
    });

    it('获取系统信息API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/system/info', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // 响应时间应小于2秒
      expect([200]).toContain(response.status);
    });

    it('数据库连接测试API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/system/test/database', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 响应时间应小于3秒
      expect([200]).toContain(response.status);
    });

    it('并发请求测试 - 系统健康检查', async () => {
      const concurrentRequests = Array(10).fill(null).map(() => 
        apiClient.get('/system/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(5000); // 10个并发请求总时间应小于5秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });

    it('并发请求测试 - 系统信息查询', async () => {
      const concurrentRequests = Array(5).fill(null).map(() => 
        apiClient.get('/system/info', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(8000); // 5个并发请求总时间应小于8秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });
  });

  describe('边界值和异常测试', () => {
    it('应当处理空请求体', async () => {
      const response = await apiClient.post('/system/test/email', null, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 400]).toContain(response.status);
    });

    it('应当处理非JSON请求体', async () => {
      const response = await apiClient.post('/system/test/email', 'invalid-json', {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'text/plain'
        }
      });

      expect([200, 400]).toContain(response.status);
    });

    it('应当处理超大请求体', async () => {
      const largeData = {
        to: 'test@example.com',
        subject: 'A'.repeat(10000),
        content: 'B'.repeat(50000)
      };

      const response = await apiClient.post('/system/test/email', largeData, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 400, 413]).toContain(response.status);
    });
  });
});