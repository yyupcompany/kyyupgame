import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock controllers
const mockFinanceController = {
  getTransactions: jest.fn(),
  getTransactionById: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  getPayments: jest.fn(),
  processPayment: jest.fn(),
  refundPayment: jest.fn(),
  getInvoices: jest.fn(),
  createInvoice: jest.fn(),
  updateInvoice: jest.fn(),
  getFinancialReports: jest.fn(),
  exportFinancialData: jest.fn(),
  getAccountBalance: jest.fn(),
  getPaymentMethods: jest.fn(),
  updatePaymentMethod: jest.fn(),
  getFinancialStats: jest.fn(),
  reconcileAccount: jest.fn(),
  generateReceipt: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = {
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'finance_admin', role: 'finance_admin' };
    next();
  }),
  requireRole: jest.fn(() => (req, res, next) => next()),
  requirePermission: jest.fn(() => (req, res, next) => next())
};

const mockValidationMiddleware = {
  validateTransaction: jest.fn((req, res, next) => next()),
  validatePayment: jest.fn((req, res, next) => next()),
  validateInvoice: jest.fn((req, res, next) => next()),
  validateRefund: jest.fn((req, res, next) => next()),
  validateReportRequest: jest.fn((req, res, next) => next())
};

const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/finance.controller', () => ({
  default: mockFinanceController
}));

jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({

jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  default: mockRateLimitMiddleware
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

describe('Finance Routes', () => {
  let app: express.Application;
  let financeRoutes: any;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Import routes
    const imported = await import('../../../../../src/routes/finance.routes');
    financeRoutes = imported.default || imported.financeRoutes || imported;
    
    // Mount routes
    app.use('/api/finance', financeRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockFinanceController.getTransactions.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            type: 'income',
            amount: 3000.00,
            description: '学费收入',
            category: 'tuition',
            date: '2024-03-15',
            status: 'completed',
            paymentMethod: 'bank_transfer',
            reference: 'TXN-001',
            studentId: 1,
            student: { name: '张小明', class: '小班A' }
          },
          {
            id: 2,
            type: 'expense',
            amount: 500.00,
            description: '教学用品采购',
            category: 'supplies',
            date: '2024-03-14',
            status: 'completed',
            paymentMethod: 'cash',
            reference: 'TXN-002'
          }
        ],
        pagination: { page: 1, pageSize: 10, total: 2 },
        summary: {
          totalIncome: 3000.00,
          totalExpense: 500.00,
          netAmount: 2500.00
        }
      });
    });

    mockFinanceController.getTransactionById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          type: 'income',
          amount: 3000.00,
          description: '学费收入',
          category: 'tuition',
          date: '2024-03-15',
          status: 'completed',
          paymentMethod: 'bank_transfer',
          reference: 'TXN-001',
          studentId: 1,
          student: { name: '张小明', class: '小班A' },
          attachments: [
            { id: 1, filename: 'receipt.pdf', url: '/uploads/receipts/receipt.pdf' }
          ],
          notes: '按时缴费，无欠款',
          createdBy: { id: 1, name: '财务管理员' },
          createdAt: '2024-03-15T10:00:00Z',
          updatedAt: '2024-03-15T10:00:00Z'
        }
      });
    });

    mockFinanceController.createTransaction.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: { id: 3, ...req.body, status: 'pending', reference: 'TXN-003' },
        message: 'Transaction created successfully'
      });
    });

    mockFinanceController.updateTransaction.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: parseInt(req.params.id), ...req.body },
        message: 'Transaction updated successfully'
      });
    });
  });

  describe('GET /api/finance/transactions', () => {
    it('应该获取交易记录列表', async () => {
      const response = await request(app)
        .get('/api/finance/transactions')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.any(Array),
        pagination: expect.any(Object),
        summary: expect.objectContaining({
          totalIncome: 3000.00,
          totalExpense: 500.00,
          netAmount: 2500.00
        })
      });
      expect(response.body.data).toHaveLength(2);
      expect(mockFinanceController.getTransactions).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      await request(app)
        .get('/api/finance/transactions?page=2&pageSize=5')
        .expect(200);

      expect(mockFinanceController.getTransactions).toHaveBeenCalled();
    });

    it('应该支持类型筛选', async () => {
      await request(app)
        .get('/api/finance/transactions?type=income')
        .expect(200);

      expect(mockFinanceController.getTransactions).toHaveBeenCalled();
    });

    it('应该支持分类筛选', async () => {
      await request(app)
        .get('/api/finance/transactions?category=tuition')
        .expect(200);

      expect(mockFinanceController.getTransactions).toHaveBeenCalled();
    });

    it('应该支持日期范围筛选', async () => {
      await request(app)
        .get('/api/finance/transactions?startDate=2024-03-01&endDate=2024-03-31')
        .expect(200);

      expect(mockFinanceController.getTransactions).toHaveBeenCalled();
    });

    it('应该要求财务权限', async () => {
      mockAuthMiddleware.requirePermission.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Finance permission required'
        });
      });

      await request(app)
        .get('/api/finance/transactions')
        .expect(403);
    });
  });

  describe('GET /api/finance/transactions/:id', () => {
    it('应该获取指定交易详情', async () => {
      const response = await request(app)
        .get('/api/finance/transactions/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          type: 'income',
          amount: 3000.00,
          description: '学费收入',
          category: 'tuition',
          status: 'completed',
          student: expect.objectContaining({
            name: '张小明'
          }),
          attachments: expect.any(Array),
          createdBy: expect.objectContaining({
            name: '财务管理员'
          })
        })
      });
      expect(mockFinanceController.getTransactionById).toHaveBeenCalled();
    });

    it('应该验证交易ID格式', async () => {
      mockFinanceController.getTransactionById.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid transaction ID format'
        });
      });

      await request(app)
        .get('/api/finance/transactions/invalid-id')
        .expect(400);
    });

    it('应该处理交易不存在的情况', async () => {
      mockFinanceController.getTransactionById.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      });

      await request(app)
        .get('/api/finance/transactions/999')
        .expect(404);
    });
  });

  describe('POST /api/finance/transactions', () => {
    it('应该创建新交易记录', async () => {
      const transactionData = {
        type: 'income',
        amount: 2500.00,
        description: '餐费收入',
        category: 'meal',
        date: '2024-03-16',
        paymentMethod: 'wechat_pay',
        studentId: 2,
        notes: '按月缴费'
      };

      const response = await request(app)
        .post('/api/finance/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          type: 'income',
          amount: 2500.00,
          description: '餐费收入',
          status: 'pending',
          reference: 'TXN-003'
        }),
        message: 'Transaction created successfully'
      });
      expect(mockFinanceController.createTransaction).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateTransaction).toHaveBeenCalled();
    });

    it('应该验证必填字段', async () => {
      mockValidationMiddleware.validateTransaction.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Amount is required', 'Type is required']
        });
      });

      await request(app)
        .post('/api/finance/transactions')
        .send({})
        .expect(400);

      expect(mockValidationMiddleware.validateTransaction).toHaveBeenCalled();
    });

    it('应该验证金额格式', async () => {
      mockFinanceController.createTransaction.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid amount format'
        });
      });

      const transactionData = {
        type: 'income',
        amount: 'invalid-amount',
        description: '测试交易'
      };

      await request(app)
        .post('/api/finance/transactions')
        .send(transactionData)
        .expect(400);
    });

    it('应该要求财务管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Finance admin role required'
        });
      });

      await request(app)
        .post('/api/finance/transactions')
        .send({ type: 'income', amount: 1000 })
        .expect(403);
    });
  });

  describe('PUT /api/finance/transactions/:id', () => {
    it('应该更新交易记录', async () => {
      const updateData = {
        amount: 3200.00,
        description: '学费收入（更新）',
        notes: '已确认收款',
        status: 'completed'
      };

      const response = await request(app)
        .put('/api/finance/transactions/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          amount: 3200.00,
          description: '学费收入（更新）'
        }),
        message: 'Transaction updated successfully'
      });
      expect(mockFinanceController.updateTransaction).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateTransaction).toHaveBeenCalled();
    });

    it('应该验证权限', async () => {
      mockAuthMiddleware.requirePermission.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      });

      await request(app)
        .put('/api/finance/transactions/1')
        .send({ amount: 3200.00 })
        .expect(403);
    });

    it('应该防止更新已完成的交易', async () => {
      mockFinanceController.updateTransaction.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Cannot update completed transaction'
        });
      });

      await request(app)
        .put('/api/finance/transactions/1')
        .send({ amount: 3200.00 })
        .expect(400);
    });
  });

  describe('DELETE /api/finance/transactions/:id', () => {
    it('应该删除交易记录', async () => {
      mockFinanceController.deleteTransaction.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Transaction deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/api/finance/transactions/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Transaction deleted successfully'
      });
      expect(mockFinanceController.deleteTransaction).toHaveBeenCalled();
    });

    it('应该要求超级管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Super admin role required'
        });
      });

      await request(app)
        .delete('/api/finance/transactions/1')
        .expect(403);
    });

    it('应该检查交易是否可删除', async () => {
      mockFinanceController.deleteTransaction.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Cannot delete completed transaction'
        });
      });

      await request(app)
        .delete('/api/finance/transactions/1')
        .expect(400);
    });
  });

  describe('GET /api/finance/payments', () => {
    it('应该获取支付记录', async () => {
      mockFinanceController.getPayments.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              amount: 3000.00,
              method: 'bank_transfer',
              status: 'completed',
              transactionId: 'PAY-001',
              studentId: 1,
              student: { name: '张小明' },
              createdAt: '2024-03-15T10:00:00Z'
            }
          ],
          pagination: { page: 1, pageSize: 10, total: 1 }
        });
      });

      const response = await request(app)
        .get('/api/finance/payments')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          amount: 3000.00,
          method: 'bank_transfer',
          status: 'completed',
          student: expect.objectContaining({
            name: '张小明'
          })
        })
      );
      expect(mockFinanceController.getPayments).toHaveBeenCalled();
    });

    it('应该支持支付方式筛选', async () => {
      await request(app)
        .get('/api/finance/payments?method=wechat_pay')
        .expect(200);

      expect(mockFinanceController.getPayments).toHaveBeenCalled();
    });

    it('应该支持状态筛选', async () => {
      await request(app)
        .get('/api/finance/payments?status=pending')
        .expect(200);

      expect(mockFinanceController.getPayments).toHaveBeenCalled();
    });
  });

  describe('POST /api/finance/payments', () => {
    it('应该处理支付', async () => {
      const paymentData = {
        amount: 2500.00,
        method: 'alipay',
        studentId: 2,
        description: '餐费支付',
        returnUrl: 'https://example.com/return'
      };

      mockFinanceController.processPayment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            paymentId: 'PAY-002',
            status: 'pending',
            paymentUrl: 'https://pay.example.com/pay/PAY-002',
            qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
          },
          message: 'Payment initiated successfully'
        });
      });

      const response = await request(app)
        .post('/api/finance/payments')
        .send(paymentData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          paymentId: 'PAY-002',
          status: 'pending',
          paymentUrl: expect.any(String)
        }),
        message: 'Payment initiated successfully'
      });
      expect(mockFinanceController.processPayment).toHaveBeenCalled();
      expect(mockValidationMiddleware.validatePayment).toHaveBeenCalled();
    });

    it('应该验证支付数据', async () => {
      mockValidationMiddleware.validatePayment.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Invalid payment data',
          errors: ['Amount must be positive', 'Payment method is required']
        });
      });

      await request(app)
        .post('/api/finance/payments')
        .send({ amount: -100 })
        .expect(400);
    });
  });

  describe('POST /api/finance/payments/:id/refund', () => {
    it('应该处理退款', async () => {
      const refundData = {
        amount: 1000.00,
        reason: '学生转学',
        notes: '按比例退费'
      };

      mockFinanceController.refundPayment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            refundId: 'REF-001',
            amount: 1000.00,
            status: 'processing',
            estimatedTime: '3-5个工作日'
          },
          message: 'Refund initiated successfully'
        });
      });

      const response = await request(app)
        .post('/api/finance/payments/1/refund')
        .send(refundData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          refundId: 'REF-001',
          amount: 1000.00,
          status: 'processing'
        }),
        message: 'Refund initiated successfully'
      });
      expect(mockFinanceController.refundPayment).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateRefund).toHaveBeenCalled();
    });

    it('应该验证退款金额', async () => {
      mockFinanceController.refundPayment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Refund amount exceeds payment amount'
        });
      });

      await request(app)
        .post('/api/finance/payments/1/refund')
        .send({ amount: 5000.00, reason: '测试' })
        .expect(400);
    });

    it('应该要求财务管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Finance admin role required'
        });
      });

      await request(app)
        .post('/api/finance/payments/1/refund')
        .send({ amount: 1000.00, reason: '测试' })
        .expect(403);
    });
  });

  describe('GET /api/finance/invoices', () => {
    it('应该获取发票列表', async () => {
      mockFinanceController.getInvoices.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              invoiceNumber: 'INV-2024-001',
              amount: 3000.00,
              status: 'issued',
              issueDate: '2024-03-15',
              dueDate: '2024-04-15',
              studentId: 1,
              student: { name: '张小明' },
              items: [
                { description: '学费', amount: 2500.00 },
                { description: '餐费', amount: 500.00 }
              ]
            }
          ],
          pagination: { page: 1, pageSize: 10, total: 1 }
        });
      });

      const response = await request(app)
        .get('/api/finance/invoices')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          invoiceNumber: 'INV-2024-001',
          amount: 3000.00,
          status: 'issued',
          student: expect.objectContaining({
            name: '张小明'
          }),
          items: expect.any(Array)
        })
      );
      expect(mockFinanceController.getInvoices).toHaveBeenCalled();
    });

    it('应该支持状态筛选', async () => {
      await request(app)
        .get('/api/finance/invoices?status=paid')
        .expect(200);

      expect(mockFinanceController.getInvoices).toHaveBeenCalled();
    });
  });

  describe('POST /api/finance/invoices', () => {
    it('应该创建发票', async () => {
      const invoiceData = {
        studentId: 2,
        amount: 2800.00,
        dueDate: '2024-04-20',
        items: [
          { description: '学费', amount: 2300.00 },
          { description: '活动费', amount: 500.00 }
        ],
        notes: '请按时缴费'
      };

      mockFinanceController.createInvoice.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            id: 2,
            invoiceNumber: 'INV-2024-002',
            ...invoiceData,
            status: 'draft',
            issueDate: '2024-03-16'
          },
          message: 'Invoice created successfully'
        });
      });

      const response = await request(app)
        .post('/api/finance/invoices')
        .send(invoiceData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          invoiceNumber: 'INV-2024-002',
          amount: 2800.00,
          status: 'draft'
        }),
        message: 'Invoice created successfully'
      });
      expect(mockFinanceController.createInvoice).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateInvoice).toHaveBeenCalled();
    });

    it('应该验证发票数据', async () => {
      mockValidationMiddleware.validateInvoice.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Invalid invoice data',
          errors: ['Student ID is required', 'Amount must be positive']
        });
      });

      await request(app)
        .post('/api/finance/invoices')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/finance/reports', () => {
    it('应该获取财务报表', async () => {
      mockFinanceController.getFinancialReports.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            period: '2024-03',
            summary: {
              totalIncome: 150000.00,
              totalExpense: 45000.00,
              netProfit: 105000.00,
              profitMargin: 0.7
            },
            incomeByCategory: {
              tuition: 120000.00,
              meal: 25000.00,
              activity: 5000.00
            },
            expenseByCategory: {
              salary: 30000.00,
              supplies: 10000.00,
              utilities: 5000.00
            },
            trends: {
              income: [140000, 145000, 150000],
              expense: [42000, 43500, 45000]
            }
          }
        });
      });

      const response = await request(app)
        .get('/api/finance/reports?period=2024-03')
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          period: '2024-03',
          summary: expect.objectContaining({
            totalIncome: 150000.00,
            totalExpense: 45000.00,
            netProfit: 105000.00
          }),
          incomeByCategory: expect.any(Object),
          expenseByCategory: expect.any(Object),
          trends: expect.any(Object)
        })
      );
      expect(mockFinanceController.getFinancialReports).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateReportRequest).toHaveBeenCalled();
    });

    it('应该支持不同报表类型', async () => {
      await request(app)
        .get('/api/finance/reports?type=profit_loss&period=2024-Q1')
        .expect(200);

      expect(mockFinanceController.getFinancialReports).toHaveBeenCalled();
    });

    it('应该要求财务管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Finance admin role required'
        });
      });

      await request(app)
        .get('/api/finance/reports')
        .expect(403);
    });
  });

  describe('GET /api/finance/export', () => {
    it('应该导出财务数据', async () => {
      mockFinanceController.exportFinancialData.mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=financial-data.xlsx');
        res.status(200).send(Buffer.from('fake excel data'));
      });

      const response = await request(app)
        .get('/api/finance/export?format=excel&period=2024-03')
        .expect(200);

      expect(response.headers['content-type']).toContain('spreadsheetml.sheet');
      expect(mockFinanceController.exportFinancialData).toHaveBeenCalled();
    });

    it('应该支持CSV格式导出', async () => {
      mockFinanceController.exportFinancialData.mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=financial-data.csv');
        res.status(200).send('id,type,amount,date\n1,income,3000,2024-03-15');
      });

      const response = await request(app)
        .get('/api/finance/export?format=csv')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });
  });

  describe('GET /api/finance/balance', () => {
    it('应该获取账户余额', async () => {
      mockFinanceController.getAccountBalance.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalBalance: 250000.00,
            availableBalance: 230000.00,
            frozenBalance: 20000.00,
            accounts: [
              {
                id: 1,
                name: '主账户',
                type: 'checking',
                balance: 200000.00,
                currency: 'CNY'
              },
              {
                id: 2,
                name: '储蓄账户',
                type: 'savings',
                balance: 50000.00,
                currency: 'CNY'
              }
            ],
            lastUpdated: '2024-03-15T16:00:00Z'
          }
        });
      });

      const response = await request(app)
        .get('/api/finance/balance')
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          totalBalance: 250000.00,
          availableBalance: 230000.00,
          frozenBalance: 20000.00,
          accounts: expect.any(Array),
          lastUpdated: expect.any(String)
        })
      );
      expect(mockFinanceController.getAccountBalance).toHaveBeenCalled();
    });
  });

  describe('GET /api/finance/payment-methods', () => {
    it('应该获取支付方式配置', async () => {
      mockFinanceController.getPaymentMethods.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '微信支付',
              code: 'wechat_pay',
              enabled: true,
              config: {
                appId: 'wx123456789',
                merchantId: '1234567890'
              }
            },
            {
              id: 2,
              name: '支付宝',
              code: 'alipay',
              enabled: true,
              config: {
                appId: '2021001234567890',
                partnerId: '2088123456789012'
              }
            }
          ]
        });
      });

      const response = await request(app)
        .get('/api/finance/payment-methods')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          name: '微信支付',
          code: 'wechat_pay',
          enabled: true,
          config: expect.any(Object)
        })
      );
      expect(mockFinanceController.getPaymentMethods).toHaveBeenCalled();
    });
  });

  describe('PUT /api/finance/payment-methods/:id', () => {
    it('应该更新支付方式配置', async () => {
      const updateData = {
        enabled: false,
        config: {
          appId: 'wx987654321',
          merchantId: '0987654321'
        }
      };

      mockFinanceController.updatePaymentMethod.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: { id: 1, ...updateData },
          message: 'Payment method updated successfully'
        });
      });

      const response = await request(app)
        .put('/api/finance/payment-methods/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          enabled: false,
          config: expect.any(Object)
        }),
        message: 'Payment method updated successfully'
      });
      expect(mockFinanceController.updatePaymentMethod).toHaveBeenCalled();
    });

    it('应该要求超级管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Super admin role required'
        });
      });

      await request(app)
        .put('/api/finance/payment-methods/1')
        .send({ enabled: false })
        .expect(403);
    });
  });

  describe('GET /api/finance/stats', () => {
    it('应该获取财务统计信息', async () => {
      mockFinanceController.getFinancialStats.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            today: {
              income: 15000.00,
              expense: 3000.00,
              transactions: 25
            },
            thisMonth: {
              income: 150000.00,
              expense: 45000.00,
              transactions: 320
            },
            thisYear: {
              income: 1800000.00,
              expense: 540000.00,
              transactions: 3850
            },
            topCategories: [
              { category: 'tuition', amount: 120000.00 },
              { category: 'meal', amount: 25000.00 }
            ],
            paymentMethods: [
              { method: 'wechat_pay', count: 150, amount: 75000.00 },
              { method: 'alipay', count: 120, amount: 60000.00 }
            ]
          }
        });
      });

      const response = await request(app)
        .get('/api/finance/stats')
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          today: expect.objectContaining({
            income: expect.any(Number),
            expense: expect.any(Number),
            transactions: expect.any(Number)
          }),
          thisMonth: expect.any(Object),
          thisYear: expect.any(Object),
          topCategories: expect.any(Array),
          paymentMethods: expect.any(Array)
        })
      );
      expect(mockFinanceController.getFinancialStats).toHaveBeenCalled();
    });
  });

  describe('POST /api/finance/reconcile', () => {
    it('应该执行账户对账', async () => {
      const reconcileData = {
        accountId: 1,
        period: '2024-03',
        bankStatement: 'bank-statement.csv'
      };

      mockFinanceController.reconcileAccount.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            reconciliationId: 'REC-001',
            status: 'completed',
            matched: 95,
            unmatched: 3,
            discrepancies: [
              { transactionId: 'TXN-100', amount: 500.00, reason: 'Missing in bank statement' }
            ]
          },
          message: 'Account reconciliation completed'
        });
      });

      const response = await request(app)
        .post('/api/finance/reconcile')
        .send(reconcileData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          reconciliationId: 'REC-001',
          status: 'completed',
          matched: 95,
          unmatched: 3,
          discrepancies: expect.any(Array)
        }),
        message: 'Account reconciliation completed'
      });
      expect(mockFinanceController.reconcileAccount).toHaveBeenCalled();
    });
  });

  describe('POST /api/finance/receipts/:transactionId', () => {
    it('应该生成收据', async () => {
      mockFinanceController.generateReceipt.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            receiptId: 'RCP-001',
            receiptNumber: 'R-2024-001',
            url: '/uploads/receipts/R-2024-001.pdf',
            format: 'pdf'
          },
          message: 'Receipt generated successfully'
        });
      });

      const response = await request(app)
        .post('/api/finance/receipts/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          receiptId: 'RCP-001',
          receiptNumber: 'R-2024-001',
          url: expect.any(String),
          format: 'pdf'
        }),
        message: 'Receipt generated successfully'
      });
      expect(mockFinanceController.generateReceipt).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器错误', async () => {
      mockFinanceController.getTransactions.mockImplementation((req, res, next) => {
        const error = new Error('Database connection failed');
        next(error);
      });

      await request(app)
        .get('/api/finance/transactions')
        .expect(500);
    });

    it('应该处理验证错误', async () => {
      mockValidationMiddleware.validateTransaction.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Invalid transaction data']
        });
      });

      await request(app)
        .post('/api/finance/transactions')
        .send({ type: 'invalid' })
        .expect(400);
    });

    it('应该处理认证错误', async () => {
      mockAuthMiddleware.authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      });

      await request(app)
        .get('/api/finance/transactions')
        .expect(401);
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
        .post('/api/finance/transactions')
        .send({ type: 'income', amount: 1000 })
        .expect(429);
    });
  });

  describe('路由参数验证', () => {
    it('应该验证数字ID参数', async () => {
      await request(app)
        .get('/api/finance/transactions/abc')
        .expect(400);
    });

    it('应该验证查询参数', async () => {
      await request(app)
        .get('/api/finance/transactions?page=invalid')
        .expect(400);
    });

    it('应该处理缺失的必需参数', async () => {
      await request(app)
        .post('/api/finance/payments/1/refund')
        .send({})
        .expect(400);
    });
  });
});
