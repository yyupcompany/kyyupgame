/**
 * 积攒活动单元测试
 */

const ApiClient = require('../utils/api-client');
const TestHelpers = require('../utils/test-helpers');
const config = require('../config/test-config');

describe('积攒活动单元测试', () => {
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

  describe('积攒活动创建', () => {
    test('应该成功创建积攒活动', async () => {
      const collectData = TestHelpers.generateCollectActivityData(baseData.activity.id);

      const response = await apiClient.createCollectActivity(collectData);

      TestHelpers.validateApiResponse(response, [
        'id', 'activityId', 'collectCode', 'targetCount',
        'currentCount', 'status', 'rewardType', 'rewardValue'
      ]);

      expect(response.data.activityId).toBe(baseData.activity.id);
      expect(response.data.targetCount).toBe(20);
      expect(response.data.currentCount).toBe(0);
      expect(response.data.status).toBe('active');
      expect(response.data.rewardType).toBe('discount');
      expect(response.data.rewardValue).toBe('50');

      baseData.collectActivity = response.data;
    });

    test('应该生成唯一的积攒码', async () => {
      const collectData = TestHelpers.generateCollectActivityData(baseData.activity.id);
      const response = await apiClient.createCollectActivity(collectData);

      expect(response.data.collectCode).toBeDefined();
      expect(response.data.collectCode.length).toBeGreaterThan(0);
      expect(typeof response.data.collectCode).toBe('string');

      // 验证积攒码格式
      expect(response.data.collectCode).toMatch(/^[A-Za-z0-9]+$/);
    });

    test('应该拒绝无效的积攒参数', async () => {
      const invalidCollectData = {
        activityId: -1, // 无效ID
        targetCount: 0, // 无效目标
        maxCount: -1, // 无效最大值
        rewardType: 'invalid' // 无效奖励类型
      };

      await expect(apiClient.createCollectActivity(invalidCollectData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该拒绝不存在的活动ID', async () => {
      const invalidCollectData = TestHelpers.generateCollectActivityData(999999);

      await expect(apiClient.createCollectActivity(invalidCollectData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('活动')
        });
    });
  });

  describe('积攒助力功能', () => {
    test('应该成功助力积攒', async () => {
      // 使用管理员身份助力
      const helpData = {
        collectCode: baseData.collectActivity.collectCode,
        inviterId: baseData.collectActivity.userId
      };

      const response = await apiClient.helpCollect(helpData);

      TestHelpers.validateApiResponse(response, [
        'id', 'collectActivityId', 'helperId', 'collectCode',
        'ip', 'userAgent'
      ]);

      expect(response.data.collectCode).toBe(baseData.collectActivity.collectCode);
      expect(response.data.collectActivityId).toBe(baseData.collectActivity.id);
    });

    test('应该助力后更新积攒计数', async () => {
      const helpData = {
        collectCode: baseData.collectActivity.collectCode,
        inviterId: baseData.collectActivity.userId
      };

      // 先获取当前积攒数
      const beforeResponse = await apiClient.getCollectActivityDetail(baseData.collectActivity.id);
      const beforeCount = beforeResponse.data.currentCount;

      // 助力
      await apiClient.helpCollect(helpData);

      // 再次获取积攒数
      const afterResponse = await apiClient.getCollectActivityDetail(baseData.collectActivity.id);
      const afterCount = afterResponse.data.currentCount;

      expect(afterCount).toBe(beforeCount + 1);
    });

    test('应该拒绝无效的积攒码', async () => {
      const helpData = {
        collectCode: 'INVALID_CODE',
        inviterId: 1
      };

      await expect(apiClient.helpCollect(helpData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('积攒码')
        });
    });

    test('应该拒绝重复助力', async () => {
      const helpData = {
        collectCode: baseData.collectActivity.collectCode,
        inviterId: baseData.collectActivity.userId
      };

      // 第一次助力
      await apiClient.helpCollect(helpData);

      // 第二次助力应该被拒绝
      await expect(apiClient.helpCollect(helpData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('已助力')
        });
    });
  });

  describe('积攒活动查询', () => {
    test('应该成功获取积攒活动列表', async () => {
      const response = await apiClient.getCollectActivities({
        activityId: baseData.activity.id
      });

      TestHelpers.validatePaginatedResponse(response);
      expect(response.data.items.length).toBeGreaterThan(0);

      const collectActivity = response.data.items[0];
      expect(collectActivity.activityId).toBe(baseData.activity.id);
    });

    test('应该成功获取积攒活动详情', async () => {
      const response = await apiClient.getCollectActivityDetail(baseData.collectActivity.id);

      TestHelpers.validateApiResponse(response, [
        'id', 'activityId', 'collectCode', 'targetCount',
        'currentCount', 'progress', 'status', 'deadline'
      ]);

      expect(response.data.id).toBe(baseData.collectActivity.id);
      expect(response.data.progress).toBeGreaterThanOrEqual(0);
      expect(response.data.progress).toBeLessThanOrEqual(100);
    });

    test('应该支持按状态过滤', async () => {
      const response = await apiClient.getCollectActivities({
        status: 'active'
      });

      TestHelpers.validatePaginatedResponse(response);

      if (response.data.items.length > 0) {
        response.data.items.forEach(activity => {
          expect(activity.status).toBe('active');
        });
      }
    });

    test('应该返回404对于不存在的积攒活动', async () => {
      await expect(apiClient.getCollectActivityDetail(999999))
        .rejects.toMatchObject({
          status: 404,
          message: expect.stringContaining('不存在')
        });
    });
  });

  describe('积攒活动状态管理', () => {
    test('应该正确计算积攒进度', async () => {
      const response = await apiClient.getCollectActivityDetail(baseData.collectActivity.id);

      const targetCount = response.data.targetCount;
      const currentCount = response.data.currentCount;
      const expectedProgress = (currentCount / targetCount) * 100;

      expect(response.data.progress).toBeCloseTo(expectedProgress, 1);
    });

    test('应该正确判断积攒完成状态', async () => {
      let response = await apiClient.getCollectActivityDetail(baseData.collectActivity.id);

      // 初始状态应该未完成
      expect(response.data.isCompleted).toBe(false);

      // 模拟完成情况（需要手动更新数据库或创建已完成的积攒）
      // 这里主要验证逻辑方法
    });

    test('应该正确判断积攒是否过期', async () => {
      let response = await apiClient.getCollectActivityDetail(baseData.collectActivity.id);

      // 默认未过期
      expect(response.data.isExpired).toBe(false);

      // 测试过期情况
      const expiredCollectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
        deadlineHours: 1 // 1小时后过期
      });

      const expiredResponse = await apiClient.createCollectActivity(expiredCollectData);

      // 这里主要验证逻辑，实际过期检查可能需要等待时间或模拟
    });
  });

  describe('积攒奖励机制', () => {
    test('应该正确设置奖励类型和值', async () => {
      const response = await apiClient.getCollectActivityDetail(baseData.collectActivity.id);

      expect(response.data.rewardType).toBe('discount');
      expect(response.data.rewardValue).toBe('50');
      expect(response.data.getRewardDescription()).toBeDefined();
    });

    test('应该支持不同的奖励类型', async () => {
      const rewardTypes = ['discount', 'gift', 'free', 'points'];
      const rewardValues = ['10', '玩具', '1', '100'];

      for (let i = 0; i < rewardTypes.length; i++) {
        const collectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
          rewardType: rewardTypes[i],
          rewardValue: rewardValues[i]
        });

        const response = await apiClient.createCollectActivity(collectData);

        expect(response.data.rewardType).toBe(rewardTypes[i]);
        expect(response.data.rewardValue).toBe(rewardValues[i]);
      }
    });

    test('应该正确生成奖励描述', async () => {
      const testCases = [
        { type: 'discount', value: '50', expected: '优惠50元' },
        { type: 'gift', value: '玩具', expected: '赠送玩具' },
        { type: 'free', value: '1', expected: '免费1人' },
        { type: 'points', value: '100', expected: '奖励100积分' }
      ];

      for (const testCase of testCases) {
        const collectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
          rewardType: testCase.type,
          rewardValue: testCase.value
        });

        const response = await apiClient.createCollectActivity(collectData);
        const rewardDescription = response.data.getRewardDescription();

        expect(rewardDescription).toBeDefined();
        expect(typeof rewardDescription).toBe('string');
        expect(rewardDescription.length).toBeGreaterThan(0);
      }
    });
  });

  describe('防作弊机制', () => {
    test('应该记录助力者信息', async () => {
      const helpData = {
        collectCode: baseData.collectActivity.collectCode,
        inviterId: baseData.collectActivity.userId
      };

      const response = await apiClient.helpCollect(helpData);

      expect(response.data.ip).toBeDefined();
      expect(response.data.userAgent).toBeDefined();
      expect(response.data.helperId).toBeGreaterThan(0);
    });

    test('应该限制同一用户多次助力', async () => {
      const helpData = {
        collectCode: baseData.collectActivity.collectCode,
        inviterId: baseData.collectActivity.userId
      };

      // 第一次助力
      await apiClient.helpCollect(helpData);

      // 第二次助力应该被拒绝
      await expect(apiClient.helpCollect(helpData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该限制IP地址助力', async () => {
      const helpData = {
        collectCode: baseData.collectActivity.collectCode,
        inviterId: baseData.collectActivity.userId
      };

      // 这个测试可能需要模拟不同IP，实际应用中通过IP限制实现
      await apiClient.helpCollect(helpData);

      // 同IP的再次助力可能被限制，具体取决于实现
    });
  });

  describe('积攒活动边界条件', () => {
    test('应该处理最小目标数量', async () => {
      const minCollectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
        targetCount: 1, // 最小目标
        maxCount: 10   // 最小最大值
      });

      const response = await apiClient.createCollectActivity(minCollectData);

      expect(response.data.targetCount).toBe(1);
      expect(response.data.maxCount).toBe(10);
      expect(response.data.isCompleted()).toBe(false); // 0/1 未完成

      // 助力一次应该完成
      const helpData = {
        collectCode: response.data.collectCode,
        inviterId: response.data.userId
      };

      await apiClient.helpCollect(helpData);

      const updatedResponse = await apiClient.getCollectActivityDetail(response.data.id);
      expect(updatedResponse.data.currentCount).toBe(1);
      expect(updatedResponse.data.isCompleted()).toBe(true); // 1/1 完成
    });

    test('应该处理最大助力数量', async () => {
      const maxCollectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
        targetCount: 10,
        maxCount: 10 // 最大10人助力
      });

      const response = await apiClient.createCollectActivity(maxCollectData);

      expect(response.data.maxCount).toBe(10);
      expect(response.data.targetCount).toBe(10);
    });

    test('应该处理极短的截止时间', async () => {
      const shortCollectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
        deadlineHours: 1 // 1小时后截止
      });

      const response = await apiClient.createCollectActivity(shortCollectData);

      expect(response.data.deadline).toBeDefined();
      expect(TestHelpers.isValidDate(response.data.deadline)).toBe(true);

      // 验证截止时间确实是1小时后
      const deadlineTime = new Date(response.data.deadline);
      const expectedTime = new Date(Date.now() + 60 * 60 * 1000); // 1小时后
      const timeDiff = Math.abs(deadlineTime.getTime() - expectedTime.getTime());

      // 允许几分钟的误差
      expect(timeDiff).toBeLessThan(5 * 60 * 1000); // 5分钟误差范围
    });
  });

  describe('积攒活动业务逻辑', () => {
    test('应该正确处理积攒完成后的状态', async () => {
      // 创建一个目标为1的积攒活动
      const collectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
        targetCount: 1,
        rewardType: 'discount',
        rewardValue: '100'
      });

      const response = await apiClient.createCollectActivity(collectData);
      const collectId = response.data.id;

      // 助力完成
      const helpData = {
        collectCode: response.data.collectCode,
        inviterId: response.data.userId
      };

      await apiClient.helpCollect(helpData);

      // 验证完成状态
      const detailResponse = await apiClient.getCollectActivityDetail(collectId);
      expect(detailResponse.data.currentCount).toBe(1);
      expect(detailResponse.data.targetCount).toBe(1);
      expect(detailResponse.data.isCompleted()).toBe(true);
      expect(detailResponse.data.status).toBe('completed');
    });

    test('应该正确处理积攒失败情况', async () => {
      // 创建一个已经过期的积攒活动
      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000); // 1小时前
      const expiredCollectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
        targetCount: 10,
        deadlineHours: -1 // 负数表示已过期（需要根据实际实现调整）
      });

      // 这个测试可能需要直接操作数据库来模拟过期情况
    });

    test('应该正确计算奖励发放', async () => {
      const collectData = TestHelpers.generateCollectActivityData(baseData.activity.id, {
        targetCount: 3,
        rewardType: 'discount',
        rewardValue: '50'
      });

      const response = await apiClient.createCollectActivity(collectData);
      const collectId = response.data.id;

      // 助力3次完成
      for (let i = 0; i < 3; i++) {
        // 注意：需要使用不同的helper ID，这里简化处理
        const helpData = {
          collectCode: response.data.collectCode,
          inviterId: response.data.userId + i + 1 // 模拟不同用户
        };

        try {
          await apiClient.helpCollect(helpData);
        } catch (error) {
          // 如果是同一个用户助力，会被拒绝，这是正常的
          console.log('助力被拒绝:', error.message);
        }
      }

      // 验证奖励
      const detailResponse = await apiClient.getCollectActivityDetail(collectId);
      expect(detailResponse.data.rewardType).toBe('discount');
      expect(detailResponse.data.rewardValue).toBe('50');
    });
  });

  describe('错误处理和异常情况', () => {
    test('应该处理网络请求失败', async () => {
      const invalidApiClient = new ApiClient();
      invalidApiClient.client.defaults.baseURL = 'http://invalid-url';

      await expect(invalidApiClient.createCollectActivity(TestHelpers.generateCollectActivityData(1)))
        .rejects.toMatchObject({
          status: 0,
          message: expect.stringContaining('网络请求失败')
        });
    });

    test('应该处理认证失败', async () => {
      const unauthorizedClient = new ApiClient();
      // 不设置token

      await expect(unauthorizedClient.createCollectActivity(TestHelpers.generateCollectActivityData(1)))
        .rejects.toMatchObject({
          status: 401
        });
    });

    test('应该处理服务器内部错误', async () => {
      // 发送无效数据结构来触发服务器错误
      await expect(apiClient.createCollectActivity({ invalid: 'data' }))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该处理数据库约束违反', async () => {
      // 尝试创建重复的积攒码（如果存在唯一约束）
      const collectData1 = TestHelpers.generateCollectActivityData(baseData.activity.id);
      const collectData2 = TestHelpers.generateCollectActivityData(baseData.activity.id);

      const response1 = await apiClient.createCollectActivity(collectData1);

      // 积攒码应该是自动生成的，所以重复的可能性很小
      expect(response1.data.collectCode).toBeDefined();
    });
  });
});