import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  getTeacherList,
  getTeacherDetail,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  searchTeachers,
  getTeacherClasses,
  TeacherStatus,
  TeacherPosition,
  TeacherType,
  type Teacher,
  type TeacherCreateParams,
  type TeacherQueryParams,
  type TeacherBrief,

  // 教师客户管理相关API
  getTeacherCustomerStats,
  getTeacherCustomerList,
  addCustomerFollowRecord,
  updateCustomerStatus,
  getCustomerFollowRecords
} from '@/api/modules/teacher';
import { get, post, put, del } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation';

// Mock the request module and dependencies
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));
vi.mock('@/utils/dataTransform', () => ({
  transformListResponse: vi.fn((response, transformFn) => ({
    ...response,
    data: response.data ? transformFn(response.data) : undefined
  })),
  transformTeacherData: vi.fn((data) => data)
}));

// Import mocked functions for verification
import { transformListResponse, transformTeacherData } from '@/utils/dataTransform';

// 控制台错误检测变量
let consoleSpy: any

describe('Teacher API', () => {
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

  describe('教师管理API', () => {
    describe('getTeacherList', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams: TeacherQueryParams = {
          page: 1,
          pageSize: 10,
          keyword: 'test',
          status: TeacherStatus.ACTIVE,
          position: TeacherPosition.HEAD_TEACHER,
          type: TeacherType.FULL_TIME
        };
        const mockResponse = {
          success: true,
          data: {
            items: [{
              id: 1,
              name: 'Test Teacher',
              status: TeacherStatus.ACTIVE,
              position: TeacherPosition.HEAD_TEACHER,
              type: TeacherType.FULL_TIME
            }],
            total: 1,
            page: 1,
            pageSize: 10
          }
        };

        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await getTeacherList(mockParams);

        // 验证API调用
        expect(get).toHaveBeenCalledWith('/teachers', mockParams);

        // 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data.items)).toBe(true);

        // 验证分页字段
        const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
        expect(paginationValidation.valid).toBe(true);

        // 验证列表项
        if (result.data.items.length > 0) {
          const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'name', 'status']);
          expect(itemValidation.valid).toBe(true);

          const itemTypeValidation = validateFieldTypes(result.data.items[0], {
            id: 'number',
            name: 'string',
            status: 'string'
          });
          expect(itemTypeValidation.valid).toBe(true);

          // 验证枚举值
          expect(validateEnumValue(result.data.items[0].status, TeacherStatus)).toBe(true);
        }
      });

      it('should handle empty params', async () => {
        const mockResponse = {
          success: true,
          data: {
            items: [],
            total: 0
          }
        };

        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await getTeacherList();

        expect(get).toHaveBeenCalledWith('/teachers', undefined);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getTeacherDetail', () => {
      it('should call get with correct endpoint and id', async () => {
        const mockId = '123';
        const mockResponse = {
          success: true,
          data: {
            id: mockId,
            name: 'Test Teacher',
            email: 'teacher@example.com',
            phone: '13800138000',
            status: TeacherStatus.ACTIVE,
            position: TeacherPosition.HEAD_TEACHER,
            type: TeacherType.FULL_TIME
          }
        };

        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await getTeacherDetail(mockId);

        // 验证API调用
        expect(get).toHaveBeenCalledWith(`/teachers/${mockId}`);

        // 验证响应结构
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // 验证必填字段
        const validation = validateRequiredFields(result.data, ['id', 'name', 'status']);
        expect(validation.valid).toBe(true);

        // 验证字段类型
        const typeValidation = validateFieldTypes(result.data, {
          id: 'string',
          name: 'string',
          email: 'string',
          status: 'string'
        });
        expect(typeValidation.valid).toBe(true);

        // 验证枚举值
        expect(validateEnumValue(result.data.status, TeacherStatus)).toBe(true);

        expect(get).toHaveBeenCalledWith(`/teachers/${mockId}`);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createTeacher', () => {
      it('should call post with correct endpoint and data', async () => {
        const mockData: TeacherCreateParams = {
          name: 'New Teacher',
          gender: 'MALE',
          phone: '1234567890',
          position: TeacherPosition.REGULAR_TEACHER,
          type: TeacherType.FULL_TIME,
          hireDate: '2024-01-01'
        };
        const mockUserResponse = {
          success: true,
          data: { id: 1 }
        };
        const mockTeacherResponse = {
          success: true,
          data: {
            id: 1,
            ...mockData
          }
        };
        
        vi.mocked(post).mockResolvedValueOnce(mockUserResponse)
                          .mockResolvedValueOnce(mockTeacherResponse);

        const result = await createTeacher(mockData);

        expect(post).toHaveBeenCalledTimes(2);
        expect(post).toHaveBeenCalledWith('/api/users', expect.objectContaining({
          username: mockData.phone,
          password: '123456',
          real_name: mockData.name,
          phone: mockData.phone,
          role: 'TEACHER'
        }));
        expect(result).toEqual(mockTeacherResponse);
      });

      it('should handle user creation failure', async () => {
        const mockData: TeacherCreateParams = {
          name: 'New Teacher',
          gender: 'MALE',
          phone: '1234567890',
          position: TeacherPosition.REGULAR_TEACHER,
          type: TeacherType.FULL_TIME,
          hireDate: '2024-01-01'
        };
        const mockErrorResponse = {
          success: false,
          message: 'Failed to create user'
        };
        
        vi.mocked(post).mockResolvedValue(mockErrorResponse);

        await expect(createTeacher(mockData)).rejects.toThrow('Failed to create user');
      });
    });

    describe('updateTeacher', () => {
      it('should call put with correct endpoint, id and data', async () => {
        const mockId = '123';
        const mockData = {
          name: 'Updated Teacher',
          phone: '0987654321'
        };
        const mockResponse = {
          success: true,
          data: {
            id: mockId,
            ...mockData
          }
        };
        
        vi.mocked(put).mockResolvedValue(mockResponse);

        const result = await updateTeacher(mockId, mockData);

        expect(put).toHaveBeenCalledWith(`/teachers/${mockId}`, mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteTeacher', () => {
      it('should call del with correct endpoint and id', async () => {
        const mockId = '123';
        const mockResponse = {
          success: true,
          data: {
            success: true
          }
        };
        
        vi.mocked(del).mockResolvedValue(mockResponse);

        const result = await deleteTeacher(mockId);

        expect(del).toHaveBeenCalledWith(`/teachers/${mockId}`);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('searchTeachers', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams = {
          keyword: 'search',
          excludeIds: ['1', '2']
        };
        const mockResponse = {
          success: true,
          data: [
            {
              id: '3',
              name: 'Found Teacher',
              position: TeacherPosition.HEAD_TEACHER,
              phone: '1234567890',
              status: TeacherStatus.ACTIVE
            }
          ]
        };
        
        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await searchTeachers(mockParams);

        expect(get).toHaveBeenCalledWith('/teachers/search', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getTeacherClasses', () => {
      it('should call get with correct endpoint and id', async () => {
        const mockId = '123';
        const mockResponse = {
          success: true,
          data: [
            {
              id: 'class1',
              name: 'Class A',
              type: 'regular',
              role: 'HEAD_TEACHER'
            }
          ]
        };
        
        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await getTeacherClasses(mockId);

        expect(get).toHaveBeenCalledWith(`/teachers/${mockId}/classes`);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('教师客户管理相关API', () => {
    describe('getTeacherCustomerStats', () => {
      it('should call get with correct endpoint', async () => {
        const mockResponse = {
          success: true,
          data: {
            totalCustomers: 50,
            newCustomers: 5,
            pendingFollow: 10,
            convertedCustomers: 20,
            lostCustomers: 5,
            conversionRate: 40
          }
        };
        
        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await getTeacherCustomerStats();

        expect(get).toHaveBeenCalledWith('/api/teacher/customers/stats');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getTeacherCustomerList', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams = {
          page: 1,
          pageSize: 10,
          customerName: 'test',
          status: 'NEW'
        };
        const mockResponse = {
          success: true,
          data: {
            list: [],
            total: 0,
            page: 1,
            pageSize: 10,
            pages: 0
          }
        };
        
        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await getTeacherCustomerList(mockParams);

        expect(get).toHaveBeenCalledWith('/api/teacher/customers/list', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('addCustomerFollowRecord', () => {
      it('should call post with correct endpoint and data', async () => {
        const mockCustomerId = 1;
        const mockData = {
          followType: 'phone',
          content: 'Follow up call made'
        };
        const mockResponse = {
          success: true,
          data: {
            id: 1,
            ...mockData
          }
        };
        
        vi.mocked(post).mockResolvedValue(mockResponse);

        const result = await addCustomerFollowRecord(mockCustomerId, mockData);

        expect(post).toHaveBeenCalledWith(`/api/teacher/customers/${mockCustomerId}/follow`, mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateCustomerStatus', () => {
      it('should call put with correct endpoint and data', async () => {
        const mockCustomerId = 1;
        const mockStatus = 'CONVERTED';
        const mockRemarks = 'Customer converted successfully';
        const mockResponse = {
          success: true,
          data: {
            id: mockCustomerId,
            status: mockStatus
          }
        };
        
        vi.mocked(put).mockResolvedValue(mockResponse);

        const result = await updateCustomerStatus(mockCustomerId, mockStatus, mockRemarks);

        expect(put).toHaveBeenCalledWith(`/api/teacher/customers/${mockCustomerId}/status`, {
          status: mockStatus,
          remarks: mockRemarks
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getCustomerFollowRecords', () => {
      it('should call get with correct endpoint', async () => {
        const mockCustomerId = 1;
        const mockResponse = {
          success: true,
          data: [
            {
              id: 1,
              followType: 'phone',
              content: 'Initial call',
              followDate: '2024-01-01',
              teacherName: 'Teacher A'
            }
          ]
        };
        
        vi.mocked(get).mockResolvedValue(mockResponse);

        const result = await getCustomerFollowRecords(mockCustomerId);

        expect(get).toHaveBeenCalledWith(`/api/teacher/customers/${mockCustomerId}/follow-records`);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.mocked(get).mockRejectedValue(mockError);

      await expect(getTeacherList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid teacher data',
        data: null
      };
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await addCustomerFollowRecord(1, {} as any);
      expect(result).toEqual(mockResponse);
    });

    it('should handle not found errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Teacher not found',
        data: null
      };
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await getTeacherDetail('nonexistent');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid teacher IDs', async () => {
      const invalidIds = ['', null, undefined];
      
      for (const invalidId of invalidIds) {
        vi.mocked(get).mockResolvedValue({ success: true, data: {} });
        await expect(getTeacherDetail(invalidId as string)).resolves.not.toThrow();
      }
    });

    it('should handle empty customer follow data', async () => {
      const mockCustomerId = 1;
      const emptyData = {};
      const mockResponse = {
        success: false,
        message: 'Follow data required',
        data: null
      };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await addCustomerFollowRecord(mockCustomerId, emptyData as any);
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid status values', async () => {
      const mockCustomerId = 1;
      const invalidStatus = 'INVALID_STATUS';
      const mockResponse = {
        success: false,
        message: 'Invalid status value',
        data: null
      };
      
      vi.mocked(put).mockResolvedValue(mockResponse);

      const result = await updateCustomerStatus(mockCustomerId, invalidStatus);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Data Transformation', () => {
    it('should apply data transformation when getting teacher list', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      await getTeacherList(mockParams);

      // Verify that transformListResponse was called
      expect(transformListResponse).toHaveBeenCalledWith(
        mockResponse,
        expect.any(Function)
      );
    });

    it('should apply data transformation when getting teacher detail', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          name: 'Test Teacher'
        }
      };

      vi.mocked(get).mockResolvedValue(mockResponse);

      await getTeacherDetail(mockId);

      // Verify that transformTeacherData was called
      expect(transformTeacherData).toHaveBeenCalledWith(
        mockResponse.data
      );
    });
  });
});