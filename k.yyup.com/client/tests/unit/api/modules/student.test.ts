import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';

// Mock the request module and dependencies
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}));
vi.mock('@/utils/dataTransform', () => ({
  transformListResponse: vi.fn((response, transformFn) => ({
    ...response,
    data: response.data ? transformFn(response.data) : undefined
  })),
  transformStudentFormData: vi.fn((data) => data),
  transformStudentData: vi.fn((data) => data)
}));

// Import after mocks
import {
  getStudentList,
  getStudentDetail,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  getAvailableStudents,
  searchAvailableStudents,
  StudentStatus,
  type Student,
  type StudentCreateParams,
  type StudentQueryParams,
  type StudentBrief
} from '@/api/modules/student';
import { request } from '@/utils/request';
import * as dataTransform from '@/utils/dataTransform';

const mockRequest = request as any;
const mockedDataTransform = vi.mocked(dataTransform);

// 控制台错误检测变量
let consoleSpy: any

describe('Student API', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  describe('getStudentList', () => {
    it('should call request.get with correct endpoint and params', async () => {
      const mockParams: StudentQueryParams = {
        page: 1,
        pageSize: 10,
        keyword: 'test',
        status: StudentStatus.ACTIVE,
        gender: 'MALE',
        classId: 'class1'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Test Student',
          status: StudentStatus.ACTIVE
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getStudentList(mockParams);

      expect(mockRequest.get).toHaveBeenCalledWith('/students', { params: mockParams });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty params', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getStudentList();

      expect(mockRequest.get).toHaveBeenCalledWith('/students', { params: undefined });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStudentDetail', () => {
    it('should call request.get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          name: 'Test Student',
          status: StudentStatus.ACTIVE
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getStudentDetail(mockId);

      expect(mockRequest.get).toHaveBeenCalledWith(`/students/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createStudent', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData: StudentCreateParams = {
        name: 'New Student',
        gender: 'MALE',
        birthDate: '2020-01-01',
        guardian: {
          name: 'Parent Name',
          relationship: 'Father',
          phone: '1234567890'
        },
        status: StudentStatus.ACTIVE,
        enrollmentDate: '2024-01-01'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 123,
          ...mockData
        }
      };

      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await createStudent(mockData);

      expect(mockRequest.post).toHaveBeenCalledWith('/students', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateStudent', () => {
    it('should call request.put with correct endpoint, id and data', async () => {
      const mockId = '123';
      const mockData = {
        name: 'Updated Student',
        guardian: {
          phone: '0987654321'
        }
      };
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          ...mockData
        }
      };
      
      mockRequest.put.mockResolvedValue(mockResponse);

      const result = await updateStudent(mockId, mockData);

      expect(mockRequest.put).toHaveBeenCalledWith(`/students/${mockId}`, mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteStudent', () => {
    it('should call request.delete with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        data: {
          success: true
        }
      };

      mockRequest.delete.mockResolvedValue(mockResponse);

      const result = await deleteStudent(mockId);

      expect(mockRequest.delete).toHaveBeenCalledWith(`/students/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateStudentStatus', () => {
    it('should call request.patch with correct endpoint, id and status', async () => {
      const mockId = '123';
      const mockStatus = StudentStatus.GRADUATED;
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          status: mockStatus
        }
      };
      
      (mockRequest as any).patch.mockResolvedValue(mockResponse);

      const result = await updateStudentStatus(mockId, mockStatus);

      expect((mockRequest as any).patch).toHaveBeenCalledWith(`/students/${mockId}/status`, { status: mockStatus });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAvailableStudents', () => {
    it('should call request.get with correct endpoint and params', async () => {
      const mockParams = {
        keyword: 'test',
        ageMin: 3,
        ageMax: 6
      };
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            name: 'Available Student',
            gender: 'MALE',
            age: 5,
            currentClassName: 'Class A',
            guardian: {
              name: 'Parent',
              phone: '1234567890'
            },
            status: StudentStatus.ACTIVE
          }
        ]
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getAvailableStudents(mockParams);

      expect(mockRequest.get).toHaveBeenCalledWith('/students/available', { params: mockParams });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchAvailableStudents', () => {
    it('should call request.get with correct endpoint and params', async () => {
      const mockParams = {
        keyword: 'search',
        excludeClassId: 'class1',
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await searchAvailableStudents(mockParams);

      expect(mockRequest.get).toHaveBeenCalledWith('/students/available', { params: mockParams });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockRequest.get.mockRejectedValue(mockError);

      await expect(getStudentList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid student data',
        data: null
      };
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await createStudent({} as StudentCreateParams);
      expect(result).toEqual(mockResponse);
    });

    it('should handle not found errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Student not found',
        data: null
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await getStudentDetail('nonexistent');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid student IDs', async () => {
      const invalidIds = ['', null, undefined];
      
      for (const invalidId of invalidIds) {
        mockRequest.get.mockResolvedValue({});
        await expect(getStudentDetail(invalidId as string)).resolves.not.toThrow();
      }
    });

    it('should handle empty student creation data', async () => {
      const emptyData = {} as StudentCreateParams;
      const mockResponse = {
        success: false,
        message: 'Required fields missing',
        data: null
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await createStudent(emptyData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid status values', async () => {
      const mockId = '123';
      const invalidStatus = 'INVALID_STATUS' as any;
      const mockResponse = {
        success: false,
        message: 'Invalid status value',
        data: null
      };
      
      (mockRequest as any).patch.mockResolvedValue(mockResponse);

      const result = await updateStudentStatus(mockId, invalidStatus);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Data Transformation', () => {
    it('should apply data transformation when creating student', async () => {
      const mockData: StudentCreateParams = {
        name: 'Transformed Student',
        gender: 'FEMALE',
        birthDate: '2020-01-01',
        guardian: {
          name: 'Parent',
          relationship: 'Mother',
          phone: '1234567890'
        },
        status: StudentStatus.ACTIVE,
        enrollmentDate: '2024-01-01'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 123,
          name: 'Transformed Student'
        }
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      await createStudent(mockData);

      // Verify that transformStudentFormData was called
      expect(mockedDataTransform.transformStudentFormData).toHaveBeenCalledWith(mockData);
    });

    it('should apply data transformation when getting list', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      await getStudentList(mockParams);

      // Verify that transformListResponse was called
      expect(mockedDataTransform.transformListResponse).toHaveBeenCalledWith(
        mockResponse,
        expect.any(Function)
      );
    });
  });
});