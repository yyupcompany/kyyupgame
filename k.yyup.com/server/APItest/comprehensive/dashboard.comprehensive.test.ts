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

interface DashboardOverview {
  totalUsers: number;
  totalKindergartens: number;
  totalStudents: number;
  totalApplications: number;
  recentActivities: Array<{
    id: number;
    type: string;
    description: string;
    time: string;
  }>;
}

interface Todo {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

describe('仪表盘管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testTodoId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始仪表盘管理API全面测试...');
    console.log('📋 测试范围: 33个仪表盘端点的完整参数验证');
    
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
  });

  afterAll(async () => {
    // 清理测试数据
    if (testTodoId > 0) {
      await apiClient.delete(`/dashboard/todos/${testTodoId}`);
      console.log('🧹 测试Todo数据已清理');
    }
    
    console.log('🧹 仪表盘管理测试完成');
  });

  describe('核心仪表盘统计API测试', () => {
    describe('GET /dashboard/overview - 仪表盘概览参数验证', () => {
      test('应该成功获取仪表盘概览', async () => {
        const response = await apiClient.get('/dashboard/overview');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('totalUsers');
        expect(response.data.data).toHaveProperty('totalKindergartens');
        expect(response.data.data).toHaveProperty('totalStudents');
        expect(response.data.data).toHaveProperty('totalApplications');
        expect(response.data.data).toHaveProperty('recentActivities');
        
        // 验证数据类型
        expect(typeof response.data.data.totalUsers).toBe('number');
        expect(typeof response.data.data.totalKindergartens).toBe('number');
        expect(typeof response.data.data.totalStudents).toBe('number');
        expect(typeof response.data.data.totalApplications).toBe('number');
        expect(Array.isArray(response.data.data.recentActivities)).toBe(true);
      }, 10000);
    });

    describe('GET /dashboard/statistics - 统计数据参数验证', () => {
      test('应该成功获取统计数据', async () => {
        const response = await apiClient.get('/dashboard/statistics');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('enrollmentStats');
        expect(response.data.data).toHaveProperty('activityStats');
        expect(response.data.data).toHaveProperty('userStats');
        
        // 验证嵌套数据结构
        expect(response.data.data.enrollmentStats).toHaveProperty('total');
        expect(response.data.data.enrollmentStats).toHaveProperty('thisMonth');
        expect(response.data.data.enrollmentStats).toHaveProperty('growth');
        expect(response.data.data.activityStats).toHaveProperty('total');
        expect(response.data.data.activityStats).toHaveProperty('thisMonth');
        expect(response.data.data.activityStats).toHaveProperty('participation');
        expect(response.data.data.userStats).toHaveProperty('total');
        expect(response.data.data.userStats).toHaveProperty('active');
        expect(response.data.data.userStats).toHaveProperty('newThisMonth');
      }, 10000);
    });

    describe('GET /dashboard/stats - 简化统计数据参数验证', () => {
      test('应该成功获取简化统计数据', async () => {
        const response = await apiClient.get('/dashboard/stats');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/real-time/system-status - 实时系统状态参数验证', () => {
      test('应该成功获取实时系统状态', async () => {
        const response = await apiClient.get('/dashboard/real-time/system-status');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('status');
        expect(response.data.data).toHaveProperty('uptime');
        expect(response.data.data).toHaveProperty('cpu');
        expect(response.data.data).toHaveProperty('memory');
        expect(response.data.data).toHaveProperty('database');
        expect(response.data.data).toHaveProperty('services');
        
        // 验证系统状态数据类型
        expect(typeof response.data.data.status).toBe('string');
        expect(typeof response.data.data.uptime).toBe('string');
        expect(typeof response.data.data.cpu).toBe('object');
        expect(typeof response.data.data.memory).toBe('object');
        expect(typeof response.data.data.database).toBe('object');
        expect(typeof response.data.data.services).toBe('object');
      }, 10000);
    });
  });

  describe('待办事项管理API测试', () => {
    describe('GET /dashboard/todos - 获取待办事项列表参数验证', () => {
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
          params: { page: 2, pageSize: 20, status: 'pending' },
          description: '分页+状态筛选'
        },
        {
          params: { priority: 'high' },
          description: '按优先级筛选'
        },
        {
          params: { keyword: '测试' },
          description: '关键词搜索'
        },
        {
          params: { page: 1, pageSize: 5, status: 'completed', priority: 'medium' },
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
          params: { pageSize: 0 },
          description: '页面大小为0'
        },
        {
          params: { pageSize: 101 },
          description: '页面大小超过最大值'
        },
        {
          params: { status: 'invalid_status' },
          description: '无效状态值'
        },
        {
          params: { priority: 'invalid_priority' },
          description: '无效优先级值'
        }
      ];

      validQueryParams.forEach((testCase) => {
        test(`应该成功获取待办事项列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/dashboard/todos', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('todos');
          expect(response.data.data).toHaveProperty('pagination');
          expect(Array.isArray(response.data.data.todos)).toBe(true);
        }, 10000);
      });

      invalidQueryParams.forEach((testCase) => {
        test(`应该拒绝获取待办事项列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/dashboard/todos', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /dashboard/todos - 创建待办事项参数验证', () => {
      // 有效创建参数组合
      const validCreateParams = [
        {
          title: '测试待办事项',
          description: '这是一个测试待办事项',
          priority: 'high' as const,
          dueDate: '2024-12-31',
          description_test: '完整参数创建待办事项'
        },
        {
          title: '简单待办事项',
          priority: 'medium' as const,
          description_test: '最小必填参数创建待办事项'
        },
        {
          title: '低优先级任务',
          priority: 'low' as const,
          description: '低优先级任务描述',
          description_test: '低优先级待办事项'
        }
      ];

      // 无效创建参数组合
      const invalidCreateParams = [
        {
          // 缺少title
          priority: 'high',
          expected_errors: ['标题不能为空'],
          description: '缺少标题'
        },
        {
          title: '',
          priority: 'high',
          expected_errors: ['标题不能为空'],
          description: '空标题'
        },
        {
          title: 'a'.repeat(201),
          priority: 'high',
          expected_errors: ['标题长度不能超过200个字符'],
          description: '标题超长'
        },
        {
          title: '测试待办',
          // 缺少priority
          expected_errors: ['优先级不能为空'],
          description: '缺少优先级'
        },
        {
          title: '测试待办',
          priority: 'invalid_priority',
          expected_errors: ['优先级值不正确'],
          description: '无效优先级'
        },
        {
          title: '测试待办',
          priority: 'high',
          dueDate: 'invalid-date',
          expected_errors: ['截止日期格式不正确'],
          description: '无效截止日期格式'
        }
      ];

      validCreateParams.forEach((params, index) => {
        test(`应该成功创建待办事项 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;

          const response = await apiClient.post('/dashboard/todos', requestParams);
          
          expect(response.status).toBe(201);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.title).toBe(requestParams.title);
          expect(response.data.data.priority).toBe(requestParams.priority);
          
          // 保存第一个创建的待办事项ID用于后续测试
          if (index === 0) {
            testTodoId = response.data.data.id;
            console.log('✅ 测试待办事项创建成功, ID:', testTodoId);
          }
        }, 10000);
      });

      invalidCreateParams.forEach((params) => {
        test(`应该拒绝创建待办事项 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post('/dashboard/todos', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
          expect(response.data.message).toBeDefined();
        }, 10000);
      });
    });

    describe('PATCH /dashboard/todos/:id/status - 更新待办事项状态参数验证', () => {
      // 有效状态更新参数
      const validStatusParams = [
        { status: 'in_progress', description: '设置为进行中' },
        { status: 'completed', description: '设置为已完成' },
        { status: 'pending', description: '设置为待处理' }
      ];

      // 无效状态更新参数
      const invalidStatusParams = [
        {
          // 缺少status
          expected_errors: ['状态不能为空'],
          description: '缺少状态'
        },
        {
          status: '',
          expected_errors: ['状态不能为空'],
          description: '空状态'
        },
        {
          status: 'invalid_status',
          expected_errors: ['状态值不正确'],
          description: '无效状态值'
        }
      ];

      validStatusParams.forEach((params) => {
        test(`应该成功更新待办事项状态 - ${params.description}`, async () => {
          if (testTodoId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试待办事项ID');
            return;
          }

          const response = await apiClient.patch(`/dashboard/todos/${testTodoId}/status`, {
            status: params.status
          });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.status).toBe(params.status);
        }, 10000);
      });

      invalidStatusParams.forEach((params) => {
        test(`应该拒绝更新待办事项状态 - ${params.description}`, async () => {
          if (testTodoId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试待办事项ID');
            return;
          }

          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.patch(`/dashboard/todos/${testTodoId}/status`, requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
        }, 10000);
      });

      // 无效ID测试
      test('应该拒绝更新不存在的待办事项状态', async () => {
        const response = await apiClient.patch('/dashboard/todos/99999/status', {
          status: 'completed'
        });
        
        expect(response.status).toBe(404);
        expect(response.data.success).toBe(false);
      }, 10000);
    });

    describe('DELETE /dashboard/todos/:id - 删除待办事项参数验证', () => {
      let tempTodoId: number = 0;

      beforeAll(async () => {
        // 创建临时待办事项用于删除测试
        const tempTodoData = {
          title: `临时测试待办事项_${Date.now()}`,
          priority: 'low' as const
        };

        const response = await apiClient.post('/dashboard/todos', tempTodoData);
        if (response.data?.success && response.data?.data?.id) {
          tempTodoId = response.data.data.id;
          console.log('✅ 临时测试待办事项创建成功, ID:', tempTodoId);
        }
      });

      test('应该成功删除待办事项 - 有效ID', async () => {
        if (tempTodoId === 0) {
          console.log('⚠️ 跳过测试：无有效的临时待办事项ID');
          return;
        }

        const response = await apiClient.delete(`/dashboard/todos/${tempTodoId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.message).toContain('删除成功');
      }, 10000);

      // 无效ID删除测试
      const invalidDeleteIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' },
        { id: 99999, description: '不存在的ID' }
      ];

      invalidDeleteIds.forEach((testCase) => {
        test(`应该拒绝删除待办事项 - ${testCase.description}`, async () => {
          const response = await apiClient.delete(`/dashboard/todos/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });
  });

  describe('日程管理API测试', () => {
    describe('GET /dashboard/schedule-data - 获取日程数据参数验证', () => {
      test('应该成功获取日程数据', async () => {
        const response = await apiClient.get('/dashboard/schedule-data');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/schedules - 获取日程列表参数验证', () => {
      // 有效查询参数组合
      const validScheduleParams = [
        {
          params: {},
          description: '无参数查询'
        },
        {
          params: { startDate: '2024-07-01', endDate: '2024-07-31' },
          description: '按日期范围查询'
        },
        {
          params: { type: 'meeting' },
          description: '按类型查询'
        },
        {
          params: { page: 1, limit: 10 },
          description: '分页查询'
        }
      ];

      validScheduleParams.forEach((testCase) => {
        test(`应该成功获取日程列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/dashboard/schedules', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
        }, 10000);
      });

      // 无效日期格式测试
      const invalidScheduleParams = [
        {
          params: { startDate: 'invalid-date' },
          description: '无效开始日期格式'
        },
        {
          params: { endDate: 'invalid-date' },
          description: '无效结束日期格式'
        }
      ];

      invalidScheduleParams.forEach((testCase) => {
        test(`应该拒绝获取日程列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/dashboard/schedules', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });
  });

  describe('园长仪表盘API测试', () => {
    describe('GET /dashboard/principal/stats - 园长统计数据参数验证', () => {
      test('应该成功获取园长统计数据', async () => {
        const response = await apiClient.get('/dashboard/principal/stats');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/principal/customer-pool/stats - 客户池统计参数验证', () => {
      test('应该成功获取客户池统计数据', async () => {
        const response = await apiClient.get('/dashboard/principal/customer-pool/stats');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/principal/customer-pool/list - 客户池列表参数验证', () => {
      // 有效查询参数
      const validCustomerPoolParams = [
        {
          params: {},
          description: '无参数查询'
        },
        {
          params: { page: 1, limit: 10 },
          description: '分页查询'
        },
        {
          params: { status: 'active' },
          description: '按状态查询'
        }
      ];

      validCustomerPoolParams.forEach((testCase) => {
        test(`应该成功获取客户池列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/dashboard/principal/customer-pool/list', { 
            params: testCase.params 
          });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
        }, 10000);
      });
    });
  });

  describe('通知管理API测试', () => {
    describe('GET /dashboard/notices/stats - 通知统计参数验证', () => {
      test('应该成功获取通知统计数据', async () => {
        const response = await apiClient.get('/dashboard/notices/stats');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/notices/important - 重要通知参数验证', () => {
      test('应该成功获取重要通知', async () => {
        const response = await apiClient.get('/dashboard/notices/important');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('POST /dashboard/notices/:id/read - 标记通知已读参数验证', () => {
      test('应该成功标记通知已读 - 有效ID', async () => {
        // 使用模拟ID进行测试
        const response = await apiClient.post('/dashboard/notices/1/read');
        
        // 可能成功或返回404
        expect([200, 404]).toContain(response.status);
        expect(response.data.success).toBeDefined();
      }, 10000);

      // 无效ID测试
      const invalidNoticeIds = [
        { id: 0, description: 'ID为0' },
        { id: 'abc', description: '非数字ID' },
        { id: -1, description: '负数ID' }
      ];

      invalidNoticeIds.forEach((testCase) => {
        test(`应该拒绝标记通知已读 - ${testCase.description}`, async () => {
          const response = await apiClient.post(`/dashboard/notices/${testCase.id}/read`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /dashboard/notices/mark-all-read - 标记所有通知已读参数验证', () => {
      test('应该成功标记所有通知已读', async () => {
        const response = await apiClient.post('/dashboard/notices/mark-all-read');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      }, 10000);
    });

    describe('DELETE /dashboard/notices/:id - 删除通知参数验证', () => {
      test('应该处理删除通知请求 - 有效ID', async () => {
        // 使用模拟ID进行测试
        const response = await apiClient.delete('/dashboard/notices/1');
        
        // 可能成功删除或返回404
        expect([200, 404]).toContain(response.status);
        expect(response.data.success).toBeDefined();
      }, 10000);

      // 无效ID测试
      const invalidNoticeIds = [
        { id: 0, description: 'ID为0' },
        { id: 'abc', description: '非数字ID' },
        { id: -1, description: '负数ID' }
      ];

      invalidNoticeIds.forEach((testCase) => {
        test(`应该拒绝删除通知 - ${testCase.description}`, async () => {
          const response = await apiClient.delete(`/dashboard/notices/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });
  });

  describe('招生分析API测试', () => {
    describe('GET /dashboard/enrollment-trend - 招生趋势参数验证', () => {
      // 有效期间参数
      const validPeriodParams = [
        {
          params: { period: 'daily' },
          description: '按日统计'
        },
        {
          params: { period: 'weekly' },
          description: '按周统计'
        },
        {
          params: { period: 'monthly' },
          description: '按月统计'
        },
        {
          params: { period: 'yearly' },
          description: '按年统计'
        }
      ];

      validPeriodParams.forEach((testCase) => {
        test(`应该成功获取招生趋势 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/dashboard/enrollment-trend', { 
            params: testCase.params 
          });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
        }, 10000);
      });

      // 无效期间参数
      test('应该拒绝无效期间参数', async () => {
        const response = await apiClient.get('/dashboard/enrollment-trend', { 
          params: { period: 'invalid_period' }
        });
        
        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });

    describe('GET /dashboard/enrollment-trends - 详细招生趋势参数验证', () => {
      test('应该成功获取详细招生趋势', async () => {
        const response = await apiClient.get('/dashboard/enrollment-trends');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/channel-analysis - 渠道分析参数验证', () => {
      test('应该成功获取渠道分析数据', async () => {
        const response = await apiClient.get('/dashboard/channel-analysis');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/conversion-funnel - 转化漏斗参数验证', () => {
      test('应该成功获取转化漏斗数据', async () => {
        const response = await apiClient.get('/dashboard/conversion-funnel');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });
  });

  describe('班级管理API测试', () => {
    describe('GET /dashboard/classes - 班级概览参数验证', () => {
      test('应该成功获取班级概览', async () => {
        const response = await apiClient.get('/dashboard/classes');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/class-create - 班级创建仪表盘参数验证', () => {
      test('应该成功获取班级创建仪表盘数据', async () => {
        const response = await apiClient.get('/dashboard/class-create');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/class-detail/:id - 班级详情仪表盘参数验证', () => {
      test('应该成功获取班级详情仪表盘数据 - 有效ID', async () => {
        const response = await apiClient.get('/dashboard/class-detail/1');
        
        expect([200, 404]).toContain(response.status);
        expect(response.data.success).toBeDefined();
      }, 10000);

      test('应该拒绝获取班级详情仪表盘数据 - 无效ID', async () => {
        const response = await apiClient.get('/dashboard/class-detail/abc');
        
        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });

    describe('GET /dashboard/class-list - 班级列表仪表盘参数验证', () => {
      test('应该成功获取班级列表仪表盘数据', async () => {
        const response = await apiClient.get('/dashboard/class-list');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });
  });

  describe('活动和图表API测试', () => {
    describe('GET /dashboard/activities - 活动数据参数验证', () => {
      test('应该成功获取活动数据', async () => {
        const response = await apiClient.get('/dashboard/activities');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/activities-backup - 备份活动数据参数验证', () => {
      test('应该成功获取备份活动数据', async () => {
        const response = await apiClient.get('/dashboard/activities-backup');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/charts - 图表数据参数验证', () => {
      // 有效图表类型参数
      const validChartParams = [
        {
          params: {},
          description: '无参数查询'
        },
        {
          params: { type: 'enrollment' },
          description: '招生图表'
        },
        {
          params: { type: 'activity' },
          description: '活动图表'
        },
        {
          params: { timeRange: '7d' },
          description: '7天时间范围'
        },
        {
          params: { type: 'enrollment', timeRange: '30d' },
          description: '招生图表30天范围'
        }
      ];

      validChartParams.forEach((testCase) => {
        test(`应该成功获取图表数据 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/dashboard/charts', { 
            params: testCase.params 
          });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
        }, 10000);
      });
    });
  });

  describe('校园和自定义API测试', () => {
    describe('GET /dashboard/kindergarten - 幼儿园概览参数验证', () => {
      test('应该成功获取幼儿园概览数据', async () => {
        const response = await apiClient.get('/dashboard/kindergarten');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/campus-overview - 校园概览参数验证', () => {
      test('应该成功获取校园概览数据', async () => {
        const response = await apiClient.get('/dashboard/campus-overview');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/custom-layout - 自定义布局参数验证', () => {
      test('应该成功获取自定义布局数据', async () => {
        const response = await apiClient.get('/dashboard/custom-layout');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/data-statistics - 数据统计参数验证', () => {
      test('应该成功获取数据统计', async () => {
        const response = await apiClient.get('/dashboard/data-statistics');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });
  });

  describe('工具和遗留API测试', () => {
    describe('GET /dashboard/schedule - 园长日程参数验证', () => {
      test('应该成功获取园长日程数据', async () => {
        const response = await apiClient.get('/dashboard/schedule');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }, 10000);
    });

    describe('GET /dashboard/test-route - 测试路由参数验证', () => {
      test('应该成功访问测试路由', async () => {
        const response = await apiClient.get('/dashboard/test-route');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.message).toContain('测试路由正常');
      }, 10000);
    });
  });

  describe('权限验证测试', () => {
    test('应该拒绝无token访问', async () => {
      // 创建无认证的客户端
      const noAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true
      });

      const response = await noAuthClient.get('/dashboard/overview');
      
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

      const response = await invalidAuthClient.get('/dashboard/overview');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);
  });

  describe('性能和稳定性测试', () => {
    test('所有核心仪表盘API响应时间应小于2秒', async () => {
      const coreEndpoints = [
        '/dashboard/overview',
        '/dashboard/statistics',
        '/dashboard/todos',
        '/dashboard/schedule-data'
      ];

      for (const endpoint of coreEndpoints) {
        const startTime = Date.now();
        const response = await apiClient.get(endpoint);
        const responseTime = Date.now() - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(2000);
      }
    }, 20000);

    test('并发请求处理能力测试', async () => {
      const concurrentRequests = Array.from({ length: 5 }, () => 
        apiClient.get('/dashboard/overview')
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      });
    }, 15000);
  });
});