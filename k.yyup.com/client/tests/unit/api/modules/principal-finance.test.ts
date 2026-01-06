import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from '@/utils/request'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation'
import financeApi from '@/api/modules/finance'
import type {
  FinanceOverview,
  FeeItem,
  PaymentBill,
  PaymentRecord,
  RefundApplication,
  FinancialReport,
  ExpenseRecord,
  BudgetItem,
  CustomerCredit,
  BankTransaction
} from '@/api/modules/finance'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Principal - 财务管理完整测试', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('财务概览功能', () => {
    it('should get finance overview with validation', async () => {
      const mockOverview: FinanceOverview = {
        monthlyRevenue: 150000,
        revenueGrowth: 0.12,
        pendingAmount: 25000,
        pendingCount: 15,
        collectionRate: 0.88,
        paidCount: 120,
        totalCount: 135,
        overdueAmount: 8000,
        overdueCount: 8
      }

      const mockResponse = {
        success: true,
        data: mockOverview,
        message: '财务概览获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getOverview()

      // 验证API调用
      expect(request.get).toHaveBeenCalledWith('/finance/overview')
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'monthlyRevenue', 'revenueGrowth', 'pendingAmount', 'collectionRate'
      ])
      expect(validation.valid).toBe(true)

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        monthlyRevenue: 'number',
        revenueGrowth: 'number',
        pendingAmount: 'number',
        collectionRate: 'number',
        pendingCount: 'number',
        paidCount: 'number',
        totalCount: 'number'
      })
      expect(typeValidation.valid).toBe(true)

      // 验证数值范围
      expect(result.data.collectionRate).toBeGreaterThanOrEqual(0)
      expect(result.data.collectionRate).toBeLessThanOrEqual(1)
      expect(result.data.monthlyRevenue).toBeGreaterThan(0)
    })

    it('should handle finance overview API errors', async () => {
      const error = new Error('Failed to fetch finance overview')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(financeApi.getOverview()).rejects.toThrow('Failed to fetch finance overview')
    })
  })

  describe('费用管理功能', () => {
    it('should get fee items successfully', async () => {
      const mockFeeItems: FeeItem[] = [
        {
          id: '1',
          name: '学费',
          category: 'tuition',
          amount: 5000,
          period: 'monthly',
          isRequired: true,
          description: '月度学费',
          status: 'active'
        },
        {
          id: '2',
          name: '餐费',
          category: 'meal',
          amount: 300,
          period: 'monthly',
          isRequired: false,
          description: '月度餐费',
          status: 'active'
        }
      ]

      const mockResponse = {
        success: true,
        data: mockFeeItems,
        message: '收费项目获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getFeeItems()

      expect(request.get).toHaveBeenCalledWith('/finance/fee-items')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('学费')
      expect(result.data[0].amount).toBe(5000)
      expect(result.data[0].isRequired).toBe(true)
    })

    it('should create payment bill with validation', async () => {
      const billData = {
        studentId: 'student-1',
        items: [
          { feeId: '1', period: '2024-01' },
          { feeId: '2', period: '2024-01' }
        ],
        dueDate: '2024-01-31',
        discount: 0.1
      }

      const mockBill: PaymentBill = {
        id: 'bill-1',
        billNo: 'BILL202401001',
        studentId: 'student-1',
        studentName: '张三',
        className: '大班A',
        items: [
          { feeId: '1', feeName: '学费', amount: 5000, period: '2024-01' },
          { feeId: '2', feeName: '餐费', amount: 300, period: '2024-01' }
        ],
        totalAmount: 5300,
        discountAmount: 530,
        finalAmount: 4770,
        dueDate: '2024-01-31',
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockBill,
        message: '缴费单创建成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await financeApi.createPaymentBill(billData)

      expect(request.post).toHaveBeenCalledWith('/finance/payment-bills', billData)
      expect(result.success).toBe(true)
      expect(result.data.billNo).toBe('BILL202401001')
      expect(result.data.finalAmount).toBe(4770)
      expect(result.data.status).toBe('pending')

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'id', 'billNo', 'studentId', 'totalAmount', 'finalAmount', 'dueDate', 'status'
      ])
      expect(validation.valid).toBe(true)
    })

    it('should process payment correctly', async () => {
      const paymentData = {
        paymentMethod: 'wechat',
        amount: 4770,
        receipt: 'payment_receipt_001'
      }

      const mockPaymentRecord: PaymentRecord = {
        id: 'payment-1',
        billId: 'bill-1',
        studentId: 'student-1',
        studentName: '张三',
        feeType: 'tuition',
        amount: 4770,
        period: '2024-01',
        paymentMethod: 'wechat',
        paidAt: '2024-01-15T10:00:00Z',
        status: 'paid',
        receipt: 'payment_receipt_001'
      }

      const mockResponse = {
        success: true,
        data: mockPaymentRecord,
        message: '缴费成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await financeApi.processPayment('bill-1', paymentData)

      expect(request.post).toHaveBeenCalledWith('/finance/payment-bills/bill-1/pay', paymentData)
      expect(result.success).toBe(true)
      expect(result.data.status).toBe('paid')
      expect(result.data.paymentMethod).toBe('wechat')
      expect(result.data.amount).toBe(4770)
    })
  })

  describe('收银管理流程', () => {
    it('should get today payments for cashier management', async () => {
      const mockTodayPayments: PaymentRecord[] = [
        {
          id: 'payment-1',
          billId: 'bill-1',
          studentId: 'student-1',
          studentName: '张三',
          feeType: 'tuition',
          amount: 5000,
          period: '2024-01',
          paymentMethod: 'cash',
          paidAt: '2024-01-15T09:30:00Z',
          status: 'paid'
        },
        {
          id: 'payment-2',
          billId: 'bill-2',
          studentId: 'student-2',
          studentName: '李四',
          feeType: 'meal',
          amount: 300,
          period: '2024-01',
          paymentMethod: 'alipay',
          paidAt: '2024-01-15T10:15:00Z',
          status: 'paid'
        }
      ]

      const mockResponse = {
        success: true,
        data: mockTodayPayments,
        message: '今日收费记录获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getTodayPayments()

      expect(request.get).toHaveBeenCalledWith('/finance/today-payments')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)

      // 验证今日收款总额
      const totalAmount = result.data.reduce((sum, payment) => sum + payment.amount, 0)
      expect(totalAmount).toBe(5300)

      // 验证所有支付状态都是已支付
      result.data.forEach(payment => {
        expect(payment.status).toBe('paid')
        expect(payment.paidAt).toBeDefined()
      })
    })

    it('should handle refund applications correctly', async () => {
      const mockRefundApplications: RefundApplication[] = [
        {
          id: 'refund-1',
          studentId: 'student-1',
          studentName: '张三',
          feeType: 'tuition',
          originalAmount: 5000,
          refundAmount: 2500,
          reason: '退学',
          status: 'pending',
          appliedAt: '2024-01-15T14:00:00Z'
        }
      ]

      const mockResponse = {
        success: true,
        data: { list: mockRefundApplications, total: 1 },
        message: '退费申请获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getRefundApplications({ status: 'pending' })

      expect(request.get).toHaveBeenCalledWith('/finance/refund-applications', { status: 'pending' })
      expect(result.success).toBe(true)
      expect(result.data.total).toBe(1)
      expect(result.data.list[0].status).toBe('pending')
      expect(result.data.list[0].refundAmount).toBeLessThan(result.data.list[0].originalAmount)
    })

    it('should process refund application with proper approval', async () => {
      const processData = {
        status: 'approved' as const,
        remarks: '同意退学申请，退费50%'
      }

      const mockProcessedRefund: RefundApplication = {
        id: 'refund-1',
        studentId: 'student-1',
        studentName: '张三',
        feeType: 'tuition',
        originalAmount: 5000,
        refundAmount: 2500,
        reason: '退学',
        status: 'approved',
        appliedAt: '2024-01-15T14:00:00Z',
        processedAt: '2024-01-16T09:00:00Z',
        processedBy: 'principal-1',
        remarks: '同意退学申请，退费50%'
      }

      const mockResponse = {
        success: true,
        data: mockProcessedRefund,
        message: '退费申请处理成功'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await financeApi.processRefundApplication('refund-1', processData)

      expect(request.put).toHaveBeenCalledWith('/finance/refund-applications/refund-1', processData)
      expect(result.success).toBe(true)
      expect(result.data.status).toBe('approved')
      expect(result.data.processedAt).toBeDefined()
      expect(result.data.processedBy).toBeDefined()
      expect(result.data.remarks).toBe(processData.remarks)
    })

    it('should send collection reminders successfully', async () => {
      const billIds = ['bill-1', 'bill-2', 'bill-3']

      const mockResponse = {
        success: true,
        data: null,
        message: '催缴通知发送成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await financeApi.sendCollectionReminder(billIds)

      expect(request.post).toHaveBeenCalledWith('/finance/send-reminder', { billIds })
      expect(result.success).toBe(true)
      expect(result.message).toBe('催缴通知发送成功')
    })
  })

  describe('财务报表生成', () => {
    it('should generate financial reports correctly', async () => {
      const reportData = {
        type: 'monthly',
        period: { start: '2024-01-01', end: '2024-01-31' },
        name: '2024年1月财务报表'
      }

      const mockReport: FinancialReport = {
        id: 'report-1',
        name: '2024年1月财务报表',
        type: 'monthly',
        period: { start: '2024-01-01', end: '2024-01-31' },
        data: {
          totalRevenue: 500000,
          totalRefund: 25000,
          netRevenue: 475000,
          collectionRate: 0.95,
          overdueRate: 0.05,
          monthlyTrend: [
            { month: '2024-01', revenue: 500000, refund: 25000, net: 475000 }
          ],
          categoryBreakdown: [
            { category: '学费', amount: 450000, percentage: 0.9 },
            { category: '餐费', amount: 50000, percentage: 0.1 }
          ]
        },
        generatedAt: '2024-02-01T00:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockReport,
        message: '财务报表生成成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await financeApi.generateReport(reportData)

      expect(request.post).toHaveBeenCalledWith('/finance/reports', reportData)
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('2024年1月财务报表')
      expect(result.data.data.netRevenue).toBe(475000)
      expect(result.data.data.collectionRate).toBe(0.95)

      // 验证报表数据结构
      expect(result.data.data.totalRevenue).toBeGreaterThan(0)
      expect(result.data.data.netRevenue).toBeLessThan(result.data.data.totalRevenue)
      expect(result.data.data.categoryBreakdown).toHaveLength(2)

      // 验证分类百分比总和
      const totalPercentage = result.data.data.categoryBreakdown.reduce((sum, item) => sum + item.percentage, 0)
      expect(totalPercentage).toBeCloseTo(1.0, 2)
    })

    it('should get financial reports list', async () => {
      const mockReports: FinancialReport[] = [
        {
          id: 'report-1',
          name: '2024年1月财务报表',
          type: 'monthly',
          period: { start: '2024-01-01', end: '2024-01-31' },
          data: {
            totalRevenue: 500000,
            totalRefund: 25000,
            netRevenue: 475000,
            collectionRate: 0.95,
            overdueRate: 0.05,
            monthlyTrend: [],
            categoryBreakdown: []
          },
          generatedAt: '2024-02-01T00:00:00Z'
        }
      ]

      const mockResponse = {
        success: true,
        data: mockReports,
        message: '财务报表列表获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getReports()

      expect(request.get).toHaveBeenCalledWith('/finance/reports')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].type).toBe('monthly')
    })

    it('should export financial report correctly', async () => {
      const mockBlob = new Blob(['Excel report data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      vi.mocked(request.get).mockResolvedValue({ data: mockBlob })

      const result = await financeApi.exportReport('report-1', 'excel')

      expect(request.get).toHaveBeenCalledWith('/finance/reports/report-1/export', {
        params: { format: 'excel' },
        responseType: 'blob'
      })
      expect(result).toBe(mockBlob)
    })
  })

  describe('预算管理', () => {
    it('should get budget overview successfully', async () => {
      const mockBudgetOverview = {
        totalBudget: 1000000,
        totalUsed: 650000,
        totalRemaining: 350000,
        usageRate: 0.65,
        categoryStats: [
          { category: '人力成本', budget: 600000, used: 420000, rate: 0.7 },
          { category: '运营成本', budget: 200000, used: 130000, rate: 0.65 },
          { category: '设备采购', budget: 200000, used: 100000, rate: 0.5 }
        ],
        warningCount: 2
      }

      const mockResponse = {
        success: true,
        data: mockBudgetOverview,
        message: '预算概览获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getBudgetOverview()

      expect(request.get).toHaveBeenCalledWith('/finance/budget/overview')
      expect(result.success).toBe(true)
      expect(result.data.totalBudget).toBe(1000000)
      expect(result.data.usageRate).toBe(0.65)
      expect(result.data.warningCount).toBe(2)

      // 验证预算使用合理性
      expect(result.data.totalUsed).toBeLessThan(result.data.totalBudget)
      expect(result.data.totalRemaining).toBe(result.data.totalBudget - result.data.totalUsed)

      // 验证分类统计
      result.data.categoryStats.forEach(stat => {
        expect(stat.used).toBeLessThanOrEqual(stat.budget)
        expect(stat.rate).toBeGreaterThanOrEqual(0)
        expect(stat.rate).toBeLessThanOrEqual(1)
      })
    })

    it('should create budget item with validation', async () => {
      const budgetData = {
        name: '2024年教学设备采购预算',
        category: '设备采购',
        department: '教学部',
        totalBudget: 100000,
        period: { start: '2024-01-01', end: '2024-12-31' }
      }

      const mockBudgetItem: BudgetItem = {
        id: 'budget-1',
        name: '2024年教学设备采购预算',
        category: '设备采购',
        department: '教学部',
        totalBudget: 100000,
        usedAmount: 0,
        remainingAmount: 100000,
        usageRate: 0,
        period: { start: '2024-01-01', end: '2024-12-31' },
        status: 'active',
        createdBy: 'principal-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockBudgetItem,
        message: '预算项目创建成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await financeApi.createBudgetItem(budgetData)

      expect(request.post).toHaveBeenCalledWith('/finance/budget/items', budgetData)
      expect(result.success).toBe(true)
      expect(result.data.totalBudget).toBe(100000)
      expect(result.data.remainingAmount).toBe(100000)
      expect(result.data.usageRate).toBe(0)

      // 验证预算数据一致性
      expect(result.data.remainingAmount + result.data.usedAmount).toBe(result.data.totalBudget)
    })

    it('should process budget adjustment correctly', async () => {
      const adjustmentData = {
        budgetId: 'budget-1',
        type: 'increase' as const,
        amount: 20000,
        reason: '设备价格上涨，需要增加预算'
      }

      const mockAdjustment = {
        id: 'adjustment-1',
        budgetId: 'budget-1',
        type: 'increase',
        amount: 20000,
        reason: '设备价格上涨，需要增加预算',
        originalAmount: 100000,
        newAmount: 120000,
        status: 'pending',
        applicant: 'principal-1',
        appliedAt: '2024-01-15T10:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockAdjustment,
        message: '预算调整申请提交成功'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await financeApi.applyBudgetAdjustment(adjustmentData)

      expect(request.post).toHaveBeenCalledWith('/finance/budget/adjustments', adjustmentData)
      expect(result.success).toBe(true)
      expect(result.data.type).toBe('increase')
      expect(result.data.newAmount).toBe(result.data.originalAmount + result.data.amount)
      expect(result.data.status).toBe('pending')
    })
  })

  describe('收款和银行对账', () => {
    it('should get payment records with filters', async () => {
      const params = {
        customerId: 'customer-1',
        status: 'pending',
        method: 'wechat',
        page: 1,
        pageSize: 10
      }

      const mockPaymentRecords = [
        {
          id: 'payment-1',
          date: '2024-01-15',
          amount: 5000,
          customer: '张三',
          customerId: 'customer-1',
          method: 'wechat' as const,
          status: 'pending' as const,
          createdAt: '2024-01-15T10:00:00Z'
        }
      ]

      const mockResponse = {
        success: true,
        data: { list: mockPaymentRecords, total: 1 },
        message: '收款记录获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getPaymentRecords(params)

      expect(request.get).toHaveBeenCalledWith('/finance/payment/records', { params })
      expect(result.success).toBe(true)
      expect(result.data.total).toBe(1)
      expect(result.data.list[0].customerId).toBe('customer-1')
      expect(result.data.list[0].method).toBe('wechat')
    })

    it('should confirm payment with receipt', async () => {
      const confirmData = {
        receiptUrl: 'https://example.com/receipt/payment-1.pdf'
      }

      const mockConfirmedPayment = {
        id: 'payment-1',
        date: '2024-01-15',
        amount: 5000,
        customer: '张三',
        customerId: 'customer-1',
        method: 'wechat',
        status: 'paid' as const,
        receiptUrl: 'https://example.com/receipt/payment-1.pdf',
        confirmedAt: '2024-01-15T11:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockConfirmedPayment,
        message: '收款确认成功'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await financeApi.confirmPayment('payment-1', confirmData)

      expect(request.put).toHaveBeenCalledWith('/finance/payment/records/payment-1/confirm', confirmData)
      expect(result.success).toBe(true)
      expect(result.data.status).toBe('paid')
      expect(result.data.confirmedAt).toBeDefined()
    })

    it('should reconcile bank transactions successfully', async () => {
      const transactionIds = ['trans-1', 'trans-2', 'trans-3']

      const mockResponse = {
        success: true,
        data: null,
        message: '银行对账完成'
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await financeApi.reconcileBank(transactionIds)

      expect(request.post).toHaveBeenCalledWith('/finance/payment/reconcile-bank', { transactionIds })
      expect(result.success).toBe(true)
    })

    it('should get customer credits for risk management', async () => {
      const mockCustomerCredits: CustomerCredit[] = [
        {
          id: 'credit-1',
          customerId: 'customer-1',
          customerName: '张三',
          creditRating: 'A',
          creditLimit: 10000,
          currentDebt: 2000,
          overdueAmount: 0,
          paymentHistory: 0.95,
          lastPaymentDate: '2024-01-10',
          warningLevel: 'normal'
        },
        {
          id: 'credit-2',
          customerId: 'customer-2',
          customerName: '李四',
          creditRating: 'C',
          creditLimit: 5000,
          currentDebt: 4500,
          overdueAmount: 1000,
          paymentHistory: 0.75,
          warningLevel: 'warning'
        }
      ]

      const mockResponse = {
        success: true,
        data: { list: mockCustomerCredits, total: 2 },
        message: '客户信用信息获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getCustomerCredits({ warningLevel: 'warning' })

      expect(request.get).toHaveBeenCalledWith('/finance/payment/customer-credits', { warningLevel: 'warning' })
      expect(result.success).toBe(true)
      expect(result.data.total).toBe(2)

      // 验证信用数据逻辑
      result.data.list.forEach(credit => {
        expect(credit.currentDebt).toBeLessThanOrEqual(credit.creditLimit)
        expect(credit.paymentHistory).toBeGreaterThanOrEqual(0)
        expect(credit.paymentHistory).toBeLessThanOrEqual(1)

        if (credit.overdueAmount > 0) {
          expect(['warning', 'danger']).toContain(credit.warningLevel)
        }
      })
    })
  })

  describe('支出管理', () => {
    it('should get expense records with filters', async () => {
      const params = {
        category: 'salary',
        status: 'approved',
        page: 1,
        pageSize: 10
      }

      const mockExpenseRecords: ExpenseRecord[] = [
        {
          id: 'expense-1',
          date: '2024-01-15',
          amount: 8000,
          category: 'salary',
          categoryName: '工资支出',
          status: 'approved',
          approvalStatus: 'approved',
          description: '1月份教师工资',
          approver: 'principal-1',
          approvedAt: '2024-01-14T10:00:00Z',
          paidAt: '2024-01-15T09:00:00Z',
          createdBy: 'hr-1',
          createdAt: '2024-01-10T14:00:00Z'
        }
      ]

      const mockResponse = {
        success: true,
        data: { list: mockExpenseRecords, total: 1 },
        message: '支出记录获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getExpenseRecords(params)

      expect(request.get).toHaveBeenCalledWith('/finance/expense/records', { params })
      expect(result.success).toBe(true)
      expect(result.data.total).toBe(1)
      expect(result.data.list[0].category).toBe('salary')
      expect(result.data.list[0].status).toBe('approved')
    })

    it('should approve expense record correctly', async () => {
      const approveData = {
        status: 'approved' as const,
        remark: '工资支出已审核通过'
      }

      const mockApprovedExpense = {
        id: 'expense-1',
        date: '2024-01-15',
        amount: 8000,
        category: 'salary',
        categoryName: '工资支出',
        status: 'approved',
        approvalStatus: 'approved',
        description: '1月份教师工资',
        approver: 'principal-1',
        approvedAt: '2024-01-14T10:00:00Z',
        remark: '工资支出已审核通过'
      }

      const mockResponse = {
        success: true,
        data: mockApprovedExpense,
        message: '支出申请审批成功'
      }

      vi.mocked(request.put).mockResolvedValue(mockResponse)

      const result = await financeApi.approveExpenseRecord('expense-1', approveData)

      expect(request.put).toHaveBeenCalledWith('/finance/expense/records/expense-1/approve', approveData)
      expect(result.success).toBe(true)
      expect(result.data.approvalStatus).toBe('approved')
      expect(result.data.approver).toBe('principal-1')
      expect(result.data.approvedAt).toBeDefined()
    })
  })

  describe('错误处理和边界条件', () => {
    it('should handle network errors gracefully', async () => {
      const error = new Error('Network connection failed')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(financeApi.getOverview()).rejects.toThrow('Network connection failed')
    })

    it('should handle invalid data responses', async () => {
      const invalidResponse = {
        success: true,
        data: {
          monthlyRevenue: 'invalid_number',  // 应该是数字
          collectionRate: 1.5  // 超出有效范围
        }
      }

      vi.mocked(request.get).mockResolvedValue(invalidResponse)

      const result = await financeApi.getOverview()

      // 验证必填字段检查会失败
      const validation = validateFieldTypes(result.data, {
        monthlyRevenue: 'number',
        collectionRate: 'number'
      })
      expect(validation.valid).toBe(false)
    })

    it('should handle empty payment records', async () => {
      const mockResponse = {
        success: true,
        data: [],
        message: '暂无缴费记录'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getTodayPayments()
      expect(result.data).toEqual([])
      expect(result.success).toBe(true)
    })

    it('should handle large amount calculations correctly', async () => {
      const largeAmount = 999999999
      const mockOverview: FinanceOverview = {
        monthlyRevenue: largeAmount,
        revenueGrowth: 0.25,
        pendingAmount: largeAmount * 0.1,
        collectionRate: 0.95,
        paidCount: 500,
        totalCount: 525,
        pendingCount: 25,
        overdueAmount: largeAmount * 0.05,
        overdueCount: 10
      }

      const mockResponse = {
        success: true,
        data: mockOverview,
        message: '财务概览获取成功'
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getOverview()

      expect(result.data.monthlyRevenue).toBe(largeAmount)
      expect(result.data.pendingAmount).toBe(largeAmount * 0.1)
      expect(result.data.overdueAmount).toBe(largeAmount * 0.05)

      // 验证大数值计算的精度
      const precisionTest = result.data.monthlyRevenue + result.data.pendingAmount + result.data.overdueAmount
      expect(precisionTest).toBeLessThan(Number.MAX_SAFE_INTEGER)
    })
  })
})