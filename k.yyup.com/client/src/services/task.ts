import request from '@/utils/request'

export interface Task {
  id?: number
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'highest'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignedTo?: number | null
  dueDate?: string | null
  tags?: string[] | string
  createdAt?: string
  updatedAt?: string
  user?: {
    id: number
    username: string
    email: string
  }
  assignee?: {
    id: number
    username: string
    email: string
  }
}

export interface TaskFilters {
  status?: string
  priority?: string
  assignee_id?: number
  keyword?: string
}

export interface TaskQueryOptions {
  page?: number
  limit?: number
  filters?: TaskFilters
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

/**
 * 获取任务列表
 */
export async function getTasks(options: TaskQueryOptions = {}) {
  const params = {
    page: options.page || 1,
    limit: options.limit || 20,
    ...options.filters,
    sortBy: options.sortBy || 'createdAt',
    sortOrder: options.sortOrder || 'DESC'
  }

  const response = await request.get('tasks', { params })
  return response.data
}

/**
 * 根据ID获取任务详情
 */
export async function getTaskById(id: string | number): Promise<Task> {
  const response = await request.get(`tasks/${id}`)
  return response.data.data || response.data
}

/**
 * 创建任务
 */
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const response = await request.post('tasks', taskData)
  return response.data.data || response.data
}

/**
 * 更新任务
 */
export async function updateTask(id: string | number, taskData: Partial<Task>): Promise<Task> {
  const response = await request.put(`tasks/${id}`, taskData)
  return response.data.data || response.data
}

/**
 * 删除任务
 */
export async function deleteTask(id: string | number): Promise<void> {
  await request.delete(`tasks/${id}`)
}

/**
 * 更新任务状态
 */
export async function updateTaskStatus(id: string | number, status: Task['status']): Promise<Task> {
  const response = await request.put(`tasks/${id}`, { status })
  return response.data.data || response.data
}

/**
 * 获取任务统计数据
 */
export async function getTaskStats(options: { dateRange?: number; groupBy?: string } = {}) {
  const params = {
    dateRange: options.dateRange || 30,
    groupBy: options.groupBy || 'status'
  }

  const response = await request.get('tasks/stats', { params })
  return response.data.data || response.data
}