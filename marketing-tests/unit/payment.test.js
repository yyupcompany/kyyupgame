/**
 * 支付功能单元测试
 */

const ApiClient = require('../utils/api-client');
const TestHelpers = require('../utils/test-helpers');
const config = require('../config/test-config');

describe('支付功能单元测试', () => {
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

  describe('订单创建功能', () => {
    test('应该成功创建线下支付订单', async () => {
      const orderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline',
        offlinePaymentContact: config.payment.offlinePayment.contact,
        offlinePaymentLocation: config.payment.offlinePayment.location,
        offlinePaymentDeadline: TestHelpers.futureDate(3)
      });

      const response = await apiClient.createOrder(orderData);

      TestHelpers.validateApiResponse(response, [
        'id', 'orderNo', 'userId', 'activityId', 'type',
        'originalAmount', 'finalAmount', 'status', 'paymentMethod',
        'offlinePaymentContact', 'offlinePaymentLocation', 'offlinePaymentDeadline'
      ]);

      expect(response.data.paymentMethod).toBe('offline');
      expect(response.data.status).toBe('pending');
      expect(response.data.originalAmount).toBe(299.00);
      expect(response.data.finalAmount).toBe(299.00);
      expect(response.data.offlinePaymentContact).toBe(config.payment.offlinePayment.contact);

      baseData.order = response.data;
    });

    test('应该成功创建微信支付订单', async () => {
      const orderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'wechat'
      });

      const response = await apiClient.createOrder(orderData);

      TestHelpers.validateApiResponse(response, ['id', 'orderNo', 'paymentMethod']);
      expect(response.data.paymentMethod).toBe('wechat');
    });

    test('应该成功创建支付宝支付订单', async () => {
      const orderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'alipay'
      });

      const response = await apiClient.createOrder(orderData);

      TestHelpers.validateApiResponse(response, ['id', 'orderNo', 'paymentMethod']);
      expect(response.data.paymentMethod).toBe('alipay');
    });

    test('应该拒绝无效的订单参数', async () => {
      const invalidOrderData = {
        activityId: -1, // 无效ID
        type: 'invalid', // 无效类型
        originalAmount: -100, // 无效金额
        paymentMethod: 'invalid' // 无效支付方式
      };

      await expect(apiClient.createOrder(invalidOrderData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该拒绝不存在的活动ID', async () => {
      const invalidOrderData = TestHelpers.generateOrderData(999999);

      await expect(apiClient.createOrder(invalidOrderData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('活动')
        });
    });
  });

  describe('线下支付功能', () => {
    test('应该成功确认线下支付', async () => {
      const paymentProof = '现金收据编号：CASH' + Date.now();

      const response = await apiClient.confirmOfflinePayment(baseData.order.id, paymentProof);

      TestHelpers.validateApiResponse(response, ['id', 'status', 'paymentTime']);

      expect(response.data.status).toBe('paid');
      expect(response.data.paymentTime).toBeDefined();
    });

    test('应该拒绝确认已支付的订单', async () => {
      await expect(apiClient.confirmOfflinePayment(baseData.order.id, '重复支付'))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('状态不支持')
        });
    });

    test('应该拒绝确认不存在的订单', async () => {
      await expect(apiClient.confirmOfflinePayment(999999, '测试凭证'))
        .rejects.toMatchObject({
          status: 404,
          message: expect.stringContaining('不存在')
        });
    });

    test('应该成功取消线下支付订单', async () => {
      // 先创建一个新的待支付订单
      const newOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline',
        offlinePaymentDeadline: TestHelpers.futureDate(3)
      });

      const orderResponse = await apiClient.createOrder(newOrderData);
      const orderId = orderResponse.data.id;

      // 取消订单
      const response = await apiClient.cancelOfflinePayment(orderId, '用户取消');

      TestHelpers.validateApiResponse(response);
      expect(response.message).toContain('取消成功');
    });

    test('应该拒绝取消已支付的订单', async () => {
      await expect(apiClient.cancelOfflinePayment(baseData.order.id, '测试取消'))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('状态不支持')
        });
    });
  });

  describe('订单查询功能', () => {
    test('应该成功获取订单列表', async () => {
      const response = await apiClient.getOrders({
        activityId: baseData.activity.id
      });

      TestHelpers.validatePaginatedResponse(response);
      expect(response.data.items.length).toBeGreaterThan(0);

      const order = response.data.items[0];
      expect(order.activityId).toBe(baseData.activity.id);
    });

    test('应该成功获取订单详情', async () => {
      const response = await apiClient.getOrderDetail(baseData.order.id);

      TestHelpers.validateApiResponse(response, [
        'id', 'orderNo', 'userId', 'activityId', 'type',
        'originalAmount', 'finalAmount', 'status', 'paymentMethod'
      ]);

      expect(response.data.id).toBe(baseData.order.id);
    });

    test('应该支持按支付方式过滤', async () => {
      const response = await apiClient.getOrders({
        paymentMethod: 'offline'
      });

      TestHelpers.validatePaginatedResponse(response);

      if (response.data.items.length > 0) {
        response.data.items.forEach(order => {
          expect(order.paymentMethod).toBe('offline');
        });
      }
    });

    test('应该支持按状态过滤', async () => {
      const response = await apiClient.getOrders({
        status: 'paid'
      });

      TestHelpers.validatePaginatedResponse(response);

      if (response.data.items.length > 0) {
        response.data.items.forEach(order => {
          expect(order.status).toBe('paid');
        });
      }
    });

    test('应该返回404对于不存在的订单', async () => {
      await expect(apiClient.getOrderDetail(999999))
        .rejects.toMatchObject({
          status: 404,
          message: expect.stringContaining('不存在')
        });
    });
  });

  describe('待确认线下支付查询', () => {
    test('应该成功获取待确认的线下支付订单', async () => {
      // 创建一个新的线下支付订单
      const pendingOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline'
      });

      await apiClient.createOrder(pendingOrderData);

      const response = await apiClient.getPendingOfflinePayments();

      TestHelpers.validatePaginatedResponse(response);

      // 验证返回的都是线下支付订单
      if (response.data.items.length > 0) {
        response.data.items.forEach(order => {
          expect(order.paymentMethod).toBe('offline');
        });
      }
    });

    test('应该支持分页查询待确认订单', async () => {
      const response = await apiClient.getPendingOfflinePayments({
        page: 1,
        pageSize: 10
      });

      TestHelpers.validatePaginatedResponse(response);
      expect(response.data.page).toBe(1);
      expect(response.data.pageSize).toBe(10);
    });
  });

  describe('支付参数验证', () => {
    test('应该验证支付金额合理性', async () => {
      const invalidOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        originalAmount: 0.001, // 太小
        paymentMethod: 'offline'
      });

      await expect(apiClient.createOrder(invalidOrderData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该验证折扣金额合理性', async () => {
      const invalidOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        originalAmount: 100,
        discountAmount: 150, // 折扣高于原价
        paymentMethod: 'offline'
      });

      await expect(apiClient.createOrder(invalidOrderData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该验证线下支付必需字段', async () => {
      const invalidOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline',
        offlinePaymentContact: null, // 缺少必需字段
        offlinePaymentLocation: null // 缺少必需字段
      });

      await expect(apiClient.createOrder(invalidOrderData))
        .rejects.toMatchObject({
          status: 400,
          message: expect.stringContaining('线下支付')
        });
    });

    test('应该验证支付截止时间', async () => {
      const invalidOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline',
        offlinePaymentDeadline: TestHelpers.pastDate(1) // 过期时间
      });

      // 这个验证可能在业务逻辑层面，而不是参数验证层面
      const response = await apiClient.createOrder(invalidOrderData);
      TestHelpers.validateApiResponse(response);

      // 验证订单确实过期
      expect(response.data.isOfflinePaymentExpired).toBe(true);
    });
  });

  describe('支付业务逻辑', () => {
    test('应该正确计算订单金额', async () => {
      const orderData = TestHelpers.generateOrderData(baseData.activity.id, {
        originalAmount: 300,
        discountAmount: 30,
        paymentMethod: 'offline'
      });

      const response = await apiClient.createOrder(orderData);

      expect(response.data.originalAmount).toBe(300);
      expect(response.data.discountAmount).toBe(30);
      expect(response.data.finalAmount).toBe(270);
    });

    test('应该正确生成订单号', async () => {
      const response = await apiClient.getOrderDetail(baseData.order.id);

      expect(response.data.orderNo).toMatch(/^ORDER\d{13,17}$/); // 订单号格式验证
      expect(response.data.orderNo.length).toBeGreaterThanOrEqual(14);
    });

    test('应该正确处理订单状态流转', async () => {
      // 创建新订单
      const newOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline'
      });

      const createResponse = await apiClient.createOrder(newOrderData);
      const orderId = createResponse.data.id;

      // 初始状态应该是pending
      expect(createResponse.data.status).toBe('pending');

      // 确认支付
      await apiClient.confirmOfflinePayment(orderId, '测试支付凭证');

      // 状态应该变为paid
      const detailResponse = await apiClient.getOrderDetail(orderId);
      expect(detailResponse.data.status).toBe('paid');
      expect(detailResponse.data.paymentTime).toBeDefined();
    });
  });

  describe('多支付方式测试', () => {
    test('应该支持多种支付方式', async () => {
      const paymentMethods = ['offline', 'wechat', 'alipay'];
      const responses = [];

      for (const method of paymentMethods) {
        const orderData = TestHelpers.generateOrderData(baseData.activity.id, {
          paymentMethod: method,
          ...(method === 'offline' && {
            offlinePaymentContact: '测试联系方式',
            offlinePaymentLocation: '测试地点'
          })
        });

        const response = await apiClient.createOrder(orderData);
        responses.push(response);
        expect(response.data.paymentMethod).toBe(method);
      }

      // 验证所有订单都创建成功
      expect(responses).toHaveLength(paymentMethods.length);
      responses.forEach(response => {
        TestHelpers.validateApiResponse(response, ['id', 'orderNo']);
      });
    });

    test('应该正确区分线上和线下支付', async () => {
      const onlineOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'wechat'
      });

      const offlineOrderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline',
        offlinePaymentContact: '测试联系方式'
      });

      const onlineResponse = await apiClient.createOrder(onlineOrderData);
      const offlineResponse = await apiClient.createOrder(offlineOrderData);

      // 线上支付订单不应有线下支付字段
      expect(onlineResponse.data.paymentMethod).toBe('wechat');
      expect(onlineResponse.data.offlinePaymentContact).toBeUndefined();

      // 线下支付订单应该有线下支付字段
      expect(offlineResponse.data.paymentMethod).toBe('offline');
      expect(offlineResponse.data.offlinePaymentContact).toBeDefined();
    });
  });

  describe('错误处理', () => {
    test('应该处理订单重复支付', async () => {
      const orderData = TestHelpers.generateOrderData(baseData.activity.id);
      const orderResponse = await apiClient.createOrder(orderData);

      // 尝试为已支付的订单创建另一个订单（模拟重复支付）
      const duplicateOrderData = {
        ...orderData,
        registrationId: orderResponse.data.id // 使用相同的活动ID和用户ID
      };

      await expect(apiClient.createOrder(duplicateOrderData))
        .rejects.toMatchObject({
          status: 400
        });
    });

    test('应该处理支付确认的并发请求', async () => {
      const orderData = TestHelpers.generateOrderData(baseData.activity.id, {
        paymentMethod: 'offline'
      });

      const orderResponse = await apiClient.createOrder(orderData);
      const orderId = orderResponse.data.id;

      // 并发确认支付
      const confirmPromises = Array(3).fill().map(() =>
        apiClient.confirmOfflinePayment(orderId, '并发测试' + Math.random())
      );

      const results = await Promise.allSettled(confirmPromises);
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      // 只有一个应该成功，其他的应该失败
      expect(successful).toHaveLength(1);
      expect(failed.length).toBeGreaterThan(0);
    });

    test('应该处理网络超时', async () => {
      // 模拟超时场景
      const timeoutClient = new ApiClient();
      timeoutClient.client.defaults.timeout = 1; // 1ms超时

      await expect(timeoutClient.createOrder(TestHelpers.generateOrderData(baseData.activity.id)))
        .rejects.toMatchObject({
          status: 0
        });
    });
  });
});