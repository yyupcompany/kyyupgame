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
import { taskApi, templateApi, webOperationApi, statisticsApi, websiteAutomationApi } from '../../../../src/api/endpoints/websiteAutomation'

// Mock request module
vi.mock('../../../../src/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const mockRequest = require('../../../../src/utils/request').request

describe('网站自动化API接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('任务管理API', () => {
    describe('getAllTasks', () => {
      it('应该正确调用获取所有任务接口', async () => {
        const mockResponse = { data: [], success: true }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await taskApi.getAllTasks()

        expect(mockRequest.get).toHaveBeenCalledWith('/api/website-automation/tasks')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('createTask', () => {
      it('应该正确调用创建任务接口', async () => {
        const taskData = {
          name: '测试任务',
          url: 'https://example.com',
          steps: []
        }
        const mockResponse = { data: { id: '1', ...taskData }, success: true }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await taskApi.createTask(taskData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/website-automation/tasks', taskData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateTask', () => {
      it('应该正确调用更新任务接口', async () => {
        const taskId = '1'
        const updateData = { name: '更新后的任务名' }
        const mockResponse = { data: { id: taskId, ...updateData }, success: true }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await taskApi.updateTask(taskId, updateData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/website-automation/tasks/${taskId}`, updateData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('deleteTask', () => {
      it('应该正确调用删除任务接口', async () => {
        const taskId = '1'
        const mockResponse = { data: null, success: true }
        mockRequest.delete.mockResolvedValue(mockResponse)

        const result = await taskApi.deleteTask(taskId)

        expect(mockRequest.delete).toHaveBeenCalledWith(`/api/website-automation/tasks/${taskId}`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('executeTask', () => {
      it('应该正确调用执行任务接口', async () => {
        const taskId = '1'
        const mockResponse = { 
          data: { executionId: 'exec1', status: 'running', message: '任务已启动' }, 
          success: true 
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await taskApi.executeTask(taskId)

        expect(mockRequest.post).toHaveBeenCalledWith(`/api/website-automation/tasks/${taskId}/execute`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('stopTask', () => {
      it('应该正确调用停止任务接口', async () => {
        const taskId = '1'
        const mockResponse = { data: null, success: true }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await taskApi.stopTask(taskId)

        expect(mockRequest.post).toHaveBeenCalledWith(`/api/website-automation/tasks/${taskId}/stop`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('getTaskHistory', () => {
      it('应该正确调用获取任务历史接口', async () => {
        const taskId = '1'
        const mockResponse = { data: [], success: true }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await taskApi.getTaskHistory(taskId)

        expect(mockRequest.get).toHaveBeenCalledWith(`/api/website-automation/tasks/${taskId}/history`)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('模板管理API', () => {
    describe('getAllTemplates', () => {
      it('应该正确调用获取所有模板接口', async () => {
        const mockResponse = { data: [], success: true }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await templateApi.getAllTemplates()

        expect(mockRequest.get).toHaveBeenCalledWith('/api/website-automation/templates')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('createTemplate', () => {
      it('应该正确调用创建模板接口', async () => {
        const templateData = {
          name: '测试模板',
          category: 'web',
          steps: []
        }
        const mockResponse = { data: { id: '1', ...templateData }, success: true }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await templateApi.createTemplate(templateData)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/website-automation/templates', templateData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateTemplate', () => {
      it('应该正确调用更新模板接口', async () => {
        const templateId = '1'
        const updateData = { name: '更新后的模板名' }
        const mockResponse = { data: { id: templateId, ...updateData }, success: true }
        mockRequest.put.mockResolvedValue(mockResponse)

        const result = await templateApi.updateTemplate(templateId, updateData)

        expect(mockRequest.put).toHaveBeenCalledWith(`/api/website-automation/templates/${templateId}`, updateData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('deleteTemplate', () => {
      it('应该正确调用删除模板接口', async () => {
        const templateId = '1'
        const mockResponse = { data: null, success: true }
        mockRequest.delete.mockResolvedValue(mockResponse)

        const result = await templateApi.deleteTemplate(templateId)

        expect(mockRequest.delete).toHaveBeenCalledWith(`/api/website-automation/templates/${templateId}`)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('createTaskFromTemplate', () => {
      it('应该正确调用基于模板创建任务接口', async () => {
        const templateId = '1'
        const parameters = { url: 'https://example.com' }
        const mockResponse = { data: { id: 'task1' }, success: true }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await templateApi.createTaskFromTemplate(templateId, parameters)

        expect(mockRequest.post).toHaveBeenCalledWith(`/api/website-automation/templates/${templateId}/create-task`, { parameters })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('网页操作API', () => {
    describe('captureScreenshot', () => {
      it('应该正确调用网页截图接口', async () => {
        const url = 'https://example.com'
        const options = { fullPage: true }
        const mockResponse = { 
          data: { 
            url, 
            screenshot: 'base64-image', 
            timestamp: '2023-01-01T00:00:00Z',
            dimensions: { width: 1920, height: 1080 },
            metadata: {}
          }, 
          success: true 
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await webOperationApi.captureScreenshot(url, options)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/website-automation/screenshot', { url, options })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('analyzePageElements', () => {
      it('应该正确调用分析网页元素接口', async () => {
        const url = 'https://example.com'
        const screenshot = 'base64-image'
        const config = { deepAnalysis: true }
        const mockResponse = { 
          data: { 
            url, 
            elements: [], 
            structure: {},
            confidence: 0.95,
            timestamp: '2023-01-01T00:00:00Z',
            config
          }, 
          success: true 
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await webOperationApi.analyzePageElements(url, screenshot, config)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/website-automation/analyze', { url, screenshot, config })
        expect(result).toEqual(mockResponse)
      })
    })

    describe('findElementByDescription', () => {
      it('应该正确调用智能元素查找接口', async () => {
        const url = 'https://example.com'
        const description = '登录按钮'
        const screenshot = 'base64-image'
        const mockResponse = { 
          data: { 
            url, 
            description,
            results: [
              {
                selector: '#login-btn',
                description: '登录按钮',
                confidence: 0.98,
                reasoning: '基于描述和视觉特征匹配'
              }
            ],
            timestamp: '2023-01-01T00:00:00Z'
          }, 
          success: true 
        }
        mockRequest.post.mockResolvedValue(mockResponse)

        const result = await webOperationApi.findElementByDescription(url, description, screenshot)

        expect(mockRequest.post).toHaveBeenCalledWith('/api/website-automation/find-element', { url, description, screenshot })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('统计数据API', () => {
    describe('getStatistics', () => {
      it('应该正确调用获取统计数据接口', async () => {
        const mockResponse = { 
          data: {
            summary: {
              totalTasks: 10,
              totalTemplates: 5,
              totalExecutions: 100,
              recentExecutions: 20
            },
            tasksByStatus: { running: 2, completed: 8 },
            recentActivity: [],
            timestamp: '2023-01-01T00:00:00Z'
          }, 
          success: true 
        }
        mockRequest.get.mockResolvedValue(mockResponse)

        const result = await statisticsApi.getStatistics()

        expect(mockRequest.get).toHaveBeenCalledWith('/api/website-automation/statistics')
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('统一API导出', () => {
    it('应该正确导出所有API方法', () => {
      expect(websiteAutomationApi).toEqual(expect.objectContaining({
        getAllTasks: expect.any(Function),
        createTask: expect.any(Function),
        updateTask: expect.any(Function),
        deleteTask: expect.any(Function),
        executeTask: expect.any(Function),
        stopTask: expect.any(Function),
        getTaskHistory: expect.any(Function),
        getAllTemplates: expect.any(Function),
        createTemplate: expect.any(Function),
        updateTemplate: expect.any(Function),
        deleteTemplate: expect.any(Function),
        createTaskFromTemplate: expect.any(Function),
        captureScreenshot: expect.any(Function),
        analyzePageElements: expect.any(Function),
        findElementByDescription: expect.any(Function),
        getStatistics: expect.any(Function)
      }))
    })

    it('应该包含任务管理API的所有方法', () => {
      expect(websiteAutomationApi.getAllTasks).toBe(taskApi.getAllTasks)
      expect(websiteAutomationApi.createTask).toBe(taskApi.createTask)
      expect(websiteAutomationApi.updateTask).toBe(taskApi.updateTask)
      expect(websiteAutomationApi.deleteTask).toBe(taskApi.deleteTask)
      expect(websiteAutomationApi.executeTask).toBe(taskApi.executeTask)
      expect(websiteAutomationApi.stopTask).toBe(taskApi.stopTask)
      expect(websiteAutomationApi.getTaskHistory).toBe(taskApi.getTaskHistory)
    })

    it('应该包含模板管理API的所有方法', () => {
      expect(websiteAutomationApi.getAllTemplates).toBe(templateApi.getAllTemplates)
      expect(websiteAutomationApi.createTemplate).toBe(templateApi.createTemplate)
      expect(websiteAutomationApi.updateTemplate).toBe(templateApi.updateTemplate)
      expect(websiteAutomationApi.deleteTemplate).toBe(templateApi.deleteTemplate)
      expect(websiteAutomationApi.createTaskFromTemplate).toBe(templateApi.createTaskFromTemplate)
    })

    it('应该包含网页操作API的所有方法', () => {
      expect(websiteAutomationApi.captureScreenshot).toBe(webOperationApi.captureScreenshot)
      expect(websiteAutomationApi.analyzePageElements).toBe(webOperationApi.analyzePageElements)
      expect(websiteAutomationApi.findElementByDescription).toBe(webOperationApi.findElementByDescription)
    })

    it('应该包含统计数据API的所有方法', () => {
      expect(websiteAutomationApi.getStatistics).toBe(statisticsApi.getStatistics)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API调用错误', async () => {
      const error = new Error('网络错误')
      mockRequest.get.mockRejectedValue(error)

      await expect(taskApi.getAllTasks()).rejects.toThrow('网络错误')
    })

    it('应该正确处理无效的任务ID', async () => {
      const taskId = 'invalid-id'
      const mockResponse = { data: null, success: false, message: '任务不存在' }
      mockRequest.get.mockResolvedValue(mockResponse)

      const result = await taskApi.getTaskHistory(taskId)
      expect(result).toEqual(mockResponse)
    })
  })
})