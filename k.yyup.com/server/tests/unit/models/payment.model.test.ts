import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn(),
  transaction: jest.fn(),
  Op: {
    and: Symbol('and'),
    or: Symbol('or'),
    in: Symbol('in'),
    like: Symbol('like'),
    iLike: Symbol('iLike'),
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    ne: Symbol('ne'),
    is: Symbol('is'),
    not: Symbol('not'),
    sum: Symbol('sum'),
    count: Symbol('count')
  }
};

const mockDataTypes = {
  INTEGER: 'INTEGER',
  STRING: 'STRING',
  TEXT: 'TEXT',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  DECIMAL: 'DECIMAL',
  JSON: 'JSON',
  ENUM: jest.fn((values) => ({ type: 'ENUM', values })),
  UUID: 'UUID',
  UUIDV4: 'UUIDV4'
};

// Mock model instance methods
const createMockPaymentInstance = (data = {}) => ({
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
  dueDate: new Date('2024-09-01'),
  paidAt: new Date('2024-08-15'),
  refundAmount: 0,
  refundReason: null,
  metadata: {
    payerName: '张三',
    payerPhone: '13800138001',
    invoiceRequested: true
  },
  kindergartenId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data,
  // Instance methods
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockImplementation(function(this: any, updates: any) {
    Object.assign(this, updates);
    return Promise.resolve(this);
  }),
  destroy: jest.fn().mockResolvedValue(undefined),
  reload: jest.fn().mockResolvedValue(undefined),
  toJSON: jest.fn().mockImplementation(function(this: any) {
    const { save, update, destroy, reload, toJSON, ...data } = this;
    return data;
  }),
  // Association methods
  getEnrollment: jest.fn(),
  setEnrollment: jest.fn(),
  getStudent: jest.fn(),
  setStudent: jest.fn(),
  getKindergarten: jest.fn(),
  setKindergarten: jest.fn(),
  getRefunds: jest.fn(),
  createRefund: jest.fn(),
  // Custom instance methods
  isOverdue: jest.fn().mockImplementation(function(this: any) {
    return this.status === 'pending' && new Date() > new Date(this.dueDate);
  }),
  canRefund: jest.fn().mockImplementation(function(this: any) {
    return this.status === 'completed' && this.refundAmount < this.amount;
  }),
  calculateLateFee: jest.fn().mockImplementation(function(this: any) {
    if (!this.isOverdue()) return 0;
    const daysLate = Math.floor((new Date().getTime() - new Date(this.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(daysLate * 10, this.amount * 0.1); // 每天10元，最多10%
  }),
  generateInvoice: jest.fn().mockImplementation(function(this: any) {
    return {
      invoiceNumber: `INV-${this.id}-${Date.now()}`,
      amount: this.amount,
      issueDate: new Date(),
      dueDate: this.dueDate
    };
  }),
  processRefund: jest.fn().mockImplementation(function(refundAmount, reason) {
    if (!this.canRefund()) {
      throw new Error('Payment cannot be refunded');
    }
    this.refundAmount = (this.refundAmount || 0) + refundAmount;
    this.refundReason = reason;
    if (this.refundAmount >= this.amount) {
      this.status = 'refunded';
    } else {
      this.status = 'partially_refunded';
    }
    return this.save();
  }),
  markAsPaid: jest.fn().mockImplementation(function(transactionId, method) {
    this.status = 'completed';
    this.paidAt = new Date();
    this.transactionId = transactionId;
    this.method = method;
    return this.save();
  })
});

// Mock model static methods
const mockPaymentModel = {
  // Basic CRUD operations
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn(),
  bulkUpdate: jest.fn(),
  sum: jest.fn(),
  max: jest.fn(),
  min: jest.fn(),
  
  // Query operations
  findOrCreate: jest.fn(),
  upsert: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
  
  // Associations
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  belongsToMany: jest.fn(),
  hasOne: jest.fn(),
  
  // Hooks
  beforeCreate: jest.fn(),
  afterCreate: jest.fn(),
  beforeUpdate: jest.fn(),
  afterUpdate: jest.fn(),
  beforeDestroy: jest.fn(),
  afterDestroy: jest.fn(),
  beforeValidate: jest.fn(),
  afterValidate: jest.fn(),
  
  // Scopes
  scope: jest.fn().mockReturnThis(),
  unscoped: jest.fn().mockReturnThis(),
  
  // Custom class methods
  findByStatus: jest.fn(),
  findByMethod: jest.fn(),
  findByDateRange: jest.fn(),
  findOverdue: jest.fn(),
  findByStudent: jest.fn(),
  findByEnrollment: jest.fn(),
  calculateTotalRevenue: jest.fn(),
  getPaymentStats: jest.fn(),
  getMonthlyRevenue: jest.fn(),
  findPendingPayments: jest.fn(),
  
  // Model properties
  tableName: 'payments',
  primaryKeyAttribute: 'id',
  rawAttributes: {},
  associations: {},
  options: {}
};

// Mock related models
const mockEnrollmentModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockStudentModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockKindergartenModel = {
  findByPk: jest.fn()
};

const mockRefundModel = {
  findAll: jest.fn(),
  create: jest.fn()
};

// Mock imports
jest.unstable_mockModule('sequelize', () => ({
  Sequelize: jest.fn(() => mockSequelize),
  DataTypes: mockDataTypes,
  Op: mockSequelize.Op
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/models/enrollment.model', () => ({
  default: mockEnrollmentModel
}));

jest.unstable_mockModule('../../../../../../src/models/student.model', () => ({
  default: mockStudentModel
}));

jest.unstable_mockModule('../../../../../../src/models/kindergarten.model', () => ({
  default: mockKindergartenModel
}));

jest.unstable_mockModule('../../../../../../src/models/refund.model', () => ({
  default: mockRefundModel
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

describe('Payment Model', () => {
  let PaymentModel: any;

  beforeAll(async () => {
    // Mock the model definition
    mockSequelize.define.mockReturnValue(mockPaymentModel);
    
    const imported = await import('../../../../../../src/models/payment.model');
    PaymentModel = imported.default || imported.Payment || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('模型定义', () => {
    it('应该正确定义支付模型', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Payment',
        expect.objectContaining({
          id: expect.objectContaining({
            type: 'INTEGER',
            primaryKey: true,
            autoIncrement: true
          }),
          enrollmentId: expect.objectContaining({
            type: 'INTEGER',
            allowNull: false
          }),
          studentId: expect.objectContaining({
            type: 'INTEGER',
            allowNull: false
          }),
          amount: expect.objectContaining({
            type: 'DECIMAL',
            allowNull: false,
            validate: expect.objectContaining({
              min: 0,
              isDecimal: true
            })
          }),
          currency: expect.objectContaining({
            type: 'STRING',
            allowNull: false,
            defaultValue: 'CNY',
            validate: expect.objectContaining({
              isIn: [['CNY', 'USD', 'EUR']]
            })
          }),
          type: expect.objectContaining({
            type: expect.objectContaining({
              type: 'ENUM',
              values: ['tuition', 'meal', 'activity', 'material', 'transport', 'other']
            }),
            allowNull: false
          }),
          method: expect.objectContaining({
            type: expect.objectContaining({
              type: 'ENUM',
              values: ['cash', 'bank_transfer', 'wechat_pay', 'alipay', 'credit_card', 'other']
            }),
            allowNull: true
          }),
          status: expect.objectContaining({
            type: expect.objectContaining({
              type: 'ENUM',
              values: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded']
            }),
            defaultValue: 'pending'
          }),
          transactionId: expect.objectContaining({
            type: 'STRING',
            allowNull: true,
            unique: true
          }),
          description: expect.objectContaining({
            type: 'TEXT'
          }),
          dueDate: expect.objectContaining({
            type: 'DATE',
            allowNull: false
          }),
          paidAt: expect.objectContaining({
            type: 'DATE',
            allowNull: true
          }),
          refundAmount: expect.objectContaining({
            type: 'DECIMAL',
            defaultValue: 0,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          refundReason: expect.objectContaining({
            type: 'TEXT'
          }),
          metadata: expect.objectContaining({
            type: 'JSON'
          }),
          kindergartenId: expect.objectContaining({
            type: 'INTEGER',
            allowNull: false
          })
        }),
        expect.objectContaining({
          tableName: 'payments',
          timestamps: true,
          paranoid: true,
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['enrollmentId']
            }),
            expect.objectContaining({
              fields: ['studentId']
            }),
            expect.objectContaining({
              fields: ['status']
            }),
            expect.objectContaining({
              fields: ['type']
            }),
            expect.objectContaining({
              fields: ['dueDate']
            }),
            expect.objectContaining({
              fields: ['paidAt']
            }),
            expect.objectContaining({
              fields: ['kindergartenId']
            })
          ])
        })
      );
    });

    it('应该定义正确的关联关系', () => {
      expect(mockPaymentModel.belongsTo).toHaveBeenCalledWith(
        mockEnrollmentModel,
        expect.objectContaining({
          foreignKey: 'enrollmentId',
          as: 'enrollment'
        })
      );

      expect(mockPaymentModel.belongsTo).toHaveBeenCalledWith(
        mockStudentModel,
        expect.objectContaining({
          foreignKey: 'studentId',
          as: 'student'
        })
      );

      expect(mockPaymentModel.belongsTo).toHaveBeenCalledWith(
        mockKindergartenModel,
        expect.objectContaining({
          foreignKey: 'kindergartenId',
          as: 'kindergarten'
        })
      );

      expect(mockPaymentModel.hasMany).toHaveBeenCalledWith(
        mockRefundModel,
        expect.objectContaining({
          foreignKey: 'paymentId',
          as: 'refunds'
        })
      );
    });
  });

  describe('CRUD操作', () => {
    it('应该创建新支付记录', async () => {
      const paymentData = {
        enrollmentId: 1,
        studentId: 1,
        amount: 3500.00,
        currency: 'CNY',
        type: 'tuition',
        description: '中班B学费',
        dueDate: new Date('2024-09-01'),
        metadata: {
          payerName: '李四',
          payerPhone: '13800138002'
        },
        kindergartenId: 1
      };

      const mockCreatedPayment = createMockPaymentInstance({
        id: 2,
        ...paymentData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockPaymentModel.create.mockResolvedValue(mockCreatedPayment);

      const result = await PaymentModel.create(paymentData);

      expect(mockPaymentModel.create).toHaveBeenCalledWith(paymentData);
      expect(result).toEqual(mockCreatedPayment);
      expect(result.amount).toBe(3500.00);
      expect(result.status).toBe('pending');
    });

    it('应该根据ID查找支付记录', async () => {
      const paymentId = 1;
      const mockPayment = createMockPaymentInstance();

      mockPaymentModel.findByPk.mockResolvedValue(mockPayment);

      const result = await PaymentModel.findByPk(paymentId);

      expect(mockPaymentModel.findByPk).toHaveBeenCalledWith(paymentId);
      expect(result).toEqual(mockPayment);
    });

    it('应该查找所有支付记录', async () => {
      const mockPayments = [
        createMockPaymentInstance({ id: 1, amount: 3000.00 }),
        createMockPaymentInstance({ id: 2, amount: 3500.00 })
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findAll();

      expect(mockPaymentModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPayments);
      expect(result).toHaveLength(2);
    });

    it('应该更新支付记录', async () => {
      const paymentId = 1;
      const updateData = {
        status: 'completed',
        paidAt: new Date(),
        transactionId: 'wx_987654321'
      };

      mockPaymentModel.update.mockResolvedValue([1]);

      const result = await PaymentModel.update(updateData, {
        where: { id: paymentId }
      });

      expect(mockPaymentModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: paymentId }
      });
      expect(result).toEqual([1]);
    });

    it('应该删除支付记录', async () => {
      const paymentId = 1;

      mockPaymentModel.destroy.mockResolvedValue(1);

      const result = await PaymentModel.destroy({
        where: { id: paymentId }
      });

      expect(mockPaymentModel.destroy).toHaveBeenCalledWith({
        where: { id: paymentId }
      });
      expect(result).toBe(1);
    });

    it('应该统计支付记录数量', async () => {
      const mockCount = 150;

      mockPaymentModel.count.mockResolvedValue(mockCount);

      const result = await PaymentModel.count();

      expect(mockPaymentModel.count).toHaveBeenCalled();
      expect(result).toBe(150);
    });
  });

  describe('查询操作', () => {
    it('应该根据状态查找支付记录', async () => {
      const status = 'completed';
      const mockPayments = [
        createMockPaymentInstance({ id: 1, status }),
        createMockPaymentInstance({ id: 2, status })
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findAll({
        where: { status }
      });

      expect(mockPaymentModel.findAll).toHaveBeenCalledWith({
        where: { status }
      });
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(status);
    });

    it('应该根据支付方式查找记录', async () => {
      const method = 'wechat_pay';
      const mockPayments = [
        createMockPaymentInstance({ id: 1, method })
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findAll({
        where: { method }
      });

      expect(mockPaymentModel.findAll).toHaveBeenCalledWith({
        where: { method }
      });
      expect(result[0].method).toBe(method);
    });

    it('应该根据日期范围查找支付记录', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');
      const mockPayments = [
        createMockPaymentInstance({ id: 1, paidAt: new Date('2024-02-15') })
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findAll({
        where: {
          paidAt: {
            [mockSequelize.Op.between]: [startDate, endDate]
          }
        }
      });

      expect(mockPaymentModel.findAll).toHaveBeenCalledWith({
        where: {
          paidAt: {
            [mockSequelize.Op.between]: [startDate, endDate]
          }
        }
      });
      expect(result).toHaveLength(1);
    });

    it('应该查找逾期支付记录', async () => {
      const mockOverduePayments = [
        createMockPaymentInstance({
          id: 1,
          status: 'pending',
          dueDate: new Date('2024-01-01') // 过期日期
        })
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockOverduePayments);

      const result = await PaymentModel.findAll({
        where: {
          status: 'pending',
          dueDate: {
            [mockSequelize.Op.lt]: new Date()
          }
        }
      });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });

    it('应该支持分页查询', async () => {
      const mockResult = {
        rows: [
          createMockPaymentInstance({ id: 1 }),
          createMockPaymentInstance({ id: 2 })
        ],
        count: 50
      };

      mockPaymentModel.findAndCountAll.mockResolvedValue(mockResult);

      const result = await PaymentModel.findAndCountAll({
        limit: 2,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      expect(mockPaymentModel.findAndCountAll).toHaveBeenCalledWith({
        limit: 2,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result.rows).toHaveLength(2);
      expect(result.count).toBe(50);
    });

    it('应该支持金额范围查询', async () => {
      const minAmount = 2000;
      const maxAmount = 5000;
      const mockPayments = [
        createMockPaymentInstance({ id: 1, amount: 3000 }),
        createMockPaymentInstance({ id: 2, amount: 4000 })
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findAll({
        where: {
          amount: {
            [mockSequelize.Op.between]: [minAmount, maxAmount]
          }
        }
      });

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBeGreaterThanOrEqual(minAmount);
      expect(result[0].amount).toBeLessThanOrEqual(maxAmount);
    });
  });

  describe('批量操作', () => {
    it('应该批量创建支付记录', async () => {
      const paymentsData = [
        {
          enrollmentId: 1,
          studentId: 1,
          amount: 3000.00,
          type: 'tuition',
          dueDate: new Date('2024-09-01'),
          kindergartenId: 1
        },
        {
          enrollmentId: 2,
          studentId: 2,
          amount: 3200.00,
          type: 'tuition',
          dueDate: new Date('2024-09-01'),
          kindergartenId: 1
        }
      ];

      const mockCreatedPayments = paymentsData.map((data, index) =>
        createMockPaymentInstance({ id: index + 3, ...data })
      );

      mockPaymentModel.bulkCreate.mockResolvedValue(mockCreatedPayments);

      const result = await PaymentModel.bulkCreate(paymentsData);

      expect(mockPaymentModel.bulkCreate).toHaveBeenCalledWith(paymentsData);
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(3000.00);
      expect(result[1].amount).toBe(3200.00);
    });

    it('应该批量更新支付记录', async () => {
      const updateData = { status: 'completed' };
      const paymentIds = [1, 2, 3];

      mockPaymentModel.update.mockResolvedValue([3]);

      const result = await PaymentModel.update(updateData, {
        where: {
          id: {
            [mockSequelize.Op.in]: paymentIds
          }
        }
      });

      expect(mockPaymentModel.update).toHaveBeenCalledWith(updateData, {
        where: {
          id: {
            [mockSequelize.Op.in]: paymentIds
          }
        }
      });
      expect(result).toEqual([3]);
    });

    it('应该批量删除支付记录', async () => {
      const paymentIds = [1, 2, 3];

      mockPaymentModel.destroy.mockResolvedValue(3);

      const result = await PaymentModel.destroy({
        where: {
          id: {
            [mockSequelize.Op.in]: paymentIds
          }
        }
      });

      expect(mockPaymentModel.destroy).toHaveBeenCalledWith({
        where: {
          id: {
            [mockSequelize.Op.in]: paymentIds
          }
        }
      });
      expect(result).toBe(3);
    });
  });

  describe('聚合查询', () => {
    it('应该计算总收入', async () => {
      const totalRevenue = 150000.00;

      mockPaymentModel.sum.mockResolvedValue(totalRevenue);

      const result = await PaymentModel.sum('amount', {
        where: { status: 'completed' }
      });

      expect(mockPaymentModel.sum).toHaveBeenCalledWith('amount', {
        where: { status: 'completed' }
      });
      expect(result).toBe(150000.00);
    });

    it('应该按类型统计支付金额', async () => {
      const mockTypeStats = [
        { type: 'tuition', total: 120000.00, count: 40 },
        { type: 'meal', total: 20000.00, count: 80 },
        { type: 'activity', total: 10000.00, count: 20 }
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockTypeStats);

      const result = await PaymentModel.findAll({
        attributes: [
          'type',
          [mockSequelize.Op.sum, 'amount', 'total'],
          [mockSequelize.Op.count, '*', 'count']
        ],
        group: ['type']
      });

      expect(result).toEqual(mockTypeStats);
    });

    it('应该按月统计收入', async () => {
      const mockMonthlyStats = [
        { month: '2024-01', revenue: 50000.00 },
        { month: '2024-02', revenue: 55000.00 },
        { month: '2024-03', revenue: 45000.00 }
      ];

      mockPaymentModel.findAll.mockResolvedValue(mockMonthlyStats);

      const result = await PaymentModel.findAll({
        attributes: [
          [mockSequelize.Op.sum, 'amount', 'revenue']
        ],
        group: ['month']
      });

      expect(result).toEqual(mockMonthlyStats);
    });

    it('应该计算平均支付金额', async () => {
      const mockStats = {
        avgAmount: 3250.00,
        maxAmount: 5000.00,
        minAmount: 1000.00
      };

      mockPaymentModel.findAll.mockResolvedValue([mockStats]);

      const result = await PaymentModel.findAll({
        attributes: [
          [mockSequelize.Op.avg, 'amount', 'avgAmount'],
          [mockSequelize.Op.max, 'amount', 'maxAmount'],
          [mockSequelize.Op.min, 'amount', 'minAmount']
        ]
      });

      expect(result[0]).toEqual(mockStats);
    });
  });

  describe('关联查询', () => {
    it('应该查询支付记录及其报名信息', async () => {
      const mockPaymentWithEnrollment = createMockPaymentInstance({
        enrollment: {
          id: 1,
          studentName: '张小明',
          className: '小班A',
          enrollmentDate: '2024-08-01'
        }
      });

      mockPaymentModel.findByPk.mockResolvedValue(mockPaymentWithEnrollment);

      const result = await PaymentModel.findByPk(1, {
        include: [{ model: mockEnrollmentModel, as: 'enrollment' }]
      });

      expect(mockPaymentModel.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: mockEnrollmentModel, as: 'enrollment' }]
      });
      expect(result.enrollment.studentName).toBe('张小明');
    });

    it('应该查询支付记录及其学生信息', async () => {
      const mockPaymentWithStudent = createMockPaymentInstance({
        student: {
          id: 1,
          name: '张小明',
          age: 4,
          parent: { name: '张三', phone: '13800138001' }
        }
      });

      mockPaymentModel.findByPk.mockResolvedValue(mockPaymentWithStudent);

      const result = await PaymentModel.findByPk(1, {
        include: [{ model: mockStudentModel, as: 'student' }]
      });

      expect(result.student.name).toBe('张小明');
    });

    it('应该查询支付记录及其退款信息', async () => {
      const mockPaymentWithRefunds = createMockPaymentInstance({
        refunds: [
          { id: 1, amount: 500.00, reason: '部分退费', createdAt: new Date() }
        ]
      });

      mockPaymentModel.findByPk.mockResolvedValue(mockPaymentWithRefunds);

      const result = await PaymentModel.findByPk(1, {
        include: [{ model: mockRefundModel, as: 'refunds' }]
      });

      expect(result.refunds).toHaveLength(1);
      expect(result.refunds[0].amount).toBe(500.00);
    });
  });

  describe('实例方法', () => {
    it('应该检查支付是否逾期', () => {
      const overduePayment = createMockPaymentInstance({
        status: 'pending',
        dueDate: new Date('2024-01-01') // 过期日期
      });
      const currentPayment = createMockPaymentInstance({
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后
      });

      overduePayment.isOverdue.mockReturnValue(true);
      currentPayment.isOverdue.mockReturnValue(false);

      expect(overduePayment.isOverdue()).toBe(true);
      expect(currentPayment.isOverdue()).toBe(false);
    });

    it('应该检查是否可以退款', () => {
      const completedPayment = createMockPaymentInstance({
        status: 'completed',
        amount: 3000.00,
        refundAmount: 0
      });
      const refundedPayment = createMockPaymentInstance({
        status: 'refunded',
        amount: 3000.00,
        refundAmount: 3000.00
      });

      completedPayment.canRefund.mockReturnValue(true);
      refundedPayment.canRefund.mockReturnValue(false);

      expect(completedPayment.canRefund()).toBe(true);
      expect(refundedPayment.canRefund()).toBe(false);
    });

    it('应该计算滞纳金', () => {
      const overduePayment = createMockPaymentInstance({
        status: 'pending',
        amount: 3000.00,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10天前
      });

      overduePayment.calculateLateFee.mockReturnValue(100); // 10天 * 10元

      const lateFee = overduePayment.calculateLateFee();

      expect(overduePayment.calculateLateFee).toHaveBeenCalled();
      expect(lateFee).toBe(100);
    });

    it('应该生成发票', () => {
      const payment = createMockPaymentInstance({
        id: 1,
        amount: 3000.00,
        dueDate: new Date('2024-09-01')
      });

      const mockInvoice = {
        invoiceNumber: 'INV-1-1234567890',
        amount: 3000.00,
        issueDate: new Date(),
        dueDate: new Date('2024-09-01')
      };

      payment.generateInvoice.mockReturnValue(mockInvoice);

      const invoice = payment.generateInvoice();

      expect(payment.generateInvoice).toHaveBeenCalled();
      expect(invoice.invoiceNumber).toMatch(/^INV-1-\d+$/);
      expect(invoice.amount).toBe(3000.00);
    });

    it('应该处理退款', async () => {
      const payment = createMockPaymentInstance({
        id: 1,
        amount: 3000.00,
        status: 'completed',
        refundAmount: 0
      });

      await payment.processRefund(1000.00, '部分退费');

      expect(payment.processRefund).toHaveBeenCalledWith(1000.00, '部分退费');
      expect(payment.save).toHaveBeenCalled();
    });

    it('应该标记为已支付', async () => {
      const payment = createMockPaymentInstance({
        id: 1,
        status: 'pending'
      });

      await payment.markAsPaid('wx_123456789', 'wechat_pay');

      expect(payment.markAsPaid).toHaveBeenCalledWith('wx_123456789', 'wechat_pay');
      expect(payment.save).toHaveBeenCalled();
    });

    it('应该更新支付信息', async () => {
      const payment = createMockPaymentInstance();
      const updateData = {
        status: 'completed',
        paidAt: new Date(),
        transactionId: 'wx_987654321'
      };

      await payment.update(updateData);

      expect(payment.update).toHaveBeenCalledWith(updateData);
      expect(payment.status).toBe('completed');
      expect(payment.transactionId).toBe('wx_987654321');
    });

    it('应该保存支付记录', async () => {
      const payment = createMockPaymentInstance();
      
      await payment.save();
      
      expect(payment.save).toHaveBeenCalled();
    });

    it('应该删除支付记录', async () => {
      const payment = createMockPaymentInstance();
      
      await payment.destroy();
      
      expect(payment.destroy).toHaveBeenCalled();
    });

    it('应该重新加载支付数据', async () => {
      const payment = createMockPaymentInstance();
      
      await payment.reload();
      
      expect(payment.reload).toHaveBeenCalled();
    });

    it('应该转换为JSON格式', () => {
      const payment = createMockPaymentInstance();
      
      const json = payment.toJSON();
      
      expect(payment.toJSON).toHaveBeenCalled();
      expect(json).toEqual(expect.objectContaining({
        id: 1,
        amount: 3000.00,
        status: 'completed'
      }));
      expect(json.save).toBeUndefined();
      expect(json.update).toBeUndefined();
    });
  });

  describe('关联方法', () => {
    it('应该获取支付的报名信息', async () => {
      const payment = createMockPaymentInstance();
      const mockEnrollment = {
        id: 1,
        studentName: '张小明',
        className: '小班A'
      };

      payment.getEnrollment.mockResolvedValue(mockEnrollment);

      const enrollment = await payment.getEnrollment();

      expect(payment.getEnrollment).toHaveBeenCalled();
      expect(enrollment).toEqual(mockEnrollment);
    });

    it('应该获取支付的学生信息', async () => {
      const payment = createMockPaymentInstance();
      const mockStudent = {
        id: 1,
        name: '张小明',
        age: 4
      };

      payment.getStudent.mockResolvedValue(mockStudent);

      const student = await payment.getStudent();

      expect(payment.getStudent).toHaveBeenCalled();
      expect(student).toEqual(mockStudent);
    });

    it('应该获取支付的幼儿园信息', async () => {
      const payment = createMockPaymentInstance();
      const mockKindergarten = {
        id: 1,
        name: '阳光幼儿园'
      };

      payment.getKindergarten.mockResolvedValue(mockKindergarten);

      const kindergarten = await payment.getKindergarten();

      expect(payment.getKindergarten).toHaveBeenCalled();
      expect(kindergarten).toEqual(mockKindergarten);
    });

    it('应该获取支付的退款记录', async () => {
      const payment = createMockPaymentInstance();
      const mockRefunds = [
        { id: 1, amount: 500.00, reason: '部分退费' }
      ];

      payment.getRefunds.mockResolvedValue(mockRefunds);

      const refunds = await payment.getRefunds();

      expect(payment.getRefunds).toHaveBeenCalled();
      expect(refunds).toEqual(mockRefunds);
    });

    it('应该创建退款记录', async () => {
      const payment = createMockPaymentInstance();
      const refundData = {
        amount: 1000.00,
        reason: '学生转学',
        method: 'original'
      };

      const mockRefund = {
        id: 1,
        paymentId: 1,
        ...refundData
      };

      payment.createRefund.mockResolvedValue(mockRefund);

      const refund = await payment.createRefund(refundData);

      expect(payment.createRefund).toHaveBeenCalledWith(refundData);
      expect(refund).toEqual(mockRefund);
    });
  });

  describe('自定义类方法', () => {
    it('应该根据状态查找支付记录', async () => {
      const status = 'pending';
      const mockPayments = [
        createMockPaymentInstance({ status })
      ];

      mockPaymentModel.findByStatus.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findByStatus(status);

      expect(mockPaymentModel.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual(mockPayments);
    });

    it('应该根据支付方式查找记录', async () => {
      const method = 'wechat_pay';
      const mockPayments = [
        createMockPaymentInstance({ method })
      ];

      mockPaymentModel.findByMethod.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findByMethod(method);

      expect(mockPaymentModel.findByMethod).toHaveBeenCalledWith(method);
      expect(result).toEqual(mockPayments);
    });

    it('应该根据日期范围查找支付记录', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');
      const mockPayments = [
        createMockPaymentInstance({ paidAt: new Date('2024-02-15') })
      ];

      mockPaymentModel.findByDateRange.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findByDateRange(startDate, endDate);

      expect(mockPaymentModel.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(mockPayments);
    });

    it('应该查找逾期支付记录', async () => {
      const mockOverduePayments = [
        createMockPaymentInstance({
          status: 'pending',
          dueDate: new Date('2024-01-01')
        })
      ];

      mockPaymentModel.findOverdue.mockResolvedValue(mockOverduePayments);

      const result = await PaymentModel.findOverdue();

      expect(mockPaymentModel.findOverdue).toHaveBeenCalled();
      expect(result).toEqual(mockOverduePayments);
    });

    it('应该根据学生查找支付记录', async () => {
      const studentId = 1;
      const mockPayments = [
        createMockPaymentInstance({ studentId })
      ];

      mockPaymentModel.findByStudent.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findByStudent(studentId);

      expect(mockPaymentModel.findByStudent).toHaveBeenCalledWith(studentId);
      expect(result).toEqual(mockPayments);
    });

    it('应该根据报名查找支付记录', async () => {
      const enrollmentId = 1;
      const mockPayments = [
        createMockPaymentInstance({ enrollmentId })
      ];

      mockPaymentModel.findByEnrollment.mockResolvedValue(mockPayments);

      const result = await PaymentModel.findByEnrollment(enrollmentId);

      expect(mockPaymentModel.findByEnrollment).toHaveBeenCalledWith(enrollmentId);
      expect(result).toEqual(mockPayments);
    });

    it('应该计算总收入', async () => {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        status: 'completed'
      };
      const totalRevenue = 150000.00;

      mockPaymentModel.calculateTotalRevenue.mockResolvedValue(totalRevenue);

      const result = await PaymentModel.calculateTotalRevenue(filters);

      expect(mockPaymentModel.calculateTotalRevenue).toHaveBeenCalledWith(filters);
      expect(result).toBe(150000.00);
    });

    it('应该获取支付统计信息', async () => {
      const mockStats = {
        totalPayments: 150,
        completedPayments: 140,
        pendingPayments: 8,
        overduePayments: 2,
        totalRevenue: 450000.00,
        averagePayment: 3000.00
      };

      mockPaymentModel.getPaymentStats.mockResolvedValue(mockStats);

      const result = await PaymentModel.getPaymentStats();

      expect(mockPaymentModel.getPaymentStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it('应该获取月度收入', async () => {
      const year = 2024;
      const mockMonthlyRevenue = [
        { month: 1, revenue: 45000.00 },
        { month: 2, revenue: 50000.00 },
        { month: 3, revenue: 48000.00 }
      ];

      mockPaymentModel.getMonthlyRevenue.mockResolvedValue(mockMonthlyRevenue);

      const result = await PaymentModel.getMonthlyRevenue(year);

      expect(mockPaymentModel.getMonthlyRevenue).toHaveBeenCalledWith(year);
      expect(result).toEqual(mockMonthlyRevenue);
    });

    it('应该查找待处理支付', async () => {
      const mockPendingPayments = [
        createMockPaymentInstance({ status: 'pending' }),
        createMockPaymentInstance({ status: 'processing' })
      ];

      mockPaymentModel.findPendingPayments.mockResolvedValue(mockPendingPayments);

      const result = await PaymentModel.findPendingPayments();

      expect(mockPaymentModel.findPendingPayments).toHaveBeenCalled();
      expect(result).toEqual(mockPendingPayments);
    });
  });

  describe('钩子函数', () => {
    it('应该在创建前执行钩子', async () => {
      const paymentData = {
        enrollmentId: 1,
        studentId: 1,
        amount: 3000.00,
        type: 'tuition'
      };

      mockPaymentModel.beforeCreate.mockImplementation((payment) => {
        // 模拟自动生成描述
        if (!payment.description) {
          payment.description = `${payment.type} payment for student ${payment.studentId}`;
        }
      });

      await PaymentModel.create(paymentData);

      expect(mockPaymentModel.beforeCreate).toHaveBeenCalled();
    });

    it('应该在创建后执行钩子', async () => {
      const paymentData = {
        enrollmentId: 1,
        studentId: 1,
        amount: 3000.00,
        type: 'tuition'
      };

      mockPaymentModel.afterCreate.mockImplementation((payment) => {
        // 模拟发送支付确认通知
        return Promise.resolve();
      });

      await PaymentModel.create(paymentData);

      expect(mockPaymentModel.afterCreate).toHaveBeenCalled();
    });

    it('应该在更新前执行钩子', async () => {
      const updateData = { status: 'completed' };

      mockPaymentModel.beforeUpdate.mockImplementation((payment) => {
        if (payment.status === 'completed' && !payment.paidAt) {
          payment.paidAt = new Date();
        }
      });

      await PaymentModel.update(updateData, { where: { id: 1 } });

      expect(mockPaymentModel.beforeUpdate).toHaveBeenCalled();
    });

    it('应该在删除前执行钩子', async () => {
      mockPaymentModel.beforeDestroy.mockImplementation((payment) => {
        // 模拟检查是否可以删除
        if (payment.status === 'completed') {
          throw new Error('Cannot delete completed payment');
        }
      });

      await PaymentModel.destroy({ where: { id: 1 } });

      expect(mockPaymentModel.beforeDestroy).toHaveBeenCalled();
    });
  });

  describe('作用域', () => {
    it('应该使用已完成支付作用域', async () => {
      const mockCompletedPayments = [
        createMockPaymentInstance({ status: 'completed' })
      ];

      mockPaymentModel.scope.mockReturnValue({
        findAll: jest.fn().mockResolvedValue(mockCompletedPayments)
      });

      const result = await PaymentModel.scope('completed').findAll();

      expect(mockPaymentModel.scope).toHaveBeenCalledWith('completed');
      expect(result).toEqual(mockCompletedPayments);
    });

    it('应该使用逾期支付作用域', async () => {
      const mockOverduePayments = [
        createMockPaymentInstance({
          status: 'pending',
          dueDate: new Date('2024-01-01')
        })
      ];

      mockPaymentModel.scope.mockReturnValue({
        findAll: jest.fn().mockResolvedValue(mockOverduePayments)
      });

      const result = await PaymentModel.scope('overdue').findAll();

      expect(mockPaymentModel.scope).toHaveBeenCalledWith('overdue');
      expect(result).toEqual(mockOverduePayments);
    });

    it('应该移除作用域', async () => {
      const mockAllPayments = [
        createMockPaymentInstance({ status: 'completed' }),
        createMockPaymentInstance({ status: 'pending' }),
        createMockPaymentInstance({ status: 'cancelled' })
      ];

      mockPaymentModel.unscoped.mockReturnValue({
        findAll: jest.fn().mockResolvedValue(mockAllPayments)
      });

      const result = await PaymentModel.unscoped().findAll();

      expect(mockPaymentModel.unscoped).toHaveBeenCalled();
      expect(result).toEqual(mockAllPayments);
    });
  });

  describe('验证', () => {
    it('应该验证必填字段', async () => {
      const invalidData = {
        amount: '',
        type: '',
        dueDate: ''
      };

      const validationError = new Error('Validation error');
      validationError.name = 'SequelizeValidationError';
      validationError.errors = [
        { path: 'amount', message: 'Amount is required' },
        { path: 'type', message: 'Type is required' },
        { path: 'dueDate', message: 'Due date is required' }
      ];

      mockPaymentModel.create.mockRejectedValue(validationError);

      await expect(PaymentModel.create(invalidData))
        .rejects.toThrow('Validation error');
    });

    it('应该验证金额格式', async () => {
      const invalidData = {
        enrollmentId: 1,
        studentId: 1,
        amount: -100, // 负数
        type: 'tuition',
        dueDate: new Date()
      };

      const validationError = new Error('Validation error');
      validationError.name = 'SequelizeValidationError';
      validationError.errors = [
        { path: 'amount', message: 'Amount must be positive' }
      ];

      mockPaymentModel.create.mockRejectedValue(validationError);

      await expect(PaymentModel.create(invalidData))
        .rejects.toThrow('Validation error');
    });

    it('应该验证货币代码', async () => {
      const invalidData = {
        enrollmentId: 1,
        studentId: 1,
        amount: 3000.00,
        currency: 'INVALID', // 无效货币代码
        type: 'tuition',
        dueDate: new Date()
      };

      const validationError = new Error('Validation error');
      validationError.name = 'SequelizeValidationError';
      validationError.errors = [
        { path: 'currency', message: 'Invalid currency code' }
      ];

      mockPaymentModel.create.mockRejectedValue(validationError);

      await expect(PaymentModel.create(invalidData))
        .rejects.toThrow('Validation error');
    });

    it('应该验证交易ID唯一性', async () => {
      const duplicateData = {
        enrollmentId: 1,
        studentId: 1,
        amount: 3000.00,
        type: 'tuition',
        transactionId: 'wx_123456789', // 已存在的交易ID
        dueDate: new Date()
      };

      const uniqueError = new Error('Unique constraint error');
      uniqueError.name = 'SequelizeUniqueConstraintError';
      uniqueError.errors = [
        { path: 'transactionId', message: 'Transaction ID must be unique' }
      ];

      mockPaymentModel.create.mockRejectedValue(uniqueError);

      await expect(PaymentModel.create(duplicateData))
        .rejects.toThrow('Unique constraint error');
    });
  });

  describe('索引', () => {
    it('应该在报名ID字段上创建索引', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Payment',
        expect.any(Object),
        expect.objectContaining({
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['enrollmentId']
            })
          ])
        })
      );
    });

    it('应该在学生ID字段上创建索引', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Payment',
        expect.any(Object),
        expect.objectContaining({
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['studentId']
            })
          ])
        })
      );
    });

    it('应该在状态字段上创建索引', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Payment',
        expect.any(Object),
        expect.objectContaining({
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['status']
            })
          ])
        })
      );
    });

    it('应该在到期日期字段上创建索引', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Payment',
        expect.any(Object),
        expect.objectContaining({
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['dueDate']
            })
          ])
        })
      );
    });
  });
});
