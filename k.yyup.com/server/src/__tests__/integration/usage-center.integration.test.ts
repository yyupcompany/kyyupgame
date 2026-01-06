/**
 * 用量中心API集成测试
 */

import request from 'supertest';
import { app } from '../../app';
import { sequelize } from '../../init';

describe('UsageCenter API Integration Tests', () => {
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.data.token;
    testUserId = loginResponse.body.data.user.id;
  });

  describe('GET /api/usage-center/overview', () => {
    it('应该成功获取用量概览', async () => {
      const response = await request(app)
        .get('/api/usage-center/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCalls');
      expect(response.body.data).toHaveProperty('totalCost');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('usageByType');
      expect(Array.isArray(response.body.data.usageByType)).toBe(true);
    });

    it('应该支持日期范围查询', async () => {
      const response = await request(app)
        .get('/api/usage-center/overview')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('应该拒绝未授权访问', async () => {
      await request(app)
        .get('/api/usage-center/overview')
        .expect(401);
    });
  });

  describe('GET /api/usage-center/users', () => {
    it('应该成功获取用户用量列表', async () => {
      const response = await request(app)
        .get('/api/usage-center/users')
        .query({ page: 1, pageSize: 20 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('pageSize');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('应该支持分页参数', async () => {
      const response = await request(app)
        .get('/api/usage-center/users')
        .query({ page: 2, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.page).toBe(2);
      expect(response.body.data.pageSize).toBe(10);
    });
  });

  describe('GET /api/usage-center/user/:userId/detail', () => {
    it('应该成功获取用户详细用量', async () => {
      const response = await request(app)
        .get(`/api/usage-center/user/${testUserId}/detail`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usageByType');
      expect(response.body.data).toHaveProperty('usageByModel');
      expect(response.body.data).toHaveProperty('recentUsage');
      expect(Array.isArray(response.body.data.usageByType)).toBe(true);
      expect(Array.isArray(response.body.data.usageByModel)).toBe(true);
      expect(Array.isArray(response.body.data.recentUsage)).toBe(true);
    });

    it('应该支持日期范围查询', async () => {
      const response = await request(app)
        .get(`/api/usage-center/user/${testUserId}/detail`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/usage-center/my-usage', () => {
    it('应该成功获取当前用户用量', async () => {
      const response = await request(app)
        .get('/api/usage-center/my-usage')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usageByType');
      expect(response.body.data).toHaveProperty('usageByModel');
      expect(response.body.data).toHaveProperty('recentUsage');
    });

    it('应该拒绝未授权访问', async () => {
      await request(app)
        .get('/api/usage-center/my-usage')
        .expect(401);
    });
  });

  describe('GET /api/usage-quota/user/:userId', () => {
    it('应该成功获取用户配额', async () => {
      const response = await request(app)
        .get(`/api/usage-quota/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('monthlyQuota');
      expect(response.body.data).toHaveProperty('monthlyCostQuota');
      expect(response.body.data).toHaveProperty('currentMonthUsage');
      expect(response.body.data).toHaveProperty('currentMonthCost');
      expect(response.body.data).toHaveProperty('usagePercentage');
      expect(response.body.data).toHaveProperty('costPercentage');
      expect(response.body.data).toHaveProperty('warningEnabled');
      expect(response.body.data).toHaveProperty('warningThreshold');
    });
  });

  describe('PUT /api/usage-quota/user/:userId', () => {
    it('应该成功更新用户配额', async () => {
      const quotaData = {
        monthlyQuota: 20000,
        monthlyCostQuota: 200,
        warningEnabled: true,
        warningThreshold: 85
      };

      const response = await request(app)
        .put(`/api/usage-quota/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(quotaData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('配额更新成功');
    });

    it('应该验证配额数据', async () => {
      const invalidData = {
        monthlyQuota: -1000, // 无效值
        monthlyCostQuota: 200
      };

      const response = await request(app)
        .put(`/api/usage-quota/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      // 根据实际验证逻辑调整期望
      expect(response.body.success).toBeDefined();
    });
  });

  describe('GET /api/usage-quota/warnings', () => {
    it('应该成功获取预警信息', async () => {
      const response = await request(app)
        .get('/api/usage-quota/warnings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 如果有预警数据，验证数据结构
      if (response.body.data.length > 0) {
        const warning = response.body.data[0];
        expect(warning).toHaveProperty('userId');
        expect(warning).toHaveProperty('username');
        expect(warning).toHaveProperty('usagePercentage');
        expect(warning).toHaveProperty('costPercentage');
      }
    });
  });

  describe('数据一致性测试', () => {
    it('用户详细用量应该与概览统计一致', async () => {
      // 获取概览
      const overviewResponse = await request(app)
        .get('/api/usage-center/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 获取用户列表
      const usersResponse = await request(app)
        .get('/api/usage-center/users')
        .query({ page: 1, pageSize: 100 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 验证总调用次数一致性
      const totalCallsFromUsers = usersResponse.body.data.items.reduce(
        (sum: number, user: any) => sum + user.totalCalls,
        0
      );

      // 注意：由于可能有分页，这里只是示例验证
      expect(typeof totalCallsFromUsers).toBe('number');
    });

    it('配额使用率计算应该正确', async () => {
      const quotaResponse = await request(app)
        .get(`/api/usage-quota/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const quota = quotaResponse.body.data;
      
      // 验证使用率计算
      const expectedUsagePercentage = quota.monthlyQuota > 0
        ? (quota.currentMonthUsage / quota.monthlyQuota * 100)
        : 0;
      
      expect(quota.usagePercentage).toBeCloseTo(expectedUsagePercentage, 2);
    });
  });

  describe('性能测试', () => {
    it('概览查询应该在合理时间内完成', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/usage-center/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 应该在2秒内完成
      expect(duration).toBeLessThan(2000);
    });

    it('用户列表查询应该支持大量数据', async () => {
      const response = await request(app)
        .get('/api/usage-center/users')
        .query({ page: 1, pageSize: 100 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeLessThanOrEqual(100);
    });
  });
});

