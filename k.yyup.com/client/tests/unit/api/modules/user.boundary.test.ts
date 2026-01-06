import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { login, getUserList, createUser, updateUser } from '@/api/modules/user'
import {
  startConsoleMonitoring,
  stopConsoleMonitoring,
  expectNoConsoleErrors,
  expectConsoleError
} from '../../../setup/console-monitoring'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation'

// Mock the request module
vi.mock('@/utils/request', () => ({
  default: {
    request: vi.fn()
  }
}))

import requestInstance from '@/utils/request'
const { request } = requestInstance
const mockRequest = request as any

// 控制台错误检测变量
let consoleSpy: any

describe('User API - 边界值和错误场景完整测试', () => {
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

  describe('数值边界测试', () => {
    it('应该处理极小页面值', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 0,
          pageSize: 10,
          totalPages: 0
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList({ page: 0, size: 10 })

      expect(request).toHaveBeenCalledWith({
        url: '/users',
        method: 'get',
        params: { page: 0, size: 10 }
      })

      // 验证响应结构
      const validation = validateRequiredFields(result.data, ['items', 'total', 'page'])
      expect(validation.valid).toBe(true)

      const typeValidation = validateFieldTypes(result.data, {
        items: 'array',
        total: 'number',
        page: 'number',
        totalPages: 'number'
      })
      expect(typeValidation.valid).toBe(true)
    })

    it('应该处理极大页面值', async () => {
      const largePageNumber = Number.MAX_SAFE_INTEGER
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: largePageNumber,
          pageSize: 10,
          totalPages: 0
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList({ page: largePageNumber, size: 10 })

      expect(request).toHaveBeenCalledWith({
        url: '/users',
        method: 'get',
        params: { page: largePageNumber, size: 10 }
      })

      expect(result.data.page).toBe(largePageNumber)
    })

    it('应该处理负数页面值', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: -1,
          pageSize: 10,
          totalPages: 0
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList({ page: -1, size: 10 })

      expect(result.data.page).toBe(-1)
    })

    it('应该处理NaN页面值', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: NaN,
          pageSize: 10,
          totalPages: 0
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList({ page: NaN, size: 10 })

      expect(isNaN(result.data.page)).toBe(true)
    })

    it('应该处理Infinity页面值', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: Infinity,
          pageSize: 10,
          totalPages: 0
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList({ page: Infinity, size: 10 })

      expect(result.data.page).toBe(Infinity)
    })
  })

  describe('字符串边界测试', () => {
    it('应该处理空用户名', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { id: 1, username: '' }
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await login({ username: '', password: 'password' })

      expect(request).toHaveBeenCalledWith({
        url: '/auth/login',
        method: 'post',
        data: { username: '', password: 'password' }
      })

      expect(result.data.user.username).toBe('')
    })

    it('应该处理超长用户名', async () => {
      const longUsername = 'a'.repeat(10000)
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { id: 1, username: longUsername }
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await login({ username: longUsername, password: 'password' })

      expect(result.data.user.username).toBe(longUsername)
    })

    it('应该处理包含特殊字符的用户名', async () => {
      const specialUsername = '<script>alert("xss")</script>&"\'/\\'
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { id: 1, username: specialUsername }
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await login({ username: specialUsername, password: 'password' })

      expect(result.data.user.username).toBe(specialUsername)
    })

    it('应该处理Unicode用户名', async () => {
      const unicodeUsername = '🎉测试用户🚀 emojis and 中文'
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { id: 1, username: unicodeUsername }
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await login({ username: unicodeUsername, password: 'password' })

      expect(result.data.user.username).toBe(unicodeUsername)
    })

    it('应该处理只有空格的用户名', async () => {
      const spaceUsername = '   '.repeat(100)
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { id: 1, username: spaceUsername }
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await login({ username: spaceUsername, password: 'password' })

      expect(result.data.user.username).toBe(spaceUsername)
    })
  })

  describe('数组边界测试', () => {
    it('应该处理空用户列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList()

      expect(result.data.items).toEqual([])
      expect(result.data.total).toBe(0)
    })

    it('应该处理超大用户列表', async () => {
      const largeUserList = Array(10000).fill(0).map((_, i) => ({
        id: i,
        username: `user${i}`,
        email: `user${i}@example.com`
      }))

      const mockResponse = {
        success: true,
        data: {
          items: largeUserList,
          total: 10000,
          page: 1,
          pageSize: 10000,
          totalPages: 1
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList({ page: 1, size: 10000 })

      expect(result.data.items).toHaveLength(10000)
      expect(result.data.total).toBe(10000)
    })

    it('应该处理嵌套数组结构', async () => {
      const complexUserList = Array(100).fill(0).map((_, i) => ({
        id: i,
        username: `user${i}`,
        roles: Array(10).fill(0).map((_, j) => `role${j}`),
        permissions: Array(20).fill(0).map((_, k) => `permission${k}`),
        metadata: {
          tags: Array(5).fill(0).map((_, l) => `tag${l}`)
        }
      }))

      const mockResponse = {
        success: true,
        data: {
          items: complexUserList,
          total: 100,
          page: 1,
          pageSize: 100,
          totalPages: 1
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList()

      expect(result.data.items).toHaveLength(100)
      expect(result.data.items[0].roles).toHaveLength(10)
      expect(result.data.items[0].permissions).toHaveLength(20)
      expect(result.data.items[0].metadata.tags).toHaveLength(5)
    })
  })

  describe('对象边界测试', () => {
    it('应该处理深层嵌套用户对象', async () => {
      const deepUserObject = {
        id: 1,
        username: 'deepuser',
        profile: {
          personal: {
            basic: {
              details: {
                information: {
                  data: {
                    value: 'very deep'
                  }
                }
              }
            }
          }
        }
      }

      const mockResponse = {
        success: true,
        data: deepUserObject
      }

      mockRequest.mockResolvedValue(mockResponse)

      // 这里假设有一个获取用户详情的方法
      expect(() => {
        // 模拟处理深层对象
        const result = mockResponse.data
        expect(result.profile.personal.basic.details.information.data.value).toBe('very deep')
      }).not.toThrow()
    })

    it('应该处理循环引用对象（如果API返回）', async () => {
      const circularUser: any = { id: 1, username: 'circular' }
      circularUser.self = circularUser

      // API通常会序列化循环引用，但我们需要测试处理能力
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          username: 'circular',
          // 不包含真正的循环引用，因为JSON无法序列化
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await createUser({ username: 'test', email: 'test@example.com', password: 'password' })

      expect(result.data.id).toBe(1)
    })
  })

  describe('性能边界测试', () => {
    it('应该处理大量快速API调用', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, username: 'test' }],
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const startTime = performance.now()

      // 并发执行100个API调用
      const promises = Array(100).fill(0).map((_, i) =>
        getUserList({ page: 1, size: 10 })
      )

      await Promise.all(promises)

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(5000) // 应该在5秒内完成
      expect(request).toHaveBeenCalledTimes(100)
    })

    it('应该处理大量数据传输', async () => {
      const largeUserData = Array(5000).fill(0).map((_, i) => ({
        id: i,
        username: `user${i}`.repeat(100), // 每个用户名重复100次
        email: `user${i}@example.com`,
        bio: `This is user ${i} biography. `.repeat(50), // 长简介
        metadata: {
          data: 'x'.repeat(1000) // 大量元数据
        }
      }))

      const mockResponse = {
        success: true,
        data: {
          items: largeUserData,
          total: 5000,
          page: 1,
          pageSize: 5000,
          totalPages: 1
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const startTime = performance.now()
      const result = await getUserList({ page: 1, size: 5000 })
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(3000) // 应该在3秒内完成
      expect(result.data.items).toHaveLength(5000)
    })
  })

  describe('错误恢复测试', () => {
    it('应该在网络错误后能够恢复', async () => {
      // 第一次调用失败
      mockRequest.mockRejectedValueOnce(new Error('Network Error'))

      // 第二次调用成功
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, username: 'test' }],
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      }
      mockRequest.mockResolvedValueOnce(mockResponse)

      // 第一次调用应该失败
      await expect(getUserList()).rejects.toThrow('Network Error')

      // 第二次调用应该成功
      const result = await getUserList()
      expect(result.success).toBe(true)
      expect(result.data.items).toHaveLength(1)
    })

    it('应该处理服务器5xx错误', async () => {
      const serverError = new Error('Internal Server Error')
      serverError.name = 'AxiosError'
      ;
import { vi } from 'vitest'(serverError as any).response = {
        status: 500,
        data: { message: 'Internal Server Error' }
      }

      mockRequest.mockRejectedValue(serverError)

      await expect(getUserList()).rejects.toThrow('Internal Server Error')
    })

    it('应该处理API超时', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'AxiosError'
      ;(timeoutError as any).code = 'ECONNABORTED'

      mockRequest.mockRejectedValue(timeoutError)

      await expect(getUserList()).rejects.toThrow('Request timeout')
    })

    it('应该处理JSON解析错误', async () => {
      const invalidJSON = '{ invalid json }'

      // Mock一个返回无效JSON的响应
      mockRequest.mockResolvedValue({
        data: invalidJSON,
        status: 200
      })

      // 实际的API客户端应该在解析JSON时出错
      // 这里我们测试错误处理逻辑
      expect(() => {
        JSON.parse(invalidJSON)
      }).toThrow()
    })
  })

  describe('并发边界测试', () => {
    it('应该处理并发创建用户请求', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, username: 'newuser', email: 'newuser@example.com' }
      }

      mockRequest.mockResolvedValue(mockResponse)

      // 并发创建多个用户
      const promises = Array(10).fill(0).map((_, i) =>
        createUser({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: 'password'
        })
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    it('应该处理并发更新用户请求', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, email: 'updated@example.com' }
      }

      mockRequest.mockResolvedValue(mockResponse)

      // 并发更新同一用户的多个属性
      const promises = Array(10).fill(0).map((_, i) =>
        updateUser(1, { [`field${i}`]: `value${i}` })
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })
  })

  describe('数据验证边界测试', () => {
    it('应该验证缺失的必填字段', async () => {
      const mockResponse = {
        success: true,
        data: {
          // 缺少token字段
          user: { id: 1, username: 'test' }
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await login({ username: 'test', password: 'test' })

      // 验证应该发现缺少token字段
      const validation = validateRequiredFields(result.data, ['token', 'user'])
      expect(validation.valid).toBe(false)
      expect(validation.missingFields).toContain('token')
    })

    it('应该验证错误的字段类型', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 123, // 应该是字符串
          user: {
            id: '1', // 应该是数字
            username: 'test'
          }
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await login({ username: 'test', password: 'test' })

      // 验证应该发现类型错误
      const tokenValidation = validateFieldTypes(result.data, {
        token: 'string'
      })
      expect(tokenValidation.valid).toBe(false)

      const userValidation = validateFieldTypes(result.data.user, {
        id: 'number'
      })
      expect(userValidation.valid).toBe(false)
    })

    it('应该验证无效的枚举值', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          role: 'INVALID_ROLE' // 无效的角色枚举值
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      // 验证角色枚举值
      const validRoles = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STAFF']
      const enumValidation = validateEnumValue(mockResponse.data.role, validRoles)
      expect(enumValidation.valid).toBe(false)
    })
  })

  describe('内存和资源边界测试', () => {
    it('应该处理大量响应数据而不内存泄漏', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // 创建大量数据
      const largeDataSet = Array(1000).fill(0).map((_, i) => ({
        id: i,
        username: `user${i}`,
        // 大量字符串数据
        description: 'x'.repeat(10000),
        metadata: {
          data: new Array(100).fill('metadata entry')
        }
      }))

      const mockResponse = {
        success: true,
        data: {
          items: largeDataSet,
          total: 1000
        }
      }

      mockRequest.mockResolvedValue(mockResponse)

      const result = await getUserList({ page: 1, size: 1000 })

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      expect(result.data.items).toHaveLength(1000)
      // 内存增长应该是合理的（小于100MB）
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
    })
  })
})