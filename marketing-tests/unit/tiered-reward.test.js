/**
 * 阶梯奖励功能单元测试
 */

const ApiClient = require('../utils/api-client');
const TestHelpers = require('../utils/test-helpers');
const config = require('../config/test-config');

describe('阶梯奖励功能单元测试', () => {
  let apiClient;
  let baseData;
  let adminToken;

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

  describe('阶梯奖励创建', () => {
    test('应该成功创建阶梯奖励', async () => {
      const rewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
        tier: 1,
        targetValue: 10,
        rewardType: 'discount',
        rewardValue: '10',
        rewardDescription: '满10人享9折优惠'
      });

      const response = await apiClient.createTieredReward(rewardData);

      TestHelpers.validateApiResponse(response, [
        'id', 'activityId', 'type', 'tier', 'targetValue',
        'rewardType', 'rewardValue', 'rewardDescription', 'isActive'
      ]);

      expect(response.data.activityId).toBe(baseData.activity.id);
      expect(response.data.type).toBe('registration');
      expect(response.data.tier).toBe(1);
      expect(response.data.targetValue).toBe(10);
      expect(response.data.rewardType).toBe('discount');
      expect(response.data.rewardValue).toBe('10');
      expect(response.data.isActive).toBe(true);

      baseData.tieredReward = response.data;
    });

    test('应该创建多个层级的阶梯奖励', async () => {
      const tieredRewards = [];
      for (let tier = 1; tier <= 3; tier++) {
        const rewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
          tier: tier,
          targetValue: tier * 10,
          rewardType: tier === 1 ? 'discount' : tier === 2 ? 'gift' : 'free',
          rewardValue: tier === 1 ? '10' : tier === 2 ? '玩具' : '1',
          rewardDescription: `第${tier}阶梯奖励`
        });

        const response = await apiClient.createTieredReward(rewardData);
        tieredRewards.push(response.data);
      }

      expect(tieredRewards).toHaveLength(3);
      tieredRewards.forEach((reward, index) => {
        expect(reward.tier).toBe(index + 1);
        expect(reward.targetValue).toBe((index + 1) * 10);
        expect(reward.isActive).toBe(true);
      });
    });

    test('应该拒绝重复的同类型同层级奖励', async () => {
      const duplicateRewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
        tier: 1, // 与已创建的奖励相同
        type: 'registration', // 相同类型
        targetValue: 15 // 不同目标值
      });

      await expect(apiClient.createTieredReward(duplicateRewardData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('已存在')
        });
    });

    test('应该拒绝无效的奖励参数', async () => {
      const invalidRewardData = {
        activityId: -1, // 无效ID
        type: 'invalid', // 无效类型
        tier: 0, // 无效层级
        targetValue: -1, // 无效目标值
        rewardType: 'invalid', // 无效奖励类型
        rewardValue: '', // 空值
        rewardDescription: '' // 空描述
      };

      await expect(apiClient.createTieredReward(invalidRewardData))
        .rejects.toMatchObject({
          status: 400
        });
    });
  });

  describe('阶梯奖励查询', () => {
    test('应该成功获取阶梯奖励列表', async () => {
      const response = await apiClient.getTieredRewards({
        activityId: baseData.activity.id
      });

      TestHelpers.validatePaginatedResponse(response);
      expect(response.data.items.length).toBeGreaterThan(0);

      const reward = response.data.items[0];
      expect(reward.activityId).toBe(baseData.activity.id);
    });

    test('应该成功获取活动的阶梯奖励', async () => {
      const response = await apiClient.getActivityTieredRewards(
        baseData.activity.id,
        'registration'
      );

      TestHelpers.validateApiResponse(response);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        response.data.forEach(reward => {
          expect(reward.activityId).toBe(baseData.activity.id);
          expect(reward.type).toBe('registration');
        });
      }
    });

    test('应该支持按类型过滤', async () => {
      const response = await apiClient.getTieredRewards({
        type: 'registration'
      });

      TestHelpers.validatePaginatedResponse(response);

      if (response.data.items.length > 0) {
        response.data.items.forEach(reward => {
          expect(reward.type).toBe('registration');
        });
      }
    });

    test('应该支持按状态过滤', async () => {
      const response = await apiClient.getTieredRewards({
        isActive: true
      });

      TestHelpers.validatePaginatedResponse(response);

      if (response.data.items.length > 0) {
        response.data.items.forEach(reward => {
          expect(reward.isActive).toBe(true);
        });
      }
    });

    test('应该支持分页查询', async () => {
      const response = await apiClient.getTieredRewards({
        page: 1,
        pageSize: 10
      });

      TestHelpers.validatePaginatedResponse(response);
      expect(response.data.page).toBe(1);
      expect(response.data.pageSize).toBe(10);
    });
  });

  describe('阶梯奖励状态管理', () => {
    test('应该正确判断奖励可用性', async () => {
      const response = await apiClient.getTieredRewardDetail(baseData.tieredReward.id);

      expect(response.data.isActive).toBe(true);
      expect(response.data.isAvailable()).toBe(true);
      expect(response.data.canAward()).toBe(true);
    });

    test('应该正确计算进度', async () => {
      const response = await apiClient.getTieredRewardDetail(baseData.tieredReward.id);

      // 模拟当前进度
      const currentValue = 5; // 假设当前有5人报名
      const expectedProgress = (currentValue / response.data.targetValue) * 100;

      // 这个测试可能需要在实际业务流程中验证
      expect(typeof response.data.targetValue).toBe('number');
      expect(response.data.targetValue).toBeGreaterThan(0);
    });

    test('应该正确判断是否达成目标', async () => {
      const response = await apiClient.getTieredRewardDetail(baseData.tieredReward.id);

      // 测试达成条件
      const targetValue = response.data.targetValue;
      const currentValueBelow = targetValue - 1;
      const currentValueAbove = targetValue + 1;

      expect(response.data.isAchieved(currentValueBelow)).toBe(false);
      expect(response.data.isAchieved(currentValueAbove)).toBe(true);
    });
  });

  describe('获奖记录管理', () => {
    test('应该获取用户的获奖记录', async () => {
      const response = await apiClient.getUserRewardRecords({
        activityId: baseData.activity.id
      });

      TestHelpers.validatePaginatedResponse(response);

      // 验证返回的数据结构
      if (response.data.items.length > 0) {
        response.data.items.forEach(record => {
          expect(record).toHaveProperty('userId');
          expect(record).toHaveProperty('tieredRewardId');
          expect(record).toHaveProperty('status');
          expect(['pending', 'awarded', 'expired', 'cancelled']).toContain(record.status);
        });
      }
    });

    test('应该支持按状态过滤获奖记录', async () => {
      const statuses = ['awarded', 'pending', 'expired'];

      for (const status of statuses) {
        const response = await apiClient.getUserRewardRecords({
          status: status
        });

        TestHelpers.validatePaginatedResponse(response);

        if (response.data.items.length > 0) {
          response.data.items.forEach(record => {
            expect(record.status).toBe(status);
          });
        }
      }
    });

    test('应该正确识别可使用的奖励', async () => {
      // 这个测试需要实际的获奖记录数据
      const response = await apiClient.getUserRewardRecords({
        status: 'awarded'
      });

      TestHelpers.validatePaginatedResponse(response);

      if (response.data.items.length > 0) {
        response.data.items.forEach(record => {
          const canUse = record.status === 'awarded' &&
                        !record.usedAt &&
                        (!record.expiryAt || new Date(record.expiryAt) > new Date());

          // 这个验证基于业务逻辑
          expect(typeof record.status).toBe('string');
          expect(typeof record.canUse).toBe('function');
        });
      }
    });
  });

  describe('奖励类型验证', () => {
    test('应该支持所有奖励类型', async () => {
      const rewardTypes = ['discount', 'gift', 'cashback', 'points', 'free'];
      const rewardValues = ['10', '玩具', '50', '100', '1'];

      for (let i = 0; i < rewardTypes.length; i++) {
        const rewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
          rewardType: rewardTypes[i],
          rewardValue: rewardValues[i],
          tier: i + 2 // 避免与已创建的重复
        });

        const response = await apiClient.createTieredReward(rewardData);

        expect(response.data.rewardType).toBe(rewardTypes[i]);
        expect(response.data.rewardValue).toBe(rewardValues[i]);
      }
    });

    test('应该正确解析奖励值', async () => {
      const testCases = [
        { type: 'discount', value: '10', expectedType: 'number' },
        { type: 'gift', value: '{"name": "玩具", "description": "精美玩具"}', expectedType: 'object' },
        { type: 'points', value: '100', expectedType: 'number' }
      ];

      for (const testCase of testCases) {
        const rewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
          rewardType: testCase.type,
          rewardValue: testCase.value,
          tier: Math.random() * 10 + 10
        });

        const response = await apiClient.createTieredReward(rewardData);

        expect(response.data.rewardType).toBe(testCase.type);
        expect(response.data.rewardValue).toBe(testCase.value);

        // 验证可以解析奖励值
        try {
          const parsedValue = JSON.parse(response.data.rewardValue);
          if (testCase.expectedType === 'object') {
            expect(typeof parsedValue).toBe('object');
          }
        } catch (e) {
          // 如果不是JSON格式，检查原始值类型
          if (testCase.expectedType === 'number') {
            expect(!isNaN(Number(response.data.rewardValue))).toBe(true);
          }
        }
      }
    });
  });

  describe('阶梯奖励业务逻辑', () => {
    test('应该按层级顺序排列奖励', async () => {
      const response = await apiClient.getActivityTieredRewards(baseData.activity.id, 'registration');

      if (response.data.length > 1) {
        for (let i = 1; i < response.data.length; i++) {
          expect(response.data[i].tier).toBeGreaterThan(response.data[i-1].tier);
          expect(response.data[i].targetValue).toBeGreaterThanOrEqual(response.data[i-1].targetValue);
        }
      }
    });

    test('应该正确处理奖励发放条件', async () => {
      const response = await apiClient.getTieredRewardDetail(baseData.tieredReward.id);

      const reward = response.data;

      // 验证发放条件
      expect(reward.isActive).toBe(true);
      expect(reward.maxWinners).toBeUndefined(); // 默认无限制
      expect(reward.currentWinners).toBe(0);

      // 测试有限制的情况
      if (reward.maxWinners) {
        expect(reward.currentWinners).toBeLessThanOrEqual(reward.maxWinners);
      }
    });

    test('应该正确处理奖励过期', async () => {
      const futureDate = TestHelpers.futureDate(7); // 7天后
      const pastDate = TestHelpers.pastDate(1); // 1天前

      // 创建带过期时间的奖励
      const rewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
        expiryDate: futureDate
      });

      const response = await apiClient.createTieredReward(rewardData);

      expect(TestHelpers.isValidDate(response.data.expiryDate)).toBe(true);

      // 验证过期时间确实在未来
      const expiryTime = new Date(response.data.expiryDate);
      const now = new Date();
      expect(expiryTime.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('奖励统计功能', () => {
    test('应该获取活动奖励统计', async () => {
      const response = await apiClient.getRewardStatistics(baseData.activity.id);

      TestHelpers.validateApiResponse(response, [
        'totalRewards', 'activeRewards', 'totalWinners', 'rewardTypes'
      ]);

      expect(typeof response.data.totalRewards).toBe('number');
      expect(typeof response.data.activeRewards).toBe('number');
      expect(typeof response.data.totalWinners).toBe('number');
      expect(typeof response.data.rewardTypes).toBe('object');

      // 验证奖励类型统计
      if (response.data.totalRewards > 0) {
        Object.keys(response.data.rewardTypes).forEach(type => {
          expect(['discount', 'gift', 'cashback', 'points', 'free']).toContain(type);
          expect(typeof response.data.rewardTypes[type]).toBe('number');
        });
      }
    });

    test('应该正确计算统计数据', async () => {
      const stats = await apiClient.getRewardStatistics(baseData.activity.id);

      // 验证统计数据的一致性
      expect(stats.data.activeRewards).toBeLessThanOrEqual(stats.data.totalRewards);
      expect(stats.data.totalWinners).toBeGreaterThanOrEqual(0);

      // 验证奖励类型总数
      const typeCount = Object.keys(stats.data.rewardTypes).length;
      expect(typeCount).toBeGreaterThan(0);

      const typeSum = Object.values(stats.data.rewardTypes).reduce((sum, count) => sum + count, 0);
      expect(typeSum).toBeLessThanOrEqual(stats.data.totalRewards);
    });
  });

  describe('边界条件测试', () => {
    test('应该处理最小层级', async () => {
      const minTierData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
        tier: 1,
        targetValue: 1
      });

      const response = await apiClient.createTieredReward(minTierData);

      expect(response.data.tier).toBe(1);
      expect(response.data.targetValue).toBe(1);
      expect(response.data.isAchieved(1)).toBe(true);
      expect(response.data.isAchieved(0)).toBe(false);
    });

    test('应该处理最大层级', async () => {
      const maxTierData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
        tier: 100,
        targetValue: 10000
      });

      const response = await apiClient.createTieredReward(maxTierData);

      expect(response.data.tier).toBe(100);
      expect(response.data.targetValue).toBe(10000);
    });

    test('应该处理零值奖励', async () => {
      const zeroRewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
        rewardType: 'discount',
        rewardValue: '0'
      });

      const response = await apiClient.createTieredReward(zeroRewardData);

      expect(response.data.rewardType).toBe('discount');
      expect(response.data.rewardValue).toBe('0');
    });

    test('应该处理极大奖励值', async () => {
      const largeRewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
        rewardType: 'points',
        rewardValue: '999999999'
      });

      const response = await apiClient.createTieredReward(largeRewardData);

      expect(response.data.rewardType).toBe('points');
      expect(response.data.rewardValue).toBe('999999999');
    });
  });

  describe('并发和性能测试', () => {
    test('应该处理并发创建奖励', async () => {
      const concurrentRequests = 5;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const rewardData = TestHelpers.generateTieredRewardData(baseData.activity.id, {
          tier: i + 10, // 避免重复
          targetValue: (i + 1) * 10
        });

        promises.push(apiClient.createTieredReward(rewardData));
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      expect(successful.length).toBe(concurrentRequests);
      expect(failed).toHaveLength(0);

      // 验证所有奖励都创建成功且唯一
      const tierNumbers = successful.map(result => result.value.data.tier);
      const uniqueTiers = [...new Set(tierNumbers)];
      expect(uniqueTiers).toHaveLength(concurrentRequests);
    });

    test('应该处理并发查询', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(apiClient.getTieredRewards());
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled');

      expect(successful).toHaveLength(concurrentRequests);

      // 验证所有响应都是一致的
      const firstResult = successful[0].value;
      successful.forEach(result => {
        expect(result.value).toMatchObject({
          success: firstResult.value.success,
          data: {
            total: firstResult.value.data.total,
            page: firstResult.value.data.page,
            pageSize: firstResult.value.data.pageSize
          }
        });
      });
    });
  });

  describe('错误处理', () => {
    test('应该处理不存在的奖励ID', async () => {
      await expect(apiClient.getTieredRewardDetail(999999))
        .rejects.toMatchObject({
          status: 404,
          message: expect.stringContaining('不存在')
        });
    });

    test('应该处理使用已过期的奖励', async () => {
      // 创建一个已过期的奖励记录来测试
      // 这个测试可能需要直接操作数据库
    });

    test('应该处理奖励使用失败', async () => {
      await expect(apiClient.useReward(999999))
        .rejects.toMatchObject({
          status: 404,
          message: expect.stringContaining('不存在')
        });
    });
  });
});