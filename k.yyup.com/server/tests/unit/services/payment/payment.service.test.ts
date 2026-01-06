import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
const mockPaymentModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn(),
  sum: jest.fn()
};

const mockTransactionModel = {
  create: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn()
};

const mockUserModel = {
  findByPk: jest.fn()
};

const mockWeChatPayService = {
  createOrder: jest.fn(),
  queryOrder: jest.fn(),
  refund: jest.fn(),
  verifySignature: jest.fn()
};

const mockAlipayService = {
  createOrder: jest.fn(),
  queryOrder: jest.fn(),
  refund: jest.fn(),
  verifySignature: jest.fn()
};

const mockBankService = {
  createTransfer: jest.fn(),
  queryTransfer: jest.fn(),
  verifyCallback: jest.fn()
};

const mockNotificationService = {
  createNotification: jest.fn(),
  sendNotification: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  incr: jest.fn(),
  decr: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/models/payment.model', () => ({
  default: mockPaymentModel
}));

jest.unstable_mockModule('../../../../../../src/models/transaction.model', () => ({
  default: mockTransactionModel
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  default: mockUserModel
}));

jest.unstable_mockModule('../../../../../../src/services/payment/wechat-pay.service', () => ({
  default: mockWeChatPayService
}));

jest.unstable_mockModule('../../../../../../src/services/payment/alipay.service', () => ({
  default: mockAlipayService
}));

jest.unstable_mockModule('../../../../../../src/services/payment/bank.service', () => ({
  default: mockBankService
}));

