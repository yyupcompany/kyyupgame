import { vi } from 'vitest'
/**
 * Task Template Service Test
 * 任务模板服务测试
 * 
 * 测试覆盖范围：
 * - 模板列表获取
 * - 模板详情查询
 * - 模板创建功能
 * - 模板更新功能
 * - 模板删除功能
 * - 模板分类获取
 * - 热门模板获取
 * - 模板搜索功能
 * - 模板复制功能
 * - 模板使用次数增加
 * - 模板统计信息获取
 * - 权限检查机制
 * - 数据验证
 * - JSON序列化处理
 * - 过滤条件构建
 * - 错误处理机制
 */

import { TaskTemplateService } from '../../../src/services/task-template.service'
import { DatabaseService } from '../../../src/services/database.service'

// Mock dependencies
jest.mock('../../../src/services/database.service')


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

describe('TaskTemplateService', () => {
  let taskTemplateService: TaskTemplateService
  let mockDatabaseService: jest.Mocked<DatabaseService>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockDatabaseService = DatabaseService as jest.Mocked<any>

    // Create service instance
    taskTemplateService = new TaskTemplateService()
  })

  describe('getTemplates', () => {
    it('应该成功获取模板列表', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'Enrollment Template',
          description: '招生流程模板',
          type: 'enrollment',
          category: '招生',
          template_content: '{"requirements": ["Req 1"]}',
          default_priority: 'medium',
          usage_count: 10,
          is_active: true,
          is_public: true,
          created_by: 1,
          creator_name: 'Admin User'
        },
        {
          id: 2,
          name: 'Activity Template',
          description: '活动策划模板',
          type: 'activity',
          category: '活动',
          template_content: '{"steps": ["Step 1"]}',
          default_priority: 'high',
          usage_count: 5,
          is_active: true,
          is_public: false,
          created_by: 2,
          creator_name: 'Teacher User'
        }
      ]

      mockDatabaseService.query.mockResolvedValue(mockTemplates)

      const filters = {
        type: 'enrollment',
        category: '招生',
        is_active: true,
        is_public: true,
        created_by: 1
      }

      const result = await taskTemplateService.getTemplates(filters)

      expect(result).toEqual(mockTemplates)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tt.*, u.name as creator_name'),
        ['enrollment', '招生', 1, 1, 1]
      )
    })

    it('应该使用默认过滤条件', async () => {
      const mockTemplates = []

      mockDatabaseService.query.mockResolvedValue(mockTemplates)

      await taskTemplateService.getTemplates()

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1'),
        []
      )
    })

    it('应该正确处理部分过滤条件', async () => {
      const mockTemplates = []

      mockDatabaseService.query.mockResolvedValue(mockTemplates)

      const filters = {
        type: 'daily',
        is_active: false
      }

      await taskTemplateService.getTemplates(filters)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND type = ? AND is_active = ?'),
        ['daily', 0]
      )
    })
  })

  describe('getTemplateById', () => {
    it('应该成功根据ID获取模板', async () => {
      const mockTemplate = {
        id: 1,
        name: 'Test Template',
        description: 'Test Description',
        type: 'enrollment',
        creator_name: 'Test User'
      }

      mockDatabaseService.query.mockResolvedValue([mockTemplate])

      const result = await taskTemplateService.getTemplateById(1)

      expect(result).toEqual(mockTemplate)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tt.*, u.name as creator_name'),
        [1]
      )
    })

    it('模板不存在时应该返回null', async () => {
      mockDatabaseService.query.mockResolvedValue([])

      const result = await taskTemplateService.getTemplateById(999)

      expect(result).toBeNull()
    })
  })

  describe('createTemplate', () => {
    it('应该成功创建模板', async () => {
      const mockResult = { insertId: 1 }
      const mockTemplate = {
        id: 1,
        name: 'New Template',
        description: 'New Description',
        type: 'enrollment',
        category: '测试',
        template_content: '{"requirements": ["Req 1"]}',
        default_priority: 'medium',
        default_estimated_hours: 8,
        is_active: true,
        is_public: true,
        created_by: 1,
        creator_name: 'Creator User'
      }

      mockDatabaseService.query.mockResolvedValueOnce(mockResult)
      mockDatabaseService.query.mockResolvedValueOnce([mockTemplate])

      const templateData = {
        name: 'New Template',
        description: 'New Description',
        type: 'enrollment' as const,
        category: '测试',
        template_content: { requirements: ['Req 1'] },
        default_priority: 'medium' as const,
        default_estimated_hours: 8,
        is_active: true,
        is_public: true,
        created_by: 1
      }

      const result = await taskTemplateService.createTemplate(templateData)

      expect(result).toEqual(mockTemplate)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_templates'),
        [
          'New Template',
          'New Description',
          'enrollment',
          '测试',
          JSON.stringify({ requirements: ['Req 1'] }),
          'medium',
          8,
          1,
          1,
          1
        ]
      )
    })

    it('应该使用默认值创建模板', async () => {
      const mockResult = { insertId: 1 }
      const mockTemplate = {
        id: 1,
        name: 'Default Template',
        default_priority: 'medium',
        is_active: true,
        is_public: true
      }

      mockDatabaseService.query.mockResolvedValueOnce(mockResult)
      mockDatabaseService.query.mockResolvedValueOnce([mockTemplate])

      const templateData = {
        name: 'Default Template',
        type: 'daily' as const,
        created_by: 1
      }

      await taskTemplateService.createTemplate(templateData)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_templates'),
        [
          'Default Template',
          null,
          'daily',
          null,
          null,
          'medium',
          null,
          1,
          1,
          1
        ]
      )
    })
  })

  describe('updateTemplate', () => {
    it('应该成功更新模板', async () => {
      const existingTemplate = {
        id: 1,
        name: 'Old Name',
        created_by: 1
      }

      const updatedTemplate = {
        id: 1,
        name: 'Updated Name',
        description: 'Updated Description',
        creator_name: 'Updater User'
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingTemplate])
      mockDatabaseService.query.mockResolvedValueOnce([updatedTemplate])

      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description'
      }

      const result = await taskTemplateService.updateTemplate(1, updateData, 1)

      expect(result).toEqual(updatedTemplate)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE task_templates'),
        ['Updated Name', 'Updated Description', 1]
      )
    })

    it('模板不存在时应该抛出错误', async () => {
      mockDatabaseService.query.mockResolvedValueOnce([])

      await expect(taskTemplateService.updateTemplate(999, {}, 1))
        .rejects.toThrow('模板不存在')
    })

    it('无权限修改时应该抛出错误', async () => {
      const existingTemplate = {
        id: 1,
        name: 'Template',
        created_by: 2 // Different user
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingTemplate])

      await expect(taskTemplateService.updateTemplate(1, {}, 1))
        .rejects.toThrow('无权限修改此模板')
    })

    it('没有需要更新的字段时应该返回原模板', async () => {
      const existingTemplate = {
        id: 1,
        name: 'Template',
        created_by: 1
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingTemplate])

      const result = await taskTemplateService.updateTemplate(1, {}, 1)

      expect(result).toEqual(existingTemplate)
      expect(mockDatabaseService.query).toHaveBeenCalledTimes(1) // Only called for getTemplateById
    })

    it('应该正确处理布尔字段和JSON字段', async () => {
      const existingTemplate = {
        id: 1,
        name: 'Template',
        created_by: 1
      }

      const updatedTemplate = {
        id: 1,
        name: 'Template',
        template_content: '{"new": "content"}',
        creator_name: 'User'
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingTemplate])
      mockDatabaseService.query.mockResolvedValueOnce([updatedTemplate])

      const updateData = {
        template_content: { new: 'content' },
        is_active: false,
        is_public: true
      }

      await taskTemplateService.updateTemplate(1, updateData, 1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE task_templates'),
        [JSON.stringify({ new: 'content' }), 0, 1, 1]
      )
    })
  })

  describe('deleteTemplate', () => {
    it('应该成功删除模板（软删除）', async () => {
      const existingTemplate = {
        id: 1,
        name: 'Template to Delete',
        created_by: 1
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingTemplate])

      await taskTemplateService.deleteTemplate(1, 1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'UPDATE task_templates SET is_active = 0 WHERE id = ?',
        [1]
      )
    })

    it('模板不存在时应该抛出错误', async () => {
      mockDatabaseService.query.mockResolvedValueOnce([])

      await expect(taskTemplateService.deleteTemplate(999, 1))
        .rejects.toThrow('模板不存在')
    })

    it('无权限删除时应该抛出错误', async () => {
      const existingTemplate = {
        id: 1,
        name: 'Template',
        created_by: 2 // Different user
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingTemplate])

      await expect(taskTemplateService.deleteTemplate(1, 1))
        .rejects.toThrow('无权限删除此模板')
    })
  })

  describe('getTemplateCategories', () => {
    it('应该成功获取模板分类', async () => {
      const mockCategories = [
        { category: '招生' },
        { category: '活动' },
        { category: '日常' }
      ]

      mockDatabaseService.query.mockResolvedValue(mockCategories)

      const result = await taskTemplateService.getTemplateCategories()

      expect(result).toEqual(['招生', '活动', '日常'])
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT DISTINCT category'),
        []
      )
    })

    it('应该根据类型过滤分类', async () => {
      const mockCategories = [
        { category: '招生流程' },
        { category: '招生面试' }
      ]

      mockDatabaseService.query.mockResolvedValue(mockCategories)

      const result = await taskTemplateService.getTemplateCategories('enrollment')

      expect(result).toEqual(['招生流程', '招生面试'])
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('AND type = ?'),
        ['enrollment']
      )
    })
  })

  describe('getPopularTemplates', () => {
    it('应该成功获取热门模板', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'Popular Template 1',
          usage_count: 100,
          is_active: true,
          is_public: true,
          creator_name: 'User 1'
        },
        {
          id: 2,
          name: 'Popular Template 2',
          usage_count: 80,
          is_active: true,
          is_public: true,
          creator_name: 'User 2'
        }
      ]

      mockDatabaseService.query.mockResolvedValue(mockTemplates)

      const result = await taskTemplateService.getPopularTemplates(5)

      expect(result).toEqual(mockTemplates)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY tt.usage_count DESC'),
        [5]
      )
    })

    it('应该使用默认限制数量', async () => {
      mockDatabaseService.query.mockResolvedValue([])

      await taskTemplateService.getPopularTemplates()

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [10]
      )
    })
  })

  describe('searchTemplates', () => {
    it('应该成功搜索模板', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'Search Result Template',
          description: 'Template for search testing',
          creator_name: 'Search User'
        }
      ]

      mockDatabaseService.query.mockResolvedValue(mockTemplates)

      const result = await taskTemplateService.searchTemplates('search', {
        type: 'enrollment',
        is_active: true
      })

      expect(result).toEqual(mockTemplates)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (tt.name LIKE ? OR tt.description LIKE ?)'),
        ['%search%', '%search%', 'enrollment', 1]
      )
    })

    it('应该只使用关键词搜索', async () => {
      mockDatabaseService.query.mockResolvedValue([])

      await taskTemplateService.searchTemplates('test')

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (tt.name LIKE ? OR tt.description LIKE ?)'),
        ['%test%', '%test%']
      )
    })
  })

  describe('duplicateTemplate', () => {
    it('应该成功复制模板', async () => {
      const originalTemplate = {
        id: 1,
        name: 'Original Template',
        description: 'Original Description',
        type: 'enrollment',
        category: '招生',
        template_content: '{"requirements": ["Original"]}',
        default_priority: 'high',
        default_estimated_hours: 10,
        is_active: true,
        is_public: true,
        created_by: 1,
        creator_name: 'Original User'
      }

      const newTemplate = {
        id: 2,
        name: 'Original Template (副本)',
        creator_name: 'New User'
      }

      mockDatabaseService.query.mockResolvedValueOnce([originalTemplate])
      mockDatabaseService.query.mockResolvedValueOnce({ insertId: 2 })
      mockDatabaseService.query.mockResolvedValueOnce([newTemplate])

      const result = await taskTemplateService.duplicateTemplate(1, 2)

      expect(result).toEqual(newTemplate)
      expect(result.name).toBe('Original Template (副本)')
      expect(result.is_public).toBe(false) // 复制的模板默认为私有
    })

    it('应该使用自定义名称复制模板', async () => {
      const originalTemplate = {
        id: 1,
        name: 'Original Template',
        template_content: '{"requirements": ["Original"]}',
        created_by: 1
      }

      const newTemplate = {
        id: 2,
        name: 'Custom Name',
        creator_name: 'New User'
      }

      mockDatabaseService.query.mockResolvedValueOnce([originalTemplate])
      mockDatabaseService.query.mockResolvedValueOnce({ insertId: 2 })
      mockDatabaseService.query.mockResolvedValueOnce([newTemplate])

      const result = await taskTemplateService.duplicateTemplate(1, 2, 'Custom Name')

      expect(result.name).toBe('Custom Name')
    })

    it('原模板不存在时应该抛出错误', async () => {
      mockDatabaseService.query.mockResolvedValueOnce([])

      await expect(taskTemplateService.duplicateTemplate(999, 1))
        .rejects.toThrow('模板不存在')
    })
  })

  describe('incrementUsageCount', () => {
    it('应该成功增加模板使用次数', async () => {
      await taskTemplateService.incrementUsageCount(1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'UPDATE task_templates SET usage_count = usage_count + 1 WHERE id = ?',
        [1]
      )
    })
  })

  describe('getTemplateStats', () => {
    it('应该成功获取模板统计信息', async () => {
      const mockStats = {
        total_templates: 20,
        enrollment_templates: 8,
        activity_templates: 6,
        daily_templates: 4,
        management_templates: 2,
        total_usage: 150,
        avg_usage: 7.5,
        active_templates: 18,
        public_templates: 12
      }

      mockDatabaseService.query.mockResolvedValueOnce([mockStats])

      const result = await taskTemplateService.getTemplateStats(1)

      expect(result).toEqual(mockStats)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as total_templates'),
        [1]
      )
    })

    it('应该获取全局统计信息', async () => {
      const mockStats = {
        total_templates: 100,
        enrollment_templates: 40,
        activity_templates: 30,
        daily_templates: 20,
        management_templates: 10,
        total_usage: 1000,
        avg_usage: 10,
        active_templates: 90,
        public_templates: 60
      }

      mockDatabaseService.query.mockResolvedValueOnce([mockStats])

      const result = await taskTemplateService.getTemplateStats()

      expect(result).toEqual(mockStats)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1'),
        []
      )
    })
  })
})