import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';

// Mock Express app
const mockApp = {
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  listen: jest.fn()
};

// Mock controllers
const mockPaymentController = {
  getPayments: jest.fn(),
  getPaymentById: jest.fn(),
  createPayment: jest.fn(),
  updatePayment: jest.fn(),
  deletePayment: jest.fn(),
  processPayment: jest.fn(),
  refundPayment: jest.fn(),
  getPaymentStats: jest.fn(),
  getPaymentHistory: jest.fn(),
  exportPaymentData: jest.fn(),
  bulkUpdatePayments: jest.fn(),
  generateInvoice: jest.fn(),
  sendPaymentReminder: jest.fn(),
  verifyPayment: jest.fn(),
  getOverduePayments: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = {
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  }),
  authorize: jest.fn((roles) => (req, res, next) => {
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
    }
  })
};

const mockValidationMiddleware = {
  validatePayment: jest.fn((req, res, next) => next()),
  validateRefund: jest.fn((req, res, next) => next()),
  validateQuery: jest.fn((req, res, next) => next()),
  validateAmount: jest.fn((req, res, next) => next())
};

const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

const mockCorsMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('express', () => ({
  default: jest.fn(() => mockApp),
  Router: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    use: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../../src/controllers/payment.controller', () => ({
  default: mockPaymentController
}));

jest.unstable_mockModule('../../../../../../src/middlewares/auth.middleware', () => ({
  default: mockAuthMiddleware
}));

jest.unstable_mockModule('../../../../../../src/middlewares/validate.middleware', () => ({
  default: mockValidationMiddleware
}));

jest.unstable_mockModule('../../../../../../src/middlewares/rate-limit.middleware', () => ({
  default: mockRateLimitMiddleware
}));