jest.unstable_mockModule('../../../../../../src/services/notification/notification.service', () => ({
  default: mockNotificationService
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/config/redis', () => ({
  default: mockRedisClient
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
}));


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('PaymentService', () => {
  let paymentService: any;
  let mockTransaction: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/payment/payment.service');
    paymentService = imported.default || imported.PaymentService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock database transaction
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('创建支付订单', () => {
    it('应该创建微信支付订单', async () => {
      const paymentData = {
        userId: 1,
        amount: 3000.00,
        description: '学费支付',
        method: 'wechat_pay',
        orderType: 'tuition',
        studentId: 1
      };

      const mockPayment = {
        id: 1,
        ...paymentData,
        status: 'pending',
        paymentId: 'PAY-001',
        createdAt: new Date()
      };

      const mockWeChatOrder = {
        prepayId: 'wx123456789',
        codeUrl: 'weixin://wxpay/bizpayurl?pr=abc123',
        paymentId: 'wx_pay_001'
      };

      mockPaymentModel.create.mockResolvedValue(mockPayment);
      mockWeChatPayService.createOrder.mockResolvedValue(mockWeChatOrder);
      mockUserModel.findByPk.mockResolvedValue({
        id: 1,
        name: '张三',
        phone: '13800138000'
      });

      const result = await paymentService.createPayment(paymentData);

      expect(mockPaymentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...paymentData,
          status: 'pending'
        }),
        { transaction: mockTransaction }
      );
      expect(mockWeChatPayService.createOrder).toHaveBeenCalledWith({
        amount: 3000.00,
        description: '学费支付',
        outTradeNo: expect.any(String),
        userId: 1
      });
      expect(result.payment).toEqual(mockPayment);
      expect(result.paymentInfo).toEqual(mockWeChatOrder);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该创建支付宝订单', async () => {
      const paymentData = {
        userId: 1,
        amount: 2500.00,
        description: '餐费支付',
        method: 'alipay',
        orderType: 'meal'
      };

      const mockPayment = {
        id: 2,
        ...paymentData,
        status: 'pending',
        paymentId: 'PAY-002'
      };

      const mockAlipayOrder = {
        tradeNo: 'alipay123456789',
        qrCode: 'https://qr.alipay.com/bax123456',
        paymentUrl: 'https://openapi.alipay.com/gateway.do?...'
      };

      mockPaymentModel.create.mockResolvedValue(mockPayment);
      mockAlipayService.createOrder.mockResolvedValue(mockAlipayOrder);

      const result = await paymentService.createPayment(paymentData);

      expect(mockAlipayService.createOrder).toHaveBeenCalledWith({
        amount: 2500.00,
        description: '餐费支付',
        outTradeNo: expect.any(String),
        userId: 1
      });
      expect(result.payment).toEqual(mockPayment);
      expect(result.paymentInfo).toEqual(mockAlipayOrder);
    });

    it('应该创建银行转账订单', async () => {
      const paymentData = {
        userId: 1,
        amount: 5000.00,
        description: '活动费支付',
        method: 'bank_transfer',
        orderType: 'activity'
      };

      const mockPayment = {
        id: 3,
        ...paymentData,
        status: 'pending',
        paymentId: 'PAY-003'
      };

      const mockBankOrder = {
        accountNumber: '6222021234567890',
        accountName: '阳光幼儿园',
        bankName: '中国工商银行',
        reference: 'REF-003'
      };

      mockPaymentModel.create.mockResolvedValue(mockPayment);
      mockBankService.createTransfer.mockResolvedValue(mockBankOrder);

      const result = await paymentService.createPayment(paymentData);

      expect(mockBankService.createTransfer).toHaveBeenCalled();
      expect(result.payment).toEqual(mockPayment);
      expect(result.paymentInfo).toEqual(mockBankOrder);
    });

    it('应该验证支付数据', async () => {
      const invalidData = {
        amount: -100, // 负数金额
        description: '', // 空描述
        method: 'invalid_method' // 无效支付方式
      };

      await expect(paymentService.createPayment(invalidData))
        .rejects.toThrow('Invalid payment data');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Payment creation failed',
        expect.any(Object)
      );
    });

    it('应该处理第三方支付服务错误', async () => {
      const paymentData = {
        userId: 1,
        amount: 1000.00,
        description: '测试支付',
        method: 'wechat_pay'
      };

      mockPaymentModel.create.mockResolvedValue({ id: 1 });
      mockWeChatPayService.createOrder.mockRejectedValue(
        new Error('WeChat Pay service unavailable')
      );

      await expect(paymentService.createPayment(paymentData))
        .rejects.toThrow('WeChat Pay service unavailable');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('支付状态查询', () => {
    it('应该查询微信支付状态', async () => {
      const mockPayment = {
        id: 1,
        method: 'wechat_pay',
        paymentId: 'wx_pay_001',
        status: 'pending',
        update: jest.fn()
      };

      const mockWeChatStatus = {
        tradeState: 'SUCCESS',
        transactionId: 'wx_transaction_123',
        paidAt: new Date()
      };

      mockPaymentModel.findByPk.mockResolvedValue(mockPayment);
      mockWeChatPayService.queryOrder.mockResolvedValue(mockWeChatStatus);

      const result = await paymentService.queryPaymentStatus(1);

      expect(mockWeChatPayService.queryOrder).toHaveBeenCalledWith('wx_pay_001');
      expect(mockPayment.update).toHaveBeenCalledWith({
        status: 'completed',
        thirdPartyTransactionId: 'wx_transaction_123',
        paidAt: mockWeChatStatus.paidAt
      });
      expect(result.status).toBe('completed');
    });

    it('应该查询支付宝支付状态', async () => {
      const mockPayment = {
        id: 2,
        method: 'alipay',
        paymentId: 'alipay_001',
        status: 'pending',
        update: jest.fn()
      };

      const mockAlipayStatus = {
        tradeStatus: 'TRADE_SUCCESS',
        tradeNo: 'alipay_transaction_123',
        gmtPayment: new Date()
      };

      mockPaymentModel.findByPk.mockResolvedValue(mockPayment);
      mockAlipayService.queryOrder.mockResolvedValue(mockAlipayStatus);

      const result = await paymentService.queryPaymentStatus(2);

      expect(mockAlipayService.queryOrder).toHaveBeenCalledWith('alipay_001');
      expect(mockPayment.update).toHaveBeenCalledWith({
        status: 'completed',
        thirdPartyTransactionId: 'alipay_transaction_123',
        paidAt: mockAlipayStatus.gmtPayment
      });
      expect(result.status).toBe('completed');
    });

    it('应该处理支付失败状态', async () => {
      const mockPayment = {
        id: 3,
        method: 'wechat_pay',
        paymentId: 'wx_pay_002',
        status: 'pending',
        update: jest.fn()
      };

      const mockWeChatStatus = {
        tradeState: 'PAYERROR',
        errCode: 'INSUFFICIENT_FUNDS',
        errCodeDes: '余额不足'
      };

      mockPaymentModel.findByPk.mockResolvedValue(mockPayment);
      mockWeChatPayService.queryOrder.mockResolvedValue(mockWeChatStatus);

      const result = await paymentService.queryPaymentStatus(3);

      expect(mockPayment.update).toHaveBeenCalledWith({
        status: 'failed',
        failureReason: '余额不足'
      });
      expect(result.status).toBe('failed');
    });
  });

  describe('支付回调处理', () => {
    it('应该处理微信支付回调', async () => {
      const callbackData = {
        outTradeNo: 'PAY-001',
        transactionId: 'wx_transaction_123',
        totalFee: 300000, // 分为单位
        resultCode: 'SUCCESS',
        timeEnd: '20240315120000'
      };

      const mockPayment = {
        id: 1,
        amount: 3000.00,
        userId: 1,
        status: 'pending',
        update: jest.fn(),
        save: jest.fn()
      };

      mockWeChatPayService.verifySignature.mockReturnValue(true);
      mockPaymentModel.findOne.mockResolvedValue(mockPayment);
      mockTransactionModel.create.mockResolvedValue({
        id: 1,
        paymentId: 1,
        amount: 3000.00,
        type: 'payment'
      });

      const result = await paymentService.handlePaymentCallback('wechat_pay', callbackData);

      expect(mockWeChatPayService.verifySignature).toHaveBeenCalledWith(callbackData);
      expect(mockPayment.update).toHaveBeenCalledWith({
        status: 'completed',
        thirdPartyTransactionId: 'wx_transaction_123',
        paidAt: expect.any(Date)
      });
      expect(mockTransactionModel.create).toHaveBeenCalledWith({
        paymentId: 1,
        amount: 3000.00,
        type: 'payment',
        status: 'completed',
        thirdPartyTransactionId: 'wx_transaction_123'
      });
      expect(result.success).toBe(true);
    });

    it('应该处理支付宝回调', async () => {
      const callbackData = {
        outTradeNo: 'PAY-002',
        tradeNo: 'alipay_transaction_123',
        totalAmount: '2500.00',
        tradeStatus: 'TRADE_SUCCESS',
        gmtPayment: '2024-03-15 12:00:00'
      };

      const mockPayment = {
        id: 2,
        amount: 2500.00,
        userId: 1,
        status: 'pending',
        update: jest.fn()
      };

      mockAlipayService.verifySignature.mockReturnValue(true);
      mockPaymentModel.findOne.mockResolvedValue(mockPayment);

      const result = await paymentService.handlePaymentCallback('alipay', callbackData);

      expect(mockAlipayService.verifySignature).toHaveBeenCalledWith(callbackData);
      expect(mockPayment.update).toHaveBeenCalledWith({
        status: 'completed',
        thirdPartyTransactionId: 'alipay_transaction_123',
        paidAt: expect.any(Date)
      });
      expect(result.success).toBe(true);
    });

    it('应该验证回调签名', async () => {
      const callbackData = {
        outTradeNo: 'PAY-003',
        signature: 'invalid_signature'
      };

      mockWeChatPayService.verifySignature.mockReturnValue(false);

      const result = await paymentService.handlePaymentCallback('wechat_pay', callbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid signature');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Payment callback signature verification failed',
        expect.any(Object)
      );
    });

    it('应该处理重复回调', async () => {
      const callbackData = {
        outTradeNo: 'PAY-004',
        transactionId: 'wx_transaction_456'
      };

      const mockPayment = {
        id: 4,
        status: 'completed', // 已经完成的支付
        thirdPartyTransactionId: 'wx_transaction_456'
      };

      mockWeChatPayService.verifySignature.mockReturnValue(true);
      mockPaymentModel.findOne.mockResolvedValue(mockPayment);

      const result = await paymentService.handlePaymentCallback('wechat_pay', callbackData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment already processed');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Duplicate payment callback received',
        expect.any(Object)
      );
    });
  });

  describe('退款处理', () => {
    it('应该处理微信支付退款', async () => {
      const refundData = {
        paymentId: 1,
        amount: 1000.00,
        reason: '学生转学',
        operatorId: 1
      };

      const mockPayment = {
        id: 1,
        amount: 3000.00,
        method: 'wechat_pay',
        thirdPartyTransactionId: 'wx_transaction_123',
        status: 'completed'
      };

      const mockRefundResult = {
        refundId: 'wx_refund_123',
        refundFee: 100000, // 分为单位
        status: 'SUCCESS'
      };

      mockPaymentModel.findByPk.mockResolvedValue(mockPayment);
      mockWeChatPayService.refund.mockResolvedValue(mockRefundResult);
      mockTransactionModel.create.mockResolvedValue({
        id: 2,
        paymentId: 1,
        amount: -1000.00,
        type: 'refund'
      });

      const result = await paymentService.processRefund(refundData);

      expect(mockWeChatPayService.refund).toHaveBeenCalledWith({
        transactionId: 'wx_transaction_123',
        refundAmount: 1000.00,
        totalAmount: 3000.00,
        refundReason: '学生转学'
      });
      expect(mockTransactionModel.create).toHaveBeenCalledWith({
        paymentId: 1,
        amount: -1000.00,
        type: 'refund',
        status: 'completed',
        thirdPartyTransactionId: 'wx_refund_123',
        description: '学生转学',
        operatorId: 1
      });
      expect(result.success).toBe(true);
      expect(result.refundId).toBe('wx_refund_123');
    });

    it('应该验证退款金额', async () => {
      const refundData = {
        paymentId: 1,
        amount: 5000.00, // 超过原支付金额
        reason: '测试退款'
      };

      const mockPayment = {
        id: 1,
        amount: 3000.00,
        status: 'completed'
      };

      mockPaymentModel.findByPk.mockResolvedValue(mockPayment);

      await expect(paymentService.processRefund(refundData))
        .rejects.toThrow('Refund amount exceeds payment amount');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Invalid refund amount',
        expect.any(Object)
      );
    });

    it('应该检查支付状态', async () => {
      const refundData = {
        paymentId: 1,
        amount: 1000.00,
        reason: '测试退款'
      };

      const mockPayment = {
        id: 1,
        amount: 3000.00,
        status: 'pending' // 未完成的支付
      };

      mockPaymentModel.findByPk.mockResolvedValue(mockPayment);

      await expect(paymentService.processRefund(refundData))
        .rejects.toThrow('Payment not completed');
    });
  });

  describe('支付统计', () => {
    it('应该获取支付统计数据', async () => {
      const dateRange = {
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31')
      };

      mockPaymentModel.count.mockImplementation(({ where }) => {
        if (where.status === 'completed') return Promise.resolve(150);
        if (where.status === 'failed') return Promise.resolve(10);
        return Promise.resolve(180);
      });

      mockPaymentModel.sum.mockImplementation((field, { where }) => {
        if (where.status === 'completed') return Promise.resolve(450000.00);
        return Promise.resolve(0);
      });

      const result = await paymentService.getPaymentStatistics(dateRange);

      expect(result).toEqual({
        totalPayments: 180,
        completedPayments: 150,
        failedPayments: 10,
        pendingPayments: 20,
        totalAmount: 450000.00,
        successRate: 0.833,
        averageAmount: 3000.00
      });
    });

    it('应该获取支付方式统计', async () => {
      mockPaymentModel.findAll.mockResolvedValue([
        { method: 'wechat_pay', count: 80, totalAmount: 240000.00 },
        { method: 'alipay', count: 50, totalAmount: 150000.00 },
        { method: 'bank_transfer', count: 20, totalAmount: 60000.00 }
      ]);

      const result = await paymentService.getPaymentMethodStatistics();

      expect(result).toEqual([
        { method: 'wechat_pay', count: 80, totalAmount: 240000.00, percentage: 0.533 },
        { method: 'alipay', count: 50, totalAmount: 150000.00, percentage: 0.333 },
        { method: 'bank_transfer', count: 20, totalAmount: 60000.00, percentage: 0.133 }
      ]);
    });
  });

  describe('支付查询', () => {
    it('应该获取用户支付记录', async () => {
      const mockPayments = [
        {
          id: 1,
          amount: 3000.00,
          description: '学费支付',
          method: 'wechat_pay',
          status: 'completed',
          createdAt: new Date()
        },
        {
          id: 2,
          amount: 2500.00,
          description: '餐费支付',
          method: 'alipay',
          status: 'completed',
          createdAt: new Date()
        }
      ];

      mockPaymentModel.findAndCountAll.mockResolvedValue({
        rows: mockPayments,
        count: 2
      });

      const result = await paymentService.getUserPayments(1, {
        page: 1,
        pageSize: 10
      });

      expect(mockPaymentModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });
      expect(result.payments).toEqual(mockPayments);
      expect(result.total).toBe(2);
    });

    it('应该支持状态筛选', async () => {
      mockPaymentModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0
      });

      await paymentService.getUserPayments(1, {
        status: 'completed',
        page: 1,
        pageSize: 10
      });

      expect(mockPaymentModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1, status: 'completed' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });
    });

    it('应该支持支付方式筛选', async () => {
      mockPaymentModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0
      });

      await paymentService.getUserPayments(1, {
        method: 'wechat_pay',
        page: 1,
        pageSize: 10
      });

      expect(mockPaymentModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1, method: 'wechat_pay' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });
    });
  });

  describe('支付通知', () => {
    it('应该发送支付成功通知', async () => {
      const payment = {
        id: 1,
        userId: 1,
        amount: 3000.00,
        description: '学费支付',
        status: 'completed'
      };

      mockNotificationService.createNotification.mockResolvedValue({
        id: 1,
        userId: 1,
        title: '支付成功',
        content: '您的学费支付已成功完成'
      });

      await paymentService.sendPaymentNotification(payment, 'success');

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 1,
        title: '支付成功',
        content: expect.stringContaining('学费支付'),
        type: 'payment',
        priority: 'normal',
        channels: ['app', 'sms']
      });
    });

    it('应该发送支付失败通知', async () => {
      const payment = {
        id: 2,
        userId: 1,
        amount: 2500.00,
        description: '餐费支付',
        status: 'failed',
        failureReason: '余额不足'
      };

      await paymentService.sendPaymentNotification(payment, 'failed');

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 1,
        title: '支付失败',
        content: expect.stringContaining('余额不足'),
        type: 'payment',
        priority: 'high',
        channels: ['app', 'sms']
      });
    });
  });

  describe('支付安全', () => {
    it('应该检测异常支付行为', async () => {
      const paymentData = {
        userId: 1,
        amount: 50000.00, // 异常大额
        method: 'wechat_pay'
      };

      mockRedisClient.get.mockResolvedValue('5'); // 短时间内多次支付

      const result = await paymentService.checkPaymentSecurity(paymentData);

      expect(result.isRisky).toBe(true);
      expect(result.riskFactors).toContain('large_amount');
      expect(result.riskFactors).toContain('frequent_payments');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Risky payment detected',
        expect.any(Object)
      );
    });

    it('应该限制支付频率', async () => {
      const userId = 1;
      const key = `payment_frequency:${userId}`;

      mockRedisClient.get.mockResolvedValue('10'); // 超过限制

      const result = await paymentService.checkPaymentFrequency(userId);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeDefined();
    });

    it('应该记录支付日志', async () => {
      const paymentData = {
        userId: 1,
        amount: 1000.00,
        method: 'alipay',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...'
      };

      await paymentService.logPaymentActivity(paymentData);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Payment activity logged',
        expect.objectContaining({
          userId: 1,
          amount: 1000.00,
          method: 'alipay',
          ipAddress: '192.168.1.100'
        })
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库错误', async () => {
      mockPaymentModel.create.mockRejectedValue(new Error('Database error'));

      await expect(paymentService.createPayment({
        userId: 1,
        amount: 1000.00,
        method: 'wechat_pay'
      })).rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Payment creation failed',
        expect.any(Object)
      );
    });

    it('应该处理支付不存在的情况', async () => {
      mockPaymentModel.findByPk.mockResolvedValue(null);

      await expect(paymentService.queryPaymentStatus(999))
        .rejects.toThrow('Payment not found');
    });

    it('应该处理第三方服务错误', async () => {
      const paymentData = {
        userId: 1,
        amount: 1000.00,
        method: 'wechat_pay'
      };

      mockPaymentModel.create.mockResolvedValue({ id: 1 });
      mockWeChatPayService.createOrder.mockRejectedValue(
        new Error('Service temporarily unavailable')
      );

      await expect(paymentService.createPayment(paymentData))
        .rejects.toThrow('Service temporarily unavailable');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('性能优化', () => {
    it('应该缓存支付配置', async () => {
      const config = {
        wechat_pay: { enabled: true, appId: 'wx123' },
        alipay: { enabled: true, appId: 'alipay123' }
      };

      mockRedisClient.get.mockResolvedValueOnce(null);
      mockRedisClient.set.mockResolvedValue('OK');

      // 第一次调用，从数据库获取并缓存
      await paymentService.getPaymentConfig();
      
      // 第二次调用，从缓存获取
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(config));
      const result = await paymentService.getPaymentConfig();

      expect(result).toEqual(config);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(2);
    });

    it('应该批量处理支付状态更新', async () => {
      const paymentIds = [1, 2, 3, 4, 5];
      const payments = paymentIds.map(id => ({
        id,
        method: 'wechat_pay',
        paymentId: `wx_pay_${id}`,
        status: 'pending',
        update: jest.fn()
      }));

      mockPaymentModel.findAll.mockResolvedValue(payments);
      mockWeChatPayService.queryOrder.mockResolvedValue({
        tradeState: 'SUCCESS',
        transactionId: 'wx_transaction_123'
      });

      const result = await paymentService.batchUpdatePaymentStatus(paymentIds);

      expect(result.updated).toBe(5);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Batch payment status updated',
        expect.objectContaining({ count: 5 })
      );
    });
  });
});
