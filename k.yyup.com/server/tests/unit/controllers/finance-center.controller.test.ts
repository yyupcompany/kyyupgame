import { Request, Response } from 'express';
import { FinanceCenterController } from '../../../src/controllers/centers/finance-center.controller';

// Mock Request and Response
const createMockRequest = (query: any = {}, body: any = {}, params: any = {}) => ({
  query,
  body,
  params,
  user: { id: 1, username: 'testuser' }
} as Partial<Request>);

const createMockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('FinanceCenterController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  describe('getFeeItems', () => {
    it('should return fee items successfully', async () => {
      await FinanceCenterController.getFeeItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            name: '保教费',
            category: '基础费用',
            amount: 3000,
            period: '月',
            isRequired: true,
            description: '基础保教服务费用',
            status: 'active'
          }),
          expect.objectContaining({
            id: '2',
            name: '餐费',
            category: '基础费用',
            amount: 500,
            period: '月',
            isRequired: true,
            description: '三餐两点费用',
            status: 'active'
          })
        ]),
        message: '获取收费项目成功'
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error by modifying the method temporarily
      const originalMethod = FinanceCenterController.getFeeItems;
      FinanceCenterController.getFeeItems = async () => {
        throw new Error('Test error');
      };

      await FinanceCenterController.getFeeItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '获取收费项目失败',
        error: 'Test error'
      });

      // Restore original method
      FinanceCenterController.getFeeItems = originalMethod;
      consoleSpy.mockRestore();
    });

    it('should return correct fee items structure', async () => {
      await FinanceCenterController.getFeeItems(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(5);
      
      // Check required fields
      response.data.forEach((item: any) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('amount');
        expect(item).toHaveProperty('period');
        expect(item).toHaveProperty('isRequired');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('status');
      });
    });
  });

  describe('getPaymentRecords', () => {
    it('should return payment records successfully', async () => {
      await FinanceCenterController.getPaymentRecords(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            studentName: '张小明',
            className: '大班A',
            feeItems: ['保教费', '餐费'],
            totalAmount: 3500,
            paymentDate: '2024-01-15',
            paymentMethod: '微信支付',
            status: 'paid'
          })
        ]),
        message: '获取缴费记录成功'
      });
    });

    it('should handle errors in payment records', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const originalMethod = FinanceCenterController.getPaymentRecords;
      FinanceCenterController.getPaymentRecords = async () => {
        throw new Error('Database error');
      };

      await FinanceCenterController.getPaymentRecords(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '获取缴费记录失败',
        error: 'Database error'
      });

      FinanceCenterController.getPaymentRecords = originalMethod;
      consoleSpy.mockRestore();
    });

    it('should return correct payment records structure', async () => {
      await FinanceCenterController.getPaymentRecords(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      
      response.data.forEach((record: any) => {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('studentName');
        expect(record).toHaveProperty('className');
        expect(record).toHaveProperty('feeItems');
        expect(record).toHaveProperty('totalAmount');
        expect(record).toHaveProperty('paymentDate');
        expect(record).toHaveProperty('paymentMethod');
        expect(record).toHaveProperty('status');
      });
    });
  });

  // 财务报表功能已移除，简化财务管理系统

  describe('getEnrollmentFinanceData', () => {
    it('should return enrollment finance data successfully', async () => {
      await FinanceCenterController.getEnrollmentFinanceData(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          enrollmentFees: {
            registrationFee: 500,
            depositFee: 2000,
            totalCollected: 45000
          },
          newStudentPayments: expect.arrayContaining([
            expect.objectContaining({
              studentName: '王小华',
              enrollmentDate: '2024-01-10',
              feesCollected: 2500,
              status: 'completed'
            })
          ])
        },
        message: '获取招生财务联动数据成功'
      });
    });

    it('should handle errors in enrollment finance data', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const originalMethod = FinanceCenterController.getEnrollmentFinanceData;
      FinanceCenterController.getEnrollmentFinanceData = async () => {
        throw new Error('Enrollment finance error');
      };

      await FinanceCenterController.getEnrollmentFinanceData(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '获取招生财务联动数据失败',
        error: 'Enrollment finance error'
      });

      FinanceCenterController.getEnrollmentFinanceData = originalMethod;
      consoleSpy.mockRestore();
    });

    it('should return correct enrollment finance data structure', async () => {
      await FinanceCenterController.getEnrollmentFinanceData(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('enrollmentFees');
      expect(response.data).toHaveProperty('newStudentPayments');
      
      expect(response.data.enrollmentFees).toHaveProperty('registrationFee');
      expect(response.data.enrollmentFees).toHaveProperty('depositFee');
      expect(response.data.enrollmentFees).toHaveProperty('totalCollected');
      
      expect(Array.isArray(response.data.newStudentPayments)).toBe(true);
      
      response.data.newStudentPayments.forEach((payment: any) => {
        expect(payment).toHaveProperty('studentName');
        expect(payment).toHaveProperty('enrollmentDate');
        expect(payment).toHaveProperty('feesCollected');
        expect(payment).toHaveProperty('status');
      });
    });
  });

  describe('Error Handling Consistency', () => {
    it('should handle all error types consistently across methods', async () => {
      const methods = [
        FinanceCenterController.getFeeItems,
        FinanceCenterController.getPaymentRecords,
        FinanceCenterController.getEnrollmentFinanceData
      ];

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      for (const method of methods) {
        jest.clearAllMocks();
        
        // Temporarily replace method to force error
        const originalMethod = method;
        const errorMethod = async () => {
          throw new Error('Consistent test error');
        };

        await errorMethod(
          mockRequest as Request,
          mockResponse as Response
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: expect.stringContaining('失败'),
          error: 'Consistent test error'
        });
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent response format across all methods', async () => {
      const methods = [
        { method: FinanceCenterController.getFeeItems, expectedMessage: '获取收费项目成功' },
        { method: FinanceCenterController.getPaymentRecords, expectedMessage: '获取缴费记录成功' },
        { method: FinanceCenterController.getEnrollmentFinanceData, expectedMessage: '获取招生财务联动数据成功' }
      ];

      for (const { method, expectedMessage } of methods) {
        jest.clearAllMocks();
        
        await method(
          mockRequest as Request,
          mockResponse as Response
        );

        const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
        
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('message');
        expect(response.success).toBe(true);
        expect(response.message).toBe(expectedMessage);
      }
    });
  });
});