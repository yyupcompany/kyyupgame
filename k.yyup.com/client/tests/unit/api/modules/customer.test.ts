/**
 * 客户管理模块API测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock request functions
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

// Import after mocks
import { customerApi, getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '@/api/modules/customer';
import { get, post, put, del } from '@/utils/request';

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);
const mockedPut = vi.mocked(put);
const mockedDel = vi.mocked(del);

// 控制台错误检测变量
let consoleSpy: any

describe('Customer API', () => {
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

  describe('getCustomers', () => {
    it('should get customers with query parameters', async () => {
      const mockParams = {
        page: 1,
        pageSize: 10,
        name: '张',
        type: 'POTENTIAL',
        status: 'ACTIVE'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: '1',
              name: '张三',
              phone: '13800138000',
              type: 'POTENTIAL',
              status: 'ACTIVE',
              source: '线上推广'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomers(mockParams);

      // 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/customers', { params: mockParams });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
      expect(paginationValidation.valid).toBe(true);

      // 验证列表项
      if (result.data.items.length > 0) {
        const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'name', 'phone', 'type', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.items[0], {
          id: 'string',
          name: 'string',
          phone: 'string',
          type: 'string',
          status: 'string'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get customers without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomers();

      expect(mockedGet).toHaveBeenCalledWith('/customers', { params: undefined });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCustomer', () => {
    it('should get customer by ID', async () => {
      const customerId = '1';
      const mockResponse = {
        success: true,
        data: {
          id: customerId,
          name: '张三',
          phone: '13800138000',
          email: 'zhangsan@example.com',
          type: 'POTENTIAL',
          status: 'ACTIVE',
          source: '线上推广',
          children: [
            {
              name: '小明',
              age: 4,
              gender: 'male'
            }
          ]
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomer(customerId);

      expect(mockedGet).toHaveBeenCalledWith(`/customers/${customerId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: '李四',
        phone: '13900139000',
        email: 'lisi@example.com',
        type: 'POTENTIAL' as const,
        source: '线下活动',
        children: [
          {
            name: '小红',
            age: 3,
            gender: 'female' as const
          }
        ]
      };
      const mockResponse = {
        success: true,
        data: {
          id: '2',
          ...customerData,
          status: 'ACTIVE',
          createdAt: '2024-09-01T00:00:00Z',
          updatedAt: '2024-09-01T00:00:00Z'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await customerApi.createCustomer(customerData);

      expect(mockedPost).toHaveBeenCalledWith('/customers', customerData);
      expect(result).toEqual(mockResponse);
    });

    it('should create customer with minimal data', async () => {
      const minimalData = {
        name: '王五',
        phone: '13700137000',
        type: 'ENROLLED' as const,
        source: '推荐'
      };
      const mockResponse = {
        success: true,
        data: {
          id: '3',
          ...minimalData,
          status: 'ACTIVE'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await customerApi.createCustomer(minimalData);

      expect(mockedPost).toHaveBeenCalledWith('/customers', minimalData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer information', async () => {
      const customerId = '1';
      const updateData = {
        name: '张三 (更新)',
        email: 'zhangsan_new@example.com',
        status: 'INACTIVE' as const
      };
      const mockResponse = {
        success: true,
        data: {
          id: customerId,
          ...updateData
        }
      };

      mockedPut.mockResolvedValue(mockResponse);
      const result = await customerApi.updateCustomer(customerId, updateData);

      expect(mockedPut).toHaveBeenCalledWith(`/customers/${customerId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should update customer with partial data', async () => {
      const customerId = '1';
      const partialUpdate = {
        phone: '13800138001'
      };
      const mockResponse = {
        success: true,
        data: {
          id: customerId,
          phone: '13800138001'
        }
      };

      mockedPut.mockResolvedValue(mockResponse);
      const result = await customerApi.updateCustomer(customerId, partialUpdate);

      expect(mockedPut).toHaveBeenCalledWith(`/customers/${customerId}`, partialUpdate);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      const customerId = '1';
      const mockResponse = {
        success: true,
        message: 'Customer deleted successfully'
      };

      mockedDel.mockResolvedValue(mockResponse);
      const result = await customerApi.deleteCustomer(customerId);

      expect(mockedDel).toHaveBeenCalledWith(`/customers/${customerId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCustomerStats', () => {
    it('should get customer statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          total: 150,
          byType: {
            POTENTIAL: 50,
            ENROLLED: 80,
            GRADUATED: 20
          },
          byStatus: {
            ACTIVE: 120,
            INACTIVE: 25,
            BLACKLISTED: 5
          },
          bySource: {
            '线上推广': 60,
            '线下活动': 40,
            '推荐': 30,
            '其他': 20
          }
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomerStats();

      expect(mockedGet).toHaveBeenCalledWith('/customers/stats');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('importCustomers', () => {
    it('should import customers from file', async () => {
      const mockFile = new File(['test data'], 'customers.csv', { type: 'text/csv' });
      const mockResponse = {
        success: true,
        data: {
          success: 95,
          failed: 5,
          errors: [
            'Row 10: Phone number is required',
            'Row 25: Invalid email format'
          ]
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await customerApi.importCustomers(mockFile);

      // Verify FormData is created correctly
      expect(mockedPost).toHaveBeenCalled();
      expect(mockedPost.mock.calls[0][0]).toBe('/customers/import');
      expect(result).toEqual(mockResponse);

      // Verify the call was made with FormData
      const callArgs = mockedPost.mock.calls[0];
      expect(callArgs[1]).toBeInstanceOf(FormData);
    });

    it('should handle import with no errors', async () => {
      const mockFile = new File(['test data'], 'customers.csv', { type: 'text/csv' });
      const mockResponse = {
        success: true,
        data: {
          success: 100,
          failed: 0,
          errors: []
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await customerApi.importCustomers(mockFile);

      expect(result).toEqual(mockResponse);
      expect(result.data.failed).toBe(0);
      expect(result.data.errors).toHaveLength(0);
    });
  });

  describe('Compatibility Exports', () => {
    it('should export compatible functions that work the same as API object methods', async () => {
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockedGet.mockResolvedValue(mockResponse);

      // Test each compatibility export
      await getCustomers();
      expect(mockedGet).toHaveBeenCalledWith('/customers', { params: undefined });

      mockedGet.mockClear();
      await getCustomer('1');
      expect(mockedGet).toHaveBeenCalledWith('/customers/1');

      const createData = { name: 'Test', phone: '123', type: 'POTENTIAL' as const, source: 'test' };
      mockedPost.mockResolvedValue(mockResponse);
      await createCustomer(createData);
      expect(mockedPost).toHaveBeenCalledWith('/customers', createData);

      const updateData = { name: 'Updated' };
      mockedPut.mockResolvedValue(mockResponse);
      await updateCustomer('1', updateData);
      expect(mockedPut).toHaveBeenCalledWith('/customers/1', updateData);

      mockedDel.mockResolvedValue(mockResponse);
      await deleteCustomer('1');
      expect(mockedDel).toHaveBeenCalledWith('/customers/1');
    });
  });

  describe('Enum Testing', () => {
    it('should handle CustomerType enum values correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            { id: '1', type: 'POTENTIAL' },
            { id: '2', type: 'ENROLLED' },
            { id: '3', type: 'GRADUATED' }
          ],
          total: 3
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomers();

      expect(result.data.items).toHaveLength(3);
      expect(result.data.items[0].type).toBe('POTENTIAL');
      expect(result.data.items[1].type).toBe('ENROLLED');
      expect(result.data.items[2].type).toBe('GRADUATED');
    });

    it('should handle CustomerStatus enum values correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            { id: '1', status: 'ACTIVE' },
            { id: '2', status: 'INACTIVE' },
            { id: '3', status: 'BLACKLISTED' }
          ],
          total: 3
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomers();

      expect(result.data.items).toHaveLength(3);
      expect(result.data.items[0].status).toBe('ACTIVE');
      expect(result.data.items[1].status).toBe('INACTIVE');
      expect(result.data.items[2].status).toBe('BLACKLISTED');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      mockedGet.mockRejectedValue(new Error(errorMessage));

      await expect(customerApi.getCustomers()).rejects.toThrow(errorMessage);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Validation failed: Phone number is required'
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await customerApi.createCustomer({
        name: 'Test',
        phone: '',
        type: 'POTENTIAL' as const,
        source: 'test'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Phone number is required');
    });

    it('should handle not found errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Customer not found'
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomer('999');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Customer not found');
    });
  });

  describe('Data Structure Validation', () => {
    it('should validate customer data structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          name: '张三',
          phone: '13800138000',
          email: 'zhangsan@example.com',
          address: '北京市朝阳区',
          type: 'POTENTIAL',
          status: 'ACTIVE',
          source: '线上推广',
          notes: '重要客户',
          children: [
            {
              name: '小明',
              age: 4,
              gender: 'male'
            },
            {
              name: '小红',
              age: 3,
              gender: 'female'
            }
          ],
          createdAt: '2024-09-01T00:00:00Z',
          updatedAt: '2024-09-01T00:00:00Z'
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await customerApi.getCustomer('1');

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('phone');
      expect(result.data).toHaveProperty('type');
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('source');
      expect(result.data).toHaveProperty('children');
      expect(Array.isArray(result.data.children)).toBe(true);
      expect(result.data.children).toHaveLength(2);
    });
  });
});