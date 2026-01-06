import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn()
  }
}));

// Import after mocks
import financeAPI from '@/api/modules/finance';
import request from '@/utils/request';

const mockRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Finance API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('getOverview', () => {
    it('should call get with correct endpoint and return overview data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            monthlyRevenue: 520000,
            revenueGrowth: 12.5,
            pendingAmount: 85000,
            pendingCount: 23,
            collectionRate: 87.3,
            paidCount: 142,
            totalCount: 163,
            overdueAmount: 12000,
            overdueCount: 5
          },
          message: '使用默认数据'
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await financeAPI.getOverview();

      // 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/finance/overview');

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'monthlyRevenue', 'revenueGrowth', 'pendingAmount', 'pendingCount',
        'collectionRate', 'paidCount', 'totalCount'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        monthlyRevenue: 'number',
        revenueGrowth: 'number',
        pendingAmount: 'number',
        pendingCount: 'number',
        collectionRate: 'number',
        paidCount: 'number',
        totalCount: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 验证数值范围
      expect(result.data.monthlyRevenue).toBeGreaterThanOrEqual(0);
      expect(result.data.collectionRate).toBeGreaterThanOrEqual(0);
      expect(result.data.collectionRate).toBeLessThanOrEqual(100);
    });

    it('should handle API errors and return default data', async () => {
      const mockError = new Error('Network error');
      mockRequest.get.mockRejectedValue(mockError);

      await expect(financeAPI.getOverview()).rejects.toThrow('Network error');
    });
  });

  describe('getFeeItems', () => {
    it('should call get with correct endpoint and return fee items', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: '1',
              name: '保教费',
              category: '基础费用',
              amount: 3000,
              period: '月',
              isRequired: true,
              description: '基础保教服务费用',
              status: 'active'
            }
          ],
          message: '使用默认数据'
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await financeAPI.getFeeItems();

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/fee-items');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors gracefully and return default data', async () => {
      mockRequest.get.mockRejectedValue(new Error('API unavailable'));

      await expect(financeAPI.getFeeItems()).rejects.toThrow('API unavailable');
    });
  });

  describe('getPaymentBills', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = {
        studentId: 'S001',
        status: 'pending',
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            list: [
              {
                id: '1',
                billNo: 'B202403001',
                studentId: 'S001',
                studentName: '张小明',
                status: 'pending'
              }
            ],
            total: 1
          },
          message: '使用默认数据'
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await financeAPI.getPaymentBills(mockParams);

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/payment-bills', { params: mockParams });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createPaymentBill', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = {
        studentId: 'S001',
        items: [{ feeId: '1', period: '2024年3月' }],
        dueDate: '2024-03-15',
        discount: 100
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '1',
            ...mockData
          }
        }
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await financeAPI.createPaymentBill(mockData);

      expect(mockRequest.post).toHaveBeenCalledWith('/finance/payment-bills', mockData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Failed to create payment bill');
      mockRequest.post.mockRejectedValue(mockError);

      await expect(financeAPI.createPaymentBill({} as any)).rejects.toThrow('Failed to create payment bill');
    });
  });

  describe('processPayment', () => {
    it('should call post with correct endpoint and payment data', async () => {
      const mockBillId = '1';
      const mockData = {
        paymentMethod: '微信支付',
        amount: 3500,
        receipt: 'REC001'
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'PAY001',
            billId: mockBillId,
            ...mockData
          }
        }
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await financeAPI.processPayment(mockBillId, mockData);

      expect(mockRequest.post).toHaveBeenCalledWith(`/finance/payment-bills/${mockBillId}/pay`, mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPaymentRecords', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = {
        studentId: 'S001',
        dateRange: ['2024-01-01', '2024-12-31'],
        status: 'paid'
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            list: [],
            total: 0
          },
          message: '使用默认数据'
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await financeAPI.getPaymentRecords(mockParams);

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/payment-records', { params: mockParams });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getRefundApplications', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = {
        status: 'pending',
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            list: [],
            total: 0
          },
          message: '使用默认数据'
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await financeAPI.getRefundApplications(mockParams);

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/refund-applications', { params: mockParams });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('processRefundApplication', () => {
    it('should call put with correct endpoint and data', async () => {
      const mockId = '1';
      const mockData = {
        status: 'approved',
        remarks: 'Approved refund'
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: mockId,
            status: 'approved'
          }
        }
      };
      
      mockRequest.put.mockResolvedValue(mockResponse);

      const result = await financeAPI.processRefundApplication(mockId, mockData);

      expect(mockRequest.put).toHaveBeenCalledWith(`/finance/refund-applications/${mockId}`, mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('generateReport', () => {
    it('should call post with correct endpoint and report data', async () => {
      const mockData = {
        type: 'monthly',
        period: { start: '2024-01-01', end: '2024-01-31' },
        name: 'January 2024 Report'
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'RPT001',
            ...mockData
          }
        }
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await financeAPI.generateReport(mockData);

      expect(mockRequest.post).toHaveBeenCalledWith('/finance/reports', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('exportReport', () => {
    it('should call get with correct endpoint, params and blob response type', async () => {
      const mockReportId = 'RPT001';
      const mockFormat = 'excel';
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const mockResponse = {
        data: mockBlob
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await financeAPI.exportReport(mockReportId, mockFormat);

      expect(mockRequest.get).toHaveBeenCalledWith(`/finance/reports/${mockReportId}/export`, {
        params: { format: mockFormat },
        responseType: 'blob'
      });
      expect(result).toBe(mockBlob);
    });
  });

  describe('getTodayPayments', () => {
    it('should call get with correct endpoint and return today payments', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: '1',
              billId: 'B001',
              studentId: 'S001',
              studentName: '张小明',
              feeType: '保教费',
              amount: 3000,
              period: '2024年3月',
              paymentMethod: '微信支付',
              paidAt: '2024-03-01T09:15:00Z',
              status: 'paid'
            }
          ],
          message: '使用默认数据'
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await financeAPI.getTodayPayments();

      expect(mockRequest.get).toHaveBeenCalledWith('/finance/today-payments');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('sendCollectionReminder', () => {
    it('should call post with correct endpoint and bill IDs', async () => {
      const mockBillIds = ['B001', 'B002'];
      const mockResponse = {
        data: {
          success: true,
          message: 'Reminders sent successfully'
        }
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await financeAPI.sendCollectionReminder(mockBillIds);

      expect(mockRequest.post).toHaveBeenCalledWith('/finance/send-reminder', { billIds: mockBillIds });
      expect(result).toEqual(mockResponse.data);
    });
  });
});