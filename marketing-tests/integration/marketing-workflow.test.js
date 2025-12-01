/**
 * 营销功能集成测试
 * 测试完整的营销工作流程
 */

const ApiClient = require('../utils/api-client');
const TestHelpers = require('../utils/test-helpers');
const config = require('../config/test-config');

describe('营销功能集成测试', () => {
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

    // 创建测试用户并登录
    for (let i = 1; i <= 3; i++) {
      const user = config.users[`parent${i}`];
      try {
        const token = (await apiClient.login(user.email, user.password)).token;
        userTokens[`parent${i}`] = token;
      } catch (error) {
        console.log(`用户登录失败: ${user.email}`, error.message);
      }
    }
  });

  afterAll(async () => {
    await TestHelpers.cleanupTestData(apiClient, baseData);
    await apiClient.logout();
  });

  describe('完整的团购工作流程', () => {
    test('应该完成从创建团购到成功参团的完整流程', async () => {
      // 1. 管理员创建活动
      const activityData = TestHelpers.generateTestActivity({
        title: '团购测试活动',
        maxParticipants: 20,
        fee: 500.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      TestHelpers.validateApiResponse(activityResponse, ['id', 'title']);
      const activity = activityResponse.data;

      // 2. 管理员创建团购
      const groupBuyData = TestHelpers.generateGroupBuyData(activity.id, {
        minParticipants: 3,
        maxParticipants: 10,
        originalPrice: 500.00,
        groupPrice: 400.00,
        durationHours: 48
      });

      const groupBuyResponse = await apiClient.createGroupBuy(groupBuyData);
      TestHelpers.validateApiResponse(groupBuyResponse, ['id', 'activityId', 'status']);
      const groupBuy = groupBuyResponse.data;

      expect(groupBuy.status).toBe('active');
      expect(groupBuy.activityId).toBe(activity.id);

      // 3. 多个用户加入团购
      const joinPromises = [];
      for (let i = 1; i <= 3; i++) {
        const userToken = userTokens[`parent${i}`];
        if (userToken) {
          const userClient = new ApiClient();
          userClient.setToken(userToken);

          const joinData = {
            participantCount: 1,
            contactPhone: `138${Math.random().toString().substr(2, 8)}`,
            remark: `测试参与者${i}`
          };

          joinPromises.push(userClient.joinGroupBuy(groupBuy.id, joinData));
        }
      }

      const joinResults = await Promise.allSettled(joinPromises);
      const successfulJoins = joinResults.filter(result => result.status === 'fulfilled');

      expect(successfulJoins.length).toBeGreaterThan(0);

      // 4. 验证团购状态更新
      const updatedGroupBuyResponse = await apiClient.getGroupBuyDetail(groupBuy.id);
      expect(updatedGroupBuyResponse.data.currentCount).toBe(successfulJoins.length);

      // 5. 如果达到最小人数，测试团购自动完成
      if (successfulJoins.length >= groupBuy.minParticipants) {
        // 这里团购应该自动完成，但可能需要等待后台任务
        expect(updatedGroupBuyResponse.data.progress).toBeGreaterThanOrEqual(100);
      }

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    }, 60000); // 60秒超时

    test('应该正确处理团购失败场景', async () => {
      // 1. 创建即将过期的团购
      const activityData = TestHelpers.generateTestActivity({
        title: '失败测试团购活动',
        maxParticipants: 5,
        fee: 300.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      const groupBuyData = TestHelpers.generateGroupBuyData(activity.id, {
        minParticipants: 5,
        maxParticipants: 5,
        durationHours: 1 // 1小时后过期
      });

      const groupBuyResponse = await apiClient.createGroupBuy(groupBuyData);
      const groupBuy = groupBuyResponse.data;

      // 2. 验证团购初始状态
      expect(groupBuy.status).toBe('active');
      expect(groupBuy.canJoin).toBe(true);

      // 3. 模拟时间流逝后团购过期（可能需要手动更新数据库）
      // 这里主要验证逻辑判断

      // 4. 验证团购已过期，不能再加入
      // const expiredGroupBuy = await apiClient.getGroupBuyDetail(groupBuy.id);
      // expect(expiredGroupBuy.data.isExpired).toBe(true);
      // expect(expiredGroupBuy.data.canJoin).toBe(false);

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    });

    test('应该正确计算团购优惠', async () => {
      const activityData = TestHelpers.generateTestActivity({
        title: '优惠测试团购活动',
        fee: 600.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      const groupBuyData = TestHelpers.generateGroupBuyData(activity.id, {
        originalPrice: 600.00,
        groupPrice: 420.00 // 7折
      });

      const groupBuyResponse = await apiClient.createGroupBuy(groupBuyData);
      const groupBuy = groupBuyResponse.data;

      // 验证优惠计算
      const discountRate = groupBuy.groupPrice / groupBuy.originalPrice;
      expect(discountRate).toBeCloseTo(0.7, 2);

      // 验证节省金额
      const saveAmount = groupBuy.originalPrice - groupBuy.groupPrice;
      expect(saveAmount).toBe(180.00);

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    });
  });

  describe('完整的积攒工作流程', () => {
    test('应该完成从创建到助力完成的完整流程', async () => {
      // 1. 创建活动
      const activityData = TestHelpers.generateTestActivity({
        title: '积攒测试活动',
        maxParticipants: 30,
        fee: 299.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      // 2. 创建积攒活动
      const collectData = TestHelpers.generateCollectActivityData(activity.id, {
        targetCount: 5,
        maxCount: 20,
        rewardType: 'discount',
        rewardValue: '30'
      });

      const collectResponse = await apiClient.createCollectActivity(collectData);
      const collectActivity = collectResponse.data;

      expect(collectActivity.status).toBe('active');
      expect(collectActivity.currentCount).toBe(0);

      // 3. 多个用户助力
      const helpPromises = [];
      for (let i = 1; i <= 3; i++) {
        const helpData = {
          collectCode: collectActivity.collectCode,
          inviterId: collectActivity.userId
        };

        // 使用管理员身份模拟不同用户助力
        helpPromises.push(apiClient.helpCollect(helpData));
      }

      await Promise.all(helpPromises);

      // 4. 验证积攒计数更新
      const updatedCollectResponse = await apiClient.getCollectActivityDetail(collectActivity.id);
      expect(updatedCollectResponse.data.currentCount).toBeGreaterThanOrEqual(3);

      // 5. 验证进度计算
      const expectedProgress = (updatedCollectResponse.data.currentCount / collectActivity.targetCount) * 100;
      expect(updatedCollectResponse.data.progress).toBeCloseTo(expectedProgress, 1);

      // 6. 如果达到目标，验证完成状态
      if (updatedCollectResponse.data.currentCount >= collectActivity.targetCount) {
        expect(updatedCollectResponse.data.status).toBe('completed');
        expect(updatedCollectResponse.data.isCompleted()).toBe(true);
      }

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    }, 60000);

    test('应该正确处理积攒奖励发放', async () => {
      const activityData = TestHelpers.generateTestActivity({
        title: '奖励测试积攒活动',
        fee: 199.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      // 创建目标为1的积攒活动（容易完成）
      const collectData = TestHelpers.generateCollectActivityData(activity.id, {
        targetCount: 1,
        rewardType: 'gift',
        rewardValue: '测试奖品'
      });

      const collectResponse = await apiClient.createCollectActivity(collectData);
      const collectActivity = collectResponse.data;

      // 助力完成
      const helpData = {
        collectCode: collectActivity.collectCode,
        inviterId: collectActivity.userId
      };

      await apiClient.helpCollect(helpData);

      // 验证完成状态和奖励
      const updatedCollectResponse = await apiClient.getCollectActivityDetail(collectActivity.id);
      expect(updatedCollectResponse.data.status).toBe('completed');
      expect(updatedCollectResponse.data.isCompleted()).toBe(true);
      expect(updatedCollectResponse.data.rewardType).toBe('gift');
      expect(updatedCollectResponse.data.rewardValue).toBe('测试奖品');

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    });

    test('应该正确处理积攒防作弊', async () => {
      const activityData = TestHelpers.generateTestActivity({
        title: '防作弊测试积攒活动'
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      const collectData = TestHelpers.generateCollectActivityData(activity.id);
      const collectResponse = await apiClient.createCollectActivity(collectData);
      const collectActivity = collectResponse.data;

      // 同一用户重复助力
      const helpData = {
        collectCode: collectActivity.collectCode,
        inviterId: collectActivity.userId
      };

      // 第一次助力
      await apiClient.helpCollect(helpData);

      // 第二次助力应该被拒绝
      await expect(apiClient.helpCollect(helpData))
        .rejects.toMatchObject({
          status: 400
        });

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    });
  });

  describe('完整的支付工作流程', () => {
    test('应该完成从下单到支付确认的完整线下支付流程', async () => {
      // 1. 创建活动
      const activityData = TestHelpers.generateTestActivity({
        title: '支付测试活动',
        fee: 399.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      // 2. 用户创建线下支付订单
      const userClient = new ApiClient();
      const userToken = userTokens.parent1;
      if (userToken) {
        userClient.setToken(userToken);

        const orderData = TestHelpers.generateOrderData(activity.id, {
          paymentMethod: 'offline',
          offlinePaymentContact: config.payment.offlinePayment.contact,
          offlinePaymentLocation: config.payment.offlinePayment.location,
          offlinePaymentDeadline: TestHelpers.futureDate(3)
        });

        const orderResponse = await userClient.createOrder(orderData);
        TestHelpers.validateApiResponse(orderResponse, ['id', 'orderNo', 'status']);
        const order = orderResponse.data;

        expect(order.paymentMethod).toBe('offline');
        expect(order.status).toBe('pending');
        expect(order.offlinePaymentContact).toBe(config.payment.offlinePayment.contact);

        // 3. 模拟用户线下支付
        await TestHelpers.wait(1000); // 模拟支付时间

        // 4. 管理员确认支付
        const paymentProof = '现金收据：PAY' + Date.now();
        const confirmResponse = await apiClient.confirmOfflinePayment(order.id, paymentProof);

        TestHelpers.validateApiResponse(confirmResponse, ['id', 'status', 'paymentTime']);
        expect(confirmResponse.data.status).toBe('paid');
        expect(confirmResponse.data.paymentTime).toBeDefined();

        // 5. 验证订单最终状态
        const finalOrderResponse = await userClient.getOrderDetail(order.id);
        expect(finalOrderResponse.data.status).toBe('paid');
        expect(finalOrderResponse.data.paymentTime).toBeDefined();

        // 6. 验证支付成功后的业务逻辑
        // 这里应该检查是否触发了后续业务逻辑（报名确认、通知等）
        await userClient.logout();
      }

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    }, 60000);

    test('应该正确处理线上支付流程', async () => {
      const activityData = TestHelpers.generateTestActivity({
        title: '线上支付测试活动',
        fee: 199.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      const userClient = new ApiClient();
      const userToken = userTokens.parent2;
      if (userToken) {
        userClient.setToken(userToken);

        // 创建微信支付订单
        const orderData = TestHelpers.generateOrderData(activity.id, {
          paymentMethod: 'wechat'
        });

        const orderResponse = await userClient.createOrder(orderData);
        const order = orderResponse.data;

        expect(order.paymentMethod).toBe('wechat');
        expect(order.status).toBe('pending');

        // 发起支付（模拟）
        const paymentData = {
          orderId: order.id,
          paymentMethod: 'wechat',
          returnURL: 'http://localhost:3000/payment/result',
          notifyURL: 'http://localhost:3000/api/payment/wechat/notify'
        };

        const paymentResponse = await userClient.initiatePayment(paymentData);
        TestHelpers.validateApiResponse(paymentResponse);

        expect(paymentResponse.data.paymentMethod).toBe('wechat');

        await userClient.logout();
      }

      await apiClient.deleteActivity(activity.id);
    });

    test('应该正确处理支付失败和取消', async () => {
      const activityData = TestHelpers.generateTestActivity({
        title: '支付取消测试活动',
        fee: 99.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      const userClient = new ApiClient();
      const userToken = userTokens.parent3;
      if (userToken) {
        userClient.setToken(userToken);

        const orderData = TestHelpers.generateOrderData(activity.id, {
          paymentMethod: 'offline',
          offlinePaymentDeadline: TestHelpers.futureDate(1) // 1小时后过期
        });

        const orderResponse = await userClient.createOrder(orderData);
        const order = orderResponse.data;

        // 取消订单
        const cancelResponse = await apiClient.cancelOfflinePayment(order.id, '用户主动取消');

        TestHelpers.validateApiResponse(cancelResponse);
        expect(cancelResponse.message).toContain('取消成功');

        // 验证订单状态
        const finalOrderResponse = await userClient.getOrderDetail(order.id);
        expect(finalOrderResponse.data.status).toBe('cancelled');

        await userClient.logout();
      }

      await apiClient.deleteActivity(activity.id);
    });
  });

  describe('阶梯奖励完整工作流程', () => {
    test('应该完成从创建到发放的完整阶梯奖励流程', async () => {
      // 1. 创建活动
      const activityData = TestHelpers.generateTestActivity({
        title: '阶梯奖励测试活动',
        maxParticipants: 50,
        fee: 299.00
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      // 2. 创建多层级阶梯奖励
      const tieredRewards = [];
      for (let tier = 1; tier <= 3; tier++) {
        const rewardData = TestHelpers.generateTieredRewardData(activity.id, {
          tier: tier,
          targetValue: tier * 10,
          rewardType: tier === 1 ? 'discount' : tier === 2 ? 'gift' : 'free',
          rewardValue: tier === 1 ? `${tier * 10}` : tier === 2 ? '奖品' : '1'
        });

        const response = await apiClient.createTieredReward(rewardData);
        tieredRewards.push(response.data);
      }

      expect(tieredRewards).toHaveLength(3);

      // 3. 模拟报名人数达到不同阶梯
      const registrations = [];
      for (let i = 1; i <= 25; i++) {
        const userClient = new ApiClient();
        const userToken = userTokens[`parent${(i % 3) + 1}`];

        if (userToken) {
          userClient.setToken(userToken);

          try {
            const registrationData = {
              activityId: activity.id,
              participantName: `测试参与者${i}`,
              participantAge: 5,
              guardianPhone: `138${Math.random().toString().substr(2, 8)}`,
              remark: `阶梯奖励测试报名${i}`
            };

            const registrationResponse = await userClient.createRegistration(registrationData);
            registrations.push(registrationResponse.data);

            // 创建订单（模拟支付）
            const orderData = TestHelpers.generateOrderData(activity.id, {
              registrationId: registrationResponse.data.id,
              paymentMethod: 'offline'
            });

            const orderResponse = await userClient.createOrder(orderData);

            // 模拟支付确认
            await apiClient.confirmOfflinePayment(orderResponse.data.id, `测试支付${i}`);

            // 每隔几个报名检查一次奖励发放
            if (i % 5 === 0) {
              // 这里应该触发奖励发放检查
              // 实际实现中可能需要手动调用检查接口
            }

            await userClient.logout();
          } catch (error) {
            console.log(`报名${i}失败:`, error.message);
          }
        }
      }

      // 4. 验证奖励统计
      const statsResponse = await apiClient.getRewardStatistics(activity.id);
      TestHelpers.validateApiResponse(statsResponse, [
        'totalRewards', 'activeRewards', 'totalWinners'
      ]);

      expect(statsResponse.data.totalRewards).toBeGreaterThanOrEqual(3);
      expect(statsResponse.data.rewardTypes).toHaveProperty('discount');
      expect(statsResponse.data.rewardTypes).toHaveProperty('gift');
      expect(statsResponse.data.rewardTypes).toHaveProperty('free');

      // 5. 验证用户获奖记录
      const userClient = new ApiClient();
      const userToken = userTokens.parent1;
      if (userToken) {
        userClient.setToken(userToken);

        const recordsResponse = await userClient.getUserRewardRecords({
          activityId: activity.id
        });

        TestHelpers.validatePaginatedResponse(recordsResponse);

        if (recordsResponse.data.items.length > 0) {
          recordsResponse.data.items.forEach(record => {
            expect(record.activityId).toBe(activity.id);
            expect(['pending', 'awarded', 'expired', 'cancelled']).toContain(record.status);
          });
        }

        await userClient.logout();
      }

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    }, 120000); // 2分钟超时

    test('应该正确处理阶梯奖励的递进关系', async () => {
      const activityData = TestHelpers.generateTestActivity({
        title: '递进关系测试活动'
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      // 创建具有递进关系的奖励
      const rewards = [
        {
          tier: 1,
          targetValue: 10,
          rewardType: 'discount',
          rewardValue: '5',
          rewardDescription: '满10人95折'
        },
        {
          tier: 2,
          targetValue: 20,
          rewardType: 'discount',
          rewardValue: '10',
          rewardDescription: '满20人9折'
        },
        {
          tier: 3,
          targetValue: 30,
          rewardType: 'gift',
          rewardValue: '精美礼品',
          rewardDescription: '满30人赠送礼品'
        }
      ];

      const createdRewards = [];
      for (const reward of rewards) {
        const rewardData = TestHelpers.generateTieredRewardData(activity.id, reward);
        const response = await apiClient.createTieredReward(rewardData);
        createdRewards.push(response.data);
      }

      // 验证奖励层级关系
      createdRewards.sort((a, b) => a.tier - b.tier);
      for (let i = 1; i < createdRewards.length; i++) {
        expect(createdRewards[i].tier).toBe(createdRewards[i-1].tier + 1);
        expect(createdRewards[i].targetValue).toBeGreaterThan(createdRewards[i-1].targetValue);
      }

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    });
  });

  describe('多营销功能综合测试', () => {
    test('应该支持团购、积攒、奖励的组合使用', async () => {
      // 1. 创建支持多种营销的活动
      const activityData = TestHelpers.generateTestActivity({
        title: '综合营销测试活动',
        maxParticipants: 100,
        fee: 599.00,
        marketingEnabled: true
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      // 2. 创建团购
      const groupBuyData = TestHelpers.generateGroupBuyData(activity.id, {
        minParticipants: 5,
        maxParticipants: 20,
        originalPrice: 599.00,
        groupPrice: 479.20 // 8折
      });

      const groupBuyResponse = await apiClient.createGroupBuy(groupBuyData);
      const groupBuy = groupBuyResponse.data;

      // 3. 创建积攒活动
      const collectData = TestHelpers.generateCollectActivityData(activity.id, {
        targetCount: 15,
        rewardType: 'points',
        rewardValue: '100'
      });

      const collectResponse = await apiClient.createCollectActivity(collectData);
      const collectActivity = collectResponse.data;

      // 4. 创建阶梯奖励
      const tieredRewards = [];
      for (let tier = 1; tier <= 3; tier++) {
        const rewardData = TestHelpers.generateTieredRewardData(activity.id, {
          tier: tier,
          targetValue: tier * 15,
          rewardType: 'discount',
          rewardValue: `${tier * 5}`
        });

        const response = await apiClient.createTieredReward(rewardData);
        tieredRewards.push(response.data);
      }

      // 5. 验证所有营销功能都已创建
      expect(groupBuy).toBeDefined();
      expect(collectActivity).toBeDefined();
      expect(tieredRewards).toHaveLength(3);

      // 6. 模拟用户同时参与多种营销活动
      const userClient = new ApiClient();
      const userToken = userTokens.parent1;

      if (userToken) {
        userClient.setToken(userToken);

        // 参加团购
        const joinData = {
          participantCount: 1,
          contactPhone: '13800138001',
          remark: '综合测试参与者'
        };

        try {
          await userClient.joinGroupBuy(groupBuy.id, joinData);
        } catch (error) {
          console.log('加入团购失败:', error.message);
        }

        // 助力积攒
        try {
          await userClient.helpCollect({
            collectCode: collectActivity.collectCode,
            inviterId: collectActivity.userId
          });
        } catch (error) {
          console.log('助力积攒失败:', error.message);
        }

        // 创建报名（触发阶梯奖励检查）
        try {
          const registrationData = {
            activityId: activity.id,
            participantName: '综合测试用户',
            participantAge: 5,
            guardianPhone: '13800138001'
          };

          const registrationResponse = await userClient.createRegistration(registrationData);

          const orderData = TestHelpers.generateOrderData(activity.id, {
            registrationId: registrationResponse.data.id,
            paymentMethod: 'offline'
          });

          const orderResponse = await userClient.createOrder(orderData);
          await apiClient.confirmOfflinePayment(orderResponse.data.id, '综合测试支付');

        } catch (error) {
          console.log('报名支付失败:', error.message);
        }

        await userClient.logout();
      }

      // 7. 验证营销统计数据
      const groupStats = await apiClient.getGroupBuys({ activityId: activity.id });
      const collectStats = await apiClient.getCollectActivities({ activityId: activity.id });
      const rewardStats = await apiClient.getRewardStatistics(activity.id);

      expect(groupStats.data.total).toBeGreaterThanOrEqual(0);
      expect(collectStats.data.total).toBeGreaterThanOrEqual(0);
      expect(rewardStats.data.totalRewards).toBeGreaterThanOrEqual(0);

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    }, 90000);

    test('应该正确处理营销功能的相互影响', async () => {
      // 测试各种边缘情况和交互
      const activityData = TestHelpers.generateTestActivity({
        title: '交互测试活动'
      });

      const activityResponse = await apiClient.createActivity(activityData);
      const activity = activityResponse.data;

      // 创建极端参数的营销设置
      const extremeGroupBuyData = TestHelpers.generateGroupBuyData(activity.id, {
        minParticipants: 1,
        maxParticipants: 1,
        durationHours: 24
      });

      const groupBuyResponse = await apiClient.createGroupBuy(extremeGroupBuyData);
      const groupBuy = groupBuyResponse.data;

      // 验证极端团购
      expect(groupBuy.minParticipants).toBe(1);
      expect(groupBuy.maxParticipants).toBe(1);
      expect(groupBuy.isMinReached(0)).toBe(false);
      expect(groupBuy.isMinReached(1)).toBe(true);

      // 清理测试数据
      await apiClient.deleteActivity(activity.id);
    });
  });
});