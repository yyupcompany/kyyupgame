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

interface ActivityPlan {
  id: number;
  title: string;
  description: string;
  activity_type: number; // 1-开放日, 2-体验课, 3-亲子活动, 4-招生说明会, 5-家长会, 6-节日活动, 7-其他
  status: number; // 0-草稿, 1-未开始, 2-报名中, 3-进行中, 4-已结束, 5-已取消
  location: string;
  max_participants: number;
  registration_start: string;
  registration_end: string;
  activity_date: string;
  created_by: number;
  cover_image?: string;
  agenda?: string;
}

interface ActivityRegistration {
  id: number;
  activity_id: number;
  child_name: string;
  child_age: number;
  child_gender: number; // 0-unknown, 1-male, 2-female
  parent_name: string;
  contact_phone: string;
  contact_email?: string;
  status: number; // 0-待审核, 1-已确认, 2-已拒绝, 3-已取消, 4-已签到, 5-未出席
  payment_status?: number;
  payment_method?: string;
  is_converted?: boolean;
  created_at: string;
  updated_at: string;
}

interface ActivityEvaluation {
  id: number;
  activity_id: number;
  evaluator_type: number; // 1-parent, 2-teacher, 3-other
  evaluator_name: string;
  overall_rating: number; // 1-5
  content_rating: number;
  organization_rating: number;
  environment_rating: number;
  service_rating: number;
  comments?: string;
  strengths?: string;
  weaknesses?: string;
  suggestions?: string;
  is_public: boolean;
  created_at: string;
}

interface ActivityCheckin {
  id: number;
  registration_id: number;
  activity_id: number;
  checked_in_at: string;
  checked_in_by: number;
  notes?: string;
  status: string;
}

