/**
 * 招生财务联动API测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock request function
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

// Import after mocks
import api from '@/api/modules/enrollmentFinance';
import request from '@/utils/request';

const mockedGet = vi.mocked(request.get);
const mockedPost = vi.mocked(request.post);
const mockedPut = vi.mocked(request.put);

// 控制台错误检测变量
let consoleSpy: any

describe('Enrollment Finance API', () => {
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

  describe('getEnrollmentFinanceLinkages', () => {
    it('should get enrollment finance linkages with parameters', async () => {
      const params = {
        status: 'approved',
        className: '小班一班',
        dateRange: ['2024-09-01', '2024-09-30'],
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        success: true,
        data: {
          list: [
            {
              enrollmentId: 'E2024001',
              studentId: 'S2024001',
              studentName: '张小明',
              className: '小班一班',
              enrollmentStatus: 'approved',
              financialStatus: 'pending_payment',
              feePackage: {
                id: 'PKG001',
                name: '新生入园套餐',
                items: [
                  { feeId: 'F001', feeName: '保教费', amount: 3000, period: '2024年3月' }
                ],
                totalAmount: 3850,
                discountAmount: 50,
                finalAmount: 3800
              },
              paymentBillId: 'B2024001',
              enrollmentDate: '2024-03-01T10:00:00Z',
              paymentDueDate: '2024-02-28T23:59:59Z'
            }
          ],
          total: 1
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentFinanceLinkages(params);

      // 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/enrollment-finance/linkages', { params });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.list)).toBe(true);

      // 验证分页字段
      const validation = validateRequiredFields(result.data, ['list', 'total']);
      expect(validation.valid).toBe(true);

      // 验证列表项
      if (result.data.list.length > 0) {
        const itemValidation = validateRequiredFields(result.data.list[0], ['enrollmentId', 'studentId', 'studentName', 'enrollmentStatus']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.list[0], {
          enrollmentId: 'string',
          studentId: 'string',
          studentName: 'string',
          enrollmentStatus: 'string'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get enrollment finance linkages without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [],
          total: 0
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentFinanceLinkages();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-finance/linkages', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors and return mock data', async () => {
      const errorMessage = 'Network Error';
      mockedGet.mockRejectedValue(new Error(errorMessage));

      await expect(api.getEnrollmentFinanceLinkages()).rejects.toThrow(errorMessage);
    });
  });

  describe('getFeePackageTemplates', () => {
    it('should get fee package templates with grade filter', async () => {
      const grade = '小班';
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'TPL001',
            name: '小班新生套餐',
            description: '适用于小班新入园学生',
            targetGrade: '小班',
            items: [
              { feeId: 'F001', feeName: '保教费', amount: 3000, period: '月', isRequired: true }
            ],
            totalAmount: 3900,
            discountRate: 0.02,
            isActive: true
          }
        ]
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getFeePackageTemplates(grade);

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-finance/fee-package-templates', {
        params: { grade }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get all fee package templates without grade filter', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getFeePackageTemplates();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-finance/fee-package-templates', {
        params: {}
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors and return mock templates', async () => {
      mockedGet.mockRejectedValue(new Error('API Error'));

      await expect(api.getFeePackageTemplates()).rejects.toThrow('API Error');
    });
  });

  describe('generatePaymentBillForEnrollment', () => {
    it('should generate payment bill for enrollment', async () => {
      const data = {
        enrollmentId: 'E2024001',
        templateId: 'TPL001',
        customItems: [
          { feeId: 'F001', amount: 3000, period: '2024年3月' }
        ],
        discountAmount: 100,
        dueDate: '2024-03-15'
      };
      const mockResponse = {
        success: true,
        data: {
          billId: 'B2024001',
          finalAmount: 3700
        }
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.generatePaymentBillForEnrollment(data);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-finance/generate-bill', data);
      expect(result).toEqual(mockResponse);
    });

    it('should generate payment bill with minimal data', async () => {
      const minimalData = {
        enrollmentId: 'E2024001',
        templateId: 'TPL001'
      };
      const mockResponse = {
        success: true,
        data: {
          billId: 'B2024001',
          finalAmount: 3850
        }
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.generatePaymentBillForEnrollment(minimalData);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-finance/generate-bill', minimalData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const data = {
        enrollmentId: 'E2024001',
        templateId: 'TPL001'
      };
      const errorMessage = 'Failed to generate bill';
      mockedPost.mockRejectedValue(new Error(errorMessage));

      await expect(api.generatePaymentBillForEnrollment(data)).rejects.toThrow(errorMessage);
    });
  });

  describe('onEnrollmentApproved', () => {
    it('should handle enrollment approval', async () => {
      const enrollmentId = 'E2024001';
      const mockResponse = {
        success: true,
        data: null
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.onEnrollmentApproved(enrollmentId);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-finance/enrollment-approved/${enrollmentId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const enrollmentId = 'E2024001';
      const errorMessage = 'Approval processing failed';
      mockedPost.mockRejectedValue(new Error(errorMessage));

      await expect(api.onEnrollmentApproved(enrollmentId)).rejects.toThrow(errorMessage);
    });
  });

  describe('getEnrollmentPaymentProcess', () => {
    it('should get enrollment payment process', async () => {
      const enrollmentId = 'E2024001';
      const mockResponse = {
        success: true,
        data: {
          enrollmentId,
          currentStep: 'payment',
          steps: [
            {
              step: 'application',
              status: 'completed',
              completedAt: '2024-02-15T10:00:00Z',
              description: '提交入园申请'
            },
            {
              step: 'payment',
              status: 'in_progress',
              description: '缴费确认'
            }
          ],
          nextAction: {
            type: 'confirm_payment',
            description: '等待家长缴费或确认收款',
            dueDate: '2024-02-28T23:59:59Z'
          }
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentPaymentProcess(enrollmentId);

      expect(mockedGet).toHaveBeenCalledWith(`/enrollment-finance/process/${enrollmentId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors and return mock process data', async () => {
      const enrollmentId = 'E2024001';
      mockedGet.mockRejectedValue(new Error('API Error'));

      const result = await api.getEnrollmentPaymentProcess(enrollmentId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('使用模拟数据');
      expect(result.data.enrollmentId).toBe(enrollmentId);
      expect(Array.isArray(result.data.steps)).toBe(true);
    });
  });

  describe('confirmPaymentAndEnroll', () => {
    it('should confirm payment and enroll student', async () => {
      const data = {
        enrollmentId: 'E2024001',
        billId: 'B2024001',
        paymentAmount: 3800,
        paymentMethod: 'cash',
        paymentDate: '2024-03-01'
      };
      const mockResponse = {
        success: true,
        data: null
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.confirmPaymentAndEnroll(data);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-finance/confirm-payment-enroll', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const data = {
        enrollmentId: 'E2024001',
        billId: 'B2024001',
        paymentAmount: 3800,
        paymentMethod: 'bank_transfer'
      };
      const errorMessage = 'Payment confirmation failed';
      mockedPost.mockRejectedValue(new Error(errorMessage));

      await expect(api.confirmPaymentAndEnroll(data)).rejects.toThrow(errorMessage);
    });
  });

  describe('batchGenerateSemesterBills', () => {
    it('should batch generate semester bills', async () => {
      const data = {
        semester: '2024春季',
        studentIds: ['S2024001', 'S2024002'],
        templateId: 'TPL001',
        dueDate: '2024-03-15'
      };
      const mockResponse = {
        success: true,
        data: {
          generatedCount: 2,
          failedCount: 0
        }
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.batchGenerateSemesterBills(data);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-finance/batch-generate-semester-bills', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle batch generation with class names', async () => {
      const data = {
        semester: '2024春季',
        classNames: ['小班一班', '小班二班'],
        templateId: 'TPL001',
        dueDate: '2024-03-15'
      };
      const mockResponse = {
        success: true,
        data: {
          generatedCount: 60,
          failedCount: 2
        }
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.batchGenerateSemesterBills(data);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-finance/batch-generate-semester-bills', data);
      expect(result.data.generatedCount).toBe(60);
      expect(result.data.failedCount).toBe(2);
    });

    it('should handle API errors', async () => {
      const data = {
        semester: '2024春季',
        templateId: 'TPL001',
        dueDate: '2024-03-15'
      };
      const errorMessage = 'Batch generation failed';
      mockedPost.mockRejectedValue(new Error(errorMessage));

      await expect(api.batchGenerateSemesterBills(data)).rejects.toThrow(errorMessage);
    });
  });

  describe('getEnrollmentFinanceStats', () => {
    it('should get enrollment finance statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalEnrollments: 156,
          paidEnrollments: 142,
          pendingPayments: 14,
          overduePayments: 3,
          totalRevenue: 554600,
          averagePaymentTime: 2.5,
          conversionRate: 91.0
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentFinanceStats();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-finance/stats');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors and return mock stats', async () => {
      mockedGet.mockRejectedValue(new Error('API Error'));

      await expect(api.getEnrollmentFinanceStats()).rejects.toThrow('API Error');
    });
  });

  describe('sendPaymentReminder', () => {
    it('should send payment reminder to parents', async () => {
      const enrollmentIds = ['E2024001', 'E2024002'];
      const mockResponse = {
        success: true,
        data: null
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.sendPaymentReminder(enrollmentIds);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-finance/send-payment-reminder', {
        enrollmentIds
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const enrollmentIds = ['E2024001'];
      const errorMessage = 'Failed to send reminder';
      mockedPost.mockRejectedValue(new Error(errorMessage));

      await expect(api.sendPaymentReminder(enrollmentIds)).rejects.toThrow(errorMessage);
    });
  });

  describe('createFeePackageTemplate', () => {
    it('should create fee package template', async () => {
      const templateData = {
        name: '测试套餐',
        description: '用于测试的套餐',
        targetGrade: '小班',
        items: [
          { feeId: 'F001', feeName: '保教费', amount: 3000, period: '月', isRequired: true }
        ],
        totalAmount: 3000,
        discountRate: 0.05,
        isActive: true
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'TPL004',
          ...templateData
        }
      };

      mockedPost.mockResolvedValue({ data: mockResponse });
      const result = await api.createFeePackageTemplate(templateData);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-finance/fee-package-templates', templateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const templateData = {
        name: '测试套餐',
        targetGrade: '小班',
        items: [],
        totalAmount: 0,
        isActive: true
      };
      const errorMessage = 'Template creation failed';
      mockedPost.mockRejectedValue(new Error(errorMessage));

      await expect(api.createFeePackageTemplate(templateData)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateFeePackageTemplate', () => {
    it('should update fee package template', async () => {
      const templateId = 'TPL001';
      const updateData = {
        name: '更新后的套餐名称',
        discountRate: 0.1
      };
      const mockResponse = {
        success: true,
        data: {
          id: templateId,
          ...updateData
        }
      };

      mockedPut.mockResolvedValue({ data: mockResponse });
      const result = await api.updateFeePackageTemplate(templateId, updateData);

      expect(mockedPut).toHaveBeenCalledWith(`/enrollment-finance/fee-package-templates/${templateId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const templateId = 'TPL001';
      const updateData = { name: '新名称' };
      const errorMessage = 'Template update failed';
      mockedPut.mockRejectedValue(new Error(errorMessage));

      await expect(api.updateFeePackageTemplate(templateId, updateData)).rejects.toThrow(errorMessage);
    });
  });

  describe('getEnrollmentFinanceConfig', () => {
    it('should get enrollment finance configuration', async () => {
      const mockResponse = {
        success: true,
        data: {
          autoGenerateBill: true,
          defaultPaymentDays: 7,
          reminderDays: [7, 3, 1],
          overdueGraceDays: 3,
          requirePaymentBeforeEnrollment: true
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentFinanceConfig();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-finance/config');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors and return default config', async () => {
      mockedGet.mockRejectedValue(new Error('API Error'));

      const result = await api.getEnrollmentFinanceConfig();

      expect(result.success).toBe(true);
      expect(result.message).toBe('使用默认配置');
      expect(result.data.autoGenerateBill).toBe(true);
      expect(result.data.defaultPaymentDays).toBe(7);
      expect(Array.isArray(result.data.reminderDays)).toBe(true);
      expect(result.data.requirePaymentBeforeEnrollment).toBe(true);
    });
  });

  describe('Data Structure Validation', () => {
    it('should validate enrollment finance linkage structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [
            {
              enrollmentId: 'E2024001',
              studentId: 'S2024001',
              studentName: '张小明',
              className: '小班一班',
              enrollmentStatus: 'approved',
              financialStatus: 'pending_payment',
              feePackage: {
                id: 'PKG001',
                name: '新生入园套餐',
                items: [],
                totalAmount: 3850,
                finalAmount: 3800
              },
              enrollmentDate: '2024-03-01T10:00:00Z'
            }
          ],
          total: 1
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentFinanceLinkages();

      expect(result.data.list[0]).toHaveProperty('enrollmentId');
      expect(result.data.list[0]).toHaveProperty('studentId');
      expect(result.data.list[0]).toHaveProperty('enrollmentStatus');
      expect(result.data.list[0]).toHaveProperty('financialStatus');
      expect(result.data.list[0]).toHaveProperty('feePackage');
      expect(Array.isArray(result.data.list[0].feePackage.items)).toBe(true);
    });

    it('should validate fee package template structure', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'TPL001',
            name: '小班新生套餐',
            targetGrade: '小班',
            items: [
              { feeId: 'F001', feeName: '保教费', amount: 3000, period: '月', isRequired: true }
            ],
            totalAmount: 3900,
            discountRate: 0.02,
            isActive: true
          }
        ]
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getFeePackageTemplates();

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('targetGrade');
      expect(result.data[0]).toHaveProperty('items');
      expect(result.data[0]).toHaveProperty('totalAmount');
      expect(result.data[0]).toHaveProperty('isActive');
      expect(Array.isArray(result.data[0].items)).toBe(true);
      expect(typeof result.data[0].totalAmount).toBe('number');
    });

    it('should validate payment process structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          enrollmentId: 'E2024001',
          currentStep: 'payment',
          steps: [
            {
              step: 'application',
              status: 'completed',
              description: '提交入园申请'
            }
          ],
          nextAction: {
            type: 'confirm_payment',
            description: '等待家长缴费',
            dueDate: '2024-03-15'
          }
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentPaymentProcess('E2024001');

      expect(result.data).toHaveProperty('enrollmentId');
      expect(result.data).toHaveProperty('currentStep');
      expect(result.data).toHaveProperty('steps');
      expect(result.data).toHaveProperty('nextAction');
      expect(Array.isArray(result.data.steps)).toBe(true);
      expect(result.data.steps[0]).toHaveProperty('step');
      expect(result.data.steps[0]).toHaveProperty('status');
      expect(result.data.nextAction).toHaveProperty('type');
    });
  });

  describe('Enum Testing', () => {
    it('should handle enrollment status enum values', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [
            { enrollmentStatus: 'pending' },
            { enrollmentStatus: 'approved' },
            { enrollmentStatus: 'rejected' }
          ],
          total: 3
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentFinanceLinkages();

      expect(result.data.list[0].enrollmentStatus).toBe('pending');
      expect(result.data.list[1].enrollmentStatus).toBe('approved');
      expect(result.data.list[2].enrollmentStatus).toBe('rejected');
    });

    it('should handle financial status enum values', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [
            { financialStatus: 'not_generated' },
            { financialStatus: 'pending_payment' },
            { financialStatus: 'paid' },
            { financialStatus: 'overdue' }
          ],
          total: 4
        }
      };

      mockedGet.mockResolvedValue({ data: mockResponse });
      const result = await api.getEnrollmentFinanceLinkages();

      expect(result.data.list[0].financialStatus).toBe('not_generated');
      expect(result.data.list[1].financialStatus).toBe('pending_payment');
      expect(result.data.list[2].financialStatus).toBe('paid');
      expect(result.data.list[3].financialStatus).toBe('overdue');
    });
  });
});