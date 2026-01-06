
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/api/modules/example-api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../../../src/api/example-api', () => ({
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
import { exampleApi } from '../../../../src/api/example-api'
import type { ExampleItem, CreateExampleItemParams, UpdateExampleItemParams, QueryExampleItemsParams } from '../../../../src/api/example-api'

// Mock request modules
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('./endpoints', () => ({
  API_PREFIX: '/api'
}))

const mockGet = require('@/utils/request').get
const mockPost = require('@/utils/request').post
const mockPut = require('@/utils/request').put
const mockDel = require('@/utils/request').del

describe('示例API服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getItems', () => {
    it('应该正确调用获取示例数据列表接口', async () => {
      const params: QueryExampleItemsParams = {
        page: 1,
        pageSize: 10,
        status: 'active',
        keyword: 'test'
      }
      const mockResponse = {
        data: {
          items: [
            {
              id: '1',
              name: '测试项目1',
              description: '测试描述1',
              created: '2023-01-01T00:00:00Z',
              updated: '2023-01-01T00:00:00Z',
              status: 'active' as const
            },
            {
              id: '2',
              name: '测试项目2',
              description: '测试描述2',
              created: '2023-01-02T00:00:00Z',
              updated: '2023-01-02T00:00:00Z',
              status: 'active' as const
            }
          ],
          total: 2
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItems(params)

      expect(mockGet).toHaveBeenCalledWith('/api/examples', { params })
      expect(result).toEqual(mockResponse)
    })

    it('应该在不传参数时调用获取列表接口', async () => {
      const mockResponse = {
        data: {
          items: [],
          total: 0
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItems()

      expect(mockGet).toHaveBeenCalledWith('/api/examples', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理部分查询参数', async () => {
      const params: QueryExampleItemsParams = {
        page: 1,
        status: 'inactive'
      }
      const mockResponse = {
        data: {
          items: [],
          total: 0
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItems(params)

      expect(mockGet).toHaveBeenCalledWith('/api/examples', { params })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getItem', () => {
    it('应该正确调用获取单个示例数据接口', async () => {
      const id = '1'
      const mockResponse = {
        data: {
          id,
          name: '测试项目1',
          description: '测试描述1',
          created: '2023-01-01T00:00:00Z',
          updated: '2023-01-01T00:00:00Z',
          status: 'active' as const
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItem(id)

      expect(mockGet).toHaveBeenCalledWith(`/api/examples/${id}`)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理不同的ID格式', async () => {
      const testCases = ['1', 'abc-123', '550e8400-e29b-41d4-a716-446655440000']
      
      for (const id of testCases) {
        const mockResponse = {
          data: {
            id,
            name: '测试项目',
            status: 'active' as const
          },
          success: true
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await exampleApi.getItem(id)

        expect(mockGet).toHaveBeenCalledWith(`/api/examples/${id}`)
        expect(result.data.id).toBe(id)
      }
    })
  })

  describe('createItem', () => {
    it('应该正确调用创建示例数据接口', async () => {
      const data: CreateExampleItemParams = {
        name: '新建测试项目',
        description: '新建测试描述',
        status: 'pending'
      }
      const mockResponse = {
        data: {
          id: '3',
          ...data,
          created: '2023-01-03T00:00:00Z',
          updated: '2023-01-03T00:00:00Z'
        },
        success: true
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await exampleApi.createItem(data)

      expect(mockPost).toHaveBeenCalledWith('/api/examples', data)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理最小创建参数', async () => {
      const data: CreateExampleItemParams = {
        name: '最小创建项目'
      }
      const mockResponse = {
        data: {
          id: '4',
          name: data.name,
          status: 'pending' as const,
          created: '2023-01-03T00:00:00Z',
          updated: '2023-01-03T00:00:00Z'
        },
        success: true
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await exampleApi.createItem(data)

      expect(mockPost).toHaveBeenCalledWith('/api/examples', data)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理所有可选参数', async () => {
      const data: CreateExampleItemParams = {
        name: '完整参数项目',
        description: '完整描述',
        status: 'active'
      }
      const mockResponse = {
        data: {
          id: '5',
          ...data,
          created: '2023-01-03T00:00:00Z',
          updated: '2023-01-03T00:00:00Z'
        },
        success: true
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await exampleApi.createItem(data)

      expect(mockPost).toHaveBeenCalledWith('/api/examples', data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateItem', () => {
    it('应该正确调用更新示例数据接口', async () => {
      const id = '1'
      const data: UpdateExampleItemParams = {
        name: '更新后的项目名',
        description: '更新后的描述'
      }
      const mockResponse = {
        data: {
          id,
          ...data,
          status: 'active' as const,
          created: '2023-01-01T00:00:00Z',
          updated: '2023-01-03T00:00:00Z'
        },
        success: true
      }
      mockPut.mockResolvedValue(mockResponse)

      const result = await exampleApi.updateItem(id, data)

      expect(mockPut).toHaveBeenCalledWith(`/api/examples/${id}`, data)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理部分更新参数', async () => {
      const id = '1'
      const data: UpdateExampleItemParams = {
        status: 'inactive'
      }
      const mockResponse = {
        data: {
          id,
          name: '测试项目1',
          description: '测试描述1',
          status: 'inactive' as const,
          created: '2023-01-01T00:00:00Z',
          updated: '2023-01-03T00:00:00Z'
        },
        success: true
      }
      mockPut.mockResolvedValue(mockResponse)

      const result = await exampleApi.updateItem(id, data)

      expect(mockPut).toHaveBeenCalledWith(`/api/examples/${id}`, data)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空更新参数', async () => {
      const id = '1'
      const data: UpdateExampleItemParams = {}
      const mockResponse = {
        data: {
          id,
          name: '测试项目1',
          status: 'active' as const,
          created: '2023-01-01T00:00:00Z',
          updated: '2023-01-03T00:00:00Z'
        },
        success: true
      }
      mockPut.mockResolvedValue(mockResponse)

      const result = await exampleApi.updateItem(id, data)

      expect(mockPut).toHaveBeenCalledWith(`/api/examples/${id}`, data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteItem', () => {
    it('应该正确调用删除示例数据接口', async () => {
      const id = '1'
      const mockResponse = {
        data: null,
        success: true,
        message: '删除成功'
      }
      mockDel.mockResolvedValue(mockResponse)

      const result = await exampleApi.deleteItem(id)

      expect(mockDel).toHaveBeenCalledWith(`/api/examples/${id}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('activateItem', () => {
    it('应该正确调用激活示例数据接口', async () => {
      const id = '1'
      const mockResponse = {
        data: {
          id,
          name: '测试项目1',
          description: '测试描述1',
          created: '2023-01-01T00:00:00Z',
          updated: '2023-01-03T00:00:00Z',
          status: 'active' as const
        },
        success: true,
        message: '激活成功'
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await exampleApi.activateItem(id)

      expect(mockPost).toHaveBeenCalledWith(`/api/examples/${id}/activate`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getStats', () => {
    it('应该正确调用获取统计信息接口', async () => {
      const mockResponse = {
        data: {
          total: 100,
          active: 75,
          inactive: 25
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getStats()

      expect(mockGet).toHaveBeenCalledWith('/api/examples/stats')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理统计数据为0的情况', async () => {
      const mockResponse = {
        data: {
          total: 0,
          active: 0,
          inactive: 0
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getStats()

      expect(mockGet).toHaveBeenCalledWith('/api/examples/stats')
      expect(result.data.total).toBe(0)
      expect(result.data.active).toBe(0)
      expect(result.data.inactive).toBe(0)
    })

    it('应该确保统计数据的一致性', async () => {
      const mockResponse = {
        data: {
          total: 150,
          active: 120,
          inactive: 30
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getStats()

      expect(result.data.total).toBe(result.data.active + result.data.inactive)
    })
  })

  describe('类型安全', () => {
    it('应该正确处理ExampleItem类型', async () => {
      const mockItem: ExampleItem = {
        id: '1',
        name: '测试项目',
        description: '测试描述',
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z',
        status: 'active'
      }
      const mockResponse = {
        data: mockItem,
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItem('1')

      expect(result.data).toHaveProperty('id')
      expect(result.data).toHaveProperty('name')
      expect(result.data).toHaveProperty('created')
      expect(result.data).toHaveProperty('updated')
      expect(result.data).toHaveProperty('status')
      expect(['active', 'inactive', 'pending']).toContain(result.data.status)
    })

    it('应该正确处理状态枚举', async () => {
      const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending']
      
      for (const status of statuses) {
        const mockResponse = {
          data: {
            id: '1',
            name: '测试项目',
            status,
            created: '2023-01-01T00:00:00Z',
            updated: '2023-01-01T00:00:00Z'
          },
          success: true
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await exampleApi.getItem('1')
        expect(result.data.status).toBe(status)
      }
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络连接失败')
      mockGet.mockRejectedValue(error)

      await expect(exampleApi.getItems()).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理404错误', async () => {
      const mockResponse = {
        error: '资源不存在',
        code: 404,
        success: false
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItem('non-existent-id')
      expect(result.success).toBe(false)
      expect(result.code).toBe(404)
    })

    it('应该正确处理验证错误', async () => {
      const invalidData: CreateExampleItemParams = {
        name: '' // 无效的名称
      }
      const mockResponse = {
        error: '名称不能为空',
        code: 400,
        success: false
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await exampleApi.createItem(invalidData)
      expect(result.success).toBe(false)
      expect(result.code).toBe(400)
    })

    it('应该正确处理权限错误', async () => {
      const mockResponse = {
        error: '权限不足',
        code: 403,
        success: false
      }
      mockDel.mockResolvedValue(mockResponse)

      const result = await exampleApi.deleteItem('1')
      expect(result.success).toBe(false)
      expect(result.code).toBe(403)
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空列表响应', async () => {
      const mockResponse = {
        data: {
          items: [],
          total: 0
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItems()
      expect(result.data.items).toEqual([])
      expect(result.data.total).toBe(0)
    })

    it('应该正确处理大数据量分页', async () => {
      const params: QueryExampleItemsParams = {
        page: 10,
        pageSize: 100
      }
      const mockResponse = {
        data: {
          items: Array(100).fill(null).map((_, index) => ({
            id: `item-${index}`,
            name: `项目${index}`,
            status: 'active' as const
          })),
          total: 1000
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItems(params)
      expect(result.data.items).toHaveLength(100)
      expect(result.data.total).toBe(1000)
    })

    it('应该正确处理特殊字符ID', async () => {
      const specialId = 'test/item-with/special#chars?query=value'
      const mockResponse = {
        data: {
          id: specialId,
          name: '特殊ID项目',
          status: 'active' as const
        },
        success: true
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await exampleApi.getItem(specialId)
      expect(result.data.id).toBe(specialId)
    })
  })

  describe('默认导出', () => {
    it('应该正确导出默认API对象', () => {
      // 这个测试验证模块的默认导出是否正确
      expect(exampleApi).toBeDefined()
      expect(exampleApi.getItems).toBeDefined()
      expect(exampleApi.getItem).toBeDefined()
      expect(exampleApi.createItem).toBeDefined()
      expect(exampleApi.updateItem).toBeDefined()
      expect(exampleApi.deleteItem).toBeDefined()
      expect(exampleApi.activateItem).toBeDefined()
      expect(exampleApi.getStats).toBeDefined()
    })
  })
})