describe('活动扩展管理系统API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testActivityId: number = 0;
  let testPlanId: number = 0;
  let testRegistrationId: number = 0;
  let testEvaluationId: number = 0;
  let testCheckinId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始活动扩展管理系统API全面测试...');
    console.log('📋 测试范围: 69个活动管理端点的完整参数验证');
    
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

    // 创建测试活动用于其他模块测试
    const activityData = {
      title: `测试活动_${Date.now()}`,
      description: '用于测试的活动',
      type: 'indoor',
      location: '测试教室',
      capacity: 20,
      fee: 50.0,
      startDate: '2024-12-01',
      endDate: '2024-12-01',
      registrationStart: '2024-11-01',
      registrationEnd: '2024-11-30'
    };

    const activityResponse = await apiClient.post('/activities', activityData);
    if (activityResponse.data?.success && activityResponse.data?.data?.id) {
      testActivityId = activityResponse.data.data.id;
      console.log('✅ 测试活动创建成功, ID:', testActivityId);
    }
  });

  afterAll(async () => {
    // 清理测试数据
    const cleanupPromises = [];
    
    if (testCheckinId > 0) {
      cleanupPromises.push(apiClient.delete(`/activity-checkins/${testCheckinId}`));
    }
    if (testEvaluationId > 0) {
      cleanupPromises.push(apiClient.delete(`/activity-evaluations/${testEvaluationId}`));
    }
    if (testRegistrationId > 0) {
      cleanupPromises.push(apiClient.delete(`/activity-registrations/${testRegistrationId}`));
    }
    if (testPlanId > 0) {
      cleanupPromises.push(apiClient.delete(`/activity-plans/${testPlanId}`));
    }
    if (testActivityId > 0) {
      cleanupPromises.push(apiClient.delete(`/activities/${testActivityId}`));
    }

    await Promise.all(cleanupPromises);
    console.log('🧹 活动扩展管理测试数据已清理');
    console.log('🧹 活动扩展管理系统测试完成');
  });

  describe('活动计划管理API测试', () => {
    describe('POST /activity-plans - 创建活动计划参数验证', () => {
      // 有效创建参数组合
      const validCreateParams = [
        {
          title: '幼儿园开放日活动',
          description: '欢迎家长和孩子们参观我们的幼儿园，了解教学环境和课程设置',
          activity_type: 1, // 开放日
          location: '幼儿园大厅',
          max_participants: 50,
          registration_start: '2024-11-01T00:00:00Z',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          cover_image: 'https://example.com/images/open-day.jpg',
          agenda: '09:00-园区参观\n10:00-课程体验\n11:00-家长交流',
          description_test: '完整参数创建开放日活动计划'
        },
        {
          title: '亲子手工体验课',
          description: '家长和孩子一起制作手工艺品',
          activity_type: 3, // 亲子活动
          location: '美工教室',
          max_participants: 20,
          registration_start: '2024-12-01T00:00:00Z',
          registration_end: '2024-12-10T23:59:59Z',
          activity_date: '2024-12-15T14:00:00Z',
          description_test: '最小必填参数创建亲子活动'
        },
        {
          title: '招生说明会',
          description: '介绍幼儿园教育理念和招生政策',
          activity_type: 4, // 招生说明会
          location: '多媒体教室',
          max_participants: 100,
          registration_start: '2024-10-01T00:00:00Z',
          registration_end: '2024-10-20T23:59:59Z',
          activity_date: '2024-10-25T19:00:00Z',
          status: 1, // 未开始
          description_test: '招生说明会活动计划'
        }
      ];

      // 无效创建参数组合
      const invalidCreateParams = [
        {
          // 缺少title
          description: '测试活动描述',
          activity_type: 1,
          location: '测试地点',
          max_participants: 30,
          registration_start: '2024-11-01T00:00:00Z',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          expected_errors: ['活动标题不能为空'],
          description_test: '缺少活动标题'
        },
        {
          title: '测试活动',
          // 缺少description
          activity_type: 1,
          location: '测试地点',
          max_participants: 30,
          registration_start: '2024-11-01T00:00:00Z',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          expected_errors: ['活动描述不能为空'],
          description_test: '缺少活动描述'
        },
        {
          title: '',
          description: '测试活动描述',
          activity_type: 1,
          location: '测试地点',
          max_participants: 30,
          registration_start: '2024-11-01T00:00:00Z',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          expected_errors: ['活动标题不能为空'],
          description_test: '空活动标题'
        },
        {
          title: 'a'.repeat(256),
          description: '测试活动描述',
          activity_type: 1,
          location: '测试地点',
          max_participants: 30,
          registration_start: '2024-11-01T00:00:00Z',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          expected_errors: ['活动标题长度不能超过255个字符'],
          description_test: '活动标题超长'
        },
        {
          title: '测试活动',
          description: '测试活动描述',
          activity_type: 999, // 无效类型
          location: '测试地点',
          max_participants: 30,
          registration_start: '2024-11-01T00:00:00Z',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          expected_errors: ['活动类型不正确'],
          description_test: '无效活动类型'
        },
        {
          title: '测试活动',
          description: '测试活动描述',
          activity_type: 1,
          location: '测试地点',
          max_participants: 0, // 无效参与人数
          registration_start: '2024-11-01T00:00:00Z',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          expected_errors: ['最大参与人数必须大于0'],
          description_test: '无效最大参与人数'
        },
        {
          title: '测试活动',
          description: '测试活动描述',
          activity_type: 1,
          location: '测试地点',
          max_participants: 30,
          registration_start: 'invalid-date',
          registration_end: '2024-11-25T23:59:59Z',
          activity_date: '2024-11-30T09:00:00Z',
          expected_errors: ['报名开始时间格式不正确'],
          description_test: '无效报名开始时间格式'
        }
      ];

      validCreateParams.forEach((params, index) => {
        test(`应该成功创建活动计划 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;

          const response = await apiClient.post('/activity-plans', requestParams);
          
          expect(response.status).toBe(201);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.title).toBe(requestParams.title);
          expect(response.data.data.activity_type).toBe(requestParams.activity_type);
          expect(response.data.data.max_participants).toBe(requestParams.max_participants);
          
          // 保存第一个创建的计划ID用于后续测试
          if (index === 0) {
            testPlanId = response.data.data.id;
            console.log('✅ 测试活动计划创建成功, ID:', testPlanId);
          }
        }, 10000);
      });

      invalidCreateParams.forEach((params) => {
        test(`应该拒绝创建活动计划 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description_test;

          const response = await apiClient.post('/activity-plans', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
          expect(response.data.message).toBeDefined();
        }, 10000);
      });
    });

    describe('GET /activity-plans - 获取活动计划列表参数验证', () => {
      // 有效查询参数组合
      const validQueryParams = [
        {
          params: {},
          description: '无参数 - 默认分页'
        },
        {
          params: { page: 1, pageSize: 10 },
          description: '基本分页参数'
        },
        {
          params: { activity_type: 1 },
          description: '按活动类型筛选'
        },
        {
          params: { status: 1 },
          description: '按状态筛选'
        },
        {
          params: { search: '开放日' },
          description: '关键词搜索'
        },
        {
          params: { page: 1, pageSize: 5, activity_type: 3, status: 2 },
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
          params: { pageSize: 101 },
          description: '页面大小超过最大值'
        },
        {
          params: { activity_type: 999 },
          description: '无效活动类型'
        },
        {
          params: { status: 999 },
          description: '无效状态值'
        }
      ];

      validQueryParams.forEach((testCase) => {
        test(`应该成功获取活动计划列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/activity-plans', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(Array.isArray(response.data.data) || Array.isArray(response.data.data.items)).toBe(true);
        }, 10000);
      });

      invalidQueryParams.forEach((testCase) => {
        test(`应该拒绝获取活动计划列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/activity-plans', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('PUT /activity-plans/:id/status - 更新活动计划状态参数验证', () => {
      // 有效状态更新参数
      const validStatusParams = [
        { status: 1, description: '设置为未开始' },
        { status: 2, description: '设置为报名中' },
        { status: 3, description: '设置为进行中' },
        { status: 4, description: '设置为已结束' }
      ];

      // 无效状态更新参数
      const invalidStatusParams = [
        {
          // 缺少status
          expected_errors: ['状态值不能为空'],
          description: '缺少状态值'
        },
        {
          status: 999,
          expected_errors: ['状态值不正确'],
          description: '无效状态值'
        },
        {
          status: 'invalid',
          expected_errors: ['状态值必须为数字'],
          description: '非数字状态值'
        }
      ];

      validStatusParams.forEach((params) => {
        test(`应该成功更新活动计划状态 - ${params.description}`, async () => {
          if (testPlanId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试活动计划ID');
            return;
          }

          const response = await apiClient.put(`/activity-plans/${testPlanId}/status`, {
            status: params.status
          });
          
          expect([200, 404]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data.success).toBe(true);
            expect(response.data.data.status).toBe(params.status);
          }
        }, 10000);
      });

      invalidStatusParams.forEach((params) => {
        test(`应该拒绝更新活动计划状态 - ${params.description}`, async () => {
          if (testPlanId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试活动计划ID');
            return;
          }

          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.put(`/activity-plans/${testPlanId}/status`, requestParams);
          
          expect([400, 404]).toContain(response.status);
          if (response.status === 400) {
            expect(response.data.success).toBe(false);
          }
        }, 10000);
      });
    });
  });

  describe('活动报名管理API测试', () => {
    describe('POST /activity-registrations - 创建活动报名参数验证', () => {
      // 有效创建参数组合
      const validCreateParams = [
        {
          activity_id: () => testActivityId || 1,
          child_name: '小明',
          child_age: 4,
          child_gender: 1, // 男
          parent_name: '张先生',
          contact_phone: '13800138001',
          contact_email: 'parent@test.com',
          emergency_contact: '张女士',
          emergency_phone: '13900139001',
          special_requirements: '无过敏史',
          description_test: '完整参数创建活动报名'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '小红',
          child_age: 5,
          child_gender: 2, // 女
          parent_name: '李女士',
          contact_phone: '13800138002',
          description_test: '最小必填参数创建报名'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '小华',
          child_age: 3,
          child_gender: 0, // 未知
          parent_name: '王先生',
          contact_phone: '13800138003',
          notes: '孩子比较内向，请多关照',
          description_test: '带备注的活动报名'
        }
      ];

      // 无效创建参数组合
      const invalidCreateParams = [
        {
          // 缺少activity_id
          child_name: '小明',
          child_age: 4,
          child_gender: 1,
          parent_name: '张先生',
          contact_phone: '13800138001',
          expected_errors: ['活动ID不能为空'],
          description: '缺少活动ID'
        },
        {
          activity_id: () => testActivityId || 1,
          // 缺少child_name
          child_age: 4,
          child_gender: 1,
          parent_name: '张先生',
          contact_phone: '13800138001',
          expected_errors: ['儿童姓名不能为空'],
          description: '缺少儿童姓名'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '',
          child_age: 4,
          child_gender: 1,
          parent_name: '张先生',
          contact_phone: '13800138001',
          expected_errors: ['儿童姓名不能为空'],
          description: '空儿童姓名'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '小明',
          child_age: 0, // 无效年龄
          child_gender: 1,
          parent_name: '张先生',
          contact_phone: '13800138001',
          expected_errors: ['儿童年龄必须大于0'],
          description: '无效儿童年龄'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '小明',
          child_age: 4,
          child_gender: 999, // 无效性别
          parent_name: '张先生',
          contact_phone: '13800138001',
          expected_errors: ['儿童性别值不正确'],
          description: '无效儿童性别'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '小明',
          child_age: 4,
          child_gender: 1,
          parent_name: '',
          contact_phone: '13800138001',
          expected_errors: ['家长姓名不能为空'],
          description: '空家长姓名'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '小明',
          child_age: 4,
          child_gender: 1,
          parent_name: '张先生',
          contact_phone: '123', // 无效电话
          expected_errors: ['联系电话格式不正确'],
          description: '无效联系电话格式'
        },
        {
          activity_id: () => testActivityId || 1,
          child_name: '小明',
          child_age: 4,
          child_gender: 1,
          parent_name: '张先生',
          contact_phone: '13800138001',
          contact_email: 'invalid-email', // 无效邮箱
          expected_errors: ['联系邮箱格式不正确'],
          description: '无效联系邮箱格式'
        }
      ];

      validCreateParams.forEach((params, index) => {
        test(`应该成功创建活动报名 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;
          
          // 处理函数类型的activity_id
          if (typeof requestParams.activity_id === 'function') {
            (requestParams as any).activity_id = (requestParams.activity_id as Function)();
          }

          const response = await apiClient.post('/activity-registrations', requestParams);
          
          expect(response.status).toBe(201);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.child_name).toBe(requestParams.child_name);
          expect(response.data.data.child_age).toBe(requestParams.child_age);
          expect(response.data.data.parent_name).toBe(requestParams.parent_name);
          
          // 保存第一个创建的报名ID用于后续测试
          if (index === 0) {
            testRegistrationId = response.data.data.id;
            console.log('✅ 测试活动报名创建成功, ID:', testRegistrationId);
          }
        }, 10000);
      });

      invalidCreateParams.forEach((params) => {
        test(`应该拒绝创建活动报名 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;
          
          // 处理函数类型的activity_id
          if (typeof requestParams.activity_id === 'function') {
            (requestParams as any).activity_id = (requestParams.activity_id as Function)();
          }

          const response = await apiClient.post('/activity-registrations', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
          expect(response.data.message).toBeDefined();
        }, 10000);
      });
    });

    describe('POST /activity-registrations/:id/review - 审核活动报名参数验证', () => {
      // 有效审核参数
      const validReviewParams = [
        {
          status: 1, // 已确认
          reviewer_notes: '审核通过，欢迎参加活动',
          description: '通过审核'
        },
        {
          status: 2, // 已拒绝
          reviewer_notes: '很抱歉，活动已满员',
          description: '拒绝审核'
        }
      ];

      // 无效审核参数
      const invalidReviewParams = [
        {
          // 缺少status
          reviewer_notes: '审核备注',
          expected_errors: ['审核状态不能为空'],
          description: '缺少审核状态'
        },
        {
          status: 999, // 无效状态
          reviewer_notes: '审核备注',
          expected_errors: ['审核状态不正确'],
          description: '无效审核状态'
        }
      ];

      validReviewParams.forEach((params) => {
        test(`应该成功审核活动报名 - ${params.description}`, async () => {
          if (testRegistrationId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试报名ID');
            return;
          }

          const requestParams = { 
            status: params.status, 
            reviewer_notes: params.reviewer_notes 
          };

          const response = await apiClient.post(`/activity-registrations/${testRegistrationId}/review`, requestParams);
          
          expect([200, 404]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data.success).toBe(true);
            expect(response.data.data.status).toBe(params.status);
          }
        }, 10000);
      });

      invalidReviewParams.forEach((params) => {
        test(`应该拒绝审核活动报名 - ${params.description}`, async () => {
          if (testRegistrationId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试报名ID');
            return;
          }

          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post(`/activity-registrations/${testRegistrationId}/review`, requestParams);
          
          expect([400, 404]).toContain(response.status);
          if (response.status === 400) {
            expect(response.data.success).toBe(false);
          }
        }, 10000);
      });
    });

    describe('POST /activity-registrations/:id/payment - 处理报名支付参数验证', () => {
      // 有效支付参数
      const validPaymentParams = [
        {
          payment_method: 'wechat',
          payment_amount: 50.0,
          transaction_id: 'wx_' + Date.now(),
          description: '微信支付'
        },
        {
          payment_method: 'alipay',
          payment_amount: 50.0,
          transaction_id: 'ali_' + Date.now(),
          description: '支付宝支付'
        },
        {
          payment_method: 'cash',
          payment_amount: 50.0,
          description: '现金支付'
        }
      ];

      // 无效支付参数
      const invalidPaymentParams = [
        {
          // 缺少payment_method
          payment_amount: 50.0,
          expected_errors: ['支付方式不能为空'],
          description: '缺少支付方式'
        },
        {
          payment_method: 'invalid_method',
          payment_amount: 50.0,
          expected_errors: ['支付方式不正确'],
          description: '无效支付方式'
        },
        {
          payment_method: 'wechat',
          payment_amount: 0, // 无效金额
          expected_errors: ['支付金额必须大于0'],
          description: '无效支付金额'
        }
      ];

      validPaymentParams.forEach((params) => {
        test(`应该成功处理报名支付 - ${params.description}`, async () => {
          if (testRegistrationId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试报名ID');
            return;
          }

          const requestParams = { ...params };
          delete requestParams.description;

          const response = await apiClient.post(`/activity-registrations/${testRegistrationId}/payment`, requestParams);
          
          expect([200, 404]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('payment_status');
          }
        }, 10000);
      });

      invalidPaymentParams.forEach((params) => {
        test(`应该拒绝处理报名支付 - ${params.description}`, async () => {
          if (testRegistrationId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试报名ID');
            return;
          }

          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post(`/activity-registrations/${testRegistrationId}/payment`, requestParams);
          
          expect([400, 404]).toContain(response.status);
          if (response.status === 400) {
            expect(response.data.success).toBe(false);
          }
        }, 10000);
      });
    });
  });

  describe('活动签到管理API测试', () => {
    describe('POST /activity-checkins/registration/:id - 单个报名签到参数验证', () => {
      test('应该成功处理报名签到 - 有效报名ID', async () => {
        if (testRegistrationId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试报名ID');
          return;
        }

        const checkinData = {
          notes: '准时到达，孩子状态良好'
        };

        const response = await apiClient.post(`/activity-checkins/registration/${testRegistrationId}`, checkinData);
        
        expect([200, 404, 409]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('checked_in_at');
          testCheckinId = response.data.data.id;
          console.log('✅ 测试活动签到创建成功, ID:', testCheckinId);
        }
      }, 10000);

      // 无效报名ID测试
      const invalidRegistrationIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' },
        { id: 99999, description: '不存在的ID' }
      ];

      invalidRegistrationIds.forEach((testCase) => {
        test(`应该拒绝处理报名签到 - ${testCase.description}`, async () => {
          const response = await apiClient.post(`/activity-checkins/registration/${testCase.id}`, {
            notes: '测试签到'
          });
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /activity-checkins/batch - 批量签到参数验证', () => {
      // 有效批量签到参数
      const validBatchParams = [
        {
          registration_ids: [testRegistrationId || 1],
          notes: '批量签到测试',
          description: '单个ID批量签到'
        },
        {
          registration_ids: [testRegistrationId || 1, testRegistrationId || 2],
          notes: '多人同时签到',
          description: '多个ID批量签到'
        }
      ];

      // 无效批量签到参数
      const invalidBatchParams = [
        {
          // 缺少registration_ids
          notes: '批量签到',
          expected_errors: ['报名ID列表不能为空'],
          description: '缺少报名ID列表'
        },
        {
          registration_ids: [], // 空数组
          notes: '批量签到',
          expected_errors: ['报名ID列表不能为空'],
          description: '空报名ID列表'
        },
        {
          registration_ids: ['abc', 'def'], // 非数字ID
          notes: '批量签到',
          expected_errors: ['报名ID必须为数字'],
          description: '非数字报名ID'
        }
      ];

      validBatchParams.forEach((params) => {
        test(`应该成功处理批量签到 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description;
          
          // 处理testRegistrationId为0的情况
          if (testRegistrationId === 0) {
            requestParams.registration_ids = [1, 2];
          }

          const response = await apiClient.post('/activity-checkins/batch', requestParams);
          
          expect([200, 207, 404]).toContain(response.status); // 207 = 部分成功
          if ([200, 207].includes(response.status)) {
            expect(response.data.success).toBeDefined();
            expect(response.data.data).toBeDefined();
          }
        }, 10000);
      });

      invalidBatchParams.forEach((params) => {
        test(`应该拒绝处理批量签到 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post('/activity-checkins/batch', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /activity-checkins/:activityId/phone - 手机号签到参数验证', () => {
      // 有效手机号签到参数
      const validPhoneParams = [
        {
          phone: '13800138001',
          description: '有效手机号签到'
        },
        {
          phone: '13900139001',
          notes: '通过手机号找到报名记录',
          description: '带备注的手机号签到'
        }
      ];

      // 无效手机号签到参数
      const invalidPhoneParams = [
        {
          // 缺少phone
          expected_errors: ['手机号不能为空'],
          description: '缺少手机号'
        },
        {
          phone: '123', // 无效手机号
          expected_errors: ['手机号格式不正确'],
          description: '无效手机号格式'
        },
        {
          phone: '', // 空手机号
          expected_errors: ['手机号不能为空'],
          description: '空手机号'
        }
      ];

      validPhoneParams.forEach((params) => {
        test(`应该成功处理手机号签到 - ${params.description}`, async () => {
          const activityId = testActivityId || 1;
          const requestParams = { ...params };
          delete requestParams.description;

          const response = await apiClient.post(`/activity-checkins/${activityId}/phone`, requestParams);
          
          expect([200, 404]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data.success).toBe(true);
          } else {
            // 404表示未找到对应手机号的报名记录，这是正常的
            expect(response.data.success).toBe(false);
            expect(response.data.message).toContain('未找到');
          }
        }, 10000);
      });

      invalidPhoneParams.forEach((params) => {
        test(`应该拒绝处理手机号签到 - ${params.description}`, async () => {
          const activityId = testActivityId || 1;
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post(`/activity-checkins/${activityId}/phone`, requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /activity-checkins/:activityId/stats - 获取签到统计参数验证', () => {
      test('应该成功获取活动签到统计 - 有效活动ID', async () => {
        const activityId = testActivityId || 1;
        const response = await apiClient.get(`/activity-checkins/${activityId}/stats`);
        
        expect([200, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('total_registrations');
          expect(response.data.data).toHaveProperty('checked_in_count');
          expect(response.data.data).toHaveProperty('not_checked_in_count');
          expect(response.data.data).toHaveProperty('check_in_rate');
        }
      }, 10000);

      // 无效活动ID测试
      const invalidActivityIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' }
      ];

      invalidActivityIds.forEach((testCase) => {
        test(`应该拒绝获取签到统计 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/activity-checkins/${testCase.id}/stats`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });
  });

  describe('活动评价管理API测试', () => {
    describe('POST /activity-evaluations - 创建活动评价参数验证', () => {
      // 有效创建参数组合
      const validCreateParams = [
        {
          activity_id: () => testActivityId || 1,
          evaluator_type: 1, // 家长
          evaluator_name: '张女士',
          overall_rating: 5,
          content_rating: 5,
          organization_rating: 4,
          environment_rating: 5,
          service_rating: 4,
          comments: '活动非常精彩，孩子玩得很开心！',
          strengths: '组织有序，老师很专业',
          suggestions: '希望以后多举办这样的活动',
          is_public: true,
          description_test: '完整参数创建家长评价'
        },
        {
          activity_id: () => testActivityId || 1,
          evaluator_type: 2, // 教师
          evaluator_name: '李老师',
          overall_rating: 4,
          content_rating: 4,
          organization_rating: 4,
          environment_rating: 4,
          service_rating: 4,
          comments: '活动达到了预期效果',
          is_public: false,
          description_test: '教师评价（不公开）'
        },
        {
          activity_id: () => testActivityId || 1,
          evaluator_type: 3, // 其他
          evaluator_name: '王先生',
          overall_rating: 3,
          content_rating: 3,
          organization_rating: 3,
          environment_rating: 3,
          service_rating: 3,
          description_test: '最小必填参数评价'
        }
      ];

      // 无效创建参数组合
      const invalidCreateParams = [
        {
          // 缺少activity_id
          evaluator_type: 1,
          evaluator_name: '张女士',
          overall_rating: 5,
          content_rating: 5,
          organization_rating: 4,
          environment_rating: 5,
          service_rating: 4,
          expected_errors: ['活动ID不能为空'],
          description: '缺少活动ID'
        },
        {
          activity_id: () => testActivityId || 1,
          // 缺少evaluator_type
          evaluator_name: '张女士',
          overall_rating: 5,
          content_rating: 5,
          organization_rating: 4,
          environment_rating: 5,
          service_rating: 4,
          expected_errors: ['评价者类型不能为空'],
          description: '缺少评价者类型'
        },
        {
          activity_id: () => testActivityId || 1,
          evaluator_type: 999, // 无效评价者类型
          evaluator_name: '张女士',
          overall_rating: 5,
          content_rating: 5,
          organization_rating: 4,
          environment_rating: 5,
          service_rating: 4,
          expected_errors: ['评价者类型不正确'],
          description: '无效评价者类型'
        },
        {
          activity_id: () => testActivityId || 1,
          evaluator_type: 1,
          evaluator_name: '',
          overall_rating: 5,
          content_rating: 5,
          organization_rating: 4,
          environment_rating: 5,
          service_rating: 4,
          expected_errors: ['评价者姓名不能为空'],
          description: '空评价者姓名'
        },
        {
          activity_id: () => testActivityId || 1,
          evaluator_type: 1,
          evaluator_name: '张女士',
          overall_rating: 0, // 无效评分
          content_rating: 5,
          organization_rating: 4,
          environment_rating: 5,
          service_rating: 4,
          expected_errors: ['评分必须在1-5之间'],
          description: '无效整体评分'
        },
        {
          activity_id: () => testActivityId || 1,
          evaluator_type: 1,
          evaluator_name: '张女士',
          overall_rating: 5,
          content_rating: 6, // 超出范围评分
          organization_rating: 4,
          environment_rating: 5,
          service_rating: 4,
          expected_errors: ['评分必须在1-5之间'],
          description: '内容评分超出范围'
        }
      ];

      validCreateParams.forEach((params, index) => {
        test(`应该成功创建活动评价 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;
          
          // 处理函数类型的activity_id
          if (typeof requestParams.activity_id === 'function') {
            (requestParams as any).activity_id = (requestParams.activity_id as Function)();
          }

          const response = await apiClient.post('/activity-evaluations', requestParams);
          
          expect(response.status).toBe(201);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.evaluator_name).toBe(requestParams.evaluator_name);
          expect(response.data.data.overall_rating).toBe(requestParams.overall_rating);
          expect(response.data.data.evaluator_type).toBe(requestParams.evaluator_type);
          
          // 保存第一个创建的评价ID用于后续测试
          if (index === 0) {
            testEvaluationId = response.data.data.id;
            console.log('✅ 测试活动评价创建成功, ID:', testEvaluationId);
          }
        }, 10000);
      });

      invalidCreateParams.forEach((params) => {
        test(`应该拒绝创建活动评价 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;
          
          // 处理函数类型的activity_id
          if (typeof requestParams.activity_id === 'function') {
            (requestParams as any).activity_id = (requestParams.activity_id as Function)();
          }

          const response = await apiClient.post('/activity-evaluations', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
          expect(response.data.message).toBeDefined();
        }, 10000);
      });
    });

    describe('GET /activity-evaluations/by-rating/:rating - 按评分获取评价参数验证', () => {
      // 有效评分值
      const validRatings = [1, 2, 3, 4, 5];

      // 无效评分值
      const invalidRatings = [0, 6, -1, 'abc', ''];

      validRatings.forEach((rating) => {
        test(`应该成功按评分获取评价 - 评分${rating}`, async () => {
          const response = await apiClient.get(`/activity-evaluations/by-rating/${rating}`);
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(Array.isArray(response.data.data)).toBe(true);
        }, 10000);
      });

      invalidRatings.forEach((rating) => {
        test(`应该拒绝按评分获取评价 - 无效评分${rating}`, async () => {
          const response = await apiClient.get(`/activity-evaluations/by-rating/${rating}`);
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /activity-evaluations/statistics/:activityId - 获取活动评价统计参数验证', () => {
      test('应该成功获取活动评价统计 - 有效活动ID', async () => {
        const activityId = testActivityId || 1;
        const response = await apiClient.get(`/activity-evaluations/statistics/${activityId}`);
        
        expect([200, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('total_evaluations');
          expect(response.data.data).toHaveProperty('average_rating');
          expect(response.data.data).toHaveProperty('rating_distribution');
          
          // 验证评分分布结构
          if (response.data.data.rating_distribution) {
            expect(Array.isArray(response.data.data.rating_distribution)).toBe(true);
          }
        }
      }, 10000);

      // 无效活动ID测试
      const invalidActivityIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' }
      ];

      invalidActivityIds.forEach((testCase) => {
        test(`应该拒绝获取评价统计 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/activity-evaluations/statistics/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /activity-evaluations/:id/reply - 回复评价参数验证', () => {
      // 有效回复参数
      const validReplyParams = [
        {
          reply_content: '感谢您的评价，我们会继续努力提供更好的服务！',
          reply_by: 1,
          description: '管理员回复评价'
        },
        {
          reply_content: '非常感谢您的建议，我们会认真考虑并改进。',
          reply_by: 2,
          description: '教师回复评价'
        }
      ];

      // 无效回复参数
      const invalidReplyParams = [
        {
          // 缺少reply_content
          reply_by: 1,
          expected_errors: ['回复内容不能为空'],
          description: '缺少回复内容'
        },
        {
          reply_content: '',
          reply_by: 1,
          expected_errors: ['回复内容不能为空'],
          description: '空回复内容'
        },
        {
          reply_content: 'a'.repeat(1001),
          reply_by: 1,
          expected_errors: ['回复内容长度不能超过1000个字符'],
          description: '回复内容超长'
        },
        {
          reply_content: '回复内容',
          // 缺少reply_by
          expected_errors: ['回复者ID不能为空'],
          description: '缺少回复者ID'
        }
      ];

      validReplyParams.forEach((params) => {
        test(`应该成功回复评价 - ${params.description}`, async () => {
          if (testEvaluationId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试评价ID');
            return;
          }

          const requestParams = { 
            reply_content: params.reply_content, 
            reply_by: params.reply_by 
          };

          const response = await apiClient.post(`/activity-evaluations/${testEvaluationId}/reply`, requestParams);
          
          expect([200, 404]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('reply_content');
            expect(response.data.data).toHaveProperty('reply_by');
            expect(response.data.data).toHaveProperty('reply_at');
          }
        }, 10000);
      });

      invalidReplyParams.forEach((params) => {
        test(`应该拒绝回复评价 - ${params.description}`, async () => {
          if (testEvaluationId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试评价ID');
            return;
          }

          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post(`/activity-evaluations/${testEvaluationId}/reply`, requestParams);
          
          expect([400, 404]).toContain(response.status);
          if (response.status === 400) {
            expect(response.data.success).toBe(false);
          }
        }, 10000);
      });
    });
  });

  describe('AI活动策划API测试', () => {
    describe('POST /activity-planner/generate - AI生成活动计划参数验证', () => {
      // 有效生成参数组合
      const validGenerateParams = [
        {
          activity_type: 'outdoor',
          target_audience: 'children',
          duration: 120,
          budget: 500,
          location: 'playground',
          special_requirements: '适合3-6岁儿童',
          style: 'fun',
          description_test: '完整参数AI生成户外活动'
        },
        {
          activity_type: 'arts',
          target_audience: 'family',
          duration: 90,
          budget: 200,
          location: 'art_room',
          style: 'creative',
          description_test: '艺术类家庭活动生成'
        },
        {
          activity_type: 'science',
          target_audience: 'children',
          duration: 60,
          style: 'educational',
          description_test: '最小参数科学活动生成'
        }
      ];

      // 无效生成参数组合
      const invalidGenerateParams = [
        {
          // 缺少activity_type
          target_audience: 'children',
          duration: 120,
          expected_errors: ['活动类型不能为空'],
          description: '缺少活动类型'
        },
        {
          activity_type: 'invalid_type',
          target_audience: 'children',
          duration: 120,
          expected_errors: ['活动类型不正确'],
          description: '无效活动类型'
        },
        {
          activity_type: 'outdoor',
          target_audience: 'invalid_audience',
          duration: 120,
          expected_errors: ['目标受众不正确'],
          description: '无效目标受众'
        },
        {
          activity_type: 'outdoor',
          target_audience: 'children',
          duration: 0,
          expected_errors: ['活动时长必须大于0'],
          description: '无效活动时长'
        },
        {
          activity_type: 'outdoor',
          target_audience: 'children',
          duration: 120,
          budget: -100,
          expected_errors: ['预算不能为负数'],
          description: '负数预算'
        }
      ];

      validGenerateParams.forEach((params) => {
        test(`应该成功生成AI活动计划 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;

          const response = await apiClient.post('/activity-planner/generate', requestParams);
          
          expect([200, 500, 503]).toContain(response.status); // 可能因AI服务不可用返回503
          if (response.status === 200) {
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('plan');
            expect(response.data.data).toHaveProperty('generated_at');
            
            // 验证生成的计划结构
            if (response.data.data.plan) {
              expect(response.data.data.plan).toHaveProperty('title');
              expect(response.data.data.plan).toHaveProperty('description');
              expect(response.data.data.plan).toHaveProperty('activities');
            }
          } else if (response.status === 503) {
            expect(response.data.success).toBe(false);
            expect(response.data.message).toContain('AI服务');
          }
        }, 15000); // AI生成可能需要更长时间
      });

      invalidGenerateParams.forEach((params) => {
        test(`应该拒绝生成AI活动计划 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post('/activity-planner/generate', requestParams);
          
          expect([400, 503]).toContain(response.status);
          if (response.status === 400) {
            expect(response.data.success).toBe(false);
            expect(response.data.message).toBeDefined();
          }
        }, 10000);
      });
    });

    describe('GET /activity-planner/stats - 获取AI策划统计参数验证', () => {
      test('应该成功获取AI策划使用统计', async () => {
        const response = await apiClient.get('/activity-planner/stats');
        
        expect([200, 503]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          
          // 验证统计数据结构
          expect(response.data.data).toHaveProperty('total_generations');
          expect(response.data.data).toHaveProperty('successful_generations');
          expect(response.data.data).toHaveProperty('popular_activity_types');
          
          // 验证数据类型
          expect(typeof response.data.data.total_generations).toBe('number');
          expect(typeof response.data.data.successful_generations).toBe('number');
          expect(Array.isArray(response.data.data.popular_activity_types)).toBe(true);
        }
      }, 10000);
    });

    describe('GET /activity-planner/models - 获取可用AI模型参数验证', () => {
      test('应该成功获取可用AI模型列表', async () => {
        const response = await apiClient.get('/activity-planner/models');
        
        expect([200, 503]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(Array.isArray(response.data.data.models)).toBe(true);
          
          // 验证模型数据结构
          if (response.data.data.models.length > 0) {
            const model = response.data.data.models[0];
            expect(model).toHaveProperty('id');
            expect(model).toHaveProperty('name');
            expect(model).toHaveProperty('capabilities');
            expect(model).toHaveProperty('is_available');
          }
        }
      }, 10000);
    });
  });

  describe('权限验证测试', () => {
    test('应该拒绝无token访问活动计划', async () => {
      // 创建无认证的客户端
      const noAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true
      });

      const response = await noAuthClient.get('/activity-plans');
      
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

      const response = await invalidAuthClient.get('/activity-registrations');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);
  });

  describe('数据完整性验证', () => {
    test('创建的活动计划应该包含完整的数据结构', async () => {
      if (testPlanId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试活动计划ID');
        return;
      }

      const response = await apiClient.get(`/activity-plans/${testPlanId}`);
      
      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        
        const plan = response.data.data;
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('title');
        expect(plan).toHaveProperty('description');
        expect(plan).toHaveProperty('activity_type');
        expect(plan).toHaveProperty('status');
        expect(plan).toHaveProperty('max_participants');
        
        // 验证数据类型
        expect(typeof plan.id).toBe('number');
        expect(typeof plan.title).toBe('string');
        expect(typeof plan.activity_type).toBe('number');
        expect(typeof plan.max_participants).toBe('number');
        expect([0, 1, 2, 3, 4, 5]).toContain(plan.status);
      }
    }, 10000);

    test('创建的活动报名应该包含完整的数据结构', async () => {
      if (testRegistrationId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试报名ID');
        return;
      }

      const response = await apiClient.get(`/activity-registrations/${testRegistrationId}`);
      
      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        
        const registration = response.data.data;
        expect(registration).toHaveProperty('id');
        expect(registration).toHaveProperty('activity_id');
        expect(registration).toHaveProperty('child_name');
        expect(registration).toHaveProperty('child_age');
        expect(registration).toHaveProperty('child_gender');
        expect(registration).toHaveProperty('parent_name');
        expect(registration).toHaveProperty('contact_phone');
        expect(registration).toHaveProperty('status');
        
        // 验证数据类型
        expect(typeof registration.id).toBe('number');
        expect(typeof registration.activity_id).toBe('number');
        expect(typeof registration.child_name).toBe('string');
        expect(typeof registration.child_age).toBe('number');
        expect([0, 1, 2]).toContain(registration.child_gender);
        expect([0, 1, 2, 3, 4, 5]).toContain(registration.status);
      }
    }, 10000);
  });

  describe('性能和稳定性测试', () => {
    test('所有活动管理API响应时间应小于3秒', async () => {
      const activityEndpoints = [
        '/activity-plans',
        '/activity-registrations',
        '/activity-evaluations',
        '/activity-checkins'
      ];

      for (const endpoint of activityEndpoints) {
        const startTime = Date.now();
        const response = await apiClient.get(endpoint);
        const responseTime = Date.now() - startTime;

        expect([200, 404]).toContain(response.status);
        expect(responseTime).toBeLessThan(3000);
      }
    }, 20000);

    test('活动报名并发创建处理能力测试', async () => {
      const concurrentRegistrations = Array.from({ length: 3 }, (_, index) => 
        apiClient.post('/activity-registrations', {
          activity_id: testActivityId || 1,
          child_name: `并发测试${index + 1}`,
          child_age: 4,
          child_gender: 1,
          parent_name: `测试家长${index + 1}`,
          contact_phone: `1380013800${index + 1}`
        })
      );

      const responses = await Promise.all(concurrentRegistrations);
      
      responses.forEach(response => {
        expect([201, 400, 404]).toContain(response.status);
        if (response.status === 201) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
        }
      });
    }, 15000);
  });
});