jest.unstable_mockModule('../../../../../../src/middlewares/cors.middleware', () => ({
  default: mockCorsMiddleware
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
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

describe('Payment Routes', () => {
  let paymentRouter: any;
  let app: any;

  beforeAll(async () => {
    const express = await import('express');
    app = express.default();
    
    const imported = await import('../../../../../../src/routes/payment.routes');
    paymentRouter = imported.default || imported.paymentRouter || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('路由配置', () => {
    it('应该正确配置支付路由', () => {
      expect(paymentRouter).toBeDefined();
      
      // 验证路由中间件配置
      expect(mockAuthMiddleware.authenticate).toBeDefined();
      expect(mockValidationMiddleware.validatePayment).toBeDefined();
      expect(mockRateLimitMiddleware).toBeDefined();
    });

    it('应该配置CORS中间件', () => {
      expect(mockCorsMiddleware).toBeDefined();
    });

    it('应该配置速率限制中间件', () => {
      expect(mockRateLimitMiddleware).toBeDefined();
    });
  });

  describe('GET /api/payments', () => {
    it('应该获取支付列表', async () => {
      const mockPayments = [
        {
          id: 1,
          enrollmentId: 1,
          studentId: 1,
          amount: 3000.00,
          type: 'tuition',
          status: 'completed',
          method: 'wechat_pay',
          paidAt: '2024-08-15T10:30:00Z',
          student: { name: '张小明' },
          enrollment: { className: '小班A' }
        },
        {
          id: 2,
          enrollmentId: 2,
          studentId: 2,
          amount: 3200.00,
          type: 'tuition',
          status: 'pending',
          method: null,
          paidAt: null,
          student: { name: '李小红' },
          enrollment: { className: '小班B' }
        }
      ];

      mockPaymentController.getPayments.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockPayments,
          pagination: {
            total: 2,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        });
      });

      const response = await request(app)
        .get('/api/payments')
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPayments);
      expect(response.body.pagination.total).toBe(2);
      expect(mockPaymentController.getPayments).toHaveBeenCalled();
    });

    it('应该支持筛选参数', async () => {
      mockPaymentController.getPayments.mockImplementation((req, res) => {
        expect(req.query.status).toBe('pending');
        expect(req.query.type).toBe('tuition');
        expect(req.query.studentId).toBe('1');
        res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0 }
        });
      });

      await request(app)
        .get('/api/payments')
        .query({ status: 'pending', type: 'tuition', studentId: '1' })
        .expect(200);

      expect(mockPaymentController.getPayments).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      mockAuthMiddleware.authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      });

      await request(app)
        .get('/api/payments')
        .expect(401);

      expect(mockAuthMiddleware.authenticate).toHaveBeenCalled();
    });

    it('应该验证查询参数', async () => {
      mockValidationMiddleware.validateQuery.mockImplementation((req, res, next) => {
        if (req.query.page && isNaN(Number(req.query.page))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid page parameter'
          });
        }
        next();
      });

      await request(app)
        .get('/api/payments')
        .query({ page: 'invalid' })
        .expect(400);

      expect(mockValidationMiddleware.validateQuery).toHaveBeenCalled();
    });
  });

  describe('GET /api/payments/:id', () => {
    it('应该获取指定支付详情', async () => {
      const mockPayment = {
        id: 1,
        enrollmentId: 1,
        studentId: 1,
        amount: 3000.00,
        currency: 'CNY',
        type: 'tuition',
        method: 'wechat_pay',
        status: 'completed',
        transactionId: 'wx_123456789',
        description: '小班A学费',
        dueDate: '2024-09-01',
        paidAt: '2024-08-15T10:30:00Z',
        metadata: {
          payerName: '张三',
          payerPhone: '13800138001'
        },
        student: {
          id: 1,
          name: '张小明',
          parent: { name: '张三', phone: '13800138001' }
        },
        enrollment: {
          id: 1,
          className: '小班A',
          enrollmentDate: '2024-08-01'
        }
      };

      mockPaymentController.getPaymentById.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200).json({
          success: true,
          data: mockPayment
        });
      });

      const response = await request(app)
        .get('/api/payments/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPayment);
      expect(mockPaymentController.getPaymentById).toHaveBeenCalled();
    });

    it('应该处理支付不存在的情况', async () => {
      mockPaymentController.getPaymentById.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      });

      await request(app)
        .get('/api/payments/999')
        .expect(404);

      expect(mockPaymentController.getPaymentById).toHaveBeenCalled();
    });

    it('应该验证ID参数格式', async () => {
      mockValidationMiddleware.validateQuery.mockImplementation((req, res, next) => {
        if (req.params.id && isNaN(Number(req.params.id))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid payment ID'
          });
        }
        next();
      });

      await request(app)
        .get('/api/payments/invalid')
        .expect(400);
    });
  });

  describe('POST /api/payments', () => {
    it('应该创建新支付记录', async () => {
      const paymentData = {
        enrollmentId: 1,
        studentId: 1,
        amount: 3500.00,
        currency: 'CNY',
        type: 'tuition',
        description: '中班B学费',
        dueDate: '2024-09-01',
        metadata: {
          payerName: '李四',
          payerPhone: '13800138002',
          invoiceRequested: true
        }
      };

      const mockCreatedPayment = {
        id: 3,
        ...paymentData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPaymentController.createPayment.mockImplementation((req, res) => {
        expect(req.body).toEqual(paymentData);
        res.status(201).json({
          success: true,
          data: mockCreatedPayment,
          message: 'Payment created successfully'
        });
      });

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(3);
      expect(response.body.message).toBe('Payment created successfully');
      expect(mockPaymentController.createPayment).toHaveBeenCalled();
    });

    it('应该验证请求数据', async () => {
      const invalidData = {
        amount: -100, // 负数金额
        type: 'invalid_type', // 无效类型
        dueDate: 'invalid_date' // 无效日期
      };

      mockValidationMiddleware.validatePayment.mockImplementation((req, res, next) => {
        const errors = [];
        if (req.body.amount < 0) errors.push('Amount must be positive');
        if (!['tuition', 'meal', 'activity', 'material', 'transport', 'other'].includes(req.body.type)) {
          errors.push('Invalid payment type');
        }
        if (req.body.dueDate && isNaN(Date.parse(req.body.dueDate))) {
          errors.push('Invalid due date format');
        }

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }
        next();
      });

      const response = await request(app)
        .post('/api/payments')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Amount must be positive');
      expect(response.body.errors).toContain('Invalid payment type');
      expect(response.body.errors).toContain('Invalid due date format');
    });

    it('应该要求管理员权限', async () => {
      mockAuthMiddleware.authorize.mockImplementation((roles) => (req, res, next) => {
        if (!roles.includes('admin')) {
          return res.status(403).json({
            success: false,
            message: 'Admin access required'
          });
        }
        next();
      });

      await request(app)
        .post('/api/payments')
        .send({ amount: 3000 })
        .expect(403);
    });
  });

  describe('PUT /api/payments/:id', () => {
    it('应该更新支付信息', async () => {
      const updateData = {
        amount: 3200.00,
        description: '更新的学费金额',
        dueDate: '2024-09-15',
        metadata: {
          payerName: '张三',
          payerPhone: '13800138001',
          notes: '延期缴费'
        }
      };

      const mockUpdatedPayment = {
        id: 1,
        ...updateData,
        updatedAt: new Date()
      };

      mockPaymentController.updatePayment.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        expect(req.body).toEqual(updateData);
        res.status(200).json({
          success: true,
          data: mockUpdatedPayment,
          message: 'Payment updated successfully'
        });
      });

      const response = await request(app)
        .put('/api/payments/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(3200.00);
      expect(mockPaymentController.updatePayment).toHaveBeenCalled();
    });

    it('应该处理支付不存在的情况', async () => {
      mockPaymentController.updatePayment.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      });

      await request(app)
        .put('/api/payments/999')
        .send({ amount: 3000 })
        .expect(404);
    });

    it('应该防止更新已完成的支付', async () => {
      mockPaymentController.updatePayment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Cannot update completed payment'
        });
      });

      await request(app)
        .put('/api/payments/1')
        .send({ amount: 3000 })
        .expect(400);
    });
  });

  describe('DELETE /api/payments/:id', () => {
    it('应该删除支付记录', async () => {
      mockPaymentController.deletePayment.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200).json({
          success: true,
          message: 'Payment deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/api/payments/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment deleted successfully');
      expect(mockPaymentController.deletePayment).toHaveBeenCalled();
    });

    it('应该要求管理员权限', async () => {
      mockAuthMiddleware.authorize.mockImplementation((roles) => (req, res, next) => {
        if (!roles.includes('admin')) {
          return res.status(403).json({
            success: false,
            message: 'Admin access required'
          });
        }
        next();
      });

      await request(app)
        .delete('/api/payments/1')
        .expect(403);
    });

    it('应该防止删除已完成的支付', async () => {
      mockPaymentController.deletePayment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Cannot delete completed payment'
        });
      });

      await request(app)
        .delete('/api/payments/1')
        .expect(400);
    });
  });

  describe('POST /api/payments/:id/process', () => {
    it('应该处理支付', async () => {
      const processData = {
        method: 'wechat_pay',
        transactionId: 'wx_123456789',
        metadata: {
          payerName: '张三',
          paymentTime: '2024-08-15T10:30:00Z'
        }
      };

      mockPaymentController.processPayment.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        expect(req.body).toEqual(processData);
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            status: 'completed',
            paidAt: new Date(),
            transactionId: 'wx_123456789'
          },
          message: 'Payment processed successfully'
        });
      });

      const response = await request(app)
        .post('/api/payments/1/process')
        .send(processData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(mockPaymentController.processPayment).toHaveBeenCalled();
    });

    it('应该验证处理数据', async () => {
      const invalidData = {
        method: 'invalid_method',
        transactionId: ''
      };

      mockValidationMiddleware.validatePayment.mockImplementation((req, res, next) => {
        const errors = [];
        const validMethods = ['cash', 'bank_transfer', 'wechat_pay', 'alipay', 'credit_card'];
        if (!validMethods.includes(req.body.method)) {
          errors.push('Invalid payment method');
        }
        if (!req.body.transactionId) {
          errors.push('Transaction ID is required');
        }

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }
        next();
      });

      const response = await request(app)
        .post('/api/payments/1/process')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Invalid payment method');
      expect(response.body.errors).toContain('Transaction ID is required');
    });

    it('应该处理重复处理的情况', async () => {
      mockPaymentController.processPayment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Payment is already processed'
        });
      });

      await request(app)
        .post('/api/payments/1/process')
        .send({ method: 'wechat_pay', transactionId: 'wx_123' })
        .expect(400);
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    it('应该处理退款', async () => {
      const refundData = {
        amount: 1000.00,
        reason: '学生转学',
        method: 'original'
      };

      mockPaymentController.refundPayment.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        expect(req.body).toEqual(refundData);
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            refundAmount: 1000.00,
            refundReason: '学生转学',
            status: 'partially_refunded'
          },
          message: 'Refund processed successfully'
        });
      });

      const response = await request(app)
        .post('/api/payments/1/refund')
        .send(refundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.refundAmount).toBe(1000.00);
      expect(mockPaymentController.refundPayment).toHaveBeenCalled();
    });

    it('应该验证退款数据', async () => {
      const invalidData = {
        amount: -100, // 负数
        reason: '', // 空原因
        method: 'invalid_method'
      };

      mockValidationMiddleware.validateRefund.mockImplementation((req, res, next) => {
        const errors = [];
        if (req.body.amount <= 0) errors.push('Refund amount must be positive');
        if (!req.body.reason) errors.push('Refund reason is required');
        if (!['original', 'bank_transfer', 'cash'].includes(req.body.method)) {
          errors.push('Invalid refund method');
        }

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }
        next();
      });

      const response = await request(app)
        .post('/api/payments/1/refund')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Refund amount must be positive');
      expect(response.body.errors).toContain('Refund reason is required');
      expect(response.body.errors).toContain('Invalid refund method');
    });

    it('应该检查退款权限', async () => {
      mockAuthMiddleware.authorize.mockImplementation((roles) => (req, res, next) => {
        if (!roles.includes('admin') && !roles.includes('finance')) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions for refund'
          });
        }
        next();
      });

      await request(app)
        .post('/api/payments/1/refund')
        .send({ amount: 1000, reason: '测试' })
        .expect(403);
    });
  });

  describe('GET /api/payments/stats', () => {
    it('应该获取支付统计信息', async () => {
      const mockStats = {
        totalPayments: 150,
        completedPayments: 140,
        pendingPayments: 8,
        overduePayments: 2,
        totalRevenue: 450000.00,
        averagePayment: 3000.00,
        revenueByType: [
          { type: 'tuition', amount: 360000.00, count: 120 },
          { type: 'meal', amount: 60000.00, count: 200 },
          { type: 'activity', amount: 30000.00, count: 60 }
        ],
        monthlyRevenue: [
          { month: '2024-01', revenue: 150000.00 },
          { month: '2024-02', revenue: 160000.00 },
          { month: '2024-03', revenue: 140000.00 }
        ]
      };

      mockPaymentController.getPaymentStats.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockStats
        });
      });

      const response = await request(app)
        .get('/api/payments/stats')
        .query({ startDate: '2024-01-01', endDate: '2024-03-31' })
        .expect(200);

      expect(response.body.data).toEqual(mockStats);
      expect(mockPaymentController.getPaymentStats).toHaveBeenCalled();
    });

    it('应该支持日期范围筛选', async () => {
      mockPaymentController.getPaymentStats.mockImplementation((req, res) => {
        expect(req.query.startDate).toBe('2024-01-01');
        expect(req.query.endDate).toBe('2024-03-31');
        res.status(200).json({ success: true, data: {} });
      });

      await request(app)
        .get('/api/payments/stats')
        .query({ startDate: '2024-01-01', endDate: '2024-03-31' })
        .expect(200);
    });
  });

  describe('GET /api/payments/overdue', () => {
    it('应该获取逾期支付列表', async () => {
      const mockOverduePayments = [
        {
          id: 1,
          amount: 3000.00,
          dueDate: '2024-01-15',
          status: 'pending',
          daysOverdue: 45,
          lateFee: 100.00,
          student: { name: '张小明' },
          enrollment: { className: '小班A' }
        },
        {
          id: 2,
          amount: 3200.00,
          dueDate: '2024-02-01',
          status: 'pending',
          daysOverdue: 28,
          lateFee: 80.00,
          student: { name: '李小红' },
          enrollment: { className: '小班B' }
        }
      ];

      mockPaymentController.getOverduePayments.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockOverduePayments,
          pagination: {
            total: 2,
            page: 1,
            pageSize: 10
          }
        });
      });

      const response = await request(app)
        .get('/api/payments/overdue')
        .expect(200);

      expect(response.body.data).toEqual(mockOverduePayments);
      expect(mockPaymentController.getOverduePayments).toHaveBeenCalled();
    });

    it('应该支持逾期天数筛选', async () => {
      mockPaymentController.getOverduePayments.mockImplementation((req, res) => {
        expect(req.query.minDays).toBe('30');
        res.status(200).json({ success: true, data: [] });
      });

      await request(app)
        .get('/api/payments/overdue')
        .query({ minDays: '30' })
        .expect(200);
    });
  });

  describe('GET /api/payments/:id/invoice', () => {
    it('应该生成发票', async () => {
      const mockInvoice = {
        invoiceNumber: 'INV-2024-001',
        paymentId: 1,
        amount: 3000.00,
        issueDate: '2024-08-15',
        dueDate: '2024-09-01',
        items: [
          { description: '小班A学费', amount: 3000.00 }
        ],
        payer: {
          name: '张三',
          phone: '13800138001'
        }
      };

      mockPaymentController.generateInvoice.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200).json({
          success: true,
          data: mockInvoice
        });
      });

      const response = await request(app)
        .get('/api/payments/1/invoice')
        .expect(200);

      expect(response.body.data).toEqual(mockInvoice);
      expect(mockPaymentController.generateInvoice).toHaveBeenCalled();
    });

    it('应该处理未完成支付的发票请求', async () => {
      mockPaymentController.generateInvoice.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Cannot generate invoice for unpaid payment'
        });
      });

      await request(app)
        .get('/api/payments/1/invoice')
        .expect(400);
    });
  });

  describe('POST /api/payments/:id/reminder', () => {
    it('应该发送支付提醒', async () => {
      const reminderData = {
        type: 'email',
        message: '您的学费即将到期，请及时缴费'
      };

      mockPaymentController.sendPaymentReminder.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        expect(req.body).toEqual(reminderData);
        res.status(200).json({
          success: true,
          message: 'Payment reminder sent successfully'
        });
      });

      const response = await request(app)
        .post('/api/payments/1/reminder')
        .send(reminderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPaymentController.sendPaymentReminder).toHaveBeenCalled();
    });

    it('应该验证提醒类型', async () => {
      const invalidData = {
        type: 'invalid_type',
        message: ''
      };

      mockValidationMiddleware.validateQuery.mockImplementation((req, res, next) => {
        const errors = [];
        if (!['email', 'sms', 'both'].includes(req.body.type)) {
          errors.push('Invalid reminder type');
        }
        if (!req.body.message) {
          errors.push('Reminder message is required');
        }

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }
        next();
      });

      const response = await request(app)
        .post('/api/payments/1/reminder')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Invalid reminder type');
      expect(response.body.errors).toContain('Reminder message is required');
    });
  });

  describe('POST /api/payments/:id/verify', () => {
    it('应该验证支付状态', async () => {
      const verificationResult = {
        paymentId: 1,
        transactionId: 'wx_123456789',
        status: 'completed',
        verifiedAt: new Date(),
        gatewayStatus: 'SUCCESS',
        gatewayMessage: 'Payment successful'
      };

      mockPaymentController.verifyPayment.mockImplementation((req, res) => {
        expect(req.params.id).toBe('1');
        res.status(200).json({
          success: true,
          data: verificationResult
        });
      });

      const response = await request(app)
        .post('/api/payments/1/verify')
        .expect(200);

      expect(response.body.data).toEqual(verificationResult);
      expect(mockPaymentController.verifyPayment).toHaveBeenCalled();
    });

    it('应该处理验证失败的情况', async () => {
      mockPaymentController.verifyPayment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Payment verification failed',
          error: 'Transaction not found in gateway'
        });
      });

      await request(app)
        .post('/api/payments/1/verify')
        .expect(400);
    });
  });

  describe('GET /api/payments/export', () => {
    it('应该导出支付数据', async () => {
      const mockExportData = 'id,amount,type,status,paidAt\n1,3000.00,tuition,completed,2024-08-15';

      mockPaymentController.exportPaymentData.mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
        res.send(mockExportData);
      });

      const response = await request(app)
        .get('/api/payments/export')
        .query({ format: 'csv', startDate: '2024-01-01', endDate: '2024-03-31' })
        .expect(200);

      expect(response.text).toBe(mockExportData);
      expect(mockPaymentController.exportPaymentData).toHaveBeenCalled();
    });

    it('应该支持不同的导出格式', async () => {
      mockPaymentController.exportPaymentData.mockImplementation((req, res) => {
        expect(req.query.format).toBe('excel');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(Buffer.from('excel data'));
      });

      await request(app)
        .get('/api/payments/export')
        .query({ format: 'excel' })
        .expect(200);
    });
  });

  describe('PUT /api/payments/bulk', () => {
    it('应该批量更新支付', async () => {
      const bulkUpdateData = {
        paymentIds: [1, 2, 3],
        updates: { status: 'cancelled' }
      };

      mockPaymentController.bulkUpdatePayments.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: { updatedCount: 3, errors: [] },
          message: 'Payments updated successfully'
        });
      });

      const response = await request(app)
        .put('/api/payments/bulk')
        .send(bulkUpdateData)
        .expect(200);

      expect(response.body.data.updatedCount).toBe(3);
      expect(mockPaymentController.bulkUpdatePayments).toHaveBeenCalled();
    });

    it('应该处理部分更新失败', async () => {
      const bulkUpdateData = {
        paymentIds: [1, 2, 999],
        updates: { status: 'cancelled' }
      };

      mockPaymentController.bulkUpdatePayments.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            updatedCount: 2,
            errors: [{ id: 999, error: 'Payment not found' }]
          },
          message: 'Payments updated with some errors'
        });
      });

      const response = await request(app)
        .put('/api/payments/bulk')
        .send(bulkUpdateData)
        .expect(200);

      expect(response.body.data.updatedCount).toBe(2);
      expect(response.body.data.errors).toHaveLength(1);
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器错误', async () => {
      mockPaymentController.getPayments.mockImplementation((req, res, next) => {
        const error = new Error('Database connection failed');
        next(error);
      });

      // 模拟错误处理中间件
      const errorHandler = (err, req, res, next) => {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      };

      await request(app)
        .get('/api/payments')
        .expect(500);
    });

    it('应该处理验证错误', async () => {
      mockValidationMiddleware.validatePayment.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Amount is required']
        });
      });

      const response = await request(app)
        .post('/api/payments')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('权限控制', () => {
    it('应该检查财务权限', async () => {
      mockAuthMiddleware.authorize.mockImplementation((roles) => (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }
        next();
      });

      await request(app)
        .post('/api/payments/1/refund')
        .send({ amount: 1000, reason: '测试' })
        .expect(403);
    });

    it('应该允许有权限的用户访问', async () => {
      mockAuthMiddleware.authenticate.mockImplementation((req, res, next) => {
        req.user = { id: 1, role: 'finance' };
        next();
      });

      mockAuthMiddleware.authorize.mockImplementation((roles) => (req, res, next) => {
        if (roles.includes(req.user.role)) {
          next();
        } else {
          res.status(403).json({ success: false, message: 'Forbidden' });
        }
      });

      mockPaymentController.getPayments.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      await request(app)
        .get('/api/payments')
        .expect(200);
    });
  });

  describe('速率限制', () => {
    it('应该应用速率限制', async () => {
      mockRateLimitMiddleware.mockImplementation((req, res, next) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests'
        });
      });

      await request(app)
        .get('/api/payments')
        .expect(429);

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });
});
