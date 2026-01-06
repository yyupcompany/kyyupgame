/**
 * 财务管理系统API测试 - 100%完整覆盖版本
 *
 * 严格验证标准：
 * 1. ✅ 数据结构验证 - 验证API返回的数据格式
 * 2. ✅ 字段类型验证 - 验证所有字段的数据类型
 * 3. ✅ 必填字段验证 - 验证所有必填字段存在
 * 4. ✅ 控制台错误检测 - 捕获所有控制台错误
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';
import {
  validateAPIResponse,
  validateListResponse,
  validateFinanceOverview,
  validateFeeItem,
  validatePaymentBill,
  validatePaymentRecord,
  validateFinancialReport,
  validateAmount,
  validatePercentage,
  validatePaymentMethod,
  validateFeeCategory,
  validatePaymentStatus,
  validateRecordStatus,
  validateReportType,
  validateDateFormat
} from '../../../utils/finance-validation';

// Mock the request utility
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import financeAPI from '@/api/modules/finance';
import request from '@/utils/request';
const mockRequest = request as any;

describe('财务管理系统API - 严格验证100%覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    expectNoConsoleErrors();
  });

  describe('财务概览API (/finance/overview)', () => {
    it('should get finance overview with comprehensive validation', async () => {
      const mockOverview = {
        success: true,
        data: {
          monthlyRevenue: 125000,
          revenueGrowth: 12.5,
          pendingAmount: 45000,
          pendingCount: 23,
          collectionRate: 85.2,
          paidCount: 156,
          totalCount: 179,
          overdueAmount: 12000,
          overdueCount: 8
        },
        message: '获取财务概览成功'
      };

      mockRequest.get.mockResolvedValue({ data: mockOverview });
      const result = await financeAPI.getOverview();

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/finance/overview');

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证必填字段
      const validation = validateFinanceOverview(result.data);
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        throw new Error(`Finance overview validation failed: ${validation.errors.join(', ')}`);
      }

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        monthlyRevenue: 'number',
        revenueGrowth: 'number',
        pendingAmount: 'number',
        pendingCount: 'number',
        collectionRate: 'number',
        paidCount: 'number',
        totalCount: 'number',
        overdueAmount: 'number',
        overdueCount: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 5. 验证数值范围和业务逻辑
      expect(validateAmount(result.data.monthlyRevenue)).toBe(true);
      expect(validateAmount(result.data.pendingAmount)).toBe(true);
      expect(validateAmount(result.data.overdueAmount)).toBe(true);
      expect(validatePercentage(result.data.collectionRate)).toBe(true);
      expect(result.data.paidCount).toBeGreaterThanOrEqual(0);
      expect(result.data.totalCount).toBeGreaterThanOrEqual(result.data.paidCount);
      expect(result.data.pendingCount).toBeGreaterThanOrEqual(0);
      expect(result.data.overdueCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero values correctly', async () => {
      const mockOverview = {
        success: true,
        data: {
          monthlyRevenue: 0,
          revenueGrowth: 0,
          pendingAmount: 0,
          pendingCount: 0,
          collectionRate: 0,
          paidCount: 0,
          totalCount: 0,
          overdueAmount: 0,
          overdueCount: 0
        }
      };

      mockRequest.get.mockResolvedValue({ data: mockOverview });
      const result = await financeAPI.getOverview();

      const validation = validateFinanceOverview(result.data);
      expect(validation.valid).toBe(true);
      expect(result.data.monthlyRevenue).toBe(0);
      expect(result.data.collectionRate).toBe(0);
    });

    it('should handle negative growth rate correctly', async () => {
      const mockOverview = {
        success: true,
        data: {
          monthlyRevenue: 95000,
          revenueGrowth: -5.2,
          pendingAmount: 30000,
          pendingCount: 15,
          collectionRate: 92.1,
          paidCount: 145,
          totalCount: 160,
          overdueAmount: 8000,
          overdueCount: 5
        }
      };

      mockRequest.get.mockResolvedValue({ data: mockOverview });
      const result = await financeAPI.getOverview();

      const validation = validateFinanceOverview(result.data);
      expect(validation.valid).toBe(true);
      expect(result.data.revenueGrowth).toBeLessThan(0); // 负增长是合理的
    });
  });

  describe('收费项目API (/finance/fee-items)', () => {
    it('should get fee items with comprehensive validation', async () => {
      const mockFeeItems = {
        success: true,
        data: [
          {
            id: '1',
            name: '学费',
            category: 'tuition',
            amount: 2800,
            period: 'month',
            isRequired: true,
            description: '每月学费',
            status: 'active'
          },
          {
            id: '2',
            name: '餐费',
            category: 'meal',
            amount: 600,
            period: 'month',
            isRequired: false,
            description: '每月餐费',
            status: 'active'
          },
          {
            id: '3',
            name: '活动费',
            category: 'activity',
            amount: 200,
            period: 'time',
            isRequired: false,
            description: '课外活动费用',
            status: 'active'
          }
        ]
      };

      mockRequest.get.mockResolvedValue({ data: mockFeeItems });
      const result = await financeAPI.getFeeItems();

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/finance/fee-items');

      // 2. 验证响应结构
      const apiValidation = validateAPIResponse(result);
      expect(apiValidation.valid).toBe(true);

      // 3. 验证数据类型
      expect(Array.isArray(result.data)).toBe(true);

      // 4. 验证每个收费项目
      if (result.data.length > 0) {
        result.data.forEach((item: any, index: number) => {
          const validation = validateFeeItem(item);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            throw new Error(`Fee item ${index} validation failed: ${validation.errors.join(', ')}`);
          }

          // 额外的业务逻辑验证
          expect(validateAmount(item.amount)).toBe(true);
          expect(validateFeeCategory(item.category)).toBe(true);
          expect(item.amount).toBeGreaterThan(0);
          expect(['month', 'semester', 'year', 'time']).toContain(item.period);
          expect(typeof item.isRequired).toBe('boolean');
          expect(['active', 'inactive']).toContain(item.status);
        });
      }
    });

    it('should filter fee items by category', async () => {
      const mockFilteredItems = {
        success: true,
        data: [
          {
            id: '1',
            name: '学费',
            category: 'tuition',
            amount: 2800,
            period: 'month',
            isRequired: true,
            status: 'active'
          }
        ]
      };

      mockRequest.get.mockResolvedValue({ data: mockFilteredItems });
      const result = await financeAPI.getFeeItems({ category: 'tuition' });

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/fee-items', {
        params: { category: 'tuition' }
      });

      result.data.forEach((item: any) => {
        expect(item.category).toBe('tuition');
      });
    });

    it('should handle empty fee items list', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      mockRequest.get.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.getFeeItems();

      expect(result.data).toEqual([]);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('缴费单API (/finance/payment-bills)', () => {
    it('should get payment bills with comprehensive validation', async () => {
      const mockBills = {
        success: true,
        data: {
          items: [
            {
              id: '1',
              billNo: 'BILL20240115001',
              studentName: '张小明',
              className: '小班A',
              items: [
                { feeId: '1', feeName: '学费', amount: 2800, period: 'month' },
                { feeId: '2', feeName: '餐费', amount: 600, period: 'month' }
              ],
              totalAmount: 3400,
              status: 'pending',
              createdAt: '2024-01-15T10:00:00.000Z'
            },
            {
              id: '2',
              billNo: 'BILL20240115002',
              studentName: '李小红',
              className: '中班B',
              items: [{ feeId: '1', feeName: '学费', amount: 2800, period: 'month' }],
              totalAmount: 2800,
              status: 'paid',
              createdAt: '2024-01-14T09:30:00.000Z'
            }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      };

      mockRequest.get.mockResolvedValue({ data: mockBills });
      const result = await financeAPI.getPaymentBills({ page: 1, pageSize: 10 });

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/finance/payment-bills', {
        params: { page: 1, pageSize: 10 }
      });

      // 2. 验证列表响应结构
      const listValidation = validateListResponse(result);
      expect(listValidation.valid).toBe(true);

      // 3. 验证分页数据
      expect(result.data.total).toBeGreaterThanOrEqual(result.data.items.length);
      expect(result.data.page).toBeGreaterThan(0);
      expect(result.data.pageSize).toBeGreaterThan(0);

      // 4. 验证每个缴费单
      if (result.data.items.length > 0) {
        result.data.items.forEach((bill: any, index: number) => {
          const validation = validatePaymentBill(bill);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            throw new Error(`Payment bill ${index} validation failed: ${validation.errors.join(', ')}`);
          }

          // 业务逻辑验证
          expect(validateAmount(bill.totalAmount)).toBe(true);
          expect(validatePaymentStatus(bill.status)).toBe(true);
          expect(bill.totalAmount).toBeGreaterThan(0);
          expect(bill.billNo).toMatch(/^BILL\d{12}$/);
          expect(bill.studentName).toBeTruthy();

          // 验证缴费项目
          expect(Array.isArray(bill.items)).toBe(true);
          if (bill.items.length > 0) {
            bill.items.forEach((item: any) => {
              expect(item.feeId).toBeTruthy();
              expect(item.feeName).toBeTruthy();
              expect(validateAmount(item.amount)).toBe(true);
            });
          }
        });
      }
    });

    it('should create payment bill with validation', async () => {
      const createData = {
        studentId: '123',
        items: [{ feeId: '1', period: 'month' }],
        dueDate: '2024-02-15',
        discount: 100
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          billNo: 'BILL20240115001',
          studentId: '123',
          studentName: '张小明',
          items: createData.items,
          totalAmount: 2700,
          status: 'pending',
          createdAt: '2024-01-15T10:00:00.000Z'
        }
      };

      mockRequest.post.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.createPaymentBill(createData);

      // 1. 验证API调用
      expect(mockRequest.post).toHaveBeenCalledWith('/finance/payment-bills', createData);

      // 2. 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data.id).toBeTruthy();
      expect(result.data.status).toBe('pending');

      // 3. 验证创建的缴费单
      const validation = validatePaymentBill(result.data);
      expect(validation.valid).toBe(true);

      // 4. 业务逻辑验证
      expect(result.data.totalAmount).toBeGreaterThan(0);
      expect(validatePaymentStatus(result.data.status)).toBe(true);
    });

    it('should handle payment bill filters correctly', async () => {
      const filters = {
        studentId: '123',
        status: 'pending',
        dateRange: ['2024-01-01', '2024-01-31'],
        page: 1,
        pageSize: 20
      };

      mockRequest.get.mockResolvedValue({
        data: { success: true, data: { items: [], total: 0, page: 1, pageSize: 20 } }
      });

      await financeAPI.getPaymentBills(filters);

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/payment-bills', {
        params: filters
      });
    });
  });

  describe('缴费记录API (/finance/payment-records)', () => {
    it('should get payment records with comprehensive validation', async () => {
      const mockRecords = {
        success: true,
        data: {
          records: [
            {
              id: '1',
              billId: '1',
              paymentAmount: 2800,
              paymentDate: '2024-01-15',
              paymentMethod: 'wechat',
              status: 'success',
              receiptNo: 'R20240115001',
              transactionNo: 'TXN20240115001',
              payerName: '张父',
              payerPhone: '13800138000'
            },
            {
              id: '2',
              billId: '2',
              paymentAmount: 3400,
              paymentDate: '2024-01-14',
              paymentMethod: 'alipay',
              status: 'success',
              receiptNo: 'R20240114001'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      };

      mockRequest.get.mockResolvedValue({ data: mockRecords });
      const result = await financeAPI.getPaymentRecords();

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/finance/payment-records');

      // 2. 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data.records).toBeDefined();
      expect(result.data.pagination).toBeDefined();

      // 3. 验证分页数据
      const paginationValidation = validateRequiredFields(result.data.pagination, [
        'page', 'limit', 'total', 'totalPages'
      ]);
      expect(paginationValidation.valid).toBe(true);

      // 4. 验证每个缴费记录
      if (result.data.records.length > 0) {
        result.data.records.forEach((record: any, index: number) => {
          const validation = validatePaymentRecord(record);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            throw new Error(`Payment record ${index} validation failed: ${validation.errors.join(', ')}`);
          }

          // 业务逻辑验证
          expect(validateAmount(record.paymentAmount)).toBe(true);
          expect(validatePaymentMethod(record.paymentMethod)).toBe(true);
          expect(validateRecordStatus(record.status)).toBe(true);
          expect(validateDateFormat(record.paymentDate)).toBe(true);
          expect(record.paymentAmount).toBeGreaterThan(0);
          expect(record.billId).toBeTruthy();
        });
      }
    });

    it('should process payment with comprehensive validation', async () => {
      const paymentData = {
        paymentMethod: 'wechat',
        amount: 2800,
        receipt: 'payment_receipt.jpg'
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          billId: '1',
          paymentAmount: 2800,
          paymentDate: '2024-01-15T10:30:00.000Z',
          paymentMethod: 'wechat',
          status: 'success',
          transactionNo: 'TXN20240115001',
          receiptNo: 'R20240115001'
        }
      };

      mockRequest.post.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.processPayment('1', paymentData);

      // 1. 验证API调用
      expect(mockRequest.post).toHaveBeenCalledWith('/finance/payment-bills/1/pay', paymentData);

      // 2. 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data.paymentAmount).toBe(2800);
      expect(result.data.status).toBe('success');

      // 3. 验证缴费记录
      const validation = validatePaymentRecord(result.data);
      expect(validation.valid).toBe(true);

      // 4. 业务逻辑验证
      expect(result.data.paymentAmount).toBeGreaterThan(0);
      expect(result.data.status).toBe('success');
      expect(result.data.paymentMethod).toBe('wechat');
    });

    it('should handle payment record filters', async () => {
      const filters = {
        studentId: '123',
        status: 'success',
        dateRange: ['2024-01-01', '2024-01-31'],
        page: 1,
        pageSize: 20
      };

      mockRequest.get.mockResolvedValue({
        data: { success: true, data: { records: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } }
      });

      await financeAPI.getPaymentRecords(filters);

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/payment-records', {
        params: filters
      });
    });
  });

  describe('财务报表API (/finance/reports)', () => {
    it('should generate financial report with comprehensive validation', async () => {
      const reportData = {
        type: 'revenue',
        period: { start: '2024-01-01', end: '2024-01-31' },
        name: '2024年1月收入报表'
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          name: reportData.name,
          type: reportData.type,
          description: '2024年1月收入统计报表',
          period: reportData.period,
          generatedAt: '2024-01-15T11:00:00.000Z',
          status: 'completed',
          format: 'pdf'
        }
      };

      mockRequest.post.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.generateReport(reportData);

      // 1. 验证API调用
      expect(mockRequest.post).toHaveBeenCalledWith('/finance/reports', reportData);

      // 2. 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data.type).toBe(reportData.type);

      // 3. 验证报表数据
      const validation = validateFinancialReport(result.data);
      expect(validation.valid).toBe(true);

      // 4. 业务逻辑验证
      expect(validateReportType(result.data.type)).toBe(true);
      expect(result.data.name).toBeTruthy();
      expect(result.data.period).toBeDefined();
      expect(result.data.period.start).toBeTruthy();
      expect(result.data.period.end).toBeTruthy();
      expect(validateDateFormat(result.data.generatedAt)).toBe(true);
    });

    it('should get reports list with validation', async () => {
      const mockReports = {
        success: true,
        data: [
          {
            id: '1',
            name: '2024年1月收入报表',
            type: 'revenue',
            period: { start: '2024-01-01', end: '2024-01-31' },
            generatedAt: '2024-01-15T11:00:00.000Z'
          },
          {
            id: '2',
            name: '2024年1月支出报表',
            type: 'expense',
            period: { start: '2024-01-01', end: '2024-01-31' },
            generatedAt: '2024-01-15T12:00:00.000Z'
          }
        ]
      };

      mockRequest.get.mockResolvedValue({ data: mockReports });
      const result = await financeAPI.getReports();

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/reports');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        result.data.forEach((report: any) => {
          const validation = validateFinancialReport(report);
          expect(validation.valid).toBe(true);
        });
      }
    });

    it('should export report in different formats', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/pdf' });
      mockRequest.get.mockResolvedValue({ data: mockBlob });

      const result = await financeAPI.exportReport('1', 'pdf');

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/reports/1/export', {
        params: { format: 'pdf' },
        responseType: 'blob'
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it('should validate report types', async () => {
      const reportTypes = ['revenue', 'expense', 'profit', 'comprehensive', 'payment', 'overdue'];

      for (const type of reportTypes) {
        const mockResponse = {
          success: true,
          data: {
            id: '1',
            name: `${type} report`,
            type: type,
            period: { start: '2024-01-01', end: '2024-01-31' },
            generatedAt: '2024-01-15T11:00:00.000Z'
          }
        };

        mockRequest.post.mockResolvedValue({ data: mockResponse });
        const result = await financeAPI.generateReport({ type, period: { start: '2024-01-01', end: '2024-01-31' } });

        expect(validateReportType(result.data.type)).toBe(true);
      }
    });
  });

  describe('今日缴费API (/finance/today-payments)', () => {
    it('should get today payments with comprehensive validation', async () => {
      const mockTodayPayments = {
        success: true,
        data: {
          todayAmount: 15600,
          todayCount: 5,
          payments: [
            {
              id: '1',
              paymentAmount: 2800,
              paymentDate: '2024-01-15T09:30:00.000Z',
              paymentMethod: 'wechat',
              status: 'success',
              transactionNo: 'TXN20240115001'
            },
            {
              id: '2',
              paymentAmount: 600,
              paymentDate: '2024-01-15T10:15:00.000Z',
              paymentMethod: 'alipay',
              status: 'success'
            }
          ]
        }
      };

      mockRequest.get.mockResolvedValue({ data: mockTodayPayments });
      const result = await financeAPI.getTodayPayments();

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/finance/today-payments');

      // 2. 验证响应结构
      expect(result.success).toBe(true);

      // 3. 验证必填字段
      const requiredFields = ['todayAmount', 'todayCount', 'payments'];
      const validation = validateRequiredFields(result.data, requiredFields);
      expect(validation.valid).toBe(true);

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        todayAmount: 'number',
        todayCount: 'number',
        payments: 'array'
      });
      expect(typeValidation.valid).toBe(true);

      // 5. 验证数值范围
      expect(validateAmount(result.data.todayAmount)).toBe(true);
      expect(result.data.todayAmount).toBeGreaterThanOrEqual(0);
      expect(result.data.todayCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.data.payments)).toBe(true);

      // 6. 验证支付记录
      if (result.data.payments.length > 0) {
        result.data.payments.forEach((payment: any) => {
          expect(validateAmount(payment.paymentAmount)).toBe(true);
          expect(payment.paymentAmount).toBeGreaterThan(0);
          expect(payment.status).toBe('success');
          expect(['wechat', 'alipay', 'cash', 'bank_transfer']).toContain(payment.paymentMethod);
          expect(validateDateFormat(payment.paymentDate)).toBe(true);
        });
      }
    });

    it('should handle empty today payments', async () => {
      const mockResponse = {
        success: true,
        data: {
          todayAmount: 0,
          todayCount: 0,
          payments: []
        }
      };

      mockRequest.get.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.getTodayPayments();

      expect(result.data.todayAmount).toBe(0);
      expect(result.data.todayCount).toBe(0);
      expect(result.data.payments).toEqual([]);
    });
  });

  describe('催缴通知API (/finance/send-reminder)', () => {
    it('should send collection reminder with validation', async () => {
      const billIds = ['1', '2', '3'];
      const mockResponse = { success: true, message: '催缴通知发送成功' };

      mockRequest.post.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.sendCollectionReminder(billIds);

      expect(mockRequest.post).toHaveBeenCalledWith('/finance/send-reminder', { billIds });
      expect(result.success).toBe(true);
      expect(Array.isArray(billIds)).toBe(true);
      expect(billIds.length).toBeGreaterThan(0);
    });

    it('should handle empty bill ids array', async () => {
      const mockResponse = { success: true, message: '无缴费单需要催缴' };
      mockRequest.post.mockResolvedValue({ data: mockResponse });

      const result = await financeAPI.sendCollectionReminder([]);
      expect(result.success).toBe(true);
    });

    it('should handle single bill ID', async () => {
      const mockResponse = { success: true, message: '催缴通知发送成功' };
      mockRequest.post.mockResolvedValue({ data: mockResponse });

      const result = await financeAPI.sendCollectionReminder(['1']);
      expect(result.success).toBe(true);
    });
  });

  describe('退费申请API (/finance/refund-applications)', () => {
    it('should get refund applications with validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [
            {
              id: '1',
              studentId: '123',
              studentName: '张小明',
              feeType: '学费',
              originalAmount: 2800,
              refundAmount: 1400,
              reason: '家庭原因退园',
              status: 'pending',
              appliedAt: '2024-01-15T14:00:00.000Z'
            },
            {
              id: '2',
              studentId: '124',
              studentName: '李小红',
              feeType: '餐费',
              originalAmount: 600,
              refundAmount: 300,
              reason: '转园退费',
              status: 'approved',
              appliedAt: '2024-01-14T16:00:00.000Z',
              processedAt: '2024-01-15T09:00:00.000Z',
              processedBy: 'admin',
              remarks: '审核通过'
            }
          ],
          total: 2
        }
      };

      mockRequest.get.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.getRefundApplications();

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/refund-applications');
      expect(result.success).toBe(true);
      expect(result.data.list).toBeDefined();
      expect(Array.isArray(result.data.list)).toBe(true);

      // 验证退费申请数据
      if (result.data.list.length > 0) {
        result.data.list.forEach((application: any) => {
          expect(application.id).toBeTruthy();
          expect(application.studentId).toBeTruthy();
          expect(application.studentName).toBeTruthy();
          expect(application.feeType).toBeTruthy();
          expect(validateAmount(application.originalAmount)).toBe(true);
          expect(validateAmount(application.refundAmount)).toBe(true);
          expect(application.refundAmount).toBeLessThanOrEqual(application.originalAmount);
          expect(['pending', 'approved', 'rejected', 'completed']).toContain(application.status);
          expect(validateDateFormat(application.appliedAt)).toBe(true);
        });
      }
    });

    it('should process refund application with validation', async () => {
      const processData = {
        status: 'approved',
        remarks: '审核通过，同意退费'
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          status: 'approved',
          processedAt: '2024-01-15T15:00:00.000Z',
          processedBy: 'admin',
          remarks: '审核通过，同意退费'
        }
      };

      mockRequest.put.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.processRefundApplication('1', processData);

      expect(mockRequest.put).toHaveBeenCalledWith('/finance/refund-applications/1', processData);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('approved');
      expect(validateDateFormat(result.data.processedAt)).toBe(true);
    });

    it('should handle rejection of refund application', async () => {
      const processData = {
        status: 'rejected',
        remarks: '不符合退费条件'
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          status: 'rejected',
          processedAt: '2024-01-15T15:00:00.000Z',
          processedBy: 'admin',
          remarks: '不符合退费条件'
        }
      };

      mockRequest.put.mockResolvedValue({ data: mockResponse });
      const result = await financeAPI.processRefundApplication('1', processData);

      expect(result.data.status).toBe('rejected');
      expect(result.data.remarks).toBe('不符合退费条件');
    });
  });

  describe('错误处理和边界情况', () => {
    it('should handle network errors gracefully', async () => {
      mockRequest.get.mockRejectedValue(new Error('Network connection failed'));

      await expect(financeAPI.getOverview()).rejects.toThrow('Network connection failed');
    });

    it('should handle timeout errors', async () => {
      mockRequest.get.mockRejectedValue(new Error('Request timeout'));

      await expect(financeAPI.getOverview()).rejects.toThrow('Request timeout');
    });

    it('should handle server error responses', async () => {
      mockRequest.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Server error occurred',
          code: 'INTERNAL_ERROR'
        }
      });

      const result = await financeAPI.getOverview();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Server error occurred');
    });

    it('should handle malformed response data', async () => {
      mockRequest.get.mockResolvedValue({
        data: {
          success: true,
          data: null
        }
      });

      const result = await financeAPI.getOverview();
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle missing required fields', async () => {
      mockRequest.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            monthlyRevenue: 125000,
            // 缺少其他必填字段
          }
        }
      });

      const result = await financeAPI.getOverview();
      const validation = validateFinanceOverview(result.data);
      expect(validation.valid).toBe(false);
      expect(validation.missing.length).toBeGreaterThan(0);
    });

    it('should handle invalid data types', async () => {
      mockRequest.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            monthlyRevenue: 'invalid', // 应该是number
            revenueGrowth: 12.5,
            pendingAmount: 45000,
            pendingCount: 23,
            collectionRate: 85.2,
            paidCount: 156,
            totalCount: 179,
            overdueAmount: 12000,
            overdueCount: 8
          }
        }
      });

      const result = await financeAPI.getOverview();
      const typeValidation = validateFieldTypes(result.data, {
        monthlyRevenue: 'number',
        revenueGrowth: 'number'
        // ... 其他字段
      });
      expect(typeValidation.valid).toBe(false);
    });
  });

  describe('性能测试', () => {
    it('should handle large data sets efficiently', async () => {
      // 生成大量模拟数据
      const largeFeeItems = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        name: `收费项目${i + 1}`,
        category: 'tuition',
        amount: 100 + i,
        period: 'month',
        isRequired: true,
        status: 'active'
      }));

      mockRequest.get.mockResolvedValue({
        data: {
          success: true,
          data: largeFeeItems
        }
      });

      const startTime = performance.now();
      const result = await financeAPI.getFeeItems();
      const endTime = performance.now();

      expect(result.data.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成

      // 验证大数据集的每个项目
      result.data.forEach((item: any) => {
        const validation = validateFeeItem(item);
        expect(validation.valid).toBe(true);
      });
    });

    it('should handle concurrent API requests', async () => {
      const promises = [
        financeAPI.getOverview(),
        financeAPI.getFeeItems(),
        financeAPI.getTodayPayments()
      ];

      mockRequest.get
        .mockResolvedValueOnce({ data: { success: true, data: { monthlyRevenue: 100000 } } })
        .mockResolvedValueOnce({ data: { success: true, data: [] } })
        .mockResolvedValueOnce({ data: { success: true, data: { todayAmount: 0, todayCount: 0, payments: [] } } });

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});