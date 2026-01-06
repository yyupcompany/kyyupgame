import { request } from '../../utils/request'
import { ApiResponse } from '../../types/api'

/**
 * 网站自动化API接口
 */

// 任务相关接口
export interface AutomationTask {
  id: string
  name: string
  description?: string
  url: string
  steps: any[]
  config: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  progress: number
  templateId?: string
  userId: string
  lastExecuted?: string
  createdAt: string
  updatedAt: string
}

export interface AutomationTemplate {
  id: string
  name: string
  description?: string
  category: 'web' | 'form' | 'data' | 'test' | 'custom'
  complexity: 'simple' | 'medium' | 'complex'
  steps: any[]
  parameters: any[]
  config: any
  usageCount: number
  version: string
  status: 'draft' | 'published' | 'archived'
  isPublic: boolean
  allowParameterization: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ExecutionHistory {
  id: string
  taskId: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  startTime: string
  endTime?: string
  logs?: string
  result?: string
  error?: string
  createdAt: string
  updatedAt: string
}

export interface ScreenshotResult {
  url: string
  screenshot: string
  timestamp: string
  dimensions: { width: number; height: number }
  metadata: any
}

export interface ElementAnalysisResult {
  url: string
  elements: any[]
  structure: any
  confidence: number
  timestamp: string
  config: any
}

export interface SmartSearchResult {
  url: string
  description: string
  results: Array<{
    selector: string
    description: string
    confidence: number
    reasoning: string
  }>
  timestamp: string
}

export interface AutomationStatistics {
  summary: {
    totalTasks: number
    totalTemplates: number
    totalExecutions: number
    recentExecutions: number
  }
  tasksByStatus: Record<string, number>
  recentActivity: Array<{
    id: string
    taskName: string
    status: string
    startTime: string
    endTime?: string
  }>
  timestamp: string
}

/**
 * 任务管理API
 */
export const taskApi = {
  // 获取所有任务
  getAllTasks(): Promise<ApiResponse<AutomationTask[]>> {
    return request.get('/api/website-automation/tasks')
  },

  // 创建任务
  createTask(taskData: Partial<AutomationTask>): Promise<ApiResponse<AutomationTask>> {
    return request.post('/api/website-automation/tasks', taskData)
  },

  // 更新任务
  updateTask(id: string, taskData: Partial<AutomationTask>): Promise<ApiResponse<AutomationTask>> {
    return request.put(`/api/website-automation/tasks/${id}`, taskData)
  },

  // 删除任务
  deleteTask(id: string): Promise<ApiResponse<null>> {
    return request.delete(`/api/website-automation/tasks/${id}`)
  },

  // 执行任务
  executeTask(id: string): Promise<ApiResponse<{ executionId: string; status: string; message: string }>> {
    return request.post(`/api/website-automation/tasks/${id}/execute`)
  },

  // 停止任务
  stopTask(id: string): Promise<ApiResponse<null>> {
    return request.post(`/api/website-automation/tasks/${id}/stop`)
  },

  // 获取任务执行历史
  getTaskHistory(id: string): Promise<ApiResponse<ExecutionHistory[]>> {
    return request.get(`/api/website-automation/tasks/${id}/history`)
  }
}

/**
 * 模板管理API
 */
export const templateApi = {
  // 获取所有模板
  getAllTemplates(): Promise<ApiResponse<AutomationTemplate[]>> {
    return request.get('/api/website-automation/templates')
  },

  // 创建模板
  createTemplate(templateData: Partial<AutomationTemplate>): Promise<ApiResponse<AutomationTemplate>> {
    return request.post('/api/website-automation/templates', templateData)
  },

  // 更新模板
  updateTemplate(id: string, templateData: Partial<AutomationTemplate>): Promise<ApiResponse<AutomationTemplate>> {
    return request.put(`/api/website-automation/templates/${id}`, templateData)
  },

  // 删除模板
  deleteTemplate(id: string): Promise<ApiResponse<null>> {
    return request.delete(`/api/website-automation/templates/${id}`)
  },

  // 基于模板创建任务
  createTaskFromTemplate(templateId: string, parameters?: Record<string, any>): Promise<ApiResponse<AutomationTask>> {
    return request.post(`/api/website-automation/templates/${templateId}/create-task`, { parameters })
  }
}

/**
 * 网页操作API
 */
export const webOperationApi = {
  // 网页截图
  captureScreenshot(url: string, options?: any): Promise<ApiResponse<ScreenshotResult>> {
    return request.post('/api/website-automation/screenshot', { url, options })
  },

  // 分析网页元素
  analyzePageElements(url: string, screenshot?: string, config?: any): Promise<ApiResponse<ElementAnalysisResult>> {
    return request.post('/api/website-automation/analyze', { url, screenshot, config })
  },

  // 智能元素查找
  findElementByDescription(url: string, description: string, screenshot?: string): Promise<ApiResponse<SmartSearchResult>> {
    return request.post('/api/website-automation/find-element', { url, description, screenshot })
  }
}

/**
 * 统计数据API
 */
export const statisticsApi = {
  // 获取统计数据
  getStatistics(): Promise<ApiResponse<AutomationStatistics>> {
    return request.get('/api/website-automation/statistics')
  }
}

// 导出所有API
export const websiteAutomationApi = {
  ...taskApi,
  ...templateApi,
  ...webOperationApi,
  ...statisticsApi
}