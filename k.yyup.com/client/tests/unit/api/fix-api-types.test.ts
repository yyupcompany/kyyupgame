
vi.mock('@/api/modules/fix-api-types', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../../../src/api/fix-api-types', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

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
  convertToSystemApiResponse,
  wrapApiFunction
} from '../../../../src/api/fix-api-types'

// Mock the types and modules
vi.mock('@/utils/request', () => ({
  ApiResponse: vi.fn()
}))

vi.mock('@/types/system', () => ({
  ApiResponse: vi.fn()
}))

describe('API类型修复工具', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('convertToSystemApiResponse', () => {
    it('应该正确转换完整的ApiResponse', () => {
      const requestResponse = {
        success: true,
        data: { id: 1, name: 'test' },
        message: '操作成功',
        code: 200
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'test' },
        message: '操作成功',
        code: 200
      })
    })

    it('应该正确处理message为undefined的情况', () => {
      const requestResponse = {
        success: true,
        data: { id: 1, name: 'test' },
        message: undefined,
        code: 200
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'test' },
        message: '',
        code: 200
      })
    })

    it('应该正确处理success为undefined的情况', () => {
      const requestResponse = {
        success: undefined,
        data: { id: 1, name: 'test' },
        message: '操作成功',
        code: 200
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result).toEqual({
        success: false,
        data: { id: 1, name: 'test' },
        message: '操作成功',
        code: 200
      })
    })

    it('应该正确处理data为undefined的情况', () => {
      const requestResponse = {
        success: true,
        data: undefined,
        message: '操作成功',
        code: 200
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result).toEqual({
        success: true,
        data: undefined,
        message: '操作成功',
        code: 200
      })
    })

    it('应该正确处理最小响应', () => {
      const requestResponse = {}

      const result = convertToSystemApiResponse(requestResponse)

      expect(result).toEqual({
        success: false,
        data: undefined,
        message: ''
      })
    })

    it('应该正确处理null响应', () => {
      const requestResponse = null

      const result = convertToSystemApiResponse(requestResponse)

      expect(result).toEqual({
        success: false,
        data: null,
        message: ''
      })
    })

    it('应该保持额外属性不变', () => {
      const requestResponse = {
        success: true,
        data: { id: 1 },
        message: '成功',
        code: 200,
        timestamp: '2023-01-01T00:00:00Z',
        pagination: { page: 1, total: 10 }
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result).toEqual({
        success: true,
        data: { id: 1 },
        message: '成功',
        code: 200,
        timestamp: '2023-01-01T00:00:00Z',
        pagination: { page: 1, total: 10 }
      })
    })
  })

  describe('wrapApiFunction', () => {
    it('应该正确包装API函数', async () => {
      const mockApiFunc = vi.fn().mockResolvedValue({
        success: true,
        data: { id: 1, name: 'test' },
        message: '操作成功'
      })

      const wrappedFunc = wrapApiFunction(mockApiFunc)
      const result = await wrappedFunc('param1', 'param2')

      expect(mockApiFunc).toHaveBeenCalledWith('param1', 'param2')
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'test' },
        message: '操作成功'
      })
    })

    it('应该正确处理API函数返回错误', async () => {
      const mockApiFunc = vi.fn().mockResolvedValue({
        success: false,
        data: undefined,
        message: undefined,
        code: 500
      })

      const wrappedFunc = wrapApiFunction(mockApiFunc)
      const result = await wrappedFunc()

      expect(result).toEqual({
        success: false,
        data: undefined,
        message: '',
        code: 500
      })
    })

    it('应该正确处理API函数抛出异常', async () => {
      const mockApiFunc = vi.fn().mockRejectedValue(new Error('网络错误'))

      const wrappedFunc = wrapApiFunction(mockApiFunc)

      await expect(wrappedFunc()).rejects.toThrow('网络错误')
    })

    it('应该正确处理多种参数类型', async () => {
      const mockApiFunc = vi.fn().mockResolvedValue({
        success: true,
        data: 'success',
        message: '完成'
      })

      const wrappedFunc = wrapApiFunction(mockApiFunc)

      // 测试不同类型的参数
      await wrappedFunc()
      await wrappedFunc('string')
      await wrappedFunc(123)
      await wrappedFunc({ key: 'value' })
      await wrappedFunc([1, 2, 3])
      await wrappedFunc('string', 123, { key: 'value' }, [1, 2, 3])

      expect(mockApiFunc).toHaveBeenCalledTimes(6)
    })

    it('应该保持函数的this上下文', async () => {
      const mockApiFunc = vi.fn(function(this: any) {
        return Promise.resolve({
          success: true,
          data: this.value,
          message: '成功'
        })
      })

      const context = { value: 'test context' }
      const wrappedFunc = wrapApiFunction(mockApiFunc.bind(context))

      const result = await wrappedFunc()

      expect(result.data).toBe('test context')
    })

    it('应该正确处理异步函数', async () => {
      const mockApiFunc = vi.fn().mockImplementation(async (param: string) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return {
          success: true,
          data: `processed: ${param}`,
          message: '异步完成'
        }
      })

      const wrappedFunc = wrapApiFunction(mockApiFunc)
      const result = await wrappedFunc('test')

      expect(result).toEqual({
        success: true,
        data: 'processed: test',
        message: '异步完成'
      })
    })
  })

  describe('类型安全', () => {
    it('应该正确处理泛型类型', () => {
      interface TestData {
        id: number
        name: string
      }

      const requestResponse: any = {
        success: true,
        data: { id: 1, name: 'test' },
        message: '成功'
      }

      const result = convertToSystemApiResponse<TestData>(requestResponse)

      // 验证返回类型
      expect(result.data).toHaveProperty('id')
      expect(result.data).toHaveProperty('name')
      expect(typeof result.data.id).toBe('number')
      expect(typeof result.data.name).toBe('string')
    })

    it('应该正确处理复杂数据类型', () => {
      interface ComplexData {
        users: Array<{
          id: number
          name: string
          email: string
        }>
        metadata: {
          total: number
          page: number
          filters: Record<string, any>
        }
      }

      const requestResponse: any = {
        success: true,
        data: {
          users: [
            { id: 1, name: 'user1', email: 'user1@test.com' }
          ],
          metadata: {
            total: 1,
            page: 1,
            filters: { status: 'active' }
          }
        },
        message: '获取成功'
      }

      const result = convertToSystemApiResponse<ComplexData>(requestResponse)

      expect(result.data.users).toHaveLength(1)
      expect(result.data.users[0]).toHaveProperty('id')
      expect(result.data.users[0]).toHaveProperty('name')
      expect(result.data.users[0]).toHaveProperty('email')
      expect(result.data.metadata).toHaveProperty('total')
      expect(result.data.metadata).toHaveProperty('page')
      expect(result.data.metadata).toHaveProperty('filters')
    })

    it('应该正确处理嵌套的泛型类型', () => {
      interface NestedData {
        items: Array<{
          id: string
          details: {
            value: number
            description: string
          }
        }>
      }

      const requestResponse: any = {
        success: true,
        data: {
          items: [
            {
              id: 'item1',
              details: {
                value: 100,
                description: '测试项目'
              }
            }
          ]
        },
        message: '成功'
      }

      const result = convertToSystemApiResponse<NestedData>(requestResponse)

      expect(result.data.items[0].id).toBe('item1')
      expect(result.data.items[0].details.value).toBe(100)
      expect(result.data.items[0].details.description).toBe('测试项目')
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空字符串message', () => {
      const requestResponse = {
        success: true,
        data: { id: 1 },
        message: ''
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result.message).toBe('')
    })

    it('应该正确处理数字类型message', () => {
      const requestResponse = {
        success: true,
        data: { id: 1 },
        message: 200 as any
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result.message).toBe('200')
    })

    it('应该正确处理对象类型message', () => {
      const requestResponse = {
        success: true,
        data: { id: 1 },
        message: { error: '详细错误信息' } as any
      }

      const result = convertToSystemApiResponse(requestResponse)

      expect(result.message).toBe('[object Object]')
    })

    it('应该正确处理布尔值success', () => {
      const trueResponse = {
        success: true,
        data: { id: 1 },
        message: '成功'
      }

      const falseResponse = {
        success: false,
        data: { id: 1 },
        message: '失败'
      }

      const trueResult = convertToSystemApiResponse(trueResponse)
      const falseResult = convertToSystemApiResponse(falseResponse)

      expect(trueResult.success).toBe(true)
      expect(falseResult.success).toBe(false)
    })

    it('应该正确处理包装函数的多次调用', async () => {
      const mockApiFunc = vi.fn()
        .mockResolvedValueOnce({ success: true, data: 'first', message: '第一次' })
        .mockResolvedValueOnce({ success: false, data: 'second', message: undefined })
        .mockRejectedValueOnce(new Error('第三次错误'))

      const wrappedFunc = wrapApiFunction(mockApiFunc)

      const result1 = await wrappedFunc()
      const result2 = await wrappedFunc()

      expect(result1).toEqual({
        success: true,
        data: 'first',
        message: '第一次'
      })

      expect(result2).toEqual({
        success: false,
        data: 'second',
        message: ''
      })

      await expect(wrappedFunc()).rejects.toThrow('第三次错误')
    })
  })

  describe('实际使用场景', () => {
    it('应该模拟真实API调用场景', async () => {
      // 模拟一个真实的API函数
      const mockGetUser = vi.fn().mockImplementation((userId: string) => {
        return Promise.resolve({
          success: true,
          data: {
            id: parseInt(userId),
            name: `用户${userId}`,
            email: `user${userId}@test.com`
          },
          message: '获取用户成功'
        })
      })

      const wrappedGetUser = wrapApiFunction(mockGetUser)
      const result = await wrappedGetUser('123')

      expect(result).toEqual({
        success: true,
        data: {
          id: 123,
          name: '用户123',
          email: 'user123@test.com'
        },
        message: '获取用户成功'
      })
    })

    it('应该模拟错误API调用场景', async () => {
      const mockDeleteUser = vi.fn().mockImplementation((userId: string) => {
        return Promise.resolve({
          success: false,
          data: undefined,
          message: undefined,
          code: 404,
          error: '用户不存在'
        })
      })

      const wrappedDeleteUser = wrapApiFunction(mockDeleteUser)
      const result = await wrappedDeleteUser('999')

      expect(result).toEqual({
        success: false,
        data: undefined,
        message: '',
        code: 404,
        error: '用户不存在'
      })
    })

    it('应该模拟分页API调用场景', async () => {
      const mockGetUsers = vi.fn().mockImplementation((page: number, pageSize: number) => {
        return Promise.resolve({
          success: true,
          data: {
            users: Array(pageSize).fill(null).map((_, index) => ({
              id: (page - 1) * pageSize + index + 1,
              name: `用户${(page - 1) * pageSize + index + 1}`
            })),
            pagination: {
              page,
              pageSize,
              total: 100
            }
          },
          message: '获取用户列表成功'
        })
      })

      const wrappedGetUsers = wrapApiFunction(mockGetUsers)
      const result = await wrappedGetUsers(2, 10)

      expect(result.success).toBe(true)
      expect(result.data.users).toHaveLength(10)
      expect(result.data.pagination.page).toBe(2)
      expect(result.data.pagination.pageSize).toBe(10)
    })
  })
})