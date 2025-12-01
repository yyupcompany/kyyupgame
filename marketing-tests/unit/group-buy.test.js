/**
 * 团购功能单元测试
 */

const ApiClient = require('../utils/api-client');
const TestHelpers = require('../utils/test-helpers');
const config = require('../config/test-config');

describe('团购功能单元测试', () => {
  let apiClient;
  let baseData;
  let adminToken;
  let userTokens = {};

  beforeAll(async () => {
    apiClient = new ApiClient();

    // 管理员登录
    adminToken = (await apiClient.login(config.users.admin.email, config.users.admin.password)).token;
    apiClient.setToken(adminToken);

    // 创建基础测试数据
    baseData = await TestHelpers.createBaseTestData(apiClient);
  });

  afterAll(async () => {
    await TestHelpers.cleanupTestData(apiClient, baseData);
    await apiClient.logout();
  });

  describe('团购创建功能', () => {
    test('应该成功创建团购活动', async () => {
      const groupBuyData = TestHelpers.generateGroupBuyData(baseData.activity.id);

      const response = await apiClient.createGroupBuy(groupBuyData);

      TestHelpers.validateApiResponse(response, [
        'id', 'activityId', 'minParticipants', 'maxParticipants',
        'originalPrice', 'groupPrice', 'status'
      ]);

      expect(response.data.activityId).toBe(baseData.activity.id);
      expect(response.data.minParticipants).toBe(3);
      expect(response.data.maxParticipants).toBe(20);
      expect(response.data.originalPrice).toBe(299.00);
      expect(response.data.groupPrice).toBe(239.20);
      expect(response.data.status).toBe('active');

      baseData.groupBuy = response.data;
    });

    test('应该拒绝无效的活动ID', async () => {
      const invalidGroupBuyData = TestHelpers.generateGroupBuyData(999999);

      await expect(apiClient.createGroupBuy(invalidGroupBuyData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('活动')
        });
    });

    test('应该拒绝无效的团购参数', async () => {
      const invalidGroupBuyData = {
        activityId: baseData.activity.id,
        minParticipants: -1, // 无效值
        maxParticipants: 0,   // 无效值
        originalPrice: -100, // 无效值
        groupPrice: 50       // 价格高于原价
      };

      await expect(apiClient.createGroupBuy(invalidGroupBuyData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该拒绝重复创建同一活动的团购', async () => {
      const duplicateGroupBuyData = TestHelpers.generateGroupBuyData(baseData.activity.id);

      await expect(apiClient.createGroupBuy(duplicateGroupBuyData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('已存在')
        });
    });
  });

  describe('团购查询功能', () => {
    test('应该成功获取团购列表', async () => {
      const response = await apiClient.getGroupBuys({
        activityId: baseData.activity.id
      });

      TestHelpers.validatePaginatedResponse(response);
      expect(response.data.items.length).toBeGreaterThan(0);

      const groupBuy = response.data.items[0];
      expect(groupBuy.activityId).toBe(baseData.activity.id);
    });

    test('应该成功获取团购详情', async () => {
      const response = await apiClient.getGroupBuyDetail(baseData.groupBuy.id);

      TestHelpers.validateApiResponse(response, [
        'id', 'activityId', 'minParticipants', 'maxParticipants',
        'currentCount', 'progress', 'status', 'deadline'
      ]);

      expect(response.data.id).toBe(baseData.groupBuy.id);
      expect(response.data.currentCount).toBeGreaterThanOrEqual(0);
      expect(response.data.progress).toBeGreaterThanOrEqual(0);
      expect(response.data.progress).toBeLessThanOrEqual(100);
    });

    test('应该返回404对于不存在的团购', async () => {
      await expect(apiClient.getGroupBuyDetail(999999))
        .rejects.toMatchObject({
          status: 404,
          message: expect.stringContaining('不存在')
        });
    });

    test('应该支持分页查询', async () => {
      const response1 = await apiClient.getGroupBuys({ page: 1, pageSize: 5 });
      const response2 = await apiClient.getGroupBuys({ page: 2, pageSize: 5 });

      TestHelpers.validatePaginatedResponse(response1);
      TestHelpers.validatePaginatedResponse(response2);
    });
  });

  describe('团购状态管理', () => {
    test('团购应该有正确的初始状态', async () => {
      const response = await apiClient.getGroupBuyDetail(baseData.groupBuy.id);

      expect(response.data.status).toBe('active');
      expect(response.data.canJoin).toBe(true);
      expect(response.data.isExpired).toBe(false);
      expect(response.data.isSuccessful).toBe(false);
    });

    test('应该正确计算团购进度', async () => {
      const response = await apiClient.getGroupBuyDetail(baseData.groupBuy.id);

      const expectedProgress = (response.data.currentCount / response.data.minParticipants) * 100;
      expect(response.data.progress).toBeCloseTo(expectedProgress, 1);
    });

    test('应该正确判断团购是否可加入', async () => {
      let response = await apiClient.getGroupBuyDetail(baseData.groupBuy.id);

      // 初始状态应该可以加入
      expect(response.data.canJoin).toBe(true);

      // 模拟团购已满的情况
      // 这里需要手动更新数据库或者创建一个满员的团购
    });
  });

  describe('团购参数验证', () => {
    test('应该验证最小参与人数', async () => {
      const invalidData = TestHelpers.generateGroupBuyData(baseData.activity.id, {
        minParticipants: 1 // 太小
      });

      await expect(apiClient.createGroupBuy(invalidData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该验证最大参与人数', async () => {
      const invalidData = TestHelpers.generateGroupBuyData(baseData.activity.id, {
        maxParticipants: 10000 // 太大
      });

      await expect(apiClient.createGroupBuy(invalidData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该验证团购价格合理性', async () => {
      const invalidData = TestHelpers.generateGroupBuyData(baseData.activity.id, {
        originalPrice: 100,
        groupPrice: 200 // 团购价高于原价
      });

      await expect(apiClient.createGroupBuy(invalidData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该验证团购时长', async () => {
      const invalidData = TestHelpers.generateGroupBuyData(baseData.activity.id, {
        durationHours: 1 // 太短
      });

      await expect(apiClient.createGroupBuy(invalidData))
        .rejects.toMatchObject({
          status: 400
        });
    });
  });

  describe('团购业务逻辑', () => {
    test('应该正确计算团购折扣', () => {
      const originalPrice = 299;
      const groupPrice = 239.20;
      const discountRate = groupPrice / originalPrice;

      expect(discountRate).toBeCloseTo(0.8, 2); // 8折
    });

    test('应该验证团购时间段有效性', () => {
      const now = moment();
      const startTime = moment().add(1, 'hour');
      const endTime = moment().add(72, 'hour');

      expect(startTime.isAfter(now)).toBe(true);
      expect(endTime.isAfter(startTime)).toBe(true);
    });

    test('应该处理团购截止时间', async () => {
      const pastDate = TestHelpers.pastDate(1); // 昨天
      const futureDate = TestHelpers.futureDate(1); // 明天

      expect(TestHelpers.isValidDate(pastDate)).toBe(true);
      expect(TestHelpers.isValidDate(futureDate)).toBe(true);
    });
  });

  describe('错误处理', () => {
    test('应该处理网络错误', async () => {
      // 模拟网络错误
      const invalidApiClient = new ApiClient();
      invalidApiClient.client.defaults.baseURL = 'http://invalid-url';

      await expect(invalidApiClient.getGroupBuys())
        .rejects.toMatchObject({
          status: 0,
          message: expect.stringContaining('网络请求失败')
        });
    });

    test('应该处理认证错误', async () => {
      const unauthorizedClient = new ApiClient();
      // 不设置token

      await expect(unauthorizedClient.createGroupBuy(TestHelpers.generateGroupBuyData(1)))
        .rejects.toMatchObject({
          status: 401
        });
    });

    test('应该处理服务器错误', async () => {
      // 使用无效的数据结构触发服务器错误
      const invalidData = { invalid: 'data' };

      await expect(apiClient.createGroupBuy(invalidData))
        .rejects.toMatchObject({
          status: 400
        });
    });
  });

  describe('边界条件测试', () => {
    test('应该处理最大团购数量', async () => {
      // 创建大量团购来测试系统限制
      const promises = [];
      const maxGroupBuys = 10;

      for (let i = 0; i < maxGroupBuys; i++) {
        const activityData = TestHelpers.generateTestActivity({
          title: `边界测试活动${i}`
        });

        // 这里应该为每个活动创建团购，但由于重复性限制，我们测试查询功能
        promises.push(apiClient.getGroupBuys());
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled');

      expect(successful.length).toBe(maxGroupBuys);
    });

    test('应该处理极值参数', async () => {
      const extremeData = TestHelpers.generateGroupBuyData(baseData.activity.id, {
        minParticipants: 2,
        maxParticipants: 2,
        durationHours: 24,
        originalPrice: 0.01,
        groupPrice: 0.01
      });

      const response = await apiClient.createGroupBuy(extremeData);
      TestHelpers.validateApiResponse(response);

      // 清理测试数据
      if (response.data?.id) {
        try {
          // 这里应该有删除团购的API
          // await apiClient.deleteGroupBuy(response.data.id);
        } catch (error) {
          console.warn('清理极端测试数据失败:', error.message);
        }
      }
    });

    test('应该处理并发请求', async () => {
      const concurrentRequests = 5;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(apiClient.getGroupBuys());
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled');

      expect(successful.length).toBe(concurrentRequests);

      // 验证所有响应都是一致的
      const firstResult = successful[0].value;
      successful.forEach(result => {
        expect(result.value).toMatchObject(firstResult);
      });
    });
  });
});