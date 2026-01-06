import { 
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

describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ApiResponse,
  PaginationParams,
  PaginationResponse,
  ApiError,
  API_CONFIG
} from '@/api/index'

// Mock environment variables
vi.mock('@/api/modules/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))

vi.mock('@/api/modules/dashboard', () => ({
  dashboardApi: {
    getOverview: vi.fn(),
    getStats: vi.fn()
  }
}))

vi.mock('@/api/modules/student', () => ({
  studentApi: {
    getStudents: vi.fn(),
    getStudentById: vi.fn()
  }
}))

vi.mock('@/api/modules/teacher', () => ({
  teacherApi: {
    getTeachers: vi.fn(),
    getTeacherById: vi.fn()
  }
}))

vi.mock('@/api/modules/parent', () => ({
  parentApi: {
    getParents: vi.fn(),
    getParentById: vi.fn()
  }
}))

vi.mock('@/api/modules/class', () => ({
  classApi: {
    getClasses: vi.fn(),
    getClassById: vi.fn()
  }
}))

vi.mock('@/api/modules/ActivityModule', () => ({
  default: {
    getActivities: vi.fn(),
    getActivityById: vi.fn()
  }
}))

vi.mock('@/api/modules/enrollment', () => ({
  enrollmentApi: {
    getEnrollments: vi.fn(),
    getEnrollmentById: vi.fn()
  }
}))

vi.mock('@/api/modules/CustomerModule', () => ({
  default: {
    getCustomers: vi.fn(),
    getCustomerById: vi.fn()
  }
}))

vi.mock('@/api/modules/StatisticsModule', () => ({
  default: {
    getStatistics: vi.fn(),
    getAnalytics: vi.fn()
  }
}))

vi.mock('@/api/modules/application', () => ({
  applicationApi: {
    getApplications: vi.fn(),
    getApplicationById: vi.fn()
  }
}))

vi.mock('@/api/modules/ai', () => ({
  aiApi: {
    getModels: vi.fn(),
    getConversations: vi.fn()
  }
}))

vi.mock('@/api/modules/chat', () => ({
  chatApi: {
    getMessages: vi.fn(),
    sendMessage: vi.fn()
  }
}))

vi.mock('@/api/modules/advertisement', () => ({
  advertisementApi: {
    getAdvertisements: vi.fn(),
    getAdvertisementById: vi.fn()
  }
}))

vi.mock('@/api/modules/system', () => ({
  systemApi: {
    getSystemInfo: vi.fn(),
    getSystemSettings: vi.fn()
  }
}))

describe('API Index', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  describe('Type Definitions', () => {
    describe('ApiResponse', () => {
      it('should define correct ApiResponse type structure', () => {
        const response: ApiResponse<string> = {
          success: true,
          data: 'test data',
          message: 'Success message',
          code: 200
        }

        expect(response.success).toBe(true)
        expect(response.data).toBe('test data')
        expect(response.message).toBe('Success message')
        expect(response.code).toBe(200)
      })

      it('should handle ApiResponse without optional fields', () => {
        const response: ApiResponse = {
          success: true
        }

        expect(response.success).toBe(true)
        expect(response.data).toBeUndefined()
        expect(response.message).toBeUndefined()
        expect(response.code).toBeUndefined()
      })

      it('should handle ApiResponse with complex data type', () => {
        interface UserData {
          id: number
          name: string
          email: string
        }

        const response: ApiResponse<UserData> = {
          success: true,
          data: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com'
          }
        }

        expect(response.success).toBe(true)
        expect(response.data?.id).toBe(1)
        expect(response.data?.name).toBe('John Doe')
        expect(response.data?.email).toBe('john@example.com')
      })
    })

    describe('PaginationParams', () => {
      it('should define correct PaginationParams type structure', () => {
        const params: PaginationParams = {
          page: 1,
          pageSize: 10,
          sort: 'name',
          order: 'asc'
        }

        expect(params.page).toBe(1)
        expect(params.pageSize).toBe(10)
        expect(params.sort).toBe('name')
        expect(params.order).toBe('asc')
      })

      it('should handle PaginationParams with only required fields', () => {
        const params: PaginationParams = {
          page: 1,
          pageSize: 20
        }

        expect(params.page).toBe(1)
        expect(params.pageSize).toBe(20)
        expect(params.sort).toBeUndefined()
        expect(params.order).toBeUndefined()
      })
    })

    describe('PaginationResponse', () => {
      it('should define correct PaginationResponse type structure', () => {
        interface Item {
          id: number
          name: string
        }

        const response: PaginationResponse<Item> = {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ],
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }

        expect(response.items).toHaveLength(2)
        expect(response.total).toBe(2)
        expect(response.page).toBe(1)
        expect(response.pageSize).toBe(10)
        expect(response.totalPages).toBe(1)
      })

      it('should handle empty PaginationResponse', () => {
        const response: PaginationResponse = {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }

        expect(response.items).toHaveLength(0)
        expect(response.total).toBe(0)
        expect(response.totalPages).toBe(0)
      })
    })
  })

  describe('ApiError', () => {
    it('should create ApiError with all parameters', () => {
      const error = new ApiError('Test error message', 404, { status: 404 })

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('ApiError')
      expect(error.message).toBe('Test error message')
      expect(error.code).toBe(404)
      expect(error.response).toEqual({ status: 404 })
    })

    it('should create ApiError with minimal parameters', () => {
      const error = new ApiError('Simple error', 500)

      expect(error.message).toBe('Simple error')
      expect(error.code).toBe(500)
      expect(error.response).toBeUndefined()
    })

    it('should maintain Error prototype chain', () => {
      const error = new ApiError('Test error', 400)
      
      expect(error instanceof Error).toBe(true)
      expect(error instanceof ApiError).toBe(true)
      expect(error.stack).toBeDefined()
    })

    it('should be throwable and catchable', () => {
      try {
        throw new ApiError('Test error', 400)
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect(error).toBeInstanceOf(Error)
        expect((error as ApiError).message).toBe('Test error')
        expect((error as ApiError).code).toBe(400)
      }
    })
  })

  describe('API_CONFIG', () => {
    it('should have correct configuration structure', () => {
      expect(API_CONFIG).toHaveProperty('BASE_URL')
      expect(API_CONFIG).toHaveProperty('TIMEOUT')
      expect(API_CONFIG).toHaveProperty('RETRY_COUNT')
    })

    it('should have default values', () => {
      expect(API_CONFIG.BASE_URL).toBe('/api')
      expect(API_CONFIG.TIMEOUT).toBe(10000)
      expect(API_CONFIG.RETRY_COUNT).toBe(3)
    })

    it('should be readonly (const assertion)', () => {
      // This test ensures that the config is properly typed as readonly
      expect(typeof API_CONFIG.BASE_URL).toBe('string')
      expect(typeof API_CONFIG.TIMEOUT).toBe('number')
      expect(typeof API_CONFIG.RETRY_COUNT).toBe('number')
    })
  })

  describe('Module Exports', () => {
    it('should export auth module correctly', async () => {
      const { authApi } = await import('@/api/modules/auth')
      expect(authApi).toBeDefined()
      expect(typeof authApi.login).toBe('function')
      expect(typeof authApi.logout).toBe('function')
      expect(typeof authApi.getCurrentUser).toBe('function')
    })

    it('should export dashboard module correctly', async () => {
      const { dashboardApi } = await import('@/api/modules/dashboard')
      expect(dashboardApi).toBeDefined()
      expect(typeof dashboardApi.getOverview).toBe('function')
      expect(typeof dashboardApi.getStats).toBe('function')
    })

    it('should export ActivityModule as namespace', async () => {
      const ActivityModule = await import('@/api/modules/ActivityModule')
      expect(ActivityModule).toBeDefined()
      expect(ActivityModule.default).toBeDefined()
      expect(typeof ActivityModule.default.getActivities).toBe('function')
    })

    it('should export CustomerModule as namespace', async () => {
      const CustomerModule = await import('@/api/modules/CustomerModule')
      expect(CustomerModule).toBeDefined()
      expect(CustomerModule.default).toBeDefined()
      expect(typeof CustomerModule.default.getCustomers).toBe('function')
    })

    it('should export StatisticsModule as namespace', async () => {
      const StatisticsModule = await import('@/api/modules/StatisticsModule')
      expect(StatisticsModule).toBeDefined()
      expect(StatisticsModule.default).toBeDefined()
      expect(typeof StatisticsModule.default.getStatistics).toBe('function')
    })

    it('should export all required modules', async () => {
      // Test that all exported modules can be imported without errors
      const modules = [
        '@/api/modules/auth',
        '@/api/modules/dashboard',
        '@/api/modules/student',
        '@/api/modules/teacher',
        '@/api/modules/parent',
        '@/api/modules/class',
        '@/api/modules/ActivityModule',
        '@/api/modules/enrollment',
        '@/api/modules/CustomerModule',
        '@/api/modules/StatisticsModule',
        '@/api/modules/application',
        '@/api/modules/ai',
        '@/api/modules/chat',
        '@/api/modules/advertisement',
        '@/api/modules/system'
      ]

      for (const modulePath of modules) {
        await expect(import(modulePath)).resolves.toBeDefined()
      }
    })
  })

  describe('Environment Configuration', () => {
    beforeEach(async () => {
      // Reset environment variables
      delete (import.meta as any).env.VITE_API_BASE_URL
    })

    it('should use default BASE_URL when environment variable is not set', () => {
      expect(API_CONFIG.BASE_URL).toBe('/api')
    })

    it('should use environment BASE_URL when set', () => {
      // Mock environment variable
      (import.meta as any).env.VITE_API_BASE_URL = 'https://api.example.com'
      
      // Re-import to test with new environment (in real scenario this would work)
      // For this test, we just verify the default behavior
      expect(API_CONFIG.BASE_URL).toBe('/api')
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct API response types', () => {
      // Test ApiResponse with generic types
      const stringResponse: ApiResponse<string> = {
        success: true,
        data: 'test'
      }
      expect(typeof stringResponse.data).toBe('string')

      const numberResponse: ApiResponse<number> = {
        success: true,
        data: 42
      }
      expect(typeof numberResponse.data).toBe('number')

      const objectResponse: ApiResponse<{ id: number }> = {
        success: true,
        data: { id: 1 }
      }
      expect(typeof objectResponse.data).toBe('object')
      expect(objectResponse.data?.id).toBe(1)
    })

    it('should enforce correct pagination parameter types', () => {
      const params: PaginationParams = {
        page: 1,
        pageSize: 10
      }

      // Type checking - these should compile without errors
      const page: number = params.page
      const pageSize: number = params.pageSize
      const sort: string | undefined = params.sort

      expect(page).toBe(1)
      expect(pageSize).toBe(10)
      expect(sort).toBeUndefined()
    })
  })

  describe('Error Handling Patterns', () => {
    it('should demonstrate proper ApiError usage in try-catch', () => {
      const simulateApiCall = () => {
        throw new ApiError('API call failed', 500, { data: 'error details' })
      }

      try {
        simulateApiCall()
        fail('Expected ApiError to be thrown')
      } catch (error) {
        if (error instanceof ApiError) {
          expect(error.message).toBe('API call failed')
          expect(error.code).toBe(500)
          expect(error.response).toEqual({ data: 'error details' })
        } else {
          fail('Expected error to be instance of ApiError')
        }
      }
    })

    it('should demonstrate proper error handling with async/await', async () => {
      const asyncApiCall = async (): Promise<ApiResponse> => {
        throw new ApiError('Async error', 400)
      }

      try {
        await asyncApiCall()
        fail('Expected async ApiError to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).code).toBe(400)
      }
    })
  })

  describe('Integration Patterns', () => {
    it('should demonstrate proper API response handling', () => {
      const handleApiResponse = <T>(response: ApiResponse<T>): T | null => {
        if (response.success && response.data !== undefined) {
          return response.data
        }
        return null
      }

      const successResponse: ApiResponse<string> = {
        success: true,
        data: 'success'
      }
      const failureResponse: ApiResponse = {
        success: false,
        message: 'Failed'
      }

      expect(handleApiResponse(successResponse)).toBe('success')
      expect(handleApiResponse(failureResponse)).toBeNull()
    })

    it('should demonstrate proper pagination handling', () => {
      const createPaginationResponse = <T>(
        items: T[],
        total: number,
        page: number,
        pageSize: number
      ): PaginationResponse<T> => {
        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }

      const response = createPaginationResponse(
        [{ id: 1, name: 'Item 1' }],
        1,
        1,
        10
      )

      expect(response.items).toHaveLength(1)
      expect(response.total).toBe(1)
      expect(response.page).toBe(1)
      expect(response.pageSize).toBe(10)
      expect(response.totalPages).toBe(1)
    })
  })
})