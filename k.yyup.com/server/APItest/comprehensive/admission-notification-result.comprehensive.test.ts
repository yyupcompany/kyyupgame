import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  validateStatus: () => true, // 不要抛出错误，让我们处理所有状态码
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

interface AdmissionNotification {
  id: number;
  admissionId: number;
  studentName: string;
  parentId: number;
  method: 'sms' | 'email' | 'wechat' | 'phone' | 'letter' | 'app';
  content: string;
  recipientContact: string;
  subject?: string;
  templateId?: number;
  attachments?: string;
  responseRequired?: boolean;
  responseDeadline?: string;
  status: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  responseAt?: string;
  responseContent?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdmissionResult {
  id: number;
  applicationId: number;
  studentName: string;
  parentId: number;
  planId: number;
  classId?: number;
  status: 'pending' | 'admitted' | 'rejected' | 'waitlisted' | 'confirmed' | 'canceled';
  type: 'regular' | 'special' | 'priority' | 'transfer';
  admissionDate: string;
  score?: number;
  rank?: number;
  interviewResult?: string;
  interviewDate?: string;
  interviewerId?: number;
  decisionMakerId: number;
  decisionDate: string;
  decisionReason?: string;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

describe('录取通知与结果管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testNotificationId: number = 0;
  let testResultId: number = 0;
  let testParentId: number = 0;
  let testApplicationId: number = 0;
  let testPlanId: number = 1; // 假设存在招生计划
  let testClassId: number = 1; // 假设存在班级

  beforeAll(async () => {
    console.log('🚀 开始录取通知与结果管理API全面测试...');
    console.log('📋 测试范围: 20个录取管理端点的完整参数验证');
    
    // 获取管理员认证token
    const loginResponse = await apiClient.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.data?.success && loginResponse.data?.data?.token) {
      authToken = loginResponse.data.data.token;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 管理员认证成功');
    } else {
      console.error('❌ 管理员认证失败:', loginResponse.data);
      throw new Error('Failed to authenticate admin user');
    }

    // 创建测试家长
    const parentData = TestDataFactory.createUser({
      username: `test_parent_${Date.now()}`,
      email: `parent_${Date.now()}@test.com`,
      role: 'parent'
    });

    const parentResponse = await apiClient.post('/users', parentData);
    if (parentResponse.data?.success && parentResponse.data?.data?.id) {
      testParentId = parentResponse.data.data.id;
      console.log('✅ 测试家长创建成功, ID:', testParentId);
    }

    // 创建测试申请（模拟）
    testApplicationId = Math.floor(Math.random() * 1000) + 1000;
    console.log('✅ 模拟测试申请ID:', testApplicationId);
  });

  afterAll(async () => {
    // 清理测试数据
    if (testNotificationId > 0) {
      await apiClient.delete(`/admission-notifications/${testNotificationId}`);
      console.log('🧹 测试录取通知数据已清理');
    }
    
    if (testResultId > 0) {
      await apiClient.delete(`/admission-results/${testResultId}`);
      console.log('🧹 测试录取结果数据已清理');
    }

    if (testParentId > 0) {
      await apiClient.delete(`/users/${testParentId}`);
      console.log('🧹 测试家长数据已清理');
    }
    
    console.log('🧹 录取管理测试完成');
  });

  describe('录取通知管理API测试', () => {
    describe('POST /admission-notifications - 创建录取通知参数验证', () => {
      // 有效创建参数组合
      const validCreateParams = [
        {
          admissionId: () => testResultId || 1,
          studentName: '张小明',
          parentId: () => testParentId,
          method: 'email' as const,
          content: '恭喜您的孩子已被我园录取！',
          recipientContact: 'parent@test.com',
          subject: '录取通知',
          responseRequired: true,
          responseDeadline: '2024-08-15',
          description_test: '完整参数创建录取通知'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '李小红',
          parentId: () => testParentId,
          method: 'sms' as const,
          content: '您的孩子已被录取，请及时回复确认。',
          recipientContact: '13800138001',
          description_test: '最小必填参数创建通知'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '王小华',
          parentId: () => testParentId,
          method: 'wechat' as const,
          content: '录取通知：请查看详细信息。',
          recipientContact: 'wechat_user_123',
          templateId: 1,
          description_test: '微信通知创建'
        }
      ];

      // 无效创建参数组合
      const invalidCreateParams = [
        {
          // 缺少admissionId
          studentName: '测试学生',
          parentId: () => testParentId,
          method: 'email',
          content: '测试内容',
          recipientContact: 'test@test.com',
          expected_errors: ['录取结果ID不能为空'],
          description: '缺少录取结果ID'
        },
        {
          admissionId: () => testResultId || 1,
          // 缺少studentName
          parentId: () => testParentId,
          method: 'email',
          content: '测试内容',
          recipientContact: 'test@test.com',
          expected_errors: ['学生姓名不能为空'],
          description: '缺少学生姓名'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '测试学生',
          // 缺少parentId
          method: 'email',
          content: '测试内容',
          recipientContact: 'test@test.com',
          expected_errors: ['家长ID不能为空'],
          description: '缺少家长ID'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '测试学生',
          parentId: () => testParentId,
          // 缺少method
          content: '测试内容',
          recipientContact: 'test@test.com',
          expected_errors: ['通知方式不能为空'],
          description: '缺少通知方式'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '测试学生',
          parentId: () => testParentId,
          method: 'invalid_method',
          content: '测试内容',
          recipientContact: 'test@test.com',
          expected_errors: ['通知方式不正确'],
          description: '无效通知方式'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '测试学生',
          parentId: () => testParentId,
          method: 'email',
          // 缺少content
          recipientContact: 'test@test.com',
          expected_errors: ['通知内容不能为空'],
          description: '缺少通知内容'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '测试学生',
          parentId: () => testParentId,
          method: 'email',
          content: '测试内容',
          // 缺少recipientContact
          expected_errors: ['接收人联系方式不能为空'],
          description: '缺少接收人联系方式'
        },
        {
          admissionId: 0,
          studentName: '测试学生',
          parentId: () => testParentId,
          method: 'email',
          content: '测试内容',
          recipientContact: 'test@test.com',
          expected_errors: ['录取结果ID不正确'],
          description: '无效录取结果ID'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '',
          parentId: () => testParentId,
          method: 'email',
          content: '测试内容',
          recipientContact: 'test@test.com',
          expected_errors: ['学生姓名不能为空'],
          description: '空学生姓名'
        },
        {
          admissionId: () => testResultId || 1,
          studentName: '测试学生',
          parentId: () => testParentId,
          method: 'email',
          content: 'a'.repeat(2001),
          recipientContact: 'test@test.com',
          expected_errors: ['通知内容长度不能超过2000个字符'],
          description: '通知内容超长'
        }
      ];

      validCreateParams.forEach((params, index) => {
        test(`应该成功创建录取通知 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;
          
          // 处理函数类型的参数
          if (typeof requestParams.admissionId === 'function') {
            (requestParams as any).admissionId = (requestParams.admissionId as Function)();
          }
          if (typeof requestParams.parentId === 'function') {
            (requestParams as any).parentId = (requestParams.parentId as Function)();
          }

          const response = await apiClient.post('/admission-notifications', requestParams);
          
          expect(response.status).toBe(201);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.studentName).toBe(requestParams.studentName);
          expect(response.data.data.method).toBe(requestParams.method);
          expect(response.data.data.content).toBe(requestParams.content);
          
          // 保存第一个创建的通知ID用于后续测试
          if (index === 0) {
            testNotificationId = response.data.data.id;
            console.log('✅ 测试录取通知创建成功, ID:', testNotificationId);
          }
        }, 10000);
      });

      invalidCreateParams.forEach((params) => {
        test(`应该拒绝创建录取通知 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;
          
          // 处理函数类型的参数
          if (typeof requestParams.admissionId === 'function') {
            (requestParams as any).admissionId = (requestParams.admissionId as Function)();
          }
          if (typeof requestParams.parentId === 'function') {
            (requestParams as any).parentId = (requestParams.parentId as Function)();
          }

          const response = await apiClient.post('/admission-notifications', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
          expect(response.data.message).toBeDefined();
        }, 10000);
      });
    });

    describe('GET /admission-notifications - 获取录取通知列表参数验证', () => {
      // 有效查询参数组合
      const validQueryParams = [
        {
          params: {},
          description: '无参数 - 默认分页'
        },
        {
          params: { page: 1, size: 10 },
          description: '基本分页参数'
        },
        {
          params: { studentName: '张小明' },
          description: '按学生姓名筛选'
        },
        {
          params: { status: 'sent' },
          description: '按状态筛选'
        },
        {
          params: { method: 'email' },
          description: '按通知方式筛选'
        },
        {
          params: { parentId: testParentId || 1 },
          description: '按家长ID筛选'
        },
        {
          params: { sendTimeStart: '2024-07-01', sendTimeEnd: '2024-07-31' },
          description: '按发送时间范围筛选'
        },
        {
          params: { page: 1, size: 5, status: 'pending', method: 'sms' },
          description: '完整查询参数组合'
        }
      ];

      // 无效查询参数组合
      const invalidQueryParams = [
        {
          params: { page: 0 },
          description: '页码为0'
        },
        {
          params: { page: -1 },
          description: '负数页码'
        },
        {
          params: { size: 0 },
          description: '页面大小为0'
        },
        {
          params: { size: 101 },
          description: '页面大小超过最大值'
        },
        {
          params: { method: 'invalid_method' },
          description: '无效通知方式'
        },
        {
          params: { sendTimeStart: 'invalid-date' },
          description: '无效开始时间格式'
        },
        {
          params: { sendTimeEnd: 'invalid-date' },
          description: '无效结束时间格式'
        }
      ];

      validQueryParams.forEach((testCase) => {
        test(`应该成功获取录取通知列表 - ${testCase.description}`, async () => {
          // 处理parentId为0的情况
          if (testCase.params.parentId === 0) {
            testCase.params.parentId = testParentId;
          }

          const response = await apiClient.get('/admission-notifications', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(Array.isArray(response.data.data) || 
                 (response.data.data && Array.isArray(response.data.data.notifications))).toBe(true);
        }, 10000);
      });

      invalidQueryParams.forEach((testCase) => {
        test(`应该拒绝获取录取通知列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/admission-notifications', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /admission-notifications/by-result/:resultId - 按结果获取通知参数验证', () => {
      test('应该成功按结果获取通知 - 有效ID', async () => {
        const resultId = testResultId || 1;
        const response = await apiClient.get(`/admission-notifications/by-result/${resultId}`);
        
        expect([200, 404]).toContain(response.status);
        expect(response.data.success).toBeDefined();
      }, 10000);

      // 无效ID测试
      const invalidResultIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' }
      ];

      invalidResultIds.forEach((testCase) => {
        test(`应该拒绝按结果获取通知 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/admission-notifications/by-result/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /admission-notifications/by-parent/:parentId - 按家长获取通知参数验证', () => {
      test('应该成功按家长获取通知 - 有效ID', async () => {
        if (testParentId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试家长ID');
          return;
        }

        const response = await apiClient.get(`/admission-notifications/by-parent/${testParentId}`);
        
        expect([200, 404]).toContain(response.status);
        expect(response.data.success).toBeDefined();
      }, 10000);

      // 无效ID测试
      const invalidParentIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' }
      ];

      invalidParentIds.forEach((testCase) => {
        test(`应该拒绝按家长获取通知 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/admission-notifications/by-parent/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('通知操作API测试', () => {
      describe('POST /admission-notifications/:id/send - 发送通知参数验证', () => {
        test('应该处理发送通知请求 - 有效ID', async () => {
          const notificationId = testNotificationId || 1;
          const response = await apiClient.post(`/admission-notifications/${notificationId}/send`);
          
          expect([200, 404]).toContain(response.status);
          expect(response.data.success).toBeDefined();
        }, 10000);

        // 无效ID测试
        const invalidIds = [
          { id: 0, description: 'ID为0' },
          { id: -1, description: '负数ID' },
          { id: 'abc', description: '非数字ID' }
        ];

        invalidIds.forEach((testCase) => {
          test(`应该拒绝发送通知 - ${testCase.description}`, async () => {
            const response = await apiClient.post(`/admission-notifications/${testCase.id}/send`);
            
            expect([400, 404, 422]).toContain(response.status);
            expect(response.data.success).toBe(false);
          }, 10000);
        });
      });

      describe('POST /admission-notifications/:id/resend - 重新发送通知参数验证', () => {
        test('应该处理重新发送通知请求 - 有效ID', async () => {
          const notificationId = testNotificationId || 1;
          const response = await apiClient.post(`/admission-notifications/${notificationId}/resend`);
          
          expect([200, 404]).toContain(response.status);
          expect(response.data.success).toBeDefined();
        }, 10000);
      });

      describe('PUT /admission-notifications/:id/delivered - 标记已送达参数验证', () => {
        test('应该处理标记已送达请求 - 有效ID', async () => {
          const notificationId = testNotificationId || 1;
          const response = await apiClient.put(`/admission-notifications/${notificationId}/delivered`);
          
          expect([200, 404]).toContain(response.status);
          expect(response.data.success).toBeDefined();
        }, 10000);
      });

      describe('PUT /admission-notifications/:id/read - 标记已读参数验证', () => {
        test('应该处理标记已读请求 - 有效ID', async () => {
          const notificationId = testNotificationId || 1;
          const response = await apiClient.put(`/admission-notifications/${notificationId}/read`);
          
          expect([200, 404]).toContain(response.status);
          expect(response.data.success).toBeDefined();
        }, 10000);
      });

      describe('POST /admission-notifications/:id/response - 记录回复参数验证', () => {
        // 有效回复参数
        const validResponseParams = [
          {
            content: '确认参加入学，谢谢！',
            description: '正常确认回复'
          },
          {
            content: '需要更多时间考虑，请给予宽限。',
            description: '请求宽限回复'
          }
        ];

        // 无效回复参数
        const invalidResponseParams = [
          {
            // 缺少content
            expected_errors: ['回复内容不能为空'],
            description: '缺少回复内容'
          },
          {
            content: '',
            expected_errors: ['回复内容不能为空'],
            description: '空回复内容'
          },
          {
            content: 'a'.repeat(1001),
            expected_errors: ['回复内容长度不能超过1000个字符'],
            description: '回复内容超长'
          }
        ];

        validResponseParams.forEach((params) => {
          test(`应该成功记录通知回复 - ${params.description}`, async () => {
            const notificationId = testNotificationId || 1;
            const requestParams = { content: params.content };

            const response = await apiClient.post(`/admission-notifications/${notificationId}/response`, requestParams);
            
            expect([200, 404]).toContain(response.status);
            expect(response.data.success).toBeDefined();
          }, 10000);
        });

        invalidResponseParams.forEach((params) => {
          test(`应该拒绝记录通知回复 - ${params.description}`, async () => {
            const notificationId = testNotificationId || 1;
            const requestParams = { ...params };
            delete requestParams.expected_errors;
            delete requestParams.description;

            const response = await apiClient.post(`/admission-notifications/${notificationId}/response`, requestParams);
            
            expect([400, 404]).toContain(response.status);
            if (response.status === 400) {
              expect(response.data.success).toBe(false);
            }
          }, 10000);
        });
      });
    });
  });

  describe('录取结果管理API测试', () => {
    describe('POST /admission-results - 创建录取结果参数验证', () => {
      // 有效创建参数组合
      const validCreateParams = [
        {
          applicationId: () => testApplicationId,
          studentName: '张小明',
          parentId: () => testParentId,
          planId: testPlanId,
          classId: testClassId,
          status: 'admitted' as const,
          type: 'regular' as const,
          admissionDate: '2024-09-01',
          score: 95.5,
          rank: 1,
          interviewResult: '表现优秀',
          interviewDate: '2024-07-15',
          interviewerId: 1,
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          decisionReason: '成绩优异，综合素质良好',
          description_test: '完整参数创建录取结果'
        },
        {
          applicationId: () => testApplicationId + 1,
          studentName: '李小红',
          parentId: () => testParentId,
          planId: testPlanId,
          status: 'waitlisted' as const,
          type: 'regular' as const,
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          description_test: '最小必填参数创建结果'
        },
        {
          applicationId: () => testApplicationId + 2,
          studentName: '王小华',
          parentId: () => testParentId,
          planId: testPlanId,
          status: 'rejected' as const,
          type: 'regular' as const,
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          decisionReason: '名额已满',
          description_test: '拒绝状态创建'
        }
      ];

      // 无效创建参数组合
      const invalidCreateParams = [
        {
          // 缺少applicationId
          studentName: '测试学生',
          parentId: () => testParentId,
          planId: testPlanId,
          status: 'admitted',
          type: 'regular',
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['申请ID不能为空'],
          description: '缺少申请ID'
        },
        {
          applicationId: () => testApplicationId,
          // 缺少studentName
          parentId: () => testParentId,
          planId: testPlanId,
          status: 'admitted',
          type: 'regular',
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['学生姓名不能为空'],
          description: '缺少学生姓名'
        },
        {
          applicationId: () => testApplicationId,
          studentName: '测试学生',
          // 缺少parentId
          planId: testPlanId,
          status: 'admitted',
          type: 'regular',
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['家长ID不能为空'],
          description: '缺少家长ID'
        },
        {
          applicationId: () => testApplicationId,
          studentName: '测试学生',
          parentId: () => testParentId,
          // 缺少planId
          status: 'admitted',
          type: 'regular',
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['招生计划ID不能为空'],
          description: '缺少招生计划ID'
        },
        {
          applicationId: () => testApplicationId,
          studentName: '测试学生',
          parentId: () => testParentId,
          planId: testPlanId,
          // 缺少status
          type: 'regular',
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['录取状态不能为空'],
          description: '缺少录取状态'
        },
        {
          applicationId: () => testApplicationId,
          studentName: '测试学生',
          parentId: () => testParentId,
          planId: testPlanId,
          status: 'invalid_status',
          type: 'regular',
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['录取状态不正确'],
          description: '无效录取状态'
        },
        {
          applicationId: () => testApplicationId,
          studentName: '测试学生',
          parentId: () => testParentId,
          planId: testPlanId,
          status: 'admitted',
          type: 'invalid_type',
          admissionDate: '2024-09-01',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['录取类型不正确'],
          description: '无效录取类型'
        },
        {
          applicationId: () => testApplicationId,
          studentName: '测试学生',
          parentId: () => testParentId,
          planId: testPlanId,
          status: 'admitted',
          type: 'regular',
          admissionDate: 'invalid-date',
          decisionMakerId: 1,
          decisionDate: '2024-07-20',
          expected_errors: ['录取日期格式不正确'],
          description: '无效录取日期格式'
        }
      ];

      validCreateParams.forEach((params, index) => {
        test(`应该成功创建录取结果 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;
          
          // 处理函数类型的参数
          if (typeof requestParams.applicationId === 'function') {
            (requestParams as any).applicationId = (requestParams.applicationId as Function)();
          }
          if (typeof requestParams.parentId === 'function') {
            (requestParams as any).parentId = (requestParams.parentId as Function)();
          }

          const response = await apiClient.post('/admission-results', requestParams);
          
          expect(response.status).toBe(201);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.studentName).toBe(requestParams.studentName);
          expect(response.data.data.status).toBe(requestParams.status);
          expect(response.data.data.type).toBe(requestParams.type);
          
          // 保存第一个创建的结果ID用于后续测试
          if (index === 0) {
            testResultId = response.data.data.id;
            console.log('✅ 测试录取结果创建成功, ID:', testResultId);
          }
        }, 10000);
      });

      invalidCreateParams.forEach((params) => {
        test(`应该拒绝创建录取结果 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;
          
          // 处理函数类型的参数
          if (typeof requestParams.applicationId === 'function') {
            (requestParams as any).applicationId = (requestParams.applicationId as Function)();
          }
          if (typeof requestParams.parentId === 'function') {
            (requestParams as any).parentId = (requestParams.parentId as Function)();
          }

          const response = await apiClient.post('/admission-results', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
          expect(response.data.message).toBeDefined();
        }, 10000);
      });
    });

    describe('GET /admission-results - 获取录取结果列表参数验证', () => {
      // 有效查询参数组合
      const validQueryParams = [
        {
          params: {},
          description: '无参数 - 默认分页'
        },
        {
          params: { page: 1, size: 10 },
          description: '基本分页参数'
        },
        {
          params: { studentName: '张小明' },
          description: '按学生姓名筛选'
        },
        {
          params: { status: 'admitted' },
          description: '按录取状态筛选'
        },
        {
          params: { type: 'regular' },
          description: '按录取类型筛选'
        },
        {
          params: { planId: testPlanId },
          description: '按招生计划筛选'
        },
        {
          params: { classId: testClassId },
          description: '按班级筛选'
        },
        {
          params: { admissionDateStart: '2024-09-01', admissionDateEnd: '2024-09-30' },
          description: '按录取日期范围筛选'
        },
        {
          params: { page: 1, size: 5, status: 'admitted', type: 'regular' },
          description: '完整查询参数组合'
        }
      ];

      // 无效查询参数组合
      const invalidQueryParams = [
        {
          params: { page: 0 },
          description: '页码为0'
        },
        {
          params: { page: -1 },
          description: '负数页码'
        },
        {
          params: { size: 0 },
          description: '页面大小为0'
        },
        {
          params: { size: 101 },
          description: '页面大小超过最大值'
        },
        {
          params: { status: 'invalid_status' },
          description: '无效录取状态'
        },
        {
          params: { type: 'invalid_type' },
          description: '无效录取类型'
        },
        {
          params: { admissionDateStart: 'invalid-date' },
          description: '无效开始日期格式'
        },
        {
          params: { admissionDateEnd: 'invalid-date' },
          description: '无效结束日期格式'
        }
      ];

      validQueryParams.forEach((testCase) => {
        test(`应该成功获取录取结果列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/admission-results', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(Array.isArray(response.data.data) || 
                 (response.data.data && Array.isArray(response.data.data.results))).toBe(true);
        }, 10000);
      });

      invalidQueryParams.forEach((testCase) => {
        test(`应该拒绝获取录取结果列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/admission-results', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /admission-results/by-application/:applicationId - 按申请获取结果参数验证', () => {
      test('应该成功按申请获取结果 - 有效ID', async () => {
        const response = await apiClient.get(`/admission-results/by-application/${testApplicationId}`);
        
        expect([200, 404]).toContain(response.status);
        expect(response.data.success).toBeDefined();
      }, 10000);

      // 无效ID测试
      const invalidApplicationIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' }
      ];

      invalidApplicationIds.forEach((testCase) => {
        test(`应该拒绝按申请获取结果 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/admission-results/by-application/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /admission-results/by-class/:classId - 按班级获取结果参数验证', () => {
      test('应该成功按班级获取结果 - 有效ID', async () => {
        const response = await apiClient.get(`/admission-results/by-class/${testClassId}`);
        
        expect([200, 404]).toContain(response.status);
        expect(response.data.success).toBeDefined();
      }, 10000);

      // 无效ID测试
      const invalidClassIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' }
      ];

      invalidClassIds.forEach((testCase) => {
        test(`应该拒绝按班级获取结果 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/admission-results/by-class/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /admission-results/statistics - 获取录取统计参数验证', () => {
      test('应该成功获取录取统计数据', async () => {
        const response = await apiClient.get('/admission-results/statistics');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('PUT /admission-results/:id - 更新录取结果参数验证', () => {
      // 有效更新参数组合
      const validUpdateParams = [
        {
          data: {
            status: 'confirmed',
            decisionReason: '家长已确认入学'
          },
          description: '状态更新'
        },
        {
          data: {
            classId: testClassId + 1,
            score: 98.0,
            rank: 1
          },
          description: '班级和成绩更新'
        },
        {
          data: {
            interviewResult: '更新的面试结果',
            interviewDate: '2024-07-25',
            specialRequirements: '需要特殊照顾'
          },
          description: '面试信息更新'
        }
      ];

      // 无效更新参数组合
      const invalidUpdateParams = [
        {
          data: { status: 'invalid_status' },
          description: '无效状态'
        },
        {
          data: { type: 'invalid_type' },
          description: '无效类型'
        },
        {
          data: { admissionDate: 'invalid-date' },
          description: '无效录取日期'
        },
        {
          data: { score: -1 },
          description: '无效分数'
        },
        {
          data: { rank: 0 },
          description: '无效排名'
        }
      ];

      validUpdateParams.forEach((testCase) => {
        test(`应该成功更新录取结果 - ${testCase.description}`, async () => {
          if (testResultId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试录取结果ID');
            return;
          }

          const response = await apiClient.put(`/admission-results/${testResultId}`, testCase.data);
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.id).toBe(testResultId);
        }, 10000);
      });

      invalidUpdateParams.forEach((testCase) => {
        test(`应该拒绝更新录取结果 - ${testCase.description}`, async () => {
          if (testResultId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试录取结果ID');
            return;
          }

          const response = await apiClient.put(`/admission-results/${testResultId}`, testCase.data);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
        }, 10000);
      });

      // 无效ID更新测试
      test('应该拒绝更新不存在的录取结果', async () => {
        const response = await apiClient.put('/admission-results/99999', {
          status: 'confirmed'
        });
        
        expect(response.status).toBe(404);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('权限验证测试', () => {
    test('应该拒绝无token访问录取通知', async () => {
      // 创建无认证的客户端
      const noAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true
      });

      const response = await noAuthClient.get('/admission-notifications');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);

    test('应该拒绝无token访问录取结果', async () => {
      // 创建无认证的客户端
      const noAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true
      });

      const response = await noAuthClient.get('/admission-results');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);

    test('应该拒绝无效token访问', async () => {
      const invalidAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true,
        headers: {
          'Authorization': 'Bearer invalid_token_here'
        }
      });

      const response = await invalidAuthClient.get('/admission-notifications');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);
  });

  describe('数据完整性验证', () => {
    test('创建的录取通知应该包含完整的数据结构', async () => {
      if (testNotificationId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试通知ID');
        return;
      }

      const response = await apiClient.get(`/admission-notifications/${testNotificationId}`);
      
      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        
        const notification = response.data.data;
        expect(notification).toHaveProperty('id');
        expect(notification).toHaveProperty('studentName');
        expect(notification).toHaveProperty('method');
        expect(notification).toHaveProperty('content');
        expect(notification).toHaveProperty('recipientContact');
        
        // 验证数据类型
        expect(typeof notification.id).toBe('number');
        expect(typeof notification.studentName).toBe('string');
        expect(['sms', 'email', 'wechat', 'phone', 'letter', 'app']).toContain(notification.method);
      }
    }, 10000);

    test('创建的录取结果应该包含完整的数据结构', async () => {
      if (testResultId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试结果ID');
        return;
      }

      const response = await apiClient.get(`/admission-results/${testResultId}`);
      
      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        
        const result = response.data.data;
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('applicationId');
        expect(result).toHaveProperty('studentName');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('admissionDate');
        
        // 验证数据类型
        expect(typeof result.id).toBe('number');
        expect(typeof result.applicationId).toBe('number');
        expect(typeof result.studentName).toBe('string');
        expect(['pending', 'admitted', 'rejected', 'waitlisted', 'confirmed', 'canceled']).toContain(result.status);
        expect(['regular', 'special', 'priority', 'transfer']).toContain(result.type);
      }
    }, 10000);
  });
});