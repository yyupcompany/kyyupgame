import { request } from '../utils/request'
import { useUserStore } from '@/stores/user'

// 任务接口类型定义
export interface Task {
  id: number
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'highest'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  progress?: number
  assignedTo?: number
  assignee?: {
    id: number
    username: string
    email: string
    avatar?: string
  }
  userId: number
  user?: {
    id: number
    username: string
    email: string
    avatar?: string
  }
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  relatedType?: string
  relatedId?: number
}

export interface TaskStatistics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  completionRate: number
  overdueRate: number
  avgCompletionTime: number
}

export interface TaskQuery {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  priority?: string
  assignedTo?: number
  assignedToMe?: boolean
  dueDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  type?: string
  keyword?: string
  assigneeId?: number
  creatorId?: number
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: string
  status?: string
  assignedTo?: number
  dueDate?: string
  tags?: string[]
  relatedType?: string
  relatedId?: number
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  progress?: number
  completedAt?: string
}

// 任务管理API
export const getTasks = (params?: TaskQuery) => {
  // 转换参数格式以匹配后端期望
  const queryParams: any = {}

  if (params?.page) queryParams.page = params.page
  if (params?.pageSize) queryParams.limit = params.pageSize
  if (params?.status) queryParams.status = params.status
  if (params?.priority) queryParams.priority = params.priority
  if (params?.type) queryParams.type = params.type
  if (params?.keyword) queryParams.keyword = params.keyword
  if (params?.assignedToMe) {
    // 从用户store中获取当前登录用户ID
    const userStore = useUserStore()
    queryParams.assignee_id = userStore.user?.id
  }
  if (params?.assigneeId) queryParams.assignee_id = params.assigneeId
  if (params?.creatorId) queryParams.creator_id = params.creatorId

  return request.get('/api/tasks', queryParams)
}

export const getTask = (id: number) => {
  return request.get(`/api/tasks/${id}`)
}

export const createTask = (data: CreateTaskData) => {
  // Fixed API path to remove duplicate /api prefix
  return request.post('/api/tasks', data)
}

export const updateTask = (id: number, data: UpdateTaskData) => {
  return request.put(`/api/tasks/${id}`, data)
}

export const deleteTask = (id: number) => {
  return request.del(`/api/tasks/${id}`)
}

export const updateTaskStatus = (id: number, status: string) => {
  return request.put(`/api/tasks/${id}/status`, { status })
}

export const updateTaskProgress = (id: number, progress: number) => {
  return request.put(`/api/tasks/${id}/progress`, { progress })
}

export const assignTask = (id: number, assignedTo: number) => {
  return request.put(`/api/tasks/${id}/assign`, { assignedTo })
}

// 任务统计API
export const getTaskStatistics = (params?: {
  startDate?: string
  endDate?: string
  assignedTo?: number
}) => {
  return request.get('/api/tasks/stats', params)
}

export const getTaskTrends = (params?: {
  period?: 'week' | 'month' | 'quarter'
  startDate?: string
  endDate?: string
}) => {
  return request.get('/api/tasks/trends', { params })
}

export const getTaskAnalytics = (params?: {
  type?: 'completion' | 'priority' | 'assignee' | 'workload'
  period?: 'week' | 'month' | 'quarter'
  startDate?: string
  endDate?: string
}) => {
  return request.get('/api/tasks/analytics', { params })
}

// 任务模板API
export const getTaskTemplates = () => {
  return request.get('/api/task-templates')
}

export const createTaskFromTemplate = (templateId: number, data: any) => {
  return request.post(`/api/task-templates/${templateId}/create`, data)
}

// 任务批量操作API
export const batchUpdateTasks = (taskIds: number[], data: UpdateTaskData) => {
  return request.put('/api/tasks/batch', {
    taskIds,
    ...data
  })
}

export const batchDeleteTasks = (taskIds: number[]) => {
  return request.del('/api/tasks/batch', { data: { taskIds } })
}

// 任务导出API
export const exportTasks = (params?: TaskQuery & {
  format?: 'excel' | 'csv' | 'pdf'
}) => {
  return request.get('/api/tasks/export', params, {
    responseType: 'blob'
  })
}

export const exportTaskReport = (params?: {
  type?: 'summary' | 'detailed' | 'analytics'
  format?: 'excel' | 'pdf'
  startDate?: string
  endDate?: string
}) => {
  return request.get('/api/tasks/report', params, {
    responseType: 'blob'
  })
}

// 任务评论API
export const getTaskComments = (taskId: number) => {
  return request.get(`/api/tasks/${taskId}/comments`)
}

export const addTaskComment = (taskId: number, content: string) => {
  return request.post(`/api/tasks/${taskId}/comments`, { content })
}

export const updateTaskComment = (taskId: number, commentId: number, content: string) => {
  return request.put(`/api/tasks/${taskId}/comments/${commentId}`, { content })
}

export const deleteTaskComment = (taskId: number, commentId: number) => {
  return request.del(`/api/tasks/${taskId}/comments/${commentId}`)
}

// 任务附件API
export const getTaskAttachments = (taskId: number) => {
  return request.get(`/api/tasks/${taskId}/attachments`)
}

export const uploadTaskAttachment = (taskId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post(`/api/tasks/${taskId}/attachments`, formData)
}

export const deleteTaskAttachment = (taskId: number, attachmentId: number) => {
  return request.del(`/api/tasks/${taskId}/attachments/${attachmentId}`)
}

// 任务关联API
export const getRelatedTasks = (taskId: number) => {
  return request.get(`/api/tasks/${taskId}/related`)
}

export const linkTasks = (taskId: number, relatedTaskId: number, relationType: string) => {
  return request.post(`/api/tasks/${taskId}/link`, { relatedTaskId, relationType })
}

export const unlinkTasks = (taskId: number, relatedTaskId: number) => {
  return request.del(`/api/tasks/${taskId}/unlink?relatedTaskId=${relatedTaskId}`)
